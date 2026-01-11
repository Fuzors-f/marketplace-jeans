import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import apiClient from '../../services/api';
import { 
  FaChartLine, FaDownload, FaCalendarAlt, FaFilter, FaSpinner,
  FaShoppingCart, FaUsers, FaMoneyBillWave, FaPercent, FaBox
} from 'react-icons/fa';
import { useLanguage } from '../../utils/i18n';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

const SalesReport = () => {
  const { formatCurrency, formatDate } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [salesData, setSalesData] = useState({ daily_sales: [], summary: {} });
  const [productData, setProductData] = useState([]);
  
  // Filters
  const [filters, setFilters] = useState({
    start_date: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    warehouse_id: ''
  });
  
  // Warehouses
  const [warehouses, setWarehouses] = useState([]);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => {
    fetchData();
  }, [filters]);

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

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(
        Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      );

      const [salesRes, productRes] = await Promise.all([
        apiClient.get(`/reports/sales?${params}`),
        apiClient.get(`/reports/products?${params}&limit=10`)
      ]);

      if (salesRes.data.success) {
        setSalesData(salesRes.data.data);
      }
      if (productRes.data.success) {
        setProductData(productRes.data.data);
      }
    } catch (err) {
      setError('Gagal memuat data laporan');
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
      
      const response = await apiClient.get(`/reports/sales/export?${params}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sales-report-${filters.start_date}-${filters.end_date}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Gagal mengexport data');
    }
  };

  const chartData = salesData.daily_sales?.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }),
    net_sales: parseFloat(item.net_sales) || 0,
    gross_profit: parseFloat(item.gross_profit) || 0
  })).reverse() || [];

  return (
    <>
      <Helmet>
        <title>Laporan Penjualan - Admin</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <FaChartLine className="text-green-600" />
                  Laporan Penjualan
                </h1>
                <p className="text-gray-600 mt-1">
                  Analisis penjualan dan profit
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
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sampai Tanggal</label>
              <input
                type="date"
                value={filters.end_date}
                onChange={(e) => setFilters(prev => ({ ...prev, end_date: e.target.value }))}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Gudang</label>
              <select
                value={filters.warehouse_id}
                onChange={(e) => setFilters(prev => ({ ...prev, warehouse_id: e.target.value }))}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Semua Gudang</option>
                {warehouses.map(wh => (
                  <option key={wh.id} value={wh.id}>{wh.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <FaSpinner className="animate-spin text-3xl mx-auto text-gray-400" />
            <p className="text-gray-500 mt-2">Memuat data...</p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white rounded-xl shadow p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FaShoppingCart className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Pesanan</p>
                    <p className="text-xl font-bold">{salesData.summary?.total_orders?.toLocaleString() || 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <FaMoneyBillWave className="text-green-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Penjualan</p>
                    <p className="text-xl font-bold">{formatCurrency(salesData.summary?.total_net_sales || 0)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FaPercent className="text-purple-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Profit</p>
                    <p className="text-xl font-bold">{formatCurrency(salesData.summary?.total_profit || 0)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <FaBox className="text-orange-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Item Terjual</p>
                    <p className="text-xl font-bold">{salesData.summary?.total_items_sold?.toLocaleString() || 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                    <FaUsers className="text-cyan-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Customer Unik</p>
                    <p className="text-xl font-bold">{salesData.summary?.unique_customers?.toLocaleString() || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sales Chart */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-bold mb-4">Grafik Penjualan Harian</h2>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}jt`} />
                    <Tooltip 
                      formatter={(value) => formatCurrency(value)}
                      labelFormatter={(label) => `Tanggal: ${label}`}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="net_sales" name="Penjualan" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="gross_profit" name="Profit" stroke="#8b5cf6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-500 py-8">Tidak ada data untuk ditampilkan</p>
              )}
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-bold mb-4">Produk Terlaris</h2>
              {productData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">#</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Produk</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold">Qty Terjual</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold">Revenue</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold">Profit</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold">Margin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {productData.map((product, index) => (
                        <tr key={product.product_id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{index + 1}</td>
                          <td className="px-4 py-3">
                            <div className="font-medium">{product.product_name}</div>
                            <div className="text-xs text-gray-500">{product.sku_code}</div>
                          </td>
                          <td className="px-4 py-3 text-right">{product.units_sold?.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right">{formatCurrency(product.revenue)}</td>
                          <td className="px-4 py-3 text-right text-green-600">{formatCurrency(product.profit)}</td>
                          <td className="px-4 py-3 text-right">
                            <span className={`px-2 py-1 rounded text-xs ${
                              parseFloat(product.profit_margin) > 30 ? 'bg-green-100 text-green-800' :
                              parseFloat(product.profit_margin) > 15 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {parseFloat(product.profit_margin || 0).toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">Tidak ada data produk</p>
              )}
            </div>

            {/* Daily Sales Table */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-bold mb-4">Detail Penjualan Harian</h2>
              {salesData.daily_sales?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Tanggal</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold">Pesanan</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold">Items</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold">Gross Sales</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold">Diskon</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold">Net Sales</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold">Profit</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold">Margin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {salesData.daily_sales.map((day) => (
                        <tr key={day.date} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{formatDate(day.date)}</td>
                          <td className="px-4 py-3 text-right">{day.total_orders}</td>
                          <td className="px-4 py-3 text-right">{day.items_sold}</td>
                          <td className="px-4 py-3 text-right">{formatCurrency(day.gross_sales)}</td>
                          <td className="px-4 py-3 text-right text-red-600">-{formatCurrency(day.total_discounts)}</td>
                          <td className="px-4 py-3 text-right font-medium">{formatCurrency(day.net_sales)}</td>
                          <td className="px-4 py-3 text-right text-green-600">{formatCurrency(day.gross_profit)}</td>
                          <td className="px-4 py-3 text-right">{parseFloat(day.profit_margin || 0).toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">Tidak ada data penjualan</p>
              )}
            </div>
          </>
        )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SalesReport;
