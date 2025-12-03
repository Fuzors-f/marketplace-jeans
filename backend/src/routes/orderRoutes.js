const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  addTracking
} = require('../controllers/orderController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

// Public/Protected routes
router.post('/', optionalAuth, createOrder);

// Protected routes
router.get('/', protect, getOrders);
router.get('/:id', optionalAuth, getOrder);

// Admin routes
router.put('/:id/status', protect, authorize('admin', 'admin_stok'), updateOrderStatus);
router.put('/:id/tracking', protect, authorize('admin', 'admin_stok'), addTracking);

module.exports = router;
