const db = require('../config/database');

// Get all stock opnames
exports.getStockOpnames = async (req, res) => {
  try {
    const { warehouse_id, status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let whereConditions = ['1=1'];
    let params = [];
    
    if (warehouse_id) {
      whereConditions.push('so.warehouse_id = ?');
      params.push(warehouse_id);
    }
    
    if (status) {
      whereConditions.push('so.status = ?');
      params.push(status);
    }
    
    const sql = `
      SELECT so.*, w.name as warehouse_name, u.full_name as created_by_name,
             COUNT(sod.id) as total_items
      FROM stock_opnames so
      JOIN warehouses w ON so.warehouse_id = w.id
      LEFT JOIN users u ON so.created_by = u.id
      LEFT JOIN stock_opname_details sod ON so.id = sod.opname_id
      WHERE ${whereConditions.join(' AND ')}
      GROUP BY so.id
      ORDER BY so.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    params.push(parseInt(limit), offset);
    const [opnames] = await db.query(sql, params);
    
    res.json({
      success: true,
      data: opnames
    });
  } catch (error) {
    console.error('Get stock opnames error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data stock opname' });
  }
};

// Create stock opname
exports.createStockOpname = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { warehouse_id, opname_date, notes } = req.body;
    const created_by = req.user.id;
    
    if (!warehouse_id || !opname_date) {
      return res.status(400).json({ 
        success: false, 
        message: 'Gudang dan tanggal opname harus diisi' 
      });
    }
    
    // Create stock opname header
    const opnameSql = `
      INSERT INTO stock_opnames (warehouse_id, opname_date, notes, created_by, status)
      VALUES (?, ?, ?, ?, 'draft')
    `;
    const [opnameResult] = await connection.query(opnameSql, [warehouse_id, opname_date, notes || null, created_by]);
    const opnameId = opnameResult.insertId;
    
    // Get current stocks for this warehouse
    const stocksSql = `
      SELECT s.*, p.name as product_name, p.sku, f.name as fitting_name, sz.name as size_name
      FROM stocks s
      JOIN products p ON s.product_id = p.id
      LEFT JOIN fittings f ON s.fitting_id = f.id
      LEFT JOIN sizes sz ON s.size_id = sz.id
      WHERE s.warehouse_id = ? AND s.quantity > 0
      ORDER BY p.name ASC, f.name ASC, sz.sort_order ASC
    `;
    const [stocks] = await connection.query(stocksSql, [warehouse_id]);
    
    // Insert opname details for each stock item
    if (stocks.length > 0) {
      const detailsSql = `
        INSERT INTO stock_opname_details (opname_id, product_id, fitting_id, size_id, system_qty, physical_qty)
        VALUES ?
      `;
      const detailsValues = stocks.map(stock => [
        opnameId, stock.product_id, stock.fitting_id || null, stock.size_id || null, 
        stock.quantity, 0 // physical_qty starts at 0, to be filled by user
      ]);
      
      await connection.query(detailsSql, [detailsValues]);
    }
    
    await connection.commit();
    
    res.status(201).json({
      success: true,
      message: 'Stock opname berhasil dibuat',
      data: { id: opnameId, total_items: stocks.length }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create stock opname error:', error);
    res.status(500).json({ success: false, message: 'Gagal membuat stock opname' });
  } finally {
    connection.release();
  }
};

// Get stock opname details
exports.getStockOpnameDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get opname header
    const opnameSql = `
      SELECT so.*, w.name as warehouse_name, u.full_name as created_by_name
      FROM stock_opnames so
      JOIN warehouses w ON so.warehouse_id = w.id
      LEFT JOIN users u ON so.created_by = u.id
      WHERE so.id = ?
    `;
    const [opnames] = await db.query(opnameSql, [id]);
    
    if (opnames.length === 0) {
      return res.status(404).json({ success: false, message: 'Stock opname tidak ditemukan' });
    }
    
    // Get opname details
    const detailsSql = `
      SELECT sod.*, p.name as product_name, p.sku, f.name as fitting_name, sz.name as size_name
      FROM stock_opname_details sod
      JOIN products p ON sod.product_id = p.id
      LEFT JOIN fittings f ON sod.fitting_id = f.id
      LEFT JOIN sizes sz ON sod.size_id = sz.id
      WHERE sod.opname_id = ?
      ORDER BY p.name ASC, f.name ASC, sz.sort_order ASC
    `;
    const [details] = await db.query(detailsSql, [id]);
    
    res.json({
      success: true,
      data: {
        ...opnames[0],
        details: details
      }
    });
  } catch (error) {
    console.error('Get stock opname details error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil detail stock opname' });
  }
};

// Update stock opname detail
exports.updateOpnameDetail = async (req, res) => {
  try {
    const { detailId } = req.params;
    const { physical_qty, notes } = req.body;
    
    if (physical_qty === undefined || physical_qty < 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Jumlah fisik harus diisi dan tidak boleh negatif' 
      });
    }
    
    // Check if opname is still in draft status
    const checkSql = `
      SELECT so.status FROM stock_opname_details sod
      JOIN stock_opnames so ON sod.opname_id = so.id
      WHERE sod.id = ?
    `;
    const [checks] = await db.query(checkSql, [detailId]);
    
    if (checks.length === 0) {
      return res.status(404).json({ success: false, message: 'Detail opname tidak ditemukan' });
    }
    
    if (checks[0].status !== 'draft') {
      return res.status(400).json({ 
        success: false, 
        message: 'Opname sudah selesai, tidak bisa diubah' 
      });
    }
    
    // Update physical quantity
    const updateSql = `
      UPDATE stock_opname_details 
      SET physical_qty = ?, notes = ?
      WHERE id = ?
    `;
    await db.query(updateSql, [physical_qty, notes || null, detailId]);
    
    res.json({
      success: true,
      message: 'Detail opname berhasil diperbarui'
    });
  } catch (error) {
    console.error('Update opname detail error:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui detail opname' });
  }
};

// Complete stock opname (apply adjustments)
exports.completeStockOpname = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    const created_by = req.user.id;
    
    // Check opname status
    const [opnames] = await connection.query(
      'SELECT warehouse_id, status FROM stock_opnames WHERE id = ?', 
      [id]
    );
    
    if (opnames.length === 0) {
      return res.status(404).json({ success: false, message: 'Stock opname tidak ditemukan' });
    }
    
    if (opnames[0].status !== 'draft') {
      return res.status(400).json({ 
        success: false, 
        message: 'Stock opname sudah selesai atau dibatalkan' 
      });
    }
    
    const warehouse_id = opnames[0].warehouse_id;
    
    // Get all details with differences
    const detailsSql = `
      SELECT sod.*, (sod.physical_qty - sod.system_qty) as difference
      FROM stock_opname_details sod
      WHERE sod.opname_id = ? AND (sod.physical_qty - sod.system_qty) != 0
    `;
    const [details] = await connection.query(detailsSql, [id]);
    
    // Apply stock adjustments for items with differences
    for (const detail of details) {
      const { product_id, fitting_id, size_id, system_qty, physical_qty, difference } = detail;
      
      // Update stock quantity
      await connection.query(
        'UPDATE stocks SET quantity = ? WHERE warehouse_id = ? AND product_id = ? AND fitting_id = ? AND size_id = ?',
        [physical_qty, warehouse_id, product_id, fitting_id || null, size_id || null]
      );
      
      // Record stock movement
      const movementSql = `
        INSERT INTO stock_movements (warehouse_id, product_id, fitting_id, size_id, movement_type,
          reference_type, reference_id, quantity_before, quantity_change, quantity_after, 
          notes, created_by)
        VALUES (?, ?, ?, ?, 'opname', 'stock_opname', ?, ?, ?, ?, 'Stock opname adjustment', ?)
      `;
      await connection.query(movementSql, [
        warehouse_id, product_id, fitting_id || null, size_id || null,
        id, system_qty, difference, physical_qty, created_by
      ]);
    }
    
    // Mark opname as completed
    await connection.query(
      'UPDATE stock_opnames SET status = ?, completed_at = NOW() WHERE id = ?',
      ['completed', id]
    );
    
    await connection.commit();
    
    res.json({
      success: true,
      message: 'Stock opname berhasil diselesaikan',
      data: {
        total_adjustments: details.length,
        total_difference: details.reduce((sum, item) => sum + Math.abs(item.difference), 0)
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Complete stock opname error:', error);
    res.status(500).json({ success: false, message: 'Gagal menyelesaikan stock opname' });
  } finally {
    connection.release();
  }
};

// Cancel stock opname
exports.cancelStockOpname = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if opname can be cancelled
    const [opnames] = await db.query('SELECT status FROM stock_opnames WHERE id = ?', [id]);
    
    if (opnames.length === 0) {
      return res.status(404).json({ success: false, message: 'Stock opname tidak ditemukan' });
    }
    
    if (opnames[0].status !== 'draft') {
      return res.status(400).json({ 
        success: false, 
        message: 'Hanya opname dengan status draft yang bisa dibatalkan' 
      });
    }
    
    // Update status to cancelled
    await db.query('UPDATE stock_opnames SET status = ? WHERE id = ?', ['cancelled', id]);
    
    res.json({
      success: true,
      message: 'Stock opname berhasil dibatalkan'
    });
  } catch (error) {
    console.error('Cancel stock opname error:', error);
    res.status(500).json({ success: false, message: 'Gagal membatalkan stock opname' });
  }
};