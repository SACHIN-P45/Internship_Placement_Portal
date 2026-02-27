// Admin controller — manage users, companies, and dashboard stats
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Admin
exports.getStats = async (req, res, next) => {
  try {
    const [totalStudents, totalCompanies, totalJobs, totalSelected, pendingCompanies] =
      await Promise.all([
        User.countDocuments({ role: 'student' }),
        User.countDocuments({ role: 'company' }),
        Job.countDocuments(),
        Application.countDocuments({ status: 'selected' }),
        User.countDocuments({ role: 'company', isApproved: false }),
      ]);

    res.json({
      totalStudents,
      totalCompanies,
      totalJobs,
      totalSelected,
      pendingCompanies,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const filter = {};
    if (role) filter.role = role;

    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending company registrations
// @route   GET /api/admin/pending-companies
// @access  Admin
exports.getPendingCompanies = async (req, res, next) => {
  try {
    const companies = await User.find({
      role: 'company',
      isApproved: false,
    }).sort({ createdAt: -1 });

    res.json(companies);
  } catch (error) {
    next(error);
  }
};

// @desc    Approve a company
// @route   PUT /api/admin/approve-company/:id
// @access  Admin
exports.approveCompany = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || user.role !== 'company') {
      return res.status(404).json({ message: 'Company not found' });
    }

    user.isApproved = true;
    await user.save();

    res.json({ message: 'Company approved', user });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject (delete) a company registration
// @route   DELETE /api/admin/reject-company/:id
// @access  Admin
exports.rejectCompany = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || user.role !== 'company') {
      return res.status(404).json({ message: 'Company not found' });
    }

    await user.deleteOne();
    res.json({ message: 'Company registration rejected and removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Block / Unblock a user
// @route   PUT /api/admin/block-user/:id
// @access  Admin
exports.toggleBlockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({
      message: user.isBlocked ? 'User blocked' : 'User unblocked',
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.deleteOne();
    res.json({ message: 'User removed' });
  } catch (error) {
    next(error);
  }
};
