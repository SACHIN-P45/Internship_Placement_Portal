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
} = require('../controllers/adminController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');

// All admin routes require authentication + admin role
router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.get('/pending-companies', getPendingCompanies);
router.put('/approve-company/:id', approveCompany);
router.delete('/reject-company/:id', rejectCompany);
router.put('/block-user/:id', toggleBlockUser);
router.delete('/users/:id', deleteUser);

module.exports = router;
