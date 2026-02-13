import React, { useState, useEffect, useCallback } from 'react';
import { 
  FaTicketAlt, FaPlus, FaEdit, FaTrash, FaTimes,
  FaPercent, FaMoneyBill, FaCalendarAlt, FaUsers,
  FaCheckCircle, FaTimesCircle, FaClock, FaChartBar
} from 'react-icons/fa';
import apiClient from '../../services/api';
import Modal, { ModalFooter } from '../../components/admin/Modal';
import DataTable from '../../components/admin/DataTable';
import { useAlert } from '../../utils/AlertContext';

const AdminCoupons = () => {
  const { showSuccess, showError: showAlertError, showConfirm } = useAlert();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  
  // Filter state
  const [statusFilter, setStatusFilter] = useState('');
  
  // Stats
  const [stats, setStats] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    max_discount: '',
    min_purchase: '',
    start_date: '',
    end_date: '',
    usage_limit: '',
    usage_limit_per_user: '1',
    is_active: true
  });

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      
      const response = await apiClient.get('/coupons', { params });
      setCoupons(response.data.data || []);
      setError('');
    } catch (err) {
      setError('Gagal memuat data kupon');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/coupons/stats');
      setStats(response.data.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  useEffect(() => {
    fetchCoupons();
    fetchStats();
  }, [fetchCoupons]);

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      discount_type: 'percentage',
      discount_value: '',
      max_discount: '',
      min_purchase: '',
      start_date: '',
      end_date: '',
      usage_limit: '',
      usage_limit_per_user: '1',
      is_active: true
    });
    setEditingCoupon(null);
  };

  const handleOpenModal = (coupon = null) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        code: coupon.code || '',
        name: coupon.name || '',
        description: coupon.description || '',
        discount_type: coupon.discount_type || 'percentage',
        discount_value: coupon.discount_value || '',
        max_discount: coupon.max_discount || '',
        min_purchase: coupon.min_purchase || '',
        start_date: coupon.start_date ? coupon.start_date.slice(0, 16) : '',
        end_date: coupon.end_date ? coupon.end_date.slice(0, 16) : '',
        usage_limit: coupon.usage_limit || '',
        usage_limit_per_user: coupon.usage_limit_per_user || '1',
        is_active: coupon.is_active !== false
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        discount_value: parseFloat(formData.discount_value) || 0,
        max_discount: formData.max_discount ? parseFloat(formData.max_discount) : null,
        min_purchase: parseFloat(formData.min_purchase) || 0,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        usage_limit_per_user: parseInt(formData.usage_limit_per_user) || 1,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null
      };

      if (editingCoupon) {
        await apiClient.put(`/coupons/${editingCoupon.id}`, data);
        showSuccess('Kupon berhasil diupdate!');
      } else {
        await apiClient.post('/coupons', data);
        showSuccess('Kupon berhasil dibuat!');
      }
      
      setShowModal(false);
      resetForm();
      fetchCoupons();
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan kupon');
    }
  };

  const handleDelete = async (id) => {
    showConfirm('Apakah Anda yakin ingin menghapus kupon ini?', async () => {
      try {
        await apiClient.delete(`/coupons/${id}`);
        showSuccess('Kupon berhasil dihapus!');
        fetchCoupons();
        fetchStats();
      } catch (err) {
        showAlertError(err.response?.data?.message || 'Gagal menghapus kupon');
      }
    }, { title: 'Konfirmasi Hapus' });
  };

  const handleViewDetail = async (coupon) => {
    try {
      const response = await apiClient.get(`/coupons/${coupon.id}`);
      setSelectedCoupon(response.data.data);
      setShowDetailModal(true);
    } catch (err) {
      setError('Gagal memuat detail kupon');
    }
  };

  const handleToggleStatus = async (coupon) => {
    try {
      await apiClient.put(`/coupons/${coupon.id}`, {
        is_active: !coupon.is_active
      });
      fetchCoupons();
    } catch (err) {
      setError('Gagal mengubah status kupon');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Aktif' },
      inactive: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Nonaktif' },
      expired: { bg: 'bg-red-100', text: 'text-red-800', label: 'Kadaluarsa' },
      scheduled: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Terjadwal' },
      depleted: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Habis' }
    };
    const badge = badges[status] || badges.inactive;
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  // DataTable columns
  const columns = [
    {
      key: 'code',
      label: 'Kode',
      sortable: true,
      render: (value, coupon) => (
        <div>
          <p className="font-mono font-bold text-blue-600">{value}</p>
          <p className="text-sm text-gray-500">{coupon.name}</p>
        </div>
      )
    },
    {
      key: 'discount_type',
      label: 'Diskon',
      sortable: true,
      render: (value, coupon) => (
        <div className="flex items-center gap-2">
          {value === 'percentage' ? (
            <FaPercent className="text-green-500" />
          ) : (
            <FaMoneyBill className="text-blue-500" />
          )}
          <span className="font-semibold">
            {value === 'percentage' 
              ? `${coupon.discount_value}%` 
              : formatCurrency(coupon.discount_value)}
          </span>
        </div>
      )
    },
    {
      key: 'min_purchase',
      label: 'Min. Pembelian',
      sortable: true,
      render: (value) => value > 0 ? formatCurrency(value) : '-'
    },
    {
      key: 'usage_count',
      label: 'Penggunaan',
      sortable: true,
      render: (value, coupon) => (
        <span className="text-sm">
          {value || 0} / {coupon.usage_limit || '∞'}
        </span>
      )
    },
    {
      key: 'end_date',
      label: 'Berlaku s/d',
      sortable: true,
      render: (value) => value ? formatDate(value) : 'Selamanya'
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => getStatusBadge(value)
    },
    {
      key: 'actions',
      label: 'Aksi',
      render: (_, coupon) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleViewDetail(coupon)}
            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Detail"
          >
            <FaChartBar size={16} />
          </button>
          <button
            onClick={() => handleOpenModal(coupon)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <FaEdit size={16} />
          </button>
          <button
            onClick={() => handleToggleStatus(coupon)}
            className={`p-2 rounded-lg transition-colors ${coupon.is_active ? 'text-yellow-600 hover:bg-yellow-50' : 'text-green-600 hover:bg-green-50'}`}
            title={coupon.is_active ? 'Nonaktifkan' : 'Aktifkan'}
          >
            {coupon.is_active ? <FaTimesCircle size={16} /> : <FaCheckCircle size={16} />}
          </button>
          <button
            onClick={() => handleDelete(coupon.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Hapus"
          >
            <FaTrash size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
            <FaTicketAlt className="text-blue-600" />
            Manajemen Kupon
          </h1>
          <p className="text-gray-600">Kelola kupon dan diskon</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <FaPlus /> Buat Kupon Baru
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <FaTicketAlt className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Kupon</p>
                <p className="text-xl font-bold">{stats.total_coupons}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-full">
                <FaCheckCircle className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Kupon Aktif</p>
                <p className="text-xl font-bold">{stats.active_coupons}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-full">
                <FaUsers className="text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Redeem</p>
                <p className="text-xl font-bold">{stats.total_redemptions}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-full">
                <FaMoneyBill className="text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Diskon</p>
                <p className="text-xl font-bold">{formatCurrency(stats.total_discount_given)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alerts */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg flex justify-between items-center">
          {error}
          <button onClick={() => setError('')}><FaTimes /></button>
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg flex justify-between items-center">
          {success}
          <button onClick={() => setSuccess('')}><FaTimes /></button>
        </div>
      )}

      {/* Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex flex-wrap gap-4">
          <div className="w-full sm:w-auto">
            <label className="block text-sm font-medium mb-1">Filter Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-48 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
              <option value="expired">Kadaluarsa</option>
              <option value="valid">Valid</option>
            </select>
          </div>
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={coupons}
        loading={loading}
        searchable={true}
        searchPlaceholder="Cari kode atau nama kupon..."
        defaultPageSize={10}
        emptyMessage="Belum ada kupon"
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        title={editingCoupon ? 'Edit Kupon' : 'Buat Kupon Baru'}
        size="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Kode Kupon *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="CONTOH: DISC10"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nama Kupon *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Diskon Tahun Baru"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Deskripsi</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="2"
                  placeholder="Deskripsi kupon..."
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Discount Settings */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Pengaturan Diskon</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tipe Diskon *</label>
                    <select
                      value={formData.discount_type}
                      onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="percentage">Persentase (%)</option>
                      <option value="fixed">Nominal (Rp)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Nilai Diskon * {formData.discount_type === 'percentage' ? '(%)' : '(Rp)'}
                    </label>
                    <input
                      type="number"
                      value={formData.discount_value}
                      onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                      placeholder={formData.discount_type === 'percentage' ? '10' : '50000'}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="0"
                      max={formData.discount_type === 'percentage' ? '100' : undefined}
                      required
                    />
                  </div>
                  {formData.discount_type === 'percentage' && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Maks. Diskon (Rp)</label>
                      <input
                        type="number"
                        value={formData.max_discount}
                        onChange={(e) => setFormData({ ...formData, max_discount: e.target.value })}
                        placeholder="50000"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        min="0"
                      />
                      <p className="text-xs text-gray-500 mt-1">Kosongkan jika tidak ada batas</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Requirements */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Syarat Penggunaan</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Min. Pembelian (Rp)</label>
                    <input
                      type="number"
                      value={formData.min_purchase}
                      onChange={(e) => setFormData({ ...formData, min_purchase: e.target.value })}
                      placeholder="100000"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">0 = tanpa minimum</p>
                  </div>
                </div>
              </div>

              {/* Validity Period */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FaCalendarAlt /> Periode Berlaku (Opsional)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tanggal Mulai</label>
                    <input
                      type="datetime-local"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Kosongkan jika berlaku mulai sekarang</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Tanggal Berakhir</label>
                    <input
                      type="datetime-local"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Kosongkan jika berlaku selamanya</p>
                  </div>
                </div>
              </div>

              {/* Usage Limits */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FaUsers /> Batas Penggunaan (Opsional)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Total Batas Redeem</label>
                    <input
                      type="number"
                      value={formData.usage_limit}
                      onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                      placeholder="100"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Kosongkan untuk unlimited</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Batas Per User</label>
                    <input
                      type="number"
                      value={formData.usage_limit_per_user}
                      onChange={(e) => setFormData({ ...formData, usage_limit_per_user: e.target.value })}
                      placeholder="1"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="1"
                    />
                    <p className="text-xs text-gray-500 mt-1">Max penggunaan per user</p>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="border-t pt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-5 h-5 accent-blue-600"
                  />
                  <span className="font-medium">Aktifkan kupon ini</span>
                </label>
              </div>

              {/* Submit */}
              <ModalFooter>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingCoupon ? 'Update Kupon' : 'Buat Kupon'}
                </button>
              </ModalFooter>
            </form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal && !!selectedCoupon}
        onClose={() => setShowDetailModal(false)}
        title="Detail Kupon"
        size="xl"
      >
        {selectedCoupon && (
          <div>
              {/* Coupon Info */}
              <div className="text-center mb-6">
                <p className="text-3xl font-mono font-bold text-blue-600">{selectedCoupon.code}</p>
                <p className="text-lg text-gray-600">{selectedCoupon.name}</p>
                {getStatusBadge(selectedCoupon.status)}
              </div>

              {/* Discount */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-center gap-2 text-2xl font-bold">
                  {selectedCoupon.discount_type === 'percentage' ? (
                    <>
                      <FaPercent className="text-green-500" />
                      <span>{selectedCoupon.discount_value}% OFF</span>
                    </>
                  ) : (
                    <>
                      <FaMoneyBill className="text-blue-500" />
                      <span>{formatCurrency(selectedCoupon.discount_value)} OFF</span>
                    </>
                  )}
                </div>
                {selectedCoupon.max_discount && (
                  <p className="text-center text-sm text-gray-500 mt-2">
                    Maksimal {formatCurrency(selectedCoupon.max_discount)}
                  </p>
                )}
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Min. Pembelian</span>
                  <span className="font-medium">
                    {selectedCoupon.min_purchase > 0 ? formatCurrency(selectedCoupon.min_purchase) : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Periode</span>
                  <span className="font-medium">
                    {selectedCoupon.start_date || selectedCoupon.end_date ? (
                      <>
                        {formatDate(selectedCoupon.start_date)} - {formatDate(selectedCoupon.end_date)}
                      </>
                    ) : 'Selamanya'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Penggunaan</span>
                  <span className="font-medium">
                    {selectedCoupon.usage_count || 0} / {selectedCoupon.usage_limit || '∞'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Batas Per User</span>
                  <span className="font-medium">{selectedCoupon.usage_limit_per_user || 1}x</span>
                </div>
              </div>

              {/* Recent Usages */}
              {selectedCoupon.recent_usages?.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-3">Penggunaan Terakhir</h3>
                  <div className="space-y-2">
                    {selectedCoupon.recent_usages.map((usage) => (
                      <div key={usage.id} className="bg-gray-50 rounded p-3 flex justify-between items-center">
                        <div>
                          <p className="font-medium">{usage.user_name || usage.guest_email || 'Guest'}</p>
                          <p className="text-sm text-gray-500">Order #{usage.order_number}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-600">-{formatCurrency(usage.discount_amount)}</p>
                          <p className="text-xs text-gray-500">{formatDate(usage.used_at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminCoupons;
