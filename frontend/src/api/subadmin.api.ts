import { client } from './client';
import { AxiosError } from 'axios';

export interface ResearchItem {
  id: string;
  profileUrl: string;
  companyName: string;
  country: string;
  category: string;
  submittedBy: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  createdAt: string;
}

export interface InquiryItem {
  id: string;
  taskName: string;
  category: string;
  status: 'pending' | 'in_progress' | 'completed' | 'approved' | 'rejected' | 'flagged';
  assignedTo: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  isActive: boolean;
}

export interface CompanyType {
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface JobType {
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface CreateWebsiteResearchTaskPayload {
  categoryId: string;
  jobTypeId: string;
  companyTypeId: string;
  companyWebsite: string;
  companyName?: string;
  country?: string;
  language?: string;
}

export interface CreateLinkedInResearchTaskPayload {
  categoryId: string;
  jobTypeId: string;
  companyTypeId: string;
  profileUrl: string;
  contactName?: string;
  country?: string;
  language?: string;
}

export interface SubAdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface SubAdminUsersResponse {
  users: SubAdminUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SubAdminUserStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
}

/**
 * Fetch categories accessible to sub-admin
 */
export async function getSubAdminCategories(): Promise<Category[]> {
  try {
    const response = await client.get('/subadmin/categories');
    return response.data || [];
  } catch (error: any) {
    console.error('Failed to fetch sub-admin categories:', error);
    throw error;
  }
}

export async function getActiveCompanyTypes(): Promise<CompanyType[]> {
  const response = await client.get('/subadmin/company-types');
  const list: CompanyType[] = response.data || [];
  return list.filter((item) => item.isActive !== false);
}

export async function getActiveJobTypes(): Promise<JobType[]> {
  const response = await client.get('/subadmin/job-types');
  const list: JobType[] = response.data || [];
  return list.filter((item) => item.isActive !== false);
}

/**
 * Fetch Website research tasks
 */
export async function getWebsiteResearchTasks(
  categoryId?: string,
  status?: string,
  limit = 50,
  offset = 0,
): Promise<ResearchItem[]> {
  try {
    const params: any = { limit, offset };
    if (categoryId) params.categoryId = categoryId;
    if (status && status !== 'all') params.status = status;

    const response = await client.get('/subadmin/research/website', { params });
    return response.data || [];
  } catch (error: any) {
    console.error('Failed to fetch website research tasks:', error);
    throw error;
  }
}

/**
 * Fetch LinkedIn research tasks
 */
export async function getLinkedInResearchTasks(
  categoryId?: string,
  status?: string,
  limit = 50,
  offset = 0,
): Promise<{ data: ResearchItem[]; total: number }> {
  try {
    const params: any = { limit, offset };
    if (categoryId) params.categoryId = categoryId;
    if (status && status !== 'all') params.status = status;

    const response = await client.get('/subadmin/research/linkedin', { params });
    
    // Handle both array and paginated response
    if (Array.isArray(response.data)) {
      return { data: response.data, total: response.data.length };
    }
    
    return {
      data: response.data?.data || [],
      total: response.data?.total || 0,
    };
  } catch (error: any) {
    console.error('Failed to fetch LinkedIn research tasks:', error);
    throw error;
  }
}

/**
 * Create Website research tasks (bulk)
 */
export async function createWebsiteResearchTasks(
  payload: CreateWebsiteResearchTaskPayload,
): Promise<any> {
  try {
    const response = await client.post('/subadmin/research/website', {
      ...payload,
    });
    return response.data;
  } catch (error: any) {
    console.error('Failed to create website research tasks:', error);
    throw error;
  }
}

/**
 * Create LinkedIn research tasks (bulk)
 */
export async function createLinkedInResearchTasks(
  payload: CreateLinkedInResearchTaskPayload,
): Promise<any> {
  try {
    const response = await client.post('/subadmin/research/linkedin', {
      ...payload,
    });
    return response.data;
  } catch (error: any) {
    console.error('Failed to create LinkedIn research tasks:', error);
    throw error;
  }
}

/**
 * Create Website inquiry tasks (bulk)
 */
export async function createWebsiteInquiryTasks(
  categoryId: string,
  targetUrls: string[],
): Promise<any> {
  try {
    const response = await client.post('/subadmin/inquiry/website', {
      categoryId,
      targetUrls,
    });
    return response.data;
  } catch (error: any) {
    console.error('Failed to create website inquiry tasks:', error);
    throw error;
  }
}

/**
 * Create LinkedIn inquiry tasks (bulk)
 */
export async function createLinkedInInquiryTasks(
  categoryId: string,
  profileUrls: string[],
): Promise<any> {
  try {
    const response = await client.post('/subadmin/inquiry/linkedin', {
      categoryId,
      profileUrls,
    });
    return response.data;
  } catch (error: any) {
    console.error('Failed to create LinkedIn inquiry tasks:', error);
    throw error;
  }
}

/**
 * Fetch inquiry tasks
 */
export async function getInquiryTasks(
  categoryId?: string,
  platform?: 'WEBSITE' | 'LINKEDIN',
  status?: string,
  limit = 50,
  offset = 0,
): Promise<{ data: any[]; total: number }> {
  try {
    const params: any = { limit, offset };
    if (categoryId) params.categoryId = categoryId;
    if (platform) params.platform = platform;
    if (status && status !== 'all') params.status = status;

    const response = await client.get('/subadmin/inquiry', { params });
    
    // Handle both array and paginated response
    if (Array.isArray(response.data)) {
      return { data: response.data, total: response.data.length };
    }
    
    return {
      data: response.data?.data || [],
      total: response.data?.total || 0,
    };
  } catch (error: any) {
    console.error('Failed to fetch inquiry tasks:', error);
    throw error;
  }
}

/**
 * Fetch single research task with submission for review
 */
export async function getResearchTaskForReview(taskId: string): Promise<any> {
  try {
    const response = await client.get(`/subadmin/research/${taskId}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch research task for review:', error);
    throw error;
  }
}

/**
 * Fetch inquiry task with actions and snapshots for review
 */
export async function getInquiryTaskForReview(taskId: string): Promise<any> {
  try {
    const response = await client.get(`/subadmin/inquiry/${taskId}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch inquiry task for review:', error);
    throw error;
  }
}

/**
 * Alias: Get research task by ID
 */
export async function getResearchTask(taskId: string): Promise<any> {
  return getResearchTaskForReview(taskId);
}

/**
 * Alias: Get inquiry task by ID
 */
export async function getInquiryTask(taskId: string): Promise<any> {
  return getInquiryTaskForReview(taskId);
}

/**
 * Approve research task
 */
export async function approveResearchTask(taskId: string): Promise<any> {
  try {
    const response = await client.patch(`/subadmin/research/${taskId}/approve`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to approve research task:', error);
    throw error;
  }
}

/**
 * Reject research task
 */
export async function rejectResearchTask(taskId: string, reason: string): Promise<any> {
  try {
    const response = await client.patch(`/subadmin/research/${taskId}/reject`, { reason });
    return response.data;
  } catch (error: any) {
    console.error('Failed to reject research task:', error);
    throw error;
  }
}

/**
 * Flag research task
 */
export async function flagResearchTask(taskId: string): Promise<any> {
  try {
    const response = await client.patch(`/subadmin/research/${taskId}/flag`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to flag research task:', error);
    throw error;
  }
}

/**
 * Approve inquiry task
 */
export async function approveInquiryTask(taskId: string): Promise<any> {
  try {
    const response = await client.patch(`/subadmin/inquiry/${taskId}/approve`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to approve inquiry task:', error);
    throw error;
  }
}

/**
 * Reject inquiry task
 */
export async function rejectInquiryTask(taskId: string, reason: string): Promise<any> {
  try {
    const response = await client.patch(`/subadmin/inquiry/${taskId}/reject`, { reason });
    return response.data;
  } catch (error: any) {
    console.error('Failed to reject inquiry task:', error);
    throw error;
  }
}

/**
 * Flag inquiry task
 */
export async function flagInquiryTask(taskId: string): Promise<any> {
  try {
    const response = await client.patch(`/subadmin/inquiry/${taskId}/flag`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to flag inquiry task:', error);
    throw error;
  }
}

// ==================== User Management APIs ====================

/**
 * Get users in subadmin's categories (paginated with filters)
 */
export async function getSubAdminUsers(params: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}): Promise<SubAdminUsersResponse> {
  try {
    const response = await client.get('/subadmin/users', { params });
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch subadmin users:', error);
    throw error;
  }
}

/**
 * Get user statistics for subadmin's categories
 */
export async function getSubAdminUserStats(): Promise<SubAdminUserStats> {
  try {
    const response = await client.get('/subadmin/users/stats');
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch user stats:', error);
    throw error;
  }
}

/**
 * Update user status (active/suspended)
 */
export async function updateSubAdminUserStatus(
  userId: string,
  status: 'active' | 'suspended'
): Promise<{ success: boolean }> {
  try {
    const response = await client.patch(`/subadmin/users/${userId}/status`, { status });
    return response.data;
  } catch (error: any) {
    console.error('Failed to update user status:', error);
    throw error;
  }
}

/**
 * Reset user password
 */
export async function resetSubAdminUserPassword(
  userId: string,
  password?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await client.post(`/subadmin/users/${userId}/reset-password`, { password });
    return response.data;
  } catch (error: any) {
    console.error('Failed to reset user password:', error);
    throw error;
  }
}

/**
 * Update user profile (name, role)
 */
export async function updateSubAdminUserProfile(
  userId: string,
  data: { name?: string; role?: string }
): Promise<{ success: boolean }> {
  try {
    const response = await client.patch(`/subadmin/users/${userId}/profile`, data);
    return response.data;
  } catch (error: any) {
    console.error('Failed to update user profile:', error);
    throw error;
  }
}

/**
 * Generic wrapper for creating inquiry tasks
 * Used by the inquiry task creation form
 */
export async function createInquiryTasks(
  platform: 'website' | 'linkedin',
  categoryId: string,
  items: string[],
): Promise<any> {
  if (platform === 'website') {
    return createWebsiteInquiryTasks(categoryId, items);
  } else {
    return createLinkedInInquiryTasks(categoryId, items);
  }
}
// ===============================
// CATEGORY RULES (Daily Limits)
// ===============================

export interface CategoryRule {
  id: string;
  categoryId: string;
  category: {
    id: string;
    name: string;
  };
  actionType: string;
  role: string;
  dailyLimitOverride: number | null;
  cooldownDaysOverride: number | null;
  requiredActions: number;
  screenshotRequired: boolean;
  status: 'active' | 'inactive';
  priority: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get category rules for SubAdmin's assigned categories only
 */
export async function getSubAdminCategoryRules(): Promise<CategoryRule[]> {
  const response = await client.get('/subadmin/category-rules');
  return response.data;
}

/**
 * Update daily limit for a category rule
 */
export async function updateCategoryRuleDailyLimit(
  ruleId: string,
  dailyLimitOverride: number | null
): Promise<CategoryRule> {
  const response = await client.patch(`/subadmin/category-rules/${ruleId}/daily-limit`, {
    dailyLimitOverride,
  });
  return response.data;
}

/**
 * Update cooldown days for a category rule
 */
export async function updateCategoryRuleCooldown(
  ruleId: string,
  cooldownDaysOverride: number | null
): Promise<CategoryRule> {
  const response = await client.patch(`/subadmin/category-rules/${ruleId}/cooldown`, {
    cooldownDaysOverride,
  });
  return response.data;
}

/**
 * Get pending research tasks for review
 */
export async function getPendingResearchTasks(
  limit = 50,
  offset = 0,
): Promise<{ data: any[]; total: number }> {
  try {
    const params: any = { limit, offset };
    const response = await client.get('/subadmin/pending/research', { params });
    
    if (Array.isArray(response.data)) {
      return { data: response.data, total: response.data.length };
    }
    
    return {
      data: response.data?.data || [],
      total: response.data?.total || 0,
    };
  } catch (error: any) {
    console.error('Failed to fetch pending research tasks:', error);
    throw error;
  }
}

/**
 * Get pending inquiry tasks for review
 */
export async function getPendingInquiryTasks(
  limit = 50,
  offset = 0,
): Promise<{ data: any[]; total: number }> {
  try {
    const params: any = { limit, offset };
    const response = await client.get('/subadmin/pending/inquiry', { params });
    
    if (Array.isArray(response.data)) {
      return { data: response.data, total: response.data.length };
    }
    
    return {
      data: response.data?.data || [],
      total: response.data?.total || 0,
    };
  } catch (error: any) {
    console.error('Failed to fetch pending inquiry tasks:', error);
    throw error;
  }
}
