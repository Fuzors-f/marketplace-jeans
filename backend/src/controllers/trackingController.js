const { query, transaction } = require('../config/database');
const { logActivity } = require('../middleware/activityLogger');

// Status mapping for display
const STATUS_TITLES = {
  pending: 'Pesanan Dibuat',
  confirmed: 'Pesanan Dikonfirmasi',
  processing: 'Sedang Diproses',
  packed: 'Pesanan Dikemas',
  shipped: 'Pesanan Dikirim',
  in_transit: 'Dalam Perjalanan',
  out_for_delivery: 'Sedang Diantar',
  delivered: 'Pesanan Diterima',
  cancelled: 'Pesanan Dibatalkan'
};

// @desc    Get order tracking by order number (public)
// @route   GET /api/tracking/:orderNumber
// @access  Public
exports.getOrderTracking = async (req, res) => {
  try {
    const { orderNumber } = req.params;

    // Get order info
    const orders = await query(
      `SELECT 
        o.id, o.order_number, o.status, o.payment_status,
        o.customer_name, o.shipping_address, o.shipping_city, o.shipping_province,
        o.shipping_method, o.tracking_number, o.courier,
        o.subtotal, o.shipping_cost, o.tax, o.discount_amount, o.total,
        o.created_at, o.updated_at,
        w.name as warehouse_name, w.city as warehouse_city
      FROM orders o
      LEFT JOIN warehouses w ON o.warehouse_id = w.id
      WHERE o.order_number = ? OR o.id = ?`,
      [orderNumber, orderNumber]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pesanan tidak ditemukan. Pastikan nomor pesanan benar.'
      });
    }

    const order = orders[0];

    // Get order items
    const items = await query(
      `SELECT 
        oi.product_name, oi.size_name, oi.quantity, oi.price, oi.total,
        (SELECT image_url FROM product_images WHERE product_id = oi.product_id AND is_primary = true LIMIT 1) as product_image
      FROM order_items oi
      WHERE oi.order_id = ?`,
      [order.id]
    );

    // Get tracking history
    const tracking = await query(
      `SELECT 
        t.id, t.status, t.title, t.description, t.location, t.created_at,
        u.full_name as updated_by
      FROM order_tracking t
      LEFT JOIN users u ON t.created_by = u.id
      WHERE t.order_id = ?
      ORDER BY t.created_at DESC`,
      [order.id]
    );

    // If no tracking history, create initial entry from order status
    if (tracking.length === 0) {
      tracking.push({
        id: 0,
        status: 'pending',
        title: STATUS_TITLES['pending'],
        description: 'Pesanan telah berhasil dibuat',
        location: null,
        created_at: order.created_at,
        updated_by: null
      });
    }

    res.json({
      success: true,
      data: {
        order: {
          id: order.id,
          order_number: order.order_number,
          status: order.status,
          payment_status: order.payment_status,
          customer_name: order.customer_name,
          shipping_address: order.shipping_address,
          shipping_city: order.shipping_city,
          shipping_province: order.shipping_province,
          shipping_method: order.shipping_method,
          tracking_number: order.tracking_number,
          courier: order.courier,
          warehouse_name: order.warehouse_name,
          warehouse_city: order.warehouse_city,
          subtotal: order.subtotal,
          shipping_cost: order.shipping_cost,
          tax: order.tax,
          discount_amount: order.discount_amount,
          total: order.total,
          created_at: order.created_at
        },
        items,
        tracking
      }
    });
  } catch (error) {
    console.error('Get order tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data tracking',
      error: error.message
    });
  }
};

// @desc    Add tracking update (Admin)
// @route   POST /api/tracking/:orderId
// @access  Private (Admin)
exports.addTrackingUpdate = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, title, description, location } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status wajib diisi'
      });
    }

    // Verify order exists
    const orders = await query('SELECT id, order_number, status FROM orders WHERE id = ?', [orderId]);
    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pesanan tidak ditemukan'
      });
    }

    const order = orders[0];
    const displayTitle = title || STATUS_TITLES[status] || status;

    await transaction(async (conn) => {
      // Insert tracking record
      await conn.execute(
        `INSERT INTO order_tracking (order_id, status, title, description, location, created_by)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [orderId, status, displayTitle, description || null, location || null, req.user.id]
      );

      // Update order status
      await conn.execute(
        'UPDATE orders SET status = ? WHERE id = ?',
        [status, orderId]
      );
    });

    await logActivity(req.user.id, 'add_tracking', 'order', orderId, 
      `Tracking update: ${displayTitle}`, req);

    res.status(201).json({
      success: true,
      message: 'Tracking berhasil ditambahkan',
      data: {
        order_id: orderId,
        status,
        title: displayTitle
      }
    });
  } catch (error) {
    console.error('Add tracking update error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan tracking',
      error: error.message
    });
  }
};

// @desc    Get tracking history for an order (Admin)
// @route   GET /api/tracking/order/:orderId
// @access  Private (Admin)
exports.getTrackingHistory = async (req, res) => {
  try {
    const { orderId } = req.params;

    const tracking = await query(
      `SELECT 
        t.id, t.status, t.title, t.description, t.location, t.created_at,
        u.full_name as updated_by
      FROM order_tracking t
      LEFT JOIN users u ON t.created_by = u.id
      WHERE t.order_id = ?
      ORDER BY t.created_at DESC`,
      [orderId]
    );

    res.json({
      success: true,
      data: tracking
    });
  } catch (error) {
    console.error('Get tracking history error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil riwayat tracking',
      error: error.message
    });
  }
};

// @desc    Delete tracking entry (Admin)
// @route   DELETE /api/tracking/:id
// @access  Private (Admin)
exports.deleteTrackingEntry = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query('DELETE FROM order_tracking WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tracking entry tidak ditemukan'
      });
    }

    res.json({
      success: true,
      message: 'Tracking entry berhasil dihapus'
    });
  } catch (error) {
    console.error('Delete tracking entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus tracking entry',
      error: error.message
    });
  }
};

// @desc    Get status options
// @route   GET /api/tracking/statuses
// @access  Public
exports.getStatusOptions = async (req, res) => {
  try {
    const statuses = Object.entries(STATUS_TITLES).map(([key, value]) => ({
      value: key,
      label: value
    }));

    res.json({
      success: true,
      data: statuses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
