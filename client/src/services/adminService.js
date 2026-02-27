// Admin service
import API from './api';

const adminService = {
  getStats: () => API.get('/admin/stats'),
  getUsers: (role) => API.get('/admin/users', { params: { role } }),
  getPendingCompanies: () => API.get('/admin/pending-companies'),
  approveCompany: (id) => API.put(`/admin/approve-company/${id}`),
  rejectCompany: (id) => API.delete(`/admin/reject-company/${id}`),
  toggleBlockUser: (id) => API.put(`/admin/block-user/${id}`),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),
};

export default adminService;
