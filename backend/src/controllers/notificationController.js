const { query } = require('../config/database');

// @desc    Get notifications for the current user or admin
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin' || req.user.role === 'admin_stok';
    const { page = 1, limit = 20, unread_only = 'false' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClause;
    let params;

    if (isAdmin) {
      whereClause = unread_only === 'true'
        ? 'WHERE n.for_admin = 1 AND n.is_read = 0'
        : 'WHERE n.for_admin = 1';
      params = [];
    } else {
      whereClause = unread_only === 'true'
        ? 'WHERE n.user_id = ? AND n.for_admin = 0 AND n.is_read = 0'
        : 'WHERE n.user_id = ? AND n.for_admin = 0';
      params = [userId];
    }

    const countResult = await query(
      `SELECT COUNT(*) AS total FROM notifications n ${whereClause}`,
      params
    );

    const notifications = await query(
      `SELECT n.id, n.user_id, n.type, n.title, n.message,
              n.reference_id, n.reference_type, n.is_read, n.for_admin,
              n.created_at
       FROM notifications n
       ${whereClause}
       ORDER BY n.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      success: true,
      data: notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil notifikasi', error: error.message });
  }
};

// @desc    Get unread notification count (for badge)
// @route   GET /api/notifications/count
// @access  Private
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin' || req.user.role === 'admin_stok';

    let result;
    if (isAdmin) {
      result = await query(
        'SELECT COUNT(*) AS count FROM notifications WHERE for_admin = 1 AND is_read = 0'
      );
    } else {
      result = await query(
        'SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND for_admin = 0 AND is_read = 0',
        [userId]
      );
    }

    res.json({ success: true, count: result[0].count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil jumlah notifikasi', error: error.message });
  }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin' || req.user.role === 'admin_stok';

    // Security: only mark own notification as read
    const whereClause = isAdmin
      ? 'WHERE id = ? AND for_admin = 1'
      : 'WHERE id = ? AND user_id = ? AND for_admin = 0';
    const params = isAdmin ? [id] : [id, userId];

    await query(`UPDATE notifications SET is_read = 1 ${whereClause}`, params);

    res.json({ success: true, message: 'Notifikasi ditandai telah dibaca' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui notifikasi', error: error.message });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin' || req.user.role === 'admin_stok';

    if (isAdmin) {
      await query('UPDATE notifications SET is_read = 1 WHERE for_admin = 1 AND is_read = 0');
    } else {
      await query(
        'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND for_admin = 0 AND is_read = 0',
        [userId]
      );
    }

    res.json({ success: true, message: 'Semua notifikasi ditandai telah dibaca' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui notifikasi', error: error.message });
  }
};
