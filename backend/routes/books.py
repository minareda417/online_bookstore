from fastapi import APIRouter, HTTPException
from db import get_db
from schemas import BookDetails
from typing import List
import os

router = APIRouter(prefix="/books", tags=["Books"])

@router.get("/search")
def search_books(q: str):
    conn = get_db()
    cur = conn.cursor(dictionary=True)

    cur.execute("""
        SELECT DISTINCT b.*
        FROM book b
        LEFT JOIN book_author ba ON b.isbn = ba.book_isbn
        LEFT JOIN author a ON ba.author_id = a.author_id
        LEFT JOIN publisher p ON b.publisher_id = p.publisher_id
        WHERE
            b.title LIKE %s OR
            b.isbn = %s OR
            a.author_name LIKE %s OR
            p.publisher_name LIKE %s
    """, (f"%{q}%", q, f"%{q}%", f"%{q}%"))

    return cur.fetchall()

@router.get("/{isbn}")
def get_book_details(isbn: str) -> BookDetails:
    conn = get_db()
    cur = conn.cursor(dictionary=True)

    cur.execute("""
        SELECT b.isbn, b.title, p.publisher_name, b.publication_year, 
               b.selling_price, c.category_name, b.description, 
               b.quantity, b.cover_photo,
               GROUP_CONCAT(a.author_name SEPARATOR ', ') as author
        FROM book b
        LEFT JOIN publisher p ON b.publisher_id = p.publisher_id
        LEFT JOIN category c ON b.category_id = c.category_id
        LEFT JOIN book_author ba ON b.isbn = ba.book_isbn
        LEFT JOIN author a ON ba.author_id = a.author_id
        WHERE b.isbn = %s
        GROUP BY b.isbn
    """, (isbn,))

    book = cur.fetchone()
    if not book:
        raise HTTPException(404, "Book not found")

    # Convert local file path to URL
    if book['cover_photo']:
        filename = os.path.basename(book['cover_photo'])
        book['cover_photo'] = f"http://localhost:8000/covers/{filename}"

    return book

@router.get("/")
def get_all_books() -> List[BookDetails]:
    conn = get_db()
    cur = conn.cursor(dictionary=True)

    cur.execute("""
        SELECT b.isbn, b.title, p.publisher_name, b.publication_year, 
               b.selling_price, c.category_name, b.description, 
               b.quantity, b.cover_photo,
               GROUP_CONCAT(a.author_name SEPARATOR ', ') as author
        FROM book b
        LEFT JOIN publisher p ON b.publisher_id = p.publisher_id
        LEFT JOIN category c ON b.category_id = c.category_id
        LEFT JOIN book_author ba ON b.isbn = ba.book_isbn
        LEFT JOIN author a ON ba.author_id = a.author_id
        GROUP BY b.isbn
    """)

    books = cur.fetchall()
    
    # Convert local file paths to URLs
    for book in books:
        if book['cover_photo']:
            filename = os.path.basename(book['cover_photo'])
            book['cover_photo'] = f"http://localhost:8000/covers/{filename}"
    
    return books
