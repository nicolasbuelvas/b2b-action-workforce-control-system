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
import { ResearchSubmission } from '../research/entities/research-submission.entity';
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

    @InjectRepository(ResearchSubmission)
    private readonly submissionRepo: Repository<ResearchSubmission>,

    @InjectRepository(FlaggedAction)
    private readonly flaggedRepo: Repository<FlaggedAction>,
  ) {}

  async getPendingResearch() {
    const tasks = await this.researchRepo.find({
      where: { status: ResearchStatus.SUBMITTED },
      order: { createdAt: 'ASC' },
    });

    const enriched = await Promise.all(
      tasks.map(async task => {
        const submission = await this.submissionRepo.findOne({
          where: { researchTaskId: task.id },
          order: { createdAt: 'DESC' },
        });

        return {
          task,
          submission,
        };
      }),
    );

    return enriched.map(item => ({
      id: item.task.id,
      categoryId: item.task.categoryId,
      assignedToUserId: item.task.assignedToUserId,
      targetId: item.task.targetId,
      targetType: item.task.targetType,
      createdAt: item.task.createdAt,
      submission: item.submission,
    }));
  }

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

    if (task.status !== ResearchStatus.SUBMITTED) {
      throw new BadRequestException('Research task not ready for audit');
    }

    if (task.assignedToUserId === auditorUserId) {
      throw new ForbiddenException(
        'Auditor cannot audit own submission',
      );
    }

    await this.auditRepo.save({
      researchTaskId,
      auditorUserId,
      decision: dto.decision,
    });

    task.status =
      dto.decision === 'APPROVED'
        ? ResearchStatus.COMPLETED
        : ResearchStatus.IN_PROGRESS;

    if (dto.decision === 'REJECTED') {
      await this.flaggedRepo.save({
        userId: task.assignedToUserId,
        targetId: researchTaskId,
        actionType: 'RESEARCH',
        reason: 'MANUAL_REJECTION',
      });
    }

    return this.researchRepo.save(task);
  }
}