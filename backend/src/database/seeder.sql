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
-- 6. PRODUCT VARIANTS (Size + Stock)
-- ================================================

-- Classic Blue Slim Fit Jeans (Product ID 1)
INSERT INTO product_variants (product_id, size_id, sku_variant, additional_price, stock_quantity, is_active) VALUES
(1, 1, 'JEAN-001-28', 0, 15, true),
(1, 2, 'JEAN-001-29', 0, 20, true),
(1, 3, 'JEAN-001-30', 0, 25, true),
(1, 4, 'JEAN-001-31', 0, 22, true),
(1, 5, 'JEAN-001-32', 0, 18, true),
(1, 6, 'JEAN-001-33', 0, 16, true),
(1, 7, 'JEAN-001-34', 0, 14, true);

-- Black Regular Jeans (Product ID 2)
INSERT INTO product_variants (product_id, size_id, sku_variant, additional_price, stock_quantity, is_active) VALUES
(2, 3, 'JEAN-002-30', 0, 20, true),
(2, 4, 'JEAN-002-31', 0, 25, true),
(2, 5, 'JEAN-002-32', 0, 30, true),
(2, 6, 'JEAN-002-33', 0, 28, true),
(2, 7, 'JEAN-002-34', 0, 22, true),
(2, 8, 'JEAN-002-35', 0, 18, true);

-- Dark Blue Skinny Jeans (Product ID 3)
INSERT INTO product_variants (product_id, size_id, sku_variant, additional_price, stock_quantity, is_active) VALUES
(3, 1, 'JEAN-003-28', 0, 18, true),
(3, 2, 'JEAN-003-29', 0, 22, true),
(3, 3, 'JEAN-003-30', 0, 25, true),
(3, 4, 'JEAN-003-31', 0, 20, true),
(3, 5, 'JEAN-003-32', 0, 15, true);

-- Light Blue Loose Fit Jeans (Product ID 4)
INSERT INTO product_variants (product_id, size_id, sku_variant, additional_price, stock_quantity, is_active) VALUES
(4, 3, 'JEAN-004-30', 0, 12, true),
(4, 4, 'JEAN-004-31', 0, 14, true),
(4, 5, 'JEAN-004-32', 0, 16, true),
(4, 6, 'JEAN-004-33', 0, 18, true),
(4, 7, 'JEAN-004-34', 0, 20, true),
(4, 8, 'JEAN-004-35', 0, 15, true),
(4, 9, 'JEAN-004-36', 0, 10, true);

-- Classic Black Bootcut Jeans (Product ID 5)
INSERT INTO product_variants (product_id, size_id, sku_variant, additional_price, stock_quantity, is_active) VALUES
(5, 4, 'JEAN-005-31', 0, 16, true),
(5, 5, 'JEAN-005-32', 0, 20, true),
(5, 6, 'JEAN-005-33', 0, 18, true),
(5, 7, 'JEAN-005-34', 0, 22, true),
(5, 8, 'JEAN-005-35', 0, 16, true),
(5, 9, 'JEAN-005-36', 0, 12, true);

-- Dark Indigo Straight Leg Jeans (Product ID 6)
INSERT INTO product_variants (product_id, size_id, sku_variant, additional_price, stock_quantity, is_active) VALUES
(6, 3, 'JEAN-006-30', 0, 15, true),
(6, 4, 'JEAN-006-31', 0, 18, true),
(6, 5, 'JEAN-006-32', 0, 20, true),
(6, 6, 'JEAN-006-33', 0, 22, true),
(6, 7, 'JEAN-006-34', 0, 20, true),
(6, 8, 'JEAN-006-35', 0, 16, true),
(6, 9, 'JEAN-006-36', 0, 12, true),
(6, 10, 'JEAN-006-37', 0, 8, true);

-- Vintage Blue Mom Jeans (Product ID 7)
INSERT INTO product_variants (product_id, size_id, sku_variant, additional_price, stock_quantity, is_active) VALUES
(7, 2, 'JEAN-007-29', 0, 10, true),
(7, 3, 'JEAN-007-30', 0, 14, true),
(7, 4, 'JEAN-007-31', 0, 16, true),
(7, 5, 'JEAN-007-32', 0, 18, true),
(7, 6, 'JEAN-007-33', 0, 15, true),
(7, 7, 'JEAN-007-34', 0, 12, true);

-- Distressed Black Jeans (Product ID 8)
INSERT INTO product_variants (product_id, size_id, sku_variant, additional_price, stock_quantity, is_active) VALUES
(8, 1, 'JEAN-008-28', 0, 12, true),
(8, 2, 'JEAN-008-29', 0, 14, true),
(8, 3, 'JEAN-008-30', 0, 16, true),
(8, 4, 'JEAN-008-31', 0, 18, true),
(8, 5, 'JEAN-008-32', 0, 16, true),
(8, 6, 'JEAN-008-33', 0, 14, true),
(8, 7, 'JEAN-008-34', 0, 12, true);

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
('BULK50K', 'fixed', 50000, 500000, NOW(), DATE_ADD(NOW(), INTERVAL 60 DAY), 50, true, 'all', 'Diskon pembelian minimal 500rb');

-- ================================================
-- 9. SETTINGS
-- ================================================

INSERT INTO settings (setting_key, setting_value, setting_type, is_public) VALUES
('shop_name', 'Marketplace Jeans Premium', 'text', true),
('shop_email', 'admin@jeans.com', 'text', true),
('shop_phone', '081234567890', 'text', true),
('shop_address', 'Jl. Fashion Street No. 123, Jakarta', 'text', true),
('currency', 'IDR', 'text', true),
('tax_rate', '10', 'number', false),
('shipping_flat_rate', '50000', 'number', false),
('min_order_amount', '50000', 'number', false),
('max_upload_size', '5242880', 'number', false);

-- ================================================
-- END OF SEEDER
-- ================================================
