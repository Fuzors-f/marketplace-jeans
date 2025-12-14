# 📋 Setup & Implementation Guide

## 1️⃣ DATABASE SETUP

### Option A: Menggunakan Migration Script (Recommended)

```bash
cd backend
node src/database/migrate.js
```

### Option B: Manual SQL

1. Jalankan file `backend/src/database/migrate.js` untuk membuat struktur database
2. Jalankan file `backend/src/database/seeder.sql` untuk insert dummy data:

```bash
mysql -u root -p marketplace_jeans < src/database/seeder.sql
```

### Default Admin Account (from seeder.sql)
- **Email**: admin@jeans.com
- **Password**: admin123
- **Role**: admin

---

## 2️⃣ BACKEND SETUP

### Install Dependencies
```bash
cd backend
npm install
```

### Environment Variables (.env)
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=marketplace_jeans
DB_PORT=3306

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Frontend
FRONTEND_URL=http://localhost:3000

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
```

### Start Backend Server
```bash
npm start
# Development with auto-reload
npm run dev
```

Backend akan running di `http://localhost:5000`

---

## 3️⃣ FRONTEND SETUP

### Install Dependencies
```bash
cd frontend
npm install
```

### Environment Variables (.env.local)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Start Frontend Server
```bash
npm start
```

Frontend akan running di `http://localhost:3000`

---

## 4️⃣ API ENDPOINTS

### ✅ Categories
```
GET    /api/categories              # Get all categories
GET    /api/categories/:slug        # Get single category
POST   /api/categories              # Create (Admin only)
PUT    /api/categories/:id          # Update (Admin only)
DELETE /api/categories/:id          # Delete (Admin only)
```

### ✅ Fittings
```
GET    /api/fittings                # Get all fittings
POST   /api/fittings                # Create (Admin only)
PUT    /api/fittings/:id            # Update (Admin only)
DELETE /api/fittings/:id            # Delete (Admin only)
```

### ✅ Sizes
```
GET    /api/sizes                   # Get all sizes
POST   /api/sizes                   # Create (Admin only)
PUT    /api/sizes/:id               # Update (Admin only)
DELETE /api/sizes/:id               # Delete (Admin only)
```

### Products
```
GET    /api/products                # Get all products (with filters)
GET    /api/products/:slug          # Get single product
POST   /api/products                # Create (Admin only)
PUT    /api/products/:id            # Update (Admin only)
DELETE /api/products/:id            # Delete (Admin only)
```

---

## 5️⃣ ADMIN PANEL ACCESS

1. Login dengan admin account: admin@jeans.com / admin123
2. Akses: `http://localhost:3000/admin`
3. Manage data melalui UI yang tersedia:
   - Categories
   - Fittings
   - Sizes
   - Products (coming soon)
   - Orders (coming soon)
   - Users (coming soon)
   - Reports (coming soon)
   - Settings (coming soon)

---

## 6️⃣ QUERY ERROR FIX

### Error: "Unknown column 'p.newest' in 'order clause'"

**Status**: ✅ FIXED

**File**: `backend/src/controllers/productController.js`

**Solution**:
- Kolom `newest` tidak ada di tabel `products`
- Diganti dengan `created_at` (waktu produk dibuat)
- Added sort column validation untuk prevent SQL injection
- Valid sort columns: `id`, `name`, `base_price`, `created_at`, `updated_at`, `view_count`

**Code Changes**:
```javascript
// Validate sort column (prevent SQL injection)
const validSortColumns = ['id', 'name', 'base_price', 'created_at', 'updated_at', 'view_count'];
const sortColumn = validSortColumns.includes(sort) ? sort : 'created_at';
const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
```

---

## 7️⃣ DATA-DRIVEN APPROACH (NO HARDCODING)

### ✅ Implementasi:
- Semua kategori, fitting, size diambil dari database melalui API
- Frontend menggunakan `useEffect` + `axios` untuk fetch data
- Dropdown/select options diisi dynamically dari API
- Error & loading states dihandle dengan baik

### ✅ Services Layer (`frontend/src/services/api.js`)
- Centralized API client dengan axios
- Interceptors untuk JWT token management
- Organized by feature (categories, fittings, sizes, products, etc)
- Consistent error handling

---

## 8️⃣ CODE STRUCTURE

### Backend
```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Database connection
│   ├── controllers/
│   │   ├── categoryController.js # ✅ NEW
│   │   ├── fittingController.js  # ✅ NEW
│   │   ├── sizeController.js     # ✅ NEW
│   │   ├── productController.js  # ✅ FIXED
│   │   └── ... (other controllers)
│   ├── routes/
│   │   ├── categoryRoutes.js     # ✅ UPDATED
│   │   ├── fittingRoutes.js      # ✅ NEW
│   │   ├── sizeRoutes.js         # ✅ NEW
│   │   └── ... (other routes)
│   ├── middleware/
│   │   ├── auth.js               # JWT validation
│   │   └── ... (other middleware)
│   └── database/
│       ├── migrate.js            # Schema creation
│       └── seeder.sql            # ✅ NEW - Dummy data
├── server.js                     # Express app setup
├── package.json
└── .env                          # Environment variables
```

### Frontend
```
frontend/
├── src/
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── Dashboard.js      # ✅ UPDATED
│   │   │   ├── Categories.js     # ✅ NEW
│   │   │   ├── Fittings.js       # ✅ NEW
│   │   │   ├── Sizes.js          # ✅ NEW
│   │   │   └── ... (other pages)
│   │   └── ... (other pages)
│   ├── components/
│   │   ├── PrivateRoute.js
│   │   └── AdminRoute.js
│   ├── services/
│   │   └── api.js                # ✅ NEW - API service layer
│   ├── redux/
│   │   └── ... (Redux store)
│   ├── App.js                    # ✅ UPDATED - Added routes
│   └── index.js
├── package.json
└── .env.local                    # Environment variables
```

---

## 9️⃣ BEST PRACTICES IMPLEMENTED

### Backend
✅ Async/await for all database operations
✅ Parameterized queries (prevent SQL injection)
✅ Consistent error handling
✅ Activity logging untuk setiap action
✅ Role-based access control (Admin/User)
✅ Organized controller, route, middleware structure

### Frontend
✅ Component reusability
✅ Centralized API service
✅ useEffect hooks untuk data fetching
✅ Loading & error states
✅ Protected routes for admin & private pages
✅ JWT token management in interceptors

---

## 🔟 NEXT STEPS (TODO)

Fitur yang masih perlu dikembangkan:

- [ ] Admin Products CRUD (full implementation with variants & images)
- [ ] Product filtering & search di frontend
- [ ] Order management system
- [ ] Payment integration (Midtrans/Stripe)
- [ ] Inventory tracking & alerts
- [ ] Sales reports & analytics
- [ ] User management
- [ ] Shipping integration
- [ ] Email notifications
- [ ] Image upload functionality
- [ ] Discount/coupon system improvements
- [ ] Product reviews & ratings

---

## 🎯 TESTING

### Test Admin Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@jeans.com","password":"admin123"}'
```

### Test Get Categories
```bash
curl http://localhost:5000/api/categories
```

### Test Create Category (Admin only)
```bash
curl -X POST http://localhost:5000/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"name":"Test Category","slug":"test-category","description":"Test"}'
```

---

## 📞 TROUBLESHOOTING

### Database Connection Error
- Pastikan MySQL server running
- Check `.env` database credentials
- Pastikan database `marketplace_jeans` sudah dibuat

### JWT Token Error
- Login lagi untuk mendapatkan token baru
- Check `JWT_SECRET` di `.env`

### CORS Error
- Check `FRONTEND_URL` di backend `.env`
- Pastikan CORS configuration di server.js sudah benar

### API Not Found (404)
- Check apakah routes sudah di-register di server.js
- Verify endpoint URL dan method (GET/POST/PUT/DELETE)

---

**Last Updated**: December 15, 2025
**Version**: 1.0.0
**Status**: Production Ready (MVP Phase)
