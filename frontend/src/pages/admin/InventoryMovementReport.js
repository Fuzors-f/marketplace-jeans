import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import apiClient from '../../services/api';
import { 
  FaExchangeAlt, FaDownload, FaFilter, FaSpinner,
  FaArrowUp, FaArrowDown, FaBox, FaSync
} from 'react-icons/fa';
import { useLanguage } from '../../utils/i18n';

const InventoryMovementReport = () => {
  const { formatCurrency, formatDate } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [movements, setMovements] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  
  const [filters, setFilters] = useState({
    start_date: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    warehouse_id: '',
    movement_type: '',
    product_id: ''
  });
  
  const [warehouses, setWarehouses] = useState([]);

  useEffect(() => {
    fetchWarehouses();
    fetchSummary();
  }, []);

  useEffect(() => {
    fetchMovements();
  }, [filters, pagination.page]);

  const fetchWarehouses = async () => {
    try {
      const response = await apiClient.get('/warehouses');
      if (response.data.success) {
        setWarehouses(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching warehouses:', err);
    }
  };

  const fetchSummary = async () => {
    try {
      const params = new URLSearchParams(
        Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      );
      const response = await apiClient.get(`/reports/inventory-movement/summary?${params}`);
      if (response.data.success) {
        setSummary(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  };

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(
        Object.fromEntries(Object.entries({
          ...filters,
          page: pagination.page,
          limit: 20
        }).filter(([_, v]) => v))
      );

      const response = await apiClient.get(`/reports/inventory-movement?${params}`);
      
      if (response.data.success) {
        setMovements(response.data.data);
        if (response.data.pagination) {
          setPagination(prev => ({
            ...prev,
            total: response.data.pagination.total,
            totalPages: response.data.pagination.totalPages
          }));
        }
      }
    } catch (err) {
      setError('Gagal memuat data pergerakan stok');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams(
        Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      );
      
      const response = await apiClient.get(`/reports/inventory-movement/export?${params}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `inventory-movement-${filters.start_date}-${filters.end_date}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Gagal mengexport data');
    }
  };

  const handleApplyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchMovements();
    fetchSummary();
  };

  const getMovementIcon = (type) => {
    switch (type) {
      case 'in':
      case 'purchase':
      case 'return':
        return <FaArrowDown className="text-green-600" />;
      case 'out':
      case 'sale':
        return <FaArrowUp className="text-red-600" />;
      case 'transfer':
        return <FaExchangeAlt className="text-blue-600" />;
      case 'adjustment':
      case 'opname':
        return <FaSync className="text-orange-600" />;
      default:
        return <FaBox className="text-gray-600" />;
    }
  };

  const getMovementBadge = (type) => {
    const badges = {
      in: { bg: 'bg-green-100', text: 'text-green-800', label: 'Masuk' },
      out: { bg: 'bg-red-100', text: 'text-red-800', label: 'Keluar' },
      transfer: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Transfer' },
      adjustment: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Adjustment' },
      sale: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Penjualan' },
      purchase: { bg: 'bg-cyan-100', text: 'text-cyan-800', label: 'Pembelian' },
      return: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Retur' },
      opname: { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'Stock Opname' }
    };
    const badge = badges[type] || { bg: 'bg-gray-100', text: 'text-gray-800', label: type };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <>
      <Helmet>
        <title>Laporan Pergerakan Stok - Admin</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <FaExchangeAlt className="text-blue-600" />
                  Laporan Pergerakan Stok
                </h1>
                <p className="text-gray-600 mt-1">
                  Tracking semua pergerakan inventori
                </p>
              </div>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <FaDownload />
                Export Excel
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow p-4">
              <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium mb-1">Dari Tanggal</label>
                  <input
                    type="date"
                    value={filters.start_date}
                    onChange={(e) => setFilters(prev => ({ ...prev, start_date: e.target.value }))}
                    className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Sampai Tanggal</label>
                  <input
                    type="date"
                    value={filters.end_date}
                    onChange={(e) => setFilters(prev => ({ ...prev, end_date: e.target.value }))}
                    className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Gudang</label>
                  <select
                    value={filters.warehouse_id}
                    onChange={(e) => setFilters(prev => ({ ...prev, warehouse_id: e.target.value }))}
                    className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Semua Gudang</option>
                    {warehouses.map(wh => (
                      <option key={wh.id} value={wh.id}>{wh.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tipe</label>
                  <select
                    value={filters.movement_type}
                    onChange={(e) => setFilters(prev => ({ ...prev, movement_type: e.target.value }))}
                    className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Semua Tipe</option>
                    <option value="in">Masuk</option>
                    <option value="out">Keluar</option>
                    <option value="transfer">Transfer</option>
                    <option value="adjustment">Adjustment</option>
                    <option value="sale">Penjualan</option>
                    <option value="purchase">Pembelian</option>
                    <option value="return">Retur</option>
                    <option value="opname">Stock Opname</option>
                  </select>
                </div>
                <button
                  onClick={handleApplyFilters}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <FaFilter />
                  Terapkan
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Summary Cards */}
            {summary && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <FaArrowDown className="text-green-600 text-xl" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Masuk</p>
                      <p className="text-xl font-bold text-green-600">+{summary.total_in?.toLocaleString() || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <FaArrowUp className="text-red-600 text-xl" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Keluar</p>
                      <p className="text-xl font-bold text-red-600">-{summary.total_out?.toLocaleString() || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FaExchangeAlt className="text-blue-600 text-xl" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Transfer</p>
                      <p className="text-xl font-bold text-blue-600">{summary.total_transfer?.toLocaleString() || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FaBox className="text-gray-600 text-xl" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Pergerakan</p>
                      <p className="text-xl font-bold">{summary.total_movements?.toLocaleString() || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Loading or Content */}
            {loading ? (
              <div className="bg-white rounded-xl shadow p-8 text-center">
                <FaSpinner className="animate-spin text-3xl mx-auto text-gray-400" />
                <p className="text-gray-500 mt-2">Memuat data...</p>
              </div>
            ) : (
              <>
                {/* Movements Table */}
                <div className="bg-white rounded-xl shadow overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Tanggal</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Produk</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold">Tipe</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold">Qty</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold">Stok Awal</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold">Stok Akhir</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Gudang</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Catatan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {movements.length > 0 ? movements.map((movement) => (
                          <tr key={movement.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm">
                              {formatDate ? formatDate(movement.created_at) : new Date(movement.created_at).toLocaleDateString('id-ID')}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {getMovementIcon(movement.type)}
                                <div>
                                  <p className="font-medium">{movement.product_name}</p>
                                  <p className="text-xs text-gray-500">{movement.size_name}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {getMovementBadge(movement.type)}
                            </td>
                            <td className={`px-4 py-3 text-right font-medium ${
                              movement.type === 'in' || movement.type === 'purchase' || movement.type === 'return'
                                ? 'text-green-600'
                                : movement.type === 'out' || movement.type === 'sale'
                                ? 'text-red-600'
                                : ''
                            }`}>
                              {movement.type === 'in' || movement.type === 'purchase' || movement.type === 'return' ? '+' : '-'}
                              {Math.abs(movement.quantity)}
                            </td>
                            <td className="px-4 py-3 text-right text-sm">{movement.stock_before}</td>
                            <td className="px-4 py-3 text-right text-sm">{movement.stock_after}</td>
                            <td className="px-4 py-3 text-sm">{movement.warehouse_name || '-'}</td>
                            <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                              {movement.notes || '-'}
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                              Tidak ada data pergerakan stok
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">
                      Menampilkan {((pagination.page - 1) * 20) + 1} - {Math.min(pagination.page * 20, pagination.total)} dari {pagination.total} data
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        disabled={pagination.page === 1}
                        className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Sebelumnya
                      </button>
                      <span className="px-3 py-1">
                        {pagination.page} / {pagination.totalPages}
                      </span>
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        disabled={pagination.page === pagination.totalPages}
                        className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Selanjutnya
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default InventoryMovementReport;
