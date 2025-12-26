import React, { useState } from 'react'
import axios from 'axios'

const AddAuthor = () => {
    const [authorName, setAuthorName] = useState('');

    const headers = {
        id: localStorage.getItem("id"),
        authorization: `Bearer ${localStorage.getItem("token")}`,
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!authorName.trim()) {
            alert("Author name is required");
            return;
        }

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}/admin/authors`,
                { author_name: authorName },
                { headers }
            );
            alert("Author added successfully!");
            setAuthorName('');
        } catch (error) {
            console.error("Error adding author:", error);
            alert(error.response?.data?.detail || "Failed to add author");
        }
    }

    return (
        <div className='grid gap-4'>
            <p className='text-2xl font-semibold mx-2 my-4'>Add Author</p>
            <form onSubmit={handleSubmit} className='flex flex-col bg-zinc-800 mx-4 p-6 rounded'>
                <label htmlFor="author_name" className='text-zinc-400 font-semibold'>Author Name :</label>
                <input 
                    type="text" 
                    id='author_name' 
                    name='author_name' 
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)} 
                    className='bg-zinc-900 rounded mb-4 ms-1 mt-1 p-2' 
                    placeholder="Enter author name"
                    required
                />
                
                <button 
                    type='submit' 
                    className='mt-4 py-2 bg-blue-700 hover:bg-blue-800 w-[20%] mx-auto rounded'
                >
                    Add Author
                </button>
            </form>
        </div>
    )
}

export default AddAuthor
