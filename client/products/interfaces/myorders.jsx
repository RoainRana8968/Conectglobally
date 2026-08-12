import React, { useEffect, useState } from 'react';
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTag,
    faIndianRupeeSign,
    faBoxesStacked,
    faAward,
    faMapLocationDot,
    faClock,
    faCircleCheck,
    faCircleXmark,
    faTruck,
    faClockRotateLeft,
} from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../components/sidebar.jsx';
import socket from "../src/socket.js";

const statusStyles = {
    Pending: {
        bg: "bg-yellow-50",
        text: "text-yellow-700",
        border: "border-yellow-200",
        icon: faClock,
        label: "Pending",
    },
    Accepted: {
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-200",
        icon: faCircleCheck,
        label: "Accepted",
    },
    Rejected: {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
        icon: faCircleXmark,
        label: "Rejected",
    },
    Delayed: {
        bg: "bg-orange-50",
        text: "text-orange-700",
        border: "border-orange-200",
        icon: faTruck,
        label: "Out for Delivery",
    },
    Delivered: {
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-200",
        icon: faCircleCheck,
        label: "Delivered ✓",
    },
    "Out of Stock": {
        bg: "bg-slate-100",
        text: "text-slate-500",
        border: "border-slate-300",
        icon: faCircleXmark,
        label: "Out of Stock",
    },
};

const OUT_OF_STOCK_DISPLAY_MS = 60 * 1000;

// How long a Delivered order stays on this page before it "graduates"
// to /userorderhistory and disappears from here.
const DELIVERED_DISPLAY_MS = 24 * 60 * 60 * 1000; // 1 day

function isStillWithinDisplayWindow(order) {
    if (!order.productRemoved || !order.productRemovedAt) return true;
    const removedAt = new Date(order.productRemovedAt).getTime();
    return Date.now() - removedAt < OUT_OF_STOCK_DISPLAY_MS;
}

// Falls back to `updatedAt` if the backend hasn't set a dedicated
// `deliveredAt` field — mongoose timestamps update `updatedAt` on save,
// which happens exactly when status flips to "Delivered".
function isDeliveredExpired(order) {
    if (order.status !== "Delivered") return false;
    const deliveredAt = order.deliveredAt || order.updatedAt;
    if (!deliveredAt) return false;
    return Date.now() - new Date(deliveredAt).getTime() > DELIVERED_DISPLAY_MS;
}

const MyOrder = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    async function fetchOrders() {
        let token = localStorage.getItem("userToken");
        if (!token) {
            navigate("/userlogin");
            return;
        }
        try {
            let response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/orders/myorders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setOrders(response.data.orders);
            }
        } catch (err) {
            console.log(err);
            console.log(err.response?.data);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchOrders();
    }, []);

    // Re-render periodically so expired "out of stock" orders drop off,
    // and Delivered orders older than a day quietly move to History.
    const [, forceTick] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => forceTick((t) => t + 1), 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        socket.on("orderStatusUpdated", (updatedOrder) => {
            setOrders((prev) =>
                prev.map((order) => {
                    if (order._id !== updatedOrder._id) return order;

                    // ── FIX: only overwrite the status field ──────────────────
                    // The socket emits the saved document which may not have
                    // the same populated sub-docs (product, user) that we got
                    // from the initial fetch. Merging instead of replacing keeps
                    // the card's image / title / price intact.
                    return { ...order, status: updatedOrder.status, updatedAt: updatedOrder.updatedAt };
                })
            );
        });

        socket.on("productDeleted", ({ productId }) => {
            setOrders((prev) =>
                prev.map((order) =>
                    order.product?._id === productId && order.status === "Pending"
                        ? { ...order, productRemoved: true, productRemovedAt: new Date().toISOString() }
                        : order
                )
            );
        });

        return () => {
            socket.off("orderStatusUpdated");
            socket.off("productDeleted");
        };
    }, []);

    if (loading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
                <p className="text-xl font-semibold text-slate-600">Loading your orders...</p>
            </div>
        );
    }

    const visibleOrders = orders
        .filter(isStillWithinDisplayWindow)
        .filter((o) => !isDeliveredExpired(o));

    return (
        <div className='h-screen w-screen flex bg-slate-50'>
            <Sidebar />
            <div className='flex-1 flex flex-col overflow-y-auto'>
                <div className='flex flex-col items-center mt-6 mb-2'>
                    <h1 className='text-4xl md:text-5xl text-blue-700 font-semibold tracking-tight'>
                        Your Orders
                    </h1>
                    <p className='text-sm text-gray-400 font-normal mt-1'>
                        Track the status of every order you've placed
                    </p>
                    <button
                        onClick={() => navigate("/userorderhistory")}
                        className="flex items-center gap-2 text-sm text-blue-600 font-semibold mt-3 px-4 py-2 rounded-full bg-blue-50 hover:bg-blue-100 transition"
                    >
                        <FontAwesomeIcon icon={faClockRotateLeft} />
                        View delivered order history
                    </button>
                </div>

                {visibleOrders.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-lg text-gray-500 font-normal">
                            You haven't placed any orders yet.
                        </p>
                    </div>
                ) : (
                    <div className='p-4 md:p-6 grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                        {visibleOrders.map((order) => {
                            const displayStatus = order.productRemoved ? "Out of Stock" : order.status;
                            const s = statusStyles[displayStatus] || statusStyles.Pending;

                            const product   = typeof order.product === 'object' && order.product !== null ? order.product : {};
                            const title     = product.title    || order.productTitle    || 'Product';
                            const image     = product.image    || order.productImage    || '';
                            const price     = product.price    ?? order.productPrice;
                            const category  = product.category || order.productCategory || '';
                            const certified = product.certified || order.certified      || '';

                            return (
                                <div
                                    key={order._id}
                                    className={`bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-100 overflow-hidden transition-all duration-500
                                        ${order.productRemoved ? 'opacity-60' : ''}
                                        ${order.status === 'Delivered' ? 'ring-2 ring-green-200' : ''}
                                    `}
                                >
                                    <img
                                        src={image}
                                        alt={title}
                                        className="h-40 w-full object-cover"
                                    />

                                    <p className="text-xs text-gray-400 px-5 pt-2">
                                        Ordered on{" "}
                                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </p>

                                    <div className="p-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="flex items-center gap-2 text-lg font-bold text-slate-800">
                                                <FontAwesomeIcon icon={faTag} className="text-blue-500 text-sm" />
                                                {title}
                                            </p>
                                            <span
                                                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${s.bg} ${s.text} ${s.border}`}
                                            >
                                                <FontAwesomeIcon icon={s.icon} />
                                                {s.label}
                                            </span>
                                        </div>

                                        <p className="text-sm font-medium text-blue-500 bg-blue-50 inline-block px-3 py-1 rounded-full mb-3">
                                            {category}
                                        </p>

                                        <div className="flex flex-col gap-2 text-sm font-normal text-gray-700">
                                            <p className="flex items-center gap-2">
                                                <FontAwesomeIcon icon={faIndianRupeeSign} className="text-gray-400 w-4" />
                                                ₹{price} / ton
                                            </p>
                                            <p className="flex items-center gap-2">
                                                <FontAwesomeIcon icon={faBoxesStacked} className="text-gray-400 w-4" />
                                                Ordered: {order.quantity} ton
                                            </p>
                                            {certified && (
                                                <p className="flex items-center gap-2">
                                                    <FontAwesomeIcon icon={faAward} className="text-gray-400 w-4" />
                                                    {certified}
                                                </p>
                                            )}
                                            <p className="flex items-start gap-2">
                                                <FontAwesomeIcon icon={faMapLocationDot} className="text-gray-400 w-4 mt-1" />
                                                <span>
                                                    {order.street}, {order.city}, {order.state}, {order.country}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrder;
