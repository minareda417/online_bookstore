import React, { useEffect, useState } from 'react'
import Loader from './Loader'
import axios from 'axios'
const OrderHistory = () => {

  const [orderhistory, setorderhistory] = useState()

  const headers = {
    id: localStorage.getItem("id"),
    authorization: `Bearer ${localStorage.getItem("token")}`,
  }

  const fetch = async () => {
    const customerId = localStorage.getItem("id");
    const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/customer/history?customer_id=${customerId}`);
    setorderhistory(response.data.data);
    // console.log(response.data.data);
  };
  useEffect(() => {
    fetch();
  }, []);

  return (
    <div >

      {!orderhistory &&
        <div className='w-full h-screen flex items-center justify-center'><Loader /></div>
      }
      <p className='text-2xl font-semibold mx-2 my-4 '>My Orders</p>
      <div className='overflow-x-auto'>
        {
          orderhistory && orderhistory.length === 0 &&
          <div className='w-full mt-16 text-zinc-700 flex items-center justify-center'>
            <p >No Order History</p>
          </div>
        }
        {
          orderhistory && orderhistory.length > 0 &&
          orderhistory.map((order, orderIndex) => (
            <div key={orderIndex} className='mb-6 mx-2'>
              {/* Order Header */}
              <div className='bg-zinc-700 p-3 rounded-t flex justify-between items-center'>
                <div>
                  <span className='font-semibold text-white'>Order #{order.order_id}</span>
                  <span className='text-zinc-300 ml-4 text-sm'>Date: {order.order_date}</span>
                </div>
                <div className='flex items-center gap-4'>
                  {order.status === "delivered" ? (
                    <span className='text-green-500 font-semibold'>{order.status}</span>
                  ) : order.status === "pending" ? (
                    <span className='text-yellow-500 font-semibold'>{order.status}</span>
                  ) : (
                    <span className='text-red-500 font-semibold'>{order.status}</span>
                  )}
                  <span className='text-white font-semibold'>Total: ${order.total_price.toFixed(2)}</span>
                </div>
              </div>

              {/* Order Items Table */}
              <div className='bg-zinc-800 rounded-b overflow-hidden'>
                <table className='w-full text-left text-sm'>
                  <thead className='bg-zinc-900 text-zinc-400'>
                    <tr>
                      <th className='p-3'>ISBN</th>
                      <th className='p-3'>Book Name</th>
                      <th className='p-3 text-center'>Quantity</th>
                      <th className='p-3 text-right'>Unit Price</th>
                      <th className='p-3 text-right'>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, itemIndex) => (
                      <tr key={itemIndex} className='border-t border-zinc-700'>
                        <td className='p-3 text-zinc-300'>{item.isbn}</td>
                        <td className='p-3 text-white'>{item.title}</td>
                        <td className='p-3 text-center text-zinc-300'>{item.quantity}</td>
                        <td className='p-3 text-right text-zinc-300'>${item.price.toFixed(2)}</td>
                        <td className='p-3 text-right text-white font-semibold'>${item.item_total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

export default OrderHistory