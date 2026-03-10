// Job service — CRUD operations
import API from './api';

const jobService = {
  getAll: (params) => API.get('/jobs', { params }),
  getById: (id) => API.get(`/jobs/${id}`),
  getMyJobs: () => API.get('/jobs/my'),
  create: (data) => API.post('/jobs', data),
  update: (id, data) => API.put(`/jobs/${id}`, data),
  remove: (id) => API.delete(`/jobs/${id}`),

  // Bookmark operations (students only)
  toggleBookmark: (id) => API.post(`/jobs/${id}/bookmark`),
  getBookmarkedJobs: () => API.get('/jobs/bookmarks'),
  getBookmarkIds: () => API.get('/jobs/bookmarks/ids'),

  // Skills-based recommendations (students only)
  getRecommendations: () => API.get('/jobs/recommendations'),
};

export default jobService;
