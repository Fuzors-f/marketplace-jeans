const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const { protect, authorize } = require('../middleware/auth');

// All stock routes require authentication
router.use(protect);

// Stock management
router.get('/', stockController.getStocks);
router.get('/summary', stockController.getStockSummary);
router.get('/movements', stockController.getStockMovements);
router.post('/opening', authorize('admin', 'admin_stok'), stockController.addOpeningStock);
router.post('/adjustment', authorize('admin', 'admin_stok'), stockController.adjustStock);
router.post('/variant', authorize('admin', 'admin_stok'), stockController.createVariantStock);

module.exports = router;