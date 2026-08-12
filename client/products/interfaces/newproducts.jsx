import React, { useState } from 'react'
import Hostsidebar from '../components/hostsidebar'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom"
import axios from "axios";
const Newproduct = () => {
    let [title, settitle] = useState("");
    let [image, setimage] = useState("");
    let [price, setprice] = useState(0);
    let [certified, setcertified] = useState("");
    let [stock, setstock] = useState(0);
    let [description, setdescription] = useState("");
    let [category, setcategory] = useState("Fruits");
    const navigate = useNavigate();
    const token = localStorage.getItem("hosttoken");

    async function addnewproduct(e) {
        e.preventDefault();

        if (!token) {
            alert("Please login first");
            return;
        }

        let newproduct = {
            title: title,
            image: image,
            price: price,
            certified: certified,
            stock: stock,
            description: description,
            category: category,
        };

        try {
            let response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/products/addnewproduct`, newproduct, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.data.success) {
                alert(response.data.message);
                settitle("");
                setprice(0);
                setimage("");
                setcertified("");
                setstock(0);
                setdescription("");
                setcategory("Fruits");
                navigate("/viewproducts", { state: { refresh: true } });
            }
        } catch (err) {
            console.log(err.response);
            console.log(err.response?.data);
            alert(err.response?.data?.message || "Failed to add product");
        }

    }


    return (
        <div className="h-screen w-screen">
            <div className="h-full w-full flex">
                <Hostsidebar />

                {/* Right Content */}
                <div className="flex-1 flex flex-col bg-gray-100">

                    {/* Navbar */}
                    <div className="sticky top-0 bg-white shadow-md px-6 py-3 z-10">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 max-w-2xl relative">
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    className="w-full py-3 pl-12 pr-4 rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                />

                                <FontAwesomeIcon
                                    icon={faMagnifyingGlass}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                                />
                            </div>

                            <button
                                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl"
                                onClick={() => navigate("/viewproducts")}
                            >
                                Back to Products
                            </button>
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="flex-1 overflow-y-auto bg-gray-100 p-6">
                        <form className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-8" onSubmit={addnewproduct}>

                            <h1 className="text-3xl font-bold text-gray-800 mb-8">
                                Add New Product
                            </h1>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                {/* Product Title */}
                                <div>
                                    <label className="block mb-2 font-semibold text-gray-700">
                                        Product Title
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter product title"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                        value={title} onChange={(e) => {
                                            settitle(e.target.value);
                                        }}
                                    />
                                </div>

                                {/* Price */}
                                <div>
                                    <label className="block mb-2 font-semibold text-gray-700">
                                        Price in(USD)
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="$ 0"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                        value={price} onChange={(e) => {
                                            setprice(e.target.value);
                                        }}
                                    />
                                </div>

                                {/* Image */}
                                <div>
                                    <label className="block mb-2 font-semibold text-gray-700">
                                        Image URL
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Paste image URL"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                        value={image} onChange={(e) => {
                                            setimage(e.target.value);
                                        }}
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block mb-2 font-semibold text-gray-700">
                                        Category
                                    </label>

                                    <select className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                        value={category} onChange={(e) => {
                                            setcategory(e.target.value);
                                        }}>
                                        <option>Fruits</option>
                                        <option>Vegetables</option>
                                        <option>Dairy</option>
                                        <option>Electronics</option>
                                        <option>Beverages</option>
                                    </select>
                                </div>

                                {/* Stock */}
                                <div>
                                    <label className="block mb-2 font-semibold text-gray-700">
                                        Stock
                                    </label>

                                    <input
                                        type="number"
                                        placeholder="Available stock"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                        value={stock} onChange={(e) => {
                                            setstock(e.target.value);
                                        }}
                                    />
                                </div>

                                {/* Certified */}
                                <div>
                                    <label className="block mb-2 font-semibold text-gray-700">
                                        Certified
                                    </label>
                                    <input placeholder="ISO" className='w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500'
                                        value={certified} onChange={(e) => {
                                            setcertified(e.target.value)
                                        }}></input>
                                </div>

                            </div>

                            {/* Description */}
                            <div className="mt-6">
                                <label className="block mb-2 font-semibold text-gray-700">
                                    Description
                                </label>

                                <textarea
                                    rows="3"
                                    placeholder="Write product description..."
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none resize-none focus:ring-2 focus:ring-blue-500"
                                    value={description} onChange={(e) => {
                                        setdescription(e.target.value);
                                    }} ></textarea>
                            </div>

                            {/* Buttons */}
                            <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">

                                <button
                                    type="reset"
                                    className="px-8 py-3 rounded-lg bg-gray-300 hover:bg-gray-400 transition"
                                >
                                    Reset
                                </button>

                                <button
                                    type="submit"
                                    className="px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition"
                                >
                                    Add Product
                                </button>

                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Newproduct;