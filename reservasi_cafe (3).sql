-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jun 09, 2025 at 10:42 AM
-- Server version: 8.0.30
-- PHP Version: 8.4.7

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `reservasi_cafe`
--

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('laravel_cache_email_verified_ilyas@gmail.com', 'b:1;', 1749453092);

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `favorite_menus`
--

CREATE TABLE `favorite_menus` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `menu_item_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint UNSIGNED NOT NULL,
  `reserved_at` int UNSIGNED DEFAULT NULL,
  `available_at` int UNSIGNED NOT NULL,
  `created_at` int UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `menu_categories`
--

CREATE TABLE `menu_categories` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `sort_order` int NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `menu_categories`
--

INSERT INTO `menu_categories` (`id`, `name`, `slug`, `description`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Food', 'food', NULL, 1, 1, '2025-05-31 06:51:15', '2025-05-31 06:51:15'),
(2, 'Beverage', 'beverage', NULL, 2, 1, '2025-05-31 06:51:15', '2025-05-31 06:51:15'),
(3, 'Dessert', 'dessert', NULL, 3, 1, '2025-05-31 06:51:15', '2025-05-31 06:51:15');

-- --------------------------------------------------------

--
-- Table structure for table `menu_items`
--

CREATE TABLE `menu_items` (
  `id` bigint UNSIGNED NOT NULL,
  `category_id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_available` tinyint(1) NOT NULL DEFAULT '1',
  `is_featured` tinyint(1) NOT NULL DEFAULT '0',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `menu_items`
--

INSERT INTO `menu_items` (`id`, `category_id`, `name`, `slug`, `price`, `image`, `description`, `is_available`, `is_featured`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 1, 'Nasi Goreng Spesial', 'nasi-goreng-spesial', '45000.00', NULL, NULL, 1, 0, 1, '2025-05-31 06:51:15', '2025-05-31 06:51:15'),
(2, 1, 'Sate Ayam', 'sate-ayam', '35000.00', NULL, NULL, 1, 0, 2, '2025-05-31 06:51:15', '2025-05-31 06:51:15'),
(3, 1, 'Ayam Bakar', 'ayam-bakar', '55000.00', NULL, NULL, 1, 0, 3, '2025-05-31 06:51:15', '2025-05-31 06:51:15'),
(4, 1, 'Mie Goreng', 'mie-goreng', '40000.00', NULL, NULL, 1, 0, 4, '2025-05-31 06:51:15', '2025-05-31 06:51:15'),
(5, 1, 'Rendang Sapi', 'rendang-sapi', '65000.00', NULL, NULL, 1, 0, 5, '2025-05-31 06:51:15', '2025-05-31 06:51:15'),
(6, 1, 'Ikan Bakar', 'ikan-bakar', '60000.00', NULL, NULL, 1, 0, 6, '2025-05-31 06:51:15', '2025-05-31 06:51:15'),
(7, 2, 'Es Teh Manis', 'es-teh-manis', '15000.00', NULL, NULL, 1, 0, 1, '2025-05-31 06:51:15', '2025-05-31 06:51:15'),
(8, 2, 'Jus Alpukat', 'jus-alpukat', '25000.00', NULL, NULL, 1, 0, 2, '2025-05-31 06:51:15', '2025-05-31 06:51:15'),
(9, 2, 'Lemon Tea', 'lemon-tea', '20000.00', NULL, NULL, 1, 0, 3, '2025-05-31 06:51:15', '2025-05-31 06:51:15'),
(10, 2, 'Kopi Hitam', 'kopi-hitam', '18000.00', NULL, NULL, 1, 0, 4, '2025-05-31 06:51:15', '2025-05-31 06:51:15'),
(11, 2, 'Smoothies', 'smoothies', '30000.00', NULL, NULL, 1, 0, 5, '2025-05-31 06:51:15', '2025-05-31 06:51:15'),
(12, 2, 'Air Mineral', 'air-mineral', '10000.00', NULL, NULL, 1, 0, 6, '2025-05-31 06:51:15', '2025-05-31 06:51:15'),
(13, 3, 'Es Krim', 'es-krim', '25000.00', NULL, NULL, 1, 0, 1, '2025-05-31 06:51:15', '2025-05-31 06:51:15'),
(14, 3, 'Pudding Coklat', 'pudding-coklat', '20000.00', NULL, NULL, 1, 0, 2, '2025-05-31 06:51:15', '2025-05-31 06:51:15'),
(15, 3, 'Pisang Goreng', 'pisang-goreng', '25000.00', NULL, NULL, 1, 0, 3, '2025-05-31 06:51:15', '2025-05-31 06:51:15');

-- --------------------------------------------------------

--
-- Table structure for table `menu_reviews`
--

CREATE TABLE `menu_reviews` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `menu_item_id` bigint UNSIGNED NOT NULL,
  `order_id` bigint UNSIGNED DEFAULT NULL,
  `order_code` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rating` tinyint UNSIGNED NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `helpful_count` int NOT NULL DEFAULT '0',
  `is_verified` tinyint(1) NOT NULL DEFAULT '0',
  `images` json DEFAULT NULL,
  `reviewed_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int UNSIGNED NOT NULL,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2025_05_27_143456_create_reservations_table', 1),
(5, '2025_05_27_143751_create_reservation_menu_items_table', 1),
(6, '2025_05_27_170158_reservation_packages_table', 1),
(7, '2025_05_27_170233_menu_categories_table', 1),
(8, '2025_05_27_170250_menu_items_table', 1),
(9, '2025_05_27_170730_fix_foreign_keys_data_types', 1),
(10, '2025_05_27_181708_create_orders_table', 1),
(11, '2025_05_27_181710_create_order_items_table', 1),
(12, '2025_05_28_022034_create_menu_favorite_table', 1),
(13, '2025_05_28_032512_menu_reviews_table', 1),
(14, '2025_05_28_032559_create_reviews_response_table', 1),
(15, '2025_05_28_033051_reviews_helpful_table', 1),
(16, '2025_05_28_045442_user_reviews_table', 1),
(17, '2025_05_30_100210_add_role_to_users_table', 1),
(18, '2025_06_01_024107_restaurant_tables', 2),
(19, '2025_06_01_024158_add_id_tabels_to_reservation_and_orders', 2),
(20, '2025_06_02_030424_add_phone_to_users_table', 2),
(21, '2025_06_03_154633_add_created_by_staff_to_orders_table', 3),
(22, '2025_06_03_163752_create_offline_orders_table', 4),
(23, '2025_06_03_163752_create_offline_order_items_table', 5);

-- --------------------------------------------------------

--
-- Table structure for table `offline_orders`
--

CREATE TABLE `offline_orders` (
  `id` bigint UNSIGNED NOT NULL,
  `order_code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_by_staff` bigint UNSIGNED NOT NULL,
  `customer_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order_type` enum('dine_in','takeaway') COLLATE utf8mb4_unicode_ci NOT NULL,
  `table_id` bigint UNSIGNED DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `subtotal` decimal(10,2) NOT NULL,
  `service_fee` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total_amount` decimal(10,2) NOT NULL,
  `payment_method` enum('cash','debit_card') COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_status` enum('paid') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'paid',
  `status` enum('confirmed','preparing','ready','completed','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'confirmed',
  `order_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `estimated_ready_time` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `offline_orders`
--

INSERT INTO `offline_orders` (`id`, `order_code`, `created_by_staff`, `customer_name`, `customer_phone`, `customer_email`, `order_type`, `table_id`, `notes`, `subtotal`, `service_fee`, `total_amount`, `payment_method`, `payment_status`, `status`, `order_time`, `estimated_ready_time`, `completed_at`, `created_at`, `updated_at`) VALUES
(1, 'OFF-20250603-HBIS', 4, 'Travy Apuila Jasa Said', '081262046767', 'travysaid@gmail.com', 'dine_in', 17, NULL, '45000.00', '2250.00', '47250.00', 'cash', 'paid', 'confirmed', '2025-06-03 10:38:36', '2025-06-03 10:53:36', NULL, '2025-06-03 10:38:36', '2025-06-03 10:38:36');

-- --------------------------------------------------------

--
-- Table structure for table `offline_order_items`
--

CREATE TABLE `offline_order_items` (
  `id` bigint UNSIGNED NOT NULL,
  `offline_order_id` bigint UNSIGNED NOT NULL,
  `menu_item_id` bigint UNSIGNED NOT NULL,
  `menu_item_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `menu_item_price` decimal(10,2) NOT NULL,
  `quantity` int NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `special_instructions` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `offline_order_items`
--

INSERT INTO `offline_order_items` (`id`, `offline_order_id`, `menu_item_id`, `menu_item_name`, `menu_item_price`, `quantity`, `subtotal`, `special_instructions`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'Nasi Goreng Spesial', '45000.00', 1, '45000.00', NULL, '2025-06-03 10:38:36', '2025-06-03 10:38:36');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `order_code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_phone` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_type` enum('dine_in','takeaway','delivery') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'dine_in',
  `table_id` bigint UNSIGNED DEFAULT NULL,
  `delivery_address` text COLLATE utf8mb4_unicode_ci,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `subtotal` decimal(10,2) NOT NULL,
  `delivery_fee` decimal(10,2) NOT NULL DEFAULT '0.00',
  `service_fee` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total_amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'cash',
  `payment_status` enum('pending','paid','failed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `payment_proof` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','confirmed','preparing','ready','completed','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `order_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `estimated_ready_time` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `rating` int DEFAULT NULL,
  `review` text COLLATE utf8mb4_unicode_ci,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `created_by_staff` bigint UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `order_code`, `customer_name`, `customer_phone`, `customer_email`, `order_type`, `table_id`, `delivery_address`, `notes`, `subtotal`, `delivery_fee`, `service_fee`, `total_amount`, `payment_method`, `payment_status`, `payment_proof`, `status`, `order_time`, `estimated_ready_time`, `completed_at`, `rating`, `review`, `reviewed_at`, `created_at`, `updated_at`, `created_by_staff`) VALUES
(1, 1, 'ORD-20250603-FFDS', 'papi', '081262046767', 'papi@gmail.com', 'dine_in', NULL, NULL, NULL, '25000.00', '0.00', '1250.00', '26250.00', 'cash', 'pending', NULL, 'pending', '2025-06-02 22:33:56', '2025-06-02 22:48:56', NULL, NULL, NULL, NULL, '2025-06-02 22:33:56', '2025-06-02 22:33:56', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` bigint UNSIGNED NOT NULL,
  `order_id` bigint UNSIGNED NOT NULL,
  `menu_item_id` bigint UNSIGNED NOT NULL,
  `menu_item_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `menu_item_price` decimal(10,2) NOT NULL,
  `quantity` int NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `special_instructions` text COLLATE utf8mb4_unicode_ci,
  `modifications` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `menu_item_id`, `menu_item_name`, `menu_item_price`, `quantity`, `subtotal`, `special_instructions`, `modifications`, `created_at`, `updated_at`) VALUES
(1, 1, 13, 'Es Krim', '25000.00', 1, '25000.00', NULL, NULL, '2025-06-02 22:33:56', '2025-06-02 22:33:56');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reservations`
--

CREATE TABLE `reservations` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `customer_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_phone` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `special_requests` text COLLATE utf8mb4_unicode_ci,
  `package_id` bigint UNSIGNED NOT NULL,
  `reservation_date` date NOT NULL,
  `reservation_time` time NOT NULL,
  `number_of_people` int NOT NULL,
  `table_location` enum('indoor','outdoor') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'indoor',
  `table_id` bigint UNSIGNED DEFAULT NULL,
  `package_price` decimal(10,2) NOT NULL,
  `menu_subtotal` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total_price` decimal(10,2) NOT NULL,
  `payment_method` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'transfer',
  `proof_of_payment` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `additional_images` json DEFAULT NULL,
  `reservation_code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','confirmed','completed','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `reservations`
--

INSERT INTO `reservations` (`id`, `user_id`, `customer_name`, `customer_phone`, `customer_email`, `special_requests`, `package_id`, `reservation_date`, `reservation_time`, `number_of_people`, `table_location`, `table_id`, `package_price`, `menu_subtotal`, `total_price`, `payment_method`, `proof_of_payment`, `additional_images`, `reservation_code`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 'papi', '081262046767', 'papi@gmail.com', NULL, 1, '2025-06-04', '18:00:00', 2, 'indoor', 1, '299000.00', '45000.00', '344000.00', 'transfer', 'RSV-20250603-FBJW_payment_20250603191106_xmht.jpeg', NULL, 'RSV-20250603-FBJW', 'confirmed', '2025-06-03 12:11:06', '2025-06-03 12:12:04'),
(2, 1, 'papi', '081262046767', 'papi@gmail.com', NULL, 1, '2025-06-04', '18:00:00', 2, 'indoor', 2, '299000.00', '45000.00', '344000.00', 'transfer', 'RSV-20250603-RXD3_payment_20250603191112_uz0k.jpeg', NULL, 'RSV-20250603-RXD3', 'pending', '2025-06-03 12:11:12', '2025-06-03 12:11:12'),
(3, 1, 'papi', '081262046767', 'papi@gmail.com', NULL, 1, '2025-06-04', '18:00:00', 2, 'indoor', 3, '299000.00', '45000.00', '344000.00', 'transfer', 'RSV-20250603-DKXQ_payment_20250603191115_6ysc.jpeg', NULL, 'RSV-20250603-DKXQ', 'pending', '2025-06-03 12:11:15', '2025-06-03 12:11:15');

-- --------------------------------------------------------

--
-- Table structure for table `reservation_menu_items`
--

CREATE TABLE `reservation_menu_items` (
  `id` bigint UNSIGNED NOT NULL,
  `reservation_id` bigint UNSIGNED NOT NULL,
  `menu_item_id` bigint UNSIGNED NOT NULL,
  `menu_item_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `menu_item_price` decimal(10,2) NOT NULL,
  `quantity` int NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reservation_packages`
--

CREATE TABLE `reservation_packages` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `includes` json DEFAULT NULL,
  `duration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `max_people` int NOT NULL DEFAULT '2',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `reservation_packages`
--

INSERT INTO `reservation_packages` (`id`, `name`, `price`, `image`, `description`, `includes`, `duration`, `max_people`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Paket Romantis (2 Orang)', '299000.00', 'poto.jpg', 'Makan malam romantis untuk dua orang dengan lilin dan dekorasi bunga', '[\"2 Main Course\", \"2 Dessert\", \"2 Minuman\", \"Dekorasi Meja\", \"Foto Kenangan\"]', '2 jam', 2, 1, '2025-05-31 06:51:15', '2025-05-31 06:51:15'),
(2, 'Paket Keluarga (4 Orang)', '499000.00', NULL, 'Paket makan bersama keluarga dengan suasana yang hangat', '[\"4 Main Course\", \"4 Dessert\", \"4 Minuman\", \"Free Kids Dessert\"]', '3 jam', 4, 1, '2025-05-31 06:51:15', '2025-05-31 06:51:15'),
(3, 'Paket Gathering (8 Orang)', '899000.00', NULL, 'Paket untuk acara kumpul bersama teman atau kolega', '[\"8 Main Course\", \"8 Dessert\", \"8 Minuman\", \"1 Appetizer Platter\", \"1 Birthday Cake\"]', '4 jam', 8, 1, '2025-05-31 06:51:15', '2025-05-31 06:51:15');

-- --------------------------------------------------------

--
-- Table structure for table `restaurant_tables`
--

CREATE TABLE `restaurant_tables` (
  `id` bigint UNSIGNED NOT NULL,
  `table_number` int NOT NULL COMMENT 'Nomor meja: 1, 2, 3, dst',
  `capacity` int NOT NULL COMMENT 'Jumlah kursi maksimal',
  `location_type` enum('indoor','outdoor') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tipe lokasi meja',
  `location_detail` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Detail lokasi: Window, Corner, VIP, Garden, dll',
  `status` enum('available','occupied','reserved','maintenance') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'available' COMMENT 'Status meja saat ini',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Apakah meja aktif digunakan',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `restaurant_tables`
--

INSERT INTO `restaurant_tables` (`id`, `table_number`, `capacity`, `location_type`, `location_detail`, `status`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 2, 'indoor', 'Window', 'reserved', 1, '2025-06-03 10:36:08', '2025-06-03 12:12:04'),
(2, 2, 2, 'indoor', 'Window', 'available', 1, '2025-06-03 10:36:08', '2025-06-03 10:36:08'),
(3, 3, 2, 'indoor', 'Center', 'available', 1, '2025-06-03 10:36:08', '2025-06-03 10:36:08'),
(4, 4, 2, 'indoor', 'Bar Area', 'available', 1, '2025-06-03 10:36:08', '2025-06-03 10:36:08'),
(5, 5, 2, 'indoor', 'Corner', 'available', 1, '2025-06-03 10:36:08', '2025-06-03 10:36:08'),
(6, 6, 4, 'indoor', 'Window', 'available', 1, '2025-06-03 10:36:09', '2025-06-03 10:36:09'),
(7, 7, 4, 'indoor', 'Center', 'available', 1, '2025-06-03 10:36:09', '2025-06-03 10:36:09'),
(8, 8, 4, 'indoor', 'Corner', 'available', 1, '2025-06-03 10:36:09', '2025-06-03 10:36:09'),
(9, 9, 4, 'indoor', 'VIP Area', 'available', 1, '2025-06-03 10:36:09', '2025-06-03 10:36:09'),
(10, 10, 4, 'indoor', 'Center', 'available', 1, '2025-06-03 10:36:09', '2025-06-03 10:36:09'),
(11, 11, 6, 'indoor', 'VIP Area', 'available', 1, '2025-06-03 10:36:09', '2025-06-03 10:36:09'),
(12, 12, 6, 'indoor', 'Center', 'available', 1, '2025-06-03 10:36:09', '2025-06-03 10:36:09'),
(13, 13, 6, 'indoor', 'Window', 'available', 1, '2025-06-03 10:36:09', '2025-06-03 10:36:09'),
(14, 14, 8, 'indoor', 'VIP Area', 'available', 1, '2025-06-03 10:36:09', '2025-06-03 10:36:09'),
(15, 15, 8, 'indoor', 'Private Room', 'available', 1, '2025-06-03 10:36:09', '2025-06-03 10:36:09'),
(16, 16, 10, 'indoor', 'Private Room', 'available', 1, '2025-06-03 10:36:09', '2025-06-03 10:36:09'),
(17, 17, 12, 'indoor', 'Private Room', 'occupied', 1, '2025-06-03 10:36:09', '2025-06-03 10:38:36'),
(18, 18, 2, 'outdoor', 'Garden', 'available', 1, '2025-06-03 10:36:09', '2025-06-03 10:36:09'),
(19, 19, 2, 'outdoor', 'Terrace', 'available', 1, '2025-06-03 10:36:09', '2025-06-03 10:36:09'),
(20, 20, 2, 'outdoor', 'Garden', 'available', 1, '2025-06-03 10:36:09', '2025-06-03 10:36:09'),
(21, 21, 4, 'outdoor', 'Garden', 'available', 1, '2025-06-03 10:36:09', '2025-06-03 10:36:09'),
(22, 22, 4, 'outdoor', 'Terrace', 'available', 1, '2025-06-03 10:36:09', '2025-06-03 10:36:09'),
(23, 23, 4, 'outdoor', 'Garden', 'available', 1, '2025-06-03 10:36:09', '2025-06-03 10:36:09'),
(24, 24, 4, 'outdoor', 'Gazebo', 'available', 1, '2025-06-03 10:36:09', '2025-06-03 10:36:09'),
(25, 25, 6, 'outdoor', 'Garden', 'available', 1, '2025-06-03 10:36:09', '2025-06-03 10:36:09'),
(26, 26, 6, 'outdoor', 'Terrace', 'available', 1, '2025-06-03 10:36:09', '2025-06-03 10:36:09'),
(27, 27, 6, 'outdoor', 'Gazebo', 'available', 1, '2025-06-03 10:36:09', '2025-06-03 10:36:09'),
(28, 28, 8, 'outdoor', 'Garden', 'available', 1, '2025-06-03 10:36:09', '2025-06-03 10:36:09'),
(29, 29, 10, 'outdoor', 'Gazebo', 'available', 1, '2025-06-03 10:36:09', '2025-06-03 10:36:09'),
(30, 30, 12, 'outdoor', 'Garden Event Area', 'available', 1, '2025-06-03 10:36:09', '2025-06-03 10:36:09');

-- --------------------------------------------------------

--
-- Table structure for table `review_helpfuls`
--

CREATE TABLE `review_helpfuls` (
  `id` bigint UNSIGNED NOT NULL,
  `menu_review_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `review_responses`
--

CREATE TABLE `review_responses` (
  `id` bigint UNSIGNED NOT NULL,
  `menu_review_id` bigint UNSIGNED NOT NULL,
  `author_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Cemapaka Cafe Team',
  `response_text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `responded_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('LBiFV7XOqQ2JaT52yiY8ocov1RdzlFb66u0pk8TY', 9, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiZUtMZkNqWmdZYWdiNEpCZHB6NXd5dzczdXJLUDFUWUM0NnRmcmJheiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fXM6NTA6ImxvZ2luX3dlYl81OWJhMzZhZGRjMmIyZjk0MDE1ODBmMDE0YzdmNThlYTRlMzA5ODlkIjtpOjk7fQ==', 1749451684),
('vgEQLxv6gZHAiuYDQfV6mwgvNMhsAxfMWbIeHIfL', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiVlM0NHpBOTNCUDczMnNhNnZjQ2ViUnFiVnBaVXJjNnFTeDIyUUtWbCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1749059971);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('customer','staff','admin') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'customer',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `role`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'papi', 'papi@gmail.com', NULL, 'customer', NULL, '$2y$12$6LJoIwYUJRwiloIP2KV54.j/pM7KpFb3JyCiQPNMopCiK3eA9rp3a', 'bMUN1zVm5exELxfQ161xQC9gIIzd6WiQYVgxYs95xaiiwdGOQCcIXinP25Pt', '2025-05-31 06:53:32', '2025-06-04 10:46:36'),
(3, 'staff', 'staff@gmail.cpm', NULL, 'staff', NULL, '$2y$12$fIRAEA2RbeRMYblfAjKGiufN7qEvj9lr6ufWqoXSji.5WjO5JyNza', NULL, '2025-06-03 04:57:26', '2025-06-03 04:57:26'),
(4, 'staff2', 'staff2@gmail.com', NULL, 'staff', NULL, '$2y$12$MsMdI2mnwYrth41x/wyIOeVE0H39UinQ4spWEBJ5N00tw6L6Ash2C', NULL, '2025-06-03 07:22:58', '2025-06-03 07:22:58'),
(5, 'tes', 'tes@gmail.com', '+6288888888888', 'customer', NULL, '$2y$12$.JAknZ9qUpsu7aGA9QP.Kun6Omm0Lu.SVXNBig7WHWX/PuLiuSvWm', NULL, '2025-06-04 08:59:01', '2025-06-04 08:59:01'),
(6, 'nomor', 'nomor@gmail.com', '+6281212121212', 'customer', NULL, '$2y$12$ARMuyaZZuYDGsUzocDoOduhDUaD3yRrj41Jon5MIJXbVPQ4Wt0Dj6', NULL, '2025-06-04 09:51:24', '2025-06-04 09:51:24'),
(7, 'otp', 'otp@gmail.com', '+6281262046767', 'customer', NULL, '$2y$12$gapPrY8WZHLWzp76foaoK.IGsTnpQ4JqMP9IXS89bSCkfhaqvIHUa', NULL, '2025-06-04 10:41:02', '2025-06-04 10:41:02'),
(9, 'rifa', 'rifa@gmail.com', '+6281234567890', 'customer', NULL, '$2y$12$ObkmcrDoe9w03yNZ0XHXVeXasracMbr4aqi3zqmMJ4KJJdCj83OjK', NULL, '2025-06-08 23:43:54', '2025-06-08 23:43:54');

-- --------------------------------------------------------

--
-- Table structure for table `user_reviews`
--

CREATE TABLE `user_reviews` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `order_id` bigint UNSIGNED NOT NULL,
  `menu_item_id` bigint UNSIGNED DEFAULT NULL,
  `rating` tinyint NOT NULL COMMENT 'Rating 1-5',
  `comment` text COLLATE utf8mb4_unicode_ci,
  `helpful_count` int NOT NULL DEFAULT '0',
  `is_verified` tinyint(1) NOT NULL DEFAULT '0',
  `is_featured` tinyint(1) NOT NULL DEFAULT '0',
  `admin_response` text COLLATE utf8mb4_unicode_ci,
  `admin_response_date` timestamp NULL DEFAULT NULL,
  `admin_response_by` bigint UNSIGNED DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `reviewed_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `favorite_menus`
--
ALTER TABLE `favorite_menus`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `favorite_menus_user_id_menu_item_id_unique` (`user_id`,`menu_item_id`),
  ADD KEY `favorite_menus_user_id_created_at_index` (`user_id`,`created_at`),
  ADD KEY `favorite_menus_menu_item_id_index` (`menu_item_id`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `menu_categories`
--
ALTER TABLE `menu_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `menu_categories_slug_unique` (`slug`),
  ADD KEY `menu_categories_is_active_sort_order_index` (`is_active`,`sort_order`);

--
-- Indexes for table `menu_items`
--
ALTER TABLE `menu_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `menu_items_slug_unique` (`slug`),
  ADD KEY `menu_items_category_id_is_available_index` (`category_id`,`is_available`),
  ADD KEY `menu_items_is_featured_is_available_index` (`is_featured`,`is_available`);

--
-- Indexes for table `menu_reviews`
--
ALTER TABLE `menu_reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `menu_reviews_user_id_menu_item_id_order_id_unique` (`user_id`,`menu_item_id`,`order_id`),
  ADD KEY `menu_reviews_order_id_foreign` (`order_id`),
  ADD KEY `menu_reviews_menu_item_id_rating_index` (`menu_item_id`,`rating`),
  ADD KEY `menu_reviews_user_id_created_at_index` (`user_id`,`created_at`),
  ADD KEY `menu_reviews_is_verified_index` (`is_verified`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `offline_orders`
--
ALTER TABLE `offline_orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `offline_orders_order_code_unique` (`order_code`),
  ADD KEY `offline_orders_table_id_foreign` (`table_id`),
  ADD KEY `offline_orders_created_by_staff_order_time_index` (`created_by_staff`,`order_time`),
  ADD KEY `offline_orders_status_order_time_index` (`status`,`order_time`),
  ADD KEY `offline_orders_order_time_index` (`order_time`);

--
-- Indexes for table `offline_order_items`
--
ALTER TABLE `offline_order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `offline_order_items_menu_item_id_foreign` (`menu_item_id`),
  ADD KEY `offline_order_items_offline_order_id_menu_item_id_index` (`offline_order_id`,`menu_item_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `orders_order_code_unique` (`order_code`),
  ADD KEY `orders_user_id_status_index` (`user_id`,`status`),
  ADD KEY `orders_order_code_index` (`order_code`),
  ADD KEY `orders_order_type_status_index` (`order_type`,`status`),
  ADD KEY `orders_payment_status_index` (`payment_status`),
  ADD KEY `orders_table_id_foreign` (`table_id`),
  ADD KEY `orders_order_type_table_id_index` (`order_type`,`table_id`),
  ADD KEY `orders_created_by_staff_foreign` (`created_by_staff`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_items_order_id_index` (`order_id`),
  ADD KEY `order_items_menu_item_id_index` (`menu_item_id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `reservations`
--
ALTER TABLE `reservations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `reservations_reservation_code_unique` (`reservation_code`),
  ADD KEY `reservations_user_id_reservation_date_index` (`user_id`,`reservation_date`),
  ADD KEY `reservations_status_index` (`status`),
  ADD KEY `reservations_reservation_code_index` (`reservation_code`),
  ADD KEY `reservations_payment_method_index` (`payment_method`),
  ADD KEY `reservations_package_id_foreign` (`package_id`),
  ADD KEY `reservations_table_id_index` (`table_id`);

--
-- Indexes for table `reservation_menu_items`
--
ALTER TABLE `reservation_menu_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reservation_menu_items_reservation_id_index` (`reservation_id`),
  ADD KEY `reservation_menu_items_menu_item_id_foreign` (`menu_item_id`);

--
-- Indexes for table `reservation_packages`
--
ALTER TABLE `reservation_packages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reservation_packages_is_active_index` (`is_active`);

--
-- Indexes for table `restaurant_tables`
--
ALTER TABLE `restaurant_tables`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `restaurant_tables_table_number_unique` (`table_number`),
  ADD KEY `restaurant_tables_location_type_status_is_active_index` (`location_type`,`status`,`is_active`),
  ADD KEY `restaurant_tables_capacity_status_index` (`capacity`,`status`);

--
-- Indexes for table `review_helpfuls`
--
ALTER TABLE `review_helpfuls`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `review_helpfuls_menu_review_id_user_id_unique` (`menu_review_id`,`user_id`),
  ADD KEY `review_helpfuls_menu_review_id_index` (`menu_review_id`),
  ADD KEY `review_helpfuls_user_id_index` (`user_id`);

--
-- Indexes for table `review_responses`
--
ALTER TABLE `review_responses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `review_responses_menu_review_id_index` (`menu_review_id`),
  ADD KEY `review_responses_responded_at_index` (`responded_at`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD UNIQUE KEY `users_phone_unique` (`phone`);

--
-- Indexes for table `user_reviews`
--
ALTER TABLE `user_reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_reviews_user_id_order_id_unique` (`user_id`,`order_id`),
  ADD KEY `user_reviews_user_id_rating_index` (`user_id`,`rating`),
  ADD KEY `user_reviews_order_id_index` (`order_id`),
  ADD KEY `user_reviews_menu_item_id_rating_index` (`menu_item_id`,`rating`),
  ADD KEY `user_reviews_rating_created_at_index` (`rating`,`created_at`),
  ADD KEY `user_reviews_is_featured_rating_index` (`is_featured`,`rating`),
  ADD KEY `user_reviews_admin_response_by_foreign` (`admin_response_by`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `favorite_menus`
--
ALTER TABLE `favorite_menus`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `menu_categories`
--
ALTER TABLE `menu_categories`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `menu_items`
--
ALTER TABLE `menu_items`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `menu_reviews`
--
ALTER TABLE `menu_reviews`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `offline_orders`
--
ALTER TABLE `offline_orders`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `offline_order_items`
--
ALTER TABLE `offline_order_items`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `reservations`
--
ALTER TABLE `reservations`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `reservation_menu_items`
--
ALTER TABLE `reservation_menu_items`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reservation_packages`
--
ALTER TABLE `reservation_packages`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `restaurant_tables`
--
ALTER TABLE `restaurant_tables`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `review_helpfuls`
--
ALTER TABLE `review_helpfuls`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `review_responses`
--
ALTER TABLE `review_responses`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `user_reviews`
--
ALTER TABLE `user_reviews`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `favorite_menus`
--
ALTER TABLE `favorite_menus`
  ADD CONSTRAINT `favorite_menus_menu_item_id_foreign` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `favorite_menus_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `menu_items`
--
ALTER TABLE `menu_items`
  ADD CONSTRAINT `menu_items_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `menu_categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `menu_reviews`
--
ALTER TABLE `menu_reviews`
  ADD CONSTRAINT `menu_reviews_menu_item_id_foreign` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `menu_reviews_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `menu_reviews_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `offline_orders`
--
ALTER TABLE `offline_orders`
  ADD CONSTRAINT `offline_orders_created_by_staff_foreign` FOREIGN KEY (`created_by_staff`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `offline_orders_table_id_foreign` FOREIGN KEY (`table_id`) REFERENCES `restaurant_tables` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `offline_order_items`
--
ALTER TABLE `offline_order_items`
  ADD CONSTRAINT `offline_order_items_menu_item_id_foreign` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `offline_order_items_offline_order_id_foreign` FOREIGN KEY (`offline_order_id`) REFERENCES `offline_orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_created_by_staff_foreign` FOREIGN KEY (`created_by_staff`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `orders_table_id_foreign` FOREIGN KEY (`table_id`) REFERENCES `restaurant_tables` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `orders_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_menu_item_id_foreign` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `order_items_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reservations`
--
ALTER TABLE `reservations`
  ADD CONSTRAINT `reservations_package_id_foreign` FOREIGN KEY (`package_id`) REFERENCES `reservation_packages` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `reservations_table_id_foreign` FOREIGN KEY (`table_id`) REFERENCES `restaurant_tables` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `reservations_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reservation_menu_items`
--
ALTER TABLE `reservation_menu_items`
  ADD CONSTRAINT `reservation_menu_items_menu_item_id_foreign` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `reservation_menu_items_reservation_id_foreign` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `review_helpfuls`
--
ALTER TABLE `review_helpfuls`
  ADD CONSTRAINT `review_helpfuls_menu_review_id_foreign` FOREIGN KEY (`menu_review_id`) REFERENCES `menu_reviews` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `review_helpfuls_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `review_responses`
--
ALTER TABLE `review_responses`
  ADD CONSTRAINT `review_responses_menu_review_id_foreign` FOREIGN KEY (`menu_review_id`) REFERENCES `menu_reviews` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_reviews`
--
ALTER TABLE `user_reviews`
  ADD CONSTRAINT `user_reviews_admin_response_by_foreign` FOREIGN KEY (`admin_response_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `user_reviews_menu_item_id_foreign` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `user_reviews_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_reviews_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
