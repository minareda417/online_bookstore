import React, { useState, useEffect } from 'react'
import Loader from '../components/Loader'
import { MdDelete } from "react-icons/md";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { cartCount } from '../store/cart';
import { useDispatch } from 'react-redux';

const Cart = () => {
  const [cart, setCart] = useState();
  const [total, setTotal] = useState(0);
  const [cardNumber, setCardNumber] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const customerId = localStorage.getItem("id");

  const headers = {
    id: customerId,
    authorization: `Bearer ${localStorage.getItem("token")}`,
  }

  const fetchCart = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/customer/cart/${customerId}`,
        { headers }
      );
      
      // Transform backend data to match frontend format
      const formattedCart = response.data.map(item => ({
        title: item.title,
        quantity: item.quantity,
        unit_price: item.price,
        price: item.total_price,
      }));
      
      setCart(formattedCart);
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCart([]);
    }
  }

  useEffect(() => {
    fetchCart();
  }, []);

  const removeCart = async (bookIsbn) => {
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_BASE_URL}/customer/cart/${customerId}/${bookIsbn}`,
        { headers }
      );
      
      alert(response.data.message);
      fetchCart(); // Refresh cart
      
      // Update cart count in Redux
      const updatedCart = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/customer/cart/${customerId}`,
        { headers }
      );
      dispatch(cartCount(updatedCart.data.length));
    } catch (error) {
      console.error("Error removing item:", error);
      alert(error.response?.data?.detail || "Failed to remove item");
    }
  }

  useEffect(() => {
    if (cart && cart.length > 0) {
      let Total = 0;
      cart.forEach((item) => {
        Total += item.price;
      });
      setTotal(Total);
    }
  }, [cart])

  const placeOrder = async () => {
    if (!cardNumber) {
      alert("Please enter your credit card number");
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/customer/checkout/${customerId}?card_number=${cardNumber}`,
        {},
        { headers }
      );
      
      alert(response.data.message);
      dispatch(cartCount(0));
      navigate('/profile/orderhistory');
    } catch (error) {
      console.error("Error placing order:", error);
      alert(error.response?.data?.detail || "Failed to place order");
    }
  }

  return (
    <div className='bg-zinc-900 py-4'>
      <p className='mx-4 text-3xl font-semibold text-zinc-200 p-2'>Your Cart</p>
      
      {!cart && (
        <div className='h-screen flex items-center justify-center'>
          <Loader />
        </div>
      )}
      
      {cart && cart.length === 0 && (
        <div className='h-screen flex items-center justify-center'>
          <h1 className='text-2xl text-zinc-700 font-semibold'>Empty Cart</h1>
        </div>
      )}
      
      {cart && cart.length > 0 && (
        <>
          {cart.map((item, index) => (
            <div key={index} className='flex items-center justify-between bg-zinc-800 text-white m-2 rounded sm:px-12 sm:mx-12'>
              <div className='w-1/6'>
              </div>
              <div className='flex flex-col items-start w-4/6'>
                <p className='font-semibold text-md sm:text-xl'>{item.title}</p>
                <p className='text-zinc-400 text-xs sm:text-sm mt-1'>
                  Quantity: {item.quantity}
                </p>
              </div>
              <div className='flex w-1/6 justify-around text-xs sm:text-lg items-center'>
                <p>₹ {item.price.toFixed(2)}</p>
              </div>
              <div className='flex w-1/6 justify-around text-xs sm:text-lg items-center'>
                <p>₹ {item.total_price.toFixed(2)}</p>
                <button 
                  onClick={() => removeCart(item._id)} 
                  className='sm:text-2xl text-red-500 hover:text-red-700'
                >
                  <MdDelete />
                </button>
              </div>
            </div>
          ))}
          
          <div className='flex justify-end px-2 sm:px-12 mt-8'>
            <div className='bg-zinc-800 text-white px-4 py-4 sm:mx-12 sm:px-8 sm:py-6 rounded w-full sm:w-auto'>
              <p className='font-semibold text-lg sm:text-2xl text-zinc-400 mb-4'>Order Summary</p>
              
              <div className='flex justify-between my-2 text-zinc-300'>
                <p>{cart.length} book{cart.length > 1 ? 's' : ''}</p>
                <p>₹ {total.toFixed(2)}</p>
              </div>
              
              <div className='my-4'>
                <label htmlFor='cardNumber' className='text-zinc-400 text-sm block mb-2'>
                  Credit Card Number
                </label>
                <input
                  type='text'
                  id='cardNumber'
                  placeholder='Enter card number'
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className='w-full bg-zinc-900 text-white px-3 py-2 rounded border border-zinc-700 focus:border-zinc-500 outline-none'
                  maxLength='16'
                />
              </div>
              
              <div className='flex justify-center mt-4'>
                <button 
                  className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 sm:px-8 sm:py-3 rounded font-semibold transition-colors'
                  onClick={placeOrder}
                >
                  Place Order
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Cart