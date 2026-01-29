const midtransClient = require('midtrans-client');
const { query } = require('../config/database');

// Cache for midtrans settings
let midtransSettingsCache = null;
let cacheTimestamp = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get Midtrans settings from database
 */
const getMidtransSettings = async () => {
  // Return cached settings if still valid
  if (midtransSettingsCache && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_TTL)) {
    return midtransSettingsCache;
  }

  const settings = await query(`
    SELECT setting_key, setting_value FROM settings 
    WHERE setting_key IN (
      'payment_midtrans_enabled', 'payment_midtrans_server_key',
      'payment_midtrans_client_key', 'payment_midtrans_sandbox',
      'payment_midtrans_merchant_id'
    )
  `);

  const settingsObj = {};
  settings.forEach(s => {
    settingsObj[s.setting_key] = s.setting_value;
  });

  midtransSettingsCache = settingsObj;
  cacheTimestamp = Date.now();

  return settingsObj;
};

/**
 * Clear Midtrans settings cache
 */
const clearMidtransSettingsCache = () => {
  midtransSettingsCache = null;
  cacheTimestamp = null;
};

/**
 * Check if Midtrans is enabled
 */
const isMidtransEnabled = async () => {
  const settings = await getMidtransSettings();
  return settings.payment_midtrans_enabled === 'true';
};

/**
 * Get Midtrans Snap client
 */
const getSnapClient = async () => {
  const settings = await getMidtransSettings();

  if (!settings.payment_midtrans_server_key) {
    throw new Error('Midtrans Server Key not configured');
  }

  const isProduction = settings.payment_midtrans_sandbox !== 'true';

  const snap = new midtransClient.Snap({
    isProduction: isProduction,
    serverKey: settings.payment_midtrans_server_key,
    clientKey: settings.payment_midtrans_client_key || ''
  });

  return snap;
};

/**
 * Get Midtrans Core API client
 */
const getCoreApiClient = async () => {
  const settings = await getMidtransSettings();

  if (!settings.payment_midtrans_server_key) {
    throw new Error('Midtrans Server Key not configured');
  }

  const isProduction = settings.payment_midtrans_sandbox !== 'true';

  const core = new midtransClient.CoreApi({
    isProduction: isProduction,
    serverKey: settings.payment_midtrans_server_key,
    clientKey: settings.payment_midtrans_client_key || ''
  });

  return core;
};

/**
 * Create Midtrans Snap transaction
 */
const createSnapTransaction = async (order, items, customerDetails) => {
  try {
    const snap = await getSnapClient();

    // Build item details
    const itemDetails = items.map(item => ({
      id: item.variant_id || item.id,
      price: Math.round(parseFloat(item.unit_price || item.price)),
      quantity: parseInt(item.quantity),
      name: truncateString((item.product_name || item.name) + ' - ' + (item.size_name || item.size), 50)
    }));

    // Add discount as negative item if exists
    if (order.discount_amount && parseFloat(order.discount_amount) > 0) {
      itemDetails.push({
        id: 'DISCOUNT',
        price: -Math.round(parseFloat(order.discount_amount)),
        quantity: 1,
        name: 'Discount'
      });
    }

    // Add member discount as negative item if exists
    if (order.member_discount_amount && parseFloat(order.member_discount_amount) > 0) {
      itemDetails.push({
        id: 'MEMBER_DISCOUNT',
        price: -Math.round(parseFloat(order.member_discount_amount)),
        quantity: 1,
        name: 'Member Discount'
      });
    }

    // Add shipping cost
    if (order.shipping_cost && parseFloat(order.shipping_cost) > 0) {
      itemDetails.push({
        id: 'SHIPPING',
        price: Math.round(parseFloat(order.shipping_cost)),
        quantity: 1,
        name: 'Shipping Cost'
      });
    }

    // Calculate gross amount from items
    const grossAmount = itemDetails.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const parameter = {
      transaction_details: {
        order_id: order.order_number,
        gross_amount: grossAmount
      },
      item_details: itemDetails,
      customer_details: {
        first_name: customerDetails.name || 'Customer',
        email: customerDetails.email || '',
        phone: customerDetails.phone || '',
        billing_address: {
          first_name: customerDetails.name || 'Customer',
          phone: customerDetails.phone || '',
          address: customerDetails.address || '',
          city: customerDetails.city || '',
          postal_code: customerDetails.postal_code || '',
          country_code: 'IDN'
        },
        shipping_address: {
          first_name: customerDetails.shipping_name || customerDetails.name || 'Customer',
          phone: customerDetails.shipping_phone || customerDetails.phone || '',
          address: customerDetails.shipping_address || customerDetails.address || '',
          city: customerDetails.shipping_city || customerDetails.city || '',
          postal_code: customerDetails.shipping_postal_code || customerDetails.postal_code || '',
          country_code: 'IDN'
        }
      },
      callbacks: {
        finish: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/order/${order.unique_token}?payment=success`,
        error: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/order/${order.unique_token}?payment=error`,
        pending: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/order/${order.unique_token}?payment=pending`
      },
      expiry: {
        start_time: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' +0700',
        unit: 'hours',
        duration: 24
      }
    };

    const transaction = await snap.createTransaction(parameter);

    return {
      success: true,
      token: transaction.token,
      redirect_url: transaction.redirect_url,
      order_id: order.order_number
    };
  } catch (error) {
    console.error('Create Snap transaction error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Create direct charge (for bank transfer, e-wallets, etc.)
 */
const createDirectCharge = async (order, paymentType, bankCode = null) => {
  try {
    const core = await getCoreApiClient();

    const parameter = {
      payment_type: paymentType,
      transaction_details: {
        order_id: order.order_number,
        gross_amount: Math.round(parseFloat(order.total_amount))
      }
    };

    // Add bank transfer specific parameters
    if (paymentType === 'bank_transfer') {
      if (bankCode === 'bca') {
        parameter.bank_transfer = { bank: 'bca' };
      } else if (bankCode === 'bni') {
        parameter.bank_transfer = { bank: 'bni' };
      } else if (bankCode === 'bri') {
        parameter.bank_transfer = { bank: 'bri' };
      } else if (bankCode === 'mandiri') {
        parameter.payment_type = 'echannel';
        parameter.echannel = {
          bill_info1: 'Payment:',
          bill_info2: order.order_number
        };
      } else if (bankCode === 'permata') {
        parameter.bank_transfer = { bank: 'permata' };
      }
    }

    // Add QRIS parameters
    if (paymentType === 'qris') {
      parameter.qris = { acquirer: 'gopay' };
    }

    // Add GoPay parameters
    if (paymentType === 'gopay') {
      parameter.gopay = {
        enable_callback: true,
        callback_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/order/${order.unique_token}`
      };
    }

    const chargeResponse = await core.charge(parameter);

    return {
      success: true,
      data: chargeResponse
    };
  } catch (error) {
    console.error('Create direct charge error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get transaction status from Midtrans
 */
const getTransactionStatus = async (orderId) => {
  try {
    const core = await getCoreApiClient();
    const status = await core.transaction.status(orderId);
    return {
      success: true,
      data: status
    };
  } catch (error) {
    console.error('Get transaction status error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Cancel transaction
 */
const cancelTransaction = async (orderId) => {
  try {
    const core = await getCoreApiClient();
    const response = await core.transaction.cancel(orderId);
    return {
      success: true,
      data: response
    };
  } catch (error) {
    console.error('Cancel transaction error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Expire transaction (force pending to expire)
 */
const expireTransaction = async (orderId) => {
  try {
    const core = await getCoreApiClient();
    const response = await core.transaction.expire(orderId);
    return {
      success: true,
      data: response
    };
  } catch (error) {
    console.error('Expire transaction error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Verify Midtrans notification signature
 */
const verifyNotificationSignature = async (notification) => {
  try {
    const settings = await getMidtransSettings();
    const serverKey = settings.payment_midtrans_server_key;

    const { order_id, status_code, gross_amount, signature_key } = notification;

    // Calculate expected signature
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHash('sha512')
      .update(order_id + status_code + gross_amount + serverKey)
      .digest('hex');

    return signature_key === expectedSignature;
  } catch (error) {
    console.error('Verify signature error:', error);
    return false;
  }
};

/**
 * Process Midtrans notification
 */
const processNotification = async (notification) => {
  try {
    const core = await getCoreApiClient();
    
    // Get status from Midtrans to verify
    const statusResponse = await core.transaction.notification(notification);

    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;
    const paymentType = statusResponse.payment_type;

    let paymentStatus = 'pending';
    let orderStatus = null;

    if (transactionStatus === 'capture') {
      if (fraudStatus === 'accept') {
        paymentStatus = 'success';
        orderStatus = 'confirmed';
      } else if (fraudStatus === 'challenge') {
        paymentStatus = 'challenge';
      }
    } else if (transactionStatus === 'settlement') {
      paymentStatus = 'success';
      orderStatus = 'confirmed';
    } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
      paymentStatus = 'failed';
    } else if (transactionStatus === 'pending') {
      paymentStatus = 'pending';
    } else if (transactionStatus === 'refund') {
      paymentStatus = 'refunded';
    }

    return {
      success: true,
      orderId: orderId,
      paymentStatus: paymentStatus,
      orderStatus: orderStatus,
      transactionStatus: transactionStatus,
      paymentType: paymentType,
      rawData: statusResponse
    };
  } catch (error) {
    console.error('Process notification error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get client key for frontend
 */
const getClientKey = async () => {
  const settings = await getMidtransSettings();
  const isProduction = settings.payment_midtrans_sandbox !== 'true';
  
  return {
    clientKey: settings.payment_midtrans_client_key || '',
    isProduction: isProduction,
    snapUrl: isProduction 
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js'
  };
};

/**
 * Truncate string to max length
 */
const truncateString = (str, maxLength) => {
  if (!str) return '';
  return str.length > maxLength ? str.substring(0, maxLength - 3) + '...' : str;
};

module.exports = {
  getMidtransSettings,
  clearMidtransSettingsCache,
  isMidtransEnabled,
  getSnapClient,
  getCoreApiClient,
  createSnapTransaction,
  createDirectCharge,
  getTransactionStatus,
  cancelTransaction,
  expireTransaction,
  verifyNotificationSignature,
  processNotification,
  getClientKey
};
