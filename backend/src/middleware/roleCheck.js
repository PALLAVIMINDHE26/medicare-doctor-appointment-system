const ApiError = require('../utils/apiError');

/**
 * Restricts a route to one or more roles. Must run after `protect`, since
 * it relies on req.user being populated.
 *
 * Usage: router.get('/admin-only', protect, authorize('admin'), handler)
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, 'Not authorized');
    }
    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(403, `Role '${req.user.role}' is not permitted to perform this action`);
    }
    next();
  };
};

module.exports = { authorize };
