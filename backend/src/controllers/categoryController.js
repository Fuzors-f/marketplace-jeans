const { query } = require('../config/database');

// Check if gender column exists in a table (cached)
let _genderColumnCache = {};
const hasGenderColumn = async (table) => {
  if (_genderColumnCache[table] !== undefined) return _genderColumnCache[table];
  try {
    await query(`SELECT gender FROM ${table} LIMIT 1`);
    _genderColumnCache[table] = true;
  } catch (e) {
    _genderColumnCache[table] = false;
  }
  return _genderColumnCache[table];
};

// Simple CRUD operations for categories, fittings, sizes, etc.

// Categories
exports.getCategories = async (req, res) => {
  try {
    const { include_inactive, gender, parent_only, with_children } = req.query;
    const hasGender = await hasGenderColumn('categories');
    
    let conditions = [];
    let params = [];
    
    if (!include_inactive) {
      conditions.push('c.is_active = true');
    }
    
    if (gender && hasGender) {
      conditions.push('(c.gender = ? OR c.gender = ?)');
      params.push(gender, 'both');
    }
    
    if (parent_only === 'true') {
      conditions.push('c.parent_id IS NULL');
    }
    
    let sql = `SELECT c.*, pc.name as parent_name FROM categories c LEFT JOIN categories pc ON c.parent_id = pc.id`;
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY c.sort_order, c.name';
    
    const categories = await query(sql, params);
    
    // If with_children, structure as parent -> children
    if (with_children === 'true') {
      const parents = categories.filter(c => !c.parent_id);
      const structured = parents.map(parent => ({
        ...parent,
        children: categories.filter(c => c.parent_id === parent.id)
      }));
      return res.json({ success: true, data: structured });
    }
    
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, slug, description, parent_id, image_url, is_active, gender } = req.body;
    const hasGender = await hasGenderColumn('categories');
    
    // Validation
    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: 'Nama dan slug kategori wajib diisi'
      });
    }
    
    let insertSql, insertParams;
    if (hasGender) {
      insertSql = 'INSERT INTO categories (name, slug, description, parent_id, image_url, is_active, gender) VALUES (?, ?, ?, ?, ?, ?, ?)';
      insertParams = [name, slug, description || null, parent_id || null, image_url || null, is_active !== undefined ? is_active : true, gender || 'both'];
    } else {
      insertSql = 'INSERT INTO categories (name, slug, description, parent_id, image_url, is_active) VALUES (?, ?, ?, ?, ?, ?)';
      insertParams = [name, slug, description || null, parent_id || null, image_url || null, is_active !== undefined ? is_active : true];
    }
    
    const result = await query(insertSql, insertParams);
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

    const hasGender = await hasGenderColumn('categories');
    const allowedFields = ['name', 'slug', 'description', 'parent_id', 'image_url', 'is_active', 'sort_order'];
    if (hasGender) allowedFields.push('gender');
    
    allowedFields.forEach(field => {
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
