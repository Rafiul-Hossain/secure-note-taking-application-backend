const asyncHandler = require('../../common/utils/asyncHandler');
const { getPagination } = require('../../common/utils/pagination');
const postService = require('./post.service');

const create = asyncHandler(async (req, res) => {
  const data = await postService.createPost(req.user._id, req.body);
  res.status(201).json({ message: 'Post created', data });
});

const listByUser = asyncHandler(async (req, res) => {
  const { user, posts, meta } = await postService.getPostsByUser(
    req.params.userId,
    getPagination(req.query)
  );
  res.json({ message: 'User posts fetched', data: { user, posts }, meta });
});

const listAll = asyncHandler(async (req, res) => {
  const { items, meta } = await postService.listAllPosts(getPagination(req.query));
  res.json({ message: 'Posts fetched', data: items, meta });
});

module.exports = { create, listByUser, listAll };