import { AuditService } from './audit.service';
import { AuditResearchDto } from './dto/audit-research.dto';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    getPendingResearch(auditorUserId: string): Promise<{
        id: string;
        categoryId: string;
        categoryName: string;
        assignedToUserId: string;
        workerName: string;
        workerEmail: string;
        targetId: string;
        companyName: any;
        companyDomain: any;
        companyCountry: any;
        linkedInUrl: string;
        linkedInContactName: string;
        linkedInCountry: string;
        linkedInLanguage: string;
        targetType: string;
        createdAt: Date;
        submission: import("../research/entities/research-submission.entity").ResearchSubmission;
    }[]>;
    auditResearch(researchTaskId: string, dto: AuditResearchDto, auditorUserId: string): Promise<import("../research/entities/research-task.entity").ResearchTask>;
    getPendingInquiry(auditorUserId: string): Promise<{
        id: string;
        categoryId: string;
        categoryName: string;
        assignedToUserId: string;
        workerName: string;
        workerEmail: string;
        targetId: string;
        companyName: string;
        companyDomain: string;
        companyCountry: string;
        language: string;
        actionType: string;
        createdAt: Date;
        actionCreatedAt: Date;
        action: import("../inquiry/entities/inquiry-action.entity").InquiryAction;
        outreach: import("../inquiry/entities/outreach-record.entity").OutreachRecord;
        screenshotUrl: string;
        isDuplicate: boolean;
    }[]>;
    auditInquiry(inquiryTaskId: string, dto: AuditResearchDto, auditorUserId: string): Promise<import("../inquiry/entities/inquiry-task.entity").InquiryTask>;
    getPendingLinkedInInquiry(auditorUserId: string): Promise<{
        id: string;
        categoryId: string;
        categoryName: string;
        assignedToUserId: string;
        workerName: string;
        workerEmail: string;
        targetId: string;
        status: import("../inquiry/entities/inquiry-task.entity").InquiryStatus;
        createdAt: Date;
        actions: {
            id: string;
            actionType: any;
            status: import("../inquiry/entities/inquiry-action.entity").InquiryActionStatus;
            screenshotUrl: string;
            isDuplicate: boolean;
        }[];
    }[]>;
    auditLinkedInInquiry(inquiryTaskId: string, actionId: string, dto: AuditResearchDto, auditorUserId: string): Promise<import("../inquiry/entities/inquiry-task.entity").InquiryTask>;
}
