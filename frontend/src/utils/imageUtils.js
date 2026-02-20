// Image utility functions for consistent image URL handling

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://be-hojdenim.yyyy-zzzzz-online.com/api';
const UPLOADS_BASE_URL = API_BASE_URL.replace('/api', '');

// Default placeholder images
export const PLACEHOLDER_IMAGES = {
  product: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=800&fit=crop',
  productThumbnail: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=200&h=300&fit=crop',
  category: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=400&fit=crop',
  banner: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1920&h=600&fit=crop',
  user: 'https://via.placeholder.com/150x150?text=User',
  noImage: 'https://via.placeholder.com/400x400?text=No+Image'
};

/**
 * Get full image URL from a relative path or URL
 * @param {string} imageUrl - The image URL (can be relative or absolute)
 * @param {string} type - The type of image for fallback (product, category, banner, user)
 * @returns {string} - Full image URL
 */
export const getImageUrl = (imageUrl, type = 'product') => {
  // Return placeholder if no image
  if (!imageUrl) {
    return PLACEHOLDER_IMAGES[type] || PLACEHOLDER_IMAGES.noImage;
  }

  // If already a full URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // If it's a relative path starting with /uploads
  if (imageUrl.startsWith('/uploads')) {
    return `${UPLOADS_BASE_URL}${imageUrl}`;
  }

  // If it's just a filename, construct the path
  if (!imageUrl.includes('/')) {
    return `${UPLOADS_BASE_URL}/uploads/products/${imageUrl}`;
  }

  // Default: assume it's a relative path
  return `${UPLOADS_BASE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
};

/**
 * Get product image URL with fallback
 * @param {object} product - Product object
 * @returns {string} - Product image URL
 */
export const getProductImageUrl = (product) => {
  if (!product) return PLACEHOLDER_IMAGES.product;
  
  // Try different image fields
  const imageUrl = product.primary_image || 
                   product.image || 
                   (product.images && product.images[0]?.image_url) ||
                   (product.images && product.images[0]?.url);
  
  return getImageUrl(imageUrl, 'product');
};

/**
 * Get category image URL with fallback
 * @param {object} category - Category object
 * @returns {string} - Category image URL
 */
export const getCategoryImageUrl = (category) => {
  if (!category) return PLACEHOLDER_IMAGES.category;
  
  const imageUrl = category.image || category.image_url;
  return getImageUrl(imageUrl, 'category');
};

/**
 * Handle image error by setting fallback
 * @param {Event} event - The error event
 * @param {string} type - The type of image for fallback
 */
export const handleImageError = (event, type = 'product') => {
  event.target.onerror = null; // Prevent infinite loop
  event.target.src = PLACEHOLDER_IMAGES[type] || PLACEHOLDER_IMAGES.noImage;
};

/**
 * Image component wrapper with automatic fallback handling
 */
export const ImageWithFallback = ({ 
  src, 
  alt, 
  type = 'product', 
  className = '', 
  ...props 
}) => {
  const imageUrl = getImageUrl(src, type);
  
  return (
    <img
      src={imageUrl}
      alt={alt || 'Image'}
      className={className}
      onError={(e) => handleImageError(e, type)}
      {...props}
    />
  );
};

const imageUtils = {
  getImageUrl,
  getProductImageUrl,
  getCategoryImageUrl,
  handleImageError,
  ImageWithFallback,
  PLACEHOLDER_IMAGES,
  UPLOADS_BASE_URL
};

export default imageUtils;
