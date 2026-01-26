export declare enum ResearchStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    SUBMITTED = "SUBMITTED",
    COMPLETED = "COMPLETED",
    REJECTED = "REJECTED"
}
export declare class ResearchTask {
    id: string;
    targetId: string;
    targetType: string;
    jobTypeId?: string;
    companyTypeId?: string;
    language?: string;
    categoryId: string;
    status: ResearchStatus;
    assignedToUserId: string;
    createdAt: Date;
}
