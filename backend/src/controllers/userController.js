const { query } = require('../config/database');
const { logActivity } = require('../middleware/activityLogger');
const bcrypt = require('bcryptjs');

// @desc    Get all users (Admin)
// @route   GET /api/users
// @access  Private (Admin)
exports.getUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;
    
    let whereConditions = [];
    let params = [];
    
    if (role) {
      whereConditions.push('role = ?');
      params.push(role);
    }
    
    if (search) {
      whereConditions.push('(full_name LIKE ? OR email LIKE ? OR phone LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    const users = await query(
      `SELECT id, email, full_name, phone, role, is_active, member_discount, created_at 
       FROM users ${whereClause} 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );
    
    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      params
    );

    res.json({ 
      success: true, 
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user by ID with details
// @route   GET /api/users/:id
// @access  Private (Admin)
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const users = await query(
      `SELECT id, email, full_name, phone, role, is_active, member_discount, created_at
       FROM users WHERE id = ?`,
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    const user = users[0];

    // Get user's order count and total spending
    const orderStats = await query(
      `SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_spending,
        MAX(created_at) as last_order_date
       FROM orders 
       WHERE user_id = ?`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...user,
        order_stats: orderStats[0]
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's orders
// @route   GET /api/users/:id/orders
// @access  Private (Admin)
exports.getUserOrders = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const orders = await query(
      `SELECT o.id, o.order_number, o.status, o.payment_status, o.total_amount, 
              o.shipping_method, o.created_at,
              (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
       FROM orders o
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [id, parseInt(limit), parseInt(offset)]
    );

    const countResult = await query(
      'SELECT COUNT(*) as total FROM orders WHERE user_id = ?',
      [id]
    );

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new user (Admin)
// @route   POST /api/users
// @access  Private (Admin)
exports.createUser = async (req, res) => {
  try {
    const { email, password, full_name, phone, role = 'customer', member_discount = 0 } = req.body;

    // Validation
    if (!email || !password || !full_name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, dan nama lengkap harus diisi'
      });
    }

    // Check if email exists
    const existingUser = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah terdaftar'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await query(
      `INSERT INTO users (email, password, full_name, phone, role, member_discount, is_active)
       VALUES (?, ?, ?, ?, ?, ?, true)`,
      [email, hashedPassword, full_name, phone || null, role, member_discount]
    );

    // Log activity
    await logActivity(req.user.id, 'create_user', 'user', result.insertId, 
      `Created new user: ${email}`, req, { email, role });

    res.status(201).json({
      success: true,
      message: 'User berhasil dibuat',
      data: { id: result.insertId }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Search users by name or email (Admin)
// @route   GET /api/users/search
// @access  Private (Admin)
exports.searchUsers = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ success: true, data: [] });
    }

    const searchTerm = `%${q}%`;
    const users = await query(
      `SELECT id, email, full_name, phone, role, is_active, member_discount 
       FROM users 
       WHERE (full_name LIKE ? OR email LIKE ? OR phone LIKE ?)
       AND is_active = true
       ORDER BY full_name ASC 
       LIMIT ?`,
      [searchTerm, searchTerm, searchTerm, parseInt(limit)]
    );

    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user role/status (Admin)
// @route   PUT /api/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, is_active, member_discount } = req.body;
    
    const updates = [];
    const values = [];

    if (role) {
      updates.push('role = ?');
      values.push(role);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(is_active);
    }
    if (member_discount !== undefined) {
      updates.push('member_discount = ?');
      values.push(member_discount);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    values.push(id);
    await query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
    
    // Log activity
    await logActivity(req.user.id, 'update_user', 'user', id, 
      `Updated user settings`, req, { role, is_active, member_discount });

    res.json({ success: true, message: 'User updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user (Admin)
// @route   DELETE /api/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM users WHERE id = ?', [id]);
    
    // Log activity
    await logActivity(req.user.id, 'delete_user', 'user', id, 
      `Deleted user`, req);

    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
