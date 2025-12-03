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
