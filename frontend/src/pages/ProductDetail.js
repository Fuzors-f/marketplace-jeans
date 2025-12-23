import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import api from '../services/api';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/products/${slug}`);
      if (response.data.success) {
        setProduct(response.data.data);
        // Auto-select first available variant
        const availableVariants = response.data.data.variants?.filter(v => v.stock_quantity > 0);
        if (availableVariants?.length > 0) {
          setSelectedVariant(availableVariants[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Produk tidak ditemukan atau terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      alert('Pilih ukuran terlebih dahulu');
      return;
    }
    
    if (quantity > selectedVariant.stock_quantity) {
      alert('Jumlah melebihi stok yang tersedia');
      return;
    }

    try {
      setAddingToCart(true);
      const response = await api.post('/cart', {
        product_variant_id: selectedVariant.id,
        quantity: quantity
      });
      
      if (response.data.success) {
        alert('Produk berhasil ditambahkan ke keranjang!');
        // Optionally dispatch to redux to update cart count
      }
    } catch (err) {
      if (err.response?.status === 401) {
        alert('Silakan login terlebih dahulu');
        navigate('/login');
      } else {
        alert(err.response?.data?.message || 'Gagal menambahkan ke keranjang');
      }
    } finally {
      setAddingToCart(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  const calculatePrice = () => {
    if (!product) return 0;
    const basePrice = parseFloat(product.base_price) || 0;
    const additionalPrice = selectedVariant ? parseFloat(selectedVariant.additional_price) || 0 : 0;
    return basePrice + additionalPrice;
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '/placeholder-product.jpg';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${imageUrl}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Produk Tidak Ditemukan</h2>
        <p className="text-gray-600 mb-6">{error || 'Produk yang Anda cari tidak tersedia'}</p>
        <button
          onClick={() => navigate('/catalog')}
          className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800"
        >
          Kembali ke Katalog
        </button>
      </div>
    );
  }

  const images = product.images || [];
  const variants = product.variants || [];
  const currentImage = images[selectedImage]?.image_url || product.primary_image;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="text-sm mb-6">
          <ol className="flex items-center space-x-2">
            <li>
              <button onClick={() => navigate('/')} className="text-gray-500 hover:text-gray-700">
                Home
              </button>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <button onClick={() => navigate('/catalog')} className="text-gray-500 hover:text-gray-700">
                Katalog
              </button>
            </li>
            {product.category_name && (
              <>
                <li className="text-gray-400">/</li>
                <li>
                  <button 
                    onClick={() => navigate(`/catalog?category=${product.category_id}`)} 
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {product.category_name}
                  </button>
                </li>
              </>
            )}
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 font-medium">{product.name}</li>
          </ol>
        </nav>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            {/* Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={getImageUrl(currentImage)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/placeholder-product.jpg';
                  }}
                />
              </div>
              
              {/* Thumbnail Images */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((img, index) => (
                    <button
                      key={img.id || index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        selectedImage === index ? 'border-black' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={getImageUrl(img.image_url)}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/placeholder-product.jpg';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Name & Category */}
              <div>
                {product.category_name && (
                  <p className="text-sm text-gray-500 mb-1">{product.category_name}</p>
                )}
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{product.name}</h1>
                {product.fitting_name && (
                  <p className="text-sm text-gray-600 mt-1">Fitting: {product.fitting_name}</p>
                )}
              </div>

              {/* Price */}
              <div className="border-t border-b py-4">
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(calculatePrice())}
                </p>
                {selectedVariant && selectedVariant.additional_price > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    Harga dasar: {formatCurrency(product.base_price)} + Ukuran: {formatCurrency(selectedVariant.additional_price)}
                  </p>
                )}
              </div>

              {/* Size Selection */}
              <div>
                <h3 className="font-semibold mb-3">Pilih Ukuran</h3>
                <div className="flex flex-wrap gap-2">
                  {variants.length > 0 ? (
                    variants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => variant.stock_quantity > 0 && setSelectedVariant(variant)}
                        disabled={variant.stock_quantity <= 0}
                        className={`px-4 py-2 border rounded-lg text-sm font-medium transition ${
                          selectedVariant?.id === variant.id
                            ? 'border-black bg-black text-white'
                            : variant.stock_quantity > 0
                            ? 'border-gray-300 hover:border-gray-500'
                            : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed line-through'
                        }`}
                      >
                        {variant.size_name}
                        {variant.stock_quantity <= 0 && ' (Habis)'}
                      </button>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">Tidak ada ukuran tersedia</p>
                  )}
                </div>
                {selectedVariant && (
                  <p className="text-sm text-gray-500 mt-2">
                    Stok tersedia: {selectedVariant.stock_quantity}
                  </p>
                )}
              </div>

              {/* Quantity */}
              <div>
                <h3 className="font-semibold mb-3">Jumlah</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 border rounded-lg flex items-center justify-center hover:bg-gray-100"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      const max = selectedVariant?.stock_quantity || 99;
                      setQuantity(Math.min(Math.max(1, val), max));
                    }}
                    className="w-20 h-10 border rounded-lg text-center"
                    min="1"
                    max={selectedVariant?.stock_quantity || 99}
                  />
                  <button
                    onClick={() => {
                      const max = selectedVariant?.stock_quantity || 99;
                      setQuantity(Math.min(quantity + 1, max));
                    }}
                    className="w-10 h-10 border rounded-lg flex items-center justify-center hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart */}
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!selectedVariant || addingToCart}
                  className={`flex-1 py-3 rounded-lg font-semibold transition ${
                    selectedVariant && !addingToCart
                      ? 'bg-black text-white hover:bg-gray-800'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {addingToCart ? 'Menambahkan...' : 'Tambah ke Keranjang'}
                </button>
              </div>

              {/* SKU */}
              {product.sku && (
                <p className="text-sm text-gray-500">SKU: {product.sku}</p>
              )}
            </div>
          </div>

          {/* Product Description */}
          <div className="border-t p-6">
            <h2 className="text-xl font-bold mb-4">Deskripsi Produk</h2>
            {product.description ? (
              <div 
                className="prose max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: product.description.replace(/\n/g, '<br/>') }}
              />
            ) : (
              <p className="text-gray-500">Tidak ada deskripsi tersedia</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
