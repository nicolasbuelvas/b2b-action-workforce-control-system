export type PaymentStatus = 'pending' | 'approved' | 'paid' | 'rejected';
export declare class PaymentRecord {
    id: string;
    userId: string;
    role: string;
    actionId: string;
    actionType: string;
    amount: number;
    status: PaymentStatus;
    category?: string;
    createdAt: Date;
    updatedAt: Date;
}
