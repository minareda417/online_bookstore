import React, { useState } from 'react'
import axios from 'axios'

const AddCategory = () => {
    const [categoryName, setCategoryName] = useState('');

    const headers = {
        id: localStorage.getItem("id"),
        authorization: `Bearer ${localStorage.getItem("token")}`,
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!categoryName.trim()) {
            alert("Category name is required");
            return;
        }

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}/admin/categories`,
                { category_name: categoryName },
                { headers }
            );
            alert("Category added successfully!");
            setCategoryName('');
        } catch (error) {
            console.error("Error adding category:", error);
            alert(error.response?.data?.detail || "Failed to add category");
        }
    }

    return (
        <div className='grid gap-4'>
            <p className='text-2xl font-semibold mx-2 my-4'>Add Category</p>
            <form onSubmit={handleSubmit} className='flex flex-col bg-zinc-800 mx-4 p-6 rounded'>
                <label htmlFor="category_name" className='text-zinc-400 font-semibold'>Category Name :</label>
                <input 
                    type="text" 
                    id='category_name' 
                    name='category_name' 
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)} 
                    className='bg-zinc-900 rounded mb-4 ms-1 mt-1 p-2' 
                    placeholder="Enter category name"
                    required
                />
                
                <button 
                    type='submit' 
                    className='mt-4 py-2 bg-blue-700 hover:bg-blue-800 w-[20%] mx-auto rounded'
                >
                    Add Category
                </button>
            </form>
        </div>
    )
}

export default AddCategory
