const mongoose = require('mongoose');

/**
 * One working-hours block for a single weekday. A doctor can only have
 * ONE block per weekday in this simplified model (sufficient for a
 * portfolio-grade scheduler); `isWorking` toggles the day on/off without
 * losing the previously configured times.
 */
const workingHourSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      required: true,
    },
    isWorking: {
      type: Boolean,
      default: false,
    },
    startTime: {
      type: String, // 'HH:mm' 24-hour
      default: '09:00',
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'startTime must be in HH:mm format'],
    },
    endTime: {
      type: String,
      default: '17:00',
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'endTime must be in HH:mm format'],
    },
  },
  { _id: false }
);

const DEFAULT_WORKING_HOURS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
].map((day) => ({
  day,
  isWorking: day !== 'Sunday' && day !== 'Saturday',
  startTime: '09:00',
  endTime: '17:00',
}));

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    specialization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Specialization',
      required: [true, 'Specialization is required'],
    },
    qualifications: {
      type: String,
      required: [true, 'Qualifications are required'],
      trim: true,
      maxlength: [300, 'Qualifications cannot exceed 300 characters'],
    },
    experienceYears: {
      type: Number,
      required: true,
      min: [0, 'Experience cannot be negative'],
      max: [70, 'Experience seems unrealistic'],
      default: 0,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
      default: '',
    },
    consultationFee: {
      type: Number,
      required: [true, 'Consultation fee is required'],
      min: [0, 'Fee cannot be negative'],
    },
    appointmentDurationMinutes: {
      type: Number,
      required: true,
      enum: {
        values: [15, 20, 30, 45, 60],
        message: 'Appointment duration must be one of 15, 20, 30, 45 or 60 minutes',
      },
      default: 30,
    },
    workingHours: {
      type: [workingHourSchema],
      default: DEFAULT_WORKING_HOURS,
    },
    clinicAddress: {
      type: String,
      trim: true,
      maxlength: [300, 'Address cannot exceed 300 characters'],
      default: '',
    },
    languages: {
      type: [String],
      default: ['English'],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved', // seeded/demo doctors are auto-approved; admin can flip this
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

doctorSchema.index({ specialization: 1 });
doctorSchema.index({ status: 1, isActive: 1 });
doctorSchema.index({ consultationFee: 1 });

doctorSchema.virtual('appointments', {
  ref: 'Appointment',
  localField: '_id',
  foreignField: 'doctor',
});

doctorSchema.set('toJSON', { virtuals: true });
doctorSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Doctor', doctorSchema);
module.exports.DEFAULT_WORKING_HOURS = DEFAULT_WORKING_HOURS;
