const { query } = require('../config/database');
const { logActivity } = require('../middleware/activityLogger');

// @desc    Get all active fittings
// @route   GET /api/fittings
// @access  Public
exports.getAllFittings = async (req, res) => {
  try {
    const { include_inactive } = req.query;
    
    let sql = 'SELECT id, name, slug, description, is_active FROM fittings';
    const params = [];
    
    if (!include_inactive) {
      sql += ' WHERE is_active = true';
    }
    
    sql += ' ORDER BY name ASC';
    
    const results = await query(sql, params);
    
    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error fetching fittings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching fittings',
      error: error.message
    });
  }
};

// @desc    Create fitting (Admin only)
// @route   POST /api/fittings
// @access  Private/Admin
exports.createFitting = async (req, res) => {
  try {
    const { name, slug, description } = req.body;
    
    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: 'Name and slug are required'
      });
    }
    
    const { is_active } = req.body;
    
    const sql = `
      INSERT INTO fittings 
      (name, slug, description, is_active, created_at) 
      VALUES (?, ?, ?, ?, NOW())
    `;
    
    const result = await query(sql, [name, slug, description || null, is_active !== undefined ? is_active : true]);
    
    await logActivity(req.user.id, 'CREATE', 'fitting', result.insertId, `Created fitting: ${name}`);
    
    res.status(201).json({
      success: true,
      message: 'Fitting created successfully',
      data: {
        id: result.insertId,
        name,
        slug,
        description,
        is_active: true
      }
    });
  } catch (error) {
    console.error('Error creating fitting:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Slug already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating fitting',
      error: error.message
    });
  }
};

// @desc    Update fitting (Admin only)
// @route   PUT /api/fittings/:id
// @access  Private/Admin
exports.updateFitting = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, is_active } = req.body;
    
    const checkSql = 'SELECT id FROM fittings WHERE id = ?';
    const checkResult = await query(checkSql, [id]);
    
    if (checkResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Fitting not found'
      });
    }
    
    const updates = [];
    const params = [];
    
    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (slug !== undefined) {
      updates.push('slug = ?');
      params.push(slug);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
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
    
    const sql = `UPDATE fittings SET ${updates.join(', ')} WHERE id = ?`;
    await query(sql, params);
    
    await logActivity(req.user.id, 'UPDATE', 'fitting', id, `Updated fitting: ${name || 'ID ' + id}`);
    
    res.status(200).json({
      success: true,
      message: 'Fitting updated successfully'
    });
  } catch (error) {
    console.error('Error updating fitting:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Slug already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating fitting',
      error: error.message
    });
  }
};

// @desc    Delete fitting (Admin only)
// @route   DELETE /api/fittings/:id
// @access  Private/Admin
exports.deleteFitting = async (req, res) => {
  try {
    const { id } = req.params;
    
    const checkSql = 'SELECT name FROM fittings WHERE id = ?';
    const checkResult = await query(checkSql, [id]);
    
    if (checkResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Fitting not found'
      });
    }
    
    const fittingName = checkResult[0].name;
    
    const sql = 'DELETE FROM fittings WHERE id = ?';
    await query(sql, [id]);
    
    await logActivity(req.user.id, 'DELETE', 'fitting', id, `Deleted fitting: ${fittingName}`);
    
    res.status(200).json({
      success: true,
      message: 'Fitting deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting fitting:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting fitting',
      error: error.message
    });
  }
};
