const express = require('express');
const router = express.Router();
const {
  getAllContent,
  getContentByKey,
  getAdminContent,
  updateContent,
  createContent,
  deleteContent
} = require('../controllers/contentController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getAllContent);
router.get('/:sectionKey', getContentByKey);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), getAdminContent);
router.post('/', protect, authorize('admin'), createContent);
router.put('/:id', protect, authorize('admin'), updateContent);
router.delete('/:id', protect, authorize('admin'), deleteContent);

module.exports = router;
