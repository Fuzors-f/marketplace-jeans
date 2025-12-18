import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import apiClient from '../../services/api';

const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    link_url: '',
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
        const response = await apiClient.post('/banners', payload);
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
      title: banner.title,
      subtitle: banner.subtitle || '',
      image_url: banner.image_url,
      link_url: banner.link_url || '',
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
      subtitle: '',
      image_url: '',
      link_url: '',
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

  return (
    <>
      <Helmet>
        <title>Kelola Banner - Admin</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Manajemen Banner</h1>
              <p className="text-gray-600">Kelola banner homepage</p>
            </div>
            <button
              onClick={() => {
                if (showForm) {
                  resetForm();
                } else {
                  setShowForm(true);
                }
              }}
              className="bg-black text-white px-6 py-2 rounded hover:bg-gray-900 font-semibold"
            >
              {showForm ? 'Batal' : 'Tambah Banner'}
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-100 text-green-700 rounded">
              {success}
            </div>
          )}

          {/* Form */}
          {showForm && (
            <div className="mb-8 bg-white p-6 rounded shadow">
              <h2 className="text-xl font-bold mb-6">
                {editingBanner ? 'Edit Banner' : 'Buat Banner Baru'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Judul *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      placeholder="Judul banner"
                      className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Subtitle</label>
                    <input
                      type="text"
                      name="subtitle"
                      value={formData.subtitle}
                      onChange={handleChange}
                      placeholder="Subtitle banner"
                      className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                    />
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

                  <div>
                    <label className="block text-sm font-semibold mb-2">Tanggal Mulai</label>
                    <input
                      type="datetime-local"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Tanggal Berakhir</label>
                    <input
                      type="datetime-local"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div className="flex items-end">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <span className="font-semibold">Aktif</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="bg-black text-white px-6 py-2 rounded hover:bg-gray-900 font-semibold"
                  >
                    {editingBanner ? 'Update Banner' : 'Buat Banner'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-300 text-black px-6 py-2 rounded hover:bg-gray-400 font-semibold"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Banners List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : banners.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {banners
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((banner) => (
                  <div key={banner.id} className="bg-white rounded shadow overflow-hidden">
                    <img
                      src={banner.image_url}
                      alt={banner.title}
                      className="w-full h-48 object-cover"
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
                        <div className="flex gap-2 text-xs text-gray-500">
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
              <p className="text-gray-600">Belum ada banner. Buat banner pertama!</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminBanners;
