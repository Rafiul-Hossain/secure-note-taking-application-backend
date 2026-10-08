const mongoose = require('mongoose');
const Post = require('./post.model');
const User = require('../users/user.model');
const ApiError = require('../../common/utils/ApiError');
const { buildMeta } = require('../../common/utils/pagination');

const createPost = async (userId, { title, content }) => {
  if (!title || !content) {
    throw new ApiError(400, 'title and content are required');
  }
  return Post.create({ title, content, author: userId });
};

// Scenario 2: all posts of a particular user, ONE pipeline with $lookup.
// Pagination and the total count are done inside the same pipeline.
const getPostsByUser = async (userId, { page, limit, skip }) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new ApiError(400, 'Invalid user id');
  }

  const result = await User.aggregate([
    // default _id index
    { $match: { _id: new mongoose.Types.ObjectId(userId) } },

    // the user's posts for this page, newest first (uses { author: 1, _id: -1 })
    {
      $lookup: {
        from: Post.collection.name,
        let: { uid: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$author', '$$uid'] } } },
          { $sort: { _id: -1 } },
          { $skip: skip },
          { $limit: limit },
        ],
        as: 'posts',
      },
    },

    // total number of posts of this user (uses { author: 1, _id: -1 })
    {
      $lookup: {
        from: Post.collection.name,
        let: { uid: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$author', '$$uid'] } } },
          { $count: 'count' },
        ],
        as: 'totalCount',
      },
    },

    {
      $project: {
        _id: 1,
        name: 1,
        posts: 1,
        total: { $ifNull: [{ $arrayElemAt: ['$totalCount.count', 0] }, 0] },
      },
    },
  ]);

  if (result.length === 0) throw new ApiError(404, 'User not found');

  const { _id, name, posts, total } = result[0];
  return {
    user: { _id, name },
    posts,
    meta: buildMeta(total, page, limit),
  };
};

// Public feed: all posts, newest first, paginated.
// Sorted by _id, so it uses the default _id index (no new index needed).
const listAllPosts = async ({ page, limit, skip }) => {
  const [items, total] = await Promise.all([
    Post.find()
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'name'), // name only, no email on a public endpoint
    Post.estimatedDocumentCount(),
  ]);
  return { items, meta: buildMeta(total, page, limit) };
};

module.exports = { createPost, getPostsByUser, listAllPosts };