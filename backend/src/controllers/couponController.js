const { query, transaction } = require('../config/database');

// @desc    Get all coupons (Admin)
// @route   GET /api/coupons
// @access  Private (Admin)
exports.getAllCoupons = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = '1=1';
    const params = [];
    
    if (status === 'active') {
      whereClause += ' AND is_active = true';
    } else if (status === 'inactive') {
      whereClause += ' AND is_active = false';
    } else if (status === 'expired') {
      whereClause += ' AND end_date IS NOT NULL AND end_date < NOW()';
    } else if (status === 'valid') {
      whereClause += ' AND is_active = true AND (end_date IS NULL OR end_date >= NOW()) AND (usage_limit IS NULL OR usage_count < usage_limit)';
    }

    const coupons = await query(
      `SELECT c.*, 
        u.full_name as created_by_name,
        CASE 
          WHEN c.is_active = false THEN 'inactive'
          WHEN c.end_date IS NOT NULL AND c.end_date < NOW() THEN 'expired'
          WHEN c.start_date IS NOT NULL AND c.start_date > NOW() THEN 'scheduled'
          WHEN c.usage_limit IS NOT NULL AND c.usage_count >= c.usage_limit THEN 'depleted'
          ELSE 'active'
        END as status
       FROM coupons c
       LEFT JOIN users u ON c.created_by = u.id
       WHERE ${whereClause}
       ORDER BY c.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM coupons WHERE ${whereClause}`,
      params
    );

    res.json({
      success: true,
      data: coupons,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total
      }
    });
  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memuat data kupon',
      error: error.message
    });
  }
};

// @desc    Get coupon by ID
// @route   GET /api/coupons/:id
// @access  Private (Admin)
exports.getCouponById = async (req, res) => {
  try {
    const { id } = req.params;

    const coupons = await query(
      `SELECT c.*, 
        u.full_name as created_by_name,
        (SELECT COUNT(*) FROM coupon_usages WHERE coupon_id = c.id) as total_uses
       FROM coupons c
       LEFT JOIN users u ON c.created_by = u.id
       WHERE c.id = ?`,
      [id]
    );

    if (coupons.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Kupon tidak ditemukan'
      });
    }

    // Get recent usages
    const usages = await query(
      `SELECT cu.*, 
        u.full_name as user_name, u.email as user_email,
        o.order_number
       FROM coupon_usages cu
       LEFT JOIN users u ON cu.user_id = u.id
       LEFT JOIN orders o ON cu.order_id = o.id
       WHERE cu.coupon_id = ?
       ORDER BY cu.used_at DESC
       LIMIT 10`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...coupons[0],
        recent_usages: usages
      }
    });
  } catch (error) {
    console.error('Get coupon by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memuat kupon',
      error: error.message
    });
  }
};

// @desc    Validate coupon code (Public)
// @route   POST /api/coupons/validate
// @access  Public
exports.validateCoupon = async (req, res) => {
  try {
    const { code, subtotal, user_id, guest_email } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Kode kupon harus diisi'
      });
    }

    // Find coupon
    const coupons = await query(
      `SELECT * FROM coupons WHERE code = ? AND is_active = true`,
      [code.toUpperCase()]
    );

    if (coupons.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Kode kupon tidak valid'
      });
    }

    const coupon = coupons[0];

    // Check date validity
    const now = new Date();
    if (coupon.start_date && new Date(coupon.start_date) > now) {
      return res.status(400).json({
        success: false,
        message: 'Kupon belum aktif'
      });
    }

    if (coupon.end_date && new Date(coupon.end_date) < now) {
      return res.status(400).json({
        success: false,
        message: 'Kupon sudah kadaluarsa'
      });
    }

    // Check usage limit
    if (coupon.usage_limit !== null && coupon.usage_count >= coupon.usage_limit) {
      return res.status(400).json({
        success: false,
        message: 'Kupon sudah habis'
      });
    }

    // Check per-user limit
    if (coupon.usage_limit_per_user) {
      let userUsageCount = 0;
      
      if (user_id) {
        const userUsage = await query(
          'SELECT COUNT(*) as count FROM coupon_usages WHERE coupon_id = ? AND user_id = ?',
          [coupon.id, user_id]
        );
        userUsageCount = userUsage[0].count;
      } else if (guest_email) {
        const guestUsage = await query(
          'SELECT COUNT(*) as count FROM coupon_usages WHERE coupon_id = ? AND guest_email = ?',
          [coupon.id, guest_email]
        );
        userUsageCount = guestUsage[0].count;
      }

      if (userUsageCount >= coupon.usage_limit_per_user) {
        return res.status(400).json({
          success: false,
          message: 'Anda sudah menggunakan kupon ini'
        });
      }
    }

    // Check minimum purchase
    if (coupon.min_purchase && subtotal < coupon.min_purchase) {
      return res.status(400).json({
        success: false,
        message: `Minimum pembelian Rp ${coupon.min_purchase.toLocaleString('id-ID')} untuk menggunakan kupon ini`
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = Math.round(subtotal * (coupon.discount_value / 100));
      if (coupon.max_discount && discountAmount > coupon.max_discount) {
        discountAmount = coupon.max_discount;
      }
    } else {
      discountAmount = coupon.discount_value;
      // Don't let discount exceed subtotal
      if (discountAmount > subtotal) {
        discountAmount = subtotal;
      }
    }

    res.json({
      success: true,
      data: {
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        max_discount: coupon.max_discount,
        discount_amount: discountAmount,
        min_purchase: coupon.min_purchase
      }
    });
  } catch (error) {
    console.error('Validate coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memvalidasi kupon',
      error: error.message
    });
  }
};

// @desc    Create new coupon
// @route   POST /api/coupons
// @access  Private (Admin)
exports.createCoupon = async (req, res) => {
  try {
    const {
      code,
      name,
      description,
      discount_type = 'percentage',
      discount_value,
      max_discount,
      min_purchase = 0,
      start_date,
      end_date,
      usage_limit,
      usage_limit_per_user = 1,
      applicable_products,
      applicable_categories,
      is_active = true
    } = req.body;

    // Validation
    if (!code || !name || !discount_value) {
      return res.status(400).json({
        success: false,
        message: 'Kode, nama, dan nilai diskon harus diisi'
      });
    }

    // Check duplicate code
    const existing = await query(
      'SELECT id FROM coupons WHERE code = ?',
      [code.toUpperCase()]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Kode kupon sudah digunakan'
      });
    }

    // Validate percentage max 100
    if (discount_type === 'percentage' && discount_value > 100) {
      return res.status(400).json({
        success: false,
        message: 'Persentase diskon maksimal 100%'
      });
    }

    const result = await query(
      `INSERT INTO coupons 
       (code, name, description, discount_type, discount_value, max_discount, min_purchase,
        start_date, end_date, usage_limit, usage_limit_per_user, 
        applicable_products, applicable_categories, is_active, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        code.toUpperCase(),
        name,
        description || null,
        discount_type,
        discount_value,
        max_discount || null,
        min_purchase,
        start_date || null,
        end_date || null,
        usage_limit || null,
        usage_limit_per_user,
        applicable_products ? JSON.stringify(applicable_products) : null,
        applicable_categories ? JSON.stringify(applicable_categories) : null,
        is_active,
        req.user?.id || null
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Kupon berhasil dibuat',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Create coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal membuat kupon',
      error: error.message
    });
  }
};

// @desc    Update coupon
// @route   PUT /api/coupons/:id
// @access  Private (Admin)
exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      code,
      name,
      description,
      discount_type,
      discount_value,
      max_discount,
      min_purchase,
      start_date,
      end_date,
      usage_limit,
      usage_limit_per_user,
      applicable_products,
      applicable_categories,
      is_active
    } = req.body;

    // Check if coupon exists
    const existing = await query('SELECT id FROM coupons WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Kupon tidak ditemukan'
      });
    }

    // Check duplicate code (if changing)
    if (code) {
      const duplicateCode = await query(
        'SELECT id FROM coupons WHERE code = ? AND id != ?',
        [code.toUpperCase(), id]
      );
      if (duplicateCode.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Kode kupon sudah digunakan'
        });
      }
    }

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (code !== undefined) { updates.push('code = ?'); values.push(code.toUpperCase()); }
    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (discount_type !== undefined) { updates.push('discount_type = ?'); values.push(discount_type); }
    if (discount_value !== undefined) { updates.push('discount_value = ?'); values.push(discount_value); }
    if (max_discount !== undefined) { updates.push('max_discount = ?'); values.push(max_discount || null); }
    if (min_purchase !== undefined) { updates.push('min_purchase = ?'); values.push(min_purchase); }
    if (start_date !== undefined) { updates.push('start_date = ?'); values.push(start_date || null); }
    if (end_date !== undefined) { updates.push('end_date = ?'); values.push(end_date || null); }
    if (usage_limit !== undefined) { updates.push('usage_limit = ?'); values.push(usage_limit || null); }
    if (usage_limit_per_user !== undefined) { updates.push('usage_limit_per_user = ?'); values.push(usage_limit_per_user); }
    if (applicable_products !== undefined) { 
      updates.push('applicable_products = ?'); 
      values.push(applicable_products ? JSON.stringify(applicable_products) : null); 
    }
    if (applicable_categories !== undefined) { 
      updates.push('applicable_categories = ?'); 
      values.push(applicable_categories ? JSON.stringify(applicable_categories) : null); 
    }
    if (is_active !== undefined) { updates.push('is_active = ?'); values.push(is_active); }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tidak ada data yang diupdate'
      });
    }

    values.push(id);
    await query(`UPDATE coupons SET ${updates.join(', ')} WHERE id = ?`, values);

    res.json({
      success: true,
      message: 'Kupon berhasil diupdate'
    });
  } catch (error) {
    console.error('Update coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengupdate kupon',
      error: error.message
    });
  }
};

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private (Admin)
exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if coupon has been used
    const usages = await query(
      'SELECT COUNT(*) as count FROM coupon_usages WHERE coupon_id = ?',
      [id]
    );

    if (usages[0].count > 0) {
      // Soft delete by deactivating
      await query('UPDATE coupons SET is_active = false WHERE id = ?', [id]);
      return res.json({
        success: true,
        message: 'Kupon sudah pernah digunakan, dinonaktifkan saja'
      });
    }

    await query('DELETE FROM coupons WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Kupon berhasil dihapus'
    });
  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus kupon',
      error: error.message
    });
  }
};

// @desc    Get coupon statistics
// @route   GET /api/coupons/stats
// @access  Private (Admin)
exports.getCouponStats = async (req, res) => {
  try {
    // Total coupons
    const totalCoupons = await query('SELECT COUNT(*) as count FROM coupons');
    
    // Active coupons
    const activeCoupons = await query(
      `SELECT COUNT(*) as count FROM coupons 
       WHERE is_active = true 
       AND (end_date IS NULL OR end_date >= NOW())
       AND (usage_limit IS NULL OR usage_count < usage_limit)`
    );
    
    // Total discount given
    const totalDiscount = await query(
      'SELECT COALESCE(SUM(discount_amount), 0) as total FROM coupon_usages'
    );
    
    // Total redemptions
    const totalRedemptions = await query(
      'SELECT COUNT(*) as count FROM coupon_usages'
    );

    // Top coupons by usage
    const topCoupons = await query(
      `SELECT c.code, c.name, c.usage_count,
        COALESCE(SUM(cu.discount_amount), 0) as total_discount
       FROM coupons c
       LEFT JOIN coupon_usages cu ON c.id = cu.coupon_id
       GROUP BY c.id
       ORDER BY c.usage_count DESC
       LIMIT 5`
    );

    res.json({
      success: true,
      data: {
        total_coupons: totalCoupons[0].count,
        active_coupons: activeCoupons[0].count,
        total_discount_given: totalDiscount[0].total,
        total_redemptions: totalRedemptions[0].count,
        top_coupons: topCoupons
      }
    });
  } catch (error) {
    console.error('Get coupon stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memuat statistik kupon',
      error: error.message
    });
  }
};

// @desc    Apply coupon to order (Internal use)
// @route   Used internally when creating order
exports.applyCouponToOrder = async (couponId, orderId, userId, guestEmail, discountAmount, connection = null) => {
  const queryFn = connection ? 
    (sql, params) => connection.execute(sql, params) : 
    query;

  // Record usage
  await queryFn(
    `INSERT INTO coupon_usages (coupon_id, user_id, guest_email, order_id, discount_amount)
     VALUES (?, ?, ?, ?, ?)`,
    [couponId, userId || null, guestEmail || null, orderId, discountAmount]
  );

  // Increment usage count
  await queryFn(
    'UPDATE coupons SET usage_count = usage_count + 1 WHERE id = ?',
    [couponId]
  );

  return true;
};

// @desc    Get public active coupons (for display)
// @route   GET /api/coupons/public
// @access  Public
exports.getPublicCoupons = async (req, res) => {
  try {
    const coupons = await query(
      `SELECT code, name, description, discount_type, discount_value, max_discount, min_purchase,
              start_date, end_date
       FROM coupons
       WHERE is_active = true
       AND (start_date IS NULL OR start_date <= NOW())
       AND (end_date IS NULL OR end_date >= NOW())
       AND (usage_limit IS NULL OR usage_count < usage_limit)
       ORDER BY discount_value DESC
       LIMIT 10`
    );

    res.json({
      success: true,
      data: coupons
    });
  } catch (error) {
    console.error('Get public coupons error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memuat kupon'
    });
  }
};
