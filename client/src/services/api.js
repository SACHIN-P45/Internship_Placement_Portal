// Axios instance with base URL and auth token interceptor
import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const API = axios.create({
  baseURL: API_BASE_URL,
});

// Attach JWT token to every request if available
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
    console.log('API Request:', config.method, config.url, 'Token attached');
  } else {
    console.log('API Request:', config.method, config.url, 'NO TOKEN');
  }
  return config;
});

// Log errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('401 Unauthorized - Token may be invalid or missing');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default API;
