import React, { useEffect, useState, Component } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import apiClient from '../services/api';
import { getImageUrl } from '../utils/imageUtils';

// Helper function to safely format currency
const formatCurrency = (value) => {
  const num = parseFloat(value) || 0;
  return num.toLocaleString('id-ID');
};

// Error Boundary Component
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('OrderDetail Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold mb-4">Terjadi Kesalahan</h1>
            <p className="text-gray-600 mb-4">Gagal memuat halaman pesanan</p>
            <Link
              to="/orders"
              className="inline-block bg-black text-white px-6 py-3 rounded hover:bg-gray-900"
            >
              Kembali ke Daftar Pesanan
            </Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function OrderDetailContent() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      
      try {
        setLoading(true);
        setError('');
        const response = await apiClient.get(`/orders/${orderId}`);
        if (response.data.success && response.data.data) {
          setOrder(response.data.data);
        } else {
          setError('Data pesanan tidak valid');
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        if (err.response?.status === 404) {
          setError('Pesanan tidak ditemukan');
        } else if (err.response?.status === 401) {
          setError('Silakan login untuk melihat pesanan');
        } else {
          setError(err.response?.data?.message || 'Gagal memuat data pesanan');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [orderId]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Menunggu Konfirmasi' },
      confirmed: { color: 'bg-blue-100 text-blue-800', label: 'Dikonfirmasi' },
      processing: { color: 'bg-purple-100 text-purple-800', label: 'Diproses' },
      shipped: { color: 'bg-indigo-100 text-indigo-800', label: 'Dikirim' },
      delivered: { color: 'bg-green-100 text-green-800', label: 'Selesai' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Dibatalkan' }
    };
    return statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
  };

  const getPaymentBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Belum Bayar' },
      paid: { color: 'bg-green-100 text-green-800', label: 'Lunas' },
      failed: { color: 'bg-red-100 text-red-800', label: 'Gagal' },
      refunded: { color: 'bg-gray-100 text-gray-800', label: 'Refund' }
    };
    return statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
  };

  const getStatusStep = (status) => {
    const steps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    return steps.indexOf(status);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">Pesanan Tidak Ditemukan</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            to="/orders"
            className="inline-block bg-black text-white px-6 py-3 rounded hover:bg-gray-900"
          >
            Kembali ke Daftar Pesanan
          </Link>
        </div>
      </div>
    );
  }

  const statusBadge = getStatusBadge(order.status);
  const paymentBadge = getPaymentBadge(order.payment_status);
  const currentStep = getStatusStep(order.status);

  return (
    <>
      <Helmet>
        <title>{`Order ${order.order_number || '#' + order.id} - Marketplace Jeans`}</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
            <div>
              <Link to="/orders" className="text-blue-600 hover:underline mb-2 inline-block">
                ← Kembali ke Daftar Pesanan
              </Link>
              <h1 className="text-3xl font-bold">Order {order.order_number || `#${order.id}`}</h1>
              <p className="text-gray-600">
                {new Date(order.created_at).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className="flex gap-2">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${statusBadge.color}`}>
                {statusBadge.label}
              </span>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${paymentBadge.color}`}>
                {paymentBadge.label}
              </span>
            </div>
          </div>

          {/* Order Progress */}
          {order.status !== 'cancelled' && (
            <div className="bg-white rounded shadow p-6 mb-6">
              <h2 className="font-bold mb-4">Status Pesanan</h2>
              <div className="flex justify-between items-center relative">
                {/* Progress Line */}
                <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200">
                  <div
                    className="h-full bg-green-500 transition-all duration-500"
                    style={{ width: `${(currentStep / 4) * 100}%` }}
                  />
                </div>

                {/* Steps */}
                {['Menunggu', 'Dikonfirmasi', 'Diproses', 'Dikirim', 'Selesai'].map((label, idx) => (
                  <div key={idx} className="relative z-10 flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                        ${idx <= currentStep ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                    >
                      {idx < currentStep ? '✓' : idx + 1}
                    </div>
                    <span className="text-xs mt-2 text-center">{label}</span>
                  </div>
                ))}
              </div>

              {order.tracking_number && (
                <div className="mt-6 p-4 bg-blue-50 rounded">
                  <p className="font-semibold">Nomor Resi: {order.tracking_number}</p>
                  <p className="text-sm text-gray-600">
                    Pengiriman: {order.shipping_method}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded shadow p-6">
                <h2 className="font-bold mb-4">Produk yang Dipesan</h2>
                <div className="space-y-4">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex gap-4 pb-4 border-b last:border-0">
                      <img
                        src={getImageUrl(item.product_image, 'product')}
                        alt={item.product_name || 'Product'}
                        className="w-20 h-20 object-cover rounded bg-gray-100"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/80x80?text=No+Image';
                        }}
                      />
                      <div className="flex-1">
                        <Link
                          to={`/products/${item.product_slug}`}
                          className="font-semibold hover:text-blue-600"
                        >
                          {item.product_name}
                        </Link>
                        {item.size_name && (
                          <p className="text-sm text-gray-600">Size: {item.size_name}</p>
                        )}
                        <p className="text-sm text-gray-600">
                          {item.quantity}x @ Rp {formatCurrency(item.price)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          Rp {formatCurrency(item.total)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1 space-y-6">
              {/* Payment Summary */}
              <div className="bg-white rounded shadow p-6">
                <h2 className="font-bold mb-4">Ringkasan Pembayaran</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>Rp {formatCurrency(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ongkos Kirim</span>
                    <span>Rp {formatCurrency(order.shipping_cost)}</span>
                  </div>
                  {parseFloat(order.discount_amount || 0) > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Diskon</span>
                      <span>-Rp {formatCurrency(order.discount_amount)}</span>
                    </div>
                  )}
                  {parseFloat(order.tax || 0) > 0 && (
                    <div className="flex justify-between">
                      <span>PPN (11%)</span>
                      <span>Rp {formatCurrency(order.tax)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                    <span>Total</span>
                    <span className="text-red-600">
                      Rp {formatCurrency(order.total)}
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600">Metode Pembayaran</p>
                  <p className="font-semibold">{order.payment_method || 'Bank Transfer'}</p>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="bg-white rounded shadow p-6">
                <h2 className="font-bold mb-4">Alamat Pengiriman</h2>
                <div className="text-sm">
                  <p className="font-semibold">{order.customer_name || '-'}</p>
                  <p>{order.customer_phone || '-'}</p>
                  <p className="mt-2">{order.shipping_address || '-'}</p>
                  <p>
                    {order.shipping_city || ''}
                    {order.shipping_province && `, ${order.shipping_province}`}
                    {order.shipping_postal_code && ` ${order.shipping_postal_code}`}
                  </p>
                </div>
              </div>

              {/* Notes */}
              {order.notes && (
                <div className="bg-white rounded shadow p-6">
                  <h2 className="font-bold mb-4">Catatan</h2>
                  <p className="text-sm text-gray-600">{order.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-center gap-4">
            {order.tracking_number && (
              <Link
                to={`/orders/${order.id}/tracking`}
                className="px-6 py-3 border-2 border-black text-black rounded hover:bg-gray-100 font-semibold"
              >
                Lacak Pengiriman
              </Link>
            )}
            <Link
              to="/products"
              className="px-6 py-3 bg-black text-white rounded hover:bg-gray-900 font-semibold"
            >
              Belanja Lagi
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

// Wrap the component with ErrorBoundary
export default function OrderDetail() {
  return (
    <ErrorBoundary>
      <OrderDetailContent />
    </ErrorBoundary>
  );
}
