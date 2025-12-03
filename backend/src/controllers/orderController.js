const { query, transaction } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

// Generate unique order number
const generateOrderNumber = () => {
  const date = moment().format('YYYYMMDD');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${date}-${random}`;
};

// @desc    Create order (checkout)
// @route   POST /api/orders
// @access  Private / Public (guest)
exports.createOrder = async (req, res) => {
  try {
    const {
      items, shipping_address, discount_code, notes
    } = req.body;

    const userId = req.user ? req.user.id : null;
    const guestEmail = req.body.guest_email;

    if (!userId && !guestEmail) {
      return res.status(400).json({
        success: false,
        message: 'User ID or guest email required'
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    if (!shipping_address) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address required'
      });
    }

    const orderId = await transaction(async (conn) => {
      // Calculate subtotal
      let subtotal = 0;
      const orderItems = [];

      for (const item of items) {
        const [variants] = await conn.execute(
          `SELECT pv.*, p.name, p.base_price, p.master_cost_price, s.name as size_name
           FROM product_variants pv
           JOIN products p ON pv.product_id = p.id
           JOIN sizes s ON pv.size_id = s.id
           WHERE pv.id = ? AND pv.is_active = true`,
          [item.product_variant_id]
        );

        if (variants.length === 0) {
          throw new Error(`Product variant ${item.product_variant_id} not found`);
        }

        const variant = variants[0];

        if (variant.stock_quantity < item.quantity) {
          throw new Error(`Insufficient stock for ${variant.name}`);
        }

        const unitPrice = variant.base_price + variant.additional_price;
        const itemSubtotal = unitPrice * item.quantity;
        subtotal += itemSubtotal;

        orderItems.push({
          variant_id: variant.id,
          name: variant.name,
          sku: variant.sku_variant,
          size: variant.size_name,
          quantity: item.quantity,
          unit_price: unitPrice,
          unit_cost: variant.master_cost_price,
          subtotal: itemSubtotal
        });
      }

      // Apply member discount if applicable
      let memberDiscountAmount = 0;
      if (userId && req.user.role === 'member' && req.user.member_discount > 0) {
        memberDiscountAmount = subtotal * (req.user.member_discount / 100);
      }

      // Apply discount code if provided
      let discountAmount = 0;
      if (discount_code) {
        const [discounts] = await conn.execute(
          `SELECT * FROM discounts 
           WHERE code = ? AND is_active = true 
           AND (start_date IS NULL OR start_date <= NOW())
           AND (end_date IS NULL OR end_date >= NOW())
           AND (usage_limit IS NULL OR usage_count < usage_limit)`,
          [discount_code]
        );

        if (discounts.length > 0) {
          const discount = discounts[0];
          
          if (subtotal >= (discount.min_purchase || 0)) {
            if (discount.type === 'percentage') {
              discountAmount = subtotal * (discount.value / 100);
              if (discount.max_discount && discountAmount > discount.max_discount) {
                discountAmount = discount.max_discount;
              }
            } else if (discount.type === 'fixed') {
              discountAmount = discount.value;
            }

            // Update usage count
            await conn.execute(
              'UPDATE discounts SET usage_count = usage_count + 1 WHERE id = ?',
              [discount.id]
            );
          }
        }
      }

      // Calculate shipping cost (simplified - could integrate with shipping API)
      const shippingCost = shipping_address.country === 'Indonesia' ? 20000 : 100000;

      const totalAmount = subtotal - memberDiscountAmount - discountAmount + shippingCost;

      // Create order
      const orderNumber = generateOrderNumber();
      const [orderResult] = await conn.execute(
        `INSERT INTO orders 
        (order_number, user_id, guest_email, subtotal, discount_amount, discount_code, 
         member_discount_amount, shipping_cost, total_amount, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderNumber, userId, guestEmail, subtotal, discountAmount, discount_code || null,
         memberDiscountAmount, shippingCost, totalAmount, notes || null]
      );

      const orderId = orderResult.insertId;

      // Insert order items
      for (const item of orderItems) {
        await conn.execute(
          `INSERT INTO order_items 
          (order_id, product_variant_id, product_name, product_sku, size_name, 
           quantity, unit_price, unit_cost, subtotal)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [orderId, item.variant_id, item.name, item.sku, item.size,
           item.quantity, item.unit_price, item.unit_cost, item.subtotal]
        );

        // Update stock
        await conn.execute(
          'UPDATE product_variants SET stock_quantity = stock_quantity - ? WHERE id = ?',
          [item.quantity, item.variant_id]
        );

        // Log inventory movement
        await conn.execute(
          `INSERT INTO inventory_movements 
          (product_variant_id, type, quantity, reference_type, reference_id, created_by)
          VALUES (?, 'out', ?, 'order', ?, ?)`,
          [item.variant_id, item.quantity, orderId, userId]
        );
      }

      // Insert shipping info
      await conn.execute(
        `INSERT INTO order_shipping 
        (order_id, recipient_name, phone, address, city, province, postal_code, country)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderId, shipping_address.recipient_name, shipping_address.phone,
         shipping_address.address, shipping_address.city, shipping_address.province,
         shipping_address.postal_code, shipping_address.country || 'Indonesia']
      );

      // Clear user cart if logged in
      if (userId) {
        await conn.execute(
          'DELETE ci FROM cart_items ci JOIN carts c ON ci.cart_id = c.id WHERE c.user_id = ?',
          [userId]
        );
      }

      return orderId;
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order_id: orderId }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating order'
    });
  }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE user_id = ?';
    let params = [userId];

    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    const orders = await query(
      `SELECT 
        o.id, o.order_number, o.status, o.payment_status,
        o.subtotal, o.discount_amount, o.member_discount_amount,
        o.shipping_cost, o.total_amount, o.created_at,
        os.tracking_number, os.shipped_at
      FROM orders o
      LEFT JOIN order_shipping os ON o.id = os.order_id
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;

    // Get order
    const orders = await query(
      `SELECT o.*, os.* 
       FROM orders o
       LEFT JOIN order_shipping os ON o.id = os.order_id
       WHERE o.id = ? AND (o.user_id = ? OR o.user_id IS NULL)`,
      [id, userId]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Get order items
    const items = await query(
      `SELECT * FROM order_items WHERE order_id = ?`,
      [id]
    );

    // Get payment info
    const payments = await query(
      `SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC LIMIT 1`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...orders[0],
        items,
        payment: payments.length > 0 ? payments[0] : null
      }
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private (Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    await query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);

    res.json({
      success: true,
      message: 'Order status updated'
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

// @desc    Add tracking number
// @route   PUT /api/orders/:id/tracking
// @access  Private (Admin)
exports.addTracking = async (req, res) => {
  try {
    const { id } = req.params;
    const { tracking_number, shipping_method } = req.body;

    if (!tracking_number) {
      return res.status(400).json({
        success: false,
        message: 'Tracking number required'
      });
    }

    await transaction(async (conn) => {
      await conn.execute(
        `UPDATE order_shipping 
         SET tracking_number = ?, shipping_method = ?, shipped_at = NOW()
         WHERE order_id = ?`,
        [tracking_number, shipping_method || null, id]
      );

      await conn.execute(
        `UPDATE orders SET status = 'shipped' WHERE id = ?`,
        [id]
      );
    });

    res.json({
      success: true,
      message: 'Tracking number added'
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
