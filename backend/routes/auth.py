from fastapi import APIRouter, HTTPException
from passlib.hash import bcrypt
from db import get_db

router = APIRouter(prefix="/auth", tags=["Auth"])

# customer registration
@router.post("/register")
def register(user: dict):
    conn = get_db()
    cur = conn.cursor()

    # hash password
    hashed_pw = bcrypt.hash(user["password"])

    try:
        cur.execute("""
            INSERT INTO customer
            (first_name, last_name, username, password, email, phone_number, shipping_address)
            VALUES (%s,%s,%s,%s,%s,%s,%s)
        """, (
            user["first_name"],
            user["last_name"],
            user["username"],
            hashed_pw,
            user["email"],
            user.get("phone_number"),
            user.get("shipping_address")
        ))
        conn.commit()
    except Exception as e:
        raise HTTPException(400, f"User could not be created: {e}")

    return {"message": "Customer registered successfully"}


# login for both admin and customer
@router.post("/login")
def login(data: dict):

    conn = get_db()
    cur = conn.cursor(dictionary=True)

    username = data["username"]
    password = data["password"]

    # admin login
    cur.execute("SELECT * FROM admin WHERE username=%s", (username,))
    admin = cur.fetchone()
    if admin and bcrypt.verify(password, admin["password"]):
        return {"user_id": admin["admin_id"], "role": "admin"}

    # customer login
    cur.execute("SELECT * FROM customer WHERE username=%s", (username,))
    customer = cur.fetchone()
    if customer and bcrypt.verify(password, customer["password"]):
        return {"user_id": customer["customer_id"], "role": "customer"}

    raise HTTPException(401, "Invalid username or password")
