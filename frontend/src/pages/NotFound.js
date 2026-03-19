import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../utils/i18n';

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-lg text-center">
        <h1 className="text-8xl font-bold text-gray-900 mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">{t('pageNotFound')}</h2>
        <p className="text-gray-500 mb-8">
          {t('pageNotFoundMessage') || 'Halaman yang Anda cari tidak ditemukan atau telah dipindahkan.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-block bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition font-medium"
          >
            {t('backToHome')}
          </Link>
          <Link
            to="/products"
            className="inline-block bg-white text-gray-800 px-6 py-3 rounded border border-gray-300 hover:bg-gray-50 transition font-medium"
          >
            {t('shopNow') || 'Belanja'}
          </Link>
        </div>
      </div>
    </div>
  );
}
