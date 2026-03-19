-- Add footer link columns to content_settings
ALTER TABLE content_settings ADD COLUMN show_in_footer TINYINT(1) DEFAULT 0 AFTER is_active;
ALTER TABLE content_settings ADD COLUMN footer_column TINYINT DEFAULT 0 AFTER show_in_footer;
ALTER TABLE content_settings ADD COLUMN footer_label VARCHAR(100) DEFAULT NULL AFTER footer_column;

-- Update existing 'about' page for footer
UPDATE content_settings SET show_in_footer = 1, footer_column = 2, footer_label = 'Tentang Kami' WHERE section_key = 'about';

-- Insert footer pages
-- footer_column: 1=Bantuan, 2=Perusahaan, 3=Tautan Langsung
INSERT INTO content_settings (section_key, section_name, title_id, title_en, content_id, content_en, is_active, show_in_footer, footer_column, footer_label, sort_order) VALUES
('contact', 'Halaman Kontak', 'Hubungi Kami', 'Contact Us', '<p>Silakan hubungi kami melalui email atau telepon.</p>', '<p>Please contact us via email or phone.</p>', 1, 1, 1, 'Hubungi Kami', 10),
('faq', 'Halaman FAQ', 'Pertanyaan Umum', 'FAQ', '<p>Halaman FAQ akan segera diperbarui.</p>', '<p>FAQ page coming soon.</p>', 1, 1, 1, 'FAQ', 11),
('returns', 'Halaman Pengembalian', 'Kebijakan Pengembalian', 'Returns Policy', '<p>Informasi pengembalian barang.</p>', '<p>Returns information.</p>', 1, 1, 1, 'Pengembalian', 12),
('store-locator', 'Halaman Lokasi Toko', 'Temukan Toko', 'Find Store', '<p>Lokasi toko kami.</p>', '<p>Our store locations.</p>', 1, 1, 1, 'Cari Toko', 13),
('track-order', 'Halaman Lacak Pesanan', 'Lacak Pesanan', 'Track Order', '<p>Lacak pesanan Anda.</p>', '<p>Track your order.</p>', 1, 1, 1, 'Lacak Pesanan', 14),
('privacy', 'Halaman Privasi', 'Kebijakan Privasi', 'Privacy Policy', '<p>Kebijakan privasi kami.</p>', '<p>Our privacy policy.</p>', 1, 1, 2, 'Kebijakan Privasi', 15),
('terms', 'Halaman Syarat & Ketentuan', 'Syarat & Ketentuan', 'Terms & Conditions', '<p>Syarat dan ketentuan penggunaan.</p>', '<p>Terms and conditions.</p>', 1, 1, 2, 'Syarat & Ketentuan', 16),
('membership', 'Halaman Membership', 'Program Membership', 'Membership Program', '<p>Info program membership.</p>', '<p>Membership program info.</p>', 1, 1, 3, 'Program Member', 17),
('jean-fit-guide', 'Halaman Panduan Ukuran', 'Panduan Ukuran Jeans', 'Jeans Fit Guide', '<p>Panduan memilih ukuran jeans.</p>', '<p>How to choose the right jeans fit.</p>', 1, 1, 3, 'Panduan Ukuran', 18),
('shipping', 'Halaman Kebijakan Pengiriman', 'Kebijakan Pengiriman', 'Shipping Policy', '<p>Informasi pengiriman.</p>', '<p>Shipping information.</p>', 1, 1, 3, 'Kebijakan Pengiriman', 19);
