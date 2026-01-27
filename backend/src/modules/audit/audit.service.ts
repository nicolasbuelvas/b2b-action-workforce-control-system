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
import { InquiryTask, InquiryStatus } from '../inquiry/entities/inquiry-task.entity';
import { InquiryAction, InquiryActionStatus } from '../inquiry/entities/inquiry-action.entity';
import { OutreachRecord } from '../inquiry/entities/outreach-record.entity';
import { InquirySubmissionSnapshot } from '../inquiry/entities/inquiry-submission-snapshot.entity';
import { ScreenshotsService } from '../screenshots/screenshots.service';
import { LinkedInProfile } from '../research/entities/linkedin-profile.entity';

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

    @InjectRepository(InquiryTask)
    private readonly inquiryTaskRepo: Repository<InquiryTask>,

    @InjectRepository(InquiryAction)
    private readonly inquiryActionRepo: Repository<InquiryAction>,

    @InjectRepository(OutreachRecord)
    private readonly outreachRepo: Repository<OutreachRecord>,

    @InjectRepository(InquirySubmissionSnapshot)
    private readonly snapshotRepo: Repository<InquirySubmissionSnapshot>,

    @InjectRepository(LinkedInProfile)
    private readonly linkedinProfileRepo: Repository<LinkedInProfile>,

    private readonly screenshotsService: ScreenshotsService,
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

        let linkedInProfile: LinkedInProfile | null = null;
        if (task.targetType === 'LINKEDIN_PROFILE') {
          linkedInProfile = await this.linkedinProfileRepo.findOne({ where: { id: task.targetId } });
        }

        return {
          task,
          submission,
          category,
          company,
          worker,
          linkedInProfile,
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
      linkedInUrl: item.linkedInProfile?.url || (item.task.targetType === 'LINKEDIN' ? item.task.targetId : ''),
      linkedInContactName: item.linkedInProfile?.contactName || item.submission?.contactName || '',
      linkedInCountry: item.linkedInProfile?.country || item.submission?.country || '',
      linkedInLanguage: item.linkedInProfile?.language || item.submission?.language || '',
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

  // ==================== INQUIRY AUDIT ====================

  async getPendingInquiry(auditorUserId: string) {
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

    // Fetch COMPLETED inquiry tasks from auditor's assigned categories
    const tasks = await this.inquiryTaskRepo
      .createQueryBuilder('task')
      .where('task.status = :status', { status: InquiryStatus.COMPLETED })
      .andWhere('task.categoryId IN (:...categoryIds)', { categoryIds })
      .orderBy('task.createdAt', 'ASC')
      .getMany();

    const enriched = await Promise.all(
      tasks.map(async task => {
        // SNAPSHOT IS THE SOURCE OF TRUTH
        const snapshot = await this.snapshotRepo.findOne({
          where: { inquiryTaskId: task.id },
          order: { createdAt: 'DESC' },
        });

        // Fetch related data for worker and category info only
        const [action, category, worker] = await Promise.all([
          this.inquiryActionRepo.findOne({
            where: { inquiryTaskId: task.id },
            order: { createdAt: 'DESC' },
          }),
          this.categoryRepo.findOne({ where: { id: task.categoryId } }),
          this.userRepo.findOne({ where: { id: task.assignedToUserId } }),
        ]);

        const outreach = action
          ? await this.outreachRepo.findOne({
              where: { inquiryActionId: action.id },
            })
          : null;

        return {
          task,
          action,
          outreach,
          category,
          worker,
          snapshot, // Include snapshot (source of truth)
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
      // Use snapshot as source of truth for context
      companyName: item.snapshot?.companyName || '',
      companyDomain: item.snapshot?.companyUrl || '',
      companyCountry: item.snapshot?.country || '',
      language: item.snapshot?.language || '',
      actionType: item.outreach?.actionType || 'UNKNOWN',
      createdAt: item.task.createdAt,
      actionCreatedAt: item.action?.createdAt || null,
      action: item.action,
      outreach: item.outreach,
      screenshotUrl: item.snapshot?.screenshotPath ? `/api/screenshots/${item.action?.id}` : null,
      isDuplicate: item.snapshot?.isDuplicate || false, // From snapshot
    }));
  }

  async auditInquiry(
    inquiryTaskId: string,
    dto: AuditResearchDto,
    auditorUserId: string,
  ) {
    const task = await this.inquiryTaskRepo.findOne({
      where: { id: inquiryTaskId },
    });

    if (!task) {
      throw new BadRequestException('Inquiry task not found');
    }

    if (task.status !== InquiryStatus.COMPLETED) {
      throw new BadRequestException('Inquiry task not ready for audit');
    }

    if (task.assignedToUserId === auditorUserId) {
      throw new ForbiddenException(
        'Auditor cannot audit own submission',
      );
    }

    // Fetch snapshot to check duplicate status
    const snapshot = await this.snapshotRepo.findOne({
      where: { inquiryTaskId: task.id },
      order: { createdAt: 'DESC' },
    });

    // CRITICAL: Block approval if snapshot shows duplicate screenshot
    if (snapshot?.isDuplicate && dto.decision === 'APPROVED') {
      throw new BadRequestException(
        'Cannot approve submission with duplicate screenshot. Please reject with reason "Duplicate Screenshot".',
      );
    }

    task.status =
      dto.decision === 'APPROVED'
        ? InquiryStatus.APPROVED
        : InquiryStatus.REJECTED;

    if (dto.decision === 'REJECTED') {
      await this.flaggedRepo.save({
        userId: task.assignedToUserId,
        targetId: inquiryTaskId,
        actionType: 'INQUIRY',
        reason: snapshot?.isDuplicate ? 'Duplicate (System Detected)' : 'MANUAL_REJECTION',
      });
    }

    // Save task status
    await this.inquiryTaskRepo.save(task);

    // Delete screenshot after audit (approved, rejected, or flagged)
    if (snapshot?.inquiryActionId) {
      await this.screenshotsService.deleteScreenshotByActionId(snapshot.inquiryActionId);
      console.log('[AUDIT] Screenshot deleted for inquiry action:', snapshot.inquiryActionId);
    }

    return task;
  }

  async getPendingLinkedInInquiry(auditorUserId: string) {
    // Get auditor's assigned categories
    const userCategories = await this.userCategoryRepo.find({
      where: { userId: auditorUserId },
      select: ['categoryId'],
    });

    const categoryIds = userCategories.map(uc => uc.categoryId);

    if (categoryIds.length === 0) {
      return [];
    }

    // Fetch completed LinkedIn inquiry tasks from auditor's assigned categories
    // Using InquiryTask with platform = LINKEDIN filter
    const tasks = await this.inquiryTaskRepo
      .createQueryBuilder('task')
      .where('task.status = :status', { status: InquiryStatus.COMPLETED })
      .andWhere('task.platform = :platform', { platform: 'LINKEDIN' })
      .andWhere('task.categoryId IN (:...categoryIds)', { categoryIds })
      .orderBy('task.createdAt', 'ASC')
      .getMany();

    const actionRepo = this.inquiryTaskRepo.manager.getRepository(InquiryAction);
    const snapshotRepo = this.inquiryTaskRepo.manager.getRepository(InquirySubmissionSnapshot);

    const enriched = await Promise.all(
      tasks.map(async task => {
        const actions = await actionRepo.find({
          where: { inquiryTaskId: task.id },
          order: { createdAt: 'ASC' },
        });

        const snapshots = await snapshotRepo.find({
          where: { inquiryTaskId: task.id },
          order: { createdAt: 'ASC' },
        });

        const category = await this.categoryRepo.findOne({
          where: { id: task.categoryId },
        });

        const worker = await this.userRepo.findOne({
          where: { id: task.assignedToUserId },
        });

        return { task, actions, snapshots, category, worker };
      }),
    );

    // Map action index to display names
    const actionTypeMap = {
      1: 'LINKEDIN_OUTREACH',
      2: 'LINKEDIN_EMAIL_REQUEST',
      3: 'LINKEDIN_CATALOGUE',
    };

    return enriched.map(item => ({
      id: item.task.id,
      categoryId: item.task.categoryId,
      categoryName: item.category?.name || '',
      assignedToUserId: item.task.assignedToUserId,
      workerName: item.worker?.name || '',
      workerEmail: item.worker?.email || '',
      targetId: item.task.targetId,
      status: item.task.status,
      createdAt: item.task.createdAt,
      actions: item.actions.map(action => {
        const snapshot = item.snapshots.find(s => s.inquiryActionId === action.id);
        return {
          id: action.id,
          actionType: actionTypeMap[action.actionIndex] || `STEP_${action.actionIndex}`,
          status: action.status,
          screenshotUrl: snapshot?.screenshotPath ? `/api/screenshots/${action.id}` : null,
          isDuplicate: snapshot?.isDuplicate || false,
        };
      }),
    }));
  }

  async auditLinkedInInquiry(
    inquiryTaskId: string,
    actionId: string,
    dto: AuditResearchDto,
    auditorUserId: string,
  ) {
    const actionRepo = this.inquiryTaskRepo.manager.getRepository(InquiryAction);
    const snapshotRepo = this.inquiryTaskRepo.manager.getRepository(InquirySubmissionSnapshot);

    const task = await this.inquiryTaskRepo.findOne({ where: { id: inquiryTaskId } });
    if (!task) {
      throw new BadRequestException('Inquiry task not found');
    }

    if (task.platform !== 'LINKEDIN') {
      throw new BadRequestException('Task is not a LinkedIn inquiry task');
    }

    const action = await actionRepo.findOne({ where: { id: actionId } });
    if (!action) {
      throw new BadRequestException('Action not found');
    }

    if (action.inquiryTaskId !== inquiryTaskId) {
      throw new BadRequestException('Action does not belong to this task');
    }

    const snapshot = await snapshotRepo.findOne({ where: { inquiryActionId: actionId } });
    if (!snapshot) {
      throw new BadRequestException('Snapshot not found');
    }

    // Auditor can approve or reject - duplicate warnings are non-blocking
    if (snapshot?.isDuplicate && dto.decision === 'APPROVED') {
      console.log('[LINKEDIN-AUDIT] Warning: Approving action with duplicate screenshot', {
        actionId,
        taskId: inquiryTaskId,
      });
    }

    action.status =
      dto.decision === 'APPROVED' ? InquiryActionStatus.APPROVED : InquiryActionStatus.REJECTED;
    action.reviewedAt = new Date();
    await actionRepo.save(action);

    // Check if all actions are approved
    const allActions = await actionRepo.find({
      where: { inquiryTaskId },
    });

    const allApproved = allActions.every(a => a.status === InquiryActionStatus.APPROVED);
    const anyRejected = allActions.some(a => a.status === InquiryActionStatus.REJECTED);

    if (allApproved) {
      task.status = InquiryStatus.APPROVED;
    } else if (anyRejected) {
      task.status = InquiryStatus.REJECTED;
    }

    // Save task status
    await this.inquiryTaskRepo.save(task);

    // Delete screenshot after audit decision
    await this.screenshotsService.deleteScreenshotByActionId(actionId);
    console.log('[LINKEDIN-AUDIT] Screenshot deleted for action:', actionId);

    return task;
  }
}

