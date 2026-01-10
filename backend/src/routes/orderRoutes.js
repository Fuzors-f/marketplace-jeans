const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrder,
  getOrderByToken,
  updateOrderStatus,
  addTracking,
  generateQRCode,
  getQRCodeData,
  generateInvoice,
  approveOrder,
  addShippingHistory,
  getShippingHistory
} = require('../controllers/orderController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

// Public routes - order tracking by token
router.get('/track/:token', getOrderByToken);
router.get('/:id/qrcode', generateQRCode);
router.get('/:id/qrcode-data', getQRCodeData);
router.get('/:id/invoice', generateInvoice);
router.get('/:id/shipping-history', getShippingHistory);

// Public/Protected routes
router.post('/', optionalAuth, createOrder);

// Protected routes
router.get('/', protect, getOrders);
router.get('/:id', optionalAuth, getOrder);

// Admin routes
router.put('/:id/status', protect, authorize('admin', 'admin_stok'), updateOrderStatus);
router.put('/:id/tracking', protect, authorize('admin', 'admin_stok'), addTracking);
router.put('/:id/approve', protect, authorize('admin', 'admin_stok'), approveOrder);
router.post('/:id/shipping-history', protect, authorize('admin', 'admin_stok'), addShippingHistory);

module.exports = router;
