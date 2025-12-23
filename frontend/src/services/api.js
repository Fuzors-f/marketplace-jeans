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
// PAYMENT API
// =====================================

export const paymentAPI = {
  createPayment: (orderId, data) => apiClient.post(`/payments/orders/${orderId}`, data),
  getStatus: (transactionId) => apiClient.get(`/payments/${transactionId}`)
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
  getAddresses: () => apiClient.get('/users/addresses'),
  createAddress: (data) => apiClient.post('/users/addresses', data),
  updateAddress: (id, data) => apiClient.put(`/users/addresses/${id}`, data),
  deleteAddress: (id) => apiClient.delete(`/users/addresses/${id}`)
};

export default apiClient;
