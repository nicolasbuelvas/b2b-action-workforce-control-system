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