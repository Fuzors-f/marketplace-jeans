import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { getImageUrl, handleImageError, PLACEHOLDER_IMAGES } from '../utils/imageUtils';
import { useAlert } from '../utils/AlertContext';

export default function Cart() {
  const navigate = useNavigate();
  const { showError, showConfirm } = useAlert();
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
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError('Gagal memuat keranjang');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      setUpdating(itemId);
      await api.put(`/cart/${itemId}`, { quantity: newQuantity });
      await fetchCart();
    } catch (err) {
      showError(err.response?.data?.message || 'Gagal mengupdate jumlah');
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveItem = async (itemId) => {
    showConfirm('Hapus item dari keranjang?', async () => {
      try {
        setUpdating(itemId);
        await api.delete(`/cart/${itemId}`);
        await fetchCart();
      } catch (err) {
        showError('Gagal menghapus item');
      } finally {
        setUpdating(null);
      }
    }, { title: 'Konfirmasi Hapus' });
  };

  const handleClearCart = async () => {
    showConfirm('Kosongkan semua item di keranjang?', async () => {
      try {
        setLoading(true);
        await api.delete('/cart');
        setCart({ items: [], total: 0 });
      } catch (err) {
        showError('Gagal mengosongkan keranjang');
      } finally {
        setLoading(false);
      }
    }, { title: 'Konfirmasi' });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value || 0);
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
        <h1 className="text-3xl font-bold mb-8">Keranjang Belanja</h1>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
            {error}
          </div>
        )}

        {cart.items.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-xl font-semibold mb-2">Keranjang Kosong</h2>
            <p className="text-gray-600 mb-6">Anda belum menambahkan produk apapun ke keranjang</p>
            <button
              onClick={() => navigate('/products')}
              className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800"
            >
              Mulai Belanja
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
                    <p className="text-sm text-gray-600">Ukuran: {item.size_name}</p>
                    <p className="font-bold text-lg mt-1">{formatCurrency(item.price)}</p>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={updating === item.id || item.quantity <= 1}
                        className="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">
                        {updating === item.id ? '...' : item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={updating === item.id || item.quantity >= item.stock_quantity}
                        className="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                      >
                        +
                      </button>
                      <span className="text-xs text-gray-500">
                        (Stok: {item.stock_quantity})
                      </span>
                    </div>
                  </div>
                  
                  {/* Item Total & Remove */}
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(item.price * item.quantity)}</p>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={updating === item.id}
                      className="text-red-600 text-sm mt-2 hover:underline disabled:opacity-50"
                    >
                      Hapus
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
                  Kosongkan Keranjang
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-4">
                <h2 className="text-xl font-bold mb-4">Ringkasan Pesanan</h2>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cart.items.length} item)</span>
                    <span>{formatCurrency(cart.total)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Ongkos Kirim</span>
                    <span>Dihitung saat checkout</span>
                  </div>
                </div>
                
                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(cart.total)}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800"
                >
                  Lanjut ke Checkout
                </button>
                
                <button
                  onClick={() => navigate('/products')}
                  className="w-full py-3 mt-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
                >
                  Lanjut Belanja
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
