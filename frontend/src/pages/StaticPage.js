import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../utils/i18n';
import apiClient from '../services/api';

export default function StaticPage() {
  const { slug } = useParams();
  const { t, language } = useLanguage();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        setNotFound(false);
        const response = await apiClient.get(`/content/${slug}`, {
          params: { lang: language }
        });
        if (response.data.success) {
          setContent(response.data.data);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [slug, language]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (notFound || !content) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-12">
        <div className="max-w-md text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-8">{t('pageNotFound')}</p>
          <Link
            to="/"
            className="inline-block bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition"
          >
            {t('backToHome')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] py-8 sm:py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {content.title && (
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {content.title}
          </h1>
        )}
        {content.subtitle && (
          <p className="text-lg text-gray-600 mb-8">{content.subtitle}</p>
        )}
        {content.content && (
          <div 
            className="prose prose-lg max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: content.content }}
          />
        )}
        {content.button_text && content.button_url && (
          <div className="mt-8">
            <Link
              to={content.button_url}
              className="inline-block bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition"
            >
              {content.button_text}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
