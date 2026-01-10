const express = require('express');
const router = express.Router();
const {
  getExchangeRates,
  getExchangeRate,
  updateExchangeRate,
  createExchangeRate,
  getExchangeRateLogs,
  deleteExchangeRate,
  convertCurrency
} = require('../controllers/exchangeRateController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getExchangeRates);
router.get('/convert', convertCurrency);
router.get('/:from/:to', getExchangeRate);

// Admin routes (protected)
router.get('/logs', protect, authorize('admin'), getExchangeRateLogs);
router.post('/', protect, authorize('admin'), createExchangeRate);
router.put('/:id', protect, authorize('admin'), updateExchangeRate);
router.delete('/:id', protect, authorize('admin'), deleteExchangeRate);

module.exports = router;
