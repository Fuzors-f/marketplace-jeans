import React, { useState, useEffect } from 'react';
import { 
  FaBoxes, FaWarehouse, FaSearch, FaFilter, 
  FaPlus, FaMinus, FaExchangeAlt, FaSpinner,
  FaExclamationTriangle, FaChartLine
} from 'react-icons/fa';
import api from '../../services/api';

export default function AdminInventory() {
  const [activeTab, setActiveTab] = useState('stock');
  const [stocks, setStocks] = useState([]);
  const [movements, setMovements] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [summary, setSummary] = useState({
    total_products: 0,
    total_stock: 0,
    total_value: 0,
    low_stock_count: 0
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    warehouse_id: '',
    search: '',
    low_stock: false
  });
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustmentForm, setAdjustmentForm] = useState({
    stock_id: '',
    type: 'adjustment_in',
    quantity: '',
    notes: ''
  });
  const [selectedStock, setSelectedStock] = useState(null);
  
  // Opening stock states
  const [showOpeningStockModal, setShowOpeningStockModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [openingStockForm, setOpeningStockForm] = useState({
    product_id: '',
    warehouse_id: '',
    size_id: '',
    quantity: '',
    cost_price: ''
  });
  const [sizes, setSizes] = useState([]);
  
  // Stock edit states
  const [editingStock, setEditingStock] = useState(null);
  const [editForm, setEditForm] = useState({
    min_stock: '',
    cost_price: ''
  });
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0
  });

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => {
    if (activeTab === 'stock') {
      fetchStocks();
    } else if (activeTab === 'movements') {
      fetchMovements();
    } else if (activeTab === 'lowstock') {
      fetchLowStock();
    } else if (activeTab === 'openingstock') {
      fetchProducts();
      fetchSizes();
    }
  }, [activeTab, filters, pagination.page]);

  const fetchWarehouses = async () => {
    try {
      const response = await api.get('/warehouses');
      if (response.data.success) {
        setWarehouses(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    }
  };

  const fetchStocks = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      const response = await api.get('/inventory/variants', { params });
      if (response.data.success) {
        setStocks(response.data.data.stocks || []);
        setSummary(response.data.data.summary || summary);
        setPagination(prev => ({
          ...prev,
          total: response.data.data.pagination?.total || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching stocks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        warehouse_id: filters.warehouse_id
      };
      const response = await api.get('/inventory/movements', { params });
      if (response.data.success) {
        setMovements(response.data.data.movements || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.data.total || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching movements:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLowStock = async () => {
    setLoading(true);
    try {
      const response = await api.get('/inventory/low-stock');
      if (response.data.success) {
        setStocks(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching low stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products?show_all=true');
      if (response.data.success) {
        setProducts(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchSizes = async () => {
    try {
      const response = await api.get('/sizes');
      if (response.data.success) {
        setSizes(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching sizes:', error);
    }
  };

  const handleOpenAdjustment = (stock) => {
    setSelectedStock(stock);
    setAdjustmentForm({
      stock_id: stock.id,
      type: 'adjustment_in',
      quantity: '',
      notes: ''
    });
    setShowAdjustModal(true);
  };

  const handleAdjustment = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/inventory/adjust', {
        stock_id: adjustmentForm.stock_id,
        type: adjustmentForm.type,
        quantity: parseInt(adjustmentForm.quantity),
        notes: adjustmentForm.notes
      });

      if (response.data.success) {
        alert('Penyesuaian stok berhasil!');
        setShowAdjustModal(false);
        fetchStocks();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menyesuaikan stok');
    }
  };

  const handleOpeningStockChange = (e) => {
    const { name, value } = e.target;
    setOpeningStockForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOpeningStockSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/inventory/opening-stock', {
        product_id: parseInt(openingStockForm.product_id),
        warehouse_id: parseInt(openingStockForm.warehouse_id),
        size_id: parseInt(openingStockForm.size_id),
        quantity: parseInt(openingStockForm.quantity),
        cost_price: parseFloat(openingStockForm.cost_price)
      });

      if (response.data.success) {
        alert('Stok pembuka berhasil ditambahkan!');
        setShowOpeningStockModal(false);
        setOpeningStockForm({
          product_id: '',
          warehouse_id: '',
          size_id: '',
          quantity: '',
          cost_price: ''
        });
        fetchStocks();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menambahkan stok pembuka');
    }
  };

  const handleEditStock = (stock) => {
    setEditingStock(stock.variant_id);
    setEditForm({
      stock_quantity: stock.stock_quantity || '',
      min_stock: stock.min_stock || 5,
      cost_price: stock.cost_price || ''
    });
  };

  const handleSaveEdit = async (variantId) => {
    try {
      const response = await api.put(`/inventory/variants/${variantId}`, {
        stock_quantity: parseInt(editForm.stock_quantity) || 0,
        min_stock: parseInt(editForm.min_stock) || 5,
        cost_price: parseFloat(editForm.cost_price) || 0
      });

      if (response.data.success) {
        alert('Data stok berhasil diupdate!');
        setEditingStock(null);
        fetchStocks();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal mengupdate data stok');
    }
  };

  const handleCancelEdit = () => {
    setEditingStock(null);
    setEditForm({ stock_quantity: '', min_stock: 5, cost_price: '' });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  const getMovementTypeBadge = (type) => {
    const types = {
      in: { label: 'Masuk', className: 'bg-green-100 text-green-800' },
      out: { label: 'Keluar', className: 'bg-red-100 text-red-800' },
      transfer_in: { label: 'Transfer Masuk', className: 'bg-blue-100 text-blue-800' },
      transfer_out: { label: 'Transfer Keluar', className: 'bg-orange-100 text-orange-800' },
      adjustment_in: { label: 'Adj. Masuk', className: 'bg-purple-100 text-purple-800' },
      adjustment_out: { label: 'Adj. Keluar', className: 'bg-pink-100 text-pink-800' },
      sale: { label: 'Penjualan', className: 'bg-yellow-100 text-yellow-800' },
      return: { label: 'Retur', className: 'bg-gray-100 text-gray-800' }
    };
    const typeInfo = types[type] || { label: type, className: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeInfo.className}`}>
        {typeInfo.label}
      </span>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Inventori</h1>
        <p className="text-gray-600">Kelola stok dan pergerakan barang</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FaBoxes className="text-blue-600 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Produk</p>
              <p className="text-xl font-bold">{summary.total_products}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <FaChartLine className="text-green-600 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Stok</p>
              <p className="text-xl font-bold">{summary.total_stock}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FaWarehouse className="text-purple-600 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Nilai Inventori</p>
              <p className="text-lg font-bold">{formatCurrency(summary.total_value)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <FaExclamationTriangle className="text-red-600 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Stok Rendah</p>
              <p className="text-xl font-bold text-red-600">{summary.low_stock_count}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('stock')}
              className={`px-6 py-4 text-sm font-medium border-b-2 -mb-px ${
                activeTab === 'stock'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaBoxes className="inline mr-2" /> Stok Produk
            </button>
            <button
              onClick={() => setActiveTab('movements')}
              className={`px-6 py-4 text-sm font-medium border-b-2 -mb-px ${
                activeTab === 'movements'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaExchangeAlt className="inline mr-2" /> Riwayat Pergerakan
            </button>
            <button
              onClick={() => setActiveTab('lowstock')}
              className={`px-6 py-4 text-sm font-medium border-b-2 -mb-px ${
                activeTab === 'lowstock'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaExclamationTriangle className="inline mr-2" /> Stok Rendah
            </button>
            <button
              onClick={() => setActiveTab('openingstock')}
              className={`px-6 py-4 text-sm font-medium border-b-2 -mb-px ${
                activeTab === 'openingstock'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaPlus className="inline mr-2" /> Stok Pembuka
            </button>
          </nav>
        </div>

        {/* Filters */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Cari produk..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filters.warehouse_id}
              onChange={(e) => setFilters({ ...filters, warehouse_id: e.target.value })}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Gudang</option>
              {warehouses && warehouses.length > 0 && warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {loading ? (
            <div className="text-center py-10">
              <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
              <p className="text-gray-500">Memuat data...</p>
            </div>
          ) : (
            <>
              {/* Stock Tab */}
              {activeTab === 'stock' && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Varian</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gudang</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Stok</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Min. Stok</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">HPP/pcs</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Nilai</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stocks.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                            Tidak ada data stok
                          </td>
                        </tr>
                      ) : (
                        stocks.map((stock) => (
                          <tr key={stock.variant_id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="font-medium">{stock.product_name}</div>
                              <div className="text-xs text-gray-500">{stock.sku}</div>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {stock.size_name}
                            </td>
                            <td className="px-4 py-3 text-sm">{stock.warehouse_name}</td>
                            <td className="px-4 py-3 text-center">
                              {editingStock === stock.variant_id ? (
                                <input
                                  type="number"
                                  value={editForm.stock_quantity}
                                  onChange={(e) => setEditForm({...editForm, stock_quantity: e.target.value})}
                                  className="w-20 px-2 py-1 text-sm border rounded text-center"
                                  min="0"
                                />
                              ) : (
                                <div>
                                  <span className={`font-bold ${
                                    stock.stock_status === 'Out of Stock' ? 'text-red-600' :
                                    stock.stock_status === 'Below Minimum' ? 'text-orange-600' :
                                    'text-green-600'
                                  }`}>
                                    {stock.stock_quantity}
                                  </span>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {stock.stock_status === 'Out of Stock' && '🔴'}
                                    {stock.stock_status === 'Below Minimum' && '🟡'}
                                    {stock.stock_status === 'Safe' && '🟢'}
                                    {' '}{stock.stock_status}
                                  </div>
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {editingStock === stock.variant_id ? (
                                <input
                                  type="number"
                                  value={editForm.min_stock}
                                  onChange={(e) => setEditForm({...editForm, min_stock: e.target.value})}
                                  className="w-16 px-2 py-1 text-sm border rounded text-center"
                                  min="0"
                                />
                              ) : (
                                <span className="text-sm font-medium">{stock.min_stock || 5}</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right text-sm">
                              {editingStock === stock.variant_id ? (
                                <input
                                  type="number"
                                  value={editForm.cost_price}
                                  onChange={(e) => setEditForm({...editForm, cost_price: e.target.value})}
                                  className="w-20 px-2 py-1 text-sm border rounded text-right"
                                  min="0"
                                  step="0.01"
                                />
                              ) : (
                                formatCurrency(stock.cost_price)
                              )}
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-medium">
                              {formatCurrency(stock.stock_quantity * (stock.cost_price || 0))}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex gap-1 justify-center">
                                {editingStock === stock.variant_id ? (
                                  <>
                                    <button
                                      onClick={() => handleSaveEdit(stock.variant_id)}
                                      className="text-green-600 hover:text-green-800 text-xs px-2 py-1 rounded bg-green-50 hover:bg-green-100"
                                    >
                                      ✓
                                    </button>
                                    <button
                                      onClick={handleCancelEdit}
                                      className="text-gray-600 hover:text-gray-800 text-xs px-2 py-1 rounded bg-gray-50 hover:bg-gray-100"
                                    >
                                      ✕
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => handleEditStock(stock)}
                                      className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 rounded bg-blue-50 hover:bg-blue-100"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleOpenAdjustment(stock)}
                                      className="text-purple-600 hover:text-purple-800 text-xs px-2 py-1 rounded bg-purple-50 hover:bg-purple-100"
                                    >
                                      Adjust
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

              {/* Movements Tab */}
              {activeTab === 'movements' && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gudang</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tipe</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Qty</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referensi</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catatan</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {movements.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                            Tidak ada riwayat pergerakan
                          </td>
                        </tr>
                      ) : (
                        movements.map((mov) => (
                          <tr key={mov.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm">
                              {new Date(mov.created_at).toLocaleString('id-ID')}
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-medium text-sm">{mov.product_name}</div>
                              <div className="text-xs text-gray-500">
                                {mov.fitting_name} / {mov.size_name}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm">{mov.warehouse_name}</td>
                            <td className="px-4 py-3 text-center">
                              {getMovementTypeBadge(mov.movement_type)}
                            </td>
                            <td className="px-4 py-3 text-center font-medium">
                              <span className={mov.quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                                {mov.quantity > 0 ? `+${mov.quantity}` : mov.quantity}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {mov.reference_type && (
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  {mov.reference_type}: {mov.reference_id}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{mov.notes || '-'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Low Stock Tab */}
              {activeTab === 'lowstock' && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Varian</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gudang</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Stok</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Min. Stok</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stocks.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                            <FaExclamationTriangle className="text-4xl mx-auto mb-2 text-green-500" />
                            Tidak ada stok yang rendah
                          </td>
                        </tr>
                      ) : (
                        stocks.map((stock) => (
                          <tr key={stock.id} className="hover:bg-gray-50 bg-red-50">
                            <td className="px-4 py-3">
                              <div className="font-medium">{stock.product_name}</div>
                              <div className="text-xs text-gray-500">{stock.sku}</div>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {stock.fitting_name} / {stock.size_name}
                            </td>
                            <td className="px-4 py-3 text-sm">{stock.warehouse_name}</td>
                            <td className="px-4 py-3 text-center font-bold text-red-600">
                              {stock.quantity}
                            </td>
                            <td className="px-4 py-3 text-center text-sm">
                              {stock.min_stock || 5}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                                Perlu Restock
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => handleOpenAdjustment(stock)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                Tambah Stok
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Opening Stock Tab */}
              {activeTab === 'openingstock' && (
                <div className="space-y-6">
                  {/* Add Opening Stock Button */}
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Manajemen Stok Pembuka</h3>
                    <button
                      onClick={() => setShowOpeningStockModal(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <FaPlus /> Tambah Stok Pembuka
                    </button>
                  </div>

                  {/* Opening Stock Instructions */}
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Tentang Stok Pembuka</h4>
                    <p className="text-blue-800 text-sm">
                      Stok pembuka digunakan untuk mencatat stok awal produk di gudang. 
                      Fitur ini berguna saat memulai sistem atau menambahkan produk baru ke gudang.
                    </p>
                  </div>

                  {/* Recent Opening Stock Entries */}
                  <div className="bg-white rounded-lg border">
                    <div className="p-4 border-b">
                      <h4 className="font-medium">Riwayat Stok Pembuka Terbaru</h4>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Varian</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gudang</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Harga Modal</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          <tr>
                            <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                              <FaBoxes className="text-4xl mx-auto mb-2 text-gray-400" />
                              Belum ada data stok pembuka. Klik tombol "Tambah Stok Pembuka" untuk memulai.
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Opening Stock Modal */}
      {showOpeningStockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Tambah Stok Pembuka</h3>
            <form onSubmit={handleOpeningStockSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Produk *</label>
                <select
                  name="product_id"
                  value={openingStockForm.product_id}
                  onChange={handleOpeningStockChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih Produk</option>
                  {products && products.length > 0 && products.map(product => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Gudang *</label>
                <select
                  name="warehouse_id"
                  value={openingStockForm.warehouse_id}
                  onChange={handleOpeningStockChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih Gudang</option>
                  {warehouses && warehouses.length > 0 && warehouses.map(warehouse => (
                    <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Ukuran *</label>
                <select
                  name="size_id"
                  value={openingStockForm.size_id}
                  onChange={handleOpeningStockChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih Ukuran</option>
                  {sizes && sizes.length > 0 && sizes.map(size => (
                    <option key={size.id} value={size.id}>{size.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Jumlah *</label>
                <input
                  type="number"
                  name="quantity"
                  value={openingStockForm.quantity}
                  onChange={handleOpeningStockChange}
                  min="1"
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Harga Modal</label>
                <input
                  type="number"
                  name="cost_price"
                  value={openingStockForm.cost_price}
                  onChange={handleOpeningStockChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setShowOpeningStockModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjustment Modal */}
      {showAdjustModal && selectedStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Penyesuaian Stok</h3>
            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <p className="font-medium">{selectedStock.product_name}</p>
              <p className="text-sm text-gray-600">
                {selectedStock.fitting_name} / {selectedStock.size_name}
              </p>
              <p className="text-sm text-gray-600">{selectedStock.warehouse_name}</p>
              <p className="mt-2">Stok saat ini: <strong>{selectedStock.quantity}</strong></p>
            </div>
            <form onSubmit={handleAdjustment}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Tipe Penyesuaian</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="type"
                      value="adjustment_in"
                      checked={adjustmentForm.type === 'adjustment_in'}
                      onChange={(e) => setAdjustmentForm({ ...adjustmentForm, type: e.target.value })}
                    />
                    <span className="flex items-center gap-1">
                      <FaPlus className="text-green-600" /> Tambah
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="type"
                      value="adjustment_out"
                      checked={adjustmentForm.type === 'adjustment_out'}
                      onChange={(e) => setAdjustmentForm({ ...adjustmentForm, type: e.target.value })}
                    />
                    <span className="flex items-center gap-1">
                      <FaMinus className="text-red-600" /> Kurangi
                    </span>
                  </label>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Jumlah</label>
                <input
                  type="number"
                  value={adjustmentForm.quantity}
                  onChange={(e) => setAdjustmentForm({ ...adjustmentForm, quantity: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="1"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Catatan/Alasan</label>
                <textarea
                  value={adjustmentForm.notes}
                  onChange={(e) => setAdjustmentForm({ ...adjustmentForm, notes: e.target.value })}
                  rows="2"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Alasan penyesuaian stok"
                  required
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
