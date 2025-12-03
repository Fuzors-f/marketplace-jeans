const { query } = require('../config/database');

// @desc    Calculate shipping cost
// @route   POST /api/shipping/calculate
// @access  Public
exports.calculateShipping = async (req, res) => {
  try {
    const { destination_country, weight } = req.body;

    if (!destination_country || !weight) {
      return res.status(400).json({
        success: false,
        message: 'Destination country and weight required'
      });
    }

    // Simplified shipping calculation
    // In production, integrate with shipping API (JNE, TIKI, etc.)
    let cost = 0;
    const weightInKg = parseFloat(weight);

    if (destination_country === 'Indonesia') {
      // Domestic shipping
      if (weightInKg <= 1) {
        cost = 20000;
      } else {
        cost = 20000 + ((weightInKg - 1) * 10000);
      }
    } else {
      // International shipping
      if (weightInKg <= 1) {
        cost = 100000;
      } else {
        cost = 100000 + ((weightInKg - 1) * 50000);
      }
    }

    res.json({
      success: true,
      data: {
        destination: destination_country,
        weight: weightInKg,
        cost: cost,
        estimated_days: destination_country === 'Indonesia' ? '3-5' : '10-14'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Track shipment
// @route   GET /api/shipping/track/:trackingNumber
// @access  Public
exports.trackShipment = async (req, res) => {
  try {
    const { trackingNumber } = req.params;

    // Get order with tracking number
    const orders = await query(
      `SELECT 
        o.id, o.order_number, o.status,
        os.tracking_number, os.shipping_method, os.shipped_at, os.delivered_at, os.estimated_delivery
      FROM orders o
      JOIN order_shipping os ON o.id = os.order_id
      WHERE os.tracking_number = ?`,
      [trackingNumber]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tracking number not found'
      });
    }

    // In production, integrate with real shipping tracking API
    res.json({
      success: true,
      data: {
        tracking_number: trackingNumber,
        status: orders[0].status,
        shipped_at: orders[0].shipped_at,
        estimated_delivery: orders[0].estimated_delivery,
        delivered_at: orders[0].delivered_at
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
