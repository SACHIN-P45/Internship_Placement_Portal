// Application routes
const express = require('express');
const router = express.Router();
const {
  applyForJob,
  getMyApplications,
  getApplicantsForJob,
  updateApplicationStatus,
  getAllApplications,
  cancelApplication,
} = require('../controllers/applicationController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');

// Student routes
router.post('/:jobId', protect, authorize('student'), applyForJob);
router.get('/my', protect, authorize('student'), getMyApplications);
router.delete('/:id', protect, authorize('student'), cancelApplication);

// Company routes
router.get('/job/:jobId', protect, authorize('company', 'admin'), getApplicantsForJob);
router.put('/:id/status', protect, authorize('company', 'admin'), updateApplicationStatus);

// Admin route
router.get('/', protect, authorize('admin'), getAllApplications);

module.exports = router;
