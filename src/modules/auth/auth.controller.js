const asyncHandler = require('../../common/utils/asyncHandler');
const authService = require('./auth.service');

const register = asyncHandler(async (req, res) => {
  const data = await authService.register(req.body);
  res.status(201).json({ message: 'Registered successfully', data });
});

const login = asyncHandler(async (req, res) => {
  const data = await authService.login(req.body);
  res.json({ message: 'Logged in successfully', data });
});

module.exports = { register, login };