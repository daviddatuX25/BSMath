-- BSMath Admin SPA Database Schema
-- 8 tables: users, programs, announcements, events, news, gallery, faculty, activities

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- --------------------------------------------------------

-- Table: users
-- Stores admin accounts with role-based access control
CREATE TABLE `users` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `role` ENUM('admin', 'dean', 'program_head') NOT NULL DEFAULT 'admin',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

-- Table: programs
-- Academic programs offered by the department
CREATE TABLE `programs` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `code` VARCHAR(50) NOT NULL UNIQUE,
    `description` TEXT,
    `status` ENUM('active', 'inactive') DEFAULT 'active',
    `created_by` INT(11),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

-- Table: announcements
-- Department announcements visible to all users
CREATE TABLE `announcements` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `content` TEXT NOT NULL,
    `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    `priority` ENUM('low', 'normal', 'high') DEFAULT 'normal',
    `author_id` INT(11),
    `approved_by` INT(11),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

-- Table: events
-- Department events and activities
CREATE TABLE `events` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `event_date` DATE NOT NULL,
    `event_time` TIME,
    `location` VARCHAR(255),
    `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    `author_id` INT(11),
    `approved_by` INT(11),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

-- Table: news
-- News articles for the department (admin only)
CREATE TABLE `news` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `content` TEXT NOT NULL,
    `image_url` VARCHAR(500),
    `status` ENUM('published', 'draft', 'archived') DEFAULT 'draft',
    `author_id` INT(11),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

-- Table: gallery
-- Image gallery for department photos
CREATE TABLE `gallery` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255),
    `image_url` VARCHAR(500) NOT NULL,
    `description` TEXT,
    `uploaded_by` INT(11),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

-- Table: faculty
-- Faculty members of the department
CREATE TABLE `faculty` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255),
    `position` VARCHAR(255),
    `department` VARCHAR(255),
    `specialization` VARCHAR(255),
    `image_url` VARCHAR(500),
    `status` ENUM('active', 'inactive') DEFAULT 'active',
    `created_by` INT(11),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

-- Table: activities
-- Recent activities feed for dashboard
CREATE TABLE `activities` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(50) NOT NULL,
    `description` VARCHAR(500) NOT NULL,
    `user_id` INT(11),
    `entity_type` VARCHAR(50),
    `entity_id` INT(11),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
