const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const homeRoutes = require('./src/routes/homeRoutes');
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

// Import middleware
const errorHandler = require('./src/middleware/errorHandler');
const rateLimiter = require('./src/middleware/rateLimiter');

// Initialize express app
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

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

// Rate limiting - Only apply to specific routes to prevent login issues
// Disabled globally to prevent blocking all APIs
// app.use('/api/', rateLimiter);

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

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('\n Server running in ' + process.env.NODE_ENV + ' mode on port ' + PORT);
  console.log(' API: http://localhost:' + PORT + '/api');
  console.log(' Health check: http://localhost:' + PORT + '/api/health\n');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION!  Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

module.exports = app;
