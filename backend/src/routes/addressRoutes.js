const express = require('express');
const router = express.Router();
const {
  getUserAddresses,
  getAddress,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} = require('../controllers/addressController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getUserAddresses)
  .post(createAddress);

router.route('/:id')
  .get(getAddress)
  .put(updateAddress)
  .delete(deleteAddress);

router.put('/:id/default', setDefaultAddress);

module.exports = router;
