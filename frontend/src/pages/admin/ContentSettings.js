import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import apiClient from '../../services/api';
import { 
  FaGlobe, FaSave, FaSpinner, FaEdit, FaTrash, FaPlus,
  FaLanguage, FaImage, FaLink, FaCheck
} from 'react-icons/fa';
import { useAlert } from '../../utils/AlertContext';
import Modal, { ModalFooter } from '../../components/admin/Modal';

const ContentSettings = () => {
  const { showSuccess, showError: showAlertError, showConfirm } = useAlert();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  const [contents, setContents] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({
    section_key: '',
    section_name: '',
    title_id: '',
    title_en: '',
    subtitle_id: '',
    subtitle_en: '',
    content_id: '',
    content_en: '',
    button_text_id: '',
    button_text_en: '',
    button_url: '',
    image_url: '',
    is_active: true,
    sort_order: 0
  });

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/content/admin/all');
      if (response.data.success) {
        setContents(response.data.data);
      }
    } catch (err) {
      setError('Gagal memuat data konten');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (content) => {
    setFormData({
      section_key: content.section_key,
      section_name: content.section_name,
      title_id: content.title_id || '',
      title_en: content.title_en || '',
      subtitle_id: content.subtitle_id || '',
      subtitle_en: content.subtitle_en || '',
      content_id: content.content_id || '',
      content_en: content.content_en || '',
      button_text_id: content.button_text_id || '',
      button_text_en: content.button_text_en || '',
      button_url: content.button_url || '',
      image_url: content.image_url || '',
      is_active: content.is_active,
      sort_order: content.sort_order || 0
    });
    setEditingId(content.id);
    setFormError('');
    setShowModal(true);
  };

  const handleCreate = () => {
    setFormData({
      section_key: '',
      section_name: '',
      title_id: '',
      title_en: '',
      subtitle_id: '',
      subtitle_en: '',
      content_id: '',
      content_en: '',
      button_text_id: '',
      button_text_en: '',
      button_url: '',
      image_url: '',
      is_active: true,
      sort_order: contents.length + 1
    });
    setEditingId(null);
    setFormError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setFormError('');
      
      // Validation (issues #17, #18)
      if (!formData.section_key || !formData.section_name) {
        setFormError('Section Key dan Section Name wajib diisi');
        setSaving(false);
        return;
      }
      
      // Validate title (at least one language required)
      if (!formData.title_id && !formData.title_en) {
        setFormError('Minimal satu judul (ID atau EN) wajib diisi');
        setSaving(false);
        return;
      }

      // Validate content (at least one language required)
      if (!formData.content_id && !formData.content_en) {
        setFormError('Minimal satu konten (ID atau EN) wajib diisi');
        setSaving(false);
        return;
      }

      // Validate image URL
      if (!formData.image_url) {
        setFormError('URL Gambar wajib diisi');
        setSaving(false);
        return;
      }

      if (editingId) {
        await apiClient.put(`/content/${editingId}`, formData);
        showSuccess('Konten berhasil diupdate');
      } else {
        await apiClient.post('/content', formData);
        showSuccess('Konten berhasil dibuat');
      }
      
      setShowModal(false);
      fetchContents();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Gagal menyimpan konten');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, sectionKey) => {
    showConfirm(`Yakin ingin menghapus konten "${sectionKey}"?`, async () => {
      try {
        await apiClient.delete(`/content/${id}`);
        showSuccess('Konten berhasil dihapus');
        fetchContents();
      } catch (err) {
        showAlertError('Gagal menghapus konten');
      }
    }, { title: 'Konfirmasi Hapus' });
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await apiClient.put(`/content/${id}`, { is_active: !currentStatus });
      fetchContents();
    } catch (err) {
      setError('Gagal mengubah status');
    }
  };

  return (
    <>
      <Helmet>
        <title>Pengaturan Konten - Admin</title>
      </Helmet>

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FaGlobe className="text-blue-600" />
              Pengaturan Konten Website
            </h1>
            <p className="text-gray-600 mt-1">
              Kelola konten halaman depan dalam dua bahasa (Indonesia dan English)
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FaPlus />
            Tambah Konten
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <FaCheck />
            {success}
          </div>
        )}

        {/* Content List */}
        {loading ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <FaSpinner className="animate-spin text-3xl mx-auto text-gray-400" />
            <p className="text-gray-500 mt-2">Memuat data...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Section</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Judul (ID)</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Title (EN)</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Status</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Urutan</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {contents.map((content) => (
                    <tr key={content.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium">{content.section_name}</div>
                        <div className="text-xs text-gray-500">{content.section_key}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="max-w-xs truncate">{content.title_id || '-'}</div>
                        {content.subtitle_id && (
                          <div className="text-xs text-gray-500 truncate">{content.subtitle_id}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="max-w-xs truncate">{content.title_en || '-'}</div>
                        {content.subtitle_en && (
                          <div className="text-xs text-gray-500 truncate">{content.subtitle_en}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggleActive(content.id, content.is_active)}
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            content.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {content.is_active ? 'Aktif' : 'Nonaktif'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center text-sm">
                        {content.sort_order}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleEdit(content)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <FaEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(content.id, content.section_key)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Edit/Create Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingId ? 'Edit Konten' : 'Tambah Konten Baru'}
          size="4xl"
        >
          <div className="space-y-6">
                {/* Form Error Display */}
                {formError && (
                  <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">{formError}</div>
                )}
                
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Section Key *</label>
                    <input
                      type="text"
                      value={formData.section_key}
                      onChange={(e) => setFormData(prev => ({ ...prev, section_key: e.target.value }))}
                      disabled={!!editingId}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      placeholder="hero, featured, promo, dll"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Section Name *</label>
                    <input
                      type="text"
                      value={formData.section_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, section_name: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nama tampilan section"
                    />
                  </div>
                </div>

                {/* Bilingual Title */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FaGlobe className="text-gray-500" />
                    Judul / Title <span className="text-red-500">*</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        🇮🇩 Bahasa Indonesia
                      </label>
                      <input
                        type="text"
                        value={formData.title_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, title_id: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Judul dalam Bahasa Indonesia"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        🇬🇧 English
                      </label>
                      <input
                        type="text"
                        value={formData.title_en}
                        onChange={(e) => setFormData(prev => ({ ...prev, title_en: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Title in English"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">* Minimal satu bahasa wajib diisi</p>
                </div>

                {/* Bilingual Subtitle */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Subtitle</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">🇮🇩 Bahasa Indonesia</label>
                      <textarea
                        value={formData.subtitle_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, subtitle_id: e.target.value }))}
                        rows={2}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Subtitle dalam Bahasa Indonesia"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">🇬🇧 English</label>
                      <textarea
                        value={formData.subtitle_en}
                        onChange={(e) => setFormData(prev => ({ ...prev, subtitle_en: e.target.value }))}
                        rows={2}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Subtitle in English"
                      />
                    </div>
                  </div>
                </div>

                {/* Bilingual Content */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Konten / Content <span className="text-red-500">*</span></h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">🇮🇩 Bahasa Indonesia</label>
                      <textarea
                        value={formData.content_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, content_id: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Konten dalam Bahasa Indonesia"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">🇬🇧 English</label>
                      <textarea
                        value={formData.content_en}
                        onChange={(e) => setFormData(prev => ({ ...prev, content_en: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Content in English"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">* Minimal satu bahasa wajib diisi</p>
                </div>

                {/* Button Text */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Teks Tombol / Button Text</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">🇮🇩 Bahasa Indonesia</label>
                      <input
                        type="text"
                        value={formData.button_text_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, button_text_id: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Belanja Sekarang"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">🇬🇧 English</label>
                      <input
                        type="text"
                        value={formData.button_text_en}
                        onChange={(e) => setFormData(prev => ({ ...prev, button_text_en: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Shop Now"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        <FaLink className="inline mr-1" />
                        URL Tombol
                      </label>
                      <input
                        type="text"
                        value={formData.button_url}
                        onChange={(e) => setFormData(prev => ({ ...prev, button_url: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="/products"
                      />
                    </div>
                  </div>
                </div>

                {/* Image & Settings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      <FaImage className="inline mr-1" />
                      URL Gambar <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.image_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="/uploads/content/hero.jpg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Urutan</label>
                    <input
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer mt-6">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                        className="w-5 h-5 text-blue-600 rounded"
                      />
                      <span className="font-medium">Aktif</span>
                    </label>
                  </div>
                </div>
              </div>

            <ModalFooter>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <FaSave />
                    Simpan
                  </>
                )}
              </button>
            </ModalFooter>
        </Modal>
      </div>
    </>
  );
};

export default ContentSettings;
