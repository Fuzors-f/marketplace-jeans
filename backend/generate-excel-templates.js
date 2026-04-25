/**
 * Script untuk generate Excel template:
 * 1. template-import-produk.xlsx  — template input produk baru
 * 2. template-stock-produk.xlsx   — template update/adjustment stok
 *
 * Jalankan: node generate-excel-templates.js
 */

const ExcelJS = require('exceljs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..'); // root folder project

// ============================================================
// Warna tema
// ============================================================
const COLOR = {
  BLUE_HEADER:   'FF2563EB',
  GREEN_HEADER:  'FF16A34A',
  YELLOW_HEADER: 'FFD97706',
  GRAY_HEADER:   'FF374151',
  WHITE_FONT:    'FFFFFFFF',
  YELLOW_BG:     'FFFEF9C3',
  GREEN_BG:      'FFF0FDF4',
  BLUE_BG:       'FFEFF6FF',
  RED_BG:        'FFFEF2F2',
  BORDER_GRAY:   'FFD1D5DB',
};

function applyHeaderStyle(row, bgColor) {
  row.eachCell(cell => {
    cell.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
    cell.font   = { bold: true, color: { argb: COLOR.WHITE_FONT }, size: 11 };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: COLOR.BORDER_GRAY } },
      bottom: { style: 'thin', color: { argb: COLOR.BORDER_GRAY } },
      left: { style: 'thin', color: { argb: COLOR.BORDER_GRAY } },
      right: { style: 'thin', color: { argb: COLOR.BORDER_GRAY } },
    };
  });
  row.height = 30;
}

function applyDataRow(row, bgColor) {
  row.eachCell({ includeEmpty: true }, cell => {
    cell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
    cell.border = {
      top: { style: 'hair', color: { argb: COLOR.BORDER_GRAY } },
      bottom: { style: 'hair', color: { argb: COLOR.BORDER_GRAY } },
      left: { style: 'hair', color: { argb: COLOR.BORDER_GRAY } },
      right: { style: 'hair', color: { argb: COLOR.BORDER_GRAY } },
    };
    cell.alignment = { vertical: 'middle', wrapText: true };
  });
  row.height = 22;
}

// ============================================================
// 1. TEMPLATE IMPORT PRODUK
// ============================================================
async function generateProductTemplate() {
  const wb = new ExcelJS.Workbook();
  wb.creator  = 'Marketplace Jeans';
  wb.created  = new Date();

  // ── Sheet 1: Produk ──────────────────────────────────────
  const ws = wb.addWorksheet('Produk', { views: [{ state: 'frozen', ySplit: 1 }] });
  ws.columns = [
    { header: 'nama_produk *',        key: 'name',              width: 32 },
    { header: 'sku *',                key: 'sku',               width: 18 },
    { header: 'harga_jual *',         key: 'base_price',        width: 16 },
    { header: 'harga_modal',          key: 'master_cost_price', width: 16 },
    { header: 'berat_gram',           key: 'weight',            width: 14 },
    { header: 'kategori *',           key: 'category',          width: 22 },
    { header: 'fitting',              key: 'fitting',           width: 18 },
    { header: 'gender',               key: 'gender',            width: 12 },
    { header: 'deskripsi_singkat',    key: 'short_description', width: 40 },
    { header: 'deskripsi',            key: 'description',       width: 60 },
    { header: 'aktif (Ya/Tidak)',      key: 'is_active',         width: 16 },
    { header: 'featured (Ya/Tidak)',   key: 'is_featured',       width: 16 },
    { header: 'meta_title',           key: 'meta_title',        width: 30 },
    { header: 'meta_description',     key: 'meta_description',  width: 50 },
    { header: 'meta_keywords',        key: 'meta_keywords',     width: 30 },
  ];

  applyHeaderStyle(ws.getRow(1), COLOR.BLUE_HEADER);

  const products = [
    {
      name: 'Celana Jeans Slim Fit Pria Navy',
      sku: 'JNS-SLM-NAVY-001',
      base_price: 349000,
      master_cost_price: 195000,
      weight: 480,
      category: 'Slim Fit',
      fitting: 'Slim',
      gender: 'men',
      short_description: 'Celana jeans slim fit warna navy premium untuk pria',
      description: 'Celana jeans pria dengan bahan denim premium 14oz. Potongan slim fit modern, nyaman dipakai sepanjang hari. Cocok untuk casual maupun semi-formal.',
      is_active: 'Ya',
      is_featured: 'Ya',
      meta_title: 'Celana Jeans Slim Fit Pria Navy - Marketplace Jeans',
      meta_description: 'Beli celana jeans slim fit pria warna navy berkualitas premium. Harga terjangkau, gratis ongkir.',
      meta_keywords: 'jeans pria, slim fit, navy, celana denim',
    },
    {
      name: 'Celana Jeans Regular Fit Wanita Black',
      sku: 'JNS-REG-BLK-002',
      base_price: 299000,
      master_cost_price: 165000,
      weight: 510,
      category: 'Regular Fit',
      fitting: 'Regular',
      gender: 'women',
      short_description: 'Jeans regular fit wanita hitam klasik',
      description: 'Celana jeans wanita potongan regular fit. Bahan denim stretch 12oz yang nyaman dan fleksibel. Warna hitam pekat yang tidak mudah pudar.',
      is_active: 'Ya',
      is_featured: 'Tidak',
      meta_title: 'Celana Jeans Regular Fit Wanita Hitam',
      meta_description: 'Jeans wanita regular fit hitam berkualitas dengan harga terjangkau.',
      meta_keywords: 'jeans wanita, regular fit, hitam, celana denim wanita',
    },
    {
      name: 'Celana Jeans Skinny Pria Blue Wash',
      sku: 'JNS-SKN-BLW-003',
      base_price: 279000,
      master_cost_price: 155000,
      weight: 460,
      category: 'Skinny',
      fitting: 'Extra Slim',
      gender: 'men',
      short_description: 'Jeans skinny pria dengan efek blue wash kekinian',
      description: 'Celana jeans skinny dengan potongan super ketat, efek blue wash yang stylish. Bahan denim elastis 4-way stretch sangat nyaman dipakai.',
      is_active: 'Ya',
      is_featured: 'Ya',
      meta_title: 'Celana Jeans Skinny Pria Blue Wash',
      meta_description: 'Jeans skinny pria blue wash terbaru. Bahan stretch, nyaman dan stylish.',
      meta_keywords: 'jeans skinny, blue wash, pria, stretch',
    },
    {
      name: 'Celana Jeans Loose Fit Unisex Grey',
      sku: 'JNS-LSE-GRY-004',
      base_price: 319000,
      master_cost_price: 175000,
      weight: 540,
      category: 'Loose Fit',
      fitting: 'Loose',
      gender: 'both',
      short_description: 'Jeans loose fit unisex warna grey trendi',
      description: 'Celana jeans loose fit potongan santai untuk pria dan wanita. Warna grey elegan, cocok untuk tampilan streetwear modern.',
      is_active: 'Ya',
      is_featured: 'Tidak',
      meta_title: 'Celana Jeans Loose Fit Unisex Grey',
      meta_description: 'Jeans loose fit unisex warna grey, cocok untuk semua gender.',
      meta_keywords: 'jeans loose, unisex, grey, streetwear',
    },
    {
      name: 'Celana Jeans Mom Jeans Wanita Light Blue',
      sku: 'JNS-MOM-LBL-005',
      base_price: 329000,
      master_cost_price: 182000,
      weight: 495,
      category: 'Mom Jeans',
      fitting: 'Comfort',
      gender: 'women',
      short_description: 'Mom jeans wanita light blue retro aesthetic',
      description: 'Mom jeans klasik dengan potongan high waist. Bahan denim soft wash light blue yang memberikan nuansa retro dan aesthetic. Wajib dimiliki fashionista.',
      is_active: 'Ya',
      is_featured: 'Ya',
      meta_title: 'Mom Jeans Wanita Light Blue Retro',
      meta_description: 'Mom jeans wanita light blue aesthetic. High waist, retro look.',
      meta_keywords: 'mom jeans, wanita, light blue, high waist, retro',
    },
  ];

  products.forEach((p, i) => {
    const row = ws.addRow(p);
    applyDataRow(row, i % 2 === 0 ? COLOR.BLUE_BG : 'FFFFFFFF');
    // Format harga sebagai angka
    row.getCell('base_price').numFmt = '#,##0';
    row.getCell('master_cost_price').numFmt = '#,##0';
    row.getCell('weight').numFmt = '#,##0';
  });

  // Data validation: gender
  for (let r = 2; r <= 500; r++) {
    ws.getCell(`H${r}`).dataValidation = {
      type: 'list', allowBlank: true,
      formulae: ['"men,women,both"'],
      showDropDown: false,
    };
    ws.getCell(`K${r}`).dataValidation = {
      type: 'list', allowBlank: true,
      formulae: ['"Ya,Tidak"'],
    };
    ws.getCell(`L${r}`).dataValidation = {
      type: 'list', allowBlank: true,
      formulae: ['"Ya,Tidak"'],
    };
  }

  // ── Sheet 2: Varian ──────────────────────────────────────
  const wv = wb.addWorksheet('Varian', { views: [{ state: 'frozen', ySplit: 1 }] });
  wv.columns = [
    { header: 'sku_produk *',          key: 'product_sku',       width: 20 },
    { header: 'ukuran *',              key: 'size',              width: 10 },
    { header: 'gudang *',              key: 'warehouse',         width: 22 },
    { header: 'stok *',               key: 'stock',             width: 10 },
    { header: 'stok_minimum',         key: 'min_stock',         width: 14 },
    { header: 'sku_varian',           key: 'sku_variant',       width: 24 },
    { header: 'harga_tambahan',       key: 'additional_price',  width: 16 },
    { header: 'harga_modal_varian',   key: 'cost_price',        width: 18 },
  ];

  applyHeaderStyle(wv.getRow(1), COLOR.GREEN_HEADER);

  const variants = [
    // Produk 1 — JNS-SLM-NAVY-001
    { product_sku:'JNS-SLM-NAVY-001', size:'28', warehouse:'Jakarta Warehouse', stock:25, min_stock:5, sku_variant:'JNS-SLM-NAVY-001-28-JKT', additional_price:0, cost_price:195000 },
    { product_sku:'JNS-SLM-NAVY-001', size:'29', warehouse:'Jakarta Warehouse', stock:30, min_stock:5, sku_variant:'JNS-SLM-NAVY-001-29-JKT', additional_price:0, cost_price:195000 },
    { product_sku:'JNS-SLM-NAVY-001', size:'30', warehouse:'Jakarta Warehouse', stock:40, min_stock:5, sku_variant:'JNS-SLM-NAVY-001-30-JKT', additional_price:0, cost_price:195000 },
    { product_sku:'JNS-SLM-NAVY-001', size:'31', warehouse:'Jakarta Warehouse', stock:35, min_stock:5, sku_variant:'JNS-SLM-NAVY-001-31-JKT', additional_price:0, cost_price:195000 },
    { product_sku:'JNS-SLM-NAVY-001', size:'32', warehouse:'Jakarta Warehouse', stock:45, min_stock:5, sku_variant:'JNS-SLM-NAVY-001-32-JKT', additional_price:0, cost_price:195000 },
    { product_sku:'JNS-SLM-NAVY-001', size:'33', warehouse:'Jakarta Warehouse', stock:20, min_stock:5, sku_variant:'JNS-SLM-NAVY-001-33-JKT', additional_price:0, cost_price:195000 },
    { product_sku:'JNS-SLM-NAVY-001', size:'34', warehouse:'Jakarta Warehouse', stock:30, min_stock:5, sku_variant:'JNS-SLM-NAVY-001-34-JKT', additional_price:5000, cost_price:198000 },
    { product_sku:'JNS-SLM-NAVY-001', size:'36', warehouse:'Jakarta Warehouse', stock:15, min_stock:5, sku_variant:'JNS-SLM-NAVY-001-36-JKT', additional_price:5000, cost_price:198000 },
    { product_sku:'JNS-SLM-NAVY-001', size:'28', warehouse:'Bandung Warehouse', stock:15, min_stock:3, sku_variant:'JNS-SLM-NAVY-001-28-BDG', additional_price:0, cost_price:195000 },
    { product_sku:'JNS-SLM-NAVY-001', size:'30', warehouse:'Bandung Warehouse', stock:20, min_stock:3, sku_variant:'JNS-SLM-NAVY-001-30-BDG', additional_price:0, cost_price:195000 },
    { product_sku:'JNS-SLM-NAVY-001', size:'32', warehouse:'Bandung Warehouse', stock:25, min_stock:3, sku_variant:'JNS-SLM-NAVY-001-32-BDG', additional_price:0, cost_price:195000 },
    // Produk 2 — JNS-REG-BLK-002
    { product_sku:'JNS-REG-BLK-002', size:'27', warehouse:'Jakarta Warehouse', stock:20, min_stock:5, sku_variant:'JNS-REG-BLK-002-27-JKT', additional_price:0, cost_price:165000 },
    { product_sku:'JNS-REG-BLK-002', size:'28', warehouse:'Jakarta Warehouse', stock:35, min_stock:5, sku_variant:'JNS-REG-BLK-002-28-JKT', additional_price:0, cost_price:165000 },
    { product_sku:'JNS-REG-BLK-002', size:'29', warehouse:'Jakarta Warehouse', stock:40, min_stock:5, sku_variant:'JNS-REG-BLK-002-29-JKT', additional_price:0, cost_price:165000 },
    { product_sku:'JNS-REG-BLK-002', size:'30', warehouse:'Jakarta Warehouse', stock:50, min_stock:5, sku_variant:'JNS-REG-BLK-002-30-JKT', additional_price:0, cost_price:165000 },
    { product_sku:'JNS-REG-BLK-002', size:'31', warehouse:'Jakarta Warehouse', stock:45, min_stock:5, sku_variant:'JNS-REG-BLK-002-31-JKT', additional_price:0, cost_price:165000 },
    { product_sku:'JNS-REG-BLK-002', size:'32', warehouse:'Jakarta Warehouse', stock:30, min_stock:5, sku_variant:'JNS-REG-BLK-002-32-JKT', additional_price:0, cost_price:165000 },
    { product_sku:'JNS-REG-BLK-002', size:'28', warehouse:'Surabaya Warehouse', stock:18, min_stock:3, sku_variant:'JNS-REG-BLK-002-28-SBY', additional_price:0, cost_price:165000 },
    { product_sku:'JNS-REG-BLK-002', size:'30', warehouse:'Surabaya Warehouse', stock:22, min_stock:3, sku_variant:'JNS-REG-BLK-002-30-SBY', additional_price:0, cost_price:165000 },
    // Produk 3 — JNS-SKN-BLW-003
    { product_sku:'JNS-SKN-BLW-003', size:'28', warehouse:'Jakarta Warehouse', stock:20, min_stock:5, sku_variant:'JNS-SKN-BLW-003-28-JKT', additional_price:0, cost_price:155000 },
    { product_sku:'JNS-SKN-BLW-003', size:'29', warehouse:'Jakarta Warehouse', stock:25, min_stock:5, sku_variant:'JNS-SKN-BLW-003-29-JKT', additional_price:0, cost_price:155000 },
    { product_sku:'JNS-SKN-BLW-003', size:'30', warehouse:'Jakarta Warehouse', stock:30, min_stock:5, sku_variant:'JNS-SKN-BLW-003-30-JKT', additional_price:0, cost_price:155000 },
    { product_sku:'JNS-SKN-BLW-003', size:'31', warehouse:'Jakarta Warehouse', stock:28, min_stock:5, sku_variant:'JNS-SKN-BLW-003-31-JKT', additional_price:0, cost_price:155000 },
    { product_sku:'JNS-SKN-BLW-003', size:'32', warehouse:'Jakarta Warehouse', stock:22, min_stock:5, sku_variant:'JNS-SKN-BLW-003-32-JKT', additional_price:0, cost_price:155000 },
    // Produk 4 — JNS-LSE-GRY-004
    { product_sku:'JNS-LSE-GRY-004', size:'28', warehouse:'Jakarta Warehouse', stock:15, min_stock:5, sku_variant:'JNS-LSE-GRY-004-28-JKT', additional_price:0, cost_price:175000 },
    { product_sku:'JNS-LSE-GRY-004', size:'30', warehouse:'Jakarta Warehouse', stock:20, min_stock:5, sku_variant:'JNS-LSE-GRY-004-30-JKT', additional_price:0, cost_price:175000 },
    { product_sku:'JNS-LSE-GRY-004', size:'32', warehouse:'Jakarta Warehouse', stock:25, min_stock:5, sku_variant:'JNS-LSE-GRY-004-32-JKT', additional_price:0, cost_price:175000 },
    { product_sku:'JNS-LSE-GRY-004', size:'34', warehouse:'Jakarta Warehouse', stock:18, min_stock:5, sku_variant:'JNS-LSE-GRY-004-34-JKT', additional_price:0, cost_price:175000 },
    { product_sku:'JNS-LSE-GRY-004', size:'36', warehouse:'Jakarta Warehouse', stock:12, min_stock:5, sku_variant:'JNS-LSE-GRY-004-36-JKT', additional_price:5000, cost_price:178000 },
    // Produk 5 — JNS-MOM-LBL-005
    { product_sku:'JNS-MOM-LBL-005', size:'25', warehouse:'Jakarta Warehouse', stock:20, min_stock:5, sku_variant:'JNS-MOM-LBL-005-25-JKT', additional_price:0, cost_price:182000 },
    { product_sku:'JNS-MOM-LBL-005', size:'26', warehouse:'Jakarta Warehouse', stock:25, min_stock:5, sku_variant:'JNS-MOM-LBL-005-26-JKT', additional_price:0, cost_price:182000 },
    { product_sku:'JNS-MOM-LBL-005', size:'27', warehouse:'Jakarta Warehouse', stock:30, min_stock:5, sku_variant:'JNS-MOM-LBL-005-27-JKT', additional_price:0, cost_price:182000 },
    { product_sku:'JNS-MOM-LBL-005', size:'28', warehouse:'Jakarta Warehouse', stock:35, min_stock:5, sku_variant:'JNS-MOM-LBL-005-28-JKT', additional_price:0, cost_price:182000 },
    { product_sku:'JNS-MOM-LBL-005', size:'29', warehouse:'Jakarta Warehouse', stock:28, min_stock:5, sku_variant:'JNS-MOM-LBL-005-29-JKT', additional_price:0, cost_price:182000 },
    { product_sku:'JNS-MOM-LBL-005', size:'30', warehouse:'Jakarta Warehouse', stock:22, min_stock:5, sku_variant:'JNS-MOM-LBL-005-30-JKT', additional_price:0, cost_price:182000 },
  ];

  variants.forEach((v, i) => {
    const row = wv.addRow(v);
    applyDataRow(row, i % 2 === 0 ? COLOR.GREEN_BG : 'FFFFFFFF');
    row.getCell('stock').numFmt = '#,##0';
    row.getCell('min_stock').numFmt = '#,##0';
    row.getCell('additional_price').numFmt = '#,##0';
    row.getCell('cost_price').numFmt = '#,##0';
  });

  // ── Sheet 3: Referensi ────────────────────────────────────
  const wr = wb.addWorksheet('Data Referensi');
  wr.getCell('A1').value = 'KATEGORI';
  wr.getCell('B1').value = 'FITTING';
  wr.getCell('C1').value = 'UKURAN';
  wr.getCell('D1').value = 'GUDANG';
  wr.getCell('E1').value = 'GENDER';
  wr.getRow(1).eachCell(c => {
    c.fill = { type:'pattern', pattern:'solid', fgColor:{ argb: COLOR.YELLOW_HEADER } };
    c.font = { bold:true, color:{ argb: COLOR.WHITE_FONT }, size:11 };
    c.alignment = { horizontal:'center', vertical:'middle' };
    c.border = { bottom:{ style:'medium' } };
  });
  wr.getRow(1).height = 28;
  wr.columns = [
    { key:'cat', width:22 },
    { key:'fit', width:18 },
    { key:'sz',  width:12 },
    { key:'wh',  width:26 },
    { key:'gen', width:16 },
  ];

  const cats = ['Slim Fit','Regular Fit','Skinny','Loose Fit','Bootcut','Straight Leg','Mom Jeans','Distressed'];
  const fits = ['Extra Slim','Slim','Regular','Comfort','Loose'];
  const sizes = ['25','26','27','28','29','30','31','32','33','34','35','36','37','38','40','42'];
  const whs   = ['Jakarta Warehouse','Bandung Warehouse','Surabaya Warehouse'];
  const gens  = ['men','women','both'];

  const maxRows = Math.max(cats.length, fits.length, sizes.length, whs.length, gens.length);
  for (let i = 0; i < maxRows; i++) {
    const r = wr.addRow({});
    if (cats[i])  r.getCell(1).value = cats[i];
    if (fits[i])  r.getCell(2).value = fits[i];
    if (sizes[i]) r.getCell(3).value = sizes[i];
    if (whs[i])   r.getCell(4).value = whs[i];
    if (gens[i])  r.getCell(5).value = gens[i];
    r.height = 20;
  }

  // ── Sheet 4: Petunjuk ────────────────────────────────────
  const wp = wb.addWorksheet('Petunjuk');
  wp.getColumn(1).width = 80;

  const lines = [
    'PETUNJUK PENGISIAN TEMPLATE IMPORT PRODUK',
    '',
    '═══════════════════════════════════════════════',
    'SHEET "Produk" — Data produk utama',
    '═══════════════════════════════════════════════',
    '  nama_produk *       : Nama produk (wajib, max 255 karakter)',
    '  sku *               : Kode unik produk (wajib, contoh: JNS-SLM-001)',
    '  harga_jual *        : Harga jual dalam Rupiah, tanpa titik/koma (wajib)',
    '  harga_modal         : Harga modal/HPP dalam Rupiah',
    '  berat_gram          : Berat produk dalam gram (untuk hitung ongkir)',
    '  kategori *          : Nama kategori (wajib) — lihat sheet "Data Referensi"',
    '  fitting             : Jenis fitting — lihat sheet "Data Referensi"',
    '  gender              : men | women | both',
    '  deskripsi_singkat   : Deskripsi pendek (muncul di list produk)',
    '  deskripsi           : Deskripsi lengkap produk',
    '  aktif               : Ya atau Tidak',
    '  featured            : Ya atau Tidak (tampil di halaman utama)',
    '  meta_title          : Judul SEO',
    '  meta_description    : Deskripsi SEO (max 160 karakter)',
    '  meta_keywords       : Kata kunci SEO, pisahkan dengan koma',
    '',
    '═══════════════════════════════════════════════',
    'SHEET "Varian" — Ukuran, stok, dan gudang per produk',
    '═══════════════════════════════════════════════',
    '  sku_produk *        : Harus sesuai dengan SKU di sheet "Produk"',
    '  ukuran *            : Nomor ukuran — lihat sheet "Data Referensi"',
    '  gudang *            : Nama gudang — lihat sheet "Data Referensi"',
    '  stok *              : Jumlah stok awal',
    '  stok_minimum        : Batas minimum stok sebelum notifikasi (default: 5)',
    '  sku_varian          : SKU varian (opsional, akan digenerate otomatis jika kosong)',
    '  harga_tambahan      : Selisih harga dari harga jual (isi 0 jika sama)',
    '  harga_modal_varian  : Harga modal khusus varian ini',
    '',
    '  ⚠️  Satu produk WAJIB memiliki minimal 1 varian',
    '  ⚠️  Satu produk + ukuran + gudang = 1 baris varian',
    '',
    '═══════════════════════════════════════════════',
    'CATATAN UMUM',
    '═══════════════════════════════════════════════',
    '  • Kolom bertanda * WAJIB diisi',
    '  • SKU produk harus unik (tidak boleh duplikat)',
    '  • Harga dalam Rupiah — contoh: 350000 (bukan 350.000)',
    '  • Pastikan nama kategori/fitting/ukuran/gudang PERSIS sama dengan',
    '    data di sheet "Data Referensi" (case-insensitive)',
    '  • Simpan file dalam format .xlsx sebelum diupload',
    '  • Upload melalui Admin Panel → Produk → Import Produk',
  ];

  lines.forEach((txt, i) => {
    const cell = wp.getCell(`A${i + 1}`);
    cell.value = txt;
    cell.alignment = { wrapText: true };
    if (i === 0) {
      cell.font = { bold: true, size: 14, color: { argb: COLOR.BLUE_HEADER } };
    } else if (txt.startsWith('═')) {
      cell.font = { bold: true, color: { argb: COLOR.GRAY_HEADER } };
    }
  });

  // Simpan file
  const outPath = path.join(OUTPUT_DIR, 'template-import-produk.xlsx');
  await wb.xlsx.writeFile(outPath);
  console.log('✅  template-import-produk.xlsx  →', outPath);
}

// ============================================================
// 2. TEMPLATE STOCK PRODUK (Adjustment)
// ============================================================
async function generateStockTemplate() {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Marketplace Jeans';
  wb.created = new Date();

  // ── Sheet 1: Stock Adjustment ────────────────────────────
  const ws = wb.addWorksheet('Stock Adjustment', { views: [{ state: 'frozen', ySplit: 1 }] });
  ws.columns = [
    { header: 'sku_variant *',  key: 'sku_variant', width: 28 },
    { header: 'tipe * (in/out/set)', key: 'type',   width: 20 },
    { header: 'jumlah *',       key: 'quantity',    width: 12 },
    { header: 'harga_modal',    key: 'cost_price',  width: 16 },
    { header: 'catatan',        key: 'notes',       width: 50 },
  ];

  applyHeaderStyle(ws.getRow(1), COLOR.GREEN_HEADER);

  const adjustments = [
    // Restok masuk dari supplier
    { sku_variant:'JNS-SLM-NAVY-001-30-JKT', type:'in',  quantity:50, cost_price:195000, notes:'Restok dari supplier - PO-20260424-001' },
    { sku_variant:'JNS-SLM-NAVY-001-32-JKT', type:'in',  quantity:40, cost_price:195000, notes:'Restok dari supplier - PO-20260424-001' },
    { sku_variant:'JNS-SLM-NAVY-001-34-JKT', type:'in',  quantity:30, cost_price:198000, notes:'Restok dari supplier - PO-20260424-001' },
    { sku_variant:'JNS-REG-BLK-002-30-JKT',  type:'in',  quantity:60, cost_price:165000, notes:'Restok dari supplier - PO-20260424-002' },
    { sku_variant:'JNS-REG-BLK-002-32-JKT',  type:'in',  quantity:55, cost_price:165000, notes:'Restok dari supplier - PO-20260424-002' },
    { sku_variant:'JNS-SKN-BLW-003-30-JKT',  type:'in',  quantity:35, cost_price:155000, notes:'Kedatangan barang baru batch April 2026' },
    // Pengurangan stok (barang rusak/defect)
    { sku_variant:'JNS-SLM-NAVY-001-29-JKT', type:'out', quantity:3,  cost_price:'',     notes:'Barang rusak - koyak pada jahitan' },
    { sku_variant:'JNS-REG-BLK-002-28-JKT',  type:'out', quantity:2,  cost_price:'',     notes:'Barang defect - warna tidak merata' },
    { sku_variant:'JNS-MOM-LBL-005-28-JKT',  type:'out', quantity:1,  cost_price:'',     notes:'Barang hilang - dikonfirmasi setelah stock opname' },
    // Koreksi stok (stock opname)
    { sku_variant:'JNS-LSE-GRY-004-30-JKT',  type:'set', quantity:18, cost_price:'',     notes:'Stock opname tgl 24 April 2026 - koreksi ke stok fisik' },
    { sku_variant:'JNS-LSE-GRY-004-32-JKT',  type:'set', quantity:23, cost_price:'',     notes:'Stock opname tgl 24 April 2026 - koreksi ke stok fisik' },
    { sku_variant:'JNS-MOM-LBL-005-27-JKT',  type:'set', quantity:29, cost_price:'',     notes:'Stock opname tgl 24 April 2026 - koreksi ke stok fisik' },
    // Transfer antar gudang (contoh: kurangi di satu gudang, tambah di gudang lain)
    { sku_variant:'JNS-SLM-NAVY-001-30-BDG',  type:'out', quantity:10, cost_price:'',    notes:'Transfer ke Jakarta Warehouse - pengiriman no.TRF-20260424-01' },
    { sku_variant:'JNS-SLM-NAVY-001-30-JKT',  type:'in',  quantity:10, cost_price:195000, notes:'Terima transfer dari Bandung Warehouse - TRF-20260424-01' },
  ];

  adjustments.forEach((a, i) => {
    const row = ws.addRow(a);
    // Warna berbeda per tipe
    let bg = 'FFFFFFFF';
    if (a.type === 'in')  bg = COLOR.GREEN_BG;
    if (a.type === 'out') bg = COLOR.RED_BG;
    if (a.type === 'set') bg = COLOR.YELLOW_BG;
    applyDataRow(row, bg);
    if (a.cost_price !== '') row.getCell('cost_price').numFmt = '#,##0';
    row.getCell('quantity').numFmt = '#,##0';
  });

  // Data validation untuk kolom tipe
  for (let r = 2; r <= 1000; r++) {
    ws.getCell(`B${r}`).dataValidation = {
      type: 'list', allowBlank: false,
      formulae: ['"in,out,set"'],
    };
  }

  // Legend warna
  const legendRow = ws.getRow(adjustments.length + 3);
  ws.getCell(`A${adjustments.length + 3}`).value = 'KETERANGAN WARNA:';
  ws.getCell(`A${adjustments.length + 3}`).font = { bold: true };
  ws.getCell(`A${adjustments.length + 4}`).value = '🟢 Hijau = in (stok masuk/bertambah)';
  ws.getCell(`A${adjustments.length + 5}`).value = '🔴 Merah = out (stok keluar/berkurang)';
  ws.getCell(`A${adjustments.length + 6}`).value = '🟡 Kuning = set (koreksi stok - set ke angka tertentu)';

  // ── Sheet 2: Data Referensi Varian ───────────────────────
  const wr = wb.addWorksheet('Data Referensi Varian', { views: [{ state: 'frozen', ySplit: 1 }] });
  wr.columns = [
    { header: 'SKU Variant',        key: 'sku_variant',     width: 28 },
    { header: 'Nama Produk',        key: 'product_name',    width: 36 },
    { header: 'SKU Produk',         key: 'product_sku',     width: 20 },
    { header: 'Ukuran',             key: 'size',            width: 10 },
    { header: 'Gudang',             key: 'warehouse',       width: 24 },
    { header: 'Stok Saat Ini',      key: 'stock',           width: 14 },
    { header: 'Stok Minimum',       key: 'min_stock',       width: 14 },
    { header: 'Harga Jual',         key: 'base_price',      width: 14 },
    { header: 'Harga Modal',        key: 'cost_price',      width: 14 },
  ];

  applyHeaderStyle(wr.getRow(1), COLOR.BLUE_HEADER);

  // Data referensi contoh (dalam implementasi nyata diambil dari DB)
  const refData = [
    { sku_variant:'JNS-SLM-NAVY-001-28-JKT', product_name:'Celana Jeans Slim Fit Pria Navy', product_sku:'JNS-SLM-NAVY-001', size:'28', warehouse:'Jakarta Warehouse', stock:25, min_stock:5, base_price:349000, cost_price:195000 },
    { sku_variant:'JNS-SLM-NAVY-001-29-JKT', product_name:'Celana Jeans Slim Fit Pria Navy', product_sku:'JNS-SLM-NAVY-001', size:'29', warehouse:'Jakarta Warehouse', stock:30, min_stock:5, base_price:349000, cost_price:195000 },
    { sku_variant:'JNS-SLM-NAVY-001-30-JKT', product_name:'Celana Jeans Slim Fit Pria Navy', product_sku:'JNS-SLM-NAVY-001', size:'30', warehouse:'Jakarta Warehouse', stock:40, min_stock:5, base_price:349000, cost_price:195000 },
    { sku_variant:'JNS-SLM-NAVY-001-31-JKT', product_name:'Celana Jeans Slim Fit Pria Navy', product_sku:'JNS-SLM-NAVY-001', size:'31', warehouse:'Jakarta Warehouse', stock:35, min_stock:5, base_price:349000, cost_price:195000 },
    { sku_variant:'JNS-SLM-NAVY-001-32-JKT', product_name:'Celana Jeans Slim Fit Pria Navy', product_sku:'JNS-SLM-NAVY-001', size:'32', warehouse:'Jakarta Warehouse', stock:45, min_stock:5, base_price:349000, cost_price:195000 },
    { sku_variant:'JNS-SLM-NAVY-001-34-JKT', product_name:'Celana Jeans Slim Fit Pria Navy', product_sku:'JNS-SLM-NAVY-001', size:'34', warehouse:'Jakarta Warehouse', stock:30, min_stock:5, base_price:354000, cost_price:198000 },
    { sku_variant:'JNS-SLM-NAVY-001-28-BDG', product_name:'Celana Jeans Slim Fit Pria Navy', product_sku:'JNS-SLM-NAVY-001', size:'28', warehouse:'Bandung Warehouse',  stock:15, min_stock:3, base_price:349000, cost_price:195000 },
    { sku_variant:'JNS-SLM-NAVY-001-30-BDG', product_name:'Celana Jeans Slim Fit Pria Navy', product_sku:'JNS-SLM-NAVY-001', size:'30', warehouse:'Bandung Warehouse',  stock:20, min_stock:3, base_price:349000, cost_price:195000 },
    { sku_variant:'JNS-REG-BLK-002-28-JKT', product_name:'Celana Jeans Regular Fit Wanita Black', product_sku:'JNS-REG-BLK-002', size:'28', warehouse:'Jakarta Warehouse', stock:35, min_stock:5, base_price:299000, cost_price:165000 },
    { sku_variant:'JNS-REG-BLK-002-29-JKT', product_name:'Celana Jeans Regular Fit Wanita Black', product_sku:'JNS-REG-BLK-002', size:'29', warehouse:'Jakarta Warehouse', stock:40, min_stock:5, base_price:299000, cost_price:165000 },
    { sku_variant:'JNS-REG-BLK-002-30-JKT', product_name:'Celana Jeans Regular Fit Wanita Black', product_sku:'JNS-REG-BLK-002', size:'30', warehouse:'Jakarta Warehouse', stock:50, min_stock:5, base_price:299000, cost_price:165000 },
    { sku_variant:'JNS-REG-BLK-002-32-JKT', product_name:'Celana Jeans Regular Fit Wanita Black', product_sku:'JNS-REG-BLK-002', size:'32', warehouse:'Jakarta Warehouse', stock:30, min_stock:5, base_price:299000, cost_price:165000 },
    { sku_variant:'JNS-REG-BLK-002-28-SBY', product_name:'Celana Jeans Regular Fit Wanita Black', product_sku:'JNS-REG-BLK-002', size:'28', warehouse:'Surabaya Warehouse', stock:18, min_stock:3, base_price:299000, cost_price:165000 },
    { sku_variant:'JNS-SKN-BLW-003-28-JKT', product_name:'Celana Jeans Skinny Pria Blue Wash', product_sku:'JNS-SKN-BLW-003', size:'28', warehouse:'Jakarta Warehouse', stock:20, min_stock:5, base_price:279000, cost_price:155000 },
    { sku_variant:'JNS-SKN-BLW-003-30-JKT', product_name:'Celana Jeans Skinny Pria Blue Wash', product_sku:'JNS-SKN-BLW-003', size:'30', warehouse:'Jakarta Warehouse', stock:30, min_stock:5, base_price:279000, cost_price:155000 },
    { sku_variant:'JNS-LSE-GRY-004-30-JKT', product_name:'Celana Jeans Loose Fit Unisex Grey', product_sku:'JNS-LSE-GRY-004', size:'30', warehouse:'Jakarta Warehouse', stock:20, min_stock:5, base_price:319000, cost_price:175000 },
    { sku_variant:'JNS-LSE-GRY-004-32-JKT', product_name:'Celana Jeans Loose Fit Unisex Grey', product_sku:'JNS-LSE-GRY-004', size:'32', warehouse:'Jakarta Warehouse', stock:25, min_stock:5, base_price:319000, cost_price:175000 },
    { sku_variant:'JNS-MOM-LBL-005-27-JKT', product_name:'Celana Jeans Mom Jeans Wanita Light Blue', product_sku:'JNS-MOM-LBL-005', size:'27', warehouse:'Jakarta Warehouse', stock:30, min_stock:5, base_price:329000, cost_price:182000 },
    { sku_variant:'JNS-MOM-LBL-005-28-JKT', product_name:'Celana Jeans Mom Jeans Wanita Light Blue', product_sku:'JNS-MOM-LBL-005', size:'28', warehouse:'Jakarta Warehouse', stock:35, min_stock:5, base_price:329000, cost_price:182000 },
    { sku_variant:'JNS-MOM-LBL-005-30-JKT', product_name:'Celana Jeans Mom Jeans Wanita Light Blue', product_sku:'JNS-MOM-LBL-005', size:'30', warehouse:'Jakarta Warehouse', stock:22, min_stock:5, base_price:329000, cost_price:182000 },
  ];

  refData.forEach((d, i) => {
    const row = wr.addRow(d);
    applyDataRow(row, i % 2 === 0 ? COLOR.BLUE_BG : 'FFFFFFFF');
    row.getCell('stock').numFmt     = '#,##0';
    row.getCell('min_stock').numFmt = '#,##0';
    row.getCell('base_price').numFmt  = '#,##0';
    row.getCell('cost_price').numFmt  = '#,##0';
    // Highlight stok rendah
    if (d.stock <= d.min_stock) {
      row.getCell('stock').fill = { type:'pattern', pattern:'solid', fgColor:{ argb:'FFFEE2E2' } };
      row.getCell('stock').font = { color:{ argb:'FFDC2626' }, bold:true };
    }
  });

  // ── Sheet 3: Petunjuk ────────────────────────────────────
  const wp = wb.addWorksheet('Petunjuk');
  wp.getColumn(1).width = 80;

  const lines = [
    'PETUNJUK PENGISIAN TEMPLATE STOCK ADJUSTMENT',
    '',
    '═══════════════════════════════════════════════',
    'SHEET "Stock Adjustment" — Data perubahan stok',
    '═══════════════════════════════════════════════',
    '  sku_variant *  : SKU variant produk (wajib)',
    '                   Lihat di sheet "Data Referensi Varian"',
    '',
    '  tipe *         : Jenis adjustment (wajib), pilihan:',
    '    > in   = Stok BERTAMBAH (restok, transfer masuk, retur customer)',
    '    > out  = Stok BERKURANG (barang rusak, hilang, transfer keluar)',
    '    > set  = Koreksi stok ke angka tertentu (stock opname)',
    '',
    '  jumlah *       : Angka stok (wajib, harus positif)',
    '    > Untuk "in"  → jumlah yang ditambahkan',
    '    > Untuk "out" → jumlah yang dikurangi',
    '    > Untuk "set" → stok akhir yang diinginkan',
    '',
    '  harga_modal    : Harga beli/HPP per unit (opsional, untuk stok masuk)',
    '',
    '  catatan        : Keterangan/alasan adjustment (opsional tapi disarankan)',
    '',
    '═══════════════════════════════════════════════',
    'SHEET "Data Referensi Varian"',
    '═══════════════════════════════════════════════',
    '  • Berisi daftar semua varian produk yang aktif',
    '  • Kolom "Stok Saat Ini" = stok saat template didownload',
    '  • Baris dengan stok merah = stok di bawah minimum (perlu restok)',
    '',
    '═══════════════════════════════════════════════',
    'CONTOH KASUS PENGGUNAAN',
    '═══════════════════════════════════════════════',
    '  1. Restok dari supplier:',
    '     SKU-VARIANT | in | 100 | 185000 | Restok PO-001',
    '',
    '  2. Barang rusak/defect:',
    '     SKU-VARIANT | out | 5 | | Barang rusak - koyak',
    '',
    '  3. Stock opname/koreksi:',
    '     SKU-VARIANT | set | 87 | | Stock opname April 2026',
    '',
    '  4. Transfer antar gudang:',
    '     SKU-VAR-GDG-A | out | 20 | | Transfer ke Gudang B',
    '     SKU-VAR-GDG-B | in  | 20 | | Transfer dari Gudang A',
    '',
    '═══════════════════════════════════════════════',
    'CATATAN PENTING',
    '═══════════════════════════════════════════════',
    '  • SKU variant harus sama persis dengan data referensi',
    '  • Tipe "out" tidak bisa kurangi lebih dari stok yang ada',
    '  • Tipe "set" tidak boleh negatif',
    '  • Satu SKU bisa muncul beberapa kali (diproses berurutan)',
    '  • Semua perubahan dicatat di riwayat inventaris',
    '  • Upload via Admin Panel → Inventaris → Import Stok',
  ];

  lines.forEach((txt, i) => {
    const cell = wp.getCell(`A${i + 1}`);
    cell.value = txt;
    cell.alignment = { wrapText: true };
    if (i === 0) {
      cell.font = { bold: true, size: 14, color: { argb: COLOR.GREEN_HEADER } };
    } else if (txt.startsWith('═')) {
      cell.font = { bold: true, color: { argb: COLOR.GRAY_HEADER } };
    }
  });

  const outPath = path.join(OUTPUT_DIR, 'template-stock-produk.xlsx');
  await wb.xlsx.writeFile(outPath);
  console.log('✅  template-stock-produk.xlsx   →', outPath);
}

// ============================================================
// Main
// ============================================================
(async () => {
  try {
    console.log('Generating Excel templates...\n');
    await generateProductTemplate();
    await generateStockTemplate();
    console.log('\nDone! File tersimpan di folder:', OUTPUT_DIR);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
