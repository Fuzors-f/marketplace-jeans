const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} = require('../controllers/cartController');
const { optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, getCart);
router.post('/', optionalAuth, addToCart);
router.put('/:itemId', optionalAuth, updateCartItem);
router.delete('/:itemId', optionalAuth, removeFromCart);
router.delete('/', optionalAuth, clearCart);

module.exports = router;
