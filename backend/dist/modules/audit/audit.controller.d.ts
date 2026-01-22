import { AuditService } from './audit.service';
import { AuditResearchDto } from './dto/audit-research.dto';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    getPendingResearch(): Promise<{
        id: string;
        categoryId: string;
        assignedToUserId: string;
        targetId: string;
        targetType: string;
        createdAt: Date;
        submission: import("../research/entities/research-submission.entity").ResearchSubmission;
    }[]>;
    auditResearch(researchTaskId: string, dto: AuditResearchDto, auditorUserId: string): Promise<import("../research/entities/research-task.entity").ResearchTask>;
}
