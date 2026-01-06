import React, { useState, useEffect } from 'react';
import { FaUserEdit, FaTrash, FaUserShield, FaUser, FaUserTie, FaTimes, FaMapMarkerAlt, FaPlus, FaStar } from 'react-icons/fa';
import apiClient from '../../services/api';
import DataTable from '../../components/admin/DataTable';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [roleFilter, setRoleFilter] = useState('');
  const [formData, setFormData] = useState({
    role: 'customer',
    is_active: true,
    member_discount: 0
  });

  // Address modal states
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressUser, setAddressUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressFormData, setAddressFormData] = useState({
    address_label: '',
    recipient_name: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postal_code: '',
    country: 'Indonesia',
    is_default: false
  });

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (roleFilter) params.role = roleFilter;
      
      const response = await apiClient.get('/users', { params });
      setUsers(response.data.data || []);
      setError('');
    } catch (err) {
      setError('Gagal memuat data users: ' + (err.response?.data?.message || err.message));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      role: user.role || 'customer',
      is_active: user.is_active !== false,
      member_discount: user.member_discount || 0
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.put(`/users/${editingUser.id}`, formData);
      setSuccess('User berhasil diupdate!');
      setShowModal(false);
      setEditingUser(null);
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengupdate user');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus user ini?')) return;
    try {
      await apiClient.delete(`/users/${id}`);
      setSuccess('User berhasil dihapus!');
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menghapus user');
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await apiClient.put(`/users/${user.id}`, {
        is_active: !user.is_active
      });
      fetchUsers();
    } catch (err) {
      setError('Gagal mengubah status user');
    }
  };

  // =====================================================
  // Address Management Functions
  // =====================================================

  const handleViewAddresses = async (user) => {
    setAddressUser(user);
    setShowAddressModal(true);
    setLoadingAddresses(true);
    try {
      const response = await apiClient.get(`/addresses/user/${user.id}`);
      setAddresses(response.data.data || []);
    } catch (err) {
      console.error('Error fetching addresses:', err);
      setError('Gagal memuat alamat');
      setAddresses([]);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const resetAddressForm = () => {
    setAddressFormData({
      address_label: '',
      recipient_name: addressUser?.full_name || '',
      phone: addressUser?.phone || '',
      address: '',
      city: '',
      province: '',
      postal_code: '',
      country: 'Indonesia',
      is_default: false
    });
    setEditingAddress(null);
  };

  const handleAddAddress = () => {
    resetAddressForm();
    setAddressFormData(prev => ({
      ...prev,
      recipient_name: addressUser?.full_name || '',
      phone: addressUser?.phone || ''
    }));
    setShowAddressForm(true);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setAddressFormData({
      address_label: address.address_label || '',
      recipient_name: address.recipient_name || '',
      phone: address.phone || '',
      address: address.address || '',
      city: address.city || '',
      province: address.province || '',
      postal_code: address.postal_code || '',
      country: address.country || 'Indonesia',
      is_default: address.is_default || false
    });
    setShowAddressForm(true);
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    
    if (!addressFormData.recipient_name || !addressFormData.phone || !addressFormData.address || 
        !addressFormData.city || !addressFormData.province || !addressFormData.postal_code) {
      setError('Mohon lengkapi semua field yang wajib');
      return;
    }

    setSavingAddress(true);
    try {
      if (editingAddress) {
        await apiClient.put(`/addresses/user/${addressUser.id}/${editingAddress.id}`, addressFormData);
        setSuccess('Alamat berhasil diperbarui!');
      } else {
        await apiClient.post(`/addresses/user/${addressUser.id}`, addressFormData);
        setSuccess('Alamat berhasil ditambahkan!');
      }
      
      // Refresh addresses
      const response = await apiClient.get(`/addresses/user/${addressUser.id}`);
      setAddresses(response.data.data || []);
      setShowAddressForm(false);
      resetAddressForm();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan alamat');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus alamat ini?')) return;
    
    try {
      await apiClient.delete(`/addresses/user/${addressUser.id}/${addressId}`);
      setSuccess('Alamat berhasil dihapus!');
      // Refresh addresses
      const response = await apiClient.get(`/addresses/user/${addressUser.id}`);
      setAddresses(response.data.data || []);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menghapus alamat');
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      await apiClient.put(`/addresses/user/${addressUser.id}/${addressId}/default`);
      setSuccess('Alamat utama berhasil diubah!');
      // Refresh addresses
      const response = await apiClient.get(`/addresses/user/${addressUser.id}`);
      setAddresses(response.data.data || []);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengubah alamat utama');
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <FaUserShield className="text-red-500" />;
      case 'staff':
        return <FaUserTie className="text-blue-500" />;
      default:
        return <FaUser className="text-gray-500" />;
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: 'bg-red-100 text-red-800',
      staff: 'bg-blue-100 text-blue-800',
      customer: 'bg-gray-100 text-gray-800'
    };
    return badges[role] || badges.customer;
  };

  // DataTable columns configuration
  const columns = [
    {
      key: 'full_name',
      label: 'Nama',
      sortable: true,
      render: (value, user) => (
        <div className="flex items-center gap-2">
          {getRoleIcon(user.role)}
          <div>
            <p className="font-semibold">{value || '-'}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'phone',
      label: 'Telepon',
      sortable: true,
      render: (value) => value || '-'
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${getRoleBadge(value)}`}>
          {value || 'customer'}
        </span>
      )
    },
    {
      key: 'member_discount',
      label: 'Diskon',
      sortable: true,
      render: (value) => value ? `${value}%` : '-'
    },
    {
      key: 'is_active',
      label: 'Status',
      sortable: true,
      render: (value, user) => (
        <button
          onClick={() => handleToggleStatus(user)}
          className={`px-2 py-1 rounded text-xs font-semibold ${
            value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {value ? 'Aktif' : 'Nonaktif'}
        </button>
      )
    },
    {
      key: 'created_at',
      label: 'Terdaftar',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString('id-ID')
    },
    {
      key: 'actions',
      label: 'Aksi',
      sortable: false,
      render: (_, user) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleViewAddresses(user)}
            className="p-2 text-green-600 hover:bg-green-50 rounded"
            title="Kelola Alamat"
          >
            <FaMapMarkerAlt />
          </button>
          <button
            onClick={() => handleEdit(user)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
            title="Edit"
          >
            <FaUserEdit />
          </button>
          <button
            onClick={() => handleDelete(user.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded"
            title="Hapus"
          >
            <FaTrash />
          </button>
        </div>
      )
    }
  ];

  // Mobile card renderer
  const renderMobileCard = (user) => (
    <div className="bg-white rounded-lg shadow p-4 mb-3">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${
            user.role === 'admin' ? 'bg-red-100' : 
            user.role === 'staff' ? 'bg-blue-100' : 'bg-gray-100'
          }`}>
            {getRoleIcon(user.role)}
          </div>
          <div>
            <p className="font-semibold">{user.full_name || 'No Name'}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => handleToggleStatus(user)}
          className={`px-2 py-1 rounded text-xs font-semibold ${
            user.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {user.is_active ? 'Aktif' : 'Nonaktif'}
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        <div>
          <span className="text-gray-500">Role:</span>
          <span className={`ml-2 px-2 py-0.5 rounded text-xs font-semibold capitalize ${getRoleBadge(user.role)}`}>
            {user.role || 'customer'}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Telepon:</span>
          <span className="ml-2">{user.phone || '-'}</span>
        </div>
        <div>
          <span className="text-gray-500">Diskon:</span>
          <span className="ml-2">{user.member_discount ? `${user.member_discount}%` : '-'}</span>
        </div>
        <div>
          <span className="text-gray-500">Terdaftar:</span>
          <span className="ml-2">{new Date(user.created_at).toLocaleDateString('id-ID')}</span>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-3 border-t">
        <button
          onClick={() => handleViewAddresses(user)}
          className="px-3 py-1 text-green-600 hover:bg-green-50 rounded text-sm flex items-center gap-1"
        >
          <FaMapMarkerAlt /> Alamat
        </button>
        <button
          onClick={() => handleEdit(user)}
          className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm flex items-center gap-1"
        >
          <FaUserEdit /> Edit
        </button>
        <button
          onClick={() => handleDelete(user.id)}
          className="px-3 py-1 text-red-600 hover:bg-red-50 rounded text-sm flex items-center gap-1"
        >
          <FaTrash /> Hapus
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Manajemen User</h1>
          <p className="text-gray-600">Kelola pengguna aplikasi</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}

      {/* Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 sm:max-w-xs">
            <label className="block text-sm font-medium mb-1">Filter Role</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Role</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="customer">Customer</option>
            </select>
          </div>
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        renderMobileCard={renderMobileCard}
        searchable={true}
        searchPlaceholder="Cari nama, email..."
        defaultPageSize={10}
        emptyMessage="Tidak ada user ditemukan"
      />

      {/* Edit Modal */}
      {showModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit User</h2>
              <button 
                onClick={() => setShowModal(false)} 
                className="p-2 hover:bg-gray-100 rounded"
              >
                <FaTimes />
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded">
              <p className="font-semibold">{editingUser.full_name || 'No Name'}</p>
              <p className="text-sm text-gray-500">{editingUser.email}</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="customer">Customer</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Diskon Member (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.member_discount}
                    onChange={(e) => setFormData({ ...formData, member_discount: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>User Aktif</span>
                </label>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Address Modal */}
      {showAddressModal && addressUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <FaMapMarkerAlt className="text-green-600" />
                  Alamat User
                </h2>
                <p className="text-sm text-gray-600">{addressUser.full_name} ({addressUser.email})</p>
              </div>
              <button 
                onClick={() => {
                  setShowAddressModal(false);
                  setShowAddressForm(false);
                  setAddressUser(null);
                  setAddresses([]);
                }} 
                className="p-2 hover:bg-gray-200 rounded"
              >
                <FaTimes />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {!showAddressForm ? (
                <>
                  {/* Address List */}
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-gray-600">{addresses.length} alamat tersimpan</p>
                    <button
                      onClick={handleAddAddress}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                      <FaPlus /> Tambah Alamat
                    </button>
                  </div>

                  {loadingAddresses ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                      <p className="mt-2 text-gray-500">Memuat alamat...</p>
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <FaMapMarkerAlt className="text-4xl text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">Belum ada alamat tersimpan</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {addresses.map((address) => (
                        <div 
                          key={address.id}
                          className={`border rounded-lg p-4 ${address.is_default ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold">{address.address_label || 'Alamat'}</span>
                                {address.is_default && (
                                  <span className="px-2 py-0.5 bg-green-600 text-white text-xs rounded flex items-center gap-1">
                                    <FaStar className="text-xs" /> Utama
                                  </span>
                                )}
                              </div>
                              <p className="font-medium">{address.recipient_name}</p>
                              <p className="text-sm text-gray-600">{address.phone}</p>
                              <p className="text-sm text-gray-600 mt-1">{address.address}</p>
                              <p className="text-sm text-gray-600">
                                {address.city}, {address.province} {address.postal_code}
                              </p>
                              <p className="text-sm text-gray-500">{address.country}</p>
                            </div>
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => handleEditAddress(address)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                title="Edit"
                              >
                                <FaUserEdit />
                              </button>
                              <button
                                onClick={() => handleDeleteAddress(address.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                                title="Hapus"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                          {!address.is_default && (
                            <button
                              onClick={() => handleSetDefaultAddress(address.id)}
                              className="mt-2 text-sm text-green-600 hover:text-green-800 flex items-center gap-1"
                            >
                              <FaStar /> Jadikan Alamat Utama
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                /* Address Form */
                <form onSubmit={handleAddressSubmit} className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">
                      {editingAddress ? 'Edit Alamat' : 'Tambah Alamat Baru'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddressForm(false);
                        resetAddressForm();
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <FaTimes />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Label Alamat</label>
                      <input
                        type="text"
                        value={addressFormData.address_label}
                        onChange={(e) => setAddressFormData({...addressFormData, address_label: e.target.value})}
                        placeholder="contoh: Rumah, Kantor"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Nama Penerima *</label>
                      <input
                        type="text"
                        value={addressFormData.recipient_name}
                        onChange={(e) => setAddressFormData({...addressFormData, recipient_name: e.target.value})}
                        required
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Nomor Telepon *</label>
                    <input
                      type="tel"
                      value={addressFormData.phone}
                      onChange={(e) => setAddressFormData({...addressFormData, phone: e.target.value})}
                      required
                      placeholder="08xxxxxxxxxx"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Alamat Lengkap *</label>
                    <textarea
                      value={addressFormData.address}
                      onChange={(e) => setAddressFormData({...addressFormData, address: e.target.value})}
                      required
                      rows={3}
                      placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Kota/Kabupaten *</label>
                      <input
                        type="text"
                        value={addressFormData.city}
                        onChange={(e) => setAddressFormData({...addressFormData, city: e.target.value})}
                        required
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Provinsi *</label>
                      <input
                        type="text"
                        value={addressFormData.province}
                        onChange={(e) => setAddressFormData({...addressFormData, province: e.target.value})}
                        required
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Kode Pos *</label>
                      <input
                        type="text"
                        value={addressFormData.postal_code}
                        onChange={(e) => setAddressFormData({...addressFormData, postal_code: e.target.value})}
                        required
                        maxLength={5}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Negara</label>
                      <input
                        type="text"
                        value={addressFormData.country}
                        onChange={(e) => setAddressFormData({...addressFormData, country: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addressFormData.is_default}
                      onChange={(e) => setAddressFormData({...addressFormData, is_default: e.target.checked})}
                      className="rounded text-green-600"
                    />
                    <span>Jadikan sebagai alamat utama</span>
                  </label>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddressForm(false);
                        resetAddressForm();
                      }}
                      className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={savingAddress}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {savingAddress ? 'Menyimpan...' : (editingAddress ? 'Perbarui' : 'Simpan')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
