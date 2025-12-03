const { query } = require('../config/database');
const ExcelJS = require('exceljs');
const moment = require('moment');

// @desc    Get sales report
// @route   GET /api/reports/sales
// @access  Private (Admin)
exports.getSalesReport = async (req, res) => {
  try {
    const { start_date, end_date, group_by = 'day' } = req.query;

    let dateCondition = '';
    let params = [];

    if (start_date && end_date) {
      dateCondition = 'WHERE o.created_at BETWEEN ? AND ?';
      params = [start_date, end_date];
    }

    const sales = await query(
      `SELECT 
        DATE(o.created_at) as date,
        COUNT(o.id) as total_orders,
        SUM(o.subtotal) as gross_sales,
        SUM(o.discount_amount + o.member_discount_amount) as total_discounts,
        SUM(o.shipping_cost) as total_shipping,
        SUM(o.total_amount) as net_sales,
        SUM(oi.unit_cost * oi.quantity) as total_cost,
        SUM(o.total_amount) - SUM(oi.unit_cost * oi.quantity) as profit
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      ${dateCondition}
      GROUP BY DATE(o.created_at)
      ORDER BY date DESC`,
      params
    );

    res.json({ success: true, data: sales });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get product performance report
// @route   GET /api/reports/products
// @access  Private (Admin)
exports.getProductReport = async (req, res) => {
  try {
    const { start_date, end_date, limit = 20 } = req.query;

    let dateCondition = '';
    let params = [];

    if (start_date && end_date) {
      dateCondition = 'WHERE o.created_at BETWEEN ? AND ?';
      params = [start_date, end_date];
    }

    const products = await query(
      `SELECT 
        p.id, p.name, p.sku,
        c.name as category_name,
        COUNT(DISTINCT o.id) as orders_count,
        SUM(oi.quantity) as units_sold,
        SUM(oi.subtotal) as revenue,
        SUM(oi.unit_cost * oi.quantity) as cost,
        SUM(oi.subtotal - (oi.unit_cost * oi.quantity)) as profit
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.product_variant_id
      LEFT JOIN orders o ON oi.order_id = o.id
      LEFT JOIN categories c ON p.category_id = c.id
      ${dateCondition}
      GROUP BY p.id
      ORDER BY units_sold DESC
      LIMIT ?`,
      [...params, parseInt(limit)]
    );

    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get category performance report
// @route   GET /api/reports/categories
// @access  Private (Admin)
exports.getCategoryReport = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let dateCondition = '';
    let params = [];

    if (start_date && end_date) {
      dateCondition = 'WHERE o.created_at BETWEEN ? AND ?';
      params = [start_date, end_date];
    }

    const categories = await query(
      `SELECT 
        c.id, c.name,
        COUNT(DISTINCT o.id) as orders_count,
        SUM(oi.quantity) as units_sold,
        SUM(oi.subtotal) as revenue
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      LEFT JOIN order_items oi ON p.id = oi.product_variant_id
      LEFT JOIN orders o ON oi.order_id = o.id
      ${dateCondition}
      GROUP BY c.id
      ORDER BY revenue DESC`,
      params
    );

    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export sales report to Excel
// @route   GET /api/reports/export/sales
// @access  Private (Admin)
exports.exportSalesReport = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let dateCondition = '';
    let params = [];

    if (start_date && end_date) {
      dateCondition = 'WHERE o.created_at BETWEEN ? AND ?';
      params = [start_date, end_date];
    }

    const sales = await query(
      `SELECT 
        o.order_number,
        o.created_at,
        o.status,
        o.payment_status,
        o.subtotal,
        o.discount_amount,
        o.member_discount_amount,
        o.shipping_cost,
        o.total_amount,
        u.email as customer_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ${dateCondition}
      ORDER BY o.created_at DESC`,
      params
    );

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sales Report');

    // Add headers
    worksheet.columns = [
      { header: 'Order Number', key: 'order_number', width: 20 },
      { header: 'Date', key: 'created_at', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Payment Status', key: 'payment_status', width: 15 },
      { header: 'Subtotal', key: 'subtotal', width: 15 },
      { header: 'Discount', key: 'discount_amount', width: 15 },
      { header: 'Member Discount', key: 'member_discount_amount', width: 15 },
      { header: 'Shipping', key: 'shipping_cost', width: 15 },
      { header: 'Total', key: 'total_amount', width: 15 },
      { header: 'Customer', key: 'customer_email', width: 25 }
    ];

    // Add rows
    sales.forEach(sale => {
      worksheet.addRow(sale);
    });

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Set response headers
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=sales-report-${moment().format('YYYY-MM-DD')}.xlsx`
    );

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/reports/dashboard
// @access  Private (Admin)
exports.getDashboardStats = async (req, res) => {
  try {
    // Total orders today
    const todayOrders = await query(
      `SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as revenue 
       FROM orders WHERE DATE(created_at) = CURDATE()`
    );

    // Total orders this month
    const monthOrders = await query(
      `SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as revenue 
       FROM orders WHERE YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())`
    );

    // Pending orders
    const pendingOrders = await query(
      `SELECT COUNT(*) as count FROM orders WHERE status = 'pending'`
    );

    // Low stock products
    const lowStock = await query(
      `SELECT COUNT(*) as count FROM product_variants WHERE stock_quantity < 10 AND is_active = true`
    );

    // Total products
    const totalProducts = await query(
      `SELECT COUNT(*) as count FROM products WHERE is_active = true`
    );

    // Total customers
    const totalCustomers = await query(
      `SELECT COUNT(*) as count FROM users WHERE role IN ('member', 'guest')`
    );

    res.json({
      success: true,
      data: {
        today: {
          orders: todayOrders[0].count,
          revenue: todayOrders[0].revenue
        },
        month: {
          orders: monthOrders[0].count,
          revenue: monthOrders[0].revenue
        },
        pending_orders: pendingOrders[0].count,
        low_stock: lowStock[0].count,
        total_products: totalProducts[0].count,
        total_customers: totalCustomers[0].count
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
