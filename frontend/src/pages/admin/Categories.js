import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaSave } from 'react-icons/fa';
import { categoryAPI } from '../../services/api';
import DataTable from '../../components/admin/DataTable';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    parent_id: null,
    is_active: true
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryAPI.getAll();
      setCategories(response.data.data);
      setError('');
    } catch (err) {
      setError('Gagal memuat kategori: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await categoryAPI.update(editingId, formData);
        alert('Kategori berhasil diperbarui');
      } else {
        await categoryAPI.create(formData);
        alert('Kategori berhasil dibuat');
      }
      resetForm();
      fetchCategories();
    } catch (err) {
      setError('Error: ' + err.response?.data?.message || err.message);
    }
  };

  const handleEdit = (category) => {
    setFormData(category);
    setEditingId(category.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
      try {
        await categoryAPI.delete(id);
        alert('Kategori berhasil dihapus');
        fetchCategories();
      } catch (err) {
        setError('Error: ' + err.response?.data?.message || err.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      image_url: '',
      parent_id: null,
      is_active: true
    });
    setEditingId(null);
    setShowForm(false);
  };

  // Table columns configuration
  const columns = [
    {
      key: 'name',
      label: 'Nama',
      render: (value) => <span className="font-medium">{value}</span>
    },
    {
      key: 'slug',
      label: 'Slug',
      render: (value) => <span className="text-gray-600 text-sm">{value}</span>
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Aktif' : 'Nonaktif'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Aksi',
      sortable: false,
      render: (_, item) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleEdit(item)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <FaEdit size={16} />
          </button>
          <button
            onClick={() => handleDelete(item.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Hapus"
          >
            <FaTrash size={16} />
          </button>
        </div>
      )
    }
  ];

  // Mobile card renderer
  const renderMobileCard = (category) => (
    <div className="flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <h3 className="font-medium truncate">{category.name}</h3>
        <p className="text-sm text-gray-500 truncate">{category.slug}</p>
        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${
          category.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {category.is_active ? 'Aktif' : 'Nonaktif'}
        </span>
      </div>
      <div className="flex items-center gap-1 ml-3">
        <button
          onClick={() => handleEdit(category)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <FaEdit size={16} />
        </button>
        <button
          onClick={() => handleDelete(category.id)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <FaTrash size={16} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Kelola Kategori</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          <FaPlus /> Tambah Kategori
        </button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 mb-4 rounded-lg text-sm">{error}</div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-xl sm:rounded-lg shadow-xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b sticky top-0 bg-white">
              <h2 className="text-base sm:text-lg font-bold">
                {editingId ? 'Edit Kategori' : 'Tambah Kategori'}
              </h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 p-1">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kategori *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="url-friendly-name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Gambar</label>
                <input
                  type="text"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  rows="3"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="rounded text-blue-600"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">Aktif</label>
              </div>
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full sm:w-auto px-4 py-2.5 border rounded-lg hover:bg-gray-50 text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm"
                >
                  <FaSave /> {editingId ? 'Update' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={categories}
        loading={loading}
        renderMobileCard={renderMobileCard}
        searchPlaceholder="Cari kategori..."
        emptyMessage="Tidak ada kategori"
      />
    </div>
  );
}
