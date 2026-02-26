import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import { getImageUrl, handleImageError } from '../utils/imageUtils';
import { useAlert } from '../utils/AlertContext';
import { useLanguage } from '../utils/i18n';

export default function Wishlist() {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { showSuccess, showError, showConfirm } = useAlert();
  const { t, formatCurrency } = useLanguage();
  
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/wishlist');
      return;
    }
    fetchWishlist();
  }, [isAuthenticated, navigate]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await api.get('/wishlist');
      if (response.data.success) {
        setWishlistItems(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      if (err.response?.status !== 401) {
        showError(t('failedLoadWishlist'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    showConfirm(t('removeFromWishlist'), async () => {
      try {
        setRemoving(productId);
        await api.delete(`/wishlist/${productId}`);
        setWishlistItems(prev => prev.filter(item => item.product_id !== productId));
        showSuccess(t('removedFromWishlistSuccess'));
      } catch (err) {
        showError(t('failedRemoveWishlist'));
      } finally {
        setRemoving(null);
      }
    }, { title: t('confirm') });
  };

  const handleAddToCart = async (item) => {
    try {
      // Get the first available variant
      const response = await api.get(`/products/${item.product_slug}`);
      if (response.data.success) {
        const product = response.data.data;
        const availableVariant = product.variants?.find(v => v.stock_quantity > 0);
        
        if (!availableVariant) {
          showError(t('noStockAvailable'));
          return;
        }

        await api.post('/cart', {
          product_variant_id: availableVariant.id,
          quantity: 1
        });
        
        showSuccess(t('addedToCartFromWishlist'));
      }
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        showError(err.response?.data?.message || t('failedAddCart'));
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t('wishlist')} - Marketplace Jeans</title>
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">{t('myWishlist')}</h1>
              <p className="text-gray-600 mt-1">
                {wishlistItems.length} {t('products')}
              </p>
            </div>
            <Link
              to="/products"
              className="text-gray-600 hover:text-black flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t('continueShopping')}
            </Link>
          </div>

          {wishlistItems.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">{t('emptyWishlist')}</h2>
              <p className="text-gray-600 mb-6">
                {t('emptyWishlistMessage')}
              </p>
              <Link
                to="/products"
                className="inline-block px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition"
              >
                {t('startShopping')}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden group">
                  {/* Product Image */}
                  <div className="relative aspect-square bg-gray-100">
                    <Link to={`/products/${item.product_slug}`}>
                      <img
                        src={getImageUrl(item.product_image, 'products')}
                        alt={item.product_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => handleImageError(e, 'product')}
                      />
                    </Link>
                    
                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveFromWishlist(item.product_id)}
                      disabled={removing === item.product_id}
                      className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-red-50 transition-colors group/btn"
                      title={t('removeFromWishlist')}
                    >
                      {removing === item.product_id ? (
                        <svg className="w-5 h-5 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      )}
                    </button>

                    {/* Out of Stock Badge */}
                    {item.total_stock <= 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-center py-2 text-sm font-medium">
                        {t('noStockAvailable')}
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    {item.category_name && (
                      <p className="text-xs text-gray-500 mb-1">{item.category_name}</p>
                    )}
                    <Link to={`/products/${item.product_slug}`}>
                      <h3 className="font-semibold text-gray-900 hover:text-gray-700 line-clamp-2 mb-2">
                        {item.product_name}
                      </h3>
                    </Link>
                    <p className="text-lg font-bold text-gray-900 mb-4">
                      {formatCurrency(item.product_price)}
                    </p>

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={item.total_stock <= 0}
                      className={`w-full py-2.5 rounded-lg font-semibold transition ${
                        item.total_stock > 0
                          ? 'bg-black text-white hover:bg-gray-800'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {item.total_stock > 0 ? t('addToCart') : t('noStockAvailable')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
