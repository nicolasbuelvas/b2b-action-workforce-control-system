import { Repository, DataSource } from 'typeorm';
import { ActionPrice } from './entities/action-price.entity';
import { PaymentRecord, PaymentStatus } from './entities/payment-record.entity';
export declare class PaymentsService {
    private readonly dataSource;
    private readonly priceRepo;
    private readonly paymentRepo;
    constructor(dataSource: DataSource, priceRepo: Repository<ActionPrice>, paymentRepo: Repository<PaymentRecord>);
    calculatePayment(params: {
        userId: string;
        role: string;
        actionId: string;
        actionType: string;
    }): Promise<PaymentRecord>;
    updateStatus(paymentId: string, status: PaymentStatus): Promise<PaymentRecord>;
    approvePayment(paymentId: string): Promise<PaymentRecord>;
    markAsPaid(paymentId: string): Promise<PaymentRecord>;
    rejectPayment(paymentId: string): Promise<PaymentRecord>;
    getUserPayments(userId: string): Promise<PaymentRecord[]>;
}
