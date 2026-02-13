const { query, transaction } = require('../config/database');
const { logActivity } = require('../middleware/activityLogger');

// @desc    Get all products with filters
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const {
      category,
      fitting,
      size,
      min_price,
      max_price,
      search,
      sort = 'created_at',
      order = 'DESC',
      page = 1,
      limit = 12,
      show_all // Admin flag to show all products including inactive
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = [];
    let params = [];

    // Only filter by active if not admin or not requesting all
    if (show_all !== 'true') {
      whereConditions.push('p.is_active = true');
    }

    // Build WHERE conditions
    if (category) {
      // Check if category is an ID (number) or a name/slug (string)
      if (!isNaN(category)) {
        whereConditions.push('p.category_id = ?');
        params.push(category);
      } else {
        // Search by category name or slug (case-insensitive, partial match)
        whereConditions.push('(c.name LIKE ? OR c.slug LIKE ?)');
        const categorySearch = `%${category.replace(/-/g, ' ')}%`;
        params.push(categorySearch, categorySearch);
      }
    }

    if (fitting) {
      whereConditions.push('p.fitting_id = ?');
      params.push(fitting);
    }

    if (size) {
      whereConditions.push('EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.size_id = ? AND pv.is_active = true)');
      params.push(size);
    }

    if (min_price) {
      whereConditions.push('p.base_price >= ?');
      params.push(min_price);
    }

    if (max_price) {
      whereConditions.push('p.base_price <= ?');
      params.push(max_price);
    }

    if (search) {
      whereConditions.push('(p.name LIKE ? OR p.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Validate sort column (prevent SQL injection)
    const validSortColumns = ['id', 'name', 'base_price', 'created_at', 'updated_at', 'view_count'];
    const sortColumn = validSortColumns.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Get total count (with JOIN for category name/slug filtering)
    const countResult = await query(
      `SELECT COUNT(DISTINCT p.id) as total 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // Get products
    const products = await query(
      `SELECT 
        p.id, p.name, p.slug, p.description, p.short_description,
        p.base_price, p.master_cost_price, p.sku, p.weight, p.is_active, p.is_featured,
        p.category_id, p.fitting_id,
        p.discount_percentage,
        p.discount_start_date,
        p.discount_end_date,
        CASE 
          WHEN p.discount_percentage IS NOT NULL 
            AND p.discount_percentage > 0 
            AND (p.discount_start_date IS NULL OR p.discount_start_date <= NOW())
            AND (p.discount_end_date IS NULL OR p.discount_end_date >= NOW())
          THEN ROUND(p.base_price * (1 - p.discount_percentage / 100), 0)
          ELSE NULL 
        END as discount_price,
        c.name as category_name, c.slug as category_slug,
        f.name as fitting_name, f.slug as fitting_slug,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as primary_image,
        (SELECT COUNT(*) FROM product_variants WHERE product_id = p.id AND is_active = true) as variants_count,
        (SELECT SUM(stock_quantity) FROM product_variants WHERE product_id = p.id AND is_active = true) as total_stock
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN fittings f ON p.fitting_id = f.id
      ${whereClause}
      GROUP BY p.id
      ORDER BY p.${sortColumn} ${sortOrder}
      LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:slug
// @access  Public
exports.getProduct = async (req, res) => {
  try {
    const { slug } = req.params;

    // Get product details
    const products = await query(
      `SELECT 
        p.*, 
        c.name as category_name, c.slug as category_slug,
        f.name as fitting_name, f.slug as fitting_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN fittings f ON p.fitting_id = f.id
      WHERE p.slug = ? AND p.is_active = true`,
      [slug]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const product = products[0];

    // Get product images
    const images = await query(
      'SELECT id, image_url, is_primary, alt_text FROM product_images WHERE product_id = ? ORDER BY sort_order, is_primary DESC',
      [product.id]
    );

    // Get product variants with sizes
    const variants = await query(
      `SELECT 
        pv.id, pv.sku_variant, pv.additional_price, pv.stock_quantity, pv.is_active,
        s.id as size_id, s.name as size_name
      FROM product_variants pv
      LEFT JOIN sizes s ON pv.size_id = s.id
      WHERE pv.product_id = ? AND pv.is_active = true
      ORDER BY s.sort_order`,
      [product.id]
    );

    // Update view count
    await query('UPDATE products SET view_count = view_count + 1 WHERE id = ?', [product.id]);

    res.json({
      success: true,
      data: {
        ...product,
        images,
        variants
      }
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private (Admin)
exports.createProduct = async (req, res) => {
  try {
    const {
      name, slug, category_id, fitting_id, description, short_description,
      base_price, master_cost_price, sku, weight, is_featured,
      meta_title, meta_description, meta_keywords, variants
    } = req.body;

    // Validation
    if (!name || !slug || !base_price) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, slug, and base price'
      });
    }

    // Check if slug exists
    const existingProduct = await query('SELECT id FROM products WHERE slug = ?', [slug]);
    if (existingProduct.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Product slug already exists'
      });
    }
    
    // Check if SKU exists (if provided)
    if (sku) {
      const existingSku = await query('SELECT id FROM products WHERE sku = ?', [sku]);
      if (existingSku.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'SKU sudah digunakan oleh produk lain'
        });
      }
    }

    const result = await transaction(async (conn) => {
      // Insert product
      const [productResult] = await conn.execute(
        `INSERT INTO products 
        (name, slug, category_id, fitting_id, description, short_description, 
         base_price, master_cost_price, sku, weight, is_featured,
         meta_title, meta_description, meta_keywords)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, slug, category_id || null, fitting_id || null, description || null,
         short_description || null, base_price, master_cost_price || null, sku || null,
         weight || 0, is_featured || false, meta_title || name,
         meta_description || short_description, meta_keywords || null]
      );

      const productId = productResult.insertId;

      // Insert variants if provided
      if (variants && Array.isArray(variants) && variants.length > 0) {
        for (const variant of variants) {
          await conn.execute(
            `INSERT INTO product_variants 
            (product_id, size_id, warehouse_id, sku_variant, additional_price, stock_quantity, minimum_stock, cost_price)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [productId, variant.size_id, variant.warehouse_id || 1, variant.sku_variant,
             variant.additional_price || 0, variant.stock_quantity || 0, variant.minimum_stock || 5, variant.cost_price || 0]
          );

          // Log inventory movement if stock > 0
          if (variant.stock_quantity > 0) {
            const [variantResult] = await conn.execute(
              'SELECT id FROM product_variants WHERE product_id = ? AND size_id = ?',
              [productId, variant.size_id]
            );

            await conn.execute(
              `INSERT INTO inventory_movements 
              (product_variant_id, type, quantity, reference_type, notes, created_by)
              VALUES (?, 'in', ?, 'initial_stock', 'Initial stock', ?)`,
              [variantResult[0].id, variant.stock_quantity, req.user.id]
            );
          }
        }
      }

      return productId;
    });

    await logActivity(req.user.id, 'create_product', 'product', result, `Created product: ${name}`, req);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { id: result }
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin)
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = [];
    const values = [];

    // Check SKU uniqueness if SKU is being updated
    if (req.body.sku) {
      const existingSku = await query(
        'SELECT id FROM products WHERE sku = ? AND id != ?',
        [req.body.sku, id]
      );
      if (existingSku.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'SKU sudah digunakan oleh produk lain'
        });
      }
    }
    
    // Check slug uniqueness if slug is being updated
    if (req.body.slug) {
      const existingSlug = await query(
        'SELECT id FROM products WHERE slug = ? AND id != ?',
        [req.body.slug, id]
      );
      if (existingSlug.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Slug sudah digunakan oleh produk lain'
        });
      }
    }

    const allowedFields = [
      'name', 'slug', 'category_id', 'fitting_id', 'description', 'short_description',
      'base_price', 'master_cost_price', 'sku', 'weight', 'is_active', 'is_featured',
      'meta_title', 'meta_description', 'meta_keywords'
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

    await query(
      `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    await logActivity(req.user.id, 'update_product', 'product', id, 'Updated product', req);

    res.json({
      success: true,
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin)
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    await query('DELETE FROM products WHERE id = ?', [id]);

    await logActivity(req.user.id, 'delete_product', 'product', id, 'Deleted product', req);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
};

// @desc    Bulk upload products
// @route   POST /api/products/bulk-upload
// @access  Private (Admin)
exports.bulkUpload = async (req, res) => {
  try {
    const { products } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of products'
      });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    for (const product of products) {
      try {
        await transaction(async (conn) => {
          // Insert product
          const [result] = await conn.execute(
            `INSERT INTO products 
            (name, slug, category_id, fitting_id, description, base_price, sku)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [product.name, product.slug, product.category_id || null,
             product.fitting_id || null, product.description || null,
             product.base_price, product.sku || null]
          );

          const productId = result.insertId;

          // Insert variants if provided
          if (product.variants && Array.isArray(product.variants)) {
            for (const variant of product.variants) {
              await conn.execute(
                `INSERT INTO product_variants 
                (product_id, size_id, warehouse_id, sku_variant, additional_price, stock_quantity, minimum_stock, cost_price)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [productId, variant.size_id, variant.warehouse_id || 1, variant.sku_variant,
                 variant.additional_price || 0, variant.stock_quantity || 0, variant.minimum_stock || 5, variant.cost_price || 0]
              );
            }
          }
        });

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          product: product.name,
          error: error.message
        });
      }
    }

    await logActivity(req.user.id, 'bulk_upload_products', 'product', null,
      `Bulk uploaded ${results.success} products`, req);

    res.json({
      success: true,
      message: 'Bulk upload completed',
      data: results
    });
  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during bulk upload',
      error: error.message
    });
  }
};

// @desc    Get product variants
// @route   GET /api/products/:productId/variants
// @access  Public
exports.getProductVariants = async (req, res) => {
  try {
    const { productId } = req.params;

    const variants = await query(
      `SELECT 
        pv.id, pv.sku_variant, pv.additional_price, pv.stock_quantity, pv.minimum_stock, pv.cost_price, pv.is_active,
        s.id as size_id, s.name as size_name,
        w.id as warehouse_id, w.name as warehouse_name
      FROM product_variants pv
      LEFT JOIN sizes s ON pv.size_id = s.id
      LEFT JOIN warehouses w ON pv.warehouse_id = w.id
      WHERE pv.product_id = ?
      ORDER BY s.sort_order, w.name`,
      [productId]
    );

    res.json({
      success: true,
      data: variants
    });
  } catch (error) {
    console.error('Get product variants error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product variants',
      error: error.message
    });
  }
};

// @desc    Add product variant
// @route   POST /api/products/:productId/variants
// @access  Private (Admin)
exports.addProductVariant = async (req, res) => {
  try {
    const { productId } = req.params;
    const { size_id, warehouse_id, sku_variant, additional_price, stock_quantity, minimum_stock, cost_price } = req.body;

    if (!size_id || !warehouse_id) {
      return res.status(400).json({
        success: false,
        message: 'Please provide size_id and warehouse_id'
      });
    }

    // Check if variant with same size and warehouse exists
    const existing = await query(
      'SELECT id FROM product_variants WHERE product_id = ? AND size_id = ? AND warehouse_id = ?',
      [productId, size_id, warehouse_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Variant with this size and warehouse already exists'
      });
    }

    const result = await transaction(async (conn) => {
      const [variantResult] = await conn.execute(
        `INSERT INTO product_variants 
        (product_id, size_id, warehouse_id, sku_variant, additional_price, stock_quantity, minimum_stock, cost_price)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [productId, size_id, warehouse_id, sku_variant || null, additional_price || 0, stock_quantity || 0, minimum_stock || 5, cost_price || 0]
      );

      // Log inventory movement if stock > 0
      if (stock_quantity > 0) {
        await conn.execute(
          `INSERT INTO inventory_movements 
          (product_variant_id, type, quantity, reference_type, notes, created_by)
          VALUES (?, 'in', ?, 'initial_stock', 'Initial stock for new variant', ?)`,
          [variantResult.insertId, stock_quantity, req.user.id]
        );
      }

      return variantResult.insertId;
    });

    await logActivity(req.user.id, 'add_product_variant', 'product_variant', result, 'Added product variant', req);

    res.status(201).json({
      success: true,
      message: 'Variant added successfully',
      data: { id: result }
    });
  } catch (error) {
    console.error('Add product variant error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding product variant',
      error: error.message
    });
  }
};

// @desc    Update product variant
// @route   PUT /api/products/variants/:variantId
// @access  Private (Admin)
exports.updateProductVariant = async (req, res) => {
  try {
    const { variantId } = req.params;
    const { sku_variant, additional_price, stock_quantity, is_active } = req.body;

    const updates = [];
    const values = [];

    if (sku_variant !== undefined) {
      updates.push('sku_variant = ?');
      values.push(sku_variant);
    }
    if (additional_price !== undefined) {
      updates.push('additional_price = ?');
      values.push(additional_price);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(is_active);
    }

    // Handle stock update with inventory movement
    if (stock_quantity !== undefined) {
      const currentVariant = await query(
        'SELECT stock_quantity FROM product_variants WHERE id = ?',
        [variantId]
      );

      if (currentVariant.length > 0) {
        const currentStock = currentVariant[0].stock_quantity;
        const stockDiff = stock_quantity - currentStock;

        if (stockDiff !== 0) {
          updates.push('stock_quantity = ?');
          values.push(stock_quantity);

          // Log inventory movement
          await query(
            `INSERT INTO inventory_movements 
            (product_variant_id, type, quantity, reference_type, notes, created_by)
            VALUES (?, ?, ?, 'adjustment', 'Manual stock adjustment', ?)`,
            [variantId, stockDiff > 0 ? 'in' : 'out', Math.abs(stockDiff), req.user.id]
          );
        }
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    values.push(variantId);

    await query(
      `UPDATE product_variants SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    await logActivity(req.user.id, 'update_product_variant', 'product_variant', variantId, 'Updated product variant', req);

    res.json({
      success: true,
      message: 'Variant updated successfully'
    });
  } catch (error) {
    console.error('Update product variant error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product variant',
      error: error.message
    });
  }
};

// @desc    Delete product variant
// @route   DELETE /api/products/variants/:variantId
// @access  Private (Admin)
exports.deleteProductVariant = async (req, res) => {
  try {
    const { variantId } = req.params;

    await query('DELETE FROM product_variants WHERE id = ?', [variantId]);

    await logActivity(req.user.id, 'delete_product_variant', 'product_variant', variantId, 'Deleted product variant', req);

    res.json({
      success: true,
      message: 'Variant deleted successfully'
    });
  } catch (error) {
    console.error('Delete product variant error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product variant',
      error: error.message
    });
  }
};

// @desc    Add product images
// @route   POST /api/products/:productId/images
// @access  Private/Admin
exports.addProductImages = async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Check if product exists
    const checkProduct = await query('SELECT id FROM products WHERE id = ?', [productId]);
    if (checkProduct.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images provided'
      });
    }

    // Check if product already has images to determine primary
    const existingImages = await query('SELECT COUNT(*) as count FROM product_images WHERE product_id = ?', [productId]);
    const hasExistingImages = existingImages[0].count > 0;

    const savedImages = [];
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const imagePath = `/uploads/products/${file.filename}`;
      
      // First image is primary only if no existing images
      const isPrimary = (!hasExistingImages && i === 0) ? 1 : 0;
      
      // Save to database (without filename column which doesn't exist)
      const result = await query(
        'INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES (?, ?, ?, ?)',
        [productId, imagePath, isPrimary, existingImages[0].count + i]
      );
      
      savedImages.push({
        id: result.insertId,
        filename: file.filename,
        url: imagePath,
        is_primary: isPrimary
      });
    }

    await logActivity(req.user?.id, 'ADD_PRODUCT_IMAGES', `Added ${savedImages.length} images to product ${productId}`);

    res.json({
      success: true,
      message: 'Images uploaded successfully',
      data: savedImages
    });
  } catch (error) {
    console.error('Add product images error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading images',
      error: error.message
    });
  }
};

// @desc    Get product images
// @route   GET /api/products/:productId/images
// @access  Public
exports.getProductImages = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const images = await query(
      'SELECT id, image_url as url, image_url as filename, is_primary, sort_order FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, sort_order ASC, created_at ASC',
      [productId]
    );

    res.json({
      success: true,
      data: images
    });
  } catch (error) {
    console.error('Get product images error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product images',
      error: error.message
    });
  }
};

// @desc    Delete product image
// @route   DELETE /api/products/:productId/images/:imageId
// @access  Private/Admin
exports.deleteProductImage = async (req, res) => {
  try {
    const { productId, imageId } = req.params;
    
    // Get image details
    const image = await query('SELECT id, image_url FROM product_images WHERE id = ? AND product_id = ?', [imageId, productId]);
    
    if (image.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Delete from database
    await query('DELETE FROM product_images WHERE id = ?', [imageId]);

    await logActivity(req.user?.id, 'DELETE_PRODUCT_IMAGE', `Deleted image from product ${productId}`);

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Delete product image error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting image',
      error: error.message
    });
  }
};
