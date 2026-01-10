const { query, transaction } = require('../config/database');
const { logActivity, ACTION_TYPES } = require('../middleware/activityLogger');
const ExcelJS = require('exceljs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for Excel file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/imports');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `import-${Date.now()}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only Excel files are allowed'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

exports.uploadMiddleware = upload.single('file');

// @desc    Download product import template
// @route   GET /api/products/import/template
// @access  Private (Admin)
exports.downloadImportTemplate = async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    
    // Main Products Sheet
    const productSheet = workbook.addWorksheet('Products');
    productSheet.columns = [
      { header: 'nama_produk*', key: 'name', width: 30 },
      { header: 'deskripsi', key: 'description', width: 50 },
      { header: 'deskripsi_singkat', key: 'short_description', width: 30 },
      { header: 'sku*', key: 'sku', width: 15 },
      { header: 'harga_jual*', key: 'base_price', width: 15 },
      { header: 'harga_modal', key: 'cost_price', width: 15 },
      { header: 'berat_gram', key: 'weight', width: 12 },
      { header: 'kategori*', key: 'category', width: 20 },
      { header: 'fitting', key: 'fitting', width: 15 },
      { header: 'aktif', key: 'is_active', width: 10 },
      { header: 'featured', key: 'is_featured', width: 10 }
    ];

    // Style header
    productSheet.getRow(1).font = { bold: true };
    productSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    productSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Add example data
    productSheet.addRow({
      name: 'Celana Jeans Slim Fit',
      description: 'Celana jeans berkualitas tinggi dengan potongan slim fit',
      short_description: 'Jeans slim fit premium',
      sku: 'JNS-SLM-001',
      base_price: 350000,
      cost_price: 200000,
      weight: 500,
      category: 'Celana',
      fitting: 'Slim Fit',
      is_active: 'Ya',
      is_featured: 'Tidak'
    });

    productSheet.addRow({
      name: 'Celana Jeans Regular',
      description: 'Celana jeans nyaman dengan potongan regular',
      short_description: 'Jeans regular nyaman',
      sku: 'JNS-REG-001',
      base_price: 300000,
      cost_price: 180000,
      weight: 550,
      category: 'Celana',
      fitting: 'Regular',
      is_active: 'Ya',
      is_featured: 'Ya'
    });

    // Variants Sheet
    const variantSheet = workbook.addWorksheet('Variants');
    variantSheet.columns = [
      { header: 'sku_produk*', key: 'product_sku', width: 15 },
      { header: 'ukuran*', key: 'size', width: 12 },
      { header: 'gudang*', key: 'warehouse', width: 20 },
      { header: 'stok*', key: 'stock', width: 10 },
      { header: 'sku_varian', key: 'sku_variant', width: 20 },
      { header: 'harga_tambahan', key: 'additional_price', width: 15 },
      { header: 'harga_modal_varian', key: 'cost_price', width: 18 }
    ];

    variantSheet.getRow(1).font = { bold: true };
    variantSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF70AD47' }
    };
    variantSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Add example variants
    variantSheet.addRow({
      product_sku: 'JNS-SLM-001',
      size: '30',
      warehouse: 'Gudang Utama',
      stock: 50,
      sku_variant: 'JNS-SLM-001-30',
      additional_price: 0,
      cost_price: 200000
    });
    variantSheet.addRow({
      product_sku: 'JNS-SLM-001',
      size: '32',
      warehouse: 'Gudang Utama',
      stock: 45,
      sku_variant: 'JNS-SLM-001-32',
      additional_price: 0,
      cost_price: 200000
    });
    variantSheet.addRow({
      product_sku: 'JNS-SLM-001',
      size: '34',
      warehouse: 'Gudang Utama',
      stock: 30,
      sku_variant: 'JNS-SLM-001-34',
      additional_price: 10000,
      cost_price: 205000
    });

    // Reference Sheet - Categories, Fittings, Sizes, Warehouses
    const refSheet = workbook.addWorksheet('Reference Data');
    
    // Get reference data from database
    const categories = await query('SELECT name FROM categories WHERE is_active = true ORDER BY name');
    const fittings = await query('SELECT name FROM fittings WHERE is_active = true ORDER BY name');
    const sizes = await query('SELECT name FROM sizes WHERE is_active = true ORDER BY sort_order, name');
    const warehouses = await query('SELECT name FROM warehouses WHERE is_active = true ORDER BY name');

    refSheet.getCell('A1').value = 'KATEGORI';
    refSheet.getCell('B1').value = 'FITTING';
    refSheet.getCell('C1').value = 'UKURAN';
    refSheet.getCell('D1').value = 'GUDANG';
    
    refSheet.getRow(1).font = { bold: true };
    refSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFC000' }
    };

    categories.forEach((cat, i) => refSheet.getCell(`A${i + 2}`).value = cat.name);
    fittings.forEach((fit, i) => refSheet.getCell(`B${i + 2}`).value = fit.name);
    sizes.forEach((size, i) => refSheet.getCell(`C${i + 2}`).value = size.name);
    warehouses.forEach((wh, i) => refSheet.getCell(`D${i + 2}`).value = wh.name);

    refSheet.columns = [
      { width: 20 },
      { width: 20 },
      { width: 15 },
      { width: 25 }
    ];

    // Instructions Sheet
    const instructionSheet = workbook.addWorksheet('Petunjuk');
    instructionSheet.getColumn(1).width = 80;
    
    const instructions = [
      'PETUNJUK IMPORT PRODUK',
      '',
      '1. Sheet "Products" berisi data produk utama',
      '   - Kolom dengan tanda * wajib diisi',
      '   - SKU harus unik untuk setiap produk',
      '   - Kategori harus sesuai dengan data di sheet "Reference Data"',
      '   - Aktif/Featured diisi dengan "Ya" atau "Tidak"',
      '',
      '2. Sheet "Variants" berisi data varian (ukuran & stok)',
      '   - Setiap produk bisa memiliki banyak varian',
      '   - sku_produk harus sesuai dengan SKU di sheet Products',
      '   - Ukuran harus sesuai dengan data di sheet "Reference Data"',
      '   - Gudang harus sesuai dengan data di sheet "Reference Data"',
      '',
      '3. Sheet "Reference Data" berisi data master yang tersedia',
      '   - Gunakan nilai yang ada di sheet ini untuk mengisi kolom terkait',
      '',
      '4. Tips:',
      '   - Pastikan tidak ada spasi di awal/akhir nilai',
      '   - Harga dalam Rupiah (tanpa titik/koma)',
      '   - Berat dalam gram',
      '',
      '5. Setelah selesai mengisi, simpan file dan upload di menu Import Produk'
    ];

    instructions.forEach((text, i) => {
      instructionSheet.getCell(`A${i + 1}`).value = text;
      if (i === 0) {
        instructionSheet.getCell(`A${i + 1}`).font = { bold: true, size: 14 };
      }
    });

    // Set response headers
    const filename = `template-import-produk-${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Download template error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate template',
      error: error.message
    });
  }
};

// @desc    Import products from Excel
// @route   POST /api/products/import
// @access  Private (Admin)
exports.importProducts = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(req.file.path);

    const productSheet = workbook.getWorksheet('Products');
    const variantSheet = workbook.getWorksheet('Variants');

    if (!productSheet) {
      return res.status(400).json({
        success: false,
        message: 'Sheet "Products" not found in Excel file'
      });
    }

    // Get reference data
    const categories = await query('SELECT id, name FROM categories WHERE is_active = true');
    const fittings = await query('SELECT id, name FROM fittings WHERE is_active = true');
    const sizes = await query('SELECT id, name FROM sizes WHERE is_active = true');
    const warehouses = await query('SELECT id, name FROM warehouses WHERE is_active = true');

    const categoryMap = new Map(categories.map(c => [c.name.toLowerCase(), c.id]));
    const fittingMap = new Map(fittings.map(f => [f.name.toLowerCase(), f.id]));
    const sizeMap = new Map(sizes.map(s => [s.name.toLowerCase(), s.id]));
    const warehouseMap = new Map(warehouses.map(w => [w.name.toLowerCase(), w.id]));

    const results = {
      success: [],
      errors: [],
      skipped: []
    };

    // Process products
    const productMap = new Map(); // SKU -> product data
    const productRows = [];
    
    productSheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header
      
      const name = row.getCell(1).value?.toString()?.trim();
      const sku = row.getCell(4).value?.toString()?.trim();
      
      if (!name || !sku) {
        if (name || sku) {
          results.errors.push({
            row: rowNumber,
            sheet: 'Products',
            message: 'Nama produk dan SKU wajib diisi'
          });
        }
        return;
      }

      const categoryName = row.getCell(8).value?.toString()?.trim()?.toLowerCase();
      const fittingName = row.getCell(9).value?.toString()?.trim()?.toLowerCase();
      
      if (!categoryMap.has(categoryName)) {
        results.errors.push({
          row: rowNumber,
          sheet: 'Products',
          sku,
          message: `Kategori "${row.getCell(8).value}" tidak ditemukan`
        });
        return;
      }

      productRows.push({
        rowNumber,
        name,
        description: row.getCell(2).value?.toString()?.trim() || null,
        short_description: row.getCell(3).value?.toString()?.trim() || null,
        sku,
        base_price: parseFloat(row.getCell(5).value) || 0,
        cost_price: parseFloat(row.getCell(6).value) || 0,
        weight: parseFloat(row.getCell(7).value) || 0,
        category_id: categoryMap.get(categoryName),
        fitting_id: fittingName ? fittingMap.get(fittingName) : null,
        is_active: row.getCell(10).value?.toString()?.toLowerCase() !== 'tidak',
        is_featured: row.getCell(11).value?.toString()?.toLowerCase() === 'ya'
      });
    });

    // Process variants
    const variantRows = [];
    if (variantSheet) {
      variantSheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header

        const productSku = row.getCell(1).value?.toString()?.trim();
        const sizeName = row.getCell(2).value?.toString()?.trim()?.toLowerCase();
        const warehouseName = row.getCell(3).value?.toString()?.trim()?.toLowerCase();
        const stock = parseInt(row.getCell(4).value) || 0;

        if (!productSku || !sizeName || !warehouseName) {
          if (productSku || sizeName || warehouseName) {
            results.errors.push({
              row: rowNumber,
              sheet: 'Variants',
              message: 'SKU Produk, Ukuran, dan Gudang wajib diisi'
            });
          }
          return;
        }

        if (!sizeMap.has(sizeName)) {
          results.errors.push({
            row: rowNumber,
            sheet: 'Variants',
            message: `Ukuran "${row.getCell(2).value}" tidak ditemukan`
          });
          return;
        }

        if (!warehouseMap.has(warehouseName)) {
          results.errors.push({
            row: rowNumber,
            sheet: 'Variants',
            message: `Gudang "${row.getCell(3).value}" tidak ditemukan`
          });
          return;
        }

        variantRows.push({
          rowNumber,
          product_sku: productSku,
          size_id: sizeMap.get(sizeName),
          warehouse_id: warehouseMap.get(warehouseName),
          stock,
          sku_variant: row.getCell(5).value?.toString()?.trim() || null,
          additional_price: parseFloat(row.getCell(6).value) || 0,
          cost_price: parseFloat(row.getCell(7).value) || null
        });
      });
    }

    // Import to database
    await transaction(async (conn) => {
      for (const product of productRows) {
        try {
          // Check if SKU exists
          const [existing] = await conn.execute(
            'SELECT id FROM products WHERE sku = ?',
            [product.sku]
          );

          let productId;
          
          if (existing.length > 0) {
            // Update existing product
            productId = existing[0].id;
            await conn.execute(
              `UPDATE products SET 
                name = ?, description = ?, short_description = ?,
                base_price = ?, master_cost_price = ?, weight = ?,
                category_id = ?, fitting_id = ?, is_active = ?, is_featured = ?,
                updated_at = NOW()
              WHERE id = ?`,
              [
                product.name, product.description, product.short_description,
                product.base_price, product.cost_price, product.weight,
                product.category_id, product.fitting_id, product.is_active, product.is_featured,
                productId
              ]
            );
            results.success.push({
              row: product.rowNumber,
              sku: product.sku,
              action: 'updated',
              id: productId
            });
          } else {
            // Create slug
            const slug = product.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '') + '-' + Date.now();

            // Insert new product
            const [result] = await conn.execute(
              `INSERT INTO products 
                (name, slug, description, short_description, sku, base_price, master_cost_price, weight, category_id, fitting_id, is_active, is_featured)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                product.name, slug, product.description, product.short_description,
                product.sku, product.base_price, product.cost_price, product.weight,
                product.category_id, product.fitting_id, product.is_active, product.is_featured
              ]
            );
            productId = result.insertId;
            results.success.push({
              row: product.rowNumber,
              sku: product.sku,
              action: 'created',
              id: productId
            });
          }

          // Store product ID for variant processing
          productMap.set(product.sku, productId);
        } catch (error) {
          results.errors.push({
            row: product.rowNumber,
            sheet: 'Products',
            sku: product.sku,
            message: error.message
          });
        }
      }

      // Process variants
      for (const variant of variantRows) {
        try {
          const productId = productMap.get(variant.product_sku);
          
          if (!productId) {
            // Try to find product in database
            const [existingProduct] = await conn.execute(
              'SELECT id FROM products WHERE sku = ?',
              [variant.product_sku]
            );
            
            if (existingProduct.length === 0) {
              results.errors.push({
                row: variant.rowNumber,
                sheet: 'Variants',
                message: `Produk dengan SKU "${variant.product_sku}" tidak ditemukan`
              });
              continue;
            }
            
            productMap.set(variant.product_sku, existingProduct[0].id);
          }

          const finalProductId = productMap.get(variant.product_sku);

          // Check if variant exists
          const [existingVariant] = await conn.execute(
            'SELECT id FROM product_variants WHERE product_id = ? AND size_id = ? AND warehouse_id = ?',
            [finalProductId, variant.size_id, variant.warehouse_id]
          );

          if (existingVariant.length > 0) {
            // Update existing variant
            await conn.execute(
              `UPDATE product_variants SET 
                stock_quantity = ?, sku_variant = ?, additional_price = ?, 
                cost_price = COALESCE(?, cost_price), updated_at = NOW()
              WHERE id = ?`,
              [variant.stock, variant.sku_variant, variant.additional_price, variant.cost_price, existingVariant[0].id]
            );
          } else {
            // Generate SKU variant if not provided
            const skuVariant = variant.sku_variant || `${variant.product_sku}-${variant.size_id}-${variant.warehouse_id}`;
            
            // Insert new variant
            await conn.execute(
              `INSERT INTO product_variants 
                (product_id, size_id, warehouse_id, sku_variant, stock_quantity, additional_price, cost_price, is_active)
              VALUES (?, ?, ?, ?, ?, ?, ?, true)`,
              [finalProductId, variant.size_id, variant.warehouse_id, skuVariant, variant.stock, variant.additional_price, variant.cost_price]
            );
          }
        } catch (error) {
          results.errors.push({
            row: variant.rowNumber,
            sheet: 'Variants',
            product_sku: variant.product_sku,
            message: error.message
          });
        }
      }
    });

    // Log activity
    await logActivity(
      req.user.id,
      ACTION_TYPES.IMPORT_PRODUCTS,
      'product',
      null,
      `Imported ${results.success.length} products, ${results.errors.length} errors`,
      req,
      { 
        successCount: results.success.length, 
        errorCount: results.errors.length,
        filename: req.file.originalname
      }
    );

    // Clean up uploaded file
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Error deleting upload file:', err);
    });

    res.json({
      success: true,
      message: `Import selesai. ${results.success.length} produk berhasil, ${results.errors.length} error.`,
      data: results
    });
  } catch (error) {
    console.error('Import products error:', error);
    
    // Clean up uploaded file on error
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }

    res.status(500).json({
      success: false,
      message: 'Failed to import products',
      error: error.message
    });
  }
};
