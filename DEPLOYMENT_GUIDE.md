# Marketplace Jeans - Deployment Guide

## Pre-Deployment Checklist ✅

### 1. Backend Configuration
- [ ] Update `.env.staging` or `.env.production` with actual values
- [ ] Set proper `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- [ ] Generate strong `JWT_SECRET` and `JWT_REFRESH_SECRET` (min 32 chars)
- [ ] Set `FRONTEND_URL` to your actual frontend domain
- [ ] Configure Midtrans keys (production or sandbox)
- [ ] Configure SMTP settings for email notifications

### 2. Frontend Configuration  
- [ ] Update `.env.staging` or `.env.production` with actual API URL
- [ ] Set `REACT_APP_API_URL` to your backend API endpoint
- [ ] Set `REACT_APP_UPLOADS_URL` to your uploads endpoint
- [ ] Configure Midtrans client key

### 3. Database
- [ ] Run all migrations in `/backend/migrations/`
- [ ] Ensure database user has proper permissions
- [ ] Set up database backups

---

## Deployment Steps

### Backend Deployment (Node.js)

```bash
# 1. Install dependencies
cd backend
npm install --production

# 2. For staging
npm run start:staging

# 3. For production
npm run start:prod
```

### Using PM2 (Recommended for Production)

```bash
# Install PM2 globally
npm install -g pm2

# Start staging
pm2 start server.js --name "marketplace-staging" --env staging

# Start production
pm2 start server.js --name "marketplace-prod" --env production

# Enable auto-restart on system reboot
pm2 startup
pm2 save
```

### Frontend Deployment

```bash
# 1. Install dependencies
cd frontend
npm install

# 2. Build for staging
npm run build:staging

# 3. Build for production
npm run build:prod

# 4. The build folder is ready to be deployed to any static hosting
```

---

## Environment Variables Reference

### Backend (.env.staging / .env.production)

```env
# Server
NODE_ENV=staging|production
PORT=5000
API_URL=https://your-api-domain.com

# Database
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-secure-password
DB_NAME=marketplace_jeans
DB_PORT=3306

# JWT (GENERATE STRONG RANDOM SECRETS!)
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_secret_key_minimum_32_chars
JWT_REFRESH_EXPIRE=30d

# CORS - Frontend URLs (comma-separated for multiple)
FRONTEND_URL=https://your-frontend-domain.com

# Midtrans Payment
MIDTRANS_SERVER_KEY=Mid-server-xxx (production) or SB-Mid-server-xxx (sandbox)
MIDTRANS_CLIENT_KEY=Mid-client-xxx (production) or SB-Mid-client-xxx (sandbox)
MIDTRANS_IS_PRODUCTION=true|false

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASSWORD=your-app-password

# Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### Frontend (.env.staging / .env.production)

```env
REACT_APP_API_URL=https://your-api-domain.com/api
REACT_APP_UPLOADS_URL=https://your-api-domain.com/uploads
REACT_APP_MIDTRANS_CLIENT_KEY=Mid-client-xxx or SB-Mid-client-xxx
REACT_APP_SITE_NAME=Marketplace Jeans
REACT_APP_SITE_URL=https://your-frontend-domain.com
REACT_APP_ENV=staging|production
```

---

## Security Considerations

1. **HTTPS**: Always use HTTPS in production
2. **JWT Secrets**: Use strong, randomly generated secrets
3. **Database**: Use a dedicated database user with minimal permissions
4. **Rate Limiting**: Already configured - 500 req/15min for API, 10 req/15min for auth
5. **CORS**: Configured to allow only specified frontend URLs in production
6. **File Uploads**: Limited to 10MB, images only
7. **Helmet**: Security headers are enabled

---

## API Health Check

After deployment, verify the API is running:

```bash
curl https://your-api-domain.com/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Marketplace Jeans API is running",
  "timestamp": "2026-01-29T..."
}
```

---

## Nginx Configuration (Optional)

```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend (Static)
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/marketplace-jeans/build;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## Troubleshooting

1. **Database connection failed**: Check DB credentials and network/firewall settings
2. **CORS errors**: Verify `FRONTEND_URL` in backend env matches your frontend domain
3. **JWT errors**: Ensure JWT secrets are consistent across server restarts
4. **File upload issues**: Check `uploads` directory exists and has write permissions
5. **Rate limiting**: If blocked, wait 15 minutes or check if IP is trusted

---

## Support

For issues, check the logs:
- Backend: Check console output or PM2 logs (`pm2 logs`)
- Frontend: Check browser console for errors
