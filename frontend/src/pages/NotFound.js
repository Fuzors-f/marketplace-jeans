import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../utils/i18n';

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-md text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">{t('notFound')}</h1>
        <p className="text-xl text-gray-600 mb-8">{t('pageNotFoundMessage')}</p>
        <Link
          to="/"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          {t('backToHome')}
        </Link>
      </div>
    </div>
  );
}
