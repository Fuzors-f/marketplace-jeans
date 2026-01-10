const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkUpload,
  getProductVariants,
  addProductVariant,
  updateProductVariant,
  deleteProductVariant,
  addProductImages,
  getProductImages,
  deleteProductImage
} = require('../controllers/productController');
const { downloadImportTemplate, importProducts, uploadMiddleware } = require('../controllers/productImportController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Import routes (must be before /:slug to avoid conflict)
router.get('/import/template', protect, authorize('admin', 'admin_stok'), downloadImportTemplate);
router.post('/import', protect, authorize('admin', 'admin_stok'), uploadMiddleware, importProducts);

// Public routes
router.get('/', optionalAuth, getProducts);
router.get('/:slug', getProduct);
router.get('/:productId/variants', getProductVariants);
router.get('/:productId/images', getProductImages);

// Protected routes (Admin only)
router.post('/', protect, authorize('admin', 'admin_stok'), createProduct);
router.put('/:id', protect, authorize('admin', 'admin_stok'), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);
router.post('/bulk-upload', protect, authorize('admin', 'admin_stok'), bulkUpload);

// Image routes
router.post('/:productId/images', protect, authorize('admin', 'admin_stok'), upload.array('images', 5), addProductImages);
router.delete('/:productId/images/:imageId', protect, authorize('admin'), deleteProductImage);

// Variant routes
router.post('/:productId/variants', protect, authorize('admin', 'admin_stok'), addProductVariant);
router.put('/variants/:variantId', protect, authorize('admin', 'admin_stok'), updateProductVariant);
router.delete('/variants/:variantId', protect, authorize('admin', 'admin_stok'), deleteProductVariant);

module.exports = router;
