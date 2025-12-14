import React, { useState, useEffect } from 'react';
import { sizeAPI } from '../../services/api';

export default function AdminSizes() {
  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
      const response = await sizeAPI.getAll();
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
    try {
      if (editingId) {
        await sizeAPI.update(editingId, formData);
        alert('Size berhasil diperbarui');
      } else {
        await sizeAPI.create(formData);
        alert('Size berhasil dibuat');
      }
      resetForm();
      fetchSizes();
    } catch (err) {
      setError('Error: ' + err.response?.data?.message || err.message);
    }
  };

  const handleEdit = (size) => {
    setFormData(size);
    setEditingId(size.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus size ini?')) {
      try {
        await sizeAPI.delete(id);
        alert('Size berhasil dihapus');
        fetchSizes();
      } catch (err) {
        setError('Error: ' + err.response?.data?.message || err.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sort_order: 0,
      is_active: true
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading && sizes.length === 0) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Sizes</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Size
        </button>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-4 mb-4 rounded">{error}</div>}

      {showForm && (
        <div className="bg-white p-6 rounded shadow mb-6">
          <h2 className="text-xl font-bold mb-4">
            {editingId ? 'Edit Size' : 'Create Size'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                placeholder="Size (e.g., 28, 30, 32)"
                value={formData.name}
                onChange={handleInputChange}
                className="border p-2 rounded"
                required
              />
              <input
                type="number"
                name="sort_order"
                placeholder="Sort Order"
                value={formData.sort_order}
                onChange={handleInputChange}
                className="border p-2 rounded"
              />
              <label className="flex items-center col-span-2">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                Active
              </label>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                {editingId ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">Size</th>
              <th className="p-4 text-left">Sort Order</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sizes.map(size => (
              <tr key={size.id} className="border-t hover:bg-gray-50">
                <td className="p-4 font-semibold">{size.name}</td>
                <td className="p-4 text-gray-600">{size.sort_order}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-white ${size.is_active ? 'bg-green-600' : 'bg-red-600'}`}>
                    {size.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-4 flex gap-2">
                  <button
                    onClick={() => handleEdit(size)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(size.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
