import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaSearch, FaBox, FaTruck, FaCheckCircle, FaTimesCircle, FaClock,
  FaMapMarkerAlt, FaUser, FaPhone, FaCalendarAlt, FaReceipt, FaSpinner
} from 'react-icons/fa';
import api from '../services/api';

const STATUS_CONFIG = {
  pending: { icon: FaClock, color: 'text-yellow-500', bg: 'bg-yellow-100', label: 'Menunggu' },
  confirmed: { icon: FaCheckCircle, color: 'text-blue-500', bg: 'bg-blue-100', label: 'Dikonfirmasi' },
  processing: { icon: FaBox, color: 'text-indigo-500', bg: 'bg-indigo-100', label: 'Diproses' },
  packed: { icon: FaBox, color: 'text-purple-500', bg: 'bg-purple-100', label: 'Dikemas' },
  shipped: { icon: FaTruck, color: 'text-cyan-500', bg: 'bg-cyan-100', label: 'Dikirim' },
  in_transit: { icon: FaTruck, color: 'text-orange-500', bg: 'bg-orange-100', label: 'Dalam Perjalanan' },
  out_for_delivery: { icon: FaTruck, color: 'text-teal-500', bg: 'bg-teal-100', label: 'Sedang Diantar' },
  delivered: { icon: FaCheckCircle, color: 'text-green-500', bg: 'bg-green-100', label: 'Diterima' },
  cancelled: { icon: FaTimesCircle, color: 'text-red-500', bg: 'bg-red-100', label: 'Dibatalkan' }
};

export default function OrderTracking() {
  const { trackingNumber } = useParams();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState(trackingNumber || '');
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (trackingNumber) {
      fetchTracking(trackingNumber);
    }
  }, [trackingNumber]);

  const fetchTracking = async (orderNumber) => {
    if (!orderNumber.trim()) return;
    
    setLoading(true);
    setError('');
    setSearched(true);
    
    try {
      const response = await api.get(`/tracking/${orderNumber.trim()}`);
      if (response.data.success) {
        setOrderData(response.data.data);
      } else {
        setError(response.data.message || 'Pesanan tidak ditemukan');
        setOrderData(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Pesanan tidak ditemukan. Pastikan nomor pesanan benar.');
      setOrderData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/orders/track/${searchQuery.trim()}`);
      fetchTracking(searchQuery.trim());
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusConfig = (status) => {
    return STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  };

  const getCurrentStatus = () => {
    if (!orderData?.order?.status) return null;
    return getStatusConfig(orderData.order.status);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Lacak Pesanan Anda</h1>
          <p className="text-gray-600">Masukkan nomor pesanan untuk melihat status pengiriman</p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Masukkan Nomor Pesanan (contoh: ORD-20241225-XXXX)"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !searchQuery.trim()}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Mencari...
                </>
              ) : (
                <>
                  <FaSearch />
                  Lacak
                </>
              )}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && searched && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 text-center">
            <FaTimesCircle className="text-red-500 text-4xl mx-auto mb-3" />
            <p className="text-red-700 font-medium">{error}</p>
            <p className="text-red-600 text-sm mt-2">
              Pastikan nomor pesanan yang Anda masukkan benar dan lengkap.
            </p>
          </div>
        )}

        {/* Order Data */}
        {orderData && (
          <>
            {/* Status Banner */}
            <div className={`${getCurrentStatus()?.bg} rounded-xl p-6 mb-8`}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  {getCurrentStatus() && (
                    <div className={`w-16 h-16 ${getCurrentStatus().bg} rounded-full flex items-center justify-center border-4 border-white shadow-lg`}>
                      {React.createElement(getCurrentStatus().icon, { 
                        className: `text-3xl ${getCurrentStatus().color}` 
                      })}
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Status Pesanan</p>
                    <p className={`text-2xl font-bold ${getCurrentStatus()?.color}`}>
                      {getCurrentStatus()?.label}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">No. Pesanan</p>
                  <p className="text-xl font-bold text-gray-800">{orderData.order.order_number}</p>
                  {orderData.order.tracking_number && (
                    <p className="text-sm text-gray-600 mt-1">
                      Resi: <span className="font-medium">{orderData.order.tracking_number}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Tracking Timeline */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <FaTruck className="text-blue-500" />
                    Riwayat Pengiriman
                  </h2>
                  
                  {orderData.tracking && orderData.tracking.length > 0 ? (
                    <div className="relative">
                      {/* Timeline line */}
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                      
                      {orderData.tracking.map((track, index) => {
                        const config = getStatusConfig(track.status);
                        const isFirst = index === 0;
                        
                        return (
                          <div key={track.id || index} className="relative pl-12 pb-8 last:pb-0">
                            {/* Timeline dot */}
                            <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${isFirst ? config.bg : 'bg-gray-100'} border-4 border-white shadow`}>
                              {React.createElement(config.icon, { 
                                className: `text-sm ${isFirst ? config.color : 'text-gray-400'}` 
                              })}
                            </div>
                            
                            {/* Content */}
                            <div className={`${isFirst ? 'bg-gray-50' : ''} rounded-lg p-4 -mt-1`}>
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <h3 className={`font-semibold ${isFirst ? 'text-gray-900' : 'text-gray-600'}`}>
                                    {track.title}
                                  </h3>
                                  {track.description && (
                                    <p className="text-gray-600 text-sm mt-1">{track.description}</p>
                                  )}
                                  {track.location && (
                                    <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
                                      <FaMapMarkerAlt className="text-xs" />
                                      {track.location}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right text-sm text-gray-500 whitespace-nowrap">
                                  {formatDate(track.created_at)}
                                </div>
                              </div>
                              {track.updated_by && (
                                <p className="text-xs text-gray-400 mt-2">
                                  Diupdate oleh: {track.updated_by}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FaClock className="text-4xl mx-auto mb-3 text-gray-400" />
                      <p>Belum ada riwayat pengiriman</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="space-y-6">
                {/* Shipping Info */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-red-500" />
                    Alamat Pengiriman
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-gray-800 flex items-center gap-2">
                      <FaUser className="text-gray-400" />
                      {orderData.order.customer_name}
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                      {orderData.order.shipping_address}
                    </p>
                    <p className="text-gray-600">
                      {orderData.order.shipping_city}, {orderData.order.shipping_province}
                    </p>
                    {orderData.order.courier && (
                      <p className="text-gray-600 mt-3 pt-3 border-t">
                        <span className="font-medium">Kurir:</span> {orderData.order.courier.toUpperCase()}
                        {orderData.order.shipping_method && ` - ${orderData.order.shipping_method}`}
                      </p>
                    )}
                    {orderData.order.warehouse_name && (
                      <p className="text-gray-500 text-xs mt-2">
                        Dikirim dari: {orderData.order.warehouse_name} ({orderData.order.warehouse_city})
                      </p>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FaBox className="text-blue-500" />
                    Produk Dipesan
                  </h3>
                  <div className="space-y-3">
                    {orderData.items && orderData.items.map((item, index) => (
                      <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                        {item.product_image && (
                          <img 
                            src={item.product_image} 
                            alt={item.product_name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">{item.product_name}</p>
                          <p className="text-sm text-gray-500">
                            {item.size_name && `Ukuran: ${item.size_name}`} • Qty: {item.quantity}
                          </p>
                          <p className="text-sm font-medium text-gray-700">
                            {formatCurrency(item.price)} x {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FaReceipt className="text-green-500" />
                    Ringkasan Pembayaran
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">{formatCurrency(orderData.order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ongkos Kirim</span>
                      <span className="font-medium">{formatCurrency(orderData.order.shipping_cost)}</span>
                    </div>
                    {orderData.order.tax > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pajak</span>
                        <span className="font-medium">{formatCurrency(orderData.order.tax)}</span>
                      </div>
                    )}
                    {orderData.order.discount_amount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Diskon</span>
                        <span>-{formatCurrency(orderData.order.discount_amount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-3 mt-3 border-t border-gray-200">
                      <span className="font-bold text-gray-800">Total</span>
                      <span className="font-bold text-lg text-blue-600">{formatCurrency(orderData.order.total)}</span>
                    </div>
                  </div>
                  
                  {/* Order Date */}
                  <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-2 text-sm text-gray-500">
                    <FaCalendarAlt />
                    Tanggal Pesanan: {formatDate(orderData.order.created_at)}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Initial State - No search yet */}
        {!orderData && !error && !loading && !searched && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <FaTruck className="text-6xl text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Lacak Pesanan Anda</h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Masukkan nomor pesanan Anda di kotak pencarian di atas untuk melihat status pengiriman secara real-time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
