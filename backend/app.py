from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from routes import books, customer, admin, auth

app = FastAPI(title="Online Bookstore")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Online Bookstore API is running"}

# Mount static files for book covers
book_covers_path = "C:/Users/Omar Hekal/Downloads/data/book_covers"
if os.path.exists(book_covers_path):
    app.mount("/covers", StaticFiles(directory=book_covers_path), name="covers")

app.include_router(auth.router)
app.include_router(books.router)
app.include_router(customer.router)
app.include_router(admin.router)
app.include_router(admin.router)
