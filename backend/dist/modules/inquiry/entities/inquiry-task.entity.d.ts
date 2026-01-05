export declare enum InquiryStatus {
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED"
}
export declare class InquiryTask {
    id: string;
    targetId: string;
    categoryId: string;
    status: InquiryStatus;
    assignedToUserId: string;
    createdAt: Date;
}
