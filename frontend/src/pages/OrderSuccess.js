import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { FaCheckCircle, FaQrcode, FaFilePdf, FaCopy, FaTruck, FaSpinner, FaDownload, FaCreditCard } from 'react-icons/fa';
import api from '../services/api';
import MidtransPayment from '../components/MidtransPayment';
import { useSettings } from '../utils/SettingsContext';
import { getImageUrl } from '../utils/imageUtils';

export default function OrderSuccess() {
  const { orderId } = useParams();
  const location = useLocation();
  const { midtransEnabled, getSetting } = useSettings();
  const [order, setOrder] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/${orderId}`);
      if (response.data.success) {
        setOrder(response.data.data);
        // Fetch QR code
        fetchQRCode(response.data.data.unique_token || orderId);
      }
    } catch (err) {
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQRCode = async (tokenOrId) => {
    try {
      const response = await api.get(`/orders/${tokenOrId}/qrcode-data`);
      if (response.data.success) {
        setQrCode(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching QR code:', err);
    }
  };

  const copyTrackingUrl = () => {
    const url = qrCode?.tracking_url || `${window.location.origin}/order/${order?.unique_token}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQRCode = async () => {
    try {
      const response = await api.get(`/orders/${order?.unique_token || orderId}/qrcode`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `qr-${order?.order_number || orderId}.png`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading QR code:', err);
    }
  };

  const downloadInvoice = async () => {
    setDownloadingPdf(true);
    try {
      const response = await api.get(`/orders/${order?.unique_token || orderId}/invoice`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${order?.order_number || orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading invoice:', err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Memuat detail pesanan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Success Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaCheckCircle className="text-5xl text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Pesanan Berhasil!</h1>
          <p className="text-gray-600 mb-4">
            Terima kasih telah berbelanja. Pesanan Anda sedang diproses.
          </p>
          
          {order && (
            <div className="bg-gray-50 rounded-lg p-4 inline-block">
              <p className="text-sm text-gray-500">No. Pesanan</p>
              <p className="text-2xl font-bold text-gray-800">{order.order_number}</p>
              {order.total && (
                <p className="text-lg text-green-600 font-semibold mt-2">
                  Total: {formatCurrency(order.total)}
                </p>
              )}
            </div>
          )}
        </div>

        {/* QR Code Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FaQrcode className="text-2xl text-purple-600" />
            <h2 className="text-xl font-bold text-gray-800">QR Code Pesanan</h2>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-6">
            {qrCode?.qr_code ? (
              <div className="flex-shrink-0">
                <img 
                  src={qrCode.qr_code} 
                  alt="QR Code Pesanan" 
                  className="w-48 h-48 border-4 border-gray-200 rounded-lg"
                />
              </div>
            ) : (
              <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                <FaSpinner className="animate-spin text-2xl text-gray-400" />
              </div>
            )}
            
            <div className="flex-1 text-center md:text-left">
              <p className="text-gray-600 mb-3">
                Scan QR code ini atau bagikan link di bawah untuk melacak pesanan
              </p>
              
              {qrCode?.tracking_url && (
                <div className="bg-gray-100 rounded-lg p-3 break-all text-sm text-gray-700 mb-4">
                  {qrCode.tracking_url}
                </div>
              )}
              
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <button
                  onClick={copyTrackingUrl}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm"
                >
                  <FaCopy />
                  {copied ? 'Tersalin!' : 'Salin Link'}
                </button>
                
                <button
                  onClick={downloadQRCode}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm"
                >
                  <FaDownload />
                  Download QR
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Midtrans Payment Section - Show if payment is pending and Midtrans enabled */}
        {order && order.payment_status === 'pending' && midtransEnabled && order.payment_method === 'midtrans' && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <FaCreditCard className="text-2xl text-blue-600" />
              <h2 className="text-xl font-bold text-gray-800">Pembayaran Online</h2>
            </div>
            
            {showPayment ? (
              <MidtransPayment
                orderId={order.id}
                orderNumber={order.order_number}
                amount={order.total || order.total_amount}
                onSuccess={(result) => {
                  fetchOrderDetails();
                  setShowPayment(false);
                }}
                onPending={(result) => {
                  fetchOrderDetails();
                }}
                onError={(error) => {
                  console.error('Payment error:', error);
                }}
                onClose={() => {
                  setShowPayment(false);
                }}
              />
            ) : (
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Klik tombol di bawah untuk melakukan pembayaran online dengan berbagai metode pembayaran.
                </p>
                <button
                  onClick={() => setShowPayment(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  <FaCreditCard className="inline mr-2" />
                  Bayar Sekarang
                </button>
              </div>
            )}
          </div>
        )}

        {/* Bank Transfer Info - Show if payment method is bank_transfer */}
        {order && order.payment_status === 'pending' && (order.payment_method === 'bank_transfer' || order.payment?.payment_method === 'bank_transfer') && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Instruksi Pembayaran</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 mb-3">
                Silakan transfer ke rekening berikut:
              </p>
              <div className="bg-white rounded p-3 space-y-1">
                <p><strong>Bank:</strong> {getSetting('payment_bank_name', '-')}</p>
                <p className="text-lg"><strong>No. Rekening:</strong> <span className="font-mono font-bold">{getSetting('payment_bank_account', '-')}</span></p>
                <p><strong>Atas Nama:</strong> {getSetting('payment_bank_holder', '-')}</p>
                <p className="text-lg font-bold text-blue-600 mt-2">
                  Total: {formatCurrency(order.total || order.total_amount)}
                </p>
              </div>
            </div>
            {order.payment?.payment_proof && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-semibold mb-2">Bukti Pembayaran Telah Diunggah</p>
                <img 
                  src={getImageUrl(order.payment.payment_proof)}
                  alt="Bukti pembayaran" 
                  className="max-h-64 rounded shadow"
                />
              </div>
            )}
          </div>
        )}

        {/* Actions Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Tindakan</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={downloadInvoice}
              disabled={downloadingPdf}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
            >
              {downloadingPdf ? (
                <><FaSpinner className="animate-spin" /> Mengunduh...</>
              ) : (
                <><FaFilePdf /> Download Invoice PDF</>
              )}
            </button>
            
            <Link
              to={order?.unique_token ? `/order/${order.unique_token}` : `/orders/track/${order?.order_number}`}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <FaTruck />
              Lacak Pesanan
            </Link>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-yellow-800 mb-2">Apa selanjutnya?</h3>
          <ul className="text-yellow-700 text-sm space-y-2">
            <li>• Pesanan Anda saat ini berstatus <strong>Pending</strong> dan menunggu pembayaran</li>
            <li>• Setelah pembayaran dikonfirmasi, pesanan akan diproses</li>
            <li>• Simpan QR code atau link tracking untuk memantau pesanan kapan saja</li>
            <li>• Anda akan menerima update status pesanan melalui email</li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="text-center space-x-4">
          <Link
            to="/orders"
            className="inline-block px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
          >
            Lihat Semua Pesanan
          </Link>
          <Link
            to="/products"
            className="inline-block px-6 py-3 bg-white text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Lanjut Belanja
          </Link>
        </div>
      </div>
    </div>
  );
}
