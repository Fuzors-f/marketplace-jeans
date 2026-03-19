import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { blogAPI } from '../services/api';
import { FaCalendarAlt, FaUser, FaTag, FaChevronLeft, FaShareAlt, FaFacebook, FaTwitter, FaWhatsapp, FaLink } from 'react-icons/fa';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://be-hojdenim.yyyy-zzzzz-online.com/api';

const getImageFullUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const baseUrl = API_BASE_URL.replace('/api', '');
  return `${baseUrl}${url}`;
};

const BlogDetail = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchBlog();
  }, [slug]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await blogAPI.getBySlug(slug);
      if (response.data.success) {
        setBlog(response.data.data);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Artikel tidak ditemukan');
      } else {
        setError('Gagal memuat artikel');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleShare = (platform) => {
    const title = encodeURIComponent(blog?.title || '');
    const url = encodeURIComponent(currentUrl);
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?text=${title}&url=${url}`,
      whatsapp: `https://wa.me/?text=${title}%20${url}`
    };
    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-64 bg-gray-200 rounded-xl mt-6" />
          <div className="space-y-3 mt-6">
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">😔</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{error}</h1>
        <p className="text-gray-500 mb-6">Artikel yang Anda cari mungkin sudah dihapus atau belum dipublikasikan.</p>
        <Link to="/blog" className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition">
          <FaChevronLeft /> Kembali ke Blog
        </Link>
      </div>
    );
  }

  if (!blog) return null;

  const ogImage = getImageFullUrl(blog.og_image || blog.featured_image);

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{blog.meta_title || blog.title} - HOJ Denim</title>
        <meta name="description" content={blog.meta_description || blog.excerpt || ''} />
        {blog.meta_keywords && <meta name="keywords" content={blog.meta_keywords} />}
        {blog.canonical_url && <link rel="canonical" href={blog.canonical_url} />}

        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={blog.meta_title || blog.title} />
        <meta property="og:description" content={blog.meta_description || blog.excerpt || ''} />
        {ogImage && <meta property="og:image" content={ogImage} />}
        <meta property="og:url" content={currentUrl} />
        <meta property="article:published_time" content={blog.published_at} />
        {blog.author_name && <meta property="article:author" content={blog.author_name} />}
        {blog.category && <meta property="article:section" content={blog.category} />}
        {blog.tags?.map((tag, i) => (
          <meta key={i} property="article:tag" content={tag} />
        ))}

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={blog.meta_title || blog.title} />
        <meta name="twitter:description" content={blog.meta_description || blog.excerpt || ''} />
        {ogImage && <meta name="twitter:image" content={ogImage} />}

        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": blog.title,
            "description": blog.meta_description || blog.excerpt,
            "image": ogImage || undefined,
            "author": {
              "@type": "Person",
              "name": blog.author_name || "Admin"
            },
            "datePublished": blog.published_at,
            "dateModified": blog.updated_at,
            "publisher": {
              "@type": "Organization",
              "name": "HOJ Denim"
            }
          })}
        </script>
      </Helmet>

      <article className="bg-white min-h-screen">
        {/* Back navigation */}
        <div className="max-w-4xl mx-auto px-4 pt-6">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition"
          >
            <FaChevronLeft /> Kembali ke Blog
          </Link>
        </div>

        {/* Article Header */}
        <header className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {blog.category && (
              <Link
                to={`/blog?category=${encodeURIComponent(blog.category)}`}
                className="px-3 py-1 bg-blue-50 text-blue-600 text-sm font-medium rounded-full hover:bg-blue-100 transition"
              >
                {blog.category}
              </Link>
            )}
            <span className="flex items-center gap-1.5 text-sm text-gray-500">
              <FaCalendarAlt className="text-gray-400" />
              {formatDate(blog.published_at)}
            </span>
            {blog.author_name && (
              <span className="flex items-center gap-1.5 text-sm text-gray-500">
                <FaUser className="text-gray-400" />
                {blog.author_name}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
            {blog.title}
          </h1>

          {blog.excerpt && (
            <p className="mt-4 text-lg text-gray-600 leading-relaxed">
              {blog.excerpt}
            </p>
          )}
        </header>

        {/* Featured Image */}
        {blog.featured_image && (
          <div className="max-w-5xl mx-auto px-4">
            <img
              src={getImageFullUrl(blog.featured_image)}
              alt={blog.title}
              className="w-full rounded-xl object-cover max-h-[500px]"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        )}

        {/* Article Content */}
        <div className="max-w-4xl mx-auto px-4 py-8 sm:py-10">
          <div
            className="prose prose-lg max-w-none
              prose-headings:text-gray-900 prose-headings:font-bold
              prose-p:text-gray-700 prose-p:leading-relaxed
              prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
              prose-img:rounded-xl prose-img:mx-auto
              prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
              prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded
              prose-strong:text-gray-900"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-8 pt-6 border-t border-gray-200">
              <FaTag className="text-gray-400" />
              {blog.tags.map((tag, index) => (
                <Link
                  key={index}
                  to={`/blog?q=${encodeURIComponent(tag)}`}
                  className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full hover:bg-gray-200 transition"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}

          {/* Share Buttons */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <FaShareAlt /> Bagikan:
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleShare('facebook')}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition"
                  title="Share to Facebook"
                >
                  <FaFacebook />
                </button>
                <button
                  onClick={() => handleShare('twitter')}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-sky-500 text-white hover:bg-sky-600 transition"
                  title="Share to Twitter"
                >
                  <FaTwitter />
                </button>
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-green-500 text-white hover:bg-green-600 transition"
                  title="Share to WhatsApp"
                >
                  <FaWhatsapp />
                </button>
                <button
                  onClick={handleCopyLink}
                  className={`w-9 h-9 flex items-center justify-center rounded-full transition ${
                    copied ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                  title={copied ? 'Tersalin!' : 'Salin Link'}
                >
                  <FaLink />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {blog.related_posts && blog.related_posts.length > 0 && (
          <div className="bg-gray-50 py-10 sm:py-12">
            <div className="max-w-5xl mx-auto px-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Artikel Terkait</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {blog.related_posts.map((related) => (
                  <Link
                    key={related.id}
                    to={`/blog/${related.slug}`}
                    className="group bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden"
                  >
                    <div className="aspect-[16/10] overflow-hidden bg-gray-100">
                      {related.featured_image ? (
                        <img
                          src={getImageFullUrl(related.featured_image)}
                          alt={related.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          onError={(e) => { e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-300 text-3xl">📝</div>'; }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl">📝</div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition line-clamp-2 text-sm">
                        {related.title}
                      </h3>
                      <p className="text-xs text-gray-400 mt-2">
                        {formatDate(related.published_at)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </article>
    </>
  );
};

export default BlogDetail;
