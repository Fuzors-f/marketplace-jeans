import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FaHome, FaBox, FaShoppingBag, FaWarehouse, FaChartBar, FaUsers, FaCog, 
  FaSignOutAlt, FaImages, FaTags, FaRuler, FaUserShield, 
  FaChevronDown, FaChevronRight, FaTable, FaClipboardList, FaBoxes, FaCity, FaTruck,
  FaBars, FaTimes, FaExchangeAlt, FaHistory, FaFileImport, FaMoneyBillWave, FaArrowsAltH, FaGlobe,
  FaTicketAlt
} from 'react-icons/fa';
import { logout } from '../redux/slices/authSlice';
import { usePermissions } from '../utils/PermissionContext';

const AdminLayout = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { hasPermission, canView, isAdmin } = usePermissions();
  const [openSubmenus, setOpenSubmenus] = useState(['master', 'inventory']);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    dispatch(logout());
  };

  const toggleSubmenu = (key) => {
    setOpenSubmenus(prev => 
      prev.includes(key) 
        ? prev.filter(k => k !== key)
        : [...prev, key]
    );
  };

  const menuItems = [
    { path: '/admin', icon: FaHome, label: 'Dashboard', resource: 'dashboard' },
    { 
      key: 'master',
      icon: FaTable, 
      label: 'Master Data',
      children: [
        { path: '/admin/products', icon: FaBox, label: 'Produk', resource: 'products' },
        { path: '/admin/products/import', icon: FaFileImport, label: 'Import Produk', resource: 'products', action: 'import' },
        { path: '/admin/categories', icon: FaTags, label: 'Kategori', resource: 'categories' },
        { path: '/admin/fittings', icon: FaRuler, label: 'Fitting', resource: 'fittings' },
        { path: '/admin/sizes', icon: FaRuler, label: 'Ukuran', resource: 'sizes' },
        { path: '/admin/banners', icon: FaImages, label: 'Banner', resource: 'banners' },
        { path: '/admin/content', icon: FaGlobe, label: 'Konten Website', resource: 'content' },
        { path: '/admin/city-shipping', icon: FaTruck, label: 'Kota & Ongkir', resource: 'city_shipping' },
      ]
    },
    { path: '/admin/orders', icon: FaShoppingBag, label: 'Pesanan', resource: 'orders' },
    { path: '/admin/coupons', icon: FaTicketAlt, label: 'Kupon Diskon', resource: 'coupons' },
    { 
      key: 'inventory',
      icon: FaWarehouse, 
      label: 'Inventori',
      children: [
        { path: '/admin/inventory', icon: FaBoxes, label: 'Stok Produk', resource: 'inventory' },
        { path: '/admin/warehouses', icon: FaWarehouse, label: 'Gudang', resource: 'warehouses' },
        { path: '/admin/reports/inventory-movement', icon: FaArrowsAltH, label: 'Pergerakan Stok', resource: 'reports' },
      ]
    },
    { 
      key: 'reports',
      icon: FaChartBar, 
      label: 'Laporan',
      children: [
        { path: '/admin/reports', icon: FaChartBar, label: 'Dashboard Laporan', resource: 'reports' },
        { path: '/admin/reports/sales', icon: FaMoneyBillWave, label: 'Laporan Penjualan', resource: 'reports' },
        { path: '/admin/activity-logs', icon: FaHistory, label: 'Activity Logs', resource: 'activity_logs' },
      ]
    },
    { 
      key: 'users',
      icon: FaUsers, 
      label: 'Pengguna',
      adminOnly: true,
      children: [
        { path: '/admin/users', icon: FaUsers, label: 'Daftar User', resource: 'users' },
        { path: '/admin/roles', icon: FaUserShield, label: 'Role & Permission', resource: 'roles' },
      ]
    },
    { path: '/admin/exchange-rates', icon: FaExchangeAlt, label: 'Kurs Mata Uang', adminOnly: true, resource: 'exchange_rates' },
    { path: '/admin/settings', icon: FaCog, label: 'Pengaturan', adminOnly: true, resource: 'settings' },
  ];

  const filterMenu = (items) => {
    return items.filter(item => {
      // Admin role check
      if (item.adminOnly && user?.role !== 'admin') return false;
      
      // Permission check for menu items with resource
      if (item.resource && !isAdmin) {
        const action = item.action || 'view';
        if (!hasPermission(item.resource, action)) return false;
      }
      
      return true;
    }).map(item => {
      if (item.children) {
        const filteredChildren = filterMenu(item.children);
        // Only show parent if it has visible children
        if (filteredChildren.length === 0) return null;
        return { ...item, children: filteredChildren };
      }
      return item;
    }).filter(Boolean); // Remove null entries
  };

  const filteredMenu = filterMenu(menuItems);

  const isPathActive = (path) => location.pathname === path;
  const isSubmenuActive = (children) => children?.some(child => location.pathname === child.path);

  const getCurrentLabel = () => {
    for (const item of menuItems) {
      if (item.path === location.pathname) return item.label;
      if (item.children) {
        const child = item.children.find(c => c.path === location.pathname);
        if (child) return child.label;
      }
    }
    return 'Dashboard';
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-gray-900 text-white z-50 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-gray-800 rounded-lg transition"
        >
          {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
        <h2 className="text-lg font-bold">Admin Panel</h2>
        <Link to="/" className="text-sm text-blue-400">Toko</Link>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop & Mobile */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-gray-900 text-white overflow-y-auto
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        pt-16 lg:pt-0
      `}>
        <div className="p-4 border-b border-gray-800 hidden lg:block">
          <h2 className="text-xl font-bold">Admin Panel</h2>
          <p className="text-sm text-gray-400 truncate">{user?.full_name}</p>
        </div>

        {/* Mobile User Info */}
        <div className="p-4 border-b border-gray-800 lg:hidden">
          <p className="text-sm text-gray-400 truncate">{user?.full_name}</p>
          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
        </div>

        <nav className="mt-2 pb-4">
          {filteredMenu.map((item) => {
            if (item.children) {
              const isOpen = openSubmenus.includes(item.key);
              const isActive = isSubmenuActive(item.children);
              const Icon = item.icon;
              
              return (
                <div key={item.key}>
                  <button
                    onClick={() => toggleSubmenu(item.key)}
                    className={`flex items-center justify-between w-full px-4 lg:px-6 py-3 hover:bg-gray-800 transition ${
                      isActive ? 'bg-gray-800 text-blue-400' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="flex-shrink-0" />
                      <span className="text-sm lg:text-base">{item.label}</span>
                    </div>
                    {isOpen ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
                  </button>
                  
                  {isOpen && (
                    <div className="bg-gray-950">
                      {item.children.map(child => {
                        const ChildIcon = child.icon;
                        return (
                          <Link
                            key={child.path}
                            to={child.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center space-x-3 pl-10 lg:pl-12 pr-4 lg:pr-6 py-2.5 text-sm hover:bg-gray-800 transition ${
                              isPathActive(child.path) ? 'bg-gray-800 text-blue-400 border-l-4 border-blue-400' : 'text-gray-400'
                            }`}
                          >
                            <ChildIcon size={14} className="flex-shrink-0" />
                            <span>{child.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const Icon = item.icon;
            const isActive = isPathActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 lg:px-6 py-3 hover:bg-gray-800 transition ${
                  isActive ? 'bg-gray-800 border-l-4 border-blue-400 text-blue-400' : ''
                }`}
              >
                <Icon className="flex-shrink-0" />
                <span className="text-sm lg:text-base">{item.label}</span>
              </Link>
            );
          })}

          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 lg:px-6 py-3 w-full hover:bg-gray-800 transition text-red-400 mt-4 border-t border-gray-800 pt-4"
          >
            <FaSignOutAlt className="flex-shrink-0" />
            <span className="text-sm lg:text-base">Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto pt-14 lg:pt-0">
        {/* Desktop Header Only */}
        <header className="bg-white shadow-sm sticky top-0 z-10 hidden lg:block">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-gray-800 truncate">
                {getCurrentLabel()}
              </h1>
              <Link
                to="/"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                ← Kembali ke Toko
              </Link>
            </div>
          </div>
        </header>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
