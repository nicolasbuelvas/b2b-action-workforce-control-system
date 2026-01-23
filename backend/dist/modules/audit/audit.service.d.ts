import { Repository } from 'typeorm';
import { ResearchTask } from '../research/entities/research-task.entity';
import { ResearchSubmission } from '../research/entities/research-submission.entity';
import { ResearchAudit } from './entities/research-audit.entity';
import { FlaggedAction } from './entities/flagged-action.entity';
import { AuditResearchDto } from './dto/audit-research.dto';
import { Category } from '../categories/entities/category.entity';
import { Company } from '../research/entities/company.entity';
import { User } from '../users/entities/user.entity';
export declare class AuditService {
    private readonly researchRepo;
    private readonly auditRepo;
    private readonly submissionRepo;
    private readonly flaggedRepo;
    private readonly categoryRepo;
    private readonly companyRepo;
    private readonly userRepo;
    constructor(researchRepo: Repository<ResearchTask>, auditRepo: Repository<ResearchAudit>, submissionRepo: Repository<ResearchSubmission>, flaggedRepo: Repository<FlaggedAction>, categoryRepo: Repository<Category>, companyRepo: Repository<Company>, userRepo: Repository<User>);
    getPendingResearch(): Promise<{
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
        targetType: string;
        createdAt: Date;
        submission: ResearchSubmission;
    }[]>;
    auditResearch(researchTaskId: string, dto: AuditResearchDto, auditorUserId: string): Promise<ResearchTask>;
}
