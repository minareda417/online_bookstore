import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Loader from './Loader'

const AllOrders = () => {
    const [allorders, setAllOrders] = useState();

    const headers = {
        id: localStorage.getItem("id"),
        authorization: `Bearer ${localStorage.getItem("token")}`,
    }

    const fetch = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/admin/orders`, { headers });
            setAllOrders(response.data.data);
        } catch (error) {
            console.error("Error fetching orders:", error);
            setAllOrders([]);
        }
    };

    const updateOrderStatus = async (orderId, status) => {
        try {
            await axios.put(
                `${process.env.REACT_APP_BASE_URL}/admin/update-order-status?order_id=${orderId}&status=${status}`,
                {},
                { headers }
            );
            alert(`Order ${status} successfully`);
            fetch(); // Refresh orders
        } catch (error) {
            console.error("Error updating order:", error);
            alert(error.response?.data?.detail || "Failed to update order");
        }
    };

    useEffect(() => {
        const adminId = localStorage.getItem("id");
        const role = localStorage.getItem("role");
        if (adminId && role === "admin") {
            fetch();
        }
    }, [])

    return (
        <div>
            {!allorders && (
                <div className='w-full h-screen flex items-center justify-center'>
                    <Loader />
                </div>
            )}

            <p className='text-2xl font-semibold mx-2 my-4'>All Orders</p>
            
            <div className='overflow-x-auto'>
                {allorders && allorders.length === 0 && (
                    <div className='w-full mt-16 text-zinc-700 flex items-center justify-center'>
                        <p>No Orders</p>
                    </div>
                )}

                {allorders && allorders.length > 0 &&
                    allorders.map((order, orderIndex) => (
                        <div key={orderIndex} className='mb-6 mx-2'>
                            {/* Order Header */}
                            <div className='bg-zinc-700 p-3 rounded-t flex justify-between items-center'>
                                <div>
                                    <span className='font-semibold text-white'>Order #{order.order_id}</span>
                                    <span className='text-zinc-300 ml-4 text-sm'>Customer: {order.username}</span>
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
                                    
                                    {/* Action Buttons - only show for pending orders */}
                                    {order.status === "pending" && (
                                        <div className='flex gap-2'>
                                            <button
                                                onClick={() => updateOrderStatus(order.order_id, "delivered")}
                                                className='bg-green-600 hover:bg-green-700 px-4 py-1 rounded text-sm'
                                            >
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => updateOrderStatus(order.order_id, "cancelled")}
                                                className='bg-red-600 hover:bg-red-700 px-4 py-1 rounded text-sm'
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
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

export default AllOrders