import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import apiClient from '../../services/api';
import { FaEye, FaTimes, FaFilter, FaPlus, FaSearch, FaTrash, FaUser, FaUserPlus, FaWarehouse, FaTruck, FaMapMarkerAlt, FaHistory, FaClock, FaCheckCircle, FaBox, FaSpinner, FaFilePdf, FaQrcode, FaCheck, FaLink } from 'react-icons/fa';
import DataTable from '../../components/admin/DataTable';
import Modal, { ModalFooter } from '../../components/admin/Modal';
import { useLanguage } from '../../utils/i18n';
import { getImageUrl } from '../../utils/imageUtils';

// Tracking status configuration
const TRACKING_STATUS_CONFIG = {
  pending: { icon: FaClock, color: 'text-yellow-500', bg: 'bg-yellow-100', label: 'Menunggu' },
  confirmed: { icon: FaCheckCircle, color: 'text-blue-500', bg: 'bg-blue-100', label: 'Dikonfirmasi' },
  processing: { icon: FaBox, color: 'text-indigo-500', bg: 'bg-indigo-100', label: 'Diproses' },
  packed: { icon: FaBox, color: 'text-purple-500', bg: 'bg-purple-100', label: 'Dikemas' },
  shipped: { icon: FaTruck, color: 'text-cyan-500', bg: 'bg-cyan-100', label: 'Dikirim' },
  in_transit: { icon: FaTruck, color: 'text-orange-500', bg: 'bg-orange-100', label: 'Dalam Perjalanan' },
  out_for_delivery: { icon: FaTruck, color: 'text-teal-500', bg: 'bg-teal-100', label: 'Sedang Diantar' },
  delivered: { icon: FaCheckCircle, color: 'text-green-500', bg: 'bg-green-100', label: 'Diterima' },
  cancelled: { icon: FaTimes, color: 'text-red-500', bg: 'bg-red-100', label: 'Dibatalkan' }
};

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
  
  // Warehouse & Shipping state
  const [warehouses, setWarehouses] = useState([]);
  const [cities, setCities] = useState([]);
  const [searchCity, setSearchCity] = useState('');
  const [citySearchResults, setCitySearchResults] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [loadingShipping, setLoadingShipping] = useState(false);
  
  // Province autocomplete state
  const [provinces, setProvinces] = useState([]);
  const [searchProvince, setSearchProvince] = useState('');
  const [filteredProvinces, setFilteredProvinces] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  
  // Dynamic taxes and discounts state
  const [taxes, setTaxes] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  
  // Tracking state
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState(null);
  const [trackingHistory, setTrackingHistory] = useState([]);
  const [loadingTracking, setLoadingTracking] = useState(false);
  const [trackingStatuses, setTrackingStatuses] = useState([]);
  const [newTracking, setNewTracking] = useState({
    status: '',
    title: '',
    description: '',
    location: ''
  });
  const [addingTracking, setAddingTracking] = useState(false);
  
  // Approve order state
  const [approvingOrderId, setApprovingOrderId] = useState(null);
  const [downloadingInvoice, setDownloadingInvoice] = useState(null);
  
  const [newOrderData, setNewOrderData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    shipping_address: '',
    shipping_city: '',
    shipping_city_id: null,
    shipping_province: '',
    shipping_postal_code: '',
    shipping_country: 'Indonesia',
    shipping_method: '',
    warehouse_id: null,
    shipping_cost_id: null,
    courier: '',
    payment_method: 'bank_transfer',
    shipping_cost: 0,
    notes: ''
  });

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, paymentFilter]);
  
  // Fetch warehouses and provinces on mount
  useEffect(() => {
    fetchWarehouses();
    fetchProvinces();
  }, []);

  const fetchProvinces = async () => {
    try {
      const response = await apiClient.get('/cities/provinces');
      setProvinces(response.data.data || []);
    } catch (err) {
      console.error('Error fetching provinces:', err);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const response = await apiClient.get('/warehouses?active_only=true');
      setWarehouses(response.data.data || []);
    } catch (err) {
      console.error('Error fetching warehouses:', err);
    }
  };

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

  // Handle province search/autocomplete
  const handleSearchProvince = (search) => {
    setSearchProvince(search);
    setShowProvinceDropdown(true);
    if (search.length >= 1) {
      const filtered = provinces.filter(p => 
        p.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredProvinces(filtered);
    } else {
      setFilteredProvinces(provinces);
    }
    // Clear city when province changes
    if (selectedProvince !== search) {
      setSelectedCity(null);
      setSearchCity('');
      setCitySearchResults([]);
      setSelectedShipping(null);
      setShippingOptions([]);
      setNewOrderData(prev => ({
        ...prev,
        shipping_city: '',
        shipping_city_id: null,
        shipping_province: search,
        shipping_postal_code: '',
        shipping_cost: 0,
        shipping_cost_id: null,
        courier: '',
        shipping_method: ''
      }));
    }
  };

  // Select province from dropdown
  const handleSelectProvince = (province) => {
    setSelectedProvince(province);
    setSearchProvince(province);
    setShowProvinceDropdown(false);
    setFilteredProvinces([]);
    setNewOrderData(prev => ({
      ...prev,
      shipping_province: province
    }));
    // Clear city selection when province changes
    setSelectedCity(null);
    setSearchCity('');
    setCitySearchResults([]);
    setSelectedShipping(null);
    setShippingOptions([]);
  };

  // Search cities with optional province filter
  const handleSearchCity = async (search) => {
    setSearchCity(search);
    setShowCityDropdown(true);
    if (search.length >= 1) {
      try {
        let url = `/cities?search=${encodeURIComponent(search)}&limit=15`;
        if (selectedProvince) {
          url += `&province=${encodeURIComponent(selectedProvince)}`;
        }
        const response = await apiClient.get(url);
        setCitySearchResults(response.data.data || []);
      } catch (err) {
        console.error('Error searching cities:', err);
        setCitySearchResults([]);
      }
    } else if (selectedProvince) {
      // Show all cities in province when input is empty but province selected
      try {
        const response = await apiClient.get(`/cities?province=${encodeURIComponent(selectedProvince)}&limit=30`);
        setCitySearchResults(response.data.data || []);
      } catch (err) {
        setCitySearchResults([]);
      }
    } else {
      setCitySearchResults([]);
    }
  };

  // Select city and calculate shipping
  const handleSelectCity = async (city) => {
    setSelectedCity(city);
    setSearchCity(city.name);
    setShowCityDropdown(false);
    setCitySearchResults([]);
    // Also set province if not already set
    if (!selectedProvince && city.province) {
      setSelectedProvince(city.province);
      setSearchProvince(city.province);
    }
    setNewOrderData(prev => ({
      ...prev,
      shipping_city: city.name,
      shipping_city_id: city.id,
      shipping_province: city.province || prev.shipping_province,
      shipping_postal_code: city.postal_code || ''
    }));
    
    // Calculate shipping if warehouse is selected
    if (newOrderData.warehouse_id) {
      await calculateShippingOptions(city.id, newOrderData.warehouse_id);
    }
  };

  // Clear selected city and province
  const handleClearSelectedCity = () => {
    setSelectedCity(null);
    setSelectedProvince(null);
    setSearchCity('');
    setSearchProvince('');
    setSelectedShipping(null);
    setShippingOptions([]);
    setCitySearchResults([]);
    setFilteredProvinces([]);
    setNewOrderData(prev => ({
      ...prev,
      shipping_city: '',
      shipping_city_id: null,
      shipping_province: '',
      shipping_postal_code: '',
      shipping_cost: 0,
      shipping_cost_id: null,
      courier: '',
      shipping_method: ''
    }));
  };

  // Handle warehouse change
  const handleWarehouseChange = async (warehouseId) => {
    setNewOrderData({
      ...newOrderData,
      warehouse_id: warehouseId || null
    });
    setSelectedShipping(null);
    
    // Recalculate shipping if city is selected
    if (selectedCity && warehouseId) {
      await calculateShippingOptions(selectedCity.id, warehouseId);
    } else {
      setShippingOptions([]);
    }
  };

  // Calculate shipping options
  const calculateShippingOptions = async (cityId, warehouseId) => {
    setLoadingShipping(true);
    try {
      const response = await apiClient.post('/shipping-costs/calculate', {
        city_id: cityId,
        warehouse_id: warehouseId,
        weight: 1
      });
      setShippingOptions(response.data.data || []);
    } catch (err) {
      console.error('Error calculating shipping:', err);
      setShippingOptions([]);
    } finally {
      setLoadingShipping(false);
    }
  };

  // Select shipping option
  const handleSelectShipping = (option) => {
    setSelectedShipping(option);
    setNewOrderData({
      ...newOrderData,
      shipping_cost: option.calculated_cost || option.cost,
      shipping_cost_id: option.id,
      courier: option.courier,
      shipping_method: `${option.courier} - ${option.service || 'Regular'}`
    });
  };

  // Add tax item
  const handleAddTax = () => {
    setTaxes([...taxes, { description: '', amount: 0 }]);
  };

  // Update tax item
  const handleUpdateTax = (index, field, value) => {
    const newTaxes = [...taxes];
    newTaxes[index][field] = field === 'amount' ? parseFloat(value) || 0 : value;
    setTaxes(newTaxes);
  };

  // Remove tax item
  const handleRemoveTax = (index) => {
    setTaxes(taxes.filter((_, i) => i !== index));
  };

  // Add discount item
  const handleAddDiscount = () => {
    setDiscounts([...discounts, { description: '', amount: 0 }]);
  };

  // Update discount item
  const handleUpdateDiscount = (index, field, value) => {
    const newDiscounts = [...discounts];
    newDiscounts[index][field] = field === 'amount' ? parseFloat(value) || 0 : value;
    setDiscounts(newDiscounts);
  };

  // Remove discount item
  const handleRemoveDiscount = (index) => {
    setDiscounts(discounts.filter((_, i) => i !== index));
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
    
    // Calculate total taxes from dynamic tax items
    const totalTax = taxes.reduce((sum, tax) => sum + (parseFloat(tax.amount) || 0), 0);
    
    // Calculate total discounts from dynamic discount items
    const totalDiscount = discounts.reduce((sum, disc) => sum + (parseFloat(disc.amount) || 0), 0);
    
    return {
      subtotal,
      shipping,
      taxes: totalTax,
      discounts: totalDiscount,
      total: subtotal + shipping + totalTax - totalDiscount
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
        taxes: taxes.filter(t => t.description && t.amount > 0),
        discounts: discounts.filter(d => d.description && d.amount > 0),
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
      shipping_city_id: null,
      shipping_province: '',
      shipping_postal_code: '',
      shipping_country: 'Indonesia',
      shipping_method: '',
      warehouse_id: null,
      shipping_cost_id: null,
      courier: '',
      payment_method: 'bank_transfer',
      shipping_cost: 0,
      notes: ''
    });
    setOrderItems([]);
    setSearchProduct('');
    setSearchResults([]);
    setUserMode('new');
    setSelectedUser(null);
    setSearchUser('');
    setUserSearchResults([]);
    setSelectedCity(null);
    setSelectedProvince(null);
    setSearchCity('');
    setSearchProvince('');
    setCitySearchResults([]);
    setFilteredProvinces([]);
    setShowProvinceDropdown(false);
    setShowCityDropdown(false);
    setShippingOptions([]);
    setSelectedShipping(null);
    setTaxes([]);
    setDiscounts([]);
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

  // Tracking functions
  const fetchTrackingStatuses = async () => {
    // Define statuses directly since we don't need API call
    setTrackingStatuses([
      { value: 'pending', label: 'Menunggu Persetujuan' },
      { value: 'confirmed', label: 'Dikonfirmasi' },
      { value: 'processing', label: 'Diproses' },
      { value: 'packed', label: 'Dikemas' },
      { value: 'shipped', label: 'Dikirim' },
      { value: 'in_transit', label: 'Dalam Perjalanan' },
      { value: 'out_for_delivery', label: 'Sedang Diantar' },
      { value: 'delivered', label: 'Diterima' },
      { value: 'cancelled', label: 'Dibatalkan' }
    ]);
  };

  const fetchTrackingHistory = async (orderId) => {
    try {
      setLoadingTracking(true);
      const response = await apiClient.get(`/orders/${orderId}/shipping-history`);
      if (response.data.success) {
        setTrackingHistory(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching tracking history:', err);
      // Fallback to old endpoint
      try {
        const response = await apiClient.get(`/tracking/order/${orderId}`);
        if (response.data.success) {
          setTrackingHistory(response.data.data);
        }
      } catch (err2) {
        setTrackingHistory([]);
      }
    } finally {
      setLoadingTracking(false);
    }
  };

  const handleOpenTrackingModal = async (orderId) => {
    setTrackingOrderId(orderId);
    setShowTrackingModal(true);
    setNewTracking({ status: '', title: '', description: '', location: '' });
    await fetchTrackingStatuses();
    await fetchTrackingHistory(orderId);
  };

  const handleAddTracking = async (e) => {
    e.preventDefault();
    if (!newTracking.status) {
      setError('Status wajib dipilih');
      return;
    }

    try {
      setAddingTracking(true);
      // Use new shipping history endpoint
      const response = await apiClient.post(`/orders/${trackingOrderId}/shipping-history`, {
        status: newTracking.status,
        title: newTracking.title || getDefaultTitle(newTracking.status),
        description: newTracking.description,
        location: newTracking.location,
        update_order_status: true
      });
      
      if (response.data.success) {
        setSuccess('Riwayat pengiriman berhasil ditambahkan!');
        setNewTracking({ status: '', title: '', description: '', location: '' });
        await fetchTrackingHistory(trackingOrderId);
        
        // Update order status in list
        setOrders(orders.map(order =>
          order.id === trackingOrderId ? { ...order, status: newTracking.status } : order
        ));
        
        if (selectedOrder?.id === trackingOrderId) {
          setSelectedOrder({ ...selectedOrder, status: newTracking.status });
        }
        
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menambahkan tracking');
    } finally {
      setAddingTracking(false);
    }
  };

  // Get default title based on status
  const getDefaultTitle = (status) => {
    const titles = {
      pending: 'Menunggu Persetujuan',
      confirmed: 'Pesanan Dikonfirmasi',
      processing: 'Pesanan Diproses',
      packed: 'Pesanan Dikemas',
      shipped: 'Pesanan Dikirim',
      in_transit: 'Dalam Perjalanan',
      out_for_delivery: 'Sedang Diantar',
      delivered: 'Pesanan Diterima',
      cancelled: 'Pesanan Dibatalkan'
    };
    return titles[status] || status;
  };

  const handleDeleteTracking = async (trackingId) => {
    if (!window.confirm('Hapus tracking ini?')) return;
    
    try {
      await apiClient.delete(`/tracking/${trackingId}`);
      setSuccess('Tracking berhasil dihapus');
      await fetchTrackingHistory(trackingOrderId);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menghapus tracking');
    }
  };

  // Approve order function
  const handleApproveOrder = async (orderId) => {
    if (!window.confirm('Setujui pesanan ini? Status akan berubah menjadi Dikonfirmasi.')) return;
    
    try {
      setApprovingOrderId(orderId);
      await apiClient.put(`/orders/${orderId}/approve`, { notes: 'Pesanan disetujui oleh admin' });
      setSuccess('Pesanan berhasil disetujui!');
      
      // Update order status in list
      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status: 'confirmed' } : order
      ));
      
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: 'confirmed' });
      }
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyetujui pesanan');
    } finally {
      setApprovingOrderId(null);
    }
  };

  // Download invoice PDF
  const handleDownloadInvoice = async (orderId, orderNumber) => {
    try {
      setDownloadingInvoice(orderId);
      const response = await apiClient.get(`/orders/${orderId}/invoice`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${orderNumber || orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Gagal mengunduh invoice');
    } finally {
      setDownloadingInvoice(null);
    }
  };

  // Download QR code
  const handleDownloadQRCode = async (orderId, orderNumber) => {
    try {
      const response = await apiClient.get(`/orders/${orderId}/qrcode`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `qr-${orderNumber || orderId}.png`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Gagal mengunduh QR Code');
    }
  };

  // Copy tracking URL
  const handleCopyTrackingUrl = (uniqueToken) => {
    const url = `${window.location.origin}/order/${uniqueToken}`;
    navigator.clipboard.writeText(url);
    setSuccess('Link tracking tersalin!');
    setTimeout(() => setSuccess(''), 2000);
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
      key: 'order_number',
      label: 'No. Invoice',
      sortable: true,
      render: (value, order) => <span className="font-semibold">{value || `#${order.id}`}</span>
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
          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1"
          title={t('viewDetails')}
        >
          <FaEye size={16} /> <span className="hidden sm:inline">{t('viewDetails')}</span>
        </button>
      )
    }
  ];

  // Mobile card renderer
  const renderMobileCard = (order) => (
    <div className="bg-white rounded-lg shadow p-4 mb-3">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-bold text-lg">{order.order_number || `#${order.id}`}</p>
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
        <title>{`${t('orderManagement') || 'Order Management'} - Marketplace Jeans`}</title>
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
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? `${t('orderDetails')} ${selectedOrder.order_number || '#' + selectedOrder.id}` : ''}
        size="3xl"
      >
        {selectedOrder && (
          <>
            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b">
              {/* Approve button for pending orders */}
              {selectedOrder.status === 'pending' && (
                <button
                  onClick={() => handleApproveOrder(selectedOrder.id)}
                  disabled={approvingOrderId === selectedOrder.id}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm disabled:opacity-50"
                >
                  {approvingOrderId === selectedOrder.id ? (
                    <><FaSpinner className="animate-spin" /> Menyetujui...</>
                  ) : (
                    <><FaCheck /> Setujui Pesanan</>
                  )}
                </button>
              )}
              <button
                onClick={() => handleOpenTrackingModal(selectedOrder.id)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                <FaHistory /> Update Tracking
              </button>
            </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Order Info */}
                <div className="bg-gray-50 p-4 rounded">
                  <h3 className="font-bold mb-3 uppercase text-sm">{t('orderInfo')}</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-semibold">No. Invoice:</span> {selectedOrder.order_number || `#${selectedOrder.id}`}</p>
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
                  <div>
                    <span>{t('shippingCost')}</span>
                    {selectedOrder.warehouse_name && (
                      <p className="text-xs text-gray-500">dari {selectedOrder.warehouse_name}</p>
                    )}
                    {selectedOrder.courier && (
                      <p className="text-xs text-gray-500">{selectedOrder.courier}</p>
                    )}
                  </div>
                  <span>{formatCurrency(selectedOrder.shipping_cost)}</span>
                </div>
                {/* Show tax details if available */}
                {selectedOrder.taxes?.length > 0 ? (
                  selectedOrder.taxes.map((tax, idx) => (
                    <div key={idx} className="flex justify-between text-blue-600">
                      <span>{tax.description}</span>
                      <span>+{formatCurrency(tax.amount)}</span>
                    </div>
                  ))
                ) : selectedOrder.tax > 0 && (
                  <div className="flex justify-between">
                    <span>{t('tax')}</span>
                    <span>{formatCurrency(selectedOrder.tax)}</span>
                  </div>
                )}
                {/* Show discount details if available */}
                {selectedOrder.discounts?.length > 0 ? (
                  selectedOrder.discounts.map((disc, idx) => (
                    <div key={idx} className="flex justify-between text-green-600">
                      <span>{disc.description}</span>
                      <span>-{formatCurrency(disc.amount)}</span>
                    </div>
                  ))
                ) : selectedOrder.discount_amount > 0 && (
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
              
              {/* Payment Proof */}
              {selectedOrder.payment_proof && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="font-bold text-sm uppercase mb-2">Bukti Pembayaran</h3>
                  <img 
                    src={getImageUrl(selectedOrder.payment_proof)}
                    alt="Bukti pembayaran" 
                    className="max-h-64 rounded shadow cursor-pointer hover:opacity-90"
                    onClick={() => window.open(getImageUrl(selectedOrder.payment_proof), '_blank')}
                  />
                </div>
              )}

              {/* Tracking Link */}
              {selectedOrder.order_number && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700 mb-3">
                    <strong>Link Tracking Publik:</strong>{' '}
                    {selectedOrder.unique_token ? (
                      <a 
                        href={`/order/${selectedOrder.unique_token}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="underline hover:text-blue-900"
                      >
                        {window.location.origin}/order/{selectedOrder.unique_token}
                      </a>
                    ) : (
                      <a 
                        href={`/orders/track/${selectedOrder.order_number}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="underline hover:text-blue-900"
                      >
                        {window.location.origin}/orders/track/{selectedOrder.order_number}
                      </a>
                    )}
                  </p>
                  
                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleDownloadInvoice(selectedOrder.id, selectedOrder.order_number)}
                      disabled={downloadingInvoice === selectedOrder.id}
                      className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
                    >
                      {downloadingInvoice === selectedOrder.id ? (
                        <><FaSpinner className="animate-spin" /> Mengunduh...</>
                      ) : (
                        <><FaFilePdf /> Download Invoice</>
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleDownloadQRCode(selectedOrder.id, selectedOrder.order_number)}
                      className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                    >
                      <FaQrcode /> Download QR Code
                    </button>
                    
                    {selectedOrder.unique_token && (
                      <button
                        onClick={() => handleCopyTrackingUrl(selectedOrder.unique_token)}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                      >
                        <FaLink /> Salin Link
                      </button>
                    )}
                  </div>
                </div>
              )}
          </>
        )}
      </Modal>

      {/* Tracking Modal */}
      <Modal
        isOpen={showTrackingModal}
        onClose={() => {
          setShowTrackingModal(false);
          setTrackingOrderId(null);
          setTrackingHistory([]);
        }}
        title={<span className="flex items-center gap-2"><FaHistory className="text-blue-600" /> Update Tracking Pesanan</span>}
        size="2xl"
      >
              {/* Add New Tracking Form */}
              <form onSubmit={handleAddTracking} className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-bold mb-4">Tambah Update Tracking</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Status *</label>
                    <select
                      value={newTracking.status}
                      onChange={(e) => setNewTracking({
                        ...newTracking,
                        status: e.target.value,
                        title: trackingStatuses.find(s => s.value === e.target.value)?.label || ''
                      })}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Pilih Status</option>
                      {trackingStatuses.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Judul (Opsional)</label>
                    <input
                      type="text"
                      value={newTracking.title}
                      onChange={(e) => setNewTracking({ ...newTracking, title: e.target.value })}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Default: sesuai status"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Lokasi (Opsional)</label>
                    <input
                      type="text"
                      value={newTracking.location}
                      onChange={(e) => setNewTracking({ ...newTracking, location: e.target.value })}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Contoh: Gudang Jakarta, DC Surabaya"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Deskripsi (Opsional)</label>
                    <input
                      type="text"
                      value={newTracking.description}
                      onChange={(e) => setNewTracking({ ...newTracking, description: e.target.value })}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Detail tambahan"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={addingTracking || !newTracking.status}
                  className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {addingTracking ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <FaPlus />
                      Tambah Tracking
                    </>
                  )}
                </button>
              </form>

              {/* Tracking History */}
              <div>
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <FaHistory />
                  Riwayat Tracking
                </h3>
                
                {loadingTracking ? (
                  <div className="text-center py-8">
                    <FaSpinner className="animate-spin text-2xl mx-auto text-gray-400" />
                    <p className="text-gray-500 mt-2">Memuat riwayat...</p>
                  </div>
                ) : trackingHistory.length > 0 ? (
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    
                    {trackingHistory.map((track, index) => {
                      const config = TRACKING_STATUS_CONFIG[track.status] || TRACKING_STATUS_CONFIG.pending;
                      const isFirst = index === 0;
                      
                      return (
                        <div key={track.id || index} className="relative pl-12 pb-6 last:pb-0">
                          {/* Timeline dot */}
                          <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${isFirst ? config.bg : 'bg-gray-100'} border-4 border-white shadow`}>
                            {React.createElement(config.icon, { 
                              className: `text-sm ${isFirst ? config.color : 'text-gray-400'}` 
                            })}
                          </div>
                          
                          {/* Content */}
                          <div className={`${isFirst ? 'bg-blue-50' : 'bg-gray-50'} rounded-lg p-4 relative group`}>
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h4 className={`font-semibold ${isFirst ? 'text-gray-900' : 'text-gray-600'}`}>
                                  {track.title}
                                </h4>
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
                            
                            {/* Delete button */}
                            <button
                              onClick={() => handleDeleteTracking(track.id)}
                              className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Hapus tracking ini"
                            >
                              <FaTrash className="text-xs" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <FaClock className="text-4xl mx-auto mb-3 text-gray-400" />
                    <p className="text-gray-500">Belum ada riwayat tracking</p>
                    <p className="text-gray-400 text-sm">Tambahkan tracking pertama di atas</p>
                  </div>
                )}
              </div>
      </Modal>

      {/* Create Order Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetCreateForm();
        }}
        title={t('createOrder')}
        size="4xl"
      >
            <form onSubmit={handleCreateOrder}>
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
                  
                  {/* Province & City Autocomplete */}
                  {selectedCity && selectedProvince ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-green-800">
                            <FaMapMarkerAlt className="inline mr-1" />
                            {selectedCity.name}
                          </p>
                          <p className="text-sm text-green-600">{selectedProvince}{newOrderData.shipping_postal_code ? ` - ${newOrderData.shipping_postal_code}` : ''}</p>
                        </div>
                        <button type="button" onClick={handleClearSelectedCity} className="text-green-600 hover:text-green-800">
                          <FaTimes />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {/* Province Autocomplete */}
                      <div className="relative">
                        <label className="block text-sm font-semibold mb-1">
                          <FaMapMarkerAlt className="inline mr-1" /> Provinsi
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={searchProvince}
                            onChange={(e) => handleSearchProvince(e.target.value)}
                            onFocus={() => {
                              setShowProvinceDropdown(true);
                              if (!searchProvince) setFilteredProvinces(provinces);
                            }}
                            onBlur={() => setTimeout(() => setShowProvinceDropdown(false), 200)}
                            placeholder="Ketik provinsi..."
                            className="w-full px-4 py-2 pl-10 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                            autoComplete="off"
                          />
                          <FaSearch className="absolute left-3 top-3 text-gray-400" />
                        </div>
                        {showProvinceDropdown && filteredProvinces.length > 0 && (
                          <div className="absolute z-20 w-full bg-white border rounded-lg shadow-lg mt-1 max-h-48 overflow-auto">
                            {filteredProvinces.map((prov, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleSelectProvince(prov)}
                                className={`w-full px-4 py-2 text-left hover:bg-gray-100 border-b last:border-b-0 text-sm ${
                                  selectedProvince === prov ? 'bg-blue-50 font-semibold text-blue-700' : ''
                                }`}
                              >
                                {prov}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* City Autocomplete */}
                      <div className="relative">
                        <label className="block text-sm font-semibold mb-1">
                          Kota / Kabupaten
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={searchCity}
                            onChange={(e) => handleSearchCity(e.target.value)}
                            onFocus={() => {
                              setShowCityDropdown(true);
                              if (selectedProvince && !searchCity) handleSearchCity('');
                            }}
                            onBlur={() => setTimeout(() => setShowCityDropdown(false), 200)}
                            placeholder={selectedProvince ? 'Ketik kota...' : 'Pilih provinsi dulu'}
                            className="w-full px-4 py-2 pl-10 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                            autoComplete="off"
                          />
                          <FaSearch className="absolute left-3 top-3 text-gray-400" />
                        </div>
                        {showCityDropdown && citySearchResults.length > 0 && (
                          <div className="absolute z-20 w-full bg-white border rounded-lg shadow-lg mt-1 max-h-48 overflow-auto">
                            {citySearchResults.map((city) => (
                              <button
                                key={city.id}
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleSelectCity(city)}
                                className="w-full px-4 py-2 text-left hover:bg-gray-100 border-b last:border-b-0"
                              >
                                <p className="text-sm font-medium">{city.name}</p>
                                {!selectedProvince && <p className="text-xs text-gray-500">{city.province}</p>}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
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

                  {/* Warehouse Selection */}
                  <div>
                    <label className="block text-sm font-semibold mb-1">
                      <FaWarehouse className="inline mr-1" /> Gudang Pengirim
                    </label>
                    <select
                      value={newOrderData.warehouse_id || ''}
                      onChange={(e) => handleWarehouseChange(e.target.value)}
                      className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="">-- Pilih Gudang --</option>
                      {warehouses.map((wh) => (
                        <option key={wh.id} value={wh.id}>
                          {wh.name} ({wh.city || wh.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Shipping Options */}
                  {selectedCity && newOrderData.warehouse_id && (
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <label className="block text-sm font-semibold mb-2">
                        <FaTruck className="inline mr-1" /> Pilih Kurir & Ongkos Kirim
                      </label>
                      {loadingShipping ? (
                        <div className="text-center py-4">
                          <div className="animate-spin h-6 w-6 border-2 border-gray-500 border-t-transparent rounded-full mx-auto"></div>
                          <p className="text-sm text-gray-500 mt-2">Memuat opsi pengiriman...</p>
                        </div>
                      ) : shippingOptions.length > 0 ? (
                        <div className="space-y-2 max-h-40 overflow-auto">
                          {shippingOptions.map((option, idx) => (
                            <label
                              key={idx}
                              className={`flex items-center justify-between p-3 border rounded cursor-pointer transition ${
                                selectedShipping?.id === option.id 
                                  ? 'border-black bg-white' 
                                  : 'border-gray-200 hover:border-gray-400'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name="shipping_option"
                                  checked={selectedShipping?.id === option.id}
                                  onChange={() => handleSelectShipping(option)}
                                  className="accent-black"
                                />
                                <div>
                                  <p className="font-medium">{option.courier} - {option.service || 'Regular'}</p>
                                  <p className="text-xs text-gray-500">{option.estimated_days_display}</p>
                                </div>
                              </div>
                              <span className="font-bold">{formatCurrency(option.calculated_cost || option.cost)}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <p>Tidak ada data ongkir untuk rute ini.</p>
                          <p className="text-xs mt-1">Anda bisa input manual di bawah.</p>
                        </div>
                      )}
                      
                      {/* Manual shipping cost input */}
                      <div className="mt-3 pt-3 border-t">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Atau input manual:</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Metode pengiriman"
                            value={newOrderData.shipping_method}
                            onChange={(e) => setNewOrderData({...newOrderData, shipping_method: e.target.value})}
                            className="flex-1 px-3 py-2 border rounded text-sm"
                          />
                          <input
                            type="number"
                            placeholder="Ongkir"
                            min="0"
                            value={newOrderData.shipping_cost}
                            onChange={(e) => {
                              setSelectedShipping(null);
                              setNewOrderData({...newOrderData, shipping_cost: e.target.value, shipping_cost_id: null});
                            }}
                            className="w-32 px-3 py-2 border rounded text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  )}

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
                        disabled={selectedShipping}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-1">Metode: {newOrderData.shipping_method || '-'}</p>
                      {selectedShipping && (
                        <p className="text-xs text-gray-500">
                          {selectedShipping.estimated_days_display}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Dynamic Taxes */}
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-sm font-semibold">Pajak / Tax</label>
                      <button
                        type="button"
                        onClick={handleAddTax}
                        className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        + Tambah Pajak
                      </button>
                    </div>
                    {taxes.length === 0 ? (
                      <p className="text-sm text-gray-500">Belum ada pajak. Klik tombol di atas untuk menambah.</p>
                    ) : (
                      <div className="space-y-2">
                        {taxes.map((tax, index) => (
                          <div key={index} className="flex gap-2 items-center">
                            <input
                              type="text"
                              placeholder="Keterangan (cth: PPN 11%)"
                              value={tax.description}
                              onChange={(e) => handleUpdateTax(index, 'description', e.target.value)}
                              className="flex-1 px-3 py-2 border rounded text-sm"
                            />
                            <input
                              type="number"
                              placeholder="Nominal"
                              min="0"
                              value={tax.amount}
                              onChange={(e) => handleUpdateTax(index, 'amount', e.target.value)}
                              className="w-32 px-3 py-2 border rounded text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveTax(index)}
                              className="text-red-600 hover:text-red-800 p-2"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Dynamic Discounts */}
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-sm font-semibold">Diskon</label>
                      <button
                        type="button"
                        onClick={handleAddDiscount}
                        className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                      >
                        + Tambah Diskon
                      </button>
                    </div>
                    {discounts.length === 0 ? (
                      <p className="text-sm text-gray-500">Belum ada diskon. Klik tombol di atas untuk menambah.</p>
                    ) : (
                      <div className="space-y-2">
                        {discounts.map((discount, index) => (
                          <div key={index} className="flex gap-2 items-center">
                            <input
                              type="text"
                              placeholder="Keterangan (cth: Member Discount)"
                              value={discount.description}
                              onChange={(e) => handleUpdateDiscount(index, 'description', e.target.value)}
                              className="flex-1 px-3 py-2 border rounded text-sm"
                            />
                            <input
                              type="number"
                              placeholder="Nominal"
                              min="0"
                              value={discount.amount}
                              onChange={(e) => handleUpdateDiscount(index, 'amount', e.target.value)}
                              className="w-32 px-3 py-2 border rounded text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveDiscount(index)}
                              className="text-red-600 hover:text-red-800 p-2"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
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
                    {/* Show individual taxes */}
                    {taxes.filter(t => t.amount > 0).map((tax, idx) => (
                      <div key={idx} className="flex justify-between text-sm text-blue-600">
                        <span>{tax.description || 'Pajak'}</span>
                        <span>+{formatCurrency(tax.amount)}</span>
                      </div>
                    ))}
                    {totals.taxes > 0 && taxes.filter(t => t.amount > 0).length === 0 && (
                      <div className="flex justify-between text-sm">
                        <span>{t('tax')}</span>
                        <span>{formatCurrency(totals.taxes)}</span>
                      </div>
                    )}
                    {/* Show individual discounts */}
                    {discounts.filter(d => d.amount > 0).map((disc, idx) => (
                      <div key={idx} className="flex justify-between text-sm text-green-600">
                        <span>{disc.description || 'Diskon'}</span>
                        <span>-{formatCurrency(disc.amount)}</span>
                      </div>
                    ))}
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
      </Modal>
    </>
  );
};

export default AdminOrders;
