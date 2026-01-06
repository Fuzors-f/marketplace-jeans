const express = require('express');
const router = express.Router();
const {
  getUserAddresses,
  getAddress,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getAddressesByUserId,
  createAddressForUser,
  updateAddressForUser,
  deleteAddressForUser,
  setDefaultAddressForUser
} = require('../controllers/addressController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// User's own addresses
router.route('/')
  .get(getUserAddresses)
  .post(createAddress);

router.route('/:id')
  .get(getAddress)
  .put(updateAddress)
  .delete(deleteAddress);

router.put('/:id/default', setDefaultAddress);

// Admin routes for managing any user's addresses
router.get('/user/:userId', authorize('admin', 'admin_stok'), getAddressesByUserId);
router.post('/user/:userId', authorize('admin', 'admin_stok'), createAddressForUser);
router.put('/user/:userId/:addressId', authorize('admin', 'admin_stok'), updateAddressForUser);
router.delete('/user/:userId/:addressId', authorize('admin', 'admin_stok'), deleteAddressForUser);
router.put('/user/:userId/:addressId/default', authorize('admin', 'admin_stok'), setDefaultAddressForUser);

module.exports = router;
