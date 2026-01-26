import { ResearchTask } from '../../research/entities/research-task.entity';
export declare enum InquiryStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    FLAGGED = "FLAGGED"
}
export declare enum InquiryPlatform {
    WEBSITE = "WEBSITE",
    LINKEDIN = "LINKEDIN"
}
export declare class InquiryTask {
    id: string;
    targetId: string;
    categoryId: string;
    platform: InquiryPlatform;
    researchTaskId: string | null;
    researchTask?: ResearchTask | null;
    status: InquiryStatus;
    assignedToUserId: string | null;
    createdAt: Date;
}
