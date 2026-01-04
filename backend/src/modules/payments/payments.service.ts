import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ActionPrice } from './entities/action-price.entity';
import { PaymentRecord } from './entities/payment-record.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(ActionPrice)
    private readonly priceRepo: Repository<ActionPrice>,

    @InjectRepository(PaymentRecord)
    private readonly paymentRepo: Repository<PaymentRecord>,
  ) {}

  async calculatePayment(params: {
    userId: string;
    role: string;
    actionId: string;
    actionType: string;
  }) {
    const price = await this.priceRepo.findOne({
      where: { role: params.role, actionType: params.actionType },
    });

    if (!price) {
      throw new Error('Action price not configured');
    }

    return this.paymentRepo.save({
      userId: params.userId,
      role: params.role,
      actionId: params.actionId,
      actionType: params.actionType,
      amount: price.amount,
      status: 'pending',
    });
  }

  async approvePayment(paymentId: string) {
    return this.paymentRepo.update(paymentId, { status: 'approved' });
  }

  async markAsPaid(paymentId: string) {
    return this.paymentRepo.update(paymentId, { status: 'paid' });
  }

  async getUserPayments(userId: string) {
    return this.paymentRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
}