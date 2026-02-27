// User model — supports Student, Company, Admin, and PlacementHead roles
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: function () {
        // Password required only for non-OAuth users
        return !this.googleId && !this.githubId;
      },
      minlength: 6,
      select: false, // hide password by default
    },
    /* -------- OAuth fields -------- */
    googleId: { type: String, default: null },
    githubId: { type: String, default: null },
    avatar: { type: String, default: '' },

    role: {
      type: String,
      enum: ['student', 'company', 'admin', 'placementHead'],
      default: 'student',
    },

    /* -------- Student-specific fields -------- */
    department: { type: String, default: '' },
    cgpa: { type: Number, default: 0, min: 0, max: 10 },
    skills: [{ type: String }],
    resume: { type: String, default: '' }, // file path to uploaded PDF
    phone: { type: String, default: '' },
    bio: { type: String, default: '', maxlength: 500 },

    /* -------- Company-specific fields -------- */
    companyName: { type: String, default: '' },
    website: { type: String, default: '' },
    description: { type: String, default: '', maxlength: 1000 },
    industry: { type: String, default: '' },
    companySize: { type: String, default: '' },
    isApproved: { type: Boolean, default: false }, // admin must approve

    /* -------- Common fields -------- */
    isBlocked: { type: Boolean, default: false },
    lastActive: { type: Date, default: null }, // updated by auth middleware on requests

    /* -------- Password Reset -------- */
    resetPasswordToken: { type: String, default: null, select: false },
    resetPasswordTokenExpiry: { type: Date, default: null, select: false },

    /* -------- Bookmarks (students only) -------- */
    bookmarkedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
