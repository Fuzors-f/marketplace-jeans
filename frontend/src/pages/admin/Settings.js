import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, Globe, Mail, CreditCard, Share2, Building, 
  Save, RefreshCw, Upload, Image, Shield, BarChart3,
  Facebook, Instagram, Twitter, Youtube, CheckCircle, AlertCircle
} from 'lucide-react';
import { settingsAPI } from '../../services/api';
import { useSettings } from '../../utils/SettingsContext';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://be-hojdenim.yyyy-zzzzz-online.com';

// Setting Groups Configuration
const settingGroups = [
  { id: 'site', label: 'Pengaturan Situs', icon: Globe },
  { id: 'contact', label: 'Kontak & Alamat', icon: Building },
  { id: 'email', label: 'Email SMTP', icon: Mail },
  { id: 'payment', label: 'Payment Gateway', icon: CreditCard },
  { id: 'social', label: 'Media Sosial', icon: Share2 },
  { id: 'legal', label: 'EULA & Cookie', icon: Shield },
  { id: 'report', label: 'Pengaturan Laporan', icon: BarChart3 },
  { id: 'security', label: 'Keamanan', icon: Shield },
  { id: 'upload', label: 'Upload & Media', icon: Upload },
  { id: 'system', label: 'Sistem & Maintenance', icon: Settings },
];

export default function AdminSettings() {
  const { refreshSettings: refreshGlobalSettings } = useSettings();
  const [activeGroup, setActiveGroup] = useState('site');
  const [settings, setSettings] = useState({});
  const [imagePreviews, setImagePreviews] = useState({}); // For local preview before save
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [initializing, setInitializing] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [cleaningImages, setCleaningImages] = useState(false);
  const [cleanupResult, setCleanupResult] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [resetting, setResetting] = useState(false);
  
  // Dynamic refs for image inputs
  const imageInputRefs = useRef({});
  
  const getImageInputRef = (key) => {
    if (!imageInputRefs.current[key]) {
      imageInputRefs.current[key] = React.createRef();
    }
    return imageInputRefs.current[key];
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsAPI.getAll();
      if (response.data.success) {
        setSettings(response.data.data.settings.reduce((acc, s) => {
          acc[s.setting_key] = s.setting_value || '';
          return acc;
        }, {}));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage({ type: 'error', text: 'Gagal memuat pengaturan' });
    } finally {
      setLoading(false);
    }
  };

  const handleInitSettings = async () => {
    try {
      setInitializing(true);
      const response = await settingsAPI.init();
      if (response.data.success) {
        setMessage({ type: 'success', text: response.data.message });
        fetchSettings();
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Gagal menginisialisasi pengaturan' 
      });
    } finally {
      setInitializing(false);
    }
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });
      
      const response = await settingsAPI.bulkUpdate(settings);
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Pengaturan berhasil disimpan' });
        // Refresh global settings context
        refreshGlobalSettings();
        // Clear local previews since settings are saved
        setImagePreviews({});
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Gagal menyimpan pengaturan' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (file, settingKey) => {
    try {
      setMessage({ type: '', text: '' });
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/x-icon', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        setMessage({ type: 'error', text: 'Format file tidak didukung. Gunakan JPEG, PNG, GIF, ICO, atau SVG.' });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Ukuran file terlalu besar. Maksimal 5MB.' });
        return;
      }

      // Create local preview first
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => ({ ...prev, [settingKey]: reader.result }));
      };
      reader.readAsDataURL(file);

      const formData = new FormData();
      formData.append('image', file);
      
      // Use the new endpoint that directly updates the setting
      const response = await settingsAPI.uploadImageForKey(settingKey, formData);
      if (response.data.success) {
        handleChange(settingKey, response.data.data.url);
        setMessage({ type: 'success', text: 'Gambar berhasil diunggah dan disimpan.' });
        // Refresh global settings
        refreshGlobalSettings();
        // Clear local preview since it's now saved
        setImagePreviews(prev => {
          const newPreviews = { ...prev };
          delete newPreviews[settingKey];
          return newPreviews;
        });
      }
    } catch (error) {
      // Clear preview on error
      setImagePreviews(prev => {
        const newPreviews = { ...prev };
        delete newPreviews[settingKey];
        return newPreviews;
      });
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Gagal mengunggah gambar' 
      });
    }
  };

  const renderSettingInput = (key, label, type = 'text', placeholder = '', helpText = '') => {
    const value = settings[key] || '';
    
    if (type === 'boolean') {
      return (
        <div className="flex items-center justify-between py-3 border-b last:border-b-0">
          <div>
            <label className="font-medium text-gray-700">{label}</label>
            {helpText && <p className="text-sm text-gray-500">{helpText}</p>}
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={value === 'true'}
              onChange={(e) => handleChange(key, e.target.checked ? 'true' : 'false')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      );
    }

    if (type === 'textarea') {
      return (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
          <textarea
            value={value}
            onChange={(e) => handleChange(key, e.target.value)}
            placeholder={placeholder}
            rows={3}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {helpText && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
        </div>
      );
    }

    if (type === 'password') {
      return (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
          <input
            type="password"
            value={value}
            onChange={(e) => handleChange(key, e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {helpText && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
        </div>
      );
    }

    if (type === 'image') {
      const inputRef = getImageInputRef(key);
      // Check for local preview first, then saved value
      const previewUrl = imagePreviews[key];
      const savedUrl = value ? `${API_BASE_URL}${value}` : null;
      const displayUrl = previewUrl || savedUrl;
      
      return (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 border rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden">
              {displayUrl ? (
                <img 
                  src={displayUrl} 
                  alt={label} 
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`flex items-center justify-center ${displayUrl ? 'hidden' : ''}`} style={{ display: displayUrl ? 'none' : 'flex' }}>
                <Image size={32} className="text-gray-300" />
              </div>
            </div>
            <div>
              <input
                type="hidden"
                value={value}
                onChange={(e) => handleChange(key, e.target.value)}
              />
              <button
                type="button"
                onClick={() => {
                  const ref = inputRef.current || inputRef;
                  if (ref && ref.click) ref.click();
                }}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
              >
                <Upload size={16} />
                Pilih Gambar
              </button>
              <input
                ref={(el) => {
                  if (typeof inputRef === 'object' && inputRef !== null) {
                    inputRef.current = el;
                  }
                }}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file, key);
                  // Reset input value to allow re-uploading same file
                  e.target.value = '';
                }}
              />
              {helpText && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
              {previewUrl && <p className="text-xs text-orange-500 mt-1">Preview - belum disimpan</p>}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
          type={type}
          value={value}
          onChange={(e) => handleChange(key, e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {helpText && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
      </div>
    );
  };

  const renderSiteSettings = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Globe size={20} />
        Pengaturan Situs
      </h3>
      {renderSettingInput('site_name', 'Nama Situs', 'text', 'Marketplace Jeans')}
      {renderSettingInput('site_description', 'Deskripsi Situs', 'textarea', 'Deskripsi singkat tentang toko Anda')}
      {renderSettingInput('site_logo', 'Logo Situs', 'image', '', 'Format: PNG, JPG. Rekomendasi: 200x60px')}
      {renderSettingInput('site_favicon', 'Favicon', 'image', '', 'Format: ICO, PNG. Ukuran: 32x32px atau 16x16px')}
    </div>
  );

  const renderContactSettings = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Building size={20} />
        Kontak & Alamat
      </h3>
      {renderSettingInput('contact_address', 'Alamat Perusahaan', 'textarea', 'Jl. Contoh No. 123, Kota, Provinsi')}
      {renderSettingInput('contact_phone', 'Nomor Telepon', 'text', '+62 21 1234567')}
      {renderSettingInput('contact_whatsapp', 'WhatsApp', 'text', '628123456789', 'Tanpa tanda + atau spasi')}
      {renderSettingInput('contact_email', 'Email Kontak', 'email', 'info@example.com')}
    </div>
  );

  const renderEmailSettings = () => {
    const handleTestEmail = async () => {
      if (!testEmailAddress) {
        setMessage({ type: 'error', text: 'Masukkan email untuk test' });
        return;
      }
      
      try {
        setTestingEmail(true);
        setMessage({ type: '', text: '' });
        
        // First save current settings
        await settingsAPI.bulkUpdate(settings);
        
        // Then test email
        const response = await settingsAPI.testEmail(testEmailAddress);
        if (response.data.success) {
          setMessage({ type: 'success', text: 'Test email berhasil dikirim! Cek inbox email Anda.' });
        }
      } catch (error) {
        setMessage({ 
          type: 'error', 
          text: error.response?.data?.message || 'Gagal mengirim test email. Periksa konfigurasi SMTP.' 
        });
      } finally {
        setTestingEmail(false);
      }
    };

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Mail size={20} />
          Pengaturan Email (SMTP)
        </h3>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-yellow-700">
            Konfigurasi SMTP diperlukan untuk mengirim email notifikasi pesanan, 
            reset password, dan lainnya.
          </p>
        </div>
        
        {/* SMTP Configuration */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium mb-3">Konfigurasi SMTP Server</h4>
          {renderSettingInput('email_smtp_host', 'SMTP Host', 'text', 'smtp.gmail.com')}
          {renderSettingInput('email_smtp_port', 'SMTP Port', 'text', '587')}
          {renderSettingInput('email_smtp_secure', 'Gunakan SSL/TLS', 'boolean', '', 'Aktifkan untuk port 465')}
          {renderSettingInput('email_smtp_user', 'SMTP Username', 'text', 'email@gmail.com')}
          {renderSettingInput('email_smtp_pass', 'SMTP Password', 'password', '••••••••', 'Gunakan App Password untuk Gmail')}
        </div>

        {/* Sender Configuration */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium mb-3">Pengaturan Pengirim</h4>
          {renderSettingInput('email_from_name', 'Nama Pengirim', 'text', 'Marketplace Jeans')}
          {renderSettingInput('email_from_address', 'Email Pengirim', 'email', 'noreply@example.com')}
        </div>

        {/* Notification Settings */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium mb-3">Pengaturan Notifikasi</h4>
          {renderSettingInput('email_admin_address', 'Email Admin', 'email', 'admin@example.com', 'Email untuk menerima notifikasi pesanan baru')}
          {renderSettingInput('email_notify_admin_order', 'Notifikasi Admin (Pesanan Baru)', 'boolean', '', 'Kirim email ke admin saat ada pesanan baru')}
          {renderSettingInput('email_notify_user_order', 'Notifikasi Customer (Checkout)', 'boolean', '', 'Kirim email konfirmasi ke customer saat checkout')}
        </div>
        
        {/* Test Email Section */}
        <div className="mt-6 pt-6 border-t">
          <h4 className="font-medium mb-3">Test Konfigurasi Email</h4>
          <div className="flex gap-2">
            <input
              type="email"
              value={testEmailAddress}
              onChange={(e) => setTestEmailAddress(e.target.value)}
              placeholder="Masukkan email untuk test"
              className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleTestEmail}
              disabled={testingEmail}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
            >
              <Mail size={18} />
              {testingEmail ? 'Mengirim...' : 'Test Email'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Pastikan simpan pengaturan terlebih dahulu sebelum melakukan test email.
          </p>
        </div>
      </div>
    );
  };

  const renderPaymentSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <CreditCard size={20} />
        Payment Gateway
      </h3>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-yellow-701">
          Kelola metode pembayaran yang tersedia untuk pelanggan. Aktifkan atau nonaktifkan metode sesuai kebutuhan.
        </p>
      </div>

      {/* Payment Methods Overview */}
      <div className="bg-white border rounded-lg p-4">
        <h4 className="font-medium mb-3">Metode Pembayaran Aktif</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className={`p-3 rounded-lg border-2 ${settings['payment_bank_transfer_enabled'] === 'true' ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center gap-2">
              <Building size={18} className={settings['payment_bank_transfer_enabled'] === 'true' ? 'text-green-600' : 'text-gray-400'} />
              <span className="font-medium text-sm">Transfer Bank</span>
            </div>
            <p className="text-xs mt-1 text-gray-500">{settings['payment_bank_transfer_enabled'] === 'true' ? 'Aktif' : 'Nonaktif'}</p>
          </div>
          <div className={`p-3 rounded-lg border-2 ${settings['payment_midtrans_enabled'] === 'true' ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center gap-2">
              <CreditCard size={18} className={settings['payment_midtrans_enabled'] === 'true' ? 'text-green-600' : 'text-gray-400'} />
              <span className="font-medium text-sm">Midtrans</span>
            </div>
            <p className="text-xs mt-1 text-gray-500">{settings['payment_midtrans_enabled'] === 'true' ? 'Aktif' : 'Nonaktif'}</p>
          </div>
          <div className={`p-3 rounded-lg border-2 ${settings['payment_paypal_enabled'] === 'true' ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={settings['payment_paypal_enabled'] === 'true' ? 'text-green-600' : 'text-gray-400'}><path d="M7 11l-1 8H2L4 3h6.5a4.5 4.5 0 0 1 1 8.9"/><path d="M13 3h4.74a4.5 4.5 0 0 1 .5 8.96L17 19h-4"/></svg>
              <span className="font-medium text-sm">PayPal</span>
            </div>
            <p className="text-xs mt-1 text-gray-500">{settings['payment_paypal_enabled'] === 'true' ? 'Aktif' : 'Nonaktif'}</p>
          </div>
          <div className={`p-3 rounded-lg border-2 ${settings['payment_cod_enabled'] === 'true' ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={settings['payment_cod_enabled'] === 'true' ? 'text-green-600' : 'text-gray-400'}><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
              <span className="font-medium text-sm">COD</span>
            </div>
            <p className="text-xs mt-1 text-gray-500">{settings['payment_cod_enabled'] === 'true' ? 'Aktif' : 'Nonaktif'}</p>
          </div>
        </div>
      </div>
      
      {/* Bank Transfer */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <Building size={18} />
          Transfer Bank Manual
        </h4>
        {renderSettingInput('payment_bank_transfer_enabled', 'Aktifkan Transfer Bank', 'boolean', '', 'Pelanggan dapat melakukan pembayaran via transfer bank dan upload bukti pembayaran')}
        {settings['payment_bank_transfer_enabled'] === 'true' && (
          <div className="mt-3 pl-4 border-l-2 border-blue-300">
            {renderSettingInput('payment_bank_name', 'Nama Bank', 'text', 'BCA / Mandiri / BNI')}
            {renderSettingInput('payment_bank_account', 'Nomor Rekening', 'text', '1234567890')}
            {renderSettingInput('payment_bank_holder', 'Atas Nama', 'text', 'Nama Pemilik Rekening')}
          </div>
        )}
      </div>

      {/* Midtrans */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <CreditCard size={18} />
          Midtrans Payment Gateway
        </h4>
        {renderSettingInput('payment_midtrans_enabled', 'Aktifkan Midtrans', 'boolean', '', 'Pembayaran online otomatis via Midtrans (QRIS, VA, GoPay, dll)')}
        {settings['payment_midtrans_enabled'] === 'true' && (
          <div className="mt-3 pl-4 border-l-2 border-blue-300">
            {renderSettingInput('payment_midtrans_sandbox', 'Mode Sandbox (Testing)', 'boolean', '', 'Aktifkan untuk testing. Nonaktifkan untuk transaksi production/live.')}
            {renderSettingInput('payment_midtrans_server_key', 'Server Key', 'password', settings['payment_midtrans_sandbox'] === 'true' ? 'SB-Mid-server-xxxx' : 'Mid-server-xxxx')}
            {renderSettingInput('payment_midtrans_client_key', 'Client Key', 'text', settings['payment_midtrans_sandbox'] === 'true' ? 'SB-Mid-client-xxxx' : 'Mid-client-xxxx')}
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Cara mendapatkan API Key:</strong>
              </p>
              <ol className="text-sm text-blue-600 list-decimal list-inside mt-1 space-y-1">
                <li>Login ke <a href="https://dashboard.midtrans.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">Dashboard Midtrans</a></li>
                <li>Pergi ke Settings → Access Keys</li>
                <li>Copy Server Key dan Client Key</li>
                <li>Untuk testing, gunakan Sandbox environment</li>
              </ol>
              <p className="text-xs text-blue-500 mt-2">
                Mode saat ini: <span className="font-bold">{settings['payment_midtrans_sandbox'] === 'true' ? '🧪 Sandbox (Testing)' : '🟢 Production (Live)'}</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* PayPal */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 11l-1 8H2L4 3h6.5a4.5 4.5 0 0 1 1 8.9"/><path d="M13 3h4.74a4.5 4.5 0 0 1 .5 8.96L17 19h-4"/></svg>
          PayPal Payment Gateway
        </h4>
        {renderSettingInput('payment_paypal_enabled', 'Aktifkan PayPal', 'boolean', '', 'Pembayaran internasional via PayPal (mendukung kartu kredit, debit, dan saldo PayPal)')}
        {settings['payment_paypal_enabled'] === 'true' && (
          <div className="mt-3 pl-4 border-l-2 border-blue-300">
            {renderSettingInput('payment_paypal_sandbox', 'Mode Sandbox (Testing)', 'boolean', '', 'Aktifkan untuk testing. Nonaktifkan untuk transaksi production/live.')}
            {renderSettingInput('payment_paypal_client_id', 'Client ID', 'text', settings['payment_paypal_sandbox'] === 'true' ? 'AYxxxxxx-sandbox-client-id' : 'AYxxxxxx-live-client-id')}
            {renderSettingInput('payment_paypal_client_secret', 'Client Secret', 'password', 'ELxxxxxx-secret')}
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Cara mendapatkan API Key PayPal:</strong>
              </p>
              <ol className="text-sm text-blue-600 list-decimal list-inside mt-1 space-y-1">
                <li>Login ke <a href="https://developer.paypal.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">PayPal Developer Dashboard</a></li>
                <li>Buat atau pilih App di Apps & Credentials</li>
                <li>Copy Client ID dan Client Secret</li>
                <li>Untuk testing, gunakan Sandbox environment</li>
              </ol>
              <p className="text-xs text-blue-500 mt-2">
                Mode saat ini: <span className="font-bold">{settings['payment_paypal_sandbox'] === 'true' ? '🧪 Sandbox (Testing)' : '🟢 Production (Live)'}</span>
              </p>
              <p className="text-xs text-orange-500 mt-1">
                Catatan: PayPal menggunakan mata uang USD. Konversi otomatis dari IDR ke USD dilakukan dengan kurs perkiraan.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* COD */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
          Cash on Delivery (COD)
        </h4>
        {renderSettingInput('payment_cod_enabled', 'Aktifkan COD', 'boolean', '', 'Pelanggan membayar saat barang diterima. Hanya tersedia untuk user yang login.')}
      </div>
    </div>
  );

  const renderSocialSettings = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Share2 size={20} />
        Media Sosial
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Masukkan URL lengkap profil media sosial Anda
      </p>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Facebook size={20} className="text-blue-600 flex-shrink-0" />
          <div className="flex-1">
            {renderSettingInput('social_facebook', 'Facebook', 'url', 'https://facebook.com/yourpage')}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Instagram size={20} className="text-pink-600 flex-shrink-0" />
          <div className="flex-1">
            {renderSettingInput('social_instagram', 'Instagram', 'url', 'https://instagram.com/yourprofile')}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Twitter size={20} className="text-blue-400 flex-shrink-0" />
          <div className="flex-1">
            {renderSettingInput('social_twitter', 'Twitter / X', 'url', 'https://twitter.com/yourhandle')}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-black flex-shrink-0" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
          </svg>
          <div className="flex-1">
            {renderSettingInput('social_tiktok', 'TikTok', 'url', 'https://tiktok.com/@yourprofile')}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Youtube size={20} className="text-red-600 flex-shrink-0" />
          <div className="flex-1">
            {renderSettingInput('social_youtube', 'YouTube', 'url', 'https://youtube.com/c/yourchannel')}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettingsContent = () => {
    switch (activeGroup) {
      case 'site':
        return renderSiteSettings();
      case 'contact':
        return renderContactSettings();
      case 'email':
        return renderEmailSettings();
      case 'payment':
        return renderPaymentSettings();
      case 'social':
        return renderSocialSettings();
      case 'legal':
        return renderLegalSettings();
      case 'report':
        return renderReportSettings();
      case 'security':
        return renderSecuritySettings();
      case 'upload':
        return renderUploadSettings();
      case 'system':
        return renderSystemSettings();
      default:
        return renderSiteSettings();
    }
  };

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Shield size={20} />
        Keamanan
      </h3>

      {/* reCAPTCHA Section */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium mb-1 flex items-center gap-2">
          Google reCAPTCHA v2
        </h4>
        <p className="text-sm text-gray-500 mb-4">
          Aktifkan Google reCAPTCHA untuk melindungi halaman registrasi dari bot.
          Dapatkan kunci di{' '}
          <a
            href="https://www.google.com/recaptcha/admin/create"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Google reCAPTCHA Admin Console
          </a>{' '}
          (pilih tipe <strong>reCAPTCHA v2 — "I'm not a robot" Checkbox</strong>).
        </p>

        {renderSettingInput('recaptcha_enabled', 'Aktifkan Google reCAPTCHA', 'boolean', '', 'Jika aktif, form registrasi wajib melewati verifikasi reCAPTCHA')}

        {settings['recaptcha_enabled'] === 'true' && (
          <div className="mt-4 space-y-3 border-t pt-4">
            {renderSettingInput('recaptcha_site_key', 'Site Key (Public)', 'text', '6Le...', 'Kunci publik yang digunakan di frontend')}
            {renderSettingInput('recaptcha_secret_key', 'Secret Key (Private)', 'password', '6Le...', 'Kunci rahasia untuk verifikasi di server — jangan dibagikan')}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
              <strong>Cara mendapatkan kunci:</strong>
              <ol className="mt-1 ml-4 list-decimal space-y-1">
                <li>Buka <a href="https://www.google.com/recaptcha/admin/create" target="_blank" rel="noopener noreferrer" className="underline">Google reCAPTCHA Admin Console</a></li>
                <li>Pilih tipe: <strong>reCAPTCHA v2</strong> → "I'm not a robot" Checkbox</li>
                <li>Tambahkan domain website Anda</li>
                <li>Salin <strong>Site Key</strong> dan <strong>Secret Key</strong> ke field di atas</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderUploadSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Upload size={20} />
        Upload & Media
      </h3>
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium mb-3">Batas Ukuran Upload</h4>
        {renderSettingInput('max_upload_size_mb', 'Ukuran Maksimal Upload Gambar (MB)', 'number', '5', 'Batas maksimal ukuran file gambar yang dapat diunggah (dalam MB). Default: 5 MB.')}
        {renderSettingInput('max_product_images', 'Maksimal Gambar per Produk', 'number', '5', 'Jumlah maksimal gambar galeri yang dapat ditambahkan per produk. Default: 5.')}
      </div>
    </div>
  );

  const renderSystemSettings = () => {
    const handleCleanupImages = async () => {
      try {
        setCleaningImages(true);
        setCleanupResult(null);
        const response = await settingsAPI.cleanupImages();
        if (response.data.success) {
          setCleanupResult({ type: 'success', text: response.data.message || `Selesai. ${response.data.data?.deleted || 0} file dihapus.` });
        }
      } catch (error) {
        setCleanupResult({ type: 'error', text: error.response?.data?.message || 'Gagal membersihkan gambar.' });
      } finally {
        setCleaningImages(false);
      }
    };

    const handleResetDatabase = async () => {
      if (resetConfirmText !== 'RESET_ALL_DATA') {
        return;
      }
      try {
        setResetting(true);
        const response = await settingsAPI.resetDatabase('RESET_ALL_DATA');
        if (response.data.success) {
          setMessage({ type: 'success', text: response.data.message || 'Database berhasil direset.' });
          setShowResetModal(false);
          setResetConfirmText('');
        }
      } catch (error) {
        setMessage({ type: 'error', text: error.response?.data?.message || 'Gagal mereset database.' });
        setShowResetModal(false);
      } finally {
        setResetting(false);
      }
    };

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Settings size={20} />
          Sistem & Maintenance
        </h3>

        {/* Cleanup unused images */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium mb-2">Hapus Foto Galeri Tidak Terpakai</h4>
          <p className="text-sm text-gray-500 mb-3">
            Memindai folder upload produk dan menghapus file gambar yang tidak terdaftar di database.
            Berguna untuk membersihkan file sisa setelah penghapusan produk.
          </p>
          {cleanupResult && (
            <div className={`mb-3 p-3 rounded-lg text-sm ${
              cleanupResult.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {cleanupResult.text}
            </div>
          )}
          <button
            onClick={handleCleanupImages}
            disabled={cleaningImages}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >
            <RefreshCw size={18} className={cleaningImages ? 'animate-spin' : ''} />
            {cleaningImages ? 'Memindai...' : 'Hapus Foto Tidak Terpakai'}
          </button>
        </div>

        {/* Reset Database */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-medium text-red-700 mb-2 flex items-center gap-2">
            <AlertCircle size={18} />
            Reset Semua Data Transaksi
          </h4>
          <p className="text-sm text-red-600 mb-2">
            Menghapus <strong>semua</strong> data transaksi: pesanan, pembayaran, keranjang, pemakaian kupon,
            pergerakan inventori, retur, wishlist, dan log aktivitas. <strong>Tindakan ini tidak dapat dibatalkan.</strong>
          </p>
          <p className="text-sm text-gray-500 mb-3">
            Data produk, kategori, pengaturan, dan pengguna <strong>tidak</strong> akan dihapus.
          </p>
          <button
            onClick={() => { setShowResetModal(true); setResetConfirmText(''); }}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            <AlertCircle size={18} />
            Reset Semua Data
          </button>
        </div>

        {/* Reset Confirmation Modal */}
        {showResetModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-bold text-red-700 mb-2 flex items-center gap-2">
                <AlertCircle size={20} />
                Konfirmasi Reset Database
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Anda akan menghapus semua data transaksi secara permanen. Untuk melanjutkan,
                ketik <strong className="font-mono">RESET_ALL_DATA</strong> di bawah ini:
              </p>
              <input
                type="text"
                value={resetConfirmText}
                onChange={(e) => setResetConfirmText(e.target.value)}
                placeholder="RESET_ALL_DATA"
                className="w-full px-3 py-2 border-2 border-red-300 rounded-lg font-mono mb-4 focus:outline-none focus:border-red-500"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleResetDatabase}
                  disabled={resetConfirmText !== 'RESET_ALL_DATA' || resetting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-40 transition"
                >
                  {resetting ? 'Mereset...' : 'Ya, Reset Sekarang'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderReportSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <BarChart3 size={20} />
        Pengaturan Laporan
      </h3>

      {/* Margin Calculation Method */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium mb-3">Metode Perhitungan HPP (Margin)</h4>
        <p className="text-sm text-gray-500 mb-4">
          Pilih metode perhitungan Harga Pokok Penjualan (HPP) untuk kalkulasi margin pada laporan.
        </p>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Metode HPP</label>
          <select
            value={settings['margin_calculation_method'] || 'latest'}
            onChange={(e) => handleChange('margin_calculation_method', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="latest">HPP Terakhir (Latest Cost)</option>
            <option value="average">Rata-rata HPP (Average Cost)</option>
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-white rounded-lg border p-3">
            <h5 className="font-medium text-sm text-blue-700 mb-1">HPP Terakhir (Latest Cost)</h5>
            <p className="text-xs text-gray-600">
              Mengambil harga beli/HPP dari transaksi stok masuk terakhir untuk setiap varian produk. 
              Cocok jika harga beli sering berubah dan Anda ingin margin mencerminkan harga pembelian terkini.
            </p>
          </div>
          <div className="bg-white rounded-lg border p-3">
            <h5 className="font-medium text-sm text-green-700 mb-1">Rata-rata HPP (Average Cost)</h5>
            <p className="text-xs text-gray-600">
              Menghitung rata-rata tertimbang dari semua harga beli stok masuk. 
              Cocok untuk mendapatkan gambaran biaya yang lebih stabil dan merata.
            </p>
          </div>
        </div>
      </div>

      {/* Allow Negative Stock */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium mb-3">Pengaturan Stok</h4>
        {renderSettingInput('allow_negative_stock', 'Izinkan Stok Minus', 'boolean', '', 'Jika diaktifkan, penjualan tetap bisa dilakukan meskipun stok produk sudah habis (stok bisa menjadi minus)')}
        <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-xs text-yellow-700">
            <strong>Perhatian:</strong> Mengaktifkan stok minus berarti sistem tidak akan menolak pesanan saat stok habis. 
            Pastikan Anda memantau stok secara berkala untuk menghindari oversell yang tidak terkendali.
          </p>
        </div>
      </div>
    </div>
  );

  const renderLegalSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Shield size={20} />
        EULA & Cookie
      </h3>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-yellow-700">
          Konten di bawah ini akan ditampilkan sebagai popup Cookie Consent dan EULA (End User License Agreement) 
          di halaman depan website. Cookie consent akan muncul saat pengunjung pertama kali mengakses situs.
        </p>
      </div>
      
      {/* Cookie Notice */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium mb-3">Teks Pemberitahuan Cookie</h4>
        {renderSettingInput('cookie_notice_id', 'Teks Cookie (Indonesia)', 'textarea', 'Kami menggunakan cookie untuk meningkatkan pengalaman Anda...', 'Teks yang muncul pada banner cookie di bagian bawah halaman')}
        {renderSettingInput('cookie_notice_en', 'Teks Cookie (English)', 'textarea', 'We use cookies to improve your experience...', 'Cookie banner text in English')}
      </div>

      {/* EULA */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium mb-3">EULA / Syarat & Ketentuan</h4>
        {renderSettingInput('eula_title_id', 'Judul EULA (Indonesia)', 'text', 'Syarat & Ketentuan')}
        {renderSettingInput('eula_title_en', 'EULA Title (English)', 'text', 'Terms & Conditions')}
        {renderSettingInput('eula_content_id', 'Konten EULA (Indonesia)', 'textarea', 'Masukkan syarat & ketentuan dalam Bahasa Indonesia... (HTML didukung)', 'Mendukung format HTML untuk pembentukan teks')}
        {renderSettingInput('eula_content_en', 'EULA Content (English)', 'textarea', 'Enter terms & conditions in English... (HTML supported)', 'Supports HTML formatting')}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Settings size={32} />
          Pengaturan
        </h1>
        <div className="flex gap-2">
          <button
            onClick={handleInitSettings}
            disabled={initializing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition"
          >
            <RefreshCw size={18} className={initializing ? 'animate-spin' : ''} />
            {initializing ? 'Menginisialisasi...' : 'Init Default'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >
            <Save size={18} />
            {saving ? 'Menyimpan...' : 'Simpan Semua'}
          </button>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {message.text}
        </div>
      )}

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow p-4">
            <nav className="space-y-1">
              {settingGroups.map(group => {
                const Icon = group.icon;
                return (
                  <button
                    key={group.id}
                    onClick={() => setActiveGroup(group.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
                      activeGroup === group.id
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={20} />
                    {group.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow p-6">
            {renderSettingsContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
