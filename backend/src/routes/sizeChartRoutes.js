const express = require('express');
const router = express.Router();
const sizeChartController = require('../controllers/sizeChartController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', sizeChartController.getAllSizeCharts);
router.get('/guide', sizeChartController.getSizeGuide);
router.get('/:id', sizeChartController.getSizeChartById);
router.get('/:sizeId/:categoryId/:fittingId', sizeChartController.getSizeChart);

// Admin routes
router.post('/', protect, authorize('admin'), sizeChartController.createSizeChart);
router.put('/:id', protect, authorize('admin'), sizeChartController.updateSizeChart);
router.delete('/:id', protect, authorize('admin'), sizeChartController.deleteSizeChart);

module.exports = router;
