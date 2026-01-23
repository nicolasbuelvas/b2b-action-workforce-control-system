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
import { Category } from '../categories/entities/category.entity';
import { UserCategory } from '../categories/entities/user-category.entity';
import { Company } from '../research/entities/company.entity';
import { User } from '../users/entities/user.entity';

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

    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,

    @InjectRepository(UserCategory)
    private readonly userCategoryRepo: Repository<UserCategory>,

    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async getPendingResearch(auditorUserId: string) {
    // Get auditor's assigned categories
    const userCategories = await this.userCategoryRepo.find({
      where: { userId: auditorUserId },
      select: ['categoryId'],
    });

    const categoryIds = userCategories.map(uc => uc.categoryId);

    // If auditor has no categories assigned, return empty
    if (categoryIds.length === 0) {
      return [];
    }

    // Fetch ONLY tasks from auditor's assigned categories
    const tasks = await this.researchRepo
      .createQueryBuilder('task')
      .where('task.status = :status', { status: ResearchStatus.SUBMITTED })
      .andWhere('task.categoryId IN (:...categoryIds)', { categoryIds })
      .orderBy('task.createdAt', 'ASC')
      .getMany();

    const enriched = await Promise.all(
      tasks.map(async task => {
        const [submission, category, worker] = await Promise.all([
          this.submissionRepo.findOne({
            where: { researchTaskId: task.id },
            order: { createdAt: 'DESC' },
          }),
          this.categoryRepo.findOne({ where: { id: task.categoryId } }),
          this.userRepo.findOne({ where: { id: task.assignedToUserId } }),
        ]);

        let company = null;
        if (task.targetType === 'COMPANY') {
          company = await this.companyRepo.findOne({ where: { id: task.targetId } });
        }

        return {
          task,
          submission,
          category,
          company,
          worker,
        };
      }),
    );

    return enriched.map(item => ({
      id: item.task.id,
      categoryId: item.task.categoryId,
      categoryName: item.category?.name || '',
      assignedToUserId: item.task.assignedToUserId,
      workerName: item.worker?.name || '',
      workerEmail: item.worker?.email || '',
      targetId: item.task.targetId,
      companyName: item.company?.name || '',
      companyDomain: item.company?.domain || '',
      companyCountry: item.company?.country || '',
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