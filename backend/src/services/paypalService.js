const paypal = require('@paypal/checkout-server-sdk');
const { query } = require('../config/database');

// Cache for PayPal settings
let paypalSettingsCache = null;
let cacheTimestamp = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get PayPal settings from database
 */
const getPayPalSettings = async () => {
  if (paypalSettingsCache && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_TTL)) {
    return paypalSettingsCache;
  }

  const settings = await query(`
    SELECT setting_key, setting_value FROM settings 
    WHERE setting_key IN (
      'payment_paypal_enabled', 'payment_paypal_client_id',
      'payment_paypal_client_secret', 'payment_paypal_sandbox'
    )
  `);

  const settingsObj = {};
  settings.forEach(s => {
    settingsObj[s.setting_key] = s.setting_value;
  });

  paypalSettingsCache = settingsObj;
  cacheTimestamp = Date.now();

  return settingsObj;
};

/**
 * Clear PayPal settings cache
 */
const clearPayPalSettingsCache = () => {
  paypalSettingsCache = null;
  cacheTimestamp = null;
};

/**
 * Check if PayPal is enabled
 */
const isPayPalEnabled = async () => {
  const settings = await getPayPalSettings();
  return settings.payment_paypal_enabled === 'true';
};

/**
 * Get PayPal environment (Sandbox or Live)
 */
const getPayPalEnvironment = async () => {
  const settings = await getPayPalSettings();

  const clientId = settings.payment_paypal_client_id;
  const clientSecret = settings.payment_paypal_client_secret;

  if (!clientId || !clientSecret) {
    throw new Error('PayPal Client ID atau Client Secret belum dikonfigurasi');
  }

  const isSandbox = settings.payment_paypal_sandbox !== 'false';

  if (isSandbox) {
    return new paypal.core.SandboxEnvironment(clientId, clientSecret);
  }
  return new paypal.core.LiveEnvironment(clientId, clientSecret);
};

/**
 * Get PayPal HTTP client
 */
const getPayPalClient = async () => {
  const environment = await getPayPalEnvironment();
  return new paypal.core.PayPalHttpClient(environment);
};

/**
 * Get client ID for frontend
 */
const getClientConfig = async () => {
  const settings = await getPayPalSettings();
  const isSandbox = settings.payment_paypal_sandbox !== 'false';

  return {
    clientId: settings.payment_paypal_client_id || '',
    isSandbox
  };
};

/**
 * Create PayPal order
 */
const createPayPalOrder = async (order, items) => {
  try {
    const client = await getPayPalClient();

    // Convert IDR to USD (approximate rate, or use a fixed rate from settings)
    // PayPal doesn't support IDR directly, use USD
    const totalUSD = (parseFloat(order.total_amount) / 16000).toFixed(2);

    const itemDetails = items.map(item => ({
      name: truncateString((item.product_name || item.name) + ' - ' + (item.size_name || item.size || ''), 127),
      unit_amount: {
        currency_code: 'USD',
        value: (parseFloat(item.unit_price || item.price) / 16000).toFixed(2)
      },
      quantity: String(item.quantity)
    }));

    // Calculate items total
    const itemsTotal = itemDetails.reduce((sum, item) => {
      return sum + (parseFloat(item.unit_amount.value) * parseInt(item.quantity));
    }, 0).toFixed(2);

    // Calculate difference for shipping/tax/discount adjustment
    const diff = (parseFloat(totalUSD) - parseFloat(itemsTotal)).toFixed(2);

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: order.order_number,
        description: `Order ${order.order_number}`,
        amount: {
          currency_code: 'USD',
          value: totalUSD,
          breakdown: {
            item_total: {
              currency_code: 'USD',
              value: itemsTotal
            },
            ...(parseFloat(diff) > 0 ? {
              shipping: {
                currency_code: 'USD',
                value: diff
              }
            } : parseFloat(diff) < 0 ? {
              discount: {
                currency_code: 'USD',
                value: Math.abs(parseFloat(diff)).toFixed(2)
              }
            } : {})
          }
        },
        items: itemDetails
      }],
      application_context: {
        brand_name: 'HOJ Denim',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/order/paypal-return`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/order/paypal-cancel`
      }
    });

    const response = await client.execute(request);

    return {
      success: true,
      paypal_order_id: response.result.id,
      status: response.result.status,
      links: response.result.links
    };
  } catch (error) {
    console.error('Create PayPal order error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Capture PayPal order (after buyer approves)
 */
const capturePayPalOrder = async (paypalOrderId) => {
  try {
    const client = await getPayPalClient();
    const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
    request.requestBody({});

    const response = await client.execute(request);

    return {
      success: true,
      data: response.result,
      status: response.result.status,
      capture_id: response.result.purchase_units?.[0]?.payments?.captures?.[0]?.id
    };
  } catch (error) {
    console.error('Capture PayPal order error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get PayPal order details
 */
const getPayPalOrderDetails = async (paypalOrderId) => {
  try {
    const client = await getPayPalClient();
    const request = new paypal.orders.OrdersGetRequest(paypalOrderId);
    const response = await client.execute(request);

    return {
      success: true,
      data: response.result
    };
  } catch (error) {
    console.error('Get PayPal order details error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

const truncateString = (str, maxLength) => {
  if (!str) return '';
  return str.length > maxLength ? str.substring(0, maxLength - 3) + '...' : str;
};

module.exports = {
  getPayPalSettings,
  clearPayPalSettingsCache,
  isPayPalEnabled,
  getPayPalClient,
  getClientConfig,
  createPayPalOrder,
  capturePayPalOrder,
  getPayPalOrderDetails
};
