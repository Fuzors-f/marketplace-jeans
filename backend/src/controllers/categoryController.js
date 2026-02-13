const { query } = require('../config/database');

// Simple CRUD operations for categories, fittings, sizes, etc.

// Categories
exports.getCategories = async (req, res) => {
  try {
    const { include_inactive } = req.query;
    
    let sql = 'SELECT * FROM categories';
    if (!include_inactive) {
      sql += ' WHERE is_active = true';
    }
    sql += ' ORDER BY sort_order, name';
    
    const categories = await query(sql);
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, slug, description, parent_id, image_url, is_active } = req.body;
    
    // Validation
    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: 'Nama dan slug kategori wajib diisi'
      });
    }
    
    const result = await query(
      'INSERT INTO categories (name, slug, description, parent_id, image_url, is_active) VALUES (?, ?, ?, ?, ?, ?)',
      [name, slug, description || null, parent_id || null, image_url || null, is_active !== undefined ? is_active : true]
    );
    res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = [];
    const values = [];

    ['name', 'slug', 'description', 'parent_id', 'image_url', 'is_active', 'sort_order'].forEach(field => {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(req.body[field]);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    values.push(id);
    await query(`UPDATE categories SET ${updates.join(', ')} WHERE id = ?`, values);
    res.json({ success: true, message: 'Category updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM categories WHERE id = ?', [id]);
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
