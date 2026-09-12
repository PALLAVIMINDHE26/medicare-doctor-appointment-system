const mongoose = require('mongoose');

const specializationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Specialization name is required'],
      unique: true,
      trim: true,
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    icon: {
      type: String, // lucide-react icon name, rendered on the frontend
      default: 'Stethoscope',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Note: `name` already has a unique index via the field definition above.

module.exports = mongoose.model('Specialization', specializationSchema);
