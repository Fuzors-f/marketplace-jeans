import React, { useState, useEffect } from 'react';
import { sizeAPI } from '../../services/api';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import DataTable from '../../components/admin/DataTable';
import Modal from '../../components/admin/Modal';
import { useAlert } from '../../utils/AlertContext';

export default function AdminSizes() {
  const { showSuccess, showError, showConfirm } = useAlert();
  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    sort_order: 0,
    is_active: true
  });

  useEffect(() => {
    fetchSizes();
  }, []);

  const fetchSizes = async () => {
    try {
      setLoading(true);
      const response = await sizeAPI.getAll({ include_inactive: true });
      setSizes(response.data.data);
      setError('');
    } catch (err) {
      setError('Gagal memuat sizes: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'sort_order' ? parseInt(value) : value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    // Validation
    if (!formData.name) {
      setFormError('Nama size wajib diisi');
      return;
    }
    
    try {
      if (editingId) {
        await sizeAPI.update(editingId, formData);
        showSuccess('Size berhasil diperbarui');
      } else {
        await sizeAPI.create(formData);
        showSuccess('Size berhasil dibuat');
      }
      resetForm();
      fetchSizes();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message);
    }
  };

  const handleEdit = (size) => {
    setFormData(size);
    setEditingId(size.id);
    setFormError('');
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    showConfirm('Apakah Anda yakin ingin menghapus size ini?', async () => {
      try {
        await sizeAPI.delete(id);
        showSuccess('Size berhasil dihapus');
        fetchSizes();
      } catch (err) {
        showError(err.response?.data?.message || err.message);
      }
    }, { title: 'Konfirmasi Hapus' });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sort_order: 0,
      is_active: true
    });
    setEditingId(null);
    setFormError('');
    setShowForm(false);
  };

  // DataTable columns configuration
  const columns = [
    {
      key: 'name',
      label: 'Size',
      sortable: true,
      render: (value) => <span className="font-semibold">{value}</span>
    },
    {
      key: 'sort_order',
      label: 'Sort Order',
      sortable: true,
      render: (value) => <span className="text-gray-600">{value}</span>
    },
    {
      key: 'is_active',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, size) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleEdit(size)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <FaEdit size={16} />
          </button>
          <button
            onClick={() => handleDelete(size.id)}
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
  const renderMobileCard = (size) => (
    <div className="bg-white rounded-lg shadow p-4 mb-3">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-lg">{size.name}</h3>
          <p className="text-sm text-gray-500">Sort Order: {size.sort_order}</p>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-semibold ${size.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {size.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>
      <div className="flex justify-end gap-1 mt-3 pt-3 border-t">
        <button
          onClick={() => handleEdit(size)}
          className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-sm flex items-center gap-1 transition-colors"
        >
          <FaEdit size={14} /> Edit
        </button>
        <button
          onClick={() => handleDelete(size.id)}
          className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-sm flex items-center gap-1 transition-colors"
        >
          <FaTrash size={14} /> Hapus
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold">Manage Sizes</h1>
        <button
          onClick={() => setShowForm(true)}
          className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
        >
          <FaPlus /> Add Size
        </button>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-4 mb-4 rounded">{error}</div>}

      {/* Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={resetForm}
        title={editingId ? 'Edit Ukuran' : 'Tambah Ukuran'}
        size="md"
      >
        <form onSubmit={handleSubmit}>
          {formError && (
            <div className="bg-red-100 text-red-700 p-3 mb-4 rounded text-sm">{formError}</div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nama Ukuran *</label>
              <input
                type="text"
                name="name"
                placeholder="Ukuran (contoh: 28, 30, 32)"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Urutan</label>
              <input
                type="number"
                name="sort_order"
                placeholder="Urutan"
                value={formData.sort_order}
                onChange={handleInputChange}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="rounded text-blue-600"
              />
              <span className="text-sm">Aktif</span>
            </label>
          </div>
          <div className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={resetForm}
              className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm font-medium transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
            >
              {editingId ? 'Update' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={sizes}
        loading={loading}
        renderMobileCard={renderMobileCard}
        searchable={true}
        defaultPageSize={10}
      />
    </div>
  );
}
