const express = require('express');
const router = express.Router();
const officeController = require('../controllers/officeController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', officeController.getAllOffices);
router.get('/:id', officeController.getOffice);

// Admin routes
router.post('/', protect, authorize('admin'), officeController.createOffice);
router.put('/:id', protect, authorize('admin'), officeController.updateOffice);
router.delete('/:id', protect, authorize('admin'), officeController.deleteOffice);

module.exports = router;
