const express = require('express');
const router = express.Router();
const {
  createPayment,
  paymentNotification,
  checkPaymentStatus
} = require('../controllers/paymentController');
const { optionalAuth } = require('../middleware/auth');

router.post('/create', optionalAuth, createPayment);
router.post('/notification', paymentNotification);
router.get('/:paymentId/status', checkPaymentStatus);

module.exports = router;
