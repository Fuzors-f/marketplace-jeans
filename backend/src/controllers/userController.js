const { query } = require('../config/database');

// @desc    Get all users (Admin)
// @route   GET /api/users
// @access  Private (Admin)
exports.getUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = '';
    let params = [];
    
    if (role) {
      whereClause = 'WHERE role = ?';
      params.push(role);
    }

    const users = await query(
      `SELECT id, email, full_name, phone, role, is_active, member_discount, created_at 
       FROM users ${whereClause} 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    res.json({ success: true, data: users });
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
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
