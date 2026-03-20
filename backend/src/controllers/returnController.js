const { query, transaction } = require('../config/database');
const { logActivity } = require('../middleware/activityLogger');

// Generate return number
const generateReturnNumber = () => {
  const date = new Date();
  const dateStr = date.getFullYear().toString() +
    (date.getMonth() + 1).toString().padStart(2, '0') +
    date.getDate().toString().padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `RTN-${dateStr}-${random}`;
};

// @desc    Get all returns
// @route   GET /api/returns
// @access  Admin
const getReturns = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, warehouse_id } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = ['1=1'];
    let params = [];

    if (search) {
      whereConditions.push('(r.return_number LIKE ? OR o.order_number LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (status) {
      whereConditions.push('r.status = ?');
      params.push(status);
    }
    if (warehouse_id) {
      whereConditions.push('r.warehouse_id = ?');
      params.push(warehouse_id);
    }

    const whereClause = whereConditions.join(' AND ');

    const returns = await query(
      `SELECT r.*, 
        o.order_number, o.customer_name,
        w.name as warehouse_name,
        u.full_name as created_by_name,
        (SELECT COUNT(*) FROM return_items ri WHERE ri.return_id = r.id) as item_count,
        (SELECT SUM(ri.quantity) FROM return_items ri WHERE ri.return_id = r.id) as total_quantity
      FROM returns r
      JOIN orders o ON r.order_id = o.id
      LEFT JOIN warehouses w ON r.warehouse_id = w.id
      LEFT JOIN users u ON r.created_by = u.id
      WHERE ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) as total FROM returns r
      JOIN orders o ON r.order_id = o.id
      WHERE ${whereClause}`,
      params
    );

    res.json({
      success: true,
      data: returns,
      pagination: {
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Get returns error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data retur' });
  }
};

// @desc    Get return detail
// @route   GET /api/returns/:id
// @access  Admin
const getReturnDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const returns = await query(
      `SELECT r.*, 
        o.order_number, o.customer_name, o.customer_email, o.total_amount,
        w.name as warehouse_name,
        u.full_name as created_by_name
      FROM returns r
      JOIN orders o ON r.order_id = o.id
      LEFT JOIN warehouses w ON r.warehouse_id = w.id
      LEFT JOIN users u ON r.created_by = u.id
      WHERE r.id = ?`,
      [id]
    );

    if (!returns.length) {
      return res.status(404).json({ success: false, message: 'Retur tidak ditemukan' });
    }

    const items = await query(
      `SELECT ri.*, 
        p.name as product_name_current,
        sz.name as size_name_current
      FROM return_items ri
      LEFT JOIN product_variants pv ON ri.product_variant_id = pv.id
      LEFT JOIN products p ON pv.product_id = p.id
      LEFT JOIN sizes sz ON pv.size_id = sz.id
      WHERE ri.return_id = ?`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...returns[0],
        items
      }
    });
  } catch (error) {
    console.error('Get return detail error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil detail retur' });
  }
};

// @desc    Get order items for return  (items from a specific order)
// @route   GET /api/returns/order/:orderId/items
// @access  Admin
const getOrderItemsForReturn = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Get order info
    const orders = await query(
      `SELECT id, order_number, customer_name, status, warehouse_id 
      FROM orders WHERE id = ?`,
      [orderId]
    );

    if (!orders.length) {
      return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });
    }

    // Get order items with returned quantities
    const items = await query(
      `SELECT oi.*, 
        pv.stock_quantity as current_stock,
        pv.warehouse_id,
        w.name as warehouse_name,
        COALESCE(
          (SELECT SUM(ri.quantity) FROM return_items ri 
           JOIN returns r ON ri.return_id = r.id 
           WHERE ri.order_item_id = oi.id AND r.status != 'cancelled'), 0
        ) as returned_quantity
      FROM order_items oi
      LEFT JOIN product_variants pv ON oi.product_variant_id = pv.id
      LEFT JOIN warehouses w ON pv.warehouse_id = w.id
      WHERE oi.order_id = ?`,
      [orderId]
    );

    // Calculate returnable quantity
    const itemsWithReturnable = items.map(item => ({
      ...item,
      returnable_quantity: item.quantity - item.returned_quantity
    }));

    res.json({
      success: true,
      data: {
        order: orders[0],
        items: itemsWithReturnable
      }
    });
  } catch (error) {
    console.error('Get order items for return error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil item order' });
  }
};

// @desc    Search orders for return
// @route   GET /api/returns/orders/search
// @access  Admin
const searchOrders = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json({ success: true, data: [] });
    }

    const orders = await query(
      `SELECT o.id, o.order_number, o.customer_name, o.status, o.total_amount, o.created_at,
        w.name as warehouse_name
      FROM orders o
      LEFT JOIN warehouses w ON o.warehouse_id = w.id
      WHERE (o.order_number LIKE ? OR o.customer_name LIKE ?)
      AND o.status IN ('delivered', 'shipped', 'processing', 'confirmed')
      ORDER BY o.created_at DESC
      LIMIT 20`,
      [`%${q}%`, `%${q}%`]
    );

    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Search orders error:', error);
    res.status(500).json({ success: false, message: 'Gagal mencari order' });
  }
};

// @desc    Create return (langsung masuk gudang + update stok)
// @route   POST /api/returns
// @access  Admin
const createReturn = async (req, res) => {
  try {
    const { order_id, warehouse_id, items, notes } = req.body;

    if (!order_id || !warehouse_id || !items || !items.length) {
      return res.status(400).json({
        success: false,
        message: 'Order, gudang, dan item retur harus diisi'
      });
    }

    // Validate order exists
    const orders = await query('SELECT id, order_number, status FROM orders WHERE id = ?', [order_id]);
    if (!orders.length) {
      return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });
    }

    // Validate warehouse exists
    const warehouses = await query('SELECT id, name FROM warehouses WHERE id = ? AND is_active = 1', [warehouse_id]);
    if (!warehouses.length) {
      return res.status(404).json({ success: false, message: 'Gudang tidak ditemukan atau tidak aktif' });
    }

    const returnNumber = generateReturnNumber();

    await transaction(async (conn) => {
      // Create return record
      const [returnResult] = await conn.execute(
        `INSERT INTO returns (return_number, order_id, warehouse_id, status, notes, total_items, created_by)
        VALUES (?, ?, ?, 'completed', ?, ?, ?)`,
        [returnNumber, order_id, warehouse_id, notes || `Retur dari order ${orders[0].order_number}`, items.length, req.user.id]
      );

      const returnId = returnResult.insertId;

      for (const item of items) {
        if (!item.order_item_id || !item.product_variant_id || !item.quantity || item.quantity <= 0) {
          throw new Error('Data item retur tidak valid');
        }

        // Validate order item belongs to the order
        const [orderItems] = await conn.execute(
          'SELECT id, quantity, product_name, size_name FROM order_items WHERE id = ? AND order_id = ?',
          [item.order_item_id, order_id]
        );
        if (!orderItems.length) {
          throw new Error(`Item order #${item.order_item_id} tidak ditemukan`);
        }

        // Check already returned quantity
        const [returnedResult] = await conn.execute(
          `SELECT COALESCE(SUM(ri.quantity), 0) as returned
          FROM return_items ri
          JOIN returns r ON ri.return_id = r.id
          WHERE ri.order_item_id = ? AND r.status != 'cancelled'`,
          [item.order_item_id]
        );
        const alreadyReturned = returnedResult[0]?.returned || 0;
        const maxReturnable = orderItems[0].quantity - alreadyReturned;

        if (item.quantity > maxReturnable) {
          throw new Error(`Jumlah retur untuk "${orderItems[0].product_name}" melebihi batas (maks: ${maxReturnable})`);
        }

        // Insert return item
        await conn.execute(
          `INSERT INTO return_items (return_id, order_item_id, product_variant_id, product_name, size_name, quantity, reason)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [returnId, item.order_item_id, item.product_variant_id, 
           orderItems[0].product_name, orderItems[0].size_name,
           item.quantity, item.reason || 'Retur barang']
        );

        // Restore stock to warehouse (update product_variants)
        await conn.execute(
          'UPDATE product_variants SET stock_quantity = stock_quantity + ? WHERE id = ?',
          [item.quantity, item.product_variant_id]
        );

        // Record inventory movement (stock history)
        await conn.execute(
          `INSERT INTO inventory_movements 
          (product_variant_id, type, quantity, cost_price, reference_type, reference_id, notes, created_by)
          VALUES (?, 'in', ?, (SELECT cost_price FROM product_variants WHERE id = ?), 'return', ?, ?, ?)`,
          [item.product_variant_id, item.quantity, item.product_variant_id, returnId,
           `Retur dari order ${orders[0].order_number} - ${item.reason || 'Retur barang'}`, req.user.id]
        );
      }
    });

    // Log activity
    await logActivity(
      req.user.id, 'create_return', 'returns', null,
      `Membuat retur ${returnNumber} dari order ${orders[0].order_number} ke gudang ${warehouses[0].name}`,
      req, { return_number: returnNumber, order_id, warehouse_id, items_count: items.length }
    );

    res.status(201).json({
      success: true,
      message: `Retur ${returnNumber} berhasil dibuat. Stok telah dikembalikan ke gudang.`,
      data: { return_number: returnNumber }
    });
  } catch (error) {
    console.error('Create return error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Gagal membuat retur'
    });
  }
};

// @desc    Cancel return (reverse stock)
// @route   PUT /api/returns/:id/cancel
// @access  Admin
const cancelReturn = async (req, res) => {
  try {
    const { id } = req.params;

    const returns = await query(
      'SELECT r.*, o.order_number FROM returns r JOIN orders o ON r.order_id = o.id WHERE r.id = ?',
      [id]
    );
    if (!returns.length) {
      return res.status(404).json({ success: false, message: 'Retur tidak ditemukan' });
    }
    if (returns[0].status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Retur sudah dibatalkan' });
    }

    const returnItems = await query(
      'SELECT * FROM return_items WHERE return_id = ?', [id]
    );

    await transaction(async (conn) => {
      // Reverse stock for each item
      for (const item of returnItems) {
        await conn.execute(
          'UPDATE product_variants SET stock_quantity = stock_quantity - ? WHERE id = ?',
          [item.quantity, item.product_variant_id]
        );

        // Record inventory movement (stock out - reversal)
        await conn.execute(
          `INSERT INTO inventory_movements 
          (product_variant_id, type, quantity, cost_price, reference_type, reference_id, notes, created_by)
          VALUES (?, 'out', ?, (SELECT cost_price FROM product_variants WHERE id = ?), 'return_cancelled', ?, ?, ?)`,
          [item.product_variant_id, item.quantity, item.product_variant_id, id,
           `Pembatalan retur ${returns[0].return_number}`, req.user.id]
        );
      }

      // Update return status
      await conn.execute(
        'UPDATE returns SET status = ? WHERE id = ?',
        ['cancelled', id]
      );
    });

    await logActivity(
      req.user.id, 'cancel_return', 'returns', id,
      `Membatalkan retur ${returns[0].return_number}`, req, {}
    );

    res.json({
      success: true,
      message: 'Retur berhasil dibatalkan, stok telah dikurangi kembali'
    });
  } catch (error) {
    console.error('Cancel return error:', error);
    res.status(500).json({ success: false, message: 'Gagal membatalkan retur' });
  }
};

module.exports = {
  getReturns,
  getReturnDetail,
  getOrderItemsForReturn,
  searchOrders,
  createReturn,
  cancelReturn
};
