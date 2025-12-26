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
  const [creditCards, setCreditCards] = useState([])
  const [newCard, setNewCard] = useState({
    card_number: '',
    expiry_date: ''
  })

  useEffect(() => {
    fetchCustomerData()
    fetchCreditCards()
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

  const fetchCreditCards = async () => {
    try {
      const customerId = localStorage.getItem("id")
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/customer/credit-cards/${customerId}`)
      setCreditCards(response.data.data)
    } catch (err) {
      console.error('Failed to load credit cards')
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

  const handleCardChange = (e) => {
    setNewCard({
      ...newCard,
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

  const handleAddCard = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')

    if (!newCard.card_number || !newCard.expiry_date) {
      setError('Please fill in all card fields')
      return
    }

    // Validate card number (15-16 digits)
    if (newCard.card_number.length < 15 || newCard.card_number.length > 16) {
      setError('Card number must be 15 or 16 digits')
      return
    }

    // Validate expiry date format (MM/YY)
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/
    if (!expiryRegex.test(newCard.expiry_date)) {
      setError('Expiry date must be in MM/YY format')
      return
    }

    try {
      const customerId = localStorage.getItem("id")
      await axios.post(`${process.env.REACT_APP_BASE_URL}/customer/add-credit-card/${customerId}`, newCard)
      setMessage('Credit card added successfully!')
      setNewCard({ card_number: '', expiry_date: '' })
      fetchCreditCards()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add credit card')
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
      <div className='bg-zinc-800 p-6 rounded mb-6'>
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

      {/* Credit Cards Section */}
      <div className='bg-zinc-800 p-6 rounded'>
        <h3 className='text-xl font-semibold mb-4'>Credit Cards</h3>
        
        {/* Display existing cards */}
        <div className='mb-6'>
          <h4 className='text-lg text-zinc-400 mb-3'>Your Cards</h4>
          {creditCards.length === 0 ? (
            <p className='text-zinc-500'>No credit cards added yet</p>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              {creditCards.map((card, index) => (
                <div key={index} className='bg-zinc-900 p-4 rounded flex justify-between items-center'>
                  <div>
                    <p className='text-white font-mono'>{card.masked_number}</p>
                    <p className='text-zinc-400 text-sm'>Expires: {card.expiry_date}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add new card form */}
        <div>
          <h4 className='text-lg text-zinc-400 mb-3'>Add New Card</h4>
          <form onSubmit={handleAddCard}>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md'>
              <div>
                <label className='block text-zinc-400 mb-2'>Card Number</label>
                <input
                  type='text'
                  name='card_number'
                  value={newCard.card_number}
                  onChange={handleCardChange}
                  placeholder='1234567890123456'
                  maxLength='16'
                  className='w-full bg-zinc-900 text-white p-2 rounded outline-none'
                />
              </div>
              <div>
                <label className='block text-zinc-400 mb-2'>Expiry Date (MM/YY)</label>
                <input
                  type='text'
                  name='expiry_date'
                  value={newCard.expiry_date}
                  onChange={handleCardChange}
                  placeholder='12/25'
                  maxLength='5'
                  className='w-full bg-zinc-900 text-white p-2 rounded outline-none'
                />
              </div>
            </div>
            <button
              type='submit'
              className='mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition-all'
            >
              Add Card
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Setting