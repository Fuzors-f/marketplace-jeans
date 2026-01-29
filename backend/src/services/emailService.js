const nodemailer = require('nodemailer');
const { query } = require('../config/database');

// Cache for email settings to avoid querying DB for every email
let emailSettingsCache = null;
let cacheTimestamp = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get email settings from database
 */
const getEmailSettings = async () => {
  // Return cached settings if still valid
  if (emailSettingsCache && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_TTL)) {
    return emailSettingsCache;
  }

  const settings = await query(`
    SELECT setting_key, setting_value FROM settings 
    WHERE setting_key IN (
      'email_smtp_host', 'email_smtp_port', 'email_smtp_user', 
      'email_smtp_pass', 'email_from_name', 'email_from_address',
      'email_smtp_secure', 'site_name', 'site_logo', 'contact_email'
    )
  `);

  const settingsObj = {};
  settings.forEach(s => {
    settingsObj[s.setting_key] = s.setting_value;
  });

  emailSettingsCache = settingsObj;
  cacheTimestamp = Date.now();

  return settingsObj;
};

/**
 * Clear email settings cache (call when settings are updated)
 */
const clearEmailSettingsCache = () => {
  emailSettingsCache = null;
  cacheTimestamp = null;
};

/**
 * Create email transporter with settings from database
 */
const createTransporter = async () => {
  const settings = await getEmailSettings();
  
  if (!settings.email_smtp_host || !settings.email_smtp_user || !settings.email_smtp_pass) {
    throw new Error('Email SMTP settings not configured');
  }

  const port = parseInt(settings.email_smtp_port) || 587;
  const secure = settings.email_smtp_secure === 'true' || port === 465;

  return nodemailer.createTransport({
    host: settings.email_smtp_host,
    port: port,
    secure: secure,
    auth: {
      user: settings.email_smtp_user,
      pass: settings.email_smtp_pass
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

/**
 * Send email
 */
const sendEmail = async (to, subject, html, text = null) => {
  try {
    const settings = await getEmailSettings();
    const transporter = await createTransporter();

    const fromName = settings.email_from_name || settings.site_name || 'Marketplace Jeans';
    const fromAddress = settings.email_from_address || settings.email_smtp_user;

    const mailOptions = {
      from: `"${fromName}" <${fromAddress}>`,
      to: to,
      subject: subject,
      html: html
    };

    if (text) {
      mailOptions.text = text;
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Generate base email template with logo and branding
 */
const getEmailTemplate = async (content, title = '') => {
  const settings = await getEmailSettings();
  const siteName = settings.site_name || 'Marketplace Jeans';
  const logoUrl = settings.site_logo ? `${process.env.FRONTEND_URL || 'http://localhost:3000'}${settings.site_logo}` : '';
  const contactEmail = settings.contact_email || settings.email_from_address;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || siteName}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background-color: #1e40af; padding: 20px; text-align: center; }
    .header img { max-height: 60px; max-width: 200px; }
    .header h1 { color: #ffffff; margin: 10px 0 0 0; font-size: 24px; }
    .content { padding: 30px; }
    .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    .button { display: inline-block; background-color: #1e40af; color: #ffffff !important; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
    .button:hover { background-color: #1e3a8a; }
    .info-box { background-color: #f0f9ff; border-left: 4px solid #1e40af; padding: 15px; margin: 15px 0; }
    .order-item { border-bottom: 1px solid #eee; padding: 10px 0; }
    .total-row { font-weight: bold; font-size: 16px; border-top: 2px solid #1e40af; padding-top: 10px; margin-top: 10px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px; text-align: left; }
    th { background-color: #f8f9fa; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${logoUrl ? `<img src="${logoUrl}" alt="${siteName}">` : `<h1>${siteName}</h1>`}
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ${siteName}. All rights reserved.</p>
      <p>Email ini dikirim otomatis. Jika ada pertanyaan, hubungi kami di ${contactEmail}</p>
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Send welcome email after registration
 */
const sendWelcomeEmail = async (user) => {
  try {
    const settings = await getEmailSettings();
    const siteName = settings.site_name || 'Marketplace Jeans';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    const content = `
      <h2>Selamat Datang, ${user.full_name}! 🎉</h2>
      <p>Terima kasih telah mendaftar di <strong>${siteName}</strong>.</p>
      <p>Akun Anda telah berhasil dibuat dengan email: <strong>${user.email}</strong></p>
      
      <div class="info-box">
        <h3 style="margin-top: 0;">Informasi Akun:</h3>
        <p><strong>Nama:</strong> ${user.full_name}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Status:</strong> ${user.role === 'member' ? 'Member (Diskon 10%)' : 'Guest'}</p>
      </div>

      <p>Dengan akun Anda, Anda dapat:</p>
      <ul>
        <li>Melihat riwayat pesanan</li>
        <li>Menyimpan alamat pengiriman</li>
        <li>Mendapatkan promo eksklusif</li>
        ${user.role === 'member' ? '<li>Mendapatkan diskon member 10%</li>' : ''}
      </ul>

      <center>
        <a href="${frontendUrl}/products" class="button">Mulai Belanja Sekarang</a>
      </center>

      <p>Jika Anda tidak merasa mendaftar, abaikan email ini.</p>
    `;

    const html = await getEmailTemplate(content, `Selamat Datang di ${siteName}`);
    return await sendEmail(user.email, `Selamat Datang di ${siteName}! 🎉`, html);
  } catch (error) {
    console.error('Send welcome email error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send order confirmation email
 */
const sendOrderConfirmationEmail = async (order, items, shippingAddress) => {
  try {
    const settings = await getEmailSettings();
    const siteName = settings.site_name || 'Marketplace Jeans';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    const email = order.email || order.guest_email;
    if (!email) {
      console.log('No email address for order:', order.order_number);
      return { success: false, error: 'No email address' };
    }

    // Format currency
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
    };

    // Build items HTML
    let itemsHtml = '';
    items.forEach(item => {
      itemsHtml += `
        <tr class="order-item">
          <td style="padding: 10px;">
            <strong>${item.product_name || item.name}</strong><br>
            <small>Ukuran: ${item.size_name || item.size}</small>
          </td>
          <td style="text-align: center;">${item.quantity}</td>
          <td style="text-align: right;">${formatCurrency(item.unit_price || item.price)}</td>
          <td style="text-align: right;">${formatCurrency(item.subtotal || item.total)}</td>
        </tr>
      `;
    });

    const trackingUrl = `${frontendUrl}/order/${order.unique_token}`;

    const content = `
      <h2>Terima Kasih Atas Pesanan Anda! 🛍️</h2>
      <p>Pesanan Anda telah berhasil dibuat. Berikut detail pesanan:</p>

      <div class="info-box">
        <h3 style="margin-top: 0;">Nomor Pesanan: ${order.order_number}</h3>
        <p><strong>Tanggal:</strong> ${new Date(order.created_at || Date.now()).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p><strong>Status:</strong> Menunggu Pembayaran</p>
      </div>

      <h3>Detail Pesanan:</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f8f9fa;">
            <th style="padding: 10px; text-align: left;">Produk</th>
            <th style="padding: 10px; text-align: center;">Qty</th>
            <th style="padding: 10px; text-align: right;">Harga</th>
            <th style="padding: 10px; text-align: right;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <table style="width: 100%; margin-top: 15px;">
        <tr>
          <td style="text-align: right;"><strong>Subtotal:</strong></td>
          <td style="text-align: right; width: 150px;">${formatCurrency(order.subtotal)}</td>
        </tr>
        ${order.discount_amount > 0 ? `
        <tr>
          <td style="text-align: right;"><strong>Diskon:</strong></td>
          <td style="text-align: right; color: #16a34a;">-${formatCurrency(order.discount_amount)}</td>
        </tr>
        ` : ''}
        ${order.member_discount_amount > 0 ? `
        <tr>
          <td style="text-align: right;"><strong>Diskon Member:</strong></td>
          <td style="text-align: right; color: #16a34a;">-${formatCurrency(order.member_discount_amount)}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="text-align: right;"><strong>Ongkos Kirim:</strong></td>
          <td style="text-align: right;">${formatCurrency(order.shipping_cost)}</td>
        </tr>
        <tr class="total-row">
          <td style="text-align: right;"><strong>Total:</strong></td>
          <td style="text-align: right; font-size: 18px; color: #1e40af;"><strong>${formatCurrency(order.total_amount)}</strong></td>
        </tr>
      </table>

      <h3>Alamat Pengiriman:</h3>
      <div class="info-box">
        <p style="margin: 5px 0;"><strong>${shippingAddress.recipient_name || order.customer_name}</strong></p>
        <p style="margin: 5px 0;">${shippingAddress.phone}</p>
        <p style="margin: 5px 0;">${shippingAddress.address}</p>
        <p style="margin: 5px 0;">${shippingAddress.city}, ${shippingAddress.province} ${shippingAddress.postal_code || ''}</p>
      </div>

      <center>
        <a href="${trackingUrl}" class="button">Lacak Pesanan Anda</a>
      </center>

      <p><strong>Langkah selanjutnya:</strong></p>
      <ol>
        <li>Lakukan pembayaran sesuai metode yang dipilih</li>
        <li>Konfirmasi pembayaran Anda (jika transfer manual)</li>
        <li>Kami akan memproses pesanan Anda setelah pembayaran dikonfirmasi</li>
      </ol>

      <p>Jika ada pertanyaan, silakan hubungi customer service kami.</p>
    `;

    const html = await getEmailTemplate(content, `Konfirmasi Pesanan ${order.order_number}`);
    return await sendEmail(email, `Konfirmasi Pesanan #${order.order_number} - ${siteName}`, html);
  } catch (error) {
    console.error('Send order confirmation email error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send order status update email
 */
const sendOrderStatusEmail = async (order, newStatus, statusMessage = '') => {
  try {
    const settings = await getEmailSettings();
    const siteName = settings.site_name || 'Marketplace Jeans';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    const email = order.email || order.guest_email;
    if (!email) {
      return { success: false, error: 'No email address' };
    }

    const statusLabels = {
      'pending': 'Menunggu Pembayaran',
      'confirmed': 'Dikonfirmasi',
      'processing': 'Sedang Diproses',
      'shipped': 'Dalam Pengiriman',
      'delivered': 'Terkirim',
      'completed': 'Selesai',
      'cancelled': 'Dibatalkan'
    };

    const statusColors = {
      'pending': '#f59e0b',
      'confirmed': '#3b82f6',
      'processing': '#8b5cf6',
      'shipped': '#10b981',
      'delivered': '#059669',
      'completed': '#22c55e',
      'cancelled': '#ef4444'
    };

    const statusLabel = statusLabels[newStatus] || newStatus;
    const statusColor = statusColors[newStatus] || '#6b7280';
    const trackingUrl = `${frontendUrl}/order/${order.unique_token}`;

    const content = `
      <h2>Update Status Pesanan 📦</h2>
      <p>Status pesanan Anda telah diperbarui.</p>

      <div class="info-box">
        <h3 style="margin-top: 0;">Nomor Pesanan: ${order.order_number}</h3>
        <p style="margin: 10px 0;">
          <strong>Status Baru:</strong> 
          <span style="background-color: ${statusColor}; color: white; padding: 5px 15px; border-radius: 20px; font-weight: bold;">
            ${statusLabel}
          </span>
        </p>
        ${statusMessage ? `<p><strong>Keterangan:</strong> ${statusMessage}</p>` : ''}
        ${order.tracking_number ? `<p><strong>Nomor Resi:</strong> ${order.tracking_number}</p>` : ''}
      </div>

      <center>
        <a href="${trackingUrl}" class="button">Lihat Detail Pesanan</a>
      </center>

      ${newStatus === 'shipped' ? `
      <p><strong>Pesanan Anda sedang dalam perjalanan!</strong></p>
      <p>Anda dapat melacak pengiriman menggunakan nomor resi di atas.</p>
      ` : ''}

      ${newStatus === 'delivered' ? `
      <p><strong>Pesanan Anda telah tiba!</strong></p>
      <p>Terima kasih telah berbelanja di ${siteName}. Jangan lupa untuk memberikan ulasan ya!</p>
      ` : ''}

      ${newStatus === 'cancelled' ? `
      <p>Pesanan Anda telah dibatalkan. Jika ada pertanyaan, silakan hubungi customer service kami.</p>
      ` : ''}
    `;

    const html = await getEmailTemplate(content, `Update Pesanan ${order.order_number}`);
    return await sendEmail(email, `[${statusLabel}] Pesanan #${order.order_number} - ${siteName}`, html);
  } catch (error) {
    console.error('Send order status email error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send payment confirmation email
 */
const sendPaymentConfirmationEmail = async (order, payment) => {
  try {
    const settings = await getEmailSettings();
    const siteName = settings.site_name || 'Marketplace Jeans';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    const email = order.email || order.guest_email;
    if (!email) {
      return { success: false, error: 'No email address' };
    }

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
    };

    const trackingUrl = `${frontendUrl}/order/${order.unique_token}`;

    const content = `
      <h2>Pembayaran Berhasil! ✅</h2>
      <p>Pembayaran untuk pesanan Anda telah berhasil dikonfirmasi.</p>

      <div class="info-box">
        <h3 style="margin-top: 0;">Detail Pembayaran</h3>
        <p><strong>Nomor Pesanan:</strong> ${order.order_number}</p>
        <p><strong>Metode Pembayaran:</strong> ${payment.payment_method}</p>
        <p><strong>Jumlah:</strong> ${formatCurrency(payment.amount || order.total_amount)}</p>
        <p><strong>Status:</strong> <span style="color: #22c55e; font-weight: bold;">LUNAS</span></p>
        <p><strong>Tanggal Bayar:</strong> ${new Date(payment.paid_at || Date.now()).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
      </div>

      <p>Pesanan Anda akan segera diproses oleh tim kami.</p>

      <center>
        <a href="${trackingUrl}" class="button">Lacak Pesanan</a>
      </center>

      <p>Terima kasih telah berbelanja di ${siteName}!</p>
    `;

    const html = await getEmailTemplate(content, `Pembayaran Berhasil - ${order.order_number}`);
    return await sendEmail(email, `Pembayaran Berhasil - Pesanan #${order.order_number}`, html);
  } catch (error) {
    console.error('Send payment confirmation email error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Test email configuration
 */
const testEmailConfig = async (testEmail) => {
  try {
    const settings = await getEmailSettings();
    const siteName = settings.site_name || 'Marketplace Jeans';

    const content = `
      <h2>Test Email Berhasil! ✅</h2>
      <p>Konfigurasi email SMTP Anda sudah benar.</p>
      
      <div class="info-box">
        <h3 style="margin-top: 0;">Konfigurasi SMTP:</h3>
        <p><strong>Host:</strong> ${settings.email_smtp_host}</p>
        <p><strong>Port:</strong> ${settings.email_smtp_port}</p>
        <p><strong>User:</strong> ${settings.email_smtp_user}</p>
        <p><strong>From Name:</strong> ${settings.email_from_name || siteName}</p>
        <p><strong>From Address:</strong> ${settings.email_from_address || settings.email_smtp_user}</p>
      </div>

      <p>Email ini dikirim pada: ${new Date().toLocaleString('id-ID')}</p>
    `;

    const html = await getEmailTemplate(content, 'Test Email Configuration');
    return await sendEmail(testEmail, `Test Email - ${siteName}`, html);
  } catch (error) {
    console.error('Test email config error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusEmail,
  sendPaymentConfirmationEmail,
  testEmailConfig,
  clearEmailSettingsCache,
  getEmailSettings
};
