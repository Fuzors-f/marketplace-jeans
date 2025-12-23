const { query } = require('../config/database');

// @desc    Get all shipping costs
// @route   GET /api/shipping-costs
// @access  Public
exports.getAllShippingCosts = async (req, res) => {
  try {
    const { city_id, warehouse_id, courier, page = 1, limit = 100 } = req.query;
    const offset = (page - 1) * limit;
    
    let sql = `
      SELECT sc.*, 
        c.name as city_name, c.province,
        w.name as warehouse_name, w.code as warehouse_code
      FROM shipping_costs sc
      LEFT JOIN cities c ON sc.city_id = c.id
      LEFT JOIN warehouses w ON sc.warehouse_id = w.id
      WHERE sc.is_active = true
    `;
    const params = [];

    if (city_id) {
      sql += ` AND sc.city_id = ?`;
      params.push(city_id);
    }

    // Handle warehouse_id filter - 'null' means warehouse-independent
    if (warehouse_id === 'null') {
      sql += ` AND sc.warehouse_id IS NULL`;
    } else if (warehouse_id) {
      sql += ` AND sc.warehouse_id = ?`;
      params.push(warehouse_id);
    }

    if (courier) {
      sql += ` AND sc.courier = ?`;
      params.push(courier);
    }

    sql += ` ORDER BY c.province, c.name, sc.warehouse_id IS NULL DESC, sc.courier ASC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const shippingCosts = await query(sql, params);

    // Get total count
    let countSql = `SELECT COUNT(*) as total FROM shipping_costs sc WHERE sc.is_active = true`;
    const countParams = [];

    if (city_id) {
      countSql += ` AND sc.city_id = ?`;
      countParams.push(city_id);
    }

    // Handle warehouse_id filter for count
    if (warehouse_id === 'null') {
      countSql += ` AND sc.warehouse_id IS NULL`;
    } else if (warehouse_id) {
      countSql += ` AND sc.warehouse_id = ?`;
      countParams.push(warehouse_id);
    }

    if (courier) {
      countSql += ` AND sc.courier = ?`;
      countParams.push(courier);
    }

    const [countResult] = await query(countSql, countParams);

    res.json({
      success: true,
      data: shippingCosts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult.total,
        totalPages: Math.ceil(countResult.total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get shipping cost by ID
// @route   GET /api/shipping-costs/:id
// @access  Public
exports.getShippingCostById = async (req, res) => {
  try {
    const { id } = req.params;

    const costs = await query(
      `SELECT sc.*, 
        c.name as city_name, c.province,
        w.name as warehouse_name, w.code as warehouse_code
      FROM shipping_costs sc
      LEFT JOIN cities c ON sc.city_id = c.id
      LEFT JOIN warehouses w ON sc.warehouse_id = w.id
      WHERE sc.id = ?`,
      [id]
    );

    if (costs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Shipping cost not found'
      });
    }

    res.json({
      success: true,
      data: costs[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Calculate shipping cost for a city
// @route   POST /api/shipping-costs/calculate
// @access  Public
exports.calculateShippingCost = async (req, res) => {
  try {
    const { city_id, warehouse_id, weight = 1, courier } = req.body;

    if (!city_id) {
      return res.status(400).json({
        success: false,
        message: 'City ID is required'
      });
    }

    // Get city info
    const cities = await query('SELECT * FROM cities WHERE id = ? AND is_active = true', [city_id]);
    if (cities.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'City not found'
      });
    }

    // Build query for shipping costs
    // Prioritize warehouse-specific rates, then fall back to warehouse-independent rates
    let sql = `
      SELECT sc.*, 
        c.name as city_name, c.province,
        w.name as warehouse_name, w.code as warehouse_code,
        CASE WHEN sc.warehouse_id IS NULL THEN 0 ELSE 1 END as is_warehouse_specific
      FROM shipping_costs sc
      LEFT JOIN cities c ON sc.city_id = c.id
      LEFT JOIN warehouses w ON sc.warehouse_id = w.id
      WHERE sc.city_id = ? AND sc.is_active = true
    `;
    const params = [city_id];

    if (warehouse_id) {
      // Get both warehouse-specific and warehouse-independent rates
      sql += ` AND (sc.warehouse_id = ? OR sc.warehouse_id IS NULL)`;
      params.push(warehouse_id);
    }

    if (courier) {
      sql += ` AND sc.courier = ?`;
      params.push(courier);
    }

    // Order by warehouse-specific first, then by cost
    sql += ` ORDER BY is_warehouse_specific DESC, sc.cost ASC`;

    const shippingCosts = await query(sql, params);

    // Calculate total cost based on weight
    const weightInKg = parseFloat(weight);
    const results = shippingCosts.map(sc => {
      let totalCost = parseFloat(sc.cost);
      
      // If weight > 1kg, add cost per additional kg
      if (weightInKg > 1 && sc.cost_per_kg > 0) {
        totalCost = totalCost + ((weightInKg - 1) * parseFloat(sc.cost_per_kg));
      }

      return {
        ...sc,
        weight: weightInKg,
        calculated_cost: Math.ceil(totalCost),
        estimated_days_display: `${sc.estimated_days_min}-${sc.estimated_days_max} hari`,
        is_general: sc.warehouse_id === null
      };
    });

    // If no shipping costs found, return default
    if (results.length === 0) {
      // Default shipping cost calculation
      const defaultCost = 20000 + ((weightInKg - 1) * 10000);
      return res.json({
        success: true,
        data: [{
          id: null,
          city_id: city_id,
          city_name: cities[0].name,
          province: cities[0].province,
          warehouse_id: null,
          warehouse_name: null,
          courier: 'Standard',
          service: 'Regular',
          cost: 20000,
          cost_per_kg: 10000,
          weight: weightInKg,
          calculated_cost: Math.ceil(defaultCost),
          estimated_days_min: 3,
          estimated_days_max: 5,
          estimated_days_display: '3-5 hari',
          is_general: true
        }],
        message: 'Using default shipping rate'
      });
    }

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get available couriers
// @route   GET /api/shipping-costs/couriers
// @access  Public
exports.getCouriers = async (req, res) => {
  try {
    const couriers = await query(
      `SELECT DISTINCT courier FROM shipping_costs WHERE is_active = true ORDER BY courier ASC`
    );

    res.json({
      success: true,
      data: couriers.map(c => c.courier)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create a shipping cost
// @route   POST /api/shipping-costs
// @access  Admin
exports.createShippingCost = async (req, res) => {
  try {
    const { 
      city_id, 
      warehouse_id, 
      courier, 
      service, 
      cost, 
      cost_per_kg = 0,
      estimated_days_min = 1,
      estimated_days_max = 3,
      is_active = true 
    } = req.body;

    if (!city_id || !courier || cost === undefined) {
      return res.status(400).json({
        success: false,
        message: 'City ID, courier, and cost are required'
      });
    }

    // Check if city exists
    const cities = await query('SELECT * FROM cities WHERE id = ?', [city_id]);
    if (cities.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'City not found'
      });
    }

    // Check for duplicate
    const existing = await query(
      `SELECT * FROM shipping_costs WHERE city_id = ? AND warehouse_id <=> ? AND courier = ? AND service <=> ?`,
      [city_id, warehouse_id || null, courier, service || null]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Shipping cost for this city, warehouse, courier, and service already exists'
      });
    }

    const result = await query(
      `INSERT INTO shipping_costs 
        (city_id, warehouse_id, courier, service, cost, cost_per_kg, estimated_days_min, estimated_days_max, is_active) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [city_id, warehouse_id || null, courier, service || null, cost, cost_per_kg, estimated_days_min, estimated_days_max, is_active]
    );

    const newCost = await query(
      `SELECT sc.*, 
        c.name as city_name, c.province,
        w.name as warehouse_name, w.code as warehouse_code
      FROM shipping_costs sc
      LEFT JOIN cities c ON sc.city_id = c.id
      LEFT JOIN warehouses w ON sc.warehouse_id = w.id
      WHERE sc.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Shipping cost created successfully',
      data: newCost[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update a shipping cost
// @route   PUT /api/shipping-costs/:id
// @access  Admin
exports.updateShippingCost = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      city_id, 
      warehouse_id, 
      courier, 
      service, 
      cost, 
      cost_per_kg,
      estimated_days_min,
      estimated_days_max,
      is_active 
    } = req.body;

    // Check if exists
    const existing = await query('SELECT * FROM shipping_costs WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Shipping cost not found'
      });
    }

    await query(
      `UPDATE shipping_costs SET 
        city_id = COALESCE(?, city_id),
        warehouse_id = COALESCE(?, warehouse_id),
        courier = COALESCE(?, courier),
        service = COALESCE(?, service),
        cost = COALESCE(?, cost),
        cost_per_kg = COALESCE(?, cost_per_kg),
        estimated_days_min = COALESCE(?, estimated_days_min),
        estimated_days_max = COALESCE(?, estimated_days_max),
        is_active = COALESCE(?, is_active)
      WHERE id = ?`,
      [city_id, warehouse_id, courier, service, cost, cost_per_kg, estimated_days_min, estimated_days_max, is_active, id]
    );

    const updated = await query(
      `SELECT sc.*, 
        c.name as city_name, c.province,
        w.name as warehouse_name, w.code as warehouse_code
      FROM shipping_costs sc
      LEFT JOIN cities c ON sc.city_id = c.id
      LEFT JOIN warehouses w ON sc.warehouse_id = w.id
      WHERE sc.id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: 'Shipping cost updated successfully',
      data: updated[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete a shipping cost
// @route   DELETE /api/shipping-costs/:id
// @access  Admin
exports.deleteShippingCost = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if exists
    const existing = await query('SELECT * FROM shipping_costs WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Shipping cost not found'
      });
    }

    await query('DELETE FROM shipping_costs WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Shipping cost deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Bulk create shipping costs
// @route   POST /api/shipping-costs/bulk
// @access  Admin
exports.bulkCreateShippingCosts = async (req, res) => {
  try {
    const { shipping_costs } = req.body;

    if (!Array.isArray(shipping_costs) || shipping_costs.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Shipping costs array is required'
      });
    }

    let insertedCount = 0;
    let errors = [];

    for (const sc of shipping_costs) {
      try {
        await query(
          `INSERT INTO shipping_costs 
            (city_id, warehouse_id, courier, service, cost, cost_per_kg, estimated_days_min, estimated_days_max, is_active) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            cost = VALUES(cost),
            cost_per_kg = VALUES(cost_per_kg),
            estimated_days_min = VALUES(estimated_days_min),
            estimated_days_max = VALUES(estimated_days_max),
            is_active = VALUES(is_active)`,
          [
            sc.city_id, 
            sc.warehouse_id || null, 
            sc.courier, 
            sc.service || null, 
            sc.cost, 
            sc.cost_per_kg || 0,
            sc.estimated_days_min || 1,
            sc.estimated_days_max || 3,
            sc.is_active !== false
          ]
        );
        insertedCount++;
      } catch (err) {
        errors.push({ city_id: sc.city_id, courier: sc.courier, error: err.message });
      }
    }

    res.status(201).json({
      success: true,
      message: `${insertedCount} shipping costs created/updated successfully`,
      data: {
        inserted: insertedCount,
        errors: errors
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get shipping costs by city name (search)
// @route   GET /api/shipping-costs/search
// @access  Public
exports.searchShippingCostsByCity = async (req, res) => {
  try {
    const { city_name, province, courier, warehouse_id } = req.query;

    if (!city_name && !province) {
      return res.status(400).json({
        success: false,
        message: 'City name or province is required'
      });
    }

    let sql = `
      SELECT sc.*, 
        c.name as city_name, c.province,
        w.name as warehouse_name, w.code as warehouse_code
      FROM shipping_costs sc
      LEFT JOIN cities c ON sc.city_id = c.id
      LEFT JOIN warehouses w ON sc.warehouse_id = w.id
      WHERE sc.is_active = true AND c.is_active = true
    `;
    const params = [];

    if (city_name) {
      sql += ` AND c.name LIKE ?`;
      params.push(`%${city_name}%`);
    }

    if (province) {
      sql += ` AND c.province LIKE ?`;
      params.push(`%${province}%`);
    }

    if (courier) {
      sql += ` AND sc.courier = ?`;
      params.push(courier);
    }

    if (warehouse_id) {
      sql += ` AND sc.warehouse_id = ?`;
      params.push(warehouse_id);
    }

    sql += ` ORDER BY c.province, c.name, sc.cost ASC LIMIT 50`;

    const shippingCosts = await query(sql, params);

    res.json({
      success: true,
      data: shippingCosts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
