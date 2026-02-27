// Placement Head Routes — protected by JWT + placementHead role
const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');
const {
    getDashboard,
    getSelectedStudents,
    getSalaryAnalytics,
    activateJob,
    deactivateJob,
    getDepartmentStats,
    getReports,
    getAllJobs,
} = require('../controllers/placementHeadController');

// All routes require authentication + placementHead role
router.use(protect);
router.use(authorize('placementHead'));

// Dashboard overview
router.get('/dashboard', getDashboard);

// Selected students with filtering
router.get('/selected-students', getSelectedStudents);

// Salary analytics
router.get('/salary-analytics', getSalaryAnalytics);

// Department statistics
router.get('/department-stats', getDepartmentStats);

// Placement reports
router.get('/reports', getReports);

// Job control
router.get('/jobs', getAllJobs);
router.put('/job/:id/activate', activateJob);
router.put('/job/:id/deactivate', deactivateJob);

module.exports = router;
