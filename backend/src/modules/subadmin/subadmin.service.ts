import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResearchTask, ResearchStatus } from '../research/entities/research-task.entity';
import { ResearchSubmission } from '../research/entities/research-submission.entity';
import { InquiryTask, InquiryStatus, InquiryPlatform } from '../inquiry/entities/inquiry-task.entity';
import { InquiryAction } from '../inquiry/entities/inquiry-action.entity';
import { InquirySubmissionSnapshot } from '../inquiry/entities/inquiry-submission-snapshot.entity';
import { UserCategory } from '../categories/entities/user-category.entity';
import { Category } from '../categories/entities/category.entity';
import { Company } from '../research/entities/company.entity';
import { LinkedInProfile } from '../research/entities/linkedin-profile.entity';
import { User } from '../users/entities/user.entity';
import { CompanyType } from './entities/company-type.entity';
import { JobType } from './entities/job-type.entity';
import { DisapprovalReason } from './entities/disapproval-reason.entity';
import { normalizeDomain, normalizeLinkedInUrl } from '../../common/utils/normalization.util';

@Injectable()
export class SubAdminService {
  constructor(
    @InjectRepository(ResearchTask)
    private readonly researchTaskRepo: Repository<ResearchTask>,
    @InjectRepository(ResearchSubmission)
    private readonly researchSubmissionRepo: Repository<ResearchSubmission>,
    @InjectRepository(InquiryTask)
    private readonly inquiryTaskRepo: Repository<InquiryTask>,
    @InjectRepository(InquiryAction)
    private readonly inquiryActionRepo: Repository<InquiryAction>,
    @InjectRepository(InquirySubmissionSnapshot)
    private readonly snapshotRepo: Repository<InquirySubmissionSnapshot>,
    @InjectRepository(UserCategory)
    private readonly userCategoryRepo: Repository<UserCategory>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
    @InjectRepository(LinkedInProfile)
    private readonly linkedinProfileRepo: Repository<LinkedInProfile>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(CompanyType)
    private readonly companyTypeRepo: Repository<CompanyType>,
    @InjectRepository(JobType)
    private readonly jobTypeRepo: Repository<JobType>,
    @InjectRepository(DisapprovalReason)
    private readonly disapprovalReasonRepo: Repository<DisapprovalReason>,
  ) {}

  /**
   * Get categories assigned to sub-admin
   */
  async getUserCategories(userId: string): Promise<Category[]> {
    const userCategories = await this.userCategoryRepo.find({
      where: { userId },
      relations: ['category'],
    });

    return userCategories
      .map(uc => uc.category)
      .filter(c => c && c.isActive !== false);
  }

  /**
   * Validate that sub-admin has access to a category
   */
  async validateCategoryAccess(userId: string, categoryId: string): Promise<void> {
    const userCategory = await this.userCategoryRepo.findOne({
      where: { userId, categoryId },
    });

    if (!userCategory) {
      throw new ForbiddenException(
        `You do not have access to category ${categoryId}`,
      );
    }
  }

  /**
   * Ensure job type and company type exist and are active
   */
  private async ensureTypes(jobTypeId: string, companyTypeId: string) {
    if (!jobTypeId || !companyTypeId) {
      throw new BadRequestException('jobTypeId and companyTypeId are required');
    }

    const [jobType, companyType] = await Promise.all([
      this.jobTypeRepo.findOne({ where: { id: jobTypeId } }),
      this.companyTypeRepo.findOne({ where: { id: companyTypeId } }),
    ]);

    if (!jobType || jobType.isActive === false) {
      throw new BadRequestException('Job type is invalid or inactive');
    }

    if (!companyType || companyType.isActive === false) {
      throw new BadRequestException('Company type is invalid or inactive');
    }

    return { jobType, companyType };
  }

  /**
   * Get Website research tasks for sub-admin
   */
  async getWebsiteResearchTasks(
    userId: string,
    categoryId?: string,
    status?: ResearchStatus,
    limit = 50,
    offset = 0,
  ) {
    // Validate category access
    if (categoryId) {
      await this.validateCategoryAccess(userId, categoryId);
    }

    // Get user's assigned categories
    const userCategories = await this.userCategoryRepo.find({
      where: { userId },
      select: ['categoryId'],
    });

    if (userCategories.length === 0) {
      return { data: [], total: 0 };
    }

    const categoryIds = userCategories.map(uc => uc.categoryId);
    const filterCategoryIds = categoryId ? [categoryId] : categoryIds;

    let query = this.researchTaskRepo
      .createQueryBuilder('task')
      .leftJoin(Company, 'company', 'task.targetId::uuid = company.id')
      .leftJoin(Category, 'category', 'category.id = task.categoryId')
      .where('task.targettype = :targetType', { targetType: 'COMPANY' })
      .andWhere('task.categoryId IN (:...categoryIds)', {
        categoryIds: filterCategoryIds,
      });

    if (status) {
      query = query.andWhere('task.status = :status', { status });
    }

    const total = await query.getCount();
    const rows = await query
      .select([
        'task.id as id',
        'task.status as status',
        'task.createdAt as created_at',
        'company.domain as company_domain',
        'company.name as company_name',
        'company.country as company_country',
        'category.name as category_name',
      ])
      .orderBy('task.createdAt', 'DESC')
      .skip(offset)
      .take(limit)
      .getRawMany();

    // Transform to match frontend expectations
    const transformedTasks = rows.map((row: any) => ({
      id: row.id,
      profileUrl: row.company_domain || '',
      companyName: row.company_name || row.company_domain || 'Unknown',
      country: row.company_country || 'Unknown',
      category: row.category_name || 'Unknown',
      submittedBy: 'Researcher',
      status: (row.status || '').toLowerCase(),
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : undefined,
    }));

    return { data: transformedTasks, total };
  }

  /**
   * Get LinkedIn research tasks for sub-admin
   */
  async getLinkedInResearchTasks(
    userId: string,
    categoryId?: string,
    status?: ResearchStatus,
    limit = 50,
    offset = 0,
  ) {
    // Validate category access
    if (categoryId) {
      await this.validateCategoryAccess(userId, categoryId);
    }

    // Get user's assigned categories
    const userCategories = await this.userCategoryRepo.find({
      where: { userId },
      select: ['categoryId'],
    });

    if (userCategories.length === 0) {
      return { data: [], total: 0 };
    }

    const categoryIds = userCategories.map(uc => uc.categoryId);
    const filterCategoryIds = categoryId ? [categoryId] : categoryIds;

    let query = this.researchTaskRepo
      .createQueryBuilder('task')
      .leftJoin(LinkedInProfile, 'profile', "task.targettype = 'LINKEDIN_PROFILE' AND profile.id::text = task.targetId")
      .leftJoin(Category, 'category', 'category.id = task.categoryId')
      .where('task.targettype IN (:...targetTypes)', { targetTypes: ['LINKEDIN_PROFILE', 'LINKEDIN'] })
      .andWhere('task.categoryId IN (:...categoryIds)', {
        categoryIds: filterCategoryIds,
      });

    if (status) {
      query = query.andWhere('task.status = :status', { status });
    }

    const total = await query.getCount();
    const rows = await query
      .select([
        'task.id as id',
        'task.status as status',
        'task.createdAt as created_at',
        'profile.url as profile_url',
        'task.targetId as target_id',
        'category.name as category_name',
      ])
      .orderBy('task.createdAt', 'DESC')
      .skip(offset)
      .take(limit)
      .getRawMany();

    // Transform to match frontend expectations
    const transformedTasks = rows.map((row: any) => ({
      id: row.id,
      profileUrl: row.profile_url || row.target_id || '',
      companyName: 'LinkedIn Profile',
      country: 'N/A',
      category: row.category_name || 'Unknown',
      submittedBy: 'Researcher',
      status: (row.status || '').toLowerCase(),
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : undefined,
    }));

    return { data: transformedTasks, total };
  }

  /**
   * Get inquiry tasks for sub-admin (all platforms)
   */
  async getInquiryTasks(
    userId: string,
    categoryId?: string,
    platform?: InquiryPlatform,
    status?: InquiryStatus,
    limit = 50,
    offset = 0,
  ) {
    // Validate category access
    if (categoryId) {
      await this.validateCategoryAccess(userId, categoryId);
    }

    // Get user's assigned categories
    const userCategories = await this.userCategoryRepo.find({
      where: { userId },
      select: ['categoryId'],
    });

    if (userCategories.length === 0) {
      return { data: [], total: 0 };
    }

    const categoryIds = userCategories.map(uc => uc.categoryId);
    const filterCategoryIds = categoryId ? [categoryId] : categoryIds;

    let query = this.inquiryTaskRepo
      .createQueryBuilder('task')
      .where('task.categoryId IN (:...categoryIds)', {
        categoryIds: filterCategoryIds,
      });

    if (platform) {
      query = query.andWhere('task.platform = :platform', { platform });
    }

    if (status) {
      query = query.andWhere('task.status = :status', { status });
    }

    const total = await query.getCount();
    const tasks = await query
      .leftJoinAndSelect('task.researchTask', 'researchTask')
      .orderBy('task.createdAt', 'DESC')
      .skip(offset)
      .take(limit)
      .getMany();

    return { data: tasks, total };
  }

  /**
   * Create bulk research tasks (Website)
   */
  async createWebsiteResearchTasks(
    userId: string,
    payload: {
      categoryId: string;
      jobTypeId: string;
      companyTypeId: string;
      companyWebsite?: string;
      companyName?: string;
      country?: string;
      language?: string;
      tasks?: Array<{
        companyWebsite: string;
        companyName?: string;
        country?: string;
        language?: string;
      }>;
    },
  ) {
    const { categoryId, jobTypeId, companyTypeId } = payload;
    await this.validateCategoryAccess(userId, categoryId);
    await this.ensureTypes(jobTypeId, companyTypeId);

    const items = Array.isArray(payload.tasks) && payload.tasks.length > 0
      ? payload.tasks
      : [{
          companyWebsite: payload.companyWebsite,
          companyName: payload.companyName,
          country: payload.country,
          language: payload.language,
        }];

    if (!items.length) {
      throw new BadRequestException('At least one task is required');
    }

    const createdTasks: ResearchTask[] = [];

    for (const item of items) {
      const rawDomain = item.companyWebsite?.trim();
      if (!rawDomain) {
        throw new BadRequestException('Company website is required');
      }

      const normalizedDomain = normalizeDomain(rawDomain);
      const safeName = item.companyName?.trim() || 'Unknown';
      const safeCountry = item.country?.trim() || 'Unknown';
      const safeLanguage = item.language?.trim() || 'unknown';

      let company = await this.companyRepo.findOne({ where: { normalizedDomain } });

      if (!company) {
        company = this.companyRepo.create({
          domain: rawDomain,
          normalizedDomain,
          name: safeName,
          country: safeCountry,
        });
      } else {
        // Improve stored data when provided
        if (item.companyName && item.companyName.trim() && company.name === 'Unknown') {
          company.name = safeName;
        }
        if (item.country && item.country.trim() && company.country === 'Unknown') {
          company.country = safeCountry;
        }
      }

      company = await this.companyRepo.save(company);

      const task = this.researchTaskRepo.create({
        targetId: company.id,
        categoryId,
        targetType: 'COMPANY',
        status: ResearchStatus.PENDING,
        jobTypeId,
        companyTypeId,
        language: safeLanguage,
      });

      createdTasks.push(task);
    }

    await this.researchTaskRepo.save(createdTasks);
    return createdTasks;
  }

  /**
   * Create bulk research tasks (LinkedIn)
   */
  async createLinkedInResearchTasks(
    userId: string,
    payload: {
      categoryId: string;
      jobTypeId: string;
      companyTypeId: string;
      profileUrl?: string;
      contactName?: string;
      country?: string;
      language?: string;
      tasks?: Array<{
        profileUrl: string;
        contactName?: string;
        country?: string;
        language?: string;
      }>;
    },
  ) {
    const { categoryId, jobTypeId, companyTypeId } = payload;
    await this.validateCategoryAccess(userId, categoryId);
    await this.ensureTypes(jobTypeId, companyTypeId);

    const items = Array.isArray(payload.tasks) && payload.tasks.length > 0
      ? payload.tasks
      : [{
          profileUrl: payload.profileUrl,
          contactName: payload.contactName,
          country: payload.country,
          language: payload.language,
        }];

    if (!items.length) {
      throw new BadRequestException('At least one task is required');
    }

    const createdTasks: ResearchTask[] = [];

    for (const item of items) {
      const rawUrl = item.profileUrl?.trim();
      if (!rawUrl) {
        throw new BadRequestException('LinkedIn profile URL is required');
      }

      const normalizedUrl = normalizeLinkedInUrl(rawUrl);
      const safeName = item.contactName?.trim() || 'Unknown';
      const safeCountry = item.country?.trim() || 'Unknown';
      const safeLanguage = item.language?.trim() || 'unknown';

      let profile = await this.linkedinProfileRepo.findOne({ where: { normalizedUrl } });

      if (!profile) {
        profile = this.linkedinProfileRepo.create({
          url: rawUrl,
          normalizedUrl,
          contactName: safeName,
          country: safeCountry,
          language: safeLanguage,
        });
      } else {
        // Update only if existing data is missing
        if (profile.contactName === null || profile.contactName === undefined || profile.contactName === 'Unknown') {
          profile.contactName = safeName;
        }
        if (profile.country === null || profile.country === undefined || profile.country === 'Unknown') {
          profile.country = safeCountry;
        }
        if (profile.language === null || profile.language === undefined || profile.language === 'unknown') {
          profile.language = safeLanguage;
        }
      }

      profile = await this.linkedinProfileRepo.save(profile);

      const task = this.researchTaskRepo.create({
        targetId: profile.id,
        categoryId,
        targetType: 'LINKEDIN_PROFILE',
        status: ResearchStatus.PENDING,
        jobTypeId,
        companyTypeId,
        language: safeLanguage,
      });

      createdTasks.push(task);
    }

    await this.researchTaskRepo.save(createdTasks);
    return createdTasks;
  }

  /**
   * Create bulk inquiry tasks (Website)
   */
  async createWebsiteInquiryTasks(
    userId: string,
    categoryId: string,
    targetUrls: string[],
  ) {
    // Validate access
    await this.validateCategoryAccess(userId, categoryId);

    const tasks = [];

    for (const url of targetUrls) {
      let company = await this.companyRepo.findOne({ where: { domain: url } });

      if (!company) {
        company = this.companyRepo.create({
          domain: url,
          normalizedDomain: url.toLowerCase(),
          name: url,
          country: 'Unknown',
        });
        company = await this.companyRepo.save(company);
      }

      const task = this.inquiryTaskRepo.create({
        targetId: company.id,
        categoryId,
        status: InquiryStatus.PENDING,
        platform: InquiryPlatform.WEBSITE,
      });

      tasks.push(task);
    }

    await this.inquiryTaskRepo.save(tasks);
    return tasks;
  }

  /**
   * Create bulk inquiry tasks (LinkedIn)
   */
  async createLinkedInInquiryTasks(
    userId: string,
    categoryId: string,
    profileUrls: string[],
  ) {
    // Validate access
    await this.validateCategoryAccess(userId, categoryId);

    const tasks = [];

    for (const url of profileUrls) {
      let profile = await this.linkedinProfileRepo.findOne({ where: { url } });

      if (!profile) {
        profile = this.linkedinProfileRepo.create({
          url,
          normalizedUrl: url.toLowerCase(),
        });
        profile = await this.linkedinProfileRepo.save(profile);
      }

      const task = this.inquiryTaskRepo.create({
        targetId: profile.id,
        categoryId,
        status: InquiryStatus.PENDING,
        platform: InquiryPlatform.LINKEDIN,
      });

      tasks.push(task);
    }

    await this.inquiryTaskRepo.save(tasks);
    return tasks;
  }

  /**
   * Get research task with submission data for review
   */
  async getResearchTaskWithSubmission(
    userId: string,
    taskId: string,
  ) {
    const task = await this.researchTaskRepo.findOne({ where: { id: taskId } });

    if (!task) {
      throw new BadRequestException('Task not found');
    }

    // Validate category access
    await this.validateCategoryAccess(userId, task.categoryId);

    const submission = await this.researchSubmissionRepo.findOne({
      where: { researchTaskId: taskId },
    });

    return { task, submission };
  }

  /**
   * Get inquiry task with actions and snapshots for review
   */
  async getInquiryTaskForReview(
    userId: string,
    taskId: string,
  ) {
    const task = await this.inquiryTaskRepo.findOne({
      where: { id: taskId },
    });

    if (!task) {
      throw new BadRequestException('Task not found');
    }

    // Validate category access
    await this.validateCategoryAccess(userId, task.categoryId);

    const actions = await this.inquiryActionRepo.find({
      where: { inquiryTaskId: taskId },
      order: { createdAt: 'ASC' },
    });

    const snapshots = await this.snapshotRepo.find({
      where: { inquiryTaskId: taskId },
      order: { createdAt: 'ASC' },
    });

    // Get researcher submission for context
    let researchSubmission = null;
    if (task.researchTaskId) {
      researchSubmission = await this.researchSubmissionRepo.findOne({
        where: { researchTaskId: task.researchTaskId },
      });
    }

    return {
      task,
      researchSubmission,
      actions,
      snapshots,
    };
  }

  /**
   * Approve research task (marks as COMPLETED)
   */
  async approveResearchTask(
    userId: string,
    taskId: string,
  ): Promise<ResearchTask> {
    const task = await this.researchTaskRepo.findOne({ where: { id: taskId } });
    if (!task) throw new BadRequestException('Task not found');

    await this.validateCategoryAccess(userId, task.categoryId);

    task.status = ResearchStatus.COMPLETED;
    return await this.researchTaskRepo.save(task);
  }

  /**
   * Reject research task
   */
  async rejectResearchTask(
    userId: string,
    taskId: string,
    reason?: string,
  ): Promise<ResearchTask> {
    const task = await this.researchTaskRepo.findOne({ where: { id: taskId } });
    if (!task) throw new BadRequestException('Task not found');

    await this.validateCategoryAccess(userId, task.categoryId);

    task.status = ResearchStatus.REJECTED;
    return await this.researchTaskRepo.save(task);
  }

  /**
   * Flag research task (marks as IN_PROGRESS for review)
   */
  async flagResearchTask(
    userId: string,
    taskId: string,
    reason?: string,
  ): Promise<ResearchTask> {
    const task = await this.researchTaskRepo.findOne({ where: { id: taskId } });
    if (!task) throw new BadRequestException('Task not found');

    await this.validateCategoryAccess(userId, task.categoryId);

    // Flag by moving back to SUBMITTED state or keeping track via a separate mechanism
    // For now, use SUBMITTED to indicate flagged for review
    task.status = ResearchStatus.SUBMITTED;
    return await this.researchTaskRepo.save(task);
  }

  /**
   * Approve inquiry task
   */
  async approveInquiryTask(
    userId: string,
    taskId: string,
  ): Promise<InquiryTask> {
    const task = await this.inquiryTaskRepo.findOne({ where: { id: taskId } });
    if (!task) throw new BadRequestException('Task not found');

    await this.validateCategoryAccess(userId, task.categoryId);

    task.status = InquiryStatus.APPROVED;
    return await this.inquiryTaskRepo.save(task);
  }

  /**
   * Reject inquiry task
   */
  async rejectInquiryTask(
    userId: string,
    taskId: string,
    reason?: string,
  ): Promise<InquiryTask> {
    const task = await this.inquiryTaskRepo.findOne({ where: { id: taskId } });
    if (!task) throw new BadRequestException('Task not found');

    await this.validateCategoryAccess(userId, task.categoryId);

    task.status = InquiryStatus.REJECTED;
    return await this.inquiryTaskRepo.save(task);
  }

  /**
   * Flag inquiry task
   */
  async flagInquiryTask(
    userId: string,
    taskId: string,
    reason?: string,
  ): Promise<InquiryTask> {
    const task = await this.inquiryTaskRepo.findOne({ where: { id: taskId } });
    if (!task) throw new BadRequestException('Task not found');

    await this.validateCategoryAccess(userId, task.categoryId);

    task.status = InquiryStatus.FLAGGED;
    return await this.inquiryTaskRepo.save(task);
  }

  /**
   * Get all pending research tasks across categories for sub-admin
   */
  async getPendingResearchTasks(
    userId: string,
    limit = 50,
    offset = 0,
  ) {
    const userCategories = await this.userCategoryRepo.find({
      where: { userId },
      select: ['categoryId'],
    });

    if (userCategories.length === 0) {
      return { data: [], total: 0 };
    }

    const categoryIds = userCategories.map(uc => uc.categoryId);

    const query = this.researchTaskRepo
      .createQueryBuilder('task')
      .where('task.categoryId IN (:...categoryIds)', { categoryIds })
      .andWhere('task.status = :status', { status: ResearchStatus.PENDING });

    const total = await query.getCount();
    const rows = await query
      .leftJoin(Company, 'company', 'task.targettype = :companyType AND task.targetId::uuid = company.id', {
        companyType: 'COMPANY',
      })
      .leftJoin(LinkedInProfile, 'profile', 'task.targettype = :linkedinType AND task.targetId::uuid = profile.id', {
        linkedinType: 'LINKEDIN_PROFILE',
      })
      .leftJoin(Category, 'category', 'category.id = task.categoryId')
      .select([
        'task.id as id',
        'task.status as status',
        'task.targettype as target_type',
        'task.createdAt as created_at',
        'category.name as category_name',
        'company.domain as company_domain',
        'company.country as company_country',
        'profile.url as profile_url',
      ])
      .orderBy('task.createdAt', 'ASC')
      .skip(offset)
      .take(limit)
      .getRawMany();

    const data = rows.map((row: any) => ({
      id: row.id,
      target: row.target_type === 'LINKEDIN_PROFILE' ? row.profile_url || 'LinkedIn profile' : row.company_domain || 'Website',
      source: row.target_type === 'LINKEDIN_PROFILE' ? 'linkedin' : 'website',
      status: (row.status || '').toLowerCase(),
      category: row.category_name || 'Unknown',
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : undefined,
    }));

    return { data, total };
  }

  /**
   * Get all pending inquiry tasks across categories for sub-admin
   */
  async getPendingInquiryTasks(
    userId: string,
    limit = 50,
    offset = 0,
  ) {
    const userCategories = await this.userCategoryRepo.find({
      where: { userId },
      select: ['categoryId'],
    });

    if (userCategories.length === 0) {
      return { data: [], total: 0 };
    }

    const categoryIds = userCategories.map(uc => uc.categoryId);

    const query = this.inquiryTaskRepo
      .createQueryBuilder('task')
      .where('task.categoryId IN (:...categoryIds)', { categoryIds })
      .andWhere('task.status = :status', { status: InquiryStatus.PENDING });

    const total = await query.getCount();
    const rows = await query
      .leftJoin(Category, 'category', 'category.id = task.categoryId')
      .leftJoin(Company, 'company', 'task.platform = :web AND task.targetId::uuid = company.id', {
        web: InquiryPlatform.WEBSITE,
      })
      .leftJoin(LinkedInProfile, 'profile', 'task.platform = :li AND task.targetId::uuid = profile.id', {
        li: InquiryPlatform.LINKEDIN,
      })
      .leftJoin(ResearchTask, 'researchTask', 'researchTask.id = task.researchTaskId')
      .select([
        'task.id as id',
        'task.status as status',
        'task.platform as platform',
        'task.assignedToUserId as assigned_to',
        'task.createdAt as created_at',
        'category.name as category_name',
        'company.domain as company_domain',
        'profile.url as profile_url',
        'researchTask.status as research_status',
      ])
      .orderBy('task.createdAt', 'ASC')
      .skip(offset)
      .take(limit)
      .getRawMany();

    const data = rows.map((row: any) => {
      const isLinkedIn = row.platform === InquiryPlatform.LINKEDIN;
      return {
        id: row.id,
        channel: isLinkedIn ? 'linkedin' : 'website',
        target: isLinkedIn ? row.profile_url || 'LinkedIn profile' : row.company_domain || 'Website',
        category: row.category_name || 'Unknown',
        status: (row.status || '').toLowerCase(),
        worker: row.assigned_to || 'Unassigned',
        researchStatus: row.research_status || null,
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : undefined,
      };
    });

    return { data, total };
  }

  /**
   * Get dashboard statistics for sub-admin
   */
  async getStats(userId: string) {
    const userCategories = await this.userCategoryRepo.find({
      where: { userId },
      select: ['categoryId'],
    });

    if (userCategories.length === 0) {
      return {
        totalSubmissions: 0,
        pendingSubmissions: 0,
        approved: 0,
        rejected: 0,
        flagged: 0,
        categoriesCovered: 0,
        actionsRequiringApproval: 0,
      };
    }

    const categoryIds = userCategories.map(uc => uc.categoryId);

    // Count research tasks by status
    const researchStats = await this.researchTaskRepo
      .createQueryBuilder('task')
      .select('task.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('task.categoryId IN (:...categoryIds)', { categoryIds })
      .groupBy('task.status')
      .getRawMany();

    // Count inquiry tasks by status
    const inquiryStats = await this.inquiryTaskRepo
      .createQueryBuilder('task')
      .select('task.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('task.categoryId IN (:...categoryIds)', { categoryIds })
      .groupBy('task.status')
      .getRawMany();

    // Calculate totals
    let approved = 0;
    let rejected = 0;
    let flagged = 0;
    let totalResearch = 0;
    let totalInquiry = 0;
    let pendingResearch = 0;
    let pendingInquiry = 0;

    researchStats.forEach(stat => {
      const count = parseInt(stat.count);
      totalResearch += count;
      if (stat.status === ResearchStatus.COMPLETED) approved += count;
      if (stat.status === ResearchStatus.REJECTED) rejected += count;
      if (stat.status === ResearchStatus.SUBMITTED) flagged += count; // SUBMITTED means flagged for research
      if (stat.status === ResearchStatus.PENDING) pendingResearch += count;
    });

    inquiryStats.forEach(stat => {
      const count = parseInt(stat.count);
      totalInquiry += count;
      if (stat.status === InquiryStatus.APPROVED) approved += count;
      if (stat.status === InquiryStatus.REJECTED) rejected += count;
      if (stat.status === InquiryStatus.FLAGGED) flagged += count;
      if (stat.status === InquiryStatus.PENDING) pendingInquiry += count;
    });

    const totalSubmissions = totalResearch + totalInquiry;
    const pendingSubmissions = pendingResearch + pendingInquiry;

    return {
      totalSubmissions,
      pendingSubmissions,
      approved,
      rejected,
      flagged,
      categoriesCovered: categoryIds.length,
      actionsRequiringApproval: pendingSubmissions,
    };
  }

  /**
   * Get alerts for sub-admin
   */
  async getAlerts(userId: string, limit = 8) {
    const userCategories = await this.userCategoryRepo.find({
      where: { userId },
      select: ['categoryId'],
    });

    if (userCategories.length === 0) {
      return [];
    }

    const categoryIds = userCategories.map(uc => uc.categoryId);
    const alerts = [];

    // Get recently rejected research tasks
    const rejectedResearch = await this.researchTaskRepo
      .createQueryBuilder('task')
      .where('task.categoryId IN (:...categoryIds)', { categoryIds })
      .andWhere('task.status = :status', { status: ResearchStatus.REJECTED })
      .orderBy('task.createdAt', 'DESC')
      .take(Math.ceil(limit / 2))
      .getMany();

    rejectedResearch.forEach((task, index) => {
      alerts.push({
        id: `research-rejected-${task.id}`,
        level: 'high',
        title: 'Research Task Rejected',
        message: `Research task for ${task.targetId} was rejected`,
        timestamp: new Date(task.createdAt).toISOString(),
      });
    });

    // Get recently rejected inquiry tasks
    const rejectedInquiry = await this.inquiryTaskRepo
      .createQueryBuilder('task')
      .where('task.categoryId IN (:...categoryIds)', { categoryIds })
      .andWhere('task.status = :status', { status: InquiryStatus.REJECTED })
      .orderBy('task.createdAt', 'DESC')
      .take(Math.ceil(limit / 2))
      .getMany();

    rejectedInquiry.forEach((task, index) => {
      alerts.push({
        id: `inquiry-rejected-${task.id}`,
        level: 'high',
        title: 'Inquiry Task Rejected',
        message: `Inquiry task for ${task.targetId} was rejected`,
        timestamp: new Date(task.createdAt).toISOString(),
      });
    });

    // Sort by timestamp descending and limit
    alerts.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return alerts.slice(0, limit);
  }

  /**
   * Get queued actions for sub-admin
   */
  async getQueuedActions(userId: string, limit = 10) {
    const userCategories = await this.userCategoryRepo.find({
      where: { userId },
      select: ['categoryId'],
    });

    if (userCategories.length === 0) {
      return [];
    }

    const categoryIds = userCategories.map(uc => uc.categoryId);
    const actions = [];

    // Get pending research tasks
    const pendingResearch = await this.researchTaskRepo
      .createQueryBuilder('task')
      .where('task.categoryId IN (:...categoryIds)', { categoryIds })
      .andWhere('task.status = :status', { status: ResearchStatus.PENDING })
      .orderBy('task.createdAt', 'ASC')
      .take(Math.ceil(limit / 2))
      .getMany();

    pendingResearch.forEach(task => {
      actions.push({
        id: task.id,
        type: 'RESEARCH',
        title: `Research: ${task.targetId}`,
        categoryId: task.categoryId,
        createdAt: new Date(task.createdAt).toISOString(),
      });
    });

    // Get pending inquiry tasks
    const pendingInquiry = await this.inquiryTaskRepo
      .createQueryBuilder('task')
      .where('task.categoryId IN (:...categoryIds)', { categoryIds })
      .andWhere('task.status = :status', { status: InquiryStatus.PENDING })
      .orderBy('task.createdAt', 'ASC')
      .take(Math.ceil(limit / 2))
      .getMany();

    pendingInquiry.forEach(task => {
      actions.push({
        id: task.id,
        type: 'INQUIRY',
        title: `Inquiry: ${task.targetId}`,
        categoryId: task.categoryId,
        createdAt: new Date(task.createdAt).toISOString(),
      });
    });

    // Sort by creation time ascending (oldest first) and limit
    actions.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    return actions.slice(0, limit);
  }

  /**
   * Get top categories by activity
   */
  async getTopCategories(userId: string, limit = 6) {
    const userCategories = await this.userCategoryRepo.find({
      where: { userId },
      relations: ['category'],
      select: ['categoryId'],
    });

    if (userCategories.length === 0) {
      return [];
    }

    const categoryIds = userCategories.map(uc => uc.categoryId);

    // Count tasks by category
    const taskCounts = await this.researchTaskRepo
      .createQueryBuilder('task')
      .select('task.categoryId', 'categoryId')
      .addSelect('COUNT(*)', 'taskCount')
      .where('task.categoryId IN (:...categoryIds)', { categoryIds })
      .groupBy('task.categoryId')
      .getRawMany();

    // Count completed by category
    const completedCounts = await this.researchTaskRepo
      .createQueryBuilder('task')
      .select('task.categoryId', 'categoryId')
      .addSelect('COUNT(*)', 'completedCount')
      .where('task.categoryId IN (:...categoryIds)', { categoryIds })
      .andWhere('task.status = :status', { status: ResearchStatus.COMPLETED })
      .groupBy('task.categoryId')
      .getRawMany();

    // Merge and calculate completion rate
    const results = await Promise.all(
      taskCounts.map(async (tc) => {
        const category = await this.categoryRepo.findOne({
          where: { id: tc.categoryId },
        });

        const completed = completedCounts.find(cc => cc.categoryId === tc.categoryId);
        const completionRate = parseInt(tc.taskCount) > 0 
          ? Math.round((parseInt(completed?.completedCount || 0) / parseInt(tc.taskCount)) * 100)
          : 0;

        return {
          categoryId: tc.categoryId,
          categoryName: category?.name || 'Unknown',
          taskCount: parseInt(tc.taskCount),
          completionRate,
        };
      })
    );

    // Sort by task count descending
    results.sort((a, b) => b.taskCount - a.taskCount);

    return results.slice(0, limit);
  }

  /**
   * Get performance statistics for sub-admin
   */
  async getPerformanceStats(userId: string, period: string) {
    const userCategories = await this.userCategoryRepo.find({
      where: { userId },
      select: ['categoryId'],
    });

    if (userCategories.length === 0) {
      return {
        totalActions: 0,
        approved: 0,
        rejected: 0,
        avgReviewTimeMinutes: 0,
        researchCount: 0,
        inquiryCount: 0,
      };
    }

    const categoryIds = userCategories.map(uc => uc.categoryId);

    // Count research tasks
    const researchCount = await this.researchTaskRepo
      .createQueryBuilder('task')
      .where('task.categoryId IN (:...categoryIds)', { categoryIds })
      .getCount();

    const approvedResearch = await this.researchTaskRepo
      .createQueryBuilder('task')
      .where('task.categoryId IN (:...categoryIds)', { categoryIds })
      .andWhere('task.status = :status', { status: ResearchStatus.COMPLETED })
      .getCount();

    const rejectedResearch = await this.researchTaskRepo
      .createQueryBuilder('task')
      .where('task.categoryId IN (:...categoryIds)', { categoryIds })
      .andWhere('task.status = :status', { status: ResearchStatus.REJECTED })
      .getCount();

    // Count inquiry tasks
    const inquiryCount = await this.inquiryTaskRepo
      .createQueryBuilder('task')
      .where('task.categoryId IN (:...categoryIds)', { categoryIds })
      .getCount();

    const approvedInquiry = await this.inquiryTaskRepo
      .createQueryBuilder('task')
      .where('task.categoryId IN (:...categoryIds)', { categoryIds })
      .andWhere('task.status = :status', { status: InquiryStatus.APPROVED })
      .getCount();

    const rejectedInquiry = await this.inquiryTaskRepo
      .createQueryBuilder('task')
      .where('task.categoryId IN (:...categoryIds)', { categoryIds })
      .andWhere('task.status = :status', { status: InquiryStatus.REJECTED })
      .getCount();

    const totalActions = researchCount + inquiryCount;
    const approved = approvedResearch + approvedInquiry;
    const rejected = rejectedResearch + rejectedInquiry;

    return {
      totalActions,
      approved,
      rejected,
      avgReviewTimeMinutes: 0, // Can be calculated based on timestamps if needed
      researchCount,
      inquiryCount,
    };
  }

  /**
   * Get top workers by performance
   */
  async getTopWorkers(userId: string, period: string) {
    // For now, return empty array
    // This would require tracking which sub-admin reviewed which tasks
    return [];
  }

  // ========= COMPANY TYPES CRUD =========

  async getCompanyTypes() {
    return await this.companyTypeRepo.find({ order: { name: 'ASC' } });
  }

  async createCompanyType(data: { name: string; description?: string }) {
    const existing = await this.companyTypeRepo.findOne({ where: { name: data.name } });
    if (existing) {
      throw new BadRequestException('Company type with this name already exists');
    }

    const companyType = this.companyTypeRepo.create(data);
    return await this.companyTypeRepo.save(companyType);
  }

  async updateCompanyType(id: string, data: { name?: string; description?: string; isActive?: boolean }) {
    const companyType = await this.companyTypeRepo.findOne({ where: { id } });
    if (!companyType) {
      throw new BadRequestException('Company type not found');
    }

    if (data.name && data.name !== companyType.name) {
      const existing = await this.companyTypeRepo.findOne({ where: { name: data.name } });
      if (existing) {
        throw new BadRequestException('Company type with this name already exists');
      }
    }

    Object.assign(companyType, data);
    return await this.companyTypeRepo.save(companyType);
  }

  // ========= JOB TYPES CRUD =========

  async getJobTypes() {
    return await this.jobTypeRepo.find({ order: { name: 'ASC' } });
  }

  async createJobType(data: { name: string; description?: string }) {
    const existing = await this.jobTypeRepo.findOne({ where: { name: data.name } });
    if (existing) {
      throw new BadRequestException('Job type with this name already exists');
    }

    const jobType = this.jobTypeRepo.create(data);
    return await this.jobTypeRepo.save(jobType);
  }

  async updateJobType(id: string, data: { name?: string; description?: string; isActive?: boolean }) {
    const jobType = await this.jobTypeRepo.findOne({ where: { id } });
    if (!jobType) {
      throw new BadRequestException('Job type not found');
    }

    if (data.name && data.name !== jobType.name) {
      const existing = await this.jobTypeRepo.findOne({ where: { name: data.name } });
      if (existing) {
        throw new BadRequestException('Job type with this name already exists');
      }
    }

    Object.assign(jobType, data);
    return await this.jobTypeRepo.save(jobType);
  }

  // ========= DISAPPROVAL REASONS CRUD =========

  async getDisapprovalReasons() {
    return await this.disapprovalReasonRepo.find({ order: { reason: 'ASC' } });
  }

  async createDisapprovalReason(data: { reason: string; description?: string; applicableTo: 'research' | 'inquiry' | 'both' }) {
    const disapprovalReason = this.disapprovalReasonRepo.create(data);
    return await this.disapprovalReasonRepo.save(disapprovalReason);
  }

  async updateDisapprovalReason(id: string, data: { reason?: string; description?: string; applicableTo?: 'research' | 'inquiry' | 'both'; isActive?: boolean }) {
    const disapprovalReason = await this.disapprovalReasonRepo.findOne({ where: { id } });
    if (!disapprovalReason) {
      throw new BadRequestException('Disapproval reason not found');
    }

    Object.assign(disapprovalReason, data);
    return await this.disapprovalReasonRepo.save(disapprovalReason);
  }
}
