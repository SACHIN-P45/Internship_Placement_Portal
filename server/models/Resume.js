// Resume model — Store resume documents in database
const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
    },
    originalFileName: {
      type: String,
      required: [true, 'Original file name is required'],
    },
    mimeType: {
      type: String,
      default: 'application/pdf',
    },
    fileSize: {
      type: Number,
      required: [true, 'File size is required'],
    },
    fileData: {
      type: Buffer,
      required: [true, 'File data is required'],
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },
    isActive: {
      type: Boolean,
      default: true, // Mark as active resume
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Create index for faster queries
resumeSchema.index({ userId: 1, isActive: 1 });

module.exports = mongoose.model('Resume', resumeSchema);
