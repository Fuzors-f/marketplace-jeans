-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Waktu pembuatan: 26 Feb 2026 pada 23.06
-- Versi server: 10.6.24-MariaDB-cll-lve
-- Versi PHP: 8.4.17

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `yyyyzzzz_hojdenim`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `request_url` varchar(500) DEFAULT NULL,
  `request_method` varchar(10) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `activity_logs`
--

INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `description`, `ip_address`, `user_agent`, `request_url`, `request_method`, `metadata`, `created_at`) VALUES
(1, 1, 'login', 'user', 1, 'User logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', NULL, NULL, NULL, '2025-12-18 17:19:14'),
(2, 1, 'login', 'user', 1, 'User logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', NULL, NULL, NULL, '2025-12-20 16:46:44'),
(3, 1, 'update_product', 'product', 2, 'Updated product', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', NULL, NULL, NULL, '2025-12-20 16:47:35'),
(4, 1, 'update_product', 'product', 2, 'Updated product', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', NULL, NULL, NULL, '2025-12-21 06:18:16'),
(5, 1, 'update_product', 'product', 2, 'Updated product', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', NULL, NULL, NULL, '2025-12-21 06:18:57'),
(6, 1, 'login', 'user', 1, 'User logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', NULL, NULL, NULL, '2025-12-21 07:28:37'),
(7, 1, 'login', 'user', 1, 'User logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', NULL, NULL, NULL, '2025-12-21 07:38:33'),
(8, 1, 'login', 'user', 1, 'User logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', NULL, NULL, NULL, '2025-12-21 07:42:15'),
(9, 1, 'delete_product_variant', 'product_variant', 14, 'Deleted product variant', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', NULL, NULL, NULL, '2025-12-22 18:05:14'),
(10, 1, 'add_product_variant', 'product_variant', 43, 'Added product variant', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', NULL, NULL, NULL, '2025-12-23 06:21:51'),
(11, 1, 'login', 'user', 1, 'User logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', NULL, NULL, NULL, '2025-12-23 16:28:21'),
(12, 1, 'update_product', 'product', 2, 'Updated product', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', NULL, NULL, NULL, '2025-12-23 16:30:56'),
(13, 1, 'update_product', 'product', 2, 'Updated product', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', NULL, NULL, NULL, '2025-12-23 16:34:37'),
(14, 1, 'login', 'user', 1, 'User logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', NULL, NULL, NULL, '2026-01-01 12:54:06'),
(15, 1, 'update_product', 'product', 2, 'Updated product', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', NULL, NULL, NULL, '2026-01-01 13:51:43'),
(16, 1, 'update_product', 'product', 2, 'Updated product', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', NULL, NULL, NULL, '2026-01-01 14:28:16'),
(17, 1, 'ADD_PRODUCT_IMAGES', 'Added 1 images to product 2', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-01 14:28:16'),
(18, 1, 'login', 'user', 1, 'User logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', NULL, NULL, NULL, '2026-01-04 15:05:29'),
(19, 1, 'login', 'user', 1, 'User logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '/api/auth/login', 'POST', NULL, '2026-01-11 06:48:31'),
(20, 1, 'login', 'user', 1, 'User logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '/api/auth/login', 'POST', NULL, '2026-01-11 14:56:06'),
(21, 1, 'create_product', 'product', 27, 'Created product: Jean Biru terbaru', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '/api/products', 'POST', NULL, '2026-01-11 15:12:32'),
(22, 1, 'add_product_variant', 'product_variant', 86, 'Added product variant', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '/api/products/27/variants', 'POST', NULL, '2026-01-11 15:12:32'),
(23, 1, 'delete_product_variant', 'product_variant', 86, 'Deleted product variant', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '/api/products/variants/86', 'DELETE', NULL, '2026-01-11 15:13:04'),
(24, 1, 'create_product', 'product', 28, 'Created product: Test jEAn', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '/api/products', 'POST', NULL, '2026-01-11 15:22:17'),
(25, 1, 'add_product_variant', 'product_variant', 87, 'Added product variant', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '/api/products/28/variants', 'POST', NULL, '2026-01-11 15:22:53'),
(26, 1, 'create_order', 'order', 1, 'Created order ORD-20260111-8887', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '/api/orders', 'POST', '{\"order_number\":\"ORD-20260111-8887\",\"tracking_url\":\"http://localhost:3000/order/2ef1c6fe941ab85d8050d8ae4315762ef8287bf170f48a68bd2a7ca101fedf6e\"}', '2026-01-11 15:53:34'),
(27, 1, 'login', 'user', 1, 'User logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '/api/auth/login', 'POST', NULL, '2026-01-25 08:41:03'),
(28, 1, 'login', 'user', 1, 'User logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '/api/auth/login', 'POST', NULL, '2026-01-25 08:59:39'),
(29, 1, 'login', 'user', 1, 'User logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '/api/auth/login', 'POST', NULL, '2026-01-26 14:08:05'),
(30, 1, 'login', 'user', 1, 'User logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '/api/auth/login', 'POST', NULL, '2026-02-01 15:02:14'),
(31, 9, 'register', 'user', 9, 'User registered', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '/api/auth/register', 'POST', NULL, '2026-02-07 12:31:45'),
(32, 1, 'login', 'user', 1, 'User logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '/api/auth/login', 'POST', NULL, '2026-02-13 14:49:14'),
(33, 1, 'login', 'user', 1, 'User logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '/api/auth/login', 'POST', NULL, '2026-02-20 13:17:19'),
(34, 1, 'CREATE', 'banner', 1, 'Created banner: Testing Banner', NULL, NULL, NULL, NULL, NULL, '2026-02-25 14:44:49'),
(35, 1, 'DELETE', 'banner', 1, 'Deleted banner: Testing Banner', NULL, NULL, NULL, NULL, NULL, '2026-02-25 14:45:35'),
(36, 1, 'login', 'user', 1, 'User logged in', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7705', '/api/auth/login', 'POST', NULL, '2026-02-25 14:58:05'),
(37, 1, 'login', 'user', 1, 'User logged in', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7705', '/api/auth/login', 'POST', NULL, '2026-02-25 14:58:56'),
(38, 1, 'CREATE_CONTENT', 'content_settings', 9, 'Created content: test_section', NULL, NULL, NULL, NULL, NULL, '2026-02-25 15:02:18'),
(39, 1, 'UPDATE_CONTENT', 'content_settings', 9, 'Updated content: test_section', NULL, NULL, NULL, NULL, '{\"section_key\":\"test_section\"}', '2026-02-25 15:05:33'),
(40, 1, 'UPDATE_CONTENT', 'content_settings', 1, 'Updated content: hero', NULL, NULL, NULL, NULL, '{\"section_key\":\"hero\"}', '2026-02-25 15:09:55'),
(41, 1, 'UPDATE_CONTENT', 'content_settings', 1, 'Updated content: hero', NULL, NULL, NULL, NULL, '{\"section_key\":\"hero\"}', '2026-02-25 15:09:55'),
(42, 1, 'CREATE_CONTENT', 'content_settings', 10, 'Created content: test_create', NULL, NULL, NULL, NULL, NULL, '2026-02-25 15:09:55'),
(43, 1, 'UPDATE_CONTENT', 'content_settings', 1, 'Updated content: hero', NULL, NULL, NULL, NULL, '{\"section_key\":\"hero\"}', '2026-02-25 15:14:08'),
(44, 1, 'DELETE_CONTENT', 'content_settings', 9, 'Deleted content: test_section', NULL, NULL, NULL, NULL, NULL, '2026-02-25 15:14:08'),
(45, 1, 'DELETE_CONTENT', 'content_settings', 10, 'Deleted content: test_create', NULL, NULL, NULL, NULL, NULL, '2026-02-25 15:14:08'),
(46, 1, 'login', 'user', 1, 'User logged in', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7705', '/api/auth/login', 'POST', NULL, '2026-02-25 15:18:41'),
(47, 1, 'login', 'user', 1, 'User logged in', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7705', '/api/auth/login', 'POST', NULL, '2026-02-25 15:18:52'),
(48, 1, 'login', 'user', 1, 'User logged in', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7705', '/api/auth/login', 'POST', NULL, '2026-02-25 15:23:01'),
(49, 1, 'create_manual_order', 'order', 2, 'Manual order created for Test Customer', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7705', '/api/admin/orders/manual', 'POST', NULL, '2026-02-25 15:23:01'),
(50, 1, 'login', 'user', 1, 'User logged in', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7705', '/api/auth/login', 'POST', NULL, '2026-02-25 15:33:51'),
(51, 1, 'login', 'user', 1, 'User logged in', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7705', '/api/auth/login', 'POST', NULL, '2026-02-25 15:34:04'),
(52, 1, 'login', 'user', 1, 'User logged in', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7705', '/api/auth/login', 'POST', NULL, '2026-02-25 15:41:00'),
(53, 1, 'create_manual_order', 'order', 3, 'Manual order created for Test After Fix', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7705', '/api/admin/orders/manual', 'POST', NULL, '2026-02-25 15:41:00'),
(54, NULL, 'create_order', 'order', 4, 'Created order ORD-20260225-2258', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '/api/orders', 'POST', '{\"order_number\":\"ORD-20260225-2258\",\"tracking_url\":\"http://localhost:3000/order/51ec8bb14628729846a22beb53e1500b21d36d101e830107f67f6bfbf54aeb7a\"}', '2026-02-25 15:51:48'),
(55, 1, 'create_order', 'order', 5, 'Created order ORD-20260225-8022', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '/api/orders', 'POST', '{\"order_number\":\"ORD-20260225-8022\",\"tracking_url\":\"http://localhost:3000/order/a49f5f5b0894ccb19c86cfc84ff4ffb2a0fa54aa78957a39830e57716b37d89a\"}', '2026-02-25 15:54:49'),
(56, 1, 'create_order', 'order', 6, 'Created order ORD-20260225-0483', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '/api/orders', 'POST', '{\"order_number\":\"ORD-20260225-0483\",\"tracking_url\":\"http://localhost:3000/order/cadd0b2ca0fbf70a9830c1e8e17aa53cac6981232ff5f1a3f53b6e4760640d7c\"}', '2026-02-25 16:25:30'),
(57, 1, 'CREATE', 'banner', 2, 'Created banner: test', NULL, NULL, NULL, NULL, NULL, '2026-02-26 02:53:44'),
(58, 1, 'DELETE', 'banner', 2, 'Deleted banner: test', NULL, NULL, NULL, NULL, NULL, '2026-02-26 02:54:19'),
(59, 1, 'create_product', 'product', 29, 'Created product: Test', '103.225.151.134', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '/api/products', 'POST', NULL, '2026-02-26 03:00:33'),
(60, 1, 'create_product', 'product', 30, 'Created product: Test 2', '103.225.151.134', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '/api/products', 'POST', NULL, '2026-02-26 03:00:53'),
(61, 1, 'update_product', 'product', 30, 'Updated product', '103.225.151.134', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '/api/products/30', 'PUT', NULL, '2026-02-26 03:01:05'),
(62, 1, 'ADD_PRODUCT_IMAGES', 'Added 1 images to product 30', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-26 03:01:06'),
(63, 1, 'update_product', 'product', 29, 'Updated product', '103.225.151.134', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '/api/products/29', 'PUT', NULL, '2026-02-26 03:01:13'),
(64, 1, 'ADD_PRODUCT_IMAGES', 'Added 1 images to product 29', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-26 03:01:15'),
(65, 1, 'delete_product', 'product', 30, 'Deleted product', '103.225.151.134', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '/api/products/30', 'DELETE', NULL, '2026-02-26 03:01:19'),
(66, 1, 'create_product', 'product', 31, 'Created product: Test 2', '103.225.151.134', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '/api/products', 'POST', NULL, '2026-02-26 03:01:44'),
(67, 1, 'update_product', 'product', 31, 'Updated product', '103.225.151.134', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '/api/products/31', 'PUT', NULL, '2026-02-26 03:02:01'),
(68, 1, 'ADD_PRODUCT_IMAGES', 'Added 1 images to product 31', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-26 03:02:04'),
(69, 1, 'update_product', 'product', 29, 'Updated product', '103.225.151.134', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '/api/products/29', 'PUT', NULL, '2026-02-26 03:02:14'),
(70, 1, 'ADD_PRODUCT_IMAGES', 'Added 1 images to product 29', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-26 03:02:17'),
(71, 1, 'update_product', 'product', 29, 'Updated product', '103.225.151.134', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '/api/products/29', 'PUT', NULL, '2026-02-26 03:02:23'),
(72, 1, 'DELETE_PRODUCT_IMAGE', 'Deleted image from product 29', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-26 03:02:23'),
(73, 1, 'update_product', 'product', 29, 'Updated product', '103.225.151.134', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '/api/products/29', 'PUT', NULL, '2026-02-26 03:02:30'),
(74, 1, 'DELETE_PRODUCT_IMAGE', 'Deleted image from product 29', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-26 03:02:30'),
(75, 1, 'update_product', 'product', 31, 'Updated product', '103.225.151.134', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '/api/products/31', 'PUT', NULL, '2026-02-26 03:02:34'),
(76, 1, 'DELETE_PRODUCT_IMAGE', 'Deleted image from product 31', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-26 03:02:34'),
(77, 1, 'CREATE', 'banner', 3, 'Created banner: test', NULL, NULL, NULL, NULL, NULL, '2026-02-26 03:04:40'),
(78, 1, 'DELETE', 'banner', 3, 'Deleted banner: test', NULL, NULL, NULL, NULL, NULL, '2026-02-26 03:04:58'),
(79, 1, 'login', 'user', 1, 'User logged in', '182.8.98.64', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '/api/auth/login', 'POST', NULL, '2026-02-26 12:38:15'),
(80, 1, 'update_payment_status', 'order', 6, 'Payment status changed from pending to paid', '182.8.98.64', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '/api/admin/orders/6/payment-status', 'PATCH', NULL, '2026-02-26 12:38:51'),
(81, 1, 'delete_product', 'product', 31, 'Deleted product', '180.254.226.30', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '/api/products/31', 'DELETE', NULL, '2026-02-26 14:05:23'),
(82, 1, 'delete_product', 'product', 29, 'Deleted product', '180.254.226.30', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '/api/products/29', 'DELETE', NULL, '2026-02-26 14:05:33'),
(83, 1, 'update_product', 'product', 1, 'Updated product', '114.122.166.167', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '/api/products/1', 'PUT', NULL, '2026-02-26 14:32:56'),
(84, 1, 'update_product', 'product', 1, 'Updated product', '114.122.166.167', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '/api/products/1', 'PUT', NULL, '2026-02-26 14:32:56'),
(85, 1, 'update_product', 'product', 1, 'Updated product', '114.122.166.167', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '/api/products/1', 'PUT', NULL, '2026-02-26 14:34:28'),
(86, 1, 'update_product', 'product', 1, 'Updated product', '180.254.226.30', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '/api/products/1', 'PUT', NULL, '2026-02-26 14:51:53'),
(87, 1, 'update_product', 'product', 1, 'Updated product', '180.254.226.30', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '/api/products/1', 'PUT', NULL, '2026-02-26 14:52:25'),
(88, 1, 'update_product', 'product', 1, 'Updated product', '180.254.226.30', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '/api/products/1', 'PUT', NULL, '2026-02-26 14:53:38'),
(89, 1, 'update_product', 'product', 1, 'Updated product', '180.254.226.30', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36', '/api/products/1', 'PUT', NULL, '2026-02-26 14:53:39'),
(90, 1, 'update_product', 'product', 1, 'Updated product', '2404:c0:3e1a:70a2:39ee:111a:fae9:bbf9', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36', '/api/products/1', 'PUT', NULL, '2026-02-26 14:57:58'),
(91, 1, 'ADD_PRODUCT_IMAGES', 'Added 1 images to product 1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-26 14:58:00'),
(92, 1, 'update_product', 'product', 3, 'Updated product', '180.254.226.30', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '/api/products/3', 'PUT', NULL, '2026-02-26 15:09:11'),
(93, 1, 'ADD_PRODUCT_IMAGES', 'Added 1 images to product 3', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-26 15:09:12'),
(94, 1, 'update_product', 'product', 28, 'Updated product', '180.254.226.30', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '/api/products/28', 'PUT', NULL, '2026-02-26 15:11:29'),
(95, 1, 'update_product', 'product', 28, 'Updated product', '180.254.226.30', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '/api/products/28', 'PUT', NULL, '2026-02-26 15:11:29'),
(96, 1, 'update_product', 'product', 28, 'Updated product', '180.254.226.30', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '/api/products/28', 'PUT', NULL, '2026-02-26 15:12:59'),
(97, 1, 'update_product', 'product', 28, 'Updated product', '180.254.226.30', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '/api/products/28', 'PUT', NULL, '2026-02-26 15:14:24'),
(98, 1, 'update_product', 'product', 28, 'Updated product', '180.254.226.30', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36', '/api/products/28', 'PUT', NULL, '2026-02-26 15:14:24'),
(99, 1, 'update_product', 'product', 28, 'Updated product', '180.254.226.30', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '/api/products/28', 'PUT', NULL, '2026-02-26 15:14:43'),
(100, 1, 'update_product', 'product', 28, 'Updated product', '180.254.226.30', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36', '/api/products/28', 'PUT', NULL, '2026-02-26 15:15:54'),
(101, 1, 'create_product', 'product', 32, 'Created product: Beige Loose Pants', '180.254.226.30', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '/api/products', 'POST', NULL, '2026-02-26 15:18:32'),
(102, 1, 'update_product', 'product', 32, 'Updated product', '180.254.226.30', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '/api/products/32', 'PUT', NULL, '2026-02-26 15:18:52'),
(103, 1, 'ADD_PRODUCT_IMAGES', 'Added 1 images to product 32', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-26 15:19:13'),
(104, 1, 'update_product', 'product', 28, 'Updated product', '180.254.226.30', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '/api/products/28', 'PUT', NULL, '2026-02-26 15:19:29'),
(105, 1, 'update_product', 'product', 28, 'Updated product', '180.254.226.30', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36', '/api/products/28', 'PUT', NULL, '2026-02-26 15:20:16'),
(106, 1, 'create_product', 'product', 33, 'Created product: Blue a-line loose pants', '180.254.226.30', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '/api/products', 'POST', NULL, '2026-02-26 15:24:35'),
(107, 1, 'ADD_PRODUCT_IMAGES', 'Added 1 images to product 33', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-26 15:24:49'),
(108, 1, 'create_product', 'product', 34, 'Created product: Black Pants', '180.254.226.30', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '/api/products', 'POST', NULL, '2026-02-26 15:26:59'),
(109, 1, 'ADD_PRODUCT_IMAGES', 'Added 1 images to product 34', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-26 15:27:00'),
(110, 1, 'create_product', 'product', 35, 'Created product: Slim Jeans', '180.254.226.30', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '/api/products', 'POST', NULL, '2026-02-26 15:29:00'),
(111, 1, 'ADD_PRODUCT_IMAGES', 'Added 1 images to product 35', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-26 15:29:09'),
(112, 1, 'create_product', 'product', 36, 'Created product: Black Leather Pants', '180.254.226.30', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '/api/products', 'POST', NULL, '2026-02-26 15:31:05'),
(113, 1, 'ADD_PRODUCT_IMAGES', 'Added 1 images to product 36', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-26 15:31:17'),
(114, 1, 'create_product', 'product', 37, 'Created product: Beige Short Pants', '180.254.226.30', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '/api/products', 'POST', NULL, '2026-02-26 15:34:07'),
(115, 1, 'ADD_PRODUCT_IMAGES', 'Added 1 images to product 37', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-26 15:34:23'),
(116, 1, 'create_product', 'product', 38, 'Created product: Skinny Jeans', '2404:c0:3e1a:70a2:787d:c608:e81c:d0be', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '/api/products', 'POST', NULL, '2026-02-26 15:38:25'),
(117, 1, 'ADD_PRODUCT_IMAGES', 'Added 1 images to product 38', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-26 15:38:27'),
(118, 1, 'create_product', 'product', 39, 'Created product: White Culotte Pants', '2404:c0:3e1a:70a2:787d:c608:e81c:d0be', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '/api/products', 'POST', NULL, '2026-02-26 15:41:26'),
(119, 1, 'ADD_PRODUCT_IMAGES', 'Added 1 images to product 39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-26 15:41:27'),
(120, 1, 'create_product', 'product', 40, 'Created product: Beige Jumpsuit', '2404:c0:3e1a:70a2:787d:c608:e81c:d0be', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '/api/products', 'POST', NULL, '2026-02-26 15:42:35'),
(121, 1, 'ADD_PRODUCT_IMAGES', 'Added 1 images to product 40', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-26 15:42:36'),
(122, 1, 'create_product', 'product', 41, 'Created product: White Beige Short Pants', '2404:c0:3e1a:70a2:787d:c608:e81c:d0be', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '/api/products', 'POST', NULL, '2026-02-26 15:46:39'),
(123, 1, 'ADD_PRODUCT_IMAGES', 'Added 1 images to product 41', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-26 15:46:40');

-- --------------------------------------------------------

--
-- Struktur dari tabel `banners`
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
-- Struktur dari tabel `carts`
--

CREATE TABLE `carts` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `session_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `carts`
--

INSERT INTO `carts` (`id`, `user_id`, `session_id`, `created_at`, `updated_at`) VALUES
(1, 1, NULL, '2025-12-23 07:08:18', '2025-12-23 07:08:18'),
(2, NULL, '19061462-f13e-4942-9072-40b7c4637bfc', '2026-01-11 14:54:06', '2026-01-11 14:54:06'),
(3, NULL, '84a7db02-b415-4308-b55a-d8b191370d42', '2026-02-25 15:50:58', '2026-02-25 15:50:58');

-- --------------------------------------------------------

--
-- Struktur dari tabel `cart_items`
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
-- Dumping data untuk tabel `cart_items`
--

INSERT INTO `cart_items` (`id`, `cart_id`, `product_variant_id`, `quantity`, `price`, `created_at`, `updated_at`) VALUES
(3, 2, 8, 1, 279000.00, '2026-01-11 14:55:19', '2026-01-11 14:55:19'),
(5, 3, 8, 1, 237150.00, '2026-02-25 15:50:58', '2026-02-25 15:50:58'),
(8, 1, 1, 1, 239200.00, '2026-02-26 03:08:56', '2026-02-26 03:08:56');

-- --------------------------------------------------------

--
-- Struktur dari tabel `categories`
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
-- Dumping data untuk tabel `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `gender`, `parent_id`, `image_url`, `is_active`, `sort_order`, `created_at`, `updated_at`) VALUES
-- Parent Categories
(1, 'Men Jeans', 'men-jeans', 'Denim jeans for men', 'pria', NULL, NULL, 1, 1, '2025-12-18 17:19:00', '2026-02-26 16:06:25'),
(2, 'Women Jeans', 'women-jeans', 'Denim jeans for women', 'wanita', NULL, NULL, 1, 2, '2025-12-18 17:19:00', '2026-02-26 16:06:25'),
(3, 'Casual Wear', 'casual-wear', 'Casual everyday clothing for all', 'both', NULL, NULL, 1, 3, '2025-12-18 17:19:00', '2026-02-26 16:06:25'),
(13, 'Men Pants', 'men-pants', 'Non-denim pants for men', 'pria', NULL, NULL, 1, 4, '2026-02-26 17:00:00', '2026-02-26 17:00:00'),
(14, 'Women Pants', 'women-pants', 'Non-denim pants for women', 'wanita', NULL, NULL, 1, 5, '2026-02-26 17:00:00', '2026-02-26 17:00:00'),
(15, 'Outerwear & Accessories', 'outerwear-accessories', 'Jackets, belts, and accessories', 'both', NULL, NULL, 1, 6, '2026-02-26 17:00:00', '2026-02-26 17:00:00'),
-- Subcategories: Men Jeans
(16, 'Slim Jeans', 'slim-jeans-men', 'Slim fit jeans for men', 'pria', 1, NULL, 1, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00'),
(17, 'Straight Jeans', 'straight-jeans-men', 'Straight cut jeans for men', 'pria', 1, NULL, 1, 2, '2026-02-26 17:00:00', '2026-02-26 17:00:00'),
(18, 'Skinny Jeans', 'skinny-jeans-men', 'Skinny fit jeans for men', 'pria', 1, NULL, 1, 3, '2026-02-26 17:00:00', '2026-02-26 17:00:00'),
(19, 'Ripped Jeans', 'ripped-jeans-men', 'Distressed ripped jeans for men', 'pria', 1, NULL, 1, 4, '2026-02-26 17:00:00', '2026-02-26 17:00:00'),
-- Subcategories: Women Jeans
(20, 'High Waist Jeans', 'high-waist-jeans', 'High waisted jeans for women', 'wanita', 2, NULL, 1, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00'),
(21, 'Boyfriend Jeans', 'boyfriend-jeans', 'Relaxed boyfriend fit jeans', 'wanita', 2, NULL, 1, 2, '2026-02-26 17:00:00', '2026-02-26 17:00:00'),
(22, 'Flare Jeans', 'flare-jeans', 'Flare and bootcut jeans for women', 'wanita', 2, NULL, 1, 3, '2026-02-26 17:00:00', '2026-02-26 17:00:00'),
(23, 'Mom Jeans', 'mom-jeans', 'High waist relaxed mom jeans', 'wanita', 2, NULL, 1, 4, '2026-02-26 17:00:00', '2026-02-26 17:00:00'),
-- Subcategories: Casual Wear
(24, 'Short Pants', 'short-pants', 'Casual shorts for all', 'both', 3, NULL, 1, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00'),
(25, 'Jogger Pants', 'jogger-pants', 'Comfortable jogger style pants', 'both', 3, NULL, 1, 2, '2026-02-26 17:00:00', '2026-02-26 17:00:00'),
-- Subcategories: Men Pants
(26, 'Chino Pants', 'chino-pants', 'Classic chino pants for men', 'pria', 13, NULL, 1, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00'),
(27, 'Cargo Pants', 'cargo-pants', 'Utility cargo pants for men', 'pria', 13, NULL, 1, 2, '2026-02-26 17:00:00', '2026-02-26 17:00:00'),
-- Subcategories: Women Pants
(28, 'Wide Leg Pants', 'wide-leg-pants', 'Wide leg trousers for women', 'wanita', 14, NULL, 1, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00'),
(29, 'Culotte Pants', 'culotte-pants', 'Wide cropped culotte pants', 'wanita', 14, NULL, 1, 2, '2026-02-26 17:00:00', '2026-02-26 17:00:00'),
(30, 'Palazzo Pants', 'palazzo-pants', 'Flowing palazzo pants for women', 'wanita', 14, NULL, 1, 3, '2026-02-26 17:00:00', '2026-02-26 17:00:00'),
-- Subcategories: Outerwear & Accessories
(31, 'Denim Jacket', 'denim-jacket', 'Classic denim jackets', 'both', 15, NULL, 1, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00'),
(32, 'Belt & Accessories', 'belt-accessories', 'Belts, wallets, and accessories', 'both', 15, NULL, 1, 2, '2026-02-26 17:00:00', '2026-02-26 17:00:00');

-- --------------------------------------------------------

--
-- Struktur dari tabel `cities`
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
-- Dumping data untuk tabel `cities`
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
-- Struktur dari tabel `content_settings`
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
  `sort_order` int(11) DEFAULT 0,
  `updated_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `content_settings`
--

INSERT INTO `content_settings` (`id`, `section_key`, `section_name`, `title_id`, `title_en`, `subtitle_id`, `subtitle_en`, `content_id`, `content_en`, `button_text_id`, `button_text_en`, `button_url`, `image_url`, `extra_data`, `is_active`, `sort_order`, `updated_by`, `created_at`, `updated_at`) VALUES
(1, 'hero', 'Hero Section', 'Koleksi Jeans Terbaru', 'Latest Jeans Collection', '', '', '', '', 'Belanja', 'Shop', '/products', '', NULL, 1, 1, 1, '2026-01-10 09:26:02', '2026-02-25 15:14:08'),
(2, 'featured', 'Featured Products', 'Produk Unggulan', 'Featured Products', 'Pilihan terbaik untuk Anda', 'Best picks for you', NULL, NULL, 'Lihat Semua', 'View All', '/products?featured=true', NULL, NULL, 1, 2, NULL, '2026-01-10 09:26:02', '2026-01-10 09:26:02'),
(3, 'categories', 'Categories Section', 'Kategori', 'Categories', 'Jelajahi koleksi kami', 'Explore our collection', NULL, NULL, 'Lihat Kategori', 'View Categories', '/products', NULL, NULL, 1, 3, NULL, '2026-01-10 09:26:02', '2026-01-10 09:26:02'),
(4, 'promo', 'Promo Section', 'Promo Spesial', 'Special Promo', 'Diskon hingga 50%', 'Up to 50% off', NULL, NULL, 'Lihat Promo', 'View Promo', '/products?promo=true', NULL, NULL, 1, 4, NULL, '2026-01-10 09:26:02', '2026-01-10 09:26:02'),
(5, 'about', 'About Section', 'Tentang Kami', 'About Us', 'Kualitas terbaik dengan harga terjangkau', 'Best quality at affordable prices', NULL, NULL, 'Selengkapnya', 'Learn More', '/about', NULL, NULL, 1, 5, NULL, '2026-01-10 09:26:02', '2026-01-10 09:26:02'),
(6, 'newsletter', 'Newsletter Section', 'Berlangganan Newsletter', 'Subscribe to Newsletter', 'Dapatkan info promo dan produk terbaru', 'Get the latest promo and product updates', NULL, NULL, 'Berlangganan', 'Subscribe', NULL, NULL, NULL, 1, 6, NULL, '2026-01-10 09:26:02', '2026-01-10 09:26:02'),
(7, 'footer_tagline', 'Footer Tagline', 'Jeans berkualitas untuk semua', 'Quality jeans for everyone', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 7, NULL, '2026-01-10 09:26:02', '2026-01-10 09:26:02');

-- --------------------------------------------------------

--
-- Struktur dari tabel `coupons`
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
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `usage_limit` int(11) DEFAULT NULL COMMENT 'Total times coupon can be used (null = unlimited)',
  `usage_limit_per_user` int(11) DEFAULT 1 COMMENT 'Times each user can use this coupon',
  `usage_count` int(11) DEFAULT 0 COMMENT 'Total times coupon has been used',
  `applicable_products` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`applicable_products`)),
  `applicable_categories` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`applicable_categories`)),
  `is_active` tinyint(1) DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `coupons`
--

INSERT INTO `coupons` (`id`, `code`, `name`, `description`, `discount_type`, `discount_value`, `max_discount`, `min_purchase`, `start_date`, `end_date`, `usage_limit`, `usage_limit_per_user`, `usage_count`, `applicable_products`, `applicable_categories`, `is_active`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'KPN1', 'kupon 1', NULL, 'percentage', 10.00, NULL, 0.00, NULL, NULL, NULL, 1, 0, NULL, NULL, 1, 1, '2026-02-07 12:30:56', '2026-02-07 12:30:56'),
(2, 'DISC10', 'Diskon 10%', NULL, 'percentage', 10.00, 10000.00, 0.00, NULL, NULL, NULL, 1, 0, NULL, NULL, 1, 1, '2026-02-26 14:40:19', '2026-02-26 14:40:19');

-- --------------------------------------------------------

--
-- Struktur dari tabel `coupon_usages`
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
-- Struktur dari tabel `discounts`
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
-- Dumping data untuk tabel `discounts`
--

INSERT INTO `discounts` (`id`, `code`, `type`, `value`, `min_purchase`, `max_discount`, `start_date`, `end_date`, `usage_limit`, `usage_count`, `is_active`, `applicable_to`, `applicable_ids`, `description`, `created_at`, `updated_at`) VALUES
(1, 'WELCOME10', 'percentage', 10.00, 200000.00, 50000.00, NULL, NULL, NULL, 0, 1, 'all', NULL, 'Welcome discount 10% off', '2025-12-18 17:19:01', '2025-12-18 17:19:01'),
(2, 'FLAT50K', 'fixed', 50000.00, 500000.00, NULL, NULL, NULL, NULL, 0, 1, 'all', NULL, 'Flat 50K discount for purchase above 500K', '2025-12-18 17:19:01', '2025-12-18 17:19:01');

-- --------------------------------------------------------

--
-- Struktur dari tabel `exchange_rates`
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
-- Dumping data untuk tabel `exchange_rates`
--

INSERT INTO `exchange_rates` (`id`, `currency_from`, `currency_to`, `rate`, `is_active`, `updated_by`, `created_at`, `updated_at`) VALUES
(1, 'IDR', 'USD', 16000.000000, 1, NULL, '2026-01-10 09:13:16', '2026-01-10 09:13:16');

-- --------------------------------------------------------

--
-- Struktur dari tabel `exchange_rate_logs`
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
-- Struktur dari tabel `fittings`
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
-- Dumping data untuk tabel `fittings`
--

INSERT INTO `fittings` (`id`, `name`, `slug`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Slim Fit', 'slim-fit', 'Slim fitting style', 1, '2025-12-18 17:19:00', '2025-12-18 17:19:00'),
(2, 'Regular Fit', 'regular-fit', 'Regular fitting style', 1, '2025-12-18 17:19:00', '2025-12-18 17:19:00'),
(3, 'Loose Fit', 'loose-fit', 'Loose fitting style', 1, '2025-12-18 17:19:00', '2025-12-18 17:19:00'),
(4, 'Skinny Fit', 'skinny-fit', 'Skinny fitting style', 1, '2025-12-18 17:19:00', '2025-12-18 17:19:00');

-- --------------------------------------------------------

--
-- Struktur dari tabel `guest_order_details`
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
-- Dumping data untuk tabel `guest_order_details`
--

INSERT INTO `guest_order_details` (`id`, `order_id`, `guest_name`, `guest_email`, `guest_phone`, `address`, `city`, `province`, `postal_code`, `country`, `latitude`, `longitude`, `address_notes`, `created_at`, `updated_at`) VALUES
(1, 4, 'Endou Okita', 'Endou@mail.com', '081311231', 'Jalan Ambengan no 2', 'Surabaya', 'Jawa Timur', '60111', 'Indonesia', NULL, NULL, NULL, '2026-02-25 15:51:48', '2026-02-25 15:51:48');

-- --------------------------------------------------------

--
-- Struktur dari tabel `inventory_movements`
--

CREATE TABLE `inventory_movements` (
  `id` int(11) NOT NULL,
  `product_variant_id` int(11) NOT NULL,
  `type` enum('in','out','adjustment') NOT NULL,
  `quantity` int(11) NOT NULL,
  `reference_type` varchar(50) DEFAULT NULL,
  `reference_id` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `inventory_movements`
--

INSERT INTO `inventory_movements` (`id`, `product_variant_id`, `type`, `quantity`, `reference_type`, `reference_id`, `notes`, `created_by`, `created_at`) VALUES
(1, 43, 'in', 10, 'initial_stock', NULL, 'Initial stock for new variant', 1, '2025-12-23 06:21:51'),
(2, 87, 'in', 10, 'initial_stock', NULL, 'Initial stock for new variant', 1, '2026-01-11 15:22:53'),
(3, 87, 'out', 1, 'order', 1, NULL, 1, '2026-01-11 15:53:34'),
(4, 87, 'out', 1, 'order', 2, 'Manual order', 1, '2026-02-25 15:23:01'),
(5, 1, 'out', 1, 'order', 3, 'Manual order', 1, '2026-02-25 15:41:00'),
(6, 8, 'out', 1, 'order', 4, NULL, NULL, '2026-02-25 15:51:48'),
(7, 1, 'out', 1, 'order', 5, NULL, 1, '2026-02-25 15:54:49'),
(8, 8, 'out', 1, 'order', 6, NULL, 1, '2026-02-25 16:25:29');

-- --------------------------------------------------------

--
-- Struktur dari tabel `offices`
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
-- Struktur dari tabel `orders`
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
-- Dumping data untuk tabel `orders`
--

INSERT INTO `orders` (`id`, `order_number`, `unique_token`, `user_id`, `guest_email`, `shipping_address`, `shipping_city`, `shipping_city_id`, `shipping_province`, `shipping_postal_code`, `shipping_country`, `shipping_method`, `tracking_number`, `courier`, `warehouse_id`, `shipping_cost_id`, `status`, `approved_at`, `approved_by`, `payment_status`, `payment_method`, `subtotal`, `discount_amount`, `discount_code`, `member_discount_amount`, `shipping_cost`, `tax`, `total_amount`, `customer_name`, `customer_email`, `customer_phone`, `notes`, `currency`, `exchange_rate`, `created_by`, `created_at`, `updated_at`, `coupon_id`, `coupon_code`, `coupon_discount`) VALUES
(1, 'ORD-20260111-8887', '2ef1c6fe941ab85d8050d8ae4315762ef8287bf170f48a68bd2a7ca101fedf6e', 1, NULL, NULL, NULL, NULL, NULL, NULL, 'Indonesia', NULL, NULL, NULL, NULL, NULL, 'pending', NULL, NULL, 'pending', 'bank_transfer', 230000.00, 0.00, NULL, 0.00, 20000.00, 0.00, 250000.00, NULL, NULL, NULL, NULL, 'IDR', NULL, NULL, '2026-01-11 15:53:34', '2026-01-11 15:53:34', NULL, NULL, 0.00),
(2, 'ORD-20260225-9880', 'c569a5558927e4a34e23964d15d60982a5db9cfbcfee87cafb0cf325e4244eba', NULL, NULL, 'Jl Test 123', 'Jakarta', NULL, 'DKI Jakarta', '10110', 'Indonesia', 'manual', NULL, NULL, NULL, NULL, 'confirmed', NULL, NULL, 'pending', 'cash', 230000.00, 0.00, NULL, 0.00, 0.00, 0.00, 230000.00, 'Test Customer', 'testmanual@test.com', '081234567890', 'Manual order created by admin', 'IDR', NULL, 1, '2026-02-25 15:23:01', '2026-02-25 15:23:01', NULL, NULL, 0.00),
(3, 'ORD-20260225-8707', '7bdce4bbd72d3fdaa178fe58d4e7d3a55f3eb553fb1f2504a096292ee6dd9853', NULL, NULL, 'Jl. Test Fix No 1', 'Jakarta', NULL, 'DKI Jakarta', '10110', 'Indonesia', 'manual', NULL, NULL, NULL, NULL, 'confirmed', NULL, NULL, 'pending', 'bank_transfer', 150000.00, 0.00, NULL, 0.00, 0.00, 0.00, 150000.00, 'Test After Fix', 'testfix@test.com', '081234567890', 'Test after undefined fix', 'IDR', NULL, 1, '2026-02-25 15:41:00', '2026-02-25 15:41:00', NULL, NULL, 0.00),
(4, 'ORD-20260225-2258', '51ec8bb14628729846a22beb53e1500b21d36d101e830107f67f6bfbf54aeb7a', NULL, 'Endou@mail.com', NULL, NULL, NULL, NULL, NULL, 'Indonesia', 'J&T - Regular', NULL, 'J&T', NULL, 27, 'pending', NULL, NULL, 'pending', 'cod', 237150.00, 0.00, NULL, 0.00, 24000.00, 26087.00, 287237.00, 'Endou Okita', 'Endou@mail.com', '081311231', NULL, 'IDR', NULL, NULL, '2026-02-25 15:51:48', '2026-02-25 16:33:15', NULL, NULL, 0.00),
(5, 'ORD-20260225-8022', 'a49f5f5b0894ccb19c86cfc84ff4ffb2a0fa54aa78957a39830e57716b37d89a', 1, NULL, NULL, NULL, NULL, NULL, NULL, 'Indonesia', 'J&T - Regular', NULL, 'J&T', NULL, 27, 'pending', NULL, NULL, 'pending', 'bank_transfer', 239200.00, 0.00, NULL, 0.00, 24000.00, 26312.00, 289512.00, 'Admin User', NULL, '08123456789', NULL, 'IDR', NULL, NULL, '2026-02-25 15:54:49', '2026-02-25 16:33:15', NULL, NULL, 0.00),
(6, 'ORD-20260225-0483', 'cadd0b2ca0fbf70a9830c1e8e17aa53cac6981232ff5f1a3f53b6e4760640d7c', 1, NULL, NULL, NULL, NULL, NULL, NULL, 'Indonesia', 'J&T - Regular', NULL, 'J&T', NULL, 27, 'confirmed', '2026-02-26 19:38:48', 1, 'paid', 'bank_transfer', 237150.00, 0.00, NULL, 0.00, 24000.00, 26087.00, 287237.00, 'Admin User', NULL, '08123456789', NULL, 'IDR', NULL, NULL, '2026-02-25 16:25:29', '2026-02-26 12:38:51', NULL, NULL, 0.00);

-- --------------------------------------------------------

--
-- Struktur dari tabel `order_discounts`
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
-- Struktur dari tabel `order_items`
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
-- Dumping data untuk tabel `order_items`
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
-- Struktur dari tabel `order_shipping`
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
-- Dumping data untuk tabel `order_shipping`
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
-- Struktur dari tabel `order_shipping_history`
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
-- Dumping data untuk tabel `order_shipping_history`
--

INSERT INTO `order_shipping_history` (`id`, `order_id`, `status`, `title`, `description`, `location`, `created_by`, `created_at`) VALUES
(1, 1, 'pending', 'Pesanan Dibuat', 'Pesanan berhasil dibuat dan menunggu persetujuan', NULL, 1, '2026-01-11 15:53:34'),
(2, 2, 'confirmed', 'Pesanan Manual Dibuat', 'Pesanan dibuat secara manual oleh admin', NULL, 1, '2026-02-25 15:23:01'),
(3, 3, 'confirmed', 'Pesanan Manual Dibuat', 'Pesanan dibuat secara manual oleh admin', NULL, 1, '2026-02-25 15:41:00'),
(4, 4, 'pending', 'Pesanan Dibuat', 'Pesanan berhasil dibuat dan menunggu persetujuan', NULL, NULL, '2026-02-25 15:51:48'),
(5, 5, 'pending', 'Pesanan Dibuat', 'Pesanan berhasil dibuat dan menunggu persetujuan', NULL, 1, '2026-02-25 15:54:49'),
(6, 6, 'pending', 'Pesanan Dibuat', 'Pesanan berhasil dibuat dan menunggu persetujuan', NULL, 1, '2026-02-25 16:25:30'),
(7, 6, 'confirmed', 'Pesanan Disetujui', 'Pesanan disetujui oleh admin', NULL, 1, '2026-02-26 12:38:48');

-- --------------------------------------------------------

--
-- Struktur dari tabel `order_taxes`
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
-- Struktur dari tabel `order_tracking`
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
-- Struktur dari tabel `payments`
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
-- Dumping data untuk tabel `payments`
--

INSERT INTO `payments` (`id`, `order_id`, `payment_method`, `payment_gateway`, `transaction_id`, `amount`, `status`, `payment_proof`, `payment_url`, `paid_at`, `expired_at`, `response_data`, `created_at`, `updated_at`, `snap_token`, `va_number`, `bill_key`, `redirect_url`) VALUES
(1, 2, 'cash', NULL, NULL, 230000.00, 'pending', NULL, NULL, NULL, NULL, NULL, '2026-02-25 15:23:01', '2026-02-25 15:23:01', NULL, NULL, NULL, NULL),
(2, 3, 'bank_transfer', NULL, NULL, 150000.00, 'pending', NULL, NULL, NULL, NULL, NULL, '2026-02-25 15:41:00', '2026-02-25 15:41:00', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `permissions`
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
-- Dumping data untuk tabel `permissions`
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
-- Struktur dari tabel `positions`
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
-- Struktur dari tabel `products`
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
-- Dumping data untuk tabel `products`
--

INSERT INTO `products` (`id`, `name`, `slug`, `category_id`, `gender`, `fitting_id`, `description`, `short_description`, `base_price`, `discount_percentage`, `discount_start_date`, `discount_end_date`, `master_cost_price`, `sku`, `weight`, `is_active`, `is_featured`, `meta_title`, `meta_description`, `meta_keywords`, `view_count`, `created_at`, `updated_at`) VALUES
-- Men Jeans > Slim Jeans (cat 16)
(1, 'Classic Blue Slim Jeans', 'classic-blue-slim-jeans', 16, 'pria', 1, 'Premium denim jeans with classic blue wash. Perfect fit for everyday wear.', 'Classic blue denim with slim fit', 299000.00, 20.00, NULL, NULL, 150000.00, 'CBJ-SLIM-001', 0.50, 1, 1, 'Classic Blue Slim Jeans', 'Classic blue denim with slim fit', 'jeans,slim,pria,blue', 5, '2025-12-18 17:19:00', '2026-02-26 16:06:25'),
(35, 'Indigo Slim Jeans', 'slim-jeans', 16, 'pria', 1, 'Deep indigo slim fit jeans with stretch denim for maximum comfort.', 'Indigo slim fit with stretch', 246000.00, NULL, NULL, NULL, 100000.00, 'ISJ-SLIM-001', 0.50, 1, 0, 'Indigo Slim Jeans', 'Indigo slim fit with stretch', 'jeans,slim,pria,indigo', 0, '2026-02-26 15:29:00', '2026-02-26 16:06:25'),
-- Men Jeans > Straight Jeans (cat 17)
(2, 'Black Regular Jeans', 'black-regular-jeans', 17, 'pria', 2, 'Timeless black jeans with straight cut. Versatile and comfortable.', 'Black denim straight fit', 279000.00, 15.00, NULL, NULL, 140000.00, 'BRJ-REG-001', 0.50, 1, 1, 'Black Regular Jeans', 'Black denim straight fit', 'jeans,straight,pria,black', 14, '2025-12-18 17:19:01', '2026-02-26 16:06:25'),
(50, 'Vintage Straight Jeans', 'vintage-straight-jeans', 17, 'pria', 2, 'Classic vintage wash straight leg jeans. Retro style, modern comfort.', 'Vintage wash straight leg', 310000.00, 10.00, NULL, NULL, 155000.00, 'VSJ-STR-001', 0.55, 1, 1, 'Vintage Straight Jeans', 'Vintage wash straight leg', 'jeans,straight,vintage,pria', 0, '2026-02-26 17:00:00', '2026-02-26 17:00:00'),
-- Men Jeans > Skinny Jeans (cat 18)
(38, 'Black Skinny Jeans', 'skinny-jeans', 18, 'pria', 4, 'Ultra-slim black skinny jeans with premium stretch denim. Modern and sleek.', 'Black skinny fit stretch denim', 410000.00, NULL, NULL, NULL, 100000.00, 'BSJ-SKN-001', 0.45, 1, 0, 'Black Skinny Jeans', 'Black skinny fit stretch denim', 'jeans,skinny,pria,black', 0, '2026-02-26 15:38:25', '2026-02-26 16:06:25'),
-- Men Jeans > Ripped Jeans (cat 19)
(27, 'Blue Ripped Jeans', 'jean-biru-terbaru', 19, 'pria', 2, 'Trendy blue ripped jeans with premium denim. Street style essential.', 'Blue ripped street style jeans', 250000.00, NULL, NULL, NULL, 120000.00, 'BR121', 0.55, 1, 0, 'Blue Ripped Jeans', 'Blue ripped street style jeans', 'jeans,ripped,pria,blue', 0, '2026-01-11 15:12:32', '2026-02-26 17:00:00'),
(43, 'Grey Distressed Ripped Jeans', 'grey-distressed-ripped-jeans', 19, 'pria', 2, 'Grey wash jeans with artistic distressed details. Urban style statement.', 'Grey distressed urban jeans', 289000.00, NULL, NULL, NULL, 140000.00, 'GDR-RIP-001', 0.55, 1, 1, 'Grey Distressed Ripped Jeans', 'Grey distressed urban jeans', 'jeans,ripped,pria,grey', 0, '2026-02-26 17:00:00', '2026-02-26 17:00:00'),
-- Women Jeans > High Waist Jeans (cat 20)
(42, 'Dark Wash High Waist Jeans', 'dark-wash-high-waist-jeans', 20, 'wanita', 1, 'Flattering high waist jeans in dark wash. Slimming effect with comfortable stretch.', 'Dark wash high waist slim', 350000.00, 15.00, NULL, NULL, 170000.00, 'DWH-HW-001', 0.50, 1, 1, 'Dark Wash High Waist Jeans', 'Dark wash high waist slim', 'jeans,high-waist,wanita,dark', 0, '2026-02-26 17:00:00', '2026-02-26 17:00:00'),
-- Women Jeans > Boyfriend Jeans (cat 21)
(3, 'Light Wash Boyfriend Jeans', 'light-wash-loose-jeans', 21, 'wanita', 3, 'Relaxed boyfriend fit jeans with light wash. Effortlessly cool and comfortable.', 'Light wash boyfriend fit', 319000.00, NULL, NULL, NULL, 160000.00, 'LWJ-LOOSE-001', 0.60, 1, 1, 'Light Wash Boyfriend Jeans', 'Light wash boyfriend fit', 'jeans,boyfriend,wanita,light', 0, '2025-12-18 17:19:01', '2026-02-26 17:00:00'),
(49, 'Black Boyfriend Jeans', 'black-boyfriend-jeans', 21, 'wanita', 3, 'Classic black boyfriend jeans with a relaxed silhouette. Timeless and versatile.', 'Black relaxed boyfriend fit', 320000.00, NULL, NULL, NULL, 160000.00, 'BBJ-BF-001', 0.55, 1, 0, 'Black Boyfriend Jeans', 'Black relaxed boyfriend fit', 'jeans,boyfriend,wanita,black', 0, '2026-02-26 17:00:00', '2026-02-26 17:00:00'),
-- Women Jeans > Flare Jeans (cat 22)
(33, 'Blue A-Line Flare Pants', 'blue-a-line-loose-pants', 22, 'wanita', 3, 'Beautiful blue flare jeans with a flattering A-line silhouette.', 'Blue flare A-line jeans', 325000.00, NULL, NULL, NULL, 150000.00, 'BAF-FLR-001', 0.55, 1, 0, 'Blue A-Line Flare Pants', 'Blue flare A-line jeans', 'jeans,flare,wanita,blue', 0, '2026-02-26 15:24:35', '2026-02-26 17:00:00'),
(45, 'Grey Flare Jeans', 'grey-flare-jeans', 22, 'wanita', 2, 'Retro-inspired grey flare jeans. 70s vibes with modern comfort.', 'Grey retro flare leg', 340000.00, NULL, NULL, NULL, 165000.00, 'GFJ-FLR-001', 0.55, 1, 1, 'Grey Flare Jeans', 'Grey retro flare leg', 'jeans,flare,wanita,grey', 0, '2026-02-26 17:00:00', '2026-02-26 17:00:00'),
-- Women Jeans > Mom Jeans (cat 23)
(44, 'Black Mom Jeans', 'black-mom-jeans', 23, 'wanita', 3, 'Classic high-waist mom jeans in black. Relaxed tapered leg for a vintage look.', 'Black high-waist mom fit', 310000.00, 10.00, NULL, NULL, 150000.00, 'BMJ-MOM-001', 0.55, 1, 1, 'Black Mom Jeans', 'Black high-waist mom fit', 'jeans,mom,wanita,black', 0, '2026-02-26 17:00:00', '2026-02-26 17:00:00'),
(36, 'Black Leather Mom Pants', 'black-leather-pants', 23, 'wanita', 1, 'Edgy faux leather mom pants with high waist. Bold and fashion-forward.', 'Faux leather high waist pants', 327000.00, NULL, NULL, NULL, 100000.00, 'BLP-MOM-001', 0.60, 1, 0, 'Black Leather Mom Pants', 'Faux leather high waist pants', 'pants,leather,wanita,black', 0, '2026-02-26 15:31:05', '2026-02-26 17:00:00'),
-- Casual Wear > Short Pants (cat 24)
(28, 'Denim Short Pants', 'short-jeans', 24, 'wanita', 3, 'Classic denim shorts, perfect for casual summer days.', 'Casual denim shorts', 130000.00, NULL, NULL, NULL, 60000.00, 'BLT001', 0.40, 1, 0, 'Denim Short Pants', 'Casual denim shorts', 'shorts,denim,wanita', 3, '2026-01-11 15:22:17', '2026-02-26 17:00:00'),
(37, 'Beige Short Pants', 'beige-short-pants', 24, 'pria', 2, 'Comfortable beige chino shorts for men. Great for casual outings.', 'Beige casual chino shorts', 195000.00, NULL, NULL, NULL, 50000.00, 'BSP-SHR-001', 0.35, 1, 0, 'Beige Short Pants', 'Beige casual chino shorts', 'shorts,beige,pria', 0, '2026-02-26 15:34:07', '2026-02-26 17:00:00'),
(41, 'White Beige Short Pants', 'white-beige-short-pants', 24, 'both', 3, 'Versatile white beige shorts for a clean casual look.', 'White beige casual shorts', 125000.00, NULL, NULL, NULL, 50000.00, 'WBS-SHR-001', 0.35, 1, 0, 'White Beige Short Pants', 'White beige casual shorts', 'shorts,white,beige,unisex', 0, '2026-02-26 15:46:39', '2026-02-26 17:00:00'),
-- Casual Wear > Jogger Pants (cat 25)
(32, 'Beige Jogger Pants', 'beige-loose-pants', 25, 'pria', 3, 'Comfortable beige jogger pants with elastic cuffs. Athleisure essential.', 'Beige comfort jogger pants', 250000.00, NULL, NULL, NULL, 100000.00, 'BJP-JOG-001', 0.45, 1, 0, 'Beige Jogger Pants', 'Beige comfort jogger pants', 'jogger,beige,pria', 0, '2026-02-26 15:18:32', '2026-02-26 17:00:00'),
(40, 'Olive Jogger Pants', 'beige-jumpsuit', 25, 'pria', 2, 'Military-inspired olive jogger pants with cargo pockets.', 'Olive cargo jogger pants', 275000.00, NULL, NULL, NULL, 99998.00, 'OJP-JOG-001', 0.50, 1, 0, 'Olive Jogger Pants', 'Olive cargo jogger pants', 'jogger,olive,pria', 0, '2026-02-26 15:42:35', '2026-02-26 17:00:00'),
-- Men Pants > Chino Pants (cat 26)
(34, 'Black Chino Pants', 'black-pants', 26, 'pria', 4, 'Tailored black chino pants for a smart casual look. Versatile for office or weekend.', 'Tailored black chino', 210000.00, NULL, NULL, NULL, 100000.00, 'BCP-CHN-001', 0.50, 1, 0, 'Black Chino Pants', 'Tailored black chino', 'chino,black,pria', 0, '2026-02-26 15:26:59', '2026-02-26 17:00:00'),
(47, 'Khaki Chino Pants', 'khaki-chino-pants', 26, 'pria', 2, 'Classic khaki chino pants. Smart casual essential for every wardrobe.', 'Classic khaki chino', 245000.00, NULL, NULL, NULL, 120000.00, 'KCP-CHN-001', 0.50, 1, 1, 'Khaki Chino Pants', 'Classic khaki chino', 'chino,khaki,pria', 0, '2026-02-26 17:00:00', '2026-02-26 17:00:00'),
-- Men Pants > Cargo Pants (cat 27)
(46, 'Navy Cargo Pants', 'navy-cargo-pants', 27, 'pria', 3, 'Durable navy cargo pants with multiple pockets. Built for adventure.', 'Navy utility cargo pants', 275000.00, NULL, NULL, NULL, 130000.00, 'NCP-CRG-001', 0.65, 1, 1, 'Navy Cargo Pants', 'Navy utility cargo pants', 'cargo,navy,pria', 0, '2026-02-26 17:00:00', '2026-02-26 17:00:00'),
-- Women Pants > Wide Leg Pants (cat 28)
(48, 'White Palazzo Pants', 'white-palazzo-pants', 28, 'wanita', 3, 'Elegant wide leg white pants. Flowy and sophisticated for any occasion.', 'White wide leg palazzo', 295000.00, NULL, NULL, NULL, 140000.00, 'WPP-WL-001', 0.50, 1, 1, 'White Palazzo Pants', 'White wide leg palazzo', 'pants,wide-leg,wanita,white', 0, '2026-02-26 17:00:00', '2026-02-26 17:00:00'),
-- Women Pants > Culotte Pants (cat 29)
(39, 'White Culotte Pants', 'white-culotte-pants', 29, 'wanita', 2, 'Chic white culotte pants with wide cropped legs. Elegant and comfortable.', 'White wide cropped culotte', 420000.00, NULL, NULL, NULL, 100000.00, 'WCP-CUL-001', 0.45, 1, 0, 'White Culotte Pants', 'White wide cropped culotte', 'culotte,white,wanita', 1, '2026-02-26 15:41:26', '2026-02-26 17:00:00'),
-- Women Pants > Palazzo Pants (cat 30)
(52, 'Black Palazzo Pants', 'black-palazzo-pants', 30, 'wanita', 3, 'Flowing black palazzo pants with a flattering high waist. Perfect for formal occasions.', 'Black high waist palazzo', 380000.00, NULL, NULL, NULL, 180000.00, 'BPP-PLZ-001', 0.50, 1, 1, 'Black Palazzo Pants', 'Black high waist palazzo', 'palazzo,black,wanita', 0, '2026-02-26 17:00:00', '2026-02-26 17:00:00'),
-- Outerwear > Denim Jacket (cat 31)
(51, 'Classic Denim Jacket', 'classic-denim-jacket', 31, 'both', 2, 'Iconic classic denim jacket in medium blue wash. Timeless layering piece.', 'Classic blue denim jacket', 450000.00, 10.00, NULL, NULL, 220000.00, 'CDJ-JKT-001', 0.80, 1, 1, 'Classic Denim Jacket', 'Classic blue denim jacket', 'jacket,denim,unisex,blue', 0, '2026-02-26 17:00:00', '2026-02-26 17:00:00'),
(53, 'Black Denim Jacket', 'black-denim-jacket', 31, 'both', 2, 'Sleek black denim jacket for a modern edge. Layer it over anything.', 'Black denim trucker jacket', 475000.00, NULL, NULL, NULL, 230000.00, 'BDJ-JKT-001', 0.85, 1, 0, 'Black Denim Jacket', 'Black denim trucker jacket', 'jacket,denim,unisex,black', 0, '2026-02-26 17:00:00', '2026-02-26 17:00:00'),
-- Outerwear > Belt & Accessories (cat 32)
(54, 'Brown Leather Belt', 'brown-leather-belt', 32, 'pria', NULL, 'Handcrafted brown leather belt with brushed silver buckle.', 'Brown leather silver buckle belt', 150000.00, NULL, NULL, NULL, 50000.00, 'BLB-ACC-001', 0.20, 1, 0, 'Brown Leather Belt', 'Brown leather silver buckle belt', 'belt,leather,pria,brown', 0, '2026-02-26 17:00:00', '2026-02-26 17:00:00'),
(55, 'Canvas Tote Bag Denim', 'canvas-tote-bag-denim', 32, 'wanita', NULL, 'Stylish denim canvas tote bag. Perfect everyday carry for your essentials.', 'Denim canvas tote bag', 185000.00, NULL, NULL, NULL, 60000.00, 'CTB-ACC-001', 0.30, 1, 0, 'Canvas Tote Bag Denim', 'Denim canvas tote bag', 'bag,tote,denim,wanita', 0, '2026-02-26 17:00:00', '2026-02-26 17:00:00');

-- --------------------------------------------------------

--
-- Struktur dari tabel `product_images`
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
-- Dumping data untuk tabel `product_images`
--

INSERT INTO `product_images` (`id`, `product_id`, `image_url`, `is_primary`, `sort_order`, `alt_text`, `created_at`) VALUES
(1, 2, '/uploads/products/images-1767277696625-664784125.jpg', 1, 0, NULL, '2026-01-01 14:28:16'),
(6, 1, '/uploads/products/images-1772117880235-317542787.jpg', 1, 0, NULL, '2026-02-26 14:58:00'),
(7, 3, '/uploads/products/images-1772118552007-340656127.jpg', 1, 0, NULL, '2026-02-26 15:09:12'),
(8, 32, '/uploads/products/images-1772119153089-266877847.jpg', 1, 0, NULL, '2026-02-26 15:19:13'),
(9, 33, '/uploads/products/images-1772119489698-190424944.jpg', 1, 0, NULL, '2026-02-26 15:24:49'),
(10, 34, '/uploads/products/images-1772119620805-117981484.jpg', 1, 0, NULL, '2026-02-26 15:27:00'),
(11, 35, '/uploads/products/images-1772119749265-950048311.jpg', 1, 0, NULL, '2026-02-26 15:29:09'),
(12, 36, '/uploads/products/images-1772119877587-343802894.jpg', 1, 0, NULL, '2026-02-26 15:31:17'),
(13, 37, '/uploads/products/images-1772120063310-716146482.jpg', 1, 0, NULL, '2026-02-26 15:34:23'),
(14, 38, '/uploads/products/images-1772120307150-922686698.jpg', 1, 0, NULL, '2026-02-26 15:38:27'),
(15, 39, '/uploads/products/images-1772120487183-862857405.jpg', 1, 0, NULL, '2026-02-26 15:41:27'),
(16, 40, '/uploads/products/images-1772120556771-939965576.jpg', 1, 0, NULL, '2026-02-26 15:42:36'),
(17, 41, '/uploads/products/images-1772120800145-873399295.jpg', 1, 0, NULL, '2026-02-26 15:46:40');

-- --------------------------------------------------------

--
-- Struktur dari tabel `product_variants`
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
-- Dumping data untuk tabel `product_variants`
--

INSERT INTO `product_variants` (`id`, `product_id`, `size_id`, `sku_variant`, `additional_price`, `stock_quantity`, `warehouse_id`, `minimum_stock`, `is_active`, `created_at`, `updated_at`, `cost_price`) VALUES
-- Product 1: Classic Blue Slim Jeans (sizes 28-34)
(1, 1, 1, 'CBJ-SLIM-001-28', 0.00, 7, 1, 5, 1, '2025-12-18 17:19:00', '2026-02-25 15:54:49', 0.00),
(2, 1, 2, 'CBJ-SLIM-001-29', 0.00, 13, 1, 5, 1, '2025-12-18 17:19:00', '2025-12-21 07:08:32', 0.00),
(3, 1, 3, 'CBJ-SLIM-001-30', 0.00, 11, 1, 5, 1, '2025-12-18 17:19:00', '2025-12-21 07:08:32', 0.00),
(4, 1, 4, 'CBJ-SLIM-001-31', 0.00, 6, 1, 5, 1, '2025-12-18 17:19:00', '2025-12-21 07:08:32', 0.00),
(5, 1, 5, 'CBJ-SLIM-001-32', 0.00, 11, 1, 5, 1, '2025-12-18 17:19:00', '2025-12-21 07:08:32', 0.00),
(6, 1, 6, 'CBJ-SLIM-001-33', 0.00, 7, 1, 5, 1, '2025-12-18 17:19:00', '2025-12-21 07:08:32', 0.00),
(7, 1, 7, 'CBJ-SLIM-001-34', 0.00, 15, 1, 5, 1, '2025-12-18 17:19:01', '2025-12-21 07:08:32', 0.00),
-- Product 2: Black Regular Jeans (sizes 28-34)
(8, 2, 1, 'BRJ-REG-001-28', 0.00, 9, 1, 5, 1, '2025-12-18 17:19:01', '2026-02-25 16:25:29', 0.00),
(9, 2, 2, 'BRJ-REG-001-29', 0.00, 23, 1, 5, 1, '2025-12-18 17:19:01', '2025-12-21 07:08:32', 0.00),
(10, 2, 3, 'BRJ-REG-001-30', 0.00, 15, 1, 5, 1, '2025-12-18 17:19:01', '2025-12-21 07:08:32', 0.00),
(11, 2, 4, 'BRJ-REG-001-31', 0.00, 16, 1, 5, 1, '2025-12-18 17:19:01', '2025-12-21 07:08:32', 0.00),
(12, 2, 5, 'BRJ-REG-001-32', 0.00, 8, 1, 5, 1, '2025-12-18 17:19:01', '2025-12-21 07:08:32', 0.00),
(13, 2, 6, 'BRJ-REG-001-33', 0.00, 18, 1, 5, 1, '2025-12-18 17:19:01', '2025-12-21 07:08:32', 0.00),
(43, 2, 15, 'JEAN', 600000.00, 10, 1, 5, 1, '2025-12-23 06:21:51', '2025-12-23 06:21:51', 250000.00),
(57, 2, 7, 'BRJ-REG-001-34', 0.00, 14, 1, 5, 1, '2025-12-23 15:30:03', '2025-12-23 15:30:03', 0.00),
-- Product 3: Light Wash Boyfriend Jeans (sizes 28-34)
(15, 3, 1, 'LWJ-LOOSE-001-28', 0.00, 18, 1, 5, 1, '2025-12-18 17:19:01', '2025-12-21 07:08:32', 0.00),
(16, 3, 2, 'LWJ-LOOSE-001-29', 0.00, 17, 1, 5, 1, '2025-12-18 17:19:01', '2025-12-21 07:08:32', 0.00),
(17, 3, 3, 'LWJ-LOOSE-001-30', 0.00, 7, 1, 5, 1, '2025-12-18 17:19:01', '2025-12-21 07:08:32', 0.00),
(18, 3, 4, 'LWJ-LOOSE-001-31', 0.00, 13, 1, 5, 1, '2025-12-18 17:19:01', '2025-12-21 07:08:32', 0.00),
(19, 3, 5, 'LWJ-LOOSE-001-32', 0.00, 19, 1, 5, 1, '2025-12-18 17:19:01', '2025-12-21 07:08:32', 0.00),
(20, 3, 6, 'LWJ-LOOSE-001-33', 0.00, 11, 1, 5, 1, '2025-12-18 17:19:01', '2025-12-21 07:08:32', 0.00),
(21, 3, 7, 'LWJ-LOOSE-001-34', 0.00, 12, 1, 5, 1, '2025-12-18 17:19:01', '2025-12-21 07:08:32', 0.00),
-- Product 28: Denim Short Pants (size 29)
(87, 28, 2, 'JEAN00012', 100000.00, 8, 1, 5, 1, '2026-01-11 15:22:53', '2026-02-25 15:23:01', 2000.00),
-- Product 42: Dark Wash High Waist Jeans (sizes 28-32)
(88, 42, 1, 'DWH-HW-001-28', 0.00, 10, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 170000.00),
(89, 42, 2, 'DWH-HW-001-29', 0.00, 15, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 170000.00),
(90, 42, 3, 'DWH-HW-001-30', 0.00, 12, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 170000.00),
(91, 42, 4, 'DWH-HW-001-31', 0.00, 8, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 170000.00),
(92, 42, 5, 'DWH-HW-001-32', 0.00, 6, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 170000.00),
-- Product 43: Grey Distressed Ripped Jeans (sizes 29-33)
(93, 43, 2, 'GDR-RIP-001-29', 0.00, 12, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 140000.00),
(94, 43, 3, 'GDR-RIP-001-30', 0.00, 18, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 140000.00),
(95, 43, 4, 'GDR-RIP-001-31', 0.00, 14, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 140000.00),
(96, 43, 5, 'GDR-RIP-001-32', 0.00, 9, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 140000.00),
(97, 43, 6, 'GDR-RIP-001-33', 0.00, 7, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 140000.00),
-- Product 44: Black Mom Jeans (sizes 28-32)
(98, 44, 1, 'BMJ-MOM-001-28', 0.00, 11, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 150000.00),
(99, 44, 2, 'BMJ-MOM-001-29', 0.00, 16, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 150000.00),
(100, 44, 3, 'BMJ-MOM-001-30', 0.00, 20, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 150000.00),
(101, 44, 4, 'BMJ-MOM-001-31', 0.00, 9, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 150000.00),
(102, 44, 5, 'BMJ-MOM-001-32', 0.00, 5, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 150000.00),
-- Product 45: Grey Flare Jeans (sizes 28-32)
(103, 45, 1, 'GFJ-FLR-001-28', 0.00, 8, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 165000.00),
(104, 45, 2, 'GFJ-FLR-001-29', 0.00, 14, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 165000.00),
(105, 45, 3, 'GFJ-FLR-001-30', 0.00, 17, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 165000.00),
(106, 45, 4, 'GFJ-FLR-001-31', 0.00, 10, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 165000.00),
(107, 45, 5, 'GFJ-FLR-001-32', 0.00, 6, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 165000.00),
-- Product 46: Navy Cargo Pants (sizes 30-34)
(108, 46, 3, 'NCP-CRG-001-30', 0.00, 20, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 130000.00),
(109, 46, 4, 'NCP-CRG-001-31', 0.00, 15, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 130000.00),
(110, 46, 5, 'NCP-CRG-001-32', 0.00, 18, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 130000.00),
(111, 46, 6, 'NCP-CRG-001-33', 0.00, 10, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 130000.00),
(112, 46, 7, 'NCP-CRG-001-34', 0.00, 7, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 130000.00),
-- Product 47: Khaki Chino Pants (sizes 29-33)
(113, 47, 2, 'KCP-CHN-001-29', 0.00, 12, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 120000.00),
(114, 47, 3, 'KCP-CHN-001-30', 0.00, 20, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 120000.00),
(115, 47, 4, 'KCP-CHN-001-31', 0.00, 15, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 120000.00),
(116, 47, 5, 'KCP-CHN-001-32', 0.00, 11, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 120000.00),
(117, 47, 6, 'KCP-CHN-001-33', 0.00, 8, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 120000.00),
-- Product 48: White Palazzo Pants (sizes 28-32)
(118, 48, 1, 'WPP-WL-001-28', 0.00, 9, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 140000.00),
(119, 48, 2, 'WPP-WL-001-29', 0.00, 13, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 140000.00),
(120, 48, 3, 'WPP-WL-001-30', 0.00, 16, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 140000.00),
(121, 48, 4, 'WPP-WL-001-31', 0.00, 10, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 140000.00),
(122, 48, 5, 'WPP-WL-001-32', 0.00, 7, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 140000.00),
-- Product 49: Black Boyfriend Jeans (sizes 28-32)
(123, 49, 1, 'BBJ-BF-001-28', 0.00, 10, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 160000.00),
(124, 49, 2, 'BBJ-BF-001-29', 0.00, 14, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 160000.00),
(125, 49, 3, 'BBJ-BF-001-30', 0.00, 18, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 160000.00),
(126, 49, 4, 'BBJ-BF-001-31', 0.00, 11, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 160000.00),
(127, 49, 5, 'BBJ-BF-001-32', 0.00, 6, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 160000.00),
-- Product 50: Vintage Straight Jeans (sizes 30-34)
(128, 50, 3, 'VSJ-STR-001-30', 0.00, 15, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 155000.00),
(129, 50, 4, 'VSJ-STR-001-31', 0.00, 12, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 155000.00),
(130, 50, 5, 'VSJ-STR-001-32', 0.00, 18, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 155000.00),
(131, 50, 6, 'VSJ-STR-001-33', 0.00, 10, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 155000.00),
(132, 50, 7, 'VSJ-STR-001-34', 0.00, 8, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 155000.00),
-- Product 51: Classic Denim Jacket (sizes S-XL)
(133, 51, 11, 'CDJ-JKT-001-S', 0.00, 10, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 220000.00),
(134, 51, 12, 'CDJ-JKT-001-M', 0.00, 18, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 220000.00),
(135, 51, 13, 'CDJ-JKT-001-L', 0.00, 15, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 220000.00),
(136, 51, 14, 'CDJ-JKT-001-XL', 0.00, 8, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 220000.00),
-- Product 52: Black Palazzo Pants (sizes 28-32)
(137, 52, 1, 'BPP-PLZ-001-28', 0.00, 7, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 180000.00),
(138, 52, 2, 'BPP-PLZ-001-29', 0.00, 12, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 180000.00),
(139, 52, 3, 'BPP-PLZ-001-30', 0.00, 15, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 180000.00),
(140, 52, 4, 'BPP-PLZ-001-31', 0.00, 9, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 180000.00),
(141, 52, 5, 'BPP-PLZ-001-32', 0.00, 5, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 180000.00),
-- Product 53: Black Denim Jacket (sizes S-XL)
(142, 53, 11, 'BDJ-JKT-001-S', 0.00, 8, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 230000.00),
(143, 53, 12, 'BDJ-JKT-001-M', 0.00, 14, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 230000.00),
(144, 53, 13, 'BDJ-JKT-001-L', 0.00, 12, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 230000.00),
(145, 53, 14, 'BDJ-JKT-001-XL', 0.00, 6, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 230000.00),
-- Product 54: Brown Leather Belt (sizes S-XL)
(146, 54, 11, 'BLB-ACC-001-S', 0.00, 20, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 50000.00),
(147, 54, 12, 'BLB-ACC-001-M', 0.00, 25, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 50000.00),
(148, 54, 13, 'BLB-ACC-001-L', 0.00, 15, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 50000.00),
(149, 54, 14, 'BLB-ACC-001-XL', 0.00, 10, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 50000.00),
-- Product 55: Canvas Tote Bag (one size = M)
(150, 55, 12, 'CTB-ACC-001-M', 0.00, 30, 1, 5, 1, '2026-02-26 17:00:00', '2026-02-26 17:00:00', 60000.00),
-- Product 27: Blue Ripped Jeans (sizes 29-33)
(151, 27, 2, 'BR121-29', 0.00, 10, 1, 5, 1, '2026-02-26 17:30:00', '2026-02-26 17:30:00', 120000.00),
(152, 27, 3, 'BR121-30', 0.00, 15, 1, 5, 1, '2026-02-26 17:30:00', '2026-02-26 17:30:00', 120000.00),
(153, 27, 4, 'BR121-31', 0.00, 12, 1, 5, 1, '2026-02-26 17:30:00', '2026-02-26 17:30:00', 120000.00),
(154, 27, 5, 'BR121-32', 0.00, 8, 1, 5, 1, '2026-02-26 17:30:00', '2026-02-26 17:30:00', 120000.00),
(155, 27, 6, 'BR121-33', 0.00, 6, 1, 5, 1, '2026-02-26 17:30:00', '2026-02-26 17:30:00', 120000.00),
-- Product 32: Beige Jogger Pants (sizes S-XL)
(156, 32, 11, 'BJP-JOG-001-S', 0.00, 12, 1, 5, 1, '2026-02-26 17:30:00', '2026-02-26 17:30:00', 100000.00),
(157, 32, 12, 'BJP-JOG-001-M', 0.00, 20, 1, 5, 1, '2026-02-26 17:30:00', '2026-02-26 17:30:00', 100000.00),
(158, 32, 13, 'BJP-JOG-001-L', 0.00, 16, 1, 5, 1, '2026-02-26 17:30:00', '2026-02-26 17:30:00', 100000.00),
(159, 32, 14, 'BJP-JOG-001-XL', 0.00, 9, 1, 5, 1, '2026-02-26 17:30:00', '2026-02-26 17:30:00', 100000.00),
-- Product 33: Blue A-Line Flare Pants (sizes 28-32)
(160, 33, 1, 'BAF-FLR-001-28', 0.00, 8, 1, 5, 1, '2026-02-26 17:30:00', '2026-02-26 17:30:00', 150000.00),
(161, 33, 2, 'BAF-FLR-001-29', 0.00, 14, 1, 5, 1, '2026-02-26 17:30:00', '2026-02-26 17:30:00', 150000.00),
(162, 33, 3, 'BAF-FLR-001-30', 0.00, 18, 1, 5, 1, '2026-02-26 17:30:00', '2026-02-26 17:30:00', 150000.00),
(163, 33, 4, 'BAF-FLR-001-31', 0.00, 11, 1, 5, 1, '2026-02-26 17:30:00', '2026-02-26 17:30:00', 150000.00),
(164, 33, 5, 'BAF-FLR-001-32', 0.00, 7, 1, 5, 1, '2026-02-26 17:30:00', '2026-02-26 17:30:00', 150000.00),
-- Product 34: Black Chino Pants (sizes 29-34)
(165, 34, 2, 'BCP-CHN-001-29', 0.00, 10, 1, 5, 1, '2026-02-26 17:30:00', '2026-02-26 17:30:00', 100000.00),
(166, 34, 3, 'BCP-CHN-001-30', 0.00, 18, 1, 5, 1, '2026-02-26 17:30:00', '2026-02-26 17:30:00', 100000.00),
(167, 34, 4, 'BCP-CHN-001-31', 0.00, 14, 1, 5, 1, '2026-02-26 17:30:00', '2026-02-26 17:30:00', 100000.00),
(168, 34, 5, 'BCP-CHN-001-32', 0.00, 11, 1, 5, 1, '2026-02-26 17:30:00', '2026-02-26 17:30:00', 100000.00),
(169, 34, 6, 'BCP-CHN-001-33', 0.00, 7, 1, 5, 1, '2026-02-26 17:30:00', '2026-02-26 17:30:00', 100000.00),
(170, 34, 7, 'BCP-CHN-001-34', 0.00, 5, 1, 5, 1, '2026-02-26 17:30:00', '2026-02-26 17:30:00', 100000.00),
-- Product 35: Indigo Slim Jeans (sizes 28-33)
(171, 35, 1, 'ISJ-SLIM-001-28', 0.00, 9, 1, 5, 1, '2026-02-26 17:30:00', '2026-02-26 17:30:00', 100000.00),
(172, 35, 2, 'ISJ-SLIM-001-29', 0.00, 16, 1, 5, 1, '2026-02-26 17:30:00', '2026-02-26 17:30:00', 100000.00),
(173, 35, 3, 'ISJ-SLIM-001-30', 0.00, 20, 1, 5, 1, '2026-02-26 17:30:00', '2026-02-26 17:30:00', 100000.00),
(174, 35, 4, 'ISJ-SLIM-001-31', 0.00, 13, 1, 5, 1, '2026-02-26 17:30:00', '2026-02-26 17:30:00', 100000.00),
(175, 35, 5, 'ISJ-SLIM-001-32', 0.00, 8, 1, 5, 1, '2026-02-26 17:30:00', '2026-02-26 17:30:00', 100000.00),
(176, 35, 6, 'ISJ-SLIM-001-33', 0.00, 5, 1, 5, 1, '2026-02-26 17:30:00', '2026-02-26 17:30:00', 100000.00),
-- Product 36: Black Leather Mom Pants (sizes 28-32)
(177, 36, 1, 'BLP-MOM-001-28', 0.00, 7, 1, 5, 1, '2026-02-26 17:30:00', '2026-02-26 17:30:00', 100000.00),
(178, 36, 2, 'BLP-MOM-001-29', 0.00, 12, 1, 5, 1, '2026-02-26 17:30:00', '2026-02-26 17:30:00', 100000.00),
(179, 36, 3, 'BLP-MOM-001-30', 0.00, 15, 1, 5, 1, '2026-02-26 17:30:00', '2026-02-26 17:30:00', 100000.00),
(180, 36, 4, 'BLP-MOM-001-31', 0.00, 10, 1, 5, 1, '2026-02-26 17:30:00', '2026-02-26 17:30:00', 100000.00),
(181, 36, 5, 'BLP-MOM-001-32', 0.00, 6, 1, 5, 1, '2026-02-26 17:30:00', '2026-02-26 17:30:00', 100000.00),
-- Product 37: Beige Short Pants (sizes 29-33)
(182, 37, 2, 'BSP-SHR-001-29', 0.00, 14, 1, 5, 1, '2026-02-26 17:30:00', '2026-02-26 17:30:00', 50000.00),
(183, 37, 3, 'BSP-SHR-001-30', 0.00, 20, 1, 5, 1, '2026-02-26 17:30:00', '2026-02-26 17:30:00', 50000.00),
(184, 37, 4, 'BSP-SHR-001-31', 0.00, 16, 1, 5, 1, '2026-02-26 17:30:00', '2026-02-26 17:30:00', 50000.00),
(185, 37, 5, 'BSP-SHR-001-32', 0.00, 10, 1, 5, 1, '2026-02-26 17:30:00', '2026-02-26 17:30:00', 50000.00),
(186, 37, 6, 'BSP-SHR-001-33', 0.00, 7, 1, 5, 1, '2026-02-26 17:30:00', '2026-02-26 17:30:00', 50000.00),
-- Product 38: Black Skinny Jeans (sizes 28-33)
(187, 38, 1, 'BSJ-SKN-001-28', 0.00, 8, 1, 5, 1, '2026-02-26 17:30:00', '2026-02-26 17:30:00', 100000.00),
(188, 38, 2, 'BSJ-SKN-001-29', 0.00, 15, 1, 5, 1, '2026-02-26 17:30:00', '2026-02-26 17:30:00', 100000.00),
(189, 38, 3, 'BSJ-SKN-001-30', 0.00, 22, 1, 5, 1, '2026-02-26 17:30:00', '2026-02-26 17:30:00', 100000.00),
(190, 38, 4, 'BSJ-SKN-001-31', 0.00, 14, 1, 5, 1, '2026-02-26 17:30:00', '2026-02-26 17:30:00', 100000.00),
(191, 38, 5, 'BSJ-SKN-001-32', 0.00, 9, 1, 5, 1, '2026-02-26 17:30:00', '2026-02-26 17:30:00', 100000.00),
(192, 38, 6, 'BSJ-SKN-001-33', 0.00, 6, 1, 5, 1, '2026-02-26 17:30:00', '2026-02-26 17:30:00', 100000.00),
-- Product 39: White Culotte Pants (sizes 28-32)
(193, 39, 1, 'WCP-CUL-001-28', 0.00, 7, 1, 5, 1, '2026-02-26 17:30:00', '2026-02-26 17:30:00', 100000.00),
(194, 39, 2, 'WCP-CUL-001-29', 0.00, 13, 1, 5, 1, '2026-02-26 17:30:00', '2026-02-26 17:30:00', 100000.00),
(195, 39, 3, 'WCP-CUL-001-30', 0.00, 17, 1, 5, 1, '2026-02-26 17:30:00', '2026-02-26 17:30:00', 100000.00),
(196, 39, 4, 'WCP-CUL-001-31', 0.00, 10, 1, 5, 1, '2026-02-26 17:30:00', '2026-02-26 17:30:00', 100000.00),
(197, 39, 5, 'WCP-CUL-001-32', 0.00, 6, 1, 5, 1, '2026-02-26 17:30:00', '2026-02-26 17:30:00', 100000.00),
-- Product 40: Olive Jogger Pants (sizes S-XL)
(198, 40, 11, 'OJP-JOG-001-S', 0.00, 10, 1, 5, 1, '2026-02-26 17:30:00', '2026-02-26 17:30:00', 99998.00),
(199, 40, 12, 'OJP-JOG-001-M', 0.00, 18, 1, 5, 1, '2026-02-26 17:30:00', '2026-02-26 17:30:00', 99998.00),
(200, 40, 13, 'OJP-JOG-001-L', 0.00, 14, 1, 5, 1, '2026-02-26 17:30:00', '2026-02-26 17:30:00', 99998.00),
(201, 40, 14, 'OJP-JOG-001-XL', 0.00, 8, 1, 5, 1, '2026-02-26 17:30:00', '2026-02-26 17:30:00', 99998.00),
-- Product 41: White Beige Short Pants (sizes 28-32)
(202, 41, 1, 'WBS-SHR-001-28', 0.00, 11, 1, 5, 1, '2026-02-26 17:30:00', '2026-02-26 17:30:00', 50000.00),
(203, 41, 2, 'WBS-SHR-001-29', 0.00, 16, 1, 5, 1, '2026-02-26 17:30:00', '2026-02-26 17:30:00', 50000.00),
(204, 41, 3, 'WBS-SHR-001-30', 0.00, 20, 1, 5, 1, '2026-02-26 17:30:00', '2026-02-26 17:30:00', 50000.00),
(205, 41, 4, 'WBS-SHR-001-31', 0.00, 13, 1, 5, 1, '2026-02-26 17:30:00', '2026-02-26 17:30:00', 50000.00),
(206, 41, 5, 'WBS-SHR-001-32', 0.00, 8, 1, 5, 1, '2026-02-26 17:30:00', '2026-02-26 17:30:00', 50000.00);

-- --------------------------------------------------------

--
-- Struktur dari tabel `roles`
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
-- Dumping data untuk tabel `roles`
--

INSERT INTO `roles` (`id`, `name`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Superadmin', 'Role dengan akses penuh ke semua fitur sistem', 1, '2026-01-25 09:07:17', '2026-01-25 09:09:19'),
(2, 'Admin Stok', 'Admin untuk pengelolaan stok, gudang, produk, dan pesanan', 1, '2026-02-25 15:31:43', '2026-02-25 15:31:43');

-- --------------------------------------------------------

--
-- Struktur dari tabel `role_permissions`
--

CREATE TABLE `role_permissions` (
  `id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `role_permissions`
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
-- Struktur dari tabel `settings`
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
-- Dumping data untuk tabel `settings`
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
(46, 'social_youtube', '', 'text', 'YouTube URL', 1, 'social', '2026-01-26 14:08:43', '2026-01-26 14:08:43');

-- --------------------------------------------------------

--
-- Struktur dari tabel `shipping_costs`
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
-- Dumping data untuk tabel `shipping_costs`
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
-- Struktur dari tabel `sizes`
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
-- Dumping data untuk tabel `sizes`
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
-- Struktur dari tabel `size_charts`
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
-- Struktur dari tabel `stocks`
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
-- Struktur dari tabel `stock_movements`
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
-- Struktur dari tabel `stock_opnames`
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
-- Struktur dari tabel `stock_opname_details`
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
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  `role` enum('admin','admin_stok','member','guest') DEFAULT 'guest',
  `is_active` tinyint(1) DEFAULT 1,
  `email_verified` tinyint(1) DEFAULT 0,
  `member_discount` decimal(5,2) DEFAULT 0.00,
  `last_login` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `full_name`, `phone`, `profile_picture`, `role`, `is_active`, `email_verified`, `member_discount`, `last_login`, `created_at`, `updated_at`) VALUES
(1, 'admin@marketplacejeans.com', '$2a$10$.HksG3CC6gqsrhQwah.m4usRSH6fhXU7nF4gh2Li4mqsPF8haUUbu', 'Admin User', '08123456789', NULL, 'admin', 1, 0, 0.00, NULL, '2025-12-18 17:19:00', '2025-12-18 17:19:00'),
(2, 'member@test.com', '$2a$10$DoGYXBhz5aTh6t5HIqQYjOe/t8PBQa13JUDn6UoVlUzxwTon.K1pq', 'Member Test', '08123456788', NULL, 'member', 1, 0, 10.00, NULL, '2025-12-18 17:19:00', '2025-12-18 17:19:00'),
(9, 'roy@mail.com', '$2a$10$T1Y9NN4A1/GJWJopOcZM2.eqtSMAlzMeTVrAFvwGszuInvvlMPoBC', 'Roy', NULL, NULL, 'member', 1, 0, 10.00, NULL, '2026-02-07 12:31:45', '2026-02-07 12:31:45');

-- --------------------------------------------------------

--
-- Struktur dari tabel `user_addresses`
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
-- Dumping data untuk tabel `user_addresses`
--

INSERT INTO `user_addresses` (`id`, `user_id`, `address_label`, `recipient_name`, `phone`, `address`, `city`, `province`, `postal_code`, `country`, `is_default`, `created_at`, `updated_at`) VALUES
(1, 1, 'Rumah', 'Admin User', '08123456789', 'Rumah 123', 'Surabaya', 'Jawa Timur', '60111', 'Indonesia', 1, '2026-02-25 15:54:49', '2026-02-25 15:54:49');

-- --------------------------------------------------------

--
-- Struktur dari tabel `user_roles`
--

CREATE TABLE `user_roles` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `assigned_by` int(11) DEFAULT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `user_roles`
--

INSERT INTO `user_roles` (`id`, `user_id`, `role_id`, `assigned_by`, `assigned_at`) VALUES
(1, 1, 1, 1, '2026-02-25 15:32:44');

-- --------------------------------------------------------

--
-- Struktur dari tabel `warehouses`
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
-- Dumping data untuk tabel `warehouses`
--

INSERT INTO `warehouses` (`id`, `name`, `code`, `location`, `address`, `city`, `province`, `phone`, `email`, `is_main`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Gudang Utama', 'GU', 'Indonesia', '-', 'Surabaya', 'Jawa Timur', '08123123123', NULL, 1, 1, '2025-12-21 07:06:36', '2025-12-21 07:06:36'),
(2, 'Jakarta Warehouse', 'JKT', 'Jakarta Selatan', 'Jl. Sudirman No. 123', 'Jakarta Selatan', 'DKI Jakarta', '021-5551234', 'wh-jakarta@jeans.com', 0, 1, '2025-12-21 07:36:02', '2025-12-21 07:36:02'),
(3, 'Bandung Warehouse', 'BDG', 'Bandung', 'Jl. Braga No. 88', 'Bandung', 'Jawa Barat', '022-4561234', 'wh-bandung@jeans.com', 0, 1, '2025-12-21 07:36:02', '2025-12-21 07:36:02'),
(4, 'Surabaya Warehouse', 'SBY', 'Surabaya', 'Jl. Tunjungan No. 45', 'Surabaya', 'Jawa Timur', '031-7891234', 'wh-surabaya@jeans.com', 0, 1, '2025-12-21 07:36:02', '2025-12-21 07:36:02');

-- --------------------------------------------------------

--
-- Struktur dari tabel `wishlists`
--

CREATE TABLE `wishlists` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `wishlists`
--

INSERT INTO `wishlists` (`id`, `user_id`, `product_id`, `created_at`) VALUES
(1, 1, 28, '2026-01-11 15:23:32');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_entity` (`entity_type`,`entity_id`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indeks untuk tabel `banners`
--
ALTER TABLE `banners`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_position` (`position`),
  ADD KEY `idx_active` (`is_active`),
  ADD KEY `idx_dates` (`start_date`,`end_date`);

--
-- Indeks untuk tabel `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_session` (`session_id`);

--
-- Indeks untuk tabel `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_cart_item` (`cart_id`,`product_variant_id`),
  ADD KEY `product_variant_id` (`product_variant_id`),
  ADD KEY `idx_cart` (`cart_id`);

--
-- Indeks untuk tabel `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_slug` (`slug`),
  ADD KEY `idx_parent_id` (`parent_id`),
  ADD KEY `idx_categories_gender` (`gender`);

--
-- Indeks untuk tabel `cities`
--
ALTER TABLE `cities`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_city_province` (`name`,`province`),
  ADD KEY `idx_name` (`name`),
  ADD KEY `idx_province` (`province`),
  ADD KEY `idx_active` (`is_active`);

--
-- Indeks untuk tabel `content_settings`
--
ALTER TABLE `content_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `section_key` (`section_key`),
  ADD KEY `updated_by` (`updated_by`),
  ADD KEY `idx_section_key` (`section_key`),
  ADD KEY `idx_active` (`is_active`);

--
-- Indeks untuk tabel `coupons`
--
ALTER TABLE `coupons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_code` (`code`),
  ADD KEY `idx_active` (`is_active`),
  ADD KEY `idx_dates` (`start_date`,`end_date`);

--
-- Indeks untuk tabel `coupon_usages`
--
ALTER TABLE `coupon_usages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_coupon` (`coupon_id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_order` (`order_id`);

--
-- Indeks untuk tabel `discounts`
--
ALTER TABLE `discounts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_code` (`code`),
  ADD KEY `idx_type` (`type`),
  ADD KEY `idx_dates` (`start_date`,`end_date`);

--
-- Indeks untuk tabel `exchange_rates`
--
ALTER TABLE `exchange_rates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_currency_pair` (`currency_from`,`currency_to`),
  ADD KEY `updated_by` (`updated_by`),
  ADD KEY `idx_active` (`is_active`);

--
-- Indeks untuk tabel `exchange_rate_logs`
--
ALTER TABLE `exchange_rate_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `changed_by` (`changed_by`),
  ADD KEY `idx_exchange_rate` (`exchange_rate_id`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indeks untuk tabel `fittings`
--
ALTER TABLE `fittings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_slug` (`slug`);

--
-- Indeks untuk tabel `guest_order_details`
--
ALTER TABLE `guest_order_details`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_id` (`order_id`),
  ADD KEY `idx_order` (`order_id`);

--
-- Indeks untuk tabel `inventory_movements`
--
ALTER TABLE `inventory_movements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_variant` (`product_variant_id`),
  ADD KEY `idx_type` (`type`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indeks untuk tabel `offices`
--
ALTER TABLE `offices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_code` (`code`),
  ADD KEY `idx_active` (`is_active`);

--
-- Indeks untuk tabel `orders`
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
-- Indeks untuk tabel `order_discounts`
--
ALTER TABLE `order_discounts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_order` (`order_id`);

--
-- Indeks untuk tabel `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_variant_id` (`product_variant_id`),
  ADD KEY `idx_order` (`order_id`);

--
-- Indeks untuk tabel `order_shipping`
--
ALTER TABLE `order_shipping`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_id` (`order_id`),
  ADD KEY `idx_order` (`order_id`),
  ADD KEY `idx_tracking` (`tracking_number`);

--
-- Indeks untuk tabel `order_shipping_history`
--
ALTER TABLE `order_shipping_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_order` (`order_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indeks untuk tabel `order_taxes`
--
ALTER TABLE `order_taxes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_order` (`order_id`);

--
-- Indeks untuk tabel `order_tracking`
--
ALTER TABLE `order_tracking`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_order` (`order_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indeks untuk tabel `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `transaction_id` (`transaction_id`),
  ADD KEY `idx_order` (`order_id`),
  ADD KEY `idx_transaction` (`transaction_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indeks untuk tabel `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `idx_resource` (`resource`),
  ADD KEY `idx_action` (`action`);

--
-- Indeks untuk tabel `positions`
--
ALTER TABLE `positions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_office` (`office_id`),
  ADD KEY `idx_parent` (`parent_id`),
  ADD KEY `idx_active` (`is_active`);

--
-- Indeks untuk tabel `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD UNIQUE KEY `sku` (`sku`),
  ADD KEY `idx_slug` (`slug`),
  ADD KEY `idx_category` (`category_id`),
  ADD KEY `idx_fitting` (`fitting_id`),
  ADD KEY `idx_sku` (`sku`),
  ADD KEY `idx_products_gender` (`gender`);
ALTER TABLE `products` ADD FULLTEXT KEY `idx_search` (`name`,`description`);

--
-- Indeks untuk tabel `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_product` (`product_id`);

--
-- Indeks untuk tabel `product_variants`
--
ALTER TABLE `product_variants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sku_variant` (`sku_variant`),
  ADD UNIQUE KEY `unique_variant` (`product_id`,`size_id`),
  ADD KEY `idx_product` (`product_id`),
  ADD KEY `idx_size` (`size_id`),
  ADD KEY `idx_sku` (`sku_variant`);

--
-- Indeks untuk tabel `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `idx_name` (`name`);

--
-- Indeks untuk tabel `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_role_permission` (`role_id`,`permission_id`),
  ADD KEY `idx_role` (`role_id`),
  ADD KEY `idx_permission` (`permission_id`);

--
-- Indeks untuk tabel `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`),
  ADD KEY `idx_key` (`setting_key`);

--
-- Indeks untuk tabel `shipping_costs`
--
ALTER TABLE `shipping_costs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_shipping` (`city_id`,`warehouse_id`,`courier`,`service`),
  ADD KEY `idx_city` (`city_id`),
  ADD KEY `idx_warehouse` (`warehouse_id`),
  ADD KEY `idx_courier` (`courier`),
  ADD KEY `idx_active` (`is_active`);

--
-- Indeks untuk tabel `sizes`
--
ALTER TABLE `sizes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `idx_name` (`name`);

--
-- Indeks untuk tabel `size_charts`
--
ALTER TABLE `size_charts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_size_chart` (`size_id`,`category_id`,`fitting_id`),
  ADD KEY `idx_size` (`size_id`),
  ADD KEY `idx_category` (`category_id`),
  ADD KEY `idx_fitting` (`fitting_id`);

--
-- Indeks untuk tabel `stocks`
--
ALTER TABLE `stocks`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_stock` (`warehouse_id`,`product_id`,`fitting_id`,`size_id`),
  ADD KEY `idx_warehouse` (`warehouse_id`),
  ADD KEY `idx_product` (`product_id`),
  ADD KEY `idx_fitting` (`fitting_id`),
  ADD KEY `idx_size` (`size_id`);

--
-- Indeks untuk tabel `stock_movements`
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
-- Indeks untuk tabel `stock_opnames`
--
ALTER TABLE `stock_opnames`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_warehouse` (`warehouse_id`),
  ADD KEY `idx_date` (`opname_date`),
  ADD KEY `idx_status` (`status`);

--
-- Indeks untuk tabel `stock_opname_details`
--
ALTER TABLE `stock_opname_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fitting_id` (`fitting_id`),
  ADD KEY `size_id` (`size_id`),
  ADD KEY `idx_opname` (`opname_id`),
  ADD KEY `idx_product` (`product_id`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`);

--
-- Indeks untuk tabel `user_addresses`
--
ALTER TABLE `user_addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Indeks untuk tabel `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_role` (`user_id`,`role_id`),
  ADD KEY `assigned_by` (`assigned_by`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_role` (`role_id`);

--
-- Indeks untuk tabel `warehouses`
--
ALTER TABLE `warehouses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_code` (`code`),
  ADD KEY `idx_active` (`is_active`);

--
-- Indeks untuk tabel `wishlists`
--
ALTER TABLE `wishlists`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_wishlist` (`user_id`,`product_id`),
  ADD KEY `product_id` (`product_id`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=124;

--
-- AUTO_INCREMENT untuk tabel `banners`
--
ALTER TABLE `banners`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `carts`
--
ALTER TABLE `carts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT untuk tabel `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT untuk tabel `cities`
--
ALTER TABLE `cities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT untuk tabel `content_settings`
--
ALTER TABLE `content_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT untuk tabel `coupons`
--
ALTER TABLE `coupons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `coupon_usages`
--
ALTER TABLE `coupon_usages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `discounts`
--
ALTER TABLE `discounts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT untuk tabel `exchange_rates`
--
ALTER TABLE `exchange_rates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `exchange_rate_logs`
--
ALTER TABLE `exchange_rate_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `fittings`
--
ALTER TABLE `fittings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT untuk tabel `guest_order_details`
--
ALTER TABLE `guest_order_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `inventory_movements`
--
ALTER TABLE `inventory_movements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT untuk tabel `offices`
--
ALTER TABLE `offices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT untuk tabel `order_discounts`
--
ALTER TABLE `order_discounts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT untuk tabel `order_shipping`
--
ALTER TABLE `order_shipping`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT untuk tabel `order_shipping_history`
--
ALTER TABLE `order_shipping_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT untuk tabel `order_taxes`
--
ALTER TABLE `order_taxes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `order_tracking`
--
ALTER TABLE `order_tracking`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=80;

--
-- AUTO_INCREMENT untuk tabel `positions`
--
ALTER TABLE `positions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- AUTO_INCREMENT untuk tabel `product_images`
--
ALTER TABLE `product_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT untuk tabel `product_variants`
--
ALTER TABLE `product_variants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=207;

--
-- AUTO_INCREMENT untuk tabel `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `role_permissions`
--
ALTER TABLE `role_permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=165;

--
-- AUTO_INCREMENT untuk tabel `settings`
--
ALTER TABLE `settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT untuk tabel `shipping_costs`
--
ALTER TABLE `shipping_costs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=58;

--
-- AUTO_INCREMENT untuk tabel `sizes`
--
ALTER TABLE `sizes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;

--
-- AUTO_INCREMENT untuk tabel `size_charts`
--
ALTER TABLE `size_charts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `stocks`
--
ALTER TABLE `stocks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `stock_movements`
--
ALTER TABLE `stock_movements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `stock_opnames`
--
ALTER TABLE `stock_opnames`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `stock_opname_details`
--
ALTER TABLE `stock_opname_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT untuk tabel `user_addresses`
--
ALTER TABLE `user_addresses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `user_roles`
--
ALTER TABLE `user_roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `warehouses`
--
ALTER TABLE `warehouses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT untuk tabel `wishlists`
--
ALTER TABLE `wishlists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `carts`
--
ALTER TABLE `carts`
  ADD CONSTRAINT `carts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `content_settings`
--
ALTER TABLE `content_settings`
  ADD CONSTRAINT `content_settings_ibfk_1` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `exchange_rates`
--
ALTER TABLE `exchange_rates`
  ADD CONSTRAINT `exchange_rates_ibfk_1` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `exchange_rate_logs`
--
ALTER TABLE `exchange_rate_logs`
  ADD CONSTRAINT `exchange_rate_logs_ibfk_1` FOREIGN KEY (`exchange_rate_id`) REFERENCES `exchange_rates` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `exchange_rate_logs_ibfk_2` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `guest_order_details`
--
ALTER TABLE `guest_order_details`
  ADD CONSTRAINT `guest_order_details_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `inventory_movements`
--
ALTER TABLE `inventory_movements`
  ADD CONSTRAINT `inventory_movements_ibfk_1` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `inventory_movements_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `order_discounts`
--
ALTER TABLE `order_discounts`
  ADD CONSTRAINT `order_discounts_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants` (`id`);

--
-- Ketidakleluasaan untuk tabel `order_shipping`
--
ALTER TABLE `order_shipping`
  ADD CONSTRAINT `order_shipping_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `order_shipping_history`
--
ALTER TABLE `order_shipping_history`
  ADD CONSTRAINT `order_shipping_history_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_shipping_history_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `order_taxes`
--
ALTER TABLE `order_taxes`
  ADD CONSTRAINT `order_taxes_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `order_tracking`
--
ALTER TABLE `order_tracking`
  ADD CONSTRAINT `order_tracking_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_tracking_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `positions`
--
ALTER TABLE `positions`
  ADD CONSTRAINT `positions_ibfk_1` FOREIGN KEY (`office_id`) REFERENCES `offices` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `positions_ibfk_2` FOREIGN KEY (`parent_id`) REFERENCES `positions` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `products_ibfk_2` FOREIGN KEY (`fitting_id`) REFERENCES `fittings` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `product_images`
--
ALTER TABLE `product_images`
  ADD CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `product_variants`
--
ALTER TABLE `product_variants`
  ADD CONSTRAINT `product_variants_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_variants_ibfk_2` FOREIGN KEY (`size_id`) REFERENCES `sizes` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `shipping_costs`
--
ALTER TABLE `shipping_costs`
  ADD CONSTRAINT `shipping_costs_ibfk_1` FOREIGN KEY (`city_id`) REFERENCES `cities` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `shipping_costs_ibfk_2` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `size_charts`
--
ALTER TABLE `size_charts`
  ADD CONSTRAINT `size_charts_ibfk_1` FOREIGN KEY (`size_id`) REFERENCES `sizes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `size_charts_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `size_charts_ibfk_3` FOREIGN KEY (`fitting_id`) REFERENCES `fittings` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `stocks`
--
ALTER TABLE `stocks`
  ADD CONSTRAINT `stocks_ibfk_1` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `stocks_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `stocks_ibfk_3` FOREIGN KEY (`fitting_id`) REFERENCES `fittings` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `stocks_ibfk_4` FOREIGN KEY (`size_id`) REFERENCES `sizes` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD CONSTRAINT `stock_movements_ibfk_1` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `stock_movements_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `stock_movements_ibfk_3` FOREIGN KEY (`fitting_id`) REFERENCES `fittings` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `stock_movements_ibfk_4` FOREIGN KEY (`size_id`) REFERENCES `sizes` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `stock_movements_ibfk_5` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `stock_opnames`
--
ALTER TABLE `stock_opnames`
  ADD CONSTRAINT `stock_opnames_ibfk_1` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `stock_opnames_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `stock_opname_details`
--
ALTER TABLE `stock_opname_details`
  ADD CONSTRAINT `stock_opname_details_ibfk_1` FOREIGN KEY (`opname_id`) REFERENCES `stock_opnames` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `stock_opname_details_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `stock_opname_details_ibfk_3` FOREIGN KEY (`fitting_id`) REFERENCES `fittings` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `stock_opname_details_ibfk_4` FOREIGN KEY (`size_id`) REFERENCES `sizes` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `user_addresses`
--
ALTER TABLE `user_addresses`
  ADD CONSTRAINT `user_addresses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `user_roles`
--
ALTER TABLE `user_roles`
  ADD CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_roles_ibfk_3` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `wishlists`
--
ALTER TABLE `wishlists`
  ADD CONSTRAINT `wishlists_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `wishlists_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
