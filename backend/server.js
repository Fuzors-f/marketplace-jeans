const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const dotenv = require('dotenv');

// Load environment-specific config
const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env';
dotenv.config({ path: envFile });
// Fallback to .env if environment file doesn't exist
dotenv.config();

// Import routes
const homeRoutes = require('./src/routes/homeRoutes');
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const productRoutes = require('./src/routes/productRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const fittingRoutes = require('./src/routes/fittingRoutes');
const sizeRoutes = require('./src/routes/sizeRoutes');
const bannerRoutes = require('./src/routes/bannerRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const inventoryRoutes = require('./src/routes/inventoryRoutes');
const reportRoutes = require('./src/routes/reportRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const shippingRoutes = require('./src/routes/shippingRoutes');
const discountRoutes = require('./src/routes/discountRoutes');
const settingRoutes = require('./src/routes/settingRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const sizeChartRoutes = require('./src/routes/sizeChartRoutes');
const warehouseRoutes = require('./src/routes/warehouseRoutes');
const stockRoutes = require('./src/routes/stockRoutes');
const opnameRoutes = require('./src/routes/opnameRoutes');
const roleRoutes = require('./src/routes/roleRoutes');
const cityRoutes = require('./src/routes/cityRoutes');
const shippingCostRoutes = require('./src/routes/shippingCostRoutes');
const addressRoutes = require('./src/routes/addressRoutes');
const trackingRoutes = require('./src/routes/trackingRoutes');
const exchangeRateRoutes = require('./src/routes/exchangeRateRoutes');
const activityLogRoutes = require('./src/routes/activityLogRoutes');
const contentRoutes = require('./src/routes/contentRoutes');
const wishlistRoutes = require('./src/routes/wishlistRoutes');
const couponRoutes = require('./src/routes/couponRoutes');

// Import middleware
const errorHandler = require('./src/middleware/errorHandler');
const rateLimiter = require('./src/middleware/rateLimiter');

// Initialize express app
const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration - Configure based on environment
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // In development, allow all origins
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // In production/staging, check against allowed origins
    const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
      .split(',')
      .map(url => url.trim());
    
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-session-id'],
  credentials: true
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Compression middleware
app.use(compression());

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting - Apply in production/staging environments
if (process.env.NODE_ENV !== 'development') {
  // Apply general rate limiter to all API routes
  app.use('/api/', rateLimiter);
}

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/home', homeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/fittings', fittingRoutes);
app.use('/api/sizes', sizeRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/size-charts', sizeChartRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/opname', opnameRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/shipping-costs', shippingCostRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/exchange-rates', exchangeRateRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/coupons', couponRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Marketplace Jeans API is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const API_URL = process.env.API_URL || `http://localhost:${PORT}/api`;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 API URL: ${API_URL}`);
});

module.exports = app;
