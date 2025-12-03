const express = require('express');
const router = express.Router();
const {
  getSalesReport,
  getProductReport,
  getCategoryReport,
  exportSalesReport,
  getDashboardStats
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.get('/sales', protect, authorize('admin'), getSalesReport);
router.get('/products', protect, authorize('admin'), getProductReport);
router.get('/categories', protect, authorize('admin'), getCategoryReport);
router.get('/export/sales', protect, authorize('admin'), exportSalesReport);
router.get('/dashboard', protect, authorize('admin', 'admin_stok'), getDashboardStats);

module.exports = router;
