# Sistem Kupon Diskon

## Fitur Utama

- **Tipe Diskon**: Persentase (%) atau Potongan Tetap (Rp)
- **Validitas**: Tanggal mulai dan berakhir
- **Limit Penggunaan**: Batas total penggunaan dan per user
- **Minimum Order**: Minimal total belanja
- **Tracking**: Pencatatan setiap penggunaan kupon

---

## Database Schema

### Tabel `coupons`

| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| id | INT | Primary key |
| code | VARCHAR(50) | Kode kupon (unique) |
| name | VARCHAR(100) | Nama/deskripsi kupon |
| description | TEXT | Deskripsi detail |
| discount_type | ENUM | 'percentage' atau 'fixed' |
| discount_value | DECIMAL(15,2) | Nilai diskon |
| min_purchase | DECIMAL(15,2) | Minimum pembelian |
| max_discount | DECIMAL(15,2) | Maksimal potongan (untuk %) |
| start_date | DATE | Tanggal mulai berlaku |
| end_date | DATE | Tanggal berakhir |
| usage_limit | INT | Batas total penggunaan (NULL = unlimited) |
| usage_per_user | INT | Batas per user (NULL = unlimited) |
| times_used | INT | Jumlah sudah dipakai |
| is_active | BOOLEAN | Status aktif |
| created_at | TIMESTAMP | Waktu dibuat |
| updated_at | TIMESTAMP | Waktu diupdate |

### Tabel `coupon_usages`

| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| id | INT | Primary key |
| coupon_id | INT | FK ke coupons |
| user_id | INT | FK ke users |
| order_id | INT | FK ke orders |
| discount_amount | DECIMAL(15,2) | Potongan yang diterapkan |
| used_at | TIMESTAMP | Waktu penggunaan |

---

## API Endpoints

### Public Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/coupons/public` | List kupon aktif yang tersedia |
| POST | `/api/coupons/validate` | Validasi kupon sebelum checkout |

### Admin Endpoints (Auth Required)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/coupons` | List semua kupon (dengan filter) |
| GET | `/api/coupons/stats` | Statistik kupon |
| GET | `/api/coupons/:id` | Detail kupon |
| POST | `/api/coupons` | Buat kupon baru |
| PUT | `/api/coupons/:id` | Update kupon |
| DELETE | `/api/coupons/:id` | Hapus kupon |
| POST | `/api/coupons/:id/apply` | Apply kupon ke order |

---

## Cara Menggunakan

### 1. Membuat Kupon Baru (Admin)

```javascript
POST /api/coupons
{
  "code": "NEWYEAR2025",
  "name": "Diskon Tahun Baru",
  "description": "Diskon spesial tahun baru 2025",
  "discount_type": "percentage",
  "discount_value": 15,
  "min_purchase": 100000,
  "max_discount": 50000,
  "start_date": "2025-01-01",
  "end_date": "2025-01-31",
  "usage_limit": 100,
  "usage_per_user": 1,
  "is_active": true
}
```

### 2. Validasi Kupon (User)

```javascript
POST /api/coupons/validate
{
  "code": "NEWYEAR2025",
  "total_amount": 150000,
  "user_id": 123  // opsional untuk guest
}

// Response
{
  "success": true,
  "coupon": {
    "id": 1,
    "code": "NEWYEAR2025",
    "name": "Diskon Tahun Baru",
    "discount_type": "percentage",
    "discount_value": 15,
    "discount_amount": 22500,  // kalkulasi aktual
    "min_purchase": 100000,
    "max_discount": 50000
  }
}
```

### 3. Apply Kupon ke Order (System)

```javascript
POST /api/coupons/:coupon_id/apply
{
  "user_id": 123,
  "order_id": 456,
  "discount_amount": 22500
}
```

---

## Logika Validasi

Kupon dianggap **VALID** jika memenuhi SEMUA kondisi:

1. ✅ Kupon ada di database
2. ✅ `is_active` = true
3. ✅ Tanggal sekarang >= `start_date`
4. ✅ Tanggal sekarang <= `end_date`
5. ✅ `times_used` < `usage_limit` (jika ada limit)
6. ✅ Total belanja >= `min_purchase`
7. ✅ User belum melebihi `usage_per_user` (jika ada limit)

---

## Kalkulasi Diskon

### Tipe Percentage:
```
discount = total_amount * (discount_value / 100)
if (max_discount && discount > max_discount) {
  discount = max_discount
}
```

### Tipe Fixed:
```
discount = discount_value
if (discount > total_amount) {
  discount = total_amount
}
```

---

## Integrasi Frontend

### Checkout Page

```jsx
// State
const [couponCode, setCouponCode] = useState('');
const [appliedCoupon, setAppliedCoupon] = useState(null);

// Validasi
const handleApplyCoupon = async () => {
  const response = await couponAPI.validate({
    code: couponCode,
    total_amount: subtotal,
    user_id: user?.id
  });
  
  if (response.data.success) {
    setAppliedCoupon(response.data.coupon);
  }
};

// Kalkulasi total
const total = subtotal + shippingCost - (appliedCoupon?.discount_amount || 0);
```

---

## Error Codes

| Code | Message | Penyebab |
|------|---------|----------|
| INVALID_COUPON | Kupon tidak ditemukan | Kode salah/tidak ada |
| COUPON_INACTIVE | Kupon tidak aktif | is_active = false |
| COUPON_NOT_STARTED | Kupon belum berlaku | Belum start_date |
| COUPON_EXPIRED | Kupon sudah kadaluarsa | Lewat end_date |
| USAGE_LIMIT_REACHED | Kupon sudah habis digunakan | Melebihi usage_limit |
| MIN_PURCHASE_NOT_MET | Minimum pembelian belum tercapai | < min_purchase |
| USER_LIMIT_REACHED | Anda sudah menggunakan kupon ini | Melebihi usage_per_user |

---

## Contoh Kupon

### Diskon Persentase dengan Cap
```
Code: FLASH20
Type: percentage
Value: 20%
Max Discount: Rp 30.000
Min Purchase: Rp 100.000
```
→ Belanja Rp 200.000 = Diskon Rp 30.000 (cap)
→ Belanja Rp 120.000 = Diskon Rp 24.000

### Diskon Potongan Tetap
```
Code: HEMAT50K
Type: fixed
Value: Rp 50.000
Min Purchase: Rp 200.000
```
→ Belanja Rp 250.000 = Diskon Rp 50.000
→ Belanja Rp 150.000 = Tidak bisa dipakai (< min)

### Kupon Tanpa Limit
```
Code: WELCOME
Type: percentage
Value: 10%
Usage Limit: NULL (unlimited)
Usage Per User: 1
```
→ Setiap user baru bisa pakai 1x saja
