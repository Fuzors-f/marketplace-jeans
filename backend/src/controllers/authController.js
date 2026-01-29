const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const { logActivity } = require('../middleware/activityLogger');
const { sendWelcomeEmail } = require('../services/emailService');

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
    const { email, password, full_name, phone, role } = req.body;

    // Validation
    if (!email || !password || !full_name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password, and full name'
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
      'SELECT id, email, password, full_name, phone, role, is_active, member_discount FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = users[0];

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
    const { full_name, phone } = req.body;
    const userId = req.user.id;

    const updates = [];
    const values = [];

    if (full_name) {
      updates.push('full_name = ?');
      values.push(full_name);
    }

    if (phone) {
      updates.push('phone = ?');
      values.push(phone);
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
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
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
