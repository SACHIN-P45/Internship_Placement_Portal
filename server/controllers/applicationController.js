// Application controller — apply, track, update status
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const Resume = require('../models/Resume');
const Notification = require('../models/Notification');
const { sendApplicationStatusEmail } = require('../utils/emailService');

// @desc    Apply for a job (student)
// @route   POST /api/applications/:jobId
// @access  Student
exports.applyForJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (!job.isActive) {
      return res.status(400).json({ message: 'This job is no longer active' });
    }

    // Check if already applied
    const alreadyApplied = await Application.findOne({
      job: req.params.jobId,
      student: req.user._id,
    });

    if (alreadyApplied) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Check if student has an active resume
    const activeResume = await Resume.findOne({
      userId: req.user._id,
      isActive: true,
    });

    if (!activeResume) {
      return res.status(400).json({ message: 'Please upload your resume before applying' });
    }

    // Get legacy resume path from user for backward compatibility
    const student = await User.findById(req.user._id);

    const application = await Application.create({
      job: req.params.jobId,
      student: req.user._id,
      resumeId: activeResume._id,
      resume: student.resume || `/uploads/${activeResume.fileName}`,
    });

    // Check if the number of applications has reached the openings limit
    const applicationCount = await Application.countDocuments({ job: req.params.jobId });
    if (job.openings && applicationCount >= job.openings) {
      job.isActive = false;
      await job.save();
    }

    res.status(201).json(application);
  } catch (error) {
    next(error);
  }
};

// @desc    Get applications for logged-in student
// @route   GET /api/applications/my
// @access  Student
exports.getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ student: req.user._id })
      .populate('job', 'title companyName type location salary deadline')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    next(error);
  }
};

// @desc    Get applicants for a specific job (company view)
// @route   GET /api/applications/job/:jobId
// @access  Company
exports.getApplicantsForJob = async (req, res, next) => {
  try {
    // Verify the job belongs to this company
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (
      job.company.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate('student', 'name email department cgpa skills resume')
      .populate('resumeId', 'fileName originalFileName mimeType fileSize')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status (company)
// @route   PUT /api/applications/:id/status
// @access  Company
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['applied', 'shortlisted', 'rejected', 'selected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const application = await Application.findById(req.params.id).populate('job');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // ✅ FIX: Guard against orphaned applications where the job was deleted.
    // application.job will be null if the referenced job no longer exists.
    if (!application.job) {
      return res.status(404).json({ message: 'The job associated with this application no longer exists' });
    }

    // Ensure company owns the job
    if (
      application.job.company.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    application.status = status;
    await application.save();

    // Create a notification for the student
    try {
      let message = `Your application status for ${application.job?.title || 'a job'} has been updated to ${status}.`;
      await Notification.create({
        user: application.student,
        message,
        type: status === 'rejected' ? 'error' : status === 'selected' ? 'success' : status === 'shortlisted' ? 'success' : 'info',
        link: '/applications'
      });
    } catch (notifErr) {
      console.error('Failed to create notification:', notifErr);
    }

    // Send email notification to student (non-fatal)
    try {
      const student = await User.findById(application.student).select('name email');
      if (student && student.email) {
        await sendApplicationStatusEmail(
          student.email,
          student.name,
          application.job?.title || 'a Job',
          application.job?.companyName || 'the company',
          status
        );
      }
    } catch (emailErr) {
      console.warn('Failed to send application status email:', emailErr.message);
    }

    res.json(application);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications (admin)
// @route   GET /api/applications
// @access  Admin
exports.getAllApplications = async (req, res, next) => {
  try {
    const applications = await Application.find()
      .populate('job', 'title companyName type')
      .populate('student', 'name email department')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel/ withdraw a job application
// @route   DELETE /api/applications/:id
// @access  Student
exports.cancelApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Ensure only the student who applied can cancel it
    if (application.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this application' });
    }

    // Optional: Prevent cancellation if status is not 'applied' (e.g. already selected/shortlisted)
    // if (application.status !== 'applied') {
    //   return res.status(400).json({ message: 'Cannot cancel application at this stage' });
    // }

    await application.deleteOne();

    res.json({ message: 'Application cancelled successfully' });
  } catch (error) {
    next(error);
  }
};
