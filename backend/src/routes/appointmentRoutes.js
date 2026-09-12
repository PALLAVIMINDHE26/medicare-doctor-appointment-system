const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const {
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
} = require('../controllers/appointmentController');

const router = express.Router();

const bookRules = [
  body('doctorId').isMongoId().withMessage('Valid doctorId is required'),
  body('date').isISO8601().withMessage('Valid date (YYYY-MM-DD) is required'),
  body('startTime')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('startTime must be in HH:mm format'),
  body('reasonForVisit').trim().isLength({ min: 3, max: 500 }).withMessage('Please describe the reason for your visit'),
];

router.post('/', protect, authorize('patient'), bookRules, validate, bookAppointment);

router.get('/patient/me', protect, authorize('patient'), getMyAppointmentsAsPatient);
router.get('/doctor/me', protect, authorize('doctor'), getMyAppointmentsAsDoctor);
router.get('/admin/all', protect, authorize('admin'), adminGetAllAppointments);

router.get('/:id', protect, getAppointmentById);
router.put('/:id/cancel', protect, authorize('patient', 'doctor', 'admin'), cancelAppointment);
router.put('/:id/reschedule', protect, authorize('patient'), rescheduleAppointment);
router.put('/:id/confirm', protect, authorize('doctor'), confirmAppointment);
router.put('/:id/reject', protect, authorize('doctor'), rejectAppointment);
router.put('/:id/complete', protect, authorize('doctor'), completeAppointment);
router.put('/:id/no-show', protect, authorize('doctor'), markNoShow);

module.exports = router;
