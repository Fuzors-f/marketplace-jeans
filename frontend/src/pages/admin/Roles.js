import React, { useState, useEffect } from 'react';
import { 
  FaUserShield, FaPlus, FaEdit, FaTrash, 
  FaCheck, FaTimes, FaSpinner, FaUsers
} from 'react-icons/fa';
import api from '../../services/api';

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
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
      if (permissionsRes.data.success) setPermissions(permissionsRes.data.data);
      if (usersRes.data.success) setUsers(usersRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
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
    try {
      if (editingRole) {
        const response = await api.put(`/roles/${editingRole.id}`, form);
        if (response.data.success) {
          alert('Role berhasil diupdate!');
        }
      } else {
        const response = await api.post('/roles', form);
        if (response.data.success) {
          alert('Role berhasil ditambahkan!');
        }
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menyimpan role');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus role ini?')) {
      return;
    }
    try {
      const response = await api.delete(`/roles/${id}`);
      if (response.data.success) {
        alert('Role berhasil dihapus!');
        fetchData();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menghapus role');
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
    try {
      const response = await api.post('/roles/assign', assignForm);
      if (response.data.success) {
        alert('Role berhasil ditetapkan ke user!');
        setShowAssignModal(false);
        setAssignForm({ role_id: '', user_id: '' });
        fetchData();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menetapkan role');
    }
  };

  const handleRemoveUserRole = async (userId, roleId) => {
    if (!window.confirm('Hapus role dari user ini?')) return;
    try {
      await api.delete(`/roles/assign/${userId}/${roleId}`);
      fetchData();
    } catch (error) {
      alert('Gagal menghapus role');
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
    orders: 'Pesanan',
    inventory: 'Inventori',
    warehouses: 'Gudang',
    reports: 'Laporan',
    users: 'Pengguna',
    roles: 'Role & Permission',
    settings: 'Pengaturan',
    other: 'Lainnya'
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Role & Permission</h1>
          <p className="text-gray-600">Kelola hak akses pengguna</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAssignModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <FaUsers /> Tetapkan Role
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FaPlus /> Tambah Role
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-10 text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
          <p className="text-gray-500">Memuat data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Roles List */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="font-bold text-lg">Daftar Role</h2>
            </div>
            <div className="divide-y">
              {roles.map((role) => (
                <div key={role.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <FaUserShield className="text-blue-600" />
                        <h3 className="font-semibold">{role.name}</h3>
                        {role.is_system && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                            System
                          </span>
                        )}
                      </div>
                      {role.description && (
                        <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {role.permission_count || 0} permission • {role.user_count || 0} user
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenModal(role)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <FaEdit />
                      </button>
                      {!role.is_system && (
                        <button
                          onClick={() => handleDelete(role.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Users with Roles */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="font-bold text-lg">User & Role</h2>
            </div>
            <div className="divide-y max-h-[500px] overflow-auto">
              {users.map((user) => (
                <div key={user.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{user.name}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {user.roles?.map(role => (
                          <span 
                            key={role.id}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {role.name}
                            <button
                              onClick={() => handleRemoveUserRole(user.id, role.id)}
                              className="hover:text-red-600"
                            >
                              <FaTimes />
                            </button>
                          </span>
                        )) || (
                          <span className="text-xs text-gray-500">Tidak ada role</span>
                        )}
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Role Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="text-lg font-bold">
                {editingRole ? 'Edit Role' : 'Tambah Role Baru'}
              </h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 max-h-[60vh] overflow-auto">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nama Role</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Manager"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Deskripsi</label>
                    <input
                      type="text"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Deskripsi role"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-4">Permissions</label>
                  <div className="space-y-4">
                    {Object.entries(groupedPermissions).map(([module, perms]) => (
                      <div key={module} className="border rounded-lg p-4">
                        <h4 className="font-medium text-gray-700 mb-3">
                          {moduleLabels[module] || module}
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {perms.map((perm) => (
                            <label 
                              key={perm.id}
                              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                            >
                              <input
                                type="checkbox"
                                checked={form.permissions.includes(perm.id)}
                                onChange={() => handleTogglePermission(perm.id)}
                                className="rounded text-blue-600"
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
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingRole ? 'Update' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Role Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Tetapkan Role ke User</h3>
            <form onSubmit={handleAssignRole}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Pilih User</label>
                <select
                  value={assignForm.user_id}
                  onChange={(e) => setAssignForm({ ...assignForm, user_id: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Pilih User</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Pilih Role</label>
                <select
                  value={assignForm.role_id}
                  onChange={(e) => setAssignForm({ ...assignForm, role_id: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Pilih Role</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Tetapkan
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
