const { query } = require('../config/database');

// Log activity helper
const logActivity = async (userId, action, entityType = null, entityId = null, description = null, req = null) => {
  try {
    const ipAddress = req ? (req.headers['x-forwarded-for'] || req.connection.remoteAddress) : null;
    const userAgent = req ? req.headers['user-agent'] : null;

    await query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description, ip_address, user_agent) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, action, entityType, entityId, description, ipAddress, userAgent]
    );
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

// Activity logger middleware
const activityLogger = (action, entityType = null) => {
  return async (req, res, next) => {
    // Store original send function
    const originalSend = res.send;

    // Override send function
    res.send = function (data) {
      // Log only on successful requests
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const userId = req.user ? req.user.id : null;
        const entityId = req.params.id || (req.body && req.body.id) || null;
        const description = `${action} - ${req.method} ${req.originalUrl}`;

        logActivity(userId, action, entityType, entityId, description, req);
      }

      // Call original send
      originalSend.call(this, data);
    };

    next();
  };
};

module.exports = { logActivity, activityLogger };
