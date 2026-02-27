// Job routes
const express = require('express');
const router = express.Router();
const {
  createJob,
  getJobs,
  getJob,
  getMyJobs,
  updateJob,
  deleteJob,
  toggleBookmark,
  getBookmarkedJobs,
  getBookmarkIds,
} = require('../controllers/jobController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');

// Public route — students & guests can browse jobs
router.get('/', getJobs);
router.get('/my', protect, authorize('company'), getMyJobs);

// Bookmark routes (students only) — must be before /:id
router.get('/bookmarks', protect, authorize('student'), getBookmarkedJobs);
router.get('/bookmarks/ids', protect, authorize('student'), getBookmarkIds);
router.post('/:id/bookmark', protect, authorize('student'), toggleBookmark);

router.get('/:id', getJob);

// Company-only routes
router.post('/', protect, authorize('company'), createJob);
router.put('/:id', protect, authorize('company'), updateJob);
router.delete('/:id', protect, authorize('company', 'admin'), deleteJob);

module.exports = router;
