import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
  Patch,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { SubAdminService } from './subadmin.service';
import { ResearchStatus } from '../research/entities/research-task.entity';
import { InquiryStatus, InquiryPlatform } from '../inquiry/entities/inquiry-task.entity';

interface UserPayload {
  id?: string;
  userId?: string;
  email?: string;
  role?: string;
}

@Controller('subadmin')
@UseGuards(JwtGuard, RolesGuard)
@Roles('sub_admin', 'super_admin')
export class SubAdminController {
  constructor(private readonly subAdminService: SubAdminService) {}

  /**
   * GET /subadmin/categories
   * Get categories accessible to current sub-admin
   */
  @Get('categories')
  async getCategories(@CurrentUser() user: UserPayload) {
    const userId = user?.id ?? user?.userId;
    const userRole = user?.role;
    console.log('[subadmin.controller.getCategories] user:', user, 'resolvedUserId:', userId, 'role:', userRole);

    if (!userId) {
      throw new Error('Invalid user payload: missing userId');
    }

    const categories = await this.subAdminService.getUserCategories(userId, userRole);
    console.log('[subadmin.controller.getCategories] returning categories:', categories.length);
    return categories;
  }

  /**
   * GET /subadmin/users
   * Get users assigned to subadmin's categories with pagination and filters
   */
  @Get('users')
  async getUsers(
    @CurrentUser() user: UserPayload,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('status') status?: string,
  ) {
    const userId = user?.id ?? user?.userId;
    console.log('[subadmin.controller.getUsers] user:', user, 'resolvedUserId:', userId);

    if (!userId) {
      throw new Error('Invalid user payload: missing userId');
    }

    // If pagination params provided, use paginated endpoint
    if (page !== undefined || limit !== undefined) {
      return await this.subAdminService.getUsersInMyCategoriesPaginated(userId, {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
        search: search || '',
        role: role || '',
        status: status || '',
      });
    }

    // Otherwise return simple list (legacy)
    const users = await this.subAdminService.getUsersInMyCategories(userId);
    console.log('[subadmin.controller.getUsers] returning users:', users.length);
    return users;
  }

  /**
   * GET /subadmin/users/stats
   * Get user statistics for subadmin's categories
   */
  @Get('users/stats')
  async getUsersStats(@CurrentUser() user: UserPayload) {
    const userId = user?.id ?? user?.userId;
    if (!userId) {
      throw new Error('Invalid user payload: missing userId');
    }

    return await this.subAdminService.getUsersStatsInMyCategories(userId);
  }

  /**
   * PATCH /subadmin/users/:id/status
   * Update user status (active/suspended)
   */
  @Patch('users/:id/status')
  async updateUserStatus(
    @CurrentUser() user: UserPayload,
    @Param('id') targetUserId: string,
    @Body() body: { status: string },
  ) {
    const userId = user?.id ?? user?.userId;
    if (!userId) {
      throw new Error('Invalid user payload: missing userId');
    }

    return await this.subAdminService.updateUserStatusBySubAdmin(userId, targetUserId, body.status);
  }

  /**
   * POST /subadmin/users/:id/reset-password
   * Reset user password
   */
  @Post('users/:id/reset-password')
  async resetUserPassword(
    @CurrentUser() user: UserPayload,
    @Param('id') targetUserId: string,
    @Body() body?: { password?: string },
  ) {
    const userId = user?.id ?? user?.userId;
    if (!userId) {
      throw new Error('Invalid user payload: missing userId');
    }

    return await this.subAdminService.resetUserPasswordBySubAdmin(userId, targetUserId, body?.password);
  }

  /**
   * PATCH /subadmin/users/:id/profile
   * Update user name and role (excluding super_admin/sub_admin)
   */
  @Patch('users/:id/profile')
  async updateUserProfile(
    @CurrentUser() user: UserPayload,
    @Param('id') targetUserId: string,
    @Body() body: { name?: string; role?: string },
  ) {
    const userId = user?.id ?? user?.userId;
    if (!userId) {
      throw new Error('Invalid user payload: missing userId');
    }

    return await this.subAdminService.updateUserProfileBySubAdmin(userId, targetUserId, body);
  }


  /**
   * GET /subadmin/research/website
   * Get Website research tasks with pagination
   */
  @Get('research/website')
  async getWebsiteResearchTasks(
    @CurrentUser() user: UserPayload,
    @Query('categoryId') categoryId?: string,
    @Query('status') status?: ResearchStatus,
    @Query('limit') limit = 50,
    @Query('offset') offset = 0,
  ) {
    const userId = user?.id ?? user?.userId;
    const result = await this.subAdminService.getWebsiteResearchTasks(
      userId,
      categoryId,
      status,
      Math.min(limit, 100), // Max 100 per request
      offset,
    );
    return result;
  }

  /**
   * GET /subadmin/research/linkedin
   * Get LinkedIn research tasks with pagination
   */
  @Get('research/linkedin')
  async getLinkedInResearchTasks(
    @CurrentUser() user: UserPayload,
    @Query('categoryId') categoryId?: string,
    @Query('status') status?: ResearchStatus,
    @Query('limit') limit = 50,
    @Query('offset') offset = 0,
  ) {
    const userId = user?.id ?? user?.userId;
    const result = await this.subAdminService.getLinkedInResearchTasks(
      userId,
      categoryId,
      status,
      Math.min(limit, 100),
      offset,
    );
    return result;
  }

  /**
   * POST /subadmin/research/website
   * Create Website research tasks (bulk)
   * Body: { categoryId: string, domains: string[] }
   */
  @Post('research/website')
  async createWebsiteResearchTasks(
    @CurrentUser() user: UserPayload,
    @Body() body: {
      categoryId: string;
      jobTypeId: string;
      companyTypeId: string;
      companyWebsite?: string;
      companyName?: string;
      country?: string;
      language?: string;
      tasks?: Array<{ companyWebsite: string; companyName?: string; country?: string; language?: string }>;
    },
  ) {
    if (!body.categoryId) {
      throw new BadRequestException('categoryId is required');
    }

    if (!body.jobTypeId || !body.companyTypeId) {
      throw new BadRequestException('jobTypeId and companyTypeId are required');
    }

    const hasTasks = (Array.isArray(body.tasks) && body.tasks.length > 0) || !!body.companyWebsite;
    if (!hasTasks) {
      throw new BadRequestException('Provide at least one companyWebsite');
    }

    return await this.subAdminService.createWebsiteResearchTasks(
      user.id,
      body,
    );
  }

  /**
   * POST /subadmin/research/linkedin
   * Create LinkedIn research tasks (bulk)
   * Body: { categoryId: string, profileUrls: string[] }
   */
  @Post('research/linkedin')
  async createLinkedInResearchTasks(
    @CurrentUser() user: UserPayload,
    @Body() body: {
      categoryId: string;
      jobTypeId: string;
      companyTypeId: string;
      profileUrl?: string;
      contactName?: string;
      country?: string;
      language?: string;
      tasks?: Array<{ profileUrl: string; contactName?: string; country?: string; language?: string }>;
    },
  ) {
    if (!body.categoryId) {
      throw new BadRequestException('categoryId is required');
    }

    if (!body.jobTypeId || !body.companyTypeId) {
      throw new BadRequestException('jobTypeId and companyTypeId are required');
    }

    const hasTasks = (Array.isArray(body.tasks) && body.tasks.length > 0) || !!body.profileUrl;
    if (!hasTasks) {
      throw new BadRequestException('Provide at least one profileUrl');
    }

    return await this.subAdminService.createLinkedInResearchTasks(
      user.id,
      body,
    );
  }

  /**
   * POST /subadmin/inquiry/website
   * Create Website inquiry tasks (bulk)
   * Body: { categoryId: string, targetUrls: string[] }
   */
  @Post('inquiry/website')
  async createWebsiteInquiryTasks(
    @CurrentUser() user: UserPayload,
    @Body() body: { categoryId: string; targetUrls: string[] },
  ) {
    if (!Array.isArray(body.targetUrls) || body.targetUrls.length === 0) {
      throw new Error('targetUrls must be a non-empty array');
    }

    return await this.subAdminService.createWebsiteInquiryTasks(
      user.id,
      body.categoryId,
      body.targetUrls,
    );
  }

  /**
   * POST /subadmin/inquiry/linkedin
   * Create LinkedIn inquiry tasks (bulk)
   * Body: { categoryId: string, profileUrls: string[] }
   */
  @Post('inquiry/linkedin')
  async createLinkedInInquiryTasks(
    @CurrentUser() user: UserPayload,
    @Body() body: { categoryId: string; profileUrls: string[] },
  ) {
    if (!Array.isArray(body.profileUrls) || body.profileUrls.length === 0) {
      throw new Error('profileUrls must be a non-empty array');
    }

    return await this.subAdminService.createLinkedInInquiryTasks(
      user.id,
      body.categoryId,
      body.profileUrls,
    );
  }

  /**
   * GET /subadmin/inquiry
   * Get inquiry tasks with pagination and platform filter
   */
  @Get('inquiry')
  async getInquiryTasks(
    @CurrentUser() user: UserPayload,
    @Query('categoryId') categoryId?: string,
    @Query('platform') platform?: 'WEBSITE' | 'LINKEDIN',
    @Query('status') status?: InquiryStatus,
    @Query('limit') limit = 50,
    @Query('offset') offset = 0,
  ) {
    const platformEnum: InquiryPlatform | undefined = platform
      ? (Object.values(InquiryPlatform).includes(platform as InquiryPlatform) ? (platform as InquiryPlatform) : undefined)
      : undefined;

    return await this.subAdminService.getInquiryTasks(
      user.id,
      categoryId,
      platformEnum,
      status,
      Math.min(limit, 100),
      offset,
    );
  }

  /**
   * GET /subadmin/research/:taskId
   * Get single research task with submission for review
   */
  @Get('research/:taskId')
  async getResearchTaskForReview(
    @CurrentUser() user: UserPayload,
    @Param('taskId') taskId: string,
  ) {
    return await this.subAdminService.getResearchTaskWithSubmission(
      user.id,
      taskId,
    );
  }

  /**
   * GET /subadmin/inquiry/:taskId
   * Get inquiry task with actions and snapshots for review
   */
  @Get('inquiry/:taskId')
  async getInquiryTaskForReview(
    @CurrentUser() user: UserPayload,
    @Param('taskId') taskId: string,
  ) {
    return await this.subAdminService.getInquiryTaskForReview(user.id, taskId);
  }

  /**
   * PATCH /subadmin/research/:taskId/approve
   * Approve research task
   */
  @Patch('research/:taskId/approve')
  async approveResearchTask(
    @CurrentUser() user: UserPayload,
    @Param('taskId') taskId: string,
  ) {
    return await this.subAdminService.approveResearchTask(user.id, taskId);
  }

  /**
   * PATCH /subadmin/research/:taskId/reject
   * Reject research task
   */
  @Patch('research/:taskId/reject')
  async rejectResearchTask(
    @CurrentUser() user: UserPayload,
    @Param('taskId') taskId: string,
    @Body() body?: { reason?: string },
  ) {
    return await this.subAdminService.rejectResearchTask(
      user.id,
      taskId,
      body?.reason,
    );
  }

  /**
   * PATCH /subadmin/research/:taskId/flag
   * Flag research task
   */
  @Patch('research/:taskId/flag')
  async flagResearchTask(
    @CurrentUser() user: UserPayload,
    @Param('taskId') taskId: string,
    @Body() body?: { reason?: string },
  ) {
    return await this.subAdminService.flagResearchTask(
      user.id,
      taskId,
      body?.reason,
    );
  }

  /**
   * PATCH /subadmin/inquiry/:taskId/approve
   * Approve inquiry task
   */
  @Patch('inquiry/:taskId/approve')
  async approveInquiryTask(
    @CurrentUser() user: UserPayload,
    @Param('taskId') taskId: string,
  ) {
    return await this.subAdminService.approveInquiryTask(user.id, taskId);
  }

  /**
   * PATCH /subadmin/inquiry/:taskId/reject
   * Reject inquiry task
   */
  @Patch('inquiry/:taskId/reject')
  async rejectInquiryTask(
    @CurrentUser() user: UserPayload,
    @Param('taskId') taskId: string,
    @Body() body?: { reason?: string },
  ) {
    return await this.subAdminService.rejectInquiryTask(
      user.id,
      taskId,
      body?.reason,
    );
  }

  /**
   * PATCH /subadmin/inquiry/:taskId/flag
   * Flag inquiry task
   */
  @Patch('inquiry/:taskId/flag')
  async flagInquiryTask(
    @CurrentUser() user: UserPayload,
    @Param('taskId') taskId: string,
    @Body() body?: { reason?: string },
  ) {
    return await this.subAdminService.flagInquiryTask(
      user.id,
      taskId,
      body?.reason,
    );
  }

  /**
   * GET /subadmin/pending/research
   * Get all pending research tasks for review
   */
  @Get('pending/research')
  async getPendingResearchTasks(
    @CurrentUser() user: UserPayload,
    @Query('limit') limit = 50,
    @Query('offset') offset = 0,
  ) {
    const result = await this.subAdminService.getPendingResearchTasks(
      user.id,
      Math.min(limit, 100),
      offset,
    );
    return result;
  }

  /**
   * GET /subadmin/pending/inquiry
   * Get all pending inquiry tasks for review
   */
  @Get('pending/inquiry')
  async getPendingInquiryTasks(
    @CurrentUser() user: UserPayload,
    @Query('limit') limit = 50,
    @Query('offset') offset = 0,
  ) {
    const result = await this.subAdminService.getPendingInquiryTasks(
      user.id,
      Math.min(limit, 100),
      offset,
    );
    return result;
  }

  /**
   * GET /subadmin/stats
   * Get dashboard statistics for sub-admin
   */
  @Get('stats')
  async getStats(@CurrentUser() user: UserPayload) {
    return await this.subAdminService.getStats(user.id);
  }

  /**
   * GET /subadmin/alerts
   * Get alerts for sub-admin
   */
  @Get('alerts')
  async getAlerts(
    @CurrentUser() user: UserPayload,
    @Query('limit') limit = 8,
  ) {
    return await this.subAdminService.getAlerts(user.id, Math.min(limit, 50));
  }

  /**
   * GET /subadmin/queued-actions
   * Get queued actions for sub-admin
   */
  @Get('queued-actions')
  async getQueuedActions(
    @CurrentUser() user: UserPayload,
    @Query('limit') limit = 10,
  ) {
    return await this.subAdminService.getQueuedActions(user.id, Math.min(limit, 50));
  }

  /**
   * GET /subadmin/top-categories
   * Get top categories by activity
   */
  @Get('top-categories')
  async getTopCategories(
    @CurrentUser() user: UserPayload,
    @Query('limit') limit = 6,
  ) {
    return await this.subAdminService.getTopCategories(user.id, Math.min(limit, 50));
  }

  /**
   * GET /subadmin/pending/research
   * Get all pending research tasks (list view)
   */
  @Get('review/research')
  async getReviewResearchTasks(
    @CurrentUser() user: UserPayload,
    @Query('status') status?: ResearchStatus,
    @Query('limit') limit = 50,
    @Query('offset') offset = 0,
  ) {
    return await this.subAdminService.getPendingResearchTasks(
      user.id,
      Math.min(limit, 100),
      offset,
    );
  }

  /**
   * GET /subadmin/review/inquiry
   * Get all pending inquiry tasks (list view)
   */
  @Get('review/inquiry')
  async getReviewInquiryTasks(
    @CurrentUser() user: UserPayload,
    @Query('status') status?: InquiryStatus,
    @Query('limit') limit = 50,
    @Query('offset') offset = 0,
  ) {
    return await this.subAdminService.getPendingInquiryTasks(
      user.id,
      Math.min(limit, 100),
      offset,
    );
  }


  /**
   * GET /subadmin/performance
   * Get performance metrics
   */
  @Get('performance')
  async getPerformance(
    @CurrentUser() user: UserPayload,
    @Query('period') period = 'last7',
  ) {
    return await this.subAdminService.getPerformanceStats(user.id, period);
  }

  /**
   * GET /subadmin/top-workers
   * Get top workers by performance
   */
  @Get('top-workers')
  async getTopWorkers(
    @CurrentUser() user: UserPayload,
    @Query('period') period = 'last7',
  ) {
    return await this.subAdminService.getTopWorkers(user.id, period);
  }


  /**
   * GET /subadmin/disapproval-reasons
   * Get disapproval reasons
   */
  @Get('disapproval-reasons')
  async getDisapprovalReasons(
    @CurrentUser() user: UserPayload,
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('reasonType') reasonType?: 'rejection' | 'flag',
    @Query('includeInactive') includeInactive?: string,
  ) {
    return await this.subAdminService.getDisapprovalReasonsForSubAdmin(user.id, {
      search,
      role,
      reasonType,
      includeInactive: includeInactive === 'true',
    });
  }

  /**
   * POST /subadmin/disapproval-reasons
   * Create new disapproval reason
   */
  @Post('disapproval-reasons')
  async createDisapprovalReason(
    @CurrentUser() user: UserPayload,
    @Body() body: {
      reason: string;
      description?: string;
      reasonType: 'rejection' | 'flag';
      applicableRoles: string[];
      categoryIds: string[];
      isActive?: boolean;
    },
  ) {
    return await this.subAdminService.createDisapprovalReasonForSubAdmin(user.id, body);
  }

  /**
   * PATCH /subadmin/disapproval-reasons/:id
   * Update disapproval reason
   */
  @Patch('disapproval-reasons/:id')
  async updateDisapprovalReason(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body() body: {
      reason?: string;
      description?: string;
      reasonType?: 'rejection' | 'flag';
      applicableRoles?: string[];
      categoryIds?: string[];
      isActive?: boolean;
    },
  ) {
    return await this.subAdminService.updateDisapprovalReasonForSubAdmin(user.id, id, body);
  }

  /**
   * DELETE /subadmin/disapproval-reasons/:id
   * Delete disapproval reason
   */
  @Delete('disapproval-reasons/:id')
  async deleteDisapprovalReason(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
  ) {
    return await this.subAdminService.deleteDisapprovalReasonForSubAdmin(user.id, id);
  }

  /**
   * GET /subadmin/company-types
   * Get all company types
   */
  @Get('company-types')
  async getCompanyTypes(@CurrentUser() user: UserPayload) {
    return await this.subAdminService.getCompanyTypes();
  }

  /**
   * POST /subadmin/company-types
   * Create new company type
   */
  @Post('company-types')
  async createCompanyType(
    @CurrentUser() user: UserPayload,
    @Body() body: { name: string; description?: string },
  ) {
    return await this.subAdminService.createCompanyType(body);
  }

  /**
   * PATCH /subadmin/company-types/:id
   * Update company type
   */
  @Patch('company-types/:id')
  async updateCompanyType(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body() body: { name?: string; description?: string; isActive?: boolean },
  ) {
    return await this.subAdminService.updateCompanyType(id, body);
  }

  /**
   * DELETE /subadmin/company-types/:id
   * Delete company type
   */
  @Delete('company-types/:id')
  async deleteCompanyType(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
  ) {
    return await this.subAdminService.deleteCompanyType(id);
  }

  /**
   * GET /subadmin/job-types
   * Get all job types
   */
  @Get('job-types')
  async getJobTypes(@CurrentUser() user: UserPayload) {
    return await this.subAdminService.getJobTypes();
  }

  /**
   * POST /subadmin/job-types
   * Create new job type
   */
  @Post('job-types')
  async createJobType(
    @CurrentUser() user: UserPayload,
    @Body() body: { name: string; description?: string },
  ) {
    return await this.subAdminService.createJobType(body);
  }

  /**
   * PATCH /subadmin/job-types/:id
   * Update job type
   */
  @Patch('job-types/:id')
  async updateJobType(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body() body: { name?: string; description?: string; isActive?: boolean },
  ) {
    return await this.subAdminService.updateJobType(id, body);
  }

  /**
   * DELETE /subadmin/job-types/:id
   * Delete job type
   */
  @Delete('job-types/:id')
  async deleteJobType(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
  ) {
    return await this.subAdminService.deleteJobType(id);
  }

  /**
   * GET /subadmin/country-stats
   * Get country statistics
   */
  @Get('country-stats')
  async getCountryStats(
    @CurrentUser() user: UserPayload,
    @Query('period') period = 'last7',
  ) {
    return [];
  }

  // ===============================
  // CATEGORY RULES (Daily Limits)
  // ===============================

  /**
   * GET /subadmin/category-rules
   * Get all category rules for sub-admin's categories
   */
  @Get('category-rules')
  async getCategoryRules(@CurrentUser() user: UserPayload) {
    const userId = user?.id ?? user?.userId;
    if (!userId) {
      throw new Error('Invalid user payload: missing userId');
    }

    return await this.subAdminService.getCategoryRulesForSubAdmin(userId);
  }

  /**
   * PATCH /subadmin/category-rules/:id/daily-limit
   * Update daily limit for a category rule
   */
  @Patch('category-rules/:id/daily-limit')
  async updateDailyLimit(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body() body: { dailyLimitOverride: number | null },
  ) {
    const userId = user?.id ?? user?.userId;
    if (!userId) {
      throw new Error('Invalid user payload: missing userId');
    }

    return await this.subAdminService.updateCategoryRuleDailyLimit(
      userId,
      id,
      body.dailyLimitOverride,
    );
  }

  /**
   * PATCH /subadmin/category-rules/:id/cooldown
   * Update cooldown days for a category rule
   */
  @Patch('category-rules/:id/cooldown')
  async updateCooldown(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body() body: { cooldownDaysOverride: number | null },
  ) {
    const userId = user?.id ?? user?.userId;
    if (!userId) {
      throw new Error('Invalid user payload: missing userId');
    }

    return await this.subAdminService.updateCategoryRuleCooldown(
      userId,
      id,
      body.cooldownDaysOverride,
    );
  }
}



