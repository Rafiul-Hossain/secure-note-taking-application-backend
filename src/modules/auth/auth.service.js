const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../users/user.model');
const ApiError = require('../../common/utils/ApiError');

const signToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const toSafeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  interests: user.interests,
});

const register = async ({ name, email, password, interests }) => {
  if (!name || !email || !password) {
    throw new ApiError(400, 'name, email and password are required');
  }
  if (password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters');
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    password: hashed,
    interests,
    role: 'user', // public registration always creates a normal user
  });

  return { user: toSafeUser(user), token: signToken(user) };
};

const login = async ({ email, password }) => {
  if (!email || !password) {
    throw new ApiError(400, 'email and password are required');
  }

  // uses the unique email index
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  return { user: toSafeUser(user), token: signToken(user) };
};

module.exports = { register, login, toSafeUser };