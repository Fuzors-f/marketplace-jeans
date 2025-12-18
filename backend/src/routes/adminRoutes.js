const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAdminOrders,
  getAdminOrderDetail,
  updateOrderStatus,
  updatePaymentStatus,
  addTracking,
  createManualOrder
} = require('../controllers/adminController');

// All routes require admin authentication
router.use(protect);
router.use(authorize('admin', 'admin_stok'));

// Order management routes
router.get('/orders', getAdminOrders);
router.get('/orders/:id', getAdminOrderDetail);
router.patch('/orders/:id/status', updateOrderStatus);
router.patch('/orders/:id/payment-status', updatePaymentStatus);
router.put('/orders/:id/tracking', addTracking);
router.post('/orders/manual', createManualOrder);

module.exports = router;
