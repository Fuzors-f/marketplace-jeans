import React, { useState, useEffect, useCallback } from 'react';
import { 
  FaUndo, FaPlus, FaEye, FaTimes, FaSearch,
  FaWarehouse, FaShoppingBag, FaCheckCircle, FaBan,
  FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
import apiClient from '../../services/api';
import { returnAPI } from '../../services/api';
import Modal, { ModalFooter } from '../../components/admin/Modal';
import { useAlert } from '../../utils/AlertContext';

const AdminReturns = () => {
  const { showSuccess, showError: showAlertError, showConfirm } = useAlert();
  
  // List state
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Create modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderResults, setOrderResults] = useState([]);
  const [searchingOrders, setSearchingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [warehouses, setWarehouses] = useState([]);
  const [returnNotes, setReturnNotes] = useState('');
  const [returnItems, setReturnItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  
  // Detail modal state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Fetch returns list
  const fetchReturns = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page: pagination.page, limit: pagination.limit };
      if (searchQuery) params.search = searchQuery;
      if (statusFilter) params.status = statusFilter;
      
      const response = await returnAPI.getAll(params);
      setReturns(response.data.data || []);
      setPagination(prev => ({ ...prev, ...response.data.pagination }));
    } catch (err) {
      console.error('Failed to fetch returns:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchQuery, statusFilter]);

  // Fetch warehouses
  const fetchWarehouses = async () => {
    try {
      const response = await apiClient.get('/warehouses');
      setWarehouses(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch warehouses:', err);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  // Search orders
  useEffect(() => {
    if (!orderSearch || orderSearch.length < 2) {
      setOrderResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setSearchingOrders(true);
        const response = await returnAPI.searchOrders(orderSearch);
        setOrderResults(response.data.data || []);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setSearchingOrders(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [orderSearch]);

  // Select order and load items
  const handleSelectOrder = async (order) => {
    setSelectedOrder(order);
    setOrderSearch('');
    setOrderResults([]);
    setLoadingItems(true);
    
    try {
      const response = await returnAPI.getOrderItems(order.id);
      const data = response.data.data;
      setOrderItems(data.items || []);
      
      // Auto-select warehouse from order items
      if (data.items.length > 0 && data.items[0].warehouse_id) {
        setSelectedWarehouse(String(data.items[0].warehouse_id));
      }
      
      // Pre-fill return items with all returnable items
      const prefilledItems = (data.items || [])
        .filter(item => item.returnable_quantity > 0)
        .map(item => ({
          order_item_id: item.id,
          product_variant_id: item.product_variant_id,
          product_name: item.product_name,
          size_name: item.size_name,
          max_qty: item.returnable_quantity,
          quantity: item.returnable_quantity,
          reason: 'Retur barang',
          selected: true
        }));
      setReturnItems(prefilledItems);
      
      // Pre-fill notes
      setReturnNotes(`Retur barang dari order ${order.order_number}`);
    } catch (err) {
      showAlertError('Gagal mengambil item order');
    } finally {
      setLoadingItems(false);
    }
  };

  // Toggle item selection
  const toggleItem = (index) => {
    setReturnItems(prev => prev.map((item, i) => 
      i === index ? { ...item, selected: !item.selected } : item
    ));
  };

  // Update item quantity
  const updateItemQty = (index, qty) => {
    const parsed = parseInt(qty) || 0;
    setReturnItems(prev => prev.map((item, i) => 
      i === index ? { ...item, quantity: Math.min(Math.max(0, parsed), item.max_qty) } : item
    ));
  };

  // Update item reason
  const updateItemReason = (index, reason) => {
    setReturnItems(prev => prev.map((item, i) => 
      i === index ? { ...item, reason } : item
    ));
  };

  // Submit return
  const handleSubmit = async () => {
    if (!selectedOrder) {
      showAlertError('Pilih order terlebih dahulu');
      return;
    }
    if (!selectedWarehouse) {
      showAlertError('Pilih gudang tujuan');
      return;
    }
    
    const selectedItems = returnItems.filter(item => item.selected && item.quantity > 0);
    if (!selectedItems.length) {
      showAlertError('Pilih minimal 1 item untuk diretur');
      return;
    }

    showConfirm(
      `Retur ${selectedItems.length} item dari order ${selectedOrder.order_number}? Stok akan langsung dikembalikan ke gudang.`,
      async () => {
        try {
          setSubmitting(true);
          const response = await returnAPI.create({
            order_id: selectedOrder.id,
            warehouse_id: parseInt(selectedWarehouse),
            notes: returnNotes,
            items: selectedItems.map(item => ({
              order_item_id: item.order_item_id,
              product_variant_id: item.product_variant_id,
              quantity: item.quantity,
              reason: item.reason
            }))
          });
          showSuccess(response.data.message || 'Retur berhasil dibuat');
          resetCreateForm();
          setShowCreateModal(false);
          fetchReturns();
        } catch (err) {
          showAlertError(err.response?.data?.message || 'Gagal membuat retur');
        } finally {
          setSubmitting(false);
        }
      },
      { title: 'Konfirmasi Retur', confirmText: 'Ya, Proses Retur', confirmColor: 'blue' }
    );
  };

  // Cancel return
  const handleCancelReturn = (ret) => {
    showConfirm(
      `Batalkan retur ${ret.return_number}? Stok yang sudah dikembalikan akan dikurangi kembali.`,
      async () => {
        try {
          await returnAPI.cancel(ret.id);
          showSuccess('Retur berhasil dibatalkan');
          fetchReturns();
        } catch (err) {
          showAlertError(err.response?.data?.message || 'Gagal membatalkan retur');
        }
      },
      { title: 'Batalkan Retur', confirmText: 'Ya, Batalkan', confirmColor: 'red' }
    );
  };

  // View detail
  const handleViewDetail = async (ret) => {
    setShowDetailModal(true);
    setLoadingDetail(true);
    try {
      const response = await returnAPI.getById(ret.id);
      setSelectedReturn(response.data.data);
    } catch (err) {
      showAlertError('Gagal mengambil detail retur');
      setShowDetailModal(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const resetCreateForm = () => {
    setSelectedOrder(null);
    setOrderSearch('');
    setOrderResults([]);
    setOrderItems([]);
    setSelectedWarehouse('');
    setReturnNotes('');
    setReturnItems([]);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0);
  };

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    const labels = {
      completed: 'Selesai',
      pending: 'Pending',
      cancelled: 'Dibatalkan'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaUndo className="text-blue-600" /> Retur Barang
          </h1>
          <p className="text-sm text-gray-500 mt-1">Kelola retur barang langsung ke gudang</p>
        </div>
        <button
          onClick={() => { resetCreateForm(); setShowCreateModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaPlus /> Buat Retur
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nomor retur atau order..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Status</option>
            <option value="completed">Selesai</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Dibatalkan</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : returns.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <FaUndo className="mx-auto text-4xl mb-3 text-gray-300" />
            <p>Belum ada data retur</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. Retur</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gudang</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Item</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {returns.map((ret) => (
                    <tr key={ret.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-blue-600">{ret.return_number}</td>
                      <td className="px-4 py-3 text-sm">{ret.order_number}</td>
                      <td className="px-4 py-3 text-sm">{ret.customer_name || '-'}</td>
                      <td className="px-4 py-3 text-sm">{ret.warehouse_name || '-'}</td>
                      <td className="px-4 py-3 text-center text-sm">{ret.total_quantity || ret.item_count}</td>
                      <td className="px-4 py-3 text-center">{getStatusBadge(ret.status)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(ret.created_at)}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => handleViewDetail(ret)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Detail"
                          >
                            <FaEye />
                          </button>
                          {ret.status === 'completed' && (
                            <button
                              onClick={() => handleCancelReturn(ret)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                              title="Batalkan"
                            >
                              <FaBan />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y">
              {returns.map((ret) => (
                <div key={ret.id} className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-blue-600">{ret.return_number}</p>
                      <p className="text-sm text-gray-500">Order: {ret.order_number}</p>
                    </div>
                    {getStatusBadge(ret.status)}
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{ret.customer_name || '-'}</span>
                    <span>{ret.warehouse_name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">{formatDate(ret.created_at)}</span>
                    <div className="flex gap-2">
                      <button onClick={() => handleViewDetail(ret)} className="text-sm text-blue-600 hover:underline">Detail</button>
                      {ret.status === 'completed' && (
                        <button onClick={() => handleCancelReturn(ret)} className="text-sm text-red-600 hover:underline">Batalkan</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
                <span className="text-sm text-gray-600">
                  Total: {pagination.total} data
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                    disabled={pagination.page <= 1}
                    className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaChevronLeft size={12} />
                  </button>
                  <span className="text-sm">
                    {pagination.page} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                    disabled={pagination.page >= pagination.totalPages}
                    className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaChevronRight size={12} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Return Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Buat Retur Barang"
        size="4xl"
      >
        <div className="space-y-6">
          {/* Step 1: Select Order */}
          {!selectedOrder ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaShoppingBag className="inline mr-1" /> Cari & Pilih Order
              </label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Ketik nomor order atau nama customer..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                />
              </div>
              
              {searchingOrders && (
                <div className="mt-3 text-center text-gray-500 text-sm">Mencari...</div>
              )}
              
              {orderResults.length > 0 && (
                <div className="mt-3 border rounded-lg max-h-60 overflow-y-auto divide-y">
                  {orderResults.map((order) => (
                    <button
                      key={order.id}
                      onClick={() => handleSelectOrder(order)}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-800">{order.order_number}</p>
                          <p className="text-sm text-gray-500">{order.customer_name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{formatCurrency(order.total_amount)}</p>
                          <p className="text-xs text-gray-400">{formatDate(order.created_at)}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {orderSearch.length >= 2 && !searchingOrders && orderResults.length === 0 && (
                <p className="mt-3 text-center text-gray-400 text-sm">Tidak ada order ditemukan</p>
              )}
            </div>
          ) : (
            <>
              {/* Selected Order Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-blue-800">{selectedOrder.order_number}</p>
                    <p className="text-sm text-blue-600">{selectedOrder.customer_name} &middot; {formatCurrency(selectedOrder.total_amount)}</p>
                  </div>
                  <button
                    onClick={() => { setSelectedOrder(null); setOrderItems([]); setReturnItems([]); }}
                    className="text-blue-400 hover:text-blue-600"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>

              {/* Step 2: Select Warehouse */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaWarehouse className="inline mr-1" /> Gudang Tujuan Retur
                </label>
                <select
                  value={selectedWarehouse}
                  onChange={(e) => setSelectedWarehouse(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih Gudang</option>
                  {warehouses.map(wh => (
                    <option key={wh.id} value={wh.id}>{wh.name} ({wh.code})</option>
                  ))}
                </select>
              </div>

              {/* Step 3: Select Items */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item yang Diretur
                </label>
                {loadingItems ? (
                  <div className="text-center py-6 text-gray-500">Memuat item...</div>
                ) : returnItems.length === 0 ? (
                  <div className="text-center py-6 text-gray-400">Tidak ada item yang bisa diretur</div>
                ) : (
                  <div className="border rounded-lg divide-y">
                    {returnItems.map((item, idx) => (
                      <div key={idx} className={`p-4 ${item.selected ? 'bg-white' : 'bg-gray-50 opacity-60'}`}>
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={item.selected}
                            onChange={() => toggleItem(idx)}
                            className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                              <div>
                                <p className="font-medium text-gray-800 text-sm">{item.product_name}</p>
                                {item.size_name && (
                                  <p className="text-xs text-gray-500">Ukuran: {item.size_name}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-500">Qty:</label>
                                <input
                                  type="number"
                                  min="1"
                                  max={item.max_qty}
                                  value={item.quantity}
                                  onChange={(e) => updateItemQty(idx, e.target.value)}
                                  disabled={!item.selected}
                                  className="w-16 px-2 py-1 text-center border rounded text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                />
                                <span className="text-xs text-gray-400">/ {item.max_qty}</span>
                              </div>
                            </div>
                            {item.selected && (
                              <input
                                type="text"
                                placeholder="Alasan retur..."
                                value={item.reason}
                                onChange={(e) => updateItemReason(idx, e.target.value)}
                                className="mt-2 w-full px-3 py-1.5 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keterangan
                </label>
                <textarea
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Keterangan retur..."
                />
              </div>

              {/* Summary */}
              {returnItems.filter(i => i.selected && i.quantity > 0).length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-800 font-medium mb-1">
                    <FaCheckCircle />
                    <span>Ringkasan Retur</span>
                  </div>
                  <p className="text-sm text-green-700">
                    {returnItems.filter(i => i.selected && i.quantity > 0).length} item, 
                    total {returnItems.filter(i => i.selected).reduce((sum, i) => sum + (i.quantity || 0), 0)} pcs 
                    akan dikembalikan ke gudang
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !selectedWarehouse || returnItems.filter(i => i.selected && i.quantity > 0).length === 0}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Memproses...
                    </>
                  ) : (
                    <>
                      <FaUndo /> Proses Retur
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => { setShowDetailModal(false); setSelectedReturn(null); }}
        title="Detail Retur"
        size="2xl"
      >
        {loadingDetail ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : selectedReturn ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">No. Retur</p>
                <p className="font-medium">{selectedReturn.return_number}</p>
              </div>
              <div>
                <p className="text-gray-500">Status</p>
                <div>{getStatusBadge(selectedReturn.status)}</div>
              </div>
              <div>
                <p className="text-gray-500">Order</p>
                <p className="font-medium">{selectedReturn.order_number}</p>
              </div>
              <div>
                <p className="text-gray-500">Customer</p>
                <p className="font-medium">{selectedReturn.customer_name || '-'}</p>
              </div>
              <div>
                <p className="text-gray-500">Gudang Tujuan</p>
                <p className="font-medium">{selectedReturn.warehouse_name}</p>
              </div>
              <div>
                <p className="text-gray-500">Tanggal</p>
                <p className="font-medium">{formatDate(selectedReturn.created_at)}</p>
              </div>
              <div>
                <p className="text-gray-500">Dibuat Oleh</p>
                <p className="font-medium">{selectedReturn.created_by_name || '-'}</p>
              </div>
            </div>
            
            {selectedReturn.notes && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Keterangan</p>
                <p className="text-sm">{selectedReturn.notes}</p>
              </div>
            )}

            <div>
              <h3 className="font-medium text-gray-800 mb-2">Item Retur</h3>
              <div className="border rounded-lg divide-y">
                {(selectedReturn.items || []).map((item, idx) => (
                  <div key={idx} className="p-3 flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{item.product_name}</p>
                      {item.size_name && <p className="text-xs text-gray-500">Ukuran: {item.size_name}</p>}
                      {item.reason && <p className="text-xs text-gray-400 mt-1">Alasan: {item.reason}</p>}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{item.quantity} pcs</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default AdminReturns;
