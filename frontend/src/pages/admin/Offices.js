import React, { useState, useEffect } from 'react';
import { 
  FaPlus, FaEdit, FaTrash, FaBuilding, FaPhone, FaEnvelope, 
  FaMapMarkerAlt, FaStar, FaSearch, FaTimes 
} from 'react-icons/fa';
import apiClient from '../../services/api';

const Offices = () => {
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOffice, setEditingOffice] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    city: '',
    province: '',
    phone: '',
    email: '',
    is_headquarters: false,
    is_active: true
  });

  useEffect(() => {
    fetchOffices();
  }, []);

  const fetchOffices = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/offices');
      setOffices(response.data.data || []);
    } catch (error) {
      console.error('Error fetching offices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingOffice) {
        await apiClient.put(`/offices/${editingOffice.id}`, formData);
      } else {
        await apiClient.post('/offices', formData);
      }
      fetchOffices();
      closeModal();
    } catch (error) {
      console.error('Error saving office:', error);
      alert(error.response?.data?.message || 'Gagal menyimpan data kantor');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus kantor ini?')) return;
    try {
      await apiClient.delete(`/offices/${id}`);
      fetchOffices();
    } catch (error) {
      console.error('Error deleting office:', error);
      alert(error.response?.data?.message || 'Gagal menghapus kantor');
    }
  };

  const openModal = (office = null) => {
    if (office) {
      setEditingOffice(office);
      setFormData({
        name: office.name || '',
        code: office.code || '',
        address: office.address || '',
        city: office.city || '',
        province: office.province || '',
        phone: office.phone || '',
        email: office.email || '',
        is_headquarters: office.is_headquarters || false,
        is_active: office.is_active !== false
      });
    } else {
      setEditingOffice(null);
      setFormData({
        name: '',
        code: '',
        address: '',
        city: '',
        province: '',
        phone: '',
        email: '',
        is_headquarters: false,
        is_active: true
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingOffice(null);
  };

  const filteredOffices = offices.filter(office =>
    office.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (office.code && office.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (office.city && office.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Kantor</h1>
          <p className="text-gray-600 mt-1">Kelola data kantor/cabang perusahaan</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaPlus /> Tambah Kantor
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari kantor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Office Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOffices.map(office => (
          <div 
            key={office.id} 
            className={`bg-white rounded-xl shadow-sm border-2 ${
              office.is_headquarters ? 'border-yellow-400' : 'border-gray-100'
            } overflow-hidden`}
          >
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${
                    office.is_headquarters ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    <FaBuilding size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{office.name}</h3>
                    {office.code && (
                      <span className="text-xs text-gray-500 font-mono">{office.code}</span>
                    )}
                  </div>
                </div>
                {office.is_headquarters && (
                  <span className="flex items-center gap-1 text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                    <FaStar size={10} /> Pusat
                  </span>
                )}
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                {(office.address || office.city) && (
                  <div className="flex items-start gap-2">
                    <FaMapMarkerAlt className="text-gray-400 mt-1 flex-shrink-0" />
                    <span>
                      {office.address && <span>{office.address}, </span>}
                      {office.city}
                      {office.province && `, ${office.province}`}
                    </span>
                  </div>
                )}
                {office.phone && (
                  <div className="flex items-center gap-2">
                    <FaPhone className="text-gray-400" />
                    <span>{office.phone}</span>
                  </div>
                )}
                {office.email && (
                  <div className="flex items-center gap-2">
                    <FaEnvelope className="text-gray-400" />
                    <span>{office.email}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  office.is_active 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {office.is_active ? 'Aktif' : 'Nonaktif'}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => openModal(office)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <FaEdit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(office.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FaTrash size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredOffices.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <FaBuilding size={48} className="mx-auto mb-4 text-gray-300" />
          <p>Tidak ada data kantor</p>
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">
                {editingOffice ? 'Edit Kantor' : 'Tambah Kantor Baru'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <FaTimes size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Kantor *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kode Kantor
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="HQ, BR01, ..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alamat
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kota</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Provinsi</label>
                  <input
                    type="text"
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_headquarters}
                    onChange={(e) => setFormData({ ...formData, is_headquarters: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Kantor Pusat</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Aktif</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingOffice ? 'Simpan Perubahan' : 'Tambah Kantor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Offices;
