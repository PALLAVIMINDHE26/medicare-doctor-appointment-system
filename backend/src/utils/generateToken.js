const jwt = require('jsonwebtoken');

/**
 * Signs a JWT carrying the minimum claims needed to authorize requests.
 * Keeping the payload small avoids leaking data and keeps tokens light.
 */
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

module.exports = generateToken;
