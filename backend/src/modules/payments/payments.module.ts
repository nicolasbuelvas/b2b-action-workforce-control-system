import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PaymentsService } from './payments.service';
import { ActionPrice } from './entities/action-price.entity';
import { PaymentRecord } from './entities/payment-record.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ActionPrice, PaymentRecord]),
  ],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
