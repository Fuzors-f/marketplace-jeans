import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import apiClient from '../../services/api';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [fittings, setFittings] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
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
    is_featured: false
  });

  // Variant form state
  const [variantForm, setVariantForm] = useState({
    size_id: '',
    sku_variant: '',
    additional_price: 0,
    stock_quantity: 0
  });
  const [productVariants, setProductVariants] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchFittings();
    fetchSizes();
    fetchWarehouses();
  }, [currentPage]);

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

  const fetchWarehouses = async () => {
    try {
      const response = await apiClient.get('/warehouses');
      setWarehouses(response.data.data || []);
    } catch (err) {
      console.error('Error fetching warehouses:', err);
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
        setSuccess('Produk berhasil diupdate!');
        setProducts(products.map(p =>
          p.id === editingProduct.id ? { ...p, ...payload } : p
        ));
      } else {
        productResponse = await apiClient.post('/products', payload);
        setSuccess('Produk berhasil dibuat!');
        fetchProducts();
      }

      // Handle size variant creation
      if (selectedSizes.length > 0) {
        const productId = editingProduct ? editingProduct.id : productResponse.data.data.id;
        
        try {
          for (const sizeId of selectedSizes) {
            // Check if variant already exists (for edit case)
            const variantExists = productVariants.some(v => v.size_id == sizeId);
            if (!variantExists) {
              const variantRes = await apiClient.post(`/products/${productId}/variants`, {
                size_id: sizeId,
                sku_variant: `${formData.sku}-${sizeId}`,
                additional_price: 0,
                stock_quantity: 0
              });
              
              // Create stock entries for selected warehouses
              if (selectedWarehouses.length > 0) {
                const variantId = variantRes.data.data?.id || variantRes.data.data;
                for (const warehouseId of selectedWarehouses) {
                  try {
                    await apiClient.post('/stock/variant', {
                      product_variant_id: variantId,
                      warehouse_id: warehouseId,
                      quantity: 0,
                      min_stock: 5,
                      cost_price: formData.master_cost_price || 0
                    });
                  } catch (stockErr) {
                    console.error(`Error creating stock for warehouse ${warehouseId}:`, stockErr);
                  }
                }
              }
            }
          }
        } catch (varErr) {
          console.error('Error creating variants:', varErr);
          // Don't fail the whole operation if variants fail
        }
      }
      if (selectedImages.length > 0) {
        const productId = editingProduct ? editingProduct.id : productResponse.data.data.id;
        const imageFormData = new FormData();
        
        selectedImages.forEach((image, index) => {
          imageFormData.append('images', image);
        });

        try {
          await apiClient.post(`/products/${productId}/images`, imageFormData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        } catch (imgErr) {
          console.error('Error uploading images:', imgErr);
          setError('Produk berhasil disimpan, tetapi gagal mengupload gambar');
        }
      }

      resetForm();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan produk');
    }
  };

  const handleAddVariant = async () => {
    if (!selectedProduct) return;
    
    try {
      await apiClient.post(`/products/${selectedProduct.id}/variants`, {
        ...variantForm,
        additional_price: parseFloat(variantForm.additional_price) || 0,
        stock_quantity: parseInt(variantForm.stock_quantity) || 0
      });
      setSuccess('Varian berhasil ditambahkan!');
      fetchProductVariants(selectedProduct.id);
      setVariantForm({
        size_id: '',
        sku_variant: '',
        additional_price: 0,
        stock_quantity: 0
      });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menambah varian');
    }
  };

  const handleDeleteVariant = async (variantId) => {
    if (!window.confirm('Yakin ingin menghapus varian ini?')) return;
    
    try {
      await apiClient.delete(`/products/variants/${variantId}`);
      setSuccess('Varian berhasil dihapus!');
      fetchProductVariants(selectedProduct.id);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Gagal menghapus varian');
    }
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
    if (!window.confirm('Yakin ingin menghapus produk ini?')) return;
    
    try {
      await apiClient.delete(`/products/${productId}`);
      setSuccess('Produk berhasil dihapus!');
      setProducts(products.filter(p => p.id !== productId));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Gagal menghapus produk: ' + err.message);
    }
  };

  const handleManageVariants = (product) => {
    setSelectedProduct(product);
    fetchProductVariants(product.id);
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
              <p className="text-gray-600">Kelola data produk jeans</p>
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

                {/* Size Selection */}
                <div>
                  <label className="block text-sm font-semibold mb-3">Pilih Ukuran (Size)</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {sizes.map(size => (
                      <label key={size.id} className="flex items-center cursor-pointer p-3 border rounded hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={selectedSizes.includes(size.id)}
                          onChange={() => handleSizeToggle(size.id)}
                          className="mr-2 w-4 h-4 rounded"
                        />
                        <span className="text-sm font-medium">{size.name}</span>
                      </label>
                    ))}
                  </div>
                  {selectedSizes.length > 0 && (
                    <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                      <p className="text-sm text-blue-800">
                        ✓ Terpilih: <strong>{selectedSizes.length} ukuran</strong> akan dibuat variannya
                      </p>
                    </div>
                  )}
                </div>

                {/* Warehouse Selection */}
                <div>
                  <label className="block text-sm font-semibold mb-3">Pilih Gudang untuk Stok (Optional)</label>
                  <p className="text-xs text-gray-600 mb-3">Pilih gudang tempat varian ini akan di-track untuk stok</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {warehouses && warehouses.length > 0 ? (
                      warehouses.map(warehouse => (
                        <label key={warehouse.id} className="flex items-center cursor-pointer p-3 border rounded hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={selectedWarehouses.includes(warehouse.id)}
                            onChange={() => handleWarehouseToggle(warehouse.id)}
                            className="mr-2 w-4 h-4 rounded"
                          />
                          <div>
                            <span className="text-sm font-medium">{warehouse.name}</span>
                            <p className="text-xs text-gray-500">{warehouse.location || 'Lokasi tidak tersedia'}</p>
                          </div>
                        </label>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">Tidak ada gudang tersedia</p>
                    )}
                  </div>
                  {selectedWarehouses.length > 0 && (
                    <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                      <p className="text-sm text-green-800">
                        ✓ Terpilih: <strong>{selectedWarehouses.length} gudang</strong> akan dibuat stoknya
                      </p>
                    </div>
                  )}
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
                              src={image.url || `/uploads/products/${image.filename}`}
                              alt={`Product ${index + 1}`}
                              className="w-full h-24 object-cover rounded border"
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
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
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
                  <div className="mb-6 p-4 bg-gray-50 rounded">
                    <h3 className="font-semibold mb-3">Tambah Varian Baru</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <select
                        name="size_id"
                        value={variantForm.size_id}
                        onChange={handleVariantChange}
                        className="px-3 py-2 border rounded"
                      >
                        <option value="">Pilih Size</option>
                        {sizes.map(size => (
                          <option key={size.id} value={size.id}>{size.name}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        name="sku_variant"
                        value={variantForm.sku_variant}
                        onChange={handleVariantChange}
                        placeholder="SKU Varian"
                        className="px-3 py-2 border rounded"
                      />
                      <input
                        type="number"
                        name="additional_price"
                        value={variantForm.additional_price}
                        onChange={handleVariantChange}
                        placeholder="Tambahan Harga"
                        className="px-3 py-2 border rounded"
                      />
                      <input
                        type="number"
                        name="stock_quantity"
                        value={variantForm.stock_quantity}
                        onChange={handleVariantChange}
                        placeholder="Stok"
                        className="px-3 py-2 border rounded"
                      />
                    </div>
                    <button
                      onClick={handleAddVariant}
                      className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Tambah Varian
                    </button>
                  </div>

                  {/* Daftar Varian */}
                  <table className="w-full">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="px-4 py-2 text-left">Size</th>
                        <th className="px-4 py-2 text-left">SKU</th>
                        <th className="px-4 py-2 text-right">Tambahan Harga</th>
                        <th className="px-4 py-2 text-right">Stok</th>
                        <th className="px-4 py-2 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productVariants.map(variant => (
                        <tr key={variant.id} className="border-t">
                          <td className="px-4 py-2">{variant.size_name}</td>
                          <td className="px-4 py-2">{variant.sku_variant}</td>
                          <td className="px-4 py-2 text-right">
                            Rp {parseFloat(variant.additional_price).toLocaleString('id-ID')}
                          </td>
                          <td className="px-4 py-2 text-right">{variant.stock_quantity}</td>
                          <td className="px-4 py-2 text-center">
                            <button
                              onClick={() => handleDeleteVariant(variant.id)}
                              className="text-red-600 hover:underline"
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))}
                      {productVariants.length === 0 && (
                        <tr>
                          <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
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
            <div className="bg-white rounded shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Produk</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Kategori</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Fitting</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold">Harga</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold">Stok</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold">Status</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-t hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {product.primary_image && (
                            <img
                              src={product.primary_image}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded mr-3"
                            />
                          )}
                          <div>
                            <p className="font-semibold">{product.name}</p>
                            <p className="text-xs text-gray-500">SKU: {product.sku || '-'}</p>
                            {product.short_description && (
                              <p className="text-xs text-gray-400 mt-1">{product.short_description.substring(0, 50)}...</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm">{product.category_name || '-'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm">{product.fitting_name || '-'}</span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold">
                        <div>
                          <p>Rp {parseFloat(product.base_price).toLocaleString('id-ID')}</p>
                          {product.master_cost_price && (
                            <p className="text-xs text-gray-500">
                              Modal: Rp {parseFloat(product.master_cost_price).toLocaleString('id-ID')}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`font-medium ${
                          (product.total_stock || 0) <= 5 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {product.total_stock || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded text-xs font-semibold ${
                          product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {product.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleManageVariants(product)}
                            className="text-purple-600 hover:underline text-sm"
                          >
                            Varian
                          </button>
                          <button
                            onClick={() => handleEdit(product)}
                            className="text-blue-600 hover:underline text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:underline text-sm"
                          >
                            Hapus
                          </button>
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
