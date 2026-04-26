import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Helmet } from 'react-helmet-async';
import apiClient from '../services/api';

const ForgotPassword = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    try {
      await apiClient.post('/auth/forgot-password', { email: data.email });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim email. Coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Lupa Password</title>
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow">
          <div>
            <h2 className="text-center text-3xl font-extrabold text-gray-900">Lupa Password</h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Masukkan email Anda dan kami akan mengirimkan link untuk mereset password.
            </p>
          </div>

          {submitted ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-700 font-medium">Email terkirim!</p>
              <p className="text-sm text-gray-500">
                Jika email terdaftar, Anda akan menerima link reset password. Periksa juga folder spam.
              </p>
              <Link to="/login" className="inline-block mt-4 text-primary-600 hover:text-primary-500 font-medium text-sm">
                ← Kembali ke Login
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  {...register('email', {
                    required: 'Email wajib diisi',
                    pattern: { value: /^\S+@\S+$/i, message: 'Format email tidak valid' }
                  })}
                  type="email"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="email@contoh.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none disabled:opacity-50"
              >
                {isLoading ? 'Mengirim...' : 'Kirim Link Reset Password'}
              </button>
              <div className="text-center">
                <Link to="/login" className="text-sm text-primary-600 hover:text-primary-500">
                  ← Kembali ke Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
