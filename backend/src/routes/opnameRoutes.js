const express = require('express');
const router = express.Router();
const opnameController = require('../controllers/opnameController');
const { protect, authorize } = require('../middleware/auth');

// All opname routes require authentication
router.use(protect);

// Stock opname management
router.get('/', opnameController.getStockOpnames);
router.get('/:id', opnameController.getStockOpnameDetails);
router.post('/', authorize('admin', 'admin_stok'), opnameController.createStockOpname);
router.put('/details/:detailId', authorize('admin', 'admin_stok'), opnameController.updateOpnameDetail);
router.post('/:id/complete', authorize('admin', 'admin_stok'), opnameController.completeStockOpname);
router.post('/:id/cancel', authorize('admin', 'admin_stok'), opnameController.cancelStockOpname);

module.exports = router;