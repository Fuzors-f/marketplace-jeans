const express = require('express');
const router = express.Router();
const {
  getSalesReport,
  getProductReport,
  getInventoryReport,
  exportSalesReport,
  exportInventoryReport
} = require('../controllers/reportController');
const {
  getInventoryMovementReport,
  getInventoryMovementSummary,
  exportInventoryMovement
} = require('../controllers/inventoryReportController');
const { protect, authorize } = require('../middleware/auth');

// Sales reports
router.get('/sales', protect, authorize('admin'), getSalesReport);
router.get('/sales/export', protect, authorize('admin'), exportSalesReport);

// Product reports
router.get('/products', protect, authorize('admin'), getProductReport);

// Inventory reports
router.get('/inventory', protect, authorize('admin', 'admin_stok'), getInventoryReport);
router.get('/inventory/export', protect, authorize('admin', 'admin_stok'), exportInventoryReport);

// Inventory movement reports
router.get('/inventory-movement', protect, authorize('admin', 'admin_stok'), getInventoryMovementReport);
router.get('/inventory-movement/summary', protect, authorize('admin', 'admin_stok'), getInventoryMovementSummary);
router.get('/inventory-movement/export', protect, authorize('admin', 'admin_stok'), exportInventoryMovement);

module.exports = router;
