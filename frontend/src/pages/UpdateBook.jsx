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
      .then(res => setBook(res.data.data))
  }, [id])

  if (!book) return <div>Loading...</div>

  const handleChange = (e) => {
    setBook({ ...book, [e.target.name]: e.target.value })
  }

  const validate = () => {
    const errs = {}
    if (!book.title?.trim()) errs.title = "Title required"
    if (!book.author?.trim()) errs.author = "Author required"
    if (!book.desc?.trim()) errs.desc = "Description required"
    if (!book.price || Number(book.price) <= 0) errs.price = "Invalid price"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const updateBook = async () => {
    if (!validate()) return

    const formData = new FormData()
    formData.append("title", book.title)
    formData.append("author", book.author)
    formData.append("price", book.price)
    formData.append("desc", book.desc)

    if (image) {
      formData.append("image", image)
    }

    await axios.put(
      `${process.env.REACT_APP_BASE_URL}/updatebook/${id}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    )

    navigate(`/books/${id}`)
  }

  return (
    <div className="p-6 bg-zinc-900 text-white">
      <input name="title" value={book.title} onChange={handleChange} />
      {errors.title && <p>{errors.title}</p>}

      <input name="author" value={book.author} onChange={handleChange} />
      {errors.author && <p>{errors.author}</p>}

      <input type="number" name="price" value={book.price} onChange={handleChange} />
      {errors.price && <p>{errors.price}</p>}

      <textarea name="desc" value={book.desc} onChange={handleChange} />
      {errors.desc && <p>{errors.desc}</p>}

      {/* Image upload */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files[0])}
      />

      <button onClick={updateBook}>Update</button>
    </div>
  )
}

export default UpdateBook
