const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkUpload
} = require('../controllers/productController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

// Public routes
router.get('/', optionalAuth, getProducts);
router.get('/:slug', getProduct);

// Protected routes (Admin only)
router.post('/', protect, authorize('admin', 'admin_stok'), createProduct);
router.put('/:id', protect, authorize('admin', 'admin_stok'), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);
router.post('/bulk-upload', protect, authorize('admin', 'admin_stok'), bulkUpload);

module.exports = router;
