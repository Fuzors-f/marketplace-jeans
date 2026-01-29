const express = require('express');
const router = express.Router();
const {
  createPayment,
  createDirectCharge,
  paymentNotification,
  checkPaymentStatus,
  cancelPayment,
  getPaymentByOrder
} = require('../controllers/paymentController');
const { optionalAuth, protect } = require('../middleware/auth');

router.post('/create', optionalAuth, createPayment);
router.post('/charge', optionalAuth, createDirectCharge);
router.post('/notification', paymentNotification);
router.get('/order/:orderId', optionalAuth, getPaymentByOrder);
router.get('/:paymentId/status', checkPaymentStatus);
router.post('/:paymentId/cancel', protect, cancelPayment);

module.exports = router;
