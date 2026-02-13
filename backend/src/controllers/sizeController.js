const { query } = require('../config/database');
const { logActivity } = require('../middleware/activityLogger');

// @desc    Get all active sizes
// @route   GET /api/sizes
// @access  Public
exports.getAllSizes = async (req, res) => {
  try {
    const { include_inactive } = req.query;
    
    let sql = 'SELECT id, name, sort_order, is_active FROM sizes';
    const params = [];
    
    if (!include_inactive) {
      sql += ' WHERE is_active = true';
    }
    
    sql += ' ORDER BY sort_order ASC, name ASC';
    
    const results = await query(sql, params);
    
    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error fetching sizes:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sizes',
      error: error.message
    });
  }
};

// @desc    Create size (Admin only)
// @route   POST /api/sizes
// @access  Private/Admin
exports.createSize = async (req, res) => {
  try {
    const { name, sort_order } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }
    
    const { is_active } = req.body;
    
    const sql = `
      INSERT INTO sizes 
      (name, sort_order, is_active, created_at) 
      VALUES (?, ?, ?, NOW())
    `;
    
    const result = await query(sql, [name, sort_order || 0, is_active !== undefined ? is_active : true]);
    
    await logActivity(req.user.id, 'CREATE', 'size', result.insertId, `Created size: ${name}`);
    
    res.status(201).json({
      success: true,
      message: 'Size created successfully',
      data: {
        id: result.insertId,
        name,
        sort_order: sort_order || 0,
        is_active: true
      }
    });
  } catch (error) {
    console.error('Error creating size:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Size already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating size',
      error: error.message
    });
  }
};

// @desc    Update size (Admin only)
// @route   PUT /api/sizes/:id
// @access  Private/Admin
exports.updateSize = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sort_order, is_active } = req.body;
    
    const checkSql = 'SELECT id FROM sizes WHERE id = ?';
    const checkResult = await query(checkSql, [id]);
    
    if (checkResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Size not found'
      });
    }
    
    const updates = [];
    const params = [];
    
    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (sort_order !== undefined) {
      updates.push('sort_order = ?');
      params.push(sort_order);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(is_active);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }
    
    updates.push('updated_at = NOW()');
    params.push(id);
    
    const sql = `UPDATE sizes SET ${updates.join(', ')} WHERE id = ?`;
    await query(sql, params);
    
    await logActivity(req.user.id, 'UPDATE', 'size', id, `Updated size: ${name || 'ID ' + id}`);
    
    res.status(200).json({
      success: true,
      message: 'Size updated successfully'
    });
  } catch (error) {
    console.error('Error updating size:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Size already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating size',
      error: error.message
    });
  }
};

// @desc    Delete size (Admin only)
// @route   DELETE /api/sizes/:id
// @access  Private/Admin
exports.deleteSize = async (req, res) => {
  try {
    const { id } = req.params;
    
    const checkSql = 'SELECT name FROM sizes WHERE id = ?';
    const checkResult = await query(checkSql, [id]);
    
    if (checkResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Size not found'
      });
    }
    
    const sizeName = checkResult[0].name;
    
    const sql = 'DELETE FROM sizes WHERE id = ?';
    await query(sql, [id]);
    
    await logActivity(req.user.id, 'DELETE', 'size', id, `Deleted size: ${sizeName}`);
    
    res.status(200).json({
      success: true,
      message: 'Size deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting size:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting size',
      error: error.message
    });
  }
};
