import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('veloq_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('veloq_token');
      localStorage.removeItem('veloq_user');
      window.location.href = '/login';
    }
    return Promise.reject(err.response?.data || { message: 'Something went wrong' });
  }
);

export default api;
