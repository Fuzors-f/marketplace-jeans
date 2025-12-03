const express = require('express');
const router = express.Router();
const {
  getMovements,
  addStock,
  adjustStock,
  getStockLevels
} = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/auth');

router.get('/movements', protect, authorize('admin', 'admin_stok'), getMovements);
router.post('/add-stock', protect, authorize('admin', 'admin_stok'), addStock);
router.post('/adjust-stock', protect, authorize('admin', 'admin_stok'), adjustStock);
router.get('/stock-levels', protect, authorize('admin', 'admin_stok'), getStockLevels);

module.exports = router;
