# Quick Start Guide - Marketplace Jeans

## Prerequisites
✅ Node.js v16+ installed
✅ MySQL 5.7+ installed (or XAMPP)
✅ Git installed
✅ Code editor (VS Code recommended)

## Step 1: Clone/Setup Project

Project sudah berada di:
```
c:\xampp\htdocs\marketplace-jeans
```

## Step 2: Backend Setup

### 2.1 Install Dependencies
```bash
cd c:\xampp\htdocs\marketplace-jeans\backend
npm install
```

### 2.2 Configure Environment
```bash
# Copy .env.example to .env
copy .env.example .env
```

Edit `.env` dengan konfigurasi Anda:
```env
# Server
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=marketplace_jeans
DB_PORT=3306

# JWT
JWT_SECRET=marketplace_jeans_secret_key_2024_change_in_production
JWT_EXPIRE=7d

# Frontend URL (untuk CORS)
FRONTEND_URL=http://localhost:3000

# Midtrans (dapatkan dari https://dashboard.midtrans.com)
MIDTRANS_SERVER_KEY=your_midtrans_server_key_here
MIDTRANS_CLIENT_KEY=your_midtrans_client_key_here
MIDTRANS_IS_PRODUCTION=false
```

### 2.3 Setup Database

#### Jika menggunakan XAMPP:
1. Start Apache dan MySQL dari XAMPP Control Panel
2. Buka http://localhost/phpmyadmin
3. Database akan dibuat otomatis oleh migration script

#### Atau buat manual:
```sql
CREATE DATABASE marketplace_jeans CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2.4 Run Migrations
```bash
npm run migrate
```

Output yang diharapkan:
```
🔄 Starting database migrations...
✅ Connected to MySQL server
✅ Database 'marketplace_jeans' ready
✅ Migration 1/18 completed
✅ Migration 2/18 completed
...
✅ Migration 18/18 completed
🎉 All migrations completed successfully!
```

### 2.5 Start Backend Server
```bash
npm run dev
```

Server akan berjalan di: http://localhost:5000

Anda akan melihat:
```
🚀 Server running in development mode on port 5000
📡 API: http://localhost:5000/api
💚 Health check: http://localhost:5000/api/health
```

## Step 3: Frontend Setup

### 3.1 Install Dependencies
Buka terminal baru:
```bash
cd c:\xampp\htdocs\marketplace-jeans\frontend
npm install
```

### 3.2 Configure Environment
```bash
copy .env.example .env
```

Isi akan otomatis benar untuk development:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_UPLOADS_URL=http://localhost:5000/uploads
REACT_APP_MIDTRANS_CLIENT_KEY=your_midtrans_client_key_here
REACT_APP_SITE_NAME=Marketplace Jeans
REACT_APP_SITE_URL=http://localhost:3000
```

### 3.3 Start Frontend Server
```bash
npm start
```

Browser akan otomatis membuka: http://localhost:3000

## Step 4: Testing

### 4.1 Test Backend API
Buka browser atau Postman:
```
GET http://localhost:5000/api/health
```

Response:
```json
{
  "status": "OK",
  "message": "Marketplace Jeans API is running",
  "timestamp": "2024-12-03T..."
}
```

### 4.2 Test Database Connection
```
GET http://localhost:5000/api/products
```

Harusnya return empty array jika belum ada data:
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "total": 0,
    "page": 1,
    "limit": 12,
    "pages": 0
  }
}
```

### 4.3 Test Frontend
Buka http://localhost:3000 - Anda akan melihat homepage.

## Step 5: Create Admin User

### Via Postman/Thunder Client/cURL:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@marketplacejeans.com",
    "password": "admin123",
    "full_name": "Admin User",
    "phone": "08123456789"
  }'
```

### Update Role ke Admin (via MySQL):
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@marketplacejeans.com';
```

Atau via phpMyAdmin:
1. Buka http://localhost/phpmyadmin
2. Pilih database `marketplace_jeans`
3. Pilih tabel `users`
4. Edit user yang baru dibuat
5. Ubah `role` dari `guest` ke `admin`
6. Save

## Step 6: Login dan Test

1. Buka http://localhost:3000/login
2. Login dengan:
   - Email: admin@marketplacejeans.com
   - Password: admin123
3. Setelah login, klik nama user → Admin Dashboard
4. Anda akan masuk ke http://localhost:3000/admin

## Step 7: Add Sample Data

### Create Categories (via Admin atau API):
```sql
INSERT INTO categories (name, slug, description, is_active) VALUES
('Men Jeans', 'men-jeans', 'Jeans for men', true),
('Women Jeans', 'women-jeans', 'Jeans for women', true),
('Casual', 'casual', 'Casual wear', true);
```

### Create Fittings:
```sql
INSERT INTO fittings (name, slug, description, is_active) VALUES
('Slim Fit', 'slim-fit', 'Slim fitting style', true),
('Regular Fit', 'regular-fit', 'Regular fitting style', true),
('Loose Fit', 'loose-fit', 'Loose fitting style', true);
```

### Create Sizes:
```sql
INSERT INTO sizes (name, sort_order, is_active) VALUES
('28', 1, true),
('29', 2, true),
('30', 3, true),
('31', 4, true),
('32', 5, true),
('33', 6, true),
('34', 7, true),
('36', 8, true),
('38', 9, true);
```

### Create Member Discount:
```sql
INSERT INTO discounts (code, type, value, description, is_active) VALUES
('MEMBER10', 'member_auto', 10, 'Auto 10% discount for members', true);
```

## Step 8: Midtrans Configuration (Optional untuk Testing Payment)

1. Daftar di https://dashboard.midtrans.com
2. Pilih Sandbox mode untuk testing
3. Dapatkan Server Key dan Client Key
4. Update di `.env` backend dan frontend
5. Test payment dengan kartu kredit dummy Midtrans

## Troubleshooting

### Error: Cannot connect to MySQL
- ✅ Pastikan MySQL di XAMPP sudah running
- ✅ Check username/password di .env
- ✅ Verify port (default 3306)

### Error: Port 5000 already in use
- Ganti PORT di backend/.env ke 5001
- Update REACT_APP_API_URL di frontend/.env

### Error: Port 3000 already in use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Error: npm install gagal
```bash
# Clear cache
npm cache clean --force
# Install ulang
npm install
```

### Frontend tidak bisa connect ke backend
- ✅ Check backend server running
- ✅ Verify CORS configuration
- ✅ Check REACT_APP_API_URL di frontend .env

## Development Tips

### Buat user member untuk testing:
```javascript
// Register via API atau frontend /register
{
  "email": "member@test.com",
  "password": "member123",
  "full_name": "Member Test",
  "role": "member"
}
```

### Buat user admin stok:
1. Register user biasa
2. Update role via MySQL:
```sql
UPDATE users SET role = 'admin_stok' WHERE email = 'adminstock@test.com';
```

### Test bulk upload:
Buat file CSV dengan format:
```csv
name,slug,category_id,fitting_id,description,base_price,sku
"Slim Blue Jeans","slim-blue-jeans",1,1,"Premium slim jeans",299000,"SBJ-001"
```

### Monitor logs:
Backend akan menampilkan semua request di console jika NODE_ENV=development

## Next Steps

1. ✅ Customize tampilan frontend sesuai brand
2. ✅ Add product images ke folder backend/uploads/products
3. ✅ Configure email settings untuk notifications
4. ✅ Setup production server dan domain
5. ✅ Configure SSL certificate
6. ✅ Setup backup database otomatis
7. ✅ Configure CDN untuk images

## Production Deployment

Lihat file README.md section "Production Deployment" untuk panduan lengkap deploy ke production.

## Support

Jika ada masalah atau pertanyaan:
1. Check API_DOCUMENTATION.md untuk detail endpoint
2. Check README.md untuk informasi lengkap
3. Review error messages di console
4. Check database migrations berhasil
5. Verify all environment variables set correctly

## Selamat Menggunakan! 🎉

Your Marketplace Jeans is now ready to use!

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Admin Panel: http://localhost:3000/admin
