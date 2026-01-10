const express = require('express');
const router = express.Router();
const {
  getOrderTracking,
  addTrackingUpdate,
  getTrackingHistory,
  deleteTrackingEntry,
  getStatusOptions
} = require('../controllers/trackingController');
const { protect, authorize } = require('../middleware/auth');

// Public routes (no auth required)
router.get('/statuses', getStatusOptions);
router.get('/:orderNumber', getOrderTracking);

// Admin routes (protected)
router.get('/order/:orderId', protect, authorize('admin', 'warehouse_admin'), getTrackingHistory);
router.post('/:orderId', protect, authorize('admin', 'warehouse_admin'), addTrackingUpdate);
router.delete('/:id', protect, authorize('admin', 'warehouse_admin'), deleteTrackingEntry);

module.exports = router;
