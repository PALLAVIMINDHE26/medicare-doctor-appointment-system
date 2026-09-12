const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const {
  getSpecializations,
  createSpecialization,
  updateSpecialization,
  deleteSpecialization,
} = require('../controllers/specializationController');

const router = express.Router();

const specializationRules = [
  body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2-80 characters'),
];

router.get('/', getSpecializations);
router.post('/', protect, authorize('admin'), specializationRules, validate, createSpecialization);
router.put('/:id', protect, authorize('admin'), updateSpecialization);
router.delete('/:id', protect, authorize('admin'), deleteSpecialization);

module.exports = router;
