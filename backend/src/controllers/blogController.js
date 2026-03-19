const { query } = require('../config/database');
const { logActivity } = require('../middleware/activityLogger');
const path = require('path');
const fs = require('fs');

// Helper: generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Helper: ensure unique slug
const ensureUniqueSlug = async (slug, excludeId = null) => {
  let uniqueSlug = slug;
  let counter = 1;
  while (true) {
    const params = excludeId ? [uniqueSlug, excludeId] : [uniqueSlug];
    const existing = await query(
      `SELECT id FROM blog_posts WHERE slug = ?${excludeId ? ' AND id != ?' : ''}`,
      params
    );
    if (existing.length === 0) break;
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }
  return uniqueSlug;
};

// Ensure blog uploads directory exists
const blogUploadDir = path.join(__dirname, '../../uploads/blogs');
if (!fs.existsSync(blogUploadDir)) {
  fs.mkdirSync(blogUploadDir, { recursive: true });
}

// ==========================================
// PUBLIC ENDPOINTS
// ==========================================

// GET /api/blogs - List published blog posts (public)
exports.getPublishedBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 12, category, tag, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let where = 'WHERE bp.status = ?';
    const params = ['published'];

    if (category) {
      where += ' AND bp.category = ?';
      params.push(category);
    }

    if (tag) {
      where += ' AND JSON_CONTAINS(bp.tags, ?)';
      params.push(JSON.stringify(tag));
    }

    if (search) {
      where += ' AND (bp.title LIKE ? OR bp.excerpt LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    // Count total
    const countResult = await query(
      `SELECT COUNT(*) as total FROM blog_posts bp ${where}`,
      params
    );
    const total = countResult[0].total;

    // Fetch posts
    const posts = await query(
      `SELECT bp.id, bp.title, bp.slug, bp.excerpt, bp.featured_image,
              bp.category, bp.tags, bp.is_featured, bp.published_at, bp.created_at,
              u.full_name as author_name
       FROM blog_posts bp
       LEFT JOIN users u ON bp.author_id = u.id
       ${where}
       ORDER BY bp.is_featured DESC, bp.published_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const data = posts.map(post => ({
      ...post,
      tags: post.tags ? (typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags) : []
    }));

    res.status(200).json({
      success: true,
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching published blogs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blog posts',
      error: error.message
    });
  }
};

// GET /api/blogs/categories - Get blog categories
exports.getBlogCategories = async (req, res) => {
  try {
    const categories = await query(
      `SELECT category, COUNT(*) as count 
       FROM blog_posts 
       WHERE status = 'published' AND category IS NOT NULL AND category != ''
       GROUP BY category 
       ORDER BY count DESC`
    );

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching blog categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blog categories',
      error: error.message
    });
  }
};

// GET /api/blogs/featured - Get featured posts
exports.getFeaturedBlogs = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const posts = await query(
      `SELECT bp.id, bp.title, bp.slug, bp.excerpt, bp.featured_image,
              bp.category, bp.published_at, u.full_name as author_name
       FROM blog_posts bp
       LEFT JOIN users u ON bp.author_id = u.id
       WHERE bp.status = 'published' AND bp.is_featured = 1
       ORDER BY bp.published_at DESC
       LIMIT ?`,
      [parseInt(limit)]
    );

    res.status(200).json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('Error fetching featured blogs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured posts',
      error: error.message
    });
  }
};

// GET /api/blogs/:slug - Get single blog post by slug (public)
exports.getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const posts = await query(
      `SELECT bp.*, u.full_name as author_name
       FROM blog_posts bp
       LEFT JOIN users u ON bp.author_id = u.id
       WHERE bp.slug = ? AND bp.status = 'published'`,
      [slug]
    );

    if (posts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    const post = posts[0];
    post.tags = post.tags ? (typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags) : [];

    // Get related posts (same category, excluding current)
    let relatedPosts = [];
    if (post.category) {
      relatedPosts = await query(
        `SELECT id, title, slug, excerpt, featured_image, published_at
         FROM blog_posts
         WHERE status = 'published' AND category = ? AND id != ?
         ORDER BY published_at DESC
         LIMIT 3`,
        [post.category, post.id]
      );
    }

    res.status(200).json({
      success: true,
      data: {
        ...post,
        related_posts: relatedPosts
      }
    });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blog post',
      error: error.message
    });
  }
};

// ==========================================
// ADMIN ENDPOINTS
// ==========================================

// GET /api/blogs/admin/all - List all blog posts (admin)
exports.getAdminBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let where = 'WHERE 1=1';
    const params = [];

    if (status) {
      where += ' AND bp.status = ?';
      params.push(status);
    }

    if (search) {
      where += ' AND (bp.title LIKE ? OR bp.excerpt LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    const countResult = await query(
      `SELECT COUNT(*) as total FROM blog_posts bp ${where}`,
      params
    );
    const total = countResult[0].total;

    const posts = await query(
      `SELECT bp.*, u.full_name as author_name
       FROM blog_posts bp
       LEFT JOIN users u ON bp.author_id = u.id
       ${where}
       ORDER BY bp.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const data = posts.map(post => ({
      ...post,
      tags: post.tags ? (typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags) : []
    }));

    res.status(200).json({
      success: true,
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching admin blogs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blog posts',
      error: error.message
    });
  }
};

// POST /api/blogs - Create blog post
exports.createBlog = async (req, res) => {
  try {
    const {
      title, content, excerpt, featured_image,
      meta_title, meta_description, meta_keywords, og_image, canonical_url,
      category, tags, status, is_featured
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    const slug = await ensureUniqueSlug(generateSlug(title));
    const publishedAt = status === 'published' ? new Date() : null;

    const sql = `
      INSERT INTO blog_posts (
        title, slug, excerpt, content, featured_image,
        meta_title, meta_description, meta_keywords, og_image, canonical_url,
        category, tags, status, is_featured, author_id, published_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await query(sql, [
      title, slug, excerpt || null, content, featured_image || null,
      meta_title || title, meta_description || (excerpt || '').substring(0, 160),
      meta_keywords || null, og_image || featured_image || null, canonical_url || null,
      category || null, tags ? JSON.stringify(tags) : null,
      status || 'draft', is_featured ? 1 : 0,
      req.user.id, publishedAt
    ]);

    await logActivity({
      userId: req.user.id,
      action: 'CREATE_BLOG',
      targetType: 'blog_posts',
      targetId: result.insertId,
      details: `Created blog post: ${title}`
    });

    const newPost = await query('SELECT * FROM blog_posts WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Blog post created successfully',
      data: {
        ...newPost[0],
        tags: newPost[0].tags ? JSON.parse(newPost[0].tags) : []
      }
    });
  } catch (error) {
    console.error('Error creating blog post:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating blog post',
      error: error.message
    });
  }
};

// PUT /api/blogs/:id - Update blog post
exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, content, excerpt, featured_image,
      meta_title, meta_description, meta_keywords, og_image, canonical_url,
      category, tags, status, is_featured
    } = req.body;

    const existing = await query('SELECT * FROM blog_posts WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    const oldPost = existing[0];

    // Generate new slug if title changed
    let slug = oldPost.slug;
    if (title && title !== oldPost.title) {
      slug = await ensureUniqueSlug(generateSlug(title), id);
    }

    // Set published_at if status changed to published
    let publishedAt = oldPost.published_at;
    if (status === 'published' && oldPost.status !== 'published') {
      publishedAt = new Date();
    }

    const sql = `
      UPDATE blog_posts SET
        title = ?, slug = ?, excerpt = ?, content = ?, featured_image = ?,
        meta_title = ?, meta_description = ?, meta_keywords = ?, og_image = ?, canonical_url = ?,
        category = ?, tags = ?, status = ?, is_featured = ?, published_at = ?,
        updated_at = NOW()
      WHERE id = ?
    `;

    await query(sql, [
      title || oldPost.title,
      slug,
      excerpt !== undefined ? excerpt : oldPost.excerpt,
      content || oldPost.content,
      featured_image !== undefined ? featured_image : oldPost.featured_image,
      meta_title || title || oldPost.meta_title,
      meta_description !== undefined ? meta_description : oldPost.meta_description,
      meta_keywords !== undefined ? meta_keywords : oldPost.meta_keywords,
      og_image !== undefined ? og_image : oldPost.og_image,
      canonical_url !== undefined ? canonical_url : oldPost.canonical_url,
      category !== undefined ? category : oldPost.category,
      tags ? JSON.stringify(tags) : oldPost.tags,
      status || oldPost.status,
      is_featured !== undefined ? (is_featured ? 1 : 0) : oldPost.is_featured,
      publishedAt,
      id
    ]);

    await logActivity({
      userId: req.user.id,
      action: 'UPDATE_BLOG',
      targetType: 'blog_posts',
      targetId: id,
      details: `Updated blog post: ${title || oldPost.title}`
    });

    const updated = await query('SELECT * FROM blog_posts WHERE id = ?', [id]);

    res.status(200).json({
      success: true,
      message: 'Blog post updated successfully',
      data: {
        ...updated[0],
        tags: updated[0].tags ? (typeof updated[0].tags === 'string' ? JSON.parse(updated[0].tags) : updated[0].tags) : []
      }
    });
  } catch (error) {
    console.error('Error updating blog post:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating blog post',
      error: error.message
    });
  }
};

// DELETE /api/blogs/:id - Delete blog post
exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await query('SELECT * FROM blog_posts WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Delete featured image file if exists
    if (existing[0].featured_image) {
      const imagePath = path.join(__dirname, '../../', existing[0].featured_image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await query('DELETE FROM blog_posts WHERE id = ?', [id]);

    await logActivity({
      userId: req.user.id,
      action: 'DELETE_BLOG',
      targetType: 'blog_posts',
      targetId: id,
      details: `Deleted blog post: ${existing[0].title}`
    });

    res.status(200).json({
      success: true,
      message: 'Blog post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting blog post',
      error: error.message
    });
  }
};

// POST /api/blogs/upload-image - Upload blog image (for WYSIWYG editor)
exports.uploadBlogImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded'
      });
    }

    const imageUrl = `/uploads/blogs/${req.file.filename}`;

    res.status(200).json({
      success: true,
      data: {
        url: imageUrl
      }
    });
  } catch (error) {
    console.error('Error uploading blog image:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading image',
      error: error.message
    });
  }
};
