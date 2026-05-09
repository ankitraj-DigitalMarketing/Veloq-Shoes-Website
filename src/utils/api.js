import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('veloq_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  // Only set JSON content-type when NOT sending FormData (let browser set multipart boundary)
  if (!(config.data instanceof FormData)) {
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
