-- 데이터베이스 생성 (필요시)
CREATE DATABASE IF NOT EXISTS refrigerator_db;
USE refrigerator_db;

-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 사용자 프로필 (선호도 등)
CREATE TABLE IF NOT EXISTS user_profiles (
    user_id INT PRIMARY KEY,
    dietary_preference VARCHAR(50) DEFAULT 'None', -- None, Vegetarian, Vegan, Gluten-Free 등
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 저장된 레시피 테이블
CREATE TABLE IF NOT EXISTS saved_recipes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    prep_time VARCHAR(50),
    difficulty VARCHAR(20),
    steps JSON,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id) -- 성능을 위한 명시적 인덱스 추가
);
