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
} from './entities/inquiry-task.entity';
import { OutreachRecord } from './entities/outreach-record.entity';

import { ScreenshotsService } from '../screenshots/screenshots.service';
import { CooldownService } from '../cooldown/cooldown.service';

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
    private readonly dataSource: DataSource,
  ) {}

  // ===============================
  // GET AVAILABLE TASKS
  // ===============================
  async getAvailableTasks(userId: string, type: 'website' | 'linkedin') {
    const targetType = type === 'website' ? 'COMPANY' : 'LINKEDIN';

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
        } else if (task.targetType === 'LINKEDIN') {
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
      task = this.taskRepo.create({
        targetId: researchTask.targetId,
        categoryId: researchTask.categoryId,
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

    const validActionTypes = ['EMAIL', 'LINKEDIN', 'CALL'];
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

      // Check for existing pending action
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

      // Enforce cooldown before any DB modifications
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

      // Create action record in transaction
      console.log('[SERVICE-SUBMIT] Creating action record...');
      const action = await manager.getRepository(InquiryAction).save({
        inquiryTaskId: task.id,
        actionIndex: 1,
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

      // Update task status to COMPLETED (finalize the task)
      console.log('[SERVICE-SUBMIT] Finalizing task status...');
      task.status = InquiryStatus.COMPLETED;
      await manager.getRepository(InquiryTask).save(task);
      console.log('[SERVICE-SUBMIT] Task status updated to COMPLETED');

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
}