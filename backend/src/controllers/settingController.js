const { query } = require('../config/database');

// @desc    Get all settings
// @route   GET /api/settings
// @access  Public (only public settings) / Private (Admin - all settings)
exports.getSettings = async (req, res) => {
  try {
    let whereClause = '';
    
    if (!req.user || req.user.role !== 'admin') {
      whereClause = 'WHERE is_public = true';
    }

    const settings = await query(
      `SELECT setting_key, setting_value, setting_type, description, is_public
       FROM settings ${whereClause}`
    );

    // Convert to object format
    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.setting_key] = setting.setting_value;
    });

    res.json({ success: true, data: settingsObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update setting (Admin)
// @route   PUT /api/settings/:key
// @access  Private (Admin)
exports.updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (value === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Value required'
      });
    }

    // Check if setting exists
    const existing = await query(
      'SELECT id FROM settings WHERE setting_key = ?',
      [key]
    );

    if (existing.length === 0) {
      // Create new setting
      await query(
        'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)',
        [key, value]
      );
    } else {
      // Update existing setting
      await query(
        'UPDATE settings SET setting_value = ? WHERE setting_key = ?',
        [value, key]
      );
    }

    res.json({ success: true, message: 'Setting updated' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
