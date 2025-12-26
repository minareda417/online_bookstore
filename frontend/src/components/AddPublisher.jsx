import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Loader from './Loader'

const AddPublisher = () => {

    const headers = {
        id: localStorage.getItem("id"),
        authorization: `Bearer ${localStorage.getItem("token")}`,
    }
    const navigate = useNavigate();
    const [Values, setValues] = useState({
        publisher_name: "",
        address: "",
        publisher_phone_numbers: ""
    });
    
    const change = (e) => {
        const { name, value } = e.target;
        setValues({ ...Values, [name]: value })
    }
    
    const submit = async (e) => {
        e.preventDefault();
        try {
            if (Values.publisher_name === "" || Values.address === "" || Values.publisher_phone_numbers.trim() === "") {
                alert("All fields are required");
                return;
            }
            
            // Convert string values to appropriate types
            const publisherData = {
                publisher_name: Values.publisher_name,
                address: Values.address,
                phone_numbers: Values.publisher_phone_numbers.split(',').map(phone => phone.trim()).filter(phone => phone)
            };
            
            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}/admin/publishers`, 
                publisherData, 
                { headers }
            );
            console.log(response.data);
            alert("Publisher added successfully!");
            setValues({
                publisher_name: "",
                address: "",
                publisher_phone_numbers: ""
            });
        } catch (error) {
            console.log(error);
            alert(error.response?.data?.detail || "Failed to add publisher");
        }
    }
    
    return (
        <div className='grid gap-4'>
            <p className='text-2xl font-semibold mx-2 my-4 '>Add Publisher</p>
            <form onSubmit={submit} className='flex flex-col bg-zinc-800 mx-4 p-6 rounded'>                
                <label htmlFor="publisher_name" className='text-zinc-400 font-semibold'>Publisher name: </label>
                <input 
                    type="text" 
                    id='publisher_name' 
                    name='publisher_name' 
                    value={Values.publisher_name}
                    onChange={change} 
                    className='bg-zinc-900 rounded mb-2 ms-1 mt-1' 
                    required
                />
                
                <label htmlFor="address" className='text-zinc-400 font-semibold'>Address: </label>
                <input 
                    type="text" 
                    id='address' 
                    name='address' 
                    value={Values.address}
                    onChange={change} 
                    className='bg-zinc-900 rounded mb-2 ms-1 mt-1' 
                />
            
                <label htmlFor="publisher_phone_numbers" className='text-zinc-400 font-semibold'>Publisher Phone Number(s) (comma-separated) :</label>
                <input 
                    type="text" 
                    id='publisher_phone_numbers' 
                    name='publisher_phone_numbers' 
                    value={Values.publisher_phone_numbers} 
                    onChange={change}
                    placeholder="e.g., 123456789, 987654321"
                    className='bg-zinc-900 rounded mb-2 ms-1 mt-1 p-2' 
                    required
                />

                <button type='submit' className='mt-4 py-2 bg-blue-700 hover:bg-blue-800 w-[12%] mx-auto rounded'>
                    Add Publisher
                </button>

            </form>
        </div>
    )
}

export default AddPublisher