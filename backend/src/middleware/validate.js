const { validationResult } = require('express-validator');
const ApiError = require('../utils/apiError');

/**
 * Runs after an array of express-validator checks. Collects all failures
 * into a single 400 response instead of failing on the first one, so the
 * frontend can show every field error at once.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    const err = new ApiError(400, 'Validation failed');
    err.errors = messages;
    return next(err);
  }
  next();
};

module.exports = validate;
