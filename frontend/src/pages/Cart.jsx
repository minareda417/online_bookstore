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
  const [creditCards, setCreditCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState("");
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
        `${process.env.REACT_APP_BASE_URL}/customer/view-cart?customer_id=${customerId}`,
        { headers }
      );
      
      setCart(response.data);
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCart([]);
    }
  }

  const fetchCreditCards = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/customer/credit-cards/${customerId}`
      );
      setCreditCards(response.data.data);
      // Auto-select first card if available
      if (response.data.data.length > 0) {
        setSelectedCard(response.data.data[0].card_number);
      }
    } catch (error) {
      console.error("Error fetching credit cards:", error);
      setCreditCards([]);
    }
  }

  useEffect(() => {
    fetchCart();
    fetchCreditCards();
  }, []);

  const removeCart = async (bookIsbn) => {
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_BASE_URL}/customer/remove-from-cart?customer_id=${customerId}&book_isbn=${bookIsbn}`,
        { headers }
      );
      
      alert(response.data.message);
      fetchCart(); // Refresh cart
      
      // Update cart count in Redux
      const updatedCart = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/customer/view-cart?customer_id=${customerId}`,
        { headers }
      );
      dispatch(cartCount(updatedCart.data.length));
    } catch (error) {
      console.error("Error removing item:", error);
      alert(error.response?.data?.detail || "Failed to remove item");
    }
  }

  const updateQuantity = async (bookIsbn, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      await axios.put(
        `${process.env.REACT_APP_BASE_URL}/customer/update-cart-quantity?customer_id=${customerId}&book_isbn=${bookIsbn}&quantity=${newQuantity}`,
        {},
        { headers }
      );
      fetchCart(); // Refresh cart
    } catch (error) {
      console.error("Error updating quantity:", error);
      alert(error.response?.data?.detail || "Failed to update quantity");
    }
  }

  useEffect(() => {
    if (cart && cart.length > 0) {
      let Total = 0;
      cart.forEach((item) => {
        Total += item.total_price;
      });
      setTotal(Total);
    }
  }, [cart])

  const placeOrder = async () => {
    if (!selectedCard) {
      alert("Please select a credit card");
      return;
    }

    if (creditCards.length === 0) {
      alert("Please add a credit card in Settings before placing an order");
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/customer/checkout/${customerId}?card_number=${selectedCard}`,
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
                <div className='flex items-center gap-2 mt-2'>
                  <button 
                    onClick={() => updateQuantity(item.isbn, item.quantity - 1)}
                    className='bg-zinc-700 hover:bg-zinc-600 text-white px-2 py-1 rounded text-sm'
                  >
                    -
                  </button>
                  <p className='text-zinc-400 text-xs sm:text-sm'>
                    Quantity: {item.quantity}
                  </p>
                  <button 
                    onClick={() => updateQuantity(item.isbn, item.quantity + 1)}
                    className='bg-zinc-700 hover:bg-zinc-600 text-white px-2 py-1 rounded text-sm'
                  >
                    +
                  </button>
                </div>
              </div>
              <div className='flex w-1/6 justify-around text-xs sm:text-lg items-center'>
                <p>$ {item.selling_price ? item.selling_price.toFixed(2) : '0.00'}</p>
              </div>
              <div className='flex w-1/6 justify-around text-xs sm:text-lg items-center'>
                <p>$ {item.total_price ? item.total_price.toFixed(2) : '0.00'}</p>
                <button 
                  onClick={() => removeCart(item.isbn)} 
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
                <p>$ {total.toFixed(2)}</p>
              </div>
              
              <div className='my-4'>
                <label className='text-zinc-400 text-sm block mb-2'>
                  Select Payment Method
                </label>
                
                {creditCards.length === 0 ? (
                  <div className='bg-zinc-900 text-zinc-400 px-3 py-3 rounded border border-zinc-700'>
                    <p className='text-sm'>No credit cards available.</p>
                    <button 
                      onClick={() => navigate('/profile/setting')}
                      className='text-blue-400 hover:text-blue-300 text-sm mt-2 underline'
                    >
                      Add a card in Settings
                    </button>
                  </div>
                ) : (
                  <div className='space-y-2'>
                    {creditCards.map((card, index) => (
                      <label 
                        key={index}
                        className={`flex items-center justify-between bg-zinc-900 px-3 py-3 rounded border cursor-pointer transition-colors ${
                          selectedCard === card.card_number 
                            ? 'border-blue-500 bg-zinc-800' 
                            : 'border-zinc-700 hover:border-zinc-600'
                        }`}
                      >
                        <div className='flex items-center gap-3'>
                          <input
                            type='radio'
                            name='creditCard'
                            value={card.card_number}
                            checked={selectedCard === card.card_number}
                            onChange={(e) => setSelectedCard(e.target.value)}
                            className='w-4 h-4'
                          />
                          <div>
                            <p className='text-white font-mono text-sm'>{card.masked_number}</p>
                            <p className='text-zinc-500 text-xs'>Expires: {card.expiry_date}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              
              <div className='flex justify-center mt-4'>
                <button 
                  className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 sm:px-8 sm:py-3 rounded font-semibold transition-colors disabled:bg-zinc-700 disabled:cursor-not-allowed'
                  onClick={placeOrder}
                  disabled={creditCards.length === 0}
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