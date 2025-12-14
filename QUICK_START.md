# 🚀 QUICK START GUIDE

## Step 1: Database Setup (5 minutes)

### Import SQL Seeder
```bash
cd backend/src/database
mysql -u root -p marketplace_jeans < seeder.sql
```

Or jika database belum ada:
```bash
# Run migration first
cd backend
node src/database/migrate.js

# Then import seeder
mysql -u root -p marketplace_jeans < src/database/seeder.sql
```

---

## Step 2: Backend Setup (3 minutes)

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file dengan content:
cat > .env << 'EOF'
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=marketplace_jeans
DB_PORT=3306
PORT=5000
NODE_ENV=development
JWT_SECRET=marketplace_jeans_secret_2025
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
EOF

# Start server
npm start
# atau npm run dev untuk development dengan auto-reload
```

Expected output:
```
Server running on port 5000
Database connected successfully
```

---

## Step 3: Frontend Setup (3 minutes)

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Create .env.local file dengan content:
cat > .env.local << 'EOF'
REACT_APP_API_URL=http://localhost:5000/api
EOF

# Start development server
npm start
```

Browser akan otomatis membuka `http://localhost:3000`

---

## Step 4: Test Admin Login

**URL**: http://localhost:3000/login

**Credentials**:
- Email: `admin@jeans.com`
- Password: `admin123`

**Result**: Berhasil login → redirect ke `/`

---

## Step 5: Access Admin Panel

**URL**: http://localhost:3000/admin

**Available Features**:
- ✅ Dashboard with stats
- ✅ Manage Categories (Create/Read/Update/Delete)
- ✅ Manage Fittings (Create/Read/Update/Delete)
- ✅ Manage Sizes (Create/Read/Update/Delete)
- 🔄 Manage Products (WIP)
- 🔄 Manage Orders (WIP)
- 🔄 Manage Users (WIP)
- 🔄 Reports & Analytics (WIP)
- 🔄 Settings (WIP)

---

## ✨ What You Can Do Now

### 1. View All Data (Public)
- Categories: http://localhost:5000/api/categories
- Fittings: http://localhost:5000/api/fittings
- Sizes: http://localhost:5000/api/sizes
- Products: http://localhost:5000/api/products

### 2. Admin CRUD Operations (via UI)
- Dashboard: http://localhost:3000/admin
- Categories: http://localhost:3000/admin/categories
- Fittings: http://localhost:3000/admin/fittings
- Sizes: http://localhost:3000/admin/sizes

### 3. Test API with cURL

Get Categories:
```bash
curl http://localhost:5000/api/categories
```

Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@jeans.com","password":"admin123"}'
```

Create Category (replace TOKEN):
```bash
curl -X POST http://localhost:5000/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Test Category",
    "slug": "test-category",
    "description": "Test Category Description",
    "image_url": "/images/test.jpg"
  }'
```

---

## 🐛 Troubleshooting

### Backend won't start
```
Error: connect ECONNREFUSED
```
**Solution**: Pastikan MySQL server running
```bash
# Check MySQL status
mysql -u root -p -e "SELECT 1"
```

### Port 5000 already in use
```bash
# Change PORT in .env or kill process
lsof -ti:5000 | xargs kill -9
```

### Frontend can't connect to backend
```
Error: Failed to fetch from /api/...
```
**Solution**: Check .env.local REACT_APP_API_URL
```bash
# Pastikan backend server running di port 5000
curl http://localhost:5000/api/categories
```

### Login not working
```bash
# Check credentials (should work with dummy data from seeder)
# Email: admin@jeans.com
# Password: admin123

# If not working, check if seeder was imported
mysql -u root -p marketplace_jeans -e "SELECT * FROM users LIMIT 1"
```

### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution**: Backend CORS configuration sudah di-setup
- Check server.js sudah include cors middleware
- Check FRONTEND_URL di .env matches actual frontend URL

---

## 📊 Database Sample Data

Seeder sudah meng-insert:
- **Users**: 1 admin, 2 members
- **Categories**: 8 (Slim Fit, Regular, Skinny, Loose, Bootcut, Straight Leg, Mom Jeans, Distressed)
- **Fittings**: 5 (Extra Slim, Slim, Regular, Comfort, Loose)
- **Sizes**: 15 (28-44)
- **Products**: 8 sample jeans with variants and images
- **Discounts**: 3 promo codes

---

## 🎯 Next Steps

1. **Test Admin Features** (now):
   - Create/Edit/Delete a Category
   - Create/Edit/Delete a Fitting
   - Create/Edit/Delete a Size

2. **Develop Product Management** (todo):
   - Admin can add/edit/delete products
   - Admin can manage product variants
   - Admin can upload product images

3. **Setup Order Management** (todo):
   - User can create orders
   - Admin can view and manage orders
   - Order status tracking

4. **Payment Integration** (todo):
   - Midtrans or Stripe integration
   - Payment verification

5. **Shipping Integration** (todo):
   - JNE/TIKI API integration
   - Real-time shipping cost calculation

---

## 📝 Commands Quick Reference

### Backend
```bash
# Start development
cd backend && npm start

# Run migrations
node src/database/migrate.js

# Import seeder data
mysql -u root -p marketplace_jeans < src/database/seeder.sql
```

### Frontend
```bash
# Start development
cd frontend && npm start

# Build for production
npm run build
```

### Database
```bash
# Access MySQL
mysql -u root -p

# View users
USE marketplace_jeans;
SELECT * FROM users;

# View categories
SELECT * FROM categories;
```

---

## 🎓 Key Features Implemented

✅ **Data-Driven** - All data from database, no hardcoding
✅ **Admin CRUD** - Full create/read/update/delete for Categories, Fittings, Sizes
✅ **Authentication** - JWT-based with role protection
✅ **Error Handling** - Comprehensive error messages
✅ **SQL Safety** - Parameterized queries prevent injection
✅ **Activity Logging** - All admin actions logged
✅ **Responsive UI** - Tailwind CSS based design
✅ **Scalable Structure** - Easy to add new features

---

## 📞 Support

See detailed documentation:
- `IMPLEMENTATION_GUIDE.md` - Complete setup & API reference
- `CHANGELOG.md` - Detailed changes made

---

**Ready to develop!** 🚀
