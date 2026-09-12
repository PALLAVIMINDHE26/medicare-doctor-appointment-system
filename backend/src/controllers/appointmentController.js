const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const ApiError = require('../utils/apiError');
const { getAvailableSlots, toMinutes, WEEKDAYS } = require('../utils/slotGenerator');
const { todayUTC, parseDateOnly, isSameUTCDate } = require('../utils/dateUtils');

/**
 * Server-side re-validation of a requested slot. This is the single source
 * of truth for "can this appointment happen" — the frontend only fetching
 * /availability is a UX convenience, never trusted on its own, because the
 * slot could be taken between the GET and the POST.
 */
const validateSlotOrThrow = async (doctor, targetDate, startTime) => {
  const dayName = WEEKDAYS[targetDate.getUTCDay()];
  const workingHour = doctor.workingHours.find((wh) => wh.day === dayName);

  if (!workingHour || !workingHour.isWorking) {
    throw new ApiError(400, `Doctor does not work on ${dayName}`);
  }

  const slotStart = toMinutes(startTime);
  const windowStart = toMinutes(workingHour.startTime);
  const windowEnd = toMinutes(workingHour.endTime);
  const duration = doctor.appointmentDurationMinutes;

  if (slotStart < windowStart || slotStart + duration > windowEnd) {
    throw new ApiError(400, 'Requested time is outside the doctor\'s working hours');
  }

  // Must land exactly on a valid slot boundary (prevents e.g. 09:07 bookings)
  if ((slotStart - windowStart) % duration !== 0) {
    throw new ApiError(400, 'Requested time does not align with the doctor\'s appointment slots');
  }

  const now = new Date();
  if (isSameUTCDate(now, targetDate) && slotStart <= now.getUTCHours() * 60 + now.getUTCMinutes()) {
    throw new ApiError(400, 'Cannot book a time slot in the past');
  }
  if (targetDate < todayUTC()) {
    throw new ApiError(400, 'Cannot book a date in the past');
  }
};

const computeEndTime = (startTime, durationMinutes) => {
  const start = toMinutes(startTime);
  const end = start + durationMinutes;
  return `${String(Math.floor(end / 60)).padStart(2, '0')}:${String(end % 60).padStart(2, '0')}`;
};

// @desc    Book a new appointment
// @route   POST /api/appointments
// @access  Private/Patient
const bookAppointment = asyncHandler(async (req, res) => {
  const { doctorId, date, startTime, reasonForVisit } = req.body;

  if (!doctorId || !date || !startTime || !reasonForVisit) {
    throw new ApiError(400, 'doctorId, date, startTime and reasonForVisit are all required');
  }

  const patient = await Patient.findOne({ user: req.user._id });
  if (!patient) throw new ApiError(404, 'Patient profile not found');

  const doctor = await Doctor.findOne({ _id: doctorId, status: 'approved', isActive: true });
  if (!doctor) throw new ApiError(404, 'Doctor not found or not accepting bookings');

  const targetDate = parseDateOnly(date);
  if (Number.isNaN(targetDate.getTime())) throw new ApiError(400, 'Invalid date format');

  await validateSlotOrThrow(doctor, targetDate, startTime);

  const endTime = computeEndTime(startTime, doctor.appointmentDurationMinutes);

  try {
    const appointment = await Appointment.create({
      patient: patient._id,
      doctor: doctor._id,
      specialization: doctor.specialization,
      date: targetDate,
      startTime,
      endTime,
      reasonForVisit,
      consultationFee: doctor.consultationFee,
      status: 'pending',
      createdBy: req.user._id,
    });

    await appointment.populate([
      { path: 'doctor', populate: [{ path: 'user', select: 'name' }, { path: 'specialization', select: 'name' }] },
      { path: 'patient', populate: { path: 'user', select: 'name' } },
    ]);

    res.status(201).json({ success: true, data: appointment });
  } catch (err) {
    // Duplicate key = the unique partial index caught a race condition
    if (err.code === 11000) {
      throw new ApiError(409, 'This time slot was just booked by someone else. Please pick another slot.');
    }
    throw err;
  }
});

/** Loads an appointment and confirms the requester is allowed to act on it. */
const loadAppointmentForActor = async (appointmentId, user) => {
  const appointment = await Appointment.findById(appointmentId)
    .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
    .populate({ path: 'patient', populate: { path: 'user', select: 'name' } });

  if (!appointment) throw new ApiError(404, 'Appointment not found');

  if (user.role === 'patient') {
    const patient = await Patient.findOne({ user: user._id });
    if (!patient || String(appointment.patient._id) !== String(patient._id)) {
      throw new ApiError(403, 'You do not have access to this appointment');
    }
  } else if (user.role === 'doctor') {
    const doctor = await Doctor.findOne({ user: user._id });
    if (!doctor || String(appointment.doctor._id) !== String(doctor._id)) {
      throw new ApiError(403, 'You do not have access to this appointment');
    }
  }
  // admin has access to all

  return appointment;
};

// @desc    Get a single appointment (owner or admin only)
// @route   GET /api/appointments/:id
// @access  Private
const getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await loadAppointmentForActor(req.params.id, req.user);
  res.json({ success: true, data: appointment });
});

// @desc    Cancel an appointment (patient, doctor, or admin)
// @route   PUT /api/appointments/:id/cancel
// @access  Private
const cancelAppointment = asyncHandler(async (req, res) => {
  const { cancelReason = '' } = req.body;
  const appointment = await loadAppointmentForActor(req.params.id, req.user);

  if (!['pending', 'confirmed'].includes(appointment.status)) {
    throw new ApiError(400, `Cannot cancel an appointment with status '${appointment.status}'`);
  }

  appointment.status = 'cancelled';
  appointment.cancelReason = cancelReason;
  appointment.cancelledBy = req.user.role;
  await appointment.save();

  res.json({ success: true, data: appointment, message: 'Appointment cancelled' });
});

// @desc    Reschedule an appointment to a new date/time (patient-initiated)
// @route   PUT /api/appointments/:id/reschedule
// @access  Private/Patient
const rescheduleAppointment = asyncHandler(async (req, res) => {
  const { date, startTime } = req.body;
  if (!date || !startTime) throw new ApiError(400, 'date and startTime are required');

  const appointment = await loadAppointmentForActor(req.params.id, req.user);

  if (!['pending', 'confirmed'].includes(appointment.status)) {
    throw new ApiError(400, `Cannot reschedule an appointment with status '${appointment.status}'`);
  }

  const doctor = await Doctor.findById(appointment.doctor._id);
  const targetDate = parseDateOnly(date);
  if (Number.isNaN(targetDate.getTime())) throw new ApiError(400, 'Invalid date format');

  await validateSlotOrThrow(doctor, targetDate, startTime);

  const endTime = computeEndTime(startTime, doctor.appointmentDurationMinutes);

  // Check for conflicts at the new slot, excluding this appointment itself
  const conflict = await Appointment.findOne({
    _id: { $ne: appointment._id },
    doctor: doctor._id,
    date: targetDate,
    startTime,
    status: { $in: ['pending', 'confirmed', 'completed'] },
  });
  if (conflict) throw new ApiError(409, 'The new time slot is already booked. Please choose another.');

  appointment.rescheduledFrom = {
    date: appointment.date,
    startTime: appointment.startTime,
    endTime: appointment.endTime,
  };
  appointment.date = targetDate;
  appointment.startTime = startTime;
  appointment.endTime = endTime;
  appointment.status = 'pending'; // needs doctor re-confirmation after reschedule

  try {
    await appointment.save();
  } catch (err) {
    if (err.code === 11000) {
      throw new ApiError(409, 'The new time slot was just booked by someone else.');
    }
    throw err;
  }

  res.json({ success: true, data: appointment, message: 'Appointment rescheduled' });
});

// @desc    Doctor confirms a pending appointment
// @route   PUT /api/appointments/:id/confirm
// @access  Private/Doctor
const confirmAppointment = asyncHandler(async (req, res) => {
  const appointment = await loadAppointmentForActor(req.params.id, req.user);

  if (appointment.status !== 'pending') {
    throw new ApiError(400, `Only pending appointments can be confirmed (current: ${appointment.status})`);
  }

  appointment.status = 'confirmed';
  await appointment.save();
  res.json({ success: true, data: appointment, message: 'Appointment confirmed' });
});

// @desc    Doctor rejects a pending appointment
// @route   PUT /api/appointments/:id/reject
// @access  Private/Doctor
const rejectAppointment = asyncHandler(async (req, res) => {
  const { cancelReason = '' } = req.body;
  const appointment = await loadAppointmentForActor(req.params.id, req.user);

  if (appointment.status !== 'pending') {
    throw new ApiError(400, `Only pending appointments can be rejected (current: ${appointment.status})`);
  }

  appointment.status = 'rejected';
  appointment.cancelReason = cancelReason;
  appointment.cancelledBy = 'doctor';
  await appointment.save();
  res.json({ success: true, data: appointment, message: 'Appointment rejected' });
});

// @desc    Doctor marks a confirmed appointment as completed, with notes
// @route   PUT /api/appointments/:id/complete
// @access  Private/Doctor
const completeAppointment = asyncHandler(async (req, res) => {
  const { doctorNotes = '' } = req.body;
  const appointment = await loadAppointmentForActor(req.params.id, req.user);

  if (appointment.status !== 'confirmed') {
    throw new ApiError(400, `Only confirmed appointments can be completed (current: ${appointment.status})`);
  }

  appointment.status = 'completed';
  appointment.doctorNotes = doctorNotes;
  await appointment.save();
  res.json({ success: true, data: appointment, message: 'Appointment marked as completed' });
});

// @desc    Doctor marks a confirmed appointment as a no-show
// @route   PUT /api/appointments/:id/no-show
// @access  Private/Doctor
const markNoShow = asyncHandler(async (req, res) => {
  const appointment = await loadAppointmentForActor(req.params.id, req.user);

  if (appointment.status !== 'confirmed') {
    throw new ApiError(400, `Only confirmed appointments can be marked no-show (current: ${appointment.status})`);
  }

  appointment.status = 'no-show';
  await appointment.save();
  res.json({ success: true, data: appointment, message: 'Appointment marked as no-show' });
});

// @desc    List logged-in patient's appointments (upcoming/past/status filters)
// @route   GET /api/appointments/patient/me
// @access  Private/Patient
const getMyAppointmentsAsPatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id });
  if (!patient) throw new ApiError(404, 'Patient profile not found');

  const { timeframe, status, page = 1, limit = 10 } = req.query;
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);

  const filter = { patient: patient._id };
  if (status) filter.status = status;

  if (timeframe === 'upcoming') {
    filter.date = { $gte: todayUTC() };
    filter.status = filter.status || { $in: ['pending', 'confirmed'] };
  } else if (timeframe === 'past') {
    filter.$or = [
      { date: { $lt: todayUTC() } },
      { status: { $in: ['completed', 'cancelled', 'rejected', 'no-show'] } },
    ];
  }

  const total = await Appointment.countDocuments(filter);
  const appointments = await Appointment.find(filter)
    .sort({ date: timeframe === 'past' ? -1 : 1, startTime: 1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)
    .populate({ path: 'doctor', populate: [{ path: 'user', select: 'name avatarUrl' }, { path: 'specialization', select: 'name' }] });

  res.json({
    success: true,
    count: appointments.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
    data: appointments,
  });
});

// @desc    List logged-in doctor's appointments (filterable by status/date)
// @route   GET /api/appointments/doctor/me
// @access  Private/Doctor
const getMyAppointmentsAsDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) throw new ApiError(404, 'Doctor profile not found');

  const { status, date, page = 1, limit = 10 } = req.query;
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);

  const filter = { doctor: doctor._id };
  if (status) filter.status = status;
  if (date) {
    const d = parseDateOnly(date);
    const dEnd = new Date(`${date}T23:59:59.999Z`);
    filter.date = { $gte: d, $lte: dEnd };
  }

  const total = await Appointment.countDocuments(filter);
  const appointments = await Appointment.find(filter)
    .sort({ date: 1, startTime: 1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)
    .populate({ path: 'patient', populate: { path: 'user', select: 'name avatarUrl phone' } });

  res.json({
    success: true,
    count: appointments.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
    data: appointments,
  });
});

// @desc    Admin: list all appointments with rich filters
// @route   GET /api/appointments/admin/all
// @access  Private/Admin
const adminGetAllAppointments = asyncHandler(async (req, res) => {
  const { status, doctorId, patientId, dateFrom, dateTo, page = 1, limit = 10 } = req.query;
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

  const filter = {};
  if (status) filter.status = status;
  if (doctorId) filter.doctor = new mongoose.Types.ObjectId(doctorId);
  if (patientId) filter.patient = new mongoose.Types.ObjectId(patientId);
  if (dateFrom || dateTo) {
    filter.date = {};
    if (dateFrom) filter.date.$gte = new Date(`${dateFrom}T00:00:00.000Z`);
    if (dateTo) filter.date.$lte = new Date(`${dateTo}T23:59:59.999Z`);
  }

  const total = await Appointment.countDocuments(filter);
  const appointments = await Appointment.find(filter)
    .sort({ date: -1, startTime: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)
    .populate({ path: 'doctor', populate: [{ path: 'user', select: 'name' }, { path: 'specialization', select: 'name' }] })
    .populate({ path: 'patient', populate: { path: 'user', select: 'name email' } });

  res.json({
    success: true,
    count: appointments.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
    data: appointments,
  });
});

module.exports = {
  bookAppointment,
  getAppointmentById,
  cancelAppointment,
  rescheduleAppointment,
  confirmAppointment,
  rejectAppointment,
  completeAppointment,
  markNoShow,
  getMyAppointmentsAsPatient,
  getMyAppointmentsAsDoctor,
  adminGetAllAppointments,
};
