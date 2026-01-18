const express = require('express');
const router = express.Router();
const {
  getAllCoupons,
  getCouponById,
  validateCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getCouponStats,
  getPublicCoupons
} = require('../controllers/couponController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

// Public routes
router.get('/public', getPublicCoupons);
router.post('/validate', optionalAuth, validateCoupon);

// Admin routes
router.get('/stats', protect, authorize('admin'), getCouponStats);
router.get('/', protect, authorize('admin'), getAllCoupons);
router.get('/:id', protect, authorize('admin'), getCouponById);
router.post('/', protect, authorize('admin'), createCoupon);
router.put('/:id', protect, authorize('admin'), updateCoupon);
router.delete('/:id', protect, authorize('admin'), deleteCoupon);

module.exports = router;
