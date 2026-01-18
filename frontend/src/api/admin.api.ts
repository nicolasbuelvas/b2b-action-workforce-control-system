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

export async function updateUserStatus(id: string, status: string) {
  const res = await axios.patch(`/admin/users/${id}/status`, { status });
  return res.data;
}

export async function resetUserPassword(id: string) {
  const res = await axios.post(`/admin/users/${id}/reset-password`);
  return res.data;
}

export async function deleteUser(id: string) {
  const res = await axios.delete(`/admin/users/${id}`);
  return res.data;
}