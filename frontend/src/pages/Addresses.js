import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import { useLanguage } from '../utils/i18n';
import { toast } from 'react-toastify';

const Addresses = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
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
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAddresses();
      if (response.data.success) {
        setAddresses(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast.error('Gagal memuat alamat');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const openAddModal = () => {
    setEditingAddress(null);
    setFormData({
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
    setShowModal(true);
  };

  const openEditModal = (address) => {
    setEditingAddress(address);
    setFormData({
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
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.recipient_name || !formData.phone || !formData.address || 
        !formData.city || !formData.province || !formData.postal_code) {
      toast.error('Mohon lengkapi semua field yang wajib');
      return;
    }

    try {
      setSaving(true);
      
      if (editingAddress) {
        await userAPI.updateAddress(editingAddress.id, formData);
        toast.success('Alamat berhasil diperbarui');
      } else {
        await userAPI.createAddress(formData);
        toast.success('Alamat berhasil ditambahkan');
      }
      
      setShowModal(false);
      fetchAddresses();
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error(error.response?.data?.message || 'Gagal menyimpan alamat');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus alamat ini?')) return;
    
    try {
      await userAPI.deleteAddress(id);
      toast.success('Alamat berhasil dihapus');
      fetchAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Gagal menghapus alamat');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await userAPI.setDefaultAddress(id);
      toast.success('Alamat utama berhasil diubah');
      fetchAddresses();
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error('Gagal mengubah alamat utama');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Alamat Saya - Marketplace Jeans</title>
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <button 
                onClick={() => navigate('/profile')}
                className="text-gray-600 hover:text-gray-900 mb-2 flex items-center gap-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Kembali ke Profil
              </button>
              <h1 className="text-2xl font-bold">Alamat Saya</h1>
              <p className="text-gray-600">Kelola alamat pengiriman Anda</p>
            </div>
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tambah Alamat
            </button>
          </div>

          {/* Address List */}
          {addresses.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="text-6xl mb-4">📍</div>
              <h2 className="text-xl font-semibold mb-2">Belum Ada Alamat</h2>
              <p className="text-gray-600 mb-6">Tambahkan alamat pengiriman untuk mempermudah checkout</p>
              <button
                onClick={openAddModal}
                className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800"
              >
                Tambah Alamat Pertama
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {addresses.map((address) => (
                <div 
                  key={address.id} 
                  className={`bg-white rounded-lg shadow p-6 border-2 ${
                    address.is_default ? 'border-black' : 'border-transparent'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-lg">{address.address_label || 'Alamat'}</span>
                        {address.is_default && (
                          <span className="px-2 py-0.5 bg-black text-white text-xs rounded">
                            Utama
                          </span>
                        )}
                      </div>
                      <p className="font-medium">{address.recipient_name}</p>
                      <p className="text-gray-600">{address.phone}</p>
                      <p className="text-gray-600 mt-2">
                        {address.address}
                      </p>
                      <p className="text-gray-600">
                        {address.city}, {address.province} {address.postal_code}
                      </p>
                      <p className="text-gray-600">{address.country}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(address)}
                        className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded"
                        title="Edit"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(address.id)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                        title="Hapus"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {!address.is_default && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="mt-4 text-sm text-gray-600 hover:text-black underline"
                    >
                      Jadikan Alamat Utama
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Add/Edit Address */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  {editingAddress ? 'Edit Alamat' : 'Tambah Alamat Baru'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Label Alamat
                  </label>
                  <input
                    type="text"
                    name="address_label"
                    value={formData.address_label}
                    onChange={handleInputChange}
                    placeholder="contoh: Rumah, Kantor"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Penerima <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="recipient_name"
                    value={formData.recipient_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nomor Telepon <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="08xxxxxxxxxx"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alamat Lengkap <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kota/Kabupaten <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Provinsi <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="province"
                      value={formData.province}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kode Pos <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="postal_code"
                      value={formData.postal_code}
                      onChange={handleInputChange}
                      required
                      maxLength={5}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Negara
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_default"
                    name="is_default"
                    checked={formData.is_default}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                  />
                  <label htmlFor="is_default" className="text-sm text-gray-700">
                    Jadikan sebagai alamat utama
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                  >
                    {saving ? 'Menyimpan...' : (editingAddress ? 'Perbarui' : 'Simpan')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Addresses;
