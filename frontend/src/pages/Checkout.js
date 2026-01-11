import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import apiClient from '../services/api';

const Checkout = () => {
  const navigate = useNavigate();
  const { items: cartItems } = useSelector((state) => state.cart);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

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

  // Warehouse and shipping state
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [searchCity, setSearchCity] = useState('');
  const [citySearchResults, setCitySearchResults] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [loadingShipping, setLoadingShipping] = useState(false);
  
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');

  // Fetch warehouses on mount
  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      const response = await apiClient.get('/warehouses?active_only=true');
      const warehouseList = response.data.data || [];
      setWarehouses(warehouseList);
      // Auto-select main warehouse if available
      const mainWarehouse = warehouseList.find(w => w.is_main);
      if (mainWarehouse) {
        setSelectedWarehouse(mainWarehouse);
      }
    } catch (err) {
      console.error('Error fetching warehouses:', err);
    }
  };

  // Redirect if no cart items
  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  // Update form when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
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
  }, [user, isAuthenticated]);

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
    
    // Calculate shipping if warehouse is selected
    if (selectedWarehouse) {
      await calculateShipping(city.id, selectedWarehouse.id);
    }
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

  // Handle warehouse selection
  const handleWarehouseChange = async (warehouseId) => {
    const warehouse = warehouses.find(w => w.id === parseInt(warehouseId));
    setSelectedWarehouse(warehouse || null);
    setSelectedShipping(null);
    
    // Recalculate shipping
    const cityId = isGuest ? guestForm.city_id : userForm.city_id;
    if (cityId && warehouse) {
      await calculateShipping(cityId, warehouse.id);
    } else {
      setShippingOptions([]);
    }
  };

  // Calculate shipping options
  const calculateShipping = async (cityId, warehouseId) => {
    setLoadingShipping(true);
    try {
      const response = await apiClient.post('/shipping-costs/calculate', {
        city_id: cityId,
        warehouse_id: warehouseId,
        weight: 1
      });
      const options = response.data.data || [];
      setShippingOptions(options);
      // Auto-select first option
      if (options.length > 0) {
        setSelectedShipping(options[0]);
      }
    } catch (err) {
      console.error('Error calculating shipping:', err);
      setShippingOptions([]);
    } finally {
      setLoadingShipping(false);
    }
  };

  const validateGuestForm = () => {
    const { email, phone, full_name, address, city, province, postal_code } = guestForm;
    
    if (!email) {
      setError('Email harus diisi');
      return false;
    }
    if (!phone) {
      setError('Nomor telepon harus diisi');
      return false;
    }
    if (!full_name) {
      setError('Nama lengkap harus diisi');
      return false;
    }
    if (!address) {
      setError('Alamat lengkap harus diisi');
      return false;
    }
    if (!city) {
      setError('Kota harus diisi');
      return false;
    }
    if (!province) {
      setError('Provinsi harus diisi');
      return false;
    }
    if (!postal_code) {
      setError('Kode pos harus diisi');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email tidak valid');
      return false;
    }
    
    // Phone validation
    const phoneRegex = /^[0-9+\-\s()]{8,20}$/;
    if (!phoneRegex.test(phone)) {
      setError('Nomor telepon tidak valid');
      return false;
    }
    
    return true;
  };

  const validateUserForm = () => {
    const { phone, address, city, province, postal_code } = userForm;
    
    if (!phone) {
      setError('Nomor telepon harus diisi');
      return false;
    }
    if (!address) {
      setError('Alamat harus diisi');
      return false;
    }
    if (!city) {
      setError('Kota harus diisi');
      return false;
    }
    if (!province) {
      setError('Provinsi harus diisi');
      return false;
    }
    if (!postal_code) {
      setError('Kode pos harus diisi');
      return false;
    }
    
    return true;
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
  const tax = Math.round(subtotal * 0.11); // 11% tax
  const total = subtotal + shippingCost + tax;

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
          customer_name: guestForm.full_name,
          customer_email: guestForm.email,
          customer_phone: guestForm.phone,
          shipping_address: guestForm.address,
          shipping_city: guestForm.city,
          shipping_city_id: guestForm.city_id,
          shipping_province: guestForm.province,
          shipping_postal_code: guestForm.postal_code,
          warehouse_id: selectedWarehouse?.id || null,
          shipping_cost_id: selectedShipping?.id || null,
          courier: selectedShipping?.courier || '',
          shipping_method: selectedShipping ? `${selectedShipping.courier} - ${selectedShipping.service || 'Regular'}` : 'Standard',
          payment_method: paymentMethod,
          notes: guestForm.notes,
          items: cartItems.map(item => ({
            product_variant_id: item.variant_id,
            quantity: item.quantity,
            price: item.price
          })),
          subtotal,
          shipping_cost: shippingCost,
          tax,
          total
        };

        const response = await apiClient.post('/orders/guest', orderData);
        
        setSuccessMessage('Order berhasil dibuat! Silakan lanjut ke pembayaran.');
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

        // Create user order
        const orderData = {
          shipping_address: userForm.address,
          shipping_city: userForm.city,
          shipping_city_id: userForm.city_id,
          shipping_province: userForm.province,
          shipping_postal_code: userForm.postal_code,
          warehouse_id: selectedWarehouse?.id || null,
          shipping_cost_id: selectedShipping?.id || null,
          courier: selectedShipping?.courier || '',
          shipping_method: selectedShipping ? `${selectedShipping.courier} - ${selectedShipping.service || 'Regular'}` : 'Standard',
          payment_method: paymentMethod,
          notes: userForm.notes,
          items: cartItems.map(item => ({
            product_variant_id: item.variant_id,
            quantity: item.quantity,
            price: item.price
          })),
          subtotal,
          shipping_cost: shippingCost,
          tax,
          total
        };

        const response = await apiClient.post('/orders', orderData);
        
        setSuccessMessage('Order berhasil dibuat! Silakan lanjut ke pembayaran.');
        setTimeout(() => {
          navigate(`/orders/${response.data.data.id}`, { 
            state: { orderId: response.data.data.id, isGuest: false } 
          });
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal membuat order');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!cartItems || cartItems.length === 0) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
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
                        <label className="block text-sm font-semibold mb-2">Email *</label>
                        <input
                          type="email"
                          name="email"
                          value={guestForm.email}
                          onChange={handleGuestChange}
                          required
                          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-semibold mb-2">Nama Lengkap *</label>
                        <input
                          type="text"
                          name="full_name"
                          value={guestForm.full_name}
                          onChange={handleGuestChange}
                          required
                          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-semibold mb-2">No. Telepon *</label>
                        <input
                          type="tel"
                          name="phone"
                          value={guestForm.phone}
                          onChange={handleGuestChange}
                          required
                          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>
                    </>
                  )}

                  {isAuthenticated && (
                    <div className="mb-4 p-3 bg-gray-100 rounded">
                      <p className="text-sm">
                        <span className="font-semibold">Nama:</span> {user?.name}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Email:</span> {user?.email}
                      </p>
                    </div>
                  )}

                  {isGuest && (
                    <div className="mb-4">
                      <label className="block text-sm font-semibold mb-2">Alamat *</label>
                      <textarea
                        name="address"
                        value={guestForm.address}
                        onChange={handleGuestChange}
                        required
                        rows="3"
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  )}

                  {!isGuest && (
                    <div className="mb-4">
                      <label className="block text-sm font-semibold mb-2">Alamat *</label>
                      <textarea
                        name="address"
                        value={userForm.address}
                        onChange={handleUserChange}
                        required
                        rows="3"
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  )}

                  {/* City Search with autocomplete */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold mb-2">Kota Tujuan *</label>
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

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Kode Pos *</label>
                      <input
                        type="text"
                        name="postal_code"
                        value={isGuest ? guestForm.postal_code : userForm.postal_code}
                        onChange={isGuest ? handleGuestChange : handleUserChange}
                        required
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

                {/* Warehouse & Shipping Selection */}
                <div className="bg-white p-6 rounded shadow">
                  <h2 className="text-xl font-bold mb-4 uppercase">Pilih Gudang & Pengiriman</h2>
                  
                  {/* Warehouse Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold mb-2">Dikirim dari Gudang:</label>
                    <select
                      value={selectedWarehouse?.id || ''}
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
                  {selectedCity && selectedWarehouse ? (
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
                      <p>Pilih kota tujuan dan gudang pengirim untuk melihat opsi pengiriman.</p>
                    </div>
                  )}
                </div>

                {/* Payment Method */}
                <div className="bg-white p-6 rounded shadow">
                  <h2 className="text-xl font-bold mb-4 uppercase">Metode Pembayaran</h2>
                  <div className="space-y-3">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="payment"
                        value="bank_transfer"
                        checked={paymentMethod === 'bank_transfer'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <span className="font-semibold">Transfer Bank</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="payment"
                        value="credit_card"
                        checked={paymentMethod === 'credit_card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <span className="font-semibold">Kartu Kredit</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="payment"
                        value="e_wallet"
                        checked={paymentMethod === 'e_wallet'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <span className="font-semibold">E-Wallet (OVO, DANA, GCash)</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <span className="font-semibold">Bayar di Tempat (COD)</span>
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
                      <span>{item.name} x{item.quantity}</span>
                      <span className="font-semibold">
                        Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 mb-6 pb-6 border-b text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                  </div>
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
