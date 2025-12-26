import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import { Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import Loader from '../components/Loader'

const Dashboard = () => {
  const [adminData, setAdminData] = useState()
  const isLoggedIn = useSelector((state) => (state.auth.isLoggedIn));

  useEffect(() => {
    const fetch = async () => {
      const adminId = localStorage.getItem("id");
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/admin/getadmininfo?admin_id=${adminId}`);
        setAdminData({
          username: response.data.username,
          email: response.data.email,
          avatar: "https://cdn-icons-png.flaticon.com/128/3135/3135715.png"
        });
      } catch (error) {
        console.error("Error fetching admin info:", error);
        // Fallback to mock data if fetch fails
        setAdminData({
          username: "Admin",
          email: "admin@bookstore.com",
          avatar: "https://cdn-icons-png.flaticon.com/128/3135/3135715.png"
        });
      }
    }
    fetch()
  }, [])

  return (
    <div className='bg-zinc-900 px-2 py-2 flex flex-col gap-4 text-white'>
      {!adminData &&
        <div className='w-full h-screen flex items-center justify-center'><Loader /></div>
      }
      {adminData &&
        <div className='flex flex-col sm:flex-row'>
          <div className='w-full sm:w-2/6 lg:w-1/6 sm:h-screen'>
            <Sidebar data={adminData} />
          </div>
          <div className='w-full sm:w-4/6 lg:w-5/6'>
            <Outlet />
          </div>
        </div>
      }
    </div>
  )
}

export default Dashboard
