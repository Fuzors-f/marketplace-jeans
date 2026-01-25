const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  getSettings,
  getAllSettingsDetailed,
  initializeSettings,
  updateSetting,
  bulkUpdateSettings,
  uploadSettingImage
} = require('../controllers/settingController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

// Configure multer for settings uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/settings');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|ico|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Public routes
router.get('/', optionalAuth, getSettings);

// Admin routes
router.get('/all', protect, authorize('admin'), getAllSettingsDetailed);
router.post('/init', protect, authorize('admin'), initializeSettings);
router.put('/', protect, authorize('admin'), bulkUpdateSettings);
router.put('/:key', protect, authorize('admin'), updateSetting);
router.post('/upload', protect, authorize('admin'), upload.single('image'), uploadSettingImage);

module.exports = router;
