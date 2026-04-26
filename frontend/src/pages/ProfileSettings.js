import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Camera, User, Lock, ArrowLeft, Check, X, Shield, ShieldCheck, ShieldOff } from 'lucide-react';
import { userAPI } from '../services/api';
import { loadUser } from '../redux/slices/authSlice';
import { useLanguage } from '../utils/i18n';
import api from '../utils/api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://be-hojdenim.yyyy-zzzzz-online.com';

export default function ProfileSettings() {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { t } = useLanguage();
  const fileInputRef = useRef(null);
  
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Profile form
  const [profileForm, setProfileForm] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  
  // Password form
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  // Profile picture
  const [previewImage, setPreviewImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // 2FA state
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [twoFAStep, setTwoFAStep] = useState('idle'); // idle | otp_sent | confirm_disable
  const [twoFAOtp, setTwoFAOtp] = useState('');
  const [twoFADisablePassword, setTwoFADisablePassword] = useState('');
  const [twoFALoading, setTwoFALoading] = useState(false);

  // Sync profileForm with user data when user changes
  useEffect(() => {
    if (user) {
      setProfileForm({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  // Load 2FA status when security tab opens
  useEffect(() => {
    if (activeTab === 'security') {
      api.get('/auth/2fa/status')
        .then(res => setTwoFAEnabled(res.data.data.two_fa_enabled))
        .catch(() => {});
    }
  }, [activeTab]);

  const handleSetup2FA = async () => {
    setTwoFALoading(true);
    setMessage({ type: '', text: '' });
    try {
      await api.post('/auth/2fa/setup');
      setTwoFAStep('otp_sent');
      setMessage({ type: 'success', text: 'Kode OTP telah dikirim ke email Anda. Berlaku 10 menit.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Gagal mengirim OTP' });
    } finally {
      setTwoFALoading(false);
    }
  };

  const handleConfirmEnable2FA = async (e) => {
    e.preventDefault();
    if (!twoFAOtp || twoFAOtp.length !== 6) {
      setMessage({ type: 'error', text: 'Masukkan kode OTP 6 digit' });
      return;
    }
    setTwoFALoading(true);
    setMessage({ type: '', text: '' });
    try {
      await api.post('/auth/2fa/enable', { otp: twoFAOtp });
      setTwoFAEnabled(true);
      setTwoFAStep('idle');
      setTwoFAOtp('');
      setMessage({ type: 'success', text: '2FA berhasil diaktifkan!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'OTP tidak valid' });
    } finally {
      setTwoFALoading(false);
    }
  };

  const handleDisable2FA = async (e) => {
    e.preventDefault();
    if (!twoFADisablePassword) {
      setMessage({ type: 'error', text: 'Password wajib diisi' });
      return;
    }
    setTwoFALoading(true);
    setMessage({ type: '', text: '' });
    try {
      await api.post('/auth/2fa/disable', { password: twoFADisablePassword });
      setTwoFAEnabled(false);
      setTwoFAStep('idle');
      setTwoFADisablePassword('');
      setMessage({ type: 'success', text: '2FA berhasil dinonaktifkan.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Gagal menonaktifkan 2FA' });
    } finally {
      setTwoFALoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const response = await userAPI.updateProfile(profileForm);
      if (response.data.success) {
        setMessage({ type: 'success', text: t('profileUpdated') });
        dispatch(loadUser());
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || t('failedUpdateProfile') 
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Validation
    if (!passwordForm.current_password) {
      setMessage({ type: 'error', text: t('currentPasswordRequired') || 'Password saat ini wajib diisi' });
      setLoading(false);
      return;
    }

    if (!passwordForm.new_password) {
      setMessage({ type: 'error', text: t('newPasswordRequired') || 'Password baru wajib diisi' });
      setLoading(false);
      return;
    }

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setMessage({ type: 'error', text: t('newPasswordMismatch') });
      setLoading(false);
      return;
    }

    if (passwordForm.new_password.length < 6) {
      setMessage({ type: 'error', text: t('passwordMinLength') });
      setLoading(false);
      return;
    }

    try {
      const response = await userAPI.changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      });
      
      if (response.data.success) {
        setMessage({ type: 'success', text: t('passwordChanged') });
        setPasswordForm({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || t('failedChangePassword') 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: 'error', text: t('fileSizeMax') });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    const file = fileInputRef.current?.files[0];
    if (!file) return;

    setUploadingImage(true);
    setMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('profile_picture', file);

      const response = await userAPI.uploadProfilePicture(formData);
      
      if (response.data.success) {
        setMessage({ type: 'success', text: t('profilePhotoUpdated') });
        setPreviewImage(null);
        dispatch(loadUser());
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || t('failedUploadPhoto') 
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const cancelImageUpload = () => {
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getProfilePicture = () => {
    if (previewImage) return previewImage;
    if (user?.profile_picture) return `${API_BASE_URL}${user.profile_picture}`;
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/profile" className="p-2 hover:bg-gray-200 rounded-lg transition">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold">{t('accountSettingsTitle')}</h1>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-4 px-6 text-center font-medium transition ${
                activeTab === 'profile'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <User size={18} className="inline-block mr-2" />
              {t('profileTab')}
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`flex-1 py-4 px-6 text-center font-medium transition ${
                activeTab === 'password'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Lock size={18} className="inline-block mr-2" />
              {t('passwordTab')}
            </button>
            <button
              onClick={() => { setActiveTab('security'); setTwoFAStep('idle'); setMessage({ type: '', text: '' }); }}
              className={`flex-1 py-4 px-6 text-center font-medium transition ${
                activeTab === 'security'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Shield size={18} className="inline-block mr-2" />
              Keamanan
            </button>
          </div>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Profile Picture Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">{t('profilePhoto')}</h2>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                    {getProfilePicture() ? (
                      <img 
                        src={getProfilePicture()} 
                        alt={t('profile')} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-bold text-gray-400">
                        {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
                  >
                    <Camera size={16} />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    accept="image/jpeg,image/png,image/gif"
                    className="hidden"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-2">
                    {t('uploadPhotoHint')}
                  </p>
                  {previewImage && (
                    <div className="flex gap-2">
                      <button
                        onClick={handleImageUpload}
                        disabled={uploadingImage}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        <Check size={14} />
                        {uploadingImage ? t('uploading') : t('save')}
                      </button>
                      <button
                        onClick={cancelImageUpload}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                      >
                        <X size={14} />
                        {t('cancel')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Info Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">{t('profileInfo')}</h2>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('email')}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profileForm.email}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('fullName')}
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={profileForm.full_name}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('phoneNumber')}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileForm.phone}
                    onChange={handleProfileChange}
                    placeholder="08xxxxxxxxxx"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {loading ? t('saving') : t('saveChanges')}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">{t('changePassword')}</h2>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('currentPassword')}
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    name="current_password"
                    value={passwordForm.current_password}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('newPassword')}
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    name="new_password"
                    value={passwordForm.new_password}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">{t('minSixChars')}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('confirmNewPassword')}
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    name="confirm_password"
                    value={passwordForm.confirm_password}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {loading ? t('changingPassword') : t('changePassword')}
              </button>
            </form>
          </div>
        )}
        {/* Security / 2FA Tab */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
              <Shield size={20} className="text-blue-600" />
              Autentikasi Dua Faktor (2FA)
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Tambahkan lapisan keamanan ekstra. Setiap login akan memerlukan kode verifikasi via email.
            </p>

            {/* Status Badge */}
            <div className={`flex items-center gap-3 p-4 rounded-lg mb-6 ${
              twoFAEnabled ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
            }`}>
              {twoFAEnabled
                ? <ShieldCheck size={24} className="text-green-600 flex-shrink-0" />
                : <ShieldOff size={24} className="text-gray-400 flex-shrink-0" />}
              <div>
                <p className={`font-medium ${ twoFAEnabled ? 'text-green-700' : 'text-gray-600' }`}>
                  {twoFAEnabled ? '2FA Aktif' : '2FA Tidak Aktif'}
                </p>
                <p className="text-xs text-gray-500">
                  {twoFAEnabled
                    ? 'Akun Anda dilindungi dengan verifikasi email saat login.'
                    : 'Aktifkan 2FA untuk meningkatkan keamanan akun Anda.'}
                </p>
              </div>
            </div>

            {/* Enable 2FA flow */}
            {!twoFAEnabled && twoFAStep === 'idle' && (
              <button
                onClick={handleSetup2FA}
                disabled={twoFALoading}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                <ShieldCheck size={18} />
                {twoFALoading ? 'Mengirim OTP...' : 'Aktifkan 2FA — Kirim Kode OTP'}
              </button>
            )}

            {!twoFAEnabled && twoFAStep === 'otp_sent' && (
              <form onSubmit={handleConfirmEnable2FA} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Masukkan kode OTP dari email
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={twoFAOtp}
                    onChange={(e) => setTwoFAOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="block w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={twoFALoading || twoFAOtp.length !== 6}
                    className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
                  >
                    {twoFALoading ? 'Memverifikasi...' : 'Konfirmasi & Aktifkan'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setTwoFAStep('idle'); setTwoFAOtp(''); }}
                    className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    Batal
                  </button>
                </div>
                <p className="text-xs text-gray-400 text-center">
                  Tidak menerima kode?{' '}
                  <button type="button" onClick={handleSetup2FA} className="text-blue-600 underline">
                    Kirim ulang
                  </button>
                </p>
              </form>
            )}

            {/* Disable 2FA flow */}
            {twoFAEnabled && twoFAStep === 'idle' && (
              <button
                onClick={() => setTwoFAStep('confirm_disable')}
                className="w-full py-2 px-4 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition flex items-center justify-center gap-2"
              >
                <ShieldOff size={18} />
                Nonaktifkan 2FA
              </button>
            )}

            {twoFAEnabled && twoFAStep === 'confirm_disable' && (
              <form onSubmit={handleDisable2FA} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Konfirmasi dengan password Anda
                  </label>
                  <input
                    type="password"
                    value={twoFADisablePassword}
                    onChange={(e) => setTwoFADisablePassword(e.target.value)}
                    placeholder="Password"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={twoFALoading}
                    className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
                  >
                    {twoFALoading ? 'Memproses...' : 'Ya, Nonaktifkan'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setTwoFAStep('idle'); setTwoFADisablePassword(''); }}
                    className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    Batal
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
