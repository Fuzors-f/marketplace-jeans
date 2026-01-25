import React, { useState, useEffect } from 'react';
import { 
  FaPlus, FaEdit, FaTrash, FaRuler, FaSearch, FaTimes,
  FaFilter, FaExpand
} from 'react-icons/fa';
import apiClient from '../../services/api';

const SizeChart = () => {
  const [sizeCharts, setSizeCharts] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [fittings, setFittings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingChart, setEditingChart] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterFitting, setFilterFitting] = useState('');
  const [formData, setFormData] = useState({
    size_id: '',
    category_id: '',
    fitting_id: '',
    waist_cm: '',
    hip_cm: '',
    inseam_cm: '',
    thigh_cm: '',
    knee_cm: '',
    leg_opening_cm: '',
    front_rise_cm: '',
    back_rise_cm: '',
    notes: '',
    is_active: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchSizeCharts();
  }, [filterCategory, filterFitting]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sizeRes, catRes, fitRes] = await Promise.all([
        apiClient.get('/sizes'),
        apiClient.get('/categories'),
        apiClient.get('/fittings')
      ]);
      setSizes(sizeRes.data.data || []);
      setCategories(catRes.data.data || []);
      setFittings(fitRes.data.data || []);
      await fetchSizeCharts();
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSizeCharts = async () => {
    try {
      let url = '/size-charts';
      const params = new URLSearchParams();
      if (filterCategory) params.append('category_id', filterCategory);
      if (filterFitting) params.append('fitting_id', filterFitting);
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await apiClient.get(url);
      setSizeCharts(response.data.data || []);
    } catch (error) {
      console.error('Error fetching size charts:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        category_id: formData.category_id || null,
        fitting_id: formData.fitting_id || null,
        waist_cm: formData.waist_cm || null,
        hip_cm: formData.hip_cm || null,
        inseam_cm: formData.inseam_cm || null,
        thigh_cm: formData.thigh_cm || null,
        knee_cm: formData.knee_cm || null,
        leg_opening_cm: formData.leg_opening_cm || null,
        front_rise_cm: formData.front_rise_cm || null,
        back_rise_cm: formData.back_rise_cm || null
      };
      
      if (editingChart) {
        await apiClient.put(`/size-charts/${editingChart.id}`, payload);
      } else {
        await apiClient.post('/size-charts', payload);
      }
      fetchSizeCharts();
      closeModal();
    } catch (error) {
      console.error('Error saving size chart:', error);
      alert(error.response?.data?.message || 'Gagal menyimpan data size chart');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus size chart ini?')) return;
    try {
      await apiClient.delete(`/size-charts/${id}`);
      fetchSizeCharts();
    } catch (error) {
      console.error('Error deleting size chart:', error);
      alert(error.response?.data?.message || 'Gagal menghapus size chart');
    }
  };

  const openModal = (chart = null) => {
    if (chart) {
      setEditingChart(chart);
      setFormData({
        size_id: chart.size_id || '',
        category_id: chart.category_id || '',
        fitting_id: chart.fitting_id || '',
        waist_cm: chart.waist_cm || '',
        hip_cm: chart.hip_cm || '',
        inseam_cm: chart.inseam_cm || '',
        thigh_cm: chart.thigh_cm || '',
        knee_cm: chart.knee_cm || '',
        leg_opening_cm: chart.leg_opening_cm || '',
        front_rise_cm: chart.front_rise_cm || '',
        back_rise_cm: chart.back_rise_cm || '',
        notes: chart.notes || '',
        is_active: chart.is_active !== false
      });
    } else {
      setEditingChart(null);
      setFormData({
        size_id: '',
        category_id: '',
        fitting_id: '',
        waist_cm: '',
        hip_cm: '',
        inseam_cm: '',
        thigh_cm: '',
        knee_cm: '',
        leg_opening_cm: '',
        front_rise_cm: '',
        back_rise_cm: '',
        notes: '',
        is_active: true
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingChart(null);
  };

  const measurementFields = [
    { key: 'waist_cm', label: 'Lingkar Pinggang', unit: 'cm' },
    { key: 'hip_cm', label: 'Lingkar Pinggul', unit: 'cm' },
    { key: 'inseam_cm', label: 'Panjang Dalam (Inseam)', unit: 'cm' },
    { key: 'thigh_cm', label: 'Lingkar Paha', unit: 'cm' },
    { key: 'knee_cm', label: 'Lingkar Lutut', unit: 'cm' },
    { key: 'leg_opening_cm', label: 'Bukaan Kaki', unit: 'cm' },
    { key: 'front_rise_cm', label: 'Rise Depan', unit: 'cm' },
    { key: 'back_rise_cm', label: 'Rise Belakang', unit: 'cm' }
  ];

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
          <h1 className="text-2xl font-bold text-gray-800">Size Chart</h1>
          <p className="text-gray-600 mt-1">Kelola panduan ukuran untuk setiap kategori dan fitting</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaPlus /> Tambah Size Chart
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="flex items-center gap-2 text-gray-600 mb-3">
          <FaFilter /> <span className="font-medium">Filter</span>
        </div>
        <div className="flex flex-wrap gap-4">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Kategori</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <select
            value={filterFitting}
            onChange={(e) => setFilterFitting(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Fitting</option>
            {fittings.map(fit => (
              <option key={fit.id} value={fit.id}>{fit.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Size Chart Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-3 text-sm font-semibold text-gray-600">Size</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600">Kategori</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600">Fitting</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600 text-center">Pinggang</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600 text-center">Pinggul</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600 text-center">Inseam</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600 text-center">Paha</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600 text-center">Status</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sizeCharts.map(chart => (
                <tr key={chart.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 text-blue-700 font-semibold">
                      {chart.size_name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {chart.category_name || <span className="text-gray-400 italic">Semua</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {chart.fitting_name || <span className="text-gray-400 italic">Semua</span>}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {chart.waist_cm ? `${chart.waist_cm} cm` : '-'}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {chart.hip_cm ? `${chart.hip_cm} cm` : '-'}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {chart.inseam_cm ? `${chart.inseam_cm} cm` : '-'}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {chart.thigh_cm ? `${chart.thigh_cm} cm` : '-'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      chart.is_active 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {chart.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-1">
                      <button
                        onClick={() => openModal(chart)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(chart.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {sizeCharts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <FaRuler size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Tidak ada data size chart</p>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">
                {editingChart ? 'Edit Size Chart' : 'Tambah Size Chart Baru'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <FaTimes size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Size *
                  </label>
                  <select
                    value={formData.size_id}
                    onChange={(e) => setFormData({ ...formData, size_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Pilih Size</option>
                    {sizes.map(size => (
                      <option key={size.id} value={size.id}>{size.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Semua Kategori</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fitting
                  </label>
                  <select
                    value={formData.fitting_id}
                    onChange={(e) => setFormData({ ...formData, fitting_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Semua Fitting</option>
                    {fittings.map(fit => (
                      <option key={fit.id} value={fit.id}>{fit.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Measurements */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FaRuler className="text-blue-600" /> Ukuran (dalam cm)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {measurementFields.map(field => (
                    <div key={field.key}>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        {field.label}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          value={formData[field.key]}
                          onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="0.0"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                          {field.unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catatan
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Catatan tambahan..."
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Size Chart Aktif</span>
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
                  {editingChart ? 'Simpan Perubahan' : 'Tambah Size Chart'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SizeChart;
