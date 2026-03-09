// Auth routes — register, login, profile, resume upload, OAuth
const express = require('express');
const router = express.Router();
const passport = require('passport');
const {
  register,
  login,
  getMe,
  updateProfile,
  uploadResume,
  getResumeHistory,
  downloadResume,
  downloadApplicantResume,
  activateResume,
  deleteResume,
  forgotPassword,
  resetPassword,
  oauthCallback,
} = require('../controllers/authController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');
const upload = require('../middleware/upload');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);

// Resume routes
router.put(
  '/resume',
  protect,
  authorize('student'),
  upload.single('resume'),
  uploadResume
);
router.get('/resumes', protect, authorize('student'), getResumeHistory);
router.get('/resume/:resumeId', protect, authorize('student'), downloadResume);
router.get('/application/:applicationId/resume', protect, authorize('company'), downloadApplicantResume);
router.put('/resume/:resumeId/activate', protect, authorize('student'), activateResume);
router.delete('/resume/:resumeId', protect, authorize('student'), deleteResume);

// Helper: build client-side failure URL
const getFailureRedirect = () =>
  `${process.env.CLIENT_URL || process.env.FRONTEND_URL || 'https://internship-placement-portal-kappa.vercel.app'}/login?error=oauth_failed`;

// ============ Google OAuth ============
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', {
    session: false,
    failureRedirect: getFailureRedirect(),
  })(req, res, (err) => {
    if (err) {
      console.error('[OAuth Google] Error:', err.message);
      return res.redirect(getFailureRedirect());
    }
    next();
  });
}, oauthCallback);

// ============ GitHub OAuth ============
router.get(
  '/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

router.get('/github/callback', (req, res, next) => {
  passport.authenticate('github', {
    session: false,
    failureRedirect: getFailureRedirect(),
  })(req, res, (err) => {
    if (err) {
      console.error('[OAuth GitHub] Error:', err.message);
      return res.redirect(getFailureRedirect());
    }
    next();
  });
}, oauthCallback);

module.exports = router;
