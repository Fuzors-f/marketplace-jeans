const express = require('express');
const router = express.Router();
const {
  getAllSizes,
  createSize,
  updateSize,
  deleteSize
} = require('../controllers/sizeController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getAllSizes);

// Admin routes
router.post('/', protect, authorize('admin', 'admin_stok'), createSize);
router.put('/:id', protect, authorize('admin', 'admin_stok'), updateSize);
router.delete('/:id', protect, authorize('admin'), deleteSize);

module.exports = router;
