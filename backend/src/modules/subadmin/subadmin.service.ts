import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
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
import { CategoryRule } from '../category-rules/entities/category-rule.entity';
import { Role } from '../roles/entities/role.entity';
import { UserRole } from '../roles/entities/user-role.entity';
import * as bcrypt from 'bcrypt';
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
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(UserRole)
    private readonly userRoleRepo: Repository<UserRole>,
    @InjectRepository(CompanyType)
    private readonly companyTypeRepo: Repository<CompanyType>,
    @InjectRepository(JobType)
    private readonly jobTypeRepo: Repository<JobType>,
    @InjectRepository(DisapprovalReason)
    private readonly disapprovalReasonRepo: Repository<DisapprovalReason>,
    @InjectRepository(CategoryRule)
    private readonly categoryRuleRepo: Repository<CategoryRule>,
  ) {}

  /**
   * Get categories assigned to sub-admin
   */
  async getUserCategories(userId: string, userRole?: string): Promise<Category[]> {
    console.log(`[getUserCategories] START - userId: ${userId}, role: ${userRole}`);
    
    // Super admin sees ALL categories
    if (userRole === 'super_admin') {
      const allCategories = await this.categoryRepo.find({
        where: { isActive: true },
      });
      console.log(`[getUserCategories] SUPER_ADMIN - Returning ${allCategories.length} active categories`);
      return allCategories;
    }
    
    console.log(`[getUserCategories] userId type: ${typeof userId}`);
    console.log(`[getUserCategories] userId valid: ${!!userId && userId !== 'undefined' && userId !== 'null'}`);
    
    if (!userId || userId === 'undefined' || userId === 'null') {
      console.error(`[getUserCategories] ERROR: Invalid userId: ${userId}`);
      throw new Error('Invalid userId');
    }
    
    // First, let's verify the count
    const totalUserCategories = await this.userCategoryRepo.find();
    console.log(`[getUserCategories] Total user_categories in DB: ${totalUserCategories.length}`);
    
    // Now filter by userId
    const userCategories = await this.userCategoryRepo.find({
      where: { userId },
      relations: ['category'],
    });

    console.log(`[getUserCategories] Query result - Found ${userCategories.length} user_category records for userId ${userId}`);
    if (userCategories.length > 0) {
      console.log(`[getUserCategories] Raw records:`, userCategories.map(uc => ({
        id: uc.id,
        userId: uc.userId,
        categoryId: uc.categoryId,
        categoryName: uc.category?.name,
        isActive: uc.category?.isActive,
      })));
    }
    
    const categories = userCategories
      .map(uc => uc.category)
      .filter(c => c && c.isActive !== false);
    
    console.log(`[getUserCategories] RESULT - Returning ${categories.length} active categories:`, categories.map(c => ({ id: c.id, name: c.name })));
    
    return categories;
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
   * Get users who are assigned to any of the subadmin's categories
   * Returns unique users with their roles and categories
   */
  async getUsersInMyCategories(subAdminUserId: string): Promise<any[]> {
    console.log('[getUsersInMyCategories] START - subAdminUserId:', subAdminUserId);

    // Get subadmin's categories
    const subAdminCategories = await this.userCategoryRepo.find({
      where: { userId: subAdminUserId },
      select: ['categoryId'],
    });

    if (subAdminCategories.length === 0) {
      console.log('[getUsersInMyCategories] Subadmin has no categories assigned');
      return [];
    }

    const categoryIds = subAdminCategories.map(uc => uc.categoryId);
    console.log('[getUsersInMyCategories] Subadmin categories:', categoryIds);

    // Get all user_categories records that match these categories
    const userCategoriesInMyCategories = await this.userCategoryRepo
      .createQueryBuilder('uc')
      .where('uc.categoryId IN (:...categoryIds)', { categoryIds })
      .andWhere('uc.userId != :subAdminUserId', { subAdminUserId }) // Exclude the subadmin themselves
      .leftJoinAndSelect('uc.category', 'category')
      .getMany();

    // Get unique user IDs
    const userIds = [...new Set(userCategoriesInMyCategories.map(uc => uc.userId))];
    console.log('[getUsersInMyCategories] Found', userIds.length, 'unique users');

    if (userIds.length === 0) {
      return [];
    }

    // Fetch full user details with roles
    const users = await this.userRepo
      .createQueryBuilder('user')
      .where('user.id IN (:...userIds)', { userIds })
      .leftJoinAndSelect('user.roles', 'role')
      .getMany();

    // Enrich with categories
    const enrichedUsers = users.map(user => {
      const userCategories = userCategoriesInMyCategories
        .filter(uc => uc.userId === user.id)
        .map(uc => ({
          id: uc.categoryId,
          name: uc.category?.name || 'Unknown',
        }));

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status,
        createdAt: user.createdAt,
        roles: user.roles?.map(r => r.role) || [],
        categories: userCategories,
        categoryCount: userCategories.length,
      };
    });

    console.log('[getUsersInMyCategories] Returning', enrichedUsers.length, 'enriched users');
    return enrichedUsers;
  }

  /**
   * Helper: ensure sub-admin shares at least one category with target user
   */
  private async ensureUserInMyCategories(subAdminUserId: string, targetUserId: string) {
    const myCategories = await this.userCategoryRepo.find({
      where: { userId: subAdminUserId },
      select: ['categoryId'],
    });

    if (myCategories.length === 0) {
      throw new ForbiddenException('You have no categories assigned');
    }

    const categoryIds = myCategories.map(c => c.categoryId);
    const shared = await this.userCategoryRepo.findOne({
      where: { userId: targetUserId, categoryId: In(categoryIds) },
    });

    if (!shared) {
      throw new ForbiddenException('User is not in your categories');
    }
  }

  /**
   * Get users limited to sub-admin categories with pagination and filters
   */
  async getUsersInMyCategoriesPaginated(
    subAdminUserId: string,
    params: { page: number; limit: number; search?: string; role?: string; status?: string },
  ) {
    const { page = 1, limit = 10, search = '', role = '', status = '' } = params;

    const myCategories = await this.userCategoryRepo.find({
      where: { userId: subAdminUserId },
      select: ['categoryId'],
    });

    if (myCategories.length === 0) {
      return { users: [], total: 0, page, limit, totalPages: 0 };
    }

    const categoryIds = myCategories.map(c => c.categoryId);
    const qb = this.userRepo
      .createQueryBuilder('user')
      .innerJoin(UserCategory, 'uc', 'uc.userId = user.id')
      .leftJoinAndSelect('user.roles', 'ur')
      .leftJoinAndSelect('ur.role', 'role')
      .where('uc.categoryId IN (:...categoryIds)', { categoryIds })
      .andWhere('user.id != :subAdminUserId', { subAdminUserId })
      .distinct(true);

    if (search) {
      qb.andWhere(
        '(user.name ILIKE :search OR user.email ILIKE :search OR CAST(user.id AS TEXT) ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (role) {
      qb.andWhere('role.name = :role', { role });
    }

    if (status) {
      qb.andWhere('user.status = :status', { status });
    }

    qb.orderBy('user.createdAt', 'DESC');

    const [users, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();

    const formatted = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.roles?.[0]?.role?.name || 'No Role',
      status: user.status || 'active',
      createdAt: user.createdAt,
      updatedAt: user.createdAt,
    }));

    return {
      users: formatted,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUsersStatsInMyCategories(subAdminUserId: string) {
    const myCategories = await this.userCategoryRepo.find({
      where: { userId: subAdminUserId },
      select: ['categoryId'],
    });

    if (myCategories.length === 0) {
      return { totalUsers: 0, activeUsers: 0, suspendedUsers: 0 };
    }

    const categoryIds = myCategories.map(c => c.categoryId);

    const baseQb = this.userRepo
      .createQueryBuilder('user')
      .innerJoin(UserCategory, 'uc', 'uc.userId = user.id')
      .where('uc.categoryId IN (:...categoryIds)', { categoryIds })
      .andWhere('user.id != :subAdminUserId', { subAdminUserId });

    const totalUsers = await baseQb.getCount();
    const activeUsers = await baseQb.clone().andWhere('user.status = :s', { s: 'active' }).getCount();
    const suspendedUsers = await baseQb.clone().andWhere('user.status = :s', { s: 'suspended' }).getCount();

    return { totalUsers, activeUsers, suspendedUsers };
  }

  async updateUserStatusBySubAdmin(subAdminUserId: string, targetUserId: string, status: string) {
    if (!['active', 'suspended'].includes(status)) {
      throw new BadRequestException('Invalid status');
    }

    await this.ensureUserInMyCategories(subAdminUserId, targetUserId);
    await this.userRepo.update(targetUserId, { status: status as 'active' | 'suspended' });
    return { success: true };
  }

  async resetUserPasswordBySubAdmin(subAdminUserId: string, targetUserId: string, newPassword?: string) {
    await this.ensureUserInMyCategories(subAdminUserId, targetUserId);

    const user = await this.userRepo.findOne({ where: { id: targetUserId } });
    if (!user) throw new NotFoundException('User not found');

    if (newPassword) {
      user.password_hash = await bcrypt.hash(newPassword, 10);
      await this.userRepo.save(user);
      return { success: true, message: 'Password updated successfully' };
    }

    return { success: true, message: 'Password reset email sent' };
  }

  async updateUserProfileBySubAdmin(
    subAdminUserId: string,
    targetUserId: string,
    payload: { name?: string; role?: string },
  ) {
    await this.ensureUserInMyCategories(subAdminUserId, targetUserId);

    const user = await this.userRepo.findOne({ where: { id: targetUserId }, relations: ['roles', 'roles.role'] });
    if (!user) throw new NotFoundException('User not found');

    if (payload.name && payload.name.trim().length > 0) {
      user.name = payload.name.trim();
    }

    if (payload.role) {
      if (['super_admin', 'sub_admin'].includes(payload.role)) {
        throw new ForbiddenException('Not allowed to assign this role');
      }

      const roleEntity = await this.roleRepo.findOne({ where: { name: payload.role } });
      if (!roleEntity) {
        throw new BadRequestException('Invalid role');
      }

      await this.userRoleRepo.delete({ userId: user.id });
      await this.userRoleRepo.save({ userId: user.id, roleId: roleEntity.id });
    }

    await this.userRepo.save(user);
    return { success: true };
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

    // Get user's assigned categories - check both tables (for sub-admins and workers)
    let subAdminCats = await this.userCategoryRepo.find({
      where: { userId },
      select: ['categoryId'],
    });

    let userCats = await this.userCategoryRepo.find({
      where: { userId },
      select: ['categoryId'],
    });

    const allCategoryIds = [
      ...subAdminCats.map(sac => sac.categoryId),
      ...userCats.map(uc => uc.categoryId),
    ];

    // Remove duplicates
    const categoryIds = [...new Set(allCategoryIds)];

    if (categoryIds.length === 0) {
      return { data: [], total: 0 };
    }

    const filterCategoryIds = categoryId ? [categoryId] : categoryIds;

    // Build WHERE clause for category filtering
    const categoryPlaceholders = filterCategoryIds.map((_, idx) => `$${idx + 2}`).join(',');

    // Use raw SQL for count
    let countQuery = `
      SELECT COUNT(*)::integer as count
      FROM research_tasks t
      WHERE t.targettype = $1
      AND t."categoryId" IN (${categoryPlaceholders})
    `;
    let countParams: any[] = ['COMPANY', ...filterCategoryIds];

    if (status) {
      countQuery += ` AND t.status = $${filterCategoryIds.length + 2}`;
      countParams.push(status);
    }

    const countResult = await this.researchTaskRepo.query(countQuery, countParams);
    const total = countResult[0]?.count || 0;

    // Get data using raw query
    let dataQuery = `
      SELECT 
        t.id,
        t.status,
        t."createdAt",
        c.name as "companyName",
        c.domain as "companyDomain",
        c.country as country,
        cat.name as "categoryName"
      FROM research_tasks t
      LEFT JOIN companies c ON c.id::text = t."targetId"
      LEFT JOIN categories cat ON cat.id::text = t."categoryId"
      WHERE t.targettype = $1
      AND t."categoryId" IN (${categoryPlaceholders})
    `;
    let dataParams: any[] = ['COMPANY', ...filterCategoryIds];
    let paramIndex = filterCategoryIds.length + 2;

    if (status) {
      dataQuery += ` AND t.status = $${paramIndex}`;
      dataParams.push(status);
      paramIndex++;
    }

    dataQuery += ` ORDER BY t."createdAt" DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    dataParams.push(limit, offset);

    const rawTasks = await this.researchTaskRepo.query(dataQuery, dataParams);

    // Transform to match frontend expectations
    const transformedTasks = rawTasks.map((task: any) => ({
      id: task.id,
      profileUrl: task.companyDomain || '',
      companyName: task.companyName || task.companyDomain || 'Unknown',
      country: task.country || 'Unknown',
      category: task.categoryName || 'Unknown',
      submittedBy: 'Researcher',
      status: (task.status || '').toLowerCase(),
      createdAt: task.createdAt ? new Date(task.createdAt).toISOString() : undefined,
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

    // Get user's assigned categories - check both tables (for sub-admins and workers)
    let subAdminCats = await this.userCategoryRepo.find({
      where: { userId },
      select: ['categoryId'],
    });

    let userCats = await this.userCategoryRepo.find({
      where: { userId },
      select: ['categoryId'],
    });

    const allCategoryIds = [
      ...subAdminCats.map(sac => sac.categoryId),
      ...userCats.map(uc => uc.categoryId),
    ];

    // Remove duplicates
    const categoryIds = [...new Set(allCategoryIds)];

    if (categoryIds.length === 0) {
      return { data: [], total: 0 };
    }

    const filterCategoryIds = categoryId ? [categoryId] : categoryIds;

    // Build WHERE clause for category filtering
    const categoryPlaceholders = filterCategoryIds.map((_, idx) => `$${idx + 2}`).join(',');

    // Use raw SQL for count
    let countQuery = `
      SELECT COUNT(*)::integer as count
      FROM research_tasks t
      WHERE t.targettype = $1
      AND t."categoryId" IN (${categoryPlaceholders})
    `;
    let countParams: any[] = ['LINKEDIN_PROFILE', ...filterCategoryIds];

    if (status) {
      countQuery += ` AND t.status = $${filterCategoryIds.length + 2}`;
      countParams.push(status);
    }

    const countResult = await this.researchTaskRepo.query(countQuery, countParams);
    const total = countResult[0]?.count || 0;

    // Get data using raw query
    let dataQuery = `
      SELECT 
        t.id,
        t.status,
        t."createdAt",
        p.contact_name as "profileName",
        p.url as "profileUrl",
        p.country,
        cat.name as "categoryName"
      FROM research_tasks t
      LEFT JOIN linkedin_profiles p ON p.id::text = t."targetId"
      LEFT JOIN categories cat ON cat.id::text = t."categoryId"
      WHERE t.targettype = $1
      AND t."categoryId" IN (${categoryPlaceholders})
    `;
    let dataParams: any[] = ['LINKEDIN_PROFILE', ...filterCategoryIds];
    let paramIndex = filterCategoryIds.length + 2;

    if (status) {
      dataQuery += ` AND t.status = $${paramIndex}`;
      dataParams.push(status);
      paramIndex++;
    }

    dataQuery += ` ORDER BY t."createdAt" DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    dataParams.push(limit, offset);

    const rawTasks = await this.researchTaskRepo.query(dataQuery, dataParams);

    // Transform to match frontend expectations
    const transformedTasks = rawTasks.map((task: any) => ({
      id: task.id,
      profileUrl: task.profileUrl || '',
      profileName: task.profileName || 'LinkedIn Profile',
      country: task.country || 'Unknown',
      category: task.categoryName || 'Unknown',
      categoryName: task.categoryName || 'Unknown',
      status: (task.status || '').toLowerCase(),
      createdAt: task.createdAt ? new Date(task.createdAt).toISOString() : undefined,
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

    // Get user's assigned categories - check both tables (for sub-admins and workers)
    let subAdminCats = await this.userCategoryRepo.find({
      where: { userId },
      select: ['categoryId'],
    });

    let userCats = await this.userCategoryRepo.find({
      where: { userId },
      select: ['categoryId'],
    });

    const allCategoryIds = [
      ...subAdminCats.map(sac => sac.categoryId),
      ...userCats.map(uc => uc.categoryId),
    ];

    // Remove duplicates
    const categoryIds = [...new Set(allCategoryIds)];

    if (categoryIds.length === 0) {
      return { data: [], total: 0 };
    }

    const filterCategoryIds = categoryId ? [categoryId] : categoryIds;

    // Build WHERE clause for category filtering
    const categoryPlaceholders = filterCategoryIds.map((_, idx) => `$${idx + 1}`).join(',');

    // Use raw SQL for count
    let countQuery = `
      SELECT COUNT(*)::integer as count
      FROM inquiry_tasks t
      WHERE t."categoryId" IN (${categoryPlaceholders})
    `;
    let countParams: any[] = [...filterCategoryIds];
    let paramIndex = filterCategoryIds.length + 1;

    if (platform) {
      countQuery += ` AND t.platform = $${paramIndex}`;
      countParams.push(platform);
      paramIndex++;
    }

    if (status) {
      countQuery += ` AND t.status = $${paramIndex}`;
      countParams.push(status);
      paramIndex++;
    }

    const countResult = await this.inquiryTaskRepo.query(countQuery, countParams);
    const total = countResult[0]?.count || 0;

    // Get data using raw query - join through research_tasks for proper data access
    let dataQuery = `
      SELECT 
        t.id,
        t.status,
        t.platform,
        t."createdAt",
        t."assignedToUserId",
        t.research_task_id as "researchTaskId",
        c.name as "companyName",
        c.domain as "companyDomain",
        c.country as country,
        p.contact_name as "profileName",
        p.url as "profileUrl",
        cat.name as "categoryName",
        rt.status as "researchTaskStatus"
      FROM inquiry_tasks t
      LEFT JOIN research_tasks rt ON rt.id = t.research_task_id
      LEFT JOIN companies c ON c.id::text = rt."targetId" AND rt.targettype = 'COMPANY'
      LEFT JOIN linkedin_profiles p ON p.id::text = rt."targetId" AND rt.targettype = 'LINKEDIN_PROFILE'
      LEFT JOIN categories cat ON cat.id::text = t."categoryId"
      WHERE t."categoryId" IN (${categoryPlaceholders})
    `;
    let dataParams: any[] = [...filterCategoryIds];
    paramIndex = filterCategoryIds.length + 1;

    if (platform) {
      dataQuery += ` AND t.platform = $${paramIndex}`;
      dataParams.push(platform);
      paramIndex++;
    }

    if (status) {
      dataQuery += ` AND t.status = $${paramIndex}`;
      dataParams.push(status);
      paramIndex++;
    }

    dataQuery += ` ORDER BY t."createdAt" DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    dataParams.push(limit, offset);

    const rawTasks = await this.inquiryTaskRepo.query(dataQuery, dataParams);

    // Transform raw results to match expected structure
    const transformedTasks = rawTasks.map((row: any) => ({
      id: row.id,
      status: row.status,
      platform: row.platform,
      createdAt: row.createdAt,
      assignedToUserId: row.assignedToUserId,
      researchTaskId: row.researchTaskId,
      companyName: row.companyName,
      companyDomain: row.companyDomain,
      country: row.country,
      profileName: row.profileName,
      profileUrl: row.profileUrl,
      categoryName: row.categoryName,
      researchTask: row.researchTaskId ? { status: row.researchTaskStatus } : null,
    }));

    return { data: transformedTasks, total };
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
  /**
   * Get all pending research tasks across categories for sub-admin review
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

    // Build WHERE clause for category filtering
    const categoryPlaceholders = categoryIds.map((_, idx) => `$${idx + 1}`).join(',');

    // Use raw SQL for count
    const countQuery = `
      SELECT COUNT(*)::integer as count
      FROM research_tasks t
      WHERE t."categoryId" IN (${categoryPlaceholders})
      AND t.status = $${categoryIds.length + 1}
    `;
    const countParams: any[] = [...categoryIds, ResearchStatus.SUBMITTED];

    const countResult = await this.researchTaskRepo.query(countQuery, countParams);
    const total = countResult[0]?.count || 0;

    // Get data using raw query
    const dataQuery = `
      SELECT 
        t.id,
        t.status,
        t.targettype as target_type,
        t."createdAt" as created_at,
        cat.name as category_name,
        c.name as company_name,
        c.domain as company_domain,
        c.country as company_country,
        p.contact_name as profile_name,
        p.url as profile_url,
        p.country as profile_country
      FROM research_tasks t
      LEFT JOIN companies c ON c.id::text = t."targetId" AND t.targettype = 'COMPANY'
      LEFT JOIN linkedin_profiles p ON p.id::text = t."targetId" AND t.targettype = 'LINKEDIN_PROFILE'
      LEFT JOIN categories cat ON cat.id::text = t."categoryId"
      WHERE t."categoryId" IN (${categoryPlaceholders})
      AND t.status = $${categoryIds.length + 1}
      ORDER BY t."createdAt" DESC
      LIMIT $${categoryIds.length + 2} OFFSET $${categoryIds.length + 3}
    `;
    const dataParams: any[] = [...categoryIds, ResearchStatus.SUBMITTED, limit, offset];

    const rows = await this.researchTaskRepo.query(dataQuery, dataParams);

    const data = rows.map((row: any) => ({
      id: row.id,
      target: row.target_type === 'LINKEDIN_PROFILE' 
        ? (row.profile_name || row.profile_url || 'LinkedIn profile')
        : (row.company_name || row.company_domain || 'Website'),
      targetUrl: row.target_type === 'LINKEDIN_PROFILE' ? row.profile_url : row.company_domain,
      source: row.target_type === 'LINKEDIN_PROFILE' ? 'linkedin' : 'website',
      platform: row.target_type === 'LINKEDIN_PROFILE' ? 'LINKEDIN' : 'WEBSITE',
      status: (row.status || '').toLowerCase(),
      category: row.category_name || 'Unknown',
      categoryName: row.category_name || 'Unknown',
      country: row.target_type === 'LINKEDIN_PROFILE' ? row.profile_country : row.company_country,
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

    // Build WHERE clause for category filtering
    const categoryPlaceholders = categoryIds.map((_, idx) => `$${idx + 1}`).join(',');

    // Use raw SQL for count
    const countQuery = `
      SELECT COUNT(*)::integer as count
      FROM inquiry_tasks t
      WHERE t."categoryId" IN (${categoryPlaceholders})
      AND t.status = $${categoryIds.length + 1}
    `;
    const countParams: any[] = [...categoryIds, InquiryStatus.COMPLETED];

    const countResult = await this.inquiryTaskRepo.query(countQuery, countParams);
    const total = countResult[0]?.count || 0;

    // Get data using raw query - join through research_tasks for proper company/profile data
    const dataQuery = `
      SELECT 
        t.id,
        t.status,
        t.platform,
        t."assignedToUserId" as assigned_to,
        t."createdAt" as created_at,
        t.research_task_id as research_task_id,
        cat.name as category_name,
        c.name as company_name,
        c.domain as company_domain,
        c.country as company_country,
        p.contact_name as profile_name,
        p.url as profile_url,
        p.country as profile_country,
        rt.status as research_status
      FROM inquiry_tasks t
      LEFT JOIN research_tasks rt ON rt.id = t.research_task_id
      LEFT JOIN categories cat ON cat.id::text = t."categoryId"
      LEFT JOIN companies c ON c.id::text = rt."targetId" AND rt.targettype = 'COMPANY'
      LEFT JOIN linkedin_profiles p ON p.id::text = rt."targetId" AND rt.targettype = 'LINKEDIN_PROFILE'
      WHERE t."categoryId" IN (${categoryPlaceholders})
      AND t.status = $${categoryIds.length + 1}
      ORDER BY t."createdAt" DESC
      LIMIT $${categoryIds.length + 2} OFFSET $${categoryIds.length + 3}
    `;
    const dataParams: any[] = [...categoryIds, InquiryStatus.COMPLETED, limit, offset];

    const rows = await this.inquiryTaskRepo.query(dataQuery, dataParams);

    const data = rows.map((row: any) => {
      const isLinkedIn = row.platform === InquiryPlatform.LINKEDIN;
      return {
        id: row.id,
        channel: isLinkedIn ? 'linkedin' : 'website',
        platform: row.platform,
        target: isLinkedIn 
          ? (row.profile_name || row.profile_url || 'LinkedIn profile')
          : (row.company_name || row.company_domain || 'Website'),
        targetUrl: isLinkedIn ? row.profile_url : row.company_domain,
        category: row.category_name || 'Unknown',
        categoryName: row.category_name || 'Unknown',
        country: isLinkedIn ? row.profile_country : row.company_country,
        status: (row.status || '').toLowerCase(),
        worker: row.assigned_to || 'Unassigned',
        researchStatus: row.research_status || null,
        researchTaskId: row.research_task_id,
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
    // Get subadmin's categories
    const userCategories = await this.userCategoryRepo.find({
      where: { userId },
      select: ['categoryId'],
    });

    if (userCategories.length === 0) {
      return [];
    }

    const categoryIds = userCategories.map(uc => uc.categoryId);

    // Get all roles except sub_admin and super_admin
    const roles = await this.roleRepo
      .createQueryBuilder('role')
      .where('role.name NOT IN (:...excludedRoles)', { 
        excludedRoles: ['sub_admin', 'super_admin'] 
      })
      .getMany();

    const topWorkersByRole: any[] = [];

    // For each role, find top 3 workers based on completed tasks
    for (const role of roles) {
      // Get users with this role and assigned to subadmin's categories
      const usersWithRole = await this.userRoleRepo
        .createQueryBuilder('ur')
        .leftJoinAndSelect('ur.user', 'user')
        .where('ur.roleId = :roleId', { roleId: role.id })
        .getMany();

      const userIds = usersWithRole.map(ur => ur.userId);

      if (userIds.length === 0) continue;

      // Filter users to only those in subadmin's categories
      const userCategoriesInMyScope = await this.userCategoryRepo
        .createQueryBuilder('uc')
        .where('uc.userId IN (:...userIds)', { userIds })
        .andWhere('uc.categoryId IN (:...categoryIds)', { categoryIds })
        .getMany();

      const filteredUserIds = [...new Set(userCategoriesInMyScope.map(uc => uc.userId))];

      if (filteredUserIds.length === 0) continue;

      // Count completed tasks per user (research + inquiry)
      const userStats = await Promise.all(
        filteredUserIds.map(async (uid) => {
          const researchCompleted = await this.researchTaskRepo
            .createQueryBuilder('task')
            .where('task.assignedToUserId = :uid', { uid })
            .andWhere('task.status = :status', { status: ResearchStatus.COMPLETED })
            .andWhere('task.categoryId IN (:...categoryIds)', { categoryIds })
            .getCount();

          const inquiryCompleted = await this.inquiryTaskRepo
            .createQueryBuilder('task')
            .where('task.assignedToUserId = :uid', { uid })
            .andWhere('task.status = :status', { status: InquiryStatus.APPROVED })
            .andWhere('task.categoryId IN (:...categoryIds)', { categoryIds })
            .getCount();

          const totalCompleted = researchCompleted + inquiryCompleted;

          const user = await this.userRepo.findOne({ where: { id: uid } });

          return {
            userId: uid,
            name: user?.name || 'Unknown',
            email: user?.email || '',
            roleName: role.name,
            totalCompleted,
            researchCompleted,
            inquiryCompleted,
          };
        })
      );

      // Sort by total completed (descending) and take top 3
      const top3 = userStats
        .filter(s => s.totalCompleted > 0)
        .sort((a, b) => b.totalCompleted - a.totalCompleted)
        .slice(0, 3);

      topWorkersByRole.push(...top3);
    }

    return topWorkersByRole;
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

  async deleteCompanyType(id: string) {
    const companyType = await this.companyTypeRepo.findOne({ where: { id } });
    if (!companyType) {
      throw new BadRequestException('Company type not found');
    }

    await this.companyTypeRepo.delete(id);
    return { success: true, message: 'Company type deleted successfully' };
  }

  async deleteJobType(id: string) {
    const jobType = await this.jobTypeRepo.findOne({ where: { id } });
    if (!jobType) {
      throw new BadRequestException('Job type not found');
    }

    await this.jobTypeRepo.delete(id);
    return { success: true, message: 'Job type deleted successfully' };
  }

  // ========= DISAPPROVAL REASONS CRUD =========

  private async getSubAdminCategoryIds(userId: string): Promise<string[]> {
    const myCategories = await this.userCategoryRepo.find({
      where: { userId },
      select: ['categoryId'],
    });
    return myCategories.map(c => c.categoryId);
  }

  async getDisapprovalReasonsForSubAdmin(
    subAdminUserId: string,
    filters?: { search?: string; role?: string; reasonType?: 'rejection' | 'flag'; includeInactive?: boolean },
  ) {
    const categoryIds = await this.getSubAdminCategoryIds(subAdminUserId);

    // Try new schema first, fallback to old schema if columns don't exist
    try {
      const qb = this.disapprovalReasonRepo
        .createQueryBuilder('dr')
        .where('(dr."categoryIds" = :emptyArray OR dr."categoryIds" && :categoryIds)', {
          emptyArray: '{}',
          categoryIds,
        });

      if (!filters?.includeInactive) {
        qb.andWhere('dr.isActive = :active', { active: true });
      }

      if (filters?.role) {
        qb.andWhere(':role = ANY(dr."applicableRoles")', { role: filters.role });
      }

      if (filters?.reasonType) {
        qb.andWhere('dr.reasonType = :reasonType', { reasonType: filters.reasonType });
      }

      if (filters?.search) {
        qb.andWhere('(dr.description ILIKE :search)', {
          search: `%${filters.search}%`,
        });
      }

      qb.orderBy('dr.description', 'ASC');
      return await qb.getMany();
    } catch (err: any) {
      // Fallback for old schema (before migration)
      console.warn('New schema columns not found, using fallback query:', err.message);
      const qb = this.disapprovalReasonRepo
        .createQueryBuilder('dr')
        .select(['dr.id', 'dr.reason', 'dr.description', 'dr.isActive'])
        .where('dr.isActive = :active', { active: true });

      if (filters?.search) {
        qb.andWhere('(dr.description ILIKE :search)', {
          search: `%${filters.search}%`,
        });
      }

      qb.orderBy('dr.description', 'ASC');
      const rows = await qb.getMany();
      // Provide safe defaults for missing new-schema fields so UI keeps working
      return rows.map(r => ({
        ...r,
        reasonType: (r as any).reasonType ?? 'rejection',
        applicableRoles: (r as any).applicableRoles ?? [],
        categoryIds: (r as any).categoryIds ?? [],
      }));
    }
  }

  async createDisapprovalReasonForSubAdmin(
    subAdminUserId: string,
    data: { reason: string; description?: string; reasonType: 'rejection' | 'flag'; applicableRoles: string[]; categoryIds: string[]; isActive?: boolean },
  ) {
    const myCategories = await this.getSubAdminCategoryIds(subAdminUserId);

    if (!data.reason?.trim()) {
      throw new BadRequestException('Reason is required');
    }
    if (!Array.isArray(data.applicableRoles) || data.applicableRoles.length === 0) {
      throw new BadRequestException('At least one role is required');
    }
    if (!Array.isArray(data.categoryIds) || data.categoryIds.length === 0) {
      throw new BadRequestException('Select at least one category');
    }

    const invalid = data.categoryIds.filter(cid => !myCategories.includes(cid));
    if (invalid.length > 0) {
      throw new ForbiddenException('You can only assign reasons to your categories');
    }

    const disapprovalReason = this.disapprovalReasonRepo.create({
      reason: data.reason.trim(),
      description: data.description?.trim() || null,
      reasonType: data.reasonType,
      applicableRoles: data.applicableRoles,
      categoryIds: data.categoryIds,
      isActive: data.isActive ?? true,
    });

    return await this.disapprovalReasonRepo.save(disapprovalReason);
  }

  async updateDisapprovalReasonForSubAdmin(
    subAdminUserId: string,
    id: string,
    data: { reason?: string; description?: string; reasonType?: 'rejection' | 'flag'; applicableRoles?: string[]; categoryIds?: string[]; isActive?: boolean },
  ) {
    const myCategories = await this.getSubAdminCategoryIds(subAdminUserId);

    const disapprovalReason = await this.disapprovalReasonRepo.findOne({ where: { id } });
    if (!disapprovalReason) {
      throw new BadRequestException('Disapproval reason not found');
    }

    // Sub-admins cannot edit global reasons created by super admins
    if (!disapprovalReason.categoryIds || disapprovalReason.categoryIds.length === 0) {
      throw new ForbiddenException('You cannot edit global disapproval reasons');
    }

    const targetCategories = data.categoryIds ?? disapprovalReason.categoryIds;
    const invalid = targetCategories.filter(cid => !myCategories.includes(cid));
    if (invalid.length > 0) {
      throw new ForbiddenException('You can only assign reasons to your categories');
    }

    if (data.reason !== undefined) {
      disapprovalReason.reason = data.reason.trim();
    }
    if (data.description !== undefined) {
      disapprovalReason.description = data.description?.trim() || null;
    }
    if (data.reasonType) {
      disapprovalReason.reasonType = data.reasonType;
    }
    if (data.applicableRoles) {
      if (data.applicableRoles.length === 0) {
        throw new BadRequestException('At least one role is required');
      }
      disapprovalReason.applicableRoles = data.applicableRoles;
    }
    if (data.categoryIds) {
      disapprovalReason.categoryIds = data.categoryIds;
    }
    if (data.isActive !== undefined) {
      disapprovalReason.isActive = data.isActive;
    }

    return await this.disapprovalReasonRepo.save(disapprovalReason);
  }

  async deleteDisapprovalReasonForSubAdmin(
    subAdminUserId: string,
    id: string,
  ) {
    const myCategories = await this.getSubAdminCategoryIds(subAdminUserId);

    const disapprovalReason = await this.disapprovalReasonRepo.findOne({ where: { id } });
    if (!disapprovalReason) {
      throw new BadRequestException('Disapproval reason not found');
    }

    // Sub-admins cannot delete global reasons created by super admins
    if (!disapprovalReason.categoryIds || disapprovalReason.categoryIds.length === 0) {
      throw new ForbiddenException('You cannot delete global disapproval reasons');
    }

    // Check if all categories belong to this sub-admin
    const invalid = disapprovalReason.categoryIds.filter(cid => !myCategories.includes(cid));
    if (invalid.length > 0) {
      throw new ForbiddenException('You can only delete reasons from your categories');
    }

    await this.disapprovalReasonRepo.delete(id);
    return { success: true, message: 'Disapproval reason deleted successfully' };
  }

  // ===============================
  // CATEGORY RULES (Daily Limits)
  // ===============================

  /**
   * Get all category rules for sub-admin's categories only
   */
  async getCategoryRulesForSubAdmin(subAdminUserId: string) {
    const myCategories = await this.getSubAdminCategoryIds(subAdminUserId);
    
    if (myCategories.length === 0) {
      return [];
    }

    return this.categoryRuleRepo.find({
      where: { categoryId: In(myCategories) },
      relations: ['category'],
      order: { priority: 'DESC', createdAt: 'DESC' },
    });
  }

  /**
   * Update daily limit override for a specific category rule
   * SubAdmin can only update rules for their assigned categories
   */
  async updateCategoryRuleDailyLimit(
    subAdminUserId: string,
    ruleId: string,
    dailyLimitOverride: number | null,
  ) {
    const myCategories = await this.getSubAdminCategoryIds(subAdminUserId);

    const rule = await this.categoryRuleRepo.findOne({ where: { id: ruleId } });
    if (!rule) {
      throw new BadRequestException('Category rule not found');
    }

    // Check if this rule's category belongs to this sub-admin
    if (!myCategories.includes(rule.categoryId)) {
      throw new ForbiddenException('You can only update rules for your assigned categories');
    }

    rule.dailyLimitOverride = dailyLimitOverride;
    return await this.categoryRuleRepo.save(rule);
  }

  /**
   * Update cooldown days override for a specific category rule
   * SubAdmin can only update rules for their assigned categories
   */
  async updateCategoryRuleCooldown(
    subAdminUserId: string,
    ruleId: string,
    cooldownDaysOverride: number | null,
  ) {
    const myCategories = await this.getSubAdminCategoryIds(subAdminUserId);

    const rule = await this.categoryRuleRepo.findOne({ where: { id: ruleId } });
    if (!rule) {
      throw new BadRequestException('Category rule not found');
    }

    // Check if this rule's category belongs to this sub-admin
    if (!myCategories.includes(rule.categoryId)) {
      throw new ForbiddenException('You can only update rules for your assigned categories');
    }

    rule.cooldownDaysOverride = cooldownDaysOverride;
    return await this.categoryRuleRepo.save(rule);
  }
}

