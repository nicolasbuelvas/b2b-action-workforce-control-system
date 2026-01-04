import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ResearchTask, ResearchStatus } from '../research/entities/research-task.entity';
import { ResearchAudit } from './entities/research-audit.entity';
import { AuditResearchDto } from './dto/audit-research.dto';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(ResearchTask)
    private readonly researchRepo: Repository<ResearchTask>,

    @InjectRepository(ResearchAudit)
    private readonly auditRepo: Repository<ResearchAudit>,
  ) {}

  async auditResearch(
    researchTaskId: string,
    dto: AuditResearchDto,
    auditorUserId: string,
  ) {
    const task = await this.researchRepo.findOne({
      where: { id: researchTaskId },
    });

    if (!task) {
      throw new BadRequestException('Research task not found');
    }

    if (task.status !== ResearchStatus.PENDING) {
      throw new BadRequestException('Research task already audited');
    }

    if (task.submittedByUserId === auditorUserId) {
      throw new ForbiddenException('Auditor cannot audit own submission');
    }

    // 1️⃣ Insert audit record (immutable)
    await this.auditRepo.save({
      researchTaskId,
      auditorUserId,
      decision: dto.decision,
      rejectionReasonId: dto.rejectionReasonId,
    });

    // 2️⃣ Update task status (single source of state)
    task.status =
      dto.decision === 'APPROVED'
        ? ResearchStatus.APPROVED
        : ResearchStatus.REJECTED;

    task.rejectionReasonId = dto.rejectionReasonId;

    return this.researchRepo.save(task);
  }
}