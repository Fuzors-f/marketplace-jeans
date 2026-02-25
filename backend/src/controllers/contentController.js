const { query } = require('../config/database');
const { logActivity } = require('../middleware/activityLogger');

// @desc    Get all content settings (public)
// @route   GET /api/content
// @access  Public
exports.getAllContent = async (req, res) => {
  try {
    const { lang } = req.query;
    
    const results = await query(`
      SELECT 
        id, section_key, section_name,
        title_id, title_en,
        subtitle_id, subtitle_en,
        content_id, content_en,
        button_text_id, button_text_en,
        button_url, image_url, extra_data,
        is_active, sort_order
      FROM content_settings
      WHERE is_active = true
      ORDER BY sort_order ASC
    `);

    // Transform based on language preference
    const data = results.map(item => ({
      id: item.id,
      section_key: item.section_key,
      section_name: item.section_name,
      title: lang === 'en' ? (item.title_en || item.title_id) : item.title_id,
      title_id: item.title_id,
      title_en: item.title_en,
      subtitle: lang === 'en' ? (item.subtitle_en || item.subtitle_id) : item.subtitle_id,
      subtitle_id: item.subtitle_id,
      subtitle_en: item.subtitle_en,
      content: lang === 'en' ? (item.content_en || item.content_id) : item.content_id,
      content_id: item.content_id,
      content_en: item.content_en,
      button_text: lang === 'en' ? (item.button_text_en || item.button_text_id) : item.button_text_id,
      button_text_id: item.button_text_id,
      button_text_en: item.button_text_en,
      button_url: item.button_url,
      image_url: item.image_url,
      extra_data: item.extra_data ? JSON.parse(item.extra_data) : null,
      is_active: item.is_active,
      sort_order: item.sort_order
    }));

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching content settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching content settings',
      error: error.message
    });
  }
};

// @desc    Get content by section key (public)
// @route   GET /api/content/:sectionKey
// @access  Public
exports.getContentByKey = async (req, res) => {
  try {
    const { sectionKey } = req.params;
    const { lang } = req.query;

    const results = await query(`
      SELECT * FROM content_settings 
      WHERE section_key = ? AND is_active = true
    `, [sectionKey]);

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    const item = results[0];
    const data = {
      id: item.id,
      section_key: item.section_key,
      section_name: item.section_name,
      title: lang === 'en' ? (item.title_en || item.title_id) : item.title_id,
      title_id: item.title_id,
      title_en: item.title_en,
      subtitle: lang === 'en' ? (item.subtitle_en || item.subtitle_id) : item.subtitle_id,
      subtitle_id: item.subtitle_id,
      subtitle_en: item.subtitle_en,
      content: lang === 'en' ? (item.content_en || item.content_id) : item.content_id,
      content_id: item.content_id,
      content_en: item.content_en,
      button_text: lang === 'en' ? (item.button_text_en || item.button_text_id) : item.button_text_id,
      button_text_id: item.button_text_id,
      button_text_en: item.button_text_en,
      button_url: item.button_url,
      image_url: item.image_url,
      extra_data: item.extra_data ? JSON.parse(item.extra_data) : null
    };

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching content',
      error: error.message
    });
  }
};

// @desc    Get all content settings (Admin)
// @route   GET /api/content/admin/all
// @access  Private/Admin
exports.getAdminContent = async (req, res) => {
  try {
    const results = await query(`
      SELECT cs.*, u.full_name as updated_by_name
      FROM content_settings cs
      LEFT JOIN users u ON cs.updated_by = u.id
      ORDER BY sort_order ASC
    `);

    const data = results.map(item => ({
      ...item,
      extra_data: item.extra_data ? JSON.parse(item.extra_data) : null
    }));

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching admin content:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching content settings',
      error: error.message
    });
  }
};

// @desc    Update content setting (Admin)
// @route   PUT /api/content/:id
// @access  Private/Admin
exports.updateContent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      section_name,
      title_id, title_en,
      subtitle_id, subtitle_en,
      content_id, content_en,
      button_text_id, button_text_en,
      button_url, image_url, extra_data,
      is_active, sort_order
    } = req.body;

    // Check if exists
    const existing = await query('SELECT * FROM content_settings WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Content setting not found'
      });
    }

    const sql = `
      UPDATE content_settings SET
        section_name = COALESCE(?, section_name),
        title_id = COALESCE(?, title_id),
        title_en = COALESCE(?, title_en),
        subtitle_id = COALESCE(?, subtitle_id),
        subtitle_en = COALESCE(?, subtitle_en),
        content_id = COALESCE(?, content_id),
        content_en = COALESCE(?, content_en),
        button_text_id = COALESCE(?, button_text_id),
        button_text_en = COALESCE(?, button_text_en),
        button_url = COALESCE(?, button_url),
        image_url = COALESCE(?, image_url),
        extra_data = COALESCE(?, extra_data),
        is_active = COALESCE(?, is_active),
        sort_order = COALESCE(?, sort_order),
        updated_by = ?,
        updated_at = NOW()
      WHERE id = ?
    `;

    await query(sql, [
      section_name ?? null,
      title_id ?? null, title_en ?? null,
      subtitle_id ?? null, subtitle_en ?? null,
      content_id ?? null, content_en ?? null,
      button_text_id ?? null, button_text_en ?? null,
      button_url ?? null, image_url ?? null,
      extra_data ? JSON.stringify(extra_data) : null,
      is_active ?? null, sort_order ?? null,
      req.user.id,
      id
    ]);

    // Log activity
    await logActivity({
      userId: req.user.id,
      action: 'UPDATE_CONTENT',
      targetType: 'content_settings',
      targetId: id,
      details: `Updated content: ${existing[0].section_key}`,
      metadata: { section_key: existing[0].section_key }
    });

    // Return updated content
    const updated = await query('SELECT * FROM content_settings WHERE id = ?', [id]);

    res.status(200).json({
      success: true,
      message: 'Content updated successfully',
      data: {
        ...updated[0],
        extra_data: updated[0].extra_data ? JSON.parse(updated[0].extra_data) : null
      }
    });
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating content',
      error: error.message
    });
  }
};

// @desc    Create content setting (Admin)
// @route   POST /api/content
// @access  Private/Admin
exports.createContent = async (req, res) => {
  try {
    const {
      section_key, section_name,
      title_id, title_en,
      subtitle_id, subtitle_en,
      content_id, content_en,
      button_text_id, button_text_en,
      button_url, image_url, extra_data,
      is_active, sort_order
    } = req.body;

    if (!section_key || !section_name) {
      return res.status(400).json({
        success: false,
        message: 'Section key and name are required'
      });
    }

    // Check if section_key already exists
    const existing = await query('SELECT id FROM content_settings WHERE section_key = ?', [section_key]);
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Section key already exists'
      });
    }

    const sql = `
      INSERT INTO content_settings (
        section_key, section_name,
        title_id, title_en,
        subtitle_id, subtitle_en,
        content_id, content_en,
        button_text_id, button_text_en,
        button_url, image_url, extra_data,
        is_active, sort_order, updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await query(sql, [
      section_key, section_name,
      title_id || null, title_en || null,
      subtitle_id || null, subtitle_en || null,
      content_id || null, content_en || null,
      button_text_id || null, button_text_en || null,
      button_url || null, image_url || null,
      extra_data ? JSON.stringify(extra_data) : null,
      is_active !== undefined ? is_active : true,
      sort_order || 0,
      req.user.id
    ]);

    // Log activity
    await logActivity({
      userId: req.user.id,
      action: 'CREATE_CONTENT',
      targetType: 'content_settings',
      targetId: result.insertId,
      details: `Created content: ${section_key}`
    });

    const newContent = await query('SELECT * FROM content_settings WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Content created successfully',
      data: {
        ...newContent[0],
        extra_data: newContent[0].extra_data ? JSON.parse(newContent[0].extra_data) : null
      }
    });
  } catch (error) {
    console.error('Error creating content:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating content',
      error: error.message
    });
  }
};

// @desc    Delete content setting (Admin)
// @route   DELETE /api/content/:id
// @access  Private/Admin
exports.deleteContent = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await query('SELECT * FROM content_settings WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    await query('DELETE FROM content_settings WHERE id = ?', [id]);

    // Log activity
    await logActivity({
      userId: req.user.id,
      action: 'DELETE_CONTENT',
      targetType: 'content_settings',
      targetId: id,
      details: `Deleted content: ${existing[0].section_key}`
    });

    res.status(200).json({
      success: true,
      message: 'Content deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting content',
      error: error.message
    });
  }
};
