const { query } = require('../config/database');

// @desc    Calculate shipping cost
// @route   POST /api/shipping/calculate
// @access  Public
exports.calculateShipping = async (req, res) => {
  try {
    const { destination_country, city_id, city_name, province, weight, warehouse_id, courier } = req.body;

    if (!weight) {
      return res.status(400).json({
        success: false,
        message: 'Weight is required'
      });
    }

    const weightInKg = parseFloat(weight);

    // If city_id is provided, use the new shipping_costs table
    if (city_id) {
      let sql = `
        SELECT sc.*, 
          c.name as city_name, c.province,
          w.name as warehouse_name, w.code as warehouse_code
        FROM shipping_costs sc
        LEFT JOIN cities c ON sc.city_id = c.id
        LEFT JOIN warehouses w ON sc.warehouse_id = w.id
        WHERE sc.city_id = ? AND sc.is_active = true
      `;
      const params = [city_id];

      if (warehouse_id) {
        sql += ` AND sc.warehouse_id = ?`;
        params.push(warehouse_id);
      }

      if (courier) {
        sql += ` AND sc.courier = ?`;
        params.push(courier);
      }

      sql += ` ORDER BY sc.cost ASC`;

      const shippingCosts = await query(sql, params);

      if (shippingCosts.length > 0) {
        const results = shippingCosts.map(sc => {
          let totalCost = sc.cost;
          if (weightInKg > 1 && sc.cost_per_kg > 0) {
            totalCost = sc.cost + ((weightInKg - 1) * sc.cost_per_kg);
          }

          return {
            courier: sc.courier,
            service: sc.service,
            destination: sc.city_name,
            province: sc.province,
            warehouse: sc.warehouse_name,
            weight: weightInKg,
            cost: Math.ceil(totalCost),
            estimated_days: `${sc.estimated_days_min}-${sc.estimated_days_max}`
          };
        });

        return res.json({
          success: true,
          data: results
        });
      }
    }

    // If city_name is provided, try to find the city and its shipping costs
    if (city_name || province) {
      let citySql = `SELECT id FROM cities WHERE is_active = true`;
      const cityParams = [];

      if (city_name) {
        citySql += ` AND name LIKE ?`;
        cityParams.push(`%${city_name}%`);
      }

      if (province) {
        citySql += ` AND province LIKE ?`;
        cityParams.push(`%${province}%`);
      }

      citySql += ` LIMIT 1`;

      const cities = await query(citySql, cityParams);

      if (cities.length > 0) {
        const foundCityId = cities[0].id;
        
        let sql = `
          SELECT sc.*, 
            c.name as city_name, c.province,
            w.name as warehouse_name
          FROM shipping_costs sc
          LEFT JOIN cities c ON sc.city_id = c.id
          LEFT JOIN warehouses w ON sc.warehouse_id = w.id
          WHERE sc.city_id = ? AND sc.is_active = true
          ORDER BY sc.cost ASC
        `;

        const shippingCosts = await query(sql, [foundCityId]);

        if (shippingCosts.length > 0) {
          const results = shippingCosts.map(sc => {
            let totalCost = sc.cost;
            if (weightInKg > 1 && sc.cost_per_kg > 0) {
              totalCost = sc.cost + ((weightInKg - 1) * sc.cost_per_kg);
            }

            return {
              courier: sc.courier,
              service: sc.service,
              destination: sc.city_name,
              province: sc.province,
              warehouse: sc.warehouse_name,
              weight: weightInKg,
              cost: Math.ceil(totalCost),
              estimated_days: `${sc.estimated_days_min}-${sc.estimated_days_max}`
            };
          });

          return res.json({
            success: true,
            data: results
          });
        }
      }
    }

    // Fallback to simplified shipping calculation
    let cost = 0;
    let estimated_days = '3-5';

    if (destination_country === 'Indonesia' || !destination_country) {
      // Domestic shipping
      if (weightInKg <= 1) {
        cost = 20000;
      } else {
        cost = 20000 + ((weightInKg - 1) * 10000);
      }
      estimated_days = '3-5';
    } else {
      // International shipping
      if (weightInKg <= 1) {
        cost = 100000;
      } else {
        cost = 100000 + ((weightInKg - 1) * 50000);
      }
      estimated_days = '10-14';
    }

    res.json({
      success: true,
      data: [{
        courier: 'Standard',
        service: 'Regular',
        destination: city_name || destination_country || 'Indonesia',
        weight: weightInKg,
        cost: cost,
        estimated_days: estimated_days
      }]
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
