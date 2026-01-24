import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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

    // Filter out null entries (tasks claimed by others)
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
    console.log('[submitInquiry] Processing submission for taskId:', dto.inquiryTaskId);
    
    if (!screenshotBuffer) {
      throw new BadRequestException('Screenshot is required');
    }

    const task = await this.taskRepo.findOne({
      where: { id: dto.inquiryTaskId },
    });

    if (!task) {
      throw new BadRequestException('Inquiry task not found');
    }

    if (task.assignedToUserId !== userId) {
      throw new BadRequestException('Not your inquiry task');
    }

    if (task.status !== InquiryStatus.IN_PROGRESS) {
      throw new BadRequestException(
        'Inquiry is not in progress',
      );
    }

    const pending = await this.actionRepo.findOne({
      where: {
        inquiryTaskId: task.id,
        status: InquiryActionStatus.PENDING,
      },
    });

    if (pending) {
      throw new BadRequestException(
        'There is already a pending action',
      );
    }

    await this.cooldownService.enforceCooldown({
      userId,
      targetId: task.targetId,
      categoryId: task.categoryId,
      actionType: dto.actionType,
    });

    const screenshotHash =
      await this.screenshotsService.processScreenshot(
        screenshotBuffer,
        userId,
      );

    const action = await this.actionRepo.save({
      inquiryTaskId: task.id,
      actionIndex: 1,
      performedByUserId: userId,
      status: InquiryActionStatus.PENDING,
    });

    await this.outreachRepo.save({
      inquiryTaskId: task.id,
      userId,
      actionType: dto.actionType,
      inquiryActionId: action.id,
    });

    await this.cooldownService.recordAction({
      userId,
      targetId: task.targetId,
      categoryId: task.categoryId,
      actionType: dto.actionType,
    });

    console.log('[submitInquiry] Submission successful, actionId:', action.id);

    return action;
  }
}