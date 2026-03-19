import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { blogAPI } from '../services/api';
import { useLanguage } from '../utils/i18n';
import { FaCalendarAlt, FaUser, FaTag, FaChevronLeft, FaChevronRight, FaSearch } from 'react-icons/fa';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://be-hojdenim.yyyy-zzzzz-online.com/api';

const getImageFullUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const baseUrl = API_BASE_URL.replace('/api', '');
  return `${baseUrl}${url}`;
};

const BlogList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [blogs, setBlogs] = useState([]);
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });

  const currentPage = parseInt(searchParams.get('page')) || 1;
  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(currentSearch);

  useEffect(() => {
    fetchBlogs();
  }, [currentPage, currentCategory, currentSearch]);

  useEffect(() => {
    fetchSidebar();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const params = { page: currentPage, limit: 9 };
      if (currentCategory) params.category = currentCategory;
      if (currentSearch) params.search = currentSearch;

      const response = await blogAPI.getPublished(params);
      setBlogs(response.data.data || []);
      if (response.data.pagination) {
        setPagination(response.data.pagination);
      }
    } catch (err) {
      console.error('Error fetching blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSidebar = async () => {
    try {
      const [catRes, featRes] = await Promise.all([
        blogAPI.getCategories(),
        blogAPI.getFeatured({ limit: 3 })
      ]);
      setCategories(catRes.data.data || []);
      setFeaturedBlogs(featRes.data.data || []);
    } catch (err) {
      console.error('Error fetching sidebar:', err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchInput.trim()) params.set('q', searchInput.trim());
    if (currentCategory) params.set('category', currentCategory);
    setSearchParams(params);
  };

  const handleCategoryFilter = (category) => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (currentSearch) params.set('q', currentSearch);
    setSearchParams(params);
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  return (
    <>
      <Helmet>
        <title>{currentCategory ? `Blog: ${currentCategory}` : 'Blog'} - HOJ Denim</title>
        <meta name="description" content="Baca artikel terbaru tentang fashion, denim, dan tips styling dari HOJ Denim" />
        <meta property="og:title" content="Blog - HOJ Denim" />
        <meta property="og:description" content="Artikel terbaru tentang fashion, denim, dan tips styling" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="bg-gray-50 min-h-screen">
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-700 text-white">
          <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">Blog</h1>
            <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto">
              Temukan inspirasi fashion, tips styling, dan berita terbaru dari dunia denim
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1">
              {/* Search bar mobile */}
              <form onSubmit={handleSearch} className="lg:hidden mb-6">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Cari artikel..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </form>

              {/* Active filters */}
              {(currentCategory || currentSearch) && (
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <span className="text-sm text-gray-500">Filter:</span>
                  {currentCategory && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
                      {currentCategory}
                      <button onClick={() => handleCategoryFilter('')} className="hover:text-blue-900 ml-1">&times;</button>
                    </span>
                  )}
                  {currentSearch && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                      "{currentSearch}"
                      <button onClick={() => { setSearchInput(''); const p = new URLSearchParams(searchParams); p.delete('q'); setSearchParams(p); }} className="hover:text-gray-900 ml-1">&times;</button>
                    </span>
                  )}
                </div>
              )}

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm animate-pulse">
                      <div className="h-48 bg-gray-200 rounded-t-xl" />
                      <div className="p-5 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-full" />
                        <div className="h-3 bg-gray-200 rounded w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : blogs.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">📝</div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Belum ada artikel</h3>
                  <p className="text-gray-500 text-sm">
                    {currentSearch ? `Tidak ditemukan artikel untuk "${currentSearch}"` : 'Artikel akan segera hadir'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Blog Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {blogs.map((blog) => (
                      <Link
                        key={blog.id}
                        to={`/blog/${blog.slug}`}
                        className="group bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden"
                      >
                        <div className="aspect-[16/10] overflow-hidden bg-gray-100">
                          {blog.featured_image ? (
                            <img
                              src={getImageFullUrl(blog.featured_image)}
                              alt={blog.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                              onError={(e) => { e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400 text-4xl">📷</div>'; }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">📝</div>
                          )}
                        </div>
                        <div className="p-5">
                          <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                            {blog.category && (
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-medium">
                                {blog.category}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <FaCalendarAlt className="text-gray-400" />
                              {formatDate(blog.published_at)}
                            </span>
                          </div>
                          <h2 className="font-semibold text-gray-900 group-hover:text-blue-600 transition line-clamp-2 mb-2">
                            {blog.title}
                          </h2>
                          {blog.excerpt && (
                            <p className="text-sm text-gray-500 line-clamp-2">{blog.excerpt}</p>
                          )}
                          {blog.author_name && (
                            <div className="flex items-center gap-1 text-xs text-gray-400 mt-3">
                              <FaUser /> {blog.author_name}
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-10">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FaChevronLeft className="text-sm" />
                      </button>
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === pagination.totalPages || Math.abs(p - currentPage) <= 1)
                        .reduce((acc, p, i, arr) => {
                          if (i > 0 && p - arr[i - 1] > 1) acc.push('...');
                          acc.push(p);
                          return acc;
                        }, [])
                        .map((item, idx) =>
                          item === '...' ? (
                            <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">...</span>
                          ) : (
                            <button
                              key={item}
                              onClick={() => handlePageChange(item)}
                              className={`w-10 h-10 rounded-lg text-sm font-medium transition ${
                                item === currentPage
                                  ? 'bg-gray-900 text-white'
                                  : 'border border-gray-300 hover:bg-gray-100'
                              }`}
                            >
                              {item}
                            </button>
                          )
                        )}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= pagination.totalPages}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FaChevronRight className="text-sm" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Sidebar */}
            <div className="w-full lg:w-72 flex-shrink-0 space-y-6">
              {/* Search Desktop */}
              <form onSubmit={handleSearch} className="hidden lg:block">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Cari artikel..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                  />
                </div>
              </form>

              {/* Categories */}
              {categories.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-5">
                  <h3 className="font-semibold text-gray-800 mb-3">Kategori</h3>
                  <div className="space-y-1">
                    <button
                      onClick={() => handleCategoryFilter('')}
                      className={`block w-full text-left px-3 py-2 text-sm rounded-lg transition ${
                        !currentCategory ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Semua Artikel
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.category}
                        onClick={() => handleCategoryFilter(cat.category)}
                        className={`flex items-center justify-between w-full text-left px-3 py-2 text-sm rounded-lg transition ${
                          currentCategory === cat.category ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <span>{cat.category}</span>
                        <span className={`text-xs ${currentCategory === cat.category ? 'text-gray-300' : 'text-gray-400'}`}>
                          ({cat.count})
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Featured Posts */}
              {featuredBlogs.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-5">
                  <h3 className="font-semibold text-gray-800 mb-3">Artikel Populer</h3>
                  <div className="space-y-3">
                    {featuredBlogs.map((blog) => (
                      <Link
                        key={blog.id}
                        to={`/blog/${blog.slug}`}
                        className="flex gap-3 group"
                      >
                        {blog.featured_image ? (
                          <img
                            src={getImageFullUrl(blog.featured_image)}
                            alt={blog.title}
                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 text-xl text-gray-300">
                            📝
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition line-clamp-2">
                            {blog.title}
                          </h4>
                          <p className="text-xs text-gray-400 mt-1">{formatDate(blog.published_at)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogList;
