import React, { useState, useEffect } from 'react';
import {
  FaChartBar, FaChartLine, FaChartPie, FaFileExcel,
  FaFilePdf, FaCalendarAlt, FaWarehouse, FaSpinner,
  FaShoppingCart, FaMoneyBillWave, FaBoxes, FaPercent,
  FaExclamationTriangle
} from 'react-icons/fa';
import api from '../../services/api';

export default function AdminReports() {
  const [activeTab, setActiveTab] = useState('sales');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [salesData, setSalesData] = useState({
    summary: {
      total_orders: 0,
      gross_sales: 0,
      net_sales: 0,
      total_hpp: 0,
      gross_profit: 0,
      margin_percentage: 0
    },
    daily: [],
    by_product: [],
    by_category: []
  });
  const [productData, setProductData] = useState({
    summary: {},
    products: []
  });
  const [inventoryData, setInventoryData] = useState({
    summary: {},
    by_warehouse: [],
    by_category: []
  });
  const [filters, setFilters] = useState({
    start_date: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    warehouse_id: '',
    category_id: ''
  });
  const [warehouses, setWarehouses] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchMasterData();
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [activeTab, filters]);

  const fetchMasterData = async () => {
    try {
      const [warehouseRes, categoryRes] = await Promise.all([
        api.get('/warehouses'),
        api.get('/categories')
      ]);
      if (warehouseRes.data.success) setWarehouses(warehouseRes.data.data);
      if (categoryRes.data.success) setCategories(categoryRes.data.data);
    } catch (error) {
      console.error('Error fetching master data:', error);
    }
  };

  const fetchReportData = async () => {
    setLoading(true);
    setError('');
    try {
      switch (activeTab) {
        case 'sales':
          const salesRes = await api.get('/reports/sales', { params: filters });
          if (salesRes.data.success) {
            setSalesData(salesRes.data.data);
          } else {
            setError('Gagal memuat laporan penjualan');
          }
          break;
        case 'products':
          const productRes = await api.get('/reports/products', { params: filters });
          if (productRes.data.success) {
            setProductData(productRes.data.data);
          } else {
            setError('Gagal memuat laporan produk');
          }
          break;
        case 'inventory':
          const invRes = await api.get('/reports/inventory', { params: filters });
          if (invRes.data.success) {
            setInventoryData(invRes.data.data);
          } else {
            setError('Gagal memuat laporan inventori');
          }
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
      setError(error.response?.data?.message || 'Gagal memuat laporan. Periksa koneksi internet Anda.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  const handleExportExcel = async () => {
    try {
      const params = { ...filters, format: 'excel' };
      const response = await api.get(`/reports/${activeTab}/export`, { 
        params, 
        responseType: 'blob' 
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `laporan-${activeTab}-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Gagal mengekspor ke Excel: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleExportPdf = async () => {
    try {
      const params = { ...filters, format: 'pdf' };
      const response = await api.get(`/reports/${activeTab}/export`, { 
        params, 
        responseType: 'blob' 
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `laporan-${activeTab}-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Gagal mengekspor ke PDF: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Laporan</h1>
          <p className="text-gray-600">Analisis penjualan, produk, dan inventori</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportExcel}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaFileExcel /> Export Excel
          </button>
          <button
            onClick={handleExportPdf}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaFilePdf /> Export PDF
          </button>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-700">Filter Cepat</h3>
          <button
            onClick={() => setFilters({
              start_date: new Date(new Date().setDate(1)).toISOString().split('T')[0],
              end_date: new Date().toISOString().split('T')[0],
              warehouse_id: '',
              category_id: ''
            })}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Reset Filter
          </button>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilters(prev => ({
              ...prev,
              start_date: new Date().toISOString().split('T')[0],
              end_date: new Date().toISOString().split('T')[0]
            }))}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
          >
            Hari Ini
          </button>
          <button
            onClick={() => setFilters(prev => ({
              ...prev,
              start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              end_date: new Date().toISOString().split('T')[0]
            }))}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
          >
            7 Hari Terakhir
          </button>
          <button
            onClick={() => setFilters(prev => ({
              ...prev,
              start_date: new Date(new Date().setDate(1)).toISOString().split('T')[0],
              end_date: new Date().toISOString().split('T')[0]
            }))}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
          >
            Bulan Ini
          </button>
          <button
            onClick={() => setFilters(prev => ({
              ...prev,
              start_date: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
              end_date: new Date().toISOString().split('T')[0]
            }))}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
          >
            Tahun Ini
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-red-800">
            <FaExclamationTriangle />
            <span className="font-medium">Error:</span>
            {error}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex gap-4 flex-wrap items-end">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Tanggal Mulai</label>
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Tanggal Akhir</label>
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {activeTab !== 'sales' && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Gudang</label>
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
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Kategori</label>
            <select
              value={filters.category_id}
              onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Kategori</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('sales')}
              className={`px-6 py-4 text-sm font-medium border-b-2 -mb-px ${
                activeTab === 'sales'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaChartLine className="inline mr-2" /> Laporan Penjualan
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-6 py-4 text-sm font-medium border-b-2 -mb-px ${
                activeTab === 'products'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaChartBar className="inline mr-2" /> Laporan Produk
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-6 py-4 text-sm font-medium border-b-2 -mb-px ${
                activeTab === 'inventory'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaChartPie className="inline mr-2" /> Laporan Inventori
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-10">
              <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
              <p className="text-gray-500">Memuat laporan...</p>
            </div>
          ) : (
            <>
              {/* Sales Report */}
              {activeTab === 'sales' && (
                <div>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FaShoppingCart className="text-blue-600" />
                        <span className="text-sm text-blue-800">Total Order</span>
                      </div>
                      <p className="text-xl font-bold text-blue-900">
                        {salesData.summary?.total_orders || 0}
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FaMoneyBillWave className="text-green-600" />
                        <span className="text-sm text-green-800">Penjualan Kotor</span>
                      </div>
                      <p className="text-lg font-bold text-green-900">
                        {formatCurrency(salesData.summary?.gross_sales)}
                      </p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FaMoneyBillWave className="text-purple-600" />
                        <span className="text-sm text-purple-800">Penjualan Bersih</span>
                      </div>
                      <p className="text-lg font-bold text-purple-900">
                        {formatCurrency(salesData.summary?.net_sales)}
                      </p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FaBoxes className="text-orange-600" />
                        <span className="text-sm text-orange-800">Total HPP</span>
                      </div>
                      <p className="text-lg font-bold text-orange-900">
                        {formatCurrency(salesData.summary?.total_hpp)}
                      </p>
                    </div>
                    <div className="bg-teal-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FaChartLine className="text-teal-600" />
                        <span className="text-sm text-teal-800">Laba Kotor</span>
                      </div>
                      <p className="text-lg font-bold text-teal-900">
                        {formatCurrency(salesData.summary?.gross_profit)}
                      </p>
                    </div>
                    <div className="bg-pink-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FaPercent className="text-pink-600" />
                        <span className="text-sm text-pink-800">Margin</span>
                      </div>
                      <p className="text-lg font-bold text-pink-900">
                        {(salesData.summary?.margin_percentage || 0).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* Daily Sales Table */}
                  <div className="mb-6">
                    <h3 className="font-bold text-lg mb-4">Penjualan Harian</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Orders</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Penjualan</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">HPP</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Laba</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {(salesData.daily || []).length === 0 ? (
                            <tr>
                              <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                                <FaChartLine className="mx-auto text-4xl text-gray-300 mb-2" />
                                <p>Tidak ada data penjualan harian untuk periode ini</p>
                              </td>
                            </tr>
                          ) : (
                            (salesData.daily || []).map((day, idx) => (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium">
                                  {new Date(day.date).toLocaleDateString('id-ID', {
                                    weekday: 'short',
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                    {day.orders}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right font-medium">{formatCurrency(day.sales)}</td>
                                <td className="px-4 py-3 text-right text-orange-600">{formatCurrency(day.hpp)}</td>
                                <td className="px-4 py-3 text-right font-bold text-green-600">
                                  {formatCurrency(day.profit)}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Sales by Category */}
                  <div>
                    <h3 className="font-bold text-lg mb-4">Penjualan per Kategori</h3>
                    {(salesData.by_category || []).length === 0 ? (
                      <div className="bg-gray-50 rounded-lg p-8 text-center">
                        <FaChartPie className="mx-auto text-4xl text-gray-300 mb-2" />
                        <p className="text-gray-500">Tidak ada data penjualan per kategori untuk periode ini</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {(salesData.by_category || []).map((cat, idx) => (
                          <div key={idx} className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                            <h4 className="font-medium text-gray-800">{cat.category_name}</h4>
                            <p className="text-lg font-bold mt-2 text-blue-600">{formatCurrency(cat.sales)}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              <FaBoxes className="inline mr-1" />
                              {cat.qty_sold} pcs terjual
                            </p>
                            <div className="mt-2 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full" 
                                style={{
                                  width: `${Math.min(100, (cat.sales / (salesData.summary?.gross_sales || 1)) * 100)}%`
                                }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Products Report */}
              {activeTab === 'products' && (
                <div>
                  <h3 className="font-bold text-lg mb-4">Performa Produk</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Terjual</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Pendapatan</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">HPP</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Laba</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Margin</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {(productData.products || []).map((prod, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="font-medium">{prod.product_name}</div>
                              <div className="text-xs text-gray-500">{prod.sku}</div>
                            </td>
                            <td className="px-4 py-3 text-center">{prod.qty_sold}</td>
                            <td className="px-4 py-3 text-right">{formatCurrency(prod.revenue)}</td>
                            <td className="px-4 py-3 text-right">{formatCurrency(prod.hpp)}</td>
                            <td className="px-4 py-3 text-right font-medium text-green-600">
                              {formatCurrency(prod.profit)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                prod.margin >= 30 ? 'bg-green-100 text-green-800' :
                                prod.margin >= 15 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {(prod.margin || 0).toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Inventory Report */}
              {activeTab === 'inventory' && (
                <div>
                  {/* Inventory by Warehouse */}
                  <div className="mb-6">
                    <h3 className="font-bold text-lg mb-4">Nilai Inventori per Gudang</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {(inventoryData.by_warehouse || []).map((wh, idx) => (
                        <div key={idx} className="bg-white border rounded-lg p-4 shadow-sm">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <FaWarehouse className="text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-medium">{wh.warehouse_name}</h4>
                              <p className="text-xs text-gray-500">{wh.total_items} item</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Total Stok</span>
                              <span className="font-medium">{wh.total_stock} pcs</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Nilai Inventori</span>
                              <span className="font-bold text-blue-600">{formatCurrency(wh.total_value)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Inventory by Category */}
                  <div>
                    <h3 className="font-bold text-lg mb-4">Nilai Inventori per Kategori</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Jumlah Produk</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total Stok</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Nilai Inventori</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">% dari Total</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {(inventoryData.by_category || []).map((cat, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-4 py-3 font-medium">{cat.category_name}</td>
                              <td className="px-4 py-3 text-center">{cat.product_count}</td>
                              <td className="px-4 py-3 text-center">{cat.total_stock}</td>
                              <td className="px-4 py-3 text-right font-medium">{formatCurrency(cat.total_value)}</td>
                              <td className="px-4 py-3 text-right">
                                <span className="text-blue-600">{(cat.percentage || 0).toFixed(1)}%</span>
                              </td>
                            </tr>
                          ))}
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
    </div>
  );
}
