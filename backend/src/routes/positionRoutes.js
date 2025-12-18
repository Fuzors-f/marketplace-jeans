const express = require('express');
const router = express.Router();
const positionController = require('../controllers/positionController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', positionController.getAllPositions);
router.get('/hierarchy', positionController.getPositionHierarchy);
router.get('/office/:officeId', positionController.getPositionsByOffice);
router.get('/:id', positionController.getPosition);

// Admin routes
router.post('/', protect, authorize('admin'), positionController.createPosition);
router.put('/:id', protect, authorize('admin'), positionController.updatePosition);
router.delete('/:id', protect, authorize('admin'), positionController.deletePosition);

module.exports = router;
