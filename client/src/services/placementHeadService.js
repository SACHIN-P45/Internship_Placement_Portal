// Placement Head service — API calls for placement dashboard
import API from './api';

const placementHeadService = {
    // Dashboard overview stats
    getDashboard: () => API.get('/placement-head/dashboard'),

    // Selected students with optional filters
    getSelectedStudents: (params) => API.get('/placement-head/selected-students', { params }),

    // Salary analytics
    getSalaryAnalytics: () => API.get('/placement-head/salary-analytics'),

    // Department-wise statistics
    getDepartmentStats: () => API.get('/placement-head/department-stats'),

    // Comprehensive placement report
    getReports: () => API.get('/placement-head/reports'),

    // Job control
    getAllJobs: (params) => API.get('/placement-head/jobs', { params }),
    activateJob: (id) => API.put(`/placement-head/job/${id}/activate`),
    deactivateJob: (id) => API.put(`/placement-head/job/${id}/deactivate`),
};

export default placementHeadService;
