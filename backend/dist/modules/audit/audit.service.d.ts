import { Repository } from 'typeorm';
import { ResearchTask } from '../research/entities/research-task.entity';
import { ResearchSubmission } from '../research/entities/research-submission.entity';
import { ResearchAudit } from './entities/research-audit.entity';
import { FlaggedAction } from './entities/flagged-action.entity';
import { AuditResearchDto } from './dto/audit-research.dto';
export declare class AuditService {
    private readonly researchRepo;
    private readonly auditRepo;
    private readonly submissionRepo;
    private readonly flaggedRepo;
    constructor(researchRepo: Repository<ResearchTask>, auditRepo: Repository<ResearchAudit>, submissionRepo: Repository<ResearchSubmission>, flaggedRepo: Repository<FlaggedAction>);
    getPendingResearch(): Promise<{
        id: string;
        categoryId: string;
        assignedToUserId: string;
        targetId: string;
        targetType: string;
        createdAt: Date;
        submission: ResearchSubmission;
    }[]>;
    auditResearch(researchTaskId: string, dto: AuditResearchDto, auditorUserId: string): Promise<ResearchTask>;
}
