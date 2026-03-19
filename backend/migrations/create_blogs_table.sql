-- Blog Posts Table
CREATE TABLE IF NOT EXISTS blog_posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  excerpt TEXT,
  content LONGTEXT,
  featured_image VARCHAR(500),
  
  -- SEO Fields
  meta_title VARCHAR(255),
  meta_description VARCHAR(500),
  meta_keywords VARCHAR(500),
  og_image VARCHAR(500),
  canonical_url VARCHAR(500),
  
  -- Organization
  category VARCHAR(100),
  tags JSON,
  
  -- Status
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  is_featured TINYINT(1) DEFAULT 0,
  
  -- Author
  author_id INT,
  
  -- Timestamps
  published_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_blog_slug (slug),
  INDEX idx_blog_status (status),
  INDEX idx_blog_category (category),
  INDEX idx_blog_published_at (published_at),
  INDEX idx_blog_featured (is_featured),
  
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
