# API Endpoints Documentation - Marketplace Jeans

## Base URL
```
http://localhost:5000/api
```

## Authentication
JWT Bearer token diperlukan untuk endpoint yang dilindungi.
```
Authorization: Bearer <token>
```

---

## 1. Authentication

### Register
```http
POST /auth/register
```
**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "phone": "08123456789"
}
```

### Login
```http
POST /auth/login
```
**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Get Profile
```http
GET /auth/me
Authorization: Bearer <token>
```

---

## 2. Products

### Get All Products
```http
GET /products
```
**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| category | int | Filter by category ID |
| fitting | int | Filter by fitting ID |
| size | int | Filter by size ID |
| min_price | int | Minimum price |
| max_price | int | Maximum price |
| search | string | Search in name/description |
| sort | string | Sort column (created_at, base_price, name) |
| order | string | ASC or DESC |
| page | int | Page number |
| limit | int | Items per page |
| show_all | boolean | Include inactive products (admin) |

### Get Single Product
```http
GET /products/:slug
```

### Create Product (Admin)
```http
POST /products
Authorization: Bearer <admin_token>
```
**Body:**
```json
{
  "name": "Classic Blue Jeans",
  "slug": "classic-blue-jeans",
  "category_id": 1,
  "fitting_id": 1,
  "description": "Premium jeans",
  "base_price": 299000,
  "sku": "CBJ-001"
}
```

### Update Product (Admin)
```http
PUT /products/:id
Authorization: Bearer <admin_token>
```

### Delete Product (Admin)
```http
DELETE /products/:id
Authorization: Bearer <admin_token>
```

### Get Product Variants
```http
GET /products/:productId/variants
```

### Add Product Variant (Admin)
```http
POST /products/:productId/variants
Authorization: Bearer <admin_token>
```
**Body:**
```json
{
  "size_id": 1,
  "sku_variant": "CBJ-001-28",
  "additional_price": 0,
  "stock_quantity": 20
}
```

### Delete Product Variant (Admin)
```http
DELETE /products/variants/:variantId
Authorization: Bearer <admin_token>
```

---

## 3. Categories

### Get All Categories
```http
GET /categories
```

### Create Category (Admin)
```http
POST /categories
Authorization: Bearer <admin_token>
```
**Body:**
```json
{
  "name": "Slim Fit",
  "slug": "slim-fit",
  "description": "Jeans dengan potongan slim"
}
```

### Update Category (Admin)
```http
PUT /categories/:id
Authorization: Bearer <admin_token>
```

### Delete Category (Admin)
```http
DELETE /categories/:id
Authorization: Bearer <admin_token>
```

---

## 4. Fittings

### Get All Fittings
```http
GET /fittings
```

### Create Fitting (Admin)
```http
POST /fittings
Authorization: Bearer <admin_token>
```

### Update Fitting (Admin)
```http
PUT /fittings/:id
Authorization: Bearer <admin_token>
```

### Delete Fitting (Admin)
```http
DELETE /fittings/:id
Authorization: Bearer <admin_token>
```

---

## 5. Sizes

### Get All Sizes
```http
GET /sizes
```

### Create Size (Admin)
```http
POST /sizes
Authorization: Bearer <admin_token>
```

### Update Size (Admin)
```http
PUT /sizes/:id
Authorization: Bearer <admin_token>
```

### Delete Size (Admin)
```http
DELETE /sizes/:id
Authorization: Bearer <admin_token>
```

---

## 6. Cart

### Get Cart
```http
GET /cart
Authorization: Bearer <token> (optional)
```

### Add to Cart
```http
POST /cart/items
```
**Body:**
```json
{
  "product_variant_id": 1,
  "quantity": 2
}
```

### Update Cart Item
```http
PUT /cart/items/:itemId
```

### Remove from Cart
```http
DELETE /cart/items/:itemId
```

### Clear Cart
```http
DELETE /cart
```

---

## 7. Orders

### Create Order
```http
POST /orders
Authorization: Bearer <token> (optional for guest)
```
**Body:**
```json
{
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "08123456789",
  "shipping_address": "Jl. Merdeka No. 1",
  "shipping_city": "Jakarta",
  "shipping_province": "DKI Jakarta",
  "shipping_postal_code": "12345",
  "shipping_method": "JNE Regular",
  "payment_method": "bank_transfer",
  "items": [
    {
      "product_variant_id": 1,
      "quantity": 2
    }
  ],
  "discount_code": "WELCOME10"
}
```

### Get User Orders
```http
GET /orders
Authorization: Bearer <token>
```
**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by status |
| page | int | Page number |
| limit | int | Items per page |

### Get Order Detail
```http
GET /orders/:id
Authorization: Bearer <token> (optional)
```

---

## 8. Admin Orders

### Get All Orders (Admin)
```http
GET /admin/orders
Authorization: Bearer <admin_token>
```
**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | pending, confirmed, processing, shipped, delivered, cancelled |
| payment_status | string | pending, paid, failed, refunded |
| search | string | Search order ID, customer name, email |
| date_from | date | Filter from date |
| date_to | date | Filter to date |
| page | int | Page number |
| limit | int | Items per page |

### Update Order Status (Admin)
```http
PATCH /admin/orders/:id/status
Authorization: Bearer <admin_token>
```
**Body:**
```json
{
  "status": "confirmed",
  "notes": "Order approved"
}
```

### Update Payment Status (Admin)
```http
PATCH /admin/orders/:id/payment-status
Authorization: Bearer <admin_token>
```
**Body:**
```json
{
  "payment_status": "paid"
}
```

### Add Tracking Number (Admin)
```http
PUT /admin/orders/:id/tracking
Authorization: Bearer <admin_token>
```
**Body:**
```json
{
  "tracking_number": "JNE123456789",
  "shipping_notes": "Shipped via JNE"
}
```

### Create Manual Order (Admin)
```http
POST /admin/orders/manual
Authorization: Bearer <admin_token>
```
**Body:**
```json
{
  "customer_name": "Walk-in Customer",
  "customer_phone": "08123456789",
  "shipping_address": "Jl. Store No. 1",
  "payment_method": "cash",
  "items": [
    {
      "product_id": 1,
      "variant_id": 1,
      "quantity": 1,
      "price": 299000
    }
  ],
  "shipping_cost": 0
}
```

---

## 9. Banners

### Get Active Banners
```http
GET /banners
```
**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| position | string | hero, sidebar, footer, popup |

### Get All Banners (Admin)
```http
GET /banners/admin
Authorization: Bearer <admin_token>
```

### Create Banner (Admin)
```http
POST /banners
Authorization: Bearer <admin_token>
```
**Body:**
```json
{
  "title": "New Collection",
  "subtitle": "Koleksi terbaru",
  "image_url": "/images/banners/new.jpg",
  "link_url": "/products?featured=true",
  "position": "hero",
  "sort_order": 1,
  "start_date": "2025-01-01",
  "end_date": "2025-12-31"
}
```

### Update Banner (Admin)
```http
PUT /banners/:id
Authorization: Bearer <admin_token>
```

### Delete Banner (Admin)
```http
DELETE /banners/:id
Authorization: Bearer <admin_token>
```

---

## 10. Home

### Get Home Page Data
```http
GET /home
```
**Response:**
```json
{
  "success": true,
  "data": {
    "banners": [...],
    "featured_products": [...],
    "newest_products": [...],
    "categories": [...]
  }
}
```

---

## 11. Discounts

### Validate Discount Code
```http
POST /discounts/validate
```
**Body:**
```json
{
  "code": "WELCOME10",
  "subtotal": 500000
}
```

---

## 12. Offices (Kantor)

### Get All Offices
```http
GET /offices
```

### Get Single Office
```http
GET /offices/:id
```

### Create Office (Admin)
```http
POST /offices
Authorization: Bearer <admin_token>
```
**Body:**
```json
{
  "name": "Cabang Baru",
  "code": "CBR01",
  "address": "Jl. Contoh No. 123",
  "city": "Jakarta",
  "province": "DKI Jakarta",
  "phone": "021-1234567",
  "email": "cabang@jeans.com",
  "is_headquarters": false
}
```

### Update Office (Admin)
```http
PUT /offices/:id
Authorization: Bearer <admin_token>
```

### Delete Office (Admin)
```http
DELETE /offices/:id
Authorization: Bearer <admin_token>
```

---

## 13. Positions (Jabatan)

### Get All Positions
```http
GET /positions
```

### Get Position Hierarchy
```http
GET /positions/hierarchy
```
**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| officeId | int | Filter by office ID |

### Get Positions by Office
```http
GET /positions/office/:officeId
```

### Get Single Position
```http
GET /positions/:id
```

### Create Position (Admin)
```http
POST /positions
Authorization: Bearer <admin_token>
```
**Body:**
```json
{
  "name": "Manager IT",
  "code": "MGR-IT",
  "office_id": 1,
  "parent_id": 2,
  "level": 3,
  "description": "Mengelola infrastruktur IT"
}
```

### Update Position (Admin)
```http
PUT /positions/:id
Authorization: Bearer <admin_token>
```

### Delete Position (Admin)
```http
DELETE /positions/:id
Authorization: Bearer <admin_token>
```

---

## 14. Size Charts (Panduan Ukuran)

### Get All Size Charts
```http
GET /size-charts
```
**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| category_id | int | Filter by category |
| fitting_id | int | Filter by fitting |

### Get Size Guide (Public)
```http
GET /size-charts/guide
```
**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| categoryId | int | Filter by category |
| fittingId | int | Filter by fitting |

### Get Single Size Chart
```http
GET /size-charts/:id
```

### Get Size Chart by Combination
```http
GET /size-charts/:sizeId/:categoryId/:fittingId
```

### Create Size Chart (Admin)
```http
POST /size-charts
Authorization: Bearer <admin_token>
```
**Body:**
```json
{
  "size_id": 3,
  "category_id": 1,
  "fitting_id": 2,
  "waist_cm": 76.0,
  "hip_cm": 91.5,
  "inseam_cm": 76.0,
  "thigh_cm": 49.0,
  "knee_cm": 35.0,
  "leg_opening_cm": 32.0,
  "front_rise_cm": 25.0,
  "back_rise_cm": 34.0,
  "notes": "Slim fit measurements"
}
```

### Update Size Chart (Admin)
```http
PUT /size-charts/:id
Authorization: Bearer <admin_token>
```

### Delete Size Chart (Admin)
```http
DELETE /size-charts/:id
Authorization: Bearer <admin_token>
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {...},
  "message": "Success message"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (development only)"
}
```

### Pagination Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

---

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Order Status Flow

```
pending → confirmed → processing → shipped → delivered
    ↓
cancelled
```

## Payment Status Flow

```
pending → paid
    ↓
failed / refunded
```
