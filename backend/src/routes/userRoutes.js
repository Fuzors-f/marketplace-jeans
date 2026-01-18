const express = require('express');
const router = express.Router();
const { 
  getUsers, 
  getUserById,
  getUserOrders,
  searchUsers, 
  createUser,
  updateUser, 
  deleteUser 
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), getUsers);
router.get('/search', protect, authorize('admin', 'admin_stok'), searchUsers);
router.get('/:id', protect, authorize('admin'), getUserById);
router.get('/:id/orders', protect, authorize('admin'), getUserOrders);
router.post('/', protect, authorize('admin'), createUser);
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
