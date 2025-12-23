const { query } = require('../config/database');

// @desc    Get all cities
// @route   GET /api/cities
// @access  Public
exports.getAllCities = async (req, res) => {
  try {
    const { province, search, is_active, page = 1, limit = 100 } = req.query;
    const offset = (page - 1) * limit;
    
    let sql = `
      SELECT c.*, 
        (SELECT COUNT(*) FROM shipping_costs WHERE city_id = c.id) as shipping_cost_count
      FROM cities c
      WHERE 1=1
    `;
    const params = [];

    if (province) {
      sql += ` AND c.province = ?`;
      params.push(province);
    }

    if (search) {
      sql += ` AND (c.name LIKE ? OR c.province LIKE ? OR c.postal_code LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (is_active !== undefined) {
      sql += ` AND c.is_active = ?`;
      params.push(is_active === 'true' ? 1 : 0);
    }

    sql += ` ORDER BY c.province, c.name ASC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const cities = await query(sql, params);

    // Get total count
    let countSql = `SELECT COUNT(*) as total FROM cities WHERE 1=1`;
    const countParams = [];

    if (province) {
      countSql += ` AND province = ?`;
      countParams.push(province);
    }

    if (search) {
      countSql += ` AND (name LIKE ? OR province LIKE ? OR postal_code LIKE ?)`;
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (is_active !== undefined) {
      countSql += ` AND is_active = ?`;
      countParams.push(is_active === 'true' ? 1 : 0);
    }

    const [countResult] = await query(countSql, countParams);

    res.json({
      success: true,
      data: cities,
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

// @desc    Get city by ID
// @route   GET /api/cities/:id
// @access  Public
exports.getCityById = async (req, res) => {
  try {
    const { id } = req.params;

    const cities = await query(
      `SELECT c.*, 
        (SELECT COUNT(*) FROM shipping_costs WHERE city_id = c.id) as shipping_cost_count
      FROM cities c
      WHERE c.id = ?`,
      [id]
    );

    if (cities.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'City not found'
      });
    }

    // Get shipping costs for this city
    const shippingCosts = await query(
      `SELECT sc.*, w.name as warehouse_name, w.code as warehouse_code
      FROM shipping_costs sc
      LEFT JOIN warehouses w ON sc.warehouse_id = w.id
      WHERE sc.city_id = ?
      ORDER BY w.name`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...cities[0],
        shipping_costs: shippingCosts
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all provinces
// @route   GET /api/cities/provinces
// @access  Public
exports.getProvinces = async (req, res) => {
  try {
    const provinces = await query(
      `SELECT DISTINCT province FROM cities WHERE is_active = true ORDER BY province ASC`
    );

    res.json({
      success: true,
      data: provinces.map(p => p.province)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get cities by province
// @route   GET /api/cities/province/:province
// @access  Public
exports.getCitiesByProvince = async (req, res) => {
  try {
    const { province } = req.params;

    const cities = await query(
      `SELECT id, name, province, postal_code, city_type
      FROM cities
      WHERE province = ? AND is_active = true
      ORDER BY name ASC`,
      [province]
    );

    res.json({
      success: true,
      data: cities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create a city
// @route   POST /api/cities
// @access  Admin
exports.createCity = async (req, res) => {
  try {
    const { name, province, postal_code, city_type, is_active = true } = req.body;

    if (!name || !province) {
      return res.status(400).json({
        success: false,
        message: 'Name and province are required'
      });
    }

    const result = await query(
      `INSERT INTO cities (name, province, postal_code, city_type, is_active) VALUES (?, ?, ?, ?, ?)`,
      [name, province, postal_code || null, city_type || 'kota', is_active]
    );

    const newCity = await query('SELECT * FROM cities WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'City created successfully',
      data: newCity[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update a city
// @route   PUT /api/cities/:id
// @access  Admin
exports.updateCity = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, province, postal_code, city_type, is_active } = req.body;

    // Check if city exists
    const existing = await query('SELECT * FROM cities WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'City not found'
      });
    }

    await query(
      `UPDATE cities SET 
        name = COALESCE(?, name),
        province = COALESCE(?, province),
        postal_code = COALESCE(?, postal_code),
        city_type = COALESCE(?, city_type),
        is_active = COALESCE(?, is_active)
      WHERE id = ?`,
      [name, province, postal_code, city_type, is_active, id]
    );

    const updated = await query('SELECT * FROM cities WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'City updated successfully',
      data: updated[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete a city
// @route   DELETE /api/cities/:id
// @access  Admin
exports.deleteCity = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if city exists
    const existing = await query('SELECT * FROM cities WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'City not found'
      });
    }

    // Check if city has shipping costs
    const shippingCosts = await query('SELECT COUNT(*) as count FROM shipping_costs WHERE city_id = ?', [id]);
    if (shippingCosts[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete city with existing shipping costs. Delete shipping costs first or deactivate the city.'
      });
    }

    await query('DELETE FROM cities WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'City deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Bulk create cities
// @route   POST /api/cities/bulk
// @access  Admin
exports.bulkCreateCities = async (req, res) => {
  try {
    const { cities } = req.body;

    if (!Array.isArray(cities) || cities.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cities array is required'
      });
    }

    let insertedCount = 0;
    let errors = [];

    for (const city of cities) {
      try {
        await query(
          `INSERT INTO cities (name, province, postal_code, city_type, is_active) VALUES (?, ?, ?, ?, ?)`,
          [city.name, city.province, city.postal_code || null, city.city_type || 'kota', city.is_active !== false]
        );
        insertedCount++;
      } catch (err) {
        errors.push({ city: city.name, error: err.message });
      }
    }

    res.status(201).json({
      success: true,
      message: `${insertedCount} cities created successfully`,
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
