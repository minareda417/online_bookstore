from fastapi import APIRouter, HTTPException, Query
from db import get_db
from schemas import BookCreate, BookUpdate
from datetime import date, timedelta, datetime

router = APIRouter(prefix="/admin", tags=["Admin"])

# add a book
@router.post("/books")
def add_book(book: BookCreate):
    conn = get_db()
    cur = conn.cursor(dictionary=True)

    # insert book
    try:
        cur.execute("""
            INSERT INTO book (isbn, title, publisher_id, publication_year,
                              selling_price, category_id, threshold, quantity,
                              description, cover_photo)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, (book.isbn, book.title, book.publisher_id, book.publication_year,
              book.selling_price, book.category_id, book.threshold,
              book.quantity, book.description, book.cover_photo))

        # link authors
        for author_id in book.authors:
            cur.execute("INSERT INTO book_author (book_isbn, author_id) VALUES (%s,%s)",
                        (book.isbn, author_id))

        conn.commit()
    except Exception as e:
        raise HTTPException(400, f"Failed to add book: {e}")

    return {"message": "Book added successfully"}


# update existing book
@router.put("/books/{isbn}")
def update_book(isbn: str, book: BookUpdate):
    conn = get_db()
    cur = conn.cursor()

    fields = []
    values = []
    for k, v in book.dict(exclude_unset=True).items():
        fields.append(f"{k}=%s")
        values.append(v)

    if not fields:
        raise HTTPException(400, "No fields provided to update")

    values.append(isbn)
    query = f"UPDATE book SET {', '.join(fields)} WHERE isbn=%s"

    try:
        cur.execute(query, tuple(values))
        conn.commit()
    except Exception as e:
        raise HTTPException(400, f"Update failed: {e}")

    return {"message": "Book updated successfully"}


# place replinshment ordar
@router.post("/replenishment")
def place_order(order: dict):
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO replenishment_order (publisher_id, book_isbn, send_date, quantity)
            VALUES (%s, %s, CURDATE(), %s)
        """, (order["publisher_id"], order["book_isbn"], order["quantity"]))
        conn.commit()
    except Exception as e:
        raise HTTPException(400, f"Failed to place order: {e}")
    return {"message": "Order placed successfully"}


# confirm order
@router.put("/replenishment/{order_id}/confirm")
def confirm_replenishment(order_id: int):
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("""
            UPDATE replenishment_order
            SET status='confirmed', receive_date=CURDATE()
            WHERE order_id=%s
        """, (order_id,))
        conn.commit()
    except Exception as e:
        raise HTTPException(400, f"Failed to confirm order: {e}")
    return {"message": "Order confirmed"}


# -- reports --

# total sales last month
@router.get("/reports/total-sales-last-month")
def total_sales_last_month():
    conn = get_db()
    cur = conn.cursor(dictionary=True)

    today = date.today()
    first_day_this_month = today.replace(day=1)
    last_day_last_month = first_day_this_month - timedelta(days=1)
    first_day_last_month = last_day_last_month.replace(day=1)

    cur.execute("""
        SELECT SUM(oi.price * oi.quantity) AS total_sales
        FROM `order` o
        JOIN order_item oi ON o.order_id = oi.order_id
        WHERE o.order_date BETWEEN %s AND %s
    """, (first_day_last_month, last_day_last_month))

    result = cur.fetchone()
    return {"total_sales_last_month": result["total_sales"] or 0}


# total sales on a specific day
@router.get("/reports/total-sales")
def total_sales_on_day(date_str: str = Query(..., description="Date in YYYY-MM-DD format")):
    conn = get_db()
    cur = conn.cursor(dictionary=True)
    try:
        target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(400, "Invalid date format")

    cur.execute("""
        SELECT SUM(oi.price * oi.quantity) AS total_sales
        FROM `order` o
        JOIN order_item oi ON o.order_id = oi.order_id
        WHERE DATE(o.order_date) = %s
    """, (target_date,))
    result = cur.fetchone()
    return {"total_sales_on_day": result["total_sales"] or 0}


# top 10 selling books last 3 months
@router.get("/reports/top-books")
def top_books():
    conn = get_db()
    cur = conn.cursor(dictionary=True)

    three_months_ago = date.today() - timedelta(days=90)
    cur.execute("""
        SELECT b.isbn, b.title, SUM(oi.quantity) AS total_sold
        FROM book b
        JOIN order_item oi ON b.isbn = oi.book_isbn
        JOIN `order` o ON oi.order_id = o.order_id
        WHERE o.order_date >= %s
        GROUP BY b.isbn
        ORDER BY total_sold DESC
        LIMIT 10
    """, (three_months_ago,))

    return cur.fetchall()


# top 5 customers last 3 months
@router.get("/reports/top-customers")
def top_customers():
    conn = get_db()
    cur = conn.cursor(dictionary=True)

    cur.execute("""
        SELECT c.username,
               SUM(oi.quantity * oi.price) AS total_spent
        FROM customer c
        JOIN `order` o ON c.customer_id = o.customer_id
        JOIN order_item oi ON o.order_id = oi.order_id
        WHERE o.order_date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
        GROUP BY c.customer_id
        ORDER BY total_spent DESC
        LIMIT 5
    """)

    return cur.fetchall()


# total number of times a specific book has been ordered
@router.get("/reports/book-orders-count")
def book_orders_count(isbn: str = Query(..., description="ISBN of the book")):
    conn = get_db()
    cur = conn.cursor(dictionary=True)

    cur.execute("""
        SELECT COUNT(*) AS times_ordered
        FROM replenishment_order
        WHERE book_isbn = %s
    """, (isbn,))

    result = cur.fetchone()
    return {"isbn": isbn, "times_ordered": result["times_ordered"]}
