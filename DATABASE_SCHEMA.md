# Database Schema - Marketplace Jeans

## Entity Relationship Diagram (ERD)

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     users       │       │   categories    │       │    fittings     │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │
│ email           │       │ name            │       │ name            │
│ password        │       │ slug            │       │ slug            │
│ full_name       │       │ description     │       │ description     │
│ phone           │       │ parent_id (FK)  │       │ is_active       │
│ role            │       │ image_url       │       └─────────────────┘
│ is_active       │       │ is_active       │               │
│ member_discount │       │ sort_order      │               │
└─────────────────┘       └─────────────────┘               │
        │                         │                         │
        │                         │                         │
        ▼                         ▼                         ▼
┌─────────────────┐       ┌─────────────────────────────────────────┐
│  user_addresses │       │              products                   │
├─────────────────┤       ├─────────────────────────────────────────┤
│ id (PK)         │       │ id (PK)                                 │
│ user_id (FK)    │       │ name                                    │
│ label           │       │ slug                                    │
│ recipient_name  │       │ category_id (FK) ──────────────────────►│
│ phone           │       │ fitting_id (FK) ───────────────────────►│
│ address         │       │ description                             │
│ city            │       │ base_price                              │
│ province        │       │ master_cost_price                       │
│ postal_code     │       │ sku                                     │
│ is_default      │       │ is_active                               │
└─────────────────┘       │ is_featured                             │
                          └─────────────────────────────────────────┘
                                          │
        ┌─────────────────────────────────┼─────────────────────────────────┐
        │                                 │                                 │
        ▼                                 ▼                                 ▼
┌─────────────────┐       ┌─────────────────────────┐       ┌─────────────────┐
│ product_images  │       │   product_variants      │       │     sizes       │
├─────────────────┤       ├─────────────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)                 │       │ id (PK)         │
│ product_id (FK) │       │ product_id (FK)         │◄──────│ name            │
│ image_url       │       │ size_id (FK) ───────────│       │ sort_order      │
│ is_primary      │       │ sku_variant             │       │ is_active       │
│ sort_order      │       │ additional_price        │       └─────────────────┘
│ alt_text        │       │ stock_quantity          │
└─────────────────┘       │ is_active               │
                          └─────────────────────────┘
                                     │
                                     │
        ┌────────────────────────────┼────────────────────────────┐
        │                            │                            │
        ▼                            ▼                            ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────────────┐
│    cart_items   │       │  order_items    │       │  inventory_movements    │
├─────────────────┤       ├─────────────────┤       ├─────────────────────────┤
│ id (PK)         │       │ id (PK)         │       │ id (PK)                 │
│ cart_id (FK)    │       │ order_id (FK)   │       │ product_variant_id (FK) │
│ product_variant │       │ product_id      │       │ type (in/out/adjustment)│
│ quantity        │       │ size_id         │       │ quantity                │
│ price           │       │ quantity        │       │ reference_type          │
└─────────────────┘       │ price           │       │ reference_id            │
        │                 │ total           │       │ notes                   │
        │                 └─────────────────┘       │ created_by (FK)         │
        ▼                         │                 └─────────────────────────┘
┌─────────────────┐               │
│     carts       │               │
├─────────────────┤               ▼
│ id (PK)         │       ┌─────────────────────────────────────────────────┐
│ user_id (FK)    │       │                   orders                        │
│ session_id      │       ├─────────────────────────────────────────────────┤
└─────────────────┘       │ id (PK)                                         │
                          │ user_id (FK) ◄──────────────────────────────────│
                          │ status (pending/confirmed/shipped/delivered)    │
                          │ payment_status (pending/paid/failed/refunded)   │
                          │ payment_method                                  │
                          │ subtotal, shipping_cost, tax, total             │
                          │ customer_name, customer_email, customer_phone   │
                          │ shipping_address, shipping_city, shipping_province│
                          │ tracking_number                                 │
                          │ notes                                           │
                          └─────────────────────────────────────────────────┘
                                          │
                                          ▼
                          ┌─────────────────────────┐
                          │       payments          │
                          ├─────────────────────────┤
                          │ id (PK)                 │
                          │ order_id (FK)           │
                          │ payment_method          │
                          │ transaction_id          │
                          │ amount                  │
                          │ status                  │
                          │ paid_at                 │
                          └─────────────────────────┘

┌─────────────────────────┐       ┌─────────────────────────┐
│       banners           │       │       discounts         │
├─────────────────────────┤       ├─────────────────────────┤
│ id (PK)                 │       │ id (PK)                 │
│ title                   │       │ code                    │
│ subtitle                │       │ type (percentage/fixed) │
│ image_url               │       │ value                   │
│ link_url                │       │ min_purchase            │
│ position (hero/sidebar) │       │ max_discount            │
│ is_active               │       │ start_date              │
│ start_date              │       │ end_date                │
│ end_date                │       │ usage_limit             │
│ sort_order              │       │ usage_count             │
└─────────────────────────┘       │ is_active               │
                                  └─────────────────────────┘

┌─────────────────────────┐       ┌─────────────────────────┐
│     activity_logs       │       │       settings          │
├─────────────────────────┤       ├─────────────────────────┤
│ id (PK)                 │       │ id (PK)                 │
│ user_id (FK)            │       │ setting_key             │
│ action                  │       │ setting_value           │
│ entity_type             │       │ setting_type            │
│ entity_id               │       │ description             │
│ description             │       │ is_public               │
│ ip_address              │       └─────────────────────────┘
│ user_agent              │
│ created_at              │
└─────────────────────────┘

┌─────────────────────────┐       ┌─────────────────────────┐
│       offices           │       │       positions         │
├─────────────────────────┤       ├─────────────────────────┤
│ id (PK)                 │       │ id (PK)                 │
│ name                    │       │ name                    │
│ code                    │       │ code                    │
│ address                 │◄──────│ office_id (FK)          │
│ city                    │       │ parent_id (FK, self)    │
│ province                │       │ level                   │
│ phone                   │       │ description             │
│ email                   │       │ is_active               │
│ is_headquarters         │       └─────────────────────────┘
│ is_active               │
└─────────────────────────┘

┌───────────────────────────────────────────┐
│               size_charts                  │
├───────────────────────────────────────────┤
│ id (PK)                                   │
│ size_id (FK) ────────────────────────────►│
│ category_id (FK) ────────────────────────►│
│ fitting_id (FK) ─────────────────────────►│
│ waist_cm, hip_cm, inseam_cm               │
│ thigh_cm, knee_cm, leg_opening_cm         │
│ front_rise_cm, back_rise_cm               │
│ notes                                     │
│ is_active                                 │
└───────────────────────────────────────────┘
```

## Tables Summary

| No | Table | Description |
|----|-------|-------------|
| 1 | users | Data pengguna (admin, member, guest) |
| 2 | user_addresses | Alamat pengiriman user |
| 3 | categories | Kategori produk jeans |
| 4 | fittings | Jenis fitting (slim, regular, loose) |
| 5 | sizes | Ukuran (28-44, S-XXL) |
| 6 | products | Master data produk |
| 7 | product_variants | Varian produk (product + size) |
| 8 | product_images | Gambar produk |
| 9 | discounts | Kode diskon |
| 10 | carts | Keranjang belanja |
| 11 | cart_items | Item dalam keranjang |
| 12 | orders | Pesanan |
| 13 | order_items | Item dalam pesanan |
| 14 | order_shipping | Info pengiriman pesanan |
| 15 | payments | Data pembayaran |
| 16 | inventory_movements | Riwayat stok |
| 17 | activity_logs | Log aktivitas |
| 18 | banners | Banner homepage |
| 19 | settings | Pengaturan sistem |
| 20 | offices | Data kantor/cabang |
| 21 | positions | Jabatan karyawan |
| 22 | size_charts | Panduan ukuran detail |

## Indexes

Semua tabel dilengkapi dengan index pada:
- Primary key (id)
- Foreign keys
- Kolom yang sering diquery (slug, email, status, created_at)
- Full-text search pada products (name, description)

## Relasi

1. **users ↔ orders**: One to Many
2. **users ↔ user_addresses**: One to Many
3. **users ↔ carts**: One to Many
4. **products ↔ categories**: Many to One
5. **products ↔ fittings**: Many to One
6. **products ↔ product_variants**: One to Many
7. **products ↔ product_images**: One to Many
8. **product_variants ↔ sizes**: Many to One
9. **orders ↔ order_items**: One to Many
10. **orders ↔ payments**: One to Many
11. **carts ↔ cart_items**: One to Many
12. **offices ↔ positions**: One to Many
13. **positions ↔ positions** (parent_id): Self-referencing
14. **size_charts ↔ sizes**: Many to One
15. **size_charts ↔ categories**: Many to One
16. **size_charts ↔ fittings**: Many to One
