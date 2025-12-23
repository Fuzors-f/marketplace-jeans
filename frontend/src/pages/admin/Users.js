import React, { useState, useEffect } from 'react';
import { FaUserEdit, FaTrash, FaUserShield, FaUser, FaUserTie, FaTimes } from 'react-icons/fa';
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
    </div>
  );
}
