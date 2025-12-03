const express = require('express');
const router = express.Router();
const {
  calculateShipping,
  trackShipment
} = require('../controllers/shippingController');

router.post('/calculate', calculateShipping);
router.get('/track/:trackingNumber', trackShipment);

module.exports = router;
