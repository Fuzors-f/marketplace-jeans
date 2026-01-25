import React, { useState, useEffect } from 'react';
import { 
  FaCity, FaPlus, FaEdit, FaTrash, FaSearch, FaSpinner,
  FaTruck, FaMapMarkerAlt, FaChevronDown, FaChevronRight,
  FaTimes, FaSave, FaFilter, FaDownload, FaUpload
} from 'react-icons/fa';
import api from '../../services/api';

const CityShipping = () => {
  // State for Cities
  const [cities, setCities] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [loadingCities, setLoadingCities] = useState(true);
  
  // State for Shipping Costs
  const [shippingCosts, setShippingCosts] = useState([]);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [couriers, setCouriers] = useState([]);
  
  // UI State
  const [activeTab, setActiveTab] = useState('cities');
  const [searchCity, setSearchCity] = useState('');
  const [searchShipping, setSearchShipping] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCityId, setSelectedCityId] = useState('');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  
  // Modal State
  const [showCityModal, setShowCityModal] = useState(false);
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [editingShipping, setEditingShipping] = useState(null);
  
  // Forms
  const [cityForm, setCityForm] = useState({
    name: '',
    province: '',
    postal_code: '',
    city_type: 'kota',
    is_active: true
  });
  
  const [shippingForm, setShippingForm] = useState({
    city_id: '',
    warehouse_id: '',
    courier: '',
    service: '',
    cost: 0,
    cost_per_kg: 0,
    estimated_days_min: 1,
    estimated_days_max: 3,
    is_active: true
  });

  // Expanded city rows
  const [expandedCities, setExpandedCities] = useState([]);

  useEffect(() => {
    fetchCities();
    fetchProvinces();
    fetchWarehouses();
    fetchCouriers();
  }, []);

  useEffect(() => {
    if (activeTab === 'shipping') {
      fetchShippingCosts();
    }
  }, [activeTab, selectedCityId, selectedWarehouseId]);

  const fetchCities = async () => {
    setLoadingCities(true);
    try {
      const params = {};
      if (selectedProvince) params.province = selectedProvince;
      if (searchCity) params.search = searchCity;
      
      const response = await api.get('/cities', { params });
      if (response.data.success) {
        setCities(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setLoadingCities(false);
    }
  };

  const fetchProvinces = async () => {
    try {
      const response = await api.get('/cities/provinces');
      if (response.data.success) {
        setProvinces(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching provinces:', error);
    }
  };

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

  const fetchCouriers = async () => {
    try {
      const response = await api.get('/shipping-costs/couriers');
      if (response.data.success) {
        setCouriers(response.data.data);
      }
    } catch (error) {
      // Default couriers if API fails
      setCouriers(['JNE', 'J&T', 'SiCepat', 'TIKI', 'POS']);
    }
  };

  const fetchShippingCosts = async () => {
    setLoadingShipping(true);
    try {
      const params = {};
      if (selectedCityId) params.city_id = selectedCityId;
      if (selectedWarehouseId) params.warehouse_id = selectedWarehouseId;
      
      const response = await api.get('/shipping-costs', { params });
      if (response.data.success) {
        setShippingCosts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching shipping costs:', error);
    } finally {
      setLoadingShipping(false);
    }
  };

  const fetchCityShippingCosts = async (cityId) => {
    try {
      const response = await api.get(`/cities/${cityId}`);
      if (response.data.success) {
        return response.data.data.shipping_costs || [];
      }
    } catch (error) {
      console.error('Error fetching city shipping costs:', error);
    }
    return [];
  };

  // City handlers
  const handleOpenCityModal = (city = null) => {
    if (city) {
      setEditingCity(city);
      setCityForm({
        name: city.name || '',
        province: city.province || '',
        postal_code: city.postal_code || '',
        city_type: city.city_type || 'kota',
        is_active: city.is_active !== undefined ? city.is_active : true
      });
    } else {
      setEditingCity(null);
      setCityForm({
        name: '',
        province: '',
        postal_code: '',
        city_type: 'kota',
        is_active: true
      });
    }
    setShowCityModal(true);
  };

  const handleSubmitCity = async (e) => {
    e.preventDefault();
    try {
      if (editingCity) {
        const response = await api.put(`/cities/${editingCity.id}`, cityForm);
        if (response.data.success) {
          alert('Kota berhasil diupdate!');
        }
      } else {
        const response = await api.post('/cities', cityForm);
        if (response.data.success) {
          alert('Kota berhasil ditambahkan!');
        }
      }
      setShowCityModal(false);
      fetchCities();
      fetchProvinces();
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menyimpan data kota');
    }
  };

  const handleDeleteCity = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus kota ini?')) return;
    try {
      const response = await api.delete(`/cities/${id}`);
      if (response.data.success) {
        alert('Kota berhasil dihapus!');
        fetchCities();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menghapus kota');
    }
  };

  // Shipping handlers
  const handleOpenShippingModal = (shipping = null, cityId = null) => {
    if (shipping) {
      setEditingShipping(shipping);
      setShippingForm({
        city_id: shipping.city_id || '',
        warehouse_id: shipping.warehouse_id || '',
        courier: shipping.courier || '',
        service: shipping.service || '',
        cost: shipping.cost || 0,
        cost_per_kg: shipping.cost_per_kg || 0,
        estimated_days_min: shipping.estimated_days_min || 1,
        estimated_days_max: shipping.estimated_days_max || 3,
        is_active: shipping.is_active !== undefined ? shipping.is_active : true
      });
    } else {
      setEditingShipping(null);
      setShippingForm({
        city_id: cityId || '',
        warehouse_id: '',
        courier: '',
        service: '',
        cost: 0,
        cost_per_kg: 0,
        estimated_days_min: 1,
        estimated_days_max: 3,
        is_active: true
      });
    }
    setShowShippingModal(true);
  };

  const handleSubmitShipping = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...shippingForm,
        warehouse_id: shippingForm.warehouse_id || null, // null for warehouse-independent
        cost: parseFloat(shippingForm.cost),
        cost_per_kg: parseFloat(shippingForm.cost_per_kg),
        estimated_days_min: parseInt(shippingForm.estimated_days_min),
        estimated_days_max: parseInt(shippingForm.estimated_days_max)
      };

      if (editingShipping) {
        const response = await api.put(`/shipping-costs/${editingShipping.id}`, data);
        if (response.data.success) {
          alert('Ongkir berhasil diupdate!');
        }
      } else {
        const response = await api.post('/shipping-costs', data);
        if (response.data.success) {
          alert('Ongkir berhasil ditambahkan!');
        }
      }
      setShowShippingModal(false);
      fetchShippingCosts();
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menyimpan data ongkir');
    }
  };

  const handleDeleteShipping = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus ongkir ini?')) return;
    try {
      const response = await api.delete(`/shipping-costs/${id}`);
      if (response.data.success) {
        alert('Ongkir berhasil dihapus!');
        fetchShippingCosts();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menghapus ongkir');
    }
  };

  const toggleCityExpand = async (cityId) => {
    if (expandedCities.includes(cityId)) {
      setExpandedCities(expandedCities.filter(id => id !== cityId));
    } else {
      setExpandedCities([...expandedCities, cityId]);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Filter cities
  const filteredCities = cities.filter(c => {
    const matchSearch = !searchCity || 
      c.name?.toLowerCase().includes(searchCity.toLowerCase()) ||
      c.province?.toLowerCase().includes(searchCity.toLowerCase());
    const matchProvince = !selectedProvince || c.province === selectedProvince;
    return matchSearch && matchProvince;
  });

  // Filter shipping costs
  const filteredShipping = shippingCosts.filter(s => {
    const matchSearch = !searchShipping ||
      s.city_name?.toLowerCase().includes(searchShipping.toLowerCase()) ||
      s.courier?.toLowerCase().includes(searchShipping.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Kota & Ongkos Kirim</h1>
          <p className="text-sm sm:text-base text-gray-600">Kelola master kota dan tarif pengiriman</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-4 sm:mb-6">
        <div className="flex border-b overflow-x-auto">
          <button
            onClick={() => setActiveTab('cities')}
            className={`px-3 sm:px-6 py-2 sm:py-3 font-medium flex items-center gap-1 sm:gap-2 whitespace-nowrap text-sm sm:text-base ${
              activeTab === 'cities' 
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FaCity /> <span className="hidden xs:inline">Master</span> Kota
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`px-3 sm:px-6 py-2 sm:py-3 font-medium flex items-center gap-1 sm:gap-2 whitespace-nowrap text-sm sm:text-base ${
              activeTab === 'shipping' 
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FaTruck /> Ongkos Kirim
          </button>
        </div>
      </div>

      {/* Cities Tab */}
      {activeTab === 'cities' && (
        <div className="bg-white rounded-lg shadow">
          {/* Toolbar */}
          <div className="p-3 sm:p-4 border-b flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  placeholder="Cari kota..."
                  className="w-full sm:w-48 md:w-64 pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">Semua Provinsi</option>
                {provinces.map(prov => (
                  <option key={prov} value={prov}>{prov}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => handleOpenCityModal()}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm whitespace-nowrap"
            >
              <FaPlus /> <span className="hidden xs:inline">Tambah</span> Kota
            </button>
          </div>

          {/* Cities Table - Mobile Cards / Desktop Table */}
          {loadingCities ? (
            <div className="p-8 sm:p-10 text-center">
              <FaSpinner className="animate-spin text-3xl sm:text-4xl text-blue-500 mx-auto mb-4" />
              <p className="text-gray-500 text-sm sm:text-base">Memuat data...</p>
            </div>
          ) : (
            <>
              {/* Mobile View - Cards */}
              <div className="md:hidden divide-y divide-gray-200">
                {filteredCities.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-500">
                    Tidak ada data kota
                  </div>
                ) : (
                  filteredCities.map((city) => (
                    <div key={city.id} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <FaMapMarkerAlt className="text-red-400 flex-shrink-0" />
                            <span className="font-medium truncate">{city.name}</span>
                          </div>
                          <p className="text-sm text-gray-500 mb-2">{city.province}</p>
                          <div className="flex flex-wrap gap-2">
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              city.city_type === 'kota' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {city.city_type === 'kota' ? 'Kota' : 'Kabupaten'}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              city.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {city.is_active ? 'Aktif' : 'Nonaktif'}
                            </span>
                            {city.postal_code && (
                              <span className="text-xs text-gray-500">📮 {city.postal_code}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => handleOpenShippingModal(null, city.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Tambah Ongkir"
                          >
                            <FaTruck size={16} />
                          </button>
                          <button
                            onClick={() => handleOpenCityModal(city)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <FaEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteCity(city.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>
                      </div>
                      {/* Expand button */}
                      <button 
                        onClick={() => toggleCityExpand(city.id)}
                        className="mt-2 text-xs text-blue-600 flex items-center gap-1"
                      >
                        {expandedCities.includes(city.id) ? <FaChevronDown /> : <FaChevronRight />}
                        Lihat tarif ongkir
                      </button>
                      {expandedCities.includes(city.id) && (
                        <div className="mt-3 pt-3 border-t">
                          <CityShippingDetails cityId={city.id} onEdit={handleOpenShippingModal} onDelete={handleDeleteShipping} />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Desktop View - Table */}
              <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-10"></th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kota</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provinsi</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode Pos</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCities.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                        Tidak ada data kota
                      </td>
                    </tr>
                  ) : (
                    filteredCities.map((city) => (
                      <React.Fragment key={city.id}>
                        <tr className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <button 
                              onClick={() => toggleCityExpand(city.id)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              {expandedCities.includes(city.id) ? <FaChevronDown /> : <FaChevronRight />}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <FaMapMarkerAlt className="text-red-400" />
                              <span className="font-medium">{city.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{city.province}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              city.city_type === 'kota' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {city.city_type === 'kota' ? 'Kota' : 'Kabupaten'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{city.postal_code || '-'}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-1 rounded text-xs ${
                              city.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {city.is_active ? 'Aktif' : 'Nonaktif'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleOpenShippingModal(null, city.id)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded"
                                title="Tambah Ongkir"
                              >
                                <FaTruck />
                              </button>
                              <button
                                onClick={() => handleOpenCityModal(city)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                title="Edit"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDeleteCity(city.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                                title="Hapus"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {/* Expanded shipping costs */}
                        {expandedCities.includes(city.id) && (
                          <tr>
                            <td colSpan="7" className="bg-gray-50 px-8 py-4">
                              <CityShippingDetails cityId={city.id} onEdit={handleOpenShippingModal} onDelete={handleDeleteShipping} />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* Shipping Tab */}
      {activeTab === 'shipping' && (
        <div className="bg-white rounded-lg shadow">
          {/* Toolbar */}
          <div className="p-3 sm:p-4 border-b flex flex-col gap-3 items-stretch">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center w-full">
              <div className="relative flex-1 sm:flex-none">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchShipping}
                  onChange={(e) => setSearchShipping(e.target.value)}
                  placeholder="Cari kota/kurir..."
                  className="w-full sm:w-48 md:w-64 pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <select
                value={selectedCityId}
                onChange={(e) => setSelectedCityId(e.target.value)}
                className="px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">Semua Kota</option>
                {cities.map(city => (
                  <option key={city.id} value={city.id}>{city.name} - {city.province}</option>
                ))}
              </select>
              <select
                value={selectedWarehouseId}
                onChange={(e) => setSelectedWarehouseId(e.target.value)}
                className="px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">Semua Gudang</option>
                <option value="null">Tidak Tergantung Gudang</option>
                {warehouses.map(wh => (
                  <option key={wh.id} value={wh.id}>{wh.name}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => handleOpenShippingModal()}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm whitespace-nowrap sm:self-end"
            >
              <FaPlus /> Tambah Ongkir
            </button>
          </div>

          {/* Shipping Table - Mobile Cards / Desktop Table */}
          {loadingShipping ? (
            <div className="p-8 sm:p-10 text-center">
              <FaSpinner className="animate-spin text-3xl sm:text-4xl text-blue-500 mx-auto mb-4" />
              <p className="text-gray-500 text-sm sm:text-base">Memuat data...</p>
            </div>
          ) : (
            <>
              {/* Mobile View - Cards */}
              <div className="md:hidden divide-y divide-gray-200">
                {filteredShipping.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-500">
                    Tidak ada data ongkir
                  </div>
                ) : (
                  filteredShipping.map((sc) => (
                    <div key={sc.id} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{sc.city_name}</div>
                          <div className="text-xs text-gray-500 mb-2">{sc.province}</div>
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                              {sc.courier}
                            </span>
                            {sc.service && (
                              <span className="text-xs text-gray-500">{sc.service}</span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                            <span className="font-medium">{formatCurrency(sc.cost)}</span>
                            {sc.cost_per_kg > 0 && (
                              <span className="text-gray-500">{formatCurrency(sc.cost_per_kg)}/kg</span>
                            )}
                            <span className="text-gray-500">
                              {sc.estimated_days_min}-{sc.estimated_days_max} hari
                            </span>
                          </div>
                          <div className="mt-1">
                            {sc.warehouse_name ? (
                              <span className="text-xs text-gray-500">📦 {sc.warehouse_name}</span>
                            ) : (
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">Semua Gudang</span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => handleOpenShippingModal(sc)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit"
                          >
                            <FaEdit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteShipping(sc.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                            title="Hapus"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop View - Table */}
              <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kota</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gudang</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kurir</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Layanan</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Biaya</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Per Kg</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estimasi</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredShipping.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                        Tidak ada data ongkir
                      </td>
                    </tr>
                  ) : (
                    filteredShipping.map((sc) => (
                      <tr key={sc.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium">{sc.city_name}</div>
                            <div className="text-sm text-gray-500">{sc.province}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {sc.warehouse_name ? (
                            <span className="text-gray-600">{sc.warehouse_name}</span>
                          ) : (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">Semua Gudang</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                            {sc.courier}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{sc.service || '-'}</td>
                        <td className="px-4 py-3 text-right font-medium">{formatCurrency(sc.cost)}</td>
                        <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(sc.cost_per_kg)}</td>
                        <td className="px-4 py-3 text-center text-gray-600">
                          {sc.estimated_days_min}-{sc.estimated_days_max} hari
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenShippingModal(sc)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteShipping(sc.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                              title="Hapus"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* City Modal */}
      {showCityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-xl sm:rounded-lg shadow-xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b sticky top-0 bg-white">
              <h2 className="text-base sm:text-lg font-bold">
                {editingCity ? 'Edit Kota' : 'Tambah Kota Baru'}
              </h2>
              <button onClick={() => setShowCityModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmitCity} className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kota *</label>
                <input
                  type="text"
                  value={cityForm.name}
                  onChange={(e) => setCityForm({...cityForm, name: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provinsi *</label>
                <input
                  type="text"
                  value={cityForm.province}
                  onChange={(e) => setCityForm({...cityForm, province: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Contoh: Jawa Barat"
                  list="province-list"
                  required
                />
                <datalist id="province-list">
                  {provinces.map(prov => (
                    <option key={prov} value={prov} />
                  ))}
                </datalist>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kode Pos</label>
                  <input
                    type="text"
                    value={cityForm.postal_code}
                    onChange={(e) => setCityForm({...cityForm, postal_code: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="12345"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                  <select
                    value={cityForm.city_type}
                    onChange={(e) => setCityForm({...cityForm, city_type: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="kota">Kota</option>
                    <option value="kabupaten">Kabupaten</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="city-active"
                  checked={cityForm.is_active}
                  onChange={(e) => setCityForm({...cityForm, is_active: e.target.checked})}
                  className="rounded text-blue-600"
                />
                <label htmlFor="city-active" className="text-sm text-gray-700">Aktif</label>
              </div>
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowCityModal(false)}
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 border rounded-lg hover:bg-gray-50 text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm"
                >
                  <FaSave /> Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shipping Modal */}
      {showShippingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-xl sm:rounded-lg shadow-xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b sticky top-0 bg-white">
              <h2 className="text-base sm:text-lg font-bold">
                {editingShipping ? 'Edit Ongkos Kirim' : 'Tambah Ongkos Kirim'}
              </h2>
              <button onClick={() => setShowShippingModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmitShipping} className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kota Tujuan *</label>
                <select
                  value={shippingForm.city_id}
                  onChange={(e) => setShippingForm({...shippingForm, city_id: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                >
                  <option value="">Pilih Kota</option>
                  {cities.map(city => (
                    <option key={city.id} value={city.id}>{city.name} - {city.province}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gudang Asal</label>
                <select
                  value={shippingForm.warehouse_id}
                  onChange={(e) => setShippingForm({...shippingForm, warehouse_id: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Tidak Tergantung Gudang (Umum)</option>
                  {warehouses.map(wh => (
                    <option key={wh.id} value={wh.id}>{wh.name} ({wh.code})</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Pilih "Tidak Tergantung Gudang" jika tarif berlaku untuk semua gudang
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kurir *</label>
                  <input
                    type="text"
                    value={shippingForm.courier}
                    onChange={(e) => setShippingForm({...shippingForm, courier: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="JNE, J&T"
                    list="courier-list"
                    required
                  />
                  <datalist id="courier-list">
                    {couriers.map(c => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Layanan</label>
                  <input
                    type="text"
                    value={shippingForm.service}
                    onChange={(e) => setShippingForm({...shippingForm, service: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="REG, YES"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Biaya (Rp) *</label>
                  <input
                    type="number"
                    value={shippingForm.cost}
                    onChange={(e) => setShippingForm({...shippingForm, cost: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Biaya/Kg (Rp)</label>
                  <input
                    type="number"
                    value={shippingForm.cost_per_kg}
                    onChange={(e) => setShippingForm({...shippingForm, cost_per_kg: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    min="0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimasi Min</label>
                  <input
                    type="number"
                    value={shippingForm.estimated_days_min}
                    onChange={(e) => setShippingForm({...shippingForm, estimated_days_min: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimasi Max</label>
                  <input
                    type="number"
                    value={shippingForm.estimated_days_max}
                    onChange={(e) => setShippingForm({...shippingForm, estimated_days_max: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    min="1"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="shipping-active"
                  checked={shippingForm.is_active}
                  onChange={(e) => setShippingForm({...shippingForm, is_active: e.target.checked})}
                  className="rounded text-blue-600"
                />
                <label htmlFor="shipping-active" className="text-sm text-gray-700">Aktif</label>
              </div>
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowShippingModal(false)}
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 border rounded-lg hover:bg-gray-50 text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm"
                >
                  <FaSave /> Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component for city shipping details
const CityShippingDetails = ({ cityId, onEdit, onDelete }) => {
  const [shippingCosts, setShippingCosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/cities/${cityId}`);
        if (response.data.success) {
          setShippingCosts(response.data.data.shipping_costs || []);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [cityId]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return <div className="text-center py-4"><FaSpinner className="animate-spin text-blue-500 mx-auto" /></div>;
  }

  if (shippingCosts.length === 0) {
    return <div className="text-gray-500 text-sm py-2">Belum ada tarif ongkir untuk kota ini</div>;
  }

  return (
    <div className="space-y-2">
      <h4 className="font-medium text-gray-700 mb-2 text-sm sm:text-base">Tarif Ongkos Kirim:</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {shippingCosts.map(sc => (
          <div key={sc.id} className="bg-white rounded border p-2 sm:p-3 flex justify-between items-center">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                <span className="px-1.5 sm:px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">{sc.courier}</span>
                <span className="text-gray-600 text-xs sm:text-sm truncate">{sc.service || '-'}</span>
              </div>
              <div className="text-xs sm:text-sm mt-1">
                <span className="font-medium">{formatCurrency(sc.cost)}</span>
                {sc.cost_per_kg > 0 && <span className="text-gray-500"> + {formatCurrency(sc.cost_per_kg)}/kg</span>}
              </div>
              <div className="text-xs text-gray-500">
                {sc.warehouse_name ? (
                  <span className="truncate">{sc.warehouse_name}</span>
                ) : (
                  <span className="text-purple-600 font-medium">Semua Gudang</span>
                )} • {sc.estimated_days_min}-{sc.estimated_days_max} hari
              </div>
            </div>
            <div className="flex gap-0.5 sm:gap-1 ml-2">
              <button onClick={() => onEdit(sc)} className="p-1 sm:p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                <FaEdit size={12} />
              </button>
              <button onClick={() => onDelete(sc.id)} className="p-1 sm:p-1.5 text-red-600 hover:bg-red-50 rounded">
                <FaTrash size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CityShipping;
