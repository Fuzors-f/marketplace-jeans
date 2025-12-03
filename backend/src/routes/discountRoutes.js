const express = require('express');
const router = express.Router();
const {
  getDiscounts,
  validateDiscount,
  createDiscount,
  updateDiscount,
  deleteDiscount
} = require('../controllers/discountController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getDiscounts);
router.post('/validate', validateDiscount);
router.post('/', protect, authorize('admin'), createDiscount);
router.put('/:id', protect, authorize('admin'), updateDiscount);
router.delete('/:id', protect, authorize('admin'), deleteDiscount);

module.exports = router;
