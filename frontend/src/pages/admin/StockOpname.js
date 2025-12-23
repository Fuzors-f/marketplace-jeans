import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaClipboardList, FaPlus, FaEye, FaCheck, FaTimes, 
  FaSearch, FaFilter, FaWarehouse, FaSpinner
} from 'react-icons/fa';
import api from '../../services/api';

const StockOpname = () => {
  const [opnames, setOpnames] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOpname, setSelectedOpname] = useState(null);
  const [opnameDetails, setOpnameDetails] = useState([]);
  const [createForm, setCreateForm] = useState({
    warehouse_id: '',
    notes: ''
  });
  const [filters, setFilters] = useState({
    status: '',
    warehouse_id: ''
  });
  
  // Enhanced states
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkUpdateForm, setBulkUpdateForm] = useState({
    opname_id: '',
    updates: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [opnamesRes, warehousesRes, productsRes] = await Promise.all([
        api.get('/opname', { params: filters }),
        api.get('/warehouses'),
        api.get('/products?limit=1000')
      ]);

      if (opnamesRes.data.success) setOpnames(opnamesRes.data.data);
      if (warehousesRes.data.success) setWarehouses(warehousesRes.data.data);
      if (productsRes.data.success) setProducts(productsRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOpname = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/opname', createForm);
      if (response.data.success) {
        alert('Stock opname berhasil dibuat!');
        setShowCreateModal(false);
        setCreateForm({ warehouse_id: '', notes: '' });
        fetchData();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal membuat stock opname');
    }
  };

  const handleViewDetail = async (opname) => {
    try {
      const response = await api.get(`/opname/${opname.id}`);
      if (response.data.success) {
        setSelectedOpname(response.data.data.opname);
        setOpnameDetails(response.data.data.details);
        setShowDetailModal(true);
      }
    } catch (error) {
      alert('Gagal mengambil detail opname');
    }
  };

  const handleUpdateDetail = async (detailId, physicalQty) => {
    try {
      await api.put(`/opname/details/${detailId}`, {
        physical_quantity: parseInt(physicalQty)
      });
      // Refresh details
      handleViewDetail(selectedOpname);
    } catch (error) {
      alert('Gagal mengupdate data');
    }
  };

  const handleCompleteOpname = async (opnameId) => {
    if (!window.confirm('Apakah Anda yakin ingin menyelesaikan stock opname ini? Perbedaan stok akan diproses sebagai adjustment.')) {
      return;
    }

    try {
      const response = await api.post(`/opname/${opnameId}/complete`);
      if (response.data.success) {
        alert('Stock opname berhasil diselesaikan!');
        setShowDetailModal(false);
        fetchData();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menyelesaikan opname');
    }
  };

  const handleCancelOpname = async (opnameId) => {
    if (!window.confirm('Apakah Anda yakin ingin membatalkan stock opname ini?')) {
      return;
    }

    try {
      const response = await api.post(`/opname/${opnameId}/cancel`);
      if (response.data.success) {
        alert('Stock opname berhasil dibatalkan!');
        fetchData();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal membatalkan opname');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      draft: { label: 'Draft', className: 'bg-yellow-100 text-yellow-800' },
      completed: { label: 'Selesai', className: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Dibatalkan', className: 'bg-red-100 text-red-800' }
    };
    const statusInfo = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Stock Opname</h1>
          <p className="text-gray-600">Kelola dan monitor stock opname gudang</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg">
            <p className="text-xs text-blue-600 font-medium">Total Opname</p>
            <p className="text-xl font-bold text-blue-800">{opnames.length}</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            <FaPlus /> Buat Opname Baru
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nomor opname atau catatan..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={filters.warehouse_id}
            onChange={(e) => setFilters({ ...filters, warehouse_id: e.target.value })}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Gudang</option>
            {warehouses.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Status</option>
            <option value="draft">Draft</option>
            <option value="completed">Selesai</option>
            <option value="cancelled">Dibatalkan</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setFilters({ status: '', warehouse_id: '' });
                setSearchTerm('');
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
            >
              <FaFilter className="text-sm" /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Opname List */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-10 text-center">
            <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
            <p className="text-gray-500">Memuat data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. Opname</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gudang</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catatan</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {opnames.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                      Belum ada stock opname
                    </td>
                  </tr>
                ) : (
                  opnames.map((opname) => (
                    <tr key={opname.id} className="hover:bg-gray-50 border-b">
                      <td className="px-4 py-3 font-medium text-blue-600">{opname.opname_number}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(opname.opname_date).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center">
                          <FaWarehouse className="text-gray-400 mr-2" />
                          {opname.warehouse_name}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {opname.total_items || 0} items
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">{getStatusBadge(opname.status)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{opname.notes || '-'}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleViewDetail(opname)}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                            title="Lihat Detail"
                          >
                            <FaEye />
                          </button>
                          {opname.status === 'draft' && (
                            <>
                              <button
                                onClick={() => handleCompleteOpname(opname.id)}
                                className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50"
                                title="Selesaikan Opname"
                              >
                                <FaCheck />
                              </button>
                              <button
                                onClick={() => handleCancelOpname(opname.id)}
                                className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                                title="Batalkan Opname"
                              >
                                <FaTimes />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Buat Stock Opname Baru</h3>
            <form onSubmit={handleCreateOpname}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Gudang</label>
                <select
                  value={createForm.warehouse_id}
                  onChange={(e) => setCreateForm({ ...createForm, warehouse_id: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Pilih Gudang</option>
                  {warehouses.filter(w => w.is_active).map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Catatan</label>
                <textarea
                  value={createForm.notes}
                  onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Catatan opname (opsional)"
                />
              </div>
              <p className="text-sm text-gray-500 mb-4">
                * Sistem akan mengambil semua stok dari gudang yang dipilih untuk dihitung fisiknya.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Buat Opname
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedOpname && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold">{selectedOpname.opname_number}</h3>
                  <p className="text-sm text-gray-600">
                    {selectedOpname.warehouse_name} • {new Date(selectedOpname.opname_date).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {getStatusBadge(selectedOpname.status)}
                  {selectedOpname.status === 'draft' && (
                    <>
                      <button
                        onClick={() => handleCompleteOpname(selectedOpname.id)}
                        className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        <FaCheck /> Selesaikan
                      </button>
                      <button
                        onClick={() => handleCancelOpname(selectedOpname.id)}
                        className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        <FaTimes /> Batalkan
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes size={20} />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="overflow-auto max-h-[60vh] p-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Varian</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Stok Sistem</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Stok Fisik</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Selisih</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {opnameDetails.map((detail) => (
                    <tr key={detail.id} className={`hover:bg-gray-50 ${
                      detail.difference !== 0 ? 'bg-yellow-50' : ''
                    }`}>
                      <td className="px-4 py-3">
                        <div className="font-medium">{detail.product_name}</div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {detail.fitting_name} / {detail.size_name}
                      </td>
                      <td className="px-4 py-3 text-center font-medium">{detail.system_quantity}</td>
                      <td className="px-4 py-3 text-center">
                        {selectedOpname.status === 'draft' ? (
                          <input
                            type="number"
                            defaultValue={detail.physical_quantity || ''}
                            onBlur={(e) => handleUpdateDetail(detail.id, e.target.value)}
                            className="w-20 px-2 py-1 border rounded text-center focus:ring-2 focus:ring-blue-500"
                            min="0"
                          />
                        ) : (
                          <span className="font-medium">{detail.physical_quantity}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-medium ${
                          detail.difference > 0 ? 'text-green-600' :
                          detail.difference < 0 ? 'text-red-600' : ''
                        }`}>
                          {detail.difference > 0 ? `+${detail.difference}` : detail.difference}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Total: {opnameDetails.length} item | 
                  Selisih Plus: {opnameDetails.filter(d => d.difference > 0).length} | 
                  Selisih Minus: {opnameDetails.filter(d => d.difference < 0).length}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// TODO: Disabled - Stock Opname functionality has been merged into variant-based inventory management
// export default StockOpname;
export default null;
