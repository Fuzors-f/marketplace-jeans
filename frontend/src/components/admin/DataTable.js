import React, { useState, useMemo } from 'react';
import { FaSearch, FaChevronLeft, FaChevronRight, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

/**
 * Mobile-friendly DataTable component with pagination, search, and sorting
 * 
 * @param {Array} columns - Array of column definitions { key, label, sortable, render, className }
 * @param {Array} data - Array of data objects
 * @param {Function} renderMobileCard - Function to render mobile card view (optional)
 * @param {Boolean} loading - Loading state
 * @param {String} emptyMessage - Message when no data
 * @param {Number} defaultPageSize - Default items per page (default: 10)
 * @param {Array} pageSizeOptions - Page size options (default: [5, 10, 25, 50])
 * @param {Boolean} searchable - Enable search (default: true)
 * @param {String} searchPlaceholder - Search input placeholder
 * @param {Array} searchKeys - Keys to search in (default: all string fields)
 */
const DataTable = ({
  columns = [],
  data = [],
  renderMobileCard,
  loading = false,
  emptyMessage = 'Tidak ada data',
  defaultPageSize = 10,
  pageSizeOptions = [5, 10, 25, 50],
  searchable = true,
  searchPlaceholder = 'Cari...',
  searchKeys = [],
  actions,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;

    const query = searchQuery.toLowerCase();
    const keysToSearch = searchKeys.length > 0 
      ? searchKeys 
      : columns.filter(col => col.searchable !== false).map(col => col.key);

    return data.filter(item => {
      return keysToSearch.some(key => {
        const value = item[key];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(query);
      });
    });
  }, [data, searchQuery, searchKeys, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      if (sortConfig.direction === 'asc') {
        return aStr.localeCompare(bStr);
      }
      return bStr.localeCompare(aStr);
    });
  }, [filteredData, sortConfig]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  // Reset to page 1 when search or pageSize changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, pageSize]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="text-gray-300" size={12} />;
    return sortConfig.direction === 'asc' 
      ? <FaSortUp className="text-blue-500" size={12} />
      : <FaSortDown className="text-blue-500" size={12} />;
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-gray-50 border-t">
        {/* Info */}
        <div className="text-xs sm:text-sm text-gray-600 order-2 sm:order-1">
          Menampilkan {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, sortedData.length)} dari {sortedData.length} data
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center gap-1 order-1 sm:order-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            <FaChevronLeft size={12} />
          </button>

          {startPage > 1 && (
            <>
              <button
                onClick={() => setCurrentPage(1)}
                className="px-3 py-1.5 rounded border bg-white hover:bg-gray-100 text-sm"
              >
                1
              </button>
              {startPage > 2 && <span className="px-1 text-gray-400">...</span>}
            </>
          )}

          {pages.map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1.5 rounded border text-sm ${
                currentPage === page
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="px-1 text-gray-400">...</span>}
              <button
                onClick={() => setCurrentPage(totalPages)}
                className="px-3 py-1.5 rounded border bg-white hover:bg-gray-100 text-sm"
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            <FaChevronRight size={12} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`}>
      {/* Header with Search and Page Size */}
      <div className="p-3 sm:p-4 border-b flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {searchable && (
          <div className="relative flex-1 max-w-md">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 whitespace-nowrap">Tampilkan:</label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-2 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
          {actions}
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Memuat data...</p>
        </div>
      ) : paginatedData.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          {searchQuery ? `Tidak ditemukan hasil untuk "${searchQuery}"` : emptyMessage}
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          {renderMobileCard && (
            <div className="md:hidden divide-y">
              {paginatedData.map((item, index) => (
                <div key={item.id || index} className="p-4">
                  {renderMobileCard(item, index)}
                </div>
              ))}
            </div>
          )}

          {/* Desktop Table View */}
          <div className={`overflow-x-auto ${renderMobileCard ? 'hidden md:block' : ''}`}>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                        column.sortable !== false ? 'cursor-pointer hover:bg-gray-100' : ''
                      } ${column.className || ''}`}
                      onClick={() => column.sortable !== false && handleSort(column.key)}
                    >
                      <div className="flex items-center gap-1">
                        <span>{column.label}</span>
                        {column.sortable !== false && getSortIcon(column.key)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedData.map((item, rowIndex) => (
                  <tr key={item.id || rowIndex} className="hover:bg-gray-50">
                    {columns.map((column) => (
                      <td key={column.key} className={`px-4 py-3 text-sm ${column.cellClassName || ''}`}>
                        {column.render 
                          ? column.render(item[column.key], item, rowIndex)
                          : item[column.key] ?? '-'
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && renderPagination()}
        </>
      )}
    </div>
  );
};

export default DataTable;
