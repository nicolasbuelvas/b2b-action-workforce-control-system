import axios from './axios';

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

export async function getUsers(params: { page?: number; limit?: number; search?: string; role?: string; status?: string }) {
  const res = await axios.get('/admin/users', { params });
  return res.data;
}

export async function getUsersStats() {
  const res = await axios.get('/admin/users/stats');
  return res.data;
}

export async function createUser(data: { name: string; email: string; password: string; country?: string; role: string; categoryIds?: string[] }) {
  const res = await axios.post('/users', data);
  return res.data;
}

export async function createSubAdmin(data: { userId: string; categoryIds: string[] }) {
  const res = await axios.post('/admin/sub-admin', data);
  return res.data;
}

export async function updateUserStatus(id: string, status: string) {
  const res = await axios.patch(`/admin/users/${id}/status`, { status });
  return res.data;
}

export async function resetUserPassword(id: string, password?: string) {
  const res = await axios.post(`/admin/users/${id}/reset-password`, password ? { password } : {});
  return res.data;
}

export async function deleteUser(id: string) {
  const res = await axios.delete(`/admin/users/${id}`);
  return res.data;
}

export async function createCategory(data: { name: string; config: { cooldownRules: { cooldownDays: number; dailyLimits: { researcher: number; inquirer: number; auditor: number } } } }) {
  const res = await axios.post('/categories', data);
  return res.data;
}

export async function updateCategory(id: string, data: any) {
  const res = await axios.patch(`/categories/${id}`, data);
  return res.data;
}

export async function deleteCategory(id: string) {
  const res = await axios.delete(`/categories/${id}`);
  return res.data;
}