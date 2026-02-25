const { query, pool } = require('../config/database');

// Get stock by filters (from product_variants table)
exports.getStocks = async (req, res) => {
  try {
    const { warehouse_id, product_id, category_id, fitting_id, size_id, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    let whereConditions = ['pv.is_active = 1'];
    let params = [];
    
    if (warehouse_id) {
      whereConditions.push('pv.warehouse_id = ?');
      params.push(warehouse_id);
    }
    
    if (product_id) {
      whereConditions.push('pv.product_id = ?');
      params.push(product_id);
    }
    
    if (category_id) {
      whereConditions.push('p.category_id = ?');
      params.push(category_id);
    }
    
    if (fitting_id) {
      whereConditions.push('p.fitting_id = ?');
      params.push(fitting_id);
    }
    
    if (size_id) {
      whereConditions.push('pv.size_id = ?');
      params.push(size_id);
    }
    
    const sql = `
      SELECT pv.id, pv.product_id, pv.size_id, pv.warehouse_id, pv.sku_variant,
             pv.stock_quantity as quantity, pv.additional_price, pv.minimum_stock as min_stock,
             pv.cost_price, pv.is_active, pv.created_at, pv.updated_at,
             w.name as warehouse_name, p.name as product_name, p.sku, p.base_price,
             c.name as category_name, f.name as fitting_name, sz.name as size_name
      FROM product_variants pv
      LEFT JOIN warehouses w ON pv.warehouse_id = w.id
      JOIN products p ON pv.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN fittings f ON p.fitting_id = f.id
      LEFT JOIN sizes sz ON pv.size_id = sz.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY p.name ASC, sz.sort_order ASC
      LIMIT ? OFFSET ?
    `;
    
    params.push(parseInt(limit), offset);
    const stocks = await query(sql, params);
    
    // Count total
    const countSql = `
      SELECT COUNT(*) as total
      FROM product_variants pv
      LEFT JOIN warehouses w ON pv.warehouse_id = w.id
      JOIN products p ON pv.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN fittings f ON p.fitting_id = f.id
      LEFT JOIN sizes sz ON pv.size_id = sz.id
      WHERE ${whereConditions.join(' AND ')}
    `;
    const countResult = await query(countSql, params.slice(0, -2));
    
    res.json({
      success: true,
      data: stocks || [],
      pagination: {
        total: countResult[0]?.total || 0,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil((countResult[0]?.total || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Get stocks error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data stok', error: error.message });
  }
};

// Create initial stock for new product variant (updates product_variants table)
exports.createVariantStock = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { product_variant_id, warehouse_id, stock_quantity = 0, minimum_stock = 5, cost_price = 0 } = req.body;
    const created_by = req.user.id;
    
    if (!product_variant_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product variant ID harus diisi' 
      });
    }
    
    // Check if variant exists
    const [variantData] = await connection.query(
      'SELECT id, product_id, size_id, stock_quantity FROM product_variants WHERE id = ?',
      [product_variant_id]
    );
    
    if (variantData.length === 0) {
      await connection.rollback();
      return res.status(404).json({ 
        success: false, 
        message: 'Varian produk tidak ditemukan' 
      });
    }
    
    const variant = variantData[0];
    
    // Update the variant with stock info
    await connection.query(
      `UPDATE product_variants 
       SET stock_quantity = ?, minimum_stock = ?, cost_price = ?, warehouse_id = ?
       WHERE id = ?`,
      [stock_quantity, minimum_stock, cost_price, warehouse_id || variant.warehouse_id, product_variant_id]
    );
    
    // Record inventory movement if quantity > 0
    if (stock_quantity > 0) {
      await connection.query(
        `INSERT INTO inventory_movements 
        (product_variant_id, type, quantity, reference_type, notes, created_by)
        VALUES (?, 'in', ?, 'initial_stock', 'Stok awal dari pembuatan varian', ?)`,
        [product_variant_id, stock_quantity, created_by]
      );
    }
    
    await connection.commit();
    
    res.status(201).json({
      success: true,
      message: 'Stok varian berhasil dibuat',
      data: { id: product_variant_id }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create variant stock error:', error);
    res.status(500).json({ success: false, message: 'Gagal membuat stok varian', error: error.message });
  } finally {
    connection.release();
  }
};

// Add opening stock (for product_variants table)
exports.addOpeningStock = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { variant_id, warehouse_id, product_id, size_id, quantity, cost_price } = req.body;
    const created_by = req.user.id;
    
    if (!quantity || !cost_price) {
      return res.status(400).json({ 
        success: false, 
        message: 'Jumlah dan harga beli harus diisi' 
      });
    }
    
    // If variant_id is provided, update that variant directly
    if (variant_id) {
      const [existingVariant] = await connection.query(
        'SELECT id, stock_quantity FROM product_variants WHERE id = ?',
        [variant_id]
      );
      
      if (existingVariant.length === 0) {
        await connection.rollback();
        return res.status(404).json({ 
          success: false, 
          message: 'Varian tidak ditemukan' 
        });
      }
      
      if (existingVariant[0].stock_quantity > 0) {
        await connection.rollback();
        return res.status(400).json({ 
          success: false, 
          message: 'Stok untuk varian ini sudah ada. Gunakan fitur adjustment untuk mengubah stok.' 
        });
      }
      
      // Update variant with opening stock
      await connection.query(
        'UPDATE product_variants SET stock_quantity = ?, cost_price = ? WHERE id = ?',
        [quantity, cost_price, variant_id]
      );
      
      // Record inventory movement
      await connection.query(
        `INSERT INTO inventory_movements 
        (product_variant_id, type, quantity, reference_type, notes, created_by)
        VALUES (?, 'in', ?, 'initial_stock', 'Stok awal', ?)`,
        [variant_id, quantity, created_by]
      );
      
    } else {
      // Find or create variant based on product_id, size_id, warehouse_id
      if (!warehouse_id || !product_id || !size_id) {
        await connection.rollback();
        return res.status(400).json({ 
          success: false, 
          message: 'Gudang, produk, dan ukuran harus diisi' 
        });
      }
      
      const [existingVariant] = await connection.query(
        'SELECT id, stock_quantity FROM product_variants WHERE product_id = ? AND size_id = ? AND warehouse_id = ?',
        [product_id, size_id, warehouse_id]
      );
      
      let variantId;
      
      if (existingVariant.length > 0) {
        if (existingVariant[0].stock_quantity > 0) {
          await connection.rollback();
          return res.status(400).json({ 
            success: false, 
            message: 'Stok untuk kombinasi ini sudah ada. Gunakan fitur adjustment untuk mengubah stok.' 
          });
        }
        variantId = existingVariant[0].id;
        
        // Update existing variant
        await connection.query(
          'UPDATE product_variants SET stock_quantity = ?, cost_price = ? WHERE id = ?',
          [quantity, cost_price, variantId]
        );
      } else {
        // Create new variant
        const [result] = await connection.query(
          `INSERT INTO product_variants (product_id, size_id, warehouse_id, sku_variant, stock_quantity, cost_price, minimum_stock)
           VALUES (?, ?, ?, ?, ?, ?, 5)`,
          [product_id, size_id, warehouse_id, `${product_id}-${size_id}-W${warehouse_id}`, quantity, cost_price]
        );
        variantId = result.insertId;
      }
      
      // Record inventory movement
      await connection.query(
        `INSERT INTO inventory_movements 
        (product_variant_id, type, quantity, reference_type, notes, created_by)
        VALUES (?, 'in', ?, 'initial_stock', 'Stok awal', ?)`,
        [variantId, quantity, created_by]
      );
    }
    
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

// Stock adjustment (for product_variants table)
exports.adjustStock = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { variant_id, warehouse_id, product_id, size_id, adjustment_type, quantity, cost_price, notes } = req.body;
    const created_by = req.user.id;
    
    if (!adjustment_type || !quantity) {
      return res.status(400).json({ 
        success: false, 
        message: 'Tipe adjustment dan jumlah harus diisi' 
      });
    }
    
    let variantData;
    
    // Find the variant to adjust
    if (variant_id) {
      const [result] = await connection.query(
        'SELECT id, stock_quantity, cost_price FROM product_variants WHERE id = ?',
        [variant_id]
      );
      variantData = result[0];
    } else if (warehouse_id && product_id && size_id) {
      const [result] = await connection.query(
        'SELECT id, stock_quantity, cost_price FROM product_variants WHERE warehouse_id = ? AND product_id = ? AND size_id = ?',
        [warehouse_id, product_id, size_id]
      );
      variantData = result[0];
    }
    
    if (!variantData) {
      await connection.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'Varian tidak ditemukan. Tambahkan stok awal terlebih dahulu.' 
      });
    }
    
    const currentQuantity = variantData.stock_quantity || 0;
    const quantityChange = adjustment_type === 'increase' ? quantity : -quantity;
    const newQuantity = currentQuantity + quantityChange;
    
    if (newQuantity < 0) {
      await connection.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'Stok tidak boleh negatif' 
      });
    }
    
    // Calculate new cost price if adding stock with cost (weighted average)
    let newCostPrice = variantData.cost_price || 0;
    if (adjustment_type === 'increase' && cost_price && cost_price > 0) {
      if (currentQuantity > 0 && variantData.cost_price > 0) {
        const totalCost = (currentQuantity * variantData.cost_price) + (quantity * cost_price);
        newCostPrice = totalCost / newQuantity;
      } else {
        newCostPrice = cost_price;
      }
    }
    
    // Update product variant stock
    await connection.query(
      'UPDATE product_variants SET stock_quantity = ?, cost_price = ? WHERE id = ?',
      [newQuantity, newCostPrice, variantData.id]
    );
    
    // Record inventory movement
    await connection.query(
      `INSERT INTO inventory_movements 
      (product_variant_id, type, quantity, reference_type, notes, created_by)
      VALUES (?, ?, ?, 'adjustment', ?, ?)`,
      [variantData.id, quantityChange > 0 ? 'in' : 'out', Math.abs(quantityChange), notes || 'Adjustment manual', created_by]
    );
    
    await connection.commit();
    
    res.json({
      success: true,
      message: 'Stok berhasil disesuaikan',
      data: {
        previous_quantity: currentQuantity,
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

// Get stock movements (from inventory_movements table)
exports.getStockMovements = async (req, res) => {
  try {
    const { warehouse_id, product_id, variant_id, movement_type, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    let whereConditions = ['1=1'];
    let params = [];
    
    if (variant_id) {
      whereConditions.push('im.product_variant_id = ?');
      params.push(variant_id);
    }
    
    if (warehouse_id) {
      whereConditions.push('pv.warehouse_id = ?');
      params.push(warehouse_id);
    }
    
    if (product_id) {
      whereConditions.push('pv.product_id = ?');
      params.push(product_id);
    }
    
    if (movement_type) {
      whereConditions.push('im.type = ?');
      params.push(movement_type);
    }
    
    const sql = `
      SELECT im.*, pv.sku_variant, pv.warehouse_id, pv.product_id, pv.size_id,
             w.name as warehouse_name, p.name as product_name, p.sku,
             sz.name as size_name, u.full_name as created_by_name
      FROM inventory_movements im
      JOIN product_variants pv ON im.product_variant_id = pv.id
      JOIN warehouses w ON pv.warehouse_id = w.id
      JOIN products p ON pv.product_id = p.id
      LEFT JOIN sizes sz ON pv.size_id = sz.id
      LEFT JOIN users u ON im.created_by = u.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY im.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    params.push(parseInt(limit), offset);
    const movements = await query(sql, params);
    
    // Count total for pagination
    const countSql = `
      SELECT COUNT(*) as total
      FROM inventory_movements im
      JOIN product_variants pv ON im.product_variant_id = pv.id
      JOIN warehouses w ON pv.warehouse_id = w.id
      JOIN products p ON pv.product_id = p.id
      LEFT JOIN sizes sz ON pv.size_id = sz.id
      LEFT JOIN users u ON im.created_by = u.id
      WHERE ${whereConditions.join(' AND ')}
    `;
    const countResult = await query(countSql, params.slice(0, -2));
    const total = countResult[0]?.total || 0;
    
    res.json({
      success: true,
      data: movements || [],
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get stock movements error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil riwayat stok' });
  }
};

// Get stock summary (from product_variants table)
exports.getStockSummary = async (req, res) => {
  try {
    const { warehouse_id } = req.query;
    
    let whereConditions = ['pv.is_active = 1'];
    let params = [];
    
    if (warehouse_id) {
      whereConditions.push('pv.warehouse_id = ?');
      params.push(warehouse_id);
    }
    
    const sql = `
      SELECT 
        COUNT(DISTINCT pv.product_id) as total_products,
        COUNT(pv.id) as total_variants,
        COALESCE(SUM(pv.stock_quantity), 0) as total_quantity,
        COALESCE(SUM(pv.stock_quantity * pv.cost_price), 0) as total_value,
        COUNT(CASE WHEN pv.stock_quantity = 0 THEN 1 END) as out_of_stock,
        COUNT(CASE WHEN pv.stock_quantity > 0 AND pv.stock_quantity <= IFNULL(pv.minimum_stock, 5) THEN 1 END) as low_stock
      FROM product_variants pv
      WHERE ${whereConditions.join(' AND ')}
    `;
    
    const summary = await query(sql, params);
    
    res.json({
      success: true,
      data: summary[0] || {
        total_products: 0,
        total_variants: 0,
        total_quantity: 0,
        total_value: 0,
        out_of_stock: 0,
        low_stock: 0
      }
    });
  } catch (error) {
    console.error('Get stock summary error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil ringkasan stok' });
  }
};