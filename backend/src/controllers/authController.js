const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const axios = require('axios');
const { query } = require('../config/database');
const { logActivity } = require('../middleware/activityLogger');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../services/emailService');

/**
 * Verify Google reCAPTCHA v2 token.
 * Returns true if valid, false otherwise.
 */
const verifyRecaptcha = async (token) => {
  try {
    const settings = await query(
      "SELECT setting_value FROM settings WHERE setting_key IN ('recaptcha_enabled', 'recaptcha_secret_key')"
    );
    const map = {};
    settings.forEach(s => { map[s.setting_key] = s.setting_value; });

    if (map['recaptcha_enabled'] !== 'true') return true; // reCAPTCHA disabled — always pass
    if (!map['recaptcha_secret_key']) return false;

    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: map['recaptcha_secret_key'],
          response: token
        }
      }
    );
    return response.data.success === true;
  } catch (err) {
    console.error('reCAPTCHA verify error:', err.message);
    return false;
  }
};

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { email, password, full_name, phone, role, recaptcha_token } = req.body;

    // Validation
    if (!email || !password || !full_name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password, and full name'
      });
    }

    // Verify reCAPTCHA if enabled
    const captchaOk = await verifyRecaptcha(recaptcha_token);
    if (!captchaOk) {
      return res.status(400).json({
        success: false,
        message: 'Verifikasi reCAPTCHA gagal. Silakan coba lagi.'
      });
    }

    // Check if user exists
    const existingUser = await query('SELECT id FROM users WHERE email = ?', [email]);
    
    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Determine role and member discount
    let userRole = 'guest';
    let memberDiscount = 0;

    if (role === 'member') {
      userRole = 'member';
      memberDiscount = 10; // Default 10% discount for members
    }

    // Insert user
    const result = await query(
      `INSERT INTO users (email, password, full_name, phone, role, member_discount) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [email, hashedPassword, full_name, phone || null, userRole, memberDiscount]
    );

    // Get created user
    const users = await query(
      'SELECT id, email, full_name, phone, role, member_discount FROM users WHERE id = ?',
      [result.insertId]
    );

    const user = users[0];

    // Generate token
    const token = generateToken(user.id);

    // Log activity
    await logActivity(user.id, 'register', 'user', user.id, 'User registered', req);

    // Send welcome email (async, don't wait for it)
    sendWelcomeEmail(user).catch(err => {
      console.error('Failed to send welcome email:', err);
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          phone: user.phone,
          role: user.role,
          member_discount: user.member_discount
        },
        token
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
};

// Generate short-lived temp token for 2FA verification step
const generateTempToken = (userId) => {
  return jwt.sign({ id: userId, purpose: '2fa_pending' }, process.env.JWT_SECRET, {
    expiresIn: '10m'
  });
};

// Generate a cryptographically random 6-digit OTP
const generateOTP = () => {
  return String(Math.floor(100000 + (crypto.randomInt(900000)))).padStart(6, '0');
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check user exists
    const users = await query(
      'SELECT id, email, password, full_name, phone, role, is_active, is_locked, locked_reason, two_fa_enabled, member_discount FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = users[0];

    // Check if user is locked
    if (user.is_locked) {
      return res.status(403).json({
        success: false,
        message: user.locked_reason
          ? `Akun Anda dikunci: ${user.locked_reason}`
          : 'Akun Anda telah dikunci. Hubungi administrator.'
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // --- 2FA Check ---
    if (user.two_fa_enabled) {
      // Generate OTP and save to DB (expires in 10 minutes)
      const otp = generateOTP();
      const expires = new Date(Date.now() + 10 * 60 * 1000);
      await query(
        'UPDATE users SET two_fa_code = ?, two_fa_code_expires = ? WHERE id = ?',
        [otp, expires, user.id]
      );

      // Send OTP via email
      const { send2FAEmail } = require('../services/emailService');
      send2FAEmail(user, otp).catch(err => console.error('Failed to send 2FA email:', err));

      // Return temp token so client can call verify-2fa
      const tempToken = generateTempToken(user.id);
      return res.json({
        success: true,
        two_fa_required: true,
        message: 'Kode verifikasi telah dikirim ke email Anda.',
        temp_token: tempToken
      });
    }

    // Generate token
    const token = generateToken(user.id);

    // Get user permissions if admin
    let permissions = [];
    if (user.role === 'admin' || user.role === 'admin_stok') {
      // Get permissions from user_roles and role_permissions
      const userPermissions = await query(
        `SELECT DISTINCT p.resource, p.action FROM permissions p
         JOIN role_permissions rp ON p.id = rp.permission_id
         JOIN user_roles ur ON rp.role_id = ur.role_id
         WHERE ur.user_id = ?`,
        [user.id]
      );
      permissions = userPermissions;
      
      // If user is admin role but has no specific permissions, give all permissions
      if (user.role === 'admin' && permissions.length === 0) {
        const allPermissions = await query('SELECT resource, action FROM permissions');
        permissions = allPermissions;
      }
    }

    // Log activity
    await logActivity(user.id, 'login', 'user', user.id, 'User logged in', req);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          phone: user.phone,
          role: user.role,
          member_discount: user.member_discount,
          permissions: permissions
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const users = await query(
      'SELECT id, email, full_name, phone, profile_picture, role, is_active, member_discount, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];

    // Get user permissions if admin
    let permissions = [];
    if (user.role === 'admin' || user.role === 'admin_stok') {
      const userPermissions = await query(
        `SELECT DISTINCT p.resource, p.action FROM permissions p
         JOIN role_permissions rp ON p.id = rp.permission_id
         JOIN user_roles ur ON rp.role_id = ur.role_id
         WHERE ur.user_id = ?`,
        [user.id]
      );
      permissions = userPermissions;
      
      // If user is admin role but has no specific permissions, give all permissions
      if (user.role === 'admin' && permissions.length === 0) {
        const allPermissions = await query('SELECT resource, action FROM permissions');
        permissions = allPermissions;
      }
    }

    res.json({
      success: true,
      data: { ...user, permissions }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { full_name, phone, email } = req.body;
    const userId = req.user.id;

    const updates = [];
    const values = [];

    if (full_name !== undefined && full_name !== null) {
      updates.push('full_name = ?');
      values.push(full_name);
    }

    if (phone !== undefined && phone !== null) {
      updates.push('phone = ?');
      values.push(phone);
    }

    if (email !== undefined && email !== null && email !== '') {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Format email tidak valid'
        });
      }

      // Check if email is already used by another user
      const existingUsers = await query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );
      if (existingUsers.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email sudah digunakan oleh pengguna lain'
        });
      }

      updates.push('email = ?');
      values.push(email);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    values.push(userId);

    await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const users = await query(
      'SELECT id, email, full_name, phone, role, member_discount FROM users WHERE id = ?',
      [userId]
    );

    await logActivity(userId, 'update_profile', 'user', userId, 'User updated profile', req);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: users[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const userId = req.user.id;

    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }

    // Get user password
    const users = await query('SELECT password FROM users WHERE id = ?', [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(current_password, users[0].password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Password saat ini salah'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);

    // Update password
    await query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

    await logActivity(userId, 'change_password', 'user', userId, 'User changed password', req);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message
    });
  }
};

// @desc    Upload profile picture
// @route   POST /api/auth/profile-picture
// @access  Private
exports.uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const imageUrl = `/uploads/users/${req.file.filename}`;

    // Update user profile picture
    await query('UPDATE users SET profile_picture = ? WHERE id = ?', [imageUrl, userId]);

    await logActivity(userId, 'update_profile_picture', 'user', userId, 'User updated profile picture', req);

    res.json({
      success: true,
      message: 'Profile picture updated successfully',
      data: { profile_picture: imageUrl }
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading profile picture',
      error: error.message
    });
  }
};

// @desc    Forgot password — send reset link via email
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email wajib diisi' });
    }

    const users = await query('SELECT id, full_name, email FROM users WHERE email = ?', [email]);
    // Always return success to avoid email enumeration
    if (users.length === 0) {
      return res.json({ success: true, message: 'Jika email terdaftar, link reset password telah dikirim.' });
    }

    const user = users[0];

    // Generate raw token and its SHA-256 hash to store in DB
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await query(
      'UPDATE users SET password_reset_token = ?, password_reset_expires = ? WHERE id = ?',
      [hashedToken, expires, user.id]
    );

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password/${rawToken}`;

    await sendPasswordResetEmail(user, resetUrl);

    logActivity(req, {
      user_id: null,
      action: 'forgot_password',
      entity_type: 'user',
      entity_id: user.id,
      description: `Password reset requested for ${user.email}`
    });

    res.json({ success: true, message: 'Jika email terdaftar, link reset password telah dikirim.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengirim email reset password', error: error.message });
  }
};

// @desc    Reset password using token from email
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password minimal 6 karakter' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const users = await query(
      'SELECT id, full_name, email FROM users WHERE password_reset_token = ? AND password_reset_expires > NOW()',
      [hashedToken]
    );

    if (users.length === 0) {
      return res.status(400).json({ success: false, message: 'Token tidak valid atau sudah kadaluarsa' });
    }

    const user = users[0];
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await query(
      'UPDATE users SET password = ?, password_reset_token = NULL, password_reset_expires = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );

    logActivity(req, {
      user_id: user.id,
      action: 'reset_password',
      entity_type: 'user',
      entity_id: user.id,
      description: `Password reset successful for ${user.email}`
    });

    res.json({ success: true, message: 'Password berhasil direset. Silakan login dengan password baru.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Gagal reset password', error: error.message });
  }
};

// ============================================================
// 2FA FEATURE
// ============================================================

// @desc    Verify 2FA OTP during login (2nd step)
// @route   POST /api/auth/verify-2fa-login
// @access  Public (requires temp_token from login step)
exports.verify2FALogin = async (req, res) => {
  try {
    const { temp_token, otp } = req.body;

    if (!temp_token || !otp) {
      return res.status(400).json({ success: false, message: 'Token sementara dan kode OTP wajib diisi' });
    }

    // Verify temp token
    let decoded;
    try {
      decoded = jwt.verify(temp_token, process.env.JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ success: false, message: 'Token sementara tidak valid atau sudah kadaluarsa' });
    }

    if (decoded.purpose !== '2fa_pending') {
      return res.status(401).json({ success: false, message: 'Token tidak valid' });
    }

    // Get user with OTP
    const users = await query(
      'SELECT id, email, full_name, phone, role, is_active, is_locked, member_discount, two_fa_code, two_fa_code_expires FROM users WHERE id = ?',
      [decoded.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    const user = users[0];

    // Re-check lock & active status
    if (user.is_locked) {
      return res.status(403).json({ success: false, message: 'Akun Anda telah dikunci.' });
    }
    if (!user.is_active) {
      return res.status(401).json({ success: false, message: 'Akun Anda tidak aktif.' });
    }

    // Check OTP
    if (!user.two_fa_code || user.two_fa_code !== String(otp).trim()) {
      return res.status(400).json({ success: false, message: 'Kode OTP tidak valid' });
    }

    if (!user.two_fa_code_expires || new Date() > new Date(user.two_fa_code_expires)) {
      return res.status(400).json({ success: false, message: 'Kode OTP sudah kadaluarsa' });
    }

    // Clear OTP
    await query('UPDATE users SET two_fa_code = NULL, two_fa_code_expires = NULL WHERE id = ?', [user.id]);

    // Get permissions
    let permissions = [];
    if (user.role === 'admin' || user.role === 'admin_stok') {
      const userPermissions = await query(
        `SELECT DISTINCT p.resource, p.action FROM permissions p
         JOIN role_permissions rp ON p.id = rp.permission_id
         JOIN user_roles ur ON rp.role_id = ur.role_id
         WHERE ur.user_id = ?`,
        [user.id]
      );
      permissions = userPermissions;
      if (user.role === 'admin' && permissions.length === 0) {
        permissions = await query('SELECT resource, action FROM permissions');
      }
    }

    const token = generateToken(user.id);
    await logActivity(user.id, 'login_2fa', 'user', user.id, 'User logged in with 2FA', req);

    res.json({
      success: true,
      message: 'Login berhasil',
      data: {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          phone: user.phone,
          role: user.role,
          member_discount: user.member_discount,
          permissions
        },
        token
      }
    });
  } catch (error) {
    console.error('Verify 2FA login error:', error);
    res.status(500).json({ success: false, message: 'Error verifikasi 2FA', error: error.message });
  }
};

// @desc    Request 2FA enable — sends OTP to user's email
// @route   POST /api/auth/2fa/setup
// @access  Private
exports.setup2FA = async (req, res) => {
  try {
    const userId = req.user.id;

    const users = await query('SELECT id, email, full_name, two_fa_enabled FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }
    const user = users[0];

    if (user.two_fa_enabled) {
      return res.status(400).json({ success: false, message: '2FA sudah aktif' });
    }

    const otp = generateOTP();
    const expires = new Date(Date.now() + 10 * 60 * 1000);
    await query('UPDATE users SET two_fa_code = ?, two_fa_code_expires = ? WHERE id = ?', [otp, expires, userId]);

    const { send2FAEmail } = require('../services/emailService');
    await send2FAEmail(user, otp);

    res.json({ success: true, message: 'Kode verifikasi telah dikirim ke email Anda. Berlaku 10 menit.' });
  } catch (error) {
    console.error('Setup 2FA error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengirim kode 2FA', error: error.message });
  }
};

// @desc    Confirm enable 2FA with OTP
// @route   POST /api/auth/2fa/enable
// @access  Private
exports.enable2FA = async (req, res) => {
  try {
    const { otp } = req.body;
    const userId = req.user.id;

    if (!otp) {
      return res.status(400).json({ success: false, message: 'Kode OTP wajib diisi' });
    }

    const users = await query(
      'SELECT id, two_fa_code, two_fa_code_expires, two_fa_enabled FROM users WHERE id = ?',
      [userId]
    );
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    const user = users[0];

    if (user.two_fa_enabled) {
      return res.status(400).json({ success: false, message: '2FA sudah aktif' });
    }

    if (!user.two_fa_code || user.two_fa_code !== String(otp).trim()) {
      return res.status(400).json({ success: false, message: 'Kode OTP tidak valid' });
    }

    if (!user.two_fa_code_expires || new Date() > new Date(user.two_fa_code_expires)) {
      return res.status(400).json({ success: false, message: 'Kode OTP sudah kadaluarsa' });
    }

    await query(
      'UPDATE users SET two_fa_enabled = 1, two_fa_code = NULL, two_fa_code_expires = NULL WHERE id = ?',
      [userId]
    );

    await logActivity(userId, 'enable_2fa', 'user', userId, 'User enabled 2FA', req);

    res.json({ success: true, message: '2FA berhasil diaktifkan. Setiap login akan memerlukan kode verifikasi email.' });
  } catch (error) {
    console.error('Enable 2FA error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengaktifkan 2FA', error: error.message });
  }
};

// @desc    Disable 2FA (requires password confirmation)
// @route   POST /api/auth/2fa/disable
// @access  Private
exports.disable2FA = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user.id;

    if (!password) {
      return res.status(400).json({ success: false, message: 'Password wajib diisi untuk menonaktifkan 2FA' });
    }

    const users = await query('SELECT id, password, two_fa_enabled FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    const user = users[0];

    if (!user.two_fa_enabled) {
      return res.status(400).json({ success: false, message: '2FA tidak aktif' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Password salah' });
    }

    await query(
      'UPDATE users SET two_fa_enabled = 0, two_fa_code = NULL, two_fa_code_expires = NULL WHERE id = ?',
      [userId]
    );

    await logActivity(userId, 'disable_2fa', 'user', userId, 'User disabled 2FA', req);

    res.json({ success: true, message: '2FA berhasil dinonaktifkan.' });
  } catch (error) {
    console.error('Disable 2FA error:', error);
    res.status(500).json({ success: false, message: 'Gagal menonaktifkan 2FA', error: error.message });
  }
};

// @desc    Get 2FA status
// @route   GET /api/auth/2fa/status
// @access  Private
exports.get2FAStatus = async (req, res) => {
  try {
    const users = await query('SELECT two_fa_enabled FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }
    res.json({ success: true, data: { two_fa_enabled: !!users[0].two_fa_enabled } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error', error: error.message });
  }
};
