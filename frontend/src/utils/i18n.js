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
    searchProducts: 'Cari produk...',
    searchProductsLong: 'Ketik nama produk, kategori, atau fitting...',
    searchHelp: 'Tekan Enter untuk mencari atau Esc untuk menutup',
    searchProduct: 'Cari Produk',
    
    // Categories
    women: 'Wanita',
    men: 'Pria',
    newCollection: 'Koleksi Baru',
    sale: 'Diskon',
    bottoms: 'Celana',
    tops: 'Atasan',
    jackets: 'Jaket',
    byFit: 'Berdasarkan Fit',
    allProducts: 'Semua Produk',
    
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
    adding: 'Menambahkan...',
    addedToCartSuccess: 'Produk berhasil ditambahkan ke keranjang!',
    pleaseLoginCart: 'Silakan login terlebih dahulu untuk menambahkan ke keranjang',
    failedAddCart: 'Gagal menambahkan ke keranjang',
    removedFromWishlist: 'Produk dihapus dari wishlist',
    addedToWishlist: 'Produk ditambahkan ke wishlist!',
    pleaseLoginWishlist: 'Silakan login terlebih dahulu untuk menyimpan ke wishlist',
    failedUpdateWishlist: 'Gagal memperbarui wishlist',
    removeFromWishlist: 'Hapus dari Wishlist',
    addToWishlist: 'Tambah ke Wishlist',
    productDescription: 'Deskripsi Produk',
    noDescriptionAvailable: 'Tidak ada deskripsi tersedia',
    pleaseSelectSize: 'Pilih ukuran terlebih dahulu',
    quantityExceedsStock: 'Jumlah melebihi stok yang tersedia',
    stockAvailable: 'Stok tersedia',
    noSizesAvailable: 'Tidak ada ukuran tersedia',
    basePriceLabel: 'Harga dasar',
    sizePrice: 'Ukuran',
    save_discount: 'Hemat',
    viewDetail: 'LIHAT DETAIL',
    productsFound: 'produk ditemukan',
    noProductsFound: 'Tidak ada produk ditemukan',
    clearFilters: 'Hapus Filter',
    applyFilters: 'Terapkan',
    gender: 'Jenis Kelamin',
    all: 'Semua',
    sortNewest: 'Terbaru',
    sortPriceLow: 'Harga: Rendah',
    sortPriceHigh: 'Harga: Tinggi',
    sortNameAZ: 'Nama: A-Z',
    sortPopular: 'Terpopuler',
    priceMin: 'Min',
    priceMax: 'Max',
    noProductsAvailable: 'Tidak ada produk tersedia',
    clear: 'Hapus',
    productsTitle: 'Produk - Marketplace Jeans',
    productsMetaDesc: 'Jelajahi koleksi lengkap celana jeans, jaket, dan aksesoris',
    
    // Cart
    shoppingCart: 'Keranjang Belanja',
    emptyCart: 'Keranjang Anda kosong',
    emptyCartTitle: 'Keranjang Kosong',
    emptyCartMessage: 'Anda belum menambahkan produk apapun ke keranjang',
    startShopping: 'Mulai Belanja',
    continueShopping: 'Lanjut Belanja',
    subtotal: 'Subtotal',
    shippingCost: 'Ongkos Kirim',
    discount: 'Diskon',
    tax: 'Pajak',
    grandTotal: 'Total Keseluruhan',
    proceedToCheckout: 'Lanjut ke Pembayaran',
    removeItem: 'Hapus',
    updateQuantity: 'Perbarui Jumlah',
    failedLoadCart: 'Gagal memuat keranjang',
    failedUpdateQuantity: 'Gagal mengupdate jumlah',
    removeItemConfirm: 'Hapus item dari keranjang?',
    failedRemoveItem: 'Gagal menghapus item',
    confirmRemoveTitle: 'Konfirmasi Hapus',
    clearCartConfirm: 'Kosongkan semua item di keranjang?',
    failedClearCart: 'Gagal mengosongkan keranjang',
    clearCart: 'Kosongkan Keranjang',
    calculatedAtCheckout: 'Dihitung saat checkout',
    sizeLabel: 'Ukuran',
    stockLabel: 'Stok',
    item: 'item',
    
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
    checkoutTitle: 'CHECKOUT',
    shippingInfo: 'Informasi Pengiriman',
    email: 'Email',
    fullName: 'Nama Lengkap',
    phoneNumber: 'No. Telepon',
    haveAccount: 'Sudah memiliki akun?',
    continueAsGuest: 'Lanjutkan Sebagai Guest',
    loginAndCheckout: 'Masuk & Checkout',
    nameLabel: 'Nama',
    emailLabel: 'Email',
    loadingSavedAddresses: 'Memuat alamat tersimpan...',
    noSavedAddresses: 'Belum ada alamat tersimpan',
    addressLabel: 'Label Alamat',
    addressLabelHome: 'Rumah',
    addressLabelOffice: 'Kantor',
    addressLabelApartment: 'Apartemen',
    addressLabelDorm: 'Kos',
    addressLabelOther: 'Lainnya',
    recipientPhone: 'No. Telepon Penerima',
    selectShippingAddress: 'Pilih Alamat Pengiriman',
    primaryAddress: 'Utama',
    useNewAddress: '+ Gunakan Alamat Baru',
    newAddressDetails: 'Detail Alamat Baru',
    saveAddressForNext: 'Simpan alamat untuk order berikutnya',
    fullAddress: 'Alamat Lengkap',
    destinationCity: 'Kota Tujuan',
    searchCity: 'Cari kota...',
    notesOptional: 'Catatan (Opsional)',
    selectShipping: 'Pilih Pengiriman',
    selectCourier: 'Pilih Kurir',
    loadingShippingOptions: 'Memuat opsi pengiriman...',
    noShippingOptions: 'Tidak ada opsi pengiriman tersedia',
    contactCustomerService: 'Silakan hubungi customer service.',
    selectAddressForShipping: 'Pilih alamat pengiriman untuk melihat opsi pengiriman.',
    onlinePayment: 'Pembayaran Online (Midtrans)',
    onlinePaymentDesc: 'Credit Card, GoPay, OVO, DANA, VA Bank, QRIS',
    bankTransfer: 'Transfer Bank Manual',
    cod: 'Bayar di Tempat (COD)',
    codDesc: 'Bayar saat barang tiba',
    bankTransferDetails: 'Detail Rekening Transfer',
    bankLabel: 'Bank',
    accountNumber: 'No. Rekening',
    accountName: 'Atas Nama',
    transferInstruction: 'Transfer sesuai total pembayaran. Pesanan akan diproses setelah pembayaran dikonfirmasi.',
    paymentProof: 'Bukti Pembayaran',
    removePhoto: 'Hapus foto',
    clickToUploadProof: 'Klik untuk unggah bukti transfer',
    imageMaxSize: 'JPG, PNG maks. 5MB',
    proofRequired: '* Wajib mengunggah bukti pembayaran sebelum melanjutkan',
    processingPayment: 'Processing...',
    continueToPayment: 'Lanjutkan ke Pembayaran',
    haveCoupon: 'Punya Kupon?',
    enterCode: 'Masukkan kode',
    useCode: 'Pakai',
    taxRate: 'Pajak (11%)',
    shipping: 'Pengiriman',
    backToCart: 'Kembali ke Keranjang',
    cartEmpty: 'Keranjang kosong',
    loadingCheckout: 'Memuat data checkout...',
    emailRequired: 'Email harus diisi',
    phoneRequired: 'Nomor telepon harus diisi',
    fullNameRequired: 'Nama lengkap harus diisi',
    fullAddressRequired: 'Alamat lengkap harus diisi',
    cityRequired: 'Kota harus dipilih',
    provinceRequired: 'Provinsi harus diisi',
    postalCodeRequired: 'Kode pos harus diisi',
    invalidEmailFormat: 'Format email tidak valid',
    invalidPhoneFormat: 'Format nomor telepon tidak valid',
    enterCouponCode: 'Masukkan kode kupon',
    pleaseUploadProof: 'Silakan unggah bukti pembayaran transfer bank',
    orderCreatedSuccess: 'Order berhasil dibuat!',
    failedCreateOrder: 'Gagal membuat order',
    incompleteData: 'Lengkapi Data',
    incompleteDataMsg: 'Data belum lengkap',
    couponInvalid: 'Kupon tidak valid',
    orderCreatedRedirectTracking: 'Order berhasil dibuat! Anda akan diarahkan ke halaman tracking.',
    orderCreatedRedirectOrders: 'Order berhasil dibuat! Anda akan diarahkan ke halaman pesanan.',
    failedCheckout: 'Gagal Checkout',
    fileSizeMax5: 'Ukuran file maksimal 5MB',
    checkoutPageTitle: 'Checkout - Marketplace Jeans',
    noSavedAddressHint: 'Silakan isi alamat pengiriman di bawah. Alamat akan otomatis disimpan untuk order berikutnya.',
    recipientNamePlaceholder: 'Nama penerima',
    addressPlaceholder: 'Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan',
    postalCodePlaceholder: '12345',
    notesPlaceholder: 'Contoh: Tidak ada di rumah, silakan beri ke tetangga',
    noShippingForRoute: 'Tidak ada opsi pengiriman tersedia untuk rute ini.',
    transferInstructionUpload: 'Transfer sesuai total pembayaran dan unggah bukti transfer di bawah.',
    proofRequiredGuest: '* Wajib mengunggah bukti pembayaran untuk checkout tanpa login',
    
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
    myOrdersTitle: 'Pesanan Saya',
    myOrdersSubtitle: 'Lihat status dan riwayat pesanan Anda',
    filterStatus: 'Filter Status',
    waitingConfirmation: 'Menunggu Konfirmasi',
    completed: 'Selesai',
    unpaid: 'Belum Bayar',
    refund: 'Refund',
    totalPayment: 'Total Pembayaran',
    trackOrderBtn: 'Lacak Pesanan',
    moreProducts: 'produk lainnya',
    page: 'Halaman',
    of: 'dari',
    noOrdersYet: 'Belum Ada Pesanan',
    noOrdersMessage: 'Anda belum memiliki pesanan. Yuk mulai belanja!',
    failedToLoadOrders: 'Gagal memuat pesanan',
    sessionExpired: 'Sesi Anda telah berakhir. Silakan login kembali.',
    confirmed: 'Dikonfirmasi',
    size: 'Ukuran',

    // Order Status Keys
    pending: 'Menunggu',
    processing: 'Diproses',
    shipped: 'Dikirim',
    delivered: 'Diterima',
    cancelled: 'Dibatalkan',
    paid: 'Lunas',
    failed: 'Gagal',
    refunded: 'Dikembalikan',
    paymentFailed: 'Pembayaran Gagal',
    
    // Order Detail
    errorOccurred: 'Terjadi Kesalahan',
    failedLoadOrderPage: 'Gagal memuat halaman pesanan',
    backToOrderList: 'Kembali ke Daftar Pesanan',
    invalidOrderData: 'Data pesanan tidak valid',
    orderNotFound: 'Pesanan Tidak Ditemukan',
    pleaseLoginToViewOrder: 'Silakan login untuk melihat pesanan',
    failedLoadOrder: 'Gagal memuat data pesanan',
    paymentSummary: 'Ringkasan Pembayaran',
    shippingLabel: 'Pengiriman',
    ppn: 'PPN (11%)',
    trackShipment: 'Lacak Pengiriman',
    shopAgain: 'Belanja Lagi',
    orderedProducts: 'Produk yang Dipesan',
    trackingNumberLabel: 'Nomor Resi',
    resiLabel: 'Resi',
    
    // Order Success
    loadingOrderDetails: 'Memuat detail pesanan...',
    orderSuccessTitle: 'Pesanan Berhasil!',
    orderSuccessMessage: 'Terima kasih telah berbelanja. Pesanan Anda sedang diproses.',
    orderQRCode: 'QR Code Pesanan',
    scanQRCode: 'Scan QR code ini atau bagikan link untuk melacak pesanan',
    copied: 'Tersalin!',
    copyLink: 'Salin Link',
    downloadQR: 'Download QR',
    onlinePaymentTitle: 'Pembayaran Online',
    clickToPayOnline: 'Klik tombol di bawah untuk melakukan pembayaran',
    payNow: 'Bayar Sekarang',
    paymentInstructions: 'Instruksi Pembayaran',
    transferToAccount: 'Silakan transfer ke rekening berikut:',
    proofUploaded: 'Bukti Pembayaran Telah Diunggah',
    actions: 'Tindakan',
    downloading: 'Mengunduh...',
    downloadInvoicePDF: 'Download Invoice PDF',
    whatNext: 'Apa selanjutnya?',
    nextStepConfirm: 'Pesanan Anda akan dikonfirmasi oleh admin dalam 1x24 jam.',
    nextStepEmail: 'Anda akan menerima notifikasi email untuk setiap update status pesanan.',
    nextStepTracking: 'Gunakan QR code atau nomor pesanan untuk melacak status pesanan Anda.',
    nextStepCS: 'Hubungi customer service jika ada pertanyaan.',
    viewAllOrders: 'Lihat Semua Pesanan',
    
    // Order Tracking
    trackYourOrder: 'Lacak Pesanan Anda',
    enterOrderNumber: 'Masukkan nomor pesanan untuk melihat status pengiriman',
    enterOrderNumberPlaceholder: 'Masukkan Nomor Pesanan (contoh: ORD-20241225-XXXX)',
    searching: 'Mencari...',
    track: 'Lacak',
    ensureOrderNumber: 'Pastikan nomor pesanan yang Anda masukkan benar dan lengkap.',
    orderNotFoundError: 'Pesanan tidak ditemukan',
    orderNotFoundMsg: 'Pesanan tidak ditemukan. Pastikan nomor pesanan benar.',
    shipmentHistory: 'Riwayat Pengiriman',
    updatedBy: 'Diupdate oleh',
    noShipmentHistory: 'Belum ada riwayat pengiriman',
    courier: 'Kurir',
    shippedFrom: 'Dikirim dari',
    initialTrackMsg: 'Masukkan nomor pesanan Anda di kotak pencarian untuk melihat status pengiriman.',
    packed: 'Dikemas',
    inTransit: 'Dalam Perjalanan',
    outForDelivery: 'Sedang Diantar',
    waitingApproval: 'Menunggu persetujuan admin...',
    
    // Order Page
    failedDownloadQR: 'Gagal mengunduh QR Code',
    failedDownloadInvoice: 'Gagal mengunduh invoice',
    loadingOrderData: 'Memuat data pesanan...',
    searchAnotherOrder: 'Cari Pesanan Lain',
    noOrderNumber: 'No. Pesanan',
    downloadQRCode: 'Download QR Code',
    scanQRCodeAccess: 'Scan QR code ini untuk mengakses halaman tracking pesanan',
    shareTrackingLink: 'Bagikan link ini kepada orang lain untuk melacak pesanan',
    
    // Wishlist
    failedLoadWishlist: 'Gagal memuat wishlist',
    removeFromWishlistConfirm: 'Hapus produk dari wishlist?',
    removedFromWishlistSuccess: 'Produk dihapus dari wishlist',
    failedRemoveWishlist: 'Gagal menghapus dari wishlist',
    noStockAvailable: 'Produk tidak memiliki stok tersedia',
    addedToCartFromWishlist: 'Produk ditambahkan ke keranjang!',
    failedAddCartFromWishlist: 'Gagal menambahkan ke keranjang',
    wishlistTitle: 'Wishlist Saya',
    savedProducts: 'produk tersimpan',
    emptyWishlistTitle: 'Wishlist Kosong',
    emptyWishlistMessage: 'Anda belum menyimpan produk apapun ke wishlist',
    
    // Profile
    accountInfo: 'Informasi Akun',
    fullNameLabel: 'Nama Lengkap',
    emailProfileLabel: 'Email',
    phoneLabel: 'Telepon',
    memberStatus: 'Status Member',
    myAddresses: 'Alamat Saya',
    manageShippingAddresses: 'Kelola alamat pengiriman',
    viewOrderHistory: 'Lihat riwayat pesanan',
    savedProductsLabel: 'Produk yang disimpan',
    accountSettings: 'Pengaturan akun',
    
    // Profile Settings
    profileUpdated: 'Profil berhasil diperbarui',
    failedUpdateProfile: 'Gagal memperbarui profil',
    newPasswordMismatch: 'Password baru tidak cocok',
    passwordMinLength: 'Password minimal 6 karakter',
    passwordChanged: 'Password berhasil diubah',
    failedChangePassword: 'Gagal mengubah password',
    fileSizeMax: 'Ukuran file maksimal 2MB',
    profilePhotoUpdated: 'Foto profil berhasil diperbarui',
    failedUploadPhoto: 'Gagal mengunggah foto',
    accountSettingsTitle: 'Pengaturan Akun',
    profileTab: 'Profil',
    passwordTab: 'Password',
    profilePhoto: 'Foto Profil',
    uploadPhotoHint: 'Upload foto profil baru. Format: JPG, PNG, GIF. Maksimal 2MB.',
    uploading: 'Mengunggah...',
    profileInfo: 'Informasi Profil',
    emailCannotChange: 'Email tidak dapat diubah',
    saveChanges: 'Simpan Perubahan',
    changePassword: 'Ubah Password',
    currentPassword: 'Password Saat Ini',
    newPassword: 'Password Baru',
    minSixChars: 'Minimal 6 karakter',
    confirmNewPassword: 'Konfirmasi Password Baru',
    changingPassword: 'Mengubah...',
    
    // Addresses
    failedLoadAddresses: 'Gagal memuat alamat',
    pleaseFillRequired: 'Mohon lengkapi semua field yang wajib',
    addressUpdatedSuccess: 'Alamat berhasil diperbarui',
    addressAddedSuccess: 'Alamat berhasil ditambahkan',
    failedSaveAddress: 'Gagal menyimpan alamat',
    confirmDeleteAddress: 'Yakin ingin menghapus alamat ini?',
    addressDeletedSuccess: 'Alamat berhasil dihapus',
    failedDeleteAddress: 'Gagal menghapus alamat',
    primaryAddressChanged: 'Alamat utama berhasil diubah',
    failedChangePrimary: 'Gagal mengubah alamat utama',
    backToProfile: 'Kembali ke Profil',
    myAddressesTitle: 'Alamat Saya',
    manageShippingDesc: 'Kelola alamat pengiriman Anda',
    addAddress: 'Tambah Alamat',
    noAddressesYet: 'Belum Ada Alamat',
    addAddressHint: 'Tambahkan alamat pengiriman untuk mempermudah checkout',
    addFirstAddress: 'Tambah Alamat Pertama',
    makePrimary: 'Jadikan Alamat Utama',
    editAddress: 'Edit Alamat',
    addNewAddress: 'Tambah Alamat Baru',
    addressLabelPlaceholder: 'contoh: Rumah, Kantor',
    recipientNameLabel: 'Nama Penerima',
    phoneNumberLabel: 'Nomor Telepon',
    fullAddressLabel: 'Alamat Lengkap',
    fullAddressPlaceholder: 'Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan',
    cityDistrict: 'Kota/Kabupaten',
    makePrimaryCheckbox: 'Jadikan sebagai alamat utama',
    updating: 'Menyimpan...',
    
    // Login Page
    signInTitle: 'Masuk ke akun Anda',
    emailAddress: 'Alamat Email',
    emailIsRequired: 'Email harus diisi',
    invalidEmailAddress: 'Alamat email tidak valid',
    password: 'Password',
    passwordIsRequired: 'Password harus diisi',
    passwordMinLengthMsg: 'Password minimal 6 karakter',
    signingIn: 'Sedang masuk...',
    signIn: 'Masuk',
    dontHaveAccount: 'Belum punya akun?',
    signUp: 'Daftar',
    
    // Register Page
    registerTitle: 'Daftar Akun',
    nameEmailPasswordRequired: 'Nama, email, dan password harus diisi',
    passwordMinChars: 'Password minimal 6 karakter',
    confirmPasswordMismatch: 'Konfirmasi password tidak cocok',
    registrationFailed: 'Registrasi gagal. Silakan coba lagi.',
    fullNameRequired2: 'Nama Lengkap *',
    enterFullName: 'Masukkan nama lengkap',
    emailRequired2: 'Email *',
    enterEmailPlaceholder: 'Masukkan email',
    passwordRequired2: 'Password *',
    minSixCharsPlaceholder: 'Minimal 6 karakter',
    confirmPasswordLabel: 'Konfirmasi Password *',
    repeatPassword: 'Ulangi password',
    phoneOptional: 'Opsional',
    registering: 'Mendaftar...',
    registerBtn: 'Daftar',
    alreadyHaveAccount: 'Sudah punya akun?',
    loginLink: 'Masuk',
    
    // Home Page
    shopNow: 'BELANJA SEKARANG',
    thisSeasonCollection: 'KOLEKSI MUSIM INI',
    thisSeasonSubtitle: 'Tampil percaya diri dengan denim terbaru',
    baggyJeans: 'BAGGY JEANS',
    baggyJeansSubtitle: 'Gaya santai yang tetap stylish',
    findYourFitting: 'TEMUKAN FITTING ANDA',
    discountUpTo40: 'DISKON HINGGA 40%',
    discountSubtitle: 'Dapatkan koleksi favorit dengan harga spesial',
    viewPromo: 'LIHAT PROMO',
    viewFullCollection: 'Lihat koleksi lengkap',
    viewAllCollection: 'Lihat seluruh koleksi',
    shopByCategory: 'BELANJA BERDASARKAN KATEGORI',
    featuredProducts: 'PRODUK UNGGULAN',
    viewAllProducts: 'LIHAT SEMUA',
    fittingGuide: 'PANDUAN FITTING',
    fittingGuideDesc: 'Temukan fitting yang sempurna untuk anda',
    memberProgramTitle: 'PROGRAM MEMBER',
    memberProgramDesc: 'Dapatkan diskon spesial dan reward points',
    findStoreTitle: 'TEMUKAN TOKO',
    findStoreDesc: 'Kunjungi toko terdekat di kota anda',
    getLatestUpdates: 'DAPATKAN UPDATE TERBARU',
    newsletterDesc: 'Daftarkan email anda untuk mendapatkan informasi koleksi terbaru, promo eksklusif, dan penawaran spesial lainnya.',
    enterYourEmail: 'Masukkan email anda',
    registerNewsletter: 'DAFTAR',
    premiumDenimDesc: 'Koleksi denim premium dengan kualitas dan gaya terbaik. Belanja jeans, jaket, dan aksesoris dengan berbagai fitting dan ukuran.',
    failedLoadHomepage: 'Gagal memuat data homepage',
    
    // NotFound
    pageNotFound: 'Halaman tidak ditemukan',
    backToHome: 'Kembali ke Beranda',
    
    // Layout/Footer
    premiumDenimCollection: 'Koleksi denim premium dengan kualitas dan gaya terbaik.',
    contact: 'Kontak',
    helpCenter: 'Pusat Bantuan',
    viewAllWomenProducts: 'Lihat Semua Produk Wanita →',
    viewAllMenProducts: 'Lihat Semua Produk Pria →',
    noCategories: 'Belum ada kategori',
    
    // Language
    language: 'Bahasa',
    indonesian: 'Indonesia',
    english: 'English',
    switchLanguage: 'Ganti Bahasa',
    
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
    searchProducts: 'Search products...',
    searchProductsLong: 'Type product name, category, or fitting...',
    searchHelp: 'Press Enter to search or Esc to close',
    searchProduct: 'Search Product',
    
    // Categories
    women: 'Women',
    men: 'Men',
    newCollection: 'New Collection',
    sale: 'Sale',
    bottoms: 'Bottoms',
    tops: 'Tops',
    jackets: 'Jackets',
    byFit: 'By Fit',
    allProducts: 'All Products',
    
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
    adding: 'Adding...',
    addedToCartSuccess: 'Product successfully added to cart!',
    pleaseLoginCart: 'Please login first to add to cart',
    failedAddCart: 'Failed to add to cart',
    removedFromWishlist: 'Product removed from wishlist',
    addedToWishlist: 'Product added to wishlist!',
    pleaseLoginWishlist: 'Please login first to save to wishlist',
    failedUpdateWishlist: 'Failed to update wishlist',
    removeFromWishlist: 'Remove from Wishlist',
    addToWishlist: 'Add to Wishlist',
    productDescription: 'Product Description',
    noDescriptionAvailable: 'No description available',
    pleaseSelectSize: 'Please select a size first',
    quantityExceedsStock: 'Quantity exceeds available stock',
    stockAvailable: 'Stock available',
    noSizesAvailable: 'No sizes available',
    basePriceLabel: 'Base price',
    sizePrice: 'Size',
    save_discount: 'Save',
    viewDetail: 'VIEW DETAIL',
    productsFound: 'products found',
    noProductsFound: 'No products found',
    clearFilters: 'Clear Filters',
    applyFilters: 'Apply',
    gender: 'Gender',
    all: 'All',
    sortNewest: 'Newest',
    sortPriceLow: 'Price: Low',
    sortPriceHigh: 'Price: High',
    sortNameAZ: 'Name: A-Z',
    sortPopular: 'Most Popular',
    priceMin: 'Min',
    priceMax: 'Max',
    noProductsAvailable: 'No products available',
    clear: 'Clear',
    productsTitle: 'Products - Marketplace Jeans',
    productsMetaDesc: 'Explore the complete collection of jeans, jackets, and accessories',
    
    // Cart
    shoppingCart: 'Shopping Cart',
    emptyCart: 'Your cart is empty',
    emptyCartTitle: 'Empty Cart',
    emptyCartMessage: 'You haven\'t added any products to your cart yet',
    startShopping: 'Start Shopping',
    continueShopping: 'Continue Shopping',
    subtotal: 'Subtotal',
    shippingCost: 'Shipping Cost',
    discount: 'Discount',
    tax: 'Tax',
    grandTotal: 'Grand Total',
    proceedToCheckout: 'Proceed to Checkout',
    removeItem: 'Remove',
    updateQuantity: 'Update Quantity',
    failedLoadCart: 'Failed to load cart',
    failedUpdateQuantity: 'Failed to update quantity',
    removeItemConfirm: 'Remove item from cart?',
    failedRemoveItem: 'Failed to remove item',
    confirmRemoveTitle: 'Confirm Removal',
    clearCartConfirm: 'Clear all items from cart?',
    failedClearCart: 'Failed to clear cart',
    clearCart: 'Clear Cart',
    calculatedAtCheckout: 'Calculated at checkout',
    sizeLabel: 'Size',
    stockLabel: 'Stock',
    item: 'item',
    
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
    checkoutTitle: 'CHECKOUT',
    shippingInfo: 'Shipping Information',
    email: 'Email',
    fullName: 'Full Name',
    phoneNumber: 'Phone Number',
    haveAccount: 'Already have an account?',
    continueAsGuest: 'Continue as Guest',
    loginAndCheckout: 'Login & Checkout',
    nameLabel: 'Name',
    emailLabel: 'Email',
    loadingSavedAddresses: 'Loading saved addresses...',
    noSavedAddresses: 'No saved addresses yet',
    addressLabel: 'Address Label',
    addressLabelHome: 'Home',
    addressLabelOffice: 'Office',
    addressLabelApartment: 'Apartment',
    addressLabelDorm: 'Dormitory',
    addressLabelOther: 'Other',
    recipientPhone: 'Recipient Phone Number',
    selectShippingAddress: 'Select Shipping Address',
    primaryAddress: 'Primary',
    useNewAddress: '+ Use New Address',
    newAddressDetails: 'New Address Details',
    saveAddressForNext: 'Save address for next orders',
    fullAddress: 'Full Address',
    destinationCity: 'Destination City',
    searchCity: 'Search city...',
    notesOptional: 'Notes (Optional)',
    selectShipping: 'Select Shipping',
    selectCourier: 'Select Courier',
    loadingShippingOptions: 'Loading shipping options...',
    noShippingOptions: 'No shipping options available',
    contactCustomerService: 'Please contact customer service.',
    selectAddressForShipping: 'Select shipping address to view shipping options.',
    onlinePayment: 'Online Payment (Midtrans)',
    onlinePaymentDesc: 'Credit Card, GoPay, OVO, DANA, VA Bank, QRIS',
    bankTransfer: 'Manual Bank Transfer',
    cod: 'Cash on Delivery (COD)',
    codDesc: 'Pay when your order arrives',
    bankTransferDetails: 'Bank Transfer Details',
    bankLabel: 'Bank',
    accountNumber: 'Account Number',
    accountName: 'Account Holder',
    transferInstruction: 'Transfer the exact payment amount. Your order will be processed after payment is confirmed.',
    paymentProof: 'Payment Proof',
    removePhoto: 'Remove photo',
    clickToUploadProof: 'Click to upload transfer proof',
    imageMaxSize: 'JPG, PNG max. 5MB',
    proofRequired: '* Payment proof upload is required before proceeding',
    processingPayment: 'Processing...',
    continueToPayment: 'Continue to Payment',
    haveCoupon: 'Have a Coupon?',
    enterCode: 'Enter code',
    useCode: 'Apply',
    taxRate: 'Tax (11%)',
    shipping: 'Shipping',
    backToCart: 'Back to Cart',
    cartEmpty: 'Cart is empty',
    loadingCheckout: 'Loading checkout data...',
    emailRequired: 'Email is required',
    phoneRequired: 'Phone number is required',
    fullNameRequired: 'Full name is required',
    fullAddressRequired: 'Full address is required',
    cityRequired: 'City must be selected',
    provinceRequired: 'Province is required',
    postalCodeRequired: 'Postal code is required',
    invalidEmailFormat: 'Invalid email format',
    invalidPhoneFormat: 'Invalid phone number format',
    enterCouponCode: 'Enter coupon code',
    pleaseUploadProof: 'Please upload bank transfer payment proof',
    orderCreatedSuccess: 'Order created successfully!',
    failedCreateOrder: 'Failed to create order',
    incompleteData: 'Complete Data',
    incompleteDataMsg: 'Data is incomplete',
    couponInvalid: 'Coupon is not valid',
    orderCreatedRedirectTracking: 'Order created successfully! You will be redirected to the tracking page.',
    orderCreatedRedirectOrders: 'Order created successfully! You will be redirected to the orders page.',
    failedCheckout: 'Checkout Failed',
    fileSizeMax5: 'Maximum file size is 5MB',
    checkoutPageTitle: 'Checkout - Marketplace Jeans',
    noSavedAddressHint: 'Please fill in the shipping address below. The address will be automatically saved for your next order.',
    recipientNamePlaceholder: 'Recipient name',
    addressPlaceholder: 'Street name, house number, neighborhood, district',
    postalCodePlaceholder: '12345',
    notesPlaceholder: 'E.g.: Not at home, please give to neighbor',
    noShippingForRoute: 'No shipping options available for this route.',
    transferInstructionUpload: 'Transfer the total payment and upload proof of transfer below.',
    proofRequiredGuest: '* Must upload payment proof for guest checkout',
    
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
    myOrdersTitle: 'My Orders',
    myOrdersSubtitle: 'View your order status and history',
    filterStatus: 'Filter Status',
    waitingConfirmation: 'Waiting for Confirmation',
    completed: 'Completed',
    unpaid: 'Unpaid',
    refund: 'Refund',
    totalPayment: 'Total Payment',
    trackOrderBtn: 'Track Order',
    moreProducts: 'more products',
    page: 'Page',
    of: 'of',
    noOrdersYet: 'No Orders Yet',
    noOrdersMessage: 'You don\'t have any orders yet. Let\'s start shopping!',
    failedToLoadOrders: 'Failed to load orders',
    sessionExpired: 'Your session has expired. Please log in again.',
    size: 'Size',

    // Order Status Keys
    paymentFailed: 'Payment Failed',
    
    // Order Detail
    errorOccurred: 'An Error Occurred',
    failedLoadOrderPage: 'Failed to load order page',
    backToOrderList: 'Back to Order List',
    invalidOrderData: 'Invalid order data',
    orderNotFound: 'Order Not Found',
    pleaseLoginToViewOrder: 'Please login to view your orders',
    failedLoadOrder: 'Failed to load order data',
    paymentSummary: 'Payment Summary',
    shippingLabel: 'Shipping',
    ppn: 'VAT (11%)',
    trackShipment: 'Track Shipment',
    shopAgain: 'Shop Again',
    orderedProducts: 'Ordered Products',
    trackingNumberLabel: 'Tracking Number',
    resiLabel: 'Tracking',
    
    // Order Success
    loadingOrderDetails: 'Loading order details...',
    orderSuccessTitle: 'Order Successful!',
    orderSuccessMessage: 'Thank you for your purchase. Your order is being processed.',
    orderQRCode: 'Order QR Code',
    scanQRCode: 'Scan this QR code or share the link to track your order',
    copied: 'Copied!',
    copyLink: 'Copy Link',
    downloadQR: 'Download QR',
    onlinePaymentTitle: 'Online Payment',
    clickToPayOnline: 'Click the button below to make your payment',
    payNow: 'Pay Now',
    paymentInstructions: 'Payment Instructions',
    transferToAccount: 'Please transfer to the following account:',
    proofUploaded: 'Payment Proof Has Been Uploaded',
    actions: 'Actions',
    downloading: 'Downloading...',
    downloadInvoicePDF: 'Download Invoice PDF',
    whatNext: 'What\'s next?',
    nextStepConfirm: 'Your order will be confirmed by admin within 24 hours.',
    nextStepEmail: 'You will receive email notifications for every order status update.',
    nextStepTracking: 'Use the QR code or order number to track your order status.',
    nextStepCS: 'Contact customer service if you have any questions.',
    viewAllOrders: 'View All Orders',
    
    // Order Tracking
    trackYourOrder: 'Track Your Order',
    enterOrderNumber: 'Enter your order number to check shipping status',
    enterOrderNumberPlaceholder: 'Enter Order Number (e.g., ORD-20241225-XXXX)',
    searching: 'Searching...',
    track: 'Track',
    ensureOrderNumber: 'Make sure the order number you entered is correct and complete.',
    orderNotFoundError: 'Order not found',
    orderNotFoundMsg: 'Order not found. Please make sure the order number is correct.',
    shipmentHistory: 'Shipment History',
    updatedBy: 'Updated by',
    noShipmentHistory: 'No shipment history yet',
    courier: 'Courier',
    shippedFrom: 'Shipped from',
    initialTrackMsg: 'Enter your order number in the search box to check shipping status.',
    packed: 'Packed',
    inTransit: 'In Transit',
    outForDelivery: 'Out for Delivery',
    waitingApproval: 'Waiting for admin approval...',
    
    // Order Page
    failedDownloadQR: 'Failed to download QR Code',
    failedDownloadInvoice: 'Failed to download invoice',
    loadingOrderData: 'Loading order data...',
    searchAnotherOrder: 'Search Another Order',
    noOrderNumber: 'Order No.',
    downloadQRCode: 'Download QR Code',
    scanQRCodeAccess: 'Scan this QR code to access the order tracking page',
    shareTrackingLink: 'Share this link with others to track the order',
    
    // Wishlist
    failedLoadWishlist: 'Failed to load wishlist',
    removeFromWishlistConfirm: 'Remove product from wishlist?',
    removedFromWishlistSuccess: 'Product removed from wishlist',
    failedRemoveWishlist: 'Failed to remove from wishlist',
    noStockAvailable: 'Product has no available stock',
    addedToCartFromWishlist: 'Product added to cart!',
    failedAddCartFromWishlist: 'Failed to add to cart',
    wishlistTitle: 'My Wishlist',
    savedProducts: 'saved products',
    emptyWishlistTitle: 'Wishlist Empty',
    emptyWishlistMessage: 'You haven\'t saved any products to your wishlist yet',
    
    // Profile
    accountInfo: 'Account Information',
    fullNameLabel: 'Full Name',
    emailProfileLabel: 'Email',
    phoneLabel: 'Phone',
    memberStatus: 'Member Status',
    myAddresses: 'My Addresses',
    manageShippingAddresses: 'Manage shipping addresses',
    viewOrderHistory: 'View order history',
    savedProductsLabel: 'Saved products',
    accountSettings: 'Account settings',
    
    // Profile Settings
    profileUpdated: 'Profile updated successfully',
    failedUpdateProfile: 'Failed to update profile',
    newPasswordMismatch: 'New passwords do not match',
    passwordMinLength: 'Password must be at least 6 characters',
    passwordChanged: 'Password changed successfully',
    failedChangePassword: 'Failed to change password',
    fileSizeMax: 'Maximum file size is 2MB',
    profilePhotoUpdated: 'Profile photo updated successfully',
    failedUploadPhoto: 'Failed to upload photo',
    accountSettingsTitle: 'Account Settings',
    profileTab: 'Profile',
    passwordTab: 'Password',
    profilePhoto: 'Profile Photo',
    uploadPhotoHint: 'Upload a new profile photo. Format: JPG, PNG, GIF. Max 2MB.',
    uploading: 'Uploading...',
    profileInfo: 'Profile Information',
    emailCannotChange: 'Email cannot be changed',
    saveChanges: 'Save Changes',
    changePassword: 'Change Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    minSixChars: 'Minimum 6 characters',
    confirmNewPassword: 'Confirm New Password',
    changingPassword: 'Changing...',
    
    // Addresses
    failedLoadAddresses: 'Failed to load addresses',
    pleaseFillRequired: 'Please fill in all required fields',
    addressUpdatedSuccess: 'Address updated successfully',
    addressAddedSuccess: 'Address added successfully',
    failedSaveAddress: 'Failed to save address',
    confirmDeleteAddress: 'Are you sure you want to delete this address?',
    addressDeletedSuccess: 'Address deleted successfully',
    failedDeleteAddress: 'Failed to delete address',
    primaryAddressChanged: 'Primary address changed successfully',
    failedChangePrimary: 'Failed to change primary address',
    backToProfile: 'Back to Profile',
    myAddressesTitle: 'My Addresses',
    manageShippingDesc: 'Manage your shipping addresses',
    addAddress: 'Add Address',
    noAddressesYet: 'No Addresses Yet',
    addAddressHint: 'Add a shipping address to make checkout easier',
    addFirstAddress: 'Add First Address',
    makePrimary: 'Set as Primary Address',
    editAddress: 'Edit Address',
    addNewAddress: 'Add New Address',
    addressLabelPlaceholder: 'e.g., Home, Office',
    recipientNameLabel: 'Recipient Name',
    phoneNumberLabel: 'Phone Number',
    fullAddressLabel: 'Full Address',
    fullAddressPlaceholder: 'Street name, house number, neighborhood, district',
    cityDistrict: 'City/District',
    makePrimaryCheckbox: 'Set as primary address',
    updating: 'Saving...',
    
    // Login Page
    signInTitle: 'Sign in to your account',
    emailAddress: 'Email Address',
    emailIsRequired: 'Email is required',
    invalidEmailAddress: 'Invalid email address',
    password: 'Password',
    passwordIsRequired: 'Password is required',
    passwordMinLengthMsg: 'Password must be at least 6 characters',
    signingIn: 'Signing in...',
    signIn: 'Sign in',
    dontHaveAccount: 'Don\'t have an account?',
    signUp: 'Sign up',
    
    // Register Page
    registerTitle: 'Create Account',
    nameEmailPasswordRequired: 'Name, email, and password are required',
    passwordMinChars: 'Password must be at least 6 characters',
    confirmPasswordMismatch: 'Confirm password does not match',
    registrationFailed: 'Registration failed. Please try again.',
    fullNameRequired2: 'Full Name *',
    enterFullName: 'Enter your full name',
    emailRequired2: 'Email *',
    enterEmailPlaceholder: 'Enter your email',
    passwordRequired2: 'Password *',
    minSixCharsPlaceholder: 'Minimum 6 characters',
    confirmPasswordLabel: 'Confirm Password *',
    repeatPassword: 'Repeat password',
    phoneOptional: 'Optional',
    registering: 'Registering...',
    registerBtn: 'Register',
    alreadyHaveAccount: 'Already have an account?',
    loginLink: 'Login',
    
    // Home Page
    shopNow: 'SHOP NOW',
    thisSeasonCollection: 'THIS SEASON\'S COLLECTION',
    thisSeasonSubtitle: 'Look confident with the latest denim',
    baggyJeans: 'BAGGY JEANS',
    baggyJeansSubtitle: 'Casual style that stays stylish',
    findYourFitting: 'FIND YOUR FIT',
    discountUpTo40: 'UP TO 40% OFF',
    discountSubtitle: 'Get your favorite collection at special prices',
    viewPromo: 'VIEW PROMO',
    viewFullCollection: 'View full collection',
    viewAllCollection: 'View entire collection',
    shopByCategory: 'SHOP BY CATEGORY',
    featuredProducts: 'FEATURED PRODUCTS',
    viewAllProducts: 'VIEW ALL',
    fittingGuide: 'FITTING GUIDE',
    fittingGuideDesc: 'Find the perfect fit for you',
    memberProgramTitle: 'MEMBER PROGRAM',
    memberProgramDesc: 'Get special discounts and reward points',
    findStoreTitle: 'FIND A STORE',
    findStoreDesc: 'Visit the nearest store in your city',
    getLatestUpdates: 'GET THE LATEST UPDATES',
    newsletterDesc: 'Subscribe your email to get the latest collection info, exclusive promos, and other special offers.',
    enterYourEmail: 'Enter your email',
    registerNewsletter: 'SUBSCRIBE',
    premiumDenimDesc: 'Premium denim collection with the best quality and style. Shop jeans, jackets, and accessories in various fits and sizes.',
    failedLoadHomepage: 'Failed to load homepage data',
    
    // NotFound
    pageNotFound: 'Page not found',
    backToHome: 'Back to Home',
    
    // Layout/Footer
    premiumDenimCollection: 'Premium denim collection with the best quality and style.',
    contact: 'Contact',
    helpCenter: 'Help Center',
    viewAllWomenProducts: 'View All Women\'s Products →',
    viewAllMenProducts: 'View All Men\'s Products →',
    noCategories: 'No categories available',
    
    // Language
    language: 'Language',
    indonesian: 'Indonesian',
    english: 'English',
    switchLanguage: 'Switch Language',
    
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
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://be-hojdenim.yyyy-zzzzz-online.com/api'}/exchange-rates/IDR/USD`);
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
      <span className="text-lg">{language === 'id' ? '🇮🇩' : '🇺🇸'}</span>
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
        <span className="text-lg">{language === 'id' ? '🇮🇩' : '🇺🇸'}</span>
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
              <span>🇺🇸</span>
              <span>English</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default translations;
