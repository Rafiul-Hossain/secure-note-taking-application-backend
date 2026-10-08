const bcrypt = require('bcryptjs');
const User = require('./user.model');
const Note = require('../notes/note.model');
const Post = require('../posts/post.model');
const ApiError = require('../../common/utils/ApiError');
const { buildMeta } = require('../../common/utils/pagination');

const stripPassword = (user) => {
  const obj = user.toObject();
  delete obj.password;
  return obj;
};
const createUser = async ({ name, email, password, role, interests }) => {
  if (!name || !email || !password) {
    throw new ApiError(400, 'name, email and password are required');
  }
  if (password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters');
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed, role, interests });
  return stripPassword(user);
};
const listUsers = async ({ page, limit, skip }) => {
  const [items, total] = await Promise.all([
    User.find().sort({ _id: -1 }).skip(skip).limit(limit),
    User.estimatedDocumentCount(),
  ]);
  return { items, meta: buildMeta(total, page, limit) };
};
const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};
const updateUser = async (id, { name, email, password, role, interests }) => {
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (email !== undefined) updates.email = email.toLowerCase();
  if (role !== undefined) updates.role = role;
  if (interests !== undefined) updates.interests = interests;
  if (password !== undefined) {
    if (password.length < 6) {
      throw new ApiError(400, 'Password must be at least 6 characters');
    }
    updates.password = await bcrypt.hash(password, 10);
  }
  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, 'Provide at least one field to update');
  }

  const user = await User.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};
const deleteUser = async (adminId, id) => {
  if (String(adminId) === String(id)) {
    throw new ApiError(400, 'You cannot delete your own account');
  }

  const user = await User.findByIdAndDelete(id);
  if (!user) throw new ApiError(404, 'User not found');

  await Promise.all([
    Note.deleteMany({ owner: id }), // uses { owner: 1, _id: -1 }
    Post.deleteMany({ author: id }), // uses { author: 1, _id: -1 }
  ]);
};
const groupByInterests = async ({ page, limit, skip }) => {
  const result = await User.aggregate([
    { $match: { interests: { $gt: '' } } },
    { $unwind: '$interests' },
    {
      $group: {
        _id: '$interests',
        count: { $sum: 1 },
        users: {
          $addToSet: { _id: '$_id', name: '$name', email: '$email' },
        },
      },
    },
    { $sort: { _id: 1 } },
    {
      $facet: {
        data: [
          { $skip: skip },
          { $limit: limit },
          { $project: { _id: 0, interest: '$_id', count: 1, users: 1 } },
        ],
        total: [{ $count: 'count' }],
      },
    },
  ]);

  const items = result[0].data;
  const total = result[0].total[0] ? result[0].total[0].count : 0;
  return { items, meta: buildMeta(total, page, limit) };
};

module.exports = {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
  groupByInterests,
};