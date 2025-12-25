from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import books, customer, admin, auth

app = FastAPI(title="Online Bookstore")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
def root():
    return {"message": "Online Bookstore API is running"}

app.include_router(auth.router)
app.include_router(books.router)
app.include_router(customer.router)
app.include_router(admin.router)
