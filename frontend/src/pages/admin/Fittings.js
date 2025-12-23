import React, { useState, useEffect } from 'react';
import { fittingAPI } from '../../services/api';
import { FaPlus, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import DataTable from '../../components/admin/DataTable';

export default function AdminFittings() {
  const [fittings, setFittings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    is_active: true
  });

  useEffect(() => {
    fetchFittings();
  }, []);

  const fetchFittings = async () => {
    try {
      setLoading(true);
      const response = await fittingAPI.getAll();
      setFittings(response.data.data);
      setError('');
    } catch (err) {
      setError('Gagal memuat fittings: ' + err.message);
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
        await fittingAPI.update(editingId, formData);
        alert('Fitting berhasil diperbarui');
      } else {
        await fittingAPI.create(formData);
        alert('Fitting berhasil dibuat');
      }
      resetForm();
      fetchFittings();
    } catch (err) {
      setError('Error: ' + err.response?.data?.message || err.message);
    }
  };

  const handleEdit = (fitting) => {
    setFormData(fitting);
    setEditingId(fitting.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus fitting ini?')) {
      try {
        await fittingAPI.delete(id);
        alert('Fitting berhasil dihapus');
        fetchFittings();
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
      is_active: true
    });
    setEditingId(null);
    setShowForm(false);
  };

  // DataTable columns configuration
  const columns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (value) => <span className="font-semibold">{value}</span>
    },
    {
      key: 'slug',
      label: 'Slug',
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
      render: (_, fitting) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(fitting)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
            title="Edit"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => handleDelete(fitting.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded"
            title="Hapus"
          >
            <FaTrash />
          </button>
        </div>
      )
    }
  ];

  // Mobile card renderer
  const renderMobileCard = (fitting) => (
    <div className="bg-white rounded-lg shadow p-4 mb-3">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-lg">{fitting.name}</h3>
          <p className="text-sm text-gray-500">{fitting.slug}</p>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-semibold ${fitting.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {fitting.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>
      {fitting.description && (
        <p className="text-sm text-gray-600 mb-3">{fitting.description}</p>
      )}
      <div className="flex justify-end gap-2 mt-3 pt-3 border-t">
        <button
          onClick={() => handleEdit(fitting)}
          className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm flex items-center gap-1"
        >
          <FaEdit /> Edit
        </button>
        <button
          onClick={() => handleDelete(fitting.id)}
          className="px-3 py-1 text-red-600 hover:bg-red-50 rounded text-sm flex items-center gap-1"
        >
          <FaTrash /> Hapus
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold">Manage Fittings</h1>
        <button
          onClick={() => setShowForm(true)}
          className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
        >
          <FaPlus /> Add Fitting
        </button>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-4 mb-4 rounded">{error}</div>}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingId ? 'Edit Fitting' : 'Create Fitting'}
              </h2>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Fitting Name *</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Fitting Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Slug *</label>
                  <input
                    type="text"
                    name="slug"
                    placeholder="Slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    name="description"
                    placeholder="Description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
                    rows="3"
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
                  <span className="text-sm">Active</span>
                </label>
              </div>
              <div className="mt-6 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={fittings}
        loading={loading}
        renderMobileCard={renderMobileCard}
        searchable={true}
        defaultPageSize={10}
      />
    </div>
  );
}
