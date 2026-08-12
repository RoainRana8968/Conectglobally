import React, { useState, useEffect } from 'react'
import axios from "axios";
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTag, faIndianRupeeSign, faBoxesStacked, faAward, faMapLocationDot } from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../components/sidebar.jsx'; // adjust path to wherever this actually lives

const PlaceOrder = () => {
    const [product, setProduct] = useState({});
    const navigate = useNavigate();
    const { id } = useParams();

    // order form state
    const [quantity, setQuantity] = useState(1);
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [country, setCountry] = useState('');
    const [placing, setPlacing] = useState(false);
    const [error, setError] = useState('');

    async function getDetailsOfProduct() {
        let token = localStorage.getItem("userToken");
        if (!token) {
            navigate("/userlogin");
            return;
        }
        try {
            let response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/orders/placeorder/${id}`, {
               headers: {
          Authorization: `Bearer ${token}`
        }
            });
            if (response.data.success) {
                console.log(response.data.obj)
                setProduct(response.data.obj);
            }
        } catch (err) {
            console.log(err);
            console.log(err.response);
            console.log(err.response?.data);
        }
    }

    useEffect(() => {
        getDetailsOfProduct();
    }, [id]);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');

        if (!street.trim() || !city.trim() || !state.trim() || !country.trim()) {
            setError('Please fill in street, city, state, and country.');
            return;
        }

        let token = localStorage.getItem("userToken");
        setPlacing(true);
        try {
            let response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/orders/placeorder/${id}`, {
                quantity,
                street,
                city,
                state,
                country
            }, {
                 headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.data.success) {
                navigate('/myorders');
            } else {
                setError(response.data.message || 'Could not place order. Please try again.');
            }
        } catch (err) {
            console.log(err);
            console.log(err.response);
            console.log(err.response?.data);
            setError(err.response?.data?.message || 'Something went wrong placing your order.');
        } finally {
            setPlacing(false);
        }
    }

    return (
        <div>
            <div className='h-screen w-screen flex bg-slate-50'>
                <Sidebar></Sidebar>
                <div className='flex-1 flex flex-col font-semibold overflow-y-auto'>
                    <div className='flex flex-col items-center mt-6 mb-2'>
                        <h1 className='text-4xl md:text-5xl text-blue-700 tracking-tight'>Place your order</h1>
                        <p className='text-sm text-gray-400 font-normal mt-1'>Review the product and add your delivery details</p>
                    </div>

                    <div className='flex-1 mt-4 p-3 md:p-6 grid sm:grid-cols-1 md:grid-cols-[2fr_3fr] gap-6 items-start'>

                        {/* Product card */}
                        <div
                            className="bg-white rounded-2xl shadow-lg shadow-slate-200/60 p-5 w-full max-w-[400px] border border-slate-100 sticky top-6"
                            key={product._id || product.id}
                        >
                            <img
                                src={product.image}
                                alt={product.title}
                                className="h-44 w-full object-cover rounded-xl mb-4"
                            />

                            <p className="flex items-center gap-2 text-xl font-bold text-slate-800">
                                <FontAwesomeIcon icon={faTag} className="text-blue-500 text-base" />
                                {product.title}
                            </p>
                            <p className="text-sm font-medium text-blue-500 bg-blue-50 inline-block px-3 py-1 rounded-full mt-2 mb-4">
                                {product.category}
                            </p>

                            <div className="flex flex-col gap-3">
                                <p className="flex items-center gap-2 text-gray-700 font-normal">
                                    <FontAwesomeIcon icon={faIndianRupeeSign} className="text-gray-400 w-4" />
                                    <span className="font-semibold">₹{product.price}</span>&nbsp;/ ton
                                </p>
                                <p className="flex items-center gap-2 text-gray-700 font-normal">
                                    <FontAwesomeIcon icon={faBoxesStacked} className="text-gray-400 w-4" />
                                    <span className="font-semibold">{product.stock}</span>&nbsp;ton available
                                </p>
                                <p className="flex items-center gap-2 text-gray-700 font-normal">
                                    <FontAwesomeIcon icon={faAward} className="text-gray-400 w-4" />
                                    {product.certified}
                                </p>
                            </div>
                        </div>

                        {/* Order form */}
                        <div className="w-full pb-8">
                            <form className="bg-white rounded-2xl shadow-lg shadow-slate-200/60 p-6 md:p-8 max-w-2xl mx-auto border border-slate-100" onSubmit={handleSubmit}>

                                {/* Quantity */}
                                <div className="mb-5">
                                    <label className="block text-gray-700 mb-2">
                                        Quantity (Ton)
                                    </label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        min="1"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        placeholder="How many tons?"
                                    />
                                </div>

                                {/* Delivery Address */}
                                <div className="mb-2">
                                    <label className="flex items-center gap-2 text-gray-700 mb-3">
                                        <FontAwesomeIcon icon={faMapLocationDot} className="text-blue-500" />
                                        Delivery Address
                                    </label>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-gray-500 font-normal text-sm mb-1.5">Street</label>
                                            <input
                                                type="text"
                                                name="street"
                                                value={street}
                                                onChange={(e) => setStreet(e.target.value)}
                                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                                placeholder="Street address"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-500 font-normal text-sm mb-1.5">City</label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={city}
                                                onChange={(e) => setCity(e.target.value)}
                                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                                placeholder="City"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-500 font-normal text-sm mb-1.5">State</label>
                                            <input
                                                type="text"
                                                name="state"
                                                value={state}
                                                onChange={(e) => setState(e.target.value)}
                                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                                placeholder="State"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-500 font-normal text-sm mb-1.5">Country</label>
                                            <input
                                                type="text"
                                                name="country"
                                                value={country}
                                                onChange={(e) => setCountry(e.target.value)}
                                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                                placeholder="Country"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <p className="text-red-600 font-normal mb-4 bg-red-50 px-4 py-2 rounded-lg">{error}</p>
                                )}

                                {/* Buttons */}
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => navigate(-1)}
                                        className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={placing}
                                        className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50 shadow-lg shadow-blue-600/20"
                                    >
                                        {placing ? 'Placing order...' : 'Place Order'}
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

export default PlaceOrder