// Auth controller — register, login, get profile
const User = require('../models/User');
const Resume = require('../models/Resume');
const generateToken = require('../utils/generateToken');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { sendPasswordResetEmail } = require('../utils/emailService');

// @desc    Register a new user (student or company)
// @route   POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, companyName, website, description, googleId, githubId } = req.body;

    // Companies cannot register via OAuth
    if (role === 'company' && (googleId || githubId)) {
      return res.status(400).json({ message: 'Company accounts must be registered with email and password only' });
    }

    // Validate password is provided for email registrations
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Build user object
    const userData = { name, email, password, role: role || 'student' };

    // Attach company fields if registering as company
    if (role === 'company') {
      userData.companyName = companyName || name;
      userData.website = website || '';
      userData.description = description || '';
      userData.isApproved = false; // needs admin approval
    }

    const user = await User.create(userData);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Block check
    if (user.isBlocked) {
      return res.status(403).json({ message: 'Your account has been blocked' });
    }

    // Company approval check
    if (user.role === 'company' && !user.isApproved) {
      return res
        .status(403)
        .json({ message: 'Your company account is pending admin approval' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in user profile
// @route   GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Update logged-in user profile
// @route   PUT /api/auth/me
exports.updateProfile = async (req, res, next) => {
  try {
    const allowedFields = {};
    const { name, department, cgpa, skills, phone, bio, companyName, website, description, industry, companySize } = req.body;

    if (name) allowedFields.name = name;
    if (phone !== undefined) allowedFields.phone = phone;
    if (bio !== undefined) allowedFields.bio = bio;

    // Student fields
    if (req.user.role === 'student') {
      if (department !== undefined) allowedFields.department = department;
      if (cgpa !== undefined) allowedFields.cgpa = cgpa;
      if (skills !== undefined) allowedFields.skills = typeof skills === 'string' ? skills.split(',').map((s) => s.trim()) : skills;
    }

    // Company fields
    if (req.user.role === 'company') {
      if (companyName) allowedFields.companyName = companyName;
      if (website !== undefined) allowedFields.website = website;
      if (description !== undefined) allowedFields.description = description;
      if (industry !== undefined) allowedFields.industry = industry;
      if (companySize !== undefined) allowedFields.companySize = companySize;
    }

    const user = await User.findByIdAndUpdate(req.user._id, allowedFields, {
      new: true,
      runValidators: true,
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Upload resume (PDF) — Store in database
// @route   PUT /api/auth/resume
exports.uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF file' });
    }

    // Read file data
    const filePath = req.file.path;
    const fileData = fs.readFileSync(filePath);

    // Mark previous resumes as inactive
    await Resume.updateMany(
      { userId: req.user._id, isActive: true },
      { isActive: false }
    );

    // Create new resume record
    const resume = await Resume.create({
      userId: req.user._id,
      fileName: req.file.filename,
      originalFileName: req.file.originalname,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      fileData: fileData,
      fileUrl: `/uploads/${req.file.filename}`,
      isActive: true,
    });

    // Update user's resume reference
    await User.findByIdAndUpdate(
      req.user._id,
      { resume: `/uploads/${req.file.filename}` },
      { new: true }
    );

    // Clean up temporary file
    fs.unlinkSync(filePath);

    res.json({
      message: 'Resume uploaded and stored successfully',
      resume: {
        _id: resume._id,
        fileName: resume.fileName,
        originalFileName: resume.originalFileName,
        fileSize: resume.fileSize,
        uploadedAt: resume.uploadedAt,
        fileUrl: resume.fileUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's resume history
// @route   GET /api/auth/resumes
exports.getResumeHistory = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id })
      .select('_id fileName originalFileName fileSize uploadedAt isActive fileUrl')
      .sort({ uploadedAt: -1 });

    res.json(resumes);
  } catch (error) {
    next(error);
  }
};

// @desc    Download specific resume
// @route   GET /api/auth/resume/:resumeId
exports.downloadResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.resumeId,
      userId: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    res.set({
      'Content-Type': resume.mimeType,
      'Content-Disposition': `attachment; filename="${resume.originalFileName}"`,
      'Content-Length': resume.fileData.length,
    });

    res.send(resume.fileData);
  } catch (error) {
    next(error);
  }
};

// @desc    Set active resume
// @route   PUT /api/auth/resume/:resumeId/activate
exports.activateResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.resumeId,
      userId: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Mark all resumes as inactive
    await Resume.updateMany(
      { userId: req.user._id },
      { isActive: false }
    );

    // Mark selected resume as active
    resume.isActive = true;
    await resume.save();

    // Update user's resume reference
    await User.findByIdAndUpdate(
      req.user._id,
      { resume: resume.fileUrl }
    );

    res.json({
      message: 'Resume activated successfully',
      resume: {
        _id: resume._id,
        fileName: resume.fileName,
        originalFileName: resume.originalFileName,
        fileSize: resume.fileSize,
        uploadedAt: resume.uploadedAt,
        isActive: resume.isActive,
        fileUrl: resume.fileUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete resume
// @route   DELETE /api/auth/resume/:resumeId
exports.deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.resumeId,
      userId: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Don't allow deleting the active resume
    if (resume.isActive) {
      return res.status(400).json({ message: 'Cannot delete active resume. Activate another resume first.' });
    }

    await Resume.findByIdAndDelete(req.params.resumeId);

    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide your email' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not (security best practice)
      return res.status(200).json({ message: 'If an account exists with this email, you will receive a password reset link shortly' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Save reset token and expiry to database
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send reset email
    let resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    try {
      await sendPasswordResetEmail(user.email, resetToken, user.name);
    } catch (emailError) {
      // If email fails, clear the reset token
      user.resetPasswordToken = null;
      user.resetPasswordTokenExpiry = null;
      await user.save();
      return res.status(500).json({ message: 'Error sending password reset email. Please try again later.' });
    }

    res.json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password using token
// @route   POST /api/auth/reset-password/:token
exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res.status(400).json({ message: 'Please provide password and confirm password' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Hash the token to compare with database
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordTokenExpiry: { $gt: Date.now() },
    }).select('+resetPasswordToken +resetPasswordTokenExpiry');

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordTokenExpiry = null;
    await user.save();

    res.json({ message: 'Password reset successfully. You can now login with your new password.' });
  } catch (error) {
    next(error);
  }
};

// @desc    OAuth callback handler — redirect to frontend with token
// @route   GET /api/auth/google/callback, /api/auth/github/callback
// @desc    Download applicant resume (for companies)
// @route   GET /api/auth/application/:applicationId/resume
// @access  Company (verified owner of the job)
exports.downloadApplicantResume = async (req, res, next) => {
  try {
    const Application = require('../models/Application');

    const application = await Application.findById(req.params.applicationId)
      .populate('job')
      .populate('resumeId');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Verify the requesting user is the company that posted the job
    if (application.job.company.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to access this resume' });
    }

    // Get the resume from the database if resumeId exists
    let resume = application.resumeId;

    // Fallback to legacy resume field if no resumeId
    if (!resume && application.resume) {
      // Try to read from file system if legacy path exists
      const filePath = path.join(__dirname, '..', application.resume);
      if (fs.existsSync(filePath)) {
        const fileData = fs.readFileSync(filePath);
        const originalFileName = application.resume.split('/').pop();
        res.set({
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${originalFileName}"`,
          'Content-Length': fileData.length,
        });
        return res.send(fileData);
      }
    }

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found. Please contact the applicant to re-upload their resume.' });
    }

    res.set({
      'Content-Type': resume.mimeType,
      'Content-Disposition': `attachment; filename="${resume.originalFileName}"`,
      'Content-Length': resume.fileData.length,
    });

    res.send(resume.fileData);
  } catch (error) {
    next(error);
  }
};

exports.oauthCallback = async (req, res, next) => {
  try {
    const user = req.user;
    console.log('[OAuth Callback] User authenticated:', { id: user._id, email: user.email, role: user.role });

    // Block check
    if (user.isBlocked) {
      console.log('[OAuth Callback] User is blocked, redirecting to login');
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3001'}/login?error=blocked`);
    }

    // Company accounts cannot use OAuth — email registration only
    if (user.role === 'company') {
      console.log('[OAuth Callback] Company account attempted OAuth login, rejecting');
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3001'}/login?error=company_oauth_not_allowed`);
    }

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    // Create user data for frontend
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isApproved: user.isApproved,
      token,
    };

    // Redirect to frontend with encoded user data
    const encodedData = encodeURIComponent(JSON.stringify(userData));
    const redirectUrl = `${process.env.CLIENT_URL || 'http://localhost:3001'}/oauth/callback?data=${encodedData}`;
    console.log('[OAuth Callback] Redirecting to:', redirectUrl.substring(0, 100) + '...');
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('[OAuth Callback] Error:', error.message);
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3001'}/login?error=oauth_failed`);
  }
};
