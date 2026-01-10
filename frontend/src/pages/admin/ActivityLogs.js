import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import apiClient from '../../services/api';
import { 
  FaHistory, FaSearch, FaFilter, FaDownload, FaUser, FaSpinner,
  FaChartBar, FaCalendarAlt, FaTimes, FaEye, FaGlobe, FaDesktop
} from 'react-icons/fa';
import { useLanguage } from '../../utils/i18n';

const ActivityLogs = () => {
  const { formatDate } = useLanguage();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    action: '',
    entity_type: '',
    user_id: '',
    start_date: '',
    end_date: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState({ actions: [], entityTypes: [] });
  
  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });
  
  // Detail modal
  const [selectedLog, setSelectedLog] = useState(null);
  
  // Users for filter
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchLogs();
    fetchSummary();
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [pagination.page, filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      });
      
      const response = await apiClient.get(`/activity-logs?${params}`);
      if (response.data.success) {
        setLogs(response.data.data);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total,
          totalPages: response.data.pagination.totalPages
        }));
        setFilterOptions(response.data.filters);
      }
    } catch (err) {
      setError('Gagal memuat data log');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const params = new URLSearchParams({
        start_date: filters.start_date || '',
        end_date: filters.end_date || ''
      });
      const response = await apiClient.get(`/activity-logs/summary?${params}`);
      if (response.data.success) {
        setSummary(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await apiClient.get('/users?limit=1000');
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams(
        Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      );
      
      const response = await apiClient.get(`/activity-logs/export?${params}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `activity-logs-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Gagal mengexport data');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      action: '',
      entity_type: '',
      user_id: '',
      start_date: '',
      end_date: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getActionBadgeColor = (action) => {
    const colors = {
      login: 'bg-green-100 text-green-800',
      logout: 'bg-gray-100 text-gray-800',
      create: 'bg-blue-100 text-blue-800',
      update: 'bg-yellow-100 text-yellow-800',
      delete: 'bg-red-100 text-red-800',
      view: 'bg-purple-100 text-purple-800',
      export: 'bg-indigo-100 text-indigo-800',
      import: 'bg-cyan-100 text-cyan-800'
    };
    
    const key = Object.keys(colors).find(k => action?.toLowerCase().includes(k));
    return colors[key] || 'bg-gray-100 text-gray-800';
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <>
      <Helmet>
        <title>Activity Logs - Admin</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <FaHistory className="text-blue-600" />
                  Activity Logs
                </h1>
                <p className="text-gray-600 mt-1">
                  Monitor semua aktivitas pengguna di sistem
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                    showFilters ? 'bg-gray-100 border-gray-300' : 'bg-white border-gray-200'
                  }`}
                >
                  <FaFilter />
                  Filter
                </button>
                <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <FaDownload />
              Export
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FaChartBar className="text-blue-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Aktivitas</p>
                  <p className="text-2xl font-bold">{summary.totals?.total_activities?.toLocaleString() || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FaUser className="text-green-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">User Aktif</p>
                  <p className="text-2xl font-bold">{summary.totals?.unique_users || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FaGlobe className="text-purple-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">IP Unik</p>
                  <p className="text-2xl font-bold">{summary.totals?.unique_ips || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <FaDesktop className="text-orange-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Aksi Terbanyak</p>
                  <p className="text-lg font-bold truncate">{summary.byAction?.[0]?.action || '-'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Pencarian</label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Cari..."
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Action</label>
                <select
                  value={filters.action}
                  onChange={(e) => handleFilterChange('action', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Semua Action</option>
                  {filterOptions.actions.map(action => (
                    <option key={action} value={action}>{action}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Entity Type</label>
                <select
                  value={filters.entity_type}
                  onChange={(e) => handleFilterChange('entity_type', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Semua Entity</option>
                  {filterOptions.entityTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">User</label>
                <select
                  value={filters.user_id}
                  onChange={(e) => handleFilterChange('user_id', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Semua User</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.full_name} ({user.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Dari Tanggal</label>
                <input
                  type="date"
                  value={filters.start_date}
                  onChange={(e) => handleFilterChange('start_date', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sampai Tanggal</label>
                <input
                  type="date"
                  value={filters.end_date}
                  onChange={(e) => handleFilterChange('end_date', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Reset Filter
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
            <button onClick={() => setError('')} className="float-right">&times;</button>
          </div>
        )}

        {/* Logs Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <FaSpinner className="animate-spin text-3xl mx-auto text-gray-400" />
              <p className="text-gray-500 mt-2">Memuat data...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center">
              <FaHistory className="text-5xl mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Tidak ada data log</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Waktu</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">User</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Entity</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Deskripsi</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">IP</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Detail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                          {formatDateTime(log.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium">{log.user_name || 'Guest'}</div>
                          <div className="text-xs text-gray-500">{log.user_email}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionBadgeColor(log.action)}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {log.entity_type && (
                            <span className="text-gray-600">
                              {log.entity_type}
                              {log.entity_id && <span className="text-gray-400"> #{log.entity_id}</span>}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                          {log.description}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 font-mono">
                          {log.ip_address}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Lihat Detail"
                          >
                            <FaEye />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-4 py-3 border-t flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Menampilkan {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} log
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Prev
                  </button>
                  <span className="px-3 py-1">
                    {pagination.page} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page >= pagination.totalPages}
                    className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Detail Activity Log #{selectedLog.id}</h2>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Waktu</label>
                  <p className="font-medium">{formatDateTime(selectedLog.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">User</label>
                  <p className="font-medium">{selectedLog.user_name || 'Guest'}</p>
                  <p className="text-sm text-gray-500">{selectedLog.user_email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Action</label>
                  <p>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionBadgeColor(selectedLog.action)}`}>
                      {selectedLog.action}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Entity</label>
                  <p className="font-medium">
                    {selectedLog.entity_type || '-'}
                    {selectedLog.entity_id && ` #${selectedLog.entity_id}`}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">IP Address</label>
                  <p className="font-mono">{selectedLog.ip_address || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Method</label>
                  <p className="font-medium">{selectedLog.request_method || '-'}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-500">URL</label>
                <p className="font-mono text-sm bg-gray-50 p-2 rounded break-all">
                  {selectedLog.request_url || '-'}
                </p>
              </div>

              <div>
                <label className="text-sm text-gray-500">Deskripsi</label>
                <p className="bg-gray-50 p-3 rounded">{selectedLog.description || '-'}</p>
              </div>

              <div>
                <label className="text-sm text-gray-500">User Agent</label>
                <p className="text-sm bg-gray-50 p-2 rounded break-all text-gray-600">
                  {selectedLog.user_agent || '-'}
                </p>
              </div>

              {selectedLog.metadata && (
                <div>
                  <label className="text-sm text-gray-500">Metadata</label>
                  <pre className="text-sm bg-gray-50 p-3 rounded overflow-auto">
                    {JSON.stringify(JSON.parse(selectedLog.metadata), null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ActivityLogs;
