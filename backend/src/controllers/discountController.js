const { query } = require('../config/database');

// @desc    Get all active discounts
// @route   GET /api/discounts
// @access  Public
exports.getDiscounts = async (req, res) => {
  try {
    const discounts = await query(
      `SELECT id, code, type, value, min_purchase, max_discount, start_date, end_date, description
       FROM discounts
       WHERE is_active = true
       AND (start_date IS NULL OR start_date <= NOW())
       AND (end_date IS NULL OR end_date >= NOW())
       AND (usage_limit IS NULL OR usage_count < usage_limit)`
    );

    res.json({ success: true, data: discounts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Validate discount code
// @route   POST /api/discounts/validate
// @access  Public
exports.validateDiscount = async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Discount code required'
      });
    }

    const discounts = await query(
      `SELECT * FROM discounts
       WHERE code = ? AND is_active = true
       AND (start_date IS NULL OR start_date <= NOW())
       AND (end_date IS NULL OR end_date >= NOW())
       AND (usage_limit IS NULL OR usage_count < usage_limit)`,
      [code]
    );

    if (discounts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired discount code'
      });
    }

    const discount = discounts[0];

    // Check minimum purchase
    if (discount.min_purchase && subtotal < discount.min_purchase) {
      return res.status(400).json({
        success: false,
        message: `Minimum purchase of ${discount.min_purchase} required`
      });
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (discount.type === 'percentage') {
      discountAmount = subtotal * (discount.value / 100);
      if (discount.max_discount && discountAmount > discount.max_discount) {
        discountAmount = discount.max_discount;
      }
    } else if (discount.type === 'fixed') {
      discountAmount = discount.value;
    }

    res.json({
      success: true,
      data: {
        code: discount.code,
        type: discount.type,
        value: discount.value,
        discount_amount: discountAmount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create discount (Admin)
// @route   POST /api/discounts
// @access  Private (Admin)
exports.createDiscount = async (req, res) => {
  try {
    const {
      code, type, value, min_purchase, max_discount,
      start_date, end_date, usage_limit, applicable_to, applicable_ids, description
    } = req.body;

    if (!code || !type || !value) {
      return res.status(400).json({
        success: false,
        message: 'Code, type, and value required'
      });
    }

    if (!['percentage', 'fixed'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be either "percentage" or "fixed"'
      });
    }

    if (type === 'percentage' && (value < 0 || value > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Percentage discount value must be between 0 and 100'
      });
    }

    // Check for duplicate code
    const existing = await query('SELECT id FROM discounts WHERE code = ?', [code]);
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Discount code already exists'
      });
    }

    const result = await query(
      `INSERT INTO discounts
      (code, type, value, min_purchase, max_discount, start_date, end_date,
       usage_limit, applicable_to, applicable_ids, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [code, type, value, min_purchase || 0, max_discount || null,
       start_date || null, end_date || null, usage_limit || null,
       applicable_to || 'all', applicable_ids || null, description || null]
    );

    res.status(201).json({
      success: true,
      message: 'Discount created',
      data: { id: result.insertId }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update discount (Admin)
// @route   PUT /api/discounts/:id
// @access  Private (Admin)
exports.updateDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = [];
    const values = [];

    const allowedFields = [
      'code', 'type', 'value', 'min_purchase', 'max_discount',
      'start_date', 'end_date', 'usage_limit', 'is_active', 'description'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(req.body[field]);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    values.push(id);
    await query(`UPDATE discounts SET ${updates.join(', ')} WHERE id = ?`, values);

    res.json({ success: true, message: 'Discount updated' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete discount (Admin)
// @route   DELETE /api/discounts/:id
// @access  Private (Admin)
exports.deleteDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if discount exists
    const existing = await query('SELECT id FROM discounts WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Discount not found'
      });
    }
    
    await query('DELETE FROM discounts WHERE id = ?', [id]);
    res.json({ success: true, message: 'Discount deleted' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
