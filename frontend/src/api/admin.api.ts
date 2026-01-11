import axios from './axios';

export async function getAdminDashboard() {
  const res = await axios.get('/admin/dashboard');
  return res.data;
}