const { query } = require('../config/database');
const ExcelJS = require('exceljs');
const moment = require('moment');

// @desc    Get inventory movement report
// @route   GET /api/reports/inventory-movement
// @access  Private (Admin)
exports.getInventoryMovementReport = async (req, res) => {
  try {
    const { 
      start_date, 
      end_date, 
      warehouse_id, 
      product_id,
      movement_type,
      page = 1,
      limit = 50
    } = req.query;

    const offset = (page - 1) * parseInt(limit);
    let whereConditions = [];
    let params = [];

    if (start_date && end_date) {
      whereConditions.push('sm.created_at BETWEEN ? AND ?');
      params.push(start_date, end_date + ' 23:59:59');
    }

    if (warehouse_id) {
      whereConditions.push('sm.warehouse_id = ?');
      params.push(warehouse_id);
    }

    if (product_id) {
      whereConditions.push('sm.product_id = ?');
      params.push(product_id);
    }

    if (movement_type) {
      whereConditions.push('sm.movement_type = ?');
      params.push(movement_type);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM stock_movements sm ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // Get movements
    const movements = await query(
      `SELECT 
        sm.id, sm.product_id, sm.product_variant_id, sm.warehouse_id,
        sm.movement_type, sm.quantity, sm.stock_before, sm.stock_after,
        sm.reference_type, sm.reference_id, sm.notes, sm.created_at,
        p.name as product_name, p.sku as product_sku,
        pv.sku_variant,
        s.name as size_name,
        w.name as warehouse_name,
        u.full_name as created_by_name
      FROM stock_movements sm
      LEFT JOIN products p ON sm.product_id = p.id
      LEFT JOIN product_variants pv ON sm.product_variant_id = pv.id
      LEFT JOIN sizes s ON pv.size_id = s.id
      LEFT JOIN warehouses w ON sm.warehouse_id = w.id
      LEFT JOIN users u ON sm.created_by = u.id
      ${whereClause}
      ORDER BY sm.created_at DESC
      LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      success: true,
      data: movements,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Inventory movement report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get inventory movement report',
      error: error.message
    });
  }
};

// @desc    Get inventory movement summary
// @route   GET /api/reports/inventory-movement/summary
// @access  Private (Admin)
exports.getInventoryMovementSummary = async (req, res) => {
  try {
    const { start_date, end_date, warehouse_id } = req.query;

    let whereConditions = [];
    let params = [];

    if (start_date && end_date) {
      whereConditions.push('sm.created_at BETWEEN ? AND ?');
      params.push(start_date, end_date + ' 23:59:59');
    }

    if (warehouse_id) {
      whereConditions.push('sm.warehouse_id = ?');
      params.push(warehouse_id);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Summary by movement type
    const byType = await query(
      `SELECT 
        movement_type,
        COUNT(*) as total_transactions,
        SUM(ABS(quantity)) as total_quantity
      FROM stock_movements sm
      ${whereClause}
      GROUP BY movement_type
      ORDER BY total_transactions DESC`,
      params
    );

    // Summary by warehouse
    const byWarehouse = await query(
      `SELECT 
        w.id as warehouse_id,
        w.name as warehouse_name,
        COUNT(*) as total_transactions,
        SUM(CASE WHEN sm.quantity > 0 THEN sm.quantity ELSE 0 END) as total_in,
        SUM(CASE WHEN sm.quantity < 0 THEN ABS(sm.quantity) ELSE 0 END) as total_out
      FROM stock_movements sm
      LEFT JOIN warehouses w ON sm.warehouse_id = w.id
      ${whereClause}
      GROUP BY w.id, w.name
      ORDER BY total_transactions DESC`,
      params
    );

    // Summary by day
    const byDay = await query(
      `SELECT 
        DATE(sm.created_at) as date,
        COUNT(*) as total_transactions,
        SUM(CASE WHEN sm.quantity > 0 THEN sm.quantity ELSE 0 END) as total_in,
        SUM(CASE WHEN sm.quantity < 0 THEN ABS(sm.quantity) ELSE 0 END) as total_out
      FROM stock_movements sm
      ${whereClause}
      GROUP BY DATE(sm.created_at)
      ORDER BY date DESC
      LIMIT 30`,
      params
    );

    // Top products with most movement
    const topProducts = await query(
      `SELECT 
        p.id as product_id,
        p.name as product_name,
        p.sku as product_sku,
        COUNT(*) as total_transactions,
        SUM(ABS(sm.quantity)) as total_quantity_moved
      FROM stock_movements sm
      LEFT JOIN products p ON sm.product_id = p.id
      ${whereClause}
      GROUP BY p.id, p.name, p.sku
      ORDER BY total_quantity_moved DESC
      LIMIT 10`,
      params
    );

    res.json({
      success: true,
      data: {
        byType,
        byWarehouse,
        byDay,
        topProducts
      }
    });
  } catch (error) {
    console.error('Inventory movement summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get inventory movement summary',
      error: error.message
    });
  }
};

// @desc    Export inventory movement report
// @route   GET /api/reports/inventory-movement/export
// @access  Private (Admin)
exports.exportInventoryMovement = async (req, res) => {
  try {
    const { start_date, end_date, warehouse_id, movement_type } = req.query;

    let whereConditions = [];
    let params = [];

    if (start_date && end_date) {
      whereConditions.push('sm.created_at BETWEEN ? AND ?');
      params.push(start_date, end_date + ' 23:59:59');
    }

    if (warehouse_id) {
      whereConditions.push('sm.warehouse_id = ?');
      params.push(warehouse_id);
    }

    if (movement_type) {
      whereConditions.push('sm.movement_type = ?');
      params.push(movement_type);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const movements = await query(
      `SELECT 
        sm.id, sm.movement_type, sm.quantity, sm.stock_before, sm.stock_after,
        sm.reference_type, sm.reference_id, sm.notes, sm.created_at,
        p.name as product_name, p.sku as product_sku,
        pv.sku_variant,
        s.name as size_name,
        w.name as warehouse_name,
        u.full_name as created_by_name
      FROM stock_movements sm
      LEFT JOIN products p ON sm.product_id = p.id
      LEFT JOIN product_variants pv ON sm.product_variant_id = pv.id
      LEFT JOIN sizes s ON pv.size_id = s.id
      LEFT JOIN warehouses w ON sm.warehouse_id = w.id
      LEFT JOIN users u ON sm.created_by = u.id
      ${whereClause}
      ORDER BY sm.created_at DESC
      LIMIT 10000`,
      params
    );

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Inventory Movement');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Tanggal', key: 'created_at', width: 20 },
      { header: 'Produk', key: 'product_name', width: 30 },
      { header: 'SKU', key: 'product_sku', width: 15 },
      { header: 'Varian SKU', key: 'sku_variant', width: 15 },
      { header: 'Ukuran', key: 'size_name', width: 10 },
      { header: 'Gudang', key: 'warehouse_name', width: 20 },
      { header: 'Tipe', key: 'movement_type', width: 15 },
      { header: 'Qty', key: 'quantity', width: 10 },
      { header: 'Stok Sebelum', key: 'stock_before', width: 12 },
      { header: 'Stok Sesudah', key: 'stock_after', width: 12 },
      { header: 'Referensi', key: 'reference_type', width: 15 },
      { header: 'Ref ID', key: 'reference_id', width: 10 },
      { header: 'Catatan', key: 'notes', width: 30 },
      { header: 'Oleh', key: 'created_by_name', width: 20 }
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    movements.forEach(movement => {
      worksheet.addRow({
        ...movement,
        created_at: moment(movement.created_at).format('YYYY-MM-DD HH:mm:ss')
      });
    });

    const filename = `inventory-movement-${moment().format('YYYY-MM-DD')}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export inventory movement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export inventory movement',
      error: error.message
    });
  }
};
