import React, { useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaShoppingCart, FaUser, FaSearch } from 'react-icons/fa';
import { fetchCart } from '../redux/slices/cartSlice';
import { logout } from '../redux/slices/authSlice';

const MainLayout = () => {
  const dispatch = useDispatch();
  const cartState = useSelector((state) => state.cart);
  const items = cartState?.items || [];
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
  };

  const cartItemCount = Array.isArray(items) 
    ? items.reduce((total, item) => total + (item.quantity || 1), 0) 
    : 0;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link to="/" className="text-2xl font-bold text-primary-600">
              Marketplace Jeans
            </Link>

            {/* Search */}
            <div className="hidden md:flex flex-1 mx-8">
              <div className="relative w-full max-w-xl">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <FaSearch className="absolute right-3 top-3 text-gray-400" />
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex items-center space-x-6">
              <Link to="/products" className="hover:text-primary-600">
                Products
              </Link>
              
              {/* Cart */}
              <Link to="/cart" className="relative hover:text-primary-600">
                <FaShoppingCart className="text-2xl" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative group">
                  <button className="flex items-center space-x-2 hover:text-primary-600">
                    <FaUser />
                    <span>{user?.full_name}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      My Orders
                    </Link>
                    {(user?.role === 'admin' || user?.role === 'admin_stok') && (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 hover:bg-gray-100"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="hover:text-primary-600">
                  Login
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">About Us</h3>
              <p className="text-gray-400">
                Premium denim collection with the best quality and style.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/products" className="text-gray-400 hover:text-white">
                    Products
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-gray-400 hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-400 hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Customer Service</h3>
              <ul className="space-y-2">
                <li className="text-gray-400">Help Center</li>
                <li className="text-gray-400">Returns</li>
                <li className="text-gray-400">Shipping Info</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Email: info@marketplacejeans.com</li>
                <li>Phone: +62 123 456 789</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Marketplace Jeans. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
