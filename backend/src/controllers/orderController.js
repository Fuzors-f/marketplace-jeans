const { query, transaction } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const crypto = require('crypto');
const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const { logActivity } = require('../middleware/activityLogger');
const { sendOrderConfirmationEmail, sendOrderStatusEmail, sendAdminOrderNotificationEmail, isUserNotificationEnabled } = require('../services/emailService');
const { applyCouponToOrder } = require('./couponController');

// Generate unique order number
const generateOrderNumber = () => {
  const date = moment().format('YYYYMMDD');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${date}-${random}`;
};

// Generate unique token for shareable URL
const generateUniqueToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Get base URL for order tracking
const getOrderTrackingUrl = (uniqueToken) => {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  return `${baseUrl}/order/${uniqueToken}`;
};

// @desc    Create order (checkout)
// @route   POST /api/orders
// @access  Private / Public (guest)
exports.createOrder = async (req, res) => {
  try {
    const {
      items, shipping_address, discount_code, coupon_code, coupon_id, notes, payment_method,
      shipping_cost_id, courier, shipping_method
    } = req.body;

    const userId = req.user ? req.user.id : null;
    const guestEmail = req.body.guest_email;
    
    // Support both discount_code (legacy) and coupon_code (new frontend)
    const effectiveDiscountCode = discount_code || coupon_code || null;

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

    // Guest user validation - require complete address
    if (!userId) {
      if (!shipping_address.recipient_name) {
        return res.status(400).json({
          success: false,
          message: 'Nama penerima harus diisi untuk tamu'
        });
      }
      if (!shipping_address.phone) {
        return res.status(400).json({
          success: false,
          message: 'Nomor telepon harus diisi untuk tamu'
        });
      }
      if (!shipping_address.address) {
        return res.status(400).json({
          success: false,
          message: 'Alamat lengkap harus diisi untuk tamu'
        });
      }
      if (!shipping_address.city) {
        return res.status(400).json({
          success: false,
          message: 'Kota harus diisi untuk tamu'
        });
      }
      if (!shipping_address.province) {
        return res.status(400).json({
          success: false,
          message: 'Provinsi harus diisi untuk tamu'
        });
      }
    }

    const orderData = await transaction(async (conn) => {
      // Calculate subtotal
      let subtotal = 0;
      const orderItems = [];

      for (const item of items) {
        const [variants] = await conn.execute(
          `SELECT pv.*, p.name, p.base_price, p.master_cost_price, 
                  p.discount_percentage, p.discount_start_date, p.discount_end_date,
                  s.name as size_name
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
          throw new Error(`Stok tidak cukup untuk ${variant.name} (tersisa: ${variant.stock_quantity})`);
        }

        // Calculate unit price considering product-level discount
        let basePrice = parseFloat(variant.base_price);
        const now = new Date();
        const hasProductDiscount = variant.discount_percentage > 0
          && (!variant.discount_start_date || new Date(variant.discount_start_date) <= now)
          && (!variant.discount_end_date || new Date(variant.discount_end_date) >= now);

        if (hasProductDiscount) {
          basePrice = Math.round(basePrice * (1 - variant.discount_percentage / 100));
        }

        const unitPrice = basePrice + parseFloat(variant.additional_price || 0);
        const itemSubtotal = unitPrice * item.quantity;
        subtotal += itemSubtotal;

        orderItems.push({
          variant_id: variant.id,
          product_id: variant.product_id,
          name: variant.name,
          sku: variant.sku_variant,
          size: variant.size_name,
          size_id: variant.size_id,
          quantity: item.quantity,
          unit_price: unitPrice,
          unit_cost: variant.master_cost_price || variant.cost_price || 0,
          subtotal: itemSubtotal
        });
      }

      // Apply member discount if applicable
      let memberDiscountAmount = 0;
      if (userId && req.user && req.user.role === 'member' && req.user.member_discount > 0) {
        memberDiscountAmount = Math.round(subtotal * (req.user.member_discount / 100));
      }

      // Apply coupon/discount code if provided (server re-validates, never trust client amount)
      let discountAmount = 0;
      let appliedCouponId = null;
      let appliedDiscountCode = effectiveDiscountCode;

      if (effectiveDiscountCode) {
        // First try coupons table (new system)
        const [coupons] = await conn.execute(
          `SELECT * FROM coupons 
           WHERE code = ? AND is_active = true
           AND (start_date IS NULL OR start_date <= NOW())
           AND (end_date IS NULL OR end_date >= NOW())
           AND (usage_limit IS NULL OR usage_count < usage_limit)`,
          [effectiveDiscountCode.toUpperCase()]
        );

        if (coupons.length > 0) {
          const coupon = coupons[0];
          
          // Check per-user limit
          let canUseCoupon = true;
          if (coupon.usage_limit_per_user) {
            let userUsageCount = 0;
            if (userId) {
              const [userUsage] = await conn.execute(
                'SELECT COUNT(*) as count FROM coupon_usages WHERE coupon_id = ? AND user_id = ?',
                [coupon.id, userId]
              );
              userUsageCount = userUsage[0].count;
            } else if (guestEmail) {
              const [guestUsage] = await conn.execute(
                'SELECT COUNT(*) as count FROM coupon_usages WHERE coupon_id = ? AND guest_email = ?',
                [coupon.id, guestEmail]
              );
              userUsageCount = guestUsage[0].count;
            }
            if (userUsageCount >= coupon.usage_limit_per_user) {
              canUseCoupon = false;
            }
          }

          if (canUseCoupon && subtotal >= (coupon.min_purchase || 0)) {
            if (coupon.discount_type === 'percentage') {
              discountAmount = Math.round(subtotal * (coupon.discount_value / 100));
              if (coupon.max_discount && discountAmount > coupon.max_discount) {
                discountAmount = coupon.max_discount;
              }
            } else {
              discountAmount = coupon.discount_value;
              if (discountAmount > subtotal) {
                discountAmount = subtotal;
              }
            }
            appliedCouponId = coupon.id;
          }
        } else {
          // Fallback: try discounts table (legacy system)
          const [discounts] = await conn.execute(
            `SELECT * FROM discounts 
             WHERE code = ? AND is_active = true 
             AND (start_date IS NULL OR start_date <= NOW())
             AND (end_date IS NULL OR end_date >= NOW())
             AND (usage_limit IS NULL OR usage_count < usage_limit)`,
            [effectiveDiscountCode]
          );

          if (discounts.length > 0) {
            const discount = discounts[0];
            
            if (subtotal >= (discount.min_purchase || 0)) {
              if (discount.type === 'percentage') {
                discountAmount = Math.round(subtotal * (discount.value / 100));
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
      }

      // Calculate shipping cost from frontend-selected option, or use fallback
      let shippingCost = 0;
      if (shipping_cost_id) {
        // Fetch actual shipping cost from database to prevent client-side tampering
        const [shippingCosts] = await conn.execute(
          'SELECT * FROM shipping_costs WHERE id = ?',
          [shipping_cost_id]
        );
        if (shippingCosts.length > 0) {
          // parseFloat required: mysql2 returns decimal columns as strings
          shippingCost = parseFloat(shippingCosts[0].calculated_cost || shippingCosts[0].cost) || 0;
        }
      }
      // Fallback: if no shipping cost found, use basic calculation
      if (!shippingCost || shippingCost <= 0) {
        shippingCost = parseFloat(req.body.shipping_cost) || (shipping_address.country === 'Indonesia' ? 20000 : 100000);
      }

      // Calculate tax (11% PPN on subtotal after discounts)
      const taxableAmount = subtotal - memberDiscountAmount - discountAmount;
      const tax = Math.round(taxableAmount > 0 ? taxableAmount * 0.11 : 0);

      const totalAmount = subtotal - memberDiscountAmount - discountAmount + shippingCost + tax;

      // Create order with unique token
      const orderNumber = generateOrderNumber();
      const uniqueToken = generateUniqueToken();
      
      const [orderResult] = await conn.execute(
        `INSERT INTO orders 
        (order_number, unique_token, user_id, guest_email, status, subtotal, discount_amount, discount_code, 
         member_discount_amount, shipping_cost, tax, total_amount, notes, payment_method, courier, shipping_method,
         shipping_cost_id, coupon_id, coupon_code, coupon_discount,
         customer_name, customer_email, customer_phone)
        VALUES (?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderNumber, uniqueToken, userId || null, guestEmail || null, subtotal, discountAmount, appliedDiscountCode,
         memberDiscountAmount, shippingCost, tax, totalAmount, notes || null, payment_method || 'bank_transfer',
         courier || null, shipping_method || null,
         shipping_cost_id || null, appliedCouponId || null, appliedDiscountCode || null, discountAmount || 0,
         shipping_address.recipient_name || null, guestEmail || null, shipping_address.phone || null]
      );

      const orderId = orderResult.insertId;

      // Insert order items
      for (const item of orderItems) {
        await conn.execute(
          `INSERT INTO order_items 
          (order_id, product_id, product_variant_id, size_id, product_name, product_sku, size_name, 
           quantity, unit_price, unit_cost, subtotal)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [orderId, item.product_id, item.variant_id, item.size_id || null, 
           item.name || '', item.sku || '', item.size || '',
           item.quantity, item.unit_price, item.unit_cost || 0, item.subtotal]
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
          [item.variant_id, item.quantity, orderId, userId || null]
        );
      }

      // Insert shipping info
      await conn.execute(
        `INSERT INTO order_shipping 
        (order_id, recipient_name, phone, address, city, province, postal_code, country)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderId, shipping_address.recipient_name || '', shipping_address.phone || '',
         shipping_address.address || '', shipping_address.city || '', shipping_address.province || '',
         shipping_address.postal_code || '', shipping_address.country || 'Indonesia']
      );

      // If guest user, insert guest order details with complete address info
      if (!userId) {
        await conn.execute(
          `INSERT INTO guest_order_details 
          (order_id, guest_name, guest_email, guest_phone, address, city, province, postal_code, country, latitude, longitude, address_notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [orderId, shipping_address.recipient_name || '', guestEmail || null, shipping_address.phone || '',
           shipping_address.address || '', shipping_address.city || '', shipping_address.province || '',
           shipping_address.postal_code || '', shipping_address.country || 'Indonesia',
           shipping_address.latitude || null, shipping_address.longitude || null,
           shipping_address.address_notes || null]
        );
      }

      // Insert initial shipping history
      await conn.execute(
        `INSERT INTO order_shipping_history (order_id, status, title, description, created_by)
         VALUES (?, 'pending', 'Pesanan Dibuat', 'Pesanan berhasil dibuat dan menunggu persetujuan', ?)`,
        [orderId, userId || null]
      );

      // Clear user cart if logged in
      if (userId) {
        await conn.execute(
          'DELETE ci FROM cart_items ci JOIN carts c ON ci.cart_id = c.id WHERE c.user_id = ?',
          [userId]
        );
      }

      // Record coupon usage if a coupon was applied
      if (appliedCouponId && discountAmount > 0) {
        await conn.execute(
          `INSERT INTO coupon_usages (coupon_id, user_id, guest_email, order_id, discount_amount)
           VALUES (?, ?, ?, ?, ?)`,
          [appliedCouponId, userId || null, guestEmail || null, orderId, discountAmount]
        );
        await conn.execute(
          'UPDATE coupons SET usage_count = usage_count + 1 WHERE id = ?',
          [appliedCouponId]
        );
      }

      return { orderId, orderNumber, uniqueToken, orderItems };
    });

    // Generate tracking URL
    const trackingUrl = getOrderTrackingUrl(orderData.uniqueToken);

    // Log activity
    await logActivity(userId, 'create_order', 'order', orderData.orderId, 
      `Created order ${orderData.orderNumber}`, req, 
      { order_number: orderData.orderNumber, tracking_url: trackingUrl });

    // Send order confirmation emails (async, don't wait)
    const orderForEmail = await query(
      `SELECT o.*, u.email, u.full_name
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.id = ?`,
      [orderData.orderId]
    );

    if (orderForEmail.length > 0) {
      const orderData_email = orderForEmail[0];
      const customerInfo = {
        email: orderData_email.email || guestEmail,
        name: orderData_email.full_name || shipping_address.recipient_name,
        phone: shipping_address.phone
      };

      // Send email to customer (if enabled)
      isUserNotificationEnabled().then(enabled => {
        if (enabled) {
          sendOrderConfirmationEmail(
            orderData_email, 
            orderData.orderItems, 
            shipping_address
          ).catch(err => console.error('Failed to send customer order email:', err));
        }
      });

      // Send notification email to admin
      sendAdminOrderNotificationEmail(
        orderData_email,
        orderData.orderItems,
        shipping_address,
        customerInfo
      ).catch(err => console.error('Failed to send admin notification email:', err));
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { 
        order_id: orderData.orderId,
        order_number: orderData.orderNumber,
        unique_token: orderData.uniqueToken,
        tracking_url: trackingUrl
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating order'
    });
  }
};

// @desc    Get order by unique token (public access)
// @route   GET /api/orders/track/:token
// @access  Public
exports.getOrderByToken = async (req, res) => {
  try {
    const { token } = req.params;

    const orders = await query(
      `SELECT 
        o.id, o.order_number, o.unique_token, o.status, o.payment_status, o.payment_method,
        o.subtotal, o.discount_amount, o.shipping_cost, o.total_amount as total,
        o.guest_email as customer_email, o.notes, 
        o.approved_at, o.created_at, o.updated_at,
        os.recipient_name as customer_name, os.phone as customer_phone,
        os.address as shipping_address, os.city as shipping_city, 
        os.province as shipping_province, os.postal_code as shipping_postal_code,
        os.shipping_method, os.tracking_number,
        os.recipient_name, os.phone as shipping_phone, os.address as full_address,
        p.payment_proof
      FROM orders o
      LEFT JOIN order_shipping os ON o.id = os.order_id
      LEFT JOIN payments p ON o.id = p.order_id
      WHERE o.unique_token = ?`,
      [token]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pesanan tidak ditemukan'
      });
    }

    const order = orders[0];

    // Get order items
    const items = await query(
      `SELECT 
        oi.id, oi.quantity, oi.unit_price as price, oi.subtotal as total, oi.product_name, oi.size_name,
        pv.product_id,
        (SELECT slug FROM products WHERE id = pv.product_id LIMIT 1) as product_slug,
        (SELECT image_url FROM product_images WHERE product_id = pv.product_id AND is_primary = true LIMIT 1) as product_image
      FROM order_items oi
      LEFT JOIN product_variants pv ON oi.product_variant_id = pv.id
      WHERE oi.order_id = ?`,
      [order.id]
    );

    // Get shipping history
    const shippingHistory = await query(
      `SELECT 
        osh.id, osh.status, osh.title, osh.description, osh.location, osh.created_at,
        u.full_name as updated_by
      FROM order_shipping_history osh
      LEFT JOIN users u ON osh.created_by = u.id
      WHERE osh.order_id = ?
      ORDER BY osh.created_at DESC`,
      [order.id]
    );

    // Generate QR code URL
    const trackingUrl = getOrderTrackingUrl(token);

    res.json({
      success: true,
      data: {
        order: {
          ...order,
          tracking_url: trackingUrl
        },
        items,
        tracking: shippingHistory
      }
    });
  } catch (error) {
    console.error('Get order by token error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
};

// @desc    Generate QR Code for order
// @route   GET /api/orders/:id/qrcode
// @access  Private/Public
exports.generateQRCode = async (req, res) => {
  try {
    const { id } = req.params;
    const { format = 'png' } = req.query; // png or svg

    // Get order token
    const orders = await query(
      'SELECT unique_token, order_number FROM orders WHERE id = ? OR unique_token = ?',
      [id, id]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const order = orders[0];
    const trackingUrl = getOrderTrackingUrl(order.unique_token);

    if (format === 'svg') {
      const svg = await QRCode.toString(trackingUrl, { type: 'svg' });
      res.setHeader('Content-Type', 'image/svg+xml');
      res.send(svg);
    } else {
      const qrBuffer = await QRCode.toBuffer(trackingUrl, {
        errorCorrectionLevel: 'H',
        type: 'png',
        margin: 2,
        scale: 8
      });
      
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `attachment; filename="qr-${order.order_number}.png"`);
      res.send(qrBuffer);
    }
  } catch (error) {
    console.error('Generate QR code error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating QR code',
      error: error.message
    });
  }
};

// @desc    Get QR Code as base64 for display
// @route   GET /api/orders/:id/qrcode-data
// @access  Private/Public
exports.getQRCodeData = async (req, res) => {
  try {
    const { id } = req.params;

    // Get order token
    const orders = await query(
      'SELECT unique_token, order_number FROM orders WHERE id = ? OR unique_token = ?',
      [id, id]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const order = orders[0];
    const trackingUrl = getOrderTrackingUrl(order.unique_token);

    const qrDataUrl = await QRCode.toDataURL(trackingUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 2,
      scale: 8
    });

    res.json({
      success: true,
      data: {
        order_number: order.order_number,
        tracking_url: trackingUrl,
        qr_code: qrDataUrl
      }
    });
  } catch (error) {
    console.error('Get QR code data error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating QR code',
      error: error.message
    });
  }
};

// @desc    Generate PDF Invoice
// @route   GET /api/orders/:id/invoice
// @access  Private/Public
exports.generateInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    // Get order details
    const orders = await query(
      `SELECT 
        o.*, 
        os.recipient_name, os.phone as shipping_phone, os.address as full_address,
        os.city as ship_city, os.province as ship_province, os.postal_code as ship_postal_code,
        w.name as warehouse_name, w.address as warehouse_address, w.city as warehouse_city
      FROM orders o
      LEFT JOIN order_shipping os ON o.id = os.order_id
      LEFT JOIN warehouses w ON o.warehouse_id = w.id
      WHERE o.id = ? OR o.unique_token = ?`,
      [id, id]
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
        oi.id, oi.quantity, oi.unit_price as price, oi.subtotal as total, oi.product_name, oi.product_sku, oi.size_name
      FROM order_items oi
      WHERE oi.order_id = ?`,
      [order.id]
    );

    // Get taxes and discounts
    const taxes = await query('SELECT * FROM order_taxes WHERE order_id = ?', [order.id]);
    const discounts = await query('SELECT * FROM order_discounts WHERE order_id = ?', [order.id]);

    // Create PDF document
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${order.order_number}.pdf"`);
    
    // Pipe PDF to response
    doc.pipe(res);

    // Header
    doc.fontSize(20).text('INVOICE', { align: 'center' });
    doc.moveDown();
    
    // Company info
    doc.fontSize(12).text('Marketplace Jeans', { align: 'center' });
    doc.fontSize(10).text('www.marketplacejeans.com', { align: 'center' });
    doc.moveDown();

    // Order info
    doc.fontSize(10);
    doc.text(`Invoice No: ${order.order_number}`);
    doc.text(`Tanggal: ${moment(order.created_at).format('DD MMMM YYYY, HH:mm')}`);
    doc.text(`Status: ${order.status.toUpperCase()}`);
    if (order.tracking_number) {
      doc.text(`No. Resi: ${order.tracking_number}`);
    }
    doc.moveDown();

    // Shipping info
    doc.fontSize(11).text('Alamat Pengiriman:', { underline: true });
    doc.fontSize(10);
    doc.text(order.recipient_name || order.customer_name);
    doc.text(order.full_address || order.shipping_address);
    doc.text(`${order.ship_city || order.shipping_city}, ${order.ship_province || order.shipping_province}`);
    doc.text(`Telp: ${order.shipping_phone || order.customer_phone}`);
    doc.moveDown();

    // Table header
    const tableTop = doc.y;
    const tableHeaders = ['No', 'Produk', 'Ukuran', 'Qty', 'Harga', 'Total'];
    const columnWidths = [30, 200, 50, 40, 80, 90];
    let xPosition = 50;

    doc.fontSize(10).font('Helvetica-Bold');
    tableHeaders.forEach((header, i) => {
      doc.text(header, xPosition, tableTop, { width: columnWidths[i], align: i >= 3 ? 'right' : 'left' });
      xPosition += columnWidths[i];
    });

    // Draw line
    doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).stroke();

    // Table rows
    doc.font('Helvetica');
    let yPosition = tableTop + 25;
    
    items.forEach((item, index) => {
      xPosition = 50;
      const rowData = [
        (index + 1).toString(),
        item.product_name,
        item.size_name || '-',
        item.quantity.toString(),
        formatCurrencyPDF(item.price),
        formatCurrencyPDF(item.total)
      ];
      
      rowData.forEach((data, i) => {
        doc.text(data, xPosition, yPosition, { width: columnWidths[i], align: i >= 3 ? 'right' : 'left' });
        xPosition += columnWidths[i];
      });
      yPosition += 20;
    });

    // Draw line
    doc.moveTo(50, yPosition).lineTo(545, yPosition).stroke();
    yPosition += 10;

    // Totals
    const totalsX = 380;
    doc.text('Subtotal:', totalsX, yPosition);
    doc.text(formatCurrencyPDF(order.subtotal), 455, yPosition, { width: 90, align: 'right' });
    yPosition += 15;

    doc.text('Ongkos Kirim:', totalsX, yPosition);
    doc.text(formatCurrencyPDF(order.shipping_cost), 455, yPosition, { width: 90, align: 'right' });
    yPosition += 15;

    // Show taxes if any
    if (order.tax && order.tax > 0) {
      doc.text('Pajak:', totalsX, yPosition);
      doc.text(formatCurrencyPDF(order.tax), 455, yPosition, { width: 90, align: 'right' });
      yPosition += 15;
    }

    taxes.forEach(tax => {
      doc.text(`${tax.description}:`, totalsX, yPosition);
      doc.text(formatCurrencyPDF(tax.amount), 455, yPosition, { width: 90, align: 'right' });
      yPosition += 15;
    });

    // Show discounts if any
    if (order.discount_amount > 0) {
      doc.text('Diskon:', totalsX, yPosition);
      doc.text(`-${formatCurrencyPDF(order.discount_amount)}`, 455, yPosition, { width: 90, align: 'right' });
      yPosition += 15;
    }

    discounts.forEach(discount => {
      doc.text(`${discount.description}:`, totalsX, yPosition);
      doc.text(`-${formatCurrencyPDF(discount.amount)}`, 455, yPosition, { width: 90, align: 'right' });
      yPosition += 15;
    });

    // Grand total
    doc.moveTo(380, yPosition).lineTo(545, yPosition).stroke();
    yPosition += 10;
    doc.font('Helvetica-Bold');
    doc.text('TOTAL:', totalsX, yPosition);
    doc.text(formatCurrencyPDF(order.total || order.total_amount), 455, yPosition, { width: 90, align: 'right' });

    // Footer
    yPosition = doc.page.height - 100;
    doc.font('Helvetica').fontSize(9);
    doc.text('Terima kasih telah berbelanja di Marketplace Jeans!', 50, yPosition, { align: 'center', width: 495 });
    doc.text(`Invoice ini dibuat secara otomatis pada ${moment().format('DD/MM/YYYY HH:mm')}`, 50, yPosition + 15, { align: 'center', width: 495 });

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('Generate invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating invoice',
      error: error.message
    });
  }
};

// Helper function to format currency for PDF
const formatCurrencyPDF = (amount) => {
  return 'Rp ' + (amount || 0).toLocaleString('id-ID');
};

// @desc    Admin approve order (change from pending to processing)
// @route   PUT /api/orders/:id/approve
// @access  Private (Admin)
exports.approveOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    const { notes } = req.body;

    // Get current order
    const orders = await query('SELECT * FROM orders WHERE id = ?', [id]);
    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const order = orders[0];

    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending orders can be approved'
      });
    }

    await transaction(async (conn) => {
      // Update order status
      await conn.execute(
        `UPDATE orders SET status = 'confirmed', approved_at = NOW(), approved_by = ? WHERE id = ?`,
        [adminId, id]
      );

      // Add shipping history entry
      await conn.execute(
        `INSERT INTO order_shipping_history (order_id, status, title, description, created_by)
         VALUES (?, 'confirmed', 'Pesanan Disetujui', ?, ?)`,
        [id, notes || 'Pesanan telah disetujui oleh admin dan sedang diproses', adminId]
      );
    });

    res.json({
      success: true,
      message: 'Pesanan berhasil disetujui'
    });
  } catch (error) {
    console.error('Approve order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving order',
      error: error.message
    });
  }
};

// @desc    Admin add shipping history update
// @route   POST /api/orders/:id/shipping-history
// @access  Private (Admin)
exports.addShippingHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    const { status, title, description, location, update_order_status } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    // Validate order exists
    const orders = await query('SELECT * FROM orders WHERE id = ?', [id]);
    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    await transaction(async (conn) => {
      // Add shipping history entry
      await conn.execute(
        `INSERT INTO order_shipping_history (order_id, status, title, description, location, created_by)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, status || 'update', title, description || null, location || null, adminId]
      );

      // Update order status if requested
      if (update_order_status && status) {
        await conn.execute(
          'UPDATE orders SET status = ? WHERE id = ?',
          [status, id]
        );

        // Update shipped_at or delivered_at
        if (status === 'shipped') {
          await conn.execute(
            'UPDATE order_shipping SET shipped_at = NOW() WHERE order_id = ?',
            [id]
          );
        } else if (status === 'delivered') {
          await conn.execute(
            'UPDATE order_shipping SET delivered_at = NOW() WHERE order_id = ?',
            [id]
          );
        }
      }
    });

    res.json({
      success: true,
      message: 'Riwayat pengiriman berhasil ditambahkan'
    });
  } catch (error) {
    console.error('Add shipping history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding shipping history',
      error: error.message
    });
  }
};

// @desc    Get shipping history for order
// @route   GET /api/orders/:id/shipping-history
// @access  Private/Public
exports.getShippingHistory = async (req, res) => {
  try {
    const { id } = req.params;

    // Support both id and token
    const orders = await query(
      'SELECT id FROM orders WHERE id = ? OR unique_token = ?',
      [id, id]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const orderId = orders[0].id;

    const history = await query(
      `SELECT 
        osh.id, osh.status, osh.title, osh.description, osh.location, osh.created_at,
        u.full_name as updated_by
      FROM order_shipping_history osh
      LEFT JOIN users u ON osh.created_by = u.id
      WHERE osh.order_id = ?
      ORDER BY osh.created_at DESC`,
      [orderId]
    );

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Get shipping history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shipping history',
      error: error.message
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

    let whereClause = 'WHERE o.user_id = ?';
    let params = [userId];

    if (status && status !== 'all') {
      whereClause += ' AND o.status = ?';
      params.push(status);
    }

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM orders o ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    const orders = await query(
      `SELECT 
        o.id, o.order_number, o.unique_token, o.status, o.payment_status,
        o.subtotal, o.discount_amount, o.shipping_cost, o.total_amount as total,
        o.notes, o.created_at,
        os.recipient_name as customer_name, os.phone as customer_phone, os.address as shipping_address,
        os.city as shipping_city, os.province as shipping_province, os.shipping_method, os.tracking_number
      FROM orders o
      LEFT JOIN order_shipping os ON o.id = os.order_id
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    // Get items for each order
    for (let order of orders) {
      const items = await query(
        `SELECT 
          oi.id, oi.quantity, oi.unit_price as price, oi.subtotal as total,
          oi.product_name, oi.product_sku, oi.size_name,
          pv.product_id,
          (SELECT image_url FROM product_images WHERE product_id = pv.product_id AND is_primary = true LIMIT 1) as product_image,
          (SELECT slug FROM products WHERE id = pv.product_id LIMIT 1) as product_slug
        FROM order_items oi
        LEFT JOIN product_variants pv ON oi.product_variant_id = pv.id
        WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
      order.tracking_url = getOrderTrackingUrl(order.unique_token);
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
// @access  Private/Public (with order number)
exports.getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;

    // Get order
    const orders = await query(
      `SELECT 
        o.id, o.order_number, o.unique_token, o.user_id, o.guest_email, o.status, o.payment_status,
        o.subtotal, o.discount_amount, o.shipping_cost, o.total_amount as total,
        o.notes, o.approved_at, o.approved_by, o.created_at, o.updated_at,
        os.recipient_name as customer_name, os.phone as customer_phone, os.address as shipping_address,
        os.city as shipping_city, os.province as shipping_province, os.postal_code as shipping_postal_code,
        os.shipping_method, os.tracking_number, os.country
      FROM orders o
      LEFT JOIN order_shipping os ON o.id = os.order_id
      WHERE o.id = ? ${userId ? 'AND (o.user_id = ? OR o.user_id IS NULL)' : ''}`,
      userId ? [id, userId] : [id]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const order = orders[0];

    // Get order items with product details
    const items = await query(
      `SELECT 
        oi.id, oi.quantity, oi.unit_price as price, oi.subtotal as total,
        oi.product_name, oi.product_sku, oi.size_name,
        pv.product_id, pv.size_id,
        (SELECT slug FROM products WHERE id = pv.product_id LIMIT 1) as product_slug,
        (SELECT image_url FROM product_images WHERE product_id = pv.product_id AND is_primary = true LIMIT 1) as product_image
      FROM order_items oi
      LEFT JOIN product_variants pv ON oi.product_variant_id = pv.id
      WHERE oi.order_id = ?`,
      [id]
    );

    // Get payment info
    const payments = await query(
      `SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC LIMIT 1`,
      [id]
    );

    // Get shipping history
    const shippingHistory = await query(
      `SELECT 
        osh.id, osh.status, osh.title, osh.description, osh.location, osh.created_at,
        u.full_name as updated_by
      FROM order_shipping_history osh
      LEFT JOIN users u ON osh.created_by = u.id
      WHERE osh.order_id = ?
      ORDER BY osh.created_at DESC`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...order,
        tracking_url: getOrderTrackingUrl(order.unique_token),
        items,
        payment: payments.length > 0 ? payments[0] : null,
        shipping_history: shippingHistory
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
    const { status, notes } = req.body;
    const adminId = req.user.id;

    const validStatuses = ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const statusTitles = {
      pending: 'Menunggu Persetujuan',
      confirmed: 'Pesanan Dikonfirmasi',
      processing: 'Pesanan Diproses',
      packed: 'Pesanan Dikemas',
      shipped: 'Pesanan Dikirim',
      in_transit: 'Dalam Perjalanan',
      out_for_delivery: 'Sedang Diantar',
      delivered: 'Pesanan Diterima',
      cancelled: 'Pesanan Dibatalkan'
    };

    await transaction(async (conn) => {
      // Get current order status to validate transition
      const [currentOrders] = await conn.execute('SELECT status FROM orders WHERE id = ?', [id]);
      if (currentOrders.length === 0) {
        throw new Error('Order not found');
      }
      const currentStatus = currentOrders[0].status;

      // Prevent cancelling already delivered/shipped orders
      if (status === 'cancelled' && ['delivered', 'shipped', 'in_transit', 'out_for_delivery'].includes(currentStatus)) {
        throw new Error('Tidak dapat membatalkan pesanan yang sudah dikirim atau diterima');
      }

      // Prevent updating already cancelled orders
      if (currentStatus === 'cancelled') {
        throw new Error('Tidak dapat mengubah status pesanan yang sudah dibatalkan');
      }

      await conn.execute('UPDATE orders SET status = ? WHERE id = ?', [status, id]);

      // Add shipping history entry
      await conn.execute(
        `INSERT INTO order_shipping_history (order_id, status, title, description, created_by)
         VALUES (?, ?, ?, ?, ?)`,
        [id, status, statusTitles[status], notes || null, adminId]
      );

      // Update timestamps
      if (status === 'shipped') {
        await conn.execute('UPDATE order_shipping SET shipped_at = NOW() WHERE order_id = ?', [id]);
      } else if (status === 'delivered') {
        await conn.execute('UPDATE order_shipping SET delivered_at = NOW() WHERE order_id = ?', [id]);
      }

      // Restore stock when order is cancelled
      if (status === 'cancelled') {
        const [orderItems] = await conn.execute(
          'SELECT product_variant_id, quantity FROM order_items WHERE order_id = ?',
          [id]
        );

        for (const item of orderItems) {
          // Restore stock quantity
          await conn.execute(
            'UPDATE product_variants SET stock_quantity = stock_quantity + ? WHERE id = ?',
            [item.quantity, item.product_variant_id]
          );

          // Log inventory movement (stock return)
          await conn.execute(
            `INSERT INTO inventory_movements 
            (product_variant_id, type, quantity, reference_type, reference_id, notes, created_by)
            VALUES (?, 'in', ?, 'order_cancelled', ?, 'Stok dikembalikan karena pesanan dibatalkan', ?)`,
            [item.product_variant_id, item.quantity, id, adminId]
          );
        }

        // Restore coupon usage if coupon was used
        const [orderInfo] = await conn.execute(
          'SELECT discount_code, discount_amount, user_id, guest_email FROM orders WHERE id = ?',
          [id]
        );
        if (orderInfo.length > 0 && orderInfo[0].discount_code) {
          // Restore coupon usage count
          await conn.execute(
            'UPDATE coupons SET usage_count = GREATEST(usage_count - 1, 0) WHERE code = ?',
            [orderInfo[0].discount_code]
          );
          // Remove coupon usage record
          await conn.execute(
            'DELETE FROM coupon_usages WHERE order_id = ?',
            [id]
          );
          // Also restore discount usage count (legacy)
          await conn.execute(
            'UPDATE discounts SET usage_count = GREATEST(usage_count - 1, 0) WHERE code = ?',
            [orderInfo[0].discount_code]
          );
        }
      }
    });

    // Send status update email (async)
    const orderDetails = await query(
      `SELECT o.*, u.email, o.guest_email
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.id = ?`,
      [id]
    );
    
    if (orderDetails.length > 0) {
      sendOrderStatusEmail(orderDetails[0], status, notes).catch(err => {
        console.error('Failed to send order status email:', err);
      });
    }

    // Log activity
    await logActivity(adminId, 'update_order', 'order', id, 
      `Updated order status to ${status}`, req, { status, notes });

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
    const { tracking_number, shipping_method, courier } = req.body;
    const adminId = req.user.id;

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
        `UPDATE orders SET status = 'shipped', tracking_number = ?, courier = ? WHERE id = ?`,
        [tracking_number, courier || null, id]
      );

      // Add shipping history entry
      await conn.execute(
        `INSERT INTO order_shipping_history (order_id, status, title, description, created_by)
         VALUES (?, 'shipped', 'Pesanan Dikirim', ?, ?)`,
        [id, `No. Resi: ${tracking_number}${courier ? ` (${courier})` : ''}`, adminId]
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

// @desc    Upload payment proof for bank transfer
// @route   POST /api/orders/:id/payment-proof
// @access  Public (optionalAuth - guest or authenticated)
exports.uploadPaymentProof = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || null;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'File bukti pembayaran wajib diunggah'
      });
    }

    // Verify order exists and belongs to user (or is guest order)
    const orders = await query(
      'SELECT o.id, o.user_id, o.payment_method, o.unique_token FROM orders o WHERE o.id = ?',
      [id]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const order = orders[0];

    // Check ownership: either the user owns it, or it's a guest order (user_id is null)
    if (order.user_id && userId && order.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const paymentProofPath = `/uploads/payments/${req.file.filename}`;

    // Update or insert payment record
    const existingPayment = await query(
      'SELECT id FROM payments WHERE order_id = ?',
      [id]
    );

    if (existingPayment.length > 0) {
      await query(
        'UPDATE payments SET payment_proof = ?, updated_at = NOW() WHERE order_id = ?',
        [paymentProofPath, id]
      );
    } else {
      await query(
        `INSERT INTO payments (order_id, payment_method, amount, status, payment_proof, created_at, updated_at)
         SELECT id, payment_method, total_amount, 'pending', ?, NOW(), NOW() FROM orders WHERE id = ?`,
        [paymentProofPath, id]
      );
    }

    res.json({
      success: true,
      message: 'Bukti pembayaran berhasil diunggah',
      data: { payment_proof: paymentProofPath }
    });
  } catch (error) {
    console.error('Upload payment proof error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading payment proof',
      error: error.message
    });
  }
};

// @desc    Upload payment proof by order token (for guest users)
// @route   POST /api/orders/track/:token/payment-proof
// @access  Public
exports.uploadPaymentProofByToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'File bukti pembayaran wajib diunggah'
      });
    }

    const orders = await query(
      'SELECT id, payment_method FROM orders WHERE unique_token = ?',
      [token]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const order = orders[0];
    const paymentProofPath = `/uploads/payments/${req.file.filename}`;

    const existingPayment = await query(
      'SELECT id FROM payments WHERE order_id = ?',
      [order.id]
    );

    if (existingPayment.length > 0) {
      await query(
        'UPDATE payments SET payment_proof = ?, updated_at = NOW() WHERE order_id = ?',
        [paymentProofPath, order.id]
      );
    } else {
      await query(
        `INSERT INTO payments (order_id, payment_method, amount, status, payment_proof, created_at, updated_at)
         SELECT id, payment_method, total_amount, 'pending', ?, NOW(), NOW() FROM orders WHERE id = ?`,
        [paymentProofPath, order.id]
      );
    }

    res.json({
      success: true,
      message: 'Bukti pembayaran berhasil diunggah',
      data: { payment_proof: paymentProofPath }
    });
  } catch (error) {
    console.error('Upload payment proof by token error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading payment proof',
      error: error.message
    });
  }
};
