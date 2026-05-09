-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 09, 2026 at 02:48 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `marketplace_jeans`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `session_id` varchar(100) DEFAULT NULL,
  `user_type` enum('guest','member','admin','admin_stok') DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `request_url` varchar(500) DEFAULT NULL,
  `request_method` varchar(10) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `page_path` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `activity_logs`
--

INSERT INTO `activity_logs` (`id`, `user_id`, `session_id`, `user_type`, `action`, `entity_type`, `entity_id`, `description`, `ip_address`, `user_agent`, `request_url`, `request_method`, `metadata`, `page_path`, `created_at`) VALUES
(1, 1, NULL, NULL, 'login', 'user', 1, 'User logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', NULL, NULL, NULL, NULL, '2025-12-18 17:19:14'),
(2, 1, NULL, NULL, 'login', 'user', 1, 'User logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', NULL, NULL, NULL, NULL, '2025-12-20 16:46:44'),
(3, 1, NULL, NULL, 'update_product', 'product', 2, 'Updated product', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', NULL, NULL, NULL, NULL, '2025-12-20 16:47:35'),
(4, 1, NULL, NULL, 'update_product', 'product', 2, 'Updated product', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', NULL, NULL, NULL, NULL, '2025-12-21 06:18:16'),
(5, 1, NULL, NULL, 'update_product', 'product', 2, 'Updated product', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', NULL, NULL, NULL, NULL, '2025-12-21 06:18:57'),
(6, 1, NULL, NULL, 'login', 'user', 1, 'User logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', NULL, NULL, NULL, NULL, '2025-12-21 07:28:37'),
(7, 1, NULL, NULL, 'login', 'user', 1, 'User logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', NULL, NULL, NULL, NULL, '2025-12-21 07:38:33'),
(8, 1, NULL, NULL, 'login', 'user', 1, 'User logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', NULL, NULL, NULL, NULL, '2025-12-21 07:42:15'),
(9, 1, NULL, NULL, 'delete_product_variant', 'product_variant', 14, 'Deleted product variant', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', NULL, NULL, NULL, NULL, '2025-12-22 18:05:14'),
(10, 1, NULL, NULL, 'add_product_variant', 'product_variant', 43, 'Added product variant', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', NULL, NULL, NULL, NULL, '2025-12-23 06:21:51'),
(11, 1, NULL, NULL, 'login', 'user', 1, 'User logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', NULL, NULL, NULL, NULL, '2025-12-23 16:28:21'),
(12, 1, NULL, NULL, 'update_product', 'product', 2, 'Updated product', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', NULL, NULL, NULL, NULL, '2025-12-23 16:30:56'),
(13, 1, NULL, NULL, 'update_product', 'product', 2, 'Updated product', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', NULL, NULL, NULL, NULL, '2025-12-23 16:34:37'),
(14, 1, NULL, NULL, 'login', 'user', 1, 'User logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', NULL, NULL, NULL, NULL, '2026-01-01 12:54:06'),
(15, 1, NULL, NULL, 'update_product', 'product', 2, 'Updated product', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', NULL, NULL, NULL, NULL, '2026-01-01 13:51:43'),
(16, 1, NULL, NULL, 'update_product', 'product', 2, 'Updated product', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', NULL, NULL, NULL, NULL, '2026-01-01 14:28:16'),
(17, 1, NULL, NULL, 'ADD_PRODUCT_IMAGES', 'Added 1 images to product 2', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-01 14:28:16'),
(18, 1, NULL, NULL, 'login', 'user', 1, 'User logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', NULL, NULL, NULL, NULL, '2026-01-04 15:05:29'),
(19, 1, NULL, NULL, 'login', 'user', 1, 'User logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '/api/auth/login', 'POST', NULL, NULL, '2026-01-11 06:48:31'),
(20, 1, NULL, NULL, 'login', 'user', 1, 'User logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '/api/auth/login', 'POST', NULL, NULL, '2026-01-11 14:56:06'),
(21, 1, NULL, NULL, 'create_product', 'product', 27, 'Created product: Jean Biru terbaru', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '/api/products', 'POST', NULL, NULL, '2026-01-11 15:12:32'),
(22, 1, NULL, NULL, 'add_product_variant', 'product_variant', 86, 'Added product variant', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '/api/products/27/variants', 'POST', NULL, NULL, '2026-01-11 15:12:32'),
(23, 1, NULL, NULL, 'delete_product_variant', 'product_variant', 86, 'Deleted product variant', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '/api/products/variants/86', 'DELETE', NULL, NULL, '2026-01-11 15:13:04'),
(24, 1, NULL, NULL, 'create_product', 'product', 28, 'Created product: Test jEAn', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '/api/products', 'POST', NULL, NULL, '2026-01-11 15:22:17'),
(25, 1, NULL, NULL, 'add_product_variant', 'product_variant', 87, 'Added product variant', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '/api/products/28/variants', 'POST', NULL, NULL, '2026-01-11 15:22:53'),
(26, 1, NULL, NULL, 'create_order', 'order', 1, 'Created order ORD-20260111-8887', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '/api/orders', 'POST', '{\"order_number\":\"ORD-20260111-8887\",\"tracking_url\":\"http://localhost:3000/order/2ef1c6fe941ab85d8050d8ae4315762ef8287bf170f48a68bd2a7ca101fedf6e\"}', NULL, '2026-01-11 15:53:34'),
(27, 1, NULL, NULL, 'login', 'user', 1, 'User logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '/api/auth/login', 'POST', NULL, NULL, '2026-01-25 08:41:03'),
(28, 1, NULL, NULL, 'login', 'user', 1, 'User logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '/api/auth/login', 'POST', NULL, NULL, '2026-01-25 08:59:39'),
(29, 1, NULL, NULL, 'login', 'user', 1, 'User logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '/api/auth/login', 'POST', NULL, NULL, '2026-01-26 14:08:05'),
(30, 1, NULL, NULL, 'login', 'user', 1, 'User logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '/api/auth/login', 'POST', NULL, NULL, '2026-02-01 15:02:14'),
(31, 9, NULL, NULL, 'register', 'user', 9, 'User registered', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '/api/auth/register', 'POST', NULL, NULL, '2026-02-07 12:31:45'),
(32, 1, NULL, NULL, 'login', 'user', 1, 'User logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '/api/auth/login', 'POST', NULL, NULL, '2026-02-13 14:49:14'),
(33, 1, NULL, NULL, 'login', 'user', 1, 'User logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '/api/auth/login', 'POST', NULL, NULL, '2026-02-20 13:17:19'),
(34, 1, NULL, NULL, 'CREATE', 'banner', 1, 'Created banner: Testing Banner', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-25 14:44:49'),
(35, 1, NULL, NULL, 'DELETE', 'banner', 1, 'Deleted banner: Testing Banner', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-25 14:45:35'),
(36, 1, NULL, NULL, 'login', 'user', 1, 'User logged in', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7705', '/api/auth/login', 'POST', NULL, NULL, '2026-02-25 14:58:05'),
(37, 1, NULL, NULL, 'login', 'user', 1, 'User logged in', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7705', '/api/auth/login', 'POST', NULL, NULL, '2026-02-25 14:58:56'),
(38, 1, NULL, NULL, 'CREATE_CONTENT', 'content_settings', 9, 'Created content: test_section', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-25 15:02:18'),
(39, 1, NULL, NULL, 'UPDATE_CONTENT', 'content_settings', 9, 'Updated content: test_section', NULL, NULL, NULL, NULL, '{\"section_key\":\"test_section\"}', NULL, '2026-02-25 15:05:33'),
(40, 1, NULL, NULL, 'UPDATE_CONTENT', 'content_settings', 1, 'Updated content: hero', NULL, NULL, NULL, NULL, '{\"section_key\":\"hero\"}', NULL, '2026-02-25 15:09:55'),
(41, 1, NULL, NULL, 'UPDATE_CONTENT', 'content_settings', 1, 'Updated content: hero', NULL, NULL, NULL, NULL, '{\"section_key\":\"hero\"}', NULL, '2026-02-25 15:09:55'),
(42, 1, NULL, NULL, 'CREATE_CONTENT', 'content_settings', 10, 'Created content: test_create', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-25 15:09:55'),
(43, 1, NULL, NULL, 'UPDATE_CONTENT', 'content_settings', 1, 'Updated content: hero', NULL, NULL, NULL, NULL, '{\"section_key\":\"hero\"}', NULL, '2026-02-25 15:14:08'),
(44, 1, NULL, NULL, 'DELETE_CONTENT', 'content_settings', 9, 'Deleted content: test_section', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-25 15:14:08'),
(45, 1, NULL, NULL, 'DELETE_CONTENT', 'content_settings', 10, 'Deleted content: test_create', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-25 15:14:08'),
(46, 1, NULL, NULL, 'login', 'user', 1, 'User logged in', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7705', '/api/auth/login', 'POST', NULL, NULL, '2026-02-25 15:18:41'),
(47, 1, NULL, NULL, 'login', 'user', 1, 'User logged in', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7705', '/api/auth/login', 'POST', NULL, NULL, '2026-02-25 15:18:52'),
(48, 1, NULL, NULL, 'login', 'user', 1, 'User logged in', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7705', '/api/auth/login', 'POST', NULL, NULL, '2026-02-25 15:23:01'),
(49, 1, NULL, NULL, 'create_manual_order', 'order', 2, 'Manual order created for Test Customer', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7705', '/api/admin/orders/manual', 'POST', NULL, NULL, '2026-02-25 15:23:01'),
(50, 1, NULL, NULL, 'login', 'user', 1, 'User logged in', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7705', '/api/auth/login', 'POST', NULL, NULL, '2026-02-25 15:33:51'),
(51, 1, NULL, NULL, 'login', 'user', 1, 'User logged in', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7705', '/api/auth/login', 'POST', NULL, NULL, '2026-02-25 15:34:04'),
(52, 1, NULL, NULL, 'login', 'user', 1, 'User logged in', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7705', '/api/auth/login', 'POST', NULL, NULL, '2026-02-25 15:41:00'),
(53, 1, NULL, NULL, 'create_manual_order', 'order', 3, 'Manual order created for Test After Fix', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7705', '/api/admin/orders/manual', 'POST', NULL, NULL, '2026-02-25 15:41:00'),
(54, NULL, NULL, NULL, 'create_order', 'order', 4, 'Created order ORD-20260225-2258', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '/api/orders', 'POST', '{\"order_number\":\"ORD-20260225-2258\",\"tracking_url\":\"http://localhost:3000/order/51ec8bb14628729846a22beb53e1500b21d36d101e830107f67f6bfbf54aeb7a\"}', NULL, '2026-02-25 15:51:48'),
(55, 1, NULL, NULL, 'create_order', 'order', 5, 'Created order ORD-20260225-8022', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '/api/orders', 'POST', '{\"order_number\":\"ORD-20260225-8022\",\"tracking_url\":\"http://localhost:3000/order/a49f5f5b0894ccb19c86cfc84ff4ffb2a0fa54aa78957a39830e57716b37d89a\"}', NULL, '2026-02-25 15:54:49'),
(56, 1, NULL, NULL, 'create_order', 'order', 6, 'Created order ORD-20260225-0483', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '/api/orders', 'POST', '{\"order_number\":\"ORD-20260225-0483\",\"tracking_url\":\"http://localhost:3000/order/cadd0b2ca0fbf70a9830c1e8e17aa53cac6981232ff5f1a3f53b6e4760640d7c\"}', NULL, '2026-02-25 16:25:30'),
(57, 1, NULL, NULL, 'login', 'user', 1, 'User logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '/api/auth/login', 'POST', NULL, NULL, '2026-02-26 15:23:37'),
(58, 1, NULL, NULL, 'create_product', 'product', 29, 'Created product: Loose Jeans', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '/api/products', 'POST', NULL, NULL, '2026-02-26 15:26:48'),
(59, 1, NULL, NULL, 'add_product_variant', 'product_variant', 88, 'Added product variant', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '/api/products/29/variants', 'POST', NULL, NULL, '2026-02-26 15:27:17'),
(60, 1, NULL, NULL, 'login', 'user', 1, 'User logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '/api/auth/login', 'POST', NULL, NULL, '2026-02-26 15:46:55');

-- --------------------------------------------------------

--
-- Table structure for table `banners`
--

CREATE TABLE `banners` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `title_en` varchar(255) DEFAULT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  `subtitle_en` varchar(255) DEFAULT NULL,
  `image_url` varchar(500) NOT NULL,
  `link_url` varchar(500) DEFAULT NULL,
  `button_text` varchar(100) DEFAULT 'Shop Now',
  `button_text_en` varchar(100) DEFAULT 'Shop Now',
  `position` enum('hero','sidebar','footer','popup') DEFAULT 'hero',
  `is_active` tinyint(1) DEFAULT 1,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `blog_posts`
--

CREATE TABLE `blog_posts` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `excerpt` text DEFAULT NULL,
  `content` longtext DEFAULT NULL,
  `featured_image` varchar(500) DEFAULT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` varchar(500) DEFAULT NULL,
  `meta_keywords` varchar(500) DEFAULT NULL,
  `og_image` varchar(500) DEFAULT NULL,
  `canonical_url` varchar(500) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `status` enum('draft','published','archived') DEFAULT 'draft',
  `is_featured` tinyint(1) DEFAULT 0,
  `author_id` int(11) DEFAULT NULL,
  `published_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `carts`
--

CREATE TABLE `carts` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `session_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `carts`
--

INSERT INTO `carts` (`id`, `user_id`, `session_id`, `created_at`, `updated_at`) VALUES
(1, 1, NULL, '2025-12-23 07:08:18', '2025-12-23 07:08:18'),
(2, NULL, '19061462-f13e-4942-9072-40b7c4637bfc', '2026-01-11 14:54:06', '2026-01-11 14:54:06'),
(3, NULL, '84a7db02-b415-4308-b55a-d8b191370d42', '2026-02-25 15:50:58', '2026-02-25 15:50:58'),
(4, NULL, 'e4503df8-ee04-4235-a42c-2b31317cdc96', '2026-02-26 15:23:06', '2026-02-26 15:23:06');

-- --------------------------------------------------------

--
-- Table structure for table `cart_items`
--

CREATE TABLE `cart_items` (
  `id` int(11) NOT NULL,
  `cart_id` int(11) NOT NULL,
  `product_variant_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `price` decimal(12,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cart_items`
--

INSERT INTO `cart_items` (`id`, `cart_id`, `product_variant_id`, `quantity`, `price`, `created_at`, `updated_at`) VALUES
(3, 2, 8, 1, 279000.00, '2026-01-11 14:55:19', '2026-01-11 14:55:19'),
(5, 3, 8, 1, 237150.00, '2026-02-25 15:50:58', '2026-02-25 15:50:58'),
(8, 4, 8, 1, 237150.00, '2026-02-26 15:23:06', '2026-02-26 15:23:06'),
(9, 1, 88, 1, 957000.00, '2026-02-26 16:07:09', '2026-02-26 16:07:09');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `gender` enum('pria','wanita','both') DEFAULT 'both',
  `parent_id` int(11) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `gender`, `parent_id`, `image_url`, `is_active`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'Men Jeans', 'men-jeans', 'Denim jeans for men', 'pria', NULL, NULL, 1, 0, '2025-12-18 17:19:00', '2026-02-26 15:51:05'),
(2, 'Women Jeans', 'women-jeans', 'Denim jeans for women', 'wanita', NULL, NULL, 1, 0, '2025-12-18 17:19:00', '2026-02-26 15:51:05'),
(3, 'Casual Wear', 'casual-wear', 'Casual clothing', 'both', NULL, NULL, 1, 0, '2025-12-18 17:19:00', '2025-12-18 17:19:00');

-- --------------------------------------------------------

--
-- Table structure for table `cities`
--

CREATE TABLE `cities` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `province` varchar(100) NOT NULL,
  `postal_code` varchar(10) DEFAULT NULL,
  `city_type` enum('kota','kabupaten') DEFAULT 'kota',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cities`
--

INSERT INTO `cities` (`id`, `name`, `province`, `postal_code`, `city_type`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Jakarta Pusat', 'DKI Jakarta', '10110', 'kota', 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(2, 'Jakarta Utara', 'DKI Jakarta', '14120', 'kota', 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(3, 'Jakarta Barat', 'DKI Jakarta', '11430', 'kota', 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(4, 'Jakarta Selatan', 'DKI Jakarta', '12110', 'kota', 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(5, 'Jakarta Timur', 'DKI Jakarta', '13210', 'kota', 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(6, 'Bandung', 'Jawa Barat', '40111', 'kota', 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(7, 'Bekasi', 'Jawa Barat', '17112', 'kota', 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(8, 'Bogor', 'Jawa Barat', '16111', 'kota', 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(9, 'Depok', 'Jawa Barat', '16411', 'kota', 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(10, 'Cirebon', 'Jawa Barat', '45111', 'kota', 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(11, 'Karawang', 'Jawa Barat', '41311', 'kabupaten', 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(12, 'Tasikmalaya', 'Jawa Barat', '46111', 'kota', 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(13, 'Garut', 'Jawa Barat', '44112', 'kabupaten', 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(14, 'Semarang', 'Jawa Tengah', '50111', 'kota', 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(15, 'Solo', 'Jawa Tengah', '57111', 'kota', 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(16, 'Magelang', 'Jawa Tengah', '56111', 'kota', 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(17, 'Pekalongan', 'Jawa Tengah', '51111', 'kota', 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(18, 'Purwokerto', 'Jawa Tengah', '53111', 'kabupaten', 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(19, 'Surabaya', 'Jawa Timur', '60111', 'kota', 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(20, 'Malang', 'Jawa Timur', '65111', 'kota', 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(21, 'Sidoarjo', 'Jawa Timur', '61211', 'kabupaten', 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(22, 'Kediri', 'Jawa Timur', '64111', 'kota', 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(23, 'Banyuwangi', 'Jawa Timur', '68411', 'kabupaten', 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(24, 'Yogyakarta', 'DI Yogyakarta', '55111', 'kota', 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(25, 'Sleman', 'DI Yogyakarta', '55511', 'kabupaten', 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(26, 'Bantul', 'DI Yogyakarta', '55711', 'kabupaten', 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(27, 'Tangerang', 'Banten', '15111', 'kota', 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(28, 'Tangerang Selatan', 'Banten', '15310', 'kota', 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(29, 'Serang', 'Banten', '42111', 'kota', 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(30, 'Denpasar', 'Bali', '80111', 'kota', 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(31, 'Badung', 'Bali', '80351', 'kabupaten', 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(32, 'Medan', 'Sumatera Utara', '20111', 'kota', 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(33, 'Padang', 'Sumatera Barat', '25111', 'kota', 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(34, 'Palembang', 'Sumatera Selatan', '30111', 'kota', 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(35, 'Bandar Lampung', 'Lampung', '35111', 'kota', 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(36, 'Pontianak', 'Kalimantan Barat', '78111', 'kota', 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(37, 'Banjarmasin', 'Kalimantan Selatan', '70111', 'kota', 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(38, 'Balikpapan', 'Kalimantan Timur', '76111', 'kota', 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(39, 'Samarinda', 'Kalimantan Timur', '75111', 'kota', 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(40, 'Makassar', 'Sulawesi Selatan', '90111', 'kota', 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(41, 'Manado', 'Sulawesi Utara', '95111', 'kota', 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54');

-- --------------------------------------------------------

--
-- Table structure for table `content_settings`
--

CREATE TABLE `content_settings` (
  `id` int(11) NOT NULL,
  `section_key` varchar(100) NOT NULL COMMENT 'Unique identifier for section',
  `section_name` varchar(255) NOT NULL COMMENT 'Display name',
  `title_id` varchar(255) DEFAULT NULL COMMENT 'Indonesian title',
  `title_en` varchar(255) DEFAULT NULL COMMENT 'English title',
  `subtitle_id` text DEFAULT NULL COMMENT 'Indonesian subtitle',
  `subtitle_en` text DEFAULT NULL COMMENT 'English subtitle',
  `content_id` text DEFAULT NULL COMMENT 'Indonesian content',
  `content_en` text DEFAULT NULL COMMENT 'English content',
  `button_text_id` varchar(100) DEFAULT NULL COMMENT 'Indonesian button text',
  `button_text_en` varchar(100) DEFAULT NULL COMMENT 'English button text',
  `button_url` varchar(500) DEFAULT NULL COMMENT 'Button link URL',
  `image_url` varchar(500) DEFAULT NULL COMMENT 'Section image',
  `extra_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Additional configuration' CHECK (json_valid(`extra_data`)),
  `is_active` tinyint(1) DEFAULT 1,
  `show_in_footer` tinyint(1) DEFAULT 0,
  `footer_column` tinyint(4) DEFAULT 0,
  `footer_label` varchar(100) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `updated_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `content_settings`
--

INSERT INTO `content_settings` (`id`, `section_key`, `section_name`, `title_id`, `title_en`, `subtitle_id`, `subtitle_en`, `content_id`, `content_en`, `button_text_id`, `button_text_en`, `button_url`, `image_url`, `extra_data`, `is_active`, `show_in_footer`, `footer_column`, `footer_label`, `sort_order`, `updated_by`, `created_at`, `updated_at`) VALUES
(1, 'hero', 'Hero Section', 'Koleksi Jeans Terbaru', 'Latest Jeans Collection', '', '', '', '', 'Belanja', 'Shop', '/products', '', NULL, 1, 0, 0, NULL, 1, 1, '2026-01-10 09:26:02', '2026-02-25 15:14:08'),
(2, 'featured', 'Featured Products', 'Produk Unggulan', 'Featured Products', 'Pilihan terbaik untuk Anda', 'Best picks for you', NULL, NULL, 'Lihat Semua', 'View All', '/products?featured=true', NULL, NULL, 1, 0, 0, NULL, 2, NULL, '2026-01-10 09:26:02', '2026-01-10 09:26:02'),
(3, 'categories', 'Categories Section', 'Kategori', 'Categories', 'Jelajahi koleksi kami', 'Explore our collection', NULL, NULL, 'Lihat Kategori', 'View Categories', '/products', NULL, NULL, 1, 0, 0, NULL, 3, NULL, '2026-01-10 09:26:02', '2026-01-10 09:26:02'),
(4, 'promo', 'Promo Section', 'Promo Spesial', 'Special Promo', 'Diskon hingga 50%', 'Up to 50% off', NULL, NULL, 'Lihat Promo', 'View Promo', '/products?promo=true', NULL, NULL, 1, 0, 0, NULL, 4, NULL, '2026-01-10 09:26:02', '2026-01-10 09:26:02'),
(5, 'about', 'About Section', 'Tentang Kami', 'About Us', 'Kualitas terbaik dengan harga terjangkau', 'Best quality at affordable prices', NULL, NULL, 'Selengkapnya', 'Learn More', '/about', NULL, NULL, 1, 1, 2, 'Tentang Kami', 5, NULL, '2026-01-10 09:26:02', '2026-03-19 15:38:01'),
(6, 'newsletter', 'Newsletter Section', 'Berlangganan Newsletter', 'Subscribe to Newsletter', 'Dapatkan info promo dan produk terbaru', 'Get the latest promo and product updates', NULL, NULL, 'Berlangganan', 'Subscribe', NULL, NULL, NULL, 1, 0, 0, NULL, 6, NULL, '2026-01-10 09:26:02', '2026-01-10 09:26:02'),
(7, 'footer_tagline', 'Footer Tagline', 'Jeans berkualitas untuk semua', 'Quality jeans for everyone', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0, 0, NULL, 7, NULL, '2026-01-10 09:26:02', '2026-01-10 09:26:02'),
(11, 'contact', 'Halaman Kontak', 'Hubungi Kami', 'Contact Us', NULL, NULL, '<p>Silakan hubungi kami melalui email atau telepon.</p>', '<p>Please contact us via email or phone.</p>', NULL, NULL, NULL, NULL, NULL, 1, 1, 1, 'Hubungi Kami', 10, NULL, '2026-03-19 15:38:01', '2026-03-19 15:38:01'),
(12, 'faq', 'Halaman FAQ', 'Pertanyaan Umum', 'FAQ', NULL, NULL, '<p>Halaman FAQ akan segera diperbarui.</p>', '<p>FAQ page coming soon.</p>', NULL, NULL, NULL, NULL, NULL, 1, 1, 1, 'FAQ', 11, NULL, '2026-03-19 15:38:01', '2026-03-19 15:38:01'),
(13, 'returns', 'Halaman Pengembalian', 'Kebijakan Pengembalian & Penukaran', 'Return & Exchange Policy', NULL, NULL, '<h2>Kebijakan Pengembalian</h2><p>Kami menerima pengembalian dan penukaran produk dalam waktu <strong>7 hari</strong> setelah barang diterima, dengan syarat:</p><ul><li>Produk belum pernah digunakan atau dicuci</li><li>Label dan tag masih terpasang</li><li>Menyertakan bukti pembelian (nomor order)</li><li>Produk dalam kondisi asli dan kemasan yang baik</li></ul><h2>Cara Pengembalian</h2><ol><li>Hubungi customer service kami melalui halaman <strong>Kontak</strong></li><li>Sertakan nomor order dan alasan pengembalian</li><li>Tim kami akan memverifikasi permintaan dalam 1-2 hari kerja</li><li>Kirim barang ke alamat yang diberikan oleh tim kami</li><li>Setelah barang diterima dan diverifikasi, refund akan diproses dalam 3-5 hari kerja</li></ol><h2>Produk yang Tidak Dapat Dikembalikan</h2><ul><li>Produk yang sudah dicuci atau dipakai</li><li>Produk dengan label yang sudah dilepas</li><li>Produk sale/diskon tidak dapat dikembalikan</li></ul><h2>Penukaran</h2><p>Penukaran ukuran dapat dilakukan dengan menghubungi customer service kami. Biaya pengiriman penukaran ditanggung oleh pembeli.</p>', '<h2>Return Policy</h2><p>We accept returns and exchanges within <strong>7 days</strong> of receiving your order, subject to the following conditions:</p><ul><li>Product must be unworn and unwashed</li><li>Original tags and labels must be attached</li><li>Proof of purchase (order number) is required</li><li>Product must be in original condition and packaging</li></ul><h2>How to Return</h2><ol><li>Contact our customer service through the <strong>Contact</strong> page</li><li>Provide your order number and reason for return</li><li>Our team will verify the request within 1-2 business days</li><li>Ship the item to the address provided by our team</li><li>Once received and verified, refund will be processed within 3-5 business days</li></ol><h2>Non-Returnable Items</h2><ul><li>Products that have been washed or worn</li><li>Products with removed tags</li><li>Sale/discounted items are non-returnable</li></ul><h2>Exchanges</h2><p>Size exchanges can be arranged by contacting our customer service. Shipping costs for exchanges are borne by the buyer.</p>', NULL, NULL, NULL, NULL, NULL, 1, 1, 1, 'Pengembalian', 12, NULL, '2026-03-19 15:38:01', '2026-03-19 16:08:09'),
(14, 'store-locator', 'Halaman Lokasi Toko', 'Temukan Toko', 'Find Store', NULL, NULL, '<p>Lokasi toko kami.</p>', '<p>Our store locations.</p>', NULL, NULL, NULL, NULL, NULL, 1, 1, 1, 'Cari Toko', 13, NULL, '2026-03-19 15:38:01', '2026-03-19 15:38:01'),
(15, 'track-order', 'Halaman Lacak Pesanan', 'Lacak Pesanan', 'Track Order', NULL, NULL, '<p>Lacak pesanan Anda.</p>', '<p>Track your order.</p>', NULL, NULL, NULL, NULL, NULL, 1, 1, 1, 'Lacak Pesanan', 14, NULL, '2026-03-19 15:38:01', '2026-03-19 15:38:01'),
(16, 'privacy', 'Halaman Privasi', 'Kebijakan Privasi', 'Privacy Policy', NULL, NULL, '<p>Kebijakan privasi kami.</p>', '<p>Our privacy policy.</p>', NULL, NULL, NULL, NULL, NULL, 1, 1, 2, 'Kebijakan Privasi', 15, NULL, '2026-03-19 15:38:01', '2026-03-19 15:38:01'),
(17, 'terms', 'Halaman Syarat & Ketentuan', 'Syarat & Ketentuan', 'Terms & Conditions', NULL, NULL, '<p>Syarat dan ketentuan penggunaan.</p>', '<p>Terms and conditions.</p>', NULL, NULL, NULL, NULL, NULL, 1, 1, 2, 'Syarat & Ketentuan', 16, NULL, '2026-03-19 15:38:01', '2026-03-19 15:38:01'),
(18, 'membership', 'Halaman Membership', 'Program Membership', 'Membership Program', NULL, NULL, '<p>Info program membership.</p>', '<p>Membership program info.</p>', NULL, NULL, NULL, NULL, NULL, 1, 1, 3, 'Program Member', 17, NULL, '2026-03-19 15:38:01', '2026-03-19 15:38:01'),
(19, 'jean-fit-guide', 'Halaman Panduan Ukuran', 'Panduan Ukuran Jeans', 'Jeans Fit Guide', NULL, NULL, '<p>Panduan memilih ukuran jeans.</p>', '<p>How to choose the right jeans fit.</p>', NULL, NULL, NULL, NULL, NULL, 1, 1, 3, 'Panduan Ukuran', 18, NULL, '2026-03-19 15:38:01', '2026-03-19 15:38:01'),
(20, 'shipping', 'Halaman Kebijakan Pengiriman', 'Kebijakan Pengiriman', 'Shipping Policy', NULL, NULL, '<p>Informasi pengiriman.</p>', '<p>Shipping information.</p>', NULL, NULL, NULL, NULL, NULL, 1, 1, 3, 'Kebijakan Pengiriman', 19, NULL, '2026-03-19 15:38:01', '2026-03-19 15:38:01');

-- --------------------------------------------------------

--
-- Table structure for table `coupons`
--

CREATE TABLE `coupons` (
  `id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `discount_type` enum('percentage','fixed') NOT NULL DEFAULT 'percentage',
  `discount_value` decimal(15,2) NOT NULL,
  `max_discount` decimal(15,2) DEFAULT NULL,
  `min_purchase` decimal(15,2) DEFAULT 0.00,
  `min_items` int(11) DEFAULT NULL COMMENT 'Minimum number of different items in cart',
  `min_item_qty` int(11) DEFAULT NULL COMMENT 'Minimum total quantity of items in cart',
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `usage_limit` int(11) DEFAULT NULL COMMENT 'Total times coupon can be used (null = unlimited)',
  `usage_limit_per_user` int(11) DEFAULT 1 COMMENT 'Times each user can use this coupon',
  `usage_count` int(11) DEFAULT 0 COMMENT 'Total times coupon has been used',
  `applicable_products` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`applicable_products`)),
  `applicable_categories` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`applicable_categories`)),
  `coupon_type` enum('manual','automatic') DEFAULT 'manual' COMMENT 'manual=user enters code, automatic=applied when requirements met',
  `requirements_text` text DEFAULT NULL COMMENT 'Custom requirements description shown to users',
  `is_active` tinyint(1) DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `coupons`
--

INSERT INTO `coupons` (`id`, `code`, `name`, `description`, `discount_type`, `discount_value`, `max_discount`, `min_purchase`, `min_items`, `min_item_qty`, `start_date`, `end_date`, `usage_limit`, `usage_limit_per_user`, `usage_count`, `applicable_products`, `applicable_categories`, `coupon_type`, `requirements_text`, `is_active`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'KPN1', 'kupon 1', NULL, 'percentage', 10.00, NULL, 0.00, NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, NULL, 'manual', NULL, 1, 1, '2026-02-07 12:30:56', '2026-02-07 12:30:56');

-- --------------------------------------------------------

--
-- Table structure for table `coupon_usages`
--

CREATE TABLE `coupon_usages` (
  `id` int(11) NOT NULL,
  `coupon_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL COMMENT 'NULL for guest users',
  `guest_email` varchar(255) DEFAULT NULL,
  `order_id` int(11) NOT NULL,
  `discount_amount` decimal(15,2) NOT NULL,
  `used_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `discounts`
--

CREATE TABLE `discounts` (
  `id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `type` enum('percentage','fixed','member_auto') NOT NULL,
  `value` decimal(12,2) NOT NULL,
  `min_purchase` decimal(12,2) DEFAULT 0.00,
  `max_discount` decimal(12,2) DEFAULT NULL,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `usage_limit` int(11) DEFAULT NULL,
  `usage_count` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `applicable_to` enum('all','category','product') DEFAULT 'all',
  `applicable_ids` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `discounts`
--

INSERT INTO `discounts` (`id`, `code`, `type`, `value`, `min_purchase`, `max_discount`, `start_date`, `end_date`, `usage_limit`, `usage_count`, `is_active`, `applicable_to`, `applicable_ids`, `description`, `created_at`, `updated_at`) VALUES
(1, 'WELCOME10', 'percentage', 10.00, 200000.00, 50000.00, NULL, NULL, NULL, 0, 1, 'all', NULL, 'Welcome discount 10% off', '2025-12-18 17:19:01', '2025-12-18 17:19:01'),
(2, 'FLAT50K', 'fixed', 50000.00, 500000.00, NULL, NULL, NULL, NULL, 0, 1, 'all', NULL, 'Flat 50K discount for purchase above 500K', '2025-12-18 17:19:01', '2025-12-18 17:19:01');

-- --------------------------------------------------------

--
-- Table structure for table `exchange_rates`
--

CREATE TABLE `exchange_rates` (
  `id` int(11) NOT NULL,
  `currency_from` varchar(3) NOT NULL DEFAULT 'IDR',
  `currency_to` varchar(3) NOT NULL DEFAULT 'USD',
  `rate` decimal(20,6) NOT NULL COMMENT 'Exchange rate (e.g., 1 USD = 16000 IDR, so rate = 16000)',
  `is_active` tinyint(1) DEFAULT 1,
  `updated_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `exchange_rates`
--

INSERT INTO `exchange_rates` (`id`, `currency_from`, `currency_to`, `rate`, `is_active`, `updated_by`, `created_at`, `updated_at`) VALUES
(1, 'IDR', 'USD', 16000.000000, 1, NULL, '2026-01-10 09:13:16', '2026-01-10 09:13:16');

-- --------------------------------------------------------

--
-- Table structure for table `exchange_rate_logs`
--

CREATE TABLE `exchange_rate_logs` (
  `id` int(11) NOT NULL,
  `exchange_rate_id` int(11) NOT NULL,
  `currency_from` varchar(3) NOT NULL,
  `currency_to` varchar(3) NOT NULL,
  `old_rate` decimal(20,6) DEFAULT NULL COMMENT 'Previous rate',
  `new_rate` decimal(20,6) NOT NULL COMMENT 'New rate',
  `changed_by` int(11) DEFAULT NULL,
  `change_reason` varchar(255) DEFAULT NULL COMMENT 'Optional reason for change',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `fittings`
--

CREATE TABLE `fittings` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `slug` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `fittings`
--

INSERT INTO `fittings` (`id`, `name`, `slug`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Slim Fit', 'slim-fit', 'Slim fitting style', 1, '2025-12-18 17:19:00', '2025-12-18 17:19:00'),
(2, 'Regular Fit', 'regular-fit', 'Regular fitting style', 1, '2025-12-18 17:19:00', '2025-12-18 17:19:00'),
(3, 'Loose Fit', 'loose-fit', 'Loose fitting style', 1, '2025-12-18 17:19:00', '2025-12-18 17:19:00'),
(4, 'Skinny Fit', 'skinny-fit', 'Skinny fitting style', 1, '2025-12-18 17:19:00', '2025-12-18 17:19:00');

-- --------------------------------------------------------

--
-- Table structure for table `guest_order_details`
--

CREATE TABLE `guest_order_details` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `guest_name` varchar(255) NOT NULL,
  `guest_email` varchar(255) DEFAULT NULL,
  `guest_phone` varchar(20) NOT NULL,
  `address` text NOT NULL,
  `city` varchar(100) NOT NULL,
  `province` varchar(100) NOT NULL,
  `postal_code` varchar(10) DEFAULT NULL,
  `country` varchar(100) DEFAULT 'Indonesia',
  `latitude` decimal(10,8) DEFAULT NULL COMMENT 'GPS latitude',
  `longitude` decimal(11,8) DEFAULT NULL COMMENT 'GPS longitude',
  `address_notes` text DEFAULT NULL COMMENT 'Additional address instructions',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `guest_order_details`
--

INSERT INTO `guest_order_details` (`id`, `order_id`, `guest_name`, `guest_email`, `guest_phone`, `address`, `city`, `province`, `postal_code`, `country`, `latitude`, `longitude`, `address_notes`, `created_at`, `updated_at`) VALUES
(1, 4, 'Endou Okita', 'Endou@mail.com', '081311231', 'Jalan Ambengan no 2', 'Surabaya', 'Jawa Timur', '60111', 'Indonesia', NULL, NULL, NULL, '2026-02-25 15:51:48', '2026-02-25 15:51:48');

-- --------------------------------------------------------

--
-- Table structure for table `inventory_movements`
--

CREATE TABLE `inventory_movements` (
  `id` int(11) NOT NULL,
  `product_variant_id` int(11) NOT NULL,
  `type` enum('in','out','adjustment') NOT NULL,
  `quantity` int(11) NOT NULL,
  `cost_price` decimal(12,2) DEFAULT NULL,
  `reference_type` varchar(50) DEFAULT NULL,
  `reference_id` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `inventory_movements`
--

INSERT INTO `inventory_movements` (`id`, `product_variant_id`, `type`, `quantity`, `cost_price`, `reference_type`, `reference_id`, `notes`, `created_by`, `created_at`) VALUES
(1, 43, 'in', 10, 250000.00, 'initial_stock', NULL, 'Initial stock for new variant', 1, '2025-12-23 06:21:51'),
(2, 87, 'in', 10, 2000.00, 'initial_stock', NULL, 'Initial stock for new variant', 1, '2026-01-11 15:22:53'),
(3, 87, 'out', 1, NULL, 'order', 1, NULL, 1, '2026-01-11 15:53:34'),
(4, 87, 'out', 1, NULL, 'order', 2, 'Manual order', 1, '2026-02-25 15:23:01'),
(5, 1, 'out', 1, NULL, 'order', 3, 'Manual order', 1, '2026-02-25 15:41:00'),
(6, 8, 'out', 1, NULL, 'order', 4, NULL, NULL, '2026-02-25 15:51:48'),
(7, 1, 'out', 1, NULL, 'order', 5, NULL, 1, '2026-02-25 15:54:49'),
(8, 8, 'out', 1, NULL, 'order', 6, NULL, 1, '2026-02-25 16:25:29'),
(9, 88, 'in', 15, 450000.00, 'initial_stock', NULL, 'Initial stock for new variant', 1, '2026-02-26 15:27:17');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL COMMENT 'NULL = admin notification',
  `type` varchar(50) NOT NULL COMMENT 'new_order, payment_received, order_status_update, order_delivered, etc.',
  `title` varchar(255) NOT NULL,
  `message` text DEFAULT NULL,
  `reference_id` int(11) DEFAULT NULL COMMENT 'order_id or related entity id',
  `reference_type` varchar(50) DEFAULT NULL COMMENT 'order, payment, etc.',
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `for_admin` tinyint(1) NOT NULL DEFAULT 0 COMMENT '1 = visible to admin, 0 = visible to user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `offices`
--

CREATE TABLE `offices` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `code` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `province` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `is_headquarters` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `order_number` varchar(50) NOT NULL,
  `unique_token` varchar(64) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `guest_email` varchar(255) DEFAULT NULL,
  `shipping_address` text DEFAULT NULL,
  `shipping_city` varchar(100) DEFAULT NULL,
  `shipping_city_id` int(11) DEFAULT NULL,
  `shipping_province` varchar(100) DEFAULT NULL,
  `shipping_postal_code` varchar(10) DEFAULT NULL,
  `shipping_country` varchar(100) DEFAULT 'Indonesia',
  `shipping_method` varchar(100) DEFAULT NULL,
  `tracking_number` varchar(100) DEFAULT NULL,
  `courier` varchar(100) DEFAULT NULL,
  `warehouse_id` int(11) DEFAULT NULL,
  `shipping_cost_id` int(11) DEFAULT NULL,
  `status` enum('pending','confirmed','processing','shipped','delivered','cancelled') DEFAULT 'pending',
  `approved_at` datetime DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `payment_status` enum('pending','paid','failed','refunded') DEFAULT 'pending',
  `payment_method` varchar(50) DEFAULT 'bank_transfer',
  `subtotal` decimal(12,2) NOT NULL,
  `discount_amount` decimal(12,2) DEFAULT 0.00,
  `discount_code` varchar(50) DEFAULT NULL,
  `member_discount_amount` decimal(12,2) DEFAULT 0.00,
  `shipping_cost` decimal(12,2) DEFAULT 0.00,
  `tax` decimal(12,2) DEFAULT 0.00,
  `total_amount` decimal(12,2) NOT NULL,
  `customer_name` varchar(255) DEFAULT NULL,
  `customer_email` varchar(255) DEFAULT NULL,
  `customer_phone` varchar(20) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `currency` varchar(10) DEFAULT 'IDR',
  `exchange_rate` decimal(15,2) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `coupon_id` int(11) DEFAULT NULL,
  `coupon_code` varchar(50) DEFAULT NULL,
  `coupon_discount` decimal(15,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `order_number`, `unique_token`, `user_id`, `guest_email`, `shipping_address`, `shipping_city`, `shipping_city_id`, `shipping_province`, `shipping_postal_code`, `shipping_country`, `shipping_method`, `tracking_number`, `courier`, `warehouse_id`, `shipping_cost_id`, `status`, `approved_at`, `approved_by`, `payment_status`, `payment_method`, `subtotal`, `discount_amount`, `discount_code`, `member_discount_amount`, `shipping_cost`, `tax`, `total_amount`, `customer_name`, `customer_email`, `customer_phone`, `notes`, `currency`, `exchange_rate`, `created_by`, `created_at`, `updated_at`, `coupon_id`, `coupon_code`, `coupon_discount`) VALUES
(1, 'ORD-20260111-8887', '2ef1c6fe941ab85d8050d8ae4315762ef8287bf170f48a68bd2a7ca101fedf6e', 1, NULL, NULL, NULL, NULL, NULL, NULL, 'Indonesia', NULL, NULL, NULL, NULL, NULL, 'pending', NULL, NULL, 'pending', 'bank_transfer', 230000.00, 0.00, NULL, 0.00, 20000.00, 0.00, 250000.00, NULL, NULL, NULL, NULL, 'IDR', NULL, NULL, '2026-01-11 15:53:34', '2026-01-11 15:53:34', NULL, NULL, 0.00),
(2, 'ORD-20260225-9880', 'c569a5558927e4a34e23964d15d60982a5db9cfbcfee87cafb0cf325e4244eba', NULL, NULL, 'Jl Test 123', 'Jakarta', NULL, 'DKI Jakarta', '10110', 'Indonesia', 'manual', NULL, NULL, NULL, NULL, 'confirmed', NULL, NULL, 'pending', 'cash', 230000.00, 0.00, NULL, 0.00, 0.00, 0.00, 230000.00, 'Test Customer', 'testmanual@test.com', '081234567890', 'Manual order created by admin', 'IDR', NULL, 1, '2026-02-25 15:23:01', '2026-02-25 15:23:01', NULL, NULL, 0.00),
(3, 'ORD-20260225-8707', '7bdce4bbd72d3fdaa178fe58d4e7d3a55f3eb553fb1f2504a096292ee6dd9853', NULL, NULL, 'Jl. Test Fix No 1', 'Jakarta', NULL, 'DKI Jakarta', '10110', 'Indonesia', 'manual', NULL, NULL, NULL, NULL, 'confirmed', NULL, NULL, 'pending', 'bank_transfer', 150000.00, 0.00, NULL, 0.00, 0.00, 0.00, 150000.00, 'Test After Fix', 'testfix@test.com', '081234567890', 'Test after undefined fix', 'IDR', NULL, 1, '2026-02-25 15:41:00', '2026-02-25 15:41:00', NULL, NULL, 0.00),
(4, 'ORD-20260225-2258', '51ec8bb14628729846a22beb53e1500b21d36d101e830107f67f6bfbf54aeb7a', NULL, 'Endou@mail.com', NULL, NULL, NULL, NULL, NULL, 'Indonesia', 'J&T - Regular', NULL, 'J&T', NULL, 27, 'pending', NULL, NULL, 'pending', 'cod', 237150.00, 0.00, NULL, 0.00, 24000.00, 26087.00, 287237.00, 'Endou Okita', 'Endou@mail.com', '081311231', NULL, 'IDR', NULL, NULL, '2026-02-25 15:51:48', '2026-02-25 16:33:15', NULL, NULL, 0.00),
(5, 'ORD-20260225-8022', 'a49f5f5b0894ccb19c86cfc84ff4ffb2a0fa54aa78957a39830e57716b37d89a', 1, NULL, NULL, NULL, NULL, NULL, NULL, 'Indonesia', 'J&T - Regular', NULL, 'J&T', NULL, 27, 'pending', NULL, NULL, 'pending', 'bank_transfer', 239200.00, 0.00, NULL, 0.00, 24000.00, 26312.00, 289512.00, 'Admin User', NULL, '08123456789', NULL, 'IDR', NULL, NULL, '2026-02-25 15:54:49', '2026-02-25 16:33:15', NULL, NULL, 0.00),
(6, 'ORD-20260225-0483', 'cadd0b2ca0fbf70a9830c1e8e17aa53cac6981232ff5f1a3f53b6e4760640d7c', 1, NULL, NULL, NULL, NULL, NULL, NULL, 'Indonesia', 'J&T - Regular', NULL, 'J&T', NULL, 27, 'pending', NULL, NULL, 'pending', 'bank_transfer', 237150.00, 0.00, NULL, 0.00, 24000.00, 26087.00, 287237.00, 'Admin User', NULL, '08123456789', NULL, 'IDR', NULL, NULL, '2026-02-25 16:25:29', '2026-02-25 16:33:15', NULL, NULL, 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `order_discounts`
--

CREATE TABLE `order_discounts` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `description` varchar(255) NOT NULL COMMENT 'Discount description',
  `amount` decimal(12,2) NOT NULL DEFAULT 0.00 COMMENT 'Discount amount',
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) DEFAULT NULL,
  `product_variant_id` int(11) NOT NULL,
  `size_id` int(11) DEFAULT NULL,
  `product_name` varchar(255) NOT NULL,
  `product_sku` varchar(100) NOT NULL,
  `size_name` varchar(20) NOT NULL,
  `warehouse_id` int(11) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(12,2) NOT NULL,
  `unit_cost` decimal(12,2) DEFAULT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_variant_id`, `size_id`, `product_name`, `product_sku`, `size_name`, `warehouse_id`, `quantity`, `unit_price`, `unit_cost`, `subtotal`, `created_at`) VALUES
(1, 1, NULL, 87, NULL, 'Test jEAn', 'JEAN00012', '29', NULL, 1, 230000.00, 100000.00, 230000.00, '2026-01-11 15:53:34'),
(2, 2, 1, 87, 2, 'Test jEAn', 'JEAN00012', '29', NULL, 1, 230000.00, 0.00, 230000.00, '2026-02-25 15:23:01'),
(3, 3, 1, 1, 1, 'Classic Blue Slim Jeans', 'CBJ-SLIM-001-28', '28', NULL, 1, 150000.00, 0.00, 150000.00, '2026-02-25 15:41:00'),
(4, 4, 2, 8, 1, 'Black Regular Jeans New', 'BRJ-REG-001-28', '28', NULL, 1, 237150.00, 140000.00, 237150.00, '2026-02-25 15:51:48'),
(5, 5, 1, 1, 1, 'Classic Blue Slim Jeans', 'CBJ-SLIM-001-28', '28', NULL, 1, 239200.00, 150000.00, 239200.00, '2026-02-25 15:54:49'),
(6, 6, 2, 8, 1, 'Black Regular Jeans New', 'BRJ-REG-001-28', '28', NULL, 1, 237150.00, 140000.00, 237150.00, '2026-02-25 16:25:29');

-- --------------------------------------------------------

--
-- Table structure for table `order_shipping`
--

CREATE TABLE `order_shipping` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `recipient_name` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `address` text NOT NULL,
  `city` varchar(100) NOT NULL,
  `province` varchar(100) NOT NULL,
  `postal_code` varchar(10) NOT NULL,
  `country` varchar(100) DEFAULT 'Indonesia',
  `shipping_method` varchar(100) DEFAULT NULL,
  `courier` varchar(100) DEFAULT NULL,
  `tracking_number` varchar(100) DEFAULT NULL,
  `shipping_cost` decimal(12,2) DEFAULT 0.00,
  `warehouse_id` int(11) DEFAULT NULL,
  `shipped_at` datetime DEFAULT NULL,
  `delivered_at` datetime DEFAULT NULL,
  `estimated_delivery` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_shipping`
--

INSERT INTO `order_shipping` (`id`, `order_id`, `recipient_name`, `phone`, `address`, `city`, `province`, `postal_code`, `country`, `shipping_method`, `courier`, `tracking_number`, `shipping_cost`, `warehouse_id`, `shipped_at`, `delivered_at`, `estimated_delivery`, `created_at`, `updated_at`) VALUES
(1, 1, 'Admin User', '08123456789', 'Jl Colombo', 'Surabaya', 'Jawa Timur', '60111', 'Indonesia', NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, '2026-01-11 15:53:34', '2026-01-11 15:53:34'),
(2, 2, 'Test Customer', '081234567890', 'Jl Test 123', 'Jakarta', 'DKI Jakarta', '10110', 'Indonesia', NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, '2026-02-25 15:23:01', '2026-02-25 15:23:01'),
(3, 3, 'Test After Fix', '081234567890', 'Jl. Test Fix No 1', 'Jakarta', 'DKI Jakarta', '10110', 'Indonesia', NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, '2026-02-25 15:41:00', '2026-02-25 15:41:00'),
(4, 4, 'Endou Okita', '081311231', 'Jalan Ambengan no 2', 'Surabaya', 'Jawa Timur', '60111', 'Indonesia', NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, '2026-02-25 15:51:48', '2026-02-25 15:51:48'),
(5, 5, 'Admin User', '08123456789', 'Rumah 123', 'Surabaya', 'Jawa Timur', '60111', 'Indonesia', NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, '2026-02-25 15:54:49', '2026-02-25 15:54:49'),
(6, 6, 'Admin User', '08123456789', 'Rumah 123', 'Surabaya', 'Jawa Timur', '60111', 'Indonesia', NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, '2026-02-25 16:25:29', '2026-02-25 16:25:29');

-- --------------------------------------------------------

--
-- Table structure for table `order_shipping_history`
--

CREATE TABLE `order_shipping_history` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `status` varchar(50) NOT NULL COMMENT 'Status: pending, approved, processing, packed, shipped, in_transit, out_for_delivery, delivered, cancelled',
  `title` varchar(255) NOT NULL COMMENT 'Status title for display',
  `description` text DEFAULT NULL COMMENT 'Manual description by admin',
  `location` varchar(255) DEFAULT NULL COMMENT 'Location info',
  `created_by` int(11) DEFAULT NULL COMMENT 'Admin who created this update',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_shipping_history`
--

INSERT INTO `order_shipping_history` (`id`, `order_id`, `status`, `title`, `description`, `location`, `created_by`, `created_at`) VALUES
(1, 1, 'pending', 'Pesanan Dibuat', 'Pesanan berhasil dibuat dan menunggu persetujuan', NULL, 1, '2026-01-11 15:53:34'),
(2, 2, 'confirmed', 'Pesanan Manual Dibuat', 'Pesanan dibuat secara manual oleh admin', NULL, 1, '2026-02-25 15:23:01'),
(3, 3, 'confirmed', 'Pesanan Manual Dibuat', 'Pesanan dibuat secara manual oleh admin', NULL, 1, '2026-02-25 15:41:00'),
(4, 4, 'pending', 'Pesanan Dibuat', 'Pesanan berhasil dibuat dan menunggu persetujuan', NULL, NULL, '2026-02-25 15:51:48'),
(5, 5, 'pending', 'Pesanan Dibuat', 'Pesanan berhasil dibuat dan menunggu persetujuan', NULL, 1, '2026-02-25 15:54:49'),
(6, 6, 'pending', 'Pesanan Dibuat', 'Pesanan berhasil dibuat dan menunggu persetujuan', NULL, 1, '2026-02-25 16:25:30');

-- --------------------------------------------------------

--
-- Table structure for table `order_taxes`
--

CREATE TABLE `order_taxes` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `description` varchar(255) NOT NULL COMMENT 'Tax description/name',
  `amount` decimal(12,2) NOT NULL DEFAULT 0.00 COMMENT 'Tax amount',
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_tracking`
--

CREATE TABLE `order_tracking` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `status` varchar(50) NOT NULL COMMENT 'Status: pending, confirmed, processing, packed, shipped, in_transit, out_for_delivery, delivered, cancelled',
  `title` varchar(255) NOT NULL COMMENT 'Status title for display',
  `description` text DEFAULT NULL COMMENT 'Detailed description/notes',
  `location` varchar(255) DEFAULT NULL COMMENT 'Location info if applicable',
  `created_by` int(11) DEFAULT NULL COMMENT 'Admin who created this update',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `payment_method` varchar(50) NOT NULL,
  `payment_gateway` varchar(50) DEFAULT NULL,
  `transaction_id` varchar(255) DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `status` enum('pending','success','failed','expired') DEFAULT 'pending',
  `payment_proof` varchar(500) DEFAULT NULL,
  `payment_url` text DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL,
  `expired_at` datetime DEFAULT NULL,
  `response_data` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `snap_token` varchar(255) DEFAULT NULL,
  `va_number` varchar(100) DEFAULT NULL,
  `bill_key` varchar(100) DEFAULT NULL,
  `redirect_url` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `order_id`, `payment_method`, `payment_gateway`, `transaction_id`, `amount`, `status`, `payment_proof`, `payment_url`, `paid_at`, `expired_at`, `response_data`, `created_at`, `updated_at`, `snap_token`, `va_number`, `bill_key`, `redirect_url`) VALUES
(1, 2, 'cash', NULL, NULL, 230000.00, 'pending', NULL, NULL, NULL, NULL, NULL, '2026-02-25 15:23:01', '2026-02-25 15:23:01', NULL, NULL, NULL, NULL),
(2, 3, 'bank_transfer', NULL, NULL, 150000.00, 'pending', NULL, NULL, NULL, NULL, NULL, '2026-02-25 15:41:00', '2026-02-25 15:41:00', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `resource` varchar(50) NOT NULL,
  `action` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `name`, `resource`, `action`, `description`, `created_at`) VALUES
(1, 'View Dashboard', 'dashboard', 'view', 'Melihat halaman dashboard', '2026-01-25 09:04:32'),
(2, 'View Products', 'products', 'view', 'Melihat daftar produk', '2026-01-25 09:04:32'),
(3, 'Create Products', 'products', 'create', 'Membuat produk baru', '2026-01-25 09:04:32'),
(4, 'Update Products', 'products', 'update', 'Mengubah data produk', '2026-01-25 09:04:32'),
(5, 'Delete Products', 'products', 'delete', 'Menghapus produk', '2026-01-25 09:04:32'),
(6, 'Import Products', 'products', 'import', 'Import produk dari file', '2026-01-25 09:04:32'),
(7, 'View Categories', 'categories', 'view', 'Melihat daftar kategori', '2026-01-25 09:04:32'),
(8, 'Create Categories', 'categories', 'create', 'Membuat kategori baru', '2026-01-25 09:04:32'),
(9, 'Update Categories', 'categories', 'update', 'Mengubah kategori', '2026-01-25 09:04:32'),
(10, 'Delete Categories', 'categories', 'delete', 'Menghapus kategori', '2026-01-25 09:04:32'),
(11, 'View Fittings', 'fittings', 'view', 'Melihat daftar fitting', '2026-01-25 09:04:32'),
(12, 'Create Fittings', 'fittings', 'create', 'Membuat fitting baru', '2026-01-25 09:04:32'),
(13, 'Update Fittings', 'fittings', 'update', 'Mengubah fitting', '2026-01-25 09:04:32'),
(14, 'Delete Fittings', 'fittings', 'delete', 'Menghapus fitting', '2026-01-25 09:04:32'),
(15, 'View Sizes', 'sizes', 'view', 'Melihat daftar ukuran', '2026-01-25 09:04:32'),
(16, 'Create Sizes', 'sizes', 'create', 'Membuat ukuran baru', '2026-01-25 09:04:32'),
(17, 'Update Sizes', 'sizes', 'update', 'Mengubah ukuran', '2026-01-25 09:04:32'),
(18, 'Delete Sizes', 'sizes', 'delete', 'Menghapus ukuran', '2026-01-25 09:04:32'),
(19, 'View Size Charts', 'size_charts', 'view', 'Melihat size chart', '2026-01-25 09:04:32'),
(20, 'Create Size Charts', 'size_charts', 'create', 'Membuat size chart', '2026-01-25 09:04:32'),
(21, 'Update Size Charts', 'size_charts', 'update', 'Mengubah size chart', '2026-01-25 09:04:32'),
(22, 'Delete Size Charts', 'size_charts', 'delete', 'Menghapus size chart', '2026-01-25 09:04:32'),
(23, 'View Orders', 'orders', 'view', 'Melihat daftar pesanan', '2026-01-25 09:04:32'),
(24, 'Create Orders', 'orders', 'create', 'Membuat pesanan baru', '2026-01-25 09:04:32'),
(25, 'Update Orders', 'orders', 'update', 'Mengubah status pesanan', '2026-01-25 09:04:32'),
(26, 'Delete Orders', 'orders', 'delete', 'Membatalkan/menghapus pesanan', '2026-01-25 09:04:32'),
(27, 'Process Payments', 'orders', 'payment', 'Memproses pembayaran', '2026-01-25 09:04:32'),
(28, 'View Inventory', 'inventory', 'view', 'Melihat stok barang', '2026-01-25 09:04:32'),
(29, 'Create Inventory', 'inventory', 'create', 'Menambah stok baru', '2026-01-25 09:04:32'),
(30, 'Update Inventory', 'inventory', 'update', 'Mengubah stok', '2026-01-25 09:04:32'),
(31, 'Delete Inventory', 'inventory', 'delete', 'Menghapus data stok', '2026-01-25 09:04:32'),
(32, 'Stock Opname', 'inventory', 'opname', 'Melakukan stock opname', '2026-01-25 09:04:32'),
(33, 'Stock Transfer', 'inventory', 'transfer', 'Transfer stok antar gudang', '2026-01-25 09:04:32'),
(34, 'View Warehouses', 'warehouses', 'view', 'Melihat daftar gudang', '2026-01-25 09:04:32'),
(35, 'Create Warehouses', 'warehouses', 'create', 'Membuat gudang baru', '2026-01-25 09:04:32'),
(36, 'Update Warehouses', 'warehouses', 'update', 'Mengubah data gudang', '2026-01-25 09:04:32'),
(37, 'Delete Warehouses', 'warehouses', 'delete', 'Menghapus gudang', '2026-01-25 09:04:32'),
(38, 'View Reports', 'reports', 'view', 'Melihat laporan', '2026-01-25 09:04:32'),
(39, 'Export Reports', 'reports', 'export', 'Export laporan ke file', '2026-01-25 09:04:32'),
(40, 'Sales Report', 'reports', 'sales', 'Melihat laporan penjualan', '2026-01-25 09:04:32'),
(41, 'Inventory Report', 'reports', 'inventory', 'Melihat laporan inventori', '2026-01-25 09:04:32'),
(42, 'View Users', 'users', 'view', 'Melihat daftar pengguna', '2026-01-25 09:04:32'),
(43, 'Create Users', 'users', 'create', 'Membuat pengguna baru', '2026-01-25 09:04:32'),
(44, 'Update Users', 'users', 'update', 'Mengubah data pengguna', '2026-01-25 09:04:32'),
(45, 'Delete Users', 'users', 'delete', 'Menghapus pengguna', '2026-01-25 09:04:32'),
(46, 'View User Transactions', 'users', 'transactions', 'Melihat transaksi pengguna', '2026-01-25 09:04:32'),
(47, 'View Roles', 'roles', 'view', 'Melihat daftar role', '2026-01-25 09:04:32'),
(48, 'Create Roles', 'roles', 'create', 'Membuat role baru', '2026-01-25 09:04:32'),
(49, 'Update Roles', 'roles', 'update', 'Mengubah role', '2026-01-25 09:04:32'),
(50, 'Delete Roles', 'roles', 'delete', 'Menghapus role', '2026-01-25 09:04:32'),
(51, 'Assign Roles', 'roles', 'assign', 'Menetapkan role ke user', '2026-01-25 09:04:32'),
(52, 'View Banners', 'banners', 'view', 'Melihat daftar banner', '2026-01-25 09:04:32'),
(53, 'Create Banners', 'banners', 'create', 'Membuat banner baru', '2026-01-25 09:04:32'),
(54, 'Update Banners', 'banners', 'update', 'Mengubah banner', '2026-01-25 09:04:32'),
(55, 'Delete Banners', 'banners', 'delete', 'Menghapus banner', '2026-01-25 09:04:32'),
(56, 'View Content', 'content', 'view', 'Melihat konten website', '2026-01-25 09:04:32'),
(57, 'Create Content', 'content', 'create', 'Membuat konten baru', '2026-01-25 09:04:32'),
(58, 'Update Content', 'content', 'update', 'Mengubah konten', '2026-01-25 09:04:32'),
(59, 'Delete Content', 'content', 'delete', 'Menghapus konten', '2026-01-25 09:04:32'),
(60, 'View Coupons', 'coupons', 'view', 'Melihat daftar kupon', '2026-01-25 09:04:32'),
(61, 'Create Coupons', 'coupons', 'create', 'Membuat kupon baru', '2026-01-25 09:04:32'),
(62, 'Update Coupons', 'coupons', 'update', 'Mengubah kupon', '2026-01-25 09:04:32'),
(63, 'Delete Coupons', 'coupons', 'delete', 'Menghapus kupon', '2026-01-25 09:04:32'),
(64, 'View Shipping', 'shipping', 'view', 'Melihat pengaturan pengiriman', '2026-01-25 09:04:32'),
(65, 'Create Shipping', 'shipping', 'create', 'Membuat aturan pengiriman', '2026-01-25 09:04:32'),
(66, 'Update Shipping', 'shipping', 'update', 'Mengubah pengaturan pengiriman', '2026-01-25 09:04:32'),
(67, 'Delete Shipping', 'shipping', 'delete', 'Menghapus aturan pengiriman', '2026-01-25 09:04:32'),
(68, 'View City Shipping', 'city_shipping', 'view', 'Melihat ongkir per kota', '2026-01-25 09:04:32'),
(69, 'Create City Shipping', 'city_shipping', 'create', 'Menambah ongkir kota', '2026-01-25 09:04:32'),
(70, 'Update City Shipping', 'city_shipping', 'update', 'Mengubah ongkir kota', '2026-01-25 09:04:32'),
(71, 'Delete City Shipping', 'city_shipping', 'delete', 'Menghapus ongkir kota', '2026-01-25 09:04:32'),
(72, 'View Exchange Rates', 'exchange_rates', 'view', 'Melihat kurs mata uang', '2026-01-25 09:04:32'),
(73, 'Create Exchange Rates', 'exchange_rates', 'create', 'Menambah kurs baru', '2026-01-25 09:04:32'),
(74, 'Update Exchange Rates', 'exchange_rates', 'update', 'Mengubah kurs', '2026-01-25 09:04:32'),
(75, 'Delete Exchange Rates', 'exchange_rates', 'delete', 'Menghapus kurs', '2026-01-25 09:04:33'),
(76, 'View Settings', 'settings', 'view', 'Melihat pengaturan sistem', '2026-01-25 09:04:33'),
(77, 'Update Settings', 'settings', 'update', 'Mengubah pengaturan sistem', '2026-01-25 09:04:33'),
(78, 'View Activity Logs', 'activity_logs', 'view', 'Melihat log aktivitas', '2026-01-25 09:04:33'),
(79, 'Delete Activity Logs', 'activity_logs', 'delete', 'Menghapus log aktivitas', '2026-01-25 09:04:33');

-- --------------------------------------------------------

--
-- Table structure for table `positions`
--

CREATE TABLE `positions` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `code` varchar(20) DEFAULT NULL,
  `office_id` int(11) DEFAULT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `level` int(11) DEFAULT 1,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `gender` enum('pria','wanita','both') DEFAULT 'both',
  `fitting_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `short_description` varchar(500) DEFAULT NULL,
  `base_price` decimal(12,2) NOT NULL,
  `discount_percentage` decimal(5,2) DEFAULT NULL COMMENT 'Discount percentage (0-100)',
  `discount_start_date` datetime DEFAULT NULL COMMENT 'Discount start date',
  `discount_end_date` datetime DEFAULT NULL COMMENT 'Discount end date',
  `master_cost_price` decimal(12,2) DEFAULT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `weight` decimal(8,2) DEFAULT 0.00,
  `is_active` tinyint(1) DEFAULT 1,
  `is_featured` tinyint(1) DEFAULT 0,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `meta_keywords` varchar(255) DEFAULT NULL,
  `view_count` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `slug`, `category_id`, `gender`, `fitting_id`, `description`, `short_description`, `base_price`, `discount_percentage`, `discount_start_date`, `discount_end_date`, `master_cost_price`, `sku`, `weight`, `is_active`, `is_featured`, `meta_title`, `meta_description`, `meta_keywords`, `view_count`, `created_at`, `updated_at`) VALUES
(1, 'Classic Blue Slim Jeans', 'classic-blue-slim-jeans', 1, 'pria', 1, 'Premium denim jeans with classic blue wash. Perfect fit for everyday wear.', 'Classic blue denim with slim fit', 299000.00, 20.00, NULL, NULL, 150000.00, 'CBJ-SLIM-001', 0.50, 1, 1, 'Classic Blue Slim Jeans', 'Classic blue denim with slim fit', NULL, 4, '2025-12-18 17:19:00', '2026-02-26 15:51:05'),
(2, 'Black Regular Jeans New', 'black-regular-jeans', 1, 'pria', 2, 'Timeless black jeans with regular fit. Versatile and comfortable.', 'Black denim regular fit', 279000.00, 15.00, NULL, NULL, 140000.00, 'BRJ-REG-001', 0.50, 1, 1, 'Black Regular Jeans', 'Black denim regular fit', NULL, 18, '2025-12-18 17:19:01', '2026-02-26 15:51:05'),
(3, 'Light Wash Loose Jeans', 'light-wash-loose-jeans', 2, 'wanita', 3, 'Relaxed fit jeans with light wash. Comfortable for all-day wear.', 'Light wash loose fit', 319000.00, NULL, NULL, NULL, 160000.00, 'LWJ-LOOSE-001', 0.60, 1, 1, 'Light Wash Loose Jeans', 'Light wash loose fit', NULL, 0, '2025-12-18 17:19:01', '2026-02-26 15:51:05'),
(27, 'Jean Biru terbaru', 'jean-biru-terbaru', 3, 'both', 3, 'Jeans terbaik dengan bahan yang super premium', 'Jeans terbaik', 250000.00, NULL, NULL, NULL, 1999999.00, 'BR121', 0.99, 1, 0, 'Jean Biru terbaru', 'Jeans terbaik', NULL, 0, '2026-01-11 15:12:32', '2026-01-11 15:12:32'),
(28, 'Test jEAn', 'test-jean', 3, 'both', 3, 'Test1234', 'Test', 130000.00, NULL, NULL, NULL, 100000.00, 'BLT001', 0.99, 1, 0, 'Test jEAn', 'Test', NULL, 3, '2026-01-11 15:22:17', '2026-01-11 15:25:57'),
(29, 'Loose Jeans', 'loose-jeans', 1, 'pria', 3, NULL, NULL, 500000.00, NULL, NULL, NULL, 450000.00, NULL, 1.99, 1, 1, 'Loose Jeans', '', NULL, 2, '2026-02-26 15:26:48', '2026-02-26 16:07:06');

-- --------------------------------------------------------

--
-- Table structure for table `product_images`
--

CREATE TABLE `product_images` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `is_primary` tinyint(1) DEFAULT 0,
  `sort_order` int(11) DEFAULT 0,
  `alt_text` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_images`
--

INSERT INTO `product_images` (`id`, `product_id`, `image_url`, `is_primary`, `sort_order`, `alt_text`, `created_at`) VALUES
(1, 2, '/uploads/products/images-1767277696625-664784125.jpg', 1, 0, NULL, '2026-01-01 14:28:16');

-- --------------------------------------------------------

--
-- Table structure for table `product_variants`
--

CREATE TABLE `product_variants` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `size_id` int(11) NOT NULL,
  `sku_variant` varchar(100) NOT NULL,
  `additional_price` decimal(12,2) DEFAULT 0.00,
  `stock_quantity` int(11) DEFAULT 0,
  `warehouse_id` int(11) NOT NULL,
  `minimum_stock` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `cost_price` decimal(12,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_variants`
--

INSERT INTO `product_variants` (`id`, `product_id`, `size_id`, `sku_variant`, `additional_price`, `stock_quantity`, `warehouse_id`, `minimum_stock`, `is_active`, `created_at`, `updated_at`, `cost_price`) VALUES
(1, 1, 1, 'CBJ-SLIM-001-28', 0.00, 7, 1, NULL, 1, '2025-12-18 17:19:00', '2026-02-25 15:54:49', 0.00),
(2, 1, 2, 'CBJ-SLIM-001-29', 0.00, 13, 1, NULL, 1, '2025-12-18 17:19:00', '2025-12-21 07:08:32', 0.00),
(3, 1, 3, 'CBJ-SLIM-001-30', 0.00, 11, 1, NULL, 1, '2025-12-18 17:19:00', '2025-12-21 07:08:32', 0.00),
(4, 1, 4, 'CBJ-SLIM-001-31', 0.00, 6, 1, NULL, 1, '2025-12-18 17:19:00', '2025-12-21 07:08:32', 0.00),
(5, 1, 5, 'CBJ-SLIM-001-32', 0.00, 11, 1, NULL, 1, '2025-12-18 17:19:00', '2025-12-21 07:08:32', 0.00),
(6, 1, 6, 'CBJ-SLIM-001-33', 0.00, 7, 1, NULL, 1, '2025-12-18 17:19:00', '2025-12-21 07:08:32', 0.00),
(7, 1, 7, 'CBJ-SLIM-001-34', 0.00, 15, 1, NULL, 1, '2025-12-18 17:19:01', '2025-12-21 07:08:32', 0.00),
(8, 2, 1, 'BRJ-REG-001-28', 0.00, 9, 1, NULL, 1, '2025-12-18 17:19:01', '2026-02-25 16:25:29', 0.00),
(9, 2, 2, 'BRJ-REG-001-29', 0.00, 23, 1, NULL, 1, '2025-12-18 17:19:01', '2025-12-21 07:08:32', 0.00),
(10, 2, 3, 'BRJ-REG-001-30', 0.00, 15, 1, NULL, 1, '2025-12-18 17:19:01', '2025-12-21 07:08:32', 0.00),
(11, 2, 4, 'BRJ-REG-001-31', 0.00, 16, 1, NULL, 1, '2025-12-18 17:19:01', '2025-12-21 07:08:32', 0.00),
(12, 2, 5, 'BRJ-REG-001-32', 0.00, 8, 1, NULL, 1, '2025-12-18 17:19:01', '2025-12-21 07:08:32', 0.00),
(13, 2, 6, 'BRJ-REG-001-33', 0.00, 18, 1, NULL, 1, '2025-12-18 17:19:01', '2025-12-21 07:08:32', 0.00),
(15, 3, 1, 'LWJ-LOOSE-001-28', 0.00, 18, 1, NULL, 1, '2025-12-18 17:19:01', '2025-12-21 07:08:32', 0.00),
(16, 3, 2, 'LWJ-LOOSE-001-29', 0.00, 17, 1, NULL, 1, '2025-12-18 17:19:01', '2025-12-21 07:08:32', 0.00),
(17, 3, 3, 'LWJ-LOOSE-001-30', 0.00, 7, 1, NULL, 1, '2025-12-18 17:19:01', '2025-12-21 07:08:32', 0.00),
(18, 3, 4, 'LWJ-LOOSE-001-31', 0.00, 13, 1, NULL, 1, '2025-12-18 17:19:01', '2025-12-21 07:08:32', 0.00),
(19, 3, 5, 'LWJ-LOOSE-001-32', 0.00, 19, 1, NULL, 1, '2025-12-18 17:19:01', '2025-12-21 07:08:32', 0.00),
(20, 3, 6, 'LWJ-LOOSE-001-33', 0.00, 11, 1, NULL, 1, '2025-12-18 17:19:01', '2025-12-21 07:08:32', 0.00),
(21, 3, 7, 'LWJ-LOOSE-001-34', 0.00, 12, 1, NULL, 1, '2025-12-18 17:19:01', '2025-12-21 07:08:32', 0.00),
(43, 2, 15, 'JEAN', 600000.00, 10, 1, 5, 1, '2025-12-23 06:21:51', '2025-12-23 06:21:51', 250000.00),
(57, 2, 7, 'BRJ-REG-001-34', 0.00, 14, 0, NULL, 1, '2025-12-23 15:30:03', '2025-12-23 15:30:03', 0.00),
(87, 28, 2, 'JEAN00012', 100000.00, 8, 1, 5, 1, '2026-01-11 15:22:53', '2026-02-25 15:23:01', 2000.00),
(88, 29, 8, 'LOO-36-GU', 457000.00, 15, 1, 5, 1, '2026-02-26 15:27:17', '2026-02-26 15:27:17', 450000.00);

-- --------------------------------------------------------

--
-- Table structure for table `returns`
--

CREATE TABLE `returns` (
  `id` int(11) NOT NULL,
  `return_number` varchar(50) NOT NULL,
  `order_id` int(11) NOT NULL,
  `warehouse_id` int(11) NOT NULL,
  `status` enum('pending','completed','cancelled') NOT NULL DEFAULT 'completed',
  `notes` text DEFAULT NULL,
  `total_items` int(11) NOT NULL DEFAULT 0,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `return_items`
--

CREATE TABLE `return_items` (
  `id` int(11) NOT NULL,
  `return_id` int(11) NOT NULL,
  `order_item_id` int(11) NOT NULL,
  `product_variant_id` int(11) NOT NULL,
  `product_name` varchar(255) DEFAULT NULL,
  `size_name` varchar(50) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Superadmin', 'Role dengan akses penuh ke semua fitur sistem', 1, '2026-01-25 09:07:17', '2026-01-25 09:09:19'),
(2, 'Admin Stok', 'Admin untuk pengelolaan stok, gudang, produk, dan pesanan', 1, '2026-02-25 15:31:43', '2026-02-25 15:31:43');

-- --------------------------------------------------------

--
-- Table structure for table `role_permissions`
--

CREATE TABLE `role_permissions` (
  `id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `role_permissions`
--

INSERT INTO `role_permissions` (`id`, `role_id`, `permission_id`, `created_at`) VALUES
(1, 1, 78, '2026-02-25 15:31:34'),
(2, 1, 79, '2026-02-25 15:31:34'),
(3, 1, 52, '2026-02-25 15:31:34'),
(4, 1, 53, '2026-02-25 15:31:34'),
(5, 1, 54, '2026-02-25 15:31:34'),
(6, 1, 55, '2026-02-25 15:31:34'),
(7, 1, 7, '2026-02-25 15:31:34'),
(8, 1, 8, '2026-02-25 15:31:34'),
(9, 1, 9, '2026-02-25 15:31:34'),
(10, 1, 10, '2026-02-25 15:31:34'),
(11, 1, 68, '2026-02-25 15:31:34'),
(12, 1, 69, '2026-02-25 15:31:34'),
(13, 1, 70, '2026-02-25 15:31:34'),
(14, 1, 71, '2026-02-25 15:31:34'),
(15, 1, 56, '2026-02-25 15:31:34'),
(16, 1, 57, '2026-02-25 15:31:34'),
(17, 1, 58, '2026-02-25 15:31:34'),
(18, 1, 59, '2026-02-25 15:31:34'),
(19, 1, 60, '2026-02-25 15:31:34'),
(20, 1, 61, '2026-02-25 15:31:34'),
(21, 1, 62, '2026-02-25 15:31:34'),
(22, 1, 63, '2026-02-25 15:31:34'),
(23, 1, 1, '2026-02-25 15:31:34'),
(24, 1, 72, '2026-02-25 15:31:34'),
(25, 1, 73, '2026-02-25 15:31:34'),
(26, 1, 74, '2026-02-25 15:31:34'),
(27, 1, 75, '2026-02-25 15:31:34'),
(28, 1, 11, '2026-02-25 15:31:34'),
(29, 1, 12, '2026-02-25 15:31:34'),
(30, 1, 13, '2026-02-25 15:31:34'),
(31, 1, 14, '2026-02-25 15:31:34'),
(32, 1, 28, '2026-02-25 15:31:34'),
(33, 1, 29, '2026-02-25 15:31:34'),
(34, 1, 30, '2026-02-25 15:31:34'),
(35, 1, 31, '2026-02-25 15:31:34'),
(36, 1, 32, '2026-02-25 15:31:34'),
(37, 1, 33, '2026-02-25 15:31:34'),
(38, 1, 23, '2026-02-25 15:31:34'),
(39, 1, 24, '2026-02-25 15:31:34'),
(40, 1, 25, '2026-02-25 15:31:34'),
(41, 1, 26, '2026-02-25 15:31:34'),
(42, 1, 27, '2026-02-25 15:31:34'),
(43, 1, 2, '2026-02-25 15:31:34'),
(44, 1, 3, '2026-02-25 15:31:34'),
(45, 1, 4, '2026-02-25 15:31:34'),
(46, 1, 5, '2026-02-25 15:31:34'),
(47, 1, 6, '2026-02-25 15:31:34'),
(48, 1, 38, '2026-02-25 15:31:34'),
(49, 1, 39, '2026-02-25 15:31:34'),
(50, 1, 40, '2026-02-25 15:31:34'),
(51, 1, 41, '2026-02-25 15:31:34'),
(52, 1, 47, '2026-02-25 15:31:34'),
(53, 1, 48, '2026-02-25 15:31:34'),
(54, 1, 49, '2026-02-25 15:31:34'),
(55, 1, 50, '2026-02-25 15:31:34'),
(56, 1, 51, '2026-02-25 15:31:34'),
(57, 1, 76, '2026-02-25 15:31:34'),
(58, 1, 77, '2026-02-25 15:31:34'),
(59, 1, 64, '2026-02-25 15:31:34'),
(60, 1, 65, '2026-02-25 15:31:34'),
(61, 1, 66, '2026-02-25 15:31:34'),
(62, 1, 67, '2026-02-25 15:31:34'),
(63, 1, 19, '2026-02-25 15:31:34'),
(64, 1, 20, '2026-02-25 15:31:34'),
(65, 1, 21, '2026-02-25 15:31:34'),
(66, 1, 22, '2026-02-25 15:31:34'),
(67, 1, 15, '2026-02-25 15:31:34'),
(68, 1, 16, '2026-02-25 15:31:34'),
(69, 1, 17, '2026-02-25 15:31:34'),
(70, 1, 18, '2026-02-25 15:31:34'),
(71, 1, 42, '2026-02-25 15:31:34'),
(72, 1, 43, '2026-02-25 15:31:34'),
(73, 1, 44, '2026-02-25 15:31:34'),
(74, 1, 45, '2026-02-25 15:31:34'),
(75, 1, 46, '2026-02-25 15:31:34'),
(76, 1, 34, '2026-02-25 15:31:34'),
(77, 1, 35, '2026-02-25 15:31:34'),
(78, 1, 36, '2026-02-25 15:31:34'),
(79, 1, 37, '2026-02-25 15:31:34'),
(128, 2, 1, '2026-02-25 15:31:59'),
(129, 2, 2, '2026-02-25 15:31:59'),
(130, 2, 3, '2026-02-25 15:31:59'),
(131, 2, 4, '2026-02-25 15:31:59'),
(132, 2, 5, '2026-02-25 15:31:59'),
(133, 2, 6, '2026-02-25 15:31:59'),
(134, 2, 7, '2026-02-25 15:31:59'),
(135, 2, 8, '2026-02-25 15:31:59'),
(136, 2, 9, '2026-02-25 15:31:59'),
(137, 2, 10, '2026-02-25 15:31:59'),
(138, 2, 11, '2026-02-25 15:31:59'),
(139, 2, 12, '2026-02-25 15:31:59'),
(140, 2, 13, '2026-02-25 15:31:59'),
(141, 2, 14, '2026-02-25 15:31:59'),
(142, 2, 15, '2026-02-25 15:31:59'),
(143, 2, 16, '2026-02-25 15:31:59'),
(144, 2, 17, '2026-02-25 15:31:59'),
(145, 2, 18, '2026-02-25 15:31:59'),
(146, 2, 19, '2026-02-25 15:31:59'),
(147, 2, 20, '2026-02-25 15:31:59'),
(148, 2, 21, '2026-02-25 15:31:59'),
(149, 2, 22, '2026-02-25 15:31:59'),
(150, 2, 23, '2026-02-25 15:31:59'),
(151, 2, 24, '2026-02-25 15:31:59'),
(152, 2, 25, '2026-02-25 15:31:59'),
(153, 2, 28, '2026-02-25 15:31:59'),
(154, 2, 29, '2026-02-25 15:31:59'),
(155, 2, 30, '2026-02-25 15:31:59'),
(156, 2, 31, '2026-02-25 15:31:59'),
(157, 2, 32, '2026-02-25 15:31:59'),
(158, 2, 33, '2026-02-25 15:31:59'),
(159, 2, 34, '2026-02-25 15:31:59'),
(160, 2, 35, '2026-02-25 15:31:59'),
(161, 2, 36, '2026-02-25 15:31:59'),
(162, 2, 37, '2026-02-25 15:31:59'),
(163, 2, 38, '2026-02-25 15:31:59'),
(164, 2, 41, '2026-02-25 15:31:59');

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` int(11) NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `setting_type` varchar(50) DEFAULT 'text',
  `description` text DEFAULT NULL,
  `is_public` tinyint(1) DEFAULT 0,
  `setting_group` varchar(50) DEFAULT 'general',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `setting_key`, `setting_value`, `setting_type`, `description`, `is_public`, `setting_group`, `created_at`, `updated_at`) VALUES
(1, 'site_name', 'Marketplace J', 'text', 'Website name', 1, 'general', '2025-12-18 17:19:01', '2026-01-25 10:55:00'),
(2, 'currency', 'IDR', 'text', 'Default currency', 1, 'general', '2025-12-18 17:19:01', '2025-12-18 17:19:01'),
(3, 'member_discount', '10', 'number', 'Default member discount percentage', 0, 'general', '2025-12-18 17:19:01', '2025-12-18 17:19:01'),
(4, 'min_order', '100000', 'number', 'Minimum order amount', 1, 'general', '2025-12-18 17:19:01', '2025-12-18 17:19:01'),
(5, 'free_shipping_min', '500000', 'number', 'Minimum for free shipping', 1, 'general', '2025-12-18 17:19:01', '2025-12-18 17:19:01'),
(21, 'site_logo', '/uploads/settings/1769436531490-514956287.jpg', 'text', NULL, 0, 'general', '2026-01-25 10:57:12', '2026-01-26 14:08:54'),
(22, 'site_favicon', '', 'image', 'Favicon website', 1, 'site', '2026-01-26 14:08:43', '2026-01-26 14:08:43'),
(23, 'site_description', '', 'textarea', 'Deskripsi website', 1, 'site', '2026-01-26 14:08:43', '2026-01-26 14:08:43'),
(24, 'contact_address', 'Jalan 123', 'textarea', 'Alamat perusahaan', 1, 'contact', '2026-01-26 14:08:43', '2026-02-20 13:45:32'),
(25, 'contact_phone', '', 'text', 'Nomor telepon', 1, 'contact', '2026-01-26 14:08:43', '2026-01-26 14:08:43'),
(26, 'contact_whatsapp', '', 'text', 'Nomor WhatsApp', 1, 'contact', '2026-01-26 14:08:43', '2026-01-26 14:08:43'),
(27, 'contact_email', '', 'text', 'Email kontak', 1, 'contact', '2026-01-26 14:08:43', '2026-01-26 14:08:43'),
(28, 'email_smtp_host', '', 'text', 'SMTP Host', 0, 'email', '2026-01-26 14:08:43', '2026-01-26 14:08:43'),
(29, 'email_smtp_port', '587', 'text', 'SMTP Port', 0, 'email', '2026-01-26 14:08:43', '2026-01-26 14:08:43'),
(30, 'email_smtp_user', '', 'text', 'SMTP Username', 0, 'email', '2026-01-26 14:08:43', '2026-01-26 14:08:43'),
(31, 'email_smtp_pass', '', 'password', 'SMTP Password', 0, 'email', '2026-01-26 14:08:43', '2026-01-26 14:08:43'),
(32, 'email_from_name', '', 'text', 'Nama pengirim email', 0, 'email', '2026-01-26 14:08:43', '2026-01-26 14:08:43'),
(33, 'email_from_address', '', 'text', 'Alamat email pengirim', 0, 'email', '2026-01-26 14:08:43', '2026-01-26 14:08:43'),
(34, 'payment_midtrans_enabled', 'false', 'boolean', 'Aktifkan Midtrans', 0, 'payment', '2026-01-26 14:08:43', '2026-01-26 14:08:43'),
(35, 'payment_midtrans_server_key', '', 'password', 'Midtrans Server Key', 0, 'payment', '2026-01-26 14:08:43', '2026-01-26 14:08:43'),
(36, 'payment_midtrans_client_key', '', 'text', 'Midtrans Client Key', 1, 'payment', '2026-01-26 14:08:43', '2026-01-26 14:08:43'),
(37, 'payment_midtrans_sandbox', 'true', 'boolean', 'Gunakan Sandbox Mode', 0, 'payment', '2026-01-26 14:08:43', '2026-01-26 14:08:43'),
(38, 'payment_bank_transfer_enabled', 'true', 'boolean', 'Aktifkan Transfer Bank', 1, 'payment', '2026-01-26 14:08:43', '2026-01-26 14:08:43'),
(39, 'payment_bank_name', '', 'text', 'Nama Bank', 1, 'payment', '2026-01-26 14:08:43', '2026-01-26 14:08:43'),
(40, 'payment_bank_account', '', 'text', 'Nomor Rekening', 1, 'payment', '2026-01-26 14:08:43', '2026-01-26 14:08:43'),
(41, 'payment_bank_holder', '', 'text', 'Nama Pemilik Rekening', 1, 'payment', '2026-01-26 14:08:43', '2026-01-26 14:08:43'),
(42, 'social_facebook', '', 'text', 'Facebook URL', 1, 'social', '2026-01-26 14:08:43', '2026-01-26 14:08:43'),
(43, 'social_instagram', '', 'text', 'Instagram URL', 1, 'social', '2026-01-26 14:08:43', '2026-01-26 14:08:43'),
(44, 'social_twitter', '', 'text', 'Twitter URL', 1, 'social', '2026-01-26 14:08:43', '2026-01-26 14:08:43'),
(45, 'social_tiktok', '', 'text', 'TikTok URL', 1, 'social', '2026-01-26 14:08:43', '2026-01-26 14:08:43'),
(46, 'social_youtube', '', 'text', 'YouTube URL', 1, 'social', '2026-01-26 14:08:43', '2026-01-26 14:08:43'),
(47, 'cookie_notice_id', 'Kami menggunakan cookie untuk meningkatkan pengalaman Anda di situs kami. Dengan melanjutkan menjelajah, Anda menyetujui penggunaan cookie kami.', 'textarea', 'Cookie notice text (Indonesian)', 1, 'legal', '2026-03-19 13:16:10', '2026-03-19 13:16:10'),
(48, 'cookie_notice_en', 'We use cookies to improve your experience on our site. By continuing to browse, you agree to our use of cookies.', 'textarea', 'Cookie notice text (English)', 1, 'legal', '2026-03-19 13:16:10', '2026-03-19 13:16:10'),
(49, 'eula_title_id', 'Syarat & Ketentuan', 'text', 'EULA title (Indonesian)', 1, 'legal', '2026-03-19 13:16:10', '2026-03-19 13:16:10'),
(50, 'eula_title_en', 'Terms & Conditions', 'text', 'EULA title (English)', 1, 'legal', '2026-03-19 13:16:10', '2026-03-19 13:16:10'),
(51, 'eula_content_id', '', 'textarea', 'EULA content (Indonesian)', 1, 'legal', '2026-03-19 13:16:10', '2026-03-19 13:16:10'),
(52, 'eula_content_en', '', 'textarea', 'EULA content (English)', 1, 'legal', '2026-03-19 13:16:10', '2026-03-19 13:16:10'),
(53, 'margin_calculation_method', 'latest', 'text', NULL, 0, 'report', '2026-03-19 13:42:27', '2026-03-19 13:42:27'),
(54, 'recaptcha_enabled', 'false', 'boolean', 'Aktifkan Google reCAPTCHA v2 pada halaman registrasi', 1, 'security', '2026-04-26 06:07:01', '2026-04-26 06:07:01'),
(55, 'recaptcha_site_key', '', 'text', 'Google reCAPTCHA Site Key (public)', 1, 'security', '2026-04-26 06:07:01', '2026-04-26 06:07:01'),
(56, 'recaptcha_secret_key', '', 'password', 'Google reCAPTCHA Secret Key (private)', 0, 'security', '2026-04-26 06:07:01', '2026-04-26 06:07:01');

-- --------------------------------------------------------

--
-- Table structure for table `shipping_costs`
--

CREATE TABLE `shipping_costs` (
  `id` int(11) NOT NULL,
  `city_id` int(11) NOT NULL,
  `warehouse_id` int(11) DEFAULT NULL,
  `courier` varchar(50) NOT NULL,
  `service` varchar(50) DEFAULT NULL,
  `cost` decimal(12,2) NOT NULL DEFAULT 0.00,
  `cost_per_kg` decimal(12,2) DEFAULT 0.00,
  `estimated_days_min` int(11) DEFAULT 1,
  `estimated_days_max` int(11) DEFAULT 3,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `shipping_costs`
--

INSERT INTO `shipping_costs` (`id`, `city_id`, `warehouse_id`, `courier`, `service`, `cost`, `cost_per_kg`, `estimated_days_min`, `estimated_days_max`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'JNE', 'REG', 9000.00, 5000.00, 1, 2, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(2, 1, 1, 'JNE', 'YES', 15000.00, 8000.00, 1, 1, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(3, 1, 1, 'J&T', 'Regular', 9000.00, 5000.00, 1, 2, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(4, 4, 1, 'JNE', 'REG', 9000.00, 5000.00, 1, 2, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(5, 4, 1, 'JNE', 'YES', 15000.00, 8000.00, 1, 1, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(6, 4, 1, 'J&T', 'Regular', 9000.00, 5000.00, 1, 2, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(7, 3, 1, 'JNE', 'REG', 9000.00, 5000.00, 1, 2, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(8, 5, 1, 'JNE', 'REG', 9000.00, 5000.00, 1, 2, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(9, 2, 1, 'JNE', 'REG', 9000.00, 5000.00, 1, 2, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(10, 6, 1, 'JNE', 'REG', 15000.00, 8000.00, 2, 3, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(11, 6, 1, 'JNE', 'YES', 25000.00, 12000.00, 1, 1, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(12, 6, 1, 'J&T', 'Regular', 14000.00, 7500.00, 2, 3, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(13, 7, 1, 'JNE', 'REG', 10000.00, 5500.00, 1, 2, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(14, 7, 1, 'J&T', 'Regular', 10000.00, 5500.00, 1, 2, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(15, 8, 1, 'JNE', 'REG', 12000.00, 6000.00, 1, 2, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(16, 9, 1, 'JNE', 'REG', 10000.00, 5500.00, 1, 2, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(17, 10, 1, 'JNE', 'REG', 18000.00, 9000.00, 2, 3, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(18, 12, 1, 'JNE', 'REG', 22000.00, 11000.00, 3, 4, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(19, 13, 1, 'JNE', 'REG', 20000.00, 10000.00, 3, 4, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(20, 14, 1, 'JNE', 'REG', 22000.00, 11000.00, 2, 4, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(21, 14, 1, 'JNE', 'YES', 35000.00, 18000.00, 1, 2, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(22, 14, 1, 'J&T', 'Regular', 21000.00, 10500.00, 2, 4, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(23, 15, 1, 'JNE', 'REG', 24000.00, 12000.00, 3, 4, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(24, 16, 1, 'JNE', 'REG', 25000.00, 12500.00, 3, 4, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(25, 19, 1, 'JNE', 'REG', 25000.00, 12500.00, 3, 4, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(26, 19, 1, 'JNE', 'YES', 40000.00, 20000.00, 1, 2, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(27, 19, 1, 'J&T', 'Regular', 24000.00, 12000.00, 3, 4, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(28, 20, 1, 'JNE', 'REG', 28000.00, 14000.00, 3, 5, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(29, 21, 1, 'JNE', 'REG', 26000.00, 13000.00, 3, 4, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(30, 24, 1, 'JNE', 'REG', 23000.00, 11500.00, 2, 4, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(31, 24, 1, 'JNE', 'YES', 38000.00, 19000.00, 1, 2, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(32, 25, 1, 'JNE', 'REG', 24000.00, 12000.00, 2, 4, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(33, 27, 1, 'JNE', 'REG', 10000.00, 5500.00, 1, 2, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(34, 27, 1, 'JNE', 'YES', 18000.00, 9000.00, 1, 1, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(35, 28, 1, 'JNE', 'REG', 10000.00, 5500.00, 1, 2, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(36, 29, 1, 'JNE', 'REG', 15000.00, 7500.00, 2, 3, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(37, 30, 1, 'JNE', 'REG', 35000.00, 17500.00, 4, 5, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(38, 30, 1, 'JNE', 'YES', 55000.00, 27000.00, 2, 3, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(39, 31, 1, 'JNE', 'REG', 36000.00, 18000.00, 4, 5, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(40, 32, 1, 'JNE', 'REG', 45000.00, 22000.00, 5, 7, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(41, 33, 1, 'JNE', 'REG', 48000.00, 24000.00, 5, 7, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(42, 34, 1, 'JNE', 'REG', 40000.00, 20000.00, 4, 6, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(43, 35, 1, 'JNE', 'REG', 35000.00, 17500.00, 3, 5, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(44, 36, 1, 'JNE', 'REG', 55000.00, 27000.00, 5, 7, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(45, 37, 1, 'JNE', 'REG', 50000.00, 25000.00, 5, 7, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(46, 38, 1, 'JNE', 'REG', 55000.00, 27000.00, 5, 7, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(47, 39, 1, 'JNE', 'REG', 58000.00, 29000.00, 5, 7, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(48, 40, 1, 'JNE', 'REG', 50000.00, 25000.00, 5, 7, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(49, 40, 1, 'JNE', 'YES', 80000.00, 40000.00, 2, 3, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(50, 41, 1, 'JNE', 'REG', 65000.00, 32000.00, 6, 8, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(51, 19, 3, 'JNE', 'REG', 8000.00, 4000.00, 1, 1, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(52, 20, 3, 'JNE', 'REG', 12000.00, 6000.00, 1, 2, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(53, 21, 3, 'JNE', 'REG', 9000.00, 4500.00, 1, 1, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(54, 30, 3, 'JNE', 'REG', 25000.00, 12500.00, 2, 3, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(55, 6, 2, 'JNE', 'REG', 8000.00, 4000.00, 1, 1, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(56, 12, 2, 'JNE', 'REG', 12000.00, 6000.00, 1, 2, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54'),
(57, 13, 2, 'JNE', 'REG', 10000.00, 5000.00, 1, 2, 1, '2025-12-23 15:31:54', '2025-12-23 15:31:54');

-- --------------------------------------------------------

--
-- Table structure for table `sizes`
--

CREATE TABLE `sizes` (
  `id` int(11) NOT NULL,
  `name` varchar(20) NOT NULL,
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sizes`
--

INSERT INTO `sizes` (`id`, `name`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, '28', 1, 1, '2025-12-18 17:19:00', '2025-12-18 17:19:00'),
(2, '29', 2, 1, '2025-12-18 17:19:00', '2025-12-18 17:19:00'),
(3, '30', 3, 1, '2025-12-18 17:19:00', '2025-12-18 17:19:00'),
(4, '31', 4, 1, '2025-12-18 17:19:00', '2025-12-18 17:19:00'),
(5, '32', 5, 1, '2025-12-18 17:19:00', '2025-12-18 17:19:00'),
(6, '33', 6, 1, '2025-12-18 17:19:00', '2025-12-18 17:19:00'),
(7, '34', 7, 1, '2025-12-18 17:19:00', '2025-12-18 17:19:00'),
(8, '36', 8, 1, '2025-12-18 17:19:00', '2025-12-18 17:19:00'),
(9, '38', 9, 1, '2025-12-18 17:19:00', '2025-12-18 17:19:00'),
(10, '40', 10, 1, '2025-12-18 17:19:00', '2025-12-18 17:19:00'),
(11, 'S', 11, 1, '2025-12-18 17:19:00', '2025-12-18 17:19:00'),
(12, 'M', 12, 1, '2025-12-18 17:19:00', '2025-12-18 17:19:00'),
(13, 'L', 13, 1, '2025-12-18 17:19:00', '2025-12-18 17:19:00'),
(14, 'XL', 14, 1, '2025-12-18 17:19:00', '2025-12-18 17:19:00'),
(15, 'XXL', 15, 1, '2025-12-18 17:19:00', '2025-12-18 17:19:00');

-- --------------------------------------------------------

--
-- Table structure for table `size_charts`
--

CREATE TABLE `size_charts` (
  `id` int(11) NOT NULL,
  `size_id` int(11) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `fitting_id` int(11) DEFAULT NULL,
  `waist_cm` decimal(5,1) DEFAULT NULL,
  `hip_cm` decimal(5,1) DEFAULT NULL,
  `inseam_cm` decimal(5,1) DEFAULT NULL,
  `thigh_cm` decimal(5,1) DEFAULT NULL,
  `knee_cm` decimal(5,1) DEFAULT NULL,
  `leg_opening_cm` decimal(5,1) DEFAULT NULL,
  `front_rise_cm` decimal(5,1) DEFAULT NULL,
  `back_rise_cm` decimal(5,1) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stocks`
--

CREATE TABLE `stocks` (
  `id` int(11) NOT NULL,
  `warehouse_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `fitting_id` int(11) DEFAULT NULL,
  `size_id` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT 0,
  `reserved_quantity` int(11) DEFAULT 0,
  `available_quantity` int(11) GENERATED ALWAYS AS (`quantity` - `reserved_quantity`) STORED,
  `avg_cost_price` decimal(12,2) DEFAULT 0.00,
  `last_cost_price` decimal(12,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stock_movements`
--

CREATE TABLE `stock_movements` (
  `id` int(11) NOT NULL,
  `warehouse_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `fitting_id` int(11) DEFAULT NULL,
  `size_id` int(11) DEFAULT NULL,
  `movement_type` enum('in','out','adjustment','opname','transfer') NOT NULL,
  `reference_type` varchar(50) DEFAULT NULL,
  `reference_id` int(11) DEFAULT NULL,
  `quantity_before` int(11) NOT NULL,
  `quantity_change` int(11) NOT NULL,
  `quantity_after` int(11) NOT NULL,
  `cost_price` decimal(12,2) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stock_opnames`
--

CREATE TABLE `stock_opnames` (
  `id` int(11) NOT NULL,
  `warehouse_id` int(11) NOT NULL,
  `opname_date` date NOT NULL,
  `status` enum('draft','completed','cancelled') DEFAULT 'draft',
  `notes` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stock_opname_details`
--

CREATE TABLE `stock_opname_details` (
  `id` int(11) NOT NULL,
  `opname_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `fitting_id` int(11) DEFAULT NULL,
  `size_id` int(11) DEFAULT NULL,
  `system_qty` int(11) NOT NULL,
  `physical_qty` int(11) NOT NULL,
  `difference` int(11) GENERATED ALWAYS AS (`physical_qty` - `system_qty`) STORED,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `password_reset_token` varchar(255) DEFAULT NULL,
  `password_reset_expires` datetime DEFAULT NULL,
  `full_name` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  `role` enum('admin','admin_stok','member','guest') DEFAULT 'guest',
  `is_active` tinyint(1) DEFAULT 1,
  `two_fa_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `two_fa_code` varchar(10) DEFAULT NULL,
  `two_fa_code_expires` datetime DEFAULT NULL,
  `is_locked` tinyint(1) NOT NULL DEFAULT 0,
  `locked_at` datetime DEFAULT NULL,
  `locked_reason` varchar(255) DEFAULT NULL,
  `email_verified` tinyint(1) DEFAULT 0,
  `member_discount` decimal(5,2) DEFAULT 0.00,
  `last_login` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `password_reset_token`, `password_reset_expires`, `full_name`, `phone`, `profile_picture`, `role`, `is_active`, `two_fa_enabled`, `two_fa_code`, `two_fa_code_expires`, `is_locked`, `locked_at`, `locked_reason`, `email_verified`, `member_discount`, `last_login`, `created_at`, `updated_at`) VALUES
(1, 'admin@marketplacejeans.com', '$2a$10$.HksG3CC6gqsrhQwah.m4usRSH6fhXU7nF4gh2Li4mqsPF8haUUbu', NULL, NULL, 'Admin User', '08123456789', NULL, 'admin', 1, 0, NULL, NULL, 0, NULL, NULL, 0, 0.00, NULL, '2025-12-18 17:19:00', '2025-12-18 17:19:00'),
(2, 'member@test.com', '$2a$10$DoGYXBhz5aTh6t5HIqQYjOe/t8PBQa13JUDn6UoVlUzxwTon.K1pq', NULL, NULL, 'Member Test', '08123456788', NULL, 'member', 1, 0, NULL, NULL, 0, NULL, NULL, 0, 10.00, NULL, '2025-12-18 17:19:00', '2025-12-18 17:19:00'),
(9, 'roy@mail.com', '$2a$10$T1Y9NN4A1/GJWJopOcZM2.eqtSMAlzMeTVrAFvwGszuInvvlMPoBC', NULL, NULL, 'Roy', NULL, NULL, 'member', 1, 0, NULL, NULL, 0, NULL, NULL, 0, 10.00, NULL, '2026-02-07 12:31:45', '2026-02-07 12:31:45');

-- --------------------------------------------------------

--
-- Table structure for table `user_addresses`
--

CREATE TABLE `user_addresses` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `address_label` varchar(100) DEFAULT NULL,
  `recipient_name` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `address` text NOT NULL,
  `city` varchar(100) NOT NULL,
  `province` varchar(100) NOT NULL,
  `postal_code` varchar(10) NOT NULL,
  `country` varchar(100) DEFAULT 'Indonesia',
  `is_default` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_addresses`
--

INSERT INTO `user_addresses` (`id`, `user_id`, `address_label`, `recipient_name`, `phone`, `address`, `city`, `province`, `postal_code`, `country`, `is_default`, `created_at`, `updated_at`) VALUES
(1, 1, 'Rumah', 'Admin User', '08123456789', 'Rumah 123', 'Surabaya', 'Jawa Timur', '60111', 'Indonesia', 1, '2026-02-25 15:54:49', '2026-02-25 15:54:49');

-- --------------------------------------------------------

--
-- Table structure for table `user_roles`
--

CREATE TABLE `user_roles` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `assigned_by` int(11) DEFAULT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_roles`
--

INSERT INTO `user_roles` (`id`, `user_id`, `role_id`, `assigned_by`, `assigned_at`) VALUES
(1, 1, 1, 1, '2026-02-25 15:32:44');

-- --------------------------------------------------------

--
-- Table structure for table `warehouses`
--

CREATE TABLE `warehouses` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `code` varchar(20) DEFAULT NULL,
  `location` text DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `province` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `is_main` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `warehouses`
--

INSERT INTO `warehouses` (`id`, `name`, `code`, `location`, `address`, `city`, `province`, `phone`, `email`, `is_main`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Gudang Utama', 'GU', 'Indonesia', '-', 'Surabaya', 'Jawa Timur', '08123123123', NULL, 1, 1, '2025-12-21 07:06:36', '2025-12-21 07:06:36'),
(2, 'Jakarta Warehouse', 'JKT', 'Jakarta Selatan', 'Jl. Sudirman No. 123', 'Jakarta Selatan', 'DKI Jakarta', '021-5551234', 'wh-jakarta@jeans.com', 0, 1, '2025-12-21 07:36:02', '2025-12-21 07:36:02'),
(3, 'Bandung Warehouse', 'BDG', 'Bandung', 'Jl. Braga No. 88', 'Bandung', 'Jawa Barat', '022-4561234', 'wh-bandung@jeans.com', 0, 1, '2025-12-21 07:36:02', '2025-12-21 07:36:02'),
(4, 'Surabaya Warehouse', 'SBY', 'Surabaya', 'Jl. Tunjungan No. 45', 'Surabaya', 'Jawa Timur', '031-7891234', 'wh-surabaya@jeans.com', 0, 1, '2025-12-21 07:36:02', '2025-12-21 07:36:02');

-- --------------------------------------------------------

--
-- Table structure for table `wishlists`
--

CREATE TABLE `wishlists` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `wishlists`
--

INSERT INTO `wishlists` (`id`, `user_id`, `product_id`, `created_at`) VALUES
(1, 1, 28, '2026-01-11 15:23:32');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_entity` (`entity_type`,`entity_id`),
  ADD KEY `idx_created` (`created_at`),
  ADD KEY `idx_session_id` (`session_id`),
  ADD KEY `idx_user_type` (`user_type`),
  ADD KEY `idx_created_at_user` (`created_at`,`user_id`),
  ADD KEY `idx_action_date` (`action`,`created_at`);

--
-- Indexes for table `banners`
--
ALTER TABLE `banners`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_position` (`position`),
  ADD KEY `idx_active` (`is_active`),
  ADD KEY `idx_dates` (`start_date`,`end_date`);

--
-- Indexes for table `blog_posts`
--
ALTER TABLE `blog_posts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_blog_slug` (`slug`),
  ADD KEY `idx_blog_status` (`status`),
  ADD KEY `idx_blog_category` (`category`),
  ADD KEY `idx_blog_published_at` (`published_at`),
  ADD KEY `idx_blog_featured` (`is_featured`),
  ADD KEY `author_id` (`author_id`);

--
-- Indexes for table `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_session` (`session_id`);

--
-- Indexes for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_cart_item` (`cart_id`,`product_variant_id`),
  ADD KEY `product_variant_id` (`product_variant_id`),
  ADD KEY `idx_cart` (`cart_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_slug` (`slug`),
  ADD KEY `idx_parent_id` (`parent_id`);

--
-- Indexes for table `cities`
--
ALTER TABLE `cities`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_city_province` (`name`,`province`),
  ADD KEY `idx_name` (`name`),
  ADD KEY `idx_province` (`province`),
  ADD KEY `idx_active` (`is_active`);

--
-- Indexes for table `content_settings`
--
ALTER TABLE `content_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `section_key` (`section_key`),
  ADD KEY `updated_by` (`updated_by`),
  ADD KEY `idx_section_key` (`section_key`),
  ADD KEY `idx_active` (`is_active`);

--
-- Indexes for table `coupons`
--
ALTER TABLE `coupons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_code` (`code`),
  ADD KEY `idx_active` (`is_active`),
  ADD KEY `idx_dates` (`start_date`,`end_date`);

--
-- Indexes for table `coupon_usages`
--
ALTER TABLE `coupon_usages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_coupon` (`coupon_id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_order` (`order_id`);

--
-- Indexes for table `discounts`
--
ALTER TABLE `discounts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_code` (`code`),
  ADD KEY `idx_type` (`type`),
  ADD KEY `idx_dates` (`start_date`,`end_date`);

--
-- Indexes for table `exchange_rates`
--
ALTER TABLE `exchange_rates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_currency_pair` (`currency_from`,`currency_to`),
  ADD KEY `updated_by` (`updated_by`),
  ADD KEY `idx_active` (`is_active`);

--
-- Indexes for table `exchange_rate_logs`
--
ALTER TABLE `exchange_rate_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `changed_by` (`changed_by`),
  ADD KEY `idx_exchange_rate` (`exchange_rate_id`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indexes for table `fittings`
--
ALTER TABLE `fittings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_slug` (`slug`);

--
-- Indexes for table `guest_order_details`
--
ALTER TABLE `guest_order_details`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_id` (`order_id`),
  ADD KEY `idx_order` (`order_id`);

--
-- Indexes for table `inventory_movements`
--
ALTER TABLE `inventory_movements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_variant` (`product_variant_id`),
  ADD KEY `idx_type` (`type`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_notif_user_id` (`user_id`),
  ADD KEY `idx_notif_admin` (`for_admin`,`is_read`),
  ADD KEY `idx_notif_created` (`created_at`);

--
-- Indexes for table `offices`
--
ALTER TABLE `offices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_code` (`code`),
  ADD KEY `idx_active` (`is_active`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_number` (`order_number`),
  ADD UNIQUE KEY `unique_token` (`unique_token`),
  ADD KEY `idx_order_number` (`order_number`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_payment_status` (`payment_status`),
  ADD KEY `idx_created` (`created_at`),
  ADD KEY `idx_unique_token` (`unique_token`);

--
-- Indexes for table `order_discounts`
--
ALTER TABLE `order_discounts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_order` (`order_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_variant_id` (`product_variant_id`),
  ADD KEY `idx_order` (`order_id`);

--
-- Indexes for table `order_shipping`
--
ALTER TABLE `order_shipping`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_id` (`order_id`),
  ADD KEY `idx_order` (`order_id`),
  ADD KEY `idx_tracking` (`tracking_number`);

--
-- Indexes for table `order_shipping_history`
--
ALTER TABLE `order_shipping_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_order` (`order_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indexes for table `order_taxes`
--
ALTER TABLE `order_taxes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_order` (`order_id`);

--
-- Indexes for table `order_tracking`
--
ALTER TABLE `order_tracking`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_order` (`order_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `transaction_id` (`transaction_id`),
  ADD KEY `idx_order` (`order_id`),
  ADD KEY `idx_transaction` (`transaction_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `idx_resource` (`resource`),
  ADD KEY `idx_action` (`action`);

--
-- Indexes for table `positions`
--
ALTER TABLE `positions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_office` (`office_id`),
  ADD KEY `idx_parent` (`parent_id`),
  ADD KEY `idx_active` (`is_active`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD UNIQUE KEY `sku` (`sku`),
  ADD KEY `idx_slug` (`slug`),
  ADD KEY `idx_category` (`category_id`),
  ADD KEY `idx_fitting` (`fitting_id`),
  ADD KEY `idx_sku` (`sku`);
ALTER TABLE `products` ADD FULLTEXT KEY `idx_search` (`name`,`description`);

--
-- Indexes for table `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_product` (`product_id`);

--
-- Indexes for table `product_variants`
--
ALTER TABLE `product_variants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sku_variant` (`sku_variant`),
  ADD UNIQUE KEY `unique_variant` (`product_id`,`size_id`),
  ADD KEY `idx_product` (`product_id`),
  ADD KEY `idx_size` (`size_id`),
  ADD KEY `idx_sku` (`sku_variant`);

--
-- Indexes for table `returns`
--
ALTER TABLE `returns`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `return_number` (`return_number`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `warehouse_id` (`warehouse_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `return_items`
--
ALTER TABLE `return_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `return_id` (`return_id`),
  ADD KEY `order_item_id` (`order_item_id`),
  ADD KEY `product_variant_id` (`product_variant_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `idx_name` (`name`);

--
-- Indexes for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_role_permission` (`role_id`,`permission_id`),
  ADD KEY `idx_role` (`role_id`),
  ADD KEY `idx_permission` (`permission_id`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`),
  ADD KEY `idx_key` (`setting_key`);

--
-- Indexes for table `shipping_costs`
--
ALTER TABLE `shipping_costs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_shipping` (`city_id`,`warehouse_id`,`courier`,`service`),
  ADD KEY `idx_city` (`city_id`),
  ADD KEY `idx_warehouse` (`warehouse_id`),
  ADD KEY `idx_courier` (`courier`),
  ADD KEY `idx_active` (`is_active`);

--
-- Indexes for table `sizes`
--
ALTER TABLE `sizes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `idx_name` (`name`);

--
-- Indexes for table `size_charts`
--
ALTER TABLE `size_charts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_size_chart` (`size_id`,`category_id`,`fitting_id`),
  ADD KEY `idx_size` (`size_id`),
  ADD KEY `idx_category` (`category_id`),
  ADD KEY `idx_fitting` (`fitting_id`);

--
-- Indexes for table `stocks`
--
ALTER TABLE `stocks`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_stock` (`warehouse_id`,`product_id`,`fitting_id`,`size_id`),
  ADD KEY `idx_warehouse` (`warehouse_id`),
  ADD KEY `idx_product` (`product_id`),
  ADD KEY `idx_fitting` (`fitting_id`),
  ADD KEY `idx_size` (`size_id`);

--
-- Indexes for table `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fitting_id` (`fitting_id`),
  ADD KEY `size_id` (`size_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_warehouse` (`warehouse_id`),
  ADD KEY `idx_product` (`product_id`),
  ADD KEY `idx_type` (`movement_type`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indexes for table `stock_opnames`
--
ALTER TABLE `stock_opnames`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_warehouse` (`warehouse_id`),
  ADD KEY `idx_date` (`opname_date`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `stock_opname_details`
--
ALTER TABLE `stock_opname_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fitting_id` (`fitting_id`),
  ADD KEY `size_id` (`size_id`),
  ADD KEY `idx_opname` (`opname_id`),
  ADD KEY `idx_product` (`product_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `idx_users_reset_token` (`password_reset_token`),
  ADD KEY `idx_users_is_locked` (`is_locked`),
  ADD KEY `idx_users_two_fa_enabled` (`two_fa_enabled`);

--
-- Indexes for table `user_addresses`
--
ALTER TABLE `user_addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Indexes for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_role` (`user_id`,`role_id`),
  ADD KEY `assigned_by` (`assigned_by`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_role` (`role_id`);

--
-- Indexes for table `warehouses`
--
ALTER TABLE `warehouses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_code` (`code`),
  ADD KEY `idx_active` (`is_active`);

--
-- Indexes for table `wishlists`
--
ALTER TABLE `wishlists`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_wishlist` (`user_id`,`product_id`),
  ADD KEY `product_id` (`product_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;

--
-- AUTO_INCREMENT for table `banners`
--
ALTER TABLE `banners`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `blog_posts`
--
ALTER TABLE `blog_posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `carts`
--
ALTER TABLE `carts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `cities`
--
ALTER TABLE `cities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT for table `content_settings`
--
ALTER TABLE `content_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `coupons`
--
ALTER TABLE `coupons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `coupon_usages`
--
ALTER TABLE `coupon_usages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `discounts`
--
ALTER TABLE `discounts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `exchange_rates`
--
ALTER TABLE `exchange_rates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `exchange_rate_logs`
--
ALTER TABLE `exchange_rate_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `fittings`
--
ALTER TABLE `fittings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `guest_order_details`
--
ALTER TABLE `guest_order_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `inventory_movements`
--
ALTER TABLE `inventory_movements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `offices`
--
ALTER TABLE `offices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `order_discounts`
--
ALTER TABLE `order_discounts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `order_shipping`
--
ALTER TABLE `order_shipping`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `order_shipping_history`
--
ALTER TABLE `order_shipping_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `order_taxes`
--
ALTER TABLE `order_taxes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_tracking`
--
ALTER TABLE `order_tracking`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=80;

--
-- AUTO_INCREMENT for table `positions`
--
ALTER TABLE `positions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `product_images`
--
ALTER TABLE `product_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `product_variants`
--
ALTER TABLE `product_variants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=89;

--
-- AUTO_INCREMENT for table `returns`
--
ALTER TABLE `returns`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `return_items`
--
ALTER TABLE `return_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `role_permissions`
--
ALTER TABLE `role_permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=165;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

--
-- AUTO_INCREMENT for table `shipping_costs`
--
ALTER TABLE `shipping_costs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=58;

--
-- AUTO_INCREMENT for table `sizes`
--
ALTER TABLE `sizes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;

--
-- AUTO_INCREMENT for table `size_charts`
--
ALTER TABLE `size_charts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stocks`
--
ALTER TABLE `stocks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stock_movements`
--
ALTER TABLE `stock_movements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stock_opnames`
--
ALTER TABLE `stock_opnames`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stock_opname_details`
--
ALTER TABLE `stock_opname_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `user_addresses`
--
ALTER TABLE `user_addresses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `user_roles`
--
ALTER TABLE `user_roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `warehouses`
--
ALTER TABLE `warehouses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `wishlists`
--
ALTER TABLE `wishlists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `blog_posts`
--
ALTER TABLE `blog_posts`
  ADD CONSTRAINT `blog_posts_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `carts`
--
ALTER TABLE `carts`
  ADD CONSTRAINT `carts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `content_settings`
--
ALTER TABLE `content_settings`
  ADD CONSTRAINT `content_settings_ibfk_1` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `exchange_rates`
--
ALTER TABLE `exchange_rates`
  ADD CONSTRAINT `exchange_rates_ibfk_1` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `exchange_rate_logs`
--
ALTER TABLE `exchange_rate_logs`
  ADD CONSTRAINT `exchange_rate_logs_ibfk_1` FOREIGN KEY (`exchange_rate_id`) REFERENCES `exchange_rates` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `exchange_rate_logs_ibfk_2` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `guest_order_details`
--
ALTER TABLE `guest_order_details`
  ADD CONSTRAINT `guest_order_details_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `inventory_movements`
--
ALTER TABLE `inventory_movements`
  ADD CONSTRAINT `inventory_movements_ibfk_1` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `inventory_movements_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `order_discounts`
--
ALTER TABLE `order_discounts`
  ADD CONSTRAINT `order_discounts_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants` (`id`);

--
-- Constraints for table `order_shipping`
--
ALTER TABLE `order_shipping`
  ADD CONSTRAINT `order_shipping_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `order_shipping_history`
--
ALTER TABLE `order_shipping_history`
  ADD CONSTRAINT `order_shipping_history_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_shipping_history_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `order_taxes`
--
ALTER TABLE `order_taxes`
  ADD CONSTRAINT `order_taxes_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `order_tracking`
--
ALTER TABLE `order_tracking`
  ADD CONSTRAINT `order_tracking_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_tracking_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `positions`
--
ALTER TABLE `positions`
  ADD CONSTRAINT `positions_ibfk_1` FOREIGN KEY (`office_id`) REFERENCES `offices` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `positions_ibfk_2` FOREIGN KEY (`parent_id`) REFERENCES `positions` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `products_ibfk_2` FOREIGN KEY (`fitting_id`) REFERENCES `fittings` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `product_images`
--
ALTER TABLE `product_images`
  ADD CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_variants`
--
ALTER TABLE `product_variants`
  ADD CONSTRAINT `product_variants_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_variants_ibfk_2` FOREIGN KEY (`size_id`) REFERENCES `sizes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `returns`
--
ALTER TABLE `returns`
  ADD CONSTRAINT `fk_returns_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_returns_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  ADD CONSTRAINT `fk_returns_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`);

--
-- Constraints for table `return_items`
--
ALTER TABLE `return_items`
  ADD CONSTRAINT `fk_return_items_order_item` FOREIGN KEY (`order_item_id`) REFERENCES `order_items` (`id`),
  ADD CONSTRAINT `fk_return_items_return` FOREIGN KEY (`return_id`) REFERENCES `returns` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_return_items_variant` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants` (`id`);

--
-- Constraints for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `shipping_costs`
--
ALTER TABLE `shipping_costs`
  ADD CONSTRAINT `shipping_costs_ibfk_1` FOREIGN KEY (`city_id`) REFERENCES `cities` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `shipping_costs_ibfk_2` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `size_charts`
--
ALTER TABLE `size_charts`
  ADD CONSTRAINT `size_charts_ibfk_1` FOREIGN KEY (`size_id`) REFERENCES `sizes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `size_charts_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `size_charts_ibfk_3` FOREIGN KEY (`fitting_id`) REFERENCES `fittings` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `stocks`
--
ALTER TABLE `stocks`
  ADD CONSTRAINT `stocks_ibfk_1` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `stocks_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `stocks_ibfk_3` FOREIGN KEY (`fitting_id`) REFERENCES `fittings` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `stocks_ibfk_4` FOREIGN KEY (`size_id`) REFERENCES `sizes` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD CONSTRAINT `stock_movements_ibfk_1` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `stock_movements_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `stock_movements_ibfk_3` FOREIGN KEY (`fitting_id`) REFERENCES `fittings` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `stock_movements_ibfk_4` FOREIGN KEY (`size_id`) REFERENCES `sizes` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `stock_movements_ibfk_5` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `stock_opnames`
--
ALTER TABLE `stock_opnames`
  ADD CONSTRAINT `stock_opnames_ibfk_1` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `stock_opnames_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `stock_opname_details`
--
ALTER TABLE `stock_opname_details`
  ADD CONSTRAINT `stock_opname_details_ibfk_1` FOREIGN KEY (`opname_id`) REFERENCES `stock_opnames` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `stock_opname_details_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `stock_opname_details_ibfk_3` FOREIGN KEY (`fitting_id`) REFERENCES `fittings` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `stock_opname_details_ibfk_4` FOREIGN KEY (`size_id`) REFERENCES `sizes` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `user_addresses`
--
ALTER TABLE `user_addresses`
  ADD CONSTRAINT `user_addresses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_roles_ibfk_3` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `wishlists`
--
ALTER TABLE `wishlists`
  ADD CONSTRAINT `wishlists_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `wishlists_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
