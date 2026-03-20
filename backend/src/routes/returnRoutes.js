const express = require('express');
const router = express.Router();
const {
  getReturns,
  getReturnDetail,
  getOrderItemsForReturn,
  searchOrders,
  createReturn,
  cancelReturn
} = require('../controllers/returnController');
const { protect, authorize } = require('../middleware/auth');

// All routes require admin auth
router.use(protect, authorize('admin', 'admin_stok'));

router.get('/', getReturns);
router.get('/orders/search', searchOrders);
router.get('/order/:orderId/items', getOrderItemsForReturn);
router.get('/:id', getReturnDetail);
router.post('/', createReturn);
router.put('/:id/cancel', cancelReturn);

module.exports = router;
