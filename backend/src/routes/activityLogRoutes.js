const express = require('express');
const router = express.Router();
const {
  getActivityLogs,
  getActivityLogById,
  getActivitySummary,
  getUserActivity,
  exportActivityLogs,
  cleanupOldLogs,
  getActivityReport,
  getSessionTimeline
} = require('../controllers/activityLogController');
const { protect, authorize } = require('../middleware/auth');

// All routes require admin authentication
router.use(protect);
router.use(authorize('admin'));

router.get('/summary', getActivitySummary);
router.get('/export', exportActivityLogs);
router.get('/report', getActivityReport);
router.get('/user/:userId', getUserActivity);
router.get('/session/:sessionId', getSessionTimeline);
router.delete('/cleanup', cleanupOldLogs);
router.get('/:id', getActivityLogById);
router.get('/', getActivityLogs);

module.exports = router;
