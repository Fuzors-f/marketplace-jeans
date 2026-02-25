const db = require('../config/database');

// Get all warehouses
exports.getAllWarehouses = async (req, res) => {
  try {
    const { active_only } = req.query;
    
    let sql = `
      SELECT id, name, code, location, address, city, province, phone, email, 
             is_main, is_active, created_at
      FROM warehouses 
    `;
    
    // Only filter by active status if explicitly requested (active_only=true)
    if (active_only === 'true') {
      sql += ` WHERE is_active = 1 `;
    }
    
    sql += ` ORDER BY is_main DESC, name ASC`;
    
    const warehouses = await db.query(sql);
    
    console.log('Warehouses found:', warehouses.length);
   
    res.json({
      success: true,
      data: warehouses
    });
  } catch (error) {
    console.error('Get warehouses error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data gudang' });
  }
};

// Get single warehouse
exports.getWarehouse = async (req, res) => {
  try {
    const { id } = req.params;
    
    const sql = `
      SELECT id, name, code, location, address, city, province, phone, email, 
             is_main, is_active, created_at
      FROM warehouses WHERE id = ?
    `;
    const warehouses = await db.query(sql, [id]);
    
    if (warehouses.length === 0) {
      return res.status(404).json({ success: false, message: 'Gudang tidak ditemukan' });
    }
    
    res.json({
      success: true,
      data: warehouses[0]
    });
  } catch (error) {
    console.error('Get warehouse error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data gudang' });
  }
};

// Create warehouse
exports.createWarehouse = async (req, res) => {
  try {
    const { name, code, location, address, city, province, phone, email, is_main } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, message: 'Nama gudang harus diisi' });
    }
    
    // Check if code already exists
    if (code) {
      const existing = await db.query('SELECT id FROM warehouses WHERE code = ?', [code]);
      if (existing.length > 0) {
        return res.status(400).json({ success: false, message: 'Kode gudang sudah digunakan' });
      }
    }
    
    // If new warehouse is main, unset previous main
    if (is_main) {
      await db.query('UPDATE warehouses SET is_main = false WHERE is_main = true');
    }
    
    const sql = `
      INSERT INTO warehouses (name, code, location, address, city, province, phone, email, is_main, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, true)
    `;
    
    const result = await db.query(sql, [
      name, code || null, location || null, address || null, city || null, province || null, 
      phone || null, email || null, is_main || false
    ]);
    
    res.status(201).json({
      success: true,
      message: 'Gudang berhasil ditambahkan',
      data: { id: result.insertId, name, code }
    });
  } catch (error) {
    console.error('Create warehouse error:', error);
    res.status(500).json({ success: false, message: 'Gagal menambah gudang' });
  }
};

// Update warehouse
exports.updateWarehouse = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, location, address, city, province, phone, email, is_main, is_active } = req.body;
    
    // Check if warehouse exists
    const existing = await db.query('SELECT id FROM warehouses WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Gudang tidak ditemukan' });
    }
    
    // Check if code is unique (excluding current warehouse)
    if (code) {
      const codeCheck = await db.query('SELECT id FROM warehouses WHERE code = ? AND id != ?', [code, id]);
      if (codeCheck.length > 0) {
        return res.status(400).json({ success: false, message: 'Kode gudang sudah digunakan' });
      }
    }
    
    // If updating to main, unset previous main
    if (is_main) {
      await db.query('UPDATE warehouses SET is_main = false WHERE is_main = true AND id != ?', [id]);
    }
    
    const sql = `
      UPDATE warehouses SET
        name = ?, code = ?, location = ?, address = ?, city = ?, province = ?,
        phone = ?, email = ?, is_main = ?, is_active = ?
      WHERE id = ?
    `;
    
    await db.query(sql, [
      name, code || null, location || null, address || null, city || null, province || null,
      phone || null, email || null, is_main || false, 
      is_active !== undefined ? is_active : true, id
    ]);
    
    res.json({
      success: true,
      message: 'Gudang berhasil diperbarui'
    });
  } catch (error) {
    console.error('Update warehouse error:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui gudang' });
  }
};

// Delete warehouse
exports.deleteWarehouse = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if warehouse has stock
    const stocks = await db.query('SELECT id FROM stocks WHERE warehouse_id = ? LIMIT 1', [id]);
    if (stocks.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Tidak dapat menghapus gudang yang memiliki stok' 
      });
    }
    
    const result = await db.query('DELETE FROM warehouses WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Gudang tidak ditemukan' });
    }
    
    res.json({
      success: true,
      message: 'Gudang berhasil dihapus'
    });
  } catch (error) {
    console.error('Delete warehouse error:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus gudang' });
  }
};

// Get warehouse stock summary
exports.getWarehouseStock = async (req, res) => {
  try {
    const { id } = req.params;
    
    const sql = `
      SELECT s.*, p.name as product_name, p.sku, f.name as fitting_name, 
             sz.name as size_name
      FROM stocks s
      JOIN products p ON s.product_id = p.id
      LEFT JOIN fittings f ON s.fitting_id = f.id
      LEFT JOIN sizes sz ON s.size_id = sz.id
      WHERE s.warehouse_id = ? AND s.quantity > 0
      ORDER BY p.name ASC, f.name ASC, sz.sort_order ASC
    `;
    const stocks = await db.query(sql, [id]);
    
    res.json({
      success: true,
      data: stocks
    });
  } catch (error) {
    console.error('Get warehouse stock error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data stok gudang' });
  }
};