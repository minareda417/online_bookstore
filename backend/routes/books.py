from fastapi import APIRouter, HTTPException
from db import get_db
from schemas import BookDetails
from typing import List

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
               b.quantity, b.cover_photo
        FROM book b
        LEFT JOIN publisher p ON b.publisher_id = p.publisher_id
        LEFT JOIN category c ON b.category_id = c.category_id
        WHERE b.isbn = %s
    """, (isbn,))

    book = cur.fetchone()
    if not book:
        raise HTTPException(404, "Book not found")

    return book

@router.get("/")
def get_all_books() -> List[BookDetails]:
    conn = get_db()
    cur = conn.cursor(dictionary=True)

    cur.execute("""
        SELECT b.isbn, b.title, p.publisher_name, b.publication_year, 
               b.selling_price, c.category_name, b.description, 
               b.quantity, b.cover_photo
        FROM book b
        LEFT JOIN publisher p ON b.publisher_id = p.publisher_id
        LEFT JOIN category c ON b.category_id = c.category_id
    """)

    return cur.fetchall()
