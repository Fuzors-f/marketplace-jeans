import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../redux/slices/productSlice';

const Products = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, isLoading, pagination } = useSelector((state) => state.products);

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

  // Categories & Fittings data (should ideally come from API)
  const categories = ['Celana Jeans', 'Jaket Denim', 'Kemeja', 'T-Shirt', 'Aksesoris'];
  const fittings = ['Slim Fit', 'Regular Fit', 'Baggy Fit', 'Tapered Fit', 'Skinny Fit', 'Mom Fit', 'Boyfriend Fit'];
  const sizes = ['28', '29', '30', '31', '32', '33', '34', '36', '38', '40'];

  useEffect(() => {
    // Build query params
    const params = {
      page: searchParams.get('page') || 1,
      limit: 24,
      ...filters,
      sort: sortBy
    };

    // Remove empty params
    Object.keys(params).forEach(key => {
      if (!params[key]) delete params[key];
    });

    dispatch(fetchProducts(params));
  }, [dispatch, filters, sortBy, searchParams]);

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
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="text-sm text-gray-600 mb-6">
            <Link to="/" className="hover:underline">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-black font-semibold">Produk</span>
          </div>

          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 uppercase tracking-wide">
              {filters.gender === 'wanita' ? 'WANITA' : filters.gender === 'pria' ? 'PRIA' : 'SEMUA PRODUK'}
            </h1>
            <p className="text-gray-600">
              {pagination?.total || 0} produk ditemukan
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters - Desktop */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="bg-white p-6 sticky top-24">
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
                      <label key={cat} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.category === cat}
                          onChange={(e) => handleFilterChange('category', e.target.checked ? cat : '')}
                          className="mr-2"
                        />
                        <span className="text-sm">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Fitting Filter */}
                <div className="mb-6 pb-6 border-b">
                  <h3 className="font-semibold mb-3 uppercase text-sm">FITTING</h3>
                  <div className="space-y-2">
                    {fittings.map((fit) => (
                      <label key={fit} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.fitting === fit}
                          onChange={(e) => handleFilterChange('fitting', e.target.checked ? fit : '')}
                          className="mr-2"
                        />
                        <span className="text-sm">{fit}</span>
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
                        key={size}
                        onClick={() => handleFilterChange('size', filters.size === size ? '' : size)}
                        className={`py-2 text-sm border transition ${
                          filters.size === size
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-black border-gray-300 hover:border-black'
                        }`}
                      >
                        {size}
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
              <div className="bg-white p-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                  {/* Mobile Filter Toggle */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden flex items-center gap-2 px-4 py-2 border border-black text-sm font-semibold uppercase"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    FILTER {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                  </button>

                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="flex-1 md:flex-none px-4 py-2 border focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  >
                    <option value="newest">TERBARU</option>
                    <option value="price_asc">HARGA: RENDAH KE TINGGI</option>
                    <option value="price_desc">HARGA: TINGGI KE RENDAH</option>
                    <option value="name_asc">NAMA: A-Z</option>
                    <option value="popular">TERPOPULER</option>
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div className="hidden md:flex items-center gap-2">
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

              {/* Mobile Filters Panel */}
              {showFilters && (
                <div className="lg:hidden bg-white p-6 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold uppercase">FILTER</h2>
                    <button onClick={() => setShowFilters(false)} className="text-2xl">&times;</button>
                  </div>
                  
                  {/* Same filters as sidebar, condensed */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2 text-sm">JENIS KELAMIN</h3>
                      <select
                        value={filters.gender}
                        onChange={(e) => handleFilterChange('gender', e.target.value)}
                        className="w-full px-3 py-2 border"
                      >
                        <option value="">Semua</option>
                        <option value="pria">Pria</option>
                        <option value="wanita">Wanita</option>
                      </select>
                    </div>

                    <button
                      onClick={() => {
                        clearFilters();
                        setShowFilters(false);
                      }}
                      className="w-full py-2 border border-red-600 text-red-600 font-semibold uppercase text-sm"
                    >
                      HAPUS FILTER
                    </button>

                    <button
                      onClick={() => setShowFilters(false)}
                      className="w-full py-2 bg-black text-white font-semibold uppercase text-sm"
                    >
                      TERAPKAN
                    </button>
                  </div>
                </div>
              )}

              {/* Products Grid/List */}
              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                </div>
              ) : products && products.length > 0 ? (
                <>
                  <div className={viewMode === 'grid' 
                    ? 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6' 
                    : 'space-y-6'
                  }>
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} viewMode={viewMode} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination && pagination.totalPages > 1 && (
                    <div className="mt-12 flex justify-center items-center gap-2">
                      {[...Array(pagination.totalPages)].map((_, index) => {
                        const page = index + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => {
                              const params = new URLSearchParams(searchParams);
                              params.set('page', page);
                              setSearchParams(params);
                            }}
                            className={`px-4 py-2 border ${
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
                <div className="text-center py-20">
                  <p className="text-gray-600 text-lg mb-4">Tidak ada produk ditemukan</p>
                  <button
                    onClick={clearFilters}
                    className="px-6 py-2 bg-black text-white font-semibold uppercase text-sm hover:bg-gray-800"
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

  if (viewMode === 'list') {
    return (
      <Link to={`/products/${product.slug}`} className="bg-white flex gap-6 p-6 hover:shadow-lg transition">
        <div className="w-48 h-64 flex-shrink-0 overflow-hidden bg-gray-100">
          <img
            src={
              product.primary_image
                ? `${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}${product.primary_image}`
                : 'https://via.placeholder.com/400x600?text=No+Image'
            }
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
          <div className="flex items-center gap-3 mb-4">
            {product.discount_price ? (
              <>
                <span className="font-bold text-xl text-red-600">
                  Rp {parseInt(product.discount_price).toLocaleString('id-ID')}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  Rp {parseInt(product.price || product.base_price).toLocaleString('id-ID')}
                </span>
              </>
            ) : (
              <span className="font-bold text-xl">
                Rp {parseInt(product.price || product.base_price || 0).toLocaleString('id-ID')}
              </span>
            )}
          </div>
          {product.category_name && (
            <span className="text-xs text-gray-500 uppercase">{product.category_name}</span>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group bg-white"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="aspect-[3/4] overflow-hidden bg-gray-100 mb-3 relative">
        <img
          src={
            product.primary_image
              ? `${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}${product.primary_image}`
              : 'https://via.placeholder.com/400x600?text=No+Image'
          }
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
        />
        {product.discount_price && (
          <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 text-xs font-bold">
            SALE
          </div>
        )}
        {isHovered && (
          <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
            <span className="bg-white px-6 py-2 font-bold uppercase text-sm">
              LIHAT DETAIL
            </span>
          </div>
        )}
      </div>
      <h3 className="font-semibold mb-1 group-hover:underline text-sm">{product.name}</h3>
      <div className="flex items-center gap-2">
        {product.discount_price ? (
          <>
            <span className="font-bold text-red-600">
              Rp {parseInt(product.discount_price).toLocaleString('id-ID')}
            </span>
            <span className="text-xs text-gray-500 line-through">
              Rp {parseInt(product.price || product.base_price).toLocaleString('id-ID')}
            </span>
          </>
        ) : (
          <span className="font-bold">
            Rp {parseInt(product.price || product.base_price || 0).toLocaleString('id-ID')}
          </span>
        )}
      </div>
    </Link>
  );
};

export default Products;
