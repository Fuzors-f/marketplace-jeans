import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, Globe, Mail, CreditCard, Share2, Building, 
  Save, RefreshCw, Upload, Image, 
  Facebook, Instagram, Twitter, Youtube, CheckCircle, AlertCircle
} from 'lucide-react';
import { settingsAPI } from '../../services/api';
import { useSettings } from '../../utils/SettingsContext';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Setting Groups Configuration
const settingGroups = [
  { id: 'site', label: 'Pengaturan Situs', icon: Globe },
  { id: 'contact', label: 'Kontak & Alamat', icon: Building },
  { id: 'email', label: 'Email SMTP', icon: Mail },
  { id: 'payment', label: 'Payment Gateway', icon: CreditCard },
  { id: 'social', label: 'Media Sosial', icon: Share2 },
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
  
  const logoInputRef = useRef(null);
  const faviconInputRef = useRef(null);

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
      const inputRef = key === 'site_logo' ? logoInputRef : faviconInputRef;
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
                    e.target.nextSibling.style.display = 'flex';
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
                onClick={() => inputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
              >
                <Upload size={16} />
                Pilih Gambar
              </button>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file, key);
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
        {renderSettingInput('email_smtp_host', 'SMTP Host', 'text', 'smtp.gmail.com')}
        {renderSettingInput('email_smtp_port', 'SMTP Port', 'text', '587')}
        {renderSettingInput('email_smtp_user', 'SMTP Username', 'text', 'email@gmail.com')}
        {renderSettingInput('email_smtp_pass', 'SMTP Password', 'password', '••••••••', 'Gunakan App Password untuk Gmail')}
        {renderSettingInput('email_from_name', 'Nama Pengirim', 'text', 'Marketplace Jeans')}
        {renderSettingInput('email_from_address', 'Email Pengirim', 'email', 'noreply@example.com')}
        
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
      
      {/* Bank Transfer */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <Building size={18} />
          Transfer Bank Manual
        </h4>
        {renderSettingInput('payment_bank_transfer_enabled', 'Aktifkan Transfer Bank', 'boolean')}
        {renderSettingInput('payment_bank_name', 'Nama Bank', 'text', 'BCA / Mandiri / BNI')}
        {renderSettingInput('payment_bank_account', 'Nomor Rekening', 'text', '1234567890')}
        {renderSettingInput('payment_bank_holder', 'Atas Nama', 'text', 'Nama Pemilik Rekening')}
      </div>

      {/* Midtrans */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <CreditCard size={18} />
          Midtrans Payment Gateway
        </h4>
        {renderSettingInput('payment_midtrans_enabled', 'Aktifkan Midtrans', 'boolean')}
        {renderSettingInput('payment_midtrans_sandbox', 'Mode Sandbox (Testing)', 'boolean', '', 'Nonaktifkan untuk production')}
        {renderSettingInput('payment_midtrans_server_key', 'Server Key', 'password', 'SB-Mid-server-xxx')}
        {renderSettingInput('payment_midtrans_client_key', 'Client Key', 'text', 'SB-Mid-client-xxx')}
        <div className="mt-3 text-sm text-gray-500">
          <p>Dapatkan API Key di <a href="https://dashboard.midtrans.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Dashboard Midtrans</a></p>
        </div>
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
      default:
        return renderSiteSettings();
    }
  };

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
