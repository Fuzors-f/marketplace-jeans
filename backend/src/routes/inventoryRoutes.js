const express = require('express');
const router = express.Router();
const {
  getVariantInventory,
  updateVariantStock,
  getInventoryOverview,
  getMovements,
  getLowStockAlerts,
  createAdjustment,
  getInventoryValueReport,
  getStockLevels
} = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/auth');

// Overview and reporting
router.get('/overview', protect, authorize('admin', 'admin_stok'), getInventoryOverview);
router.get('/value-report', protect, authorize('admin'), getInventoryValueReport);

// Stock tracking
router.get('/movements', protect, authorize('admin', 'admin_stok'), getMovements);
router.get('/stock-levels', protect, authorize('admin', 'admin_stok'), getStockLevels);
router.get('/low-stock', protect, authorize('admin', 'admin_stok'), getLowStockAlerts);

// Stock operations
router.post('/adjust', protect, authorize('admin', 'admin_stok'), createAdjustment);

// Variant-based inventory
router.get('/variants', protect, getVariantInventory);
router.put('/variants/:variantId', protect, authorize('admin', 'admin_stok'), updateVariantStock);

module.exports = router;
