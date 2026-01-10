const { query } = require('../config/database');
const ExcelJS = require('exceljs');
const moment = require('moment');

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

    // Get logs
    const logs = await query(
      `SELECT 
        al.id, al.user_id, al.action, al.entity_type, al.entity_id,
        al.description, al.ip_address, al.user_agent, 
        al.request_url, al.request_method, al.metadata,
        al.created_at,
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
