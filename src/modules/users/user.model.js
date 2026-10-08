const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    interests: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Login lookup by email + uniqueness
userSchema.index({ email: 1 }, { unique: true });

// Multikey index for the "group users by interests" aggregation
userSchema.index({ interests: 1 });

module.exports = mongoose.model('User', userSchema);