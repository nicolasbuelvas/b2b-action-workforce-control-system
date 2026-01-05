export declare enum ResearchStatus {
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
    REJECTED = "REJECTED"
}
export declare class ResearchTask {
    id: string;
    targetId: string;
    categoryId: string;
    status: ResearchStatus;
    assignedToUserId: string;
    createdAt: Date;
}
