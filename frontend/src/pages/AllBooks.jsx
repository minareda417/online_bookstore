// Example: Fetch and display books
import { useState, useEffect } from 'react';
import axios from 'axios';
import BookCard from './components/BookCard';
import Loader from './Loader';

function AllBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
<<<<<<< HEAD
    const fetch = async () => {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/books/`)
      setData(response.data.data);
    }
    fetch();

  }, [])

  return (
    <div className='bg-zinc-900 h-auto px-4 sm:px-12 py-8'>
      <h4 className='text-3xl text-yellow-100'>All Books</h4>
      {!data &&
        <div className='flex item-center justify-center'>
          <Loader />
        </div>
=======
    const fetchBooks = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/books/`);
        setBooks(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching books:", error);
        alert("Failed to fetch books");
        setLoading(false);
>>>>>>> baeb8237a11dd24355b5059105e4cef13204eff2
      }
    };
    
    fetchBooks();
  }, []);
  
if (loading) {
        return (
            <div className='flex items-center justify-center h-screen'>
                <Loader />
            </div>
        );
    }
    
    return (
        <div className='px-4 py-8'>
            <h1 className='text-3xl font-semibold mb-8'>All Books</h1>
            {books.length === 0 ? (
                <p className='text-zinc-400 text-center'>No books available</p>
            ) : (
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                    {books.map((book, index) => (
                        <BookCard key={index} data={book} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default AllBooks;
