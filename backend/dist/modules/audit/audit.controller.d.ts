import { AuditService } from './audit.service';
import { AuditResearchDto } from './dto/audit-research.dto';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    auditResearch(researchTaskId: string, dto: AuditResearchDto, auditorUserId: string): Promise<import("../research/entities/research-task.entity").ResearchTask>;
}
