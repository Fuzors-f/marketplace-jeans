const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  getPublishedBlogs,
  getBlogBySlug,
  getBlogCategories,
  getFeaturedBlogs,
  getAdminBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  uploadBlogImage
} = require('../controllers/blogController');
const { protect, authorize } = require('../middleware/auth');

// Blog image upload config
const blogUploadDir = path.join(__dirname, '../../uploads/blogs');
if (!fs.existsSync(blogUploadDir)) {
  fs.mkdirSync(blogUploadDir, { recursive: true });
}

const blogStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, blogUploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'blog-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const blogUpload = multer({
  storage: blogStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Public routes
router.get('/', getPublishedBlogs);
router.get('/categories', getBlogCategories);
router.get('/featured', getFeaturedBlogs);
router.get('/:slug', getBlogBySlug);

// Admin routes (protected)
router.get('/admin/all', protect, authorize('admin'), getAdminBlogs);
router.post('/', protect, authorize('admin'), createBlog);
router.put('/:id', protect, authorize('admin'), updateBlog);
router.delete('/:id', protect, authorize('admin'), deleteBlog);
router.post('/upload-image', protect, authorize('admin'), blogUpload.single('image'), uploadBlogImage);

module.exports = router;
