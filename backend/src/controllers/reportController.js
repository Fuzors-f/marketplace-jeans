const { query } = require('../config/database');
const ExcelJS = require('exceljs');
const moment = require('moment');

// @desc    Get sales report with profit analysis
// @route   GET /api/reports/sales
// @access  Private (Admin)
const getSalesReport = async (req, res) => {
  try {
    const { start_date, end_date, group_by = 'day', warehouse_id } = req.query;

    let dateCondition = [];
    let params = [];

    if (start_date && end_date) {
      dateCondition.push('o.created_at BETWEEN ? AND ?');
      params.push(start_date, end_date + ' 23:59:59');
    }

    if (warehouse_id) {
      dateCondition.push('EXISTS (SELECT 1 FROM order_items oi2 JOIN product_variants pv2 ON oi2.product_variant_id = pv2.id WHERE oi2.order_id = o.id AND pv2.warehouse_id = ?)');
      params.push(warehouse_id);
    }

    const whereClause = dateCondition.length > 0 ? `WHERE ${dateCondition.join(' AND ')}` : '';

    const sales = await query(
      `SELECT 
        DATE(o.created_at) as date,
        COUNT(DISTINCT o.id) as total_orders,
        COUNT(DISTINCT o.user_id) as unique_customers,
        SUM(oi.quantity) as items_sold,
        SUM(oi.price * oi.quantity) as gross_sales,
        SUM(o.discount_amount) as total_discounts,
        SUM(o.shipping_cost) as total_shipping,
        SUM(o.total) as net_sales,
        SUM(oi.quantity * COALESCE(pv.cost_price, 0)) as total_cost,
        SUM(o.total) - SUM(oi.quantity * COALESCE(pv.cost_price, 0)) as gross_profit,
        ROUND(((SUM(o.total) - SUM(oi.quantity * COALESCE(pv.cost_price, 0))) / NULLIF(SUM(o.total), 0) * 100), 2) as profit_margin
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN product_variants pv ON oi.product_variant_id = pv.id
      ${whereClause}
      GROUP BY DATE(o.created_at)
      ORDER BY date DESC`,
      params
    );

    // Calculate summary totals
    const summary = await query(
      `SELECT 
        COUNT(DISTINCT o.id) as total_orders,
        COUNT(DISTINCT o.user_id) as unique_customers,
        SUM(oi.quantity) as total_items_sold,
        SUM(oi.price * oi.quantity) as total_gross_sales,
        SUM(o.discount_amount) as total_discounts,
        SUM(o.shipping_cost) as total_shipping,
        SUM(o.total) as total_net_sales,
        SUM(oi.quantity * COALESCE(pv.cost_price, 0)) as total_cost,
        SUM(o.total) - SUM(oi.quantity * COALESCE(pv.cost_price, 0)) as total_profit,
        ROUND(((SUM(o.total) - SUM(oi.quantity * COALESCE(pv.cost_price, 0))) / NULLIF(SUM(o.total), 0) * 100), 2) as avg_profit_margin
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN product_variants pv ON oi.product_variant_id = pv.id
      ${whereClause}`,
      params
    );

    res.json({
      success: true,
      data: {
        daily_sales: sales,
        summary: summary[0] || {}
      }
    });

  } catch (error) {
    console.error('Sales report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate sales report',
      error: error.message
    });
  }
};

// @desc    Get product performance report
// @route   GET /api/reports/products
// @access  Private (Admin)
const getProductReport = async (req, res) => {
  try {
    const { start_date, end_date, limit = 50, warehouse_id } = req.query;

    let dateCondition = [];
    let params = [];

    if (start_date && end_date) {
      dateCondition.push('o.created_at BETWEEN ? AND ?');
      params.push(start_date, end_date + ' 23:59:59');
    }

    if (warehouse_id) {
      dateCondition.push('EXISTS (SELECT 1 FROM product_variants pv2 WHERE pv2.product_id = p.id AND pv2.warehouse_id = ?)');
      params.push(warehouse_id);
    }

    const whereClause = dateCondition.length > 0 ? `WHERE ${dateCondition.join(' AND ')}` : '';

    const products = await query(
      `SELECT 
        p.id as product_id,
        p.name as product_name,
        p.sku as sku_code,
        c.name as category_name,
        SUM(oi.quantity) as units_sold,
        SUM(oi.price * oi.quantity) as revenue,
        SUM(oi.quantity * COALESCE(pv.cost_price, 0)) as cost,
        SUM(oi.price * oi.quantity) - SUM(oi.quantity * COALESCE(pv.cost_price, 0)) as profit,
        ROUND(((SUM(oi.price * oi.quantity) - SUM(oi.quantity * COALESCE(pv.cost_price, 0))) / NULLIF(SUM(oi.price * oi.quantity), 0) * 100), 2) as profit_margin,
        AVG(oi.price) as avg_selling_price,
        AVG(pv.cost_price) as avg_cost_price,
        COUNT(DISTINCT o.id) as orders_count,
        SUM(COALESCE(pv.stock_quantity, 0)) as current_stock
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_variants pv ON p.id = pv.product_id
      ${whereClause}
      GROUP BY p.id, p.name, p.sku, c.name
      HAVING units_sold > 0
      ORDER BY units_sold DESC
      LIMIT ?`,
      [...params, parseInt(limit)]
    );

    res.json({
      success: true,
      data: products
    });

  } catch (error) {
    console.error('Product report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate product report',
      error: error.message
    });
  }
};

// @desc    Get inventory report
// @route   GET /api/reports/inventory
// @access  Private (Admin)
const getInventoryReport = async (req, res) => {
  try {
    const { warehouse_id, category_id, low_stock_only } = req.query;

    let whereConditions = ['pv.is_active = true'];
    let params = [];

    if (warehouse_id) {
      whereConditions.push('pv.warehouse_id = ?');
      params.push(warehouse_id);
    }

    if (category_id) {
      whereConditions.push('p.category_id = ?');
      params.push(category_id);
    }

    if (low_stock_only === 'true') {
      whereConditions.push('pv.stock_quantity <= 5');
    }

    const whereClause = whereConditions.join(' AND ');

    const inventory = await query(
      `SELECT 
        p.id as product_id,
        p.name as product_name,
        p.sku as sku_code,
        c.name as category_name,
        sz.name as size_name,
        w.name as warehouse_name,
        pv.stock_quantity as quantity,
        pv.cost_price,
        (pv.stock_quantity * pv.cost_price) as inventory_value,
        CASE 
          WHEN pv.stock_quantity <= 0 THEN 'Out of Stock'
          WHEN pv.stock_quantity <= 5 THEN 'Low Stock'
          ELSE 'In Stock'
        END as stock_status
      FROM product_variants pv
      JOIN products p ON pv.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN sizes sz ON pv.size_id = sz.id
      LEFT JOIN warehouses w ON pv.warehouse_id = w.id
      WHERE ${whereClause}
      ORDER BY stock_status DESC, pv.stock_quantity ASC, p.name`,
      params
    );

    const summary = await query(
      `SELECT 
        COUNT(*) as total_items,
        SUM(pv.stock_quantity) as total_quantity,
        SUM(pv.stock_quantity * pv.cost_price) as total_value,
        COUNT(CASE WHEN pv.stock_quantity <= 0 THEN 1 END) as out_of_stock,
        COUNT(CASE WHEN pv.stock_quantity <= 5 AND pv.stock_quantity > 0 THEN 1 END) as low_stock,
        COUNT(CASE WHEN pv.stock_quantity > 5 THEN 1 END) as in_stock
      FROM product_variants pv
      JOIN products p ON pv.product_id = p.id
      LEFT JOIN warehouses w ON pv.warehouse_id = w.id
      WHERE ${whereClause}`,
      params
    );

    res.json({
      success: true,
      data: {
        inventory,
        summary: summary[0] || {}
      }
    });

  } catch (error) {
    console.error('Inventory report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate inventory report',
      error: error.message
    });
  }
};

// @desc    Export sales report to Excel
// @route   GET /api/reports/sales/export
// @access  Private (Admin)
const exportSalesReport = async (req, res) => {
  try {
    const { start_date, end_date, warehouse_id } = req.query;

    // Get the sales data (reuse the logic from getSalesReport)
    let dateCondition = [];
    let params = [];

    if (start_date && end_date) {
      dateCondition.push('o.created_at BETWEEN ? AND ?');
      params.push(start_date, end_date + ' 23:59:59');
    }

    if (warehouse_id) {
      dateCondition.push('EXISTS (SELECT 1 FROM order_items oi2 JOIN product_variants pv2 ON oi2.product_variant_id = pv2.id WHERE oi2.order_id = o.id AND pv2.warehouse_id = ?)');
      params.push(warehouse_id);
    }

    const whereClause = dateCondition.length > 0 ? `WHERE ${dateCondition.join(' AND ')}` : '';

    const sales = await query(
      `SELECT 
        DATE(o.created_at) as date,
        COUNT(DISTINCT o.id) as total_orders,
        COUNT(DISTINCT o.user_id) as unique_customers,
        SUM(oi.quantity) as items_sold,
        SUM(oi.price * oi.quantity) as gross_sales,
        SUM(o.discount_amount) as total_discounts,
        SUM(o.shipping_cost) as total_shipping,
        SUM(o.total) as net_sales,
        SUM(oi.quantity * COALESCE(pv.cost_price, 0)) as total_cost,
        SUM(o.total) - SUM(oi.quantity * COALESCE(pv.cost_price, 0)) as gross_profit,
        ROUND(((SUM(o.total) - SUM(oi.quantity * COALESCE(pv.cost_price, 0))) / NULLIF(SUM(o.total), 0) * 100), 2) as profit_margin
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN product_variants pv ON oi.product_variant_id = pv.id
      ${whereClause}
      GROUP BY DATE(o.created_at)
      ORDER BY date DESC`,
      params
    );

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sales Report');

    // Add headers
    worksheet.addRow([
      'Date', 'Orders', 'Customers', 'Items Sold', 
      'Gross Sales', 'Discounts', 'Shipping', 'Net Sales', 
      'Cost', 'Profit', 'Margin %'
    ]);

    // Style the header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Add data rows
    sales.forEach(row => {
      worksheet.addRow([
        moment(row.date).format('YYYY-MM-DD'),
        row.total_orders,
        row.unique_customers,
        row.items_sold,
        row.gross_sales,
        row.total_discounts,
        row.total_shipping,
        row.net_sales,
        row.total_cost,
        row.gross_profit,
        row.profit_margin
      ]);
    });

    // Format currency columns
    const currencyColumns = ['E', 'F', 'G', 'H', 'I', 'J']; // Gross Sales to Profit
    currencyColumns.forEach(col => {
      worksheet.getColumn(col).numFmt = '"Rp"#,##0.00';
    });

    // Format percentage column
    worksheet.getColumn('K').numFmt = '0.00"%"';

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      column.width = Math.max(12, (column.header?.length || 0) + 2);
    });

    // Set response headers for file download
    const filename = `sales-report-${moment().format('YYYY-MM-DD')}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Send the workbook
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Export sales report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export sales report',
      error: error.message
    });
  }
};

// @desc    Export inventory report to Excel
// @route   GET /api/reports/inventory/export
// @access  Private (Admin)
const exportInventoryReport = async (req, res) => {
  try {
    const { warehouse_id, category_id, low_stock_only } = req.query;

    let whereConditions = ['pv.is_active = true'];
    let params = [];

    if (warehouse_id) {
      whereConditions.push('pv.warehouse_id = ?');
      params.push(warehouse_id);
    }

    if (category_id) {
      whereConditions.push('p.category_id = ?');
      params.push(category_id);
    }

    if (low_stock_only === 'true') {
      whereConditions.push('pv.stock_quantity <= 5');
    }

    const whereClause = whereConditions.join(' AND ');

    const inventory = await query(
      `SELECT 
        p.name as product_name,
        p.sku as sku_code,
        c.name as category_name,
        sz.name as size_name,
        w.name as warehouse_name,
        pv.stock_quantity as quantity,
        pv.cost_price,
        (pv.stock_quantity * pv.cost_price) as inventory_value,
        CASE 
          WHEN pv.stock_quantity <= 0 THEN 'Out of Stock'
          WHEN pv.stock_quantity <= 5 THEN 'Low Stock'
          ELSE 'In Stock'
        END as stock_status
      FROM product_variants pv
      JOIN products p ON pv.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN sizes sz ON pv.size_id = sz.id
      LEFT JOIN warehouses w ON pv.warehouse_id = w.id
      WHERE ${whereClause}
      ORDER BY stock_status DESC, pv.stock_quantity ASC, p.name`,
      params
    );

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Inventory Report');

    // Add headers
    worksheet.addRow([
      'Product Name', 'SKU', 'Category', 'Size', 'Warehouse',
      'Quantity', 'Cost Price', 'Total Value', 'Status'
    ]);

    // Style the header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Add data rows
    inventory.forEach(row => {
      worksheet.addRow([
        row.product_name,
        row.sku_code,
        row.category_name,
        row.size_name,
        row.warehouse_name,
        row.quantity,
        row.cost_price,
        row.inventory_value,
        row.stock_status
      ]);
    });

    // Format currency columns
    worksheet.getColumn('G').numFmt = '"Rp"#,##0.00'; // Cost Price
    worksheet.getColumn('H').numFmt = '"Rp"#,##0.00'; // Total Value

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      column.width = Math.max(12, (column.header?.length || 0) + 2);
    });

    // Set response headers for file download
    const filename = `inventory-report-${moment().format('YYYY-MM-DD')}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Send the workbook
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Export inventory report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export inventory report',
      error: error.message
    });
  }
};

module.exports = {
  getSalesReport,
  getProductReport,
  getInventoryReport,
  exportSalesReport,
  exportInventoryReport
};
