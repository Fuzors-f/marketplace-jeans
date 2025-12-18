import React, { useState, useEffect } from 'react';
import { 
  FaPlus, FaEdit, FaTrash, FaUserTie, FaSitemap, FaBuilding,
  FaSearch, FaTimes, FaChevronRight
} from 'react-icons/fa';
import apiClient from '../../services/api';

const Positions = () => {
  const [positions, setPositions] = useState([]);
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOffice, setFilterOffice] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    office_id: '',
    parent_id: '',
    level: 1,
    description: '',
    is_active: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [posRes, offRes] = await Promise.all([
        apiClient.get('/positions'),
        apiClient.get('/offices')
      ]);
      setPositions(posRes.data.data || []);
      setOffices(offRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        office_id: formData.office_id || null,
        parent_id: formData.parent_id || null
      };
      
      if (editingPosition) {
        await apiClient.put(`/positions/${editingPosition.id}`, payload);
      } else {
        await apiClient.post('/positions', payload);
      }
      fetchData();
      closeModal();
    } catch (error) {
      console.error('Error saving position:', error);
      alert(error.response?.data?.message || 'Gagal menyimpan data jabatan');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus jabatan ini?')) return;
    try {
      await apiClient.delete(`/positions/${id}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting position:', error);
      alert(error.response?.data?.message || 'Gagal menghapus jabatan');
    }
  };

  const openModal = (position = null) => {
    if (position) {
      setEditingPosition(position);
      setFormData({
        name: position.name || '',
        code: position.code || '',
        office_id: position.office_id || '',
        parent_id: position.parent_id || '',
        level: position.level || 1,
        description: position.description || '',
        is_active: position.is_active !== false
      });
    } else {
      setEditingPosition(null);
      setFormData({
        name: '',
        code: '',
        office_id: '',
        parent_id: '',
        level: 1,
        description: '',
        is_active: true
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPosition(null);
  };

  const getAvailableParents = () => {
    // Filter positions that can be parent (excluding self if editing)
    return positions.filter(p => {
      if (editingPosition && p.id === editingPosition.id) return false;
      if (formData.office_id && p.office_id !== parseInt(formData.office_id)) return false;
      return true;
    });
  };

  const filteredPositions = positions.filter(pos => {
    const matchSearch = pos.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pos.code && pos.code.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchOffice = !filterOffice || pos.office_id === parseInt(filterOffice);
    return matchSearch && matchOffice;
  });

  // Group positions by office
  const groupedPositions = filteredPositions.reduce((acc, pos) => {
    const officeKey = pos.office_id || 'none';
    if (!acc[officeKey]) {
      acc[officeKey] = {
        office: offices.find(o => o.id === pos.office_id) || { name: 'Tanpa Kantor' },
        positions: []
      };
    }
    acc[officeKey].positions.push(pos);
    return acc;
  }, {});

  const getLevelColor = (level) => {
    const colors = {
      1: 'bg-purple-100 text-purple-700',
      2: 'bg-blue-100 text-blue-700',
      3: 'bg-green-100 text-green-700',
      4: 'bg-yellow-100 text-yellow-700',
      5: 'bg-gray-100 text-gray-700'
    };
    return colors[level] || colors[5];
  };

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
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Jabatan</h1>
          <p className="text-gray-600 mt-1">Kelola struktur organisasi dan jabatan</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaPlus /> Tambah Jabatan
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari jabatan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterOffice}
          onChange={(e) => setFilterOffice(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Semua Kantor</option>
          {offices.map(office => (
            <option key={office.id} value={office.id}>{office.name}</option>
          ))}
        </select>
      </div>

      {/* Positions by Office */}
      <div className="space-y-6">
        {Object.entries(groupedPositions).map(([officeKey, group]) => (
          <div key={officeKey} className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b flex items-center gap-3">
              <FaBuilding className="text-blue-600" />
              <h3 className="font-semibold text-gray-800">{group.office.name}</h3>
              <span className="text-sm text-gray-500">({group.positions.length} jabatan)</span>
            </div>
            
            <div className="divide-y">
              {group.positions.map(pos => (
                <div key={pos.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                        <FaUserTie size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-800">{pos.name}</h4>
                          {pos.code && (
                            <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                              {pos.code}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getLevelColor(pos.level)}`}>
                            Level {pos.level}
                          </span>
                          {pos.parent_name && (
                            <span className="flex items-center gap-1">
                              <FaSitemap size={12} />
                              Atasan: {pos.parent_name}
                            </span>
                          )}
                        </div>
                        {pos.description && (
                          <p className="text-sm text-gray-500 mt-1">{pos.description}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        pos.is_active 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {pos.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => openModal(pos)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(pos.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {Object.keys(groupedPositions).length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <FaUserTie size={48} className="mx-auto mb-4 text-gray-300" />
          <p>Tidak ada data jabatan</p>
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">
                {editingPosition ? 'Edit Jabatan' : 'Tambah Jabatan Baru'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <FaTimes size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Jabatan *
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
                    Kode Jabatan
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="MGR, SPV, ..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kantor
                </label>
                <select
                  value={formData.office_id}
                  onChange={(e) => setFormData({ ...formData, office_id: e.target.value, parent_id: '' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Pilih Kantor --</option>
                  {offices.map(office => (
                    <option key={office.id} value={office.id}>{office.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jabatan Atasan
                  </label>
                  <select
                    value={formData.parent_id}
                    onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Tidak Ada --</option>
                    {getAvailableParents().map(pos => (
                      <option key={pos.id} value={pos.id}>{pos.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Level
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>Level 1 (Tertinggi)</option>
                    <option value={2}>Level 2</option>
                    <option value={3}>Level 3</option>
                    <option value={4}>Level 4</option>
                    <option value={5}>Level 5 (Staff)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Deskripsi tugas dan tanggung jawab..."
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Jabatan Aktif</span>
              </label>

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
                  {editingPosition ? 'Simpan Perubahan' : 'Tambah Jabatan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Positions;
