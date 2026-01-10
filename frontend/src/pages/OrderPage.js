import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  FaBox, FaTruck, FaCheckCircle, FaTimesCircle, FaClock,
  FaMapMarkerAlt, FaUser, FaPhone, FaCalendarAlt, FaReceipt, 
  FaSpinner, FaQrcode, FaDownload, FaFilePdf, FaCopy, FaCheck
} from 'react-icons/fa';
import api from '../services/api';

const STATUS_CONFIG = {
  pending: { icon: FaClock, color: 'text-yellow-500', bg: 'bg-yellow-100', label: 'Menunggu Persetujuan' },
  confirmed: { icon: FaCheckCircle, color: 'text-blue-500', bg: 'bg-blue-100', label: 'Dikonfirmasi' },
  processing: { icon: FaBox, color: 'text-indigo-500', bg: 'bg-indigo-100', label: 'Diproses' },
  packed: { icon: FaBox, color: 'text-purple-500', bg: 'bg-purple-100', label: 'Dikemas' },
  shipped: { icon: FaTruck, color: 'text-cyan-500', bg: 'bg-cyan-100', label: 'Dikirim' },
  in_transit: { icon: FaTruck, color: 'text-orange-500', bg: 'bg-orange-100', label: 'Dalam Perjalanan' },
  out_for_delivery: { icon: FaTruck, color: 'text-teal-500', bg: 'bg-teal-100', label: 'Sedang Diantar' },
  delivered: { icon: FaCheckCircle, color: 'text-green-500', bg: 'bg-green-100', label: 'Diterima' },
  cancelled: { icon: FaTimesCircle, color: 'text-red-500', bg: 'bg-red-100', label: 'Dibatalkan' }
};

export default function OrderPage() {
  const { token } = useParams();
  
  const [orderData, setOrderData] = useState(null);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    if (token) {
      fetchOrder();
    }
  }, [token]);

  const fetchOrder = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await api.get(`/orders/track/${token}`);
      if (response.data.success) {
        setOrderData(response.data.data);
        // Fetch QR code data
        fetchQRCode();
      } else {
        setError(response.data.message || 'Pesanan tidak ditemukan');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Pesanan tidak ditemukan');
    } finally {
      setLoading(false);
    }
  };

  const fetchQRCode = async () => {
    try {
      const response = await api.get(`/orders/${token}/qrcode-data`);
      if (response.data.success) {
        setQrCodeData(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching QR code:', err);
    }
  };

  const downloadQRCode = async () => {
    try {
      const response = await api.get(`/orders/${token}/qrcode`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `qr-${orderData?.order?.order_number || 'order'}.png`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading QR code:', err);
      alert('Gagal mengunduh QR Code');
    }
  };

  const downloadInvoice = async () => {
    setDownloadingPdf(true);
    try {
      const response = await api.get(`/orders/${token}/invoice`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${orderData?.order?.order_number || 'order'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading invoice:', err);
      alert('Gagal mengunduh invoice');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const copyTrackingUrl = () => {
    if (qrCodeData?.tracking_url) {
      navigator.clipboard.writeText(qrCodeData.tracking_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Memuat data pesanan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <FaTimesCircle className="text-red-500 text-5xl mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Pesanan Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            to="/orders/track" 
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Cari Pesanan Lain
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Detail Pesanan</h1>
          <p className="text-gray-600">No. Pesanan: <span className="font-semibold">{orderData?.order?.order_number}</span></p>
        </div>

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
                    {orderData.order.status === 'pending' && (
                      <p className="text-sm text-yellow-700 mt-1">
                        Menunggu persetujuan admin untuk memproses pesanan
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Tanggal Pesanan</p>
                  <p className="font-medium text-gray-800">{formatDate(orderData.order.created_at)}</p>
                  {orderData.order.tracking_number && (
                    <p className="text-sm text-gray-600 mt-1">
                      Resi: <span className="font-medium">{orderData.order.tracking_number}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="flex flex-wrap gap-4 justify-center">
                <button
                  onClick={downloadInvoice}
                  disabled={downloadingPdf}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                >
                  {downloadingPdf ? <FaSpinner className="animate-spin" /> : <FaFilePdf />}
                  Download Invoice PDF
                </button>
                
                <button
                  onClick={downloadQRCode}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <FaDownload />
                  Download QR Code
                </button>

                <button
                  onClick={copyTrackingUrl}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                >
                  {copied ? <FaCheck /> : <FaCopy />}
                  {copied ? 'Tersalin!' : 'Salin Link'}
                </button>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Tracking & QR */}
              <div className="lg:col-span-2 space-y-8">
                {/* Tracking Timeline */}
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

                {/* QR Code Section */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <FaQrcode className="text-purple-500" />
                    QR Code Pesanan
                  </h2>
                  
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    {qrCodeData?.qr_code && (
                      <div className="flex-shrink-0">
                        <img 
                          src={qrCodeData.qr_code} 
                          alt="QR Code" 
                          className="w-48 h-48 border-4 border-gray-200 rounded-lg"
                        />
                      </div>
                    )}
                    <div className="flex-1 text-center md:text-left">
                      <p className="text-gray-600 mb-3">
                        Scan QR code ini untuk mengakses halaman tracking pesanan
                      </p>
                      <div className="bg-gray-100 rounded-lg p-3 break-all text-sm text-gray-700">
                        {qrCodeData?.tracking_url || `${window.location.origin}/order/${token}`}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Bagikan link ini kepada orang lain untuk melacak pesanan
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Order Details */}
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
                      {orderData.order.recipient_name || orderData.order.customer_name}
                    </p>
                    <p className="flex items-center gap-2 text-gray-600">
                      <FaPhone className="text-gray-400" />
                      {orderData.order.shipping_phone || orderData.order.customer_phone}
                    </p>
                    <p className="text-gray-600 leading-relaxed mt-2">
                      {orderData.order.full_address || orderData.order.shipping_address}
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
      </div>
    </div>
  );
}
