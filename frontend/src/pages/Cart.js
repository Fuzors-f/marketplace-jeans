import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import api from '../services/api';
import { fetchCart as fetchCartRedux } from '../redux/slices/cartSlice';
import { getImageUrl, handleImageError, PLACEHOLDER_IMAGES } from '../utils/imageUtils';
import { useAlert } from '../utils/AlertContext';
import { useLanguage } from '../utils/i18n';

export default function Cart() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showError, showConfirm } = useAlert();
  const { t, formatCurrency } = useLanguage();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cart');
      if (response.data.success) {
        setCart(response.data.data);
        dispatch(fetchCartRedux());
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError(t('failedLoadCart'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    const qty = parseInt(newQuantity, 10);
    if (isNaN(qty) || qty < 1) return;
    
    try {
      setUpdating(itemId);
      await api.put(`/cart/${itemId}`, { quantity: qty });
      await fetchCart();
    } catch (err) {
      showError(err.response?.data?.message || t('failedUpdateQuantity'));
      // Re-fetch to reset displayed quantity on error
      await fetchCart();
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveItem = async (itemId) => {
    showConfirm(t('removeItemConfirm'), async () => {
      try {
        setUpdating(itemId);
        await api.delete(`/cart/${itemId}`);
        await fetchCart();
      } catch (err) {
        showError(t('failedRemoveItem'));
      } finally {
        setUpdating(null);
      }
    }, { title: t('confirmRemoveTitle') });
  };

  const handleClearCart = async () => {
    showConfirm(t('clearCartConfirm'), async () => {
      try {
        setLoading(true);
        await api.delete('/cart');
        setCart({ items: [], total: 0 });
        dispatch(fetchCartRedux());
      } catch (err) {
        showError(t('failedClearCart'));
      } finally {
        setLoading(false);
      }
    }, { title: t('confirm') });
  };

  const getCartImageUrl = (imageUrl) => {
    return getImageUrl(imageUrl, 'products');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">{t('shoppingCart')}</h1>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
            {error}
          </div>
        )}

        {cart.items.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-xl font-semibold mb-2">{t('emptyCartTitle')}</h2>
            <p className="text-gray-600 mb-6">{t('emptyCartMessage')}</p>
            <button
              onClick={() => navigate('/products')}
              className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800"
            >
              {t('startShopping')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow p-4 flex gap-4">
                  {/* Product Image */}
                  <div className="w-24 h-24 flex-shrink-0">
                    <img
                      src={getCartImageUrl(item.image)}
                      alt={item.product_name}
                      className="w-full h-full object-cover rounded"
                      onError={(e) => handleImageError(e, 'product')}
                    />
                  </div>
                  
                  {/* Product Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{item.product_name}</h3>
                    <p className="text-sm text-gray-600">{t('sizeLabel')}: {item.size_name}</p>
                    <div className="mt-1">
                      {item.discount_price && item.original_price && item.discount_price < item.original_price ? (
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg text-red-600">{formatCurrency(item.price)}</span>
                          <span className="text-sm text-gray-400 line-through">{formatCurrency(item.original_price)}</span>
                          {item.discount_percentage && (
                            <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium">-{item.discount_percentage}%</span>
                          )}
                        </div>
                      ) : (
                        <p className="font-bold text-lg">{formatCurrency(item.price)}</p>
                      )}
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, parseInt(item.quantity, 10) - 1)}
                        disabled={updating === item.id || parseInt(item.quantity, 10) <= 1}
                        className="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 select-none"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={item.stock_quantity}
                        value={updating === item.id ? item.quantity : item.quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val) && val >= 1 && val <= parseInt(item.stock_quantity, 10)) {
                            handleUpdateQuantity(item.id, val);
                          }
                        }}
                        disabled={updating === item.id}
                        className="w-14 h-8 text-center border rounded focus:ring-2 focus:ring-black focus:outline-none disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        onClick={() => handleUpdateQuantity(item.id, parseInt(item.quantity, 10) + 1)}
                        disabled={updating === item.id || parseInt(item.quantity, 10) >= parseInt(item.stock_quantity, 10)}
                        className="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 select-none"
                      >
                        +
                      </button>
                      <span className="text-xs text-gray-500">
                        ({t('stockLabel')}: {item.stock_quantity})
                      </span>
                    </div>
                  </div>
                  
                  {/* Item Total & Remove */}
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(item.price * item.quantity)}</p>
                    {item.discount_price && item.original_price && item.discount_price < item.original_price && (
                      <p className="text-xs text-green-600">{t('youSave') || 'Hemat'} {formatCurrency((item.original_price - item.price) * item.quantity)}</p>
                    )}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={updating === item.id}
                      className="text-red-600 text-sm mt-2 hover:underline disabled:opacity-50"
                    >
                      {t('removeItem')}
                    </button>
                  </div>
                </div>
              ))}
              
              {/* Clear Cart */}
              <div className="text-right">
                <button
                  onClick={handleClearCart}
                  className="text-red-600 text-sm hover:underline"
                >
                  {t('clearCart')}
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-4">
                <h2 className="text-xl font-bold mb-4">{t('orderSummary')}</h2>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-gray-600">
                    <span>{t('subtotal')} ({cart.items.length} {t('item')})</span>
                    <span>{formatCurrency(cart.total)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>{t('shippingCost')}</span>
                    <span>{t('calculatedAtCheckout')}</span>
                  </div>
                </div>
                
                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between font-bold text-lg">
                    <span>{t('total')}</span>
                    <span>{formatCurrency(cart.total)}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800"
                >
                  {t('proceedToCheckout')}
                </button>
                
                <button
                  onClick={() => navigate('/products')}
                  className="w-full py-3 mt-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
                >
                  {t('continueShopping')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
