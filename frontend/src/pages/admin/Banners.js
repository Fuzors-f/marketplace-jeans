import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { apiClient } from '../../services/api';

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
    link: '',
    position: 1,
    is_active: true
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/banners');
      setBanners(response.data.data || []);
      setError('');
    } catch (err) {
      setError('Failed to load banners: ' + err.message);
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
      if (editingBanner) {
        // Update banner
        await apiClient.put(`/banners/${editingBanner.id}`, formData);
        setSuccess('Banner updated successfully!');
        setBanners(banners.map(banner =>
          banner.id === editingBanner.id ? { ...banner, ...formData } : banner
        ));
        setEditingBanner(null);
      } else {
        // Create banner
        const response = await apiClient.post('/banners', formData);
        setSuccess('Banner created successfully!');
        setBanners([...banners, response.data.data]);
      }

      // Reset form
      setFormData({
        title: '',
        subtitle: '',
        image_url: '',
        link: '',
        position: 1,
        is_active: true
      });
      setShowForm(false);

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save banner');
      console.error(err);
    }
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle,
      image_url: banner.image_url,
      link: banner.link || '',
      position: banner.position,
      is_active: banner.is_active
    });
    setShowForm(true);
  };

  const handleDelete = async (bannerId) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        await apiClient.delete(`/banners/${bannerId}`);
        setSuccess('Banner deleted successfully!');
        setBanners(banners.filter(banner => banner.id !== bannerId));
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Failed to delete banner: ' + err.message);
        console.error(err);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBanner(null);
    setFormData({
      title: '',
      subtitle: '',
      image_url: '',
      link: '',
      position: 1,
      is_active: true
    });
  };

  return (
    <>
      <Helmet>
        <title>Admin Banners - Marketplace Jeans</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Banner Management</h1>
              <p className="text-gray-600">Manage homepage banners</p>
            </div>
            <button
              onClick={() => {
                setShowForm(!showForm);
                if (editingBanner) setEditingBanner(null);
              }}
              className="bg-black text-white px-6 py-2 rounded hover:bg-gray-900 font-semibold"
            >
              {showForm ? 'Cancel' : 'Add Banner'}
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
                {editingBanner ? 'Edit Banner' : 'Create New Banner'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      placeholder="Banner title"
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
                      placeholder="Banner subtitle"
                      className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Image URL *</label>
                    <input
                      type="url"
                      name="image_url"
                      value={formData.image_url}
                      onChange={handleChange}
                      required
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Link</label>
                    <input
                      type="url"
                      name="link"
                      value={formData.link}
                      onChange={handleChange}
                      placeholder="https://example.com"
                      className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Position *</label>
                    <input
                      type="number"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      required
                      min="1"
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
                      <span className="font-semibold">Active</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="bg-black text-white px-6 py-2 rounded hover:bg-gray-900 font-semibold"
                  >
                    {editingBanner ? 'Update Banner' : 'Create Banner'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-gray-300 text-black px-6 py-2 rounded hover:bg-gray-400 font-semibold"
                  >
                    Cancel
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
                .sort((a, b) => a.position - b.position)
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
                        <p className="text-sm text-gray-600 mb-2">{banner.subtitle}</p>
                        <p className="text-xs text-gray-500">
                          Position: <span className="font-semibold">{banner.position}</span>
                        </p>
                      </div>

                      {banner.link && (
                        <p className="text-xs text-blue-600 mb-3 truncate">
                          Link: {banner.link}
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
                          {banner.is_active ? 'Active' : 'Inactive'}
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
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded">
              <p className="text-gray-600">No banners found. Create your first banner!</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminBanners;
