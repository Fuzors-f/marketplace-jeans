import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import apiClient from '../../services/api';
import { FaEye, FaTimes, FaFilter } from 'react-icons/fa';
import DataTable from '../../components/admin/DataTable';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Status update state
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

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
      
      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status } : order
      ));
      
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status });
      }
      
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
      
      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, payment_status: paymentStatus } : order
      ));
      
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, payment_status: paymentStatus });
      }
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update payment status: ' + err.message);
      console.error(err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

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

  // DataTable columns configuration
  const columns = [
    {
      key: 'id',
      label: 'Order ID',
      sortable: true,
      render: (value) => <span className="font-semibold">#{value}</span>
    },
    {
      key: 'customer_name',
      label: 'Customer',
      sortable: true,
      render: (value, order) => (
        <div>
          <p className="font-semibold">{value || order.user?.name || 'Guest'}</p>
          <p className="text-xs text-gray-600">{order.customer_email || order.user?.email}</p>
        </div>
      )
    },
    {
      key: 'total',
      label: 'Total',
      sortable: true,
      render: (value) => <span className="font-semibold">Rp {value?.toLocaleString('id-ID')}</span>
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeColor(value)}`}>
          {value || 'pending'}
        </span>
      )
    },
    {
      key: 'payment_status',
      label: 'Payment',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${getPaymentBadgeColor(value)}`}>
          {value || 'pending'}
        </span>
      )
    },
    {
      key: 'created_at',
      label: 'Date',
      sortable: true,
      render: (value) => <span className="text-sm">{new Date(value).toLocaleDateString('id-ID')}</span>
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, order) => (
        <button
          onClick={() => setSelectedOrder(order)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded flex items-center gap-1"
          title="View Details"
        >
          <FaEye /> <span className="hidden sm:inline">Details</span>
        </button>
      )
    }
  ];

  // Mobile card renderer
  const renderMobileCard = (order) => (
    <div className="bg-white rounded-lg shadow p-4 mb-3">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-bold text-lg">#{order.id}</p>
          <p className="text-sm font-semibold">{order.customer_name || order.user?.name || 'Guest'}</p>
          <p className="text-xs text-gray-500">{order.customer_email || order.user?.email}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-green-600">Rp {order.total?.toLocaleString('id-ID')}</p>
          <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString('id-ID')}</p>
        </div>
      </div>
      <div className="flex gap-2 mb-3">
        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeColor(order.status)}`}>
          {order.status || 'pending'}
        </span>
        <span className={`px-2 py-1 rounded text-xs font-semibold ${getPaymentBadgeColor(order.payment_status)}`}>
          {order.payment_status || 'pending'}
        </span>
      </div>
      <div className="flex justify-end pt-3 border-t">
        <button
          onClick={() => setSelectedOrder(order)}
          className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm flex items-center gap-1"
        >
          <FaEye /> View Details
        </button>
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Admin Orders - Marketplace Jeans</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-4 lg:py-8">
          <div className="mb-6">
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">Order Management</h1>
            <p className="text-gray-600">Kelola semua pesanan pelanggan</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
              {success}
            </div>
          )}

          {/* Filters */}
          <div className="mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border rounded-lg mb-2"
            >
              <FaFilter /> Filter
            </button>
            <div className={`bg-white p-4 lg:p-6 rounded shadow ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Status Pesanan</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
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
                    onChange={(e) => setPaymentFilter(e.target.value)}
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
          </div>

          {/* DataTable */}
          <DataTable
            columns={columns}
            data={orders}
            loading={loading}
            renderMobileCard={renderMobileCard}
            searchable={true}
            defaultPageSize={10}
          />
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Order Details #{selectedOrder.id}</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="p-4 lg:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Order Info */}
                <div className="bg-gray-50 p-4 rounded">
                  <h3 className="font-bold mb-3 uppercase text-sm">Order Info</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-semibold">ID:</span> #{selectedOrder.id}</p>
                    <p><span className="font-semibold">Date:</span> {new Date(selectedOrder.created_at).toLocaleString('id-ID')}</p>
                    <p><span className="font-semibold">Method:</span> {selectedOrder.shipping_method}</p>
                    <p><span className="font-semibold">Payment:</span> {selectedOrder.payment_method}</p>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="bg-gray-50 p-4 rounded">
                  <h3 className="font-bold mb-3 uppercase text-sm">Customer</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-semibold">Name:</span> {selectedOrder.customer_name || selectedOrder.user?.name}</p>
                    <p><span className="font-semibold">Email:</span> {selectedOrder.customer_email || selectedOrder.user?.email}</p>
                    <p><span className="font-semibold">Phone:</span> {selectedOrder.customer_phone}</p>
                    <p><span className="font-semibold">Address:</span> {selectedOrder.shipping_address}</p>
                  </div>
                </div>

                {/* Status Controls */}
                <div className="bg-gray-50 p-4 rounded">
                  <h3 className="font-bold mb-3 uppercase text-sm">Update Status</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-semibold mb-1">Order Status</label>
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
                      <label className="block text-sm font-semibold mb-1">Payment Status</label>
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
              <div className="mb-6">
                <h3 className="font-bold mb-3 uppercase text-sm">Items</h3>
                <div className="bg-gray-50 rounded p-4 space-y-2">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm py-2 border-b last:border-0">
                      <span>{item.product?.name} x{item.quantity}</span>
                      <span className="font-semibold">
                        Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded p-4 space-y-2 text-sm">
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
          </div>
        </div>
      )}
    </>
  );
};

export default AdminOrders;
