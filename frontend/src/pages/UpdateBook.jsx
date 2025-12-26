import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

const UpdateBook = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [book, setBook] = useState(null)
  const [image, setImage] = useState(null)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_BASE_URL}/books/${id}`)
      .then(res => setBook(res.data))
  }, [id])

  if (!book) return <div>Loading...</div>

  const handleChange = (e) => {
    setBook({ ...book, [e.target.name]: e.target.value })
  }

  const validate = () => {
    const errs = {}
    if (!book.title?.trim()) errs.title = "Title required"
    if (!book.selling_price || Number(book.selling_price) <= 0) errs.selling_price = "Invalid price"
    if (!book.quantity || Number(book.quantity) < 0) errs.quantity = "Invalid quantity"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const updateBook = async () => {
    if (!validate()) return

    const updateData = {
      title: book.title,
      selling_price: Number(book.selling_price),
      quantity: Number(book.quantity)
    }

    try {
      await axios.put(
        `${process.env.REACT_APP_BASE_URL}/admin/books/${id}`,
        updateData
      )
      alert("Book updated successfully")
      navigate(`/getdetails/${id}`)
    } catch (error) {
      alert("Failed to update book: " + error.response?.data?.detail)
    }
  }

  return (
    <div className="p-6 bg-zinc-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Update Book</h1>
      
      <div className="max-w-2xl space-y-4">
        <div>
          <label className="block mb-2">Title</label>
          <input 
            name="title" 
            value={book.title || ''} 
            onChange={handleChange}
            className="w-full p-2 bg-zinc-800 rounded"
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </div>

        <div>
          <label className="block mb-2">Price ($)</label>
          <input 
            type="number" 
            step="0.01"
            name="selling_price" 
            value={book.selling_price || ''} 
            onChange={handleChange}
            className="w-full p-2 bg-zinc-800 rounded"
          />
          {errors.selling_price && <p className="text-red-500 text-sm mt-1">{errors.selling_price}</p>}
        </div>

        <div>
          <label className="block mb-2">Quantity</label>
          <input 
            type="number" 
            name="quantity" 
            value={book.quantity || ''} 
            onChange={handleChange}
            className="w-full p-2 bg-zinc-800 rounded"
          />
          {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
        </div>

        <button 
          onClick={updateBook}
          className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded mt-4"
        >
          Update Book
        </button>
      </div>
    </div>
  )
}

export default UpdateBook
