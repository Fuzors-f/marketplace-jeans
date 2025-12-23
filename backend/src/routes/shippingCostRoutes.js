const express = require('express');
const router = express.Router();
const {
  getAllShippingCosts,
  getShippingCostById,
  calculateShippingCost,
  getCouriers,
  createShippingCost,
  updateShippingCost,
  deleteShippingCost,
  bulkCreateShippingCosts,
  searchShippingCostsByCity
} = require('../controllers/shippingCostController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getAllShippingCosts);
router.get('/couriers', getCouriers);
router.get('/search', searchShippingCostsByCity);
router.post('/calculate', calculateShippingCost);
router.get('/:id', getShippingCostById);

// Admin routes
router.post('/', protect, authorize('admin'), createShippingCost);
router.post('/bulk', protect, authorize('admin'), bulkCreateShippingCosts);
router.put('/:id', protect, authorize('admin'), updateShippingCost);
router.delete('/:id', protect, authorize('admin'), deleteShippingCost);

module.exports = router;
