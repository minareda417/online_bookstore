import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../components/Loader.jsx";
import { useNavigate } from "react-router-dom";
import { MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";

const AdminDashboard = () => {
  const [books, setBooks] = useState();
  const navigate = useNavigate();

  const fetchBooks = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/books/`);
      setBooks(response.data);
    } catch (error) {
      console.error("Failed to fetch books:", error);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const deleteBook = async (isbn) => {
    const confirmDelete = prompt("Type 'confirm' to delete the book");
    if (confirmDelete !== "confirm") return;

    try {
      const headers = {
        id: localStorage.getItem("id"),
        authorization: `Bearer ${localStorage.getItem("token")}`,
      };
      await axios.delete(`${process.env.REACT_APP_BASE_URL}/deletebook`, {
        headers,
        data: { book_isbn: isbn },
      });
      alert("Book deleted successfully");
      fetchBooks(); // refresh list
    } catch (error) {
      alert("Failed to delete book");
    }
  };

  const updateBook = (isbn) => {
    navigate(`/updatebook/${isbn}`);
  };

  if (!books) return <Loader />;

  return (
    <div className="bg-zinc-900 min-h-screen px-8 py-6">
      <h2 className="text-3xl text-yellow-100 mb-6">Admin Dashboard - Books</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {books.map((book) => (
          <div key={book.isbn} className="bg-zinc-800 rounded p-4 flex flex-col justify-between">
            <img src={book.url} alt={book.title} className="h-40 object-cover rounded" />
            <h3 className="text-white font-semibold mt-2">{book.title}</h3>
            <p className="text-zinc-400 mt-1">by {book.author}</p>
            <p className="text-zinc-200 mt-1">₹ {book.selling_price}</p>
            <div className="flex mt-2 justify-between">
              <button
                className="bg-white text-zinc-800 px-2 py-1 rounded flex items-center gap-1"
                onClick={() => updateBook(book.isbn)}
              >
                <FaEdit /> Edit
              </button>
              <button
                className="bg-white text-red-500 px-2 py-1 rounded flex items-center gap-1"
                onClick={() => deleteBook(book.isbn)}
              >
                <MdDelete /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
