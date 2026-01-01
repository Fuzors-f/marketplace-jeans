const { query } = require('../config/database');

// @desc    Get user addresses
// @route   GET /api/addresses
// @access  Private
exports.getUserAddresses = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const addresses = await query(
      `SELECT id, address_label, recipient_name, phone, address, city, province, 
              postal_code, country, is_default, created_at, updated_at
       FROM user_addresses 
       WHERE user_id = ? 
       ORDER BY is_default DESC, created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: addresses
    });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching addresses',
      error: error.message
    });
  }
};

// @desc    Get single address
// @route   GET /api/addresses/:id
// @access  Private
exports.getAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const addresses = await query(
      `SELECT id, address_label, recipient_name, phone, address, city, province, 
              postal_code, country, is_default, created_at, updated_at
       FROM user_addresses 
       WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    if (addresses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    res.json({
      success: true,
      data: addresses[0]
    });
  } catch (error) {
    console.error('Get address error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching address',
      error: error.message
    });
  }
};

// @desc    Create new address
// @route   POST /api/addresses
// @access  Private
exports.createAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      address_label,
      recipient_name,
      phone,
      address,
      city,
      province,
      postal_code,
      country = 'Indonesia',
      is_default = false
    } = req.body;

    // Validate required fields
    if (!recipient_name || !phone || !address || !city || !province || !postal_code) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: recipient_name, phone, address, city, province, postal_code'
      });
    }

    // If this is set as default, unset other defaults
    if (is_default) {
      await query(
        'UPDATE user_addresses SET is_default = 0 WHERE user_id = ?',
        [userId]
      );
    }

    // Check if user has any addresses, if not make this default
    const existingAddresses = await query(
      'SELECT COUNT(*) as count FROM user_addresses WHERE user_id = ?',
      [userId]
    );
    const makeDefault = existingAddresses[0].count === 0 || is_default;

    const result = await query(
      `INSERT INTO user_addresses 
       (user_id, address_label, recipient_name, phone, address, city, province, postal_code, country, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, address_label || 'Alamat', recipient_name, phone, address, city, province, postal_code, country, makeDefault ? 1 : 0]
    );

    const newAddress = await query(
      'SELECT * FROM user_addresses WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Address created successfully',
      data: newAddress[0]
    });
  } catch (error) {
    console.error('Create address error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating address',
      error: error.message
    });
  }
};

// @desc    Update address
// @route   PUT /api/addresses/:id
// @access  Private
exports.updateAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const {
      address_label,
      recipient_name,
      phone,
      address,
      city,
      province,
      postal_code,
      country,
      is_default
    } = req.body;

    // Check if address exists and belongs to user
    const existingAddress = await query(
      'SELECT * FROM user_addresses WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (existingAddress.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // If setting as default, unset other defaults
    if (is_default) {
      await query(
        'UPDATE user_addresses SET is_default = 0 WHERE user_id = ? AND id != ?',
        [userId, id]
      );
    }

    await query(
      `UPDATE user_addresses SET 
        address_label = COALESCE(?, address_label),
        recipient_name = COALESCE(?, recipient_name),
        phone = COALESCE(?, phone),
        address = COALESCE(?, address),
        city = COALESCE(?, city),
        province = COALESCE(?, province),
        postal_code = COALESCE(?, postal_code),
        country = COALESCE(?, country),
        is_default = COALESCE(?, is_default),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`,
      [address_label, recipient_name, phone, address, city, province, postal_code, country, is_default ? 1 : 0, id, userId]
    );

    const updatedAddress = await query(
      'SELECT * FROM user_addresses WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Address updated successfully',
      data: updatedAddress[0]
    });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating address',
      error: error.message
    });
  }
};

// @desc    Delete address
// @route   DELETE /api/addresses/:id
// @access  Private
exports.deleteAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Check if address exists and belongs to user
    const existingAddress = await query(
      'SELECT * FROM user_addresses WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (existingAddress.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    const wasDefault = existingAddress[0].is_default;

    await query('DELETE FROM user_addresses WHERE id = ? AND user_id = ?', [id, userId]);

    // If deleted address was default, set another one as default
    if (wasDefault) {
      const otherAddresses = await query(
        'SELECT id FROM user_addresses WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
        [userId]
      );
      if (otherAddresses.length > 0) {
        await query(
          'UPDATE user_addresses SET is_default = 1 WHERE id = ?',
          [otherAddresses[0].id]
        );
      }
    }

    res.json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting address',
      error: error.message
    });
  }
};

// @desc    Set address as default
// @route   PUT /api/addresses/:id/default
// @access  Private
exports.setDefaultAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Check if address exists and belongs to user
    const existingAddress = await query(
      'SELECT * FROM user_addresses WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (existingAddress.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // Unset all defaults for this user
    await query(
      'UPDATE user_addresses SET is_default = 0 WHERE user_id = ?',
      [userId]
    );

    // Set this address as default
    await query(
      'UPDATE user_addresses SET is_default = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Default address updated successfully'
    });
  } catch (error) {
    console.error('Set default address error:', error);
    res.status(500).json({
      success: false,
      message: 'Error setting default address',
      error: error.message
    });
  }
};
