const asyncHandler = require('express-async-handler');
const Patient = require('../models/Patient');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const ApiError = require('../utils/apiError');
const { todayUTC } = require('../utils/dateUtils');

// @desc    Get logged-in patient's own profile
// @route   GET /api/patients/me
// @access  Private/Patient
const getMyPatientProfile = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id }).populate(
    'user',
    'name email phone avatarUrl'
  );
  if (!patient) throw new ApiError(404, 'Patient profile not found');
  res.json({ success: true, data: patient });
});

// @desc    Update logged-in patient's medical/profile details
// @route   PUT /api/patients/me
// @access  Private/Patient
const updateMyPatientProfile = asyncHandler(async (req, res) => {
  const allowedFields = [
    'dateOfBirth',
    'gender',
    'bloodGroup',
    'address',
    'emergencyContactName',
    'emergencyContactPhone',
    'allergies',
    'chronicConditions',
  ];

  const patient = await Patient.findOne({ user: req.user._id });
  if (!patient) throw new ApiError(404, 'Patient profile not found');

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) patient[field] = req.body[field];
  });

  await patient.save();
  res.json({ success: true, data: patient });
});

// @desc    Dashboard stats for the logged-in patient
// @route   GET /api/patients/me/dashboard-stats
// @access  Private/Patient
const getMyPatientDashboardStats = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id });
  if (!patient) throw new ApiError(404, 'Patient profile not found');

  const startOfToday = todayUTC();

  const [upcomingCount, completedCount, cancelledCount, nextAppointment] = await Promise.all([
    Appointment.countDocuments({
      patient: patient._id,
      status: { $in: ['pending', 'confirmed'] },
      date: { $gte: startOfToday },
    }),
    Appointment.countDocuments({ patient: patient._id, status: 'completed' }),
    Appointment.countDocuments({ patient: patient._id, status: { $in: ['cancelled', 'rejected'] } }),
    Appointment.findOne({
      patient: patient._id,
      status: { $in: ['pending', 'confirmed'] },
      date: { $gte: startOfToday },
    })
      .sort({ date: 1, startTime: 1 })
      .populate({ path: 'doctor', populate: [{ path: 'user', select: 'name avatarUrl' }, { path: 'specialization', select: 'name' }] }),
  ]);

  res.json({
    success: true,
    data: { upcomingCount, completedCount, cancelledCount, nextAppointment },
  });
});

// ---------- Admin-only patient management ----------

// @desc    Admin: list all patients, searchable + paginated
// @route   GET /api/patients/admin/all
// @access  Private/Admin
const adminGetAllPatients = asyncHandler(async (req, res) => {
  const { search = '', page = 1, limit = 10 } = req.query;
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

  const pipeline = [
    { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } },
    { $unwind: '$user' },
  ];

  if (search) {
    pipeline.push({
      $match: {
        $or: [
          { 'user.name': { $regex: search, $options: 'i' } },
          { 'user.email': { $regex: search, $options: 'i' } },
        ],
      },
    });
  }

  const countResult = await Patient.aggregate([...pipeline, { $count: 'total' }]);
  const total = countResult[0]?.total || 0;

  pipeline.push({ $sort: { createdAt: -1 } });
  pipeline.push({ $skip: (pageNum - 1) * limitNum }, { $limit: limitNum });

  const patients = await Patient.aggregate(pipeline);

  res.json({
    success: true,
    count: patients.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
    data: patients,
  });
});

// @desc    Admin: toggle a patient's account active status
// @route   PUT /api/patients/:id/status
// @access  Private/Admin
const adminUpdatePatientStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;

  const patient = await Patient.findById(req.params.id);
  if (!patient) throw new ApiError(404, 'Patient not found');

  await User.findByIdAndUpdate(patient.user, { isActive });

  res.json({ success: true, message: `Patient account ${isActive ? 'activated' : 'deactivated'}` });
});

module.exports = {
  getMyPatientProfile,
  updateMyPatientProfile,
  getMyPatientDashboardStats,
  adminGetAllPatients,
  adminUpdatePatientStatus,
};
