const express = require('express');
const router = express.Router();
const warehouseController = require('../controllers/warehouseController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', warehouseController.getAllWarehouses);
router.get('/:id', warehouseController.getWarehouse);

// Protected routes (require authentication)
router.get('/:id/stock', protect, warehouseController.getWarehouseStock);

// Admin routes
router.post('/', protect, authorize('admin'), warehouseController.createWarehouse);
router.put('/:id', protect, authorize('admin'), warehouseController.updateWarehouse);
router.delete('/:id', protect, authorize('admin'), warehouseController.deleteWarehouse);

module.exports = router;