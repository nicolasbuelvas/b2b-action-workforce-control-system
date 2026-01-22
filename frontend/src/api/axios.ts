import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const instance = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  console.log('[axios interceptor] URL:', config.url);
  console.log('[axios interceptor] Token in localStorage:', token ? 'YES' : 'NO');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('[axios interceptor] Setting Authorization header: Bearer', token.substring(0, 20) + '...');
  } else {
    console.log('[axios interceptor] NO TOKEN FOUND - Authorization header NOT set');
  }
  
  console.log('[axios interceptor] Final headers.Authorization:', config.headers.Authorization ? 'PRESENT' : 'MISSING');
  
  return config;
});

export default instance;