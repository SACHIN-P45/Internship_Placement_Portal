// Admin service
import API from './api';

const adminService = {
  getStats: () => API.get('/admin/stats'),
  getUsers: (role) => API.get('/admin/users', { params: { role } }),
  addStudent: (data) => API.post('/admin/users/student', data),
  addCompany: (data) => API.post('/admin/users/company', data),
  getPendingCompanies: () => API.get('/admin/pending-companies'),
  approveCompany: (id) => API.put(`/admin/approve-company/${id}`),
  rejectCompany: (id) => API.delete(`/admin/reject-company/${id}`),
  toggleBlockUser: (id) => API.put(`/admin/block-user/${id}`),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),
  backupDatabase: () => API.get('/admin/backup'),
  broadcastMessage: (data) => API.post('/admin/broadcast', data),
  getPublicSettings: () => API.get('/settings'),
  updateSettings: (data) => API.put('/admin/settings', data),
};

export default adminService;
