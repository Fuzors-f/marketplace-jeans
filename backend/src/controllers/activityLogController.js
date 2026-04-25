const { query } = require('../config/database');
const ExcelJS = require('exceljs');
const moment = require('moment');

// ─── helpers ────────────────────────────────────────────────────────────────

const buildDateCondition = (start_date, end_date, tableAlias = '') => {
  const col = tableAlias ? `${tableAlias}.created_at` : 'created_at';
  if (start_date && end_date) return { clause: `${col} BETWEEN ? AND ?`, params: [start_date, `${end_date} 23:59:59`] };
  if (start_date) return { clause: `${col} >= ?`, params: [start_date] };
  if (end_date) return { clause: `${col} <= ?`, params: [`${end_date} 23:59:59`] };
  return { clause: null, params: [] };
};

// @desc    Get activity logs with filters
// @route   GET /api/activity-logs
// @access  Private (Admin)
exports.getActivityLogs = async (req, res) => {
  try {
    const {
      user_id,
      action,
      entity_type,
      start_date,
      end_date,
      search,
      page = 1,
      limit = 50
    } = req.query;

    const offset = (page - 1) * parseInt(limit);
    let whereConditions = [];
    let params = [];

    if (user_id) {
      whereConditions.push('al.user_id = ?');
      params.push(user_id);
    }

    if (action) {
      whereConditions.push('al.action = ?');
      params.push(action);
    }

    if (entity_type) {
      whereConditions.push('al.entity_type = ?');
      params.push(entity_type);
    }

    if (start_date && end_date) {
      whereConditions.push('al.created_at BETWEEN ? AND ?');
      params.push(start_date, end_date + ' 23:59:59');
    } else if (start_date) {
      whereConditions.push('al.created_at >= ?');
      params.push(start_date);
    } else if (end_date) {
      whereConditions.push('al.created_at <= ?');
      params.push(end_date + ' 23:59:59');
    }

    if (search) {
      whereConditions.push('(al.description LIKE ? OR al.ip_address LIKE ? OR u.full_name LIKE ? OR u.email LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total 
       FROM activity_logs al 
       LEFT JOIN users u ON al.user_id = u.id 
       ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // Get logs - using explicit columns for better control
    const logs = await query(
      `SELECT 
        al.id, al.user_id, al.session_id, al.user_type,
        al.action, al.entity_type, al.entity_id,
        al.description, al.ip_address, al.user_agent, al.request_url, al.request_method,
        al.metadata, al.page_path, al.created_at,
        u.full_name as user_name, u.email as user_email, u.role as user_role
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ${whereClause}
      ORDER BY al.created_at DESC
      LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    // Get unique actions for filter
    const actions = await query(
      `SELECT DISTINCT action FROM activity_logs ORDER BY action`
    );

    // Get unique entity types for filter
    const entityTypes = await query(
      `SELECT DISTINCT entity_type FROM activity_logs WHERE entity_type IS NOT NULL ORDER BY entity_type`
    );

    res.json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      },
      filters: {
        actions: actions.map(a => a.action),
        entityTypes: entityTypes.map(e => e.entity_type)
      }
    });
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity logs',
      error: error.message
    });
  }
};

// @desc    Get activity log by ID
// @route   GET /api/activity-logs/:id
// @access  Private (Admin)
exports.getActivityLogById = async (req, res) => {
  try {
    const { id } = req.params;

    const logs = await query(
      `SELECT 
        al.*, 
        u.full_name as user_name, u.email as user_email, u.role as user_role
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE al.id = ?`,
      [id]
    );

    if (logs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Activity log not found'
      });
    }

    res.json({
      success: true,
      data: logs[0]
    });
  } catch (error) {
    console.error('Get activity log by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity log',
      error: error.message
    });
  }
};

// @desc    Get activity summary/statistics
// @route   GET /api/activity-logs/summary
// @access  Private (Admin)
exports.getActivitySummary = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let dateCondition = '';
    let params = [];

    if (start_date && end_date) {
      dateCondition = 'WHERE created_at BETWEEN ? AND ?';
      params.push(start_date, end_date + ' 23:59:59');
    }

    // Get activity by action
    const byAction = await query(
      `SELECT action, COUNT(*) as count 
       FROM activity_logs ${dateCondition}
       GROUP BY action 
       ORDER BY count DESC 
       LIMIT 20`,
      params
    );

    // Get activity by user
    const byUser = await query(
      `SELECT 
        al.user_id, u.full_name, u.email, COUNT(*) as count
       FROM activity_logs al
       LEFT JOIN users u ON al.user_id = u.id
       ${dateCondition}
       GROUP BY al.user_id, u.full_name, u.email
       ORDER BY count DESC
       LIMIT 20`,
      params
    );

    // Get activity by day
    const byDay = await query(
      `SELECT 
        DATE(created_at) as date, COUNT(*) as count
       FROM activity_logs ${dateCondition}
       GROUP BY DATE(created_at)
       ORDER BY date DESC
       LIMIT 30`,
      params
    );

    // Get activity by hour (for today)
    const byHour = await query(
      `SELECT 
        HOUR(created_at) as hour, COUNT(*) as count
       FROM activity_logs
       WHERE DATE(created_at) = CURDATE()
       GROUP BY HOUR(created_at)
       ORDER BY hour`
    );

    // Get totals
    const totals = await query(
      `SELECT 
        COUNT(*) as total_activities,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(DISTINCT ip_address) as unique_ips
       FROM activity_logs ${dateCondition}`,
      params
    );

    res.json({
      success: true,
      data: {
        totals: totals[0],
        byAction,
        byUser,
        byDay,
        byHour
      }
    });
  } catch (error) {
    console.error('Get activity summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity summary',
      error: error.message
    });
  }
};

// @desc    Get user activity history
// @route   GET /api/activity-logs/user/:userId
// @access  Private (Admin)
exports.getUserActivity = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * parseInt(limit);

    const logs = await query(
      `SELECT 
        al.id, al.action, al.entity_type, al.entity_id,
        al.description, al.ip_address, al.created_at
      FROM activity_logs al
      WHERE al.user_id = ?
      ORDER BY al.created_at DESC
      LIMIT ? OFFSET ?`,
      [userId, parseInt(limit), offset]
    );

    const countResult = await query(
      'SELECT COUNT(*) as total FROM activity_logs WHERE user_id = ?',
      [userId]
    );

    res.json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user activity',
      error: error.message
    });
  }
};

// @desc    Export activity logs to Excel
// @route   GET /api/activity-logs/export
// @access  Private (Admin)
exports.exportActivityLogs = async (req, res) => {
  try {
    const { start_date, end_date, action, user_id } = req.query;

    let whereConditions = [];
    let params = [];

    if (user_id) {
      whereConditions.push('al.user_id = ?');
      params.push(user_id);
    }

    if (action) {
      whereConditions.push('al.action = ?');
      params.push(action);
    }

    if (start_date && end_date) {
      whereConditions.push('al.created_at BETWEEN ? AND ?');
      params.push(start_date, end_date + ' 23:59:59');
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const logs = await query(
      `SELECT 
        al.id, al.action, al.entity_type, al.entity_id,
        al.description, al.ip_address, al.request_url, al.request_method,
        al.created_at,
        u.full_name as user_name, u.email as user_email
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ${whereClause}
      ORDER BY al.created_at DESC
      LIMIT 10000`,
      params
    );

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Activity Logs');

    // Define columns
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Tanggal', key: 'created_at', width: 20 },
      { header: 'User', key: 'user_name', width: 25 },
      { header: 'Email', key: 'user_email', width: 30 },
      { header: 'Action', key: 'action', width: 20 },
      { header: 'Entity Type', key: 'entity_type', width: 15 },
      { header: 'Entity ID', key: 'entity_id', width: 10 },
      { header: 'Description', key: 'description', width: 50 },
      { header: 'IP Address', key: 'ip_address', width: 15 },
      { header: 'URL', key: 'request_url', width: 40 },
      { header: 'Method', key: 'request_method', width: 10 }
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Add data rows
    logs.forEach(log => {
      worksheet.addRow({
        ...log,
        created_at: moment(log.created_at).format('YYYY-MM-DD HH:mm:ss'),
        user_name: log.user_name || 'Guest'
      });
    });

    // Set response headers
    const filename = `activity-logs-${moment().format('YYYY-MM-DD')}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export activity logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export activity logs',
      error: error.message
    });
  }
};

// @desc    Delete old activity logs (cleanup)
// @route   DELETE /api/activity-logs/cleanup
// @access  Private (Admin)
exports.cleanupOldLogs = async (req, res) => {
  try {
    const { days = 90 } = req.query;

    const result = await query(
      'DELETE FROM activity_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)',
      [parseInt(days)]
    );

    res.json({
      success: true,
      message: `Deleted ${result.affectedRows} old activity logs`,
      deletedCount: result.affectedRows
    });
  } catch (error) {
    console.error('Cleanup activity logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup activity logs',
      error: error.message
    });
  }
};

// ─── NEW: Comprehensive User & Guest Activity Report ─────────────────────────

// @desc    Get full user activity report with guest tracking
// @route   GET /api/activity-logs/report
// @access  Private (Admin)
exports.getActivityReport = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const dateFilter = buildDateCondition(start_date, end_date, 'al');
    const whereClause = dateFilter.clause ? `WHERE ${dateFilter.clause}` : '';
    const params = dateFilter.params;

    // ── Summary totals ────────────────────────────────────────────────────────
    const [totals] = await query(
      `SELECT
         COUNT(*) AS total_events,
         COUNT(DISTINCT al.user_id) AS unique_registered_users,
         COUNT(DISTINCT CASE WHEN al.user_id IS NULL THEN al.session_id END) AS unique_guests,
         COUNT(DISTINCT al.ip_address) AS unique_ips,
         COUNT(DISTINCT al.session_id) AS total_sessions,
         SUM(al.action = 'login') AS total_logins,
         SUM(al.action = 'register') AS total_registers,
         SUM(al.action = 'create_order') AS total_orders,
         SUM(al.action = 'add_to_cart') AS total_add_to_cart,
         SUM(al.action = 'view_product') AS total_product_views,
         SUM(al.action = 'search') AS total_searches
       FROM activity_logs al
       ${whereClause}`,
      params
    );

    // ── Activity by user type ─────────────────────────────────────────────────
    const byUserType = await query(
      `SELECT
         COALESCE(al.user_type, 'guest') AS user_type,
         COUNT(*) AS event_count,
         COUNT(DISTINCT CASE WHEN al.user_id IS NOT NULL THEN al.user_id ELSE al.session_id END) AS unique_users
       FROM activity_logs al
       ${whereClause}
       GROUP BY COALESCE(al.user_type, 'guest')
       ORDER BY event_count DESC`,
      params
    );

    // ── Daily activity trend (last 30 days or filtered range) ─────────────────
    const trendWhere = dateFilter.clause ? `WHERE ${dateFilter.clause}` : "WHERE al.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
    const trendParams = dateFilter.params.length ? dateFilter.params : [];
    const dailyTrend = await query(
      `SELECT
         DATE(al.created_at) AS date,
         COUNT(*) AS total_events,
         SUM(al.action = 'login') AS logins,
         SUM(al.action = 'create_order') AS orders,
         SUM(al.action = 'view_product') AS product_views,
         SUM(al.action = 'add_to_cart') AS add_to_carts,
         COUNT(DISTINCT CASE WHEN al.user_id IS NULL THEN al.session_id END) AS guest_sessions,
         COUNT(DISTINCT al.user_id) AS registered_users
       FROM activity_logs al
       ${trendWhere}
       GROUP BY DATE(al.created_at)
       ORDER BY date ASC`,
      trendParams
    );

    // ── Top actions ───────────────────────────────────────────────────────────
    const topActions = await query(
      `SELECT action, COUNT(*) AS count
       FROM activity_logs al
       ${whereClause}
       GROUP BY action
       ORDER BY count DESC
       LIMIT 15`,
      params
    );

    // ── Top active registered users ───────────────────────────────────────────
    const topUsers = await query(
      `SELECT
         u.id, u.full_name, u.email, u.role,
         COUNT(*) AS event_count,
         MAX(al.created_at) AS last_seen,
         SUM(al.action = 'login') AS login_count,
         SUM(al.action = 'create_order') AS order_count
       FROM activity_logs al
       JOIN users u ON al.user_id = u.id
       ${whereClause}
       GROUP BY u.id, u.full_name, u.email, u.role
       ORDER BY event_count DESC
       LIMIT 20`,
      params
    );

    // ── Guest session list ────────────────────────────────────────────────────
    const guestSessions = await query(
      `SELECT
         al.session_id,
         al.ip_address,
         COUNT(*) AS event_count,
         MIN(al.created_at) AS first_seen,
         MAX(al.created_at) AS last_seen,
         SUM(al.action = 'view_product') AS product_views,
         SUM(al.action = 'add_to_cart') AS add_to_carts,
         SUM(al.action = 'create_order') AS orders,
         SUM(al.action = 'search') AS searches,
         GROUP_CONCAT(DISTINCT al.action ORDER BY al.created_at SEPARATOR ', ') AS actions_summary
       FROM activity_logs al
       WHERE al.user_id IS NULL
         AND al.session_id IS NOT NULL
         ${dateFilter.clause ? `AND ${dateFilter.clause}` : ''}
       GROUP BY al.session_id, al.ip_address
       ORDER BY last_seen DESC
       LIMIT 100`,
      params
    );

    // ── Hour of day distribution ──────────────────────────────────────────────
    const hourlyDistribution = await query(
      `SELECT
         HOUR(al.created_at) AS hour,
         COUNT(*) AS count
       FROM activity_logs al
       ${whereClause}
       GROUP BY HOUR(al.created_at)
       ORDER BY hour`,
      params
    );

    // ── Top searched keywords ─────────────────────────────────────────────────
    const topSearches = await query(
      `SELECT
         JSON_UNQUOTE(JSON_EXTRACT(al.metadata, '$.keyword')) AS keyword,
         COUNT(*) AS count
       FROM activity_logs al
       WHERE al.action = 'search'
         AND al.metadata IS NOT NULL
         ${dateFilter.clause ? `AND ${dateFilter.clause}` : ''}
       GROUP BY keyword
       ORDER BY count DESC
       LIMIT 20`,
      params
    );

    // ── Top viewed products ───────────────────────────────────────────────────
    const topProducts = await query(
      `SELECT
         al.entity_id AS product_id,
         p.name AS product_name,
         p.slug,
         COUNT(*) AS view_count,
         COUNT(DISTINCT CASE WHEN al.user_id IS NOT NULL THEN al.user_id ELSE al.session_id END) AS unique_viewers
       FROM activity_logs al
       LEFT JOIN products p ON al.entity_id = p.id
       WHERE al.action = 'view_product'
         ${dateFilter.clause ? `AND ${dateFilter.clause}` : ''}
       GROUP BY al.entity_id, p.name, p.slug
       ORDER BY view_count DESC
       LIMIT 20`,
      params
    );

    res.json({
      success: true,
      data: {
        period: { start_date: start_date || null, end_date: end_date || null },
        totals: totals,
        byUserType,
        dailyTrend,
        topActions,
        topUsers,
        guestSessions,
        hourlyDistribution,
        topSearches,
        topProducts
      }
    });
  } catch (error) {
    console.error('Get activity report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity report',
      error: error.message
    });
  }
};

// @desc    Get session timeline (all events for one session_id or user_id)
// @route   GET /api/activity-logs/session/:sessionId
// @access  Private (Admin)
exports.getSessionTimeline = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const events = await query(
      `SELECT
         al.id, al.action, al.entity_type, al.entity_id,
         al.description, al.ip_address, al.request_url, al.request_method,
         al.user_type, al.created_at,
         u.full_name AS user_name, u.email AS user_email
       FROM activity_logs al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE al.session_id = ?
       ORDER BY al.created_at ASC`,
      [sessionId]
    );

    res.json({ success: true, data: events, session_id: sessionId });
  } catch (error) {
    console.error('Get session timeline error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch session timeline', error: error.message });
  }
};

