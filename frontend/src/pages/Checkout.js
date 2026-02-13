import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import apiClient from '../services/api';
import { useAlert } from '../utils/AlertContext';
import { useSettings } from '../utils/SettingsContext';

const Checkout = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { showError, showSuccess } = useAlert();
  const { midtransEnabled, getSetting } = useSettings();

  // Cart state - fetch from API instead of Redux
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartLoading, setCartLoading] = useState(true);

  const [isGuest, setIsGuest] = useState(!isAuthenticated);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Guest form state
  const [guestForm, setGuestForm] = useState({
    email: '',
    phone: '',
    full_name: '',
    address: '',
    city: '',
    city_id: null,
    province: '',
    postal_code: '',
    notes: ''
  });

  // Login user form state
  const [userForm, setUserForm] = useState({
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    city_id: null,
    province: '',
    postal_code: user?.postal_code || '',
    notes: ''
  });

  // User saved addresses
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [saveNewAddress, setSaveNewAddress] = useState(true); // Auto-save new address
  const [addressLabel, setAddressLabel] = useState('Rumah');
  const [savingAddress, setSavingAddress] = useState(false);

  // Shipping state (no warehouse selection - handled by admin)
  const [searchCity, setSearchCity] = useState('');
  const [citySearchResults, setCitySearchResults] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [loadingShipping, setLoadingShipping] = useState(false);
  
  const [paymentMethod, setPaymentMethod] = useState('');

  // Set default payment method based on available options
  useEffect(() => {
    if (midtransEnabled) {
      setPaymentMethod('midtrans');
    } else if (getSetting('payment_bank_transfer_enabled', 'true') === 'true') {
      setPaymentMethod('bank_transfer');
    } else {
      setPaymentMethod('cod');
    }
  }, [midtransEnabled, getSetting]);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  // Fetch cart from API on mount
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setCartLoading(true);
      const response = await apiClient.get('/cart');
      if (response.data.success) {
        const cartData = response.data.data;
        setCartItems(cartData.items || []);
        setCartTotal(cartData.total || 0);
        
        // Redirect if cart is empty
        if (!cartData.items || cartData.items.length === 0) {
          navigate('/cart');
        }
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
      showError('Gagal memuat keranjang');
      navigate('/cart');
    } finally {
      setCartLoading(false);
    }
  };

  // Fetch user's saved addresses if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchSavedAddresses();
    }
  }, [isAuthenticated]);

  const fetchSavedAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const response = await apiClient.get('/addresses');
      const addresses = response.data.data || [];
      setSavedAddresses(addresses);
      
      // Auto-select primary/default address or first address
      const primaryAddress = addresses.find(a => a.is_default);
      if (primaryAddress) {
        setSelectedAddressId(primaryAddress.id);
        selectAddress(primaryAddress);
      } else if (addresses.length > 0) {
        setSelectedAddressId(addresses[0].id);
        selectAddress(addresses[0]);
      } else {
        setUseNewAddress(true);
      }
    } catch (err) {
      console.error('Error fetching saved addresses:', err);
      setUseNewAddress(true);
    } finally {
      setLoadingAddresses(false);
    }
  };

  // Select an address and populate form
  const selectAddress = async (address) => {
    setUserForm({
      phone: address.phone || user?.phone || '',
      address: address.address || '',
      city: address.city || '',
      city_id: address.city_id || null,
      province: address.province || '',
      postal_code: address.postal_code || '',
      notes: ''
    });
    
    // If address has city_id, use it directly
    if (address.city_id) {
      setSelectedCity({ id: address.city_id, name: address.city });
      calculateShippingAuto(address.city_id);
    } else if (address.city) {
      // Look up city_id by city name
      try {
        const response = await apiClient.get(`/cities?search=${encodeURIComponent(address.city)}&limit=5`);
        const cities = response.data.data || [];
        // Find exact match or first result
        const matchedCity = cities.find(c => c.name.toLowerCase() === address.city.toLowerCase()) || cities[0];
        if (matchedCity) {
          setSelectedCity(matchedCity);
          setUserForm(prev => ({
            ...prev,
            city_id: matchedCity.id,
            province: matchedCity.province || prev.province
          }));
          calculateShippingAuto(matchedCity.id);
        }
      } catch (err) {
        console.error('Error looking up city:', err);
      }
    }
  };

  // Update form when user changes
  useEffect(() => {
    if (isAuthenticated && user && useNewAddress) {
      setUserForm({
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        city_id: null,
        province: '',
        postal_code: user.postal_code || '',
        notes: ''
      });
    }
  }, [user, isAuthenticated, useNewAddress]);

  const handleGuestChange = (e) => {
    const { name, value } = e.target;
    setGuestForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Search cities
  const handleSearchCity = async (search) => {
    setSearchCity(search);
    if (search.length >= 2) {
      try {
        const response = await apiClient.get(`/cities?search=${encodeURIComponent(search)}&limit=10`);
        setCitySearchResults(response.data.data || []);
      } catch (err) {
        console.error('Error searching cities:', err);
        setCitySearchResults([]);
      }
    } else {
      setCitySearchResults([]);
    }
  };

  // Calculate shipping automatically with main warehouse
  const calculateShippingAuto = async (cityId) => {
    setLoadingShipping(true);
    try {
      // Get main warehouse
      const warehouseRes = await apiClient.get('/warehouses?active_only=true');
      const warehouses = warehouseRes.data.data || [];
      const mainWarehouse = warehouses.find(w => w.is_main) || warehouses[0];
      
      if (mainWarehouse && cityId) {
        const response = await apiClient.post('/shipping-costs/calculate', {
          city_id: cityId,
          warehouse_id: mainWarehouse.id,
          weight: 1
        });
        const options = response.data.data || [];
        setShippingOptions(options);
        if (options.length > 0) {
          setSelectedShipping(options[0]);
        }
      }
    } catch (err) {
      console.error('Error calculating shipping:', err);
      setShippingOptions([]);
    } finally {
      setLoadingShipping(false);
    }
  };

  // Select city
  const handleSelectCity = async (city) => {
    setSelectedCity(city);
    setSearchCity('');
    setCitySearchResults([]);
    
    if (isGuest) {
      setGuestForm(prev => ({
        ...prev,
        city: city.name,
        city_id: city.id,
        province: city.province,
        postal_code: city.postal_code || prev.postal_code
      }));
    } else {
      setUserForm(prev => ({
        ...prev,
        city: city.name,
        city_id: city.id,
        province: city.province,
        postal_code: city.postal_code || prev.postal_code
      }));
    }
    
    // Calculate shipping automatically
    await calculateShippingAuto(city.id);
  };

  // Clear city selection
  const handleClearCity = () => {
    setSelectedCity(null);
    setSelectedShipping(null);
    setShippingOptions([]);
    if (isGuest) {
      setGuestForm(prev => ({ ...prev, city: '', city_id: null, province: '' }));
    } else {
      setUserForm(prev => ({ ...prev, city: '', city_id: null, province: '' }));
    }
  };

  // Handle saved address selection
  const handleAddressSelection = (addressId) => {
    if (addressId === 'new') {
      setSelectedAddressId(null);
      setUseNewAddress(true);
      setSelectedCity(null);
      setShippingOptions([]);
      setSelectedShipping(null);
      setUserForm({
        phone: user?.phone || '',
        address: '',
        city: '',
        city_id: null,
        province: '',
        postal_code: '',
        notes: ''
      });
    } else {
      setSelectedAddressId(addressId);
      setUseNewAddress(false);
      const address = savedAddresses.find(a => a.id === parseInt(addressId));
      if (address) {
        selectAddress(address);
      }
    }
  };

  // Save new address to user's address book
  const saveAddressToBook = async () => {
    if (!isAuthenticated || !user?.id) return null;
    
    try {
      setSavingAddress(true);
      const addressData = {
        address_label: addressLabel || 'Alamat Baru',
        recipient_name: user?.name || user?.full_name || '',
        phone: userForm.phone,
        address: userForm.address,
        city: userForm.city,
        province: userForm.province,
        postal_code: userForm.postal_code,
        country: 'Indonesia',
        is_default: savedAddresses.length === 0 // Set as default if no existing addresses
      };

      const response = await apiClient.post('/addresses', addressData);
      
      // Refresh saved addresses
      const addressesRes = await apiClient.get('/addresses');
      setSavedAddresses(addressesRes.data.data || []);
      
      return response.data.data;
    } catch (err) {
      console.error('Error saving address:', err);
      return null;
    } finally {
      setSavingAddress(false);
    }
  };

  const validateGuestForm = () => {
    const { email, phone, full_name, address, city, province, postal_code } = guestForm;
    const errors = [];
    
    if (!email) errors.push('Email harus diisi');
    if (!phone) errors.push('Nomor telepon harus diisi');
    if (!full_name) errors.push('Nama lengkap harus diisi');
    if (!address) errors.push('Alamat lengkap harus diisi');
    if (!city) errors.push('Kota harus dipilih');
    if (!province) errors.push('Provinsi harus diisi');
    if (!postal_code) errors.push('Kode pos harus diisi');
    
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push('Format email tidak valid');
      }
    }
    
    if (phone) {
      const phoneRegex = /^[0-9+\-\s()]{8,20}$/;
      if (!phoneRegex.test(phone)) {
        errors.push('Format nomor telepon tidak valid');
      }
    }
    
    if (errors.length > 0) {
      const errorMessage = errors.join('\n• ');
      setError('• ' + errorMessage);
      showError('Data belum lengkap:\n• ' + errorMessage, 'Lengkapi Data');
      return false;
    }
    
    return true;
  };

  const validateUserForm = () => {
    const { phone, address, city, province, postal_code } = userForm;
    const errors = [];
    
    if (!phone) errors.push('Nomor telepon harus diisi');
    if (!address) errors.push('Alamat lengkap harus diisi');
    if (!city) errors.push('Kota harus dipilih');
    if (!province) errors.push('Provinsi harus diisi');
    if (!postal_code) errors.push('Kode pos harus diisi');
    
    if (errors.length > 0) {
      const errorMessage = errors.join('\n• ');
      setError('• ' + errorMessage);
      showError('Data belum lengkap:\n• ' + errorMessage, 'Lengkapi Data');
      return false;
    }
    
    return true;
  };

  // Coupon handlers
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Masukkan kode kupon');
      return;
    }

    setCouponLoading(true);
    setCouponError('');

    try {
      const response = await apiClient.post('/coupons/validate', {
        code: couponCode.toUpperCase(),
        subtotal: subtotal,
        user_id: user?.id || null,
        guest_email: isGuest ? guestForm.email : null
      });

      if (response.data.success) {
        setAppliedCoupon(response.data.data);
        setCouponCode('');
      }
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Kupon tidak valid');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  // Get shipping cost from selected option
  const getShippingCost = () => {
    if (selectedShipping) {
      return selectedShipping.calculated_cost || selectedShipping.cost || 0;
    }
    return 0;
  };

  const calculateShippingCost = () => {
    return getShippingCost();
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.price * item.quantity),
    0
  );
  const shippingCost = calculateShippingCost();
  const couponDiscount = appliedCoupon?.discount_amount || 0;
  const tax = Math.round((subtotal - couponDiscount) * 0.11); // 11% tax after discount
  const total = subtotal + shippingCost + tax - couponDiscount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isGuest) {
        if (!validateGuestForm()) {
          setLoading(false);
          return;
        }

        // Create guest order
        const orderData = {
          guest_email: guestForm.email,
          shipping_address: {
            recipient_name: guestForm.full_name,
            phone: guestForm.phone,
            address: guestForm.address,
            city: guestForm.city,
            province: guestForm.province,
            postal_code: guestForm.postal_code,
            country: 'Indonesia'
          },
          shipping_cost_id: selectedShipping?.id || null,
          courier: selectedShipping?.courier || '',
          shipping_method: selectedShipping ? `${selectedShipping.courier} - ${selectedShipping.service || 'Regular'}` : 'Standard',
          payment_method: paymentMethod,
          notes: guestForm.notes || null,
          coupon_id: appliedCoupon?.id || null,
          coupon_code: appliedCoupon?.code || null,
          coupon_discount: couponDiscount,
          items: cartItems.map(item => ({
            product_variant_id: item.variant_id,
            quantity: item.quantity,
            price: item.price
          }))
        };

        const response = await apiClient.post('/orders', orderData);
        
        setSuccessMessage('Order berhasil dibuat!');
        setTimeout(() => {
          navigate(`/orders/${response.data.data.id}`, { 
            state: { orderId: response.data.data.id, isGuest: true } 
          });
        }, 2000);
      } else {
        if (!validateUserForm()) {
          setLoading(false);
          return;
        }

        // Save new address if option selected and using new address
        if (saveNewAddress && (useNewAddress || savedAddresses.length === 0)) {
          await saveAddressToBook();
        }

        // Create user order
        const orderData = {
          shipping_address: {
            recipient_name: user?.name || user?.full_name || '',
            phone: userForm.phone || user?.phone || '',
            address: userForm.address,
            city: userForm.city,
            province: userForm.province,
            postal_code: userForm.postal_code,
            country: 'Indonesia'
          },
          shipping_cost_id: selectedShipping?.id || null,
          courier: selectedShipping?.courier || '',
          shipping_method: selectedShipping ? `${selectedShipping.courier} - ${selectedShipping.service || 'Regular'}` : 'Standard',
          payment_method: paymentMethod,
          notes: userForm.notes || null,
          coupon_id: appliedCoupon?.id || null,
          coupon_code: appliedCoupon?.code || null,
          coupon_discount: couponDiscount,
          items: cartItems.map(item => ({
            product_variant_id: item.variant_id,
            quantity: item.quantity,
            price: item.price
          }))
        };

        const response = await apiClient.post('/orders', orderData);
        
        setSuccessMessage('Order berhasil dibuat!');
        showSuccess('Order berhasil dibuat! Anda akan diarahkan ke halaman pesanan.', 'Berhasil');
        setTimeout(() => {
          navigate('/orders');
        }, 2000);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Gagal membuat order';
      setError(errMsg);
      showError(errMsg, 'Gagal Checkout');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data checkout...</p>
        </div>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Keranjang kosong</p>
          <button 
            onClick={() => navigate('/cart')}
            className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            Kembali ke Keranjang
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Checkout - Marketplace Jeans</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8 uppercase tracking-wide">CHECKOUT</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              {error && (
                <div className="mb-6 p-4 bg-red-100 text-red-700 rounded">
                  {error}
                </div>
              )}
              {successMessage && (
                <div className="mb-6 p-4 bg-green-100 text-green-700 rounded">
                  {successMessage}
                </div>
              )}

              {/* Guest vs Login Toggle */}
              {!isAuthenticated && (
                <div className="mb-8 p-4 bg-white rounded shadow">
                  <p className="mb-4 font-semibold">Sudah memiliki akun?</p>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setIsGuest(true)}
                      className={`flex-1 py-2 rounded font-semibold transition ${
                        isGuest
                          ? 'bg-black text-white'
                          : 'bg-gray-200 text-black hover:bg-gray-300'
                      }`}
                    >
                      Lanjutkan Sebagai Guest
                    </button>
                    <Link
                      to="/login?redirect=/checkout"
                      className="flex-1 py-2 rounded font-semibold text-center bg-gray-200 text-black hover:bg-gray-300 transition"
                    >
                      Masuk & Checkout
                    </Link>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Shipping Information */}
                <div className="bg-white p-6 rounded shadow">
                  <h2 className="text-xl font-bold mb-4 uppercase">Informasi Pengiriman</h2>

                  {isGuest && (
                    <>
                      <div className="mb-4">
                        <label className="block text-sm font-semibold mb-2">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={guestForm.email}
                          onChange={handleGuestChange}
                          required
                          placeholder="email@example.com"
                          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-semibold mb-2">
                          Nama Lengkap <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="full_name"
                          value={guestForm.full_name}
                          onChange={handleGuestChange}
                          required
                          placeholder="Nama penerima"
                          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-semibold mb-2">
                          No. Telepon <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={guestForm.phone}
                          onChange={handleGuestChange}
                          required
                          placeholder="08xxxxxxxxxx"
                          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>
                    </>
                  )}

                  {isAuthenticated && (
                    <>
                      <div className="mb-4 p-3 bg-gray-100 rounded">
                        <p className="text-sm">
                          <span className="font-semibold">Nama:</span> {user?.name}
                        </p>
                        <p className="text-sm">
                          <span className="font-semibold">Email:</span> {user?.email}
                        </p>
                      </div>

                      {/* Saved Address Selection */}
                      {loadingAddresses ? (
                        <div className="text-center py-4">
                          <div className="animate-spin h-6 w-6 border-2 border-gray-500 border-t-transparent rounded-full mx-auto"></div>
                          <p className="text-sm text-gray-500 mt-2">Memuat alamat tersimpan...</p>
                        </div>
                      ) : savedAddresses.length === 0 ? (
                        // No saved addresses - show message and form to add new address
                        <div className="mb-4">
                          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                            <p className="text-sm text-yellow-800">
                              <strong>Belum ada alamat tersimpan.</strong><br/>
                              Silakan isi alamat pengiriman di bawah. Alamat akan otomatis disimpan untuk order berikutnya.
                            </p>
                          </div>
                          {/* Address Label */}
                          <div className="mb-4">
                            <label className="block text-sm font-semibold mb-2">Label Alamat</label>
                            <select
                              value={addressLabel}
                              onChange={(e) => setAddressLabel(e.target.value)}
                              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                            >
                              <option value="Rumah">Rumah</option>
                              <option value="Kantor">Kantor</option>
                              <option value="Apartemen">Apartemen</option>
                              <option value="Kos">Kos</option>
                              <option value="Lainnya">Lainnya</option>
                            </select>
                          </div>
                          {/* Phone Number */}
                          <div className="mb-4">
                            <label className="block text-sm font-semibold mb-2">
                              No. Telepon Penerima <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="tel"
                              name="phone"
                              value={userForm.phone}
                              onChange={handleUserChange}
                              required
                              placeholder="08xxxxxxxxxx"
                              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="mb-4">
                          <label className="block text-sm font-semibold mb-2">Pilih Alamat Pengiriman</label>
                          <div className="space-y-2">
                            {savedAddresses.map((addr) => (
                              <label
                                key={addr.id}
                                className={`block p-3 border rounded cursor-pointer transition ${
                                  selectedAddressId === addr.id && !useNewAddress
                                    ? 'border-black bg-gray-50'
                                    : 'border-gray-200 hover:border-gray-400'
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <input
                                    type="radio"
                                    name="saved_address"
                                    checked={selectedAddressId === addr.id && !useNewAddress}
                                    onChange={() => handleAddressSelection(addr.id)}
                                    className="accent-black mt-1"
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold">{addr.address_label || addr.label || 'Alamat'}</span>
                                      {addr.is_default && (
                                        <span className="text-xs bg-black text-white px-2 py-0.5 rounded">Utama</span>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{addr.recipient_name}</p>
                                    <p className="text-sm text-gray-600">{addr.phone}</p>
                                    <p className="text-sm text-gray-500 mt-1">{addr.address}</p>
                                    <p className="text-sm text-gray-500">{addr.city}, {addr.province} {addr.postal_code}</p>
                                  </div>
                                </div>
                              </label>
                            ))}
                            
                            {/* Option to add new address */}
                            <label
                              className={`block p-3 border rounded cursor-pointer transition ${
                                useNewAddress
                                  ? 'border-black bg-gray-50'
                                  : 'border-gray-200 hover:border-gray-400 border-dashed'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="radio"
                                  name="saved_address"
                                  checked={useNewAddress}
                                  onChange={() => handleAddressSelection('new')}
                                  className="accent-black"
                                />
                                <span className="font-semibold">+ Gunakan Alamat Baru</span>
                              </div>
                            </label>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* New Address Fields when using new address (for users with existing addresses) */}
                  {isAuthenticated && useNewAddress && savedAddresses.length > 0 && (
                    <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <h4 className="font-semibold mb-3">Detail Alamat Baru</h4>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2">Label Alamat</label>
                          <select
                            value={addressLabel}
                            onChange={(e) => setAddressLabel(e.target.value)}
                            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                          >
                            <option value="Rumah">Rumah</option>
                            <option value="Kantor">Kantor</option>
                            <option value="Apartemen">Apartemen</option>
                            <option value="Kos">Kos</option>
                            <option value="Lainnya">Lainnya</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2">
                            No. Telepon <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={userForm.phone}
                            onChange={handleUserChange}
                            required
                            placeholder="08xxxxxxxxxx"
                            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                          />
                        </div>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={saveNewAddress}
                          onChange={(e) => setSaveNewAddress(e.target.checked)}
                          className="accent-black"
                        />
                        <span className="text-sm">Simpan alamat untuk order berikutnya</span>
                      </label>
                    </div>
                  )}

                  {isGuest && (
                    <div className="mb-4">
                      <label className="block text-sm font-semibold mb-2">
                        Alamat Lengkap <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="address"
                        value={guestForm.address}
                        onChange={handleGuestChange}
                        required
                        rows="3"
                        placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan"
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  )}

                  {!isGuest && (useNewAddress || savedAddresses.length === 0) && (
                    <div className="mb-4">
                      <label className="block text-sm font-semibold mb-2">
                        Alamat Lengkap <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="address"
                        value={userForm.address}
                        onChange={handleUserChange}
                        required
                        rows="3"
                        placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan"
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  )}

                  {/* City Search with autocomplete - show for guest or new address */}
                  {(isGuest || useNewAddress || savedAddresses.length === 0) && (
                    <div className="mb-4">
                      <label className="block text-sm font-semibold mb-2">
                        Kota Tujuan <span className="text-red-500">*</span>
                      </label>
                      {!selectedCity ? (
                        <div className="relative">
                          <input
                            type="text"
                            value={searchCity}
                            onChange={(e) => handleSearchCity(e.target.value)}
                            placeholder="Cari kota..."
                            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                          />
                          {citySearchResults.length > 0 && (
                            <div className="absolute z-10 w-full bg-white border rounded-lg shadow-lg mt-1 max-h-60 overflow-auto">
                              {citySearchResults.map((city) => (
                                <button
                                  key={city.id}
                                  type="button"
                                  onClick={() => handleSelectCity(city)}
                                  className="w-full px-4 py-3 text-left hover:bg-gray-100 border-b last:border-b-0"
                                >
                                  <p className="font-medium">{city.name}</p>
                                  <p className="text-sm text-gray-500">{city.province}</p>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-green-800">{selectedCity.name}</p>
                              <p className="text-sm text-green-600">{selectedCity.province}</p>
                            </div>
                            <button type="button" onClick={handleClearCity} className="text-green-600 hover:text-green-800">
                              ✕
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Show selected city for saved address */}
                  {!isGuest && !useNewAddress && selectedAddressId && savedAddresses.length > 0 && selectedCity && (
                    <div className="mb-4">
                      <label className="block text-sm font-semibold mb-2">Kota Tujuan</label>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="font-medium text-green-800">{selectedCity.name}</p>
                        <p className="text-sm text-green-600">{userForm.province}</p>
                      </div>
                    </div>
                  )}

                  {(isGuest || useNewAddress || savedAddresses.length === 0) && (
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          Kode Pos <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="postal_code"
                          value={isGuest ? guestForm.postal_code : userForm.postal_code}
                          onChange={isGuest ? handleGuestChange : handleUserChange}
                          required
                          placeholder="12345"
                          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Provinsi</label>
                        <input
                          type="text"
                          value={isGuest ? guestForm.province : userForm.province}
                          disabled
                          className="w-full px-4 py-2 border rounded bg-gray-100"
                        />
                      </div>
                    </div>
                  )}

                  <div className="mt-4">
                    <label className="block text-sm font-semibold mb-2">Catatan (Opsional)</label>
                    <textarea
                      name="notes"
                      value={isGuest ? guestForm.notes : userForm.notes}
                      onChange={isGuest ? handleGuestChange : handleUserChange}
                      rows="2"
                      placeholder="Contoh: Tidak ada di rumah, silakan beri ke tetangga"
                      className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>

                {/* Shipping Selection */}
                <div className="bg-white p-6 rounded shadow">
                  <h2 className="text-xl font-bold mb-4 uppercase">Pilih Pengiriman</h2>
                  
                  {/* Shipping Options */}
                  {selectedCity ? (
                    <div>
                      <label className="block text-sm font-semibold mb-2">Pilih Kurir:</label>
                      {loadingShipping ? (
                        <div className="text-center py-4">
                          <div className="animate-spin h-6 w-6 border-2 border-gray-500 border-t-transparent rounded-full mx-auto"></div>
                          <p className="text-sm text-gray-500 mt-2">Memuat opsi pengiriman...</p>
                        </div>
                      ) : shippingOptions.length > 0 ? (
                        <div className="space-y-2">
                          {shippingOptions.map((option, idx) => (
                            <label
                              key={idx}
                              className={`flex items-center justify-between p-3 border rounded cursor-pointer transition ${
                                selectedShipping?.id === option.id 
                                  ? 'border-black bg-gray-50' 
                                  : 'border-gray-200 hover:border-gray-400'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="radio"
                                  name="shipping_option"
                                  checked={selectedShipping?.id === option.id}
                                  onChange={() => setSelectedShipping(option)}
                                  className="accent-black"
                                />
                                <div>
                                  <p className="font-semibold">{option.courier} - {option.service || 'Regular'}</p>
                                  <p className="text-xs text-gray-500">{option.estimated_days_display}</p>
                                </div>
                              </div>
                              <span className="font-bold">Rp {(option.calculated_cost || option.cost).toLocaleString('id-ID')}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500 bg-gray-50 rounded">
                          <p>Tidak ada opsi pengiriman tersedia untuk rute ini.</p>
                          <p className="text-xs mt-1">Silakan hubungi customer service.</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500 bg-gray-50 rounded">
                      <p>Pilih alamat pengiriman untuk melihat opsi pengiriman.</p>
                    </div>
                  )}
                </div>

                {/* Payment Method */}
                <div className="bg-white p-6 rounded shadow">
                  <h2 className="text-xl font-bold mb-4 uppercase">Metode Pembayaran</h2>
                  <div className="space-y-3">
                    {/* Midtrans Payment - Online Payment Gateway */}
                    {midtransEnabled && (
                      <label className="flex items-center cursor-pointer p-3 border rounded-lg hover:bg-blue-50 transition">
                        <input
                          type="radio"
                          name="payment"
                          value="midtrans"
                          checked={paymentMethod === 'midtrans'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="mr-3"
                        />
                        <div>
                          <span className="font-semibold">Pembayaran Online (Midtrans)</span>
                          <p className="text-xs text-gray-500">Credit Card, GoPay, OVO, DANA, VA Bank, QRIS</p>
                        </div>
                      </label>
                    )}
                    
                    {/* Bank Transfer */}
                    {getSetting('payment_bank_transfer_enabled', 'true') === 'true' && (
                      <label className="flex items-center cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition">
                        <input
                          type="radio"
                          name="payment"
                          value="bank_transfer"
                          checked={paymentMethod === 'bank_transfer'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="mr-3"
                        />
                        <div>
                          <span className="font-semibold">Transfer Bank Manual</span>
                          {getSetting('payment_bank_name') && (
                            <p className="text-xs text-gray-500">
                              {getSetting('payment_bank_name')} - {getSetting('payment_bank_account')} a/n {getSetting('payment_bank_holder')}
                            </p>
                          )}
                        </div>
                      </label>
                    )}
                    
                    {/* COD */}
                    <label className="flex items-center cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition">
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <div>
                        <span className="font-semibold">Bayar di Tempat (COD)</span>
                        <p className="text-xs text-gray-500">Bayar saat barang tiba</p>
                      </div>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white py-3 font-bold uppercase tracking-wider hover:bg-gray-900 disabled:opacity-50 transition"
                >
                  {loading ? 'Processing...' : 'Lanjutkan ke Pembayaran'}
                </button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded shadow sticky top-4">
                <h2 className="text-xl font-bold mb-6 uppercase">Ringkasan Pesanan</h2>

                <div className="space-y-3 mb-6 pb-6 border-b">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <div className="flex-1">
                        <span>{item.name || item.product_name} x{item.quantity}</span>
                        {item.size_name && <span className="text-gray-500 text-xs ml-1">({item.size_name})</span>}
                        {item.original_price && item.price < item.original_price && (
                          <div className="text-xs text-green-600">
                            <span className="line-through text-gray-400">Rp {(item.original_price * item.quantity).toLocaleString('id-ID')}</span>
                            <span className="ml-1">-{Math.round((1 - item.price / item.original_price) * 100)}%</span>
                          </div>
                        )}
                      </div>
                      <span className="font-semibold">
                        Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Coupon Section */}
                <div className="mb-6 pb-6 border-b">
                  <h3 className="text-sm font-semibold mb-3">Punya Kupon?</h3>
                  {appliedCoupon ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-mono font-bold text-green-700">{appliedCoupon.code}</p>
                          <p className="text-xs text-green-600">{appliedCoupon.name}</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="text-red-500 text-sm hover:underline"
                        >
                          Hapus
                        </button>
                      </div>
                      <p className="text-sm text-green-700 mt-2 font-semibold">
                        -Rp {appliedCoupon.discount_amount.toLocaleString('id-ID')}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="Masukkan kode"
                          className="flex-1 px-3 py-2 border rounded text-sm uppercase focus:outline-none focus:ring-2 focus:ring-black"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={couponLoading}
                          className="px-4 py-2 bg-black text-white text-sm rounded hover:bg-gray-800 disabled:opacity-50"
                        >
                          {couponLoading ? '...' : 'Pakai'}
                        </button>
                      </div>
                      {couponError && (
                        <p className="text-xs text-red-500 mt-2">{couponError}</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-3 mb-6 pb-6 border-b text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600">
                      <span>Diskon ({appliedCoupon.code})</span>
                      <span>-Rp {couponDiscount.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Pajak (11%)</span>
                    <span>Rp {tax.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <span>Pengiriman</span>
                      {selectedShipping && (
                        <p className="text-xs text-gray-500">
                          {selectedShipping.courier} - {selectedShipping.service || 'Regular'}
                        </p>
                      )}
                    </div>
                    <span>Rp {shippingCost.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <div className="flex justify-between text-lg font-bold mb-6">
                  <span>Total</span>
                  <span className="text-red-600">Rp {total.toLocaleString('id-ID')}</span>
                </div>

                <Link
                  to="/cart"
                  className="block text-center text-blue-600 hover:underline text-sm font-semibold"
                >
                  Kembali ke Keranjang
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;
