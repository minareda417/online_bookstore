from fastapi import APIRouter, HTTPException
import hashlib
from db import get_db
from schemas import RegisterCustomer, Login, LoginResponse

router = APIRouter(prefix="/auth", tags=["Auth"])

# customer registration
@router.post("/register")
def register(user: RegisterCustomer):
    conn = get_db()
    cur = conn.cursor()

    # check if username exists
    cur.execute("SELECT COUNT(*) FROM customer WHERE username=%s", 
                (user.username,))
    
    if cur.fetchone() is not None:
        raise HTTPException(400, "Username already exists")
    
    # check if email exists
    cur.execute("SELECT COUNT(*) FROM customer WHERE email=%s", 
                (user.email,))
    if cur.fetchone() is not None:
        raise HTTPException(400, "Email already exists")

    # hash password
    hashed_pw = hashlib.sha256(user.password.encode()).hexdigest()

    try:
        cur.execute("""
            INSERT INTO customer
            (first_name, last_name, username, password, email, phone_number, shipping_address)
            VALUES (%s,%s,%s,%s,%s,%s,%s)
        """, (
            user.first_name,
            user.last_name,
            user.username,
            hashed_pw,
            user.email,
            user.phone_number,
            user.shipping_address
        ))
        conn.commit()
    except Exception as e:
        raise HTTPException(400, f"User could not be created: {e}")

    return {"message": "Customer registered successfully"}


# login for both admin and customer
@router.post("/login")
def login(data: Login)-> LoginResponse:

    conn = get_db()
    cur = conn.cursor(dictionary=True)

    username = data.username
    password = data.password

    # admin login
    cur.execute("SELECT * FROM admin WHERE username=%s", (username,))
    admin = cur.fetchone()
    if admin and hashlib.sha256(password.encode()).hexdigest() == admin["password"]:
        return LoginResponse(user_id=admin["admin_id"], role="admin")

    # customer login
    cur.execute("SELECT * FROM customer WHERE username=%s", (username,))
    customer = cur.fetchone()
    if customer and hashlib.sha256(password.encode()).hexdigest() == customer["password"]:
        return LoginResponse(user_id=customer["customer_id"], role="customer")

    raise HTTPException(401, "Invalid username or password")
