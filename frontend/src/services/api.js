import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Get or create session ID for guest users
const getSessionId = () => {
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include token and session ID
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Add session ID for guest cart functionality
    config.headers['x-session-id'] = getSessionId();
    
    // Remove Content-Type for FormData (let browser set it with boundary)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// =====================================
// CATEGORIES API
// =====================================

export const categoryAPI = {
  getAll: () => apiClient.get('/categories'),
  getBySlug: (slug) => apiClient.get(`/categories/${slug}`),
  create: (data) => apiClient.post('/categories', data),
  update: (id, data) => apiClient.put(`/categories/${id}`, data),
  delete: (id) => apiClient.delete(`/categories/${id}`)
};

// =====================================
// FITTINGS API
// =====================================

export const fittingAPI = {
  getAll: () => apiClient.get('/fittings'),
  create: (data) => apiClient.post('/fittings', data),
  update: (id, data) => apiClient.put(`/fittings/${id}`, data),
  delete: (id) => apiClient.delete(`/fittings/${id}`)
};

// =====================================
// SIZES API
// =====================================

export const sizeAPI = {
  getAll: () => apiClient.get('/sizes'),
  create: (data) => apiClient.post('/sizes', data),
  update: (id, data) => apiClient.put(`/sizes/${id}`, data),
  delete: (id) => apiClient.delete(`/sizes/${id}`)
};

// =====================================
// PRODUCTS API
// =====================================

export const productAPI = {
  getAll: (params) => apiClient.get('/products', { params }),
  getBySlug: (slug) => apiClient.get(`/products/${slug}`),
  create: (data) => apiClient.post('/products', data),
  update: (id, data) => apiClient.put(`/products/${id}`, data),
  delete: (id) => apiClient.delete(`/products/${id}`),
  
  // Variants
  createVariant: (productId, data) => apiClient.post(`/products/${productId}/variants`, data),
  updateVariant: (variantId, data) => apiClient.put(`/products/variants/${variantId}`, data),
  deleteVariant: (variantId) => apiClient.delete(`/products/variants/${variantId}`),
  
  // Images
  createImage: (productId, data) => apiClient.post(`/products/${productId}/images`, data),
  deleteImage: (imageId) => apiClient.delete(`/products/images/${imageId}`)
};

// =====================================
// CART API
// =====================================

export const cartAPI = {
  getCart: () => apiClient.get('/cart'),
  addItem: (data) => apiClient.post('/cart', data),
  updateItem: (itemId, data) => apiClient.put(`/cart/${itemId}`, data),
  removeItem: (itemId) => apiClient.delete(`/cart/${itemId}`),
  clear: () => apiClient.delete('/cart')
};

// =====================================
// ORDERS API
// =====================================

export const orderAPI = {
  getAll: (params) => apiClient.get('/orders', { params }),
  getById: (id) => apiClient.get(`/orders/${id}`),
  create: (data) => apiClient.post('/orders', data),
  track: (trackingNumber) => apiClient.get(`/orders/track/${trackingNumber}`)
};

// =====================================
// AUTH API
// =====================================

export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
  logout: () => apiClient.post('/auth/logout'),
  getMe: () => apiClient.get('/auth/me')
};

// =====================================
// USER API
// =====================================

export const userAPI = {
  getProfile: () => apiClient.get('/users/profile'),
  updateProfile: (data) => apiClient.put('/users/profile', data),
  updatePassword: (data) => apiClient.put('/users/password', data),
  changePassword: (data) => apiClient.put('/auth/change-password', data),
  uploadProfilePicture: (formData) => apiClient.post('/auth/profile-picture', formData),
  getAddresses: () => apiClient.get('/addresses'),
  getAddress: (id) => apiClient.get(`/addresses/${id}`),
  createAddress: (data) => apiClient.post('/addresses', data),
  updateAddress: (id, data) => apiClient.put(`/addresses/${id}`, data),
  deleteAddress: (id) => apiClient.delete(`/addresses/${id}`),
  setDefaultAddress: (id) => apiClient.put(`/addresses/${id}/default`)
};

// =====================================
// SETTINGS API
// =====================================

export const settingsAPI = {
  getPublic: () => apiClient.get('/settings'),
  getAll: () => apiClient.get('/settings/all'),
  init: () => apiClient.post('/settings/init'),
  update: (key, value) => apiClient.put(`/settings/${key}`, { value }),
  bulkUpdate: (settings) => apiClient.put('/settings', { settings }),
  uploadImage: (formData) => apiClient.post('/settings/upload', formData),
  uploadImageForKey: (key, formData) => apiClient.post(`/settings/upload/${key}`, formData),
  testEmail: (email) => apiClient.post('/settings/test-email', { email }),
  clearCache: () => apiClient.post('/settings/clear-cache'),
  getPaymentConfig: () => apiClient.get('/settings/payment-config')
};

// =====================================
// PAYMENT API
// =====================================

export const paymentAPI = {
  createPayment: (data) => apiClient.post('/payments/create', data),
  createCharge: (data) => apiClient.post('/payments/charge', data),
  getStatus: (paymentId) => apiClient.get(`/payments/${paymentId}/status`),
  getByOrder: (orderId) => apiClient.get(`/payments/order/${orderId}`),
  cancel: (paymentId) => apiClient.post(`/payments/${paymentId}/cancel`)
};

// =====================================
// CITIES API
// =====================================

export const cityAPI = {
  getAll: (params) => apiClient.get('/cities', { params }),
  getById: (id) => apiClient.get(`/cities/${id}`),
  getProvinces: () => apiClient.get('/cities/provinces'),
  getByProvince: (province) => apiClient.get(`/cities/province/${province}`),
  create: (data) => apiClient.post('/cities', data),
  update: (id, data) => apiClient.put(`/cities/${id}`, data),
  delete: (id) => apiClient.delete(`/cities/${id}`),
  bulkCreate: (data) => apiClient.post('/cities/bulk', data)
};

// =====================================
// SHIPPING COSTS API
// =====================================

export const shippingCostAPI = {
  getAll: (params) => apiClient.get('/shipping-costs', { params }),
  getById: (id) => apiClient.get(`/shipping-costs/${id}`),
  calculate: (data) => apiClient.post('/shipping-costs/calculate', data),
  getCouriers: () => apiClient.get('/shipping-costs/couriers'),
  search: (params) => apiClient.get('/shipping-costs/search', { params }),
  create: (data) => apiClient.post('/shipping-costs', data),
  update: (id, data) => apiClient.put(`/shipping-costs/${id}`, data),
  delete: (id) => apiClient.delete(`/shipping-costs/${id}`),
  bulkCreate: (data) => apiClient.post('/shipping-costs/bulk', data)
};

// =====================================
// COUPONS API
// =====================================

export const couponAPI = {
  getAll: (params) => apiClient.get('/coupons', { params }),
  getById: (id) => apiClient.get(`/coupons/${id}`),
  getPublic: () => apiClient.get('/coupons/public'),
  getStats: () => apiClient.get('/coupons/stats'),
  validate: (data) => apiClient.post('/coupons/validate', data),
  create: (data) => apiClient.post('/coupons', data),
  update: (id, data) => apiClient.put(`/coupons/${id}`, data),
  delete: (id) => apiClient.delete(`/coupons/${id}`)
};

export default apiClient;
