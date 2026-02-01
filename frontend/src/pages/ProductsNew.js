import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../redux/slices/productSlice';
import { getProductImageUrl, handleImageError } from '../utils/imageUtils';
import apiClient from '../services/api';

const Products = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, isLoading, pagination } = useSelector((state) => state.products);

  // Categories & Fittings & Sizes from API
  const [categories, setCategories] = useState([]);
  const [fittings, setFittings] = useState([]);
  const [sizes, setSizes] = useState([]);

  // Filter states
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    fitting: searchParams.get('fitting') || '',
    size: searchParams.get('size') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    gender: searchParams.get('gender') || '',
    discount: searchParams.get('discount') || '',
    new: searchParams.get('new') || ''
  });

  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [showFilters, setShowFilters] = useState(false); // mobile filter toggle

  // Fetch categories, fittings, and sizes from API
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [categoriesRes, fittingsRes, sizesRes] = await Promise.all([
          apiClient.get('/categories'),
          apiClient.get('/fittings'),
          apiClient.get('/sizes')
        ]);
        setCategories(categoriesRes.data.data || []);
        setFittings(fittingsRes.data.data || []);
        setSizes(sizesRes.data.data || []);
      } catch (error) {
        console.error('Error fetching filter data:', error);
      }
    };
    fetchFilterData();
  }, []);

  // Update filters when URL changes
  useEffect(() => {
    setFilters({
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || '',
      fitting: searchParams.get('fitting') || '',
      size: searchParams.get('size') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      gender: searchParams.get('gender') || '',
      discount: searchParams.get('discount') || '',
      new: searchParams.get('new') || ''
    });
    setSortBy(searchParams.get('sort') || 'newest');
  }, [searchParams]);

  // Close mobile filter on route change
  useEffect(() => {
    setShowFilters(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile filter is open
  useEffect(() => {
    if (showFilters) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showFilters]);

  // Fetch products when filters change - use searchParams directly instead of filters state
  useEffect(() => {
    // Build query params for API directly from URL params
    const params = {
      page: searchParams.get('page') || 1,
      limit: 24,
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      fitting: searchParams.get('fitting') || undefined,
      size: searchParams.get('size') || undefined,
      min_price: searchParams.get('minPrice') || undefined,
      max_price: searchParams.get('maxPrice') || undefined,
    };

    // Get sort from URL or use default
    const currentSort = searchParams.get('sort') || 'newest';

    // Map sort values to backend format
    if (currentSort === 'newest') {
      params.sort = 'created_at';
      params.order = 'DESC';
    } else if (currentSort === 'price_asc') {
      params.sort = 'base_price';
      params.order = 'ASC';
    } else if (currentSort === 'price_desc') {
      params.sort = 'base_price';
      params.order = 'DESC';
    } else if (currentSort === 'name_asc') {
      params.sort = 'name';
      params.order = 'ASC';
    } else if (currentSort === 'popular') {
      params.sort = 'view_count';
      params.order = 'DESC';
    }

    // Remove undefined params
    Object.keys(params).forEach(key => {
      if (params[key] === undefined || params[key] === '') delete params[key];
    });

    dispatch(fetchProducts(params));
  }, [dispatch, searchParams]);

  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);
    
    // Update URL
    const params = new URLSearchParams();
    Object.keys(newFilters).forEach(key => {
      if (newFilters[key]) params.set(key, newFilters[key]);
    });
    if (sortBy) params.set('sort', sortBy);
    setSearchParams(params);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    const params = new URLSearchParams(searchParams);
    params.set('sort', value);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      fitting: '',
      size: '',
      minPrice: '',
      maxPrice: '',
      gender: '',
      discount: '',
      new: ''
    });
    setSortBy('newest');
    setSearchParams({});
  };

  const activeFiltersCount = Object.values(filters).filter(v => v).length;

  return (
    <>
      <Helmet>
        <title>Produk - Marketplace Jeans</title>
        <meta name="description" content="Jelajahi koleksi lengkap celana jeans, jaket, dan aksesoris" />
      </Helmet>

      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
          {/* Breadcrumb */}
          <div className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
            <Link to="/" className="hover:underline">Home</Link>
            <span className="mx-1 sm:mx-2">/</span>
            <span className="text-black font-semibold">Produk</span>
          </div>

          {/* Page Title */}
          <div className="mb-4 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 uppercase tracking-wide">
              {filters.gender === 'wanita' ? 'WANITA' : filters.gender === 'pria' ? 'PRIA' : 'SEMUA PRODUK'}
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              {pagination?.total || 0} produk ditemukan
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 sm:gap-8">
            {/* Sidebar Filters - Desktop */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="bg-white p-4 sm:p-6 sticky top-24">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-bold text-lg uppercase tracking-wide">FILTER</h2>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-red-600 hover:underline uppercase"
                    >
                      Hapus ({activeFiltersCount})
                    </button>
                  )}
                </div>

                {/* Gender Filter */}
                <div className="mb-6 pb-6 border-b">
                  <h3 className="font-semibold mb-3 uppercase text-sm">JENIS KELAMIN</h3>
                  <div className="space-y-2">
                    {['pria', 'wanita'].map((gender) => (
                      <label key={gender} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          value={gender}
                          checked={filters.gender === gender}
                          onChange={(e) => handleFilterChange('gender', e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-sm capitalize">{gender}</span>
                      </label>
                    ))}
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value=""
                        checked={!filters.gender}
                        onChange={(e) => handleFilterChange('gender', '')}
                        className="mr-2"
                      />
                      <span className="text-sm">Semua</span>
                    </label>
                  </div>
                </div>

                {/* Category Filter */}
                <div className="mb-6 pb-6 border-b">
                  <h3 className="font-semibold mb-3 uppercase text-sm">KATEGORI</h3>
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <label key={cat.id} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.category === String(cat.id)}
                          onChange={(e) => handleFilterChange('category', e.target.checked ? String(cat.id) : '')}
                          className="mr-2"
                        />
                        <span className="text-sm">{cat.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Fitting Filter */}
                <div className="mb-6 pb-6 border-b">
                  <h3 className="font-semibold mb-3 uppercase text-sm">FITTING</h3>
                  <div className="space-y-2">
                    {fittings.map((fit) => (
                      <label key={fit.id} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.fitting === String(fit.id)}
                          onChange={(e) => handleFilterChange('fitting', e.target.checked ? String(fit.id) : '')}
                          className="mr-2"
                        />
                        <span className="text-sm">{fit.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Size Filter */}
                <div className="mb-6 pb-6 border-b">
                  <h3 className="font-semibold mb-3 uppercase text-sm">UKURAN</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size.id}
                        onClick={() => handleFilterChange('size', filters.size === String(size.id) ? '' : String(size.id))}
                        className={`py-2 text-sm border transition ${
                          filters.size === String(size.id)
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-black border-gray-300 hover:border-black'
                        }`}
                      >
                        {size.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 uppercase text-sm">HARGA</h3>
                  <div className="space-y-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="w-full px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-black"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="w-full px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              {/* Top Bar - Sort & View Mode */}
              <div className="bg-white p-3 sm:p-4 mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-4">
                  {/* Mobile Filter Toggle */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden flex items-center justify-center gap-2 px-3 sm:px-4 py-2 border border-black text-xs sm:text-sm font-semibold uppercase flex-1 sm:flex-none"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    <span>FILTER {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
                  </button>

                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border focus:outline-none focus:ring-2 focus:ring-black text-xs sm:text-sm"
                  >
                    <option value="newest">TERBARU</option>
                    <option value="price_asc">HARGA: RENDAH</option>
                    <option value="price_desc">HARGA: TINGGI</option>
                    <option value="name_asc">NAMA: A-Z</option>
                    <option value="popular">TERPOPULER</option>
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'text-black' : 'text-gray-400'}`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 3h4v4H3V3zm6 0h4v4H9V3zm6 0h4v4h-4V3zM3 9h4v4H3V9zm6 0h4v4H9V9zm6 0h4v4h-4V9zM3 15h4v4H3v-4zm6 0h4v4H9v-4zm6 0h4v4h-4v-4z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'text-black' : 'text-gray-400'}`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4h14v2H3V4zm0 5h14v2H3V9zm0 5h14v2H3v-2z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Mobile Filters Panel - Full Screen Overlay */}
              {showFilters && (
                <div className="lg:hidden fixed inset-0 bg-white z-50 overflow-y-auto">
                  <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                    <h2 className="font-bold uppercase text-lg">FILTER</h2>
                    <button onClick={() => setShowFilters(false)} className="text-2xl p-2">&times;</button>
                  </div>
                  
                  <div className="p-4 space-y-6 pb-32">
                    {/* Gender */}
                    <div>
                      <h3 className="font-semibold mb-3 text-sm uppercase">JENIS KELAMIN</h3>
                      <div className="flex flex-wrap gap-2">
                        {['pria', 'wanita'].map((gender) => (
                          <button
                            key={gender}
                            onClick={() => handleFilterChange('gender', filters.gender === gender ? '' : gender)}
                            className={`px-4 py-2 text-sm border transition capitalize ${
                              filters.gender === gender
                                ? 'bg-black text-white border-black'
                                : 'bg-white text-black border-gray-300'
                            }`}
                          >
                            {gender}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Category */}
                    <div>
                      <h3 className="font-semibold mb-3 text-sm uppercase">KATEGORI</h3>
                      <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => handleFilterChange('category', filters.category === String(cat.id) ? '' : String(cat.id))}
                            className={`px-3 py-2 text-sm border transition ${
                              filters.category === String(cat.id)
                                ? 'bg-black text-white border-black'
                                : 'bg-white text-black border-gray-300'
                            }`}
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Fitting */}
                    <div>
                      <h3 className="font-semibold mb-3 text-sm uppercase">FITTING</h3>
                      <div className="flex flex-wrap gap-2">
                        {fittings.map((fit) => (
                          <button
                            key={fit.id}
                            onClick={() => handleFilterChange('fitting', filters.fitting === String(fit.id) ? '' : String(fit.id))}
                            className={`px-3 py-2 text-sm border transition ${
                              filters.fitting === String(fit.id)
                                ? 'bg-black text-white border-black'
                                : 'bg-white text-black border-gray-300'
                            }`}
                          >
                            {fit.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Size */}
                    <div>
                      <h3 className="font-semibold mb-3 text-sm uppercase">UKURAN</h3>
                      <div className="grid grid-cols-5 gap-2">
                        {sizes.map((size) => (
                          <button
                            key={size.id}
                            onClick={() => handleFilterChange('size', filters.size === String(size.id) ? '' : String(size.id))}
                            className={`py-2 text-sm border transition ${
                              filters.size === String(size.id)
                                ? 'bg-black text-white border-black'
                                : 'bg-white text-black border-gray-300'
                            }`}
                          >
                            {size.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Price Range */}
                    <div>
                      <h3 className="font-semibold mb-3 text-sm uppercase">HARGA</h3>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Min"
                          value={filters.minPrice}
                          onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                          className="flex-1 px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-black text-sm"
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          value={filters.maxPrice}
                          onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                          className="flex-1 px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-black text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Fixed Bottom Buttons */}
                  <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex gap-3">
                    <button
                      onClick={() => {
                        clearFilters();
                        setShowFilters(false);
                      }}
                      className="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold uppercase text-sm"
                    >
                      HAPUS
                    </button>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="flex-1 py-3 bg-black text-white font-semibold uppercase text-sm"
                    >
                      TERAPKAN ({pagination?.total || 0})
                    </button>
                  </div>
                </div>
              )}

              {/* Products Grid/List */}
              {isLoading ? (
                <div className="flex justify-center items-center py-16 sm:py-20">
                  <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-black"></div>
                </div>
              ) : products && products.length > 0 ? (
                <>
                  <div className={viewMode === 'grid' 
                    ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6' 
                    : 'space-y-4 sm:space-y-6'
                  }>
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} viewMode={viewMode} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination && pagination.totalPages > 1 && (
                    <div className="mt-8 sm:mt-12 flex justify-center items-center gap-1 sm:gap-2 flex-wrap">
                      {[...Array(pagination.totalPages)].map((_, index) => {
                        const page = index + 1;
                        // Show limited pages on mobile
                        const currentPage = pagination.currentPage;
                        const showPage = page === 1 || 
                          page === pagination.totalPages || 
                          (page >= currentPage - 1 && page <= currentPage + 1);
                        
                        if (!showPage) {
                          if (page === 2 || page === pagination.totalPages - 1) {
                            return <span key={page} className="px-2">...</span>;
                          }
                          return null;
                        }

                        return (
                          <button
                            key={page}
                            onClick={() => {
                              const params = new URLSearchParams(searchParams);
                              params.set('page', page);
                              setSearchParams(params);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className={`min-w-[40px] px-3 sm:px-4 py-2 border text-sm ${
                              pagination.currentPage === page
                                ? 'bg-black text-white border-black'
                                : 'bg-white text-black border-gray-300 hover:border-black'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16 sm:py-20">
                  <p className="text-gray-600 text-base sm:text-lg mb-4">Tidak ada produk ditemukan</p>
                  <button
                    onClick={clearFilters}
                    className="px-6 py-2.5 bg-black text-white font-semibold uppercase text-sm hover:bg-gray-800"
                  >
                    HAPUS FILTER
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Product Card Component
const ProductCard = ({ product, viewMode }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Calculate discount percentage for badge display
  const discountPercentage = product.discount_percentage || 
    (product.discount_price && product.base_price ? 
      Math.round((1 - product.discount_price / product.base_price) * 100) : null);

  if (viewMode === 'list') {
    return (
      <Link to={`/products/${product.slug}`} className="bg-white flex gap-3 sm:gap-6 p-4 sm:p-6 hover:shadow-lg transition rounded-lg shadow-sm">
        <div className="w-24 sm:w-48 h-32 sm:h-64 flex-shrink-0 overflow-hidden bg-gray-100 rounded-lg relative">
          <img
            src={getProductImageUrl(product)}
            onError={(e) => handleImageError(e, 'product')}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {product.discount_price && discountPercentage && (
            <div className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-red-600 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold rounded">
              -{discountPercentage}%
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 py-1">
          <h3 className="font-semibold text-sm sm:text-lg mb-1 sm:mb-2 line-clamp-2">{product.name}</h3>
          {product.category_name && (
            <span className="text-xs text-gray-500 uppercase block mb-2">{product.category_name}</span>
          )}
          <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 hidden sm:block">{product.description}</p>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {product.discount_price ? (
              <>
                <span className="font-bold text-sm sm:text-xl text-red-600">
                  Rp {parseInt(product.discount_price).toLocaleString('id-ID')}
                </span>
                <span className="text-xs sm:text-sm text-gray-400 line-through">
                  Rp {parseInt(product.price || product.base_price).toLocaleString('id-ID')}
                </span>
              </>
            ) : (
              <span className="font-bold text-sm sm:text-xl">
                Rp {parseInt(product.price || product.base_price || 0).toLocaleString('id-ID')}
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group bg-white block rounded-lg shadow-sm hover:shadow-md transition-shadow"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="aspect-[3/4] overflow-hidden bg-gray-100 rounded-t-lg relative">
        <img
          src={getProductImageUrl(product)}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
          onError={(e) => handleImageError(e, 'product')}
        />
        {product.discount_price && discountPercentage && (
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-red-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold rounded">
            -{discountPercentage}%
          </div>
        )}
        {isHovered && (
          <div className="hidden sm:flex absolute inset-0 bg-black/10 items-center justify-center">
            <span className="bg-white px-4 sm:px-6 py-1.5 sm:py-2 font-bold uppercase text-xs sm:text-sm rounded">
              LIHAT DETAIL
            </span>
          </div>
        )}
      </div>
      <div className="p-3 sm:p-4">
        <h3 className="font-semibold mb-2 group-hover:underline text-xs sm:text-sm line-clamp-2">{product.name}</h3>
        {product.category_name && (
          <p className="text-[10px] sm:text-xs text-gray-500 mb-2 uppercase">{product.category_name}</p>
        )}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {product.discount_price ? (
            <>
              <span className="font-bold text-red-600 text-sm sm:text-base">
                Rp {parseInt(product.discount_price).toLocaleString('id-ID')}
              </span>
              <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                Rp {parseInt(product.price || product.base_price).toLocaleString('id-ID')}
              </span>
            </>
          ) : (
            <span className="font-bold text-sm sm:text-base">
              Rp {parseInt(product.price || product.base_price || 0).toLocaleString('id-ID')}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default Products;
