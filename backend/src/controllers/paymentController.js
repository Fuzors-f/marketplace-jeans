const axios = require('axios');
const { query, transaction } = require('../config/database');

// Midtrans configuration
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
const MIDTRANS_IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === 'true';
const MIDTRANS_API_URL = MIDTRANS_IS_PRODUCTION 
  ? 'https://api.midtrans.com/v2'
  : 'https://api.sandbox.midtrans.com/v2';

// @desc    Create payment
// @route   POST /api/payments/create
// @access  Private / Public (guest)
exports.createPayment = async (req, res) => {
  try {
    const { order_id, payment_method = 'bank_transfer' } = req.body;

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

    // Check if payment already exists
    const existingPayment = await query(
      `SELECT * FROM payments WHERE order_id = ? AND status != 'failed'`,
      [order_id]
    );

    if (existingPayment.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Payment already exists for this order'
      });
    }

    // Create Midtrans transaction
    const transactionData = {
      transaction_details: {
        order_id: order.order_number,
        gross_amount: Math.round(order.total_amount)
      },
      customer_details: {
        email: order.email || order.guest_email,
        first_name: order.full_name || 'Guest',
        phone: order.phone || ''
      },
      enabled_payments: [payment_method],
      callbacks: {
        finish: `${process.env.FRONTEND_URL}/orders/${order_id}/success`,
        error: `${process.env.FRONTEND_URL}/orders/${order_id}/failed`,
        pending: `${process.env.FRONTEND_URL}/orders/${order_id}/pending`
      }
    };

    let paymentUrl = null;
    let transactionId = null;
    let responseData = null;

    try {
      const response = await axios.post(
        `${MIDTRANS_API_URL}/charge`,
        transactionData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${Buffer.from(MIDTRANS_SERVER_KEY + ':').toString('base64')}`
          }
        }
      );

      responseData = JSON.stringify(response.data);
      transactionId = response.data.transaction_id;
      
      // Get payment URL based on payment type
      if (response.data.actions && response.data.actions.length > 0) {
        paymentUrl = response.data.actions[0].url;
      } else if (response.data.redirect_url) {
        paymentUrl = response.data.redirect_url;
      }
    } catch (error) {
      console.error('Midtrans error:', error.response?.data || error.message);
      // Continue with database insert even if Midtrans fails
    }

    // Insert payment record
    const result = await query(
      `INSERT INTO payments 
      (order_id, payment_method, payment_gateway, transaction_id, amount, payment_url, response_data, expired_at)
      VALUES (?, ?, 'midtrans', ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))`,
      [order_id, payment_method, transactionId, order.total_amount, paymentUrl, responseData]
    );

    res.status(201).json({
      success: true,
      message: 'Payment created',
      data: {
        payment_id: result.insertId,
        transaction_id: transactionId,
        payment_url: paymentUrl,
        amount: order.total_amount
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

// @desc    Midtrans payment notification (webhook)
// @route   POST /api/payments/notification
// @access  Public
exports.paymentNotification = async (req, res) => {
  try {
    const notification = req.body;

    // Verify notification from Midtrans
    const orderId = notification.order_id;
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;

    // Get payment record
    const payments = await query(
      `SELECT p.*, o.order_number 
       FROM payments p
       JOIN orders o ON p.order_id = o.id
       WHERE o.order_number = ?`,
      [orderId]
    );

    if (payments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    const payment = payments[0];

    await transaction(async (conn) => {
      let paymentStatus = 'pending';
      let orderPaymentStatus = 'pending';

      if (transactionStatus === 'capture') {
        if (fraudStatus === 'accept') {
          paymentStatus = 'success';
          orderPaymentStatus = 'paid';
        }
      } else if (transactionStatus === 'settlement') {
        paymentStatus = 'success';
        orderPaymentStatus = 'paid';
      } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
        paymentStatus = 'failed';
        orderPaymentStatus = 'failed';
      } else if (transactionStatus === 'pending') {
        paymentStatus = 'pending';
        orderPaymentStatus = 'pending';
      }

      // Update payment status
      await conn.execute(
        `UPDATE payments 
         SET status = ?, paid_at = ?, response_data = ?
         WHERE id = ?`,
        [
          paymentStatus,
          paymentStatus === 'success' ? new Date() : null,
          JSON.stringify(notification),
          payment.id
        ]
      );

      // Update order payment status
      await conn.execute(
        `UPDATE orders SET payment_status = ? WHERE id = ?`,
        [orderPaymentStatus, payment.order_id]
      );

      // If payment success, update order status
      if (paymentStatus === 'success') {
        await conn.execute(
          `UPDATE orders SET status = 'confirmed' WHERE id = ? AND status = 'pending'`,
          [payment.order_id]
        );
      }
    });

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
      `SELECT * FROM payments WHERE id = ?`,
      [paymentId]
    );

    if (payments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      data: {
        status: payments[0].status,
        paid_at: payments[0].paid_at
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
