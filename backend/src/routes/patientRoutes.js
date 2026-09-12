const express = require('express');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const {
  getMyPatientProfile,
  updateMyPatientProfile,
  getMyPatientDashboardStats,
  adminGetAllPatients,
  adminUpdatePatientStatus,
} = require('../controllers/patientController');

const router = express.Router();

router.get('/me', protect, authorize('patient'), getMyPatientProfile);
router.put('/me', protect, authorize('patient'), updateMyPatientProfile);
router.get('/me/dashboard-stats', protect, authorize('patient'), getMyPatientDashboardStats);

router.get('/admin/all', protect, authorize('admin'), adminGetAllPatients);
router.put('/:id/status', protect, authorize('admin'), adminUpdatePatientStatus);

module.exports = router;
