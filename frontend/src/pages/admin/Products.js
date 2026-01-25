import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import apiClient from '../../services/api';
import { getImageUrl, handleImageError, PLACEHOLDER_IMAGES } from '../../utils/imageUtils';
import { ActionButtonsContainer, EditButton, DeleteButton, StatsButton } from '../../components/admin/ActionButtons';
import { useAlert } from '../../utils/AlertContext';

const AdminProducts = () => {
  const { showSuccess, showError, showConfirm } = useAlert();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [fittings, setFittings] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [warehousesLoading, setWarehousesLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Image upload states
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  
  // Size selection state for product creation
  const [selectedSizes, setSelectedSizes] = useState([]);
  
  // Warehouse selection for variants
  const [selectedWarehouses, setSelectedWarehouses] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category_id: '',
    fitting_id: '',
    description: '',
    short_description: '',
    base_price: '',
    master_cost_price: '',
    sku: '',
    weight: '',
    is_active: true,
    is_featured: false,
    // Variant default values for new products
    initial_stock: 0,
    additional_price: 0
  });

  // Variant form state
  const [variantForm, setVariantForm] = useState({
    size_id: '',
    warehouse_id: '',
    sku_variant: '',
    additional_price: 0,
    stock_quantity: 0,
    minimum_stock: 5,
    cost_price: 0
  });
  const [productVariants, setProductVariants] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

  useEffect(() => {
    // Fetch master data only once on mount
    fetchCategories();
    fetchFittings();
    fetchSizes();
    fetchWarehouses();
  }, []); // Empty dependency array = runs once on mount

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/products?page=${currentPage}&limit=${itemsPerPage}&show_all=true`);
      setProducts(response.data.data || []);
      setTotalPages(response.data.pagination?.pages || 1);
      setError('');
    } catch (err) {
      setError('Gagal memuat produk: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/categories');
      setCategories(response.data.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchFittings = async () => {
    try {
      const response = await apiClient.get('/fittings');
      setFittings(response.data.data || []);
    } catch (err) {
      console.error('Error fetching fittings:', err);
    }
  };

  const fetchSizes = async () => {
    try {
      const response = await apiClient.get('/sizes');
      setSizes(response.data.data || []);
    } catch (err) {
      console.error('Error fetching sizes:', err);
    }
  };

  const fetchWarehouses = async (force = false) => {
    // Prevent duplicate calls unless forced
    if (warehousesLoading && !force) {
      console.log('Warehouse fetch already in progress, skipping...');
      return;
    }

    try {
      setWarehousesLoading(true);
      const response = await apiClient.get('/warehouses');
      console.log('Warehouses API Response:', response);
      console.log('Response data:', response.data);
      
      // Handle different response structures
      let warehouseData = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          // Direct array response
          warehouseData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          // { data: [...] } structure
          warehouseData = response.data.data;
        } else if (response.data.warehouses && Array.isArray(response.data.warehouses)) {
          // { warehouses: [...] } structure
          warehouseData = response.data.warehouses;
        } else if (typeof response.data === 'object' && !Array.isArray(response.data)) {
          // Single object or object with unknown structure - check for array-like properties
          const possibleArrays = Object.values(response.data).filter(v => Array.isArray(v));
          if (possibleArrays.length > 0) {
            warehouseData = possibleArrays[0];
          }
        }
      }
      
      console.log('Extracted warehouse data:', warehouseData);
      console.log('Is array?', Array.isArray(warehouseData));
      console.log('Length:', warehouseData.length);
      setWarehouses(warehouseData);
      console.log('Warehouses state updated');
    } catch (err) {
      console.error('Error fetching warehouses:', err);
      if (err.response?.status === 429) {
        setError('Terlalu banyak request. Silakan tunggu beberapa detik dan refresh halaman.');
      }
      setWarehouses([]); // Ensure it's always an array even on error
    } finally {
      setWarehousesLoading(false);
    }
  };

  const fetchProductVariants = async (productId) => {
    try {
      const response = await apiClient.get(`/products/${productId}/variants`);
      setProductVariants(response.data.data || []);
    } catch (err) {
      console.error('Error fetching variants:', err);
    }
  };

  const generateSlug = (name) => {
    return name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const handleSizeToggle = (sizeId) => {
    setSelectedSizes(prev => {
      if (prev.includes(sizeId)) {
        return prev.filter(id => id !== sizeId);
      } else {
        return [...prev, sizeId];
      }
    });
  };

  const handleWarehouseToggle = (warehouseId) => {
    setSelectedWarehouses(prev => {
      if (prev.includes(warehouseId)) {
        return prev.filter(id => id !== warehouseId);
      } else {
        return [...prev, warehouseId];
      }
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === 'checkbox' ? checked : value;
    
    setFormData((prev) => {
      const updated = { ...prev, [name]: newValue };
      if (name === 'name' && !editingProduct) {
        updated.slug = generateSlug(value);
      }
      return updated;
    });
  };

  const handleVariantChange = (e) => {
    const { name, value } = e.target;
    setVariantForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(prev => [...prev, ...files]);
    
    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, {
          file: file,
          url: e.target.result,
          isNew: true
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index, isExisting = false) => {
    if (isExisting) {
      setExistingImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setSelectedImages(prev => prev.filter((_, i) => i !== index));
      setImagePreviews(prev => prev.filter((_, i) => i !== index));
    }
  };

  const fetchProductImages = async (productId) => {
    try {
      const response = await apiClient.get(`/products/${productId}/images`);
      if (response.data.success) {
        setExistingImages(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching product images:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const payload = {
        ...formData,
        base_price: parseFloat(formData.base_price),
        master_cost_price: formData.master_cost_price ? parseFloat(formData.master_cost_price) : null,
        weight: formData.weight ? parseFloat(formData.weight) : 0,
        category_id: formData.category_id || null,
        fitting_id: formData.fitting_id || null
      };

      let productResponse;
      if (editingProduct) {
        productResponse = await apiClient.put(`/products/${editingProduct.id}`, payload);
        showSuccess('Produk berhasil diupdate!');
        setProducts(products.map(p =>
          p.id === editingProduct.id ? { ...p, ...payload } : p
        ));
      } else {
        productResponse = await apiClient.post('/products', payload);
        showSuccess('Produk berhasil dibuat! Silakan tambahkan varian melalui tombol "Kelola Varian".');
        fetchProducts();
      }

      // Upload images if any
      if (selectedImages.length > 0) {
        const productId = editingProduct ? editingProduct.id : productResponse.data.data.id;
        const imageFormData = new FormData();
        
        selectedImages.forEach((image, index) => {
          imageFormData.append('images', image);
        });

        try {
          await apiClient.post(`/products/${productId}/images`, imageFormData);
        } catch (imgErr) {
          console.error('Error uploading images:', imgErr);
          showError('Produk berhasil disimpan, tetapi gagal mengupload gambar');
        }
      }

      resetForm();
    } catch (err) {
      showError(err.response?.data?.message || 'Gagal menyimpan produk');
    }
  };

  const handleAddVariant = async () => {
    if (!selectedProduct) return;
    
    if (!variantForm.size_id || !variantForm.warehouse_id) {
      setError('Size dan Warehouse harus dipilih');
      return;
    }

    // Get size and warehouse names for auto SKU generation
    const selectedSize = sizes.find(s => s.id === parseInt(variantForm.size_id));
    const selectedWarehouse = warehouses.find(w => w.id === parseInt(variantForm.warehouse_id));
    
    // Auto-generate SKU if empty
    let skuVariant = variantForm.sku_variant;
    if (!skuVariant || skuVariant.trim() === '') {
      const productSku = selectedProduct.sku || selectedProduct.name.substring(0, 3).toUpperCase();
      const sizeName = selectedSize?.name || variantForm.size_id;
      const warehouseCode = selectedWarehouse?.code || `W${variantForm.warehouse_id}`;
      skuVariant = `${productSku}-${sizeName}-${warehouseCode}`.toUpperCase().replace(/\s+/g, '');
    }
    
    try {
      await apiClient.post(`/products/${selectedProduct.id}/variants`, {
        ...variantForm,
        sku_variant: skuVariant,
        size_id: parseInt(variantForm.size_id),
        warehouse_id: parseInt(variantForm.warehouse_id),
        additional_price: parseFloat(variantForm.additional_price) || 0,
        stock_quantity: parseInt(variantForm.stock_quantity) || 0,
        minimum_stock: parseInt(variantForm.minimum_stock) || 5,
        cost_price: parseFloat(variantForm.cost_price) || 0
      });
      showSuccess('Varian berhasil ditambahkan!');
      fetchProductVariants(selectedProduct.id);
      // Refresh product list to update stock count
      fetchProducts();
      setVariantForm({
        size_id: '',
        warehouse_id: '',
        sku_variant: '',
        additional_price: 0,
        stock_quantity: 0,
        minimum_stock: 5,
        cost_price: 0
      });
    } catch (err) {
      showError(err.response?.data?.message || 'Gagal menambah varian');
    }
  };

  const handleDeleteVariant = async (variantId) => {
    showConfirm('Yakin ingin menghapus varian ini?', async () => {
      try {
        await apiClient.delete(`/products/variants/${variantId}`);
        showSuccess('Varian berhasil dihapus!');
        fetchProductVariants(selectedProduct.id);
        // Refresh product list to update stock count
        fetchProducts();
      } catch (err) {
        showError('Gagal menghapus varian');
      }
    }, { title: 'Konfirmasi Hapus' });
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      category_id: product.category_id || '',
      fitting_id: product.fitting_id || '',
      description: product.description || '',
      short_description: product.short_description || '',
      base_price: product.base_price,
      master_cost_price: product.master_cost_price || '',
      sku: product.sku || '',
      weight: product.weight || '',
      is_active: product.is_active,
      is_featured: product.is_featured
    });
    
    // Clear image states and fetch existing images
    setSelectedImages([]);
    setImagePreviews([]);
    setExistingImages([]);
    
    // Fetch existing variants to show selected sizes
    fetchProductVariants(product.id);
    
    fetchProductImages(product.id);
    setShowForm(true);
  };

  const handleDelete = async (productId) => {
    showConfirm('Yakin ingin menghapus produk ini?', async () => {
      try {
        await apiClient.delete(`/products/${productId}`);
        showSuccess('Produk berhasil dihapus!');
        setProducts(products.filter(p => p.id !== productId));
      } catch (err) {
        showError('Gagal menghapus produk: ' + err.message);
      }
    }, { title: 'Konfirmasi Hapus' });
  };

  const handleManageVariants = async (product) => {
    setSelectedProduct(product);
    fetchProductVariants(product.id);
    // Always re-fetch warehouses to ensure data is available and fresh
    await fetchWarehouses(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      category_id: '',
      fitting_id: '',
      description: '',
      short_description: '',
      base_price: '',
      master_cost_price: '',
      sku: '',
      weight: '',
      is_active: true,
      is_featured: false
    });
    
    // Clear image states and selected sizes
    setSelectedImages([]);
    setImagePreviews([]);
    setExistingImages([]);
    setSelectedSizes([]);
    setSelectedWarehouses([]);
    
    setEditingProduct(null);
    setShowForm(false);
  };

  return (
    <>
      <Helmet>
        <title>Kelola Produk - Admin</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Manajemen Produk</h1>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowForm(!showForm);
              }}
              className="bg-black text-white px-6 py-2 rounded hover:bg-gray-900 font-semibold"
            >
              {showForm ? 'Batal' : 'Tambah Produk'}
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded">{error}</div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-100 text-green-700 rounded">{success}</div>
          )}

          {/* Form Produk */}
          {showForm && (
            <div className="mb-8 bg-white p-6 rounded shadow">
              <h2 className="text-xl font-bold mb-6">
                {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Nama Produk *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Slug</label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Kategori</label>
                    <select
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="">Pilih Kategori</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Fitting</label>
                    <select
                      name="fitting_id"
                      value={formData.fitting_id}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="">Pilih Fitting</option>
                      {fittings.map(fit => (
                        <option key={fit.id} value={fit.id}>{fit.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Harga Jual *</label>
                    <input
                      type="number"
                      name="base_price"
                      value={formData.base_price}
                      onChange={handleChange}
                      required
                      min="0"
                      className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Harga Modal</label>
                    <input
                      type="number"
                      name="master_cost_price"
                      value={formData.master_cost_price}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                
                  <div>
                    <label className="block text-sm font-semibold mb-2">SKU</label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Berat (kg)</label>
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Deskripsi Singkat</label>
                  <input
                    type="text"
                    name="short_description"
                    value={formData.short_description}
                    onChange={handleChange}
                    maxLength="500"
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Deskripsi Lengkap</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                {/* Image Upload Section */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Gambar Produk</label>
                  
                  {/* Existing Images */}
                  {existingImages.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2 text-gray-600">Gambar yang sudah ada:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {existingImages.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={getImageUrl(image.url || image.filename, 'products')}
                              alt={`Product ${index + 1}`}
                              className="w-full h-24 object-cover rounded border"
                              onError={(e) => handleImageError(e, 'product')}
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index, true)}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* New Images Preview */}
                  {imagePreviews.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2 text-gray-600">Gambar baru:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative">
                            <img
                              src={preview.url}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded border"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index, false)}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* File Input */}
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Pilih beberapa gambar sekaligus. Format: JPG, PNG, JPEG (Max 5MB per gambar)
                  </p>
                </div>

                <div className="flex gap-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span className="font-semibold">Aktif</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_featured"
                      checked={formData.is_featured}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span className="font-semibold">Produk Unggulan</span>
                  </label>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="bg-black text-white px-6 py-2 rounded hover:bg-gray-900 font-semibold"
                  >
                    {editingProduct ? 'Update Produk' : 'Simpan Produk'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-300 text-black px-6 py-2 rounded hover:bg-gray-400 font-semibold"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Modal Kelola Varian */}
          {selectedProduct && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Kelola Varian - {selectedProduct.name}</h2>
                    <button
                      onClick={() => setSelectedProduct(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Form Tambah Varian */}
                  <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <h3 className="font-bold text-lg mb-4 text-gray-800">Tambah Varian Baru</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      
                      {/* Size Input */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Size <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="size_id"
                          value={variantForm.size_id}
                          onChange={handleVariantChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="">-- Pilih Size --</option>
                          {Array.isArray(sizes) && sizes.map(size => (
                            <option key={size.id} value={size.id}>{size.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Warehouse Input */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Warehouse <span className="text-red-500">*</span>
                        </label>
                        {warehousesLoading ? (
                          <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                            Loading warehouses...
                          </div>
                        ) : (
                          <select
                            name="warehouse_id"
                            value={variantForm.warehouse_id}
                            onChange={handleVariantChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          >
                            <option value="">-- Pilih Warehouse --</option>
                            {Array.isArray(warehouses) && warehouses.length > 0 ? (
                              warehouses.map(warehouse => (
                                <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                              ))
                            ) : (
                              <option value="" disabled>Tidak ada warehouse tersedia</option>
                            )}
                          </select>
                        )}
                        {!warehousesLoading && (!warehouses || warehouses.length === 0) && (
                          <button
                            type="button"
                            onClick={() => fetchWarehouses(true)}
                            className="mt-2 text-sm text-blue-600 hover:underline"
                          >
                            Muat ulang warehouse
                          </button>
                        )}
                      </div>

                      {/* SKU Input */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          SKU Varian
                        </label>
                        <input
                          type="text"
                          name="sku_variant"
                          value={variantForm.sku_variant}
                          onChange={handleVariantChange}
                          placeholder="Contoh: JEAN-001-28-JKT"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      {/* Additional Price Input */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Tambahan Harga (Rp)
                        </label>
                        <input
                          type="number"
                          name="additional_price"
                          value={variantForm.additional_price}
                          onChange={handleVariantChange}
                          placeholder="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          min="0"
                        />
                      </div>

                      {/* Stock Quantity Input */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Stok Awal
                        </label>
                        <input
                          type="number"
                          name="stock_quantity"
                          value={variantForm.stock_quantity}
                          onChange={handleVariantChange}
                          placeholder="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          min="0"
                        />
                      </div>

                      {/* Min Stock Input */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Minimum Stok
                        </label>
                        <input
                          type="number"
                          name="minimum_stock"
                          value={variantForm.minimum_stock}
                          onChange={handleVariantChange}
                          placeholder="5"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          min="0"
                        />
                        <p className="text-xs text-gray-500 mt-1">Default: 5</p>
                      </div>

                      {/* Cost Price Input */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Harga Modal (Rp)
                        </label>
                        <input
                          type="number"
                          name="cost_price"
                          value={variantForm.cost_price}
                          onChange={handleVariantChange}
                          placeholder="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          min="0"
                          step="0.01"
                        />
                      </div>

                    </div>
                    
                    <div className="mt-4 flex items-center gap-3">
                      <button
                        onClick={handleAddVariant}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold shadow-md transition"
                      >
                        ✓ Tambah Varian
                      </button>
                      <p className="text-sm text-gray-600">
                        <span className="text-red-500">*</span> Wajib diisi
                      </p>
                    </div>
                  </div>

                  {/* Daftar Varian */}
                  <table className="w-full">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="px-4 py-2 text-left">Size</th>
                        <th className="px-4 py-2 text-left">Warehouse</th>
                        <th className="px-4 py-2 text-left">SKU</th>
                        <th className="px-4 py-2 text-right">Harga Tambah</th>
                        <th className="px-4 py-2 text-right">Stok</th>
                        <th className="px-4 py-2 text-right">Min Stok</th>
                        <th className="px-4 py-2 text-right">Harga Modal</th>
                        <th className="px-4 py-2 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productVariants.map(variant => (
                        <tr key={variant.id} className="border-t hover:bg-gray-50">
                          <td className="px-4 py-2">{variant.size_name || 'N/A'}</td>
                          <td className="px-4 py-2">{variant.warehouse_name || 'N/A'}</td>
                          <td className="px-4 py-2">{variant.sku_variant}</td>
                          <td className="px-4 py-2 text-right">
                            Rp {parseFloat(variant.additional_price || 0).toLocaleString('id-ID')}
                          </td>
                          <td className="px-4 py-2 text-right font-semibold">{variant.stock_quantity || 0}</td>
                          <td className="px-4 py-2 text-right">{variant.minimum_stock || 5}</td>
                          <td className="px-4 py-2 text-right">
                            Rp {parseFloat(variant.cost_price || 0).toLocaleString('id-ID')}
                          </td>
                          <td className="px-4 py-2 text-center">
                            <button
                              onClick={() => handleDeleteVariant(variant.id)}
                              className="text-red-600 hover:underline text-sm"
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))}
                      {productVariants.length === 0 && (
                        <tr>
                          <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                            Belum ada varian
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tabel Produk */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : products.length > 0 ? (
            <div className="bg-white rounded shadow overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-sm font-semibold whitespace-nowrap">Produk</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-sm font-semibold whitespace-nowrap">Kategori</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-sm font-semibold whitespace-nowrap">Fitting</th>
                    <th className="px-4 lg:px-6 py-3 text-right text-sm font-semibold whitespace-nowrap">Harga</th>
                    <th className="px-4 lg:px-6 py-3 text-center text-sm font-semibold whitespace-nowrap">Varian</th>
                    <th className="px-4 lg:px-6 py-3 text-center text-sm font-semibold whitespace-nowrap">Total Stok</th>
                    <th className="px-4 lg:px-6 py-3 text-center text-sm font-semibold whitespace-nowrap">Status</th>
                    <th className="px-4 lg:px-6 py-3 text-center text-sm font-semibold whitespace-nowrap">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 lg:px-6 py-4">
                        <div className="flex items-center">
                          <img
                            src={product.primary_image ? getImageUrl(product.primary_image, 'products') : PLACEHOLDER_IMAGES.product}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded mr-3 flex-shrink-0"
                            onError={(e) => handleImageError(e, 'product')}
                          />
                          <div className="min-w-0">
                            <p className="font-semibold truncate max-w-[150px] lg:max-w-none">{product.name}</p>
                            <p className="text-xs text-gray-500">SKU: {product.sku || '-'}</p>
                            {product.short_description && (
                              <p className="text-xs text-gray-400 mt-1 truncate max-w-[150px] lg:max-w-none">{product.short_description.substring(0, 50)}...</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span className="text-sm">{product.category_name || '-'}</span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span className="text-sm">{product.fitting_name || '-'}</span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-right font-semibold whitespace-nowrap">
                        <div>
                          <p>Rp {parseFloat(product.base_price).toLocaleString('id-ID')}</p>
                          {product.master_cost_price && (
                            <p className="text-xs text-gray-500">
                              Modal: Rp {parseFloat(product.master_cost_price).toLocaleString('id-ID')}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-center whitespace-nowrap">
                        <span className="font-medium text-sm">{product.variants_count || 0} varian</span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-center whitespace-nowrap">
                        <span className={`font-semibold text-sm ${
                          (product.total_stock || 0) <= 0 ? 'text-red-600' : 
                          (product.total_stock || 0) <= 10 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {product.total_stock || 0}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-center whitespace-nowrap">
                        <span className={`px-3 py-1 rounded text-xs font-semibold ${
                          product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {product.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-center whitespace-nowrap">
                        <div className="flex justify-center">
                          <ActionButtonsContainer>
                            <StatsButton onClick={() => handleManageVariants(product)} title="Kelola Varian" />
                            <EditButton onClick={() => handleEdit(product)} />
                            <DeleteButton onClick={() => handleDelete(product.id)} />
                          </ActionButtonsContainer>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4 flex justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-200 text-black rounded disabled:opacity-50"
                  >
                    Sebelumnya
                  </button>
                  <span className="px-4 py-2">
                    Halaman {currentPage} dari {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-200 text-black rounded disabled:opacity-50"
                  >
                    Selanjutnya
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded">
              <p className="text-gray-600">Tidak ada produk. Tambahkan produk pertama!</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminProducts;
