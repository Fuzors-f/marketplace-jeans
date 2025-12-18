const { query } = require('../config/database');
const { logActivity } = require('../middleware/activityLogger');

// @desc    Get all active banners
// @route   GET /api/banners
// @access  Public
exports.getAllBanners = async (req, res) => {
  try {
    const { position } = req.query;
    
    let sql = `
      SELECT id, title, subtitle, image_url, link_url, position, is_active, start_date, end_date, sort_order
      FROM banners
      WHERE is_active = true
        AND (start_date IS NULL OR start_date <= NOW())
        AND (end_date IS NULL OR end_date >= NOW())
    `;
    
    const params = [];
    if (position) {
      sql += ' AND position = ?';
      params.push(position);
    }
    
    sql += ' ORDER BY sort_order ASC';

    const results = await query(sql, params);

    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error fetching banners:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching banners',
      error: error.message
    });
  }
};

// @desc    Get all banners (Admin)
// @route   GET /api/banners/admin
// @access  Private/Admin
exports.getAdminBanners = async (req, res) => {
  try {
    const sql = `
      SELECT id, title, subtitle, image_url, link_url, position, is_active, start_date, end_date, sort_order, created_at
      FROM banners
      ORDER BY sort_order ASC, created_at DESC
    `;

    const results = await query(sql);

    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error fetching admin banners:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching banners',
      error: error.message
    });
  }
};

// @desc    Create banner (Admin only)
// @route   POST /api/banners
// @access  Private/Admin
exports.createBanner = async (req, res) => {
  try {
    const { title, subtitle, image_url, link_url, position, start_date, end_date, sort_order } = req.body;

    if (!title || !image_url) {
      return res.status(400).json({
        success: false,
        message: 'Title and image_url are required'
      });
    }

    const sql = `
      INSERT INTO banners 
      (title, subtitle, image_url, link_url, position, is_active, start_date, end_date, sort_order, created_at)
      VALUES (?, ?, ?, ?, ?, true, ?, ?, ?, NOW())
    `;

    const result = await query(sql, [
      title,
      subtitle || null,
      image_url,
      link_url || null,
      position || 'hero',
      start_date || null,
      end_date || null,
      sort_order || 0
    ]);

    await logActivity(req.user.id, 'CREATE', 'banner', result.insertId, `Created banner: ${title}`);

    res.status(201).json({
      success: true,
      message: 'Banner created successfully',
      data: {
        id: result.insertId,
        title,
        subtitle,
        image_url,
        link_url,
        position: position || 'hero',
        is_active: true
      }
    });
  } catch (error) {
    console.error('Error creating banner:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating banner',
      error: error.message
    });
  }
};

// @desc    Update banner (Admin only)
// @route   PUT /api/banners/:id
// @access  Private/Admin
exports.updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, image_url, link_url, position, is_active, start_date, end_date, sort_order } = req.body;

    // Check if banner exists
    const checkSql = 'SELECT id, title FROM banners WHERE id = ?';
    const checkResult = await query(checkSql, [id]);

    if (checkResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    // Build update query
    const updates = [];
    const params = [];

    if (title !== undefined) {
      updates.push('title = ?');
      params.push(title);
    }
    if (subtitle !== undefined) {
      updates.push('subtitle = ?');
      params.push(subtitle);
    }
    if (image_url !== undefined) {
      updates.push('image_url = ?');
      params.push(image_url);
    }
    if (link_url !== undefined) {
      updates.push('link_url = ?');
      params.push(link_url);
    }
    if (position !== undefined) {
      updates.push('position = ?');
      params.push(position);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(is_active);
    }
    if (start_date !== undefined) {
      updates.push('start_date = ?');
      params.push(start_date || null);
    }
    if (end_date !== undefined) {
      updates.push('end_date = ?');
      params.push(end_date || null);
    }
    if (sort_order !== undefined) {
      updates.push('sort_order = ?');
      params.push(sort_order);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updates.push('updated_at = NOW()');
    params.push(id);

    const sql = `UPDATE banners SET ${updates.join(', ')} WHERE id = ?`;
    await query(sql, params);

    await logActivity(req.user.id, 'UPDATE', 'banner', id, `Updated banner: ${title || checkResult[0].title}`);

    res.status(200).json({
      success: true,
      message: 'Banner updated successfully'
    });
  } catch (error) {
    console.error('Error updating banner:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating banner',
      error: error.message
    });
  }
};

// @desc    Delete banner (Admin only)
// @route   DELETE /api/admin/banners/:id
// @access  Private/Admin
exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if banner exists
    const checkSql = 'SELECT title FROM banners WHERE id = ?';
    const checkResult = await query(checkSql, [id]);

    if (checkResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    const bannerTitle = checkResult[0].title;

    // Delete banner
    const sql = 'DELETE FROM banners WHERE id = ?';
    await query(sql, [id]);

    await logActivity(req.user.id, 'DELETE', 'banner', id, `Deleted banner: ${bannerTitle}`);

    res.status(200).json({
      success: true,
      message: 'Banner deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting banner:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting banner',
      error: error.message
    });
  }
};
