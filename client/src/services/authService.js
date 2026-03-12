// Auth service — login, register, profile
import API from './api';

const authService = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/me', data),
  uploadAvatar: (formData) =>
    API.put('/auth/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  uploadResume: (formData) =>
    API.put('/auth/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getResumeHistory: () => API.get('/auth/resumes'),
  downloadResume: (resumeId) => API.get(`/auth/resume/${resumeId}`, { responseType: 'blob' }),
  activateResume: (resumeId) => API.put(`/auth/resume/${resumeId}/activate`),
  deleteResume: (resumeId) => API.delete(`/auth/resume/${resumeId}`),
  forgotPassword: (data) => API.post('/auth/forgot-password', data),
  resetPassword: (token, data) => API.post(`/auth/reset-password/${token}`, data),
};

export default authService;
