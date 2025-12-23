import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loadUser } from './redux/slices/authSlice';

// Layouts
import MainLayoutNew from './layouts/MainLayoutNew';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import Home from './pages/Home';
import ProductsNew from './pages/ProductsNew';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import OrderSuccess from './pages/OrderSuccess';
import OrderTracking from './pages/OrderTracking';

// Private Pages
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import AdminBanners from './pages/admin/Banners';
import AdminInventory from './pages/admin/Inventory';
import AdminReports from './pages/admin/Reports';
import AdminUsers from './pages/admin/Users';
import AdminSettings from './pages/admin/Settings';
import AdminCategories from './pages/admin/Categories';
import AdminFittings from './pages/admin/Fittings';
import AdminSizes from './pages/admin/Sizes';
import AdminSizeChart from './pages/admin/SizeChart';
import AdminWarehouses from './pages/admin/Warehouses';
import AdminStockOpname from './pages/admin/StockOpname';
import AdminRoles from './pages/admin/Roles';
import AdminCityShipping from './pages/admin/CityShipping';

// Components
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import NotFound from './pages/NotFound';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Load user on app mount if token exists
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(loadUser());
    }
  }, [dispatch]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<MainLayoutNew />}>
        <Route index element={<Home />} />
        <Route path="products" element={<ProductsNew />} />
        <Route path="products/:slug" element={<ProductDetail />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="orders/track/:trackingNumber" element={<OrderTracking />} />
        <Route path="orders/:orderId/success" element={<OrderSuccess />} />
        
        {/* Private Routes */}
        <Route path="profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
        <Route path="orders/:orderId" element={<PrivateRoute><OrderDetail /></PrivateRoute>} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="fittings" element={<AdminFittings />} />
        <Route path="sizes" element={<AdminSizes />} />
        <Route path="size-chart" element={<AdminSizeChart />} />
        <Route path="banners" element={<AdminBanners />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="warehouses" element={<AdminWarehouses />} />
        <Route path="stock/opname" element={<AdminStockOpname />} />
        <Route path="city-shipping" element={<AdminCityShipping />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="roles" element={<AdminRoles />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
