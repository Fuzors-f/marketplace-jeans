import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import apiClient from '../../services/api';
import { 
  FaExchangeAlt, FaPlus, FaEdit, FaSave, FaTimes, FaHistory, 
  FaSpinner, FaDollarSign, FaSearch, FaTrash
} from 'react-icons/fa';
import { useLanguage } from '../../utils/i18n';

const ExchangeRates = () => {
  const { t, formatDate } = useLanguage();
  const [rates, setRates] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [editReason, setEditReason] = useState('');
  const [saving, setSaving] = useState(false);
  
  // Create new rate state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRate, setNewRate] = useState({
    currency_from: 'IDR',
    currency_to: 'USD',
    rate: '',
    reason: ''
  });
  
  // Show logs state
  const [showLogs, setShowLogs] = useState(false);
  const [selectedRateId, setSelectedRateId] = useState(null);

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/exchange-rates');
      if (response.data.success) {
        setRates(response.data.data);
      }
    } catch (err) {
      setError('Gagal memuat data kurs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async (rateId = null) => {
    try {
      setLoadingLogs(true);
      const params = rateId ? `?exchange_rate_id=${rateId}&limit=100` : '?limit=100';
      const response = await apiClient.get(`/exchange-rates/logs${params}`);
      if (response.data.success) {
        setLogs(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleEdit = (rate) => {
    setEditingId(rate.id);
    setEditValue(rate.rate.toString());
    setEditReason('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
    setEditReason('');
  };

  const handleSave = async (id) => {
    if (!editValue || parseFloat(editValue) <= 0) {
      setError('Nilai kurs harus lebih dari 0');
      return;
    }

    try {
      setSaving(true);
      const response = await apiClient.put(`/exchange-rates/${id}`, {
        rate: parseFloat(editValue),
        reason: editReason
      });

      if (response.data.success) {
        setSuccess('Kurs berhasil diperbarui!');
        setEditingId(null);
        setEditValue('');
        setEditReason('');
        fetchRates();
        if (showLogs) fetchLogs(selectedRateId);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan kurs');
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newRate.rate || parseFloat(newRate.rate) <= 0) {
      setError('Nilai kurs harus lebih dari 0');
      return;
    }

    try {
      setSaving(true);
      const response = await apiClient.post('/exchange-rates', {
        currency_from: newRate.currency_from,
        currency_to: newRate.currency_to,
        rate: parseFloat(newRate.rate),
        reason: newRate.reason
      });

      if (response.data.success) {
        setSuccess('Kurs berhasil ditambahkan!');
        setShowCreateForm(false);
        setNewRate({ currency_from: 'IDR', currency_to: 'USD', rate: '', reason: '' });
        fetchRates();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menambahkan kurs');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menonaktifkan kurs ini?')) return;

    try {
      await apiClient.delete(`/exchange-rates/${id}`);
      setSuccess('Kurs berhasil dinonaktifkan');
      fetchRates();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menonaktifkan kurs');
    }
  };

  const handleViewLogs = (rateId = null) => {
    setSelectedRateId(rateId);
    setShowLogs(true);
    fetchLogs(rateId);
  };

  const formatCurrencyValue = (value, currency) => {
    if (currency === 'IDR') {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(value);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(value);
  };

  return (
    <>
      <Helmet>
        <title>Kurs Mata Uang - Admin</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <FaExchangeAlt className="text-blue-600" />
                  Kurs Mata Uang
                </h1>
                <p className="text-gray-600 mt-1">
                  Kelola nilai tukar mata uang untuk konversi harga
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleViewLogs()}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  <FaHistory />
                  Riwayat Perubahan
                </button>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                >
                  <FaPlus />
                  Tambah Kurs
                </button>
              </div>
            </div>

            {/* Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
                <button onClick={() => setError('')} className="float-right">&times;</button>
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}

            {/* Rates List */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {loading ? (
                <div className="p-8 text-center">
                  <FaSpinner className="animate-spin text-3xl mx-auto text-gray-400" />
                  <p className="text-gray-500 mt-2">Memuat data...</p>
                </div>
              ) : rates.length === 0 ? (
                <div className="p-8 text-center">
                  <FaDollarSign className="text-5xl mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Belum ada kurs yang dikonfigurasi</p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                  >
                    Tambah Kurs Pertama
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Dari</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Ke</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Nilai Kurs</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Contoh Konversi</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Terakhir Update</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {rates.map((rate) => (
                        <tr key={rate.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                              {rate.currency_from}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full font-medium">
                              {rate.currency_to}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {editingId === rate.id ? (
                              <div className="space-y-2">
                                <input
                                  type="number"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="w-40 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  min="0"
                                  step="0.01"
                                  autoFocus
                                />
                                <input
                                  type="text"
                                  value={editReason}
                                  onChange={(e) => setEditReason(e.target.value)}
                                  placeholder="Alasan perubahan (opsional)"
                                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                              </div>
                            ) : (
                              <span className="text-xl font-bold text-gray-900">
                                {new Intl.NumberFormat('id-ID').format(rate.rate)}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <div className="space-y-1">
                              <p>1 {rate.currency_to} = {formatCurrencyValue(rate.rate, rate.currency_from)}</p>
                              <p className="text-gray-400">
                                {formatCurrencyValue(1000000, rate.currency_from)} = {formatCurrencyValue(1000000 / rate.rate, rate.currency_to)}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <div>
                              {formatDate(rate.updated_at)}
                            </div>
                            {rate.updated_by_name && (
                              <div className="text-xs text-gray-400">
                                oleh {rate.updated_by_name}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              {editingId === rate.id ? (
                                <>
                                  <button
                                    onClick={() => handleSave(rate.id)}
                                    disabled={saving}
                                    className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                    title="Simpan"
                                  >
                                    {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                                    title="Batal"
                                  >
                                    <FaTimes />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleEdit(rate)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Edit Kurs"
                                  >
                                    <FaEdit size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleViewLogs(rate.id)}
                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                    title="Lihat Riwayat"
                                  >
                                    <FaHistory size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(rate.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Nonaktifkan"
                                  >
                                    <FaTrash size={16} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Info Card */}
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="font-semibold text-blue-800 mb-2">Informasi Penggunaan</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Kurs digunakan untuk mengkonversi harga saat pengguna memilih bahasa Inggris</li>
                <li>• Harga asli dalam Rupiah (IDR) akan dikonversi ke Dollar (USD) secara otomatis</li>
                <li>• Update kurs secara berkala sesuai dengan nilai tukar terkini</li>
                <li>• Semua perubahan kurs dicatat dalam log untuk audit</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Tambah Kurs Baru</h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Dari Mata Uang</label>
                  <select
                    value={newRate.currency_from}
                    onChange={(e) => setNewRate({ ...newRate, currency_from: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="IDR">IDR (Rupiah)</option>
                    <option value="USD">USD (Dollar)</option>
                    <option value="EUR">EUR (Euro)</option>
                    <option value="SGD">SGD (Singapore)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ke Mata Uang</label>
                  <select
                    value={newRate.currency_to}
                    onChange={(e) => setNewRate({ ...newRate, currency_to: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="USD">USD (Dollar)</option>
                    <option value="IDR">IDR (Rupiah)</option>
                    <option value="EUR">EUR (Euro)</option>
                    <option value="SGD">SGD (Singapore)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nilai Kurs *</label>
                <input
                  type="number"
                  value={newRate.rate}
                  onChange={(e) => setNewRate({ ...newRate, rate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: 16000 (1 USD = 16000 IDR)"
                  min="0"
                  step="0.01"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Masukkan nilai konversi dari mata uang asal ke mata uang tujuan
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Keterangan (Opsional)</label>
                <input
                  type="text"
                  value={newRate.reason}
                  onChange={(e) => setNewRate({ ...newRate, reason: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Kurs awal sistem"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                >
                  {saving ? <FaSpinner className="animate-spin" /> : <FaPlus />}
                  Tambah Kurs
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logs Modal */}
      {showLogs && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FaHistory className="text-blue-600" />
                Riwayat Perubahan Kurs
              </h2>
              <button
                onClick={() => setShowLogs(false)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-6 overflow-auto max-h-[calc(80vh-80px)]">
              {loadingLogs ? (
                <div className="text-center py-8">
                  <FaSpinner className="animate-spin text-3xl mx-auto text-gray-400" />
                  <p className="text-gray-500 mt-2">Memuat riwayat...</p>
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FaHistory className="text-4xl mx-auto mb-3 text-gray-300" />
                  <p>Belum ada riwayat perubahan</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {logs.map((log) => (
                    <div key={log.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <FaExchangeAlt className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold">{log.currency_from}/{log.currency_to}</span>
                          <span className="text-gray-400">•</span>
                          {log.old_rate ? (
                            <span className="text-sm">
                              <span className="text-red-500 line-through">{new Intl.NumberFormat('id-ID').format(log.old_rate)}</span>
                              <span className="mx-2">→</span>
                              <span className="text-green-600 font-medium">{new Intl.NumberFormat('id-ID').format(log.new_rate)}</span>
                            </span>
                          ) : (
                            <span className="text-sm text-green-600 font-medium">
                              Kurs awal: {new Intl.NumberFormat('id-ID').format(log.new_rate)}
                            </span>
                          )}
                        </div>
                        {log.change_reason && (
                          <p className="text-sm text-gray-600 mt-1">"{log.change_reason}"</p>
                        )}
                        <div className="text-xs text-gray-400 mt-2">
                          {formatDate(log.created_at)} oleh {log.changed_by_name || 'System'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExchangeRates;
