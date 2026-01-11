const { query } = require('../config/database');

// Action types for better categorization
const ACTION_TYPES = {
  // Auth actions
  LOGIN: 'login',
  LOGOUT: 'logout',
  REGISTER: 'register',
  PASSWORD_CHANGE: 'password_change',
  PASSWORD_RESET: 'password_reset',
  
  // User actions
  VIEW_PROFILE: 'view_profile',
  UPDATE_PROFILE: 'update_profile',
  
  // Product actions
  VIEW_PRODUCT: 'view_product',
  CREATE_PRODUCT: 'create_product',
  UPDATE_PRODUCT: 'update_product',
  DELETE_PRODUCT: 'delete_product',
  IMPORT_PRODUCTS: 'import_products',
  
  // Order actions
  CREATE_ORDER: 'create_order',
  UPDATE_ORDER: 'update_order',
  CANCEL_ORDER: 'cancel_order',
  VIEW_ORDER: 'view_order',
  
  // Cart actions
  ADD_TO_CART: 'add_to_cart',
  REMOVE_FROM_CART: 'remove_from_cart',
  UPDATE_CART: 'update_cart',
  
  // Inventory actions
  STOCK_IN: 'stock_in',
  STOCK_OUT: 'stock_out',
  STOCK_ADJUSTMENT: 'stock_adjustment',
  STOCK_TRANSFER: 'stock_transfer',
  STOCK_OPNAME: 'stock_opname',
  
  // Admin actions
  CREATE_USER: 'create_user',
  UPDATE_USER: 'update_user',
  DELETE_USER: 'delete_user',
  UPDATE_SETTINGS: 'update_settings',
  UPDATE_EXCHANGE_RATE: 'update_exchange_rate',
  
  // Report actions
  VIEW_REPORT: 'view_report',
  EXPORT_REPORT: 'export_report',
  
  // General
  PAGE_VIEW: 'page_view',
  SEARCH: 'search',
  API_REQUEST: 'api_request'
};

// Log activity helper - supports both individual params and object format
const logActivity = async (userIdOrOptions, action = null, entityType = null, entityId = null, description = null, req = null, metadata = null) => {
  try {
    let userId, ipAddress, userAgent, requestUrl, requestMethod, finalMetadata;

    // Check if first argument is an object (new format)
    if (typeof userIdOrOptions === 'object' && userIdOrOptions !== null && !Array.isArray(userIdOrOptions)) {
      const options = userIdOrOptions;
      userId = options.userId || options.user_id || null;
      action = options.action || 'unknown';
      entityType = options.targetType || options.entityType || options.entity_type || null;
      entityId = options.targetId || options.entityId || options.entity_id || null;
      description = options.details || options.description || null;
      req = options.req || null;
      finalMetadata = options.metadata || null;
      
      // Extract IP and user agent from req if provided
      ipAddress = req ? (req.headers?.['x-forwarded-for'] || req.connection?.remoteAddress || req.ip) : (options.ip_address || options.ipAddress || null);
      userAgent = req ? req.headers?.['user-agent'] : (options.user_agent || options.userAgent || null);
      requestUrl = req ? req.originalUrl : (options.request_url || options.requestUrl || null);
      requestMethod = req ? req.method : (options.request_method || options.requestMethod || null);
    } else {
      // Old format with individual parameters
      userId = userIdOrOptions;
      ipAddress = req ? (req.headers?.['x-forwarded-for'] || req.connection?.remoteAddress || req.ip) : null;
      userAgent = req ? req.headers?.['user-agent'] : null;
      requestUrl = req ? req.originalUrl : null;
      requestMethod = req ? req.method : null;
      finalMetadata = metadata;
    }

    // Debug log to verify the insert is happening
    console.log(`[ActivityLog] Inserting: user=${userId}, action=${action}, entity=${entityType}:${entityId}`);

    const result = await query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description, ip_address, user_agent, request_url, request_method, metadata) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, action, entityType, entityId, description, ipAddress, userAgent, requestUrl, requestMethod, finalMetadata ? JSON.stringify(finalMetadata) : null]
    );

    console.log(`[ActivityLog] Inserted successfully, ID: ${result.insertId}`);
    return result;
  } catch (error) {
    console.error('[ActivityLog] Error logging activity:', error);
    // Don't throw - just log the error so it doesn't break the main flow
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

// Middleware to log all API requests (optional, can be applied globally)
const requestLogger = async (req, res, next) => {
  const startTime = Date.now();
  
  // Store original end function
  const originalEnd = res.end;
  
  res.end = function (chunk, encoding) {
    const responseTime = Date.now() - startTime;
    const userId = req.user ? req.user.id : null;
    
    // Only log significant requests (skip static files, health checks)
    const skipPaths = ['/api/health', '/uploads', '/static'];
    const shouldSkip = skipPaths.some(path => req.originalUrl.startsWith(path));
    
    if (!shouldSkip && req.originalUrl.startsWith('/api/')) {
      // Log asynchronously to not block response
      setImmediate(() => {
        logActivity(
          userId,
          ACTION_TYPES.API_REQUEST,
          'api',
          null,
          `${req.method} ${req.originalUrl} - ${res.statusCode} (${responseTime}ms)`,
          req,
          { responseTime, statusCode: res.statusCode }
        );
      });
    }
    
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

module.exports = { logActivity, activityLogger, requestLogger, ACTION_TYPES };
