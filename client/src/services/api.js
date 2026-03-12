// Axios instance with base URL and auth token interceptor
import axios from 'axios';

// Enforce absolute Render URL in production to prevent Vercel proxy timeouts 
const rawApiUrl = import.meta.env.PROD
  ? 'https://internship-placement-portal.onrender.com/api'
  : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api');
export const API_BASE_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl.replace(/\/$/, '')}/api`;

const API = axios.create({
  baseURL: API_BASE_URL,
});

// Attach JWT token to every request if available
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Global response error handler
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Let callers handle errors — AuthContext will clear the user on 401 if needed
    return Promise.reject(error);
  }
);

export default API;
