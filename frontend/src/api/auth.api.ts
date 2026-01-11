import { api } from './client';

export async function loginApi(email: string, password: string) {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
}