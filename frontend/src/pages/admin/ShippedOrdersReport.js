import React, { useState, useEffect, useCallback } from 'react';
import {
  FaTruck, FaFileExcel, FaCalendarAlt, FaFilter, FaSpinner,
  FaMoneyBillWave, FaSearch, FaCheckCircle, FaShippingFast,
  FaChevronLeft, FaChevronRight, FaEye, FaTimes, FaBoxOpen
} from 'react-icons/fa';
import api from '../../services/api';

const statusLabels = {
  shipped: { label: 'Dikirim', color: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Diterima', color: 'bg-green-100 text-green-800' },
};

export default function ShippedOrdersReport() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ summary: {}, orders: [], daily: [], by_courier: [], pagination: {} });
  const [filters, setFilters] = useState({
    start_date: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    status: '',
    courier: '',
    warehouse_id: '',
    search: '',
    page: 1,
    limit: 25
  });
  const [warehouses, setWarehouses] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [detailOrder, setDetailOrder] = useState(null);
  const [detailItems, setDetailItems] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    api.get('/warehouses').then(res => {
      if (res.data.success) setWarehouses(res.data.data);
    }).catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== '' && v !== null)
      );
      const res = await api.get('/reports/orders-shipped', { params });
      if (res.data.success) setData(res.data.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleExport = async () => {
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([k, v]) => v !== '' && v !== null && k !== 'page' && k !== 'limit')
      );
      const res = await api.get('/reports/orders-shipped/export', { params, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `orderan-terkirim-${filters.start_date}-${filters.end_date}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Gagal export: ' + (err.response?.data?.message || err.message));
    }
  };

  const showDetail = async (order) => {
    setDetailOrder(order);
    setLoadingDetail(true);
    try {
      const res = await api.get(`/orders/${order.id}`);
      if (res.data.success) {
        setDetailItems(res.data.data.items || []);
      }
    } catch {
      setDetailItems([]);
    } finally {
      setLoadingDetail(false);
    }
  };

  const formatCurrency = (v) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v || 0);
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
  const { summary, orders, daily, by_courier, pagination } = data;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaTruck className="text-purple-600" /> Laporan Orderan Terkirim
          </h1>
          <p className="text-gray-500 text-sm mt-1">Pesanan yang sudah dikirim dan diterima customer</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 text-sm">
            <FaFilter /> Filter
          </button>
          <button onClick={handleExport} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm">
            <FaFileExcel /> Export Excel
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Dari Tanggal</label>
              <input type="date" value={filters.start_date} onChange={e => setFilters(p => ({ ...p, start_date: e.target.value, page: 1 }))}
                className="w-full px-2 py-1.5 border rounded text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Sampai Tanggal</label>
              <input type="date" value={filters.end_date} onChange={e => setFilters(p => ({ ...p, end_date: e.target.value, page: 1 }))}
                className="w-full px-2 py-1.5 border rounded text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value, page: 1 }))}
                className="w-full px-2 py-1.5 border rounded text-sm">
                <option value="">Semua (Dikirim & Diterima)</option>
                <option value="shipped">Dikirim</option>
                <option value="delivered">Diterima</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Kurir</label>
              <select value={filters.courier} onChange={e => setFilters(p => ({ ...p, courier: e.target.value, page: 1 }))}
                className="w-full px-2 py-1.5 border rounded text-sm">
                <option value="">Semua</option>
                <option value="J&T">J&T</option>
                <option value="JNE">JNE</option>
                <option value="SiCepat">SiCepat</option>
                <option value="AnterAja">AnterAja</option>
                <option value="Pos Indonesia">Pos Indonesia</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Gudang</label>
              <select value={filters.warehouse_id} onChange={e => setFilters(p => ({ ...p, warehouse_id: e.target.value, page: 1 }))}
                className="w-full px-2 py-1.5 border rounded text-sm">
                <option value="">Semua</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-3">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
              <input type="text" placeholder="Cari no order, nama customer, no resi..."
                value={filters.search} onChange={e => setFilters(p => ({ ...p, search: e.target.value, page: 1 }))}
                className="w-full pl-8 pr-3 py-1.5 border rounded text-sm" />
            </div>
            <button onClick={() => setFilters(p => ({ ...p, status: '', courier: '', warehouse_id: '', search: '', page: 1 }))}
              className="text-sm text-blue-600 hover:text-blue-800 whitespace-nowrap">
              Reset Filter
            </button>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2 mb-1">
            <FaBoxOpen className="text-purple-500" size={14} />
            <span className="text-xs text-gray-500">Total Pengiriman</span>
          </div>
          <p className="text-xl font-bold text-gray-800">{summary.total_orders || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2 mb-1">
            <FaShippingFast className="text-blue-500" size={14} />
            <span className="text-xs text-gray-500">Dalam Pengiriman</span>
          </div>
          <p className="text-xl font-bold text-purple-600">{summary.shipped_count || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2 mb-1">
            <FaCheckCircle className="text-green-500" size={14} />
            <span className="text-xs text-gray-500">Sudah Diterima</span>
          </div>
          <p className="text-xl font-bold text-green-600">{summary.delivered_count || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2 mb-1">
            <FaMoneyBillWave className="text-green-500" size={14} />
            <span className="text-xs text-gray-500">Total Ongkir</span>
          </div>
          <p className="text-lg font-bold text-gray-800">{formatCurrency(summary.total_shipping)}</p>
        </div>
      </div>

      {/* Courier Breakdown */}
      {by_courier && by_courier.length > 0 && (
        <div className="bg-white rounded-lg shadow mb-6 overflow-hidden">
          <div className="px-4 py-3 border-b">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2">
              <FaTruck className="text-gray-400" size={14} /> Per Kurir
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4">
            {by_courier.map((c, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-3">
                <div className="font-semibold text-sm text-gray-800">{c.courier_name}</div>
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>{c.total} order</span>
                  <span className="text-green-600">{c.delivered} diterima</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">Ongkir: {formatCurrency(c.shipping_cost)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h3 className="font-semibold text-gray-700">Daftar Pengiriman</h3>
          <span className="text-xs text-gray-500">{pagination.total || 0} pesanan</span>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <FaSpinner className="animate-spin text-purple-500 text-2xl" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <FaTruck className="mx-auto text-4xl mb-2" />
            <p>Tidak ada pengiriman ditemukan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">No Order</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer / Penerima</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Kurir & Resi</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tujuan</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tgl Kirim</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tgl Terima</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map(order => {
                  const s = statusLabels[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-800' };
                  const tracking = order.os_tracking || order.tracking_number;
                  const courier = order.os_courier || order.courier;
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-sm font-medium text-blue-600">{order.order_number}</td>
                      <td className="px-3 py-2">
                        <div className="text-sm font-medium text-gray-800">{order.customer_name}</div>
                        {order.recipient_name && order.recipient_name !== order.customer_name && (
                          <div className="text-xs text-gray-500">→ {order.recipient_name}</div>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>{s.label}</span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-sm font-medium">{courier || '-'}</div>
                        {tracking && <div className="text-xs text-blue-600 font-mono">{tracking}</div>}
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-sm">{order.shipping_city || '-'}</div>
                        {order.shipping_province && <div className="text-xs text-gray-500">{order.shipping_province}</div>}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-600">{formatDate(order.shipped_at)}</td>
                      <td className="px-3 py-2 text-sm">
                        {order.delivered_at ? (
                          <span className="text-green-600">{formatDate(order.delivered_at)}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right text-sm font-semibold">{formatCurrency(order.total_amount)}</td>
                      <td className="px-3 py-2 text-center">
                        <button onClick={() => showDetail(order)} className="text-blue-500 hover:text-blue-700" title="Detail">
                          <FaEye size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-4 py-3 border-t flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Halaman {pagination.page} dari {pagination.pages}
            </span>
            <div className="flex gap-1">
              <button disabled={pagination.page <= 1} onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))}
                className="px-2 py-1 border rounded text-sm disabled:opacity-40 hover:bg-gray-50">
                <FaChevronLeft size={12} />
              </button>
              <button disabled={pagination.page >= pagination.pages} onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))}
                className="px-2 py-1 border rounded text-sm disabled:opacity-40 hover:bg-gray-50">
                <FaChevronRight size={12} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Daily Breakdown */}
      {daily.length > 0 && (
        <div className="bg-white rounded-lg shadow mt-6 overflow-hidden">
          <div className="px-4 py-3 border-b">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2">
              <FaCalendarAlt className="text-gray-400" /> Breakdown Harian
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Total Kirim</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Diterima</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {daily.map((d, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm font-medium">
                      {new Date(d.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span className="inline-flex px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">{d.orders}</span>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span className="inline-flex px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">{d.delivered}</span>
                    </td>
                    <td className="px-4 py-2 text-right text-sm font-semibold">{formatCurrency(d.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="font-bold text-lg">Detail Pengiriman {detailOrder.order_number}</h3>
              <button onClick={() => setDetailOrder(null)} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-500">Customer:</span> <span className="font-medium">{detailOrder.customer_name}</span></div>
                <div><span className="text-gray-500">Penerima:</span> <span className="font-medium">{detailOrder.recipient_name || detailOrder.customer_name}</span></div>
                <div><span className="text-gray-500">Status:</span> <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusLabels[detailOrder.status]?.color || 'bg-gray-100'}`}>{statusLabels[detailOrder.status]?.label || detailOrder.status}</span></div>
                <div><span className="text-gray-500">Kurir:</span> <span className="font-medium">{detailOrder.os_courier || detailOrder.courier || '-'}</span></div>
                <div><span className="text-gray-500">No Resi:</span> <span className="font-medium font-mono text-blue-600">{detailOrder.os_tracking || detailOrder.tracking_number || '-'}</span></div>
                <div><span className="text-gray-500">Gudang:</span> <span className="font-medium">{detailOrder.warehouse_name || '-'}</span></div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
                <div className="font-medium text-gray-700">Alamat Pengiriman</div>
                <div>{detailOrder.shipping_address}</div>
                <div>{detailOrder.shipping_city}{detailOrder.shipping_province ? `, ${detailOrder.shipping_province}` : ''}</div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm bg-blue-50 rounded-lg p-3">
                <div>
                  <span className="text-gray-500">Tgl Kirim:</span>
                  <div className="font-medium">{formatDate(detailOrder.shipped_at)}</div>
                </div>
                <div>
                  <span className="text-gray-500">Tgl Terima:</span>
                  <div className="font-medium">{detailOrder.delivered_at ? formatDate(detailOrder.delivered_at) : <span className="text-gray-400">Belum diterima</span>}</div>
                </div>
              </div>
              <div className="border-t pt-3">
                <h4 className="font-semibold text-sm mb-2">Item Pesanan</h4>
                {loadingDetail ? (
                  <div className="text-center py-4"><FaSpinner className="animate-spin text-purple-500 mx-auto" /></div>
                ) : detailItems.length > 0 ? (
                  <div className="space-y-2">
                    {detailItems.map((item, i) => (
                      <div key={i} className="flex justify-between items-center bg-gray-50 rounded p-2 text-sm">
                        <div>
                          <span className="font-medium">{item.product_name}</span>
                          <span className="text-gray-500 ml-1">({item.size_name})</span>
                          <span className="text-gray-400 ml-1">x{item.quantity}</span>
                        </div>
                        <span className="font-semibold">{formatCurrency(item.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-gray-400 text-sm">Tidak ada item</p>}
              </div>
              <div className="border-t pt-3 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Ongkir</span><span>{formatCurrency(detailOrder.shipping_cost)}</span></div>
                <div className="flex justify-between font-bold text-base border-t pt-1"><span>Total</span><span>{formatCurrency(detailOrder.total_amount)}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
