import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../redux/slices/productSlice';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import apiClient from '../services/api';
import { getProductImageUrl, handleImageError, PLACEHOLDER_IMAGES } from '../utils/imageUtils';

const Home = () => {
  const dispatch = useDispatch();
  const { products, isLoading } = useSelector((state) => state.products);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [homeData, setHomeData] = useState(null);
  const [homeLoading, setHomeLoading] = useState(true);
  const [homeError, setHomeError] = useState('');

  useEffect(() => {
    dispatch(fetchProducts({ limit: 12, is_featured: true }));
    fetchHomeData();
  }, [dispatch]);

  const fetchHomeData = async () => {
    try {
      setHomeLoading(true);
      const response = await apiClient.get('/home');
      setHomeData(response.data.data);
      setHomeError('');
    } catch (err) {
      console.error('Error fetching home data:', err);
      setHomeError('Failed to load homepage data');
    } finally {
      setHomeLoading(false);
    }
  };

  // Hero carousel slides - use backend banners or fallback to defaults
  const heroSlides = (homeData?.banners && homeData.banners.length > 0)
    ? homeData.banners.map((banner) => ({
        id: banner.id,
        image: banner.image_url,
        title: banner.title,
        subtitle: banner.subtitle,
        link: banner.link || '/products',
        linkText: 'BELANJA SEKARANG'
      }))
    : [
        {
          id: 1,
          image: 'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=1600&h=900&fit=crop',
          title: 'KOLEKSI MUSIM INI',
          subtitle: 'Tampil percaya diri dengan denim terbaru',
          link: '/products?category=new-arrivals',
          linkText: 'BELANJA SEKARANG'
        },
        {
          id: 2,
          image: 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=1600&h=900&fit=crop',
          title: 'BAGGY JEANS',
          subtitle: 'Gaya santai yang tetap stylish',
          link: '/products?fitting=baggy',
          linkText: 'TEMUKAN FITTING ANDA'
        },
        {
          id: 3,
          image: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=1600&h=900&fit=crop',
          title: 'DISKON HINGGA 40%',
          subtitle: 'Dapatkan koleksi favorit dengan harga spesial',
          link: '/products?discount=true',
          linkText: 'LIHAT PROMO'
        }
      ];

  // Category cards
  const categories = [
    {
      name: 'BOTTOMS PRIA',
      subtitle: 'Celana jeans untuk gaya maskulin',
      image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=600&fit=crop',
      link: '/products?category=bottoms&gender=pria'
    },
    {
      name: 'BOTTOMS WANITA',
      subtitle: 'Koleksi jeans wanita terlengkap',
      image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=600&fit=crop',
      link: '/products?category=bottoms&gender=wanita'
    },
    {
      name: 'JAKET DENIM',
      subtitle: 'Statement piece klasik',
      image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=400&h=600&fit=crop',
      link: '/products?category=jackets'
    },
    {
      name: 'AKSESORIS',
      subtitle: 'Lengkapi penampilanmu',
      image: 'https://images.unsplash.com/photo-1523779105320-d1cd346ff52b?w=400&h=600&fit=crop',
      link: '/products?category=accessories'
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  return (
    <>
      <Helmet>
        <title>Marketplace Jeans - Premium Denim Collection</title>
        <meta
          name="description"
          content="Koleksi denim premium dengan kualitas dan gaya terbaik. Belanja jeans, jaket, dan aksesoris dengan berbagai fitting dan ukuran."
        />
      </Helmet>

      {/* Hero Carousel */}
      <section className="relative h-[500px] md:h-[600px] overflow-hidden bg-gray-900">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${slide.image})`,
              }}
            >
              <div className="container mx-auto px-4 h-full flex items-center">
                <div className="text-white max-w-2xl">
                  <h1 className="text-5xl md:text-7xl font-bold mb-4 uppercase tracking-wide">
                    {slide.title}
                  </h1>
                  <p className="text-xl md:text-2xl mb-8">{slide.subtitle}</p>
                  <Link
                    to={slide.link}
                    className="inline-block bg-white text-black px-8 py-3 font-bold uppercase tracking-wider hover:bg-gray-100 transition"
                  >
                    {slide.linkText}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition z-10"
        >
          <ChevronLeftIcon className="h-6 w-6 text-black" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition z-10"
        >
          <ChevronRightIcon className="h-6 w-6 text-black" />
        </button>

        {/* Carousel Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Category Cards */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 uppercase tracking-wide">
            BELANJA BERDASARKAN KATEGORI
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={category.link}
                className="group relative overflow-hidden bg-white shadow-lg hover:shadow-xl transition"
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={category.image || PLACEHOLDER_IMAGES.category}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    onError={(e) => handleImageError(e, 'category')}
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                  <h3 className="text-xl font-bold mb-1 uppercase tracking-wide">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-200">{category.subtitle}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-4xl font-bold uppercase tracking-wide">
              PRODUK UNGGULAN
            </h2>
            <Link
              to="/products"
              className="text-sm font-bold uppercase tracking-wider hover:underline"
            >
              LIHAT SEMUA
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.slug}`}
                  className="group"
                >
                  <div className="aspect-[3/4] overflow-hidden bg-gray-100 mb-3">
                    <img
                      src={getProductImageUrl(product)}
                      onError={(e) => handleImageError(e, 'product')}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    />
                  </div>
                  <h3 className="font-semibold mb-1 group-hover:underline">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    {product.discount_price ? (
                      <>
                        <span className="font-bold text-red-600">
                          Rp {parseInt(product.discount_price).toLocaleString('id-ID')}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          Rp {parseInt(product.price).toLocaleString('id-ID')}
                        </span>
                      </>
                    ) : (
                      <span className="font-bold">
                        Rp {parseInt(product.base_price || product.price || 0).toLocaleString('id-ID')}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-12">Tidak ada produk tersedia</p>
          )}
        </div>
      </section>

      {/* Promotional Banners */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Banner 1 */}
            <Link
              to="/pages/jean-fit-guide"
              className="group relative overflow-hidden bg-white shadow-lg hover:shadow-xl transition"
            >
              <div className="aspect-[16/9] overflow-hidden">
                <img
                  src="/images/promo/fit-guide.jpg"
                  alt="Panduan Fitting"
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=600&h=400&fit=crop';
                  }}
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 uppercase">PANDUAN FITTING</h3>
                <p className="text-gray-600">
                  Temukan fitting yang sempurna untuk anda
                </p>
              </div>
            </Link>

            {/* Banner 2 */}
            <Link
              to="/pages/membership"
              className="group relative overflow-hidden bg-white shadow-lg hover:shadow-xl transition"
            >
              <div className="aspect-[16/9] overflow-hidden">
                <img
                  src="/images/promo/membership.jpg"
                  alt="Program Member"
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600&h=400&fit=crop';
                  }}
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 uppercase">PROGRAM MEMBER</h3>
                <p className="text-gray-600">
                  Dapatkan diskon spesial dan reward points
                </p>
              </div>
            </Link>

            {/* Banner 3 */}
            <Link
              to="/pages/store-locator"
              className="group relative overflow-hidden bg-white shadow-lg hover:shadow-xl transition"
            >
              <div className="aspect-[16/9] overflow-hidden">
                <img
                  src="/images/promo/store-locator.jpg"
                  alt="Temukan Toko"
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop';
                  }}
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 uppercase">TEMUKAN TOKO</h3>
                <p className="text-gray-600">
                  Kunjungi toko terdekat di kota anda
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-black text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 uppercase tracking-wide">
            DAPATKAN UPDATE TERBARU
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Daftarkan email anda untuk mendapatkan informasi koleksi terbaru,
            promo eksklusif, dan penawaran spesial lainnya.
          </p>
          <form className="flex flex-col md:flex-row gap-4 max-w-xl mx-auto">
            <input
              type="email"
              placeholder="Masukkan email anda"
              className="flex-1 px-4 py-3 bg-white text-black focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button
              type="submit"
              className="px-8 py-3 bg-white text-black font-bold uppercase tracking-wider hover:bg-gray-100 transition"
            >
              DAFTAR
            </button>
          </form>
        </div>
      </section>
    </>
  );
};

export default Home;
