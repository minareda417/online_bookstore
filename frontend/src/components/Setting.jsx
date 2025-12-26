import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Loader from './Loader'

const Setting = () => {
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [customerData, setCustomerData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    shipping_address: ''
  })
  const [passwordData, setPasswordData] = useState({
    prev_password: '',
    new_password: '',
    confirm_password: ''
  })

  useEffect(() => {
    fetchCustomerData()
  }, [])

  const fetchCustomerData = async () => {
    try {
      const customerId = localStorage.getItem("id")
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/customer/getuserinfo?id=${customerId}`)
      const data = response.data.data
      setCustomerData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        phone_number: data.phone_number || '',
        shipping_address: data.shipping_address || ''
      })
      setLoading(false)
    } catch (err) {
      setError('Failed to load customer data')
      setLoading(false)
    }
  }

  const handleInfoChange = (e) => {
    setCustomerData({
      ...customerData,
      [e.target.name]: e.target.value
    })
  }

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    })
  }

  const handleUpdateInfo = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')
    
    try {
      const customerId = localStorage.getItem("id")
      await axios.put(`${process.env.REACT_APP_BASE_URL}/customer/update-data?customer_id=${customerId}`, customerData)
      setMessage('Personal information updated successfully!')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update information')
    }
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')

    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('New passwords do not match')
      return
    }

    if (!passwordData.prev_password || !passwordData.new_password) {
      setError('Please fill in all password fields')
      return
    }

    try {
      const customerId = localStorage.getItem("id")
      await axios.put(`${process.env.REACT_APP_BASE_URL}/customer/update-data?customer_id=${customerId}`, {
        prev_password: passwordData.prev_password,
        new_password: passwordData.new_password
      })
      setMessage('Password updated successfully!')
      setPasswordData({ prev_password: '', new_password: '', confirm_password: '' })
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update password')
    }
  }

  if (loading) {
    return (
      <div className='w-full h-screen flex items-center justify-center'>
        <Loader />
      </div>
    )
  }

  return (
    <div className='px-4 py-4'>
      <p className='text-2xl font-semibold mb-6'>Settings</p>

      {message && (
        <div className='bg-green-800 text-white p-3 rounded mb-4'>
          {message}
        </div>
      )}

      {error && (
        <div className='bg-red-800 text-white p-3 rounded mb-4'>
          {error}
        </div>
      )}

      {/* Personal Information Section */}
      <div className='bg-zinc-800 p-6 rounded mb-6'>
        <h3 className='text-xl font-semibold mb-4'>Personal Information</h3>
        <form onSubmit={handleUpdateInfo}>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-zinc-400 mb-2'>First Name</label>
              <input
                type='text'
                name='first_name'
                value={customerData.first_name}
                onChange={handleInfoChange}
                className='w-full bg-zinc-900 text-white p-2 rounded outline-none'
              />
            </div>
            <div>
              <label className='block text-zinc-400 mb-2'>Last Name</label>
              <input
                type='text'
                name='last_name'
                value={customerData.last_name}
                onChange={handleInfoChange}
                className='w-full bg-zinc-900 text-white p-2 rounded outline-none'
              />
            </div>
            <div>
              <label className='block text-zinc-400 mb-2'>Email</label>
              <input
                type='email'
                name='email'
                value={customerData.email}
                onChange={handleInfoChange}
                className='w-full bg-zinc-900 text-white p-2 rounded outline-none'
              />
            </div>
            <div>
              <label className='block text-zinc-400 mb-2'>Phone Number</label>
              <input
                type='text'
                name='phone_number'
                value={customerData.phone_number}
                onChange={handleInfoChange}
                className='w-full bg-zinc-900 text-white p-2 rounded outline-none'
              />
            </div>
            <div className='md:col-span-2'>
              <label className='block text-zinc-400 mb-2'>Shipping Address</label>
              <textarea
                name='shipping_address'
                value={customerData.shipping_address}
                onChange={handleInfoChange}
                className='w-full bg-zinc-900 text-white p-2 rounded outline-none'
                rows='3'
              />
            </div>
          </div>
          <button
            type='submit'
            className='mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition-all'
          >
            Update Information
          </button>
        </form>
      </div>

      {/* Password Section */}
      <div className='bg-zinc-800 p-6 rounded'>
        <h3 className='text-xl font-semibold mb-4'>Change Password</h3>
        <form onSubmit={handleUpdatePassword}>
          <div className='grid grid-cols-1 gap-4 max-w-md'>
            <div>
              <label className='block text-zinc-400 mb-2'>Current Password</label>
              <input
                type='password'
                name='prev_password'
                value={passwordData.prev_password}
                onChange={handlePasswordChange}
                className='w-full bg-zinc-900 text-white p-2 rounded outline-none'
              />
            </div>
            <div>
              <label className='block text-zinc-400 mb-2'>New Password</label>
              <input
                type='password'
                name='new_password'
                value={passwordData.new_password}
                onChange={handlePasswordChange}
                className='w-full bg-zinc-900 text-white p-2 rounded outline-none'
              />
            </div>
            <div>
              <label className='block text-zinc-400 mb-2'>Confirm New Password</label>
              <input
                type='password'
                name='confirm_password'
                value={passwordData.confirm_password}
                onChange={handlePasswordChange}
                className='w-full bg-zinc-900 text-white p-2 rounded outline-none'
              />
            </div>
          </div>
          <button
            type='submit'
            className='mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition-all'
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  )
}

export default Setting