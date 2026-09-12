const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const generateToken = require('../utils/generateToken');
const ApiError = require('../utils/apiError');

/**
 * Builds the response payload sent after successful auth: a signed JWT
 * plus a sanitized user object (password already stripped by toJSON).
 */
const sendAuthResponse = (res, statusCode, user) => {
  const token = generateToken(user._id, user.role);
  res.status(statusCode).json({
    success: true,
    token,
    user,
  });
};

// @desc    Register a new patient account (public self-signup)
// @route   POST /api/auth/register
// @access  Public
const registerPatient = asyncHandler(async (req, res) => {
  const { name, email, password, phone, dateOfBirth, gender } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const user = await User.create({ name, email, password, phone, role: 'patient' });

  await Patient.create({
    user: user._id,
    dateOfBirth: dateOfBirth || undefined,
    gender: gender || 'prefer_not_to_say',
  });

  sendAuthResponse(res, 201, user);
});

// @desc    Login for any role
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'This account has been deactivated. Contact support.');
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  sendAuthResponse(res, 200, user);
});

// @desc    Get the logged-in user's own profile (with role-specific data)
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = req.user;
  let profile = null;

  if (user.role === 'patient') {
    profile = await Patient.findOne({ user: user._id });
  } else if (user.role === 'doctor') {
    profile = await Doctor.findOne({ user: user._id }).populate('specialization', 'name');
  }

  res.json({ success: true, user, profile });
});

// @desc    Update basic account fields (name, phone, avatar) for the logged-in user
// @route   PUT /api/auth/me
// @access  Private
const updateMe = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'phone', 'avatarUrl'];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, user });
});

// @desc    Change password for the logged-in user
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  sendAuthResponse(res, 200, user);
});

module.exports = { registerPatient, login, getMe, updateMe, changePassword };
