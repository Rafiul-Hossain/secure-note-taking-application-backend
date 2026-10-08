const asyncHandler = require('../../common/utils/asyncHandler');
const { getPagination } = require('../../common/utils/pagination');
const userService = require('./user.service');

const me = asyncHandler(async (req, res) => {
  res.json({ message: 'Profile fetched', data: req.user });
});

const create = asyncHandler(async (req, res) => {
  const data = await userService.createUser(req.body);
  res.status(201).json({ message: 'User created', data });
});

const list = asyncHandler(async (req, res) => {
  const { items, meta } = await userService.listUsers(getPagination(req.query));
  res.json({ message: 'Users fetched', data: items, meta });
});

const getOne = asyncHandler(async (req, res) => {
  const data = await userService.getUserById(req.params.id);
  res.json({ message: 'User fetched', data });
});

const update = asyncHandler(async (req, res) => {
  const data = await userService.updateUser(req.params.id, req.body);
  res.json({ message: 'User updated', data });
});

const remove = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.user._id, req.params.id);
  res.json({ message: 'User deleted' });
});

const groupedByInterests = asyncHandler(async (req, res) => {
  const { items, meta } = await userService.groupByInterests(getPagination(req.query));
  res.json({ message: 'Users grouped by interests', data: items, meta });
});

module.exports = { me, create, list, getOne, update, remove, groupedByInterests };