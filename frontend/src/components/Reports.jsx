import React, { useState, useEffect } from 'react'
import axios from 'axios'

const Reports = () => {
    const [totalSalesLastMonth, setTotalSalesLastMonth] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [salesOnDate, setSalesOnDate] = useState(null);
    const [topCustomers, setTopCustomers] = useState([]);
    const [topBooks, setTopBooks] = useState([]);
    const [bookIsbn, setBookIsbn] = useState('');
    const [bookOrderCount, setBookOrderCount] = useState(null);
    const [loading, setLoading] = useState(false);

    const headers = {
        id: localStorage.getItem("id"),
        authorization: `Bearer ${localStorage.getItem("token")}`,
    };

    useEffect(() => {
        fetchTotalSalesLastMonth();
        fetchTopCustomers();
        fetchTopBooks();
    }, []);

    const fetchTotalSalesLastMonth = async () => {
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_BASE_URL}/admin/reports/total-sales-last-month`,
                { headers }
            );
            setTotalSalesLastMonth(response.data.total_sales_from_last_month_until_today);
        } catch (error) {
            console.error("Error fetching total sales:", error);
        }
    };

    const fetchSalesOnDate = async () => {
        if (!selectedDate) {
            alert("Please select a date");
            return;
        }
        setLoading(true);
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_BASE_URL}/admin/reports/total-sales?date_str=${selectedDate}`,
                { headers }
            );
            setSalesOnDate(response.data.total_sales_on_day);
        } catch (error) {
            console.error("Error fetching sales on date:", error);
            alert("Failed to fetch sales data");
        } finally {
            setLoading(false);
        }
    };

    const fetchTopCustomers = async () => {
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_BASE_URL}/admin/reports/top-customers`,
                { headers }
            );
            setTopCustomers(response.data);
        } catch (error) {
            console.error("Error fetching top customers:", error);
        }
    };

    const fetchTopBooks = async () => {
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_BASE_URL}/admin/reports/top-books`,
                { headers }
            );
            setTopBooks(response.data);
        } catch (error) {
            console.error("Error fetching top books:", error);
        }
    };

    const fetchBookOrderCount = async () => {
        if (!bookIsbn) {
            alert("Please enter a book ISBN");
            return;
        }
        setLoading(true);
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_BASE_URL}/admin/reports/book-orders-count?isbn=${bookIsbn}`,
                { headers }
            );
            setBookOrderCount(response.data);
        } catch (error) {
            console.error("Error fetching book order count:", error);
            alert("Failed to fetch book order count");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='p-4'>
            <h1 className='text-3xl font-semibold text-zinc-100 mb-6'>Reports</h1>

            {/* Total Sales Last Month */}
            <div className='bg-zinc-800 rounded p-4 mb-6'>
                <h2 className='text-xl font-semibold text-zinc-100 mb-2'>Total Sales (Last Month to Today)</h2>
                {totalSalesLastMonth !== null ? (
                    <p className='text-2xl text-green-400 font-bold'>${totalSalesLastMonth.toFixed(2)}</p>
                ) : (
                    <p className='text-zinc-400'>Loading...</p>
                )}
            </div>

            {/* Sales on Specific Date */}
            <div className='bg-zinc-800 rounded p-4 mb-6'>
                <h2 className='text-xl font-semibold text-zinc-100 mb-3'>Total Sales on Specific Date</h2>
                <div className='flex gap-3 items-end'>
                    <div className='flex-1'>
                        <label className='text-zinc-300 block mb-2'>Select Date</label>
                        <input
                            type='date'
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className='w-full p-2 bg-zinc-900 text-zinc-100 rounded'
                        />
                    </div>
                    <button
                        onClick={fetchSalesOnDate}
                        disabled={loading}
                        className='bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded text-white font-semibold'
                    >
                        Get Sales
                    </button>
                </div>
                {salesOnDate !== null && (
                    <p className='text-xl text-green-400 font-bold mt-3'>${salesOnDate.toFixed(2)}</p>
                )}
            </div>

            {/* Top 5 Customers */}
            <div className='bg-zinc-800 rounded p-4 mb-6'>
                <h2 className='text-xl font-semibold text-zinc-100 mb-3'>Top 5 Customers (Last 3 Months)</h2>
                {topCustomers.length > 0 ? (
                    <div className='overflow-x-auto'>
                        <table className='w-full text-left'>
                            <thead className='bg-zinc-900 text-zinc-400'>
                                <tr>
                                    <th className='p-3'>Rank</th>
                                    <th className='p-3'>Customer Name</th>
                                    <th className='p-3'>Total Spent</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topCustomers.map((customer, index) => (
                                    <tr key={index} className='border-t border-zinc-700'>
                                        <td className='p-3 text-zinc-300'>{index + 1}</td>
                                        <td className='p-3 text-white'>{customer.username}</td>
                                        <td className='p-3 text-green-400 font-semibold'>${customer.total_spent.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className='text-zinc-400'>No data available</p>
                )}
            </div>

            {/* Top 10 Selling Books */}
            <div className='bg-zinc-800 rounded p-4 mb-6'>
                <h2 className='text-xl font-semibold text-zinc-100 mb-3'>Top 10 Selling Books (Last 3 Months)</h2>
                {topBooks.length > 0 ? (
                    <div className='overflow-x-auto'>
                        <table className='w-full text-left'>
                            <thead className='bg-zinc-900 text-zinc-400'>
                                <tr>
                                    <th className='p-3'>Rank</th>
                                    <th className='p-3'>ISBN</th>
                                    <th className='p-3'>Title</th>
                                    <th className='p-3'>Copies Sold</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topBooks.map((book, index) => (
                                    <tr key={index} className='border-t border-zinc-700'>
                                        <td className='p-3 text-zinc-300'>{index + 1}</td>
                                        <td className='p-3 text-zinc-400'>{book.isbn}</td>
                                        <td className='p-3 text-white'>{book.title}</td>
                                        <td className='p-3 text-blue-400 font-semibold'>{book.total_sold}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className='text-zinc-400'>No data available</p>
                )}
            </div>

            {/* Book Replenishment Order Count */}
            <div className='bg-zinc-800 rounded p-4 mb-6'>
                <h2 className='text-xl font-semibold text-zinc-100 mb-3'>Accepted Replenishment Orders Count</h2>
                <p className='text-zinc-400 text-sm mb-3'>Total number of confirmed/accepted replenishment orders for a specific book</p>
                <div className='flex gap-3 items-end'>
                    <div className='flex-1'>
                        <label className='text-zinc-300 block mb-2'>Book ISBN</label>
                        <input
                            type='text'
                            value={bookIsbn}
                            onChange={(e) => setBookIsbn(e.target.value)}
                            placeholder='Enter ISBN'
                            className='w-full p-2 bg-zinc-900 text-zinc-100 rounded'
                        />
                    </div>
                    <button
                        onClick={fetchBookOrderCount}
                        disabled={loading}
                        className='bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded text-white font-semibold'
                    >
                        Get Count
                    </button>
                </div>
                {bookOrderCount && (
                    <p className='text-lg text-zinc-100 mt-3'>
                        ISBN <span className='text-yellow-400'>{bookOrderCount.isbn}</span> has been replenished{' '}
                        <span className='text-green-400 font-bold'>{bookOrderCount.times_ordered}</span> times
                    </p>
                )}
            </div>
        </div>
    );
};

export default Reports;
