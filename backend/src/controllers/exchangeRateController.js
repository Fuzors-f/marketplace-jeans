const { query, transaction } = require('../config/database');
const { logActivity } = require('../middleware/activityLogger');

// @desc    Get current exchange rates
// @route   GET /api/exchange-rates
// @access  Public
exports.getExchangeRates = async (req, res) => {
  try {
    const rates = await query(
      `SELECT 
        id, currency_from, currency_to, rate, is_active, updated_at,
        (SELECT full_name FROM users WHERE id = er.updated_by) as updated_by_name
      FROM exchange_rates er
      WHERE is_active = TRUE
      ORDER BY currency_from, currency_to`
    );

    res.json({
      success: true,
      data: rates
    });
  } catch (error) {
    console.error('Get exchange rates error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data kurs',
      error: error.message
    });
  }
};

// @desc    Get specific exchange rate (e.g., IDR to USD)
// @route   GET /api/exchange-rates/:from/:to
// @access  Public
exports.getExchangeRate = async (req, res) => {
  try {
    const { from, to } = req.params;

    const rates = await query(
      `SELECT id, currency_from, currency_to, rate, is_active, updated_at
       FROM exchange_rates
       WHERE currency_from = ? AND currency_to = ? AND is_active = TRUE`,
      [from.toUpperCase(), to.toUpperCase()]
    );

    if (rates.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Kurs tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: rates[0]
    });
  } catch (error) {
    console.error('Get exchange rate error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data kurs',
      error: error.message
    });
  }
};

// @desc    Update exchange rate (Admin)
// @route   PUT /api/exchange-rates/:id
// @access  Private (Admin)
exports.updateExchangeRate = async (req, res) => {
  try {
    const { id } = req.params;
    const { rate, reason } = req.body;

    if (!rate || rate <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Nilai kurs harus lebih dari 0'
      });
    }

    // Get current rate info
    const existingRates = await query(
      'SELECT id, currency_from, currency_to, rate FROM exchange_rates WHERE id = ?',
      [id]
    );

    if (existingRates.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Kurs tidak ditemukan'
      });
    }

    const existingRate = existingRates[0];
    const oldRate = existingRate.rate;

    await transaction(async (conn) => {
      // Update the exchange rate
      await conn.execute(
        'UPDATE exchange_rates SET rate = ?, updated_by = ? WHERE id = ?',
        [rate, req.user.id, id]
      );

      // Log the change
      await conn.execute(
        `INSERT INTO exchange_rate_logs 
         (exchange_rate_id, currency_from, currency_to, old_rate, new_rate, changed_by, change_reason)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, existingRate.currency_from, existingRate.currency_to, oldRate, rate, req.user.id, reason || null]
      );
    });

    await logActivity(req.user.id, 'update_exchange_rate', 'exchange_rate', id,
      `Updated ${existingRate.currency_from}/${existingRate.currency_to} from ${oldRate} to ${rate}`, req);

    res.json({
      success: true,
      message: 'Kurs berhasil diperbarui',
      data: {
        id,
        currency_from: existingRate.currency_from,
        currency_to: existingRate.currency_to,
        old_rate: oldRate,
        new_rate: rate
      }
    });
  } catch (error) {
    console.error('Update exchange rate error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui kurs',
      error: error.message
    });
  }
};

// @desc    Create new exchange rate (Admin)
// @route   POST /api/exchange-rates
// @access  Private (Admin)
exports.createExchangeRate = async (req, res) => {
  try {
    const { currency_from, currency_to, rate, reason } = req.body;

    if (!currency_from || !currency_to || !rate) {
      return res.status(400).json({
        success: false,
        message: 'currency_from, currency_to, dan rate wajib diisi'
      });
    }

    if (rate <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Nilai kurs harus lebih dari 0'
      });
    }

    // Check if currency pair already exists
    const existing = await query(
      'SELECT id FROM exchange_rates WHERE currency_from = ? AND currency_to = ?',
      [currency_from.toUpperCase(), currency_to.toUpperCase()]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Pasangan kurs ini sudah ada. Gunakan update untuk mengubah nilai.'
      });
    }

    let newId;
    await transaction(async (conn) => {
      // Create the exchange rate
      const [result] = await conn.execute(
        `INSERT INTO exchange_rates (currency_from, currency_to, rate, updated_by, is_active)
         VALUES (?, ?, ?, ?, TRUE)`,
        [currency_from.toUpperCase(), currency_to.toUpperCase(), rate, req.user.id]
      );
      newId = result.insertId;

      // Log the creation
      await conn.execute(
        `INSERT INTO exchange_rate_logs 
         (exchange_rate_id, currency_from, currency_to, old_rate, new_rate, changed_by, change_reason)
         VALUES (?, ?, ?, NULL, ?, ?, ?)`,
        [newId, currency_from.toUpperCase(), currency_to.toUpperCase(), rate, req.user.id, reason || 'Initial rate']
      );
    });

    await logActivity(req.user.id, 'create_exchange_rate', 'exchange_rate', newId,
      `Created ${currency_from}/${currency_to} rate: ${rate}`, req);

    res.status(201).json({
      success: true,
      message: 'Kurs berhasil ditambahkan',
      data: {
        id: newId,
        currency_from: currency_from.toUpperCase(),
        currency_to: currency_to.toUpperCase(),
        rate
      }
    });
  } catch (error) {
    console.error('Create exchange rate error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan kurs',
      error: error.message
    });
  }
};

// @desc    Get exchange rate logs (Admin)
// @route   GET /api/exchange-rates/logs
// @access  Private (Admin)
exports.getExchangeRateLogs = async (req, res) => {
  try {
    const { exchange_rate_id, limit = 50, offset = 0 } = req.query;

    let whereClause = '';
    let params = [];

    if (exchange_rate_id) {
      whereClause = 'WHERE erl.exchange_rate_id = ?';
      params.push(exchange_rate_id);
    }

    const logs = await query(
      `SELECT 
        erl.id, erl.exchange_rate_id, erl.currency_from, erl.currency_to,
        erl.old_rate, erl.new_rate, erl.change_reason, erl.created_at,
        u.full_name as changed_by_name
      FROM exchange_rate_logs erl
      LEFT JOIN users u ON erl.changed_by = u.id
      ${whereClause}
      ORDER BY erl.created_at DESC
      LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM exchange_rate_logs erl ${whereClause}`,
      params
    );

    res.json({
      success: true,
      data: logs,
      pagination: {
        total: countResult[0].total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Get exchange rate logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil log kurs',
      error: error.message
    });
  }
};

// @desc    Delete exchange rate (Admin)
// @route   DELETE /api/exchange-rates/:id
// @access  Private (Admin)
exports.deleteExchangeRate = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await query('SELECT id, currency_from, currency_to FROM exchange_rates WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Kurs tidak ditemukan'
      });
    }

    // Soft delete by setting is_active to false
    await query('UPDATE exchange_rates SET is_active = FALSE WHERE id = ?', [id]);

    await logActivity(req.user.id, 'delete_exchange_rate', 'exchange_rate', id,
      `Deactivated ${existing[0].currency_from}/${existing[0].currency_to}`, req);

    res.json({
      success: true,
      message: 'Kurs berhasil dinonaktifkan'
    });
  } catch (error) {
    console.error('Delete exchange rate error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus kurs',
      error: error.message
    });
  }
};

// @desc    Convert currency amount
// @route   GET /api/exchange-rates/convert
// @access  Public
exports.convertCurrency = async (req, res) => {
  try {
    const { amount, from = 'IDR', to = 'USD' } = req.query;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({
        success: false,
        message: 'Amount harus berupa angka'
      });
    }

    const rates = await query(
      `SELECT rate FROM exchange_rates 
       WHERE currency_from = ? AND currency_to = ? AND is_active = TRUE`,
      [from.toUpperCase(), to.toUpperCase()]
    );

    if (rates.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Kurs ${from}/${to} tidak ditemukan`
      });
    }

    const rate = parseFloat(rates[0].rate);
    const convertedAmount = parseFloat(amount) / rate;

    res.json({
      success: true,
      data: {
        original_amount: parseFloat(amount),
        original_currency: from.toUpperCase(),
        converted_amount: Math.round(convertedAmount * 100) / 100,
        converted_currency: to.toUpperCase(),
        rate: rate
      }
    });
  } catch (error) {
    console.error('Convert currency error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengkonversi mata uang',
      error: error.message
    });
  }
};
