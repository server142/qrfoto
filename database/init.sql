CREATE DATABASE IF NOT EXISTS veltrix_events;
USE veltrix_events;

-- Users Table
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role ENUM('SuperAdmin', 'Admin', 'User', 'Guest') DEFAULT 'User',
    preferred_language VARCHAR(5) DEFAULT 'es',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Plans Table
CREATE TABLE plans (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type ENUM('Free', 'Monthly', 'Annual', 'Pay-per-event') DEFAULT 'Free',
    price DECIMAL(10, 2) NOT NULL,
    max_events INT DEFAULT 1,
    storage_limit_mb INT DEFAULT 100,
    event_duration_days INT DEFAULT 30,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions Table
CREATE TABLE subscriptions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    plan_id VARCHAR(36) NOT NULL,
    status ENUM('Active', 'Expired', 'Pending') DEFAULT 'Pending',
    starts_at TIMESTAMP,
    ends_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
);

-- Events Table
CREATE TABLE events (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATETIME NOT NULL,
    expiration_date DATETIME NOT NULL,
    is_private BOOLEAN DEFAULT FALSE,
    password VARCHAR(255),
    qr_code_url VARCHAR(255),
    cover_image_url VARCHAR(255),
    branding_color VARCHAR(20) DEFAULT '#000000',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Media Table
CREATE TABLE media (
    id VARCHAR(36) PRIMARY KEY,
    event_id VARCHAR(36) NOT NULL,
    guest_name VARCHAR(100),
    file_url VARCHAR(1024) NOT NULL,
    file_type ENUM('image', 'video') NOT NULL,
    size_bytes INT NOT NULL,
    status ENUM('Active', 'Deleted') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Comments Table
CREATE TABLE comments (
    id VARCHAR(36) PRIMARY KEY,
    media_id VARCHAR(36) NOT NULL,
    guest_name VARCHAR(100),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE
);

-- Reactions Table
CREATE TABLE reactions (
    id VARCHAR(36) PRIMARY KEY,
    media_id VARCHAR(36) NOT NULL,
    emoji VARCHAR(20) NOT NULL,
    count INT DEFAULT 1,
    FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE
);
