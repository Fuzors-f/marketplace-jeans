-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 29 Jan 2026 pada 16.01
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

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
-- Struktur dari tabel `activity_logs`
--

DROP TABLE IF EXISTS `activity_logs`;
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
(29, 1, 'login', 'user', 1, 'User logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '/api/auth/login', 'POST', NULL, '2026-01-26 14:08:05');

-- --------------------------------------------------------

--
-- Struktur dari tabel `banners`
--

DROP TABLE IF EXISTS `banners`;
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

DROP TABLE IF EXISTS `carts`;
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
(2, NULL, '19061462-f13e-4942-9072-40b7c4637bfc', '2026-01-11 14:54:06', '2026-01-11 14:54:06');

-- --------------------------------------------------------

--
-- Struktur dari tabel `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
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
(3, 2, 8, 1, 279000.00, '2026-01-11 14:55:19', '2026-01-11 14:55:19');

-- --------------------------------------------------------

--
-- Struktur dari tabel `categories`
--

DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
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

INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `parent_id`, `image_url`, `is_active`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'Men Jeans', 'men-jeans', 'Denim jeans for men', NULL, NULL, 1, 0, '2025-12-18 17:19:00', '2025-12-18 17:19:00'),
(2, 'Women Jeans', 'women-jeans', 'Denim jeans for women', NULL, NULL, 1, 0, '2025-12-18 17:19:00', '2025-12-18 17:19:00'),
(3, 'Casual Wear', 'casual-wear', 'Casual clothing', NULL, NULL, 1, 0, '2025-12-18 17:19:00', '2025-12-18 17:19:00');

-- --------------------------------------------------------

--
-- Struktur dari tabel `cities`
--

DROP TABLE IF EXISTS `cities`;
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

DROP TABLE IF EXISTS `content_settings`;
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
(1, 'hero', 'Hero Section', 'Koleksi Jeans Terbaru', 'Latest Jeans Collection', 'Temukan gaya sempurna untuk setiap kesempatan', 'Find the perfect style for every occasion', NULL, NULL, 'Belanja Sekarang', 'Shop Now', '/products', NULL, NULL, 1, 1, NULL, '2026-01-10 09:26:02', '2026-01-10 09:26:02'),
(2, 'featured', 'Featured Products', 'Produk Unggulan', 'Featured Products', 'Pilihan terbaik untuk Anda', 'Best picks for you', NULL, NULL, 'Lihat Semua', 'View All', '/products?featured=true', NULL, NULL, 1, 2, NULL, '2026-01-10 09:26:02', '2026-01-10 09:26:02'),
(3, 'categories', 'Categories Section', 'Kategori', 'Categories', 'Jelajahi koleksi kami', 'Explore our collection', NULL, NULL, 'Lihat Kategori', 'View Categories', '/products', NULL, NULL, 1, 3, NULL, '2026-01-10 09:26:02', '2026-01-10 09:26:02'),
(4, 'promo', 'Promo Section', 'Promo Spesial', 'Special Promo', 'Diskon hingga 50%', 'Up to 50% off', NULL, NULL, 'Lihat Promo', 'View Promo', '/products?promo=true', NULL, NULL, 1, 4, NULL, '2026-01-10 09:26:02', '2026-01-10 09:26:02'),
(5, 'about', 'About Section', 'Tentang Kami', 'About Us', 'Kualitas terbaik dengan harga terjangkau', 'Best quality at affordable prices', NULL, NULL, 'Selengkapnya', 'Learn More', '/about', NULL, NULL, 1, 5, NULL, '2026-01-10 09:26:02', '2026-01-10 09:26:02'),
(6, 'newsletter', 'Newsletter Section', 'Berlangganan Newsletter', 'Subscribe to Newsletter', 'Dapatkan info promo dan produk terbaru', 'Get the latest promo and product updates', NULL, NULL, 'Berlangganan', 'Subscribe', NULL, NULL, NULL, 1, 6, NULL, '2026-01-10 09:26:02', '2026-01-10 09:26:02'),
(7, 'footer_tagline', 'Footer Tagline', 'Jeans berkualitas untuk semua', 'Quality jeans for everyone', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 7, NULL, '2026-01-10 09:26:02', '2026-01-10 09:26:02');

-- --------------------------------------------------------

--
-- Struktur dari tabel `discounts`
--

DROP TABLE IF EXISTS `discounts`;
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

DROP TABLE IF EXISTS `exchange_rates`;
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

DROP TABLE IF EXISTS `exchange_rate_logs`;
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

DROP TABLE IF EXISTS `fittings`;
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

DROP TABLE IF EXISTS `guest_order_details`;
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

-- --------------------------------------------------------

--
-- Struktur dari tabel `inventory_movements`
--

DROP TABLE IF EXISTS `inventory_movements`;
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
(3, 87, 'out', 1, 'order', 1, NULL, 1, '2026-01-11 15:53:34');

-- --------------------------------------------------------

--
-- Struktur dari tabel `offices`
--

DROP TABLE IF EXISTS `offices`;
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

DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `order_number` varchar(50) NOT NULL,
  `unique_token` varchar(64) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `guest_email` varchar(255) DEFAULT NULL,
  `status` enum('pending','confirmed','processing','shipped','delivered','cancelled') DEFAULT 'pending',
  `approved_at` datetime DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `payment_status` enum('pending','paid','failed','refunded') DEFAULT 'pending',
  `subtotal` decimal(12,2) NOT NULL,
  `discount_amount` decimal(12,2) DEFAULT 0.00,
  `discount_code` varchar(50) DEFAULT NULL,
  `member_discount_amount` decimal(12,2) DEFAULT 0.00,
  `shipping_cost` decimal(12,2) DEFAULT 0.00,
  `total_amount` decimal(12,2) NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `orders`
--

INSERT INTO `orders` (`id`, `order_number`, `unique_token`, `user_id`, `guest_email`, `status`, `approved_at`, `approved_by`, `payment_status`, `subtotal`, `discount_amount`, `discount_code`, `member_discount_amount`, `shipping_cost`, `total_amount`, `notes`, `created_at`, `updated_at`) VALUES
(1, 'ORD-20260111-8887', '2ef1c6fe941ab85d8050d8ae4315762ef8287bf170f48a68bd2a7ca101fedf6e', 1, NULL, 'pending', NULL, NULL, 'pending', 230000.00, 0.00, NULL, 0.00, 20000.00, 250000.00, NULL, '2026-01-11 15:53:34', '2026-01-11 15:53:34');

-- --------------------------------------------------------

--
-- Struktur dari tabel `order_discounts`
--

DROP TABLE IF EXISTS `order_discounts`;
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

DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_variant_id` int(11) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `product_sku` varchar(100) NOT NULL,
  `size_name` varchar(20) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(12,2) NOT NULL,
  `unit_cost` decimal(12,2) DEFAULT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_variant_id`, `product_name`, `product_sku`, `size_name`, `quantity`, `unit_price`, `unit_cost`, `subtotal`, `created_at`) VALUES
(1, 1, 87, 'Test jEAn', 'JEAN00012', '29', 1, 230000.00, 100000.00, 230000.00, '2026-01-11 15:53:34');

-- --------------------------------------------------------

--
-- Struktur dari tabel `order_shipping`
--

DROP TABLE IF EXISTS `order_shipping`;
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
  `tracking_number` varchar(100) DEFAULT NULL,
  `shipped_at` datetime DEFAULT NULL,
  `delivered_at` datetime DEFAULT NULL,
  `estimated_delivery` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `order_shipping`
--

INSERT INTO `order_shipping` (`id`, `order_id`, `recipient_name`, `phone`, `address`, `city`, `province`, `postal_code`, `country`, `shipping_method`, `tracking_number`, `shipped_at`, `delivered_at`, `estimated_delivery`, `created_at`, `updated_at`) VALUES
(1, 1, 'Admin User', '08123456789', 'Jl Colombo', 'Surabaya', 'Jawa Timur', '60111', 'Indonesia', NULL, NULL, NULL, NULL, NULL, '2026-01-11 15:53:34', '2026-01-11 15:53:34');

-- --------------------------------------------------------

--
-- Struktur dari tabel `order_shipping_history`
--

DROP TABLE IF EXISTS `order_shipping_history`;
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
(1, 1, 'pending', 'Pesanan Dibuat', 'Pesanan berhasil dibuat dan menunggu persetujuan', NULL, 1, '2026-01-11 15:53:34');

-- --------------------------------------------------------

--
-- Struktur dari tabel `order_taxes`
--

DROP TABLE IF EXISTS `order_taxes`;
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

DROP TABLE IF EXISTS `order_tracking`;
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

DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `payment_method` varchar(50) NOT NULL,
  `payment_gateway` varchar(50) DEFAULT NULL,
  `transaction_id` varchar(255) DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `status` enum('pending','success','failed','expired') DEFAULT 'pending',
  `payment_url` text DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL,
  `expired_at` datetime DEFAULT NULL,
  `response_data` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `snap_token` varchar(255) DEFAULT NULL,
  `va_number` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `permissions`
--

DROP TABLE IF EXISTS `permissions`;
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

DROP TABLE IF EXISTS `positions`;
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

DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `fitting_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `short_description` varchar(500) DEFAULT NULL,
  `base_price` decimal(12,2) NOT NULL,
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

INSERT INTO `products` (`id`, `name`, `slug`, `category_id`, `fitting_id`, `description`, `short_description`, `base_price`, `master_cost_price`, `sku`, `weight`, `is_active`, `is_featured`, `meta_title`, `meta_description`, `meta_keywords`, `view_count`, `created_at`, `updated_at`) VALUES
(1, 'Classic Blue Slim Jeans', 'classic-blue-slim-jeans', 1, 1, 'Premium denim jeans with classic blue wash. Perfect fit for everyday wear.', 'Classic blue denim with slim fit', 299000.00, 150000.00, 'CBJ-SLIM-001', 0.50, 1, 1, 'Classic Blue Slim Jeans', 'Classic blue denim with slim fit', NULL, 2, '2025-12-18 17:19:00', '2026-01-11 15:11:13'),
(2, 'Black Regular Jeans New', 'black-regular-jeans', 1, 2, 'Timeless black jeans with regular fit. Versatile and comfortable.', 'Black denim regular fit', 279000.00, 140000.00, 'BRJ-REG-001', 0.50, 1, 1, 'Black Regular Jeans', 'Black denim regular fit', NULL, 6, '2025-12-18 17:19:01', '2026-01-11 14:55:12'),
(3, 'Light Wash Loose Jeans', 'light-wash-loose-jeans', 2, 3, 'Relaxed fit jeans with light wash. Comfortable for all-day wear.', 'Light wash loose fit', 319000.00, 160000.00, 'LWJ-LOOSE-001', 0.60, 1, 1, 'Light Wash Loose Jeans', 'Light wash loose fit', NULL, 0, '2025-12-18 17:19:01', '2025-12-18 17:19:01'),
(27, 'Jean Biru terbaru', 'jean-biru-terbaru', 3, 3, 'Jeans terbaik dengan bahan yang super premium', 'Jeans terbaik', 250000.00, 1999999.00, 'BR121', 0.99, 1, 0, 'Jean Biru terbaru', 'Jeans terbaik', NULL, 0, '2026-01-11 15:12:32', '2026-01-11 15:12:32'),
(28, 'Test jEAn', 'test-jean', 3, 3, 'Test1234', 'Test', 130000.00, 100000.00, 'BLT001', 0.99, 1, 0, 'Test jEAn', 'Test', NULL, 3, '2026-01-11 15:22:17', '2026-01-11 15:25:57');

-- --------------------------------------------------------

--
-- Struktur dari tabel `product_images`
--

DROP TABLE IF EXISTS `product_images`;
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
(1, 2, '/uploads/products/images-1767277696625-664784125.jpg', 1, 0, NULL, '2026-01-01 14:28:16');

-- --------------------------------------------------------

--
-- Struktur dari tabel `product_variants`
--

DROP TABLE IF EXISTS `product_variants`;
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
(1, 1, 1, 'CBJ-SLIM-001-28', 0.00, 9, 1, NULL, 1, '2025-12-18 17:19:00', '2025-12-21 07:08:32', 0.00),
(2, 1, 2, 'CBJ-SLIM-001-29', 0.00, 13, 1, NULL, 1, '2025-12-18 17:19:00', '2025-12-21 07:08:32', 0.00),
(3, 1, 3, 'CBJ-SLIM-001-30', 0.00, 11, 1, NULL, 1, '2025-12-18 17:19:00', '2025-12-21 07:08:32', 0.00),
(4, 1, 4, 'CBJ-SLIM-001-31', 0.00, 6, 1, NULL, 1, '2025-12-18 17:19:00', '2025-12-21 07:08:32', 0.00),
(5, 1, 5, 'CBJ-SLIM-001-32', 0.00, 11, 1, NULL, 1, '2025-12-18 17:19:00', '2025-12-21 07:08:32', 0.00),
(6, 1, 6, 'CBJ-SLIM-001-33', 0.00, 7, 1, NULL, 1, '2025-12-18 17:19:00', '2025-12-21 07:08:32', 0.00),
(7, 1, 7, 'CBJ-SLIM-001-34', 0.00, 15, 1, NULL, 1, '2025-12-18 17:19:01', '2025-12-21 07:08:32', 0.00),
(8, 2, 1, 'BRJ-REG-001-28', 0.00, 11, 1, NULL, 1, '2025-12-18 17:19:01', '2025-12-21 07:08:32', 0.00),
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
(87, 28, 2, 'JEAN00012', 100000.00, 9, 1, 5, 1, '2026-01-11 15:22:53', '2026-01-11 15:53:34', 2000.00);

-- --------------------------------------------------------

--
-- Struktur dari tabel `roles`
--

DROP TABLE IF EXISTS `roles`;
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
(1, 'Superadmin', 'Role dengan akses penuh ke semua fitur sistem', 1, '2026-01-25 09:07:17', '2026-01-25 09:09:19');

-- --------------------------------------------------------

--
-- Struktur dari tabel `role_permissions`
--

DROP TABLE IF EXISTS `role_permissions`;
CREATE TABLE `role_permissions` (
  `id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `settings`
--

DROP TABLE IF EXISTS `settings`;
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
(24, 'contact_address', '', 'textarea', 'Alamat perusahaan', 1, 'contact', '2026-01-26 14:08:43', '2026-01-26 14:08:43'),
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

DROP TABLE IF EXISTS `shipping_costs`;
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

DROP TABLE IF EXISTS `sizes`;
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

DROP TABLE IF EXISTS `size_charts`;
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

DROP TABLE IF EXISTS `stocks`;
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

DROP TABLE IF EXISTS `stock_movements`;
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

DROP TABLE IF EXISTS `stock_opnames`;
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

DROP TABLE IF EXISTS `stock_opname_details`;
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

DROP TABLE IF EXISTS `users`;
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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `full_name`, `phone`, `profile_picture`, `role`, `is_active`, `email_verified`, `member_discount`, `created_at`, `updated_at`) VALUES
(1, 'admin@marketplacejeans.com', '$2a$10$.HksG3CC6gqsrhQwah.m4usRSH6fhXU7nF4gh2Li4mqsPF8haUUbu', 'Admin User', '08123456789', NULL, 'admin', 1, 0, 0.00, '2025-12-18 17:19:00', '2025-12-18 17:19:00'),
(2, 'member@test.com', '$2a$10$DoGYXBhz5aTh6t5HIqQYjOe/t8PBQa13JUDn6UoVlUzxwTon.K1pq', 'Member Test', '08123456788', NULL, 'member', 1, 0, 10.00, '2025-12-18 17:19:00', '2025-12-18 17:19:00');

-- --------------------------------------------------------

--
-- Struktur dari tabel `user_addresses`
--

DROP TABLE IF EXISTS `user_addresses`;
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

-- --------------------------------------------------------

--
-- Struktur dari tabel `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
CREATE TABLE `user_roles` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `assigned_by` int(11) DEFAULT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `warehouses`
--

DROP TABLE IF EXISTS `warehouses`;
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

DROP TABLE IF EXISTS `wishlists`;
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
  ADD KEY `idx_parent_id` (`parent_id`);

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
  ADD KEY `idx_sku` (`sku`);
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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT untuk tabel `banners`
--
ALTER TABLE `banners`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `carts`
--
ALTER TABLE `carts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT untuk tabel `cities`
--
ALTER TABLE `cities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT untuk tabel `content_settings`
--
ALTER TABLE `content_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `inventory_movements`
--
ALTER TABLE `inventory_movements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `offices`
--
ALTER TABLE `offices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `order_discounts`
--
ALTER TABLE `order_discounts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `order_shipping`
--
ALTER TABLE `order_shipping`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `order_shipping_history`
--
ALTER TABLE `order_shipping_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT untuk tabel `product_images`
--
ALTER TABLE `product_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `product_variants`
--
ALTER TABLE `product_variants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=88;

--
-- AUTO_INCREMENT untuk tabel `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `role_permissions`
--
ALTER TABLE `role_permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT untuk tabel `user_addresses`
--
ALTER TABLE `user_addresses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `user_roles`
--
ALTER TABLE `user_roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

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
