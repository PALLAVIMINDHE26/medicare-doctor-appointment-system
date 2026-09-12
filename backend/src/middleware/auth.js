const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const ApiError = require('../utils/apiError');

/**
 * Verifies the Bearer token on the request, loads the corresponding user,
 * and attaches it to req.user. Rejects if the token is missing, invalid,
 * expired, the user no longer exists, the account is deactivated, or the
 * password was changed after the token was issued (forces re-login).
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized — no token provided');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Session expired. Please log in again.');
    }
    throw new ApiError(401, 'Not authorized — invalid token');
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    throw new ApiError(401, 'The user belonging to this token no longer exists');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'This account has been deactivated. Contact support.');
  }

  if (user.passwordChangedAt) {
    const changedTimestamp = Math.floor(user.passwordChangedAt.getTime() / 1000);
    if (decoded.iat < changedTimestamp) {
      throw new ApiError(401, 'Password was recently changed. Please log in again.');
    }
  }

  req.user = user;
  next();
});

module.exports = { protect };
