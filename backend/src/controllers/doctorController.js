const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Specialization = require('../models/Specialization');
const ApiError = require('../utils/apiError');
const { getAvailableSlots } = require('../utils/slotGenerator');
const { todayUTC, parseDateOnly } = require('../utils/dateUtils');

// @desc    Public search/list of doctors with filters + pagination
// @route   GET /api/doctors
// @access  Public
const getDoctors = asyncHandler(async (req, res) => {
  const {
    search = '',
    specialization,
    minFee,
    maxFee,
    minExperience,
    sortBy = 'name',
    page = 1,
    limit = 9,
  } = req.query;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 9, 1), 50);

  const matchStage = { status: 'approved', isActive: true };
  if (specialization) matchStage.specialization = new mongoose.Types.ObjectId(specialization);
  if (minFee || maxFee) {
    matchStage.consultationFee = {};
    if (minFee) matchStage.consultationFee.$gte = Number(minFee);
    if (maxFee) matchStage.consultationFee.$lte = Number(maxFee);
  }
  if (minExperience) matchStage.experienceYears = { $gte: Number(minExperience) };

  const pipeline = [
    { $match: matchStage },
    {
      $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' },
    },
    { $unwind: '$user' },
    {
      $lookup: {
        from: 'specializations',
        localField: 'specialization',
        foreignField: '_id',
        as: 'specialization',
      },
    },
    { $unwind: '$specialization' },
  ];

  if (search) {
    pipeline.push({
      $match: {
        $or: [
          { 'user.name': { $regex: search, $options: 'i' } },
          { 'specialization.name': { $regex: search, $options: 'i' } },
        ],
      },
    });
  }

  const sortMap = {
    name: { 'user.name': 1 },
    experience: { experienceYears: -1 },
    fee_low: { consultationFee: 1 },
    fee_high: { consultationFee: -1 },
    rating: { rating: -1 },
  };
  pipeline.push({ $sort: sortMap[sortBy] || sortMap.name });

  const countPipeline = [...pipeline, { $count: 'total' }];
  const [countResult] = await Doctor.aggregate(countPipeline);
  const total = countResult ? countResult.total : 0;

  pipeline.push({ $skip: (pageNum - 1) * limitNum }, { $limit: limitNum });
  pipeline.push({
    $project: {
      consultationFee: 1,
      experienceYears: 1,
      appointmentDurationMinutes: 1,
      qualifications: 1,
      bio: 1,
      rating: 1,
      totalReviews: 1,
      clinicAddress: 1,
      languages: 1,
      'user._id': 1,
      'user.name': 1,
      'user.email': 1,
      'user.avatarUrl': 1,
      'specialization._id': 1,
      'specialization.name': 1,
      'specialization.icon': 1,
    },
  });

  const doctors = await Doctor.aggregate(pipeline);

  res.json({
    success: true,
    count: doctors.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
    data: doctors,
  });
});

// @desc    Get a single doctor's public profile
// @route   GET /api/doctors/:id
// @access  Public
const getDoctorById = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({
    _id: req.params.id,
    status: 'approved',
    isActive: true,
  })
    .populate('user', 'name email avatarUrl')
    .populate('specialization', 'name icon');

  if (!doctor) throw new ApiError(404, 'Doctor not found');

  res.json({ success: true, data: doctor });
});

// @desc    Get available time slots for a doctor on a given date
// @route   GET /api/doctors/:id/availability?date=YYYY-MM-DD
// @access  Public
const getDoctorAvailability = asyncHandler(async (req, res) => {
  const { date } = req.query;
  if (!date || Number.isNaN(Date.parse(date))) {
    throw new ApiError(400, 'A valid date query parameter (YYYY-MM-DD) is required');
  }

  const doctor = await Doctor.findOne({ _id: req.params.id, status: 'approved', isActive: true });
  if (!doctor) throw new ApiError(404, 'Doctor not found');

  const targetDate = parseDateOnly(date);

  if (targetDate < todayUTC()) {
    return res.json({ success: true, date, slots: [] });
  }

  const startOfDay = new Date(targetDate);
  const endOfDay = new Date(targetDate);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const existingAppointments = await Appointment.find({
    doctor: doctor._id,
    date: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ['pending', 'confirmed', 'completed'] },
  }).select('startTime');

  const bookedStartTimes = existingAppointments.map((a) => a.startTime);

  const slots = getAvailableSlots(
    doctor.workingHours,
    targetDate,
    doctor.appointmentDurationMinutes,
    bookedStartTimes
  );

  res.json({ success: true, date, appointmentDurationMinutes: doctor.appointmentDurationMinutes, slots });
});

// @desc    Get logged-in doctor's own full profile
// @route   GET /api/doctors/me
// @access  Private/Doctor
const getMyDoctorProfile = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id })
    .populate('user', 'name email phone avatarUrl')
    .populate('specialization', 'name icon');

  if (!doctor) throw new ApiError(404, 'Doctor profile not found');
  res.json({ success: true, data: doctor });
});

// @desc    Update logged-in doctor's professional profile
// @route   PUT /api/doctors/me
// @access  Private/Doctor
const updateMyDoctorProfile = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) throw new ApiError(404, 'Doctor profile not found');

  const allowedFields = [
    'specialization',
    'qualifications',
    'experienceYears',
    'bio',
    'consultationFee',
    'appointmentDurationMinutes',
    'clinicAddress',
    'languages',
  ];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) doctor[field] = req.body[field];
  });

  await doctor.save();
  await doctor.populate('specialization', 'name icon');
  res.json({ success: true, data: doctor });
});

// @desc    Update logged-in doctor's weekly working hours
// @route   PUT /api/doctors/me/working-hours
// @access  Private/Doctor
const updateMyWorkingHours = asyncHandler(async (req, res) => {
  const { workingHours } = req.body;

  if (!Array.isArray(workingHours) || workingHours.length === 0) {
    throw new ApiError(400, 'workingHours must be a non-empty array');
  }

  for (const wh of workingHours) {
    if (wh.isWorking && wh.startTime >= wh.endTime) {
      throw new ApiError(400, `Invalid hours for ${wh.day}: start time must be before end time`);
    }
  }

  const doctor = await Doctor.findOneAndUpdate(
    { user: req.user._id },
    { workingHours },
    { new: true, runValidators: true }
  );

  if (!doctor) throw new ApiError(404, 'Doctor profile not found');
  res.json({ success: true, data: doctor });
});

// @desc    Dashboard statistics for the logged-in doctor
// @route   GET /api/doctors/me/dashboard-stats
// @access  Private/Doctor
const getMyDashboardStats = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) throw new ApiError(404, 'Doctor profile not found');

  const now = new Date();
  const todayStart = todayUTC();
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000 - 1);

  const [statusCounts, todayCount, totalPatients, upcoming, last7DaysRaw] = await Promise.all([
    Appointment.aggregate([
      { $match: { doctor: doctor._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Appointment.countDocuments({
      doctor: doctor._id,
      date: { $gte: todayStart, $lte: todayEnd },
      status: { $in: ['pending', 'confirmed'] },
    }),
    Appointment.distinct('patient', { doctor: doctor._id }),
    Appointment.find({
      doctor: doctor._id,
      date: { $gte: todayStart },
      status: { $in: ['pending', 'confirmed'] },
    })
      .sort({ date: 1, startTime: 1 })
      .limit(5)
      .populate({ path: 'patient', populate: { path: 'user', select: 'name avatarUrl' } }),
    Appointment.aggregate([
      {
        $match: {
          doctor: doctor._id,
          date: { $gte: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const counts = { pending: 0, confirmed: 0, completed: 0, cancelled: 0, rejected: 0, 'no-show': 0 };
  statusCounts.forEach((s) => {
    counts[s._id] = s.count;
  });

  res.json({
    success: true,
    data: {
      totalAppointments: Object.values(counts).reduce((a, b) => a + b, 0),
      todayAppointments: todayCount,
      totalPatients: totalPatients.length,
      statusCounts: counts,
      upcomingAppointments: upcoming,
      last7Days: last7DaysRaw,
    },
  });
});

// @desc    List distinct patients who have booked with the logged-in doctor
// @route   GET /api/doctors/me/patients
// @access  Private/Doctor
const getMyPatients = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) throw new ApiError(404, 'Doctor profile not found');

  const { search = '', page = 1, limit = 10 } = req.query;
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);

  const patientIds = await Appointment.distinct('patient', { doctor: doctor._id });

  const matchStage = { _id: { $in: patientIds } };

  const pipeline = [
    { $match: matchStage },
    { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } },
    { $unwind: '$user' },
  ];

  if (search) {
    pipeline.push({ $match: { 'user.name': { $regex: search, $options: 'i' } } });
  }

  const countResult = await Patient.aggregate([...pipeline, { $count: 'total' }]);
  const total = countResult[0]?.total || 0;

  pipeline.push({ $sort: { 'user.name': 1 } });
  pipeline.push({ $skip: (pageNum - 1) * limitNum }, { $limit: limitNum });

  const patients = await Patient.aggregate(pipeline);

  // attach appointment count per patient with this doctor
  const withCounts = await Promise.all(
    patients.map(async (p) => {
      const count = await Appointment.countDocuments({ doctor: doctor._id, patient: p._id });
      return { ...p, appointmentCount: count };
    })
  );

  res.json({
    success: true,
    count: withCounts.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
    data: withCounts,
  });
});

// ---------- Admin-only doctor management ----------

// @desc    Admin: list all doctors (any status), paginated + filterable
// @route   GET /api/doctors/admin/all
// @access  Private/Admin
const adminGetAllDoctors = asyncHandler(async (req, res) => {
  const { search = '', status, specialization, page = 1, limit = 10 } = req.query;
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

  const matchStage = {};
  if (status) matchStage.status = status;
  if (specialization) matchStage.specialization = new mongoose.Types.ObjectId(specialization);

  const pipeline = [
    { $match: matchStage },
    { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } },
    { $unwind: '$user' },
    {
      $lookup: {
        from: 'specializations',
        localField: 'specialization',
        foreignField: '_id',
        as: 'specialization',
      },
    },
    { $unwind: '$specialization' },
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

  const countResult = await Doctor.aggregate([...pipeline, { $count: 'total' }]);
  const total = countResult[0]?.total || 0;

  pipeline.push({ $sort: { createdAt: -1 } });
  pipeline.push({ $skip: (pageNum - 1) * limitNum }, { $limit: limitNum });

  const doctors = await Doctor.aggregate(pipeline);

  res.json({
    success: true,
    count: doctors.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
    data: doctors,
  });
});

// @desc    Admin: create a doctor account (user + doctor profile in one step)
// @route   POST /api/doctors
// @access  Private/Admin
const adminCreateDoctor = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    phone,
    specialization,
    qualifications,
    experienceYears,
    bio,
    consultationFee,
    appointmentDurationMinutes,
    clinicAddress,
    languages,
  } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'An account with this email already exists');

  const specExists = await Specialization.findById(specialization);
  if (!specExists) throw new ApiError(400, 'Invalid specialization');

  const user = await User.create({ name, email, password, phone, role: 'doctor' });

  const doctor = await Doctor.create({
    user: user._id,
    specialization,
    qualifications,
    experienceYears,
    bio,
    consultationFee,
    appointmentDurationMinutes,
    clinicAddress,
    languages,
    status: 'approved',
  });

  await doctor.populate([{ path: 'user', select: 'name email phone' }, { path: 'specialization', select: 'name' }]);

  res.status(201).json({ success: true, data: doctor });
});

// @desc    Admin: update doctor status (approve/reject) or active flag
// @route   PUT /api/doctors/:id/status
// @access  Private/Admin
const adminUpdateDoctorStatus = asyncHandler(async (req, res) => {
  const { status, isActive } = req.body;

  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) throw new ApiError(404, 'Doctor not found');

  if (status !== undefined) doctor.status = status;
  if (isActive !== undefined) doctor.isActive = isActive;

  await doctor.save();
  res.json({ success: true, data: doctor });
});

// @desc    Admin: delete a doctor (and their user account)
// @route   DELETE /api/doctors/:id
// @access  Private/Admin
const adminDeleteDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) throw new ApiError(404, 'Doctor not found');

  const activeAppointments = await Appointment.countDocuments({
    doctor: doctor._id,
    status: { $in: ['pending', 'confirmed'] },
  });
  if (activeAppointments > 0) {
    throw new ApiError(
      400,
      `Cannot delete: doctor has ${activeAppointments} active appointment(s). Cancel them first.`
    );
  }

  await User.findByIdAndDelete(doctor.user);
  await doctor.deleteOne();

  res.json({ success: true, message: 'Doctor deleted' });
});

module.exports = {
  getDoctors,
  getDoctorById,
  getDoctorAvailability,
  getMyDoctorProfile,
  updateMyDoctorProfile,
  updateMyWorkingHours,
  getMyDashboardStats,
  getMyPatients,
  adminGetAllDoctors,
  adminCreateDoctor,
  adminUpdateDoctorStatus,
  adminDeleteDoctor,
};
