import React, { useState, useEffect } from 'react';
import { 
  FaChartLine, FaChartBar, FaBoxes, FaFileExcel, FaFilePdf, 
  FaCalendarAlt, FaFilter, FaDownload, FaSpinner
} from 'react-icons/fa';
import api from '../../services/api';

const Reports = () => {
  const [activeReport, setActiveReport] = useState('sales');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    start_date: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    warehouse_id: '',
    category_id: ''
  });

  useEffect(() => {
    fetchMasterData();
  }, []);

  useEffect(() => {
    fetchReport();
  }, [activeReport, filters]);

  const fetchMasterData = async () => {
    try {
      const [warehousesRes, categoriesRes] = await Promise.all([
        api.get('/warehouses'),
        api.get('/categories')
      ]);
      if (warehousesRes.data.success) setWarehouses(warehousesRes.data.data);
      if (categoriesRes.data.success) setCategories(categoriesRes.data.data);
    } catch (error) {
      console.error('Error fetching master data:', error);
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      switch (activeReport) {
        case 'sales':
          endpoint = '/reports/sales';
          break;
        case 'products':
          endpoint = '/reports/products';
          break;
        case 'inventory':
          endpoint = '/reports/inventory';
          break;
        default:
          endpoint = '/reports/sales';
      }

      const response = await api.get(endpoint, { params: filters });
      if (response.data.success) {
        setReportData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    setExporting(true);
    try {
      let endpoint = '';
      switch (activeReport) {
        case 'sales':
          endpoint = '/reports/sales/export';
          break;
        case 'inventory':
          endpoint = '/reports/inventory/export';
          break;
        default:
          endpoint = '/reports/sales/export';
      }

      const response = await api.get(endpoint, {
        params: filters,
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${activeReport}-report-${filters.start_date}-${filters.end_date}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Gagal mengexport laporan');
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('id-ID').format(value || 0);
  };

  const reportTypes = [
    { id: 'sales', label: 'Laporan Penjualan', icon: FaChartLine },
    { id: 'products', label: 'Performa Produk', icon: FaChartBar },
    { id: 'inventory', label: 'Laporan Inventori', icon: FaBoxes }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Laporan</h1>
          <p className="text-gray-600">Analisis penjualan, produk, dan inventori</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('excel')}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {exporting ? <FaSpinner className="animate-spin" /> : <FaFileExcel />}
            Export Excel
          </button>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="flex border-b overflow-x-auto">
          {reportTypes.map(report => {
            const Icon = report.icon;
            return (
              <button
                key={report.id}
                onClick={() => setActiveReport(report.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap ${
                  activeReport === report.id
                    ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon />
                {report.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FaCalendarAlt className="inline mr-1" /> Tanggal Mulai
            </label>
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FaCalendarAlt className="inline mr-1" /> Tanggal Akhir
            </label>
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {(activeReport === 'inventory' || activeReport === 'sales') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gudang</label>
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
          {(activeReport === 'products' || activeReport === 'inventory') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
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
          )}
          <button
            onClick={fetchReport}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FaFilter /> Terapkan Filter
          </button>
        </div>
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-10 text-center">
            <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
            <p className="text-gray-500">Memuat laporan...</p>
          </div>
        ) : (
          <>
            {/* Sales Report */}
            {activeReport === 'sales' && reportData && (
              <div>
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 border-b">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Pesanan</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatNumber(reportData.summary?.total_orders)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Gross Sales</p>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(reportData.summary?.total_gross_sales)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600">Net Sales</p>
                    <p className="text-xl font-bold text-purple-600">
                      {formatCurrency(reportData.summary?.total_net_sales)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total HPP</p>
                    <p className="text-xl font-bold text-orange-600">
                      {formatCurrency(reportData.summary?.total_cost)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-emerald-50 rounded-lg">
                    <p className="text-sm text-gray-600">Profit</p>
                    <p className="text-xl font-bold text-emerald-600">
                      {formatCurrency(reportData.summary?.total_profit)}
                    </p>
                    <p className="text-sm text-emerald-500">
                      Margin: {reportData.summary?.avg_profit_margin || 0}%
                    </p>
                  </div>
                </div>

                {/* Daily Sales Table */}
                <div className="p-4">
                  <h3 className="text-lg font-bold mb-4">Penjualan Harian</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Pesanan</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Item</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gross Sales</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Diskon</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net Sales</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">HPP</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Profit</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Margin</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {(reportData.daily_sales || []).map((row, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium">
                              {new Date(row.date).toLocaleDateString('id-ID')}
                            </td>
                            <td className="px-4 py-3 text-center">{row.total_orders}</td>
                            <td className="px-4 py-3 text-center">{row.items_sold}</td>
                            <td className="px-4 py-3 text-right">{formatCurrency(row.gross_sales)}</td>
                            <td className="px-4 py-3 text-right text-red-600">{formatCurrency(row.total_discounts)}</td>
                            <td className="px-4 py-3 text-right font-medium">{formatCurrency(row.net_sales)}</td>
                            <td className="px-4 py-3 text-right text-orange-600">{formatCurrency(row.total_cost)}</td>
                            <td className="px-4 py-3 text-right font-medium text-green-600">{formatCurrency(row.gross_profit)}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                row.profit_margin >= 30 ? 'bg-green-100 text-green-800' :
                                row.profit_margin >= 15 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {row.profit_margin || 0}%
                              </span>
                            </td>
                          </tr>
                        ))}
                        {(reportData.daily_sales || []).length === 0 && (
                          <tr>
                            <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                              Tidak ada data penjualan untuk periode ini
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Products Report */}
            {activeReport === 'products' && (
              <div className="p-4">
                <h3 className="text-lg font-bold mb-4">Performa Produk</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Terjual</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">HPP</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Profit</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Margin</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Stok</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(reportData || []).map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                          <td className="px-4 py-3">
                            <div className="font-medium">{row.product_name}</div>
                            <div className="text-sm text-gray-500">{row.sku_code}</div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{row.category_name || '-'}</td>
                          <td className="px-4 py-3 text-center font-medium">{row.units_sold}</td>
                          <td className="px-4 py-3 text-right">{formatCurrency(row.revenue)}</td>
                          <td className="px-4 py-3 text-right text-orange-600">{formatCurrency(row.cost)}</td>
                          <td className="px-4 py-3 text-right font-medium text-green-600">{formatCurrency(row.profit)}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              row.profit_margin >= 30 ? 'bg-green-100 text-green-800' :
                              row.profit_margin >= 15 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {row.profit_margin || 0}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">{row.current_stock || 0}</td>
                        </tr>
                      ))}
                      {(reportData || []).length === 0 && (
                        <tr>
                          <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                            Tidak ada data produk untuk periode ini
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Inventory Report */}
            {activeReport === 'inventory' && reportData && (
              <div>
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border-b">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Item</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatNumber(reportData.summary?.total_items)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Qty</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatNumber(reportData.summary?.total_quantity)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600">Nilai Inventori</p>
                    <p className="text-xl font-bold text-purple-600">
                      {formatCurrency(reportData.summary?.total_value)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <p className="text-sm text-gray-600">Stok Rendah</p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatNumber(reportData.summary?.low_stock)}
                    </p>
                  </div>
                </div>

                {/* Inventory Table */}
                <div className="p-4">
                  <h3 className="text-lg font-bold mb-4">Detail Inventori</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Varian</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gudang</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Qty</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Min</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">HPP</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Nilai</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {(reportData.inventory || []).map((row, idx) => (
                          <tr key={idx} className={`hover:bg-gray-50 ${row.stock_status === 'Out of Stock' ? 'bg-red-50' : row.stock_status === 'Low Stock' ? 'bg-yellow-50' : ''}`}>
                            <td className="px-4 py-3">
                              <div className="font-medium">{row.product_name}</div>
                              <div className="text-sm text-gray-500">{row.sku_code}</div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{row.category_name || '-'}</td>
                            <td className="px-4 py-3 text-sm">
                              {row.fitting_name} / {row.size_name}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{row.warehouse_name}</td>
                            <td className="px-4 py-3 text-center font-medium">{row.quantity}</td>
                            <td className="px-4 py-3 text-center text-sm text-gray-500">{row.min_stock_level}</td>
                            <td className="px-4 py-3 text-right text-sm">{formatCurrency(row.avg_cost_price)}</td>
                            <td className="px-4 py-3 text-right font-medium">{formatCurrency(row.inventory_value)}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                row.stock_status === 'In Stock' ? 'bg-green-100 text-green-800' :
                                row.stock_status === 'Low Stock' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {row.stock_status === 'In Stock' ? 'Tersedia' : 
                                 row.stock_status === 'Low Stock' ? 'Rendah' : 'Habis'}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {(reportData.inventory || []).length === 0 && (
                          <tr>
                            <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                              Tidak ada data inventori
                            </td>
                          </tr>
                        )}
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
  );
};

export default Reports;
