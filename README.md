# Marketplace Jeans - E-Commerce Platform

Marketplace Jeans adalah platform e-commerce lengkap untuk penjualan baju jeans dengan sistem manajemen produk, inventory, membership, diskon, payment gateway, dan pelaporan yang komprehensif.

## 🚀 Fitur Utama

### A. Produk & Katalog
- ✅ Struktur produk: Nama Barang → Fitting (Slim, Regular, Loose) → Sizing (28-40, S-XXL)
- ✅ Filter berdasarkan kategori, fitting, ukuran, dan harga
- ✅ Manajemen harga master dan harga jual
- ✅ Katalog responsif modern
- ✅ Upload dan manajemen gambar produk
- ✅ Bulk upload produk (CSV/Excel)
- ✅ SEO friendly (meta title, description, keywords)

### B. Cart & Checkout
- ✅ Add to cart dengan validasi stok
- ✅ Update quantity dan remove items
- ✅ Guest checkout untuk non-member
- ✅ Member checkout dengan auto-discount
- ✅ Multiple shipping addresses

### C. Membership & User Management
- ✅ 4 Role: Admin, Admin Stok, Member, Guest
- ✅ Member mendapat potongan harga otomatis (default 10%)
- ✅ Profile management
- ✅ Order history

### D. Diskon
- ✅ Diskon satu kali (kode voucher)
- ✅ Diskon persentase atau fixed amount
- ✅ Additional discount dengan minimum purchase
- ✅ Diskon member otomatis

### E. Pembayaran
- ✅ Integrasi Payment Gateway (Midtrans)
- ✅ Multiple payment methods
- ✅ Invoice otomatis
- ✅ Status transaksi real-time
- ✅ Payment webhook handler

### F. Pengiriman
- ✅ Admin input resi pengiriman
- ✅ Pembeli cek resi sendiri
- ✅ Estimasi ongkir berdasarkan negara & berat
- ✅ Tracking number management

### G. Stok & Inventory
- ✅ Pencatatan stok masuk/keluar
- ✅ Harga master (HPP)
- ✅ Riwayat perubahan stok
- ✅ Low stock alerts
- ✅ Stock adjustment

### H. Laporan
- ✅ Penjualan per tanggal
- ✅ Penjualan per kategori
- ✅ Ranking produk terlaris
- ✅ Laporan laba (penjualan - HPP)
- ✅ Laporan omzet
- ✅ Export ke Excel/PDF
- ✅ Dashboard statistics

### I. Pengaturan Lain
- ✅ Setting manual untuk konfigurasi sistem
- ✅ SEO friendly (Meta tags, URL structure)
- ✅ Activity logging
- ✅ Security dengan JWT & token
- ✅ Rate limiting
- ✅ Input validation

## 📋 Tech Stack

### Backend
- **Framework**: Node.js + Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Payment**: Midtrans Integration
- **Validation**: Express Validator
- **File Upload**: Multer
- **Export**: ExcelJS, PDFKit
- **Security**: Helmet, CORS, Bcrypt

### Frontend
- **Framework**: React.js 18
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form
- **HTTP Client**: Axios
- **Notifications**: React Toastify
- **SEO**: React Helmet Async
- **Charts**: Chart.js

## 🏗️ Struktur Project

```
marketplace-jeans/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── productController.js
│   │   │   ├── cartController.js
│   │   │   ├── orderController.js
│   │   │   ├── inventoryController.js
│   │   │   ├── reportController.js
│   │   │   ├── paymentController.js
│   │   │   ├── shippingController.js
│   │   │   ├── discountController.js
│   │   │   ├── categoryController.js
│   │   │   ├── userController.js
│   │   │   └── settingController.js
│   │   ├── database/
│   │   │   └── migrate.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── errorHandler.js
│   │   │   ├── rateLimiter.js
│   │   │   ├── upload.js
│   │   │   └── activityLogger.js
│   │   └── routes/
│   │       ├── authRoutes.js
│   │       ├── productRoutes.js
│   │       ├── cartRoutes.js
│   │       ├── orderRoutes.js
│   │       ├── inventoryRoutes.js
│   │       ├── reportRoutes.js
│   │       ├── paymentRoutes.js
│   │       ├── shippingRoutes.js
│   │       ├── discountRoutes.js
│   │       ├── categoryRoutes.js
│   │       ├── userRoutes.js
│   │       └── settingRoutes.js
│   ├── uploads/
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── PrivateRoute.js
    │   │   └── AdminRoute.js
    │   ├── layouts/
    │   │   ├── MainLayout.js
    │   │   └── AdminLayout.js
    │   ├── pages/
    │   │   ├── Home.js
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   ├── Products.js
    │   │   ├── ProductDetail.js
    │   │   ├── Cart.js
    │   │   ├── Checkout.js
    │   │   ├── Profile.js
    │   │   ├── Orders.js
    │   │   ├── OrderDetail.js
    │   │   └── admin/
    │   │       ├── Dashboard.js
    │   │       ├── Products.js
    │   │       ├── Orders.js
    │   │       ├── Inventory.js
    │   │       ├── Reports.js
    │   │       ├── Users.js
    │   │       └── Settings.js
    │   ├── redux/
    │   │   ├── slices/
    │   │   │   ├── authSlice.js
    │   │   │   ├── cartSlice.js
    │   │   │   ├── productSlice.js
    │   │   │   └── orderSlice.js
    │   │   └── store.js
    │   ├── utils/
    │   │   └── api.js
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    ├── .env
    ├── .env.example
    ├── package.json
    ├── tailwind.config.js
    └── postcss.config.js
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v5.7 or higher)
- XAMPP atau MySQL Server

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   copy .env.example .env
   ```
   
   Edit `.env` file dengan konfigurasi Anda:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=marketplace_jeans
   JWT_SECRET=your_secret_key_here
   MIDTRANS_SERVER_KEY=your_midtrans_server_key
   MIDTRANS_CLIENT_KEY=your_midtrans_client_key
   ```

4. **Run database migrations**
   ```bash
   npm run migrate
   ```

5. **Start backend server**
   ```bash
   npm run dev
   ```
   
   Server akan berjalan di `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   copy .env.example .env
   ```

4. **Start frontend development server**
   ```bash
   npm start
   ```
   
   Frontend akan berjalan di `http://localhost:3000`

## 📊 Database Schema

### Tabel Utama:
1. **users** - User accounts dengan role-based access
2. **user_addresses** - Alamat pengiriman user
3. **categories** - Kategori produk (hierarki)
4. **fittings** - Jenis fitting (Slim, Regular, Loose, dll)
5. **sizes** - Ukuran (28-40, S-XXL, dll)
6. **products** - Produk utama
7. **product_variants** - Varian produk (product + size)
8. **product_images** - Gambar produk
9. **discounts** - Kode diskon dan promo
10. **carts** - Shopping cart
11. **cart_items** - Item dalam cart
12. **orders** - Order/pesanan
13. **order_items** - Detail item dalam order
14. **order_shipping** - Info pengiriman order
15. **payments** - Payment transactions
16. **inventory_movements** - Riwayat perubahan stok
17. **activity_logs** - Log aktivitas user
18. **settings** - Pengaturan sistem

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Ganti password

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:slug` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)
- `POST /api/products/bulk-upload` - Bulk upload (Admin)

### Cart
- `GET /api/cart` - Get cart
- `POST /api/cart` - Add to cart
- `PUT /api/cart/:itemId` - Update cart item
- `DELETE /api/cart/:itemId` - Remove from cart
- `DELETE /api/cart` - Clear cart

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order detail
- `PUT /api/orders/:id/status` - Update status (Admin)
- `PUT /api/orders/:id/tracking` - Add tracking (Admin)

### Payments
- `POST /api/payments/create` - Create payment
- `POST /api/payments/notification` - Midtrans webhook
- `GET /api/payments/:id/status` - Check payment status

### Reports (Admin)
- `GET /api/reports/sales` - Sales report
- `GET /api/reports/products` - Product performance
- `GET /api/reports/categories` - Category performance
- `GET /api/reports/export/sales` - Export sales to Excel
- `GET /api/reports/dashboard` - Dashboard statistics

### Inventory (Admin)
- `GET /api/inventory/movements` - Get stock movements
- `POST /api/inventory/add-stock` - Add stock
- `POST /api/inventory/adjust-stock` - Adjust stock
- `GET /api/inventory/stock-levels` - Get stock levels

### Dan masih banyak endpoint lainnya...

## 🎯 Default User Roles

Setelah register, user default adalah `guest`. Admin dapat mengubah role menjadi:
- **admin**: Full access ke semua fitur
- **admin_stok**: Manage products dan inventory
- **member**: Auto-discount 10%
- **guest**: Regular customer

## 🔒 Security Features

- JWT Authentication
- Password hashing (bcrypt)
- Rate limiting
- Input validation
- SQL injection prevention
- XSS protection (Helmet)
- CORS configuration
- Activity logging

## 📈 Performance

- Connection pooling untuk database
- Redis caching (optional)
- Image optimization
- Code splitting (React)
- Lazy loading
- Compression middleware

## 🚀 Production Deployment

### Backend
1. Set `NODE_ENV=production`
2. Configure production database
3. Set secure JWT_SECRET
4. Configure Midtrans production keys
5. Use PM2 for process management
6. Setup NGINX as reverse proxy
7. Enable HTTPS/SSL

### Frontend
1. Run `npm run build`
2. Deploy build folder to web server
3. Configure environment variables
4. Setup CDN (optional)

## 📝 Development Notes

### Alur Pembelian
1. User browse products
2. Add to cart (dengan pilihan size)
3. Checkout (input alamat pengiriman)
4. Pilih metode pembayaran
5. Payment gateway redirect
6. Payment confirmation (webhook)
7. Admin process order
8. Admin input resi
9. User track shipment
10. Order delivered

### Member Discount
- Register sebagai member
- Auto-discount 10% (configurable)
- Diterapkan otomatis saat checkout
- Dapat dikombinasi dengan discount code (optional)

### Bulk Upload Format
CSV/Excel dengan kolom:
- name
- slug
- category_id
- fitting_id
- description
- base_price
- sku
- variants (JSON array)

## 🐛 Troubleshooting

### Database Connection Error
- Pastikan MySQL service berjalan
- Check credentials di `.env`
- Verify database sudah dibuat

### Payment Gateway Error
- Verify Midtrans keys
- Check sandbox/production mode
- Check webhook URL configuration

### Upload Error
- Check folder permissions
- Verify MAX_FILE_SIZE
- Check disk space

## 📞 Support

Untuk pertanyaan dan issue, silakan create issue di repository atau hubungi developer.

## 📄 License

This project is proprietary software.

## 👨‍💻 Developer

Developed with ❤️ for Marketplace Jeans

---

**Note**: Beberapa halaman frontend masih berupa placeholder. Implementasi lengkap dapat dikembangkan sesuai kebutuhan dengan mengikuti pattern yang sudah ada.

## 🎨 UI/UX Notes

Frontend menggunakan Tailwind CSS untuk styling yang konsisten dan modern. Beberapa komponen yang perlu dikembangkan:
- Product card component
- Filter sidebar
- Size selector
- Image gallery
- Loading states
- Error boundaries
- Toast notifications
- Modal dialogs
- Confirmation prompts

## 🔄 State Management

Redux digunakan untuk:
- Authentication state
- Cart state (persisted)
- Product listings
- Order management

Local state untuk:
- Form inputs
- UI toggles
- Temporary data

## 🌐 SEO Optimization

- React Helmet untuk meta tags
- Server-side rendering (optional dengan Next.js)
- Sitemap generation
- Robots.txt
- Open Graph tags
- Structured data (Schema.org)
- Image alt tags
- Clean URLs

## ✅ Testing (Recommended)

Backend:
- Unit tests (Jest)
- Integration tests
- API tests (Postman/Newman)

Frontend:
- Component tests (React Testing Library)
- E2E tests (Cypress)
- Visual regression tests

## 📦 Future Enhancements

- [ ] Wishlist functionality
- [ ] Product reviews & ratings
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Social media integration
- [ ] Loyalty points system
- [ ] Gift cards
- [ ] Pre-orders
- [ ] Flash sales
- [ ] Multi-currency support
- [ ] Multi-language support
- [ ] Advanced analytics
- [ ] Customer support chat
- [ ] Mobile app (React Native)
