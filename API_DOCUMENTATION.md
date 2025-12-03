# Marketplace Jeans - API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://yourdomain.com/api
```

## Authentication

Semua protected endpoints memerlukan JWT token di header:
```
Authorization: Bearer <token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Optional message"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message"
}
```

## Endpoints

### 1. Authentication

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "phone": "08123456789",
  "role": "member" // optional: guest (default) or member
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "member",
      "member_discount": 10
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Products

#### Get All Products
```http
GET /products?category=1&fitting=2&size=3&min_price=100000&max_price=500000&search=jeans&page=1&limit=12
```

Query Parameters:
- `category` (optional): Filter by category ID
- `fitting` (optional): Filter by fitting ID
- `size` (optional): Filter by size ID
- `min_price` (optional): Minimum price
- `max_price` (optional): Maximum price
- `search` (optional): Search by name/description
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 12)
- `sort` (optional): Sort field (default: created_at)
- `order` (optional): Sort order ASC/DESC (default: DESC)

#### Get Single Product
```http
GET /products/:slug
```

#### Create Product (Admin)
```http
POST /products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Slim Fit Jeans Blue",
  "slug": "slim-fit-jeans-blue",
  "category_id": 1,
  "fitting_id": 1,
  "description": "Premium slim fit jeans",
  "short_description": "Comfortable and stylish",
  "base_price": 299000,
  "master_cost_price": 150000,
  "sku": "SFJ-BLUE-001",
  "weight": 0.5,
  "is_featured": true,
  "variants": [
    {
      "size_id": 1,
      "sku_variant": "SFJ-BLUE-001-28",
      "additional_price": 0,
      "stock_quantity": 10
    },
    {
      "size_id": 2,
      "sku_variant": "SFJ-BLUE-001-29",
      "additional_price": 0,
      "stock_quantity": 15
    }
  ]
}
```

### 3. Cart

#### Get Cart
```http
GET /cart
x-session-id: <uuid> // For guest users
Authorization: Bearer <token> // For logged in users
```

#### Add to Cart
```http
POST /cart
Content-Type: application/json

{
  "product_variant_id": 1,
  "quantity": 2
}
```

### 4. Orders

#### Create Order (Checkout)
```http
POST /orders
Content-Type: application/json

{
  "items": [
    {
      "product_variant_id": 1,
      "quantity": 2
    }
  ],
  "shipping_address": {
    "recipient_name": "John Doe",
    "phone": "08123456789",
    "address": "Jl. Example No. 123",
    "city": "Jakarta",
    "province": "DKI Jakarta",
    "postal_code": "12345",
    "country": "Indonesia"
  },
  "discount_code": "DISC10", // optional
  "notes": "Please deliver after 5 PM" // optional
}
```

### 5. Payments

#### Create Payment
```http
POST /payments/create
Content-Type: application/json

{
  "order_id": 1,
  "payment_method": "bank_transfer"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "payment_id": 1,
    "transaction_id": "TRX123456",
    "payment_url": "https://app.midtrans.com/snap/v2/...",
    "amount": 319000
  }
}
```

### 6. Inventory (Admin)

#### Add Stock
```http
POST /inventory/add-stock
Authorization: Bearer <token>
Content-Type: application/json

{
  "product_variant_id": 1,
  "quantity": 50,
  "notes": "Restocking from supplier"
}
```

### 7. Reports (Admin)

#### Get Sales Report
```http
GET /reports/sales?start_date=2024-01-01&end_date=2024-12-31
Authorization: Bearer <token>
```

#### Export Sales Report
```http
GET /reports/export/sales?start_date=2024-01-01&end_date=2024-12-31
Authorization: Bearer <token>
```

Returns Excel file download.

## Rate Limiting

- General API: 100 requests per 15 minutes per IP
- Auth endpoints: 5 requests per 15 minutes per IP

## Error Codes

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## Webhooks

### Midtrans Payment Notification
```http
POST /payments/notification
Content-Type: application/json

{
  "order_id": "ORD-20241203-0001",
  "transaction_status": "settlement",
  "fraud_status": "accept",
  "transaction_id": "..."
}
```

This endpoint is called by Midtrans payment gateway.
