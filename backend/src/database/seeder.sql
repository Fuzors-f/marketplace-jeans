-- ================================================
-- MARKETPLACE JEANS - SEEDER DATA
-- ================================================
-- Dummy data untuk development

-- ================================================
-- 1. USERS (Admin + Sample Users)
-- ================================================

-- Admin user: admin@jeans.com / admin123
-- Password hash dari bcrypt untuk "admin123"
INSERT INTO users (email, password, full_name, phone, role, is_active, email_verified) VALUES
('admin@jeans.com', '$2a$10$K8U3Z7e3z7z7z7z7z7z7O1V8x6K5L4M3N2P1Q0R9S8T7U6V5W4X3Y2Z', 'Admin User', '081234567890', 'admin', true, true),
('john@example.com', '$2a$10$K8U3Z7e3z7z7z7z7z7z7O1V8x6K5L4M3N2P1Q0R9S8T7U6V5W4X3Y2Z', 'John Doe', '081234567891', 'member', true, true),
('jane@example.com', '$2a$10$K8U3Z7e3z7z7z7z7z7z7O1V8x6K5L4M3N2P1Q0R9S8T7U6V5W4X3Y2Z', 'Jane Smith', '081234567892', 'member', true, true);

-- ================================================
-- 2. CATEGORIES (Jenis Jeans)
-- ================================================

INSERT INTO categories (name, slug, description, image_url, is_active, sort_order) VALUES
('Slim Fit', 'slim-fit', 'Jeans dengan potongan menyempit di kaki, modern dan stylish', '/images/categories/slim-fit.jpg', true, 1),
('Regular Fit', 'regular-fit', 'Jeans standar dengan potongan normal dan nyaman', '/images/categories/regular-fit.jpg', true, 2),
('Skinny', 'skinny', 'Jeans dengan potongan sangat ketat di seluruh kaki', '/images/categories/skinny.jpg', true, 3),
('Loose Fit', 'loose-fit', 'Jeans dengan potongan lebar dan santai', '/images/categories/loose-fit.jpg', true, 4),
('Bootcut', 'bootcut', 'Jeans dengan bagian bawah yang sedikit membesar, cocok untuk sepatu boots', '/images/categories/bootcut.jpg', true, 5),
('Straight Leg', 'straight-leg', 'Jeans dengan potongan lurus dari paha hingga pergelangan kaki', '/images/categories/straight-leg.jpg', true, 6),
('Mom Jeans', 'mom-jeans', 'Jeans dengan desain retro dan potongan yang santai', '/images/categories/mom-jeans.jpg', true, 7),
('Distressed', 'distressed', 'Jeans dengan efek sobek atau rusak untuk tampilan casual', '/images/categories/distressed.jpg', true, 8);

-- ================================================
-- 3. FITTINGS (Tingkat Ketat)
-- ================================================

INSERT INTO fittings (name, slug, description, is_active) VALUES
('Extra Slim', 'extra-slim', 'Potongan paling ketat', true),
('Slim', 'slim', 'Potongan ketat', true),
('Regular', 'regular', 'Potongan normal', true),
('Comfort', 'comfort', 'Potongan santai', true),
('Loose', 'loose', 'Potongan sangat lebar', true);

-- ================================================
-- 4. SIZES (Ukuran)
-- ================================================

INSERT INTO sizes (name, sort_order, is_active) VALUES
('28', 1, true),
('29', 2, true),
('30', 3, true),
('31', 4, true),
('32', 5, true),
('33', 6, true),
('34', 7, true),
('35', 8, true),
('36', 9, true),
('37', 10, true),
('38', 11, true),
('39', 12, true),
('40', 13, true),
('42', 14, true),
('44', 15, true);

-- ================================================
-- 5. PRODUCTS
-- ================================================

INSERT INTO products (name, slug, category_id, fitting_id, description, short_description, base_price, master_cost_price, sku, weight, is_active, is_featured) VALUES
(
  'Classic Blue Slim Fit Jeans',
  'classic-blue-slim-fit-jeans',
  1,
  2,
  'Jeans biru klasik dengan desain slim fit yang modern. Dibuat dari bahan denim berkualitas tinggi dengan stretch untuk kenyamanan maksimal. Cocok untuk penggunaan sehari-hari maupun acara casual.',
  'Jeans biru slim fit kualitas premium',
  299000,
  150000,
  'JEAN-001',
  0.6,
  true,
  true
),
(
  'Black Regular Jeans',
  'black-regular-jeans',
  2,
  3,
  'Jeans hitam polos dengan potongan regular yang nyaman. Material berkualitas tinggi dengan teknologi stretching terbaik.',
  'Jeans hitam regular, nyaman dan tahan lama',
  289000,
  145000,
  'JEAN-002',
  0.6,
  true,
  true
),
(
  'Dark Blue Skinny Jeans',
  'dark-blue-skinny-jeans',
  3,
  1,
  'Jeans skinny warna biru tua dengan desain ketat. Sempurna untuk tampilan modern dan fashionable.',
  'Jeans skinny biru tua, desain modern',
  279000,
  140000,
  'JEAN-003',
  0.55,
  true,
  false
),
(
  'Light Blue Loose Fit Jeans',
  'light-blue-loose-fit-jeans',
  4,
  5,
  'Jeans biru muda dengan potongan loose fit yang santai dan nyaman. Desain sempurna untuk gaya casual dan santai.',
  'Jeans loose fit biru muda, desain santai',
  269000,
  135000,
  'JEAN-004',
  0.65,
  true,
  false
),
(
  'Classic Black Bootcut Jeans',
  'classic-black-bootcut-jeans',
  5,
  3,
  'Jeans bootcut hitam dengan potongan klasik. Cocok dipadukan dengan berbagai jenis sepatu, terutama boots.',
  'Jeans bootcut hitam, cocok dengan boots',
  309000,
  155000,
  'JEAN-005',
  0.62,
  true,
  true
),
(
  'Dark Indigo Straight Leg Jeans',
  'dark-indigo-straight-leg-jeans',
  6,
  3,
  'Jeans warna indigo tua dengan potongan straight leg yang klasik. Material premium dengan daya tahan tinggi.',
  'Jeans straight leg indigo, klasik dan tahan lama',
  289000,
  145000,
  'JEAN-006',
  0.63,
  true,
  false
),
(
  'Vintage Blue Mom Jeans',
  'vintage-blue-mom-jeans',
  7,
  4,
  'Jeans retro biru dengan potongan mom jeans yang trendy. Desain vintage yang sedang populer di kalangan fashion enthusiast.',
  'Jeans mom jeans retro, trendy dan stylish',
  319000,
  160000,
  'JEAN-007',
  0.64,
  true,
  true
),
(
  'Distressed Black Jeans',
  'distressed-black-jeans',
  8,
  2,
  'Jeans hitam dengan efek distressed yang kasual dan edgy. Cocok untuk tampilan streetwear modern.',
  'Jeans distressed hitam, kasual dan edgy',
  329000,
  165000,
  'JEAN-008',
  0.6,
  true,
  false
);
-- ================================================
-- 6. WAREHOUSES
-- ================================================

INSERT INTO warehouses (name, code, location, address, city, province, phone, email, is_main, is_active) VALUES
('Jakarta Warehouse', 'JKT', 'Jakarta Selatan', 'Jl. Sudirman No. 123, Gedung Jeans Tower', 'Jakarta Selatan', 'DKI Jakarta', '021-5551234', 'wh-jakarta@jeans.com', true, true),
('Bandung Warehouse', 'BDG', 'Bandung', 'Jl. Braga No. 88, Komplek Industri', 'Bandung', 'Jawa Barat', '022-4561234', 'wh-bandung@jeans.com', false, true),
('Surabaya Warehouse', 'SBY', 'Surabaya', 'Jl. Tunjungan No. 45', 'Surabaya', 'Jawa Timur', '031-7891234', 'wh-surabaya@jeans.com', false, true);

-- ================================================
-- 7. PRODUCT VARIANTS (Size + Warehouse + Stock)
-- ================================================

-- Classic Blue Slim Fit Jeans (Product ID 1) - All sizes, all warehouses
INSERT INTO product_variants (product_id, size_id, warehouse_id, sku_variant, additional_price, stock_quantity, min_stock, cost_price, is_active) VALUES
(1, 1, 1, 'JEAN-001-28-JKT', 0, 15, 5, 150000, true),
(1, 1, 2, 'JEAN-001-28-BDG', 0, 12, 5, 150000, true),
(1, 1, 3, 'JEAN-001-28-SBY', 0, 10, 5, 150000, true),
(1, 2, 1, 'JEAN-001-29-JKT', 0, 20, 5, 150000, true),
(1, 2, 2, 'JEAN-001-29-BDG', 0, 16, 5, 150000, true),
(1, 2, 3, 'JEAN-001-29-SBY', 0, 14, 5, 150000, true),
(1, 3, 1, 'JEAN-001-30-JKT', 0, 25, 5, 150000, true),
(1, 3, 2, 'JEAN-001-30-BDG', 0, 20, 5, 150000, true),
(1, 3, 3, 'JEAN-001-30-SBY', 0, 18, 5, 150000, true),
(1, 4, 1, 'JEAN-001-31-JKT', 0, 22, 5, 150000, true),
(1, 4, 2, 'JEAN-001-31-BDG', 0, 18, 5, 150000, true),
(1, 4, 3, 'JEAN-001-31-SBY', 0, 16, 5, 150000, true),
(1, 5, 1, 'JEAN-001-32-JKT', 0, 18, 5, 150000, true),
(1, 5, 2, 'JEAN-001-32-BDG', 0, 15, 5, 150000, true),
(1, 5, 3, 'JEAN-001-32-SBY', 0, 12, 5, 150000, true),
(1, 6, 1, 'JEAN-001-33-JKT', 0, 16, 5, 150000, true),
(1, 6, 2, 'JEAN-001-33-BDG', 0, 14, 5, 150000, true),
(1, 6, 3, 'JEAN-001-33-SBY', 0, 10, 5, 150000, true),
(1, 7, 1, 'JEAN-001-34-JKT', 0, 14, 5, 150000, true),
(1, 7, 2, 'JEAN-001-34-BDG', 0, 12, 5, 150000, true),
(1, 7, 3, 'JEAN-001-34-SBY', 0, 8, 5, 150000, true);

-- Black Regular Jeans (Product ID 2)
INSERT INTO product_variants (product_id, size_id, warehouse_id, sku_variant, additional_price, stock_quantity, min_stock, cost_price, is_active) VALUES
(2, 3, 1, 'JEAN-002-30-JKT', 0, 20, 5, 145000, true),
(2, 3, 2, 'JEAN-002-30-BDG', 0, 16, 5, 145000, true),
(2, 3, 3, 'JEAN-002-30-SBY', 0, 14, 5, 145000, true),
(2, 4, 1, 'JEAN-002-31-JKT', 0, 25, 5, 145000, true),
(2, 4, 2, 'JEAN-002-31-BDG', 0, 20, 5, 145000, true),
(2, 4, 3, 'JEAN-002-31-SBY', 0, 18, 5, 145000, true),
(2, 5, 1, 'JEAN-002-32-JKT', 0, 30, 5, 145000, true),
(2, 5, 2, 'JEAN-002-32-BDG', 0, 25, 5, 145000, true),
(2, 5, 3, 'JEAN-002-32-SBY', 0, 20, 5, 145000, true),
(2, 6, 1, 'JEAN-002-33-JKT', 0, 28, 5, 145000, true),
(2, 6, 2, 'JEAN-002-33-BDG', 0, 22, 5, 145000, true),
(2, 6, 3, 'JEAN-002-33-SBY', 0, 18, 5, 145000, true),
(2, 7, 1, 'JEAN-002-34-JKT', 0, 22, 5, 145000, true),
(2, 7, 2, 'JEAN-002-34-BDG', 0, 18, 5, 145000, true),
(2, 7, 3, 'JEAN-002-34-SBY', 0, 15, 5, 145000, true),
(2, 8, 1, 'JEAN-002-35-JKT', 0, 18, 5, 145000, true),
(2, 8, 2, 'JEAN-002-35-BDG', 0, 14, 5, 145000, true),
(2, 8, 3, 'JEAN-002-35-SBY', 0, 12, 5, 145000, true);

-- Dark Blue Skinny Jeans (Product ID 3)
INSERT INTO product_variants (product_id, size_id, warehouse_id, sku_variant, additional_price, stock_quantity, min_stock, cost_price, is_active) VALUES
(3, 1, 1, 'JEAN-003-28-JKT', 0, 18, 5, 140000, true),
(3, 1, 2, 'JEAN-003-28-BDG', 0, 14, 5, 140000, true),
(3, 1, 3, 'JEAN-003-28-SBY', 0, 12, 5, 140000, true),
(3, 2, 1, 'JEAN-003-29-JKT', 0, 22, 5, 140000, true),
(3, 2, 2, 'JEAN-003-29-BDG', 0, 18, 5, 140000, true),
(3, 2, 3, 'JEAN-003-29-SBY', 0, 15, 5, 140000, true),
(3, 3, 1, 'JEAN-003-30-JKT', 0, 25, 5, 140000, true),
(3, 3, 2, 'JEAN-003-30-BDG', 0, 20, 5, 140000, true),
(3, 3, 3, 'JEAN-003-30-SBY', 0, 18, 5, 140000, true),
(3, 4, 1, 'JEAN-003-31-JKT', 0, 20, 5, 140000, true),
(3, 4, 2, 'JEAN-003-31-BDG', 0, 16, 5, 140000, true),
(3, 4, 3, 'JEAN-003-31-SBY', 0, 14, 5, 140000, true),
(3, 5, 1, 'JEAN-003-32-JKT', 0, 15, 5, 140000, true),
(3, 5, 2, 'JEAN-003-32-BDG', 0, 12, 5, 140000, true),
(3, 5, 3, 'JEAN-003-32-SBY', 0, 10, 5, 140000, true);

-- Light Blue Loose Fit Jeans (Product ID 4)
INSERT INTO product_variants (product_id, size_id, warehouse_id, sku_variant, additional_price, stock_quantity, min_stock, cost_price, is_active) VALUES
(4, 3, 1, 'JEAN-004-30-JKT', 0, 12, 5, 155000, true),
(4, 3, 2, 'JEAN-004-30-BDG', 0, 10, 5, 155000, true),
(4, 3, 3, 'JEAN-004-30-SBY', 0, 8, 5, 155000, true),
(4, 4, 1, 'JEAN-004-31-JKT', 0, 14, 5, 155000, true),
(4, 4, 2, 'JEAN-004-31-BDG', 0, 12, 5, 155000, true),
(4, 4, 3, 'JEAN-004-31-SBY', 0, 10, 5, 155000, true),
(4, 5, 1, 'JEAN-004-32-JKT', 0, 16, 5, 155000, true),
(4, 5, 2, 'JEAN-004-32-BDG', 0, 14, 5, 155000, true),
(4, 5, 3, 'JEAN-004-32-SBY', 0, 12, 5, 155000, true),
(4, 6, 1, 'JEAN-004-33-JKT', 0, 18, 5, 155000, true),
(4, 6, 2, 'JEAN-004-33-BDG', 0, 15, 5, 155000, true),
(4, 6, 3, 'JEAN-004-33-SBY', 0, 13, 5, 155000, true),
(4, 7, 1, 'JEAN-004-34-JKT', 0, 20, 5, 155000, true),
(4, 7, 2, 'JEAN-004-34-BDG', 0, 16, 5, 155000, true),
(4, 7, 3, 'JEAN-004-34-SBY', 0, 14, 5, 155000, true),
(4, 8, 1, 'JEAN-004-35-JKT', 0, 15, 5, 155000, true),
(4, 8, 2, 'JEAN-004-35-BDG', 0, 12, 5, 155000, true),
(4, 8, 3, 'JEAN-004-35-SBY', 0, 10, 5, 155000, true),
(4, 9, 1, 'JEAN-004-36-JKT', 0, 10, 5, 155000, true),
(4, 9, 2, 'JEAN-004-36-BDG', 0, 8, 5, 155000, true),
(4, 9, 3, 'JEAN-004-36-SBY', 0, 6, 5, 155000, true);

-- Classic Black Bootcut Jeans (Product ID 5)
INSERT INTO product_variants (product_id, size_id, warehouse_id, sku_variant, additional_price, stock_quantity, min_stock, cost_price, is_active) VALUES
(5, 4, 1, 'JEAN-005-31-JKT', 0, 16, 5, 160000, true),
(5, 4, 2, 'JEAN-005-31-BDG', 0, 13, 5, 160000, true),
(5, 4, 3, 'JEAN-005-31-SBY', 0, 11, 5, 160000, true),
(5, 5, 1, 'JEAN-005-32-JKT', 0, 20, 5, 160000, true),
(5, 5, 2, 'JEAN-005-32-BDG', 0, 16, 5, 160000, true),
(5, 5, 3, 'JEAN-005-32-SBY', 0, 14, 5, 160000, true),
(5, 6, 1, 'JEAN-005-33-JKT', 0, 18, 5, 160000, true),
(5, 6, 2, 'JEAN-005-33-BDG', 0, 14, 5, 160000, true),
(5, 6, 3, 'JEAN-005-33-SBY', 0, 12, 5, 160000, true),
(5, 7, 1, 'JEAN-005-34-JKT', 0, 22, 5, 160000, true),
(5, 7, 2, 'JEAN-005-34-BDG', 0, 18, 5, 160000, true),
(5, 7, 3, 'JEAN-005-34-SBY', 0, 15, 5, 160000, true),
(5, 8, 1, 'JEAN-005-35-JKT', 0, 16, 5, 160000, true),
(5, 8, 2, 'JEAN-005-35-BDG', 0, 13, 5, 160000, true),
(5, 8, 3, 'JEAN-005-35-SBY', 0, 11, 5, 160000, true),
(5, 9, 1, 'JEAN-005-36-JKT', 0, 12, 5, 160000, true),
(5, 9, 2, 'JEAN-005-36-BDG', 0, 10, 5, 160000, true),
(5, 9, 3, 'JEAN-005-36-SBY', 0, 8, 5, 160000, true);

-- Dark Indigo Straight Leg Jeans (Product ID 6)
INSERT INTO product_variants (product_id, size_id, warehouse_id, sku_variant, additional_price, stock_quantity, min_stock, cost_price, is_active) VALUES
(6, 3, 1, 'JEAN-006-30-JKT', 0, 15, 5, 148000, true),
(6, 3, 2, 'JEAN-006-30-BDG', 0, 12, 5, 148000, true),
(6, 3, 3, 'JEAN-006-30-SBY', 0, 10, 5, 148000, true),
(6, 4, 1, 'JEAN-006-31-JKT', 0, 18, 5, 148000, true),
(6, 4, 2, 'JEAN-006-31-BDG', 0, 14, 5, 148000, true),
(6, 4, 3, 'JEAN-006-31-SBY', 0, 12, 5, 148000, true),
(6, 5, 1, 'JEAN-006-32-JKT', 0, 20, 5, 148000, true),
(6, 5, 2, 'JEAN-006-32-BDG', 0, 16, 5, 148000, true),
(6, 5, 3, 'JEAN-006-32-SBY', 0, 14, 5, 148000, true),
(6, 6, 1, 'JEAN-006-33-JKT', 0, 22, 5, 148000, true),
(6, 6, 2, 'JEAN-006-33-BDG', 0, 18, 5, 148000, true),
(6, 6, 3, 'JEAN-006-33-SBY', 0, 16, 5, 148000, true),
(6, 7, 1, 'JEAN-006-34-JKT', 0, 20, 5, 148000, true),
(6, 7, 2, 'JEAN-006-34-BDG', 0, 16, 5, 148000, true),
(6, 7, 3, 'JEAN-006-34-SBY', 0, 14, 5, 148000, true),
(6, 8, 1, 'JEAN-006-35-JKT', 0, 16, 5, 148000, true),
(6, 8, 2, 'JEAN-006-35-BDG', 0, 13, 5, 148000, true),
(6, 8, 3, 'JEAN-006-35-SBY', 0, 11, 5, 148000, true),
(6, 9, 1, 'JEAN-006-36-JKT', 0, 12, 5, 148000, true),
(6, 9, 2, 'JEAN-006-36-BDG', 0, 10, 5, 148000, true),
(6, 9, 3, 'JEAN-006-36-SBY', 0, 8, 5, 148000, true),
(6, 10, 1, 'JEAN-006-37-JKT', 0, 8, 5, 148000, true),
(6, 10, 2, 'JEAN-006-37-BDG', 0, 6, 5, 148000, true),
(6, 10, 3, 'JEAN-006-37-SBY', 0, 5, 5, 148000, true);

-- Vintage Blue Mom Jeans (Product ID 7)
INSERT INTO product_variants (product_id, size_id, warehouse_id, sku_variant, additional_price, stock_quantity, min_stock, cost_price, is_active) VALUES
(7, 2, 1, 'JEAN-007-29-JKT', 0, 10, 5, 152000, true),
(7, 2, 2, 'JEAN-007-29-BDG', 0, 8, 5, 152000, true),
(7, 2, 3, 'JEAN-007-29-SBY', 0, 6, 5, 152000, true),
(7, 3, 1, 'JEAN-007-30-JKT', 0, 14, 5, 152000, true),
(7, 3, 2, 'JEAN-007-30-BDG', 0, 11, 5, 152000, true),
(7, 3, 3, 'JEAN-007-30-SBY', 0, 9, 5, 152000, true),
(7, 4, 1, 'JEAN-007-31-JKT', 0, 16, 5, 152000, true),
(7, 4, 2, 'JEAN-007-31-BDG', 0, 13, 5, 152000, true),
(7, 4, 3, 'JEAN-007-31-SBY', 0, 11, 5, 152000, true),
(7, 5, 1, 'JEAN-007-32-JKT', 0, 18, 5, 152000, true),
(7, 5, 2, 'JEAN-007-32-BDG', 0, 14, 5, 152000, true),
(7, 5, 3, 'JEAN-007-32-SBY', 0, 12, 5, 152000, true),
(7, 6, 1, 'JEAN-007-33-JKT', 0, 15, 5, 152000, true),
(7, 6, 2, 'JEAN-007-33-BDG', 0, 12, 5, 152000, true),
(7, 6, 3, 'JEAN-007-33-SBY', 0, 10, 5, 152000, true),
(7, 7, 1, 'JEAN-007-34-JKT', 0, 12, 5, 152000, true),
(7, 7, 2, 'JEAN-007-34-BDG', 0, 10, 5, 152000, true),
(7, 7, 3, 'JEAN-007-34-SBY', 0, 8, 5, 152000, true);

-- Distressed Black Jeans (Product ID 8)
INSERT INTO product_variants (product_id, size_id, warehouse_id, sku_variant, additional_price, stock_quantity, min_stock, cost_price, is_active) VALUES
(8, 1, 1, 'JEAN-008-28-JKT', 0, 12, 5, 158000, true),
(8, 1, 2, 'JEAN-008-28-BDG', 0, 10, 5, 158000, true),
(8, 1, 3, 'JEAN-008-28-SBY', 0, 8, 5, 158000, true),
(8, 2, 1, 'JEAN-008-29-JKT', 0, 14, 5, 158000, true),
(8, 2, 2, 'JEAN-008-29-BDG', 0, 11, 5, 158000, true),
(8, 2, 3, 'JEAN-008-29-SBY', 0, 9, 5, 158000, true),
(8, 3, 1, 'JEAN-008-30-JKT', 0, 16, 5, 158000, true),
(8, 3, 2, 'JEAN-008-30-BDG', 0, 13, 5, 158000, true),
(8, 3, 3, 'JEAN-008-30-SBY', 0, 11, 5, 158000, true),
(8, 4, 1, 'JEAN-008-31-JKT', 0, 18, 5, 158000, true),
(8, 4, 2, 'JEAN-008-31-BDG', 0, 14, 5, 158000, true),
(8, 4, 3, 'JEAN-008-31-SBY', 0, 12, 5, 158000, true),
(8, 5, 1, 'JEAN-008-32-JKT', 0, 16, 5, 158000, true),
(8, 5, 2, 'JEAN-008-32-BDG', 0, 13, 5, 158000, true),
(8, 5, 3, 'JEAN-008-32-SBY', 0, 11, 5, 158000, true),
(8, 6, 1, 'JEAN-008-33-JKT', 0, 14, 5, 158000, true),
(8, 6, 2, 'JEAN-008-33-BDG', 0, 11, 5, 158000, true),
(8, 6, 3, 'JEAN-008-33-SBY', 0, 9, 5, 158000, true),
(8, 7, 1, 'JEAN-008-34-JKT', 0, 12, 5, 158000, true),
(8, 7, 2, 'JEAN-008-34-BDG', 0, 10, 5, 158000, true),
(8, 7, 3, 'JEAN-008-34-SBY', 0, 8, 5, 158000, true);

-- ================================================
-- 7. PRODUCT IMAGES
-- ================================================

-- Classic Blue Slim Fit Jeans
INSERT INTO product_images (product_id, image_url, is_primary, sort_order, alt_text) VALUES
(1, '/images/products/jean-001-1.jpg', true, 1, 'Classic Blue Slim Fit Jeans - Front View'),
(1, '/images/products/jean-001-2.jpg', false, 2, 'Classic Blue Slim Fit Jeans - Back View'),
(1, '/images/products/jean-001-3.jpg', false, 3, 'Classic Blue Slim Fit Jeans - Side View');

-- Black Regular Jeans
INSERT INTO product_images (product_id, image_url, is_primary, sort_order, alt_text) VALUES
(2, '/images/products/jean-002-1.jpg', true, 1, 'Black Regular Jeans - Front View'),
(2, '/images/products/jean-002-2.jpg', false, 2, 'Black Regular Jeans - Full Body'),
(2, '/images/products/jean-002-3.jpg', false, 3, 'Black Regular Jeans - Detail');

-- Dark Blue Skinny Jeans
INSERT INTO product_images (product_id, image_url, is_primary, sort_order, alt_text) VALUES
(3, '/images/products/jean-003-1.jpg', true, 1, 'Dark Blue Skinny Jeans - Front'),
(3, '/images/products/jean-003-2.jpg', false, 2, 'Dark Blue Skinny Jeans - Side'),
(3, '/images/products/jean-003-3.jpg', false, 3, 'Dark Blue Skinny Jeans - Detail');

-- Light Blue Loose Fit Jeans
INSERT INTO product_images (product_id, image_url, is_primary, sort_order, alt_text) VALUES
(4, '/images/products/jean-004-1.jpg', true, 1, 'Light Blue Loose Fit Jeans'),
(4, '/images/products/jean-004-2.jpg', false, 2, 'Light Blue Loose Fit Jeans - Back');

-- Classic Black Bootcut Jeans
INSERT INTO product_images (product_id, image_url, is_primary, sort_order, alt_text) VALUES
(5, '/images/products/jean-005-1.jpg', true, 1, 'Classic Black Bootcut Jeans'),
(5, '/images/products/jean-005-2.jpg', false, 2, 'Classic Black Bootcut Jeans - Back');

-- Dark Indigo Straight Leg Jeans
INSERT INTO product_images (product_id, image_url, is_primary, sort_order, alt_text) VALUES
(6, '/images/products/jean-006-1.jpg', true, 1, 'Dark Indigo Straight Leg Jeans'),
(6, '/images/products/jean-006-2.jpg', false, 2, 'Dark Indigo Straight Leg Jeans - Back');

-- Vintage Blue Mom Jeans
INSERT INTO product_images (product_id, image_url, is_primary, sort_order, alt_text) VALUES
(7, '/images/products/jean-007-1.jpg', true, 1, 'Vintage Blue Mom Jeans'),
(7, '/images/products/jean-007-2.jpg', false, 2, 'Vintage Blue Mom Jeans - Detail');

-- Distressed Black Jeans
INSERT INTO product_images (product_id, image_url, is_primary, sort_order, alt_text) VALUES
(8, '/images/products/jean-008-1.jpg', true, 1, 'Distressed Black Jeans'),
(8, '/images/products/jean-008-2.jpg', false, 2, 'Distressed Black Jeans - Distress Detail');

-- ================================================
-- 8. DISCOUNTS
-- ================================================

INSERT INTO discounts (code, type, value, min_purchase, start_date, end_date, usage_limit, is_active, applicable_to, description) VALUES
('WELCOME10', 'percentage', 10.00, 100000, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 100, true, 'all', 'Diskon selamat datang 10%'),
('MEMBER20', 'percentage', 20.00, 0, NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY), NULL, true, 'all', 'Diskon member 20%'),
('BULK50K', 'fixed', 50000, 500000, NOW(), DATE_ADD(NOW(), INTERVAL 60 DAY), 50, true, 'all', 'Diskon pembelian minimal 500rb'),
('NEWYEAR25', 'percentage', 25.00, 200000, NOW(), DATE_ADD(NOW(), INTERVAL 14 DAY), 200, true, 'all', 'Promo Tahun Baru diskon 25%'),
('FLASH30', 'percentage', 30.00, 300000, NOW(), DATE_ADD(NOW(), INTERVAL 3 DAY), 50, true, 'all', 'Flash Sale diskon 30%');

-- ================================================
-- 9. BANNERS
-- ================================================

INSERT INTO banners (title, subtitle, image_url, link_url, position, is_active, start_date, end_date, sort_order) VALUES
('New Collection 2025', 'Koleksi terbaru jeans premium', '/images/banners/banner-new-collection.jpg', '/products?featured=true', 'hero', true, NOW(), DATE_ADD(NOW(), INTERVAL 60 DAY), 1),
('Flash Sale', 'Diskon hingga 50%', '/images/banners/banner-flash-sale.jpg', '/products?sale=true', 'hero', true, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 2),
('Member Exclusive', 'Daftar dan dapatkan diskon 20%', '/images/banners/banner-member.jpg', '/register', 'hero', true, NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY), 3),
('Promo Slim Fit', 'Koleksi Slim Fit terlengkap', '/images/banners/banner-slim.jpg', '/products?category=1', 'sidebar', true, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 1),
('Free Shipping', 'Gratis ongkir minimal pembelian 500rb', '/images/banners/banner-freeship.jpg', '/products', 'footer', true, NOW(), DATE_ADD(NOW(), INTERVAL 60 DAY), 1);

-- ================================================
-- 10. SETTINGS
-- ================================================

INSERT INTO settings (setting_key, setting_value, setting_type, is_public) VALUES
('shop_name', 'Marketplace Jeans Premium', 'text', true),
('shop_email', 'admin@jeans.com', 'text', true),
('shop_phone', '081234567890', 'text', true),
('shop_address', 'Jl. Fashion Street No. 123, Jakarta', 'text', true),
('shop_logo', '/images/logo.png', 'text', true),
('currency', 'IDR', 'text', true),
('currency_symbol', 'Rp', 'text', true),
('tax_rate', '11', 'number', false),
('shipping_flat_rate', '20000', 'number', false),
('min_order_amount', '50000', 'number', false),
('max_upload_size', '5242880', 'number', false),
('order_prefix', 'ORD', 'text', false),
('meta_title', 'Marketplace Jeans - Jeans Premium Indonesia', 'text', true),
('meta_description', 'Toko jeans premium terlengkap di Indonesia dengan berbagai pilihan fitting dan ukuran', 'text', true);

-- ================================================
-- 11. USER ADDRESSES (Sample for member users)
-- ================================================

INSERT INTO user_addresses (user_id, label, recipient_name, phone, address, city, province, postal_code, is_default) VALUES
(2, 'Rumah', 'John Doe', '081234567891', 'Jl. Merdeka No. 100, RT 01/RW 02, Kelurahan Kebayoran', 'Jakarta Selatan', 'DKI Jakarta', '12130', true),
(2, 'Kantor', 'John Doe', '081234567891', 'Gedung ABC Lt. 5, Jl. Sudirman No. 50', 'Jakarta Pusat', 'DKI Jakarta', '10210', false),
(3, 'Rumah', 'Jane Smith', '081234567892', 'Jl. Gatot Subroto No. 88, Komplek Indah', 'Bandung', 'Jawa Barat', '40123', true);

-- ================================================
-- 12. SAMPLE ORDERS (Optional - for testing)
-- ================================================

-- Order 1: John Doe orders 2 items
INSERT INTO orders (user_id, status, payment_status, payment_method, subtotal, shipping_cost, tax, total, 
  customer_name, customer_email, customer_phone, shipping_address, shipping_city, shipping_province, 
  shipping_postal_code, shipping_method, notes, created_at) VALUES
(2, 'delivered', 'paid', 'bank_transfer', 578000, 20000, 63580, 661580,
  'John Doe', 'john@example.com', '081234567891', 'Jl. Merdeka No. 100, RT 01/RW 02, Kelurahan Kebayoran',
  'Jakarta Selatan', 'DKI Jakarta', '12130', 'JNE Regular', 'Tolong kirim secepatnya', DATE_SUB(NOW(), INTERVAL 7 DAY));

-- Order items for Order 1
INSERT INTO order_items (order_id, product_id, product_variant_id, size_id, quantity, price, total) VALUES
(1, 1, 3, 3, 1, 299000, 299000),
(1, 2, 9, 5, 1, 289000, 289000);

-- Payment for Order 1
INSERT INTO payments (order_id, payment_method, amount, status, paid_at) VALUES
(1, 'bank_transfer', 661580, 'paid', DATE_SUB(NOW(), INTERVAL 6 DAY));

-- Order 2: Jane Smith pending order
INSERT INTO orders (user_id, status, payment_status, payment_method, subtotal, shipping_cost, tax, total, 
  customer_name, customer_email, customer_phone, shipping_address, shipping_city, shipping_province, 
  shipping_postal_code, shipping_method, created_at) VALUES
(3, 'confirmed', 'paid', 'bank_transfer', 319000, 20000, 35090, 374090,
  'Jane Smith', 'jane@example.com', '081234567892', 'Jl. Gatot Subroto No. 88, Komplek Indah',
  'Bandung', 'Jawa Barat', '40123', 'JNE Regular', DATE_SUB(NOW(), INTERVAL 2 DAY));

-- Order items for Order 2
INSERT INTO order_items (order_id, product_id, product_variant_id, size_id, quantity, price, total) VALUES
(2, 7, 39, 4, 1, 319000, 319000);

-- Payment for Order 2
INSERT INTO payments (order_id, payment_method, amount, status, paid_at) VALUES
(2, 'bank_transfer', 374090, 'paid', DATE_SUB(NOW(), INTERVAL 1 DAY));

-- Order 3: Guest checkout (pending)
INSERT INTO orders (status, payment_status, payment_method, subtotal, shipping_cost, tax, total, 
  customer_name, customer_email, customer_phone, shipping_address, shipping_city, shipping_province, 
  shipping_postal_code, shipping_method, created_at) VALUES
('pending', 'pending', 'cod', 558000, 20000, 61380, 639380,
  'Budi Santoso', 'budi@email.com', '08198765432', 'Jl. Pahlawan No. 77',
  'Surabaya', 'Jawa Timur', '60123', 'JNE Regular', DATE_SUB(NOW(), INTERVAL 1 DAY));

-- Order items for Order 3
INSERT INTO order_items (order_id, product_id, product_variant_id, size_id, quantity, price, total) VALUES
(3, 3, 13, 2, 2, 279000, 558000);

-- Payment for Order 3
INSERT INTO payments (order_id, payment_method, amount, status) VALUES
(3, 'cod', 639380, 'pending');

-- ================================================
-- 13. INVENTORY MOVEMENTS (Sample)
-- ================================================

INSERT INTO inventory_movements (product_variant_id, type, quantity, reference_type, reference_id, notes, created_by, created_at) VALUES
(3, 'out', 1, 'order', 1, 'Order #1', 1, DATE_SUB(NOW(), INTERVAL 7 DAY)),
(9, 'out', 1, 'order', 1, 'Order #1', 1, DATE_SUB(NOW(), INTERVAL 7 DAY)),
(39, 'out', 1, 'order', 2, 'Order #2', 1, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(13, 'out', 2, 'order', 3, 'Order #3', 1, DATE_SUB(NOW(), INTERVAL 1 DAY));

-- ================================================
-- 14. OFFICES (Kantor/Cabang)
-- ================================================

INSERT INTO offices (name, code, address, city, province, phone, email, is_headquarters, is_active) VALUES
('Kantor Pusat Jakarta', 'HQ', 'Jl. Sudirman No. 123, Gedung Jeans Tower Lt. 5', 'Jakarta Selatan', 'DKI Jakarta', '021-5551234', 'hq@jeans.com', true, true),
('Cabang Bandung', 'BDG', 'Jl. Braga No. 88', 'Bandung', 'Jawa Barat', '022-4561234', 'bandung@jeans.com', false, true),
('Cabang Surabaya', 'SBY', 'Jl. Tunjungan No. 45', 'Surabaya', 'Jawa Timur', '031-7891234', 'surabaya@jeans.com', false, true),
('Cabang Yogyakarta', 'YGY', 'Jl. Malioboro No. 12', 'Yogyakarta', 'DI Yogyakarta', '0274-567890', 'yogya@jeans.com', false, true);

-- ================================================
-- 15. POSITIONS (Jabatan)
-- ================================================

INSERT INTO positions (name, code, office_id, parent_id, level, description, is_active) VALUES
-- Level 1: Top Management
('Direktur Utama', 'DIR', 1, NULL, 1, 'Pimpinan tertinggi perusahaan', true),
-- Level 2: Directors
('Direktur Operasional', 'DIR-OPS', 1, 1, 2, 'Bertanggung jawab atas operasional perusahaan', true),
('Direktur Keuangan', 'DIR-FIN', 1, 1, 2, 'Bertanggung jawab atas keuangan perusahaan', true),
('Direktur Marketing', 'DIR-MKT', 1, 1, 2, 'Bertanggung jawab atas pemasaran', true),
-- Level 3: Managers
('Manager Produksi', 'MGR-PRD', 1, 2, 3, 'Mengelola produksi jeans', true),
('Manager Gudang', 'MGR-WH', 1, 2, 3, 'Mengelola warehouse dan inventory', true),
('Manager Penjualan', 'MGR-SLS', 1, 4, 3, 'Mengelola tim sales', true),
('Manager IT', 'MGR-IT', 1, 2, 3, 'Mengelola infrastruktur IT', true),
-- Level 4: Supervisors
('Supervisor Produksi', 'SPV-PRD', 1, 5, 4, 'Mengawasi proses produksi', true),
('Supervisor Gudang', 'SPV-WH', 1, 6, 4, 'Mengawasi operasional gudang', true),
('Supervisor Sales', 'SPV-SLS', 1, 7, 4, 'Mengawasi tim sales', true),
-- Level 5: Staff
('Staff Produksi', 'STF-PRD', 1, 9, 5, 'Staff bagian produksi', true),
('Staff Gudang', 'STF-WH', 1, 10, 5, 'Staff bagian gudang', true),
('Sales Representative', 'SLS-REP', 1, 11, 5, 'Sales lapangan', true),
('Staff IT', 'STF-IT', 1, 8, 5, 'Staff bagian IT', true),
-- Branch positions
('Kepala Cabang Bandung', 'KC-BDG', 2, 2, 3, 'Pimpinan cabang Bandung', true),
('Kepala Cabang Surabaya', 'KC-SBY', 3, 2, 3, 'Pimpinan cabang Surabaya', true),
('Kepala Cabang Yogyakarta', 'KC-YGY', 4, 2, 3, 'Pimpinan cabang Yogyakarta', true);

-- ================================================
-- 16. SIZE CHARTS (Panduan Ukuran)
-- ================================================

-- Standard measurements for all categories (size 28-40)
INSERT INTO size_charts (size_id, category_id, fitting_id, waist_cm, hip_cm, inseam_cm, thigh_cm, knee_cm, leg_opening_cm, front_rise_cm, back_rise_cm, notes, is_active) VALUES
-- Size 28
(1, NULL, NULL, 71.0, 86.0, 76.0, 48.0, 35.0, 33.0, 24.0, 33.0, 'Ukuran paling kecil', true),
-- Size 29
(2, NULL, NULL, 73.5, 89.0, 76.0, 49.5, 36.0, 34.0, 24.5, 33.5, NULL, true),
-- Size 30
(3, NULL, NULL, 76.0, 91.5, 76.0, 51.0, 37.0, 35.0, 25.0, 34.0, 'Ukuran populer', true),
-- Size 31
(4, NULL, NULL, 78.5, 94.0, 78.0, 52.5, 38.0, 36.0, 25.5, 34.5, NULL, true),
-- Size 32
(5, NULL, NULL, 81.0, 96.5, 78.0, 54.0, 39.0, 37.0, 26.0, 35.0, 'Ukuran populer', true),
-- Size 33
(6, NULL, NULL, 83.5, 99.0, 78.0, 55.5, 40.0, 38.0, 26.5, 35.5, NULL, true),
-- Size 34
(7, NULL, NULL, 86.0, 101.5, 80.0, 57.0, 41.0, 39.0, 27.0, 36.0, NULL, true),
-- Size 35
(8, NULL, NULL, 88.5, 104.0, 80.0, 58.5, 42.0, 40.0, 27.5, 36.5, NULL, true),
-- Size 36
(9, NULL, NULL, 91.0, 106.5, 80.0, 60.0, 43.0, 41.0, 28.0, 37.0, NULL, true),
-- Size 38
(11, NULL, NULL, 96.0, 111.5, 82.0, 63.0, 45.0, 43.0, 29.0, 38.0, 'Ukuran besar', true),
-- Size 40
(13, NULL, NULL, 101.0, 116.5, 82.0, 66.0, 47.0, 45.0, 30.0, 39.0, 'Ukuran ekstra besar', true);

-- Slim fit specific measurements (narrower leg opening and thigh)
INSERT INTO size_charts (size_id, category_id, fitting_id, waist_cm, hip_cm, inseam_cm, thigh_cm, knee_cm, leg_opening_cm, front_rise_cm, back_rise_cm, notes, is_active) VALUES
(3, 1, 2, 76.0, 91.5, 76.0, 49.0, 35.0, 32.0, 25.0, 34.0, 'Slim fit - potongan lebih ketat', true),
(4, 1, 2, 78.5, 94.0, 78.0, 50.5, 36.0, 33.0, 25.5, 34.5, 'Slim fit - potongan lebih ketat', true),
(5, 1, 2, 81.0, 96.5, 78.0, 52.0, 37.0, 34.0, 26.0, 35.0, 'Slim fit - potongan lebih ketat', true);

-- Skinny specific measurements (extra narrow)
INSERT INTO size_charts (size_id, category_id, fitting_id, waist_cm, hip_cm, inseam_cm, thigh_cm, knee_cm, leg_opening_cm, front_rise_cm, back_rise_cm, notes, is_active) VALUES
(3, 3, 1, 76.0, 91.5, 76.0, 47.0, 33.0, 28.0, 25.0, 34.0, 'Skinny - potongan extra ketat', true),
(4, 3, 1, 78.5, 94.0, 78.0, 48.5, 34.0, 29.0, 25.5, 34.5, 'Skinny - potongan extra ketat', true),
(5, 3, 1, 81.0, 96.5, 78.0, 50.0, 35.0, 30.0, 26.0, 35.0, 'Skinny - potongan extra ketat', true);

-- ================================================
-- 17. SETTINGS (Pengaturan Aplikasi)
-- ================================================

INSERT INTO settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('store_name', 'Marketplace Jeans', 'text', 'Nama toko', true),
('store_email', 'info@jeans.com', 'text', 'Email toko', true),
('store_phone', '021-5551234', 'text', 'Nomor telepon toko', true),
('store_address', 'Jl. Sudirman No. 123, Jakarta', 'text', 'Alamat toko', true),
('currency', 'IDR', 'text', 'Mata uang', true),
('tax_rate', '11', 'number', 'Persentase pajak (%)', false),
('free_shipping_min', '500000', 'number', 'Minimum belanja untuk gratis ongkir', false),
('default_shipping_cost', '15000', 'number', 'Ongkir default', false),
('max_order_quantity', '10', 'number', 'Maksimum quantity per item', false),
('member_discount_rate', '5', 'number', 'Diskon member (%)', false);

-- ================================================
-- END OF SEEDER
-- ================================================

