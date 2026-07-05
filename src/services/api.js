import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestId = error.response?.data?.requestId || error.response?.headers?.['x-request-id'] || 'N/A';
    if (error.response?.data) {
      error.response.data.requestId = requestId;
    } else {
      error.response = { data: { message: error.message, requestId } };
    }
    return Promise.reject(error);
  },
);

export default api;
