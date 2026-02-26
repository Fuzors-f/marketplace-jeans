import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../redux/slices/authSlice';
import apiClient from '../services/api';
import { useLanguage } from '../utils/i18n';

export default function Register() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!formData.full_name || !formData.email || !formData.password) {
      setError(t('nameEmailPasswordRequired'));
      return;
    }

    if (formData.password.length < 6) {
      setError(t('passwordMinChars'));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t('confirmPasswordMismatch'));
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.post('/auth/register', {
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        phone: formData.phone || null,
        role: 'member'
      });

      if (response.data.success) {
        // Save token and user data
        const { user, token } = response.data.data;
        localStorage.setItem('token', token);
        dispatch(setCredentials({
          user: user,
          token: token
        }));
        navigate('/');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || t('registrationFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">{t('registerTitle')}</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('fullNameRequired2')}
            </label>
            <input
              type="text"
              name="full_name"
              placeholder={t('enterFullName')}
              value={formData.full_name}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('emailRequired2')}
            </label>
            <input
              type="email"
              name="email"
              placeholder={t('enterEmailPlaceholder')}
              value={formData.email}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('passwordRequired2')}
            </label>
            <input
              type="password"
              name="password"
              placeholder={t('minSixCharsPlaceholder')}
              value={formData.password}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('confirmPasswordLabel')}
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder={t('repeatPassword')}
              value={formData.confirmPassword}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('phoneNumberLabel')}
            </label>
            <input
              type="tel"
              name="phone"
              placeholder={t('phoneOptional')}
              value={formData.phone}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded font-semibold hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? t('registering') : t('registerBtn')}
          </button>
        </form>
        
        <p className="mt-6 text-center text-gray-600">
          {t('alreadyHaveAccount')}{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-semibold">
            {t('loginLink')}
          </Link>
        </p>
      </div>
    </div>
  );
}
