import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import { login, verify2FALogin, clearError, clear2FA } from '../redux/slices/authSlice';
import { useLanguage } from '../utils/i18n';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isAuthenticated, isLoading, error, twoFARequired, twoFATempToken } = useSelector((state) => state.auth);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const onSubmit = async (data) => {
    await dispatch(login(data));
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error('Masukkan kode OTP 6 digit');
      return;
    }
    setOtpLoading(true);
    const result = await dispatch(verify2FALogin({ temp_token: twoFATempToken, otp }));
    if (verify2FALogin.rejected.match(result)) {
      toast.error(result.payload || 'Kode OTP tidak valid');
    }
    setOtpLoading(false);
  };

  const handleCancelTwoFA = () => {
    dispatch(clear2FA());
    setOtp('');
  };

  // --- 2FA Verification Step ---
  if (twoFARequired) {
    return (
      <>
        <Helmet>
          <title>Verifikasi 2FA - Marketplace Jeans</title>
        </Helmet>
        <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Verifikasi Dua Langkah</h2>
              <p className="mt-2 text-sm text-gray-600">
                Kode verifikasi telah dikirim ke email Anda. Berlaku 10 menit.
              </p>
            </div>

            <form onSubmit={handleVerify2FA} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kode OTP (6 digit)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="block w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={otpLoading || otp.length !== 6}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {otpLoading ? 'Memverifikasi...' : 'Verifikasi'}
              </button>
              <button
                type="button"
                onClick={handleCancelTwoFA}
                className="w-full text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Kembali ke halaman login
              </button>
            </form>
          </div>
        </div>
      </>
    );
  }

  // --- Normal Login Step ---
  return (
    <>
      <Helmet>
        <title>{t('login')} - Marketplace Jeans</title>
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
          <div>
            <h2 className="text-center text-3xl font-bold text-gray-900">
              {t('signInTitle')}
            </h2>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  {t('emailAddress')}
                </label>
                <input
                  {...register('email', {
                    required: t('emailIsRequired'),
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: t('invalidEmailAddress'),
                    },
                  })}
                  type="email"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  {t('password')}
                </label>
                <input
                  {...register('password', {
                    required: t('passwordIsRequired'),
                    minLength: {
                      value: 6,
                      message: t('passwordMinLengthMsg'),
                    },
                  })}
                  type="password"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {isLoading ? t('signingIn') : t('signIn')}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                {t('dontHaveAccount')}{' '}
                <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                  {t('signUp')}
                </Link>
              </p>
              <p className="mt-2 text-sm text-gray-600">
                <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                  Lupa Password?
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
