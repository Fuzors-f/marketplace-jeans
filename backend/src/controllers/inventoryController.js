const { query, transaction } = require('../config/database');
const { logActivity } = require('../middleware/activityLogger');

// @desc    Get inventory based on product variants
// @route   GET /api/inventory/variants
// @access  Private (Admin, Admin Stok)
const getVariantInventory = async (req, res) => {
  try {
    const { product_id, warehouse_id, category_id, search, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    let whereConditions = ['pv.is_active = true'];
    let params = [];

    if (product_id) {
      whereConditions.push('p.id = ?');
      params.push(product_id);
    }
    if (warehouse_id) {
      whereConditions.push('pv.warehouse_id = ?');
      params.push(warehouse_id);
    }
    if (category_id) {
      whereConditions.push('p.category_id = ?');
      params.push(category_id);
    }
    if (search) {
      whereConditions.push('(p.name LIKE ? OR p.sku LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.join(' AND ');

    // Get inventory list
    const [inventory] = await query(
      `SELECT 
        pv.id as variant_id,
        pv.sku_variant,
        p.id as product_id,
        p.name as product_name,
        p.sku,
        p.base_price,
        p.master_cost_price,
        c.name as category_name,
        sz.name as size_name,
        w.id as warehouse_id,
        w.name as warehouse_name,
        pv.stock_quantity,
        pv.minimum_stock,
        pv.cost_price,
        (pv.stock_quantity * pv.cost_price) as inventory_value,
        CASE 
          WHEN pv.stock_quantity <= 0 THEN 'Out of Stock'
          WHEN pv.stock_quantity <= pv.minimum_stock THEN 'Below Minimum'
          ELSE 'Safe'
        END as stock_status
      FROM product_variants pv
      JOIN products p ON pv.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN sizes sz ON pv.size_id = sz.id
      LEFT JOIN warehouses w ON pv.warehouse_id = w.id
      WHERE ${whereClause}
      ORDER BY p.name, sz.sort_order, w.name
      LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    // Get total count
    const [countResult] = await query(
      `SELECT COUNT(*) as total FROM product_variants pv
      JOIN products p ON pv.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN sizes sz ON pv.size_id = sz.id
      LEFT JOIN warehouses w ON pv.warehouse_id = w.id
      WHERE ${whereClause}`,
      params
    );

    // Get summary
    const [summary] = await query(
      `SELECT 
        COUNT(DISTINCT p.id) as total_products,
        SUM(pv.stock_quantity) as total_quantity,
        SUM(pv.stock_quantity * pv.cost_price) as total_value
      FROM product_variants pv
      JOIN products p ON pv.product_id = p.id
      WHERE ${whereClause}`,
      params
    );

    res.json({
      success: true,
      data: {
        stocks: inventory || [],
        summary: summary[0] || { total_products: 0, total_quantity: 0, total_value: 0 },
        pagination: {
          total: countResult[0]?.total || 0,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil((countResult[0]?.total || 0) / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get variant inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get inventory',
      error: error.message
    });
  }
};

// @desc    Update variant stock quantity, cost price and min stock
// @route   PUT /api/inventory/variants/:variantId
// @access  Private (Admin, Admin Stok)
const updateVariantStock = async (req, res) => {
  try {
    const { variantId } = req.params;
    const { stock_quantity, cost_price, min_stock } = req.body;

    if (stock_quantity === undefined && cost_price === undefined && min_stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide stock_quantity, cost_price, or min_stock to update'
      });
    }

    let updateFields = [];
    let params = [];

    if (stock_quantity !== undefined) {
      updateFields.push('stock_quantity = ?');
      params.push(parseInt(stock_quantity));
    }
    if (cost_price !== undefined) {
      updateFields.push('cost_price = ?');
      params.push(parseFloat(cost_price));
    }
    if (min_stock !== undefined) {
      updateFields.push('min_stock = ?');
      params.push(parseInt(min_stock));
    }

    params.push(variantId);

    const [result] = await query(
      `UPDATE product_variants SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      params
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Variant not found'
      });
    }

    res.json({
      success: true,
      message: 'Variant stock updated successfully'
    });

  } catch (error) {
    console.error('Update variant stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update variant stock',
      error: error.message
    });
  }
};

// @desc    Get inventory overview with warehouse breakdown (Old - for backwards compatibility)
// @route   GET /api/inventory/overview
// @access  Private (Admin, Admin Stok)
const getInventoryOverview = async (req, res) => {
  try {
    const { product_id, warehouse_id, category_id } = req.query;
    
    let whereConditions = [];
    let params = [];

    if (product_id) {
      whereConditions.push('s.product_id = ?');
      params.push(product_id);
    }
    if (warehouse_id) {
      whereConditions.push('s.warehouse_id = ?');
      params.push(warehouse_id);
    }
    if (category_id) {
      whereConditions.push('p.category_id = ?');
      params.push(category_id);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const inventory = await query(
      `SELECT 
        p.id as product_id,
        p.name as product_name,
        p.sku_code,
        c.name as category_name,
        f.name as fitting_name,
        sz.name as size_name,
        w.name as warehouse_name,
        s.quantity,
        s.reserved_quantity,
        s.available_quantity,
        s.avg_cost_price,
        s.min_stock_level,
        s.last_updated,
        (s.quantity * s.avg_cost_price) as inventory_value
      FROM stocks s
      JOIN products p ON s.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN fittings f ON s.fitting_id = f.id
      LEFT JOIN sizes sz ON s.size_id = sz.id
      JOIN warehouses w ON s.warehouse_id = w.id
      ${whereClause}
      ORDER BY p.name, w.name, f.name, sz.name`,
      params
    );

    // Calculate summary statistics
    const summary = await query(
      `SELECT 
        COUNT(DISTINCT s.product_id) as total_products,
        SUM(s.quantity) as total_quantity,
        SUM(s.quantity * s.avg_cost_price) as total_inventory_value,
        COUNT(CASE WHEN s.quantity <= s.min_stock_level THEN 1 END) as low_stock_items
      FROM stocks s
      JOIN products p ON s.product_id = p.id
      ${whereClause}`,
      params
    );

    res.json({
      success: true,
      data: {
        inventory,
        summary: summary[0] || {
          total_products: 0,
          total_quantity: 0,
          total_inventory_value: 0,
          low_stock_items: 0
        }
      }
    });

  } catch (error) {
    console.error('Get inventory overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get inventory overview',
      error: error.message
    });
  }
};

// @desc    Get stock movements (new warehouse-based system)
// @route   GET /api/inventory/movements
// @access  Private (Admin, Admin Stok)
const getMovements = async (req, res) => {
  try {
    const { product_id, warehouse_id, movement_type, start_date, end_date, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    let whereConditions = [];
    let params = [];

    if (product_id) {
      whereConditions.push('sm.product_id = ?');
      params.push(product_id);
    }
    if (warehouse_id) {
      whereConditions.push('sm.warehouse_id = ?');
      params.push(warehouse_id);
    }
    if (movement_type) {
      whereConditions.push('sm.movement_type = ?');
      params.push(movement_type);
    }
    if (start_date) {
      whereConditions.push('sm.created_at >= ?');
      params.push(start_date);
    }
    if (end_date) {
      whereConditions.push('sm.created_at <= ?');
      params.push(end_date);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const movements = await query(
      `SELECT 
        sm.*,
        p.name as product_name,
        p.sku_code,
        f.name as fitting_name,
        sz.name as size_name,
        w.name as warehouse_name,
        u.full_name as created_by_name
      FROM stock_movements sm
      JOIN products p ON sm.product_id = p.id
      LEFT JOIN fittings f ON sm.fitting_id = f.id
      LEFT JOIN sizes sz ON sm.size_id = sz.id
      JOIN warehouses w ON sm.warehouse_id = w.id
      LEFT JOIN users u ON sm.created_by = u.id
      ${whereClause}
      ORDER BY sm.created_at DESC
      LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    // Get total count for pagination
    const countResult = await query(
      `SELECT COUNT(*) as total
      FROM stock_movements sm
      JOIN products p ON sm.product_id = p.id
      JOIN warehouses w ON sm.warehouse_id = w.id
      ${whereClause}`,
      params
    );

    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        movements,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_items: total,
          per_page: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get movements error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get stock movements',
      error: error.message
    });
  }
};

// @desc    Get low stock alerts
// @route   GET /api/inventory/low-stock
// @access  Private (Admin, Admin Stok)
const getLowStockAlerts = async (req, res) => {
  try {
    const { warehouse_id } = req.query;
    let whereConditions = ['s.quantity <= s.min_stock_level'];
    let params = [];

    if (warehouse_id) {
      whereConditions.push('s.warehouse_id = ?');
      params.push(warehouse_id);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    const lowStockItems = await query(
      `SELECT 
        p.id as product_id,
        p.name as product_name,
        p.sku_code,
        f.name as fitting_name,
        sz.name as size_name,
        w.name as warehouse_name,
        s.quantity,
        s.min_stock_level,
        s.available_quantity,
        (s.min_stock_level - s.quantity) as stock_deficit
      FROM stocks s
      JOIN products p ON s.product_id = p.id
      LEFT JOIN fittings f ON s.fitting_id = f.id
      LEFT JOIN sizes sz ON s.size_id = sz.id
      JOIN warehouses w ON s.warehouse_id = w.id
      ${whereClause}
      ORDER BY stock_deficit DESC, p.name`,
      params
    );

    res.json({
      success: true,
      data: lowStockItems
    });

  } catch (error) {
    console.error('Get low stock alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get low stock alerts',
      error: error.message
    });
  }
};

// @desc    Create stock adjustment (legacy support)
// @route   POST /api/inventory/adjust
// @access  Private (Admin, Admin Stok)
const createAdjustment = async (req, res) => {
  try {
    const { warehouse_id, product_id, fitting_id, size_id, quantity, adjustment_type, notes } = req.body;

    if (!warehouse_id || !product_id || !quantity || !adjustment_type) {
      return res.status(400).json({
        success: false,
        message: 'Warehouse ID, product ID, quantity, and adjustment type are required'
      });
    }

    if (!['in', 'out'].includes(adjustment_type)) {
      return res.status(400).json({
        success: false,
        message: 'Adjustment type must be either "in" or "out"'
      });
    }

    const adjustmentQty = adjustment_type === 'in' ? Math.abs(quantity) : -Math.abs(quantity);

    await transaction(async (conn) => {
      // Get current stock
      const currentStock = await query(
        `SELECT quantity, avg_cost_price 
        FROM stocks 
        WHERE warehouse_id = ? AND product_id = ? 
        AND fitting_id ${fitting_id ? '= ?' : 'IS NULL'} 
        AND size_id ${size_id ? '= ?' : 'IS NULL'}`,
        [warehouse_id, product_id, fitting_id, size_id].filter(p => p !== undefined),
        conn
      );

      const current = currentStock[0] || { quantity: 0, avg_cost_price: 0 };
      const newQuantity = current.quantity + adjustmentQty;

      if (newQuantity < 0) {
        throw new Error('Insufficient stock for adjustment');
      }

      // Update or insert stock
      if (currentStock.length > 0) {
        await query(
          `UPDATE stocks 
          SET quantity = quantity + ?, last_updated = NOW()
          WHERE warehouse_id = ? AND product_id = ? 
          AND fitting_id ${fitting_id ? '= ?' : 'IS NULL'} 
          AND size_id ${size_id ? '= ?' : 'IS NULL'}`,
          [adjustmentQty, warehouse_id, product_id, fitting_id, size_id].filter(p => p !== undefined),
          conn
        );
      } else {
        await query(
          `INSERT INTO stocks (warehouse_id, product_id, fitting_id, size_id, quantity, avg_cost_price, last_updated)
          VALUES (?, ?, ?, ?, ?, 0, NOW())`,
          [warehouse_id, product_id, fitting_id, size_id, Math.max(0, adjustmentQty)],
          conn
        );
      }

      // Record stock movement
      await query(
        `INSERT INTO stock_movements 
        (warehouse_id, product_id, fitting_id, size_id, movement_type, quantity, 
         reference_type, reference_id, notes, created_by)
        VALUES (?, ?, ?, ?, 'adjustment', ?, 'manual_adjustment', NULL, ?, ?)`,
        [warehouse_id, product_id, fitting_id, size_id, adjustmentQty, notes || `Manual ${adjustment_type} adjustment`, req.user.id],
        conn
      );
    });

    // Log activity
    await logActivity(req.user.id, 'stock_adjustment', 'inventory', product_id, 
      `Stock ${adjustment_type} adjustment: ${quantity}`, req, 
      { warehouse_id, product_id, quantity, adjustment_type, notes });

    res.status(201).json({
      success: true,
      message: 'Stock adjustment created successfully'
    });

  } catch (error) {
    console.error('Create adjustment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create stock adjustment',
      error: error.message
    });
  }
};

// @desc    Get inventory value report
// @route   GET /api/inventory/value-report
// @access  Private (Admin)
const getInventoryValueReport = async (req, res) => {
  try {
    const { warehouse_id } = req.query;
    let whereConditions = [];
    let params = [];

    if (warehouse_id) {
      whereConditions.push('s.warehouse_id = ?');
      params.push(warehouse_id);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const valueReport = await query(
      `SELECT 
        w.name as warehouse_name,
        c.name as category_name,
        COUNT(DISTINCT p.id) as product_count,
        SUM(s.quantity) as total_quantity,
        SUM(s.quantity * s.avg_cost_price) as total_value,
        AVG(s.avg_cost_price) as avg_cost_price
      FROM stocks s
      JOIN products p ON s.product_id = p.id
      JOIN warehouses w ON s.warehouse_id = w.id
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      GROUP BY w.id, c.id
      ORDER BY total_value DESC`,
      params
    );

    // Get overall summary
    const overallSummary = await query(
      `SELECT 
        COUNT(DISTINCT p.id) as total_products,
        COUNT(DISTINCT w.id) as total_warehouses,
        SUM(s.quantity) as total_quantity,
        SUM(s.quantity * s.avg_cost_price) as total_inventory_value
      FROM stocks s
      JOIN products p ON s.product_id = p.id
      JOIN warehouses w ON s.warehouse_id = w.id
      ${whereClause}`,
      params
    );

    res.json({
      success: true,
      data: {
        summary: overallSummary[0] || {
          total_products: 0,
          total_warehouses: 0,
          total_quantity: 0,
          total_inventory_value: 0
        },
        breakdown: valueReport
      }
    });

  } catch (error) {
    console.error('Get inventory value report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get inventory value report',
      error: error.message
    });
  }
};

// @desc    Get stock levels (for product variants compatibility)
// @route   GET /api/inventory/stock-levels
// @access  Private (Admin, Admin Stok)
const getStockLevels = async (req, res) => {
  try {
    const { low_stock_threshold = 10, warehouse_id } = req.query;
    
    let whereConditions = [];
    let params = [];

    if (warehouse_id) {
      whereConditions.push('s.warehouse_id = ?');
      params.push(warehouse_id);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const stockLevels = await query(
      `SELECT 
        p.id as product_id,
        p.name as product_name,
        p.sku_code,
        f.name as fitting_name,
        sz.name as size_name,
        w.name as warehouse_name,
        s.quantity,
        s.available_quantity,
        s.reserved_quantity,
        s.min_stock_level,
        s.avg_cost_price,
        c.name as category_name
      FROM stocks s
      JOIN products p ON s.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN fittings f ON s.fitting_id = f.id
      LEFT JOIN sizes sz ON s.size_id = sz.id
      JOIN warehouses w ON s.warehouse_id = w.id
      ${whereClause}
      ORDER BY s.quantity ASC, p.name`,
      params
    );

    const lowStock = stockLevels.filter(item => item.quantity <= low_stock_threshold);
    const outOfStock = stockLevels.filter(item => item.quantity === 0);

    res.json({
      success: true,
      data: {
        all: stockLevels,
        low_stock: lowStock,
        out_of_stock: outOfStock,
        summary: {
          total_items: stockLevels.length,
          low_stock_count: lowStock.length,
          out_of_stock_count: outOfStock.length
        }
      }
    });
  } catch (error) {
    console.error('Get stock levels error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get stock levels',
      error: error.message
    });
  }
};

module.exports = {
  getVariantInventory,
  updateVariantStock,
  getInventoryOverview,
  getMovements,
  getLowStockAlerts,
  createAdjustment,
  getInventoryValueReport,
  getStockLevels
};