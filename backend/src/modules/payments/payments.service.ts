import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { ActionPrice } from './entities/action-price.entity';
import { PaymentRecord, PaymentStatus } from './entities/payment-record.entity';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(ActionPrice)
    private readonly priceRepo: Repository<ActionPrice>,

    @InjectRepository(PaymentRecord)
    private readonly paymentRepo: Repository<PaymentRecord>,
  ) {}

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
          role: params.role,
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

  async approvePayment(paymentId: string) {
    return this.updateStatus(paymentId, 'approved');
  }

  async markAsPaid(paymentId: string) {
    return this.updateStatus(paymentId, 'paid');
  }

  async rejectPayment(paymentId: string) {
    return this.updateStatus(paymentId, 'rejected');
  }

  async getUserPayments(userId: string) {
    return this.paymentRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
}