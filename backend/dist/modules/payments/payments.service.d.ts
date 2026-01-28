import { Repository, DataSource } from 'typeorm';
import { ActionPrice } from './entities/action-price.entity';
import { PaymentRecord, PaymentStatus } from './entities/payment-record.entity';
import { CreateActionPriceDto } from './dto/create-action-price.dto';
import { UpdateActionPriceDto } from './dto/update-action-price.dto';
export declare class PaymentsService {
    private readonly dataSource;
    private readonly priceRepo;
    private readonly paymentRepo;
    constructor(dataSource: DataSource, priceRepo: Repository<ActionPrice>, paymentRepo: Repository<PaymentRecord>);
    getActionPrices(): Promise<ActionPrice[]>;
    getPricesByRole(role: string): Promise<ActionPrice[]>;
    createOrUpdatePrice(dto: CreateActionPriceDto): Promise<ActionPrice>;
    updatePrice(id: string, dto: UpdateActionPriceDto): Promise<ActionPrice>;
    deletePrice(id: string): Promise<{
        success: boolean;
    }>;
    calculatePayment(params: {
        userId: string;
        role: string;
        actionId: string;
        actionType: string;
    }): Promise<PaymentRecord>;
    approvePayment(paymentId: string): Promise<PaymentRecord>;
    rejectPayment(paymentId: string): Promise<PaymentRecord>;
    processPayments(paymentIds: string[]): Promise<PaymentRecord[]>;
    getWorkerPaymentSummary(userId: string): Promise<{
        pending: {
            count: number;
            total: number;
        };
        inProcess: {
            count: number;
            total: number;
        };
        completed: {
            count: number;
            total: number;
        };
        totalEarnings: number;
    }>;
    getWorkerPaymentDetails(userId: string, status?: PaymentStatus): Promise<PaymentRecord[]>;
    getPaymentRecords(userId: string): Promise<PaymentRecord[]>;
    getAllPayments(options: {
        role?: string;
        status?: PaymentStatus;
        page?: number;
        limit?: number;
    }): Promise<{
        data: PaymentRecord[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getTopPerformers(role: string, category?: string): Promise<any[]>;
    getEarningsByRole(role: string): Promise<{
        byUser: {};
        total: number;
        average: number;
        count: number;
    }>;
    getPaymentStats(): Promise<{
        byStatus: {
            pending: number;
            approved: number;
            paid: number;
            rejected: number;
        };
        byRole: {};
        totalAmount: number;
    }>;
    updateStatus(paymentId: string, status: PaymentStatus): Promise<PaymentRecord>;
    markAsPaid(paymentId: string): Promise<PaymentRecord>;
    getUserPayments(userId: string): Promise<PaymentRecord[]>;
}
