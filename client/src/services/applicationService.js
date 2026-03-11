// Application service
import API from './api';

const applicationService = {
  apply: (jobId) => API.post(`/applications/${jobId}`),
  getMyApplications: () => API.get('/applications/my'),
  getApplicantsForJob: (jobId) => API.get(`/applications/job/${jobId}`),
  updateStatus: (id, status) => API.put(`/applications/${id}/status`, { status }),
  getAll: () => API.get('/applications'),
  cancel: (id) => API.delete(`/applications/${id}`),
  downloadApplicantResume: (applicationId) =>
    API.get(`/auth/application/${applicationId}/resume`, { responseType: 'blob' }),
};

export default applicationService;
