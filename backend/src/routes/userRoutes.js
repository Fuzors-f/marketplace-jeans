const express = require('express');
const router = express.Router();
const { 
  getUsers, 
  getUserById,
  getUserOrders,
  searchUsers, 
  createUser,
  updateUser, 
  deleteUser,
  lockUser,
  unlockUser
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), getUsers);
router.get('/search', protect, authorize('admin', 'admin_stok'), searchUsers);
router.get('/:id', protect, authorize('admin'), getUserById);
router.get('/:id/orders', protect, authorize('admin'), getUserOrders);
router.post('/', protect, authorize('admin'), createUser);
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);
router.patch('/:id/lock', protect, authorize('admin'), lockUser);
router.patch('/:id/unlock', protect, authorize('admin'), unlockUser);

module.exports = router;
