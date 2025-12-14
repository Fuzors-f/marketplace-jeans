const express = require('express');
const router = express.Router();
const {
  getAllFittings,
  createFitting,
  updateFitting,
  deleteFitting
} = require('../controllers/fittingController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getAllFittings);

// Admin routes
router.post('/', protect, authorize('admin', 'admin_stok'), createFitting);
router.put('/:id', protect, authorize('admin', 'admin_stok'), updateFitting);
router.delete('/:id', protect, authorize('admin'), deleteFitting);

module.exports = router;
