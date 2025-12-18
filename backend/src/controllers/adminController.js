const { query, transaction } = require('../config/database');
const { logActivity } = require('../middleware/activityLogger');

// @desc    Get all orders for admin
// @route   GET /api/admin/orders
// @access  Private (Admin)
exports.getAdminOrders = async (req, res) => {
  try {
    const {
      status,
      payment_status,
      search,
      date_from,
      date_to,
      page = 1,
      limit = 20,
      sort = 'created_at',
      order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = [];
    let params = [];

    if (status && status !== 'all') {
      whereConditions.push('o.status = ?');
      params.push(status);
    }

    if (payment_status && payment_status !== 'all') {
      whereConditions.push('o.payment_status = ?');
      params.push(payment_status);
    }

    if (search) {
      whereConditions.push('(o.id LIKE ? OR o.customer_name LIKE ? OR o.customer_email LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (date_from) {
      whereConditions.push('o.created_at >= ?');
      params.push(date_from);
    }

    if (date_to) {
      whereConditions.push('o.created_at <= ?');
      params.push(date_to + ' 23:59:59');
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Validate sort column
    const validSortColumns = ['id', 'created_at', 'total', 'status', 'payment_status'];
    const sortColumn = validSortColumns.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM orders o ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // Get orders with user info
    const orders = await query(
      `SELECT 
        o.id, o.user_id, o.status, o.payment_status, o.payment_method,
        o.subtotal, o.shipping_cost, o.discount_amount, o.tax, o.total,
        o.customer_name, o.customer_email, o.customer_phone,
        o.shipping_address, o.shipping_city, o.shipping_province,
        o.shipping_postal_code, o.shipping_method, o.tracking_number,
        o.notes, o.created_at, o.updated_at,
        u.name as user_name, u.email as user_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ${whereClause}
      ORDER BY o.${sortColumn} ${sortOrder}
      LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    // Get order items for each order
    for (let order of orders) {
      const items = await query(
        `SELECT 
          oi.id, oi.quantity, oi.price, oi.total,
          p.name as product_name, p.slug as product_slug,
          s.name as size_name,
          (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as product_image
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        LEFT JOIN sizes s ON oi.size_id = s.id
        WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    res.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get admin orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// @desc    Get single order detail for admin
// @route   GET /api/admin/orders/:id
// @access  Private (Admin)
exports.getAdminOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const orders = await query(
      `SELECT 
        o.*, 
        u.name as user_name, u.email as user_email,
        p.transaction_id, p.payment_method as payment_method_detail, 
        p.amount as payment_amount, p.status as payment_detail_status,
        p.paid_at
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN payments p ON o.id = p.order_id
      WHERE o.id = ?`,
      [id]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const order = orders[0];

    // Get order items
    const items = await query(
      `SELECT 
        oi.*, 
        p.name as product_name, p.slug as product_slug,
        s.name as size_name,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as product_image
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      LEFT JOIN sizes s ON oi.size_id = s.id
      WHERE oi.order_id = ?`,
      [id]
    );

    // Get order history/logs
    const history = await query(
      `SELECT 
        al.action, al.description, al.created_at,
        u.name as performed_by
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE al.entity_type = 'order' AND al.entity_id = ?
      ORDER BY al.created_at DESC`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...order,
        items,
        history
      }
    });
  } catch (error) {
    console.error('Get admin order detail error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order detail',
      error: error.message
    });
  }
};

// @desc    Update order status (with stock management)
// @route   PATCH /api/admin/orders/:id/status
// @access  Private (Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Get current order
    const currentOrder = await query('SELECT status, user_id FROM orders WHERE id = ?', [id]);
    if (currentOrder.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const previousStatus = currentOrder[0].status;

    // Handle stock management for cancelled orders
    if (status === 'cancelled' && previousStatus !== 'cancelled') {
      await transaction(async (conn) => {
        // Get order items
        const items = await query(
          'SELECT product_variant_id, quantity FROM order_items WHERE order_id = ?',
          [id]
        );

        // Return stock for each item
        for (const item of items) {
          if (item.product_variant_id) {
            // Increase stock back
            await conn.execute(
              'UPDATE product_variants SET stock_quantity = stock_quantity + ? WHERE id = ?',
              [item.quantity, item.product_variant_id]
            );

            // Log inventory movement
            await conn.execute(
              `INSERT INTO inventory_movements 
              (product_variant_id, type, quantity, reference_type, reference_id, notes, created_by)
              VALUES (?, 'in', ?, 'order_cancelled', ?, 'Stock returned from cancelled order', ?)`,
              [item.product_variant_id, item.quantity, id, req.user.id]
            );
          }
        }

        // Update order status
        await conn.execute(
          'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
          [status, id]
        );
      });
    } else {
      // Just update status
      await query(
        'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
        [status, id]
      );
    }

    await logActivity(req.user.id, 'update_order_status', 'order', id,
      `Status changed from ${previousStatus} to ${status}${notes ? ': ' + notes : ''}`, req);

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { id, status, previous_status: previousStatus }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error.message
    });
  }
};

// @desc    Update payment status
// @route   PATCH /api/admin/orders/:id/payment-status
// @access  Private (Admin)
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status, notes } = req.body;

    const validStatuses = ['pending', 'paid', 'failed', 'refunded'];
    if (!validStatuses.includes(payment_status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment status'
      });
    }

    // Get current order
    const currentOrder = await query('SELECT payment_status FROM orders WHERE id = ?', [id]);
    if (currentOrder.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const previousStatus = currentOrder[0].payment_status;

    // Update payment status in orders table
    await query(
      'UPDATE orders SET payment_status = ?, updated_at = NOW() WHERE id = ?',
      [payment_status, id]
    );

    // Update payment record if exists
    await query(
      'UPDATE payments SET status = ?, paid_at = IF(? = "paid", NOW(), paid_at) WHERE order_id = ?',
      [payment_status, payment_status, id]
    );

    await logActivity(req.user.id, 'update_payment_status', 'order', id,
      `Payment status changed from ${previousStatus} to ${payment_status}${notes ? ': ' + notes : ''}`, req);

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      data: { id, payment_status, previous_status: previousStatus }
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating payment status',
      error: error.message
    });
  }
};

// @desc    Add tracking number
// @route   PUT /api/admin/orders/:id/tracking
// @access  Private (Admin)
exports.addTracking = async (req, res) => {
  try {
    const { id } = req.params;
    const { tracking_number, shipping_notes } = req.body;

    if (!tracking_number) {
      return res.status(400).json({
        success: false,
        message: 'Please provide tracking number'
      });
    }

    await query(
      `UPDATE orders SET 
        tracking_number = ?, 
        status = 'shipped',
        updated_at = NOW()
      WHERE id = ?`,
      [tracking_number, id]
    );

    // Update order shipping record if exists
    await query(
      `UPDATE order_shipping SET 
        tracking_number = ?,
        shipped_at = NOW(),
        notes = ?
      WHERE order_id = ?`,
      [tracking_number, shipping_notes || null, id]
    );

    await logActivity(req.user.id, 'add_tracking', 'order', id,
      `Added tracking number: ${tracking_number}`, req);

    res.json({
      success: true,
      message: 'Tracking number added successfully',
      data: { id, tracking_number, status: 'shipped' }
    });
  } catch (error) {
    console.error('Add tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding tracking number',
      error: error.message
    });
  }
};

// @desc    Create manual order (Admin)
// @route   POST /api/admin/orders/manual
// @access  Private (Admin)
exports.createManualOrder = async (req, res) => {
  try {
    const {
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      shipping_city,
      shipping_province,
      shipping_postal_code,
      shipping_method,
      payment_method,
      items, // [{ product_id, variant_id, quantity, price }]
      shipping_cost,
      discount_amount,
      notes
    } = req.body;

    // Validation
    if (!customer_name || !customer_phone || !shipping_address || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide customer info, address, and at least one item'
      });
    }

    const orderId = await transaction(async (conn) => {
      // Calculate totals
      let subtotal = 0;
      for (const item of items) {
        subtotal += item.price * item.quantity;
      }

      const tax = subtotal * 0.11; // 11% PPN
      const total = subtotal + (shipping_cost || 0) + tax - (discount_amount || 0);

      // Create order
      const [orderResult] = await conn.execute(
        `INSERT INTO orders 
        (user_id, status, payment_status, payment_method, subtotal, shipping_cost, discount_amount, tax, total,
         customer_name, customer_email, customer_phone, shipping_address, shipping_city, shipping_province,
         shipping_postal_code, shipping_method, notes, created_by)
        VALUES (?, 'confirmed', 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [null, payment_method || 'cash', subtotal, shipping_cost || 0, discount_amount || 0, tax, total,
         customer_name, customer_email || null, customer_phone, shipping_address, shipping_city || null,
         shipping_province || null, shipping_postal_code || null, shipping_method || 'manual',
         notes || 'Manual order created by admin', req.user.id]
      );

      const newOrderId = orderResult.insertId;

      // Create order items and update stock
      for (const item of items) {
        // Get product and size info
        let productVariantId = item.variant_id;
        let sizeId = null;

        if (productVariantId) {
          const variant = await query(
            'SELECT size_id FROM product_variants WHERE id = ?',
            [productVariantId]
          );
          if (variant.length > 0) {
            sizeId = variant[0].size_id;
          }

          // Update stock
          await conn.execute(
            'UPDATE product_variants SET stock_quantity = stock_quantity - ? WHERE id = ?',
            [item.quantity, productVariantId]
          );

          // Log inventory movement
          await conn.execute(
            `INSERT INTO inventory_movements 
            (product_variant_id, type, quantity, reference_type, reference_id, notes, created_by)
            VALUES (?, 'out', ?, 'order', ?, 'Manual order', ?)`,
            [productVariantId, item.quantity, newOrderId, req.user.id]
          );
        }

        // Insert order item
        await conn.execute(
          `INSERT INTO order_items 
          (order_id, product_id, product_variant_id, size_id, quantity, price, total)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [newOrderId, item.product_id, productVariantId, sizeId, item.quantity, item.price, item.price * item.quantity]
        );
      }

      // Create payment record
      await conn.execute(
        `INSERT INTO payments (order_id, payment_method, amount, status)
        VALUES (?, ?, ?, 'pending')`,
        [newOrderId, payment_method || 'cash', total]
      );

      return newOrderId;
    });

    await logActivity(req.user.id, 'create_manual_order', 'order', orderId,
      `Manual order created for ${customer_name}`, req);

    res.status(201).json({
      success: true,
      message: 'Manual order created successfully',
      data: { id: orderId }
    });
  } catch (error) {
    console.error('Create manual order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating manual order',
      error: error.message
    });
  }
};
