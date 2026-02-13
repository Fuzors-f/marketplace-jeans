const { query } = require('../config/database');
const path = require('path');
const fs = require('fs');
const { testEmailConfig, clearEmailSettingsCache } = require('../services/emailService');
const { clearMidtransSettingsCache } = require('../services/midtransService');

// Default settings to initialize
const defaultSettings = [
  // Site settings
  { key: 'site_name', value: 'Marketplace Jeans', type: 'text', description: 'Nama website', is_public: true, group: 'site' },
  { key: 'site_logo', value: '', type: 'image', description: 'Logo website', is_public: true, group: 'site' },
  { key: 'site_favicon', value: '', type: 'image', description: 'Favicon website', is_public: true, group: 'site' },
  { key: 'site_description', value: '', type: 'textarea', description: 'Deskripsi website', is_public: true, group: 'site' },
  
  // Contact settings
  { key: 'contact_address', value: '', type: 'textarea', description: 'Alamat perusahaan', is_public: true, group: 'contact' },
  { key: 'contact_phone', value: '', type: 'text', description: 'Nomor telepon', is_public: true, group: 'contact' },
  { key: 'contact_whatsapp', value: '', type: 'text', description: 'Nomor WhatsApp', is_public: true, group: 'contact' },
  { key: 'contact_email', value: '', type: 'text', description: 'Email kontak', is_public: true, group: 'contact' },
  
  // Email settings
  { key: 'email_smtp_host', value: '', type: 'text', description: 'SMTP Host', is_public: false, group: 'email' },
  { key: 'email_smtp_port', value: '587', type: 'text', description: 'SMTP Port', is_public: false, group: 'email' },
  { key: 'email_smtp_user', value: '', type: 'text', description: 'SMTP Username', is_public: false, group: 'email' },
  { key: 'email_smtp_pass', value: '', type: 'password', description: 'SMTP Password', is_public: false, group: 'email' },
  { key: 'email_smtp_secure', value: 'false', type: 'boolean', description: 'Gunakan SSL/TLS', is_public: false, group: 'email' },
  { key: 'email_from_name', value: '', type: 'text', description: 'Nama pengirim email', is_public: false, group: 'email' },
  { key: 'email_from_address', value: '', type: 'text', description: 'Alamat email pengirim', is_public: false, group: 'email' },
  { key: 'email_admin_address', value: '', type: 'text', description: 'Email admin untuk notifikasi pesanan', is_public: false, group: 'email' },
  { key: 'email_notify_admin_order', value: 'true', type: 'boolean', description: 'Kirim email ke admin saat ada pesanan baru', is_public: false, group: 'email' },
  { key: 'email_notify_user_order', value: 'true', type: 'boolean', description: 'Kirim email ke customer saat checkout', is_public: false, group: 'email' },
  
  // Payment gateway settings
  { key: 'payment_midtrans_enabled', value: 'false', type: 'boolean', description: 'Aktifkan Midtrans', is_public: false, group: 'payment' },
  { key: 'payment_midtrans_server_key', value: '', type: 'password', description: 'Midtrans Server Key', is_public: false, group: 'payment' },
  { key: 'payment_midtrans_client_key', value: '', type: 'text', description: 'Midtrans Client Key', is_public: true, group: 'payment' },
  { key: 'payment_midtrans_sandbox', value: 'true', type: 'boolean', description: 'Gunakan Sandbox Mode', is_public: false, group: 'payment' },
  { key: 'payment_bank_transfer_enabled', value: 'true', type: 'boolean', description: 'Aktifkan Transfer Bank', is_public: true, group: 'payment' },
  { key: 'payment_bank_name', value: '', type: 'text', description: 'Nama Bank', is_public: true, group: 'payment' },
  { key: 'payment_bank_account', value: '', type: 'text', description: 'Nomor Rekening', is_public: true, group: 'payment' },
  { key: 'payment_bank_holder', value: '', type: 'text', description: 'Nama Pemilik Rekening', is_public: true, group: 'payment' },
  
  // Social media
  { key: 'social_facebook', value: '', type: 'text', description: 'Facebook URL', is_public: true, group: 'social' },
  { key: 'social_instagram', value: '', type: 'text', description: 'Instagram URL', is_public: true, group: 'social' },
  { key: 'social_twitter', value: '', type: 'text', description: 'Twitter URL', is_public: true, group: 'social' },
  { key: 'social_tiktok', value: '', type: 'text', description: 'TikTok URL', is_public: true, group: 'social' },
  { key: 'social_youtube', value: '', type: 'text', description: 'YouTube URL', is_public: true, group: 'social' },
];

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
      `SELECT setting_key, setting_value, setting_type, description, is_public, setting_group
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

// @desc    Get all settings with full details (Admin)
// @route   GET /api/settings/all
// @access  Private (Admin)
exports.getAllSettingsDetailed = async (req, res) => {
  try {
    const settings = await query(
      `SELECT setting_key, setting_value, setting_type, description, is_public, setting_group
       FROM settings ORDER BY setting_group, setting_key`
    );

    // Group by setting_group
    const grouped = {};
    settings.forEach(setting => {
      const group = setting.setting_group || 'general';
      if (!grouped[group]) {
        grouped[group] = [];
      }
      grouped[group].push(setting);
    });

    res.json({ success: true, data: { settings, grouped } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Initialize default settings
// @route   POST /api/settings/init
// @access  Private (Admin)
exports.initializeSettings = async (req, res) => {
  try {
    let inserted = 0;
    let skipped = 0;

    for (const setting of defaultSettings) {
      const existing = await query(
        'SELECT id FROM settings WHERE setting_key = ?',
        [setting.key]
      );

      if (existing.length === 0) {
        await query(
          `INSERT INTO settings (setting_key, setting_value, setting_type, description, is_public, setting_group)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [setting.key, setting.value, setting.type, setting.description, setting.is_public, setting.group]
        );
        inserted++;
      } else {
        skipped++;
      }
    }

    res.json({ 
      success: true, 
      message: `Settings initialized. Inserted: ${inserted}, Skipped: ${skipped}` 
    });
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

// @desc    Bulk update settings (Admin)
// @route   PUT /api/settings
// @access  Private (Admin)
exports.bulkUpdateSettings = async (req, res) => {
  try {
    const { settings } = req.body;

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Settings object required'
      });
    }

    let updated = 0;
    let created = 0;

    for (const [key, value] of Object.entries(settings)) {
      const existing = await query(
        'SELECT id FROM settings WHERE setting_key = ?',
        [key]
      );

      if (existing.length === 0) {
        await query(
          'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)',
          [key, value]
        );
        created++;
      } else {
        await query(
          'UPDATE settings SET setting_value = ? WHERE setting_key = ?',
          [value, key]
        );
        updated++;
      }
    }

    // Clear caches after bulk update
    clearEmailSettingsCache();
    clearMidtransSettingsCache();

    res.json({ 
      success: true, 
      message: `Settings saved. Updated: ${updated}, Created: ${created}` 
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Upload setting image (logo, favicon, etc)
// @route   POST /api/settings/upload
// @access  Private (Admin)
exports.uploadSettingImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const imageUrl = `/uploads/settings/${req.file.filename}`;
    
    // If key is provided, update the setting directly
    const { key } = req.body;
    if (key) {
      const existing = await query(
        'SELECT id FROM settings WHERE setting_key = ?',
        [key]
      );

      if (existing.length === 0) {
        await query(
          `INSERT INTO settings (setting_key, setting_value, setting_type, is_public, setting_group) 
           VALUES (?, ?, 'image', true, 'site')`,
          [key, imageUrl]
        );
      } else {
        // Get old image path to delete
        const oldSetting = await query(
          'SELECT setting_value FROM settings WHERE setting_key = ?',
          [key]
        );
        
        // Delete old image if exists
        if (oldSetting.length > 0 && oldSetting[0].setting_value) {
          const oldImagePath = path.join(__dirname, '../../', oldSetting[0].setting_value);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }

        await query(
          'UPDATE settings SET setting_value = ? WHERE setting_key = ?',
          [imageUrl, key]
        );
      }
    }
    
    res.json({ 
      success: true, 
      data: { url: imageUrl },
      message: key ? 'Image uploaded and setting updated' : 'Image uploaded'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Upload and update setting image directly
// @route   POST /api/settings/upload/:key
// @access  Private (Admin)
exports.uploadAndUpdateSettingImage = async (req, res) => {
  try {
    const { key } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const imageUrl = `/uploads/settings/${req.file.filename}`;

    // Get old image path to delete
    const oldSetting = await query(
      'SELECT setting_value FROM settings WHERE setting_key = ?',
      [key]
    );
    
    // Delete old image if exists
    if (oldSetting.length > 0 && oldSetting[0].setting_value) {
      const oldImagePath = path.join(__dirname, '../../', oldSetting[0].setting_value);
      if (fs.existsSync(oldImagePath)) {
        try {
          fs.unlinkSync(oldImagePath);
        } catch (e) {
          console.log('Could not delete old image:', e.message);
        }
      }
    }

    // Update or create setting
    if (oldSetting.length === 0) {
      await query(
        `INSERT INTO settings (setting_key, setting_value, setting_type, is_public, setting_group) 
         VALUES (?, ?, 'image', true, 'site')`,
        [key, imageUrl]
      );
    } else {
      await query(
        'UPDATE settings SET setting_value = ? WHERE setting_key = ?',
        [imageUrl, key]
      );
    }

    res.json({ 
      success: true, 
      data: { url: imageUrl, key: key },
      message: 'Image updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Test email configuration
// @route   POST /api/settings/test-email
// @access  Private (Admin)
exports.testEmail = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address required'
      });
    }

    // Clear cache to get latest settings
    clearEmailSettingsCache();

    const result = await testEmailConfig(email);

    if (result.success) {
      res.json({ 
        success: true, 
        message: 'Test email sent successfully',
        messageId: result.messageId
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to send test email: ' + result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Clear settings cache (after update)
// @route   POST /api/settings/clear-cache
// @access  Private (Admin)
exports.clearSettingsCache = async (req, res) => {
  try {
    clearEmailSettingsCache();
    clearMidtransSettingsCache();
    
    res.json({ 
      success: true, 
      message: 'Settings cache cleared'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get Midtrans client configuration (for frontend)
// @route   GET /api/settings/payment-config
// @access  Public
exports.getPaymentConfig = async (req, res) => {
  try {
    const { getClientKey, isMidtransEnabled } = require('../services/midtransService');
    
    const enabled = await isMidtransEnabled();
    
    if (!enabled) {
      return res.json({
        success: true,
        data: {
          midtrans: {
            enabled: false
          }
        }
      });
    }

    const config = await getClientKey();

    res.json({
      success: true,
      data: {
        midtrans: {
          enabled: true,
          clientKey: config.clientKey,
          isProduction: config.isProduction,
          snapUrl: config.snapUrl
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
