import React from 'react'
import { Link } from 'react-router-dom';
import axios from 'axios';

const BookCard = (props) => {
  const headers = {
    id: localStorage.getItem("id"),
    authorization: `Bearer ${localStorage.getItem("token")}`,
    bookid: props.data._id
  }
  
  const removeFav = async () => {
    const response = await axios.put(`${process.env.REACT_APP_BASE_URL}/removefav`, {}, { headers });
    alert(response.data.message);
    props.update();
  }
  
  return (
    <div className='bg-zinc-800 rounded p-1 flex flex-col'>
      <Link to={`/getdetails/${props.data._id}`}>
        <div className=''>
          <div className='bg-zinc-900 rounded flex items-center justify-center'>
            <img 
              src={props.data.url} 
              alt={props.data.title} 
              className='h-[15vh] sm:h-[25vh] rounded m-1'
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/150?text=No+Image';
              }}
            />
          </div>
          <h2 className='mt-4 text-lg lg:text-xl text-zinc-200 font-semibold line-clamp-2'>
            {props.data.title}
          </h2>
          <p className='text-zinc-400 font-semibold text-sm lg:text-lg line-clamp-1'>
            {props.data.author}
          </p>
          <div className='flex justify-between items-center mt-2'>
            <p className='text-zinc-200 font-semibold'>₹ {props.data.price}</p>
            <span className={`text-sm px-2 py-1 rounded ${
              props.data.available 
                ? 'bg-green-600 text-white' 
                : 'bg-red-600 text-white'
            }`}>
              {props.data.available ? 'Available' : 'Out of Stock'}
            </span>
          </div>
        </div>
      </Link>
      {
        props.fav &&
        (
          <div className='w-full rounded px-4 py-2 border border-red-200 hover:border-red-400 text-red-200 hover:text-red-400 text-center my-4'>
            <button onClick={removeFav}>Remove</button>
          </div>
        )
      }
    </div>
  )
}

export default BookCard