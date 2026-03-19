// Admin routes
const express = require('express');
const router = express.Router();
const {
  getStats,
  getAllUsers,
  getPendingCompanies,
  approveCompany,
  rejectCompany,
  toggleBlockUser,
  deleteUser,
  addStudent,
  addCompany,
  backupDatabase,
  broadcastMessage,
  updateSettings,
} = require('../controllers/adminController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');

// All admin routes require authentication + admin role
router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.post('/users/student', addStudent);
router.post('/users/company', addCompany);
router.get('/pending-companies', getPendingCompanies);
router.put('/approve-company/:id', approveCompany);
router.delete('/reject-company/:id', rejectCompany);
router.put('/block-user/:id', toggleBlockUser);
router.delete('/users/:id', deleteUser);
router.get('/backup', backupDatabase);
router.post('/broadcast', broadcastMessage);
router.put('/settings', updateSettings);

module.exports = router;
