const express = require('express');
const router = express.Router();
const {
  getAllCities,
  getCityById,
  getProvinces,
  getCitiesByProvince,
  createCity,
  updateCity,
  deleteCity,
  bulkCreateCities
} = require('../controllers/cityController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getAllCities);
router.get('/provinces', getProvinces);
router.get('/province/:province', getCitiesByProvince);
router.get('/:id', getCityById);

// Admin routes
router.post('/', protect, authorize('admin'), createCity);
router.post('/bulk', protect, authorize('admin'), bulkCreateCities);
router.put('/:id', protect, authorize('admin'), updateCity);
router.delete('/:id', protect, authorize('admin'), deleteCity);

module.exports = router;
