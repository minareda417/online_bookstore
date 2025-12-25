from fastapi import APIRouter, HTTPException, Query
from db import get_db
from schemas import CartItemCreate
from datetime import date

router = APIRouter(prefix="/customer", tags=["Customer"])

# add book to cart
@router.post("/cart")
def add_to_cart(cart_item: CartItemCreate):
    conn = get_db()
    cur = conn.cursor()
    
    # check if item exists
    cur.execute("SELECT quantity FROM cart WHERE customer_id=%s AND book_isbn=%s",
                (cart_item.customer_id, cart_item.book_isbn))
    existing = cur.fetchone()
    
    if existing:
        # update quantity
        new_qty = existing[0] + cart_item.quantity
        cur.execute("UPDATE cart SET quantity=%s WHERE customer_id=%s AND book_isbn=%s",
                    (new_qty, cart_item.customer_id, cart_item.book_isbn))
    else:
        cur.execute("INSERT INTO cart (customer_id, book_isbn, quantity) VALUES (%s,%s,%s)",
                    (cart_item.customer_id, cart_item.book_isbn, cart_item.quantity))

    conn.commit()
    return {"message": "Book added to cart"}


# view cart
@router.get("/cart/{customer_id}")
def view_cart(customer_id: int):
    conn = get_db()
    cur = conn.cursor(dictionary=True)

    cur.execute("""
        SELECT b.title, c.quantity, b.selling_price,
               c.quantity * b.selling_price AS total_price
        FROM cart c
        JOIN book b ON c.book_isbn = b.isbn
        WHERE c.customer_id = %s
    """, (customer_id,))

    return cur.fetchall()


# delete item from cart
@router.delete("/cart/{customer_id}/{book_isbn}")
def remove_from_cart(customer_id: int, book_isbn: str):
    conn = get_db()
    cur = conn.cursor()
    
    cur.execute("DELETE FROM cart WHERE customer_id=%s AND book_isbn=%s",
                (customer_id, book_isbn))
    conn.commit()
    return {"message": "Item removed from cart"}

# checkout
@router.post("/checkout/{customer_id}")
def checkout(customer_id: int, credit_card_number: str, expiry_date: str):
    conn = get_db()
    cur = conn.cursor(dictionary=True)

    # simple credit card validation
    if len(credit_card_number) not in [15, 16]:
        raise HTTPException(400, "Invalid credit card number")
    
    # get cart items
    cur.execute("SELECT * FROM cart WHERE customer_id=%s", (customer_id,))
    cart_items = cur.fetchall()
    if not cart_items:
        raise HTTPException(400, "Cart is empty")
    
    # insert new order
    cur.execute("INSERT INTO `order` (customer_id) VALUES (%s)", (customer_id,))
    order_id = cur.lastrowid
    
    # insert order items and update book quantities
    for item in cart_items:
        # check stock
        cur.execute("SELECT quantity, selling_price FROM book WHERE isbn=%s", (item['book_isbn'],))
        book = cur.fetchone()
        if book['quantity'] < item['quantity']:
            raise HTTPException(400, f"Not enough stock for {item['book_isbn']}")
        
        # insert order item
        cur.execute("""
            INSERT INTO order_item (order_id, book_isbn, quantity, price)
            VALUES (%s,%s,%s,%s)
        """, (order_id, item['book_isbn'], item['quantity'], book['selling_price']))
        
        # update book stock
        cur.execute("UPDATE book SET quantity = quantity - %s WHERE isbn=%s",
                    (item['quantity'], item['book_isbn']))
    
    # clear cart
    cur.execute("DELETE FROM cart WHERE customer_id=%s", (customer_id,))
    conn.commit()
    return {"message": "Checkout successful", "order_id": order_id}


# view past orders
@router.get("/history/{customer_id}")
def order_history(customer_id: int):
    conn = get_db()
    cur = conn.cursor(dictionary=True)
    
    cur.execute("""
        SELECT o.order_id, o.order_date, o.arrival_date, o.status,
               oi.book_isbn, b.title, oi.quantity, oi.price
        FROM `order` o
        JOIN order_item oi ON o.order_id = oi.order_id
        JOIN book b ON oi.book_isbn = b.isbn
        WHERE o.customer_id=%s
        ORDER BY o.order_date DESC
    """, (customer_id,))
    
    orders = cur.fetchall()
    
    # group by order_id
    grouped_orders = {}
    for item in orders:
        oid = item['order_id']
        if oid not in grouped_orders:
            grouped_orders[oid] = {
                "order_id": oid,
                "order_date": item['order_date'],
                "arrival_date": item['arrival_date'],
                "status": item['status'],
                "items": []
            }
        grouped_orders[oid]["items"].append({
            "book_isbn": item['book_isbn'],
            "title": item['title'],
            "quantity": item['quantity'],
            "price": item['price']
        })
    
    return list(grouped_orders.values())
