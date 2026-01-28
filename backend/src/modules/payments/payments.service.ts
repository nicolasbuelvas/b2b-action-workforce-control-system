import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';

import { ActionPrice } from './entities/action-price.entity';
import { PaymentRecord, PaymentStatus } from './entities/payment-record.entity';
import { CreateActionPriceDto } from './dto/create-action-price.dto';
import { UpdateActionPriceDto } from './dto/update-action-price.dto';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(ActionPrice)
    private readonly priceRepo: Repository<ActionPrice>,

    @InjectRepository(PaymentRecord)
    private readonly paymentRepo: Repository<PaymentRecord>,
  ) {}

  // ========= ACTION PRICING =========

  /**
   * Get all action prices
   */
  async getActionPrices() {
    return this.priceRepo.find({
      order: { roleId: 'ASC', actionType: 'ASC' },
    });
  }

  /**
   * Get pricing for specific role
   */
  async getPricesByRole(role: string) {
    return this.priceRepo.find({
      where: { roleId: role },
      order: { actionType: 'ASC' },
    });
  }

  /**
   * Create or update action price
   */
  async createOrUpdatePrice(dto: CreateActionPriceDto) {
    let price = await this.priceRepo.findOne({
      where: {
        roleId: dto.roleId,
        actionType: dto.actionType,
      },
    });

    if (!price) {
      price = this.priceRepo.create({
        roleId: dto.roleId,
        actionType: dto.actionType,
        amount: dto.amount,
        bonusMultiplier: dto.bonusMultiplier || 1.0,
        description: dto.description,
      });
    } else {
      price.amount = dto.amount;
      if (dto.bonusMultiplier !== undefined) {
        price.bonusMultiplier = dto.bonusMultiplier;
      }
      if (dto.description !== undefined) {
        price.description = dto.description;
      }
    }

    return this.priceRepo.save(price);
  }

  /**
   * Update action price
   */
  async updatePrice(id: string, dto: UpdateActionPriceDto) {
    const price = await this.priceRepo.findOne({ where: { id } });

    if (!price) {
      throw new NotFoundException('Price not found');
    }

    if (dto.amount !== undefined) {
      price.amount = dto.amount;
    }
    if (dto.bonusMultiplier !== undefined) {
      price.bonusMultiplier = dto.bonusMultiplier;
    }
    if (dto.description !== undefined) {
      price.description = dto.description;
    }

    return this.priceRepo.save(price);
  }

  /**
   * Delete action price
   */
  async deletePrice(id: string) {
    const price = await this.priceRepo.findOne({ where: { id } });

    if (!price) {
      throw new NotFoundException('Price not found');
    }

    await this.priceRepo.remove(price);
    return { success: true };
  }

  // ========= PAYMENT CREATION & CALCULATION =========

  /**
   * Create payment for a user action
   * Idempotent by (userId + actionId)
   */
  async calculatePayment(params: {
    userId: string;
    role: string;
    actionId: string;
    actionType: string;
  }) {
    return this.dataSource.transaction(async manager => {
      const existing = await manager.findOne(PaymentRecord, {
        where: {
          userId: params.userId,
          actionId: params.actionId,
        },
      });

      if (existing) {
        return existing;
      }

      const price = await manager.findOne(ActionPrice, {
        where: {
          roleId: params.role,
          actionType: params.actionType,
        },
      });

      if (!price) {
        throw new NotFoundException(
          `Price not configured for ${params.role}:${params.actionType}`,
        );
      }

      const payment = manager.create(PaymentRecord, {
        userId: params.userId,
        role: params.role,
        actionId: params.actionId,
        actionType: params.actionType,
        amount: price.amount,
        status: 'pending',
      });

      return manager.save(payment);
    });
  }

  // ========= PAYMENT STATUS UPDATES =========

  /**
   * Approve pending payment (Auditor action)
   */
  async approvePayment(paymentId: string) {
    const payment = await this.paymentRepo.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== 'pending') {
      throw new BadRequestException('Only pending payments can be approved');
    }

    payment.status = 'approved';
    return this.paymentRepo.save(payment);
  }

  /**
   * Reject payment
   */
  async rejectPayment(paymentId: string) {
    const payment = await this.paymentRepo.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status === 'paid') {
      throw new BadRequestException('Cannot reject paid payment');
    }

    payment.status = 'rejected';
    return this.paymentRepo.save(payment);
  }

  /**
   * Process multiple approved payments (mark as paid)
   */
  async processPayments(paymentIds: string[]) {
    const payments = await this.paymentRepo.find({
      where: { id: In(paymentIds) },
    });

    if (payments.length === 0) {
      throw new NotFoundException('No payments found');
    }

    // Update all to 'paid' status
    for (const payment of payments) {
      if (payment.status !== 'approved') {
        throw new BadRequestException(
          `Payment ${payment.id} is not approved`,
        );
      }
      payment.status = 'paid';
    }

    return this.paymentRepo.save(payments);
  }

  // ========= WORKER PAYMENT VIEWS =========

  /**
   * Get worker's payment summary (PENDING, APPROVED, PAID)
   * Workers see this on their dashboard
   */
  async getWorkerPaymentSummary(userId: string) {
    const payments = await this.paymentRepo.find({
      where: { userId },
    });

    const summary = {
      pending: {
        count: 0,
        total: 0,
      },
      inProcess: {
        // approved payments
        count: 0,
        total: 0,
      },
      completed: {
        // paid payments
        count: 0,
        total: 0,
      },
      totalEarnings: 0,
    };

    for (const payment of payments) {
      if (payment.status === 'pending') {
        summary.pending.count++;
        summary.pending.total += payment.amount;
      } else if (payment.status === 'approved') {
        summary.inProcess.count++;
        summary.inProcess.total += payment.amount;
      } else if (payment.status === 'paid') {
        summary.completed.count++;
        summary.completed.total += payment.amount;
      }

      if (payment.status !== 'rejected') {
        summary.totalEarnings += payment.amount;
      }
    }

    return summary;
  }

  /**
   * Get detailed payment records for worker
   */
  async getWorkerPaymentDetails(userId: string, status?: PaymentStatus) {
    const query = this.paymentRepo.createQueryBuilder('p');

    query.where('p.userId = :userId', { userId });

    if (status) {
      query.andWhere('p.status = :status', { status });
    }

    return query
      .orderBy('p.createdAt', 'DESC')
      .addOrderBy('p.amount', 'DESC')
      .getMany();
  }

  /**
   * Get payment records by user
   */
  async getPaymentRecords(userId: string) {
    return this.paymentRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  // ========= ADMIN PAYMENT MANAGEMENT =========

  /**
   * Get all payments with filtering
   */
  async getAllPayments(options: {
    role?: string;
    status?: PaymentStatus;
    page?: number;
    limit?: number;
  }) {
    const { role, status, page = 1, limit = 50 } = options;

    const query = this.paymentRepo.createQueryBuilder('p');

    if (role) {
      query.where('p.role = :role', { role });
    }

    if (status) {
      query.andWhere('p.status = :status', { status });
    }

    const total = await query.getCount();
    const offset = (page - 1) * limit;

    const payments = await query
      .orderBy('p.createdAt', 'DESC')
      .skip(offset)
      .take(limit)
      .getMany();

    return {
      data: payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ========= ANALYTICS =========

  /**
   * Get top 3 performers by role
   */
  async getTopPerformers(role: string, category?: string) {
    const query = this.paymentRepo.createQueryBuilder('p');

    query
      .where('p.role = :role', { role })
      .andWhere('p.status = :status', { status: 'paid' });

    if (category) {
      query.andWhere('p.category = :category', { category });
    }

    const topPerformers = await query
      .select('p.userId', 'userId')
      .addSelect('COUNT(p.id)', 'count')
      .addSelect('SUM(p.amount)', 'totalEarnings')
      .groupBy('p.userId')
      .orderBy('totalEarnings', 'DESC')
      .limit(3)
      .getRawMany();

    return topPerformers;
  }

  /**
   * Get earnings by role
   */
  async getEarningsByRole(role: string) {
    const payments = await this.paymentRepo.find({
      where: { role, status: 'paid' },
    });

    const earnings = {
      byUser: {},
      total: 0,
      average: 0,
      count: payments.length,
    };

    for (const payment of payments) {
      if (!earnings.byUser[payment.userId]) {
        earnings.byUser[payment.userId] = 0;
      }
      earnings.byUser[payment.userId] += payment.amount;
      earnings.total += payment.amount;
    }

    earnings.average = payments.length > 0 ? earnings.total / payments.length : 0;

    return earnings;
  }

  /**
   * Get payment statistics
   */
  async getPaymentStats() {
    const stats = {
      byStatus: {
        pending: 0,
        approved: 0,
        paid: 0,
        rejected: 0,
      },
      byRole: {},
      totalAmount: 0,
    };

    const allPayments = await this.paymentRepo.find();

    for (const payment of allPayments) {
      if (payment.status !== 'rejected') {
        stats.totalAmount += payment.amount;
      }

      stats.byStatus[payment.status] = (stats.byStatus[payment.status] || 0) + 1;

      if (!stats.byRole[payment.role]) {
        stats.byRole[payment.role] = {
          count: 0,
          total: 0,
        };
      }

      stats.byRole[payment.role].count++;
      if (payment.status !== 'rejected') {
        stats.byRole[payment.role].total += payment.amount;
      }
    }

    return stats;
  }

  async updateStatus(paymentId: string, status: PaymentStatus) {
    const payment = await this.paymentRepo.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status === 'paid') {
      throw new BadRequestException('Payment already paid');
    }

    payment.status = status;
    return this.paymentRepo.save(payment);
  }

  async markAsPaid(paymentId: string) {
    return this.updateStatus(paymentId, 'paid');
  }

  async getUserPayments(userId: string) {
    return this.paymentRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
}