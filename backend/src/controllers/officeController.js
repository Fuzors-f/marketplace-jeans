const db = require('../config/database');

// Get all offices
exports.getAllOffices = async (req, res) => {
  try {
    const sql = `
      SELECT id, name, code, address, city, province, phone, email, 
             is_headquarters, is_active, created_at
      FROM offices 
      ORDER BY is_headquarters DESC, name ASC
    `;
    const [offices] = await db.query(sql);
    
    res.json({
      success: true,
      data: offices
    });
  } catch (error) {
    console.error('Get offices error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data kantor' });
  }
};

// Get single office
exports.getOffice = async (req, res) => {
  try {
    const { id } = req.params;
    
    const sql = `
      SELECT id, name, code, address, city, province, phone, email, 
             is_headquarters, is_active, created_at
      FROM offices WHERE id = ?
    `;
    const [offices] = await db.query(sql, [id]);
    
    if (offices.length === 0) {
      return res.status(404).json({ success: false, message: 'Kantor tidak ditemukan' });
    }
    
    res.json({
      success: true,
      data: offices[0]
    });
  } catch (error) {
    console.error('Get office error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data kantor' });
  }
};

// Create office
exports.createOffice = async (req, res) => {
  try {
    const { name, code, address, city, province, phone, email, is_headquarters } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, message: 'Nama kantor harus diisi' });
    }
    
    // Check if code already exists
    if (code) {
      const [existing] = await db.query('SELECT id FROM offices WHERE code = ?', [code]);
      if (existing.length > 0) {
        return res.status(400).json({ success: false, message: 'Kode kantor sudah digunakan' });
      }
    }
    
    // If new office is headquarters, unset previous headquarters
    if (is_headquarters) {
      await db.query('UPDATE offices SET is_headquarters = false WHERE is_headquarters = true');
    }
    
    const sql = `
      INSERT INTO offices (name, code, address, city, province, phone, email, is_headquarters, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, true)
    `;
    
    const [result] = await db.query(sql, [
      name, code || null, address || null, city || null, province || null, 
      phone || null, email || null, is_headquarters || false
    ]);
    
    res.status(201).json({
      success: true,
      message: 'Kantor berhasil ditambahkan',
      data: { id: result.insertId, name, code }
    });
  } catch (error) {
    console.error('Create office error:', error);
    res.status(500).json({ success: false, message: 'Gagal menambah kantor' });
  }
};

// Update office
exports.updateOffice = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, address, city, province, phone, email, is_headquarters, is_active } = req.body;
    
    // Check if office exists
    const [existing] = await db.query('SELECT id FROM offices WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Kantor tidak ditemukan' });
    }
    
    // Check if code is unique (excluding current office)
    if (code) {
      const [codeCheck] = await db.query('SELECT id FROM offices WHERE code = ? AND id != ?', [code, id]);
      if (codeCheck.length > 0) {
        return res.status(400).json({ success: false, message: 'Kode kantor sudah digunakan' });
      }
    }
    
    // If updating to headquarters, unset previous headquarters
    if (is_headquarters) {
      await db.query('UPDATE offices SET is_headquarters = false WHERE is_headquarters = true AND id != ?', [id]);
    }
    
    const sql = `
      UPDATE offices SET
        name = ?, code = ?, address = ?, city = ?, province = ?,
        phone = ?, email = ?, is_headquarters = ?, is_active = ?
      WHERE id = ?
    `;
    
    await db.query(sql, [
      name, code || null, address || null, city || null, province || null,
      phone || null, email || null, is_headquarters || false, 
      is_active !== undefined ? is_active : true, id
    ]);
    
    res.json({
      success: true,
      message: 'Kantor berhasil diperbarui'
    });
  } catch (error) {
    console.error('Update office error:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui kantor' });
  }
};

// Delete office
exports.deleteOffice = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if office has positions
    const [positions] = await db.query('SELECT id FROM positions WHERE office_id = ?', [id]);
    if (positions.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Tidak dapat menghapus kantor yang memiliki jabatan terkait' 
      });
    }
    
    const [result] = await db.query('DELETE FROM offices WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Kantor tidak ditemukan' });
    }
    
    res.json({
      success: true,
      message: 'Kantor berhasil dihapus'
    });
  } catch (error) {
    console.error('Delete office error:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus kantor' });
  }
};
