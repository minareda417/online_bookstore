import mysql.connector

def get_db():
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="bookstore",
        port=3306
    )
    return conn

def insert_data():
    db = get_db()
    cursor = db.cursor()

    # Insert categories
    categories = ["Science", "Art", "Religion", "History", "Geography"]
    for cat in categories:
        cursor.execute("INSERT IGNORE INTO category (category_name) VALUES (%s)", (cat,))

    # Insert publishers
    publishers = [
        ("Penguin Random House", "123 Main St"),
        ("HarperCollins", "456 Elm St")
    ]
    for name, address in publishers:
        cursor.execute("INSERT INTO publisher (publisher_name, address) VALUES (%s, %s)", (name, address))

    # Insert authors
    authors = ["George Orwell", "J.K. Rowling", "Yuval Noah Harari", "Stephen Hawking", "Dale Carnegie"]
    for author in authors:
        cursor.execute("INSERT IGNORE INTO author (author_name) VALUES (%s)", (author,))

    # Insert books
    books = [
        ("9780451524935", "1984", 1, 1949, 15.99, 4, 10, 50, "Dystopian novel", "1984.jpg"),
        ("9780439358071", "Harry Potter and the Order of the Phoenix", 2, 2003, 25.00, 4, 10, 30, "Fifth book in Harry Potter series", "hp5.jpg"),
        ("9780062316097", "Sapiens", 1, 2011, 20.00, 1, 10, 20, "History of humankind", "sapiens.jpg"),
        ("9780553380163", "A Brief History of Time", 2, 1988, 18.00, 1, 10, 15, "Cosmology and physics", "time.jpg"),
        ("9780671027032", "How to Win Friends & Influence People", 1, 1936, 12.50, 3, 10, 40, "Self-help classic", "carnegie.jpg"),
        ("9780140449136", "The Odyssey", 2, -800, 14.00, 4, 10, 25, "Epic Greek poem", "odyssey.jpg"),
        ("9780307271037", "Guns, Germs, and Steel", 1, 1997, 19.00, 4, 10, 18, "Historical analysis", "guns.jpg"),
        ("9781451673319", "Fahrenheit 451", 2, 1953, 13.99, 4, 10, 22, "Dystopian novel", "fahrenheit451.jpg"),
        ("9780385533225", "The Martian", 1, 2014, 16.99, 1, 10, 35, "Sci-fi survival story", "martian.jpg"),
        ("9780143126560", "Thinking, Fast and Slow", 2, 2011, 21.00, 1, 10, 28, "Psychology and decision-making", "thinking.jpg")
    ]

    for b in books:
        cursor.execute("""
            INSERT IGNORE INTO book (isbn, title, publisher_id, publication_year, selling_price, category_id, threshold, quantity, description, cover_photo)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, b)

    # Link books to authors
    book_authors = [
        ("9780451524935", 1),
        ("9780439358071", 2),
        ("9780062316097", 3),
        ("9780553380163", 4),
        ("9780671027032", 5),
        ("9780140449136", 1),
        ("9780307271037", 3),
        ("9781451673319", 1),
        ("9780385533225", 2),
        ("9780143126560", 3)
    ]
    for ba in book_authors:
        cursor.execute("INSERT IGNORE INTO book_author (book_isbn, author_id) VALUES (%s,%s)", ba)

    # Insert admin
    cursor.execute("""
        INSERT INTO admin (first_name, last_name, username, password, email)
        VALUES ('Admin', 'User', 'admin', 'admin123', 'admin@bookstore.com')
    """)

    db.commit()
    cursor.close()
    db.close()
    print("Data inserted successfully.")

if __name__ == "__main__":
    insert_data()
