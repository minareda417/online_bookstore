from fastapi import APIRouter, HTTPException, Query, Body
from db import get_db
from schemas import BookCreate, BookUpdate,PublisherCreate
from datetime import date, timedelta, datetime

router = APIRouter(prefix="/admin", tags=["Admin"])

# get admin info
@router.get("/getadmininfo")
def get_admin_info(admin_id: int = Query(..., description="Admin ID")):
    conn = get_db()
    cur = conn.cursor(dictionary=True)
    
    cur.execute("""
        SELECT admin_id, first_name, last_name, username, email
        FROM admin
        WHERE admin_id = %s
    """, (admin_id,))
    
    admin = cur.fetchone()
    if not admin:
        raise HTTPException(404, "Admin not found")
    
    return admin
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

# add a publisher
@router.post("/publishers")
def add_publisher(publisher: PublisherCreate):
    conn = get_db()
    cur = conn.cursor(dictionary=True)
    
    try:
        # Check if publisher already exists
        cur.execute("SELECT publisher_id FROM publisher WHERE publisher_name=%s", (publisher.publisher_name,))
        if cur.fetchone():
            raise HTTPException(400, "Publisher with this name already exists")
        
        # insert publisher
        cur.execute("""
            INSERT INTO publisher (publisher_name, address)
            VALUES (%s, %s)
        """, (publisher.publisher_name, publisher.address))
        
        # get publisher_id by unique name
        cur.execute("SELECT publisher_id FROM publisher WHERE publisher_name=%s", (publisher.publisher_name,))
        publisher_id = cur.fetchone()["publisher_id"]
        
        # insert phone numbers
        for phone in publisher.phone_numbers:
            cur.execute("""
                INSERT INTO phone_number (publisher_id, phone_number)
                VALUES (%s, %s)
            """, (publisher_id, phone))
        
        conn.commit()
    except Exception as e:
        raise HTTPException(400, f"Failed to add publisher: {e}")
    
    return {"message": "Publisher added successfully"}

# get all publishers
@router.get("/publishers")
def get_publishers():
    conn = get_db()
    cur = conn.cursor(dictionary=True)
    
    cur.execute("SELECT publisher_id, publisher_name, address FROM publisher ORDER BY publisher_name")
    publishers = cur.fetchall()
    
    return {"publishers": publishers}

# get all categories
@router.get("/categories")
def get_categories():
    conn = get_db()
    cur = conn.cursor(dictionary=True)
    
    cur.execute("SELECT category_id, category_name FROM category ORDER BY category_name")
    categories = cur.fetchall()
    
    return {"categories": categories}

# add a category
@router.post("/categories")
def add_category(category_name: str = Body(..., embed=True)):
    conn = get_db()
    cur = conn.cursor(dictionary=True)
    
    try:
        # Check if category already exists
        cur.execute("SELECT category_id FROM category WHERE category_name=%s", (category_name,))
        if cur.fetchone():
            raise HTTPException(400, "Category with this name already exists")
        
        cur.execute("INSERT INTO category (category_name) VALUES (%s)", (category_name,))
        conn.commit()
        return {"message": "Category added successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(400, f"Failed to add category: {e}")

# add an author
@router.post("/authors")
def add_author(author_name: str = Body(..., embed=True)):
    conn = get_db()
    cur = conn.cursor(dictionary=True)
    
    try:
        # Check if author already exists
        cur.execute("SELECT author_id FROM author WHERE author_name=%s", (author_name,))
        if cur.fetchone():
            raise HTTPException(400, "Author with this name already exists")
        
        cur.execute("INSERT INTO author (author_name) VALUES (%s)", (author_name,))
        conn.commit()
        return {"message": "Author added successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(400, f"Failed to add author: {e}")


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
        if cur.rowcount == 0:
            raise HTTPException(404, "Book not found")
        conn.commit()
    except HTTPException:
        raise
    except Exception as e:
        print(f"Update error: {e}")
        raise HTTPException(400, f"Update failed: {e}")

    return {"message": "Book updated successfully"}

# delete book
@router.delete("/books/{isbn}")
def delete_book(isbn: str):
    conn = get_db()
    cur = conn.cursor()

    # Check if book exists
    cur.execute("SELECT isbn FROM book WHERE isbn=%s", (isbn,))
    if not cur.fetchone():
        raise HTTPException(404, "Book not found")

    try:
        # Delete will cascade to book_author and other related tables
        cur.execute("DELETE FROM book WHERE isbn=%s", (isbn,))
        conn.commit()
    except Exception as e:
        raise HTTPException(400, f"Delete failed: {e}")

    return {"message": "Book deleted successfully"}

# view replenishment orders
@router.get("/replenishment/")
def view_replenishment():
    conn = get_db()
    cur = conn.cursor(dictionary=True)

    try:
        cur.execute("""
            SELECT *
            FROM replenishment_order
        """)
        orders = cur.fetchall()
        return {"replenishment_orders": orders}

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to load orders: {e}")
    
# set status from frontend dropdown list
# update replenishment order status
@router.put("/replenishment/update-status")
def update_replenishment_status(
    publisher_id: int,
    book_isbn: str,
    status: str = Query(..., description="New status: pending, confirmed, cancelled")
):
    allowed_status = {"pending", "confirmed", "cancelled"}
    if status not in allowed_status:
        raise HTTPException(400, "Invalid status value")

    conn = get_db()
    cur = conn.cursor(dictionary=True)

    # fetch current status and quantity
    cur.execute("""
        SELECT status, quantity FROM replenishment_order
        WHERE publisher_id=%s AND book_isbn=%s
    """, (publisher_id, book_isbn))
    order = cur.fetchone()
    if not order:
        raise HTTPException(404, "Replenishment order not found")

    if order["status"] != "pending":
        raise HTTPException(400, f"Cannot update order with status '{order['status']}'")

    # update status (the database trigger will automatically update book quantity when status='confirmed')
    cur.execute("""
        UPDATE replenishment_order
        SET status=%s, receive_date = CASE WHEN %s='confirmed' THEN CURDATE() ELSE receive_date END
        WHERE publisher_id=%s AND book_isbn=%s
    """, (status, status, publisher_id, book_isbn))

    conn.commit()
    return {"message": f"Replenishment order status updated to '{status}'"}


# update customer order status
@router.put("/update-order-status")
def update_order_status(
    order_id: int,
    status: str = Query(..., description="New status: pending, delivered, cancelled")
):
    allowed_status = {"pending", "delivered", "cancelled"}
    if status not in allowed_status:
        raise HTTPException(400, "Invalid status value")

    conn = get_db()
    cur = conn.cursor(dictionary=True)

    # fetch current status and ordered items
    cur.execute("""
        SELECT status FROM `order`
        WHERE order_id=%s
    """, (order_id,))
    order = cur.fetchone()
    if not order:
        raise HTTPException(404, "Order not found")

    if order["status"] != "pending":
        raise HTTPException(400, f"Cannot update order with status '{order['status']}'")

    cur.execute("""
        SELECT book_isbn, quantity FROM order_item
        WHERE order_id=%s
    """, (order_id,))
    items = cur.fetchall()

    # update status
    cur.execute("""
        UPDATE `order`
        SET status=%s, arrival_date = CASE WHEN %s='delivered' THEN NOW() ELSE arrival_date END
        WHERE order_id=%s
    """, (status, status, order_id))

    # if order cancelled, restore book quantities
    if status == "cancelled":
        for item in items:
            cur.execute("""
                UPDATE book
                SET quantity = quantity + %s
                WHERE isbn=%s
            """, (item["quantity"], item["book_isbn"]))

    conn.commit()
    return {"message": f"Order status updated to '{status}'"}

# Get all orders for admin
@router.get("/orders")
def get_all_orders():
    conn = get_db()
    cur = conn.cursor(dictionary=True)
    
    cur.execute("""
        SELECT o.order_id, o.customer_id, c.username, o.order_date, 
               o.arrival_date, o.status,
               oi.book_isbn, b.title, oi.quantity, oi.price,
               (oi.quantity * oi.price) as item_total
        FROM `order` o
        JOIN customer c ON o.customer_id = c.customer_id
        JOIN order_item oi ON o.order_id = oi.order_id
        JOIN book b ON oi.book_isbn = b.isbn
        ORDER BY o.order_date DESC, o.order_id
    """)
    
    orders = cur.fetchall()
    
    # Group by order_id
    grouped_orders = {}
    for item in orders:
        oid = item['order_id']
        if oid not in grouped_orders:
            grouped_orders[oid] = {
                "order_id": oid,
                "customer_id": item['customer_id'],
                "username": item['username'],
                "order_date": item['order_date'].strftime("%Y-%m-%d %H:%M:%S") if item['order_date'] else None,
                "arrival_date": item['arrival_date'].strftime("%Y-%m-%d %H:%M:%S") if item['arrival_date'] else None,
                "status": item['status'],
                "items": [],
                "total_price": 0
            }
        
        grouped_orders[oid]["items"].append({
            "isbn": item['book_isbn'],
            "title": item['title'],
            "quantity": item['quantity'],
            "price": float(item['price']),
            "item_total": float(item['item_total'])
        })
        grouped_orders[oid]["total_price"] += float(item['item_total'])
    
    return {"data": list(grouped_orders.values())}

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

    # convert to datetime to include full day range
    start = datetime.combine(first_day_last_month, datetime.min.time())
    end = datetime.combine(today, datetime.max.time())

    cur.execute("""
        SELECT SUM(oi.price * oi.quantity) AS total_sales
        FROM `order` o
        JOIN order_item oi ON o.order_id = oi.order_id
        WHERE o.order_date BETWEEN %s AND %s
          AND o.status = 'delivered'
    """, (start, end))

    result = cur.fetchone()
    return {"total_sales_from_last_month_until_today": float(result["total_sales"] or 0)}


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
        WHERE DATE(o.order_date) = %s and o.status = 'delivered'
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
        WHERE o.order_date >= %s and o.status = 'delivered'
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
        WHERE o.order_date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH) and o.status = 'delivered'
        GROUP BY c.customer_id
        ORDER BY total_spent DESC
        LIMIT 5
    """)

    return cur.fetchall()


# total number of times a specific book has been ordered (replenishment orders)
@router.get("/reports/book-orders-count")
def book_orders_count(isbn: str = Query(..., description="ISBN of the book")):
    conn = get_db()
    cur = conn.cursor(dictionary=True)

    cur.execute("""
        SELECT COUNT(*) AS times_ordered
        FROM replenishment_order
        WHERE book_isbn = %s AND status = 'confirmed'
    """, (isbn,))

    result = cur.fetchone()
    return {"isbn": isbn, "times_ordered": result["times_ordered"]}
