import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart } from '../redux/slices/cartSlice';
import { logout } from '../redux/slices/authSlice';

const MainLayoutNew = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items } = useSelector((state) => state.cart);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openMegaMenu, setOpenMegaMenu] = useState(null);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const cartItemCount = items?.reduce((total, item) => total + (item.quantity || 0), 0) || 0;

  const megaMenus = {
    pria: [
      {
        title: 'BOTTOMS',
        items: ['Celana Jeans', 'Celana Chino', 'Celana Cargo', 'Shorts']
      },
      {
        title: 'TOPS',
        items: ['Kemeja', 'T-Shirt', 'Polo Shirt', 'Hoodie']
      },
      {
        title: 'JACKETS',
        items: ['Denim Jacket', 'Bomber Jacket', 'Varsity Jacket']
      },
      {
        title: 'BY FIT',
        items: ['Slim Fit', 'Regular Fit', 'Baggy Fit', 'Tapered Fit']
      }
    ],
    wanita: [
      {
        title: 'BOTTOMS',
        items: ['Celana Jeans', 'Celana Kulot', 'Celana Jogger', 'Shorts']
      },
      {
        title: 'TOPS',
        items: ['Blouse', 'T-Shirt', 'Crop Top', 'Cardigan']
      },
      {
        title: 'JACKETS',
        items: ['Denim Jacket', 'Blazer', 'Bomber Jacket']
      },
      {
        title: 'BY FIT',
        items: ['Skinny Fit', 'Mom Fit', 'Boyfriend Fit', 'Barrel Fit']
      }
    ]
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Bar - Promo */}
      <div className="bg-black text-white text-center py-2 text-sm">
        <p>
          Belanja 24 jam, Pengembalian gratis 14 hari. <Link to="/pages/returns" className="underline">Pelajari lebih lanjut!</Link>
        </p>
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link to="/" className="text-2xl md:text-3xl font-bold text-black uppercase tracking-wider">
              JEANS<span className="text-red-600">®</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8 flex-1 justify-center">
              {/* Wanita Menu */}
              <div
                className="relative group"
                onMouseEnter={() => setOpenMegaMenu('wanita')}
                onMouseLeave={() => setOpenMegaMenu(null)}
              >
                <Link
                  to="/products?gender=wanita"
                  className="font-semibold hover:underline uppercase tracking-wide"
                >
                  WANITA
                </Link>
                
                {/* Mega Menu */}
                {openMegaMenu === 'wanita' && (
                  <div className="absolute left-0 top-full mt-2 bg-white shadow-xl border-t-2 border-black w-screen -ml-[50vw] left-[50%]">
                    <div className="container mx-auto px-4 py-8">
                      <div className="grid grid-cols-4 gap-8">
                        {megaMenus.wanita.map((section) => (
                          <div key={section.title}>
                            <h3 className="font-bold mb-4 text-sm uppercase tracking-wider">
                              {section.title}
                            </h3>
                            <ul className="space-y-2">
                              {section.items.map((item) => (
                                <li key={item}>
                                  <Link
                                    to={`/products?gender=wanita&category=${item.toLowerCase().replace(' ', '-')}`}
                                    className="text-gray-600 hover:text-black hover:underline text-sm"
                                  >
                                    {item}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Pria Menu */}
              <div
                className="relative group"
                onMouseEnter={() => setOpenMegaMenu('pria')}
                onMouseLeave={() => setOpenMegaMenu(null)}
              >
                <Link
                  to="/products?gender=pria"
                  className="font-semibold hover:underline uppercase tracking-wide"
                >
                  PRIA
                </Link>
                
                {/* Mega Menu */}
                {openMegaMenu === 'pria' && (
                  <div className="absolute left-0 top-full mt-2 bg-white shadow-xl border-t-2 border-black w-screen -ml-[50vw] left-[50%]">
                    <div className="container mx-auto px-4 py-8">
                      <div className="grid grid-cols-4 gap-8">
                        {megaMenus.pria.map((section) => (
                          <div key={section.title}>
                            <h3 className="font-bold mb-4 text-sm uppercase tracking-wider">
                              {section.title}
                            </h3>
                            <ul className="space-y-2">
                              {section.items.map((item) => (
                                <li key={item}>
                                  <Link
                                    to={`/products?gender=pria&category=${item.toLowerCase().replace(' ', '-')}`}
                                    className="text-gray-600 hover:text-black hover:underline text-sm"
                                  >
                                    {item}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Link
                to="/products?new=true"
                className="font-semibold hover:underline uppercase tracking-wide"
              >
                KOLEKSI BARU
              </Link>
              
              <Link
                to="/products?discount=true"
                className="font-semibold hover:underline uppercase tracking-wide text-red-600"
              >
                DISKON
              </Link>
            </nav>

            {/* Right Icons */}
            <div className="flex items-center space-x-6">
              {/* Search Icon */}
              <button className="hover:text-gray-600 hidden md:block">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Wishlist Icon */}
              <Link to="/wishlist" className="hover:text-gray-600 hidden md:block">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </Link>

              {/* Cart */}
              <Link to="/cart" className="relative hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {cartItemCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative group">
                  <button className="hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </button>
                  <div className="absolute right-0 mt-2 w-56 bg-white shadow-xl border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <div className="px-4 py-3 border-b">
                      <p className="font-semibold">{user?.full_name}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 hover:bg-gray-50 text-sm"
                    >
                      Profil Saya
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-4 py-2 hover:bg-gray-50 text-sm"
                    >
                      Pesanan Saya
                    </Link>
                    {(user?.role === 'admin' || user?.role === 'admin_stok') && (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 hover:bg-gray-50 text-sm border-t"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600 text-sm border-t"
                    >
                      Keluar
                    </button>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="md:hidden pb-4">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border focus:outline-none focus:ring-2 focus:ring-black"
              />
            </form>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t">
            <div className="container mx-auto px-4 py-4">
              <nav className="space-y-4">
                <Link
                  to="/products?gender=wanita"
                  className="block font-semibold uppercase tracking-wide"
                  onClick={() => setIsMenuOpen(false)}
                >
                  WANITA
                </Link>
                <Link
                  to="/products?gender=pria"
                  className="block font-semibold uppercase tracking-wide"
                  onClick={() => setIsMenuOpen(false)}
                >
                  PRIA
                </Link>
                <Link
                  to="/products?new=true"
                  className="block font-semibold uppercase tracking-wide"
                  onClick={() => setIsMenuOpen(false)}
                >
                  KOLEKSI BARU
                </Link>
                <Link
                  to="/products?discount=true"
                  className="block font-semibold uppercase tracking-wide text-red-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  DISKON
                </Link>
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Column 1 - Bantuan */}
            <div>
              <h3 className="font-bold mb-4 uppercase tracking-wider">BANTUAN</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <Link to="/pages/contact" className="hover:text-white hover:underline">
                    Hubungi Kami
                  </Link>
                </li>
                <li>
                  <Link to="/pages/faq" className="hover:text-white hover:underline">
                    Pertanyaan Umum
                  </Link>
                </li>
                <li>
                  <Link to="/pages/returns" className="hover:text-white hover:underline">
                    Pengembalian
                  </Link>
                </li>
                <li>
                  <Link to="/pages/store-locator" className="hover:text-white hover:underline">
                    Temukan Toko
                  </Link>
                </li>
                <li>
                  <Link to="/pages/track-order" className="hover:text-white hover:underline">
                    Melacak Pesanan
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2 - Perusahaan */}
            <div>
              <h3 className="font-bold mb-4 uppercase tracking-wider">PERUSAHAAN</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <Link to="/pages/about" className="hover:text-white hover:underline">
                    Tentang Kami
                  </Link>
                </li>
                <li>
                  <Link to="/pages/privacy" className="hover:text-white hover:underline">
                    Kebijakan Privasi
                  </Link>
                </li>
                <li>
                  <Link to="/pages/terms" className="hover:text-white hover:underline">
                    Syarat & Ketentuan
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3 - Tautan Langsung */}
            <div>
              <h3 className="font-bold mb-4 uppercase tracking-wider">TAUTAN LANGSUNG</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <Link to="/pages/membership" className="hover:text-white hover:underline">
                    Program Member
                  </Link>
                </li>
                <li>
                  <Link to="/pages/store-locator" className="hover:text-white hover:underline">
                    Temukan Toko
                  </Link>
                </li>
                <li>
                  <Link to="/pages/jean-fit-guide" className="hover:text-white hover:underline">
                    Panduan Jeans
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4 - Social Media */}
            <div>
              <h3 className="font-bold mb-4 uppercase tracking-wider">IKUTI KAMI</h3>
              <div className="flex space-x-4">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-400 transition"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-400 transition"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                  </svg>
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-400 transition"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
              <p>© 2025 Marketplace Jeans. All rights reserved.</p>
              <div className="flex space-x-4 mt-4 md:mt-0">
                <Link to="/pages/privacy" className="hover:text-white">
                  Kebijakan Privasi
                </Link>
                <span>·</span>
                <Link to="/pages/terms" className="hover:text-white">
                  Syarat Layanan
                </Link>
                <span>·</span>
                <Link to="/pages/shipping" className="hover:text-white">
                  Kebijakan Pengiriman
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayoutNew;
