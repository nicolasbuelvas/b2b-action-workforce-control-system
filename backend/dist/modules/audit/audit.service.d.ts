import { Repository } from 'typeorm';
import { ResearchTask } from '../research/entities/research-task.entity';
import { ResearchAudit } from './entities/research-audit.entity';
import { FlaggedAction } from './entities/flagged-action.entity';
import { AuditResearchDto } from './dto/audit-research.dto';
export declare class AuditService {
    private readonly researchRepo;
    private readonly auditRepo;
    private readonly flaggedRepo;
    constructor(researchRepo: Repository<ResearchTask>, auditRepo: Repository<ResearchAudit>, flaggedRepo: Repository<FlaggedAction>);
    auditResearch(researchTaskId: string, dto: AuditResearchDto, auditorUserId: string): Promise<ResearchTask>;
}
