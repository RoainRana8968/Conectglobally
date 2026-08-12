import React, { useEffect, useState } from 'react'
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import Hostsidebar from '../components/hostsidebar'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTag,
    faIndianRupeeSign,
    faBoxesStacked,
    faMapLocationDot,
    faUser,
    faTruck,
    faClock,
    faCheckCircle,
    faHourglassHalf,
    faSpinner,
    faClockRotateLeft,
} from '@fortawesome/free-solid-svg-icons';
import socket from "../src/socket.js";

// How long a Delivered order stays on this page before it "graduates"
// to /hostorderhistory and disappears from here.
const DELIVERED_DISPLAY_MS = 24 * 60 * 60 * 1000; // 1 day

// Falls back to `updatedAt` if the backend hasn't set a dedicated
// `deliveredAt` field — mongoose timestamps update `updatedAt` on save,
// which happens exactly when status flips to "Delivered".
function isDeliveredExpired(order) {
    if (order.status !== "Delivered") return false;
    const deliveredAt = order.deliveredAt || order.updatedAt;
    if (!deliveredAt) return false;
    return Date.now() - new Date(deliveredAt).getTime() > DELIVERED_DISPLAY_MS;
}

// Status badge config — add new statuses here as needed
const statusConfig = {
    Pending: {
        bg: "bg-yellow-50",
        text: "text-yellow-700",
        border: "border-yellow-200",
        icon: faClock,
        label: "Pending",
    },
    Delayed: {
        bg: "bg-orange-50",
        text: "text-orange-700",
        border: "border-orange-200",
        icon: faHourglassHalf,
        label: "Shipper Assigned",
    },
    Delivered: {
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-200",
        icon: faCheckCircle,
        label: "Delivered",
    },
};

function StatusBadge({ status }) {
    const cfg = statusConfig[status] || statusConfig.Pending;
    return (
        <span
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}
        >
            <FontAwesomeIcon icon={cfg.icon} />
            {cfg.label}
        </span>
    );
}

const Vieworders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState(null); // orderId currently being updated
      const [host, sethost] = useState({});
    
    const navigate = useNavigate();

    // Re-render periodically so a Delivered order older than 1 day
    // quietly drops off this page (it now lives in Order History).
    const [, forceTick] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => forceTick((t) => t + 1), 30000);
        return () => clearInterval(interval);
    }, []);

      useEffect(() => {
    async function fetchProfile() {
      let token = localStorage.getItem("hosttoken");
      if (!token) {
        navigate("/hostlogin");
        return;
      }
      try {
        let response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/hosts/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          sethost(response.data.host);
        }
      } catch (err) {
        console.log(err);
      }
    }
    fetchProfile();
  }, []);

    async function fetchOrders() {
        let token = localStorage.getItem("hosttoken");
        if (!token) {
            console.error("No token found in localStorage");
            return;
        }
        try {
            let response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/orders/gethostorders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setOrders(response.data.orders);
            }
        } catch (err) {
            console.error("Fetch error:", err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchOrders();
    }, []);

    // Real-time: new order placed, or status changed by shipper / elsewhere
    useEffect(() => {
        socket.on("newOrder", (order) => {
            setOrders((prev) => [order, ...prev]);
        });

        // Fires when host assigns shipper OR when shipper marks Delivered
        socket.on("orderStatusUpdated", (updatedOrder) => {
            setOrders((prev) =>
                prev.map((order) =>
                    order._id === updatedOrder._id ? { ...order, ...updatedOrder } : order
                )
            );
        });

        return () => {
            socket.off("newOrder");
            socket.off("orderStatusUpdated");
        };
    }, []);

    // Mark order as Delayed (assigns it to shipper queue)
    async function assignShipper(orderId) {
        let token = localStorage.getItem("hosttoken");
        setAssigning(orderId);
        try {
            let response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/orders/updatestatus/${orderId}`,
                { status: "Delayed" },// senng here a delayed status to change 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                // Keep the order in the list — just update its status to Delayed
                setOrders((prev) =>
                    prev.map((order) =>
                        order._id === orderId ? { ...order, status: "Delayed" } : order
                    )
                );
            }
        } catch (err) {
            console.error("Assign shipper error:", err.message);
        } finally {
            setAssigning(null);
        }
    }

    // Show Pending, Delayed and Delivered — but a Delivered order older
    // than 1 day has moved to Order History and drops off here.
    const visibleOrders = orders.filter(
        (o) =>
            ["Pending", "Delayed", "Delivered"].includes(o.status) &&
            !isDeliveredExpired(o)
    );

    if (loading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
                <p className="text-xl font-semibold text-slate-600">Loading orders...</p>
            </div>
        );
    }

    return (
        <div className='h-screen w-screen flex bg-slate-50'>
            <Hostsidebar email={host.email} name={host.name} />
            <div className='flex-1 flex flex-col overflow-y-auto'>
                <div className='flex flex-col items-center mt-6 mb-2'>
                    <h1 className='text-4xl md:text-5xl text-blue-700 font-semibold tracking-tight'>
                        All Orders
                    </h1>
                    <p className='text-sm text-gray-400 font-normal mt-1'>
                        Assign a shipper to pending orders — track delivery progress here
                    </p>
                    <button
                        onClick={() => navigate("/hostorderhistory")}
                        className="flex items-center gap-2 text-sm text-blue-600 font-semibold mt-3 px-4 py-2 rounded-full bg-blue-50 hover:bg-blue-100 transition"
                    >
                        <FontAwesomeIcon icon={faClockRotateLeft} />
                        View delivered order history
                    </button>
                </div>

                {visibleOrders.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-lg text-gray-500 font-normal">No orders right now.</p>
                    </div>
                ) : (
                    <div className='p-4 md:p-6 flex flex-col gap-6'>
                        {visibleOrders.map((order) => (
                            <div
                                key={order._id}
                                className="bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-100 w-full flex flex-col md:flex-row overflow-hidden"
                            >
                                <img
                                    src={order.productImage}
                                    alt={order.productTitle}
                                    className="w-full md:w-72 h-64 md:h-auto object-cover"
                                />

                                <div className="flex-1 p-6 flex flex-col justify-between">
                                    <div>
                                        {/* Title + Dynamic Status Badge */}
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="flex items-center gap-2 text-2xl font-bold text-slate-800">
                                                <FontAwesomeIcon icon={faTag} className="text-blue-500 text-lg" />
                                                {order.productTitle}
                                            </p>
                                            <StatusBadge status={order.status} />
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
                                                {order.quantity} ton ordered
                                            </p>
                                            <p className="flex items-center gap-2">
                                                <FontAwesomeIcon icon={faUser} className="text-gray-400 w-4" />
                                                {order.user?.name || "Customer"}
                                            </p>
                                            <p className="flex items-start gap-2">
                                                <FontAwesomeIcon icon={faMapLocationDot} className="text-gray-400 w-4 mt-1" />
                                                <span>{order.street}, {order.city}, {order.state}, {order.country}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        {order.status === "Pending" && (
                                            // Only show Assign button for Pending orders
                                            <button
                                                onClick={() => assignShipper(order._id)}
                                                disabled={assigning === order._id}
                                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50 shadow-lg shadow-blue-600/20 font-semibold"
                                            >
                                                {assigning === order._id ? (
                                                    <>
                                                        <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                                        Assigning...
                                                    </>
                                                ) : (
                                                    <>
                                                        <FontAwesomeIcon icon={faTruck} />
                                                        Assign Shipper
                                                    </>
                                                )}
                                            </button>
                                        )}

                                        {order.status === "Delayed" && (
                                            // Shipper assigned — waiting for delivery
                                            <span className="flex items-center gap-2 px-6 py-3 bg-orange-50 text-orange-700 rounded-xl font-semibold border border-orange-200">
                                                <FontAwesomeIcon icon={faHourglassHalf} />
                                                Awaiting Delivery
                                            </span>
                                        )}

                                        {order.status === "Delivered" && (
                                            // Shipper marked it delivered
                                            <span className="flex items-center gap-2 px-6 py-3 bg-green-50 text-green-700 rounded-xl font-semibold border border-green-200">
                                                <FontAwesomeIcon icon={faCheckCircle} />
                                                Delivered
                                            </span>
                                        )}
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

export default Vieworders;
