import React, { useState } from 'react';
import { CreditCard, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useSettings } from '../utils/SettingsContext';
import { paymentAPI } from '../services/api';

// Load Midtrans Snap script
const loadMidtransScript = (clientKey, isProduction) => {
  return new Promise((resolve, reject) => {
    // Check if script already loaded
    if (window.snap) {
      resolve(window.snap);
      return;
    }

    const script = document.createElement('script');
    script.src = isProduction 
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', clientKey);
    script.onload = () => resolve(window.snap);
    script.onerror = () => reject(new Error('Failed to load Midtrans Snap'));
    document.head.appendChild(script);
  });
};

const MidtransPayment = ({ 
  orderId, 
  orderNumber,
  amount, 
  onSuccess, 
  onPending, 
  onError, 
  onClose 
}) => {
  const { midtransEnabled, midtransClientKey, isMidtransProduction } = useSettings();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, loading, success, pending, error

  // Create payment and get snap token
  const createPayment = async () => {
    try {
      setLoading(true);
      setError(null);
      setStatus('loading');

      const response = await paymentAPI.createPayment({
        order_id: orderId,
        payment_method: 'snap'
      });

      if (response.data.success) {
        setPaymentData(response.data.data);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to create payment');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Payment creation failed';
      setError(errorMessage);
      setStatus('error');
      onError && onError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Open Midtrans Snap popup
  const openSnapPopup = async () => {
    if (!midtransEnabled) {
      setError('Midtrans payment is not enabled');
      return;
    }

    if (!midtransClientKey) {
      setError('Midtrans client key not configured');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create payment first
      const payment = await createPayment();
      if (!payment || !payment.snap_token) {
        throw new Error('Failed to get payment token');
      }

      // Load Midtrans script
      const snap = await loadMidtransScript(midtransClientKey, isMidtransProduction);

      // Open Snap popup
      snap.pay(payment.snap_token, {
        onSuccess: (result) => {
          console.log('Payment success:', result);
          setStatus('success');
          onSuccess && onSuccess(result);
        },
        onPending: (result) => {
          console.log('Payment pending:', result);
          setStatus('pending');
          onPending && onPending(result);
        },
        onError: (result) => {
          console.log('Payment error:', result);
          setStatus('error');
          setError('Payment failed');
          onError && onError(result);
        },
        onClose: () => {
          console.log('Snap popup closed');
          onClose && onClose();
        }
      });
    } catch (err) {
      console.error('Snap error:', err);
      setError(err.message || 'Failed to open payment');
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  // Redirect to Midtrans payment page (alternative method)
  const redirectToPayment = async () => {
    try {
      setLoading(true);
      setError(null);

      const payment = await createPayment();
      if (payment && payment.payment_url) {
        window.location.href = payment.payment_url;
      } else {
        throw new Error('No payment URL available');
      }
    } catch (err) {
      setError(err.message || 'Failed to redirect to payment');
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Render status icon
  const renderStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'pending':
        return <AlertCircle className="w-16 h-16 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-16 h-16 text-red-500" />;
      default:
        return <CreditCard className="w-16 h-16 text-blue-500" />;
    }
  };

  // If Midtrans not enabled, show message
  if (!midtransEnabled) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-700 text-sm">
          Pembayaran online tidak tersedia saat ini. Silakan gunakan metode pembayaran lain.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        {renderStatusIcon()}
        
        {status === 'success' && (
          <div className="mt-4">
            <h3 className="text-xl font-semibold text-green-600">Pembayaran Berhasil!</h3>
            <p className="text-gray-600 mt-2">Terima kasih atas pembayaran Anda.</p>
          </div>
        )}

        {status === 'pending' && (
          <div className="mt-4">
            <h3 className="text-xl font-semibold text-yellow-600">Menunggu Pembayaran</h3>
            <p className="text-gray-600 mt-2">Silakan selesaikan pembayaran Anda.</p>
          </div>
        )}

        {status === 'error' && (
          <div className="mt-4">
            <h3 className="text-xl font-semibold text-red-600">Pembayaran Gagal</h3>
            <p className="text-gray-600 mt-2">{error || 'Terjadi kesalahan saat memproses pembayaran.'}</p>
          </div>
        )}
      </div>

      {status === 'idle' && (
        <>
          {/* Order Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Nomor Pesanan</span>
              <span className="font-medium">{orderNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Pembayaran</span>
              <span className="text-xl font-bold text-blue-600">{formatCurrency(amount)}</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Payment Buttons */}
          <div className="space-y-3">
            <button
              onClick={openSnapPopup}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Bayar Sekarang
                </>
              )}
            </button>

            <button
              onClick={redirectToPayment}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Buka Halaman Pembayaran
            </button>
          </div>

          {/* Payment Methods Info */}
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-gray-500 text-center">
              Pembayaran aman dengan Midtrans. Mendukung:
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-3">
              <span className="px-2 py-1 bg-gray-100 rounded text-xs">Credit Card</span>
              <span className="px-2 py-1 bg-gray-100 rounded text-xs">GoPay</span>
              <span className="px-2 py-1 bg-gray-100 rounded text-xs">OVO</span>
              <span className="px-2 py-1 bg-gray-100 rounded text-xs">Dana</span>
              <span className="px-2 py-1 bg-gray-100 rounded text-xs">BCA VA</span>
              <span className="px-2 py-1 bg-gray-100 rounded text-xs">Mandiri</span>
              <span className="px-2 py-1 bg-gray-100 rounded text-xs">BNI VA</span>
              <span className="px-2 py-1 bg-gray-100 rounded text-xs">QRIS</span>
            </div>
          </div>
        </>
      )}

      {/* Retry button for error state */}
      {status === 'error' && (
        <button
          onClick={() => {
            setStatus('idle');
            setError(null);
          }}
          className="w-full mt-4 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
        >
          Coba Lagi
        </button>
      )}
    </div>
  );
};

export default MidtransPayment;
