const express = require('express');
const router = express.Router();
const {
  getAllBanners,
  getAdminBanners,
  createBanner,
  updateBanner,
  deleteBanner
} = require('../controllers/bannerController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getAllBanners);

// Admin routes
router.get('/admin', protect, authorize('admin'), getAdminBanners);
router.post('/', protect, authorize('admin'), createBanner);
router.put('/:id', protect, authorize('admin'), updateBanner);
router.delete('/:id', protect, authorize('admin'), deleteBanner);

module.exports = router;
