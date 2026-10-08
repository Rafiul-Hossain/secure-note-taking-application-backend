const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Supports the $lookup (posts of a given user, newest first)
postSchema.index({ author: 1, _id: -1 });

module.exports = mongoose.model('Post', postSchema);