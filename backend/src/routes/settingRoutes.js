const express = require('express');
const router = express.Router();
const {
  getSettings,
  updateSetting
} = require('../controllers/settingController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, getSettings);
router.put('/:key', protect, authorize('admin'), updateSetting);

module.exports = router;
