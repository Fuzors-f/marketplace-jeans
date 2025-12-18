const db = require('../config/database');

// Get all positions with office info
exports.getAllPositions = async (req, res) => {
  try {
    const sql = `
      SELECT p.id, p.name, p.code, p.office_id, p.parent_id, p.level,
             p.description, p.is_active, p.created_at,
             o.name as office_name,
             pp.name as parent_name
      FROM positions p
      LEFT JOIN offices o ON p.office_id = o.id
      LEFT JOIN positions pp ON p.parent_id = pp.id
      ORDER BY p.office_id, p.level, p.name
    `;
    const [positions] = await db.query(sql);
    
    res.json({
      success: true,
      data: positions
    });
  } catch (error) {
    console.error('Get positions error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data jabatan' });
  }
};

// Get positions by office
exports.getPositionsByOffice = async (req, res) => {
  try {
    const { officeId } = req.params;
    
    const sql = `
      SELECT p.id, p.name, p.code, p.parent_id, p.level,
             p.description, p.is_active,
             pp.name as parent_name
      FROM positions p
      LEFT JOIN positions pp ON p.parent_id = pp.id
      WHERE p.office_id = ?
      ORDER BY p.level, p.name
    `;
    const [positions] = await db.query(sql, [officeId]);
    
    res.json({
      success: true,
      data: positions
    });
  } catch (error) {
    console.error('Get positions by office error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data jabatan' });
  }
};

// Get single position
exports.getPosition = async (req, res) => {
  try {
    const { id } = req.params;
    
    const sql = `
      SELECT p.id, p.name, p.code, p.office_id, p.parent_id, p.level,
             p.description, p.is_active, p.created_at,
             o.name as office_name,
             pp.name as parent_name
      FROM positions p
      LEFT JOIN offices o ON p.office_id = o.id
      LEFT JOIN positions pp ON p.parent_id = pp.id
      WHERE p.id = ?
    `;
    const [positions] = await db.query(sql, [id]);
    
    if (positions.length === 0) {
      return res.status(404).json({ success: false, message: 'Jabatan tidak ditemukan' });
    }
    
    res.json({
      success: true,
      data: positions[0]
    });
  } catch (error) {
    console.error('Get position error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data jabatan' });
  }
};

// Create position
exports.createPosition = async (req, res) => {
  try {
    const { name, code, office_id, parent_id, level, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, message: 'Nama jabatan harus diisi' });
    }
    
    // Check if code already exists
    if (code) {
      const [existing] = await db.query('SELECT id FROM positions WHERE code = ?', [code]);
      if (existing.length > 0) {
        return res.status(400).json({ success: false, message: 'Kode jabatan sudah digunakan' });
      }
    }
    
    // Validate office if provided
    if (office_id) {
      const [office] = await db.query('SELECT id FROM offices WHERE id = ?', [office_id]);
      if (office.length === 0) {
        return res.status(400).json({ success: false, message: 'Kantor tidak ditemukan' });
      }
    }
    
    // Validate parent if provided
    if (parent_id) {
      const [parent] = await db.query('SELECT id, level FROM positions WHERE id = ?', [parent_id]);
      if (parent.length === 0) {
        return res.status(400).json({ success: false, message: 'Jabatan atasan tidak ditemukan' });
      }
    }
    
    const sql = `
      INSERT INTO positions (name, code, office_id, parent_id, level, description, is_active)
      VALUES (?, ?, ?, ?, ?, ?, true)
    `;
    
    const [result] = await db.query(sql, [
      name, code || null, office_id || null, parent_id || null, level || 1, description || null
    ]);
    
    res.status(201).json({
      success: true,
      message: 'Jabatan berhasil ditambahkan',
      data: { id: result.insertId, name, code }
    });
  } catch (error) {
    console.error('Create position error:', error);
    res.status(500).json({ success: false, message: 'Gagal menambah jabatan' });
  }
};

// Update position
exports.updatePosition = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, office_id, parent_id, level, description, is_active } = req.body;
    
    // Check if position exists
    const [existing] = await db.query('SELECT id FROM positions WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Jabatan tidak ditemukan' });
    }
    
    // Check if code is unique (excluding current position)
    if (code) {
      const [codeCheck] = await db.query('SELECT id FROM positions WHERE code = ? AND id != ?', [code, id]);
      if (codeCheck.length > 0) {
        return res.status(400).json({ success: false, message: 'Kode jabatan sudah digunakan' });
      }
    }
    
    // Prevent self-referencing parent
    if (parent_id && parseInt(parent_id) === parseInt(id)) {
      return res.status(400).json({ success: false, message: 'Jabatan tidak bisa menjadi atasan diri sendiri' });
    }
    
    const sql = `
      UPDATE positions SET
        name = ?, code = ?, office_id = ?, parent_id = ?, 
        level = ?, description = ?, is_active = ?
      WHERE id = ?
    `;
    
    await db.query(sql, [
      name, code || null, office_id || null, parent_id || null,
      level || 1, description || null, is_active !== undefined ? is_active : true, id
    ]);
    
    res.json({
      success: true,
      message: 'Jabatan berhasil diperbarui'
    });
  } catch (error) {
    console.error('Update position error:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui jabatan' });
  }
};

// Delete position
exports.deletePosition = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if position has children
    const [children] = await db.query('SELECT id FROM positions WHERE parent_id = ?', [id]);
    if (children.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Tidak dapat menghapus jabatan yang memiliki sub-jabatan' 
      });
    }
    
    const [result] = await db.query('DELETE FROM positions WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Jabatan tidak ditemukan' });
    }
    
    res.json({
      success: true,
      message: 'Jabatan berhasil dihapus'
    });
  } catch (error) {
    console.error('Delete position error:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus jabatan' });
  }
};

// Get position hierarchy (tree structure)
exports.getPositionHierarchy = async (req, res) => {
  try {
    const { officeId } = req.query;
    
    let sql = `
      SELECT p.id, p.name, p.code, p.parent_id, p.level, p.office_id,
             o.name as office_name
      FROM positions p
      LEFT JOIN offices o ON p.office_id = o.id
      WHERE p.is_active = true
    `;
    
    const params = [];
    if (officeId) {
      sql += ' AND p.office_id = ?';
      params.push(officeId);
    }
    
    sql += ' ORDER BY p.level, p.name';
    
    const [positions] = await db.query(sql, params);
    
    // Build tree structure
    const buildTree = (items, parentId = null) => {
      return items
        .filter(item => item.parent_id === parentId)
        .map(item => ({
          ...item,
          children: buildTree(items, item.id)
        }));
    };
    
    const hierarchy = buildTree(positions);
    
    res.json({
      success: true,
      data: hierarchy
    });
  } catch (error) {
    console.error('Get position hierarchy error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil hierarki jabatan' });
  }
};
