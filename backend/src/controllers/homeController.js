const { query } = require('../config/database');

// @desc    Get home page data
// @route   GET /api/home
// @access  Public
exports.getHomeData = async (req, res) => {
  try {
    // Get hero banners (main carousel)
    const bannersQuery = `
      SELECT id, title, subtitle, image_url, link_url as link
      FROM banners
      WHERE is_active = true 
        AND position = 'hero'
        AND (start_date IS NULL OR start_date <= NOW())
        AND (end_date IS NULL OR end_date >= NOW())
      ORDER BY sort_order ASC
    `;

    // Get featured products
    const featuredQuery = `
      SELECT 
        p.id, p.name, p.slug, p.base_price, p.short_description,
        c.name as category_name, c.slug as category_slug,
        f.name as fitting_name,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as primary_image,
        (SELECT SUM(stock_quantity) FROM product_variants WHERE product_id = p.id AND is_active = true) as total_stock
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN fittings f ON p.fitting_id = f.id
      WHERE p.is_active = true AND p.is_featured = true
      ORDER BY p.created_at DESC
      LIMIT 8
    `;

    // Get newest products
    const newestQuery = `
      SELECT 
        p.id, p.name, p.slug, p.base_price, p.short_description,
        c.name as category_name, c.slug as category_slug,
        f.name as fitting_name,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as primary_image,
        (SELECT SUM(stock_quantity) FROM product_variants WHERE product_id = p.id AND is_active = true) as total_stock
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN fittings f ON p.fitting_id = f.id
      WHERE p.is_active = true
      ORDER BY p.created_at DESC
      LIMIT 12
    `;

    // Get categories
    const categoriesQuery = `
      SELECT id, name, slug, image_url
      FROM categories
      WHERE is_active = true
      ORDER BY sort_order ASC, name ASC
    `;

    // Execute all queries in parallel
    const [banners, featuredProducts, newestProducts, categories] = await Promise.all([
      query(bannersQuery),
      query(featuredQuery),
      query(newestQuery),
      query(categoriesQuery)
    ]);

    res.status(200).json({
      success: true,
      data: {
        banners,
        featured_products: featuredProducts,
        newest_products: newestProducts,
        categories
      }
    });
  } catch (error) {
    console.error('Error fetching home data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching home data',
      error: error.message
    });
  }
};
