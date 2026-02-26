import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useSelector } from 'react-redux';
import apiClient from '../services/api';
import { getImageUrl } from '../utils/imageUtils';
import { useLanguage } from '../utils/i18n';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { t, formatCurrency } = useLanguage();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/orders');
      return;
    }
    fetchOrders();
  }, [isAuthenticated, statusFilter, currentPage]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const params = { page: currentPage, limit: itemsPerPage };
      if (statusFilter !== 'all') params.status = statusFilter;
      
      const response = await apiClient.get('/orders', { params });
      
      if (response.data.success) {
        setOrders(response.data.data || []);
        setTotalPages(response.data.pagination?.pages || 1);
      } else {
        setOrders([]);
        setError(response.data.message || t('failedToLoadOrders'));
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setOrders([]);
      if (err.response?.status === 401) {
        setError(t('sessionExpired'));
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(t('failedToLoadOrders'));
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: t('pending') },
      confirmed: { color: 'bg-blue-100 text-blue-800', label: t('confirmed') },
      processing: { color: 'bg-purple-100 text-purple-800', label: t('processing') },
      shipped: { color: 'bg-indigo-100 text-indigo-800', label: t('shipped') },
      delivered: { color: 'bg-green-100 text-green-800', label: t('delivered') },
      cancelled: { color: 'bg-red-100 text-red-800', label: t('cancelled') }
    };
    return statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
  };

  const getPaymentBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: t('unpaid') },
      paid: { color: 'bg-green-100 text-green-800', label: t('paid') },
      failed: { color: 'bg-red-100 text-red-800', label: t('paymentFailed') },
      refunded: { color: 'bg-gray-100 text-gray-800', label: t('refunded') }
    };
    return statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>{t('myOrders')} - Marketplace Jeans</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{t('myOrders')}</h1>
            <p className="text-gray-600">{t('myOrdersSubtitle')}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded">{error}</div>
          )}

          {/* Filter */}
          <div className="mb-6 bg-white p-4 rounded shadow">
            <label className="block text-sm font-semibold mb-2">{t('filterStatus')}</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full md:w-64 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="all">{t('allStatus')}</option>
              <option value="pending">{t('pending')}</option>
              <option value="confirmed">{t('confirmed')}</option>
              <option value="processing">{t('processing')}</option>
              <option value="shipped">{t('shipped')}</option>
              <option value="delivered">{t('delivered')}</option>
              <option value="cancelled">{t('cancelled')}</option>
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => {
                const statusBadge = getStatusBadge(order.status);
                const paymentBadge = getPaymentBadge(order.payment_status);
                
                return (
                  <div key={order.id} className="bg-white rounded shadow overflow-hidden">
                    {/* Header */}
                    <div className="p-4 border-b bg-gray-50 flex flex-wrap justify-between items-center gap-2">
                      <div className="flex items-center gap-4">
                        <span className="font-bold">{order.order_number || `Order #${order.id}`}</span>
                        <span className="text-sm text-gray-600">
                          {new Date(order.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge.color}`}>
                          {statusBadge.label}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${paymentBadge.color}`}>
                          {paymentBadge.label}
                        </span>
                      </div>
                    </div>

                    {/* Items Preview */}
                    <div className="p-4">
                      {order.items?.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 mb-3">
                          <img
                            src={getImageUrl(item.product_image, 'product')}
                            alt={item.product_name || 'Product'}
                            className="w-16 h-16 object-cover rounded bg-gray-100"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/64x64?text=No+Image';
                            }}
                          />
                          <div className="flex-1">
                            <p className="font-semibold">{item.product_name}</p>
                            <p className="text-sm text-gray-600">
                              {item.size_name && `${t('size')}: ${item.size_name} • `}
                              {item.quantity}x @ {formatCurrency(parseFloat(item.price))}
                            </p>
                          </div>
                          <p className="font-semibold">
                            {formatCurrency(parseFloat(item.total))}
                          </p>
                        </div>
                      ))}
                      {order.items?.length > 2 && (
                        <p className="text-sm text-gray-600">
                          +{order.items.length - 2} {t('moreProducts')}
                        </p>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">{t('totalPayment')}</p>
                        <p className="text-xl font-bold text-red-600">
                          {formatCurrency(parseFloat(order.total))}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {order.tracking_number && (
                          <Link
                            to={`/orders/${order.id}/tracking`}
                            className="px-4 py-2 border border-black text-black rounded hover:bg-gray-100 text-sm font-semibold"
                          >
                            {t('trackOrderBtn')}
                          </Link>
                        )}
                        <Link
                          to={`/orders/${order.id}`}
                          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-900 text-sm font-semibold"
                        >
                          {t('viewDetails')}
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 py-4">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-200 text-black rounded disabled:opacity-50"
                  >
                    {t('previous')}
                  </button>
                  <span className="px-4 py-2">
                    {t('page')} {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-200 text-black rounded disabled:opacity-50"
                  >
                    {t('next')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded shadow">
              <svg
                className="mx-auto h-16 w-16 text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('noOrders')}</h3>
              <p className="text-gray-600 mb-4">{t('emptyOrders')}</p>
              <Link
                to="/products"
                className="inline-block bg-black text-white px-6 py-3 rounded hover:bg-gray-900 font-semibold"
              >
                {t('startShopping')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
