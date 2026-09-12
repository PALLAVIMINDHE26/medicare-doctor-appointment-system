const express = require('express');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const { getDashboardStats } = require('../controllers/adminController');

const router = express.Router();

router.get('/dashboard-stats', protect, authorize('admin'), getDashboardStats);

module.exports = router;
