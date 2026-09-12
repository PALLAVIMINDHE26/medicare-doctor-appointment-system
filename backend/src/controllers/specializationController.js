const asyncHandler = require('express-async-handler');
const Specialization = require('../models/Specialization');
const Doctor = require('../models/Doctor');
const ApiError = require('../utils/apiError');

// @desc    List all specializations (public — used by search filters, registration forms)
// @route   GET /api/specializations
// @access  Public
const getSpecializations = asyncHandler(async (req, res) => {
  const { includeInactive } = req.query;
  const filter = includeInactive === 'true' ? {} : { isActive: true };
  const specializations = await Specialization.find(filter).sort({ name: 1 });
  res.json({ success: true, count: specializations.length, data: specializations });
});

// @desc    Create a specialization
// @route   POST /api/specializations
// @access  Private/Admin
const createSpecialization = asyncHandler(async (req, res) => {
  const { name, description, icon } = req.body;

  const existing = await Specialization.findOne({ name: new RegExp(`^${name}$`, 'i') });
  if (existing) {
    throw new ApiError(409, 'A specialization with this name already exists');
  }

  const specialization = await Specialization.create({ name, description, icon });
  res.status(201).json({ success: true, data: specialization });
});

// @desc    Update a specialization
// @route   PUT /api/specializations/:id
// @access  Private/Admin
const updateSpecialization = asyncHandler(async (req, res) => {
  const { name, description, icon, isActive } = req.body;

  const specialization = await Specialization.findById(req.params.id);
  if (!specialization) throw new ApiError(404, 'Specialization not found');

  if (name !== undefined) specialization.name = name;
  if (description !== undefined) specialization.description = description;
  if (icon !== undefined) specialization.icon = icon;
  if (isActive !== undefined) specialization.isActive = isActive;

  await specialization.save();
  res.json({ success: true, data: specialization });
});

// @desc    Delete a specialization (blocked if doctors reference it)
// @route   DELETE /api/specializations/:id
// @access  Private/Admin
const deleteSpecialization = asyncHandler(async (req, res) => {
  const specialization = await Specialization.findById(req.params.id);
  if (!specialization) throw new ApiError(404, 'Specialization not found');

  const doctorCount = await Doctor.countDocuments({ specialization: specialization._id });
  if (doctorCount > 0) {
    throw new ApiError(
      400,
      `Cannot delete: ${doctorCount} doctor(s) are assigned to this specialization. Deactivate it instead.`
    );
  }

  await specialization.deleteOne();
  res.json({ success: true, message: 'Specialization deleted' });
});

module.exports = {
  getSpecializations,
  createSpecialization,
  updateSpecialization,
  deleteSpecialization,
};
