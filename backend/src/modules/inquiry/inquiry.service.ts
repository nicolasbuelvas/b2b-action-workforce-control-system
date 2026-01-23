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

    private readonly screenshotsService: ScreenshotsService,
    private readonly cooldownService: CooldownService,
  ) {}

  // ===============================
  // GET AVAILABLE TASKS
  // ===============================
  async getAvailableTasks(userId: string, type: 'website' | 'linkedin') {
    const targetType = type === 'website' ? 'COMPANY' : 'LINKEDIN';

    const completedResearch = await this.researchRepo.find({
      where: {
        status: ResearchStatus.COMPLETED,
        targetType: targetType,
      },
      order: { createdAt: 'ASC' },
      take: 50,
    });

    const tasksWithDetails = await Promise.all(
      completedResearch.map(async (task) => {
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

        return {
          id: task.id,
          targetId: task.targetId,
          categoryId: task.categoryId,
          categoryName: category?.name || '',
          status: 'available',
          type: type,
          companyName,
          companyDomain,
          companyCountry,
          ...submissionData,
          createdAt: task.createdAt,
        };
      }),
    );

    return tasksWithDetails;
  }

  // ===============================
  // TAKE INQUIRY
  // ===============================
  async takeInquiry(
    targetId: string,
    categoryId: string,
    userId: string,
  ) {
    const active = await this.taskRepo.findOne({
      where: {
        assignedToUserId: userId,
        status: InquiryStatus.IN_PROGRESS,
      },
    });

    if (active) {
      throw new BadRequestException(
        'User already has an active inquiry',
      );
    }

    const task = this.taskRepo.create({
      targetId,
      categoryId,
      assignedToUserId: userId,
      status: InquiryStatus.IN_PROGRESS,
    });

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
        taskId: task.id,
        status: InquiryActionStatus.PENDING,
      },
    });

    if (pending) {
      throw new BadRequestException(
        'There is already a pending action',
      );
    }

    const lastApproved = await this.actionRepo.findOne({
      where: {
        taskId: task.id,
        status: InquiryActionStatus.APPROVED,
      },
      order: { actionIndex: 'DESC' },
    });

    const nextIndex = lastApproved
      ? lastApproved.actionIndex + 1
      : 1;

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
      taskId: task.id,
      actionIndex: nextIndex,
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

    return action;
  }
}