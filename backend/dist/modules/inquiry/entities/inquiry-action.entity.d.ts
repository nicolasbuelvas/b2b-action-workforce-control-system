export declare enum InquiryActionStatus {
    PENDING = "PENDING",
    SUBMITTED = "SUBMITTED",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED"
}
export declare class InquiryAction {
    id: string;
    taskId: string;
    actionIndex: number;
    performedByUserId: string;
    status: InquiryActionStatus;
    createdAt: Date;
    reviewedAt: Date | null;
}
