import axios from './axios';

/* =========================
   DASHBOARD
========================= */

export async function getAdminDashboard() {
  const res = await axios.get('/admin/dashboard');
  return res.data;
}

export async function getAdminCategories() {
  const res = await axios.get('/admin/categories');
  return res.data;
}

export async function getTopWorkers() {
  const res = await axios.get('/admin/top-workers');
  return res.data;
}

export async function getSystemLogs() {
  const res = await axios.get('/admin/system-logs');
  return res.data;
}

/* =========================
   USERS
========================= */

export async function getUsers(params: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}) {
  const res = await axios.get('/admin/users', { params });
  return res.data;
}

export async function getUsersStats() {
  const res = await axios.get('/admin/users/stats');
  return res.data;
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  country?: string;
  role: string;
  categoryIds?: string[];
}) {
  const res = await axios.post('/users', data);
  return res.data;
}

export async function createSubAdmin(data: {
  userId: string;
  categoryIds: string[];
}) {
  const res = await axios.post('/admin/sub-admin', data);
  return res.data;
}

export async function updateUserStatus(id: string, status: string) {
  const res = await axios.patch(`/admin/users/${id}/status`, { status });
  return res.data;
}

export async function updateUserProfile(
  id: string,
  data: { name?: string; role?: string }
) {
  const res = await axios.patch(`/admin/users/${id}/profile`, data);
  return res.data;
}

export async function resetUserPassword(id: string, password?: string) {
  const res = await axios.post(
    `/admin/users/${id}/reset-password`,
    password ? { password } : {},
  );
  return res.data;
}

export async function deleteUser(id: string) {
  const res = await axios.delete(`/admin/users/${id}`);
  return res.data;
}

/* =========================
   CATEGORIES
========================= */

export async function createCategory(data: {
  name: string;
  config: {
    cooldownRules: {
      cooldownDays: number;
      dailyLimits: {
        researcher: number;
        inquirer: number;
        auditor: number;
      };
    };
  };
}) {
  const res = await axios.post('/categories', data);
  return res.data;
}

export async function updateCategory(id: string, data: any) {
  // ⚠️ IMPORTANT: NEVER send subAdminIds here
  const res = await axios.patch(`/categories/${id}`, data);
  return res.data;
}

export async function deleteCategory(id: string) {
  const res = await axios.delete(`/categories/${id}`);
  return res.data;
}

/**
 * ✅ Assign sub-admins to a category
 * ✅ Uses SAME axios instance (proxy-safe)
 * ✅ Hits POST /categories/:id/sub-admins
 * ✅ Fully replaces assignments
 */
export async function assignCategorySubAdmins(
  categoryId: string,
  subAdminIds: string[],
) {
  if (!categoryId) {
    throw new Error('categoryId is required');
  }

  console.debug('[API] POST /categories/:id/sub-admins', {
    categoryId,
    subAdminIds,
  });

  const res = await axios.post(
    `/categories/${categoryId}/sub-admins`,
    { subAdminIds },
  );

  return res.data;
}

/* =========================
   CATEGORY RULES
========================= */

export async function getCategoryRules() {
  const res = await axios.get('/admin/category-rules');
  return res.data;
}

export async function createCategoryRule(data: {
  categoryId: string;
  actionType: string;
  role: string;
  dailyLimitOverride?: number;
  cooldownDaysOverride?: number;
  requiredActions?: number;
  screenshotRequired?: boolean;
  status?: string;
  priority?: number;
}) {
  const res = await axios.post('/admin/category-rules', data);
  return res.data;
}

export async function updateCategoryRule(id: string, data: any) {
  const res = await axios.patch(`/admin/category-rules/${id}`, data);
  return res.data;
}

export async function toggleCategoryRuleStatus(id: string) {
  const res = await axios.patch(
    `/admin/category-rules/${id}/toggle-status`,
  );
  return res.data;
}

export async function deleteCategoryRule(id: string) {
  const res = await axios.delete(`/admin/category-rules/${id}`);
  return res.data;
}

/* =========================
   USER CATEGORY ASSIGNMENT
========================= */

export async function assignUserToCategories(userId: string, categoryIds: string[]) {
  const res = await axios.post('/admin/users/assign-categories', {
    userId,
    categoryIds,
  });
  return res.data;
}

export async function removeUserFromCategory(userId: string, categoryId: string) {
  const res = await axios.delete('/admin/users/remove-from-category', {
    data: { userId, categoryId },
  });
  return res.data;
}

export async function getUserCategories(userId: string) {
  const res = await axios.get(`/admin/users/${userId}/categories`);
  return res.data;
}