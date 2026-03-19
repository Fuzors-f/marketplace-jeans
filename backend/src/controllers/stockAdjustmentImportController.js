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
    cb(null, `stock-adj-${Date.now()}-${file.originalname}`);
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
  limits: { fileSize: 10 * 1024 * 1024 }
});

exports.uploadMiddleware = upload.single('file');

// @desc    Download stock adjustment import template
// @route   GET /api/inventory/adjustment-import/template
// @access  Private (Admin, Admin Stok)
exports.downloadAdjustmentTemplate = async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();

    // ===================== Sheet 1: Adjustment =====================
    const adjSheet = workbook.addWorksheet('Stock Adjustment');
    adjSheet.columns = [
      { header: 'sku_variant*', key: 'sku_variant', width: 22 },
      { header: 'tipe*', key: 'type', width: 14 },
      { header: 'jumlah*', key: 'quantity', width: 12 },
      { header: 'catatan', key: 'notes', width: 40 }
    ];

    // Style header
    const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
    const headerFont = { bold: true, color: { argb: 'FFFFFFFF' } };
    adjSheet.getRow(1).eachCell(cell => {
      cell.fill = headerFill;
      cell.font = headerFont;
    });

    // Add example rows
    adjSheet.addRow({ sku_variant: 'CBJ-SLIM-001-28', type: 'in', quantity: 50, notes: 'Restok dari supplier' });
    adjSheet.addRow({ sku_variant: 'CBJ-SLIM-001-29', type: 'out', quantity: 5, notes: 'Barang rusak/defect' });
    adjSheet.addRow({ sku_variant: 'CBJ-SLIM-001-30', type: 'set', quantity: 100, notes: 'Stok opname - set ke 100' });

    // Add data validation for 'tipe' column
    adjSheet.getColumn('type').eachCell((cell, rowNumber) => {
      if (rowNumber > 1) {
        cell.dataValidation = {
          type: 'list',
          allowBlank: false,
          formulae: ['"in,out,set"']
        };
      }
    });
    // Also set validation for future rows
    for (let i = 5; i <= 1000; i++) {
      adjSheet.getCell(`B${i}`).dataValidation = {
        type: 'list',
        allowBlank: false,
        formulae: ['"in,out,set"']
      };
    }

    // ===================== Sheet 2: Reference Data =====================
    const refSheet = workbook.addWorksheet('Data Referensi');

    // Get all active variants with product, size, warehouse info
    const variants = await query(
      `SELECT 
        pv.sku_variant,
        p.name as product_name,
        p.sku as product_sku,
        s.name as size_name,
        w.name as warehouse_name,
        pv.stock_quantity as stok_saat_ini
      FROM product_variants pv
      JOIN products p ON pv.product_id = p.id
      LEFT JOIN sizes s ON pv.size_id = s.id
      LEFT JOIN warehouses w ON pv.warehouse_id = w.id
      WHERE pv.is_active = true
      ORDER BY p.name, s.name, w.name`
    );

    refSheet.columns = [
      { header: 'SKU Variant', key: 'sku_variant', width: 22 },
      { header: 'Produk', key: 'product_name', width: 30 },
      { header: 'SKU Produk', key: 'product_sku', width: 18 },
      { header: 'Ukuran', key: 'size_name', width: 10 },
      { header: 'Gudang', key: 'warehouse_name', width: 20 },
      { header: 'Stok Saat Ini', key: 'stok_saat_ini', width: 14 }
    ];

    const refHeaderFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
    refSheet.getRow(1).eachCell(cell => {
      cell.fill = refHeaderFill;
      cell.font = headerFont;
    });

    variants.forEach(v => refSheet.addRow(v));

    // ===================== Sheet 3: Petunjuk =====================
    const guideSheet = workbook.addWorksheet('Petunjuk');
    guideSheet.getColumn(1).width = 80;

    const instructions = [
      'PANDUAN IMPORT STOCK ADJUSTMENT',
      '',
      'Sheet "Stock Adjustment":',
      '  - sku_variant* : SKU variant produk (wajib). Lihat di sheet "Data Referensi".',
      '  - tipe*        : Tipe adjustment (wajib). Pilihan:',
      '      > in   = Tambah stok (stok masuk)',
      '      > out  = Kurangi stok (stok keluar)',
      '      > set  = Set stok ke jumlah tertentu (stock opname)',
      '  - jumlah*      : Jumlah yang di-adjust (wajib). Angka positif.',
      '      > Untuk tipe "in": jumlah yang ditambahkan',
      '      > Untuk tipe "out": jumlah yang dikurangi',
      '      > Untuk tipe "set": jumlah stok akhir',
      '  - catatan      : Catatan/keterangan adjustment (opsional)',
      '',
      'Sheet "Data Referensi":',
      '  - Berisi daftar semua variant produk yang aktif',
      '  - Gunakan kolom SKU Variant untuk mengisi sheet adjustment',
      '  - Kolom "Stok Saat Ini" menunjukkan stok saat template didownload',
      '',
      'CATATAN PENTING:',
      '  - Kolom bertanda * wajib diisi',
      '  - SKU Variant harus sesuai dengan data di "Data Referensi"',
      '  - Tipe "out": tidak bisa mengurangi lebih dari stok yang ada',
      '  - Tipe "set": tidak boleh negatif',
      '  - Setiap adjustment akan tercatat di riwayat pergerakan stok',
      '  - Satu SKU variant bisa muncul lebih dari sekali (diproses berurutan)'
    ];

    instructions.forEach((text, i) => {
      const row = guideSheet.getRow(i + 1);
      row.getCell(1).value = text;
      if (i === 0) {
        row.getCell(1).font = { bold: true, size: 14 };
      }
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=template-stock-adjustment.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Download template error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate template', error: error.message });
  }
};

// @desc    Import stock adjustments from Excel
// @route   POST /api/inventory/adjustment-import
// @access  Private (Admin, Admin Stok)
exports.importStockAdjustment = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(req.file.path);

    const adjSheet = workbook.getWorksheet('Stock Adjustment');
    if (!adjSheet) {
      return res.status(400).json({ success: false, message: 'Sheet "Stock Adjustment" tidak ditemukan di file Excel' });
    }

    // Parse rows
    const rows = [];
    adjSheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // skip header

      const sku_variant = row.getCell(1).value?.toString()?.trim();
      const type = row.getCell(2).value?.toString()?.trim()?.toLowerCase();
      const quantity = parseInt(row.getCell(3).value);
      const notes = row.getCell(4).value?.toString()?.trim() || '';

      if (!sku_variant && !type) return; // skip empty rows

      rows.push({ rowNumber, sku_variant, type, quantity, notes });
    });

    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Tidak ada data adjustment yang ditemukan di file' });
    }

    // Validate all rows first
    const results = { success: [], errors: [] };
    const validRows = [];

    for (const row of rows) {
      if (!row.sku_variant) {
        results.errors.push({ row: row.rowNumber, sku_variant: '-', message: 'SKU variant wajib diisi' });
        continue;
      }
      if (!['in', 'out', 'set'].includes(row.type)) {
        results.errors.push({ row: row.rowNumber, sku_variant: row.sku_variant, message: `Tipe "${row.type}" tidak valid. Gunakan: in, out, atau set` });
        continue;
      }
      if (isNaN(row.quantity) || row.quantity < 0) {
        results.errors.push({ row: row.rowNumber, sku_variant: row.sku_variant, message: 'Jumlah harus angka positif' });
        continue;
      }
      validRows.push(row);
    }

    // Collect unique SKU variants and fetch them all at once
    const uniqueSkus = [...new Set(validRows.map(r => r.sku_variant))];
    const placeholders = uniqueSkus.map(() => '?').join(',');

    let variantMap = new Map();
    if (uniqueSkus.length > 0) {
      const variantData = await query(
        `SELECT pv.id, pv.sku_variant, pv.stock_quantity, pv.cost_price, pv.product_id, pv.warehouse_id,
                p.name as product_name, s.name as size_name, w.name as warehouse_name
         FROM product_variants pv
         JOIN products p ON pv.product_id = p.id
         LEFT JOIN sizes s ON pv.size_id = s.id
         LEFT JOIN warehouses w ON pv.warehouse_id = w.id
         WHERE pv.sku_variant IN (${placeholders})`,
        uniqueSkus
      );
      variantData.forEach(v => variantMap.set(v.sku_variant, v));
    }

    // Validate SKU existence and stock availability
    const processRows = [];
    // Track running stock for each variant (in case same SKU appears multiple times)
    const runningStock = new Map();

    for (const row of validRows) {
      const variant = variantMap.get(row.sku_variant);
      if (!variant) {
        results.errors.push({ row: row.rowNumber, sku_variant: row.sku_variant, message: `SKU variant "${row.sku_variant}" tidak ditemukan` });
        continue;
      }

      // Get running stock (might have been adjusted by earlier rows)
      const currentStock = runningStock.has(variant.id) ? runningStock.get(variant.id) : variant.stock_quantity;

      let newStock;
      let quantityChange;

      if (row.type === 'in') {
        newStock = currentStock + row.quantity;
        quantityChange = row.quantity;
      } else if (row.type === 'out') {
        newStock = currentStock - row.quantity;
        quantityChange = -row.quantity;
        if (newStock < 0) {
          results.errors.push({
            row: row.rowNumber,
            sku_variant: row.sku_variant,
            message: `Stok tidak cukup. Stok saat ini: ${currentStock}, dikurangi: ${row.quantity}`
          });
          continue;
        }
      } else { // set
        newStock = row.quantity;
        quantityChange = row.quantity - currentStock;
      }

      runningStock.set(variant.id, newStock);

      processRows.push({
        ...row,
        variant_id: variant.id,
        product_id: variant.product_id,
        warehouse_id: variant.warehouse_id,
        cost_price: variant.cost_price,
        stock_before: currentStock,
        stock_after: newStock,
        quantity_change: quantityChange,
        product_name: variant.product_name,
        size_name: variant.size_name,
        warehouse_name: variant.warehouse_name
      });
    }

    if (processRows.length === 0 && results.errors.length > 0) {
      // Cleanup uploaded file
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({
        success: false,
        message: `Semua ${results.errors.length} baris memiliki error. Tidak ada data yang diproses.`,
        data: results
      });
    }

    // Execute all adjustments in a transaction
    await transaction(async (conn) => {
      for (const row of processRows) {
        // Update stock_quantity on product_variants
        await conn.execute(
          'UPDATE product_variants SET stock_quantity = ?, updated_at = NOW() WHERE id = ?',
          [row.stock_after, row.variant_id]
        );

        // Record inventory_movement
        const movementType = row.type === 'set' ? 'adjustment' : row.type === 'in' ? 'in' : 'out';
        await conn.execute(
          `INSERT INTO inventory_movements 
            (product_variant_id, type, quantity, cost_price, reference_type, notes, created_by, created_at)
          VALUES (?, ?, ?, ?, 'import_adjustment', ?, ?, NOW())`,
          [row.variant_id, movementType, row.quantity_change, row.cost_price, row.notes || `Import adjustment: ${row.type} ${row.quantity}`, req.user.id]
        );

        results.success.push({
          row: row.rowNumber,
          sku_variant: row.sku_variant,
          product_name: row.product_name,
          size_name: row.size_name,
          warehouse_name: row.warehouse_name,
          type: row.type,
          quantity: row.quantity,
          stock_before: row.stock_before,
          stock_after: row.stock_after
        });
      }
    });

    // Log activity
    await logActivity(
      req.user.id,
      ACTION_TYPES.STOCK_ADJUSTMENT,
      'inventory',
      null,
      `Import stock adjustment: ${results.success.length} berhasil, ${results.errors.length} error`,
      req,
      { successCount: results.success.length, errorCount: results.errors.length, filename: req.file.originalname }
    );

    // Clean up uploaded file
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Error deleting upload file:', err);
    });

    const summary = {
      total_processed: results.success.length,
      total_errors: results.errors.length,
      total_stock_in: results.success.filter(s => s.type === 'in').length,
      total_stock_out: results.success.filter(s => s.type === 'out').length,
      total_stock_set: results.success.filter(s => s.type === 'set').length
    };

    res.json({
      success: true,
      message: `Import selesai. ${results.success.length} adjustment berhasil, ${results.errors.length} error.`,
      data: { summary, ...results }
    });
  } catch (error) {
    console.error('Import stock adjustment error:', error);
    // Clean up uploaded file on error
    if (req.file?.path) {
      fs.unlink(req.file.path, () => {});
    }
    res.status(500).json({ success: false, message: 'Gagal melakukan import stock adjustment', error: error.message });
  }
};
