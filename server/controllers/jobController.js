// Job controller — CRUD for job/internship postings (upgraded with pagination & filters)
const Job = require('../models/Job');
const Application = require('../models/Application');
const { closeExpiredJobs } = require('../utils/closeExpiredJobs');

// @desc    Create a new job/internship
// @route   POST /api/jobs
// @access  Company
exports.createJob = async (req, res, next) => {
  try {
    const { title, description, type, location, salary, skillsRequired, eligibilityCGPA, deadline } = req.body;

    const job = await Job.create({
      title,
      description,
      type: type || 'job',
      location,
      salary,
      skillsRequired: typeof skillsRequired === 'string' ? skillsRequired.split(',').map((s) => s.trim()) : skillsRequired,
      eligibilityCGPA: eligibilityCGPA || 0,
      deadline,
      company: req.user._id,
      companyName: req.user.companyName || req.user.name,
    });

    res.status(201).json(job);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all active jobs with pagination & advanced filters
// @route   GET /api/jobs?page=1&limit=12&type=&search=&location=
exports.getJobs = async (req, res, next) => {
  try {
    // Close any expired jobs first
    await closeExpiredJobs();

    const { type, search, location, minCGPA } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const filter = { isActive: true };

    if (type) filter.type = type;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (minCGPA) filter.eligibilityCGPA = { $lte: parseFloat(minCGPA) };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { skillsRequired: { $regex: search, $options: 'i' } },
      ];
    }

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .populate('company', 'name companyName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Job.countDocuments(filter),
    ]);

    // Attach application count to each job
    const jobsWithCount = await Promise.all(
      jobs.map(async (job) => {
        const applicationCount = await Application.countDocuments({ job: job._id });
        return { ...job.toObject(), applicationCount };
      })
    );

    res.json({
      jobs: jobsWithCount,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job by ID (with application count)
// @route   GET /api/jobs/:id
exports.getJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      'company',
      'name companyName email website description'
    );

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const applicationCount = await Application.countDocuments({ job: job._id });
    res.json({ ...job.toObject(), applicationCount });
  } catch (error) {
    next(error);
  }
};

// @desc    Get jobs posted by current company
// @route   GET /api/jobs/my
exports.getMyJobs = async (req, res, next) => {
  try {
    // Close any expired jobs first
    await closeExpiredJobs();

    const jobs = await Job.find({ company: req.user._id }).sort({ createdAt: -1 });

    // Attach application count to each job
    const jobsWithCount = await Promise.all(
      jobs.map(async (job) => {
        const applicationCount = await Application.countDocuments({ job: job._id });
        return { ...job.toObject(), applicationCount };
      })
    );

    res.json(jobsWithCount);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Company (owner)
exports.updateJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Ensure the company owns this job
    if (job.company.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }

    // Parse skillsRequired if string
    if (req.body.skillsRequired && typeof req.body.skillsRequired === 'string') {
      req.body.skillsRequired = req.body.skillsRequired.split(',').map((s) => s.trim());
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json(job);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Company (owner) or Admin
exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Company owner or admin can delete
    if (
      job.company.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    await job.deleteOne();
    res.json({ message: 'Job removed' });
  } catch (error) {
    next(error);
  }
};

// ========== BOOKMARK FUNCTIONS (Students only) ==========

// @desc    Toggle bookmark on a job
// @route   POST /api/jobs/:id/bookmark
// @access  Student
exports.toggleBookmark = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const jobId = req.params.id;
    const user = await User.findById(req.user._id);

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if already bookmarked
    const isBookmarked = user.bookmarkedJobs.includes(jobId);

    if (isBookmarked) {
      // Remove bookmark
      user.bookmarkedJobs = user.bookmarkedJobs.filter(
        (id) => id.toString() !== jobId
      );
      await user.save();
      res.json({ message: 'Bookmark removed', bookmarked: false });
    } else {
      // Add bookmark
      user.bookmarkedJobs.push(jobId);
      await user.save();
      res.json({ message: 'Job bookmarked', bookmarked: true });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's bookmarked jobs
// @route   GET /api/jobs/bookmarks
// @access  Student
exports.getBookmarkedJobs = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user._id).populate({
      path: 'bookmarkedJobs',
      populate: { path: 'company', select: 'name companyName email' },
    });

    // Filter out null references (deleted jobs)
    const bookmarks = user.bookmarkedJobs.filter((job) => job !== null);
    res.json(bookmarks);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's bookmark IDs only (for quick lookup)
// @route   GET /api/jobs/bookmarks/ids
// @access  Student
exports.getBookmarkIds = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user._id).select('bookmarkedJobs');
    res.json(user.bookmarkedJobs || []);
  } catch (error) {
    next(error);
  }
};

// @desc    Get skill-based job recommendations for a student
// @route   GET /api/jobs/recommendations
// @access  Student
exports.getRecommendedJobs = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const student = await User.findById(req.user._id).select('skills cgpa');

    const studentSkills = (student.skills || []).map((s) => s.toLowerCase().trim());

    if (studentSkills.length === 0) {
      return res.json([]);
    }

    // Get all active jobs
    const jobs = await Job.find({ isActive: true }).sort({ createdAt: -1 });

    // Calculate match score for each job
    const scored = jobs.map((job) => {
      const jobSkills = (job.skillsRequired || []).map((s) => s.toLowerCase().trim());

      if (jobSkills.length === 0) {
        return null; // skip jobs with no skill requirements
      }

      // Find which student skills match job requirements
      const matchedSkills = studentSkills.filter((sk) =>
        jobSkills.some((jsk) => jsk.includes(sk) || sk.includes(jsk))
      );

      const matchScore = Math.round((matchedSkills.length / jobSkills.length) * 100);

      if (matchScore === 0) return null;

      return {
        ...job.toObject(),
        matchScore,
        matchedSkills: matchedSkills.map(
          (ms) => job.skillsRequired.find((s) => s.toLowerCase().trim().includes(ms) || ms.includes(s.toLowerCase().trim())) || ms
        ),
      };
    });

    // Filter nulls, sort by score desc, limit to top 6
    const recommendations = scored
      .filter(Boolean)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 6);

    res.json(recommendations);
  } catch (error) {
    next(error);
  }
};
