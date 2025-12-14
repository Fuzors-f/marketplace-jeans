# Quick Reference - Phase 2 Implementation

## Files Modified/Created

### Frontend - Pages
- `src/pages/Home.js` → UPDATED (integrated /api/home)
- `src/pages/Checkout.js` → UPDATED (guest & user flows)
- `src/pages/admin/Orders.js` → UPDATED (full admin panel)
- `src/pages/admin/Banners.js` → CREATED (banner management)

### Frontend - Routing
- `src/App.js` → UPDATED (added AdminBanners import + route)
- `src/layouts/AdminLayout.js` → UPDATED (added menu items + icons)

### Backend - Database
- `backend/src/database/migrate.js` → UPDATED (added banners table migration)

### Documentation
- `FRONTEND_UPDATE.md` → UPDATED (Phase 2 summary)
- `PHASE_2_COMPLETE.md` → CREATED (comprehensive guide)

---

## Component Features at a Glance

### Home.js
- Dynamic banners from `/api/home`
- Featured & newest products
- Category listing
- Fallback to hardcoded data

### Checkout.js
- Guest checkout (email + address)
- User checkout (auto-fill from profile)
- Shipping options: Standard (Rp 15K), Express (Rp 50K), Same Day (Rp 100K)
- Payment methods: Bank Transfer, Credit Card, E-Wallet, COD
- Real-time total calculation
- Order summary sidebar

### Admin/Orders.js
- Order listing with pagination (10 per page)
- Filter by status & payment status
- Expandable order details
- Update order status
- Update payment status
- Color-coded status badges

### Admin/Banners.js
- Create banners (form modal)
- List banners (3-column grid)
- Edit banners (pre-filled form)
- Delete banners (with confirmation)
- Auto-sort by position

---

## Key API Endpoints

### Public
```
GET /api/home                    → Homepage data (banners, products, categories)
GET /api/banners                 → All active banners
```

### Orders
```
POST /api/orders/guest           → Create guest order
POST /api/orders                 → Create user order (requires JWT)
GET /api/admin/orders            → List all orders (admin, with filters)
PATCH /api/admin/orders/:id/status           → Update order status
PATCH /api/admin/orders/:id/payment-status   → Update payment status
```

### Banners (Admin)
```
POST /api/banners                → Create banner
PUT /api/banners/:id             → Update banner
DELETE /api/banners/:id          → Delete banner
```

---

## Admin Menu Structure

```
Admin Panel
├── Dashboard
├── Products
├── Categories
├── Fittings
├── Sizes
├── Banners          ← NEW
├── Orders           ← NEW
├── Inventory
├── Reports
├── Users
├── Settings
└── Logout
```

---

## Form Validations

### Guest Checkout
- Email (required, valid format)
- Full Name (required)
- Phone (required)
- Address (required)
- City (required)
- Postal Code (required)

### User Checkout
- Phone (required)
- Address (required)
- City (required)
- Postal Code (required)

### Banner Creation
- Title (required)
- Image URL (required, valid URL)
- Position (required, min 1)
- Link (optional, valid URL if provided)
- Subtitle (optional)

---

## Cost Calculations

```
Guest/User Checkout:

Subtotal = Sum of (item.price × item.quantity)
Tax = Subtotal × 10%
Shipping = Selected method:
  - Standard: Rp 15,000
  - Express: Rp 50,000
  - Same Day: Rp 100,000

Total = Subtotal + Tax + Shipping
```

---

## Database Schema - Banners Table

```sql
CREATE TABLE banners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  image_url VARCHAR(500) NOT NULL,
  link VARCHAR(500),
  position INT DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_position (position),
  INDEX idx_active (is_active)
);
```

---

## Testing Quick Links

### Test Homepage
```
GET http://localhost:3000/
Should display:
- Dynamic banners from /api/home
- Featured products
- Newest products
- Categories
```

### Test Guest Checkout
```
1. Add items to cart
2. Go to /checkout
3. Toggle "Guest Checkout"
4. Fill form with test data
5. Select shipping & payment method
6. Submit → Should POST to /api/orders/guest
```

### Test User Checkout
```
1. Login to user account
2. Add items to cart
3. Go to /checkout
4. Form should auto-fill from profile
5. Select shipping & payment method
6. Submit → Should POST to /api/orders
```

### Test Admin Orders
```
1. Login as admin
2. Go to /admin/orders
3. Should display all orders in table
4. Try filters (status, payment status)
5. Click "Details" on order to expand
6. Update status/payment status via dropdowns
```

### Test Admin Banners
```
1. Login as admin
2. Go to /admin/banners
3. Click "Add Banner"
4. Fill form & submit
5. Should appear in grid
6. Try "Edit" & "Delete"
7. Verify sorting by position
```

---

## Troubleshooting

### Issue: Home page not loading banners
**Fix**: Check if `/api/home` endpoint is working
```bash
curl http://localhost:5000/api/home
```

### Issue: Checkout page shows errors
**Fix**: Check if cart has items
```javascript
console.log(cartItems) // Should be non-empty array
```

### Issue: Admin Orders empty
**Fix**: Check if orders exist in database
```sql
SELECT COUNT(*) FROM orders;
```

### Issue: Admin Banners not showing
**Fix**: Check if banners table created
```sql
SHOW TABLES LIKE 'banners';
```

---

## Performance Tips

### Frontend
- Images optimized (WebP format when possible)
- Lazy loading for product images
- Pagination to reduce initial load (10 items per page)
- Redux for state management

### Backend
- Indexes on frequently queried columns
- Parallel queries with Promise.all()
- JWT caching
- Activity logging

### Database
- Foreign keys for data integrity
- Proper indexes for faster queries
- TIMESTAMP auto-update
- UTF8MB4 character set

---

## Security Checklist

- ✅ JWT authentication on protected routes
- ✅ Admin-only endpoints (middleware protection)
- ✅ SQL injection prevention (parameterized queries)
- ✅ CORS configured
- ✅ Rate limiting on auth endpoints
- ✅ Password hashing
- ✅ Input validation

---

## Environment Setup

### Required ENV Variables
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=marketplace_jeans
DB_PORT=3306

JWT_SECRET=marketplace_jeans_secret_2025
JWT_EXPIRE=7d

REACT_APP_API_URL=http://localhost:5000/api
```

---

## Common Commands

### Run Backend
```bash
cd backend
npm install
npm start
```

### Run Frontend
```bash
cd frontend
npm install
npm start
```

### Run Database Migration
```bash
cd backend
npm run migrate
```

### Run Database Seeder
```bash
cd backend
npm run seed
```

---

## Status Summary

| Component | Status | Location |
|-----------|--------|----------|
| Homepage Integration | ✅ Complete | `src/pages/Home.js` |
| Guest Checkout | ✅ Complete | `src/pages/Checkout.js` |
| User Checkout | ✅ Complete | `src/pages/Checkout.js` |
| Admin Orders | ✅ Complete | `src/pages/admin/Orders.js` |
| Admin Banners | ✅ Complete | `src/pages/admin/Banners.js` |
| Routing | ✅ Complete | `src/App.js`, `src/layouts/AdminLayout.js` |
| DB Schema | ✅ Complete | `backend/src/database/migrate.js` |

---

**Last Updated**: Phase 2 Frontend Complete
**Next**: Backend Testing & Integration
