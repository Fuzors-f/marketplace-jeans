const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// Verify JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database
      const users = await query(
        'SELECT id, email, full_name, role, is_active, member_discount FROM users WHERE id = ?',
        [decoded.id]
      );

      if (!users || users.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!users[0].is_active) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated'
        });
      }

      // Attach user to request object
      req.user = users[0];
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route`
      });
    }

    next();
  };
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const users = await query(
          'SELECT id, email, full_name, role, is_active, member_discount FROM users WHERE id = ?',
          [decoded.id]
        );

        if (users && users.length > 0 && users[0].is_active) {
          req.user = users[0];
        }
      } catch (error) {
        // Token invalid, continue as guest
      }
    }

    next();
  } catch (error) {
    next();
  }
};

module.exports = { protect, authorize, optionalAuth };
