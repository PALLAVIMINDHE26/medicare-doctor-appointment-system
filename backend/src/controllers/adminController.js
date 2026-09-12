const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Specialization = require('../models/Specialization');
const { todayUTC } = require('../utils/dateUtils');

// @desc    System-wide dashboard statistics for the admin
// @route   GET /api/admin/dashboard-stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const todayStart = todayUTC();
  const thirtyDaysAgo = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);

  const [
    totalDoctors,
    activeDoctors,
    pendingDoctors,
    totalPatients,
    totalAppointments,
    todayAppointments,
    statusBreakdown,
    appointmentsByDay,
    topSpecializations,
    revenueAgg,
  ] = await Promise.all([
    Doctor.countDocuments({}),
    Doctor.countDocuments({ status: 'approved', isActive: true }),
    Doctor.countDocuments({ status: 'pending' }),
    Patient.countDocuments({}),
    Appointment.countDocuments({}),
    Appointment.countDocuments({ date: { $gte: todayStart, $lt: new Date(todayStart.getTime() + 86400000) } }),
    Appointment.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Appointment.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Appointment.aggregate([
      {
        $lookup: {
          from: 'specializations',
          localField: 'specialization',
          foreignField: '_id',
          as: 'spec',
        },
      },
      { $unwind: '$spec' },
      { $group: { _id: '$spec.name', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]),
    Appointment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$consultationFee' } } },
    ]),
  ]);

  const statusCounts = { pending: 0, confirmed: 0, completed: 0, cancelled: 0, rejected: 0, 'no-show': 0 };
  statusBreakdown.forEach((s) => {
    statusCounts[s._id] = s.count;
  });

  res.json({
    success: true,
    data: {
      totalDoctors,
      activeDoctors,
      pendingDoctors,
      totalPatients,
      totalAppointments,
      todayAppointments,
      totalRevenue: revenueAgg[0]?.total || 0,
      statusCounts,
      appointmentsByDay,
      topSpecializations,
    },
  });
});

module.exports = { getDashboardStats };
