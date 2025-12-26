import React, { useEffect, useState } from 'react'
import BookCard from '../components/BookCard.jsx';
import axios from 'axios'
import Loader from '../components/Loader.jsx';
const Allbooks = () => {

  const [data, setData] = useState();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchAllBooks();
  }, [])

  const fetchAllBooks = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/books/`)
      setData(response.data);
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      fetchAllBooks();
      return;
    }

    setIsSearching(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/books/search?q=${encodeURIComponent(searchQuery)}`);
      setData(response.data);
    } catch (error) {
      console.error("Error searching books:", error);
    } finally {
      setIsSearching(false);
    }
  }

  const handleClearSearch = () => {
    setSearchQuery("");
    fetchAllBooks();
  }

  return (
    <div className='bg-zinc-900 h-auto px-4 sm:px-12 py-8'>
      <h4 className='text-3xl text-yellow-100'>All Books</h4>
      
      {/* Search Bar */}
      <div className='mt-6 mb-8'>
        <form onSubmit={handleSearch} className='flex gap-2'>
          <input
            type='text'
            placeholder='Search by title, ISBN, author, or publisher...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='flex-1 bg-zinc-800 text-white px-4 py-3 rounded outline-none border border-zinc-700 focus:border-zinc-500'
          />
          <button
            type='submit'
            className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded font-semibold transition-colors'
            disabled={isSearching}
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
          {searchQuery && (
            <button
              type='button'
              onClick={handleClearSearch}
              className='bg-zinc-700 hover:bg-zinc-600 text-white px-6 py-3 rounded font-semibold transition-colors'
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {!data &&
        <div className='flex item-center justify-center'>
          <Loader />
        </div>
      }

      {data && data.length === 0 && (
        <div className='flex items-center justify-center h-64'>
          <p className='text-zinc-400 text-xl'>No books found</p>
        </div>
      )}

      <div className='my-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 lg:gap-8 '>
        {
          data && data.map((item, index) =>
            <div key={index}>
              <BookCard data={item} />
            </div>)
        }

      </div>
    </div>

  )
}

export default Allbooks;