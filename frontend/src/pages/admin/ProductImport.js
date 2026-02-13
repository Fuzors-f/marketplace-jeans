import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import apiClient from '../../services/api';
import { 
  FaFileExcel, FaDownload, FaUpload, FaSpinner, FaCheckCircle,
  FaTimesCircle, FaExclamationTriangle, FaFileImport, FaBox
} from 'react-icons/fa';

const ProductImport = () => {
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
      
      const response = await apiClient.get('/products/import/template', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'product-import-template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
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

      const response = await apiClient.post('/products/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setImportResult(response.data.data);
        setSuccess('Import berhasil!');
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setError(response.data.message || 'Gagal melakukan import');
        if (response.data.errors) {
          setImportResult({ errors: response.data.errors });
        }
      }
    } catch (err) {
      console.error('Import error:', err);
      if (err.response?.data?.errors) {
        setImportResult({ errors: err.response.data.errors });
        setError(`Import gagal dengan ${err.response.data.errors.length} error`);
      } else {
        setError(err.response?.data?.message || 'Gagal melakukan import');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Import Produk - Admin</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <FaFileImport className="text-green-600" />
                Import Produk
              </h1>
              <p className="text-gray-600 mt-1">
                Import data produk dari file Excel
              </p>
            </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <FaExclamationTriangle />
            Panduan Import
          </h3>
          <ol className="list-decimal list-inside text-blue-700 space-y-2">
            <li>Download template Excel terlebih dahulu</li>
            <li>Isi data produk sesuai format pada template</li>
            <li>Upload file Excel yang sudah diisi</li>
            <li>Review hasil import</li>
          </ol>
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm">
              <strong>Fitur Auto-Create:</strong> Jika kategori, fitting, ukuran, atau gudang yang Anda gunakan belum ada di sistem, 
              maka akan otomatis dibuat saat import.
            </p>
          </div>
        </div>

        {/* Download Template */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FaFileExcel className="text-green-600" />
            Download Template
          </h2>
          <p className="text-gray-600 mb-4">
            Download template Excel untuk mengisi data produk. Template berisi:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
            <li><strong>Sheet Produk</strong> - Data utama produk (nama, SKU, harga, dll)</li>
            <li><strong>Sheet Varian</strong> - Data varian produk (warna, ukuran, stok)</li>
            <li><strong>Sheet Referensi</strong> - Daftar kategori, ukuran, dan gudang yang tersedia</li>
            <li><strong>Sheet Instruksi</strong> - Panduan pengisian data</li>
          </ul>
          <button
            onClick={handleDownloadTemplate}
            disabled={downloading}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {downloading ? (
              <>
                <FaSpinner className="animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <FaDownload />
                Download Template
              </>
            )}
          </button>
        </div>

        {/* Upload File */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FaUpload className="text-blue-600" />
            Upload File
          </h2>
          
          {/* File Input */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".xlsx,.xls"
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
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
              <FaTimesCircle />
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <FaCheckCircle />
              {success}
            </div>
          )}

          {/* Import Button */}
          <button
            onClick={handleImport}
            disabled={loading || !selectedFile}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <FaUpload />
                Import Produk
              </>
            )}
          </button>
        </div>

        {/* Import Result */}
        {importResult && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-bold mb-4">Hasil Import</h2>
            
            {/* Summary */}
            {importResult.summary && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <FaCheckCircle className="text-3xl text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">{importResult.summary.products_created || 0}</p>
                  <p className="text-sm text-green-700">Produk Baru</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <FaBox className="text-3xl text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">{importResult.summary.products_updated || 0}</p>
                  <p className="text-sm text-blue-700">Produk Diupdate</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                  <FaCheckCircle className="text-3xl text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-600">{importResult.summary.variants_created || 0}</p>
                  <p className="text-sm text-purple-700">Varian Baru</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <FaTimesCircle className="text-3xl text-red-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-red-600">{importResult.errors?.length || 0}</p>
                  <p className="text-sm text-red-700">Error</p>
                </div>
              </div>
            )}

            {/* Auto-created Master Data */}
            {(importResult.created_categories?.length > 0 || importResult.created_fittings?.length > 0 || 
              importResult.created_sizes?.length > 0 || importResult.created_warehouses?.length > 0) && (
              <div className="mb-6">
                <h3 className="font-semibold text-indigo-700 mb-2">Master Data Baru (Otomatis Dibuat):</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {importResult.created_categories?.length > 0 && (
                    <div className="bg-indigo-50 rounded-lg p-3">
                      <p className="font-medium text-indigo-800 mb-1">Kategori:</p>
                      <ul className="text-sm text-indigo-700">
                        {importResult.created_categories.map((name, i) => (
                          <li key={i}>• {name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {importResult.created_fittings?.length > 0 && (
                    <div className="bg-indigo-50 rounded-lg p-3">
                      <p className="font-medium text-indigo-800 mb-1">Fitting:</p>
                      <ul className="text-sm text-indigo-700">
                        {importResult.created_fittings.map((name, i) => (
                          <li key={i}>• {name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {importResult.created_sizes?.length > 0 && (
                    <div className="bg-indigo-50 rounded-lg p-3">
                      <p className="font-medium text-indigo-800 mb-1">Ukuran:</p>
                      <ul className="text-sm text-indigo-700">
                        {importResult.created_sizes.map((name, i) => (
                          <li key={i}>• {name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {importResult.created_warehouses?.length > 0 && (
                    <div className="bg-indigo-50 rounded-lg p-3">
                      <p className="font-medium text-indigo-800 mb-1">Gudang:</p>
                      <ul className="text-sm text-indigo-700">
                        {importResult.created_warehouses.map((name, i) => (
                          <li key={i}>• {name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Success List */}
            {importResult.created && importResult.created.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-green-700 mb-2">Produk Berhasil Dibuat:</h3>
                <div className="bg-green-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                  <ul className="list-disc list-inside text-sm text-green-800 space-y-1">
                    {importResult.created.map((item, index) => (
                      <li key={index}>{item.name} ({item.sku_code})</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Updated List */}
            {importResult.updated && importResult.updated.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-blue-700 mb-2">Produk Berhasil Diupdate:</h3>
                <div className="bg-blue-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                  <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                    {importResult.updated.map((item, index) => (
                      <li key={index}>{item.name} ({item.sku_code})</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Errors List */}
            {importResult.errors && importResult.errors.length > 0 && (
              <div>
                <h3 className="font-semibold text-red-700 mb-2">Error:</h3>
                <div className="bg-red-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-red-200">
                        <th className="text-left py-2 px-2">Baris</th>
                        <th className="text-left py-2 px-2">Sheet</th>
                        <th className="text-left py-2 px-2">SKU</th>
                        <th className="text-left py-2 px-2">Error</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importResult.errors.map((err, index) => (
                        <tr key={index} className="border-b border-red-100">
                          <td className="py-2 px-2 text-red-800">{err.row || '-'}</td>
                          <td className="py-2 px-2 text-red-800">{err.sheet || '-'}</td>
                          <td className="py-2 px-2 text-red-800">{err.sku || err.product_sku || '-'}</td>
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
    </>
  );
};

export default ProductImport;
