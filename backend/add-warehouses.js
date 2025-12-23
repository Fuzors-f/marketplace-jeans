const db = require('./src/config/database');

async function addWarehouses() {
  try {
    const sql = `
      INSERT INTO warehouses (name, code, location, address, city, province, phone, email, is_main, is_active) VALUES 
      ('Jakarta Warehouse', 'JKT', 'Jakarta Selatan', 'Jl. Sudirman No. 123', 'Jakarta Selatan', 'DKI Jakarta', '021-5551234', 'wh-jakarta@jeans.com', 0, 1),
      ('Bandung Warehouse', 'BDG', 'Bandung', 'Jl. Braga No. 88', 'Bandung', 'Jawa Barat', '022-4561234', 'wh-bandung@jeans.com', 0, 1),
      ('Surabaya Warehouse', 'SBY', 'Surabaya', 'Jl. Tunjungan No. 45', 'Surabaya', 'Jawa Timur', '031-7891234', 'wh-surabaya@jeans.com', 0, 1)
    `;
    
    await db.query(sql);
    console.log('✓ 3 warehouses added successfully!');
    
    // Verify
    const [rows] = await db.query('SELECT id, name, is_active FROM warehouses');
    console.log('All warehouses now:', rows);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

addWarehouses();
