// Job model — internship / placement postings by companies
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['internship', 'job'],
      default: 'job',
    },
    location: {
      type: String,
      default: 'Remote',
    },
    salary: {
      type: String,
      default: 'Not Disclosed',
    },
    package: {
      type: Number, // Salary package in LPA (Lakhs Per Annum)
      default: 0,
    },
    skillsRequired: [{ type: String }],
    eligibilityCGPA: {
      type: Number,
      default: 0,
    },
    openings: {
      type: Number,
      default: 1,
      min: 1,
    },
    experience: {
      type: String,
      enum: ['fresher', '0-1 years', '1-2 years', '2-3 years', '3+ years'],
      default: 'fresher',
    },
    deadline: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', jobSchema);
