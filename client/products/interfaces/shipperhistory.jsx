import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTag,
    faIndianRupeeSign,
    faBoxesStacked,
    faMapLocationDot,
    faUser,
    faCheckCircle,
    faBoxOpen,
    faArrowLeft,
    faCalendarCheck,
    faMagnifyingGlass
} from '@fortawesome/free-solid-svg-icons';

const ShipperHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    async function fetchDeliveredOrders() {
        let token = localStorage.getItem("shipperToken");
        if (!token) {
            console.error("No shipper token found");
            setLoading(false);
            return;
        }
        try {
            let response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/shipper/getshipperorders`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                const delivered = response.data.orders
                    .filter((o) => o.status === "Delivered")
                    .sort((a, b) => {
                        const dateA = new Date(a.deliveredAt || a.updatedAt || 0);
                        const dateB = new Date(b.deliveredAt || b.updatedAt || 0);
                        return dateB - dateA;
                    });
                setOrders(delivered);
            }
        } catch (err) {
            console.error("Fetch error:", err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchDeliveredOrders();
    }, []);

    function matchesSearch(order) {
        if (!search.trim()) return true;
        const haystack = `${order.productTitle || ""} ${order.productCategory || ""} ${order.user?.name || ""}`.toLowerCase();
        return haystack.includes(search.toLowerCase());
    }

    const visibleOrders = orders.filter(matchesSearch);

    if (loading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
                <p className="text-xl font-semibold text-slate-600">Loading delivery history...</p>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen flex bg-slate-50">
            <div className="flex-1 flex flex-col overflow-y-auto">
                <div className="flex flex-col items-center mt-6 mb-2 px-4">
                    <Link className='absolute left-20 top-10 text-blue-600 font-semibold' to={"/shipperdashboard"}>
                        <FontAwesomeIcon icon={faArrowLeft}/><span> Back</span>
                    </Link>

                    <h1 className="text-4xl md:text-5xl text-blue-700 font-semibold tracking-tight">
                        Delivery History
                    </h1>
                    <p className="text-sm text-gray-400 font-normal mt-1">
                        Full record of every order you have delivered
                    </p>

                    <div className="relative w-full max-w-md mt-5">
                        <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by product, category, or customer..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 outline-none focus:border-blue-400 shadow-sm"
                        />
                    </div>
                </div>

                {visibleOrders.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400">
                        <FontAwesomeIcon icon={faBoxOpen} className="text-5xl" />
                        <p className="text-lg font-normal">
                            {orders.length === 0 ? "No delivered orders yet." : "No orders match your search."}
                        </p>
                        <p className="text-sm">Delivered orders will show up here once you complete them.</p>
                    </div>
                ) : (
                    <div className="p-4 md:p-6 flex flex-col gap-6 max-w-5xl w-full mx-auto">
                        {visibleOrders.map((order) => (
                            <div
                                key={order._id}
                                className="bg-white rounded-2xl shadow-md shadow-slate-200/60 border border-slate-100 w-full flex flex-col md:flex-row overflow-hidden"
                            >
                                <img
                                    src={order.productImage}
                                    alt={order.productTitle}
                                    className="w-full md:w-64 h-56 md:h-auto object-cover"
                                />

                                <div className="flex-1 p-6 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                                            <p className="flex items-center gap-2 text-2xl font-bold text-slate-800">
                                                <FontAwesomeIcon icon={faTag} className="text-blue-500 text-lg" />
                                                {order.productTitle}
                                            </p>
                                            <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border bg-green-50 text-green-700 border-green-200">
                                                <FontAwesomeIcon icon={faCheckCircle} />
                                                Delivered
                                            </span>
                                        </div>

                                        <p className="text-sm font-medium text-blue-500 bg-blue-50 inline-block px-3 py-1 rounded-full mb-4">
                                            {order.productCategory}
                                        </p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-base font-normal text-gray-700 mb-4">
                                            <p className="flex items-center gap-2">
                                                <FontAwesomeIcon icon={faIndianRupeeSign} className="text-gray-400 w-4" />
                                                ₹{order.productPrice} / ton
                                            </p>
                                            <p className="flex items-center gap-2">
                                                <FontAwesomeIcon icon={faBoxesStacked} className="text-gray-400 w-4" />
                                                {order.quantity} ton delivered
                                            </p>
                                            <p className="flex items-center gap-2">
                                                <FontAwesomeIcon icon={faUser} className="text-gray-400 w-4" />
                                                {order.user?.name || "Customer"}
                                            </p>
                                            <p className="flex items-start gap-2">
                                                <FontAwesomeIcon icon={faMapLocationDot} className="text-gray-400 w-4 mt-1" />
                                                <span>
                                                    {order.street}, {order.city}, {order.state}, {order.country}
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                        <FontAwesomeIcon icon={faCalendarCheck} />
                                        Delivered on{" "}
                                        {new Date(order.deliveredAt || order.updatedAt).toLocaleString("en-IN", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShipperHistory;
