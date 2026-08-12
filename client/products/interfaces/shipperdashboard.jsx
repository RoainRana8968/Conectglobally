import React, { useEffect, useState, useMemo } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTruck } from "@fortawesome/free-solid-svg-icons";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { faClockRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { faBoxOpen } from "@fortawesome/free-solid-svg-icons";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom"
import axios from "axios";
import socket from "../src/socket.js";
import ShipperSidebar from '../components/shippersidebar';

const ShipperDashboard = () => {
    const [shipper, setShipper] = useState(null);
    const [orders, setOrders] = useState([]);

    // ── Fetch shipper profile ────────────────────────────────────────────
    useEffect(() => {
        async function fetchProfile() {
            let token = localStorage.getItem("shipperToken");
            if (!token) return;
            try {
                let response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/shipper/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.success) {
                    setShipper(response.data.shipper);
                }
            } catch (err) {
                console.log(err);
            }
        }
        fetchProfile();
    }, []);

    // ── Fetch assigned orders — this is what actually drives the stat cards ──
    async function fetchOrders() {
        let token = localStorage.getItem("shipperToken");
        if (!token) return;
        try {
            let response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/shipper/getshipperorders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setOrders(response.data.orders);
            }
        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        fetchOrders();
    }, []);

    // ── Real-time: order gets assigned to shippers, or status changes ──────
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
            setOrders((prev) =>
                prev.map((o) => (o._id === updatedOrder._id ? { ...o, ...updatedOrder } : o))
            );
        });

        return () => {
            socket.off("assignedorder");
            socket.off("orderStatusUpdated");
        };
    }, []);

    // ── Derived stats — recomputed automatically whenever `orders` changes ──
    const stats = useMemo(() => {
        const total = orders.length;
        const active = orders.filter((o) => o.status === "Delayed").length; // out for delivery
        const completed = orders.filter((o) => o.status === "Delivered").length;
        return { total, active, completed };
    }, [orders]);

    // ── Recent activity — latest 5 assigned orders, newest first ───────────
    const recentOrders = useMemo(() => {
        return [...orders]
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
            .slice(0, 5);
    }, [orders]);

    function StatusPill({ status }) {
        const isDelivered = status === "Delivered";
        return (
            <span
                className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                    isDelivered
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
            >
                <FontAwesomeIcon icon={isDelivered ? faCircleCheck : faClock} />
                {isDelivered ? "Delivered" : "Out for delivery"}
            </span>
        );
    }

    return (
        <div className='h-screen w-screen'>
            <div className='h-screen w-screen flex'>
                <ShipperSidebar name={shipper?.name} email={shipper?.email}></ShipperSidebar>
                <div className="flex-1 bg-slate-50 overflow-y-auto">
                    <div className="max-w-6xl mx-auto px-6 md:px-10 py-8">

                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                                    Welcome back{shipper?.name ? `, ${shipper.name}` : ""}
                                </h1>
                                <p className="text-slate-500 mt-1">
                                    Here's an overview of your delivery activity
                                </p>
                            </div>
                            <Link
                                to={"/shipperhistory"}
                                className="hidden md:flex items-center gap-2 bg-white border border-slate-200 text-slate-600 font-medium px-4 py-2.5 rounded-xl shadow-sm hover:bg-slate-50 transition-colors"
                            >
                                <FontAwesomeIcon icon={faClockRotateLeft} />
                                Delivery History
                            </Link>
                        </div>

                        {/* Stat Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                                    <FontAwesomeIcon icon={faClock} className="text-amber-500 text-lg" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Active Deliveries</p>
                                    <p className="text-3xl font-bold text-slate-800">{stats.active}</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                                    <FontAwesomeIcon icon={faTruck} className="text-blue-500 text-lg" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Total Deliveries</p>
                                    <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                                    <FontAwesomeIcon icon={faCircleCheck} className="text-emerald-500 text-lg" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Completed Deliveries</p>
                                    <p className="text-3xl font-bold text-slate-800">{stats.completed}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* Recent Activity */}
                            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                                <div className="flex items-center justify-between mb-5">
                                    <h2 className="text-lg font-semibold text-slate-800">Recent Assignments</h2>
                                    <Link to={"/shipperorders"} className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                                        View all <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                                    </Link>
                                </div>

                                {recentOrders.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center text-slate-400 py-14 gap-2">
                                        <FontAwesomeIcon icon={faBoxOpen} className="text-3xl" />
                                        <p className="text-sm">No orders assigned yet</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col divide-y divide-slate-100">
                                        {recentOrders.map((order) => (
                                            <div key={order._id} className="flex items-center gap-4 py-3.5">
                                                <img
                                                    src={order.productImage}
                                                    alt={order.productTitle}
                                                    className="w-12 h-12 rounded-lg object-cover border border-slate-100 flex-shrink-0"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-slate-800 truncate">{order.productTitle}</p>
                                                    <p className="text-sm text-slate-500 flex items-center gap-1.5 truncate">
                                                        <FontAwesomeIcon icon={faLocationDot} className="text-slate-400 text-xs" />
                                                        {order.city}, {order.state}
                                                    </p>
                                                </div>
                                                <StatusPill status={order.status} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-slate-800 mb-5">Quick Actions</h2>
                                <div className="flex flex-col gap-3">
                                    <Link
                                        to={"/shipperorders"}
                                        className="flex items-center justify-between bg-blue-600 text-white font-medium px-4 py-3 rounded-xl hover:bg-blue-700 transition-colors"
                                    >
                                        <span className="flex items-center gap-2">
                                            <FontAwesomeIcon icon={faTruck} />
                                            View Assigned Orders
                                        </span>
                                        <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
                                    </Link>

                                    <Link
                                        to={"/shipperhistory"}
                                        className="flex items-center justify-between bg-slate-50 text-slate-700 font-medium px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors"
                                    >
                                        <span className="flex items-center gap-2">
                                            <FontAwesomeIcon icon={faClockRotateLeft} />
                                            Delivery History
                                        </span>
                                        <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
                                    </Link>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default ShipperDashboard
