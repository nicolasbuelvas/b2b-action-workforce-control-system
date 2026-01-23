export declare enum InquiryStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    FLAGGED = "FLAGGED"
}
export declare class InquiryTask {
    id: string;
    targetId: string;
    categoryId: string;
    status: InquiryStatus;
    assignedToUserId: string | null;
    createdAt: Date;
}
