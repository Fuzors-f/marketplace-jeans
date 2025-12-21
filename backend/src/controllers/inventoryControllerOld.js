const { query, transaction } = require('../config/database');

// @desc    Get inventory movements
// @route   GET /api/inventory/movements
// @access  Private (Admin, Admin Stok)
exports.getMovements = async (req, res) => {
  try {
    const { product_id, type, start_date, end_date, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    let whereConditions = [];
    let params = [];

    if (product_id) {
      whereConditions.push('pv.product_id = ?');
      params.push(product_id);
    }
    if (type) {
      whereConditions.push('im.type = ?');
      params.push(type);
    }
    if (start_date) {
      whereConditions.push('im.created_at >= ?');
      params.push(start_date);
    }
    if (end_date) {
      whereConditions.push('im.created_at <= ?');
      params.push(end_date);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const movements = await query(
      `SELECT 
        im.*, 
        p.name as product_name, 
        pv.sku_variant,
        s.name as size_name,
        u.full_name as created_by_name
      FROM inventory_movements im
      JOIN product_variants pv ON im.product_variant_id = pv.id
      JOIN products p ON pv.product_id = p.id
      JOIN sizes s ON pv.size_id = s.id
      LEFT JOIN users u ON im.created_by = u.id
      ${whereClause}
      ORDER BY im.created_at DESC
      LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    res.json({ success: true, data: movements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add stock
// @route   POST /api/inventory/add-stock
// @access  Private (Admin, Admin Stok)
exports.addStock = async (req, res) => {
  try {
    const { product_variant_id, quantity, notes } = req.body;

    if (!product_variant_id || !quantity || quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid input' });
    }

    await transaction(async (conn) => {
      await conn.execute(
        'UPDATE product_variants SET stock_quantity = stock_quantity + ? WHERE id = ?',
        [quantity, product_variant_id]
      );

      await conn.execute(
        `INSERT INTO inventory_movements 
        (product_variant_id, type, quantity, reference_type, notes, created_by)
        VALUES (?, 'in', ?, 'manual', ?, ?)`,
        [product_variant_id, quantity, notes || 'Manual stock addition', req.user.id]
      );
    });

    res.json({ success: true, message: 'Stock added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Adjust stock
// @route   POST /api/inventory/adjust-stock
// @access  Private (Admin, Admin Stok)
exports.adjustStock = async (req, res) => {
  try {
    const { product_variant_id, new_quantity, notes } = req.body;

    if (!product_variant_id || new_quantity === undefined || new_quantity < 0) {
      return res.status(400).json({ success: false, message: 'Invalid input' });
    }

    await transaction(async (conn) => {
      const [variants] = await conn.execute(
        'SELECT stock_quantity FROM product_variants WHERE id = ?',
        [product_variant_id]
      );

      if (variants.length === 0) {
        throw new Error('Product variant not found');
      }

      const currentStock = variants[0].stock_quantity;
      const difference = new_quantity - currentStock;

      await conn.execute(
        'UPDATE product_variants SET stock_quantity = ? WHERE id = ?',
        [new_quantity, product_variant_id]
      );

      if (difference !== 0) {
        await conn.execute(
          `INSERT INTO inventory_movements 
          (product_variant_id, type, quantity, reference_type, notes, created_by)
          VALUES (?, 'adjustment', ?, 'adjustment', ?, ?)`,
          [product_variant_id, Math.abs(difference), 
           notes || `Stock adjusted from ${currentStock} to ${new_quantity}`, req.user.id]
        );
      }
    });

    res.json({ success: true, message: 'Stock adjusted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current stock levels
// @route   GET /api/inventory/stock-levels
// @access  Private (Admin, Admin Stok)
exports.getStockLevels = async (req, res) => {
  try {
    const { low_stock = 10 } = req.query;

    const stockLevels = await query(
      `SELECT 
        p.id as product_id, p.name as product_name, p.sku,
        pv.id as variant_id, pv.sku_variant, pv.stock_quantity,
        s.name as size_name,
        c.name as category_name
      FROM product_variants pv
      JOIN products p ON pv.product_id = p.id
      JOIN sizes s ON pv.size_id = s.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE pv.is_active = true AND p.is_active = true
      ORDER BY pv.stock_quantity ASC, p.name`
    );

    const lowStock = stockLevels.filter(item => item.stock_quantity <= low_stock);
    const outOfStock = stockLevels.filter(item => item.stock_quantity === 0);

    res.json({
      success: true,
      data: {
        all: stockLevels,
        low_stock: lowStock,
        out_of_stock: outOfStock
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
