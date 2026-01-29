const { query, transaction } = require('../config/database');
const midtransService = require('../services/midtransService');
const emailService = require('../services/emailService');

// @desc    Create payment with Midtrans Snap
// @route   POST /api/payments/create
// @access  Private / Public (guest)
exports.createPayment = async (req, res) => {
  try {
    const { order_id, payment_method = 'snap' } = req.body;

    // Get order details with shipping
    const orders = await query(
      `SELECT o.*, u.email, u.full_name, u.phone,
              os.recipient_name, os.phone as shipping_phone, 
              os.address as shipping_address, os.city as shipping_city,
              os.province as shipping_province, os.postal_code as shipping_postal_code
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       LEFT JOIN order_shipping os ON o.id = os.order_id
       WHERE o.id = ?`,
      [order_id]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const order = orders[0];

    // Check if payment already exists and not failed
    const existingPayment = await query(
      `SELECT * FROM payments WHERE order_id = ? AND status NOT IN ('failed', 'expired')`,
      [order_id]
    );

    if (existingPayment.length > 0) {
      // Return existing payment if still valid
      const existing = existingPayment[0];
      if (existing.snap_token || existing.payment_url) {
        return res.json({
          success: true,
          message: 'Existing payment found',
          data: {
            payment_id: existing.id,
            snap_token: existing.snap_token,
            payment_url: existing.payment_url,
            amount: existing.amount
          }
        });
      }
    }

    // Get order items
    const items = await query(
      `SELECT * FROM order_items WHERE order_id = ?`,
      [order_id]
    );

    // Prepare customer details
    const customerDetails = {
      name: order.full_name || order.recipient_name || 'Customer',
      email: order.email || order.guest_email,
      phone: order.phone || order.shipping_phone,
      address: order.shipping_address,
      city: order.shipping_city,
      postal_code: order.shipping_postal_code,
      shipping_name: order.recipient_name,
      shipping_phone: order.shipping_phone,
      shipping_address: order.shipping_address,
      shipping_city: order.shipping_city,
      shipping_postal_code: order.shipping_postal_code
    };

    // Check if Midtrans is enabled
    const midtransEnabled = await midtransService.isMidtransEnabled();

    let snapToken = null;
    let paymentUrl = null;
    let transactionId = null;
    let responseData = null;

    if (midtransEnabled && payment_method === 'snap') {
      // Create Snap transaction
      const snapResult = await midtransService.createSnapTransaction(order, items, customerDetails);

      if (snapResult.success) {
        snapToken = snapResult.token;
        paymentUrl = snapResult.redirect_url;
        transactionId = snapResult.order_id;
        responseData = JSON.stringify(snapResult);
      } else {
        console.error('Midtrans Snap error:', snapResult.error);
      }
    }

    // Insert payment record
    const result = await query(
      `INSERT INTO payments 
      (order_id, payment_method, payment_gateway, transaction_id, amount, 
       snap_token, payment_url, response_data, expired_at)
      VALUES (?, ?, 'midtrans', ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))`,
      [order_id, payment_method, transactionId, order.total_amount, 
       snapToken, paymentUrl, responseData]
    );

    res.status(201).json({
      success: true,
      message: 'Payment created',
      data: {
        payment_id: result.insertId,
        transaction_id: transactionId,
        snap_token: snapToken,
        payment_url: paymentUrl,
        amount: order.total_amount,
        midtrans_enabled: midtransEnabled
      }
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment',
      error: error.message
    });
  }
};

// @desc    Create payment with direct charge (bank transfer, etc.)
// @route   POST /api/payments/charge
// @access  Private / Public (guest)
exports.createDirectCharge = async (req, res) => {
  try {
    const { order_id, payment_type, bank_code } = req.body;

    // Get order details
    const orders = await query(
      `SELECT o.*, u.email, u.full_name, u.phone
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.id = ?`,
      [order_id]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const order = orders[0];

    // Check if Midtrans is enabled
    const midtransEnabled = await midtransService.isMidtransEnabled();

    if (!midtransEnabled) {
      return res.status(400).json({
        success: false,
        message: 'Midtrans payment is not enabled'
      });
    }

    // Create direct charge
    const chargeResult = await midtransService.createDirectCharge(order, payment_type, bank_code);

    if (!chargeResult.success) {
      return res.status(400).json({
        success: false,
        message: chargeResult.error
      });
    }

    const chargeData = chargeResult.data;

    // Insert payment record
    const result = await query(
      `INSERT INTO payments 
      (order_id, payment_method, payment_gateway, transaction_id, amount, 
       va_number, response_data, expired_at)
      VALUES (?, ?, 'midtrans', ?, ?, ?, ?, ?)`,
      [
        order_id, 
        payment_type + (bank_code ? '_' + bank_code : ''), 
        chargeData.transaction_id,
        order.total_amount, 
        chargeData.va_numbers?.[0]?.va_number || chargeData.bill_key || null,
        JSON.stringify(chargeData),
        chargeData.expiry_time || null
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Payment created',
      data: {
        payment_id: result.insertId,
        transaction_id: chargeData.transaction_id,
        payment_type: payment_type,
        va_number: chargeData.va_numbers?.[0]?.va_number,
        bill_key: chargeData.bill_key,
        biller_code: chargeData.biller_code,
        qr_string: chargeData.qr_string,
        amount: order.total_amount,
        expiry_time: chargeData.expiry_time
      }
    });
  } catch (error) {
    console.error('Create direct charge error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment',
      error: error.message
    });
  }
};

// @desc    Midtrans payment notification (webhook)
// @route   POST /api/payments/notification
// @access  Public
exports.paymentNotification = async (req, res) => {
  try {
    const notification = req.body;

    console.log('Received Midtrans notification:', notification);

    // Verify and process notification
    const processResult = await midtransService.processNotification(notification);

    if (!processResult.success) {
      console.error('Failed to process notification:', processResult.error);
      return res.status(400).json({
        success: false,
        message: processResult.error
      });
    }

    const { orderId, paymentStatus, orderStatus, rawData } = processResult;

    // Get payment record by order number
    const payments = await query(
      `SELECT p.*, o.id as order_id, o.order_number, o.user_id, o.guest_email,
              u.email as user_email
       FROM payments p
       JOIN orders o ON p.order_id = o.id
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.order_number = ?`,
      [orderId]
    );

    if (payments.length === 0) {
      console.log('Payment not found for order:', orderId);
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    const payment = payments[0];

    await transaction(async (conn) => {
      // Update payment status
      await conn.execute(
        `UPDATE payments 
         SET status = ?, paid_at = ?, response_data = ?
         WHERE id = ?`,
        [
          paymentStatus,
          paymentStatus === 'success' ? new Date() : null,
          JSON.stringify(rawData),
          payment.id
        ]
      );

      // Update order payment status
      const dbPaymentStatus = paymentStatus === 'success' ? 'paid' : paymentStatus;
      await conn.execute(
        `UPDATE orders SET payment_status = ? WHERE id = ?`,
        [dbPaymentStatus, payment.order_id]
      );

      // If payment success, update order status and send email
      if (paymentStatus === 'success') {
        await conn.execute(
          `UPDATE orders SET status = 'confirmed' WHERE id = ? AND status = 'pending'`,
          [payment.order_id]
        );

        // Add shipping history
        await conn.execute(
          `INSERT INTO order_shipping_history (order_id, status, title, description)
           VALUES (?, 'confirmed', 'Pembayaran Dikonfirmasi', 'Pembayaran telah berhasil dikonfirmasi')`,
          [payment.order_id]
        );
      }
    });

    // Send payment confirmation email (async)
    if (paymentStatus === 'success') {
      const orderDetails = await query(
        `SELECT o.*, os.recipient_name, os.phone, os.address, os.city, 
                os.province, os.postal_code, u.email, o.guest_email
         FROM orders o
         LEFT JOIN order_shipping os ON o.id = os.order_id
         LEFT JOIN users u ON o.user_id = u.id
         WHERE o.id = ?`,
        [payment.order_id]
      );

      if (orderDetails.length > 0) {
        emailService.sendPaymentConfirmationEmail(orderDetails[0], {
          payment_method: payment.payment_method,
          amount: payment.amount,
          paid_at: new Date()
        }).catch(err => console.error('Failed to send payment email:', err));
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Payment notification error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Check payment status
// @route   GET /api/payments/:paymentId/status
// @access  Public
exports.checkPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payments = await query(
      `SELECT p.*, o.order_number 
       FROM payments p
       JOIN orders o ON p.order_id = o.id
       WHERE p.id = ?`,
      [paymentId]
    );

    if (payments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    const payment = payments[0];

    // If payment is pending, check status from Midtrans
    if (payment.status === 'pending' && payment.payment_gateway === 'midtrans') {
      try {
        const statusResult = await midtransService.getTransactionStatus(payment.order_number);
        
        if (statusResult.success) {
          const midtransStatus = statusResult.data.transaction_status;
          let newStatus = payment.status;

          if (midtransStatus === 'settlement' || midtransStatus === 'capture') {
            newStatus = 'success';
          } else if (midtransStatus === 'expire' || midtransStatus === 'cancel' || midtransStatus === 'deny') {
            newStatus = 'failed';
          }

          // Update if status changed
          if (newStatus !== payment.status) {
            await query(
              `UPDATE payments SET status = ?, paid_at = ? WHERE id = ?`,
              [newStatus, newStatus === 'success' ? new Date() : null, payment.id]
            );
            payment.status = newStatus;
          }
        }
      } catch (err) {
        console.log('Could not check Midtrans status:', err.message);
      }
    }

    res.json({
      success: true,
      data: {
        status: payment.status,
        paid_at: payment.paid_at,
        payment_method: payment.payment_method,
        amount: payment.amount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cancel payment
// @route   POST /api/payments/:paymentId/cancel
// @access  Private
exports.cancelPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payments = await query(
      `SELECT p.*, o.order_number 
       FROM payments p
       JOIN orders o ON p.order_id = o.id
       WHERE p.id = ?`,
      [paymentId]
    );

    if (payments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    const payment = payments[0];

    if (payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending payments can be cancelled'
      });
    }

    // Cancel in Midtrans
    if (payment.payment_gateway === 'midtrans') {
      const cancelResult = await midtransService.cancelTransaction(payment.order_number);
      if (!cancelResult.success) {
        console.error('Failed to cancel in Midtrans:', cancelResult.error);
      }
    }

    // Update payment status
    await query(
      `UPDATE payments SET status = 'cancelled' WHERE id = ?`,
      [paymentId]
    );

    // Update order payment status
    await query(
      `UPDATE orders SET payment_status = 'cancelled' WHERE id = ?`,
      [payment.order_id]
    );

    res.json({
      success: true,
      message: 'Payment cancelled'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get payment by order ID
// @route   GET /api/payments/order/:orderId
// @access  Private / Public
exports.getPaymentByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const payments = await query(
      `SELECT p.*, o.order_number, o.total_amount, o.status as order_status
       FROM payments p
       JOIN orders o ON p.order_id = o.id
       WHERE p.order_id = ? OR o.order_number = ? OR o.unique_token = ?
       ORDER BY p.created_at DESC
       LIMIT 1`,
      [orderId, orderId, orderId]
    );

    if (payments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      data: payments[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
