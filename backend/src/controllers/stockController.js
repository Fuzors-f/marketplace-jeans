const db = require('../config/database');

// Get stock by filters
exports.getStocks = async (req, res) => {
  try {
    const { warehouse_id, product_id, category_id, fitting_id, size_id, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    let whereConditions = ['s.quantity >= 0'];
    let params = [];
    
    if (warehouse_id) {
      whereConditions.push('s.warehouse_id = ?');
      params.push(warehouse_id);
    }
    
    if (product_id) {
      whereConditions.push('s.product_id = ?');
      params.push(product_id);
    }
    
    if (category_id) {
      whereConditions.push('p.category_id = ?');
      params.push(category_id);
    }
    
    if (fitting_id) {
      whereConditions.push('s.fitting_id = ?');
      params.push(fitting_id);
    }
    
    if (size_id) {
      whereConditions.push('s.size_id = ?');
      params.push(size_id);
    }
    
    const sql = `
      SELECT s.*, w.name as warehouse_name, p.name as product_name, p.sku,
             c.name as category_name, f.name as fitting_name, sz.name as size_name
      FROM stocks s
      JOIN warehouses w ON s.warehouse_id = w.id
      JOIN products p ON s.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN fittings f ON s.fitting_id = f.id
      LEFT JOIN sizes sz ON s.size_id = sz.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY w.name ASC, p.name ASC, f.name ASC, sz.sort_order ASC
      LIMIT ? OFFSET ?
    `;
    
    params.push(parseInt(limit), offset);
    const [stocks] = await db.query(sql, params);
    
    // Count total
    const countSql = `
      SELECT COUNT(*) as total
      FROM stocks s
      JOIN warehouses w ON s.warehouse_id = w.id
      JOIN products p ON s.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN fittings f ON s.fitting_id = f.id
      LEFT JOIN sizes sz ON s.size_id = sz.id
      WHERE ${whereConditions.join(' AND ')}
    `;
    const [countResult] = await db.query(countSql, params.slice(0, -2));
    
    res.json({
      success: true,
      data: stocks,
      pagination: {
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Get stocks error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data stok' });
  }
};

// Add opening stock
exports.addOpeningStock = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { warehouse_id, product_id, fitting_id, size_id, quantity, cost_price } = req.body;
    const created_by = req.user.id;
    
    if (!warehouse_id || !product_id || !quantity || !cost_price) {
      return res.status(400).json({ 
        success: false, 
        message: 'Gudang, produk, jumlah, dan harga beli harus diisi' 
      });
    }
    
    // Check if stock already exists
    const [existingStock] = await connection.query(
      'SELECT id, quantity FROM stocks WHERE warehouse_id = ? AND product_id = ? AND fitting_id = ? AND size_id = ?',
      [warehouse_id, product_id, fitting_id || null, size_id || null]
    );
    
    if (existingStock.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Stok untuk kombinasi ini sudah ada. Gunakan fitur adjustment untuk mengubah stok.' 
      });
    }
    
    // Insert opening stock
    const stockSql = `
      INSERT INTO stocks (warehouse_id, product_id, fitting_id, size_id, quantity, avg_cost_price, last_cost_price)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    await connection.query(stockSql, [
      warehouse_id, product_id, fitting_id || null, size_id || null, 
      quantity, cost_price, cost_price
    ]);
    
    // Record stock movement
    const movementSql = `
      INSERT INTO stock_movements (warehouse_id, product_id, fitting_id, size_id, movement_type,
        quantity_before, quantity_change, quantity_after, cost_price, notes, created_by)
      VALUES (?, ?, ?, ?, 'in', 0, ?, ?, ?, 'Stok awal', ?)
    `;
    await connection.query(movementSql, [
      warehouse_id, product_id, fitting_id || null, size_id || null,
      quantity, quantity, cost_price, created_by
    ]);
    
    await connection.commit();
    
    res.status(201).json({
      success: true,
      message: 'Stok awal berhasil ditambahkan'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Add opening stock error:', error);
    res.status(500).json({ success: false, message: 'Gagal menambah stok awal' });
  } finally {
    connection.release();
  }
};

// Stock adjustment
exports.adjustStock = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { warehouse_id, product_id, fitting_id, size_id, adjustment_type, quantity, cost_price, notes } = req.body;
    const created_by = req.user.id;
    
    if (!warehouse_id || !product_id || !adjustment_type || !quantity) {
      return res.status(400).json({ 
        success: false, 
        message: 'Semua field wajib harus diisi' 
      });
    }
    
    // Get current stock
    const [currentStock] = await connection.query(
      'SELECT id, quantity, avg_cost_price FROM stocks WHERE warehouse_id = ? AND product_id = ? AND fitting_id = ? AND size_id = ?',
      [warehouse_id, product_id, fitting_id || null, size_id || null]
    );
    
    if (currentStock.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Stok tidak ditemukan. Tambahkan stok awal terlebih dahulu.' 
      });
    }
    
    const current = currentStock[0];
    const quantityChange = adjustment_type === 'increase' ? quantity : -quantity;
    const newQuantity = current.quantity + quantityChange;
    
    if (newQuantity < 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Stok tidak boleh negatif' 
      });
    }
    
    // Calculate new average cost if adding stock with cost
    let newAvgCostPrice = current.avg_cost_price;
    if (adjustment_type === 'increase' && cost_price) {
      // Weighted average: ((old_qty * old_price) + (new_qty * new_price)) / (old_qty + new_qty)
      const totalCost = (current.quantity * current.avg_cost_price) + (quantity * cost_price);
      newAvgCostPrice = totalCost / newQuantity;
    }
    
    // Update stock
    await connection.query(
      'UPDATE stocks SET quantity = ?, avg_cost_price = ?, last_cost_price = ? WHERE id = ?',
      [newQuantity, newAvgCostPrice, cost_price || current.avg_cost_price, current.id]
    );
    
    // Record movement
    const movementSql = `
      INSERT INTO stock_movements (warehouse_id, product_id, fitting_id, size_id, movement_type,
        quantity_before, quantity_change, quantity_after, cost_price, notes, created_by)
      VALUES (?, ?, ?, ?, 'adjustment', ?, ?, ?, ?, ?, ?)
    `;
    await connection.query(movementSql, [
      warehouse_id, product_id, fitting_id || null, size_id || null,
      current.quantity, quantityChange, newQuantity, cost_price || null, notes || 'Adjustment manual', created_by
    ]);
    
    await connection.commit();
    
    res.json({
      success: true,
      message: 'Stok berhasil disesuaikan',
      data: {
        previous_quantity: current.quantity,
        new_quantity: newQuantity,
        change: quantityChange
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Adjust stock error:', error);
    res.status(500).json({ success: false, message: 'Gagal menyesuaikan stok' });
  } finally {
    connection.release();
  }
};

// Get stock movements
exports.getStockMovements = async (req, res) => {
  try {
    const { warehouse_id, product_id, movement_type, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    let whereConditions = ['1=1'];
    let params = [];
    
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
    
    const sql = `
      SELECT sm.*, w.name as warehouse_name, p.name as product_name, p.sku,
             f.name as fitting_name, sz.name as size_name, u.full_name as created_by_name
      FROM stock_movements sm
      JOIN warehouses w ON sm.warehouse_id = w.id
      JOIN products p ON sm.product_id = p.id
      LEFT JOIN fittings f ON sm.fitting_id = f.id
      LEFT JOIN sizes sz ON sm.size_id = sz.id
      LEFT JOIN users u ON sm.created_by = u.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY sm.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    params.push(parseInt(limit), offset);
    const [movements] = await db.query(sql, params);
    
    res.json({
      success: true,
      data: movements
    });
  } catch (error) {
    console.error('Get stock movements error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil riwayat stok' });
  }
};

// Get stock summary
exports.getStockSummary = async (req, res) => {
  try {
    const { warehouse_id } = req.query;
    
    let whereClause = warehouse_id ? 'WHERE s.warehouse_id = ?' : '';
    let params = warehouse_id ? [warehouse_id] : [];
    
    const sql = `
      SELECT 
        COUNT(DISTINCT s.product_id) as total_products,
        SUM(s.quantity) as total_quantity,
        SUM(s.quantity * s.avg_cost_price) as total_value,
        COUNT(CASE WHEN s.quantity = 0 THEN 1 END) as out_of_stock,
        COUNT(CASE WHEN s.quantity > 0 AND s.quantity <= 5 THEN 1 END) as low_stock
      FROM stocks s
      ${whereClause}
    `;
    
    const [summary] = await db.query(sql, params);
    
    res.json({
      success: true,
      data: summary[0]
    });
  } catch (error) {
    console.error('Get stock summary error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil ringkasan stok' });
  }
};