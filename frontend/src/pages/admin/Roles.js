import React, { useState, useEffect } from 'react';
import { 
  FaUserShield, FaPlus, FaEdit, FaTrash, 
  FaCheck, FaTimes, FaSpinner, FaUsers, FaKey, FaLock, FaUnlock, FaCog, FaExclamationTriangle, FaSyncAlt, FaCrown
} from 'react-icons/fa';
import api from '../../services/api';
import { useAlert } from '../../utils/AlertContext';

const Roles = () => {
  const { showError, showSuccess, showWarning } = useAlert();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initLoading, setInitLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showSuperadminModal, setShowSuperadminModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    permissions: []
  });
  const [assignForm, setAssignForm] = useState({
    role_id: '',
    user_id: ''
  });
  const [superadminUserId, setSuperadminUserId] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rolesRes, permissionsRes, usersRes] = await Promise.all([
        api.get('/roles'),
        api.get('/roles/permissions'),
        api.get('/users')
      ]);

      if (rolesRes.data.success) setRoles(rolesRes.data.data);
      if (permissionsRes.data.success) {
        // Handle both array and object response formats
        const permData = permissionsRes.data.data;
        if (Array.isArray(permData)) {
          setPermissions(permData);
        } else if (permData?.permissions) {
          setPermissions(permData.permissions);
        } else {
          setPermissions([]);
        }
      }
      if (usersRes.data.success) setUsers(usersRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize all permissions
  const handleInitPermissions = async () => {
    if (!window.confirm('Ini akan menambahkan semua permission default ke sistem. Lanjutkan?')) {
      return;
    }
    setInitLoading(true);
    try {
      const response = await api.post('/roles/init-permissions');
      if (response.data.success) {
        showSuccess(`Permission berhasil diinisialisasi! Dibuat: ${response.data.data?.created || 0}, Diupdate: ${response.data.data?.updated || 0}`, 'Berhasil');
        fetchData();
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Gagal inisialisasi permission';
      const errDetail = error.response?.data?.error || '';
      showError(errDetail ? `${errMsg}\n\nDetail: ${errDetail}` : errMsg, 'Gagal Init Permission');
    } finally {
      setInitLoading(false);
    }
  };

  // Create Superadmin role
  const handleCreateSuperadmin = async () => {
    if (!window.confirm('Ini akan membuat role Superadmin dengan akses ke SEMUA permission. Lanjutkan?')) {
      return;
    }
    setInitLoading(true);
    try {
      const response = await api.post('/roles/create-superadmin');
      if (response.data.success) {
        showSuccess(`Superadmin role berhasil dibuat dengan ${response.data.data?.permissions_count || 0} permission!`, 'Berhasil');
        fetchData();
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Gagal membuat superadmin';
      const errDetail = error.response?.data?.error || '';
      showError(errDetail ? `${errMsg}\n\nDetail: ${errDetail}` : errMsg, 'Gagal Buat Superadmin');
    } finally {
      setInitLoading(false);
    }
  };

  // Assign Superadmin to user
  const handleAssignSuperadmin = async (e) => {
    e.preventDefault();
    if (!superadminUserId) {
      showError('Pilih user terlebih dahulu', 'Form Tidak Lengkap');
      return;
    }
    setInitLoading(true);
    try {
      const response = await api.post(`/roles/assign-superadmin/${superadminUserId}`);
      if (response.data.success) {
        showSuccess(response.data.message, 'Berhasil');
        setShowSuperadminModal(false);
        setSuperadminUserId('');
        fetchData();
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Gagal menetapkan superadmin';
      const errDetail = error.response?.data?.error || '';
      showError(errDetail ? `${errMsg}\n\nDetail: ${errDetail}` : errMsg, 'Gagal Assign Superadmin');
    } finally {
      setInitLoading(false);
    }
  };

  const handleOpenModal = async (role = null) => {
    if (role) {
      // Fetch role details with permissions
      try {
        const response = await api.get(`/roles/${role.id}`);
        if (response.data.success) {
          const roleData = response.data.data;
          setEditingRole(roleData);
          setForm({
            name: roleData.name,
            description: roleData.description || '',
            permissions: roleData.permissions.map(p => p.id)
          });
        }
      } catch (error) {
        console.error('Error fetching role details:', error);
      }
    } else {
      setEditingRole(null);
      setForm({
        name: '',
        description: '',
        permissions: []
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!form.name || form.name.trim() === '') {
      const errMsg = 'Nama role wajib diisi';
      setError(errMsg);
      showError(errMsg, 'Form Tidak Lengkap');
      return;
    }
    
    try {
      if (editingRole) {
        const response = await api.put(`/roles/${editingRole.id}`, form);
        if (response.data.success) {
          setSuccess('Role berhasil diupdate!');
          showSuccess('Role berhasil diupdate!', 'Berhasil');
        }
      } else {
        const response = await api.post('/roles', form);
        if (response.data.success) {
          setSuccess('Role berhasil ditambahkan!');
          showSuccess('Role baru berhasil ditambahkan!', 'Berhasil');
        }
      }
      setShowModal(false);
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Gagal menyimpan role';
      const errDetail = error.response?.data?.error || '';
      setError(errDetail ? `${errMsg} - ${errDetail}` : errMsg);
      showError(errDetail ? `${errMsg}\n\nDetail: ${errDetail}` : errMsg, 'Gagal Simpan Role');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus role ini?')) {
      return;
    }
    try {
      const response = await api.delete(`/roles/${id}`);
      if (response.data.success) {
        setSuccess('Role berhasil dihapus!');
        showSuccess('Role berhasil dihapus!', 'Berhasil');
        fetchData();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Gagal menghapus role';
      const errDetail = error.response?.data?.error || '';
      setError(errDetail ? `${errMsg} - ${errDetail}` : errMsg);
      showError(errDetail ? `${errMsg}\n\nDetail: ${errDetail}` : errMsg, 'Gagal Hapus Role');
    }
  };

  const handleTogglePermission = (permissionId) => {
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const handleAssignRole = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    const errors = [];
    if (!assignForm.user_id) {
      errors.push('User wajib dipilih');
    }
    if (!assignForm.role_id) {
      errors.push('Role wajib dipilih');
    }
    
    if (errors.length > 0) {
      const errorMessage = errors.join('\n• ');
      setError('• ' + errorMessage);
      showError('Validasi Gagal:\n• ' + errorMessage, 'Form Tidak Lengkap');
      return;
    }
    
    try {
      const response = await api.post('/roles/assign', assignForm);
      if (response.data.success) {
        setSuccess('Role berhasil ditetapkan ke user!');
        showSuccess('Role berhasil ditetapkan ke user!', 'Berhasil');
        setShowAssignModal(false);
        setAssignForm({ role_id: '', user_id: '' });
        fetchData();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Gagal menetapkan role';
      const errDetail = error.response?.data?.error || '';
      setError(errDetail ? `${errMsg} - ${errDetail}` : errMsg);
      showError(errDetail ? `${errMsg}\n\nDetail: ${errDetail}` : errMsg, 'Gagal Assign Role');
    }
  };

  const handleRemoveUserRole = async (userId, roleId) => {
    if (!window.confirm('Hapus role dari user ini?')) return;
    try {
      await api.delete(`/roles/assign/${userId}/${roleId}`);
      showSuccess('Role berhasil dihapus dari user!', 'Berhasil');
      fetchData();
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Gagal menghapus role';
      const errDetail = error.response?.data?.error || '';
      setError(errDetail ? `${errMsg} - ${errDetail}` : errMsg);
      showError(errDetail ? `${errMsg}\n\nDetail: ${errDetail}` : errMsg, 'Gagal Hapus Role User');
      showError(errMsg, 'Gagal');
    }
  };

  // Group permissions by module
  const groupedPermissions = permissions.reduce((acc, perm) => {
    const module = perm.module || 'other';
    if (!acc[module]) acc[module] = [];
    acc[module].push(perm);
    return acc;
  }, {});

  const moduleLabels = {
    dashboard: 'Dashboard',
    products: 'Produk',
    categories: 'Kategori',
    fittings: 'Fitting',
    sizes: 'Ukuran',
    size_charts: 'Size Chart',
    orders: 'Pesanan',
    inventory: 'Inventori',
    warehouses: 'Gudang',
    reports: 'Laporan',
    users: 'Pengguna',
    roles: 'Role & Permission',
    settings: 'Pengaturan',
    banners: 'Banner',
    content: 'Konten',
    coupons: 'Kupon & Diskon',
    discounts: 'Diskon & Kupon',
    shipping: 'Pengiriman',
    city_shipping: 'Ongkir Kota',
    exchange_rates: 'Kurs Mata Uang',
    activity_logs: 'Log Aktivitas',
    other: 'Lainnya'
  };

  const moduleIcons = {
    dashboard: '📊',
    products: '📦',
    categories: '📁',
    fittings: '👖',
    sizes: '📏',
    size_charts: '📐',
    orders: '🛒',
    inventory: '📋',
    warehouses: '🏭',
    reports: '📈',
    users: '👥',
    roles: '🔐',
    settings: '⚙️',
    banners: '🖼️',
    content: '📝',
    coupons: '🎫',
    discounts: '🎫',
    shipping: '🚚',
    city_shipping: '🏙️',
    exchange_rates: '💱',
    activity_logs: '📜',
    other: '📌'
  };

  // Stats
  const totalRoles = roles.length;
  const totalPermissions = permissions.length;
  const totalUsersWithRoles = users.filter(u => u.roles && u.roles.length > 0).length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FaKey className="text-purple-600" />
            </div>
            Role & Permission
          </h1>
          <p className="text-gray-500 mt-1">Kelola hak akses dan permission pengguna</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleInitPermissions}
            disabled={initLoading}
            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 shadow-lg shadow-amber-500/30 transition-all text-sm disabled:opacity-50"
            title="Inisialisasi semua permission default"
          >
            {initLoading ? <FaSpinner className="animate-spin" /> : <FaSyncAlt />} Init Permissions
          </button>
          <button
            onClick={handleCreateSuperadmin}
            disabled={initLoading}
            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 shadow-lg shadow-red-500/30 transition-all text-sm disabled:opacity-50"
            title="Buat role Superadmin dengan semua permission"
          >
            {initLoading ? <FaSpinner className="animate-spin" /> : <FaCrown />} Buat Superadmin
          </button>
          <button
            onClick={() => setShowSuperadminModal(true)}
            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg hover:from-yellow-600 hover:to-yellow-700 shadow-lg shadow-yellow-500/30 transition-all text-sm"
            title="Tetapkan Superadmin ke user"
          >
            <FaCrown /> Assign Superadmin
          </button>
          <button
            onClick={() => setShowAssignModal(true)}
            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 shadow-lg shadow-green-500/30 transition-all text-sm"
          >
            <FaUsers /> Tetapkan Role
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30 transition-all text-sm"
          >
            <FaPlus /> Tambah Role
          </button>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex justify-between items-center">
          <span className="flex items-center gap-2">
            <FaExclamationTriangle className="text-red-500" /> {error}
          </span>
          <button onClick={() => setError('')} className="p-1 hover:bg-red-100 rounded">
            <FaTimes />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex justify-between items-center">
          <span className="flex items-center gap-2">
            <FaCheck className="text-green-500" /> {success}
          </span>
          <button onClick={() => setSuccess('')} className="p-1 hover:bg-green-100 rounded">
            <FaTimes />
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Role</p>
              <p className="text-3xl font-bold text-gray-800">{totalRoles}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <FaUserShield className="text-purple-600 text-2xl" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Permission</p>
              <p className="text-3xl font-bold text-gray-800">{totalPermissions}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FaKey className="text-blue-600 text-2xl" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">User dengan Role</p>
              <p className="text-3xl font-bold text-gray-800">{totalUsersWithRoles}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FaUsers className="text-green-600 text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-10 text-center bg-white rounded-xl shadow-sm">
          <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
          <p className="text-gray-500">Memuat data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Roles List */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-indigo-50">
              <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <FaUserShield className="text-purple-600" /> Daftar Role
              </h2>
              <p className="text-sm text-gray-500 mt-1">Manage role dan hak akses</p>
            </div>
            <div className="divide-y max-h-[500px] overflow-auto">
              {roles.map((role) => (
                <div key={role.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${role.is_system ? 'bg-amber-100' : 'bg-blue-100'}`}>
                          <FaUserShield className={role.is_system ? 'text-amber-600' : 'text-blue-600'} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{role.name}</h3>
                          {role.is_system && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded font-medium">
                              System Role
                            </span>
                          )}
                        </div>
                      </div>
                      {role.description && (
                        <p className="text-sm text-gray-500 mt-2 ml-11">{role.description}</p>
                      )}
                      <div className="flex gap-4 mt-2 ml-11">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <FaKey className="text-blue-400" /> {role.permission_count || 0} permission
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <FaUsers className="text-green-400" /> {role.user_count || 0} user
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleOpenModal(role)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Role"
                      >
                        <FaEdit size={16} />
                      </button>
                      {!role.is_system && (
                        <button
                          onClick={() => handleDelete(role.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus Role"
                        >
                          <FaTrash size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {roles.length === 0 && (
                <div className="p-8 text-center">
                  <FaUserShield className="text-4xl text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">Belum ada role</p>
                </div>
              )}
            </div>
          </div>

          {/* Users with Roles */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gradient-to-r from-green-50 to-emerald-50">
              <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <FaUsers className="text-green-600" /> User & Role
              </h2>
              <p className="text-sm text-gray-500 mt-1">Lihat dan kelola role per user</p>
            </div>
            <div className="divide-y max-h-[500px] overflow-auto">
              {users.map((user) => (
                <div key={user.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                          user.role === 'admin' ? 'bg-gradient-to-br from-red-500 to-red-600' :
                          user.role === 'staff' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                          'bg-gradient-to-br from-gray-400 to-gray-500'
                        }`}>
                          {(user.name || user.full_name || 'U')[0].toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-800">{user.name || user.full_name}</h3>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3 ml-12">
                        {user.roles && user.roles.length > 0 ? user.roles.map(role => (
                          <span 
                            key={role.id}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-xs rounded-full font-medium"
                          >
                            <FaUserShield className="text-xs" />
                            {role.name}
                            <button
                              onClick={() => handleRemoveUserRole(user.id, role.id)}
                              className="ml-1 hover:text-red-600 transition-colors"
                              title="Hapus role"
                            >
                              <FaTimes className="text-xs" />
                            </button>
                          </span>
                        )) : (
                          <span className="text-xs text-gray-400 italic">Tidak ada role ditambahkan</span>
                        )}
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                      user.role === 'admin' 
                        ? 'bg-red-100 text-red-700' 
                        : user.role === 'staff'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {user.role === 'admin' ? '🛡️ ' : user.role === 'staff' ? '👔 ' : '👤 '}{user.role}
                    </span>
                  </div>
                </div>
              ))}
              {users.length === 0 && (
                <div className="p-8 text-center">
                  <FaUsers className="text-4xl text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">Belum ada user</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Role Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b bg-gradient-to-r from-purple-50 to-indigo-50">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  {editingRole ? <FaEdit className="text-purple-600" /> : <FaPlus className="text-purple-600" />}
                </div>
                {editingRole ? 'Edit Role' : 'Tambah Role Baru'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">Konfigurasi role dan permission yang dimiliki</p>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 max-h-[60vh] overflow-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Role <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50"
                      placeholder="contoh: Manager, Kasir, dll"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                    <input
                      type="text"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50"
                      placeholder="Deskripsi role"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-medium text-gray-700">Permissions</label>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {form.permissions.length} dipilih
                    </span>
                  </div>
                  <div className="space-y-4">
                    {Object.entries(groupedPermissions).map(([module, perms]) => (
                      <div key={module} className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 flex items-center gap-2">
                          <span className="text-xl">{moduleIcons[module] || '📌'}</span>
                          <h4 className="font-semibold text-gray-800">
                            {moduleLabels[module] || module}
                          </h4>
                          <span className="text-xs text-gray-500 ml-auto">
                            {perms.filter(p => form.permissions.includes(p.id)).length}/{perms.length}
                          </span>
                        </div>
                        <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                          {perms.map((perm) => (
                            <label 
                              key={perm.id}
                              className={`flex items-center gap-2 cursor-pointer p-2.5 rounded-lg border transition-all ${
                                form.permissions.includes(perm.id) 
                                  ? 'bg-purple-50 border-purple-300 text-purple-800' 
                                  : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={form.permissions.includes(perm.id)}
                                onChange={() => handleTogglePermission(perm.id)}
                                className="rounded text-purple-600 focus:ring-purple-500"
                              />
                              <span className="text-sm">{perm.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t flex gap-3 justify-end bg-gray-50">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-100 font-medium text-gray-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 font-medium shadow-lg shadow-purple-500/30 transition-all"
                >
                  {editingRole ? 'Update Role' : 'Simpan Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Role Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <FaUsers className="text-green-600" />
              </div>
              Tetapkan Role ke User
            </h3>
            <form onSubmit={handleAssignRole}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih User <span className="text-red-500">*</span>
                </label>
                <select
                  value={assignForm.user_id}
                  onChange={(e) => setAssignForm({ ...assignForm, user_id: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50"
                  required
                >
                  <option value="">-- Pilih User --</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name || user.full_name} ({user.email})</option>
                  ))}
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={assignForm.role_id}
                  onChange={(e) => setAssignForm({ ...assignForm, role_id: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50"
                  required
                >
                  <option value="">-- Pilih Role --</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 justify-end pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-100 font-medium text-gray-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 font-medium shadow-lg shadow-green-500/30 transition-all"
                >
                  Tetapkan Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Superadmin Modal */}
      {showSuperadminModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FaCrown className="text-yellow-600" />
              </div>
              Tetapkan Superadmin ke User
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Pilih user yang akan mendapatkan akses Superadmin dengan semua permission.
            </p>
            <form onSubmit={handleAssignSuperadmin}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih User <span className="text-red-500">*</span>
                </label>
                <select
                  value={superadminUserId}
                  onChange={(e) => setSuperadminUserId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-gray-50"
                  required
                >
                  <option value="">-- Pilih User --</option>
                  {users.filter(u => u.role === 'admin').map(user => (
                    <option key={user.id} value={user.id}>{user.name || user.full_name} ({user.email})</option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">Hanya user dengan role admin yang dapat dijadikan Superadmin</p>
              </div>
              <div className="flex gap-3 justify-end pt-4 border-t">
                <button
                  type="button"
                  onClick={() => { setShowSuperadminModal(false); setSuperadminUserId(''); }}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-100 font-medium text-gray-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={initLoading}
                  className="px-6 py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg hover:from-yellow-600 hover:to-yellow-700 font-medium shadow-lg shadow-yellow-500/30 transition-all disabled:opacity-50"
                >
                  {initLoading ? <FaSpinner className="animate-spin inline mr-2" /> : <FaCrown className="inline mr-2" />}
                  Tetapkan Superadmin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roles;
