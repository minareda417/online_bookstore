CREATE DATABASE bookstore;

USE bookstore;

-- book/publisher part---
CREATE TABLE
    category (
        category_id INT AUTO_INCREMENT,
        category_name VARCHAR(100) NOT NULL,
        PRIMARY KEY (category_id,category_name)
    );

CREATE TABLE
    publisher (
        publisher_id INT PRIMARY KEY AUTO_INCREMENT,
        publisher_name VARCHAR(255) NOT NULL,
        address VARCHAR(255)
    );

CREATE TABLE
    book (
        isbn VARCHAR(13) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        publisher_id INT,
        publication_year INT,
        selling_price DECIMAL(10, 2) NOT NULL,
        category_id INT,
        threshold INT DEFAULT 10,
        quantity INT DEFAULT 0,
        description TEXT,
        cover_photo VARCHAR(255),
        FOREIGN KEY (publisher_id) REFERENCES publisher (publisher_id) ON DELETE SET NULL,
        FOREIGN KEY (category_id) REFERENCES category (category_id) ON DELETE SET NULL
    );

CREATE TABLE
    author (
        author_id INT PRIMARY KEY AUTO_INCREMENT,
        author_name VARCHAR(255) NOT NULL
    );

CREATE TABLE
    book_author (
        book_isbn VARCHAR(13),
        author_id INT,
        PRIMARY KEY (book_isbn, author_id),
        FOREIGN KEY (book_isbn) REFERENCES book (isbn) ON DELETE CASCADE,
        FOREIGN KEY (author_id) REFERENCES author (author_id) ON DELETE CASCADE
    );

CREATE TABLE
    phone_number (
        publisher_id INT,
        phone_number VARCHAR(15) NOT NULL,
        FOREIGN KEY (publisher_id) REFERENCES publisher (publisher_id) ON DELETE CASCADE
    );

CREATE TABLE
    replenishment_order (
        publisher_id INT,
        book_isbn VARCHAR(13),
        send_date DATE NOT NULL,
        receive_date DATE,
        quantity INT NOT NULL,
        status ENUM ('confirmed', 'cancelled', 'pending') DEFAULT 'pending',
        FOREIGN KEY (publisher_id) REFERENCES publisher (publisher_id) ON DELETE CASCADE,
        FOREIGN KEY (book_isbn) REFERENCES book (isbn) ON DELETE CASCADE
    );

-- website part---
CREATE TABLE
    customer (
        customer_id INT PRIMARY KEY AUTO_INCREMENT,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        `password` VARCHAR(64) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone_number VARCHAR(15),
        `address` VARCHAR(255),
        shipping_address VARCHAR(255)
    );

CREATE TABLE
    `order` (
        order_id INT PRIMARY KEY AUTO_INCREMENT,
        customer_id INT,
        order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        arrival_date DATETIME,
        status ENUM ('delivered', 'cancelled', 'pending') DEFAULT 'pending',
        FOREIGN KEY (customer_id) REFERENCES customer (customer_id) ON DELETE CASCADE
    );

CREATE TABLE
    order_item (
        order_id INT,
        book_isbn VARCHAR(13),
        quantity INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        PRIMARY KEY (order_id, book_isbn),
        FOREIGN KEY (order_id) REFERENCES `order` (order_id) ON DELETE CASCADE,
        FOREIGN KEY (book_isbn) REFERENCES book (isbn) ON DELETE CASCADE
    );

CREATE TABLE
    cart (
        customer_id INT,
        book_isbn VARCHAR(13),
        quantity INT NOT NULL,
        PRIMARY KEY (customer_id, book_isbn),
        FOREIGN KEY (customer_id) REFERENCES customer (customer_id) ON DELETE CASCADE,
        FOREIGN KEY (book_isbn) REFERENCES book (isbn) ON DELETE CASCADE
    );

CREATE TABLE
    admin (
        admin_id INT PRIMARY KEY AUTO_INCREMENT,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        `password` VARCHAR(64) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL
    );

-- add triggers
DELIMITER //
-- prevent negative stock
CREATE TRIGGER before_book_update BEFORE
UPDATE ON book FOR EACH ROW BEGIN IF NEW.quantity < 0 THEN SIGNAL SQLSTATE '45000'
SET
    MESSAGE_TEXT = 'Stock cannot be negative';

END IF;

END;

//
-- create replenishment order automatically
CREATE TRIGGER after_book_update AFTER
UPDATE ON book FOR EACH ROW BEGIN IF NEW.quantity < NEW.threshold
AND OLD.quantity >= OLD.threshold THEN
INSERT INTO
    replenishment_order (publisher_id, book_isbn, send_date, quantity)
VALUES
    (NEW.publisher_id, NEW.isbn, CURDATE(), 20);

END IF;

END;

//
-- update stock when order confirmed automatically
CREATE TRIGGER after_order_confirm AFTER
UPDATE ON replenishment_order FOR EACH ROW BEGIN IF NEW.status = 'confirmed'
AND OLD.status <> 'confirmed' THEN
UPDATE book
SET
    quantity = quantity + NEW.quantity
WHERE
    isbn = NEW.book_isbn;

END IF;

END;

// DELIMITER ;