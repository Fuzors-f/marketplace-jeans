const rateLimit = require('express-rate-limit');

// General API rate limiter - more generous for production
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per windowMs (increased for production)
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for trusted proxies
  skip: (req) => {
    // Skip for health check endpoint
    if (req.path === '/api/health') return true;
    return false;
  }
});

// Auth rate limiter (stricter for security)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login attempts per windowMs
  message: {
    success: false,
    message: 'Too many login attempts, please try again later.'
  },
  skipSuccessfulRequests: true,
});

module.exports = apiLimiter;
module.exports.authLimiter = authLimiter;
