import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  ResearchTask,
  ResearchStatus,
} from '../research/entities/research-task.entity';
import { ResearchAudit } from './entities/research-audit.entity';
import { FlaggedAction } from './entities/flagged-action.entity';
import { AuditResearchDto } from './dto/audit-research.dto';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(ResearchTask)
    private readonly researchRepo: Repository<ResearchTask>,

    @InjectRepository(ResearchAudit)
    private readonly auditRepo: Repository<ResearchAudit>,

    @InjectRepository(FlaggedAction)
    private readonly flaggedRepo: Repository<FlaggedAction>,
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
      throw new ForbiddenException(
        'Auditor cannot audit own submission',
      );
    }

    await this.auditRepo.save({
      researchTaskId,
      auditorUserId,
      decision: dto.decision,
      rejectionReasonId: dto.rejectionReasonId,
    });

    task.status =
      dto.decision === 'APPROVED'
        ? ResearchStatus.APPROVED
        : ResearchStatus.REJECTED;

    task.rejectionReasonId = dto.rejectionReasonId ?? null;

    if (dto.decision === 'REJECTED') {
      await this.flaggedRepo.save({
        userId: task.submittedByUserId,
        targetId: researchTaskId,
        actionType: 'RESEARCH',
        reason:
          dto.rejectionReasonId ?? 'MANUAL_REJECTION',
      });
    }

    return this.researchRepo.save(task);
  }
}