import React, { useState, useRef } from 'react';
import api from '../../services/api';
import {
  FaFileExcel, FaDownload, FaUpload, FaSpinner, FaCheckCircle,
  FaTimesCircle, FaExclamationTriangle, FaFileImport,
  FaArrowUp, FaArrowDown, FaEquals
} from 'react-icons/fa';

const StockAdjustmentImport = () => {
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [importResult, setImportResult] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleDownloadTemplate = async () => {
    try {
      setDownloading(true);
      setError('');

      const response = await api.get('/inventory/adjustment-import/template', {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'template-stock-adjustment.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccess('Template berhasil didownload');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Gagal mendownload template');
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.match(/\.(xlsx|xls)$/i)) {
        setError('Hanya file Excel (.xlsx, .xls) yang diperbolehkan');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setError('');
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError('Pilih file terlebih dahulu');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      setImportResult(null);

      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await api.post('/inventory/adjustment-import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setImportResult(response.data.data);
        setSuccess(response.data.message);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        setError(response.data.message || 'Gagal melakukan import');
        if (response.data.data) setImportResult(response.data.data);
      }
    } catch (err) {
      console.error('Import error:', err);
      if (err.response?.data?.data) {
        setImportResult(err.response.data.data);
        setError(err.response.data.message);
      } else {
        setError(err.response?.data?.message || 'Gagal melakukan import');
      }
    } finally {
      setLoading(false);
    }
  };

  const typeLabel = (type) => {
    switch (type) {
      case 'in': return <span className="inline-flex items-center gap-1 text-green-700"><FaArrowUp size={10} /> Masuk</span>;
      case 'out': return <span className="inline-flex items-center gap-1 text-red-700"><FaArrowDown size={10} /> Keluar</span>;
      case 'set': return <span className="inline-flex items-center gap-1 text-blue-700"><FaEquals size={10} /> Set</span>;
      default: return type;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FaFileImport className="text-orange-600" />
              Import Stock Adjustment
            </h1>
            <p className="text-gray-600 mt-1">
              Adjustment stok massal melalui file Excel
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
              <FaExclamationTriangle />
              Panduan Import
            </h3>
            <ol className="list-decimal list-inside text-blue-700 space-y-2">
              <li>Download template Excel yang berisi daftar SKU variant aktif</li>
              <li>Isi data adjustment di sheet "Stock Adjustment"</li>
              <li>Pilih tipe: <strong>in</strong> (tambah stok), <strong>out</strong> (kurangi stok), atau <strong>set</strong> (set ke jumlah tertentu)</li>
              <li>Upload file dan review hasilnya</li>
            </ol>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm flex items-center gap-1">
                  <FaArrowUp className="text-green-600" />
                  <strong>in</strong> = Tambah stok (restok, barang masuk)
                </p>
              </div>
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm flex items-center gap-1">
                  <FaArrowDown className="text-red-600" />
                  <strong>out</strong> = Kurangi stok (rusak, hilang)
                </p>
              </div>
              <div className="p-3 bg-blue-100 border border-blue-300 rounded-lg">
                <p className="text-blue-800 text-sm flex items-center gap-1">
                  <FaEquals className="text-blue-600" />
                  <strong>set</strong> = Set ke jumlah (stock opname)
                </p>
              </div>
            </div>
          </div>

          {/* Download Template */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FaFileExcel className="text-green-600" />
              Download Template
            </h2>
            <p className="text-gray-600 mb-4">
              Template berisi seluruh SKU variant produk aktif beserta stok saat ini sebagai referensi.
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
              <li><strong>Sheet Stock Adjustment</strong> - Isi data adjustment di sini</li>
              <li><strong>Sheet Data Referensi</strong> - Daftar SKU variant & stok saat ini</li>
              <li><strong>Sheet Petunjuk</strong> - Panduan pengisian</li>
            </ul>
            <button onClick={handleDownloadTemplate} disabled={downloading}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
              {downloading ? <><FaSpinner className="animate-spin" /> Downloading...</> : <><FaDownload /> Download Template</>}
            </button>
          </div>

          {/* Upload File */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FaUpload className="text-blue-600" />
              Upload File
            </h2>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".xlsx,.xls" className="hidden" id="adj-file-upload" />
              <label htmlFor="adj-file-upload" className="cursor-pointer">
                <FaFileExcel className="text-5xl text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  {selectedFile ? (
                    <span className="text-green-600 font-medium">{selectedFile.name}</span>
                  ) : (
                    <>Drag & drop file atau <span className="text-blue-600">klik untuk memilih</span></>
                  )}
                </p>
                <p className="text-sm text-gray-400">Hanya file Excel (.xlsx, .xls)</p>
              </label>
            </div>

            {/* Alerts */}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <FaTimesCircle /> {error}
              </div>
            )}
            {success && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <FaCheckCircle /> {success}
              </div>
            )}

            <button onClick={handleImport} disabled={loading || !selectedFile}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? <><FaSpinner className="animate-spin" /> Processing...</> : <><FaUpload /> Import Adjustment</>}
            </button>
          </div>

          {/* Import Result */}
          {importResult && (
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-bold mb-4">Hasil Import</h2>

              {/* Summary Cards */}
              {importResult.summary && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                  <div className="bg-gray-50 border rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-gray-800">{importResult.summary.total_processed}</p>
                    <p className="text-xs text-gray-500">Total Berhasil</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <FaArrowUp className="text-green-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-green-600">{importResult.summary.total_stock_in}</p>
                    <p className="text-xs text-green-700">Stok Masuk</p>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <FaArrowDown className="text-red-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-red-600">{importResult.summary.total_stock_out}</p>
                    <p className="text-xs text-red-700">Stok Keluar</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <FaEquals className="text-blue-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-blue-600">{importResult.summary.total_stock_set}</p>
                    <p className="text-xs text-blue-700">Stok Opname</p>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <FaTimesCircle className="text-red-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-red-600">{importResult.summary.total_errors}</p>
                    <p className="text-xs text-red-700">Error</p>
                  </div>
                </div>
              )}

              {/* Success Table */}
              {importResult.success && importResult.success.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-green-700 mb-2">Adjustment Berhasil ({importResult.success.length})</h3>
                  <div className="bg-green-50 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-green-100 sticky top-0">
                        <tr>
                          <th className="text-left py-2 px-3">Baris</th>
                          <th className="text-left py-2 px-3">SKU Variant</th>
                          <th className="text-left py-2 px-3">Produk</th>
                          <th className="text-left py-2 px-3">Ukuran</th>
                          <th className="text-left py-2 px-3">Gudang</th>
                          <th className="text-center py-2 px-3">Tipe</th>
                          <th className="text-right py-2 px-3">Stok Lama</th>
                          <th className="text-right py-2 px-3">Stok Baru</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importResult.success.map((item, i) => (
                          <tr key={i} className="border-b border-green-100">
                            <td className="py-2 px-3 text-green-800">{item.row}</td>
                            <td className="py-2 px-3 font-mono text-green-800">{item.sku_variant}</td>
                            <td className="py-2 px-3 text-green-800">{item.product_name}</td>
                            <td className="py-2 px-3 text-green-800">{item.size_name}</td>
                            <td className="py-2 px-3 text-green-800">{item.warehouse_name}</td>
                            <td className="py-2 px-3 text-center">{typeLabel(item.type)}</td>
                            <td className="py-2 px-3 text-right text-gray-600">{item.stock_before}</td>
                            <td className="py-2 px-3 text-right font-bold text-green-700">{item.stock_after}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Errors Table */}
              {importResult.errors && importResult.errors.length > 0 && (
                <div>
                  <h3 className="font-semibold text-red-700 mb-2">Error ({importResult.errors.length})</h3>
                  <div className="bg-red-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-red-200">
                          <th className="text-left py-2 px-2">Baris</th>
                          <th className="text-left py-2 px-2">SKU Variant</th>
                          <th className="text-left py-2 px-2">Error</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importResult.errors.map((err, i) => (
                          <tr key={i} className="border-b border-red-100">
                            <td className="py-2 px-2 text-red-800">{err.row || '-'}</td>
                            <td className="py-2 px-2 text-red-800 font-mono">{err.sku_variant || '-'}</td>
                            <td className="py-2 px-2 text-red-600">{err.message}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockAdjustmentImport;
