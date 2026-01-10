import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import apiClient from '../../services/api';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaImage, FaEye, FaEyeSlash, FaGlobe } from 'react-icons/fa';
import DataTable from '../../components/admin/DataTable';

const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  const [formData, setFormData] = useState({
    title: '',
    title_en: '',
    subtitle: '',
    subtitle_en: '',
    image_url: '',
    link_url: '',
    button_text: '',
    button_text_en: '',
    position: 'hero',
    sort_order: 0,
    start_date: '',
    end_date: '',
    is_active: true
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/banners/admin');
      setBanners(response.data.data || []);
      setError('');
    } catch (err) {
      setError('Gagal memuat banner: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const payload = {
        ...formData,
        sort_order: parseInt(formData.sort_order) || 0,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null
      };

      if (editingBanner) {
        await apiClient.put(`/banners/${editingBanner.id}`, payload);
        setSuccess('Banner berhasil diupdate!');
        setBanners(banners.map(banner =>
          banner.id === editingBanner.id ? { ...banner, ...payload } : banner
        ));
        setEditingBanner(null);
      } else {
        await apiClient.post('/banners', payload);
        setSuccess('Banner berhasil dibuat!');
        fetchBanners();
      }

      resetForm();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan banner');
      console.error(err);
    }
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || '',
      title_en: banner.title_en || '',
      subtitle: banner.subtitle || '',
      subtitle_en: banner.subtitle_en || '',
      image_url: banner.image_url || '',
      link_url: banner.link_url || '',
      button_text: banner.button_text || '',
      button_text_en: banner.button_text_en || '',
      position: banner.position || 'hero',
      sort_order: banner.sort_order || 0,
      start_date: banner.start_date ? banner.start_date.slice(0, 16) : '',
      end_date: banner.end_date ? banner.end_date.slice(0, 16) : '',
      is_active: banner.is_active
    });
    setShowForm(true);
  };

  const handleDelete = async (bannerId) => {
    if (window.confirm('Yakin ingin menghapus banner ini?')) {
      try {
        await apiClient.delete(`/banners/${bannerId}`);
        setSuccess('Banner berhasil dihapus!');
        setBanners(banners.filter(banner => banner.id !== bannerId));
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Gagal menghapus banner: ' + err.message);
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingBanner(null);
    setFormData({
      title: '',
      title_en: '',
      subtitle: '',
      subtitle_en: '',
      image_url: '',
      link_url: '',
      button_text: '',
      button_text_en: '',
      position: 'hero',
      sort_order: 0,
      start_date: '',
      end_date: '',
      is_active: true
    });
  };

  const getPositionLabel = (pos) => {
    const labels = {
      hero: 'Hero (Carousel)',
      sidebar: 'Sidebar',
      footer: 'Footer',
      popup: 'Popup'
    };
    return labels[pos] || pos;
  };

  // DataTable columns configuration
  const columns = [
    {
      key: 'image_url',
      label: 'Image',
      sortable: false,
      render: (value, banner) => (
        <img
          src={value}
          alt={banner.title}
          className="w-16 h-12 object-cover rounded"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/100x75?text=No+Image'; }}
        />
      )
    },
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (value, banner) => (
        <div>
          <p className="font-semibold">{value}</p>
          {banner.title_en && <p className="text-xs text-blue-600">EN: {banner.title_en}</p>}
          {banner.subtitle && <p className="text-xs text-gray-500">{banner.subtitle}</p>}
        </div>
      )
    },
    {
      key: 'position',
      label: 'Position',
      sortable: true,
      render: (value) => (
        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
          {getPositionLabel(value)}
        </span>
      )
    },
    {
      key: 'sort_order',
      label: 'Order',
      sortable: true
    },
    {
      key: 'is_active',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
          {value ? 'Aktif' : 'Nonaktif'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, banner) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(banner)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
            title="Edit"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => handleDelete(banner.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded"
            title="Hapus"
          >
            <FaTrash />
          </button>
        </div>
      )
    }
  ];

  // Mobile card renderer for DataTable
  const renderMobileCard = (banner) => (
    <div className="bg-white rounded-lg shadow overflow-hidden mb-3">
      <img
        src={banner.image_url}
        alt={banner.title}
        className="w-full h-32 object-cover"
        onError={(e) => { e.target.src = 'https://via.placeholder.com/400x150?text=No+Image'; }}
      />
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold">{banner.title}</h3>
            {banner.subtitle && <p className="text-sm text-gray-500">{banner.subtitle}</p>}
          </div>
          <span className={`px-2 py-1 rounded text-xs font-semibold ${banner.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
            {banner.is_active ? 'Aktif' : 'Nonaktif'}
          </span>
        </div>
        <div className="flex gap-2 text-xs text-gray-500 mb-3">
          <span className="bg-gray-100 px-2 py-1 rounded">{getPositionLabel(banner.position)}</span>
          <span className="bg-gray-100 px-2 py-1 rounded">Urutan: {banner.sort_order}</span>
        </div>
        <div className="flex gap-2 pt-3 border-t">
          <button
            onClick={() => handleEdit(banner)}
            className="flex-1 px-3 py-2 text-blue-600 border border-blue-600 rounded text-sm font-semibold hover:bg-blue-50"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(banner.id)}
            className="flex-1 px-3 py-2 text-red-600 border border-red-600 rounded text-sm font-semibold hover:bg-red-50"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Kelola Banner - Admin</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-4 lg:py-8">
          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-1">Manajemen Banner</h1>
              <p className="text-gray-600 text-sm">Kelola banner homepage</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
                className="px-4 py-2 border rounded hover:bg-gray-50 flex items-center gap-2"
              >
                {viewMode === 'grid' ? <FaEye /> : <FaEyeSlash />}
                <span className="hidden sm:inline">{viewMode === 'grid' ? 'Table View' : 'Grid View'}</span>
              </button>
              <button
                onClick={() => {
                  if (showForm) {
                    resetForm();
                  } else {
                    setShowForm(true);
                  }
                }}
                className="flex-1 sm:flex-none bg-black text-white px-4 py-2 rounded hover:bg-gray-900 font-semibold flex items-center justify-center gap-2"
              >
                {showForm ? <><FaTimes /> Batal</> : <><FaPlus /> Tambah Banner</>}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
              {success}
            </div>
          )}

          {/* Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-auto">
                <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                  <h2 className="text-xl font-bold">
                    {editingBanner ? 'Edit Banner' : 'Buat Banner Baru'}
                  </h2>
                  <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded">
                    <FaTimes />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                  {/* Bilingual Title */}
                  <div className="border rounded-lg p-3 bg-gray-50">
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-1">
                      <FaGlobe className="text-blue-500" /> Judul / Title
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1">🇮🇩 Indonesia *</label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          required
                          placeholder="Judul banner"
                          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">🇬🇧 English</label>
                        <input
                          type="text"
                          name="title_en"
                          value={formData.title_en}
                          onChange={handleChange}
                          placeholder="Banner title"
                          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bilingual Subtitle */}
                  <div className="border rounded-lg p-3 bg-gray-50">
                    <h3 className="text-sm font-semibold mb-2">Subtitle</h3>
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1">🇮🇩 Indonesia</label>
                        <input
                          type="text"
                          name="subtitle"
                          value={formData.subtitle}
                          onChange={handleChange}
                          placeholder="Subtitle banner"
                          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">🇬🇧 English</label>
                        <input
                          type="text"
                          name="subtitle_en"
                          value={formData.subtitle_en}
                          onChange={handleChange}
                          placeholder="Banner subtitle"
                          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">URL Gambar *</label>
                    <input
                      type="text"
                      name="image_url"
                      value={formData.image_url}
                      onChange={handleChange}
                      required
                      placeholder="/images/banners/banner.jpg"
                      className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Link URL</label>
                    <input
                      type="text"
                      name="link_url"
                      value={formData.link_url}
                      onChange={handleChange}
                      placeholder="/products"
                      className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  {/* Bilingual Button Text */}
                  <div className="border rounded-lg p-3 bg-gray-50">
                    <h3 className="text-sm font-semibold mb-2">Teks Tombol / Button Text</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1">🇮🇩 Indonesia</label>
                        <input
                          type="text"
                          name="button_text"
                          value={formData.button_text}
                          onChange={handleChange}
                          placeholder="Belanja Sekarang"
                          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">🇬🇧 English</label>
                        <input
                          type="text"
                          name="button_text_en"
                          value={formData.button_text_en}
                          onChange={handleChange}
                          placeholder="Shop Now"
                          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Posisi *</label>
                      <select
                        name="position"
                        value={formData.position}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                      >
                        <option value="hero">Hero (Carousel)</option>
                        <option value="sidebar">Sidebar</option>
                        <option value="footer">Footer</option>
                        <option value="popup">Popup</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Urutan</label>
                      <input
                        type="number"
                        name="sort_order"
                        value={formData.sort_order}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Tanggal Mulai</label>
                      <input
                        type="datetime-local"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Tanggal Berakhir</label>
                      <input
                        type="datetime-local"
                        name="end_date"
                        value={formData.end_date}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black text-sm"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleChange}
                      className="rounded text-black"
                    />
                    <span className="font-semibold">Aktif</span>
                  </label>

                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 px-4 py-2 border rounded hover:bg-gray-50"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-black text-white px-4 py-2 rounded hover:bg-gray-900 font-semibold"
                    >
                      {editingBanner ? 'Update Banner' : 'Buat Banner'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Content */}
          {viewMode === 'table' ? (
            <DataTable
              columns={columns}
              data={banners.sort((a, b) => a.sort_order - b.sort_order)}
              loading={loading}
              renderMobileCard={renderMobileCard}
              searchable={true}
              defaultPageSize={10}
            />
          ) : (
            /* Grid View */
            loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              </div>
            ) : banners.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {banners
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((banner) => (
                    <div key={banner.id} className="bg-white rounded-lg shadow overflow-hidden">
                      <img
                        src={banner.image_url}
                        alt={banner.title}
                        className="w-full h-40 lg:h-48 object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                        }}
                      />
                      <div className="p-4">
                        <div className="mb-3">
                          <h3 className="text-lg font-bold mb-1">{banner.title}</h3>
                          {banner.subtitle && (
                            <p className="text-sm text-gray-600 mb-2">{banner.subtitle}</p>
                          )}
                          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                            <span className="bg-gray-100 px-2 py-1 rounded">{getPositionLabel(banner.position)}</span>
                            <span className="bg-gray-100 px-2 py-1 rounded">Urutan: {banner.sort_order}</span>
                          </div>
                        </div>

                        {banner.link_url && (
                          <p className="text-xs text-blue-600 mb-3 truncate">
                            Link: {banner.link_url}
                          </p>
                        )}

                        <div className="flex items-center justify-between mb-4">
                          <span
                            className={`px-3 py-1 rounded text-xs font-semibold ${
                              banner.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {banner.is_active ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(banner)}
                            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 text-sm font-semibold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(banner.id)}
                            className="flex-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 text-sm font-semibold"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded">
                <FaImage className="text-4xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Belum ada banner. Buat banner pertama!</p>
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
};

export default AdminBanners;
