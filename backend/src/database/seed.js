const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // 1. Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await query(
      `INSERT INTO users (email, password, full_name, phone, role, member_discount) 
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE id=id`,
      ['admin@marketplacejeans.com', hashedPassword, 'Admin User', '08123456789', 'admin', 0]
    );
    console.log('✅ Admin user created (email: admin@marketplacejeans.com, pass: admin123)');

    // 2. Create member user
    const memberPassword = await bcrypt.hash('member123', 10);
    await query(
      `INSERT INTO users (email, password, full_name, phone, role, member_discount) 
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE id=id`,
      ['member@test.com', memberPassword, 'Member Test', '08123456788', 'member', 10]
    );
    console.log('✅ Member user created (email: member@test.com, pass: member123)');

    // 3. Create categories
    const categories = [
      ['Men Jeans', 'men-jeans', 'Denim jeans for men', null],
      ['Women Jeans', 'women-jeans', 'Denim jeans for women', null],
      ['Casual Wear', 'casual-wear', 'Casual clothing', null],
    ];

    for (const cat of categories) {
      await query(
        `INSERT INTO categories (name, slug, description, parent_id) 
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE id=id`,
        cat
      );
    }
    console.log('✅ Categories created');

    // 4. Create fittings
    const fittings = [
      ['Slim Fit', 'slim-fit', 'Slim fitting style'],
      ['Regular Fit', 'regular-fit', 'Regular fitting style'],
      ['Loose Fit', 'loose-fit', 'Loose fitting style'],
      ['Skinny Fit', 'skinny-fit', 'Skinny fitting style'],
    ];

    for (const fit of fittings) {
      await query(
        `INSERT INTO fittings (name, slug, description) 
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE id=id`,
        fit
      );
    }
    console.log('✅ Fittings created');

    // 5. Create sizes
    const sizes = [
      ['28', 1], ['29', 2], ['30', 3], ['31', 4], ['32', 5],
      ['33', 6], ['34', 7], ['36', 8], ['38', 9], ['40', 10],
      ['S', 11], ['M', 12], ['L', 13], ['XL', 14], ['XXL', 15]
    ];

    for (const size of sizes) {
      await query(
        `INSERT INTO sizes (name, sort_order) 
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE id=id`,
        size
      );
    }
    console.log('✅ Sizes created');

    // 6. Create sample products
    const products = [
      {
        name: 'Classic Blue Slim Jeans',
        slug: 'classic-blue-slim-jeans',
        category_id: 1,
        fitting_id: 1,
        description: 'Premium denim jeans with classic blue wash. Perfect fit for everyday wear.',
        short_description: 'Classic blue denim with slim fit',
        base_price: 299000,
        master_cost_price: 150000,
        sku: 'CBJ-SLIM-001',
        weight: 0.5,
        is_featured: true,
      },
      {
        name: 'Black Regular Jeans',
        slug: 'black-regular-jeans',
        category_id: 1,
        fitting_id: 2,
        description: 'Timeless black jeans with regular fit. Versatile and comfortable.',
        short_description: 'Black denim regular fit',
        base_price: 279000,
        master_cost_price: 140000,
        sku: 'BRJ-REG-001',
        weight: 0.5,
        is_featured: true,
      },
      {
        name: 'Light Wash Loose Jeans',
        slug: 'light-wash-loose-jeans',
        category_id: 2,
        fitting_id: 3,
        description: 'Relaxed fit jeans with light wash. Comfortable for all-day wear.',
        short_description: 'Light wash loose fit',
        base_price: 319000,
        master_cost_price: 160000,
        sku: 'LWJ-LOOSE-001',
        weight: 0.6,
        is_featured: true,
      },
    ];

    for (const product of products) {
      const result = await query(
        `INSERT INTO products 
        (name, slug, category_id, fitting_id, description, short_description, 
         base_price, master_cost_price, sku, weight, is_featured,
         meta_title, meta_description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`,
        [product.name, product.slug, product.category_id, product.fitting_id,
         product.description, product.short_description, product.base_price,
         product.master_cost_price, product.sku, product.weight, product.is_featured,
         product.name, product.short_description]
      );

      const productId = result.insertId;

      // Add variants (sizes 28-34)
      for (let i = 1; i <= 7; i++) {
        await query(
          `INSERT INTO product_variants 
          (product_id, size_id, sku_variant, additional_price, stock_quantity)
          VALUES (?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE id=id`,
          [productId, i, `${product.sku}-${28 + i - 1}`, 0, Math.floor(Math.random() * 20) + 5]
        );
      }
    }
    console.log('✅ Sample products created');

    // 7. Create discounts
    await query(
      `INSERT INTO discounts (code, type, value, min_purchase, max_discount, description) 
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE id=id`,
      ['WELCOME10', 'percentage', 10, 200000, 50000, 'Welcome discount 10% off']
    );

    await query(
      `INSERT INTO discounts (code, type, value, min_purchase, description) 
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE id=id`,
      ['FLAT50K', 'fixed', 50000, 500000, 'Flat 50K discount for purchase above 500K']
    );
    console.log('✅ Sample discounts created');

    // 8. Create settings
    const settings = [
      ['site_name', 'Marketplace Jeans', 'text', 'Website name', true],
      ['currency', 'IDR', 'text', 'Default currency', true],
      ['member_discount', '10', 'number', 'Default member discount percentage', false],
      ['min_order', '100000', 'number', 'Minimum order amount', true],
      ['free_shipping_min', '500000', 'number', 'Minimum for free shipping', true],
    ];

    for (const setting of settings) {
      await query(
        `INSERT INTO settings (setting_key, setting_value, setting_type, description, is_public) 
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value)`,
        setting
      );
    }
    console.log('✅ Settings created');

    // 9. Create warehouses
    const warehouses = [
      ['Jakarta Warehouse', 'JKT', 'Jakarta Selatan', 'Jl. Sudirman No. 123', 'Jakarta Selatan', 'DKI Jakarta', '021-5551234', 'wh-jakarta@jeans.com', true],
      ['Bandung Warehouse', 'BDG', 'Bandung', 'Jl. Braga No. 88', 'Bandung', 'Jawa Barat', '022-4561234', 'wh-bandung@jeans.com', false],
      ['Surabaya Warehouse', 'SBY', 'Surabaya', 'Jl. Tunjungan No. 45', 'Surabaya', 'Jawa Timur', '031-7891234', 'wh-surabaya@jeans.com', false]
    ];

    for (const wh of warehouses) {
      await query(
        `INSERT INTO warehouses (name, code, location, address, city, province, phone, email, is_main) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE id=id`,
        wh
      );
    }
    console.log('✅ Warehouses created');

    // 10. Create cities
    const cities = [
      // DKI Jakarta
      ['Jakarta Pusat', 'DKI Jakarta', '10110', 'kota'],
      ['Jakarta Utara', 'DKI Jakarta', '14120', 'kota'],
      ['Jakarta Barat', 'DKI Jakarta', '11430', 'kota'],
      ['Jakarta Selatan', 'DKI Jakarta', '12110', 'kota'],
      ['Jakarta Timur', 'DKI Jakarta', '13210', 'kota'],
      // Jawa Barat
      ['Bandung', 'Jawa Barat', '40111', 'kota'],
      ['Bekasi', 'Jawa Barat', '17112', 'kota'],
      ['Bogor', 'Jawa Barat', '16111', 'kota'],
      ['Depok', 'Jawa Barat', '16411', 'kota'],
      ['Cirebon', 'Jawa Barat', '45111', 'kota'],
      ['Karawang', 'Jawa Barat', '41311', 'kabupaten'],
      ['Tasikmalaya', 'Jawa Barat', '46111', 'kota'],
      ['Garut', 'Jawa Barat', '44112', 'kabupaten'],
      // Jawa Tengah
      ['Semarang', 'Jawa Tengah', '50111', 'kota'],
      ['Solo', 'Jawa Tengah', '57111', 'kota'],
      ['Magelang', 'Jawa Tengah', '56111', 'kota'],
      ['Pekalongan', 'Jawa Tengah', '51111', 'kota'],
      ['Purwokerto', 'Jawa Tengah', '53111', 'kabupaten'],
      // Jawa Timur
      ['Surabaya', 'Jawa Timur', '60111', 'kota'],
      ['Malang', 'Jawa Timur', '65111', 'kota'],
      ['Sidoarjo', 'Jawa Timur', '61211', 'kabupaten'],
      ['Kediri', 'Jawa Timur', '64111', 'kota'],
      ['Banyuwangi', 'Jawa Timur', '68411', 'kabupaten'],
      // DI Yogyakarta
      ['Yogyakarta', 'DI Yogyakarta', '55111', 'kota'],
      ['Sleman', 'DI Yogyakarta', '55511', 'kabupaten'],
      ['Bantul', 'DI Yogyakarta', '55711', 'kabupaten'],
      // Banten
      ['Tangerang', 'Banten', '15111', 'kota'],
      ['Tangerang Selatan', 'Banten', '15310', 'kota'],
      ['Serang', 'Banten', '42111', 'kota'],
      // Bali
      ['Denpasar', 'Bali', '80111', 'kota'],
      ['Badung', 'Bali', '80351', 'kabupaten'],
      // Sumatera
      ['Medan', 'Sumatera Utara', '20111', 'kota'],
      ['Padang', 'Sumatera Barat', '25111', 'kota'],
      ['Palembang', 'Sumatera Selatan', '30111', 'kota'],
      ['Bandar Lampung', 'Lampung', '35111', 'kota'],
      // Kalimantan
      ['Pontianak', 'Kalimantan Barat', '78111', 'kota'],
      ['Banjarmasin', 'Kalimantan Selatan', '70111', 'kota'],
      ['Balikpapan', 'Kalimantan Timur', '76111', 'kota'],
      ['Samarinda', 'Kalimantan Timur', '75111', 'kota'],
      // Sulawesi
      ['Makassar', 'Sulawesi Selatan', '90111', 'kota'],
      ['Manado', 'Sulawesi Utara', '95111', 'kota']
    ];

    for (const city of cities) {
      await query(
        `INSERT INTO cities (name, province, postal_code, city_type) 
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE id=id`,
        city
      );
    }
    console.log('✅ Cities created');

    // 11. Create shipping costs (from Jakarta Warehouse ID: 1)
    // Get city IDs first
    const cityList = await query('SELECT id, name, province FROM cities ORDER BY id');
    const cityMap = {};
    for (const c of cityList) {
      cityMap[`${c.name}-${c.province}`] = c.id;
    }

    const shippingCosts = [
      // Jakarta cities (same area, cheap shipping)
      { city: 'Jakarta Pusat-DKI Jakarta', warehouse: 1, courier: 'JNE', service: 'REG', cost: 9000, costPerKg: 5000, minDays: 1, maxDays: 2 },
      { city: 'Jakarta Pusat-DKI Jakarta', warehouse: 1, courier: 'JNE', service: 'YES', cost: 15000, costPerKg: 8000, minDays: 1, maxDays: 1 },
      { city: 'Jakarta Pusat-DKI Jakarta', warehouse: 1, courier: 'J&T', service: 'Regular', cost: 9000, costPerKg: 5000, minDays: 1, maxDays: 2 },
      { city: 'Jakarta Selatan-DKI Jakarta', warehouse: 1, courier: 'JNE', service: 'REG', cost: 9000, costPerKg: 5000, minDays: 1, maxDays: 2 },
      { city: 'Jakarta Selatan-DKI Jakarta', warehouse: 1, courier: 'JNE', service: 'YES', cost: 15000, costPerKg: 8000, minDays: 1, maxDays: 1 },
      { city: 'Jakarta Selatan-DKI Jakarta', warehouse: 1, courier: 'J&T', service: 'Regular', cost: 9000, costPerKg: 5000, minDays: 1, maxDays: 2 },
      { city: 'Jakarta Barat-DKI Jakarta', warehouse: 1, courier: 'JNE', service: 'REG', cost: 9000, costPerKg: 5000, minDays: 1, maxDays: 2 },
      { city: 'Jakarta Timur-DKI Jakarta', warehouse: 1, courier: 'JNE', service: 'REG', cost: 9000, costPerKg: 5000, minDays: 1, maxDays: 2 },
      { city: 'Jakarta Utara-DKI Jakarta', warehouse: 1, courier: 'JNE', service: 'REG', cost: 9000, costPerKg: 5000, minDays: 1, maxDays: 2 },
      
      // Jawa Barat
      { city: 'Bandung-Jawa Barat', warehouse: 1, courier: 'JNE', service: 'REG', cost: 15000, costPerKg: 8000, minDays: 2, maxDays: 3 },
      { city: 'Bandung-Jawa Barat', warehouse: 1, courier: 'JNE', service: 'YES', cost: 25000, costPerKg: 12000, minDays: 1, maxDays: 1 },
      { city: 'Bandung-Jawa Barat', warehouse: 1, courier: 'J&T', service: 'Regular', cost: 14000, costPerKg: 7500, minDays: 2, maxDays: 3 },
      { city: 'Bekasi-Jawa Barat', warehouse: 1, courier: 'JNE', service: 'REG', cost: 10000, costPerKg: 5500, minDays: 1, maxDays: 2 },
      { city: 'Bekasi-Jawa Barat', warehouse: 1, courier: 'J&T', service: 'Regular', cost: 10000, costPerKg: 5500, minDays: 1, maxDays: 2 },
      { city: 'Bogor-Jawa Barat', warehouse: 1, courier: 'JNE', service: 'REG', cost: 12000, costPerKg: 6000, minDays: 1, maxDays: 2 },
      { city: 'Depok-Jawa Barat', warehouse: 1, courier: 'JNE', service: 'REG', cost: 10000, costPerKg: 5500, minDays: 1, maxDays: 2 },
      { city: 'Cirebon-Jawa Barat', warehouse: 1, courier: 'JNE', service: 'REG', cost: 18000, costPerKg: 9000, minDays: 2, maxDays: 3 },
      { city: 'Tasikmalaya-Jawa Barat', warehouse: 1, courier: 'JNE', service: 'REG', cost: 22000, costPerKg: 11000, minDays: 3, maxDays: 4 },
      { city: 'Garut-Jawa Barat', warehouse: 1, courier: 'JNE', service: 'REG', cost: 20000, costPerKg: 10000, minDays: 3, maxDays: 4 },

      // Jawa Tengah
      { city: 'Semarang-Jawa Tengah', warehouse: 1, courier: 'JNE', service: 'REG', cost: 22000, costPerKg: 11000, minDays: 2, maxDays: 4 },
      { city: 'Semarang-Jawa Tengah', warehouse: 1, courier: 'JNE', service: 'YES', cost: 35000, costPerKg: 18000, minDays: 1, maxDays: 2 },
      { city: 'Semarang-Jawa Tengah', warehouse: 1, courier: 'J&T', service: 'Regular', cost: 21000, costPerKg: 10500, minDays: 2, maxDays: 4 },
      { city: 'Solo-Jawa Tengah', warehouse: 1, courier: 'JNE', service: 'REG', cost: 24000, costPerKg: 12000, minDays: 3, maxDays: 4 },
      { city: 'Magelang-Jawa Tengah', warehouse: 1, courier: 'JNE', service: 'REG', cost: 25000, costPerKg: 12500, minDays: 3, maxDays: 4 },

      // Jawa Timur
      { city: 'Surabaya-Jawa Timur', warehouse: 1, courier: 'JNE', service: 'REG', cost: 25000, costPerKg: 12500, minDays: 3, maxDays: 4 },
      { city: 'Surabaya-Jawa Timur', warehouse: 1, courier: 'JNE', service: 'YES', cost: 40000, costPerKg: 20000, minDays: 1, maxDays: 2 },
      { city: 'Surabaya-Jawa Timur', warehouse: 1, courier: 'J&T', service: 'Regular', cost: 24000, costPerKg: 12000, minDays: 3, maxDays: 4 },
      { city: 'Malang-Jawa Timur', warehouse: 1, courier: 'JNE', service: 'REG', cost: 28000, costPerKg: 14000, minDays: 3, maxDays: 5 },
      { city: 'Sidoarjo-Jawa Timur', warehouse: 1, courier: 'JNE', service: 'REG', cost: 26000, costPerKg: 13000, minDays: 3, maxDays: 4 },

      // Yogyakarta
      { city: 'Yogyakarta-DI Yogyakarta', warehouse: 1, courier: 'JNE', service: 'REG', cost: 23000, costPerKg: 11500, minDays: 2, maxDays: 4 },
      { city: 'Yogyakarta-DI Yogyakarta', warehouse: 1, courier: 'JNE', service: 'YES', cost: 38000, costPerKg: 19000, minDays: 1, maxDays: 2 },
      { city: 'Sleman-DI Yogyakarta', warehouse: 1, courier: 'JNE', service: 'REG', cost: 24000, costPerKg: 12000, minDays: 2, maxDays: 4 },

      // Banten
      { city: 'Tangerang-Banten', warehouse: 1, courier: 'JNE', service: 'REG', cost: 10000, costPerKg: 5500, minDays: 1, maxDays: 2 },
      { city: 'Tangerang-Banten', warehouse: 1, courier: 'JNE', service: 'YES', cost: 18000, costPerKg: 9000, minDays: 1, maxDays: 1 },
      { city: 'Tangerang Selatan-Banten', warehouse: 1, courier: 'JNE', service: 'REG', cost: 10000, costPerKg: 5500, minDays: 1, maxDays: 2 },
      { city: 'Serang-Banten', warehouse: 1, courier: 'JNE', service: 'REG', cost: 15000, costPerKg: 7500, minDays: 2, maxDays: 3 },

      // Bali
      { city: 'Denpasar-Bali', warehouse: 1, courier: 'JNE', service: 'REG', cost: 35000, costPerKg: 17500, minDays: 4, maxDays: 5 },
      { city: 'Denpasar-Bali', warehouse: 1, courier: 'JNE', service: 'YES', cost: 55000, costPerKg: 27000, minDays: 2, maxDays: 3 },
      { city: 'Badung-Bali', warehouse: 1, courier: 'JNE', service: 'REG', cost: 36000, costPerKg: 18000, minDays: 4, maxDays: 5 },

      // Sumatera
      { city: 'Medan-Sumatera Utara', warehouse: 1, courier: 'JNE', service: 'REG', cost: 45000, costPerKg: 22000, minDays: 5, maxDays: 7 },
      { city: 'Padang-Sumatera Barat', warehouse: 1, courier: 'JNE', service: 'REG', cost: 48000, costPerKg: 24000, minDays: 5, maxDays: 7 },
      { city: 'Palembang-Sumatera Selatan', warehouse: 1, courier: 'JNE', service: 'REG', cost: 40000, costPerKg: 20000, minDays: 4, maxDays: 6 },
      { city: 'Bandar Lampung-Lampung', warehouse: 1, courier: 'JNE', service: 'REG', cost: 35000, costPerKg: 17500, minDays: 3, maxDays: 5 },

      // Kalimantan
      { city: 'Pontianak-Kalimantan Barat', warehouse: 1, courier: 'JNE', service: 'REG', cost: 55000, costPerKg: 27000, minDays: 5, maxDays: 7 },
      { city: 'Banjarmasin-Kalimantan Selatan', warehouse: 1, courier: 'JNE', service: 'REG', cost: 50000, costPerKg: 25000, minDays: 5, maxDays: 7 },
      { city: 'Balikpapan-Kalimantan Timur', warehouse: 1, courier: 'JNE', service: 'REG', cost: 55000, costPerKg: 27000, minDays: 5, maxDays: 7 },
      { city: 'Samarinda-Kalimantan Timur', warehouse: 1, courier: 'JNE', service: 'REG', cost: 58000, costPerKg: 29000, minDays: 5, maxDays: 7 },

      // Sulawesi
      { city: 'Makassar-Sulawesi Selatan', warehouse: 1, courier: 'JNE', service: 'REG', cost: 50000, costPerKg: 25000, minDays: 5, maxDays: 7 },
      { city: 'Makassar-Sulawesi Selatan', warehouse: 1, courier: 'JNE', service: 'YES', cost: 80000, costPerKg: 40000, minDays: 2, maxDays: 3 },
      { city: 'Manado-Sulawesi Utara', warehouse: 1, courier: 'JNE', service: 'REG', cost: 65000, costPerKg: 32000, minDays: 6, maxDays: 8 },

      // From Surabaya Warehouse (ID: 3) - cheaper for East Java & Bali
      { city: 'Surabaya-Jawa Timur', warehouse: 3, courier: 'JNE', service: 'REG', cost: 8000, costPerKg: 4000, minDays: 1, maxDays: 1 },
      { city: 'Malang-Jawa Timur', warehouse: 3, courier: 'JNE', service: 'REG', cost: 12000, costPerKg: 6000, minDays: 1, maxDays: 2 },
      { city: 'Sidoarjo-Jawa Timur', warehouse: 3, courier: 'JNE', service: 'REG', cost: 9000, costPerKg: 4500, minDays: 1, maxDays: 1 },
      { city: 'Denpasar-Bali', warehouse: 3, courier: 'JNE', service: 'REG', cost: 25000, costPerKg: 12500, minDays: 2, maxDays: 3 },
      
      // From Bandung Warehouse (ID: 2) - cheaper for West Java
      { city: 'Bandung-Jawa Barat', warehouse: 2, courier: 'JNE', service: 'REG', cost: 8000, costPerKg: 4000, minDays: 1, maxDays: 1 },
      { city: 'Tasikmalaya-Jawa Barat', warehouse: 2, courier: 'JNE', service: 'REG', cost: 12000, costPerKg: 6000, minDays: 1, maxDays: 2 },
      { city: 'Garut-Jawa Barat', warehouse: 2, courier: 'JNE', service: 'REG', cost: 10000, costPerKg: 5000, minDays: 1, maxDays: 2 }
    ];

    for (const sc of shippingCosts) {
      const cityId = cityMap[sc.city];
      if (cityId) {
        await query(
          `INSERT INTO shipping_costs (city_id, warehouse_id, courier, service, cost, cost_per_kg, estimated_days_min, estimated_days_max) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE cost=VALUES(cost), cost_per_kg=VALUES(cost_per_kg)`,
          [cityId, sc.warehouse, sc.courier, sc.service, sc.cost, sc.costPerKg, sc.minDays, sc.maxDays]
        );
      }
    }
    console.log('✅ Shipping costs created');

    console.log('\n🎉 Database seeding completed successfully!\n');
    console.log('📝 Credentials:');
    console.log('   Admin: admin@marketplacejeans.com / admin123');
    console.log('   Member: member@test.com / member123\n');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run seeding
seedDatabase();
