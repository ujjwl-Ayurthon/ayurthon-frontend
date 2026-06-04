import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({ baseURL: API_URL });

// Attach admin token to every request if present
api.interceptors.request.use(config => {
  const token = localStorage.getItem('ayurthon_admin_token');
  if (token) config.headers['x-admin-token'] = token;
  return config;
});

export default api;
