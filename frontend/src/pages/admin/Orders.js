import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import apiClient from '../../services/api';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Status update state
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, paymentFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (paymentFilter !== 'all') params.payment_status = paymentFilter;

      const response = await apiClient.get('/admin/orders', { params });
      setOrders(response.data.data || []);
      setError('');
    } catch (err) {
      setError('Failed to load orders: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, status) => {
    try {
      setUpdatingOrderId(orderId);
      await apiClient.patch(`/admin/orders/${orderId}/status`, { status });
      setSuccess('Status updated successfully!');
      
      // Update local state
      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status } : order
      ));
      
      setNewStatus('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update status: ' + err.message);
      console.error(err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handlePaymentStatusUpdate = async (orderId, paymentStatus) => {
    try {
      setUpdatingOrderId(orderId);
      await apiClient.patch(`/admin/orders/${orderId}/payment-status`, { payment_status: paymentStatus });
      setSuccess('Payment status updated successfully!');
      
      // Update local state
      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, payment_status: paymentStatus } : order
      ));
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update payment status: ' + err.message);
      console.error(err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = orders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(orders.length / itemsPerPage);

  const getStatusBadgeColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentBadgeColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <>
      <Helmet>
        <title>Admin Orders - Marketplace Jeans</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Order Management</h1>
            <p className="text-gray-600">Kelola semua pesanan pelanggan</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-100 text-green-700 rounded">
              {success}
            </div>
          )}

          {/* Filters */}
          <div className="mb-6 bg-white p-6 rounded shadow">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Status Pesanan</label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="all">Semua Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Status Pembayaran</label>
                <select
                  value={paymentFilter}
                  onChange={(e) => {
                    setPaymentFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="all">Semua Status</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : currentOrders.length > 0 ? (
            <div className="bg-white rounded shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Order ID</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Customer</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Total</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Payment</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrders.map((order) => (
                    <tr key={order.id} className="border-t hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold">#{order.id}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold">{order.customer_name || order.user?.name || 'Guest'}</p>
                          <p className="text-xs text-gray-600">{order.customer_email || order.user?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold">
                        Rp {order.total?.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded text-xs font-semibold ${getStatusBadgeColor(order.status)}`}>
                          {order.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded text-xs font-semibold ${getPaymentBadgeColor(order.payment_status)}`}>
                          {order.payment_status || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {new Date(order.created_at).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                          className="text-blue-600 hover:underline text-sm font-semibold"
                        >
                          {selectedOrder?.id === order.id ? 'Hide' : 'Details'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Selected Order Details */}
              {selectedOrder && (
                <div className="bg-gray-50 border-t p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Order Info */}
                    <div>
                      <h3 className="font-bold mb-4 uppercase">Order Info</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-semibold">ID:</span> #{selectedOrder.id}</p>
                        <p><span className="font-semibold">Date:</span> {new Date(selectedOrder.created_at).toLocaleString('id-ID')}</p>
                        <p><span className="font-semibold">Method:</span> {selectedOrder.shipping_method}</p>
                        <p><span className="font-semibold">Payment:</span> {selectedOrder.payment_method}</p>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div>
                      <h3 className="font-bold mb-4 uppercase">Customer</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-semibold">Name:</span> {selectedOrder.customer_name || selectedOrder.user?.name}</p>
                        <p><span className="font-semibold">Email:</span> {selectedOrder.customer_email || selectedOrder.user?.email}</p>
                        <p><span className="font-semibold">Phone:</span> {selectedOrder.customer_phone}</p>
                        <p><span className="font-semibold">Address:</span> {selectedOrder.shipping_address}</p>
                      </div>
                    </div>

                    {/* Status Controls */}
                    <div>
                      <h3 className="font-bold mb-4 uppercase">Update Status</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-semibold mb-2">Order Status</label>
                          <select
                            value={selectedOrder.status || 'pending'}
                            onChange={(e) => handleStatusUpdate(selectedOrder.id, e.target.value)}
                            disabled={updatingOrderId === selectedOrder.id}
                            className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2">Payment Status</label>
                          <select
                            value={selectedOrder.payment_status || 'pending'}
                            onChange={(e) => handlePaymentStatusUpdate(selectedOrder.id, e.target.value)}
                            disabled={updatingOrderId === selectedOrder.id}
                            className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="failed">Failed</option>
                            <option value="refunded">Refunded</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="font-bold mb-4 uppercase">Items</h3>
                    <div className="space-y-2">
                      {selectedOrder.items?.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{item.product?.name} x{item.quantity}</span>
                          <span className="font-semibold">
                            Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="mt-4 pt-4 border-t space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>Rp {selectedOrder.subtotal?.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>Rp {selectedOrder.shipping_cost?.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>Rp {selectedOrder.tax?.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base border-t pt-2">
                      <span>Total</span>
                      <span className="text-red-600">Rp {selectedOrder.total?.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded">
              <p className="text-gray-600">Tidak ada pesanan</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 text-black rounded disabled:opacity-50"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded ${
                    currentPage === page ? 'bg-black text-white' : 'bg-gray-200 text-black'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-200 text-black rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminOrders;
