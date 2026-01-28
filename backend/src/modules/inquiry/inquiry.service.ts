import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import {
  InquiryAction,
  InquiryActionStatus,
} from './entities/inquiry-action.entity';
import {
  InquiryTask,
  InquiryStatus,
  InquiryPlatform,
} from './entities/inquiry-task.entity';
import { OutreachRecord } from './entities/outreach-record.entity';
import { InquirySubmissionSnapshot } from './entities/inquiry-submission-snapshot.entity';

import { ScreenshotsService } from '../screenshots/screenshots.service';
import { CooldownService } from '../cooldown/cooldown.service';
import { DailyLimitValidationService } from '../../common/services/daily-limit-validation.service';

import { SubmitInquiryDto } from './dto/submit-inquiry.dto';
import { ResearchTask, ResearchStatus } from '../research/entities/research-task.entity';
import { ResearchSubmission } from '../research/entities/research-submission.entity';
import { Company } from '../research/entities/company.entity';
import { Category } from '../categories/entities/category.entity';
import { UserCategory } from '../categories/entities/user-category.entity';

@Injectable()
export class InquiryService {
  constructor(
    @InjectRepository(InquiryAction)
    private readonly actionRepo: Repository<InquiryAction>,

    @InjectRepository(InquiryTask)
    private readonly taskRepo: Repository<InquiryTask>,

    @InjectRepository(OutreachRecord)
    private readonly outreachRepo: Repository<OutreachRecord>,

    @InjectRepository(InquirySubmissionSnapshot)
    private readonly snapshotRepo: Repository<InquirySubmissionSnapshot>,

    @InjectRepository(ResearchTask)
    private readonly researchRepo: Repository<ResearchTask>,

    @InjectRepository(ResearchSubmission)
    private readonly submissionRepo: Repository<ResearchSubmission>,

    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,

    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,

    @InjectRepository(UserCategory)
    private readonly userCategoryRepo: Repository<UserCategory>,

    private readonly screenshotsService: ScreenshotsService,
    private readonly cooldownService: CooldownService,
    private readonly dailyLimitValidationService: DailyLimitValidationService,
    private readonly dataSource: DataSource,
  ) {}

  // ===============================
  // GET AVAILABLE TASKS
  // ===============================
  async getAvailableTasks(userId: string, type: 'website' | 'linkedin') {
    const targetType = type === 'website' ? 'COMPANY' : 'LINKEDIN_PROFILE';

    // Get user's assigned categories
    const userCategories = await this.userCategoryRepo.find({
      where: { userId },
      select: ['categoryId'],
    });

    const categoryIds = userCategories.map(uc => uc.categoryId);

    // If user has no categories, return empty
    if (categoryIds.length === 0) {
      return [];
    }

    const completedResearch = await this.researchRepo.find({
      where: {
        status: ResearchStatus.COMPLETED,
        targetType: targetType,
      },
      order: { createdAt: 'ASC' },
      take: 50,
    });

    // Filter by user's categories and process tasks
    const tasksWithDetails = await Promise.all(
      completedResearch
        .filter(task => categoryIds.includes(task.categoryId))
        .map(async (task) => {
        let companyName = '';
        let companyDomain = '';
        let companyCountry = '';
        let submissionData: any = {};

        if (task.targetType === 'COMPANY') {
          const company = await this.companyRepo.findOne({
            where: { id: task.targetId },
          });
          if (company) {
            companyName = company.name;
            companyDomain = company.domain;
            companyCountry = company.country;
          }
        } else if (task.targetType === 'LINKEDIN' || task.targetType === 'LINKEDIN_PROFILE') {
          companyDomain = task.targetId;
        }

        const submission = await this.submissionRepo.findOne({
          where: { researchTaskId: task.id },
        });
        if (submission) {
          submissionData = {
            language: submission.language,
            country: submission.country,
            contactName: submission.contactName,
            contactLinkedinUrl: submission.contactLinkedinUrl,
            email: submission.email,
            phone: submission.phone,
            techStack: submission.techStack,
            notes: submission.notes,
          };
        }

        const category = await this.categoryRepo.findOne({
          where: { id: task.categoryId },
        });

        // Check if inquiry task exists for this target/category combo
        const inquiryTask = await this.taskRepo.findOne({
          where: {
            targetId: task.targetId,
            categoryId: task.categoryId,
          },
        });

        // Compute LinkedIn progress (number of actions done/pending) so UI can resume after logout
        let linkedinProgress: {
          completedSteps: number;
          pendingActionIndex: number | null;
          nextStep: number;
        } | null = null;
        if (type === 'linkedin' && inquiryTask) {
          const actions = await this.actionRepo.find({
            where: { inquiryTaskId: inquiryTask.id },
            order: { actionIndex: 'ASC' },
          });

          const pendingAction = actions.find(a => a.status === InquiryActionStatus.PENDING) || null;
          const completedSteps = actions.length;
          const nextStep = pendingAction
            ? pendingAction.actionIndex
            : Math.min(completedSteps + 1, 3);

          linkedinProgress = {
            completedSteps,
            pendingActionIndex: pendingAction ? pendingAction.actionIndex : null,
            nextStep,
          };
        }

        let taskStatus = InquiryStatus.PENDING;
        let assignedToUserId = null;
        if (inquiryTask) {
          taskStatus = inquiryTask.status;
          assignedToUserId = inquiryTask.assignedToUserId;
        }

        // Filter out tasks claimed by other users
        if (inquiryTask && inquiryTask.assignedToUserId && inquiryTask.assignedToUserId !== userId) {
          return null;
        }

        // Filter out COMPLETED tasks (already submitted, moved to audit flow)
        if (inquiryTask && inquiryTask.status === InquiryStatus.COMPLETED) {
          return null;
        }

        return {
          id: task.id,
          targetId: task.targetId,
          categoryId: task.categoryId,
          categoryName: category?.name || '',
          status: taskStatus,
          assignedToUserId,
          inquiryTaskId: inquiryTask?.id || null,
          linkedinProgress,
          type: type,
          companyName,
          companyDomain,
          companyCountry,
          ...submissionData,
          createdAt: task.createdAt,
        };
      }),
    );

    // Filter out null entries (tasks claimed by others or completed)
    return tasksWithDetails.filter(t => t !== null);
  }

  // ===============================
  // TAKE INQUIRY
  // ===============================
  async takeInquiry(
    researchTaskId: string,
    userId: string,
  ) {
    // Get the research task to get targetId and categoryId
    const researchTask = await this.researchRepo.findOne({
      where: { id: researchTaskId },
    });

    if (!researchTask) {
      throw new BadRequestException('Research task not found');
    }

    // Check if an inquiry task already exists for this target/category combo
    let task = await this.taskRepo.findOne({
      where: {
        targetId: researchTask.targetId,
        categoryId: researchTask.categoryId,
      },
    });

    // If no inquiry task exists, create one
    if (!task) {
      // Determine platform from research task targetType
      const platform = researchTask.targetType === 'COMPANY' 
        ? InquiryPlatform.WEBSITE 
        : InquiryPlatform.LINKEDIN;
      
      task = this.taskRepo.create({
        targetId: researchTask.targetId,
        categoryId: researchTask.categoryId,
        platform,
        researchTaskId, // Store research task ID directly
        status: InquiryStatus.PENDING,
      });
    }

    // Check if already claimed
    if (task.assignedToUserId && task.assignedToUserId !== userId) {
      throw new BadRequestException('Task already claimed by another user');
    }

    // If already claimed by same user, return existing task
    if (task.assignedToUserId === userId && task.status === InquiryStatus.IN_PROGRESS) {
      return task;
    }

    // Claim the task
    task.assignedToUserId = userId;
    task.status = InquiryStatus.IN_PROGRESS;

    return this.taskRepo.save(task);
  }

  // ===============================
  // SUBMIT INQUIRY ACTION
  // ===============================
  async submitInquiry(
    dto: SubmitInquiryDto,
    screenshotBuffer: Buffer,
    userId: string,
    roles: string[] = [],
  ) {
    console.log('[SERVICE-SUBMIT] ========== START =========');
    console.log('[SERVICE-SUBMIT] User:', userId);
    console.log('[SERVICE-SUBMIT] Task:', dto.inquiryTaskId);
    console.log('[SERVICE-SUBMIT] Type:', dto.actionType);
    console.log('[SERVICE-SUBMIT] Buffer size:', screenshotBuffer?.length || 0);

    // Validate actionType is present and in allowed values
    if (!dto.actionType) {
      console.error('[SERVICE-SUBMIT] ERROR: actionType is required');
      throw new BadRequestException('actionType is required');
    }

    const validActionTypes = ['EMAIL', 'LINKEDIN', 'CALL', 'LINKEDIN_OUTREACH', 'LINKEDIN_EMAIL_REQUEST', 'LINKEDIN_CATALOGUE'];
    if (!validActionTypes.includes(dto.actionType)) {
      console.error('[SERVICE-SUBMIT] ERROR: Invalid actionType:', dto.actionType);
      throw new BadRequestException(`actionType must be one of: ${validActionTypes.join(', ')}`);
    }

    // Validate buffer presence
    if (!screenshotBuffer || screenshotBuffer.length === 0) {
      console.error('[SERVICE-SUBMIT] ERROR: No buffer');
      throw new BadRequestException('Screenshot buffer required');
    }

    // Start transaction
    const result = await this.dataSource.transaction(async (manager) => {
      console.log('[SERVICE-SUBMIT] Transaction started');

      // Fetch task using transactional manager
      console.log('[SERVICE-SUBMIT] Fetching task...');
      const task = await manager.getRepository(InquiryTask).findOne({
        where: { id: dto.inquiryTaskId },
      });

      if (!task) {
        console.error('[SERVICE-SUBMIT] ERROR: Task not found');
        throw new BadRequestException('Inquiry task not found');
      }

      console.log('[SERVICE-SUBMIT] Task found. Status:', task.status, 'Owner:', task.assignedToUserId);

      // Validate ownership
      if (task.assignedToUserId !== userId) {
        console.error('[SERVICE-SUBMIT] ERROR: Not owner. Assigned to:', task.assignedToUserId);
        throw new BadRequestException('Not your inquiry task');
      }

      // Validate status
      if (task.status !== InquiryStatus.IN_PROGRESS) {
        console.error('[SERVICE-SUBMIT] ERROR: Wrong status:', task.status);
        throw new BadRequestException('Inquiry is not in progress');
      }

      // For website tasks we block concurrent pending actions; for LinkedIn we allow collecting all steps before audit
      if (task.platform !== InquiryPlatform.LINKEDIN) {
        console.log('[SERVICE-SUBMIT] Checking pending actions...');
        const pending = await manager.getRepository(InquiryAction).findOne({
          where: {
            inquiryTaskId: task.id,
            status: InquiryActionStatus.PENDING,
          },
        });

        if (pending) {
          console.error('[SERVICE-SUBMIT] ERROR: Pending action exists');
          throw new BadRequestException('There is already a pending action');
        }
      }

        // Enforce daily limits + last contact cooldown
        const actionType = task.platform === InquiryPlatform.LINKEDIN ? 'LinkedIn Inquiry' : 'Website Inquiry';
        const role = this.resolveUserRole(roles, 'inquirer');
        let targetIdentifier = task.targetId;

        const researchTaskForTarget = await manager.getRepository(ResearchTask).findOne({
          where: { targetId: task.targetId, categoryId: task.categoryId },
        });

        if (researchTaskForTarget?.targetType === 'COMPANY') {
          const company = await manager.getRepository(Company).findOne({
            where: { id: researchTaskForTarget.targetId },
          });
          if (company) {
            targetIdentifier = company.normalizedDomain || company.domain;
          }
        }

        const validation = await this.dailyLimitValidationService.validateTaskSubmission(
          userId,
          task.categoryId,
          role,
          actionType,
          targetIdentifier,
        );

        if (!validation.allowed) {
          throw new BadRequestException(validation.reason || 'Daily limit validation failed');
        }

      // Enforce cooldown for website flow; skip for LinkedIn 3-step so user can finish all steps consecutively
      if (task.platform !== InquiryPlatform.LINKEDIN) {
        console.log('[SERVICE-SUBMIT] Enforcing cooldown...');
        try {
          await this.cooldownService.enforceCooldown({
            userId,
            targetId: task.targetId,
            categoryId: task.categoryId,
            actionType: dto.actionType,
          });
          console.log('[SERVICE-SUBMIT] Cooldown OK');
        } catch (err) {
          console.error('[SERVICE-SUBMIT] ERROR: Cooldown violation:', err.message);
          throw err;
        }
      }

      // Process screenshot (duplicate is allowed, returns isDuplicate flag)
      console.log('[SERVICE-SUBMIT] Processing screenshot...');
      let screenshotResult;
      try {
        screenshotResult = await this.screenshotsService.processScreenshot(
          screenshotBuffer,
          userId,
        );
        console.log('[SERVICE-SUBMIT] Screenshot result:', {
          screenshotId: screenshotResult.screenshotId,
          isDuplicate: screenshotResult.isDuplicate,
        });
      } catch (err) {
        console.error('[SERVICE-SUBMIT] ERROR: Screenshot processing failed:', err.message);
        throw err;
      }

      // Determine actionIndex based on actionType
      let actionIndex = 1;
      if (dto.actionType === 'LINKEDIN_OUTREACH') actionIndex = 1;
      else if (dto.actionType === 'LINKEDIN_EMAIL_REQUEST') actionIndex = 2;
      else if (dto.actionType === 'LINKEDIN_CATALOGUE') actionIndex = 3;
      
      // Create action record in transaction
      console.log('[SERVICE-SUBMIT] Creating action record...');
      const action = await manager.getRepository(InquiryAction).save({
        inquiryTaskId: task.id,
        actionIndex,
        performedByUserId: userId,
        status: InquiryActionStatus.PENDING,
      });
      console.log('[SERVICE-SUBMIT] Action created:', action.id);

      // Save screenshot file to disk (outside transaction for file I/O)
      console.log('[SERVICE-SUBMIT] Saving screenshot file...');
      try {
        await this.screenshotsService.saveScreenshotFile(
          screenshotBuffer,
          action.id,
          userId,
          'image/png', // You may want to detect this from the buffer
          screenshotResult.isDuplicate, // Enforce single source of truth
        );
        console.log('[SERVICE-SUBMIT] Screenshot file saved');
      } catch (err) {
        console.error('[SERVICE-SUBMIT] ERROR: Screenshot file save failed:', err.message);
        throw err;
      }

      // Create outreach record in transaction
      console.log('[SERVICE-SUBMIT] Creating outreach record...');
      await manager.getRepository(OutreachRecord).save({
        inquiryTaskId: task.id,
        userId,
        actionType: dto.actionType,
        inquiryActionId: action.id,
      });
      console.log('[SERVICE-SUBMIT] Outreach record created');

      // Record cooldown action in transaction
      console.log('[SERVICE-SUBMIT] Recording cooldown...');
      try {
        await this.cooldownService.recordAction({
          userId,
          targetId: task.targetId,
          categoryId: task.categoryId,
          actionType: dto.actionType,
          manager, // Pass manager for transactional cooldown recording
        });
        console.log('[SERVICE-SUBMIT] Cooldown recorded');
      } catch (err) {
        console.error('[SERVICE-SUBMIT] ERROR: Cooldown recording failed:', err.message);
        throw err;
      }

      // Capture context and save snapshot (for auditor's source of truth)
      console.log('[SERVICE-SUBMIT] Capturing context for snapshot...');
      let snapshotData = {
        researchTaskId: null as string | null,
        companyName: null as string | null,
        companyUrl: null as string | null,
        country: null as string | null,
        language: null as string | null,
      };

      // Fetch research context if available
      const researchTask = await manager.getRepository(ResearchTask).findOne({
        where: { targetId: task.targetId, categoryId: task.categoryId },
      });

      if (researchTask) {
        snapshotData.researchTaskId = researchTask.id;
        // Get company info if company target
        if (researchTask.targetType === 'COMPANY') {
          const company = await manager.getRepository(Company).findOne({
            where: { id: researchTask.targetId },
          });
          if (company) {
            snapshotData.companyName = company.name;
            snapshotData.companyUrl = company.domain;
            snapshotData.country = company.country;
          }
        }

        // Get research submission for language/country override
        const submission = await manager.getRepository(ResearchSubmission).findOne({
          where: { researchTaskId: researchTask.id },
          order: { createdAt: 'DESC' },
        });

        if (submission) {
          snapshotData.country = submission.country || snapshotData.country;
          snapshotData.language = submission.language;
        }
      }

      // Get screenshot info
      const screenshot = await this.screenshotsService.getScreenshotByActionId(action.id);
      const screenshotPath = screenshot?.filePath || null;
      const screenshotHash = screenshot?.hash || null;
      // Use the isDuplicate persisted from processScreenshot() through screenshot metadata
      const isDuplicate = screenshot?.isDuplicate || false;

      // Save snapshot (immutable source of truth for auditor)
      console.log('[SERVICE-SUBMIT] Saving snapshot...');
      await manager.getRepository(InquirySubmissionSnapshot).save({
        inquiryTaskId: task.id,
        inquiryActionId: action.id,
        researchTaskId: snapshotData.researchTaskId,
        companyName: snapshotData.companyName,
        companyUrl: snapshotData.companyUrl,
        country: snapshotData.country,
        language: snapshotData.language,
        screenshotPath,
        screenshotHash,
        isDuplicate,
      });
      console.log('[SERVICE-SUBMIT] Snapshot saved');

      // For LinkedIn tasks, check if all 3 steps are completed
      // For website tasks, mark as COMPLETED immediately
      let taskCompleted = true;
      if (dto.actionType && dto.actionType.startsWith('LINKEDIN_')) {
        // Check if all 3 LinkedIn actions are done
        const allActions = await manager.getRepository(InquiryAction).find({
          where: { inquiryTaskId: task.id },
        });
        taskCompleted = allActions.length >= 3;
        console.log(`[SERVICE-SUBMIT] LinkedIn task: ${allActions.length} actions completed out of 3`);
      }

      // Update task status
      if (taskCompleted) {
        console.log('[SERVICE-SUBMIT] Finalizing task status to COMPLETED...');
        task.status = InquiryStatus.COMPLETED;
      } else {
        console.log('[SERVICE-SUBMIT] Task remains IN_PROGRESS (waiting for more steps)...');
        // Task stays IN_PROGRESS for LinkedIn multi-step
      }
      
      await manager.getRepository(InquiryTask).save(task);

      await this.dailyLimitValidationService.recordContact(
        targetIdentifier,
        task.categoryId,
        userId,
        'inquiry',
      );
      console.log('[SERVICE-SUBMIT] Task status updated:', task.status);

      console.log('[SERVICE-SUBMIT] Transaction completed successfully');

      // Return action with screenshot info
      return {
        action,
        screenshotDuplicate: screenshotResult.isDuplicate,
      };
    });

    console.log('[SERVICE-SUBMIT] ========== SUCCESS =========');

    return result;
  }

  private resolveUserRole(roles: string[], type: 'researcher' | 'inquirer' | 'auditor'): string {
    if (!roles || roles.length === 0) {
      return type === 'researcher' ? 'Researcher' : type === 'inquirer' ? 'Inquirer' : 'Auditor';
    }
    const match = roles.find(r => r.toLowerCase().includes(type));
    return match || roles[0];
  }
}