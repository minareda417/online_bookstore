import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Loader from './Loader'

const ReplenishmentOrders = () => {
    const [orders, setOrders] = useState();

    const headers = {
        id: localStorage.getItem("id"),
        authorization: `Bearer ${localStorage.getItem("token")}`,
    }

    const fetch = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/admin/replenishment/`, { headers });
            setOrders(response.data.replenishment_orders);
        } catch (error) {
            console.error("Error fetching replenishment orders:", error);
            setOrders([]);
        }
    };

    const updateOrderStatus = async (publisherId, bookIsbn, status) => {
        try {
            await axios.put(
                `${process.env.REACT_APP_BASE_URL}/admin/replenishment/update-status?publisher_id=${publisherId}&book_isbn=${bookIsbn}&status=${status}`,
                {},
                { headers }
            );
            alert(`Replenishment order ${status} successfully`);
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
            {!orders && (
                <div className='w-full h-screen flex items-center justify-center'>
                    <Loader />
                </div>
            )}

            <p className='text-2xl font-semibold mx-2 my-4'>Replenishment Orders</p>
            
            <div className='overflow-x-auto'>
                {orders && orders.length === 0 && (
                    <div className='w-full mt-16 text-zinc-700 flex items-center justify-center'>
                        <p>No Replenishment Orders</p>
                    </div>
                )}

                {orders && orders.length > 0 && (
                    <div className='bg-zinc-800 mx-2 rounded'>
                        <table className='w-full text-left text-sm'>
                            <thead className='bg-zinc-900 text-zinc-400'>
                                <tr>
                                    <th className='p-3'>Publisher ID</th>
                                    <th className='p-3'>Book ISBN</th>
                                    <th className='p-3'>Send Date</th>
                                    <th className='p-3'>Receive Date</th>
                                    <th className='p-3 text-center'>Quantity</th>
                                    <th className='p-3'>Status</th>
                                    <th className='p-3 text-center'>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order, index) => (
                                    <tr key={index} className='border-t border-zinc-700'>
                                        <td className='p-3 text-zinc-300'>{order.publisher_id}</td>
                                        <td className='p-3 text-white'>{order.book_isbn}</td>
                                        <td className='p-3 text-zinc-300'>{order.send_date}</td>
                                        <td className='p-3 text-zinc-300'>{order.receive_date || 'N/A'}</td>
                                        <td className='p-3 text-center text-zinc-300'>{order.quantity}</td>
                                        <td className='p-3'>
                                            {order.status === "confirmed" ? (
                                                <span className='text-green-500 font-semibold'>{order.status}</span>
                                            ) : order.status === "pending" ? (
                                                <span className='text-yellow-500 font-semibold'>{order.status}</span>
                                            ) : (
                                                <span className='text-red-500 font-semibold'>{order.status}</span>
                                            )}
                                        </td>
                                        <td className='p-3'>
                                            {order.status === "pending" && (
                                                <div className='flex gap-2 justify-center'>
                                                    <button
                                                        onClick={() => updateOrderStatus(order.publisher_id, order.book_isbn, "confirmed")}
                                                        className='bg-green-600 hover:bg-green-700 px-4 py-1 rounded text-sm'
                                                    >
                                                        Accept
                                                    </button>
                                                    <button
                                                        onClick={() => updateOrderStatus(order.publisher_id, order.book_isbn, "cancelled")}
                                                        className='bg-red-600 hover:bg-red-700 px-4 py-1 rounded text-sm'
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                            {order.status !== "pending" && (
                                                <span className='text-zinc-500 text-center block'>No actions</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ReplenishmentOrders
