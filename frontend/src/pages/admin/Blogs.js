import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import apiClient, { blogAPI } from '../../services/api';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaImage, FaEye, FaSearch, FaNewspaper, FaStar, FaRegStar } from 'react-icons/fa';
import Modal from '../../components/admin/Modal';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://be-hojdenim.yyyy-zzzzz-online.com/api';

const getImageFullUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const baseUrl = API_BASE_URL.replace('/api', '');
  return `${baseUrl}${url}`;
};

const initialFormData = {
  title: '',
  content: '',
  excerpt: '',
  featured_image: '',
  meta_title: '',
  meta_description: '',
  meta_keywords: '',
  og_image: '',
  canonical_url: '',
  category: '',
  tags: [],
  status: 'draft',
  is_featured: false
};

const AdminBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [blogToDelete, setBlogToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [formData, setFormData] = useState(initialFormData);
  const [tagInput, setTagInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('content'); // content | seo
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const quillRef = useRef(null);

  useEffect(() => {
    fetchBlogs();
  }, [pagination.page, statusFilter]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const params = { page: pagination.page, limit: pagination.limit };
      if (statusFilter) params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;
      const response = await blogAPI.getAll(params);
      setBlogs(response.data.data || []);
      if (response.data.pagination) {
        setPagination(prev => ({ ...prev, ...response.data.pagination }));
      }
      setError('');
    } catch (err) {
      setError('Gagal memuat blog: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchBlogs();
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleContentChange = (value) => {
    setFormData(prev => ({ ...prev, content: value }));
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagToRemove)
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    try {
      setUploading(true);
      const response = await blogAPI.uploadImage(formDataUpload);
      if (response.data.success) {
        setFormData(prev => ({
          ...prev,
          featured_image: response.data.data.url,
          og_image: prev.og_image || response.data.data.url
        }));
      }
    } catch (err) {
      setError('Gagal upload gambar: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  // Image handler for Quill editor
  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      const formDataUpload = new FormData();
      formDataUpload.append('image', file);

      try {
        const response = await blogAPI.uploadImage(formDataUpload);
        if (response.data.success) {
          const quill = quillRef.current?.getEditor();
          if (quill) {
            const range = quill.getSelection(true);
            quill.insertEmbed(range.index, 'image', getImageFullUrl(response.data.data.url));
            quill.setSelection(range.index + 1);
          }
        }
      } catch (err) {
        console.error('Error uploading image in editor:', err);
      }
    };
  };

  const quillModules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'align': [] }],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    }
  }), []);

  const quillFormats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet',
    'align',
    'blockquote', 'code-block',
    'link', 'image', 'video'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title.trim()) {
      setError('Judul blog wajib diisi');
      return;
    }
    if (!formData.content.trim() || formData.content === '<p><br></p>') {
      setError('Konten blog wajib diisi');
      return;
    }

    try {
      const payload = {
        ...formData,
        tags: formData.tags.length > 0 ? formData.tags : null,
        is_featured: formData.is_featured ? 1 : 0,
        meta_title: formData.meta_title || formData.title,
        meta_description: formData.meta_description || (formData.excerpt || '').substring(0, 160)
      };

      if (editingBlog) {
        await blogAPI.update(editingBlog.id, payload);
        setSuccess('Blog berhasil diupdate!');
      } else {
        await blogAPI.create(payload);
        setSuccess('Blog berhasil dibuat!');
      }

      resetForm();
      fetchBlogs();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan blog');
    }
  };

  const handleEdit = (blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title || '',
      content: blog.content || '',
      excerpt: blog.excerpt || '',
      featured_image: blog.featured_image || '',
      meta_title: blog.meta_title || '',
      meta_description: blog.meta_description || '',
      meta_keywords: blog.meta_keywords || '',
      og_image: blog.og_image || '',
      canonical_url: blog.canonical_url || '',
      category: blog.category || '',
      tags: blog.tags || [],
      status: blog.status || 'draft',
      is_featured: blog.is_featured ? true : false
    });
    setActiveTab('content');
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingBlog(null);
    setShowForm(false);
    setTagInput('');
    setActiveTab('content');
  };

  const confirmDelete = async () => {
    if (!blogToDelete) return;
    try {
      await blogAPI.delete(blogToDelete.id);
      setSuccess('Blog berhasil dihapus!');
      setBlogToDelete(null);
      fetchBlogs();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menghapus blog');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      archived: 'bg-gray-100 text-gray-600'
    };
    const labels = {
      published: 'Published',
      draft: 'Draft',
      archived: 'Archived'
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || styles.draft}`}>
        {labels[status] || status}
      </span>
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  return (
    <>
      <Helmet>
        <title>Kelola Blog - Admin</title>
      </Helmet>

      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Kelola Blog</h1>
            <p className="text-sm text-gray-500 mt-1">Buat dan kelola artikel blog untuk website</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
          >
            <FaPlus /> Buat Artikel Baru
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
            <span className="text-sm">{error}</span>
            <button onClick={() => setError('')}><FaTimes /></button>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            {success}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari artikel..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button type="submit" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
                Cari
              </button>
            </form>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Blog List */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Memuat data...</div>
          ) : blogs.length === 0 ? (
            <div className="p-8 text-center">
              <FaNewspaper className="mx-auto text-4xl text-gray-300 mb-3" />
              <p className="text-gray-500">Belum ada artikel blog</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Artikel</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Kategori</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Tanggal</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {blogs.map((blog) => (
                    <tr key={blog.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {blog.featured_image ? (
                            <img
                              src={getImageFullUrl(blog.featured_image)}
                              alt={blog.title}
                              className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                              onError={(e) => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="%23ddd"><rect width="48" height="48"/></svg>'; }}
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FaNewspaper className="text-gray-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <p className="font-medium text-gray-900 text-sm truncate">{blog.title}</p>
                              {blog.is_featured ? <FaStar className="text-yellow-500 flex-shrink-0 text-xs" /> : null}
                            </div>
                            <p className="text-xs text-gray-500 truncate max-w-xs">{blog.excerpt || 'Tidak ada excerpt'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-sm text-gray-600">{blog.category || '-'}</span>
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(blog.status)}</td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-sm text-gray-600">{formatDate(blog.published_at || blog.created_at)}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {blog.status === 'published' && (
                            <a
                              href={`/blog/${blog.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-gray-400 hover:text-blue-600 transition"
                              title="Lihat"
                            >
                              <FaEye />
                            </a>
                          )}
                          <button
                            onClick={() => handleEdit(blog)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => setBlogToDelete(blog)}
                            className="p-2 text-gray-400 hover:text-red-600 transition"
                            title="Hapus"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <span className="text-sm text-gray-600">
                Total {pagination.total} artikel
              </span>
              <div className="flex gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(pageNum => (
                  <button
                    key={pageNum}
                    onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                    className={`px-3 py-1 text-sm rounded ${
                      pageNum === pagination.page
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Blog Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={resetForm}
        title={editingBlog ? 'Edit Artikel' : 'Buat Artikel Baru'}
        size="5xl"
      >
        <form onSubmit={handleSubmit}>
          {/* Tabs */}
          <div className="flex border-b mb-4">
            <button
              type="button"
              onClick={() => setActiveTab('content')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
                activeTab === 'content'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Konten
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('seo')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
                activeTab === 'seo'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              SEO & Media
            </button>
          </div>

          <div className="overflow-y-auto max-h-[65vh] px-1">
            {/* Content Tab */}
            {activeTab === 'content' && (
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Judul Artikel <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Masukkan judul artikel"
                    required
                  />
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ringkasan (Excerpt)
                  </label>
                  <textarea
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ringkasan singkat artikel yang akan tampil pada daftar blog..."
                  />
                </div>

                {/* Content WYSIWYG */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Konten Artikel <span className="text-red-500">*</span>
                  </label>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <ReactQuill
                      ref={quillRef}
                      theme="snow"
                      value={formData.content}
                      onChange={handleContentChange}
                      modules={quillModules}
                      formats={quillFormats}
                      placeholder="Tulis konten artikel di sini..."
                      style={{ minHeight: '300px' }}
                    />
                  </div>
                </div>

                {/* Category & Status Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g. Fashion, Tips, News"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="is_featured"
                        checked={formData.is_featured}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        <FaStar className="inline text-yellow-500 mr-1" />
                        Artikel Unggulan
                      </span>
                    </label>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                      >
                        {tag}
                        <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-blue-900">
                          <FaTimes className="text-xs" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(e); } }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ketik tag lalu tekan Enter"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                    >
                      Tambah
                    </button>
                  </div>
                </div>

                {/* Featured Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gambar Utama</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        name="featured_image"
                        value={formData.featured_image}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="URL gambar atau upload file"
                      />
                    </div>
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer text-sm flex-shrink-0">
                      <FaImage />
                      {uploading ? 'Uploading...' : 'Upload'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  </div>
                  {formData.featured_image && (
                    <div className="mt-2">
                      <img
                        src={getImageFullUrl(formData.featured_image)}
                        alt="Preview"
                        className="h-32 object-cover rounded-lg"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SEO Tab */}
            {activeTab === 'seo' && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-2">
                  <h3 className="text-sm font-semibold text-blue-800 mb-1">SEO & Media Sosial</h3>
                  <p className="text-xs text-blue-600">
                    Optimalkan artikel Anda untuk mesin pencari dan media sosial. Jika dibiarkan kosong, akan diisi otomatis dari judul dan excerpt.
                  </p>
                </div>

                {/* SEO Preview */}
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <p className="text-xs text-gray-500 mb-2">Preview di Google:</p>
                  <div>
                    <p className="text-blue-700 text-base font-medium truncate">
                      {formData.meta_title || formData.title || 'Judul Artikel'}
                    </p>
                    <p className="text-green-700 text-xs truncate">
                      {formData.canonical_url || `https://yoursite.com/blog/${formData.title ? formData.title.toLowerCase().replace(/\s+/g, '-').substring(0, 50) : 'slug'}`}
                    </p>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {formData.meta_description || formData.excerpt || 'Deskripsi artikel akan muncul di sini...'}
                    </p>
                  </div>
                </div>

                {/* Meta Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Title
                    <span className="text-xs text-gray-400 ml-2">
                      {(formData.meta_title || '').length}/60 karakter
                    </span>
                  </label>
                  <input
                    type="text"
                    name="meta_title"
                    value={formData.meta_title}
                    onChange={handleChange}
                    maxLength={100}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Judul untuk mesin pencari (kosongkan untuk pakai judul artikel)"
                  />
                </div>

                {/* Meta Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Description
                    <span className="text-xs text-gray-400 ml-2">
                      {(formData.meta_description || '').length}/160 karakter
                    </span>
                  </label>
                  <textarea
                    name="meta_description"
                    value={formData.meta_description}
                    onChange={handleChange}
                    rows={3}
                    maxLength={300}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Deskripsi untuk mesin pencari (kosongkan untuk pakai excerpt)"
                  />
                </div>

                {/* Meta Keywords */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meta Keywords</label>
                  <input
                    type="text"
                    name="meta_keywords"
                    value={formData.meta_keywords}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>

                {/* OG Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    OG Image (Social Media Preview)
                  </label>
                  <input
                    type="text"
                    name="og_image"
                    value={formData.og_image}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="URL gambar untuk preview di media sosial (kosongkan untuk pakai gambar utama)"
                  />
                  {formData.og_image && (
                    <div className="mt-2">
                      <img
                        src={getImageFullUrl(formData.og_image)}
                        alt="OG Preview"
                        className="h-24 object-cover rounded-lg"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  )}
                </div>

                {/* Canonical URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Canonical URL</label>
                  <input
                    type="text"
                    name="canonical_url"
                    value={formData.canonical_url}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://yoursite.com/blog/article-slug (opsional)"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
            >
              {editingBlog ? 'Update Artikel' : 'Simpan Artikel'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!blogToDelete}
        onClose={() => setBlogToDelete(null)}
        title="Konfirmasi Hapus"
        size="sm"
      >
        <p className="text-sm text-gray-600 mb-4">
          Yakin ingin menghapus artikel <strong>"{blogToDelete?.title}"</strong>? Tindakan ini tidak bisa dibatalkan.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setBlogToDelete(null)}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm"
          >
            Batal
          </button>
          <button
            onClick={confirmDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
          >
            Hapus
          </button>
        </div>
      </Modal>
    </>
  );
};

export default AdminBlogs;
