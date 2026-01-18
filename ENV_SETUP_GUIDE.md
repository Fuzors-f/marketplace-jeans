# Environment Setup Guide

## Struktur File Environment

### Backend (`/backend`)
```
.env                    # File aktif (copy dari environment yang sesuai)
.env.development        # Untuk development lokal
.env.staging            # Untuk server staging
.env.production         # Untuk server production
.env.example            # Template referensi
```

### Frontend (`/frontend`)
```
.env                    # File aktif (untuk local development)
.env.development        # Untuk development lokal
.env.staging            # Untuk build staging
.env.production         # Untuk build production
.env.example            # Template referensi
```

---

## Cara Menggunakan

### 1. Development Lokal

**Backend:**
```bash
cd backend
npm run dev
# atau
npm run start:dev
```
Akan otomatis menggunakan `.env.development` jika ada, fallback ke `.env`

**Frontend:**
```bash
cd frontend
npm start
```
Menggunakan `.env.development` atau `.env` secara default

---

### 2. Build untuk Staging

**Backend:**
```bash
cd backend
# Pastikan .env.staging sudah dikonfigurasi
npm run start:staging
```

**Frontend:**
```bash
cd frontend
npm run build:staging
```
Hasil build di folder `/frontend/build`

---

### 3. Build untuk Production

**Backend:**
```bash
cd backend
# Pastikan .env.production sudah dikonfigurasi
npm run start:prod
```

**Frontend:**
```bash
cd frontend
npm run build:prod
```
Hasil build di folder `/frontend/build`

---

## Konfigurasi Environment Variables

### Backend

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| `NODE_ENV` | development | staging | production |
| `PORT` | 5000 | 5000 | 5000 |
| `DB_HOST` | localhost | staging-db-host | production-db-host |
| `DB_NAME` | marketplace_jeans | marketplace_jeans_staging | marketplace_jeans |
| `FRONTEND_URL` | http://localhost:3000 | https://staging.domain.com | https://domain.com |
| `MIDTRANS_IS_PRODUCTION` | false | false | true |

### Frontend

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| `REACT_APP_API_URL` | http://localhost:5000/api | https://staging-api.domain.com/api | https://api.domain.com/api |
| `REACT_APP_UPLOADS_URL` | http://localhost:5000/uploads | https://staging-api.domain.com/uploads | https://api.domain.com/uploads |
| `REACT_APP_ENV` | development | staging | production |

---

## Switch Environment Cepat

### Untuk switch ke Local Development:
```bash
# Backend - sudah otomatis menggunakan .env atau .env.development
cd backend && npm run dev

# Frontend - sudah otomatis menggunakan .env.development
cd frontend && npm start
```

### Untuk Deploy ke Staging:
```bash
# Frontend
cd frontend && npm run build:staging
# Upload folder /build ke server staging

# Backend
# Update .env di server dengan isi .env.staging
# Restart service: pm2 restart backend
```

### Untuk Deploy ke Production:
```bash
# Frontend
cd frontend && npm run build:prod
# Upload folder /build ke server production

# Backend
# Update .env di server dengan isi .env.production
# Restart service: pm2 restart backend
```

---

## Tips Keamanan

1. **JANGAN** commit file `.env` yang berisi credentials production
2. Gunakan `.env.example` sebagai template
3. Simpan credentials production di environment variable server atau secrets manager
4. Generate JWT_SECRET yang kuat (minimal 32 karakter random)
5. Gunakan HTTPS untuk production

---

## Troubleshooting

### Frontend tidak bisa connect ke backend
- Pastikan `REACT_APP_API_URL` sudah benar
- Cek CORS setting di backend
- Pastikan backend sudah running

### Environment variable tidak terbaca
- Restart server setelah ubah .env
- Pastikan format variable benar (REACT_APP_ prefix untuk frontend)
- Clear cache browser untuk frontend

### Build gagal
- Install dependencies: `npm install`
- Hapus node_modules dan reinstall
- Pastikan Node.js version sesuai (>= 16)
