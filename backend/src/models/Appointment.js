const mongoose = require('mongoose');

const APPOINTMENT_STATUSES = [
  'pending', // booked by patient, awaiting doctor confirmation
  'confirmed', // accepted by doctor
  'completed', // consultation happened
  'cancelled', // cancelled by patient or admin
  'rejected', // declined by doctor
  'no-show', // patient did not show up
];

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    specialization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Specialization',
      required: true,
    },
    // Normalized to midnight UTC of the appointment day — time-of-day lives
    // in startTime/endTime so slot math never fights timezone drift.
    date: {
      type: Date,
      required: [true, 'Appointment date is required'],
    },
    startTime: {
      type: String, // 'HH:mm'
      required: true,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'startTime must be in HH:mm format'],
    },
    endTime: {
      type: String, // 'HH:mm'
      required: true,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'endTime must be in HH:mm format'],
    },
    status: {
      type: String,
      enum: APPOINTMENT_STATUSES,
      default: 'pending',
    },
    reasonForVisit: {
      type: String,
      required: [true, 'Please provide a reason for the visit'],
      trim: true,
      maxlength: [500, 'Reason cannot exceed 500 characters'],
    },
    doctorNotes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
      default: '',
    },
    cancelReason: {
      type: String,
      trim: true,
      maxlength: [500, 'Cancel reason cannot exceed 500 characters'],
      default: '',
    },
    cancelledBy: {
      type: String,
      enum: ['patient', 'doctor', 'admin', null],
      default: null,
    },
    consultationFee: {
      type: Number,
      required: true,
      min: 0,
    },
    // Tracks reschedules so the history isn't silently lost
    rescheduledFrom: {
      date: Date,
      startTime: String,
      endTime: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Core anti-double-booking guarantee: only one *active* appointment can
// occupy a given doctor + date + startTime slot. Cancelled/rejected
// appointments are excluded so the slot becomes bookable again.
appointmentSchema.index(
  { doctor: 1, date: 1, startTime: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ['pending', 'confirmed', 'completed'] },
    },
  }
);

appointmentSchema.index({ patient: 1, date: -1 });
appointmentSchema.index({ doctor: 1, date: -1 });
appointmentSchema.index({ status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
module.exports.APPOINTMENT_STATUSES = APPOINTMENT_STATUSES;
