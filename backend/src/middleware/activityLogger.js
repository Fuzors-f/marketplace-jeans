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
  CLEAR_CART: 'clear_cart',

  // Wishlist actions
  ADD_TO_WISHLIST: 'add_to_wishlist',
  REMOVE_FROM_WISHLIST: 'remove_from_wishlist',

  // Search & browse
  SEARCH: 'search',
  PAGE_VIEW: 'page_view',

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
  API_REQUEST: 'api_request'
};

// Resolve user_type from user object or role string
const resolveUserType = (user) => {
  if (!user) return 'guest';
  const role = (user.role || '').toLowerCase();
  if (role === 'admin') return 'admin';
  if (role === 'admin_stok') return 'admin_stok';
  if (role === 'member') return 'member';
  return 'guest';
};

// Log activity helper - supports both individual params and object format
const logActivity = async (userIdOrOptions, action = null, entityType = null, entityId = null, description = null, req = null, metadata = null) => {
  try {
    let userId, ipAddress, userAgent, requestUrl, requestMethod, finalMetadata, sessionId, userType, pagePath;

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
      sessionId = options.session_id || options.sessionId || null;
      userType = options.user_type || options.userType || null;
      pagePath = options.page_path || options.pagePath || null;

      // Extract IP and user agent from req if provided
      ipAddress = req ? (req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() || req.connection?.remoteAddress || req.ip) : (options.ip_address || options.ipAddress || null);
      userAgent = req ? req.headers?.['user-agent'] : (options.user_agent || options.userAgent || null);
      requestUrl = req ? req.originalUrl : (options.request_url || options.requestUrl || null);
      requestMethod = req ? req.method : (options.request_method || options.requestMethod || null);
      if (req && !sessionId) sessionId = req.headers?.['x-session-id'] || null;
      if (req && !userType) userType = resolveUserType(req.user);
    } else {
      // Old format with individual parameters
      userId = userIdOrOptions;
      ipAddress = req ? (req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() || req.connection?.remoteAddress || req.ip) : null;
      userAgent = req ? req.headers?.['user-agent'] : null;
      requestUrl = req ? req.originalUrl : null;
      requestMethod = req ? req.method : null;
      finalMetadata = metadata;
      sessionId = req ? (req.headers?.['x-session-id'] || null) : null;
      userType = req ? resolveUserType(req.user) : null;
      pagePath = null;
    }

    const result = await query(
      `INSERT INTO activity_logs 
        (user_id, session_id, user_type, action, entity_type, entity_id, description, ip_address, user_agent, request_url, request_method, metadata, page_path) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, sessionId, userType, action, entityType, entityId,
        description, ipAddress, userAgent, requestUrl, requestMethod,
        finalMetadata ? JSON.stringify(finalMetadata) : null,
        pagePath
      ]
    );

    return result;
  } catch (error) {
    console.error('[ActivityLog] Error logging activity:', error);
    // Don't throw - just log the error so it doesn't break the main flow
  }
};

// Activity logger middleware
const activityLogger = (action, entityType = null) => {
  return async (req, res, next) => {
    const originalSend = res.send;

    res.send = function (data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const userId = req.user ? req.user.id : null;
        const entityId = req.params.id || (req.body && req.body.id) || null;
        const description = `${action} - ${req.method} ${req.originalUrl}`;
        logActivity(userId, action, entityType, entityId, description, req);
      }
      originalSend.call(this, data);
    };

    next();
  };
};

// Middleware to log all API requests (optional, can be applied globally)
const requestLogger = async (req, res, next) => {
  const startTime = Date.now();
  const originalEnd = res.end;

  res.end = function (chunk, encoding) {
    const responseTime = Date.now() - startTime;
    const userId = req.user ? req.user.id : null;

    // Only log significant requests (skip static files, health checks)
    const skipPaths = ['/api/health', '/uploads', '/static'];
    const shouldSkip = skipPaths.some(p => req.originalUrl.startsWith(p));

    if (!shouldSkip && req.originalUrl.startsWith('/api/')) {
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
