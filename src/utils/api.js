import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('veloq_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (config.data instanceof FormData) {
    // Delete any Content-Type so browser sets multipart/form-data with correct boundary
    delete config.headers['Content-Type'];
    delete config.headers['content-type'];
  } else {
    config.headers['Content-Type'] = 'application/json';
  }
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
