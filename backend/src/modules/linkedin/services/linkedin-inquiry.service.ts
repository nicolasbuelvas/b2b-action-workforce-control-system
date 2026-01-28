import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  LinkedInInquiryTask,
  LinkedInInquiryStatus,
} from '../entities/linkedin-inquiry-task.entity';
import {
  LinkedInAction,
  LinkedInActionType,
  LinkedInActionStatus,
} from '../entities/linkedin-action.entity';
import { LinkedInSubmissionSnapshot } from '../entities/linkedin-submission-snapshot.entity';
import { LinkedInResearchSubmission } from '../entities/linkedin-research-submission.entity';
import { ScreenshotsService } from '../../screenshots/screenshots.service';
import { DailyLimitValidationService } from '../../../common/services/daily-limit-validation.service';
import { SubmitLinkedInActionDto } from '../dto/submit-linkedin-action.dto';

@Injectable()
export class LinkedInInquiryService {
  constructor(
    @InjectRepository(LinkedInInquiryTask)
    private readonly taskRepo: Repository<LinkedInInquiryTask>,

    @InjectRepository(LinkedInAction)
    private readonly actionRepo: Repository<LinkedInAction>,

    @InjectRepository(LinkedInSubmissionSnapshot)
    private readonly snapshotRepo: Repository<LinkedInSubmissionSnapshot>,

    @InjectRepository(LinkedInResearchSubmission)
    private readonly researchSubmissionRepo: Repository<LinkedInResearchSubmission>,

    private readonly screenshotsService: ScreenshotsService,
    private readonly dailyLimitValidationService: DailyLimitValidationService,
  ) {}

  async getLinkedInTasks(userId: string): Promise<LinkedInInquiryTask[]> {
    return this.taskRepo.find({
      where: [
        {
          assignedToUserId: userId,
          status: LinkedInInquiryStatus.PENDING,
        },
        {
          assignedToUserId: userId,
          status: LinkedInInquiryStatus.IN_PROGRESS,
        },
      ],
    });
  }

  async claimTask(taskId: string, userId: string): Promise<LinkedInInquiryTask> {
    const task = await this.taskRepo.findOne({ where: { id: taskId } });

    if (!task) {
      throw new BadRequestException('Inquiry task not found');
    }

    if (task.assignedToUserId && task.assignedToUserId !== userId) {
      throw new BadRequestException('Task is already assigned to another user');
    }

    task.assignedToUserId = userId;
    task.status = LinkedInInquiryStatus.IN_PROGRESS;

    // Initialize 3 actions for this task
    const existingActions = await this.actionRepo.find({
      where: { inquiryTaskId: taskId },
    });

    if (existingActions.length === 0) {
      await this.actionRepo.save([
        {
          inquiryTaskId: taskId,
          actionType: LinkedInActionType.OUTREACH,
          status: LinkedInActionStatus.PENDING,
        },
        {
          inquiryTaskId: taskId,
          actionType: LinkedInActionType.ASK_FOR_EMAIL,
          status: LinkedInActionStatus.PENDING,
        },
        {
          inquiryTaskId: taskId,
          actionType: LinkedInActionType.SEND_CATALOGUE,
          status: LinkedInActionStatus.PENDING,
        },
      ]);
    }

    return this.taskRepo.save(task);
  }

  async submitAction(
    taskId: string,
    actionType: LinkedInActionType,
    userId: string,
    dto: SubmitLinkedInActionDto,
    roles: string[] = [],
  ): Promise<any> {
    // Verify task exists and is assigned to user
    const task = await this.taskRepo.findOne({ where: { id: taskId } });

    if (!task) {
      throw new BadRequestException('Inquiry task not found');
    }

    if (task.assignedToUserId !== userId) {
      throw new BadRequestException('This task is not assigned to you');
    }

    // Get research submission for context (immutable source of truth)
    const researchSubmission = await this.researchSubmissionRepo.findOne({
      where: { researchTaskId: task.researchTaskId },
    });

    if (!researchSubmission) {
      throw new BadRequestException('Research submission not found');
    }

    const role = this.resolveUserRole(roles, 'inquirer');
    const targetIdentifier = researchSubmission.linkedinProfileUrl;

    const validation = await this.dailyLimitValidationService.validateTaskSubmission(
      userId,
      task.categoryId,
      role,
      'LinkedIn Inquiry',
      targetIdentifier,
    );

    if (!validation.allowed) {
      throw new BadRequestException(validation.reason || 'Daily limit validation failed');
    }

    // Enforce strict action ordering
    await this.enforceActionOrdering(taskId, actionType);

    // Get or create the action
    let action = await this.actionRepo.findOne({
      where: { inquiryTaskId: taskId, actionType },
    });

    if (!action) {
      action = this.actionRepo.create({
        inquiryTaskId: taskId,
        actionType,
        status: LinkedInActionStatus.PENDING,
      });
      await this.actionRepo.save(action);
    }

    // Validate action-specific data
    await this.validateActionData(actionType, dto, action);

    // Process screenshot if provided
    let screenshotResult = null;
    if (dto.screenshotFile) {
      screenshotResult = await this.screenshotsService.processScreenshot(
        dto.screenshotFile,
        userId,
        'image/png',
      );
    }

    if (!screenshotResult) {
      throw new BadRequestException('Screenshot is required for this action');
    }

    // Save screenshot file
    const savedScreenshot = await this.screenshotsService.saveScreenshotFile(
      dto.screenshotFile,
      action.id,
      userId,
      'image/png',
      screenshotResult.isDuplicate,
    );

    // Create immutable snapshot
    const snapshot = this.snapshotRepo.create({
      inquiryTaskId: taskId,
      actionId: action.id,
      actionType,
      researchTaskId: task.researchTaskId,
      // Researcher data (immutable)
      contactName: researchSubmission.contactName,
      linkedinProfileUrl: researchSubmission.linkedinProfileUrl,
      country: researchSubmission.country,
      language: researchSubmission.language,
      // Action evidence
      screenshotPath: savedScreenshot.filePath,
      screenshotHash: savedScreenshot.hash,
      isDuplicate: screenshotResult.isDuplicate,
      // Action-specific data
      messageContent: dto.messageContent || null,
      emailProvided: dto.emailProvided || false,
      emailValue: dto.emailValue || null,
    });

    await this.snapshotRepo.save(snapshot);

    // Mark action as submitted
    action.status = LinkedInActionStatus.SUBMITTED;
    await this.actionRepo.save(action);

    // Check if all actions are completed
    const allActions = await this.actionRepo.find({
      where: { inquiryTaskId: taskId },
    });

    const allCompleted = allActions.every(a => a.status !== LinkedInActionStatus.PENDING);

    if (allCompleted) {
      task.status = LinkedInInquiryStatus.COMPLETED;
      await this.taskRepo.save(task);
    }

    await this.dailyLimitValidationService.recordContact(
      targetIdentifier,
      task.categoryId,
      userId,
      'inquiry',
    );

    return {
      actionId: action.id,
      snapshot: snapshot,
      isDuplicate: screenshotResult.isDuplicate,
    };
  }

  private resolveUserRole(roles: string[], type: 'researcher' | 'inquirer' | 'auditor'): string {
    if (!roles || roles.length === 0) {
      return type === 'researcher' ? 'Researcher' : type === 'inquirer' ? 'Inquirer' : 'Auditor';
    }
    const match = roles.find(r => r.toLowerCase().includes(type));
    return match || roles[0];
  }

  private async enforceActionOrdering(
    taskId: string,
    actionType: LinkedInActionType,
  ): Promise<void> {
    const actions = await this.actionRepo.find({
      where: { inquiryTaskId: taskId },
      order: { createdAt: 'ASC' },
    });

    if (actionType === LinkedInActionType.ASK_FOR_EMAIL) {
      const outreachAction = actions.find(a => a.actionType === LinkedInActionType.OUTREACH);
      if (!outreachAction || outreachAction.status === LinkedInActionStatus.PENDING) {
        throw new BadRequestException(
          'Action 1 (Outreach) must be completed before Action 2 (Ask for Email)',
        );
      }
    }

    if (actionType === LinkedInActionType.SEND_CATALOGUE) {
      const outreachAction = actions.find(a => a.actionType === LinkedInActionType.OUTREACH);
      const askEmailAction = actions.find(a => a.actionType === LinkedInActionType.ASK_FOR_EMAIL);

      if (!outreachAction || outreachAction.status === LinkedInActionStatus.PENDING) {
        throw new BadRequestException(
          'Action 1 (Outreach) must be completed before Action 3 (Send Catalogue)',
        );
      }

      if (!askEmailAction || askEmailAction.status === LinkedInActionStatus.PENDING) {
        throw new BadRequestException(
          'Action 2 (Ask for Email) must be completed before Action 3 (Send Catalogue)',
        );
      }
    }
  }

  private async validateActionData(
    actionType: LinkedInActionType,
    dto: SubmitLinkedInActionDto,
    action: LinkedInAction,
  ): Promise<void> {
    switch (actionType) {
      case LinkedInActionType.OUTREACH:
        if (!dto.messageContent || !dto.messageContent.trim()) {
          throw new BadRequestException('Outreach message content is required');
        }
        break;

      case LinkedInActionType.ASK_FOR_EMAIL:
        if (!dto.messageContent || !dto.messageContent.trim()) {
          throw new BadRequestException('Email request message content is required');
        }
        break;

      case LinkedInActionType.SEND_CATALOGUE:
        if (!dto.messageContent || !dto.messageContent.trim()) {
          throw new BadRequestException('Catalogue/price list message content is required');
        }
        break;
    }
  }
}
