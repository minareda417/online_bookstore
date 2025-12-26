import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Loader from './Loader'

const AddBook = () => {

    const headers = {
        id: localStorage.getItem("id"),
        authorization: `Bearer ${localStorage.getItem("token")}`,
    }
    const navigate = useNavigate();
    const [Values, setValues] = useState({
        isbn: "",
        title: "",
        publisher_id: "",
        publication_year: "",
        selling_price: "",
        category_id: "",
        threshold: "",
        quantity: "",
        description: "",
        cover_photo: "",
        authors: [],
    });
    
    const change = (e) => {
        const { name, value } = e.target;
        setValues({ ...Values, [name]: value })
    }
    
    const submit = async (e) => {
        e.preventDefault();
        try {
            if (Values.isbn === "" || Values.title === "" || Values.publisher_id === "" || Values.publication_year === "" || Values.selling_price === "" || Values.category_id === "" || Values.threshold === "" || Values.quantity === "" || Values.description === "" || Values.cover_photo === "" || Values.authors.length === 0) {
                alert("ISBN, title, price, and at least one author are required");
                return;
            }
            
            // Convert string values to appropriate types
            const bookData = {
                isbn: Values.isbn,
                title: Values.title,
                publisher_id: Values.publisher_id ? parseInt(Values.publisher_id) : null,
                publication_year: Values.publication_year ? parseInt(Values.publication_year) : null,
                selling_price: parseFloat(Values.selling_price),
                category_id: Values.category_id ? parseInt(Values.category_id) : null,
                threshold: Values.threshold ? parseInt(Values.threshold) : 10,
                quantity: Values.quantity ? parseInt(Values.quantity) : 0,
                description: Values.description || null,
                cover_photo: Values.cover_photo || null,
                authors: Values.authors.map(id => parseInt(id))
            };
            
            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}/admin/books`, 
                bookData, 
                { headers }
            );
            console.log(response.data);
            alert("Book added successfully!");
            navigate('/allbooks');
        } catch (error) {
            console.log(error);
            alert(error.response?.data?.detail || "Failed to add book");
        }
    }
    
    return (
        <div className='grid gap-4'>
            <p className='text-2xl font-semibold mx-2 my-4 '>Add Book</p>
            <form onSubmit={submit} className='flex flex-col bg-zinc-800 mx-4 p-6 rounded'>

                <label htmlFor="isbn" className='text-zinc-400 font-semibold'>ISBN :</label>
                <input 
                    type="text" 
                    id='isbn' 
                    name='isbn' 
                    value={Values.isbn}
                    onChange={change} 
                    className='bg-zinc-900 rounded mb-2 ms-1 mt-1' 
                    required
                />
                
                <label htmlFor="title" className='text-zinc-400 font-semibold'>Title :</label>
                <input 
                    type="text" 
                    id='title' 
                    name='title' 
                    value={Values.title}
                    onChange={change} 
                    className='bg-zinc-900 rounded mb-2 ms-1 mt-1' 
                    required
                />
                
                <label htmlFor="publisher_id" className='text-zinc-400 font-semibold'>Publisher ID :</label>
                <input 
                    type="number" 
                    id='publisher_id' 
                    name='publisher_id' 
                    value={Values.publisher_id}
                    onChange={change} 
                    className='bg-zinc-900 rounded mb-2 ms-1 mt-1' 
                />
                
                <label htmlFor="publication_year" className='text-zinc-400 font-semibold'>Publication Year :</label>
                <input 
                    type="number" 
                    id='publication_year' 
                    name='publication_year' 
                    value={Values.publication_year}
                    onChange={change} 
                    className='bg-zinc-900 rounded mb-2 ms-1 mt-1' 
                />
                
                <label htmlFor="selling_price" className='text-zinc-400 font-semibold'>Price :</label>
                <input 
                    type="number" 
                    step="0.01" 
                    id='selling_price' 
                    name='selling_price' 
                    value={Values.selling_price}
                    onChange={change} 
                    className='bg-zinc-900 rounded mb-2 ms-1 mt-1' 
                    required
                />
                
                <label htmlFor="category_id" className='text-zinc-400 font-semibold'>Category ID :</label>
                <input 
                    type="number" 
                    id='category_id' 
                    name='category_id' 
                    value={Values.category_id}
                    onChange={change} 
                    className='bg-zinc-900 rounded mb-2 ms-1 mt-1' 
                />
                
                <label htmlFor="threshold" className='text-zinc-400 font-semibold'>Threshold :</label>
                <input 
                    type="number" 
                    id='threshold' 
                    name='threshold' 
                    value={Values.threshold}
                    onChange={change} 
                    placeholder="Default: 10"
                    className='bg-zinc-900 rounded mb-2 ms-1 mt-1' 
                />
                
                <label htmlFor="quantity" className='text-zinc-400 font-semibold'>Quantity :</label>
                <input 
                    type="number" 
                    id='quantity' 
                    name='quantity' 
                    value={Values.quantity}
                    onChange={change} 
                    placeholder="Default: 0"
                    className='bg-zinc-900 rounded mb-2 ms-1 mt-1' 
                />
                
                <label htmlFor="description" className='text-zinc-400 font-semibold'>Description :</label>
                <textarea 
                    id='description' 
                    name='description' 
                    value={Values.description}
                    onChange={change} 
                    rows="4"
                    className='bg-zinc-900 rounded mb-2 ms-1 mt-1 p-2' 
                />
                
                <label htmlFor="cover_photo" className='text-zinc-400 font-semibold'>Cover Photo URL :</label>
                <input 
                    type="text" 
                    id='cover_photo' 
                    name='cover_photo' 
                    value={Values.cover_photo}
                    onChange={change} 
                    placeholder="https://example.com/image.jpg"
                    className='bg-zinc-900 rounded mb-2 ms-1 mt-1' 
                />
                
                <label htmlFor="authors" className='text-zinc-400 font-semibold'>Author IDs (comma-separated) :</label>
                <input 
                    type="text" 
                    id='authors' 
                    name='authors' 
                    value={Values.authors.join(',')} 
                    onChange={(e) => setValues({
                        ...Values, 
                        authors: e.target.value.split(',').filter(id => id.trim())
                    })}
                    placeholder="e.g., 1,2,3"
                    className='bg-zinc-900 rounded mb-2 ms-1 mt-1' 
                    required
                />

                <button type='submit' className='mt-4 py-2 bg-blue-700 hover:bg-blue-800 w-[12%] mx-auto rounded'>
                    Add Book
                </button>

            </form>
        </div>
    )
}

export default AddBook