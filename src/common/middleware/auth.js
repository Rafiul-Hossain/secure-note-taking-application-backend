const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../../modules/users/user.model');

const auth = asyncHandler(async (req, res, next) => {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw new ApiError(401, 'Authentication required');
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired token');
  }

  const user = await User.findById(payload.id); // uses the default _id index
  if (!user) throw new ApiError(401, 'User no longer exists');

  req.user = user;
  next();
});

module.exports = auth;