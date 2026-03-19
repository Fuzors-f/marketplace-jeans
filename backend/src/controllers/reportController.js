const { query } = require('../config/database');
const ExcelJS = require('exceljs');
const moment = require('moment');

// Helper: Get margin_calculation_method setting
const getMarginMethod = async () => {
  const rows = await query(
    "SELECT setting_value FROM settings WHERE setting_key = 'margin_calculation_method' LIMIT 1"
  );
  return rows[0]?.setting_value || 'latest';
};

// Helper: Build HPP expression based on method
// 'latest' = use latest stock-in cost_price from inventory_movements, fallback to pv.cost_price
// 'average' = use weighted average cost_price from stock-in movements, fallback to pv.cost_price
const buildHppExpression = (method) => {
  if (method === 'average') {
    return `COALESCE(
      oi.unit_cost,
      (SELECT SUM(im_avg.cost_price * im_avg.quantity) / NULLIF(SUM(im_avg.quantity), 0)
       FROM inventory_movements im_avg
       WHERE im_avg.product_variant_id = pv.id AND im_avg.type = 'in' AND im_avg.cost_price > 0),
      pv.cost_price, 0)`;
  }
  // Default: latest
  return `COALESCE(
    oi.unit_cost,
    (SELECT im_last.cost_price FROM inventory_movements im_last
     WHERE im_last.product_variant_id = pv.id AND im_last.type = 'in' AND im_last.cost_price > 0
     ORDER BY im_last.created_at DESC LIMIT 1),
    pv.cost_price, 0)`;
};

// @desc    Get sales report with profit analysis
// @route   GET /api/reports/sales
// @access  Private (Admin)
const getSalesReport = async (req, res) => {
  try {
    const { start_date, end_date, group_by = 'day', warehouse_id } = req.query;
    const marginMethod = await getMarginMethod();
    const hpp = buildHppExpression(marginMethod);

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
        COALESCE(SUM(oi.quantity), 0) as items_sold,
        COALESCE(SUM(oi.subtotal), 0) as gross_sales,
        COALESCE(SUM(DISTINCT o.discount_amount), 0) as total_discounts,
        COALESCE(SUM(DISTINCT o.shipping_cost), 0) as total_shipping,
        COALESCE(SUM(DISTINCT o.total_amount), 0) as net_sales,
        COALESCE(SUM(oi.quantity * ${hpp}), 0) as total_cost,
        COALESCE(SUM(DISTINCT o.total_amount), 0) - COALESCE(SUM(oi.quantity * ${hpp}), 0) as gross_profit,
        ROUND(((COALESCE(SUM(DISTINCT o.total_amount), 0) - COALESCE(SUM(oi.quantity * ${hpp}), 0)) / NULLIF(COALESCE(SUM(DISTINCT o.total_amount), 0), 0) * 100), 2) as profit_margin
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
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
        COALESCE(SUM(oi.quantity), 0) as total_items_sold,
        COALESCE(SUM(oi.subtotal), 0) as total_gross_sales,
        COALESCE(SUM(DISTINCT o.discount_amount), 0) as total_discounts,
        COALESCE(SUM(DISTINCT o.shipping_cost), 0) as total_shipping,
        COALESCE(SUM(DISTINCT o.total_amount), 0) as total_net_sales,
        COALESCE(SUM(oi.quantity * ${hpp}), 0) as total_cost,
        COALESCE(SUM(DISTINCT o.total_amount), 0) - COALESCE(SUM(oi.quantity * ${hpp}), 0) as total_profit,
        ROUND(((COALESCE(SUM(DISTINCT o.total_amount), 0) - COALESCE(SUM(oi.quantity * ${hpp}), 0)) / NULLIF(COALESCE(SUM(DISTINCT o.total_amount), 0), 0) * 100), 2) as avg_profit_margin
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN product_variants pv ON oi.product_variant_id = pv.id
      ${whereClause}`,
      params
    );

    res.json({
      success: true,
      data: {
        daily_sales: sales,
        summary: summary[0] || {},
        margin_method: marginMethod
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
    const marginMethod = await getMarginMethod();
    const hpp = buildHppExpression(marginMethod);

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
        COALESCE(SUM(oi.quantity), 0) as units_sold,
        COALESCE(SUM(oi.subtotal), 0) as revenue,
        COALESCE(SUM(oi.quantity * ${hpp}), 0) as cost,
        COALESCE(SUM(oi.subtotal), 0) - COALESCE(SUM(oi.quantity * ${hpp}), 0) as profit,
        ROUND(((COALESCE(SUM(oi.subtotal), 0) - COALESCE(SUM(oi.quantity * ${hpp}), 0)) / NULLIF(COALESCE(SUM(oi.subtotal), 0), 0) * 100), 2) as profit_margin,
        AVG(oi.unit_price) as avg_selling_price,
        AVG(${hpp}) as avg_cost_price,
        COUNT(DISTINCT o.id) as orders_count,
        (SELECT COALESCE(SUM(pv2.stock_quantity), 0) FROM product_variants pv2 WHERE pv2.product_id = p.id) as current_stock
      FROM products p
      LEFT JOIN product_variants pv ON p.id = pv.product_id
      LEFT JOIN order_items oi ON pv.id = oi.product_variant_id
      LEFT JOIN orders o ON oi.order_id = o.id
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      GROUP BY p.id, p.name, p.sku, c.name
      HAVING units_sold > 0
      ORDER BY units_sold DESC
      LIMIT ?`,
      [...params, parseInt(limit)]
    );

    res.json({
      success: true,
      data: products,
      margin_method: marginMethod
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
    const marginMethod = await getMarginMethod();
    const hpp = buildHppExpression(marginMethod);

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
        COALESCE(SUM(oi.quantity), 0) as items_sold,
        COALESCE(SUM(oi.subtotal), 0) as gross_sales,
        COALESCE(SUM(DISTINCT o.discount_amount), 0) as total_discounts,
        COALESCE(SUM(DISTINCT o.shipping_cost), 0) as total_shipping,
        COALESCE(SUM(DISTINCT o.total_amount), 0) as net_sales,
        COALESCE(SUM(oi.quantity * ${hpp}), 0) as total_cost,
        COALESCE(SUM(DISTINCT o.total_amount), 0) - COALESCE(SUM(oi.quantity * ${hpp}), 0) as gross_profit,
        ROUND(((COALESCE(SUM(DISTINCT o.total_amount), 0) - COALESCE(SUM(oi.quantity * ${hpp}), 0)) / NULLIF(COALESCE(SUM(DISTINCT o.total_amount), 0), 0) * 100), 2) as profit_margin
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
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

// @desc    Get incoming orders report
// @route   GET /api/reports/orders-incoming
// @access  Private (Admin)
const getIncomingOrdersReport = async (req, res) => {
  try {
    const {
      start_date, end_date, status, payment_status,
      payment_method, warehouse_id, search, page = 1, limit = 25
    } = req.query;
    const offset = (page - 1) * parseInt(limit);

    let conditions = [];
    let params = [];

    if (start_date && end_date) {
      conditions.push('o.created_at BETWEEN ? AND ?');
      params.push(start_date, end_date + ' 23:59:59');
    }
    if (status) {
      conditions.push('o.status = ?');
      params.push(status);
    }
    if (payment_status) {
      conditions.push('o.payment_status = ?');
      params.push(payment_status);
    }
    if (payment_method) {
      conditions.push('o.payment_method = ?');
      params.push(payment_method);
    }
    if (warehouse_id) {
      conditions.push('o.warehouse_id = ?');
      params.push(warehouse_id);
    }
    if (search) {
      conditions.push('(o.order_number LIKE ? OR o.customer_name LIKE ? OR o.customer_email LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Summary
    const summary = await query(
      `SELECT
        COUNT(*) as total_orders,
        COALESCE(SUM(o.total_amount), 0) as total_revenue,
        COALESCE(SUM(o.shipping_cost), 0) as total_shipping,
        COALESCE(SUM(o.discount_amount + o.coupon_discount + o.member_discount_amount), 0) as total_discount,
        COUNT(CASE WHEN o.status = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN o.status = 'confirmed' THEN 1 END) as confirmed_count,
        COUNT(CASE WHEN o.status = 'processing' THEN 1 END) as processing_count,
        COUNT(CASE WHEN o.payment_status = 'paid' THEN 1 END) as paid_count,
        COUNT(CASE WHEN o.payment_status = 'pending' THEN 1 END) as unpaid_count
      FROM orders o ${whereClause}`,
      params
    );

    // Orders list
    const orders = await query(
      `SELECT
        o.id, o.order_number, o.status, o.payment_status, o.payment_method,
        o.subtotal, o.discount_amount, o.coupon_discount, o.member_discount_amount,
        o.shipping_cost, o.tax, o.total_amount,
        o.customer_name, o.customer_email, o.customer_phone,
        o.shipping_method, o.courier, o.notes, o.currency,
        o.created_at,
        w.name as warehouse_name,
        (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as item_count,
        (SELECT SUM(oi.quantity) FROM order_items oi WHERE oi.order_id = o.id) as total_qty
      FROM orders o
      LEFT JOIN warehouses w ON o.warehouse_id = w.id
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    // Total count for pagination
    const countResult = await query(
      `SELECT COUNT(*) as total FROM orders o ${whereClause}`,
      params
    );

    // Daily breakdown
    const daily = await query(
      `SELECT
        DATE(o.created_at) as date,
        COUNT(*) as orders,
        COALESCE(SUM(o.total_amount), 0) as revenue
      FROM orders o ${whereClause}
      GROUP BY DATE(o.created_at)
      ORDER BY date DESC`,
      params
    );

    res.json({
      success: true,
      data: {
        summary: summary[0] || {},
        orders,
        daily,
        pagination: {
          total: countResult[0]?.total || 0,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil((countResult[0]?.total || 0) / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Incoming orders report error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate incoming orders report', error: error.message });
  }
};

// @desc    Get shipped/delivered orders report
// @route   GET /api/reports/orders-shipped
// @access  Private (Admin)
const getShippedOrdersReport = async (req, res) => {
  try {
    const {
      start_date, end_date, status, courier,
      warehouse_id, search, page = 1, limit = 25
    } = req.query;
    const offset = (page - 1) * parseInt(limit);

    // Only shipped & delivered
    let conditions = ["o.status IN ('shipped', 'delivered')"];
    let params = [];

    if (start_date && end_date) {
      conditions.push('COALESCE(os.shipped_at, o.updated_at) BETWEEN ? AND ?');
      params.push(start_date, end_date + ' 23:59:59');
    }
    if (status) {
      conditions = conditions.filter(c => !c.includes("o.status IN"));
      conditions.push('o.status = ?');
      params.push(status);
    }
    if (courier) {
      conditions.push('(o.courier = ? OR os.courier = ?)');
      params.push(courier, courier);
    }
    if (warehouse_id) {
      conditions.push('o.warehouse_id = ?');
      params.push(warehouse_id);
    }
    if (search) {
      conditions.push('(o.order_number LIKE ? OR o.customer_name LIKE ? OR o.tracking_number LIKE ? OR os.tracking_number LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Summary
    const summary = await query(
      `SELECT
        COUNT(*) as total_orders,
        COALESCE(SUM(o.total_amount), 0) as total_revenue,
        COALESCE(SUM(o.shipping_cost), 0) as total_shipping,
        COUNT(CASE WHEN o.status = 'shipped' THEN 1 END) as shipped_count,
        COUNT(CASE WHEN o.status = 'delivered' THEN 1 END) as delivered_count
      FROM orders o
      LEFT JOIN order_shipping os ON o.id = os.order_id
      ${whereClause}`,
      params
    );

    // Orders list
    const orders = await query(
      `SELECT
        o.id, o.order_number, o.status, o.payment_status, o.payment_method,
        o.subtotal, o.shipping_cost, o.total_amount,
        o.customer_name, o.customer_email, o.customer_phone,
        o.shipping_method, o.courier, o.tracking_number,
        o.created_at, o.updated_at,
        os.recipient_name, os.phone as recipient_phone, os.address as shipping_address,
        os.city as shipping_city, os.province as shipping_province,
        os.courier as os_courier, os.tracking_number as os_tracking,
        os.shipped_at, os.delivered_at, os.estimated_delivery,
        w.name as warehouse_name,
        (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as item_count,
        (SELECT SUM(oi.quantity) FROM order_items oi WHERE oi.order_id = o.id) as total_qty
      FROM orders o
      LEFT JOIN order_shipping os ON o.id = os.order_id
      LEFT JOIN warehouses w ON o.warehouse_id = w.id
      ${whereClause}
      ORDER BY COALESCE(os.shipped_at, o.updated_at) DESC
      LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    // Total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM orders o
      LEFT JOIN order_shipping os ON o.id = os.order_id
      ${whereClause}`,
      params
    );

    // Daily breakdown
    const daily = await query(
      `SELECT
        DATE(COALESCE(os.shipped_at, o.updated_at)) as date,
        COUNT(*) as orders,
        COUNT(CASE WHEN o.status = 'delivered' THEN 1 END) as delivered,
        COALESCE(SUM(o.total_amount), 0) as revenue
      FROM orders o
      LEFT JOIN order_shipping os ON o.id = os.order_id
      ${whereClause}
      GROUP BY DATE(COALESCE(os.shipped_at, o.updated_at))
      ORDER BY date DESC`,
      params
    );

    // Courier breakdown
    const byCourier = await query(
      `SELECT
        COALESCE(o.courier, os.courier, 'Tidak diketahui') as courier_name,
        COUNT(*) as total,
        COUNT(CASE WHEN o.status = 'delivered' THEN 1 END) as delivered,
        COALESCE(SUM(o.shipping_cost), 0) as shipping_cost
      FROM orders o
      LEFT JOIN order_shipping os ON o.id = os.order_id
      ${whereClause}
      GROUP BY courier_name
      ORDER BY total DESC`,
      params
    );

    res.json({
      success: true,
      data: {
        summary: summary[0] || {},
        orders,
        daily,
        by_courier: byCourier,
        pagination: {
          total: countResult[0]?.total || 0,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil((countResult[0]?.total || 0) / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Shipped orders report error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate shipped orders report', error: error.message });
  }
};

// @desc    Export incoming orders to Excel
// @route   GET /api/reports/orders-incoming/export
// @access  Private (Admin)
const exportIncomingOrders = async (req, res) => {
  try {
    const { start_date, end_date, status, payment_status, payment_method, warehouse_id } = req.query;

    let conditions = [];
    let params = [];
    if (start_date && end_date) { conditions.push('o.created_at BETWEEN ? AND ?'); params.push(start_date, end_date + ' 23:59:59'); }
    if (status) { conditions.push('o.status = ?'); params.push(status); }
    if (payment_status) { conditions.push('o.payment_status = ?'); params.push(payment_status); }
    if (payment_method) { conditions.push('o.payment_method = ?'); params.push(payment_method); }
    if (warehouse_id) { conditions.push('o.warehouse_id = ?'); params.push(warehouse_id); }
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const orders = await query(
      `SELECT o.order_number, o.status, o.payment_status, o.payment_method,
        o.subtotal, o.discount_amount, o.shipping_cost, o.total_amount,
        o.customer_name, o.customer_email, o.customer_phone,
        o.shipping_method, o.courier, o.notes, o.created_at,
        w.name as warehouse_name
      FROM orders o LEFT JOIN warehouses w ON o.warehouse_id = w.id
      ${whereClause} ORDER BY o.created_at DESC`,
      params
    );

    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet('Orderan Masuk');
    ws.addRow(['No Order', 'Tanggal', 'Customer', 'Email', 'Telepon', 'Status', 'Pembayaran', 'Metode Bayar', 'Subtotal', 'Diskon', 'Ongkir', 'Total', 'Kurir', 'Gudang', 'Catatan']);
    const headerRow = ws.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };

    orders.forEach(o => {
      ws.addRow([o.order_number, moment(o.created_at).format('YYYY-MM-DD HH:mm'), o.customer_name, o.customer_email, o.customer_phone,
        o.status, o.payment_status, o.payment_method, o.subtotal, o.discount_amount, o.shipping_cost, o.total_amount, o.courier, o.warehouse_name, o.notes]);
    });

    ['I','J','K','L'].forEach(c => { ws.getColumn(c).numFmt = '"Rp"#,##0'; });
    ws.columns.forEach(col => { col.width = Math.max(14, (col.header?.length || 0) + 2); });

    const filename = `orderan-masuk-${moment().format('YYYY-MM-DD')}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export incoming orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to export', error: error.message });
  }
};

// @desc    Export shipped orders to Excel
// @route   GET /api/reports/orders-shipped/export
// @access  Private (Admin)
const exportShippedOrders = async (req, res) => {
  try {
    const { start_date, end_date, status, courier, warehouse_id } = req.query;

    let conditions = ["o.status IN ('shipped', 'delivered')"];
    let params = [];
    if (start_date && end_date) { conditions.push('COALESCE(os.shipped_at, o.updated_at) BETWEEN ? AND ?'); params.push(start_date, end_date + ' 23:59:59'); }
    if (status) { conditions = conditions.filter(c => !c.includes("o.status IN")); conditions.push('o.status = ?'); params.push(status); }
    if (courier) { conditions.push('(o.courier = ? OR os.courier = ?)'); params.push(courier, courier); }
    if (warehouse_id) { conditions.push('o.warehouse_id = ?'); params.push(warehouse_id); }
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const orders = await query(
      `SELECT o.order_number, o.status, o.payment_status, o.total_amount, o.shipping_cost,
        o.customer_name, o.customer_phone,
        COALESCE(o.courier, os.courier) as courier, COALESCE(o.tracking_number, os.tracking_number) as tracking,
        os.recipient_name, os.city as shipping_city, os.province as shipping_province,
        os.shipped_at, os.delivered_at, w.name as warehouse_name
      FROM orders o
      LEFT JOIN order_shipping os ON o.id = os.order_id
      LEFT JOIN warehouses w ON o.warehouse_id = w.id
      ${whereClause} ORDER BY COALESCE(os.shipped_at, o.updated_at) DESC`,
      params
    );

    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet('Orderan Terkirim');
    ws.addRow(['No Order', 'Status', 'Customer', 'Penerima', 'Telepon', 'Kota', 'Provinsi', 'Kurir', 'Resi', 'Total', 'Ongkir', 'Tgl Kirim', 'Tgl Terima', 'Gudang']);
    const headerRow = ws.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };

    orders.forEach(o => {
      ws.addRow([o.order_number, o.status, o.customer_name, o.recipient_name, o.customer_phone,
        o.shipping_city, o.shipping_province, o.courier, o.tracking,
        o.total_amount, o.shipping_cost,
        o.shipped_at ? moment(o.shipped_at).format('YYYY-MM-DD HH:mm') : '-',
        o.delivered_at ? moment(o.delivered_at).format('YYYY-MM-DD HH:mm') : '-',
        o.warehouse_name]);
    });

    ['J','K'].forEach(c => { ws.getColumn(c).numFmt = '"Rp"#,##0'; });
    ws.columns.forEach(col => { col.width = Math.max(14, (col.header?.length || 0) + 2); });

    const filename = `orderan-terkirim-${moment().format('YYYY-MM-DD')}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export shipped orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to export', error: error.message });
  }
};

module.exports = {
  getSalesReport,
  getProductReport,
  getInventoryReport,
  exportSalesReport,
  exportInventoryReport,
  getIncomingOrdersReport,
  getShippedOrdersReport,
  exportIncomingOrders,
  exportShippedOrders
};
