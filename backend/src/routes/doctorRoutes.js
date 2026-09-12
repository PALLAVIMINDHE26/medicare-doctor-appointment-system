const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const {
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
} = require('../controllers/doctorController');

const router = express.Router();

const createDoctorRules = [
  body('name').trim().isLength({ min: 2, max: 100 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).matches(/\d/),
  body('phone').trim().isLength({ min: 7, max: 20 }),
  body('specialization').isMongoId().withMessage('Valid specialization is required'),
  body('qualifications').trim().notEmpty(),
  body('experienceYears').isInt({ min: 0, max: 70 }),
  body('consultationFee').isFloat({ min: 0 }),
  body('appointmentDurationMinutes').isIn([15, 20, 30, 45, 60]),
];

// ---- Specific routes MUST be declared before the generic '/:id' route ----

// Doctor's own account (self-service)
router.get('/me', protect, authorize('doctor'), getMyDoctorProfile);
router.put('/me', protect, authorize('doctor'), updateMyDoctorProfile);
router.put('/me/working-hours', protect, authorize('doctor'), updateMyWorkingHours);
router.get('/me/dashboard-stats', protect, authorize('doctor'), getMyDashboardStats);
router.get('/me/patients', protect, authorize('doctor'), getMyPatients);

// Admin doctor management
router.get('/admin/all', protect, authorize('admin'), adminGetAllDoctors);
router.post('/', protect, authorize('admin'), createDoctorRules, validate, adminCreateDoctor);
router.put('/:id/status', protect, authorize('admin'), adminUpdateDoctorStatus);
router.delete('/:id', protect, authorize('admin'), adminDeleteDoctor);

// Public
router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.get('/:id/availability', getDoctorAvailability);

module.exports = router;
