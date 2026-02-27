// Application model — tracks student applications to jobs
const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
    },
    resume: {
      type: String, // legacy: path to the resume used during application (for backward compatibility)
    },
    status: {
      type: String,
      enum: ['applied', 'shortlisted', 'rejected', 'selected'],
      default: 'applied',
    },
    selectedPackage: {
      type: Number, // Salary package offered (LPA) — set when status = 'selected'
      default: 0,
    },
  },
  { timestamps: true }
);

// Prevent duplicate applications (one student per job)
applicationSchema.index({ job: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
