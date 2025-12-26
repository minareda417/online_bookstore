from fastapi import APIRouter, HTTPException, Query, Header
from db import get_db
from schemas import CartItemCreate, CustomerUpdate,CreditCardCreate
from datetime import date,datetime
import hashlib
import os

router = APIRouter(prefix="/customer", tags=["Customer"])

# get customer info
@router.get("/getuserinfo")
def get_user_info(customer_id: int = Query(..., alias="id")):
    conn = get_db()
    cur = conn.cursor(dictionary=True)
    
    try:
        cur.execute("""
            SELECT customer_id, username, email, phone_number, 
                   first_name, last_name, shipping_address
            FROM customer
            WHERE customer_id = %s
        """, (customer_id,))
        
        customer = cur.fetchone()
        if not customer:
            raise HTTPException(404, "Customer not found")
        
        # Add a default avatar
        customer['avatar'] = 'https://cdn-icons-png.flaticon.com/128/3177/3177440.png'
        
        return {"data": customer}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error fetching customer info: {str(e)}")
    finally:
        cur.close()
        conn.close()

@router.post("/add-credit-card/{customer_id}")
def add_credit_card(customer_id: int, card: CreditCardCreate):
    conn = get_db()
    cur = conn.cursor()

    # validate card length
    if len(card.card_number) not in [15, 16]:
        raise HTTPException(400, "Invalid credit card number length")
    
    # validate expiry date format
    try:
        exp_date = datetime.strptime(card.expiry_date, "%m/%y")
        exp_date_db = exp_date.strftime("%Y-%m-%d") 
    except ValueError:
        raise HTTPException(400, "Expiry date must be in MM/YY format")
    
    try:
        cur.execute("""
            INSERT INTO credit_card (card_number, customer_id, expiration_date)
            VALUES (%s, %s, %s)
        """, (card.card_number, customer_id, exp_date_db))
        conn.commit()
    except Exception as e:
        raise HTTPException(400, f"Error adding card: {str(e)}")
    
    return {"message": "Credit card added successfully"}

# get customer credit cards
@router.get("/credit-cards/{customer_id}")
def get_credit_cards(customer_id: int):
    conn = get_db()
    cur = conn.cursor(dictionary=True)
    
    try:
        cur.execute("""
            SELECT card_number, expiration_date
            FROM credit_card
            WHERE customer_id = %s
        """, (customer_id,))
        
        cards = cur.fetchall()
        
        # Mask card numbers for security (show only last 4 digits)
        for card in cards:
            card['masked_number'] = '**** **** **** ' + card['card_number'][-4:]
            card['expiry_date'] = card['expiration_date'].strftime("%m/%y")
            del card['expiration_date']
        
        return {"data": cards}
    except Exception as e:
        raise HTTPException(500, f"Error fetching credit cards: {str(e)}")
    finally:
        cur.close()
        conn.close()

# add book to cart
@router.post("/addtocart")
def add_to_cart(cart_item: CartItemCreate):
    conn = get_db()
    cur = conn.cursor()

    # get available stock
    cur.execute(
        "SELECT quantity FROM book WHERE isbn = %s",
        (cart_item.book_isbn,)
    )
    book = cur.fetchone()

    if not book:
        raise HTTPException(404, "Book not found")

    available_stock = book[0]

    # check existing cart quantity
    cur.execute(
        "SELECT quantity FROM cart WHERE customer_id=%s AND book_isbn=%s",
        (cart_item.customer_id, cart_item.book_isbn)
    )
    existing = cur.fetchone()

    current_qty = existing[0] if existing else 0
    requested_total = current_qty + cart_item.quantity

    if requested_total > available_stock:
        raise HTTPException(
            status_code=400,
            detail=f"Only {available_stock} items available"
        )

    if existing:
        cur.execute(
            "UPDATE cart SET quantity=%s WHERE customer_id=%s AND book_isbn=%s",
            (requested_total, cart_item.customer_id, cart_item.book_isbn)
        )
    else:
        cur.execute(
            "INSERT INTO cart (customer_id, book_isbn, quantity) VALUES (%s,%s,%s)",
            (cart_item.customer_id, cart_item.book_isbn, cart_item.quantity)
        )

    conn.commit()
    return {"message": "Book added to cart"}


# update cart quantity
@router.put("/update-cart-quantity")
def update_cart_quantity(customer_id: int, book_isbn: str, quantity: int):
    conn = get_db()
    cur = conn.cursor()

    if quantity < 1:
        raise HTTPException(400, "Quantity must be at least 1")

    # Check available stock
    cur.execute("SELECT quantity FROM book WHERE isbn = %s", (book_isbn,))
    book = cur.fetchone()

    if not book:
        raise HTTPException(404, "Book not found")

    if quantity > book[0]:
        raise HTTPException(400, f"Only {book[0]} items available")

    # Update cart quantity
    cur.execute(
        "UPDATE cart SET quantity=%s WHERE customer_id=%s AND book_isbn=%s",
        (quantity, customer_id, book_isbn)
    )
    
    conn.commit()
    return {"message": "Cart quantity updated"}


# view cart
@router.get("/view-cart")
def view_cart(customer_id: int):
    conn = get_db()
    cur = conn.cursor(dictionary=True)

    cur.execute("""
        SELECT b.isbn, b.title, c.quantity, b.selling_price,
               c.quantity * b.selling_price AS total_price
        FROM cart c
        JOIN book b ON c.book_isbn = b.isbn
        WHERE c.customer_id = %s
    """, (customer_id,))

    return cur.fetchall()


# delete item from cart
@router.delete("/remove-from-cart")
def remove_from_cart(customer_id: int, book_isbn: str):
    conn = get_db()
    cur = conn.cursor()
    
    cur.execute("DELETE FROM cart WHERE customer_id=%s AND book_isbn=%s",
                (customer_id, book_isbn))
    conn.commit()
    return {"message": "Item removed from cart"}

# checkout
@router.post("/checkout/{customer_id}")
def checkout(customer_id: int, card_number: str):
    conn = get_db()
    cur = conn.cursor(dictionary=True)

    # fetch credit card
    cur.execute("""
        SELECT * FROM credit_card
        WHERE customer_id=%s AND card_number=%s
    """, (customer_id, card_number))
    card = cur.fetchone()
    if not card:
        raise HTTPException(400, "Credit card not found")

    # check if expired
    if datetime.now().date() > card['expiration_date']:
        raise HTTPException(400, "Credit card has expired")

    # get cart items
    cur.execute("SELECT * FROM cart WHERE customer_id=%s", (customer_id,))
    cart_items = cur.fetchall()
    if not cart_items:
        raise HTTPException(400, "Cart is empty")

    # check stock for all items
    for item in cart_items:
        cur.execute("SELECT quantity, selling_price FROM book WHERE isbn=%s", (item['book_isbn'],))
        book = cur.fetchone()
        if not book:
            raise HTTPException(400, f"Book {item['book_isbn']} not found")
        if int(book['quantity']) < int(item['quantity']):
            raise HTTPException(400, f"Not enough stock for {item['book_isbn']}")

    # insert order
    cur.execute("INSERT INTO `order` (customer_id) VALUES (%s)", (customer_id,))
    order_id = cur.lastrowid

    # insert order items and update stock
    for item in cart_items:
        cur.execute("""
            INSERT INTO order_item (order_id, book_isbn, quantity, price)
            VALUES (%s,%s,%s,%s)
        """, (order_id, item['book_isbn'], item['quantity'], book['selling_price']))
        cur.execute("UPDATE book SET quantity = quantity - %s WHERE isbn=%s",
                    (item['quantity'], item['book_isbn']))

    # clear cart
    cur.execute("DELETE FROM cart WHERE customer_id=%s", (customer_id,))
    conn.commit()

    return {"message": "Checkout successful", "order_id": order_id}


# view past orders
@router.get("/history")
def order_history(customer_id: int):
    conn = get_db()
    cur = conn.cursor(dictionary=True)
    
    cur.execute("""
        SELECT o.order_id, o.order_date, o.arrival_date, o.status,
               oi.book_isbn, b.title, b.description, oi.quantity, oi.price,
               (oi.quantity * oi.price) as item_total
        FROM `order` o
        JOIN order_item oi ON o.order_id = oi.order_id
        JOIN book b ON oi.book_isbn = b.isbn
        WHERE o.customer_id=%s
        ORDER BY o.order_date DESC, o.order_id
    """, (customer_id,))
    
    orders = cur.fetchall()
    
    # Group by order_id and calculate total
    grouped_orders = {}
    for item in orders:
        oid = item['order_id']
        if oid not in grouped_orders:
            grouped_orders[oid] = {
                "order_id": oid,
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


@router.put("/update-data")
def update_customer_data(customer_id: int, update: CustomerUpdate):
    conn = get_db()
    cur = conn.cursor(dictionary=True)
    
    fields = []
    values = []
    
    # handle password update separately
    if update.new_password is not None:
        if update.prev_password is None:
            raise HTTPException(400, "Previous password is required to update password")
        
        # verify previous password
        cur.execute("SELECT password FROM customer WHERE customer_id=%s", (customer_id,))
        customer = cur.fetchone()
        if not customer:
            raise HTTPException(404, "Customer not found")
        
        hashed_prev = hashlib.sha256(update.prev_password.encode()).hexdigest()
        if hashed_prev != customer["password"]:
            raise HTTPException(400, "Previous password is incorrect")
        
        # hash new password
        hashed_new = hashlib.sha256(update.new_password.encode()).hexdigest()
        fields.append("password=%s")
        values.append(hashed_new)
    
    if update.first_name is not None:
        fields.append("first_name=%s")
        values.append(update.first_name)
    if update.last_name is not None:
        fields.append("last_name=%s")
        values.append(update.last_name)
    if update.email is not None:
        fields.append("email=%s")
        values.append(update.email)
    if update.phone_number is not None:
        fields.append("phone_number=%s")
        values.append(update.phone_number)
    if update.shipping_address is not None:
        fields.append("shipping_address=%s")
        values.append(update.shipping_address)
    
    
    if not fields:
        raise HTTPException(400, "No fields to update")
    
    values.append(customer_id)
    sql = f"UPDATE customer SET {', '.join(fields)} WHERE customer_id=%s"
    
    cur.execute(sql, tuple(values))
    conn.commit()
    
    return {"message": "Customer data updated successfully"}

# logout customer
@router.post("/logout/{customer_id}")
def logout(customer_id: int):
    conn = get_db()
    cur = conn.cursor()
    
    # clear the customer's cart
    cur.execute("DELETE FROM cart WHERE customer_id=%s", (customer_id,))
    conn.commit()
    
    return {"message": "Customer logged out and cart cleared successfully"}
