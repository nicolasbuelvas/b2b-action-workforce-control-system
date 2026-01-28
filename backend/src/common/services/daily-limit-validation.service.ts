import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryRule, RuleStatus } from '../../modules/category-rules/entities/category-rule.entity';
import { LastContact } from '../../entities/last-contact.entity';
import { ResearchTask } from '../../modules/research/entities/research-task.entity';
import { InquiryTask } from '../../modules/inquiry/entities/inquiry-task.entity';
import { ResearchSubmission } from '../../modules/research/entities/research-submission.entity';
import { InquiryAction } from '../../modules/inquiry/entities/inquiry-action.entity';
import { LinkedInResearchTask } from '../../modules/linkedin/entities/linkedin-research-task.entity';
import { LinkedInResearchSubmission } from '../../modules/linkedin/entities/linkedin-research-submission.entity';
import { LinkedInInquiryTask } from '../../modules/linkedin/entities/linkedin-inquiry-task.entity';
import { LinkedInAction } from '../../modules/linkedin/entities/linkedin-action.entity';

@Injectable()
export class DailyLimitValidationService {
  constructor(
    @InjectRepository(CategoryRule)
    private readonly categoryRuleRepo: Repository<CategoryRule>,
    @InjectRepository(LastContact)
    private readonly lastContactRepo: Repository<LastContact>,
    @InjectRepository(ResearchTask)
    private readonly researchTaskRepo: Repository<ResearchTask>,
    @InjectRepository(InquiryTask)
    private readonly inquiryTaskRepo: Repository<InquiryTask>,
    @InjectRepository(ResearchSubmission)
    private readonly researchSubmissionRepo: Repository<ResearchSubmission>,
    @InjectRepository(InquiryAction)
    private readonly inquiryActionRepo: Repository<InquiryAction>,
    @InjectRepository(LinkedInResearchTask)
    private readonly linkedInResearchTaskRepo: Repository<LinkedInResearchTask>,
    @InjectRepository(LinkedInResearchSubmission)
    private readonly linkedInResearchSubmissionRepo: Repository<LinkedInResearchSubmission>,
    @InjectRepository(LinkedInInquiryTask)
    private readonly linkedInInquiryTaskRepo: Repository<LinkedInInquiryTask>,
    @InjectRepository(LinkedInAction)
    private readonly linkedInActionRepo: Repository<LinkedInAction>,
  ) {}

  /**
   * Validate if a user can submit a task based on daily limits and cooldown
   */
  async validateTaskSubmission(
    userId: string,
    categoryId: string,
    role: string,
    actionType: string,
    targetIdentifier: string, // URL or company name
  ): Promise<{ allowed: boolean; reason?: string }> {
    // Get the category rule (first try exact role, then fallback role)
    let rule = await this.categoryRuleRepo.findOne({
      where: { categoryId, role, actionType, status: RuleStatus.ACTIVE },
    });

    if (!rule) {
      const fallbackRole = this.mapRoleFallback(role);
      if (fallbackRole) {
        rule = await this.categoryRuleRepo.findOne({
          where: { categoryId, role: fallbackRole, actionType, status: RuleStatus.ACTIVE },
        });
      }
    }

    if (!rule) {
      // No rule found, allow submission
      return { allowed: true };
    }

    // Check 1: Daily limit
    if (rule.dailyLimitOverride !== null) {
      const dailyLimitCheck = await this.checkDailyLimit(
        userId,
        categoryId,
        actionType,
        rule.dailyLimitOverride,
      );
      if (!dailyLimitCheck.allowed) {
        return dailyLimitCheck;
      }
    }

    // Check 2: Cooldown period
    if (rule.cooldownDaysOverride !== null) {
      const cooldownCheck = await this.checkCooldownPeriod(
        targetIdentifier,
        categoryId,
        rule.cooldownDaysOverride,
      );
      if (!cooldownCheck.allowed) {
        return cooldownCheck;
      }
    }

    return { allowed: true };
  }

  /**
   * Check if user has exceeded daily task limit
   */
  private async checkDailyLimit(
    userId: string,
    categoryId: string,
    actionType: string,
    maxTasks: number,
  ): Promise<{ allowed: boolean; reason?: string }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let totalToday = 0;

    if (actionType === 'Website Research') {
      totalToday = await this.researchSubmissionRepo
        .createQueryBuilder('submission')
        .leftJoin(ResearchTask, 'task', 'task.id = submission.researchTaskId')
        .where('task.assignedToUserId = :userId', { userId })
        .andWhere('task.categoryId = :categoryId', { categoryId })
        .andWhere('task.targetType = :targetType', { targetType: 'COMPANY' })
        .andWhere('submission.createdAt BETWEEN :today AND :tomorrow', { today, tomorrow })
        .getCount();
    } else if (actionType === 'LinkedIn Research') {
      const mainCount = await this.researchSubmissionRepo
        .createQueryBuilder('submission')
        .leftJoin(ResearchTask, 'task', 'task.id = submission.researchTaskId')
        .where('task.assignedToUserId = :userId', { userId })
        .andWhere('task.categoryId = :categoryId', { categoryId })
        .andWhere('task.targetType != :targetType', { targetType: 'COMPANY' })
        .andWhere('submission.createdAt BETWEEN :today AND :tomorrow', { today, tomorrow })
        .getCount();

      const linkedInCount = await this.linkedInResearchSubmissionRepo
        .createQueryBuilder('submission')
        .leftJoin(LinkedInResearchTask, 'task', 'task.id = submission.researchTaskId')
        .where('task.assignedToUserId = :userId', { userId })
        .andWhere('task.categoryId = :categoryId', { categoryId })
        .andWhere('submission.createdAt BETWEEN :today AND :tomorrow', { today, tomorrow })
        .getCount();

      totalToday = mainCount + linkedInCount;
    } else if (actionType === 'Website Inquiry') {
      totalToday = await this.inquiryActionRepo
        .createQueryBuilder('action')
        .leftJoin(InquiryTask, 'task', 'task.id = action.inquiryTaskId')
        .where('task.assignedToUserId = :userId', { userId })
        .andWhere('task.categoryId = :categoryId', { categoryId })
        .andWhere('task.platform = :platform', { platform: 'WEBSITE' })
        .andWhere('action.createdAt BETWEEN :today AND :tomorrow', { today, tomorrow })
        .getCount();
    } else if (actionType === 'LinkedIn Inquiry') {
      const mainCount = await this.inquiryActionRepo
        .createQueryBuilder('action')
        .leftJoin(InquiryTask, 'task', 'task.id = action.inquiryTaskId')
        .where('task.assignedToUserId = :userId', { userId })
        .andWhere('task.categoryId = :categoryId', { categoryId })
        .andWhere('task.platform = :platform', { platform: 'LINKEDIN' })
        .andWhere('action.createdAt BETWEEN :today AND :tomorrow', { today, tomorrow })
        .getCount();

      const linkedInCount = await this.linkedInActionRepo
        .createQueryBuilder('action')
        .leftJoin(LinkedInInquiryTask, 'task', 'task.id = action.inquiryTaskId')
        .where('task.assignedToUserId = :userId', { userId })
        .andWhere('task.categoryId = :categoryId', { categoryId })
        .andWhere('action.createdAt BETWEEN :today AND :tomorrow', { today, tomorrow })
        .getCount();

      totalToday = mainCount + linkedInCount;
    }

    if (totalToday >= maxTasks) {
      return {
        allowed: false,
        reason: `Daily limit exceeded: ${totalToday}/${maxTasks} tasks completed today`,
      };
    }

    return { allowed: true };
  }

  private mapRoleFallback(role: string): string | null {
    const lower = role.toLowerCase();
    if (lower.includes('researcher')) return 'Researcher';
    if (lower.includes('inquirer')) return 'Inquirer';
    if (lower.includes('auditor')) return 'Auditor';
    return null;
  }

  /**
   * Check if cooldown period has elapsed since last contact
   */
  private async checkCooldownPeriod(
    targetIdentifier: string,
    categoryId: string,
    cooldownDays: number,
  ): Promise<{ allowed: boolean; reason?: string }> {
    const lastContact = await this.lastContactRepo.findOne({
      where: { targetIdentifier, categoryId },
      order: { lastContactedAt: 'DESC' },
    });

    if (!lastContact) {
      // No previous contact, allow submission
      return { allowed: true };
    }

    const now = new Date();
    const lastContactDate = new Date(lastContact.lastContactedAt);
    const daysSinceLastContact = Math.floor(
      (now.getTime() - lastContactDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysSinceLastContact < cooldownDays) {
      const daysRemaining = cooldownDays - daysSinceLastContact;
      return {
        allowed: false,
        reason: `Cooldown period active: Last contacted ${daysSinceLastContact} days ago, need ${daysRemaining} more days`,
      };
    }

    return { allowed: true };
  }

  /**
   * Record a contact after successful task submission
   */
  async recordContact(
    targetIdentifier: string,
    categoryId: string,
    userId: string,
    taskType: 'research' | 'inquiry',
  ): Promise<void> {
    // Check if record already exists
    const existing = await this.lastContactRepo.findOne({
      where: { targetIdentifier, categoryId },
    });

    if (existing) {
      // Update existing record
      existing.lastContactedAt = new Date();
      existing.contactedByUserId = userId;
      existing.taskType = taskType;
      await this.lastContactRepo.save(existing);
    } else {
      // Create new record
      const newContact = this.lastContactRepo.create({
        targetIdentifier,
        categoryId,
        lastContactedAt: new Date(),
        contactedByUserId: userId,
        taskType,
      });
      await this.lastContactRepo.save(newContact);
    }
  }
}
