from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import date
from enum import Enum

# authorization
class UserRole(str, Enum):
    ADMIN = "admin"
    CUSTOMER = "customer"


class RegisterCustomer(BaseModel):
    first_name: str
    last_name: str
    username: str
    password: str
    email: EmailStr
    phone_number: Optional[str] = None
    shipping_address: Optional[str] = None


class Login(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    user_id: int
    role: UserRole


# books
class BookBase(BaseModel):
    isbn: str
    title: str
    publisher_id: Optional[int]
    publication_year: Optional[int]
    selling_price: float
    category_id: Optional[int]
    threshold: Optional[int] = 10
    quantity: Optional[int] = 0
    description: Optional[str] = None
    cover_photo: Optional[str] = None


class BookCreate(BookBase):
    authors: List[int]


class BookUpdate(BaseModel):
    title: Optional[str]
    selling_price: Optional[float]
    quantity: Optional[int]

# cart
class CartItemCreate(BaseModel):
    customer_id: int
    book_isbn: str
    quantity: int

# orders
class Checkout(BaseModel):
    card_number: str
    expiry: str  #


# customer profile
class CustomerUpdate(BaseModel):
    first_name: Optional[str]
    last_name: Optional[str]
    email: Optional[EmailStr]
    phone_number: Optional[str]
    shipping_address: Optional[str]
