import React, { useEffect, useRef, useState } from 'react';
import {Link} from "react-router-dom"
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTag,
    faIndianRupeeSign,
    faBoxesStacked,
    faMapLocationDot,
    faUser,
    faTruck,
    faCheckCircle,
    faBoxOpen,
    faSpinner,
    faArrowLeft,
    faClockRotateLeft
} from '@fortawesome/free-solid-svg-icons';
import socket from "../src/socket.js";

// How long (ms) the delivered card stays visible (faded) before disappearing
const FADE_DURATION_MS = 5000; // 5 seconds

const ShipperOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [delivering, setDelivering] = useState(null);

    // Set of orderIds that are in the "delivered → fading out" phase
    const [fadingOut, setFadingOut] = useState(new Set());

    // Keep refs to any pending removal timers so we can clear on unmount
    const timers = useRef({});

    // Fetch orders already assigned to this shipper (status "Delayed")
    async function fetchAssignedOrders() {
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
                // Only keep active (not yet delivered) orders here.
                // Once an order is marked Delivered it moves permanently to Shipper History.
                setOrders(response.data.orders.filter((o) => o.status !== "Delivered"));
            }
        } catch (err) {
            console.error("Fetch error:", err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchAssignedOrders();
    }, []);

    // Clean up all timers on unmount
    useEffect(() => {
        return () => {
            Object.values(timers.current).forEach(clearTimeout);
        };
    }, []);

    // Real-time: host assigns a new order / status changes from elsewhere
    useEffect(() => {
        socket.on("assignedorder", (order) => {
            setOrders((prev) => {
                const exists = prev.find((o) => o._id === order._id);
                if (exists) {
                    return prev.map((o) => (o._id === order._id ? order : o));
                }
                return [order, ...prev];
            });
        });

        socket.on("orderStatusUpdated", (updatedOrder) => {
            setOrders((prev) => {
                // If some other client marked it Delivered, keep it visible here
                // only long enough to fade out, matching the local markDelivered flow.
                const exists = prev.find((o) => o._id === updatedOrder._id);
                if (!exists) return prev;
                return prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o));
            });

            if (updatedOrder.status === "Delivered") {
                setFadingOut((prev) => new Set([...prev, updatedOrder._id]));
                timers.current[updatedOrder._id] = setTimeout(() => {
                    setOrders((prev) => prev.filter((o) => o._id !== updatedOrder._id));
                    setFadingOut((prev) => {
                        const next = new Set(prev);
                        next.delete(updatedOrder._id);
                        return next;
                    });
                    delete timers.current[updatedOrder._id];
                }, FADE_DURATION_MS);
            }
        });

        return () => {
            socket.off("assignedorder");
            socket.off("orderStatusUpdated");
        };
    }, []);

    // Shipper marks order as Delivered:
    // 1. API call → status = "Delivered" (backend emits orderStatusUpdated to all clients)
    // 2. Card goes faded/gray immediately here on the shipper's screen
    // 3. After FADE_DURATION_MS the card is removed from this page permanently
    //    (it now lives in Shipper History with its full details)
    async function markDelivered(orderId) {
        let token = localStorage.getItem("shipperToken");
        setDelivering(orderId);
        try { 
            let response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/shipper/updatestatus/${orderId}`,
                { status: "Delivered" },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                // Update status in local state
                setOrders((prev) =>
                    prev.map((o) =>
                        o._id === orderId ? { ...o, status: "Delivered", deliveredAt: new Date().toISOString() } : o
                    )
                );

                // Mark as fading so the card goes gray
                setFadingOut((prev) => new Set([...prev, orderId]));

                // Remove from this active list after delay — it now belongs in Shipper History
                timers.current[orderId] = setTimeout(() => {
                    setOrders((prev) => prev.filter((o) => o._id !== orderId));
                    setFadingOut((prev) => {
                        const next = new Set(prev);
                        next.delete(orderId);
                        return next;
                    });
                    delete timers.current[orderId];
                }, FADE_DURATION_MS);
            }
        } catch (err) {
            console.error("Mark delivered error:", err.message);
        } finally {
            setDelivering(null);
        }
    }

    // Status badge
    function StatusBadge({ status }) {
        const styles = {
            Delayed:   "bg-orange-50 text-orange-700 border-orange-200",
            Delivered: "bg-green-50 text-green-700 border-green-200",
        };
        const icons = {
            Delayed:   faTruck,
            Delivered: faCheckCircle,
        };
        const labels = {
            Delayed:   "Assigned — Pending Delivery",
            Delivered: "Delivered",
        };
        return (
            <span
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${styles[status] || "bg-gray-50 text-gray-600 border-gray-200"}`}
            >
                <FontAwesomeIcon icon={icons[status] || faTruck} />
                {labels[status] || status}
            </span>
        );
    }

    if (loading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
                <p className="text-xl font-semibold text-slate-600">Loading your orders...</p>
            </div>
        );
    }

    const assignedOrders = orders.filter(
        (o) => o.status === "Delayed" || o.status === "Delivered"
    );

    return (
        <div className="h-screen w-screen flex bg-slate-50">
            {/* <Shippersidebar /> */}

            <div className="flex-1 flex flex-col overflow-y-auto">
                <div className="flex flex-col items-center mt-6 mb-2">
                <Link className='absolute left-20 top-10 text-blue-600 font-semibold' to={"/shipperdashboard"}><FontAwesomeIcon icon={faArrowLeft}/><span>Back</span></Link>
                <Link className='absolute right-20 top-10 flex items-center gap-2 text-blue-600 font-semibold' to={"/shipperhistory"}>
                    <FontAwesomeIcon icon={faClockRotateLeft}/><span>Delivery History</span>
                </Link>

                    <h1 className="text-4xl md:text-5xl text-blue-700 font-semibold tracking-tight">
                        My Deliveries
                    </h1>
                    <p className="text-sm text-gray-400 font-normal mt-1">
                        Orders assigned to you — accept delivery to mark them done
                    </p>
                </div>

                {assignedOrders.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400">
                        <FontAwesomeIcon icon={faBoxOpen} className="text-5xl" />
                        <p className="text-lg font-normal">No orders assigned to you yet.</p>
                        <p className="text-sm">Orders will appear here as hosts assign them.</p>
                    </div>
                ) : (
                    <div className="p-4 md:p-6 flex flex-col gap-6">
                        {assignedOrders.map((order) => {
                            const isFading = fadingOut.has(order._id);

                            return (
                                <div
                                    key={order._id}
                                    // Fading: go grayscale + semi-transparent, smooth transition
                                    className={`bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-100 w-full flex flex-col md:flex-row overflow-hidden
                                        transition-all duration-700
                                        ${isFading ? "opacity-40 grayscale pointer-events-none" : "opacity-100"}
                                    `}
                                >
                                    <img
                                        src={order.productImage}
                                        alt={order.productTitle}
                                        className="w-full md:w-72 h-64 md:h-auto object-cover"
                                    />

                                    <div className="flex-1 p-6 flex flex-col justify-between">
                                        <div>
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
                                                    <span>
                                                        {order.street}, {order.city}, {order.state}, {order.country}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex justify-end">
                                            {order.status === "Delivered" ? (
                                                <span className="flex items-center gap-2 px-6 py-3 bg-green-50 text-green-700 rounded-xl font-semibold border border-green-200">
                                                    <FontAwesomeIcon icon={faCheckCircle} />
                                                    Delivered
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => markDelivered(order._id)}
                                                    disabled={delivering === order._id}
                                                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50 shadow-lg shadow-blue-600/20 font-semibold"
                                                >
                                                    {delivering === order._id ? (
                                                        <>
                                                            <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                                            Updating...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FontAwesomeIcon icon={faTruck} />
                                                            Accept &amp; Mark Delivered
                                                        </>
                                                    )}
                                                </button>
                                            )}
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

export default ShipperOrders;
