CREATE DATABASE bookstore;

USE bookstore;

-- book/publisher part---
CREATE TABLE
    category (
        category_id INT PRIMARY KEY AUTO_INCREMENT,
        category_name VARCHAR(100) NOT NULL
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
        FOREIGN KEY (publisher_id) REFERENCES publisher (publisher_id),
        FOREIGN KEY (category_id) REFERENCES category (category_id)
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
        FOREIGN KEY (book_isbn) REFERENCES book (isbn),
        FOREIGN KEY (author_id) REFERENCES author (author_id)
    );

CREATE TABLE
    phone_number (
        publisher_id INT,
        phone_number VARCHAR(15) NOT NULL,
        FOREIGN KEY (publisher_id) REFERENCES publisher (publisher_id)
    );

CREATE TABLE
    replenishment_order (
        publisher_id INT,
        book_isbn VARCHAR(13),
        send_date DATE NOT NULL,
        receive_date DATE,
        quantity INT NOT NULL,
        status Enum ('confirmed', 'cancelled', 'pending') DEFAULT 'pending',
        FOREIGN KEY (publisher_id) REFERENCES publisher (publisher_id),
        FOREIGN KEY (book_isbn) REFERENCES book (isbn)
    );

--- website part---
CREATE TABLE
    customer (
        customer_id INT PRIMARY KEY AUTO_INCREMENT,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        `password` VARCHAR(255) NOT NULL,
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
        -- status Enum('processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'processing',
        status Enum ('confirmed', 'cancelled', 'pending') DEFAULT 'pending',
        FOREIGN KEY (customer_id) REFERENCES customer (customer_id)
    );

CREATE TABLE
    order_item (
        order_id INT,
        book_isbn VARCHAR(13),
        quantity INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        PRIMARY KEY (order_id, book_isbn),
        FOREIGN KEY (order_id) REFERENCES `order` (order_id),
        FOREIGN KEY (book_isbn) REFERENCES book (isbn)
    );

CREATE TABLE
    cart (
        customer_id INT,
        book_isbn VARCHAR(13),
        quantity INT NOT NULL,
        PRIMARY KEY (customer_id, book_isbn),
        FOREIGN KEY (customer_id) REFERENCES customer (customer_id),
        FOREIGN KEY (book_isbn) REFERENCES book (isbn)
    );

CREATE TABLE
    admin (
        admin_id INT PRIMARY KEY AUTO_INCREMENT,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        `password` VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL
    )