const db = require('../config/database');

// Get all size charts with related info
exports.getAllSizeCharts = async (req, res) => {
  try {
    const { category_id, fitting_id } = req.query;
    
    let sql = `
      SELECT sc.*, s.name as size_name, c.name as category_name, f.name as fitting_name
      FROM size_charts sc
      LEFT JOIN sizes s ON sc.size_id = s.id
      LEFT JOIN categories c ON sc.category_id = c.id
      LEFT JOIN fittings f ON sc.fitting_id = f.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (category_id) {
      sql += ' AND sc.category_id = ?';
      params.push(category_id);
    }
    
    if (fitting_id) {
      sql += ' AND sc.fitting_id = ?';
      params.push(fitting_id);
    }
    
    sql += ' ORDER BY s.sort_order ASC, sc.id ASC';
    
    const [charts] = await db.query(sql, params);
    
    res.json({
      success: true,
      data: charts
    });
  } catch (error) {
    console.error('Get size charts error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data size chart' });
  }
};

// Get size chart by size, category, and fitting
exports.getSizeChart = async (req, res) => {
  try {
    const { sizeId, categoryId, fittingId } = req.params;
    
    const sql = `
      SELECT sc.*, s.name as size_name, c.name as category_name, f.name as fitting_name
      FROM size_charts sc
      LEFT JOIN sizes s ON sc.size_id = s.id
      LEFT JOIN categories c ON sc.category_id = c.id
      LEFT JOIN fittings f ON sc.fitting_id = f.id
      WHERE sc.size_id = ? AND (sc.category_id = ? OR sc.category_id IS NULL)
        AND (sc.fitting_id = ? OR sc.fitting_id IS NULL)
      LIMIT 1
    `;
    
    const [charts] = await db.query(sql, [sizeId, categoryId || null, fittingId || null]);
    
    if (charts.length === 0) {
      return res.status(404).json({ success: false, message: 'Size chart tidak ditemukan' });
    }
    
    res.json({
      success: true,
      data: charts[0]
    });
  } catch (error) {
    console.error('Get size chart error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data size chart' });
  }
};

// Get single size chart by ID
exports.getSizeChartById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const sql = `
      SELECT sc.*, s.name as size_name, c.name as category_name, f.name as fitting_name
      FROM size_charts sc
      LEFT JOIN sizes s ON sc.size_id = s.id
      LEFT JOIN categories c ON sc.category_id = c.id
      LEFT JOIN fittings f ON sc.fitting_id = f.id
      WHERE sc.id = ?
    `;
    
    const [charts] = await db.query(sql, [id]);
    
    if (charts.length === 0) {
      return res.status(404).json({ success: false, message: 'Size chart tidak ditemukan' });
    }
    
    res.json({
      success: true,
      data: charts[0]
    });
  } catch (error) {
    console.error('Get size chart by ID error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data size chart' });
  }
};

// Create size chart
exports.createSizeChart = async (req, res) => {
  try {
    const {
      size_id, category_id, fitting_id,
      waist_cm, hip_cm, inseam_cm, thigh_cm, knee_cm,
      leg_opening_cm, front_rise_cm, back_rise_cm, notes
    } = req.body;
    
    if (!size_id) {
      return res.status(400).json({ success: false, message: 'Size harus dipilih' });
    }
    
    // Check if size exists
    const [size] = await db.query('SELECT id FROM sizes WHERE id = ?', [size_id]);
    if (size.length === 0) {
      return res.status(400).json({ success: false, message: 'Size tidak ditemukan' });
    }
    
    // Check for duplicate
    const [existing] = await db.query(
      `SELECT id FROM size_charts 
       WHERE size_id = ? AND (category_id = ? OR (category_id IS NULL AND ? IS NULL))
       AND (fitting_id = ? OR (fitting_id IS NULL AND ? IS NULL))`,
      [size_id, category_id || null, category_id || null, fitting_id || null, fitting_id || null]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Size chart untuk kombinasi ini sudah ada' 
      });
    }
    
    const sql = `
      INSERT INTO size_charts (
        size_id, category_id, fitting_id,
        waist_cm, hip_cm, inseam_cm, thigh_cm, knee_cm,
        leg_opening_cm, front_rise_cm, back_rise_cm, notes, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true)
    `;
    
    const [result] = await db.query(sql, [
      size_id, category_id || null, fitting_id || null,
      waist_cm || null, hip_cm || null, inseam_cm || null, thigh_cm || null, knee_cm || null,
      leg_opening_cm || null, front_rise_cm || null, back_rise_cm || null, notes || null
    ]);
    
    res.status(201).json({
      success: true,
      message: 'Size chart berhasil ditambahkan',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Create size chart error:', error);
    res.status(500).json({ success: false, message: 'Gagal menambah size chart' });
  }
};

// Update size chart
exports.updateSizeChart = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      size_id, category_id, fitting_id,
      waist_cm, hip_cm, inseam_cm, thigh_cm, knee_cm,
      leg_opening_cm, front_rise_cm, back_rise_cm, notes, is_active
    } = req.body;
    
    // Check if exists
    const [existing] = await db.query('SELECT id FROM size_charts WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Size chart tidak ditemukan' });
    }
    
    // Check for duplicate (excluding current)
    if (size_id) {
      const [duplicate] = await db.query(
        `SELECT id FROM size_charts 
         WHERE id != ? AND size_id = ? 
         AND (category_id = ? OR (category_id IS NULL AND ? IS NULL))
         AND (fitting_id = ? OR (fitting_id IS NULL AND ? IS NULL))`,
        [id, size_id, category_id || null, category_id || null, fitting_id || null, fitting_id || null]
      );
      
      if (duplicate.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Size chart untuk kombinasi ini sudah ada' 
        });
      }
    }
    
    const sql = `
      UPDATE size_charts SET
        size_id = ?, category_id = ?, fitting_id = ?,
        waist_cm = ?, hip_cm = ?, inseam_cm = ?, thigh_cm = ?, knee_cm = ?,
        leg_opening_cm = ?, front_rise_cm = ?, back_rise_cm = ?, 
        notes = ?, is_active = ?
      WHERE id = ?
    `;
    
    await db.query(sql, [
      size_id, category_id || null, fitting_id || null,
      waist_cm || null, hip_cm || null, inseam_cm || null, thigh_cm || null, knee_cm || null,
      leg_opening_cm || null, front_rise_cm || null, back_rise_cm || null,
      notes || null, is_active !== undefined ? is_active : true, id
    ]);
    
    res.json({
      success: true,
      message: 'Size chart berhasil diperbarui'
    });
  } catch (error) {
    console.error('Update size chart error:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui size chart' });
  }
};

// Delete size chart
exports.deleteSizeChart = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await db.query('DELETE FROM size_charts WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Size chart tidak ditemukan' });
    }
    
    res.json({
      success: true,
      message: 'Size chart berhasil dihapus'
    });
  } catch (error) {
    console.error('Delete size chart error:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus size chart' });
  }
};

// Get complete size guide (for product page)
exports.getSizeGuide = async (req, res) => {
  try {
    const { categoryId, fittingId } = req.query;
    
    let sql = `
      SELECT sc.*, s.name as size_name, s.sort_order
      FROM size_charts sc
      JOIN sizes s ON sc.size_id = s.id
      WHERE sc.is_active = true AND s.is_active = true
    `;
    
    const params = [];
    
    if (categoryId) {
      sql += ' AND (sc.category_id = ? OR sc.category_id IS NULL)';
      params.push(categoryId);
    }
    
    if (fittingId) {
      sql += ' AND (sc.fitting_id = ? OR sc.fitting_id IS NULL)';
      params.push(fittingId);
    }
    
    sql += ' ORDER BY s.sort_order ASC';
    
    const [charts] = await db.query(sql, params);
    
    res.json({
      success: true,
      data: charts
    });
  } catch (error) {
    console.error('Get size guide error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil size guide' });
  }
};
