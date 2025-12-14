import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaHome, FaBox, FaShoppingBag, FaWarehouse, FaChartBar, FaUsers, FaCog, FaSignOutAlt, FaImages, FaTags, FaRuler } from 'react-icons/fa';
import { logout } from '../redux/slices/authSlice';

const AdminLayout = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  const menuItems = [
    { path: '/admin', icon: FaHome, label: 'Dashboard' },
    { path: '/admin/products', icon: FaBox, label: 'Products' },
    { path: '/admin/categories', icon: FaTags, label: 'Categories' },
    { path: '/admin/fittings', icon: FaRuler, label: 'Fittings' },
    { path: '/admin/sizes', icon: FaRuler, label: 'Sizes' },
    { path: '/admin/banners', icon: FaImages, label: 'Banners' },
    { path: '/admin/orders', icon: FaShoppingBag, label: 'Orders' },
    { path: '/admin/inventory', icon: FaWarehouse, label: 'Inventory' },
    { path: '/admin/reports', icon: FaChartBar, label: 'Reports' },
    { path: '/admin/users', icon: FaUsers, label: 'Users', adminOnly: true },
    { path: '/admin/settings', icon: FaCog, label: 'Settings', adminOnly: true },
  ];

  const filteredMenu = menuItems.filter(item => {
    if (item.adminOnly && user?.role !== 'admin') return false;
    return true;
  });

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white">
        <div className="p-4">
          <h2 className="text-xl font-bold">Admin Panel</h2>
          <p className="text-sm text-gray-400">{user?.full_name}</p>
        </div>

        <nav className="mt-4">
          {filteredMenu.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-6 py-3 hover:bg-gray-800 transition ${
                  isActive ? 'bg-gray-800 border-l-4 border-primary-500' : ''
                }`}
              >
                <Icon />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-6 py-3 w-full hover:bg-gray-800 transition text-red-400"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-gray-800">
                {filteredMenu.find(item => item.path === location.pathname)?.label || 'Dashboard'}
              </h1>
              <Link
                to="/"
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Back to Store
              </Link>
            </div>
          </div>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
