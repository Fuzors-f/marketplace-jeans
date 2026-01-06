import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import apiClient from '../../services/api';
import { FaEye, FaTimes, FaFilter, FaPlus, FaSearch, FaTrash, FaUser, FaUserPlus } from 'react-icons/fa';
import DataTable from '../../components/admin/DataTable';
import { useLanguage } from '../../utils/i18n';

const AdminOrders = () => {
  const { t, formatCurrency, formatDate } = useLanguage();
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

  // Create order modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [searchProduct, setSearchProduct] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  
  // User selection state
  const [userMode, setUserMode] = useState('new'); // 'existing' or 'new'
  const [searchUser, setSearchUser] = useState('');
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchingUser, setSearchingUser] = useState(false);
  
  // Exchange rate state
  const [exchangeRate, setExchangeRate] = useState(16000); // Default IDR per USD
  
  const [newOrderData, setNewOrderData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    shipping_address: '',
    shipping_city: '',
    shipping_province: '',
    shipping_postal_code: '',
    shipping_country: 'Indonesia',
    shipping_method: 'JNE Regular',
    payment_method: 'bank_transfer',
    shipping_cost: 0,
    discount_amount: 0,
    notes: ''
  });

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, paymentFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (paymentFilter !== 'all') params.payment_status = paymentFilter;

      const response = await apiClient.get('/admin/orders', { params });
      setOrders(response.data.data || []);
    } catch (err) {
      console.error('Fetch orders error:', err);
      setError(t('error') + ': ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await apiClient.get('/products?limit=100&show_all=true');
      setProducts(response.data.data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  // Search users by name or email
  const handleSearchUser = async (search) => {
    setSearchUser(search);
    if (search.length >= 2) {
      setSearchingUser(true);
      try {
        const response = await apiClient.get(`/users/search?q=${encodeURIComponent(search)}`);
        setUserSearchResults(response.data.data || []);
      } catch (err) {
        console.error('Error searching users:', err);
        setUserSearchResults([]);
      } finally {
        setSearchingUser(false);
      }
    } else {
      setUserSearchResults([]);
    }
  };

  // Select existing user
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setNewOrderData({
      ...newOrderData,
      customer_name: user.full_name,
      customer_email: user.email,
      customer_phone: user.phone || ''
    });
    setSearchUser('');
    setUserSearchResults([]);
  };

  // Clear selected user
  const handleClearSelectedUser = () => {
    setSelectedUser(null);
    setNewOrderData({
      ...newOrderData,
      customer_name: '',
      customer_email: '',
      customer_phone: ''
    });
  };

  const handleSearchProduct = async (search) => {
    setSearchProduct(search);
    if (search.length >= 2) {
      const filtered = products.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku?.toLowerCase().includes(search.toLowerCase())
      );
      setSearchResults(filtered.slice(0, 10));
    } else {
      setSearchResults([]);
    }
  };

  const handleAddProduct = async (product) => {
    try {
      // Fetch variants for this product
      const response = await apiClient.get(`/products/${product.id}/variants`);
      const variants = response.data.data || [];
      
      if (variants.length === 0) {
        setError('Produk ini tidak memiliki varian. Tambahkan varian terlebih dahulu.');
        return;
      }

      // Add first variant by default
      const variant = variants[0];
      const existingItem = orderItems.find(item => item.variant_id === variant.id);
      
      if (existingItem) {
        setOrderItems(orderItems.map(item => 
          item.variant_id === variant.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      } else {
        setOrderItems([...orderItems, {
          product_id: product.id,
          variant_id: variant.id,
          product_name: product.name,
          size_name: variant.size_name,
          price: parseFloat(product.base_price) + parseFloat(variant.additional_price || 0),
          quantity: 1,
          stock: variant.stock_quantity,
          variants: variants
        }]);
      }
      
      setSearchProduct('');
      setSearchResults([]);
    } catch (err) {
      console.error('Error adding product:', err);
      setError('Gagal menambahkan produk');
    }
  };

  const handleUpdateItemVariant = (index, variantId) => {
    const item = orderItems[index];
    const variant = item.variants.find(v => v.id === parseInt(variantId));
    if (variant) {
      const newItems = [...orderItems];
      newItems[index] = {
        ...item,
        variant_id: variant.id,
        size_name: variant.size_name,
        price: parseFloat(item.price) - parseFloat(item.variants.find(v => v.id === item.variant_id)?.additional_price || 0) + parseFloat(variant.additional_price || 0),
        stock: variant.stock_quantity
      };
      setOrderItems(newItems);
    }
  };

  const handleUpdateItemQuantity = (index, quantity) => {
    const newItems = [...orderItems];
    newItems[index].quantity = Math.max(1, parseInt(quantity) || 1);
    setOrderItems(newItems);
  };

  const handleRemoveItem = (index) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const calculateOrderTotal = () => {
    const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = parseFloat(newOrderData.shipping_cost) || 0;
    const discount = parseFloat(newOrderData.discount_amount) || 0;
    const tax = subtotal * 0.11; // 11% PPN
    return {
      subtotal,
      shipping,
      discount,
      tax,
      total: subtotal + shipping + tax - discount
    };
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setError('');
    
    if (orderItems.length === 0) {
      setError('Tambahkan minimal 1 produk');
      return;
    }

    if (!newOrderData.customer_name || !newOrderData.customer_phone || !newOrderData.shipping_address) {
      setError('Nama, telepon, dan alamat wajib diisi');
      return;
    }

    // If creating new user, email is required
    if (userMode === 'new' && !selectedUser && newOrderData.customer_email) {
      // Will create new user
    }

    try {
      setCreateLoading(true);
      
      const isInternational = newOrderData.shipping_country && newOrderData.shipping_country !== 'Indonesia';
      
      const orderPayload = {
        ...newOrderData,
        user_id: selectedUser?.id || null,
        create_new_user: userMode === 'new' && !selectedUser && newOrderData.customer_email ? true : false,
        currency: isInternational ? 'USD' : 'IDR',
        exchange_rate: isInternational ? exchangeRate : null,
        items: orderItems.map(item => ({
          product_id: item.product_id,
          variant_id: item.variant_id,
          quantity: item.quantity,
          price: item.price
        }))
      };

      await apiClient.post('/admin/orders/manual', orderPayload);
      
      setSuccess(userMode === 'new' && !selectedUser && newOrderData.customer_email 
        ? 'Pesanan dan user baru berhasil dibuat!' 
        : 'Pesanan berhasil dibuat!');
      setShowCreateModal(false);
      resetCreateForm();
      fetchOrders();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal membuat pesanan');
    } finally {
      setCreateLoading(false);
    }
  };

  const resetCreateForm = () => {
    setNewOrderData({
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      shipping_address: '',
      shipping_city: '',
      shipping_province: '',
      shipping_postal_code: '',
      shipping_country: 'Indonesia',
      shipping_method: 'JNE Regular',
      payment_method: 'bank_transfer',
      shipping_cost: 0,
      discount_amount: 0,
      notes: ''
    });
    setOrderItems([]);
    setSearchProduct('');
    setSearchResults([]);
    setUserMode('new');
    setSelectedUser(null);
    setSearchUser('');
    setUserSearchResults([]);
  };

  const handleStatusUpdate = async (orderId, status) => {
    try {
      setUpdatingOrderId(orderId);
      await apiClient.patch(`/admin/orders/${orderId}/status`, { status });
      setSuccess(t('success') + '!');
      
      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status } : order
      ));
      
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status });
      }
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(t('error') + ': ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handlePaymentStatusUpdate = async (orderId, paymentStatus) => {
    try {
      setUpdatingOrderId(orderId);
      await apiClient.patch(`/admin/orders/${orderId}/payment-status`, { payment_status: paymentStatus });
      setSuccess(t('success') + '!');
      
      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, payment_status: paymentStatus } : order
      ));
      
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, payment_status: paymentStatus });
      }
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(t('error') + ': ' + (err.response?.data?.message || err.message));
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
      label: t('customer'),
      sortable: true,
      render: (value, order) => (
        <div>
          <p className="font-semibold">{value || order.user_name || t('guest')}</p>
          <p className="text-xs text-gray-600">{order.customer_email || order.user_email}</p>
        </div>
      )
    },
    {
      key: 'total',
      label: t('total'),
      sortable: true,
      render: (value) => <span className="font-semibold">{formatCurrency(value)}</span>
    },
    {
      key: 'status',
      label: t('orderStatus'),
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeColor(value)}`}>
          {t(value) || value || t('pending')}
        </span>
      )
    },
    {
      key: 'payment_status',
      label: t('paymentStatus'),
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${getPaymentBadgeColor(value)}`}>
          {t(value) || value || t('pending')}
        </span>
      )
    },
    {
      key: 'created_at',
      label: t('orderDate'),
      sortable: true,
      render: (value) => <span className="text-sm">{formatDate(value)}</span>
    },
    {
      key: 'actions',
      label: '',
      sortable: false,
      render: (_, order) => (
        <button
          onClick={() => setSelectedOrder(order)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded flex items-center gap-1"
          title={t('viewDetails')}
        >
          <FaEye /> <span className="hidden sm:inline">{t('viewDetails')}</span>
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
          <p className="text-sm font-semibold">{order.customer_name || order.user_name || t('guest')}</p>
          <p className="text-xs text-gray-500">{order.customer_email || order.user_email}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-green-600">{formatCurrency(order.total)}</p>
          <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
        </div>
      </div>
      <div className="flex gap-2 mb-3">
        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeColor(order.status)}`}>
          {t(order.status) || order.status || t('pending')}
        </span>
        <span className={`px-2 py-1 rounded text-xs font-semibold ${getPaymentBadgeColor(order.payment_status)}`}>
          {t(order.payment_status) || order.payment_status || t('pending')}
        </span>
      </div>
      <div className="flex justify-end pt-3 border-t">
        <button
          onClick={() => setSelectedOrder(order)}
          className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm flex items-center gap-1"
        >
          <FaEye /> {t('viewDetails')}
        </button>
      </div>
    </div>
  );

  const totals = calculateOrderTotal();

  return (
    <>
      <Helmet>
        <title>{t('orderManagement')} - Marketplace Jeans</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-4 lg:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">{t('orderManagement')}</h1>
              <p className="text-gray-600">{t('manageCustomerOrders')}</p>
            </div>
            <button
              onClick={() => {
                setShowCreateModal(true);
                fetchProducts();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <FaPlus /> {t('createOrder')}
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
              {error}
              <button onClick={() => setError('')} className="float-right">&times;</button>
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
              <FaFilter /> {t('filter')}
            </button>
            <div className={`bg-white p-4 lg:p-6 rounded shadow ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">{t('orderStatus')}</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
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
                <div>
                  <label className="block text-sm font-semibold mb-2">{t('paymentStatus')}</label>
                  <select
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value)}
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="all">{t('allStatus')}</option>
                    <option value="pending">{t('pending')}</option>
                    <option value="paid">{t('paid')}</option>
                    <option value="failed">{t('failed')}</option>
                    <option value="refunded">{t('refunded')}</option>
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
              <h2 className="text-xl font-bold">{t('orderDetails')} #{selectedOrder.id}</h2>
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
                  <h3 className="font-bold mb-3 uppercase text-sm">{t('orderInfo')}</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-semibold">ID:</span> #{selectedOrder.id}</p>
                    <p><span className="font-semibold">{t('orderDate')}:</span> {formatDate(selectedOrder.created_at)}</p>
                    <p><span className="font-semibold">{t('shippingCost')}:</span> {selectedOrder.shipping_method}</p>
                    <p><span className="font-semibold">{t('paymentMethod')}:</span> {selectedOrder.payment_method}</p>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="bg-gray-50 p-4 rounded">
                  <h3 className="font-bold mb-3 uppercase text-sm">{t('customerInfo')}</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-semibold">{t('recipientName')}:</span> {selectedOrder.customer_name || selectedOrder.user_name}</p>
                    <p><span className="font-semibold">Email:</span> {selectedOrder.customer_email || selectedOrder.user_email}</p>
                    <p><span className="font-semibold">{t('phone')}:</span> {selectedOrder.customer_phone}</p>
                    <p><span className="font-semibold">{t('address')}:</span> {selectedOrder.shipping_address}</p>
                  </div>
                </div>

                {/* Status Controls */}
                <div className="bg-gray-50 p-4 rounded">
                  <h3 className="font-bold mb-3 uppercase text-sm">{t('updateStatus')}</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-semibold mb-1">{t('orderStatus')}</label>
                      <select
                        value={selectedOrder.status || 'pending'}
                        onChange={(e) => handleStatusUpdate(selectedOrder.id, e.target.value)}
                        disabled={updatingOrderId === selectedOrder.id}
                        className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
                      >
                        <option value="pending">{t('pending')}</option>
                        <option value="confirmed">{t('confirmed')}</option>
                        <option value="processing">{t('processing')}</option>
                        <option value="shipped">{t('shipped')}</option>
                        <option value="delivered">{t('delivered')}</option>
                        <option value="cancelled">{t('cancelled')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">{t('paymentStatus')}</label>
                      <select
                        value={selectedOrder.payment_status || 'pending'}
                        onChange={(e) => handlePaymentStatusUpdate(selectedOrder.id, e.target.value)}
                        disabled={updatingOrderId === selectedOrder.id}
                        className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
                      >
                        <option value="pending">{t('pending')}</option>
                        <option value="paid">{t('paid')}</option>
                        <option value="failed">{t('failed')}</option>
                        <option value="refunded">{t('refunded')}</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="font-bold mb-3 uppercase text-sm">{t('orderItems')}</h3>
                <div className="bg-gray-50 rounded p-4 space-y-2">
                  {selectedOrder.items?.length > 0 ? (
                    selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm py-2 border-b last:border-0">
                        <span>{item.product_name} ({item.size_name}) x{item.quantity}</span>
                        <span className="font-semibold">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">{t('noData')}</p>
                  )}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>{t('subtotal')}</span>
                  <span>{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('shippingCost')}</span>
                  <span>{formatCurrency(selectedOrder.shipping_cost)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('tax')}</span>
                  <span>{formatCurrency(selectedOrder.tax)}</span>
                </div>
                {selectedOrder.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>{t('discount')}</span>
                    <span>-{formatCurrency(selectedOrder.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base border-t pt-2">
                  <span>{t('total')}</span>
                  <span className="text-red-600">{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">{t('createOrder')}</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetCreateForm();
                }}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleCreateOrder} className="p-4 lg:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Customer Info */}
                <div className="space-y-4">
                  <h3 className="font-bold text-lg border-b pb-2">{t('customerInfo')}</h3>
                  
                  {/* User Selection Mode Toggle */}
                  <div className="flex gap-2 mb-4">
                    <button
                      type="button"
                      onClick={() => {
                        setUserMode('existing');
                        handleClearSelectedUser();
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                        userMode === 'existing' 
                          ? 'bg-black text-white border-black' 
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <FaUser /> Pilih User
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUserMode('new');
                        handleClearSelectedUser();
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                        userMode === 'new' 
                          ? 'bg-black text-white border-black' 
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <FaUserPlus /> User Baru
                    </button>
                  </div>

                  {/* Existing User Search */}
                  {userMode === 'existing' && !selectedUser && (
                    <div className="relative">
                      <label className="block text-sm font-semibold mb-1">Cari User (Nama/Email)</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={searchUser}
                          onChange={(e) => handleSearchUser(e.target.value)}
                          placeholder="Ketik nama atau email..."
                          className="w-full px-4 py-2 pl-10 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                        />
                        <FaSearch className="absolute left-3 top-3 text-gray-400" />
                        {searchingUser && (
                          <div className="absolute right-3 top-3">
                            <div className="animate-spin h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full"></div>
                          </div>
                        )}
                      </div>
                      
                      {/* User Search Results */}
                      {userSearchResults.length > 0 && (
                        <div className="absolute z-10 w-full bg-white border rounded-lg shadow-lg mt-1 max-h-60 overflow-auto">
                          {userSearchResults.map((user) => (
                            <button
                              key={user.id}
                              type="button"
                              onClick={() => handleSelectUser(user)}
                              className="w-full px-4 py-3 text-left hover:bg-gray-100 border-b last:border-b-0"
                            >
                              <p className="font-medium">{user.full_name}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                              {user.phone && <p className="text-xs text-gray-400">{user.phone}</p>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Selected User Display */}
                  {selectedUser && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-green-800">{selectedUser.full_name}</p>
                          <p className="text-sm text-green-600">{selectedUser.email}</p>
                          {selectedUser.phone && <p className="text-xs text-green-500">{selectedUser.phone}</p>}
                        </div>
                        <button
                          type="button"
                          onClick={handleClearSelectedUser}
                          className="text-green-600 hover:text-green-800"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* New User Info Message */}
                  {userMode === 'new' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                      <p className="font-medium">Mode User Baru</p>
                      <p>Jika email diisi, user baru akan otomatis dibuat saat pesanan disimpan.</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-semibold mb-1">{t('recipientName')} *</label>
                    <input
                      type="text"
                      value={newOrderData.customer_name}
                      onChange={(e) => setNewOrderData({...newOrderData, customer_name: e.target.value})}
                      className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100"
                      required
                      disabled={!!selectedUser}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-1">
                      Email {userMode === 'new' && !selectedUser && '(isi untuk buat user baru)'}
                    </label>
                    <input
                      type="email"
                      value={newOrderData.customer_email}
                      onChange={(e) => setNewOrderData({...newOrderData, customer_email: e.target.value})}
                      disabled={!!selectedUser}
                      className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-1">{t('phone')} *</label>
                    <input
                      type="tel"
                      value={newOrderData.customer_phone}
                      onChange={(e) => setNewOrderData({...newOrderData, customer_phone: e.target.value})}
                      className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-1">{t('address')} *</label>
                    <textarea
                      value={newOrderData.shipping_address}
                      onChange={(e) => setNewOrderData({...newOrderData, shipping_address: e.target.value})}
                      className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1">{t('city')}</label>
                      <input
                        type="text"
                        value={newOrderData.shipping_city}
                        onChange={(e) => setNewOrderData({...newOrderData, shipping_city: e.target.value})}
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">{t('province')}</label>
                      <input
                        type="text"
                        value={newOrderData.shipping_province}
                        onChange={(e) => setNewOrderData({...newOrderData, shipping_province: e.target.value})}
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1">{t('postalCode')}</label>
                      <input
                        type="text"
                        value={newOrderData.shipping_postal_code}
                        onChange={(e) => setNewOrderData({...newOrderData, shipping_postal_code: e.target.value})}
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Negara</label>
                      <select
                        value={newOrderData.shipping_country}
                        onChange={(e) => setNewOrderData({...newOrderData, shipping_country: e.target.value})}
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                      >
                        <option value="Indonesia">Indonesia</option>
                        <option value="Malaysia">Malaysia</option>
                        <option value="Singapore">Singapore</option>
                        <option value="Australia">Australia</option>
                        <option value="United States">United States</option>
                        <option value="Japan">Japan</option>
                        <option value="South Korea">South Korea</option>
                        <option value="Other">Lainnya</option>
                      </select>
                    </div>
                  </div>

                  {/* Exchange Rate for International Orders */}
                  {newOrderData.shipping_country && newOrderData.shipping_country !== 'Indonesia' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-yellow-800 font-semibold">💱 Pesanan Internasional (USD)</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-yellow-700">Kurs (IDR per USD)</label>
                          <input
                            type="number"
                            min="10000"
                            step="100"
                            value={exchangeRate}
                            onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 16000)}
                            className="w-full px-4 py-2 border border-yellow-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          />
                        </div>
                        <div className="flex items-end">
                          <div className="text-sm text-yellow-700">
                            <p>Total IDR: <span className="font-bold">{formatCurrency(totals.total)}</span></p>
                            <p>Total USD: <span className="font-bold">${(totals.total / exchangeRate).toFixed(2)}</span></p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1">{t('paymentMethod')}</label>
                      <select
                        value={newOrderData.payment_method}
                        onChange={(e) => setNewOrderData({...newOrderData, payment_method: e.target.value})}
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                      >
                        <option value="bank_transfer">Transfer Bank</option>
                        <option value="cash">Tunai (COD)</option>
                        <option value="e-wallet">E-Wallet</option>
                        <option value="paypal">PayPal</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">{t('shippingCost')}</label>
                      <input
                        type="text"
                        value={newOrderData.shipping_method}
                        onChange={(e) => setNewOrderData({...newOrderData, shipping_method: e.target.value})}
                        placeholder="e.g. JNE Regular"
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-1">{t('notes')}</label>
                    <textarea
                      value={newOrderData.notes}
                      onChange={(e) => setNewOrderData({...newOrderData, notes: e.target.value})}
                      className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                      rows={2}
                    />
                  </div>
                </div>
                
                {/* Right Column - Products */}
                <div className="space-y-4">
                  <h3 className="font-bold text-lg border-b pb-2">{t('orderItems')}</h3>
                  
                  {/* Product Search */}
                  <div className="relative">
                    <label className="block text-sm font-semibold mb-1">{t('addProduct')}</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchProduct}
                        onChange={(e) => handleSearchProduct(e.target.value)}
                        placeholder={t('search') + ' produk...'}
                        className="w-full px-4 py-2 pl-10 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                      />
                      <FaSearch className="absolute left-3 top-3 text-gray-400" />
                    </div>
                    
                    {/* Search Results Dropdown */}
                    {searchResults.length > 0 && (
                      <div className="absolute z-10 w-full bg-white border rounded-lg shadow-lg mt-1 max-h-60 overflow-auto">
                        {searchResults.map((product) => (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => handleAddProduct(product)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex justify-between items-center"
                          >
                            <span>{product.name}</span>
                            <span className="text-sm text-gray-500">{formatCurrency(product.base_price)}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Order Items List */}
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-3 py-2 text-left">{t('products')}</th>
                          <th className="px-3 py-2 text-center">{t('quantity')}</th>
                          <th className="px-3 py-2 text-right">{t('price')}</th>
                          <th className="px-3 py-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderItems.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-3 py-6 text-center text-gray-500">
                              {t('noData')}
                            </td>
                          </tr>
                        ) : (
                          orderItems.map((item, index) => (
                            <tr key={index} className="border-t">
                              <td className="px-3 py-2">
                                <p className="font-medium">{item.product_name}</p>
                                <select
                                  value={item.variant_id}
                                  onChange={(e) => handleUpdateItemVariant(index, e.target.value)}
                                  className="text-xs border rounded px-2 py-1 mt-1"
                                >
                                  {item.variants?.map((v) => (
                                    <option key={v.id} value={v.id}>
                                      {v.size_name} (Stok: {v.stock_quantity})
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-3 py-2 text-center">
                                <input
                                  type="number"
                                  min="1"
                                  max={item.stock}
                                  value={item.quantity}
                                  onChange={(e) => handleUpdateItemQuantity(index, e.target.value)}
                                  className="w-16 border rounded px-2 py-1 text-center"
                                />
                              </td>
                              <td className="px-3 py-2 text-right">
                                {formatCurrency(item.price * item.quantity)}
                              </td>
                              <td className="px-3 py-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(index)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <FaTrash />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Shipping & Discount */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1">{t('shippingCost')}</label>
                      <input
                        type="number"
                        min="0"
                        value={newOrderData.shipping_cost}
                        onChange={(e) => setNewOrderData({...newOrderData, shipping_cost: e.target.value})}
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">{t('discount')}</label>
                      <input
                        type="number"
                        min="0"
                        value={newOrderData.discount_amount}
                        onChange={(e) => setNewOrderData({...newOrderData, discount_amount: e.target.value})}
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  </div>
                  
                  {/* Order Summary */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{t('subtotal')}</span>
                      <span>{formatCurrency(totals.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>{t('shippingCost')}</span>
                      <span>{formatCurrency(totals.shipping)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>{t('tax')} (11%)</span>
                      <span>{formatCurrency(totals.tax)}</span>
                    </div>
                    {totals.discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>{t('discount')}</span>
                        <span>-{formatCurrency(totals.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold border-t pt-2">
                      <span>{t('total')}</span>
                      <span className="text-red-600">{formatCurrency(totals.total)}</span>
                    </div>
                    
                    {/* USD Conversion for International Orders */}
                    {newOrderData.shipping_country && newOrderData.shipping_country !== 'Indonesia' && (
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between font-bold text-yellow-700">
                          <span>Total (USD)</span>
                          <span className="text-lg">${(totals.total / exchangeRate).toFixed(2)}</span>
                        </div>
                        <p className="text-xs text-gray-500 text-right mt-1">
                          Kurs: 1 USD = {formatCurrency(exchangeRate)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Form Actions */}
              <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetCreateForm();
                  }}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-100"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={createLoading || orderItems.length === 0}
                  className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createLoading ? t('saving') : t('createOrder')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminOrders;
