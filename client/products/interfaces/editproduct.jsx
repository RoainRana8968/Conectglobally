import React, { useEffect, useState } from 'react'
import Hostsidebar from '../components/hostsidebar'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useParams, useNavigate } from "react-router-dom";
import axios from 'axios'

import {
    faImage,
    faTag,
    faIndianRupeeSign,
    faPenToSquare,
    faTrash,
    faBoxesStacked,
    faAward
} from "@fortawesome/free-solid-svg-icons";
const Editproduct = () => {
    const [title, settitle] = useState("");
    const [certified, setcertified] = useState("");
    const [image, setimage] = useState("");
    const [stock, setstock] = useState(0);
    const [description, setdescription] = useState("");
    const [category, setcategory] = useState("");
    const [price, setprice] = useState(0);
    const { id } = useParams();
    const [product, setProduct] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        async function getProduct() {
            try {
                const token = localStorage.getItem("hosttoken");

                const response = await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/products/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setProduct(response.data.product);
            } catch (err) {
                console.log(err);
            }
        }

        getProduct();
    }, [id]);

    useEffect(() => {
        if (product) {
            settitle(product.title || "");
            setimage(product.image || "");
            setprice(product.price || 0);
            setcertified(product.certified || "");
            setstock(product.stock || 0);
            setdescription(product.description || "");
            setcategory(product.category || "");
        }
    }, [product]);

    async function handleChange(e) {
        e.preventDefault();

        const newupdatedproduct = {
            title: title || product.title || "",
            price: price || product.price || 0,
            image: image || product.image || "",
            certified: certified || product.certified || "",
            stock: stock || product.stock || 0,
            description: description || product.description || "",
            category: category || product.category || "",
            _id: id,
        };

        const token = localStorage.getItem("hosttoken");

        if (!token) {
            alert("Please login first");
            return;
        }

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/products/updateproduct`,
                { updatedproduct: newupdatedproduct },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                alert("Product updated successfully");
                navigate("/viewproducts");
            }
        } catch (err) {
            console.log(err);
            console.log(err.response);
            alert(err.response?.data?.message || "Failed to update product");
        }
    }

    return (
        <div>
            <div className='  h-screen  w-screen flex'>
                <Hostsidebar></Hostsidebar>
                <div className='flex-1 flex flex-col font-semibold'>
                    <div className='flex justify-center mt-3'>
                        <h1 className='text-5xl text-blue-600'>Edit your product</h1>
                    </div>


                    <div className='flex-1 bg-yellow-100 mt-4 p-3 grid sm:grid-cols-1 md:grid-cols-[2fr_3fr] gap-y-5'>
                        <div>
                            <div
                                className="bg-white rounded-xl shadow-md p-4 h-[400px] w-full max-w-[400px]"
                                key={product._id || product.id}
                            >
                                <img
                                    src={product.image}
                                    alt={product.title}
                                    className="h-40 w-full object-cover rounded-lg mb-4"
                                />

                                <p className="flex items-center gap-2 text-lg font-semibold ">
                                    <FontAwesomeIcon icon={faTag} className="text-gray-600" />
                                    {product.title}

                                </p>
                                <p className="flex items-center gap-2 text-md font-semibold text-gray-500 mb-2 ml-10 ">

                                    {product.category}

                                </p>

                                <p className="flex items-center gap-2 text-gray-700 mb-4">
                                    <FontAwesomeIcon icon={faIndianRupeeSign} className="text-gray-600" />
                                    Price: &nbsp;{product.price}

                                </p>
                                <p className="flex items-center gap-2 text-gray-700 mb-4">
                                    <FontAwesomeIcon icon={faBoxesStacked} className="text-gray-600" />
                                    Available:&nbsp; {product.stock}ton

                                </p>
                                <p className="flex items-center gap-2 text-gray-700 mb-4">
                                    <FontAwesomeIcon icon={faAward} className="text-gray-600" />
                                    Certifications: &nbsp; {product.certified}

                                </p>


                            </div>


                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <form className="bg-white rounded-xl shadow-md p-6 max-w-2xl mx-auto" onSubmit={handleChange}>

                                {/* Product Title */}
                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-2">
                                        Product Title
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={title}
                                        onChange={(e)=>{
                                            settitle(e.target.value)
                                        }}
                                        className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter product title"
                                    />
                                </div>

                                {/* Image URL */}
                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-2">
                                        Image URL
                                    </label>
                                    <input
                                        type="text"
                                        name="image"
                                        value={image}
                                        onChange={(e)=>{
                                            setimage(e.target.value)
                                        }}
                                        className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Paste image URL"
                                    />
                                </div>

                                {/* Price & Stock */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

                                    <div>
                                        <label className="block text-gray-700 mb-2">
                                            Price
                                        </label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={price}
                                            onChange={(e)=>{
                                                setprice(e.target.value)
                                            }}
                                            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="₹ Price"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 mb-2">
                                            Stock (Ton)
                                        </label>
                                        <input
                                            type="number"
                                            name="stock"
                                            value={stock}
                                            onChange={(e)=>{
                                                setstock(e.target.value)
                                            }}
                                            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Available stock"
                                        />
                                    </div>

                                </div>

                                {/* Category */}
                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-2">
                                        Category
                                    </label>

                                    <select
                                        name="category"
                                        value={category}
                                        onChange={(e)=>{
                                            setcategory(e.target.value)
                                        }}
                                        className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select Category</option>
                                        <option value="Fruits">Fruits</option>
                                        <option value="Electronics">Electronics</option>
                                        <option value="Beverages">Beverages</option>
                                        <option value="Vegetables">Vegetables</option>
                                        <option value="Dairy">Dairy</option>
                                    </select>
                                </div>

                                {/* Certification */}
                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-2">
                                        Certification
                                    </label>

                                    <input
                                        type="text"
                                        name="certified"
                                        value={certified}
                                        onChange={(e)=>{
                                            setcertified(e.target.value)
                                        }}
                                        className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Certification"
                                    />
                                </div>

                                {/* Description */}
                                <div className="mb-6">
                                    <label className="block text-gray-700 mb-2">
                                        Description
                                    </label>

                                    <textarea
                                        rows="2"
                                        name="description"
                                        value={description}
                                        onChange={(e)=>{
                                            setdescription(e.target.value)
                                        }}
                                        className="w-full border rounded-lg px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Write product description..."
                                    />
                                </div>

                                {/* Buttons */}
                                <div className="flex justify-end gap-4">

                                    <button
                                        type="reset"
                                        className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                                    >
                                        Reset
                                    </button>

                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                    >
                                        Update Product
                                    </button>

                                </div>

                            </form>
                        </div>
                    

                    
                    </div>
                </div>
                
            </div>
            
        </div>
    )
}

export default Editproduct