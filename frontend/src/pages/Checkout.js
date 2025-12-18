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
    postal_code: '',
    notes: ''
  });

  // Login user form state
  const [userForm, setUserForm] = useState({
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    postal_code: user?.postal_code || '',
    notes: ''
  });

  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');

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

  const validateGuestForm = () => {
    const { email, phone, full_name, address, city, postal_code } = guestForm;
    if (!email || !phone || !full_name || !address || !city || !postal_code) {
      setError('Semua field harus diisi');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email tidak valid');
      return false;
    }
    return true;
  };

  const validateUserForm = () => {
    const { phone, address, city, postal_code } = userForm;
    if (!phone || !address || !city || !postal_code) {
      setError('Semua field harus diisi');
      return false;
    }
    return true;
  };

  const calculateShippingCost = () => {
    // Logic untuk menghitung ongkos kirim berdasarkan metode
    if (shippingMethod === 'express') return 50000;
    if (shippingMethod === 'same_day') return 100000;
    return 15000; // standard
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.price * item.quantity),
    0
  );
  const shippingCost = calculateShippingCost();
  const tax = Math.round(subtotal * 0.1); // 10% tax
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
          shipping_address: `${guestForm.address}, ${guestForm.city}, ${guestForm.postal_code}`,
          shipping_method: shippingMethod,
          payment_method: paymentMethod,
          notes: guestForm.notes,
          items: cartItems.map(item => ({
            product_id: item.product_id,
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
          shipping_address: `${userForm.address}, ${userForm.city}, ${userForm.postal_code}`,
          shipping_method: shippingMethod,
          payment_method: paymentMethod,
          notes: userForm.notes,
          items: cartItems.map(item => ({
            product_id: item.product_id,
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

                  <div className="grid grid-cols-2 gap-4">
                    {isGuest && (
                      <>
                        <div>
                          <label className="block text-sm font-semibold mb-2">Kota *</label>
                          <input
                            type="text"
                            name="city"
                            value={guestForm.city}
                            onChange={handleGuestChange}
                            required
                            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2">Kode Pos *</label>
                          <input
                            type="text"
                            name="postal_code"
                            value={guestForm.postal_code}
                            onChange={handleGuestChange}
                            required
                            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                          />
                        </div>
                      </>
                    )}

                    {!isGuest && (
                      <>
                        <div>
                          <label className="block text-sm font-semibold mb-2">Kota *</label>
                          <input
                            type="text"
                            name="city"
                            value={userForm.city}
                            onChange={handleUserChange}
                            required
                            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2">Kode Pos *</label>
                          <input
                            type="text"
                            name="postal_code"
                            value={userForm.postal_code}
                            onChange={handleUserChange}
                            required
                            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                          />
                        </div>
                      </>
                    )}
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

                {/* Shipping Method */}
                <div className="bg-white p-6 rounded shadow">
                  <h2 className="text-xl font-bold mb-4 uppercase">Metode Pengiriman</h2>
                  <div className="space-y-3">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="shipping"
                        value="standard"
                        checked={shippingMethod === 'standard'}
                        onChange={(e) => setShippingMethod(e.target.value)}
                        className="mr-3"
                      />
                      <span className="flex-1">
                        <span className="font-semibold">Standar (3-5 hari)</span>
                        <span className="text-gray-600 text-sm"> - Rp 15.000</span>
                      </span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="shipping"
                        value="express"
                        checked={shippingMethod === 'express'}
                        onChange={(e) => setShippingMethod(e.target.value)}
                        className="mr-3"
                      />
                      <span className="flex-1">
                        <span className="font-semibold">Express (1-2 hari)</span>
                        <span className="text-gray-600 text-sm"> - Rp 50.000</span>
                      </span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="shipping"
                        value="same_day"
                        checked={shippingMethod === 'same_day'}
                        onChange={(e) => setShippingMethod(e.target.value)}
                        className="mr-3"
                      />
                      <span className="flex-1">
                        <span className="font-semibold">Same Day (Hari yang sama)</span>
                        <span className="text-gray-600 text-sm"> - Rp 100.000</span>
                      </span>
                    </label>
                  </div>
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
                    <span>Pajak (10%)</span>
                    <span>Rp {tax.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pengiriman</span>
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
