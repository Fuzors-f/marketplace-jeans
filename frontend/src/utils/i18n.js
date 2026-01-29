// Internationalization (i18n) utility for bilingual support (English/Indonesian)
import React, { createContext, useContext, useState, useEffect } from 'react';

// Translation dictionaries
const translations = {
  id: {
    // Navigation
    home: 'Beranda',
    products: 'Produk',
    catalog: 'Katalog',
    cart: 'Keranjang',
    checkout: 'Checkout',
    login: 'Masuk',
    register: 'Daftar',
    logout: 'Keluar',
    profile: 'Profil',
    myProfile: 'Profil Saya',
    myOrders: 'Pesanan Saya',
    myWishlist: 'Wishlist Saya',
    adminDashboard: 'Dashboard Admin',
    wishlist: 'Wishlist',
    search: 'Cari',
    loginRegister: 'Masuk / Daftar',
    viewAll: 'Lihat Semua',
    
    // Header/Promo
    promoText: 'Belanja 24 jam, Pengembalian gratis 14 hari.',
    learnMore: 'Pelajari lebih lanjut!',
    
    // Categories
    women: 'Wanita',
    men: 'Pria',
    newCollection: 'Koleksi Baru',
    sale: 'Diskon',
    bottoms: 'Celana',
    tops: 'Atasan',
    jackets: 'Jaket',
    byFit: 'Berdasarkan Fit',
    
    // Product
    addToCart: 'Tambah ke Keranjang',
    buyNow: 'Beli Sekarang',
    selectSize: 'Pilih Ukuran',
    selectVariant: 'Pilih Varian',
    stock: 'Stok',
    outOfStock: 'Stok Habis',
    available: 'Tersedia',
    productNotFound: 'Produk Tidak Ditemukan',
    productNotAvailable: 'Produk yang Anda cari tidak tersedia',
    backToCatalog: 'Kembali ke Katalog',
    description: 'Deskripsi',
    specifications: 'Spesifikasi',
    reviews: 'Ulasan',
    relatedProducts: 'Produk Terkait',
    quantity: 'Jumlah',
    price: 'Harga',
    total: 'Total',
    weight: 'Berat',
    category: 'Kategori',
    fitting: 'Fitting',
    sku: 'SKU',
    
    // Cart
    shoppingCart: 'Keranjang Belanja',
    emptyCart: 'Keranjang Anda kosong',
    continueShopping: 'Lanjut Belanja',
    subtotal: 'Subtotal',
    shippingCost: 'Ongkos Kirim',
    discount: 'Diskon',
    tax: 'Pajak',
    grandTotal: 'Total Keseluruhan',
    proceedToCheckout: 'Lanjut ke Pembayaran',
    removeItem: 'Hapus',
    updateQuantity: 'Perbarui Jumlah',
    
    // Checkout
    shippingAddress: 'Alamat Pengiriman',
    recipientName: 'Nama Penerima',
    phone: 'Telepon',
    address: 'Alamat',
    city: 'Kota',
    province: 'Provinsi',
    postalCode: 'Kode Pos',
    country: 'Negara',
    paymentMethod: 'Metode Pembayaran',
    placeOrder: 'Buat Pesanan',
    orderSummary: 'Ringkasan Pesanan',
    discountCode: 'Kode Diskon',
    applyCode: 'Terapkan',
    notes: 'Catatan',
    
    // Orders
    orders: 'Pesanan',
    orderNumber: 'Nomor Pesanan',
    orderDate: 'Tanggal Pesanan',
    orderStatus: 'Status Pesanan',
    paymentStatus: 'Status Pembayaran',
    trackingNumber: 'Nomor Resi',
    orderDetails: 'Detail Pesanan',
    orderItems: 'Item Pesanan',
    orderHistory: 'Riwayat Pesanan',
    noOrders: 'Tidak ada pesanan',
    viewDetails: 'Lihat Detail',
    
    // Order Status
    pending: 'Menunggu',
    confirmed: 'Dikonfirmasi',
    processing: 'Diproses',
    shipped: 'Dikirim',
    delivered: 'Diterima',
    cancelled: 'Dibatalkan',
    paid: 'Dibayar',
    failed: 'Gagal',
    refunded: 'Dikembalikan',
    
    // Admin
    dashboard: 'Dashboard',
    masterData: 'Master Data',
    categories: 'Kategori',
    fittings: 'Fitting',
    sizes: 'Ukuran',
    sizeChart: 'Tabel Ukuran',
    banners: 'Banner',
    cityShipping: 'Kota & Ongkir',
    inventory: 'Inventori',
    productStock: 'Stok Produk',
    warehouses: 'Gudang',
    stockOpname: 'Stock Opname',
    reports: 'Laporan',
    users: 'Pengguna',
    userList: 'Daftar User',
    rolesPermissions: 'Role & Permission',
    settings: 'Pengaturan',
    
    // Admin Orders
    orderManagement: 'Manajemen Pesanan',
    manageCustomerOrders: 'Kelola semua pesanan pelanggan',
    createOrder: 'Buat Pesanan',
    newOrder: 'Pesanan Baru',
    customer: 'Pelanggan',
    guest: 'Tamu',
    filterOrders: 'Filter Pesanan',
    allStatus: 'Semua Status',
    updateStatus: 'Update Status',
    addTracking: 'Tambah Resi',
    orderInfo: 'Info Pesanan',
    customerInfo: 'Info Pelanggan',
    
    // Admin Products
    productManagement: 'Manajemen Produk',
    addProduct: 'Tambah Produk',
    editProduct: 'Edit Produk',
    deleteProduct: 'Hapus Produk',
    productName: 'Nama Produk',
    productSlug: 'Slug Produk',
    basePrice: 'Harga Dasar',
    costPrice: 'Harga Modal',
    productImages: 'Gambar Produk',
    uploadImages: 'Upload Gambar',
    variants: 'Varian',
    addVariant: 'Tambah Varian',
    selectSizes: 'Pilih Ukuran',
    selectWarehouses: 'Pilih Gudang',
    additionalPrice: 'Harga Tambahan',
    minimumStock: 'Stok Minimum',
    
    // Common Actions
    save: 'Simpan',
    cancel: 'Batal',
    delete: 'Hapus',
    edit: 'Edit',
    view: 'Lihat',
    add: 'Tambah',
    update: 'Perbarui',
    close: 'Tutup',
    confirm: 'Konfirmasi',
    back: 'Kembali',
    next: 'Selanjutnya',
    previous: 'Sebelumnya',
    submit: 'Kirim',
    reset: 'Reset',
    filter: 'Filter',
    export: 'Ekspor',
    import: 'Impor',
    refresh: 'Refresh',
    
    // Messages
    success: 'Berhasil',
    error: 'Error',
    warning: 'Peringatan',
    info: 'Informasi',
    loading: 'Memuat...',
    saving: 'Menyimpan...',
    deleting: 'Menghapus...',
    confirmDelete: 'Yakin ingin menghapus?',
    noData: 'Tidak ada data',
    required: 'Wajib diisi',
    invalidEmail: 'Email tidak valid',
    invalidPhone: 'Nomor telepon tidak valid',
    passwordMismatch: 'Password tidak cocok',
    loginRequired: 'Silakan login terlebih dahulu',
    
    // Footer
    help: 'Bantuan',
    company: 'Perusahaan',
    quickLinks: 'Tautan',
    customerService: 'Layanan Pelanggan',
    shippingInfo: 'Info Pengiriman',
    returnPolicy: 'Kebijakan Pengembalian',
    returns: 'Pengembalian',
    faq: 'Pertanyaan Umum',
    contactUs: 'Hubungi Kami',
    aboutUs: 'Tentang Kami',
    privacyPolicy: 'Kebijakan Privasi',
    termsConditions: 'Syarat & Ketentuan',
    termsOfService: 'Syarat Layanan',
    shippingPolicy: 'Kebijakan Pengiriman',
    followUs: 'Ikuti Kami',
    newsletter: 'Newsletter',
    subscribeNewsletter: 'Berlangganan newsletter kami',
    findStore: 'Temukan Toko',
    trackOrder: 'Melacak Pesanan',
    memberProgram: 'Program Member',
    jeansGuide: 'Panduan Jeans',
    enterEmail: 'Masukkan email Anda',
    subscribe: 'Berlangganan',
    allRightsReserved: 'Hak cipta dilindungi',
    
    // Language
    language: 'Bahasa',
    indonesian: 'Indonesia',
    english: 'English',
    switchLanguage: 'Ganti Bahasa',
  },
  
  en: {
    // Navigation
    home: 'Home',
    products: 'Products',
    catalog: 'Catalog',
    cart: 'Cart',
    checkout: 'Checkout',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    profile: 'Profile',
    myProfile: 'My Profile',
    myOrders: 'My Orders',
    myWishlist: 'My Wishlist',
    adminDashboard: 'Admin Dashboard',
    wishlist: 'Wishlist',
    search: 'Search',
    loginRegister: 'Login / Register',
    viewAll: 'View All',
    
    // Header/Promo
    promoText: 'Shop 24/7, Free returns within 14 days.',
    learnMore: 'Learn more!',
    
    // Categories
    women: 'Women',
    men: 'Men',
    newCollection: 'New Collection',
    sale: 'Sale',
    bottoms: 'Bottoms',
    tops: 'Tops',
    jackets: 'Jackets',
    byFit: 'By Fit',
    
    // Product
    addToCart: 'Add to Cart',
    buyNow: 'Buy Now',
    selectSize: 'Select Size',
    selectVariant: 'Select Variant',
    stock: 'Stock',
    outOfStock: 'Out of Stock',
    available: 'Available',
    productNotFound: 'Product Not Found',
    productNotAvailable: 'The product you are looking for is not available',
    backToCatalog: 'Back to Catalog',
    description: 'Description',
    specifications: 'Specifications',
    reviews: 'Reviews',
    relatedProducts: 'Related Products',
    quantity: 'Quantity',
    price: 'Price',
    total: 'Total',
    weight: 'Weight',
    category: 'Category',
    fitting: 'Fitting',
    sku: 'SKU',
    
    // Cart
    shoppingCart: 'Shopping Cart',
    emptyCart: 'Your cart is empty',
    continueShopping: 'Continue Shopping',
    subtotal: 'Subtotal',
    shippingCost: 'Shipping Cost',
    discount: 'Discount',
    tax: 'Tax',
    grandTotal: 'Grand Total',
    proceedToCheckout: 'Proceed to Checkout',
    removeItem: 'Remove',
    updateQuantity: 'Update Quantity',
    
    // Checkout
    shippingAddress: 'Shipping Address',
    recipientName: 'Recipient Name',
    phone: 'Phone',
    address: 'Address',
    city: 'City',
    province: 'Province',
    postalCode: 'Postal Code',
    country: 'Country',
    paymentMethod: 'Payment Method',
    placeOrder: 'Place Order',
    orderSummary: 'Order Summary',
    discountCode: 'Discount Code',
    applyCode: 'Apply',
    notes: 'Notes',
    
    // Orders
    orders: 'Orders',
    orderNumber: 'Order Number',
    orderDate: 'Order Date',
    orderStatus: 'Order Status',
    paymentStatus: 'Payment Status',
    trackingNumber: 'Tracking Number',
    orderDetails: 'Order Details',
    orderItems: 'Order Items',
    orderHistory: 'Order History',
    noOrders: 'No orders',
    viewDetails: 'View Details',
    
    // Order Status
    pending: 'Pending',
    confirmed: 'Confirmed',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    paid: 'Paid',
    failed: 'Failed',
    refunded: 'Refunded',
    
    // Admin
    dashboard: 'Dashboard',
    masterData: 'Master Data',
    categories: 'Categories',
    fittings: 'Fittings',
    sizes: 'Sizes',
    sizeChart: 'Size Chart',
    banners: 'Banners',
    cityShipping: 'City & Shipping',
    inventory: 'Inventory',
    productStock: 'Product Stock',
    warehouses: 'Warehouses',
    stockOpname: 'Stock Opname',
    reports: 'Reports',
    users: 'Users',
    userList: 'User List',
    rolesPermissions: 'Roles & Permissions',
    settings: 'Settings',
    
    // Admin Orders
    orderManagement: 'Order Management',
    manageCustomerOrders: 'Manage all customer orders',
    createOrder: 'Create Order',
    newOrder: 'New Order',
    customer: 'Customer',
    guest: 'Guest',
    filterOrders: 'Filter Orders',
    allStatus: 'All Status',
    updateStatus: 'Update Status',
    addTracking: 'Add Tracking',
    orderInfo: 'Order Info',
    customerInfo: 'Customer Info',
    
    // Admin Products
    productManagement: 'Product Management',
    addProduct: 'Add Product',
    editProduct: 'Edit Product',
    deleteProduct: 'Delete Product',
    productName: 'Product Name',
    productSlug: 'Product Slug',
    basePrice: 'Base Price',
    costPrice: 'Cost Price',
    productImages: 'Product Images',
    uploadImages: 'Upload Images',
    variants: 'Variants',
    addVariant: 'Add Variant',
    selectSizes: 'Select Sizes',
    selectWarehouses: 'Select Warehouses',
    additionalPrice: 'Additional Price',
    minimumStock: 'Minimum Stock',
    
    // Common Actions
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    add: 'Add',
    update: 'Update',
    close: 'Close',
    confirm: 'Confirm',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    submit: 'Submit',
    reset: 'Reset',
    filter: 'Filter',
    export: 'Export',
    import: 'Import',
    refresh: 'Refresh',
    
    // Messages
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Information',
    loading: 'Loading...',
    saving: 'Saving...',
    deleting: 'Deleting...',
    confirmDelete: 'Are you sure you want to delete?',
    noData: 'No data available',
    required: 'Required',
    invalidEmail: 'Invalid email',
    invalidPhone: 'Invalid phone number',
    passwordMismatch: 'Passwords do not match',
    loginRequired: 'Please login first',
    
    // Footer
    help: 'Help',
    company: 'Company',
    quickLinks: 'Quick Links',
    customerService: 'Customer Service',
    shippingInfo: 'Shipping Info',
    returnPolicy: 'Return Policy',
    returns: 'Returns',
    faq: 'FAQ',
    contactUs: 'Contact Us',
    aboutUs: 'About Us',
    privacyPolicy: 'Privacy Policy',
    termsConditions: 'Terms & Conditions',
    termsOfService: 'Terms of Service',
    shippingPolicy: 'Shipping Policy',
    followUs: 'Follow Us',
    newsletter: 'Newsletter',
    subscribeNewsletter: 'Subscribe to our newsletter',
    enterEmail: 'Enter your email',
    subscribe: 'Subscribe',
    findStore: 'Find Store',
    trackOrder: 'Track Order',
    memberProgram: 'Member Program',
    jeansGuide: 'Jeans Guide',
    allRightsReserved: 'All rights reserved',
    
    // Language
    language: 'Language',
    indonesian: 'Indonesian',
    english: 'English',
    switchLanguage: 'Switch Language',
  }
};

// Create context
const LanguageContext = createContext();

// Default exchange rate (fallback if API fails)
const DEFAULT_EXCHANGE_RATE = 16000;

// Language Provider Component
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Get saved language from localStorage or default to 'id'
    return localStorage.getItem('language') || 'id';
  });

  // Exchange rate state
  const [exchangeRate, setExchangeRate] = useState(() => {
    // Get cached rate from localStorage
    const cached = localStorage.getItem('exchangeRate');
    return cached ? parseFloat(cached) : DEFAULT_EXCHANGE_RATE;
  });
  const [exchangeRateLoading, setExchangeRateLoading] = useState(false);

  // Fetch exchange rate on mount
  useEffect(() => {
    fetchExchangeRate();
  }, []);

  // Fetch exchange rate from API
  const fetchExchangeRate = async () => {
    try {
      setExchangeRateLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/exchange-rates/IDR/USD`);
      const data = await response.json();
      
      if (data.success && data.data?.rate) {
        const rate = parseFloat(data.data.rate);
        setExchangeRate(rate);
        localStorage.setItem('exchangeRate', rate.toString());
        localStorage.setItem('exchangeRateUpdated', new Date().toISOString());
      }
    } catch (error) {
      console.error('Failed to fetch exchange rate:', error);
      // Use cached or default rate
    } finally {
      setExchangeRateLoading(false);
    }
  };

  useEffect(() => {
    // Save language preference to localStorage
    localStorage.setItem('language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'id' ? 'en' : 'id');
  };

  const changeLanguage = (lang) => {
    if (lang === 'id' || lang === 'en') {
      setLanguage(lang);
    }
  };

  // Translation function
  const t = (key) => {
    return translations[language]?.[key] || translations['id']?.[key] || key;
  };

  // Format currency based on language with automatic conversion
  const formatCurrency = (value, options = {}) => {
    const num = parseFloat(value) || 0;
    const { forceIDR = false, forceUSD = false, showBothCurrencies = false } = options;
    
    // Force IDR regardless of language
    if (forceIDR) {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(num);
    }
    
    // Force USD regardless of language
    if (forceUSD) {
      const usdAmount = num / exchangeRate;
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
      }).format(usdAmount);
    }
    
    // Show both currencies
    if (showBothCurrencies) {
      const idrFormatted = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(num);
      
      const usdAmount = num / exchangeRate;
      const usdFormatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
      }).format(usdAmount);
      
      return `${idrFormatted} (~${usdFormatted})`;
    }
    
    // Auto conversion based on language
    if (language === 'en') {
      // Convert IDR to USD for English
      const usdAmount = num / exchangeRate;
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
      }).format(usdAmount);
    }
    
    // Default: IDR for Indonesian
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  // Format currency with original IDR value shown (for receipts, etc.)
  const formatCurrencyWithOriginal = (value) => {
    const num = parseFloat(value) || 0;
    
    const idrFormatted = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
    
    if (language === 'en') {
      const usdAmount = num / exchangeRate;
      const usdFormatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
      }).format(usdAmount);
      return { primary: usdFormatted, original: idrFormatted };
    }
    
    return { primary: idrFormatted, original: null };
  };

  // Get raw converted amount without formatting
  const convertCurrency = (idrAmount) => {
    const num = parseFloat(idrAmount) || 0;
    if (language === 'en') {
      return Math.round((num / exchangeRate) * 100) / 100;
    }
    return num;
  };

  // Format date based on language
  const formatDate = (date, options = {}) => {
    const d = new Date(date);
    const locale = language === 'en' ? 'en-US' : 'id-ID';
    return d.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    });
  };

  const value = {
    language,
    setLanguage: changeLanguage,
    toggleLanguage,
    t,
    formatCurrency,
    formatCurrencyWithOriginal,
    convertCurrency,
    formatDate,
    isIndonesian: language === 'id',
    isEnglish: language === 'en',
    // Exchange rate related
    exchangeRate,
    exchangeRateLoading,
    refreshExchangeRate: fetchExchangeRate,
    currencySymbol: language === 'en' ? '$' : 'Rp',
    currencyCode: language === 'en' ? 'USD' : 'IDR'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Language Switcher Component
export const LanguageSwitcher = ({ className = '' }) => {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className={`flex items-center gap-2 px-3 py-1.5 border rounded hover:bg-gray-100 transition-colors ${className}`}
      title={t('switchLanguage')}
    >
      <span className="text-lg">{language === 'id' ? '🇮🇩' : '🇬🇧'}</span>
      <span className="text-sm font-medium">{language === 'id' ? 'ID' : 'EN'}</span>
    </button>
  );
};

// Dropdown Language Switcher for more options
export const LanguageDropdown = ({ className = '' }) => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 border rounded hover:bg-gray-100 transition-colors"
      >
        <span className="text-lg">{language === 'id' ? '🇮🇩' : '🇬🇧'}</span>
        <span className="text-sm font-medium">{language === 'id' ? 'Indonesia' : 'English'}</span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-20">
            <button
              onClick={() => { setLanguage('id'); setIsOpen(false); }}
              className={`w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-100 ${language === 'id' ? 'bg-gray-50 font-semibold' : ''}`}
            >
              <span>🇮🇩</span>
              <span>Indonesia</span>
            </button>
            <button
              onClick={() => { setLanguage('en'); setIsOpen(false); }}
              className={`w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-100 ${language === 'en' ? 'bg-gray-50 font-semibold' : ''}`}
            >
              <span>🇬🇧</span>
              <span>English</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default translations;
