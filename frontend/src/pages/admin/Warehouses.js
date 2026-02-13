import React, { useState, useEffect } from 'react';
import { 
  FaWarehouse, FaPlus, FaEdit, FaTrash, 
  FaSearch, FaMapMarkerAlt, FaPhone, FaSpinner,
  FaEnvelope, FaStar
} from 'react-icons/fa';
import api from '../../services/api';
import Modal from '../../components/admin/Modal';

const Warehouses = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    description: '',
    is_main: false,
    is_active: true
  });
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const response = await api.get('/warehouses');
      if (response.data.success) {
        setWarehouses(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (warehouse = null) => {
    if (warehouse) {
      setEditingWarehouse(warehouse);
      setForm({
        name: warehouse.name || '',
        address: warehouse.address || '',
        phone: warehouse.phone || '',
        email: warehouse.email || '',
        description: warehouse.description || '',
        is_main: warehouse.is_main || false,
        is_active: warehouse.is_active !== undefined ? warehouse.is_active : true
      });
    } else {
      setEditingWarehouse(null);
      setForm({
        name: '',
        address: '',
        phone: '',
        email: '',
        description: '',
        is_main: false,
        is_active: true
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingWarehouse) {
        const response = await api.put(`/warehouses/${editingWarehouse.id}`, form);
        if (response.data.success) {
          alert('Gudang berhasil diupdate!');
        }
      } else {
        const response = await api.post('/warehouses', form);
        if (response.data.success) {
          alert('Gudang berhasil ditambahkan!');
        }
      }
      setShowModal(false);
      fetchWarehouses();
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menyimpan data gudang');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus gudang ini?')) {
      return;
    }
    try {
      const response = await api.delete(`/warehouses/${id}`);
      if (response.data.success) {
        alert('Gudang berhasil dihapus!');
        fetchWarehouses();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menghapus gudang');
    }
  };

  const handleToggleStatus = async (warehouse) => {
    try {
      await api.put(`/warehouses/${warehouse.id}`, {
        ...warehouse,
        is_active: !warehouse.is_active
      });
      fetchWarehouses();
    } catch (error) {
      alert('Gagal mengubah status');
    }
  };

  const filteredWarehouses = warehouses.filter(w =>
    w.name?.toLowerCase().includes(search.toLowerCase()) ||
    w.address?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Gudang</h1>
          <p className="text-gray-600">Kelola gudang dan lokasi penyimpanan</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <FaPlus /> Tambah Gudang
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari gudang..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Warehouse Cards */}
      {loading ? (
        <div className="p-10 text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
          <p className="text-gray-500">Memuat data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWarehouses.map((warehouse) => (
            <div 
              key={warehouse.id} 
              className={`bg-white rounded-lg shadow p-5 border-l-4 ${
                warehouse.is_active ? 'border-blue-500' : 'border-gray-300'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <FaWarehouse className="text-blue-600" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{warehouse.name}</h3>
                    {warehouse.is_main && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">
                        <FaStar /> Gudang Utama
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleToggleStatus(warehouse)}
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    warehouse.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {warehouse.is_active ? 'Aktif' : 'Nonaktif'}
                </button>
              </div>

              {warehouse.address && (
                <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
                  <FaMapMarkerAlt className="mt-1 flex-shrink-0" />
                  <span>{warehouse.address}</span>
                </div>
              )}

              {warehouse.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <FaPhone />
                  <span>{warehouse.phone}</span>
                </div>
              )}

              {warehouse.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <FaEnvelope />
                  <span>{warehouse.email}</span>
                </div>
              )}

              {warehouse.description && (
                <p className="text-sm text-gray-500 mt-2 mb-3">{warehouse.description}</p>
              )}

              <div className="flex items-center justify-end pt-3 border-t gap-1">
                <button
                  onClick={() => handleOpenModal(warehouse)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit"
                >
                  <FaEdit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(warehouse.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Hapus"
                >
                  <FaTrash size={16} />
                </button>
              </div>
            </div>
          ))}

          {filteredWarehouses.length === 0 && (
            <div className="col-span-full text-center py-10 text-gray-500">
              <FaWarehouse className="text-4xl mx-auto mb-4 opacity-50" />
              <p>Tidak ada gudang ditemukan</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingWarehouse ? 'Edit Gudang' : 'Tambah Gudang Baru'}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nama Gudang *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Gudang Utama"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Alamat *</label>
              <textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                rows="2"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Alamat lengkap gudang"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Telepon</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="021-xxx"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="gudang@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Deskripsi</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows="2"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Deskripsi gudang (opsional)"
              />
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_main}
                  onChange={(e) => setForm({ ...form, is_main: e.target.checked })}
                  className="rounded text-blue-600"
                />
                <span className="text-sm">Gudang Utama</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="rounded text-blue-600"
                />
                <span className="text-sm">Aktif</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm font-medium transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
            >
              {editingWarehouse ? 'Update' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Warehouses;