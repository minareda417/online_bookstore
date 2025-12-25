from fastapi import APIRouter
from db import get_db

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
