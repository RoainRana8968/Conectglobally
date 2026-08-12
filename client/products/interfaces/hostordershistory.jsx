import React, { useEffect, useState, useMemo } from 'react';
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft,
    faBoxOpen,
    faCircleCheck,
    faMagnifyingGlass,
    faCalendarDay,
    faUser,
} from '@fortawesome/free-solid-svg-icons';
import Hostsidebar from '../components/hostsidebar';

const HostOrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const[host,sethost]=useState({});
    const navigate = useNavigate();
      useEffect(() => {
    async function fetchData() {
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
    fetchData();
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

    // Every order that has ever been Delivered belongs in History,
    // regardless of how long ago — this is the permanent record.
    const deliveredOrders = useMemo(() => {
        return orders
            .filter((o) => o.status === "Delivered")
            .filter((o) => {
                if (!search.trim()) return true;
                const haystack = `${o.productTitle || ''} ${o.user?.name || ''}`.toLowerCase();
                return haystack.includes(search.toLowerCase());
            })
            .sort((a, b) => new Date(b.deliveredAt || b.updatedAt) - new Date(a.deliveredAt || a.updatedAt));
    }, [orders, search]);

    if (loading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
                <p className="text-xl font-semibold text-slate-600">Loading order history...</p>
            </div>
        );
    }

    return (
        <div className='h-screen w-screen flex bg-slate-50'>
            <Hostsidebar name={host.name} email={host.email}/>
            <div className='flex-1 flex flex-col overflow-y-auto'>
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 md:px-10 py-8 relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
                    <button
                        onClick={() => navigate("/vieworders")}
                        className="relative flex items-center gap-2 text-white/90 hover:text-white text-sm font-medium mb-4"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} />
                        Back to all orders
                    </button>
                    <h1 className="relative text-3xl md:text-4xl font-bold text-white tracking-tight">
                        Order History
                    </h1>
                    <p className="relative text-blue-100 text-sm mt-1">
                        {deliveredOrders.length} delivered order{deliveredOrders.length !== 1 ? "s" : ""}
                    </p>
                </div>

                {/* Search */}
                <div className="px-6 md:px-10 mt-6">
                    <div className="relative max-w-md">
                        <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by product or customer name..."
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 px-6 md:px-10 py-6">
                    {deliveredOrders.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center gap-3 text-gray-400">
                            <FontAwesomeIcon icon={faBoxOpen} className="text-5xl" />
                            <p className="text-lg font-normal">No delivered orders yet.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3 max-w-4xl">
                            {deliveredOrders.map((order) => {
                                const deliveredDate = order.deliveredAt || order.updatedAt;

                                return (
                                    <div
                                        key={order._id}
                                        className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-4 flex items-center gap-4"
                                    >
                                        <img
                                            src={order.productImage}
                                            alt={order.productTitle}
                                            className="w-20 h-20 rounded-xl object-cover shrink-0"
                                        />

                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-slate-800 truncate">{order.productTitle}</p>
                                            <p className="text-sm text-gray-500 mt-0.5">
                                                {order.quantity} ton · ₹{order.productPrice} / ton
                                            </p>
                                            <p className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                                                <FontAwesomeIcon icon={faUser} />
                                                {order.user?.name || "Customer"}
                                            </p>
                                        </div>

                                        <div className="text-right shrink-0">
                                            <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border bg-green-50 text-green-700 border-green-200">
                                                <FontAwesomeIcon icon={faCircleCheck} />
                                                Delivered
                                            </span>
                                            <p className="flex items-center justify-end gap-1.5 text-xs text-gray-400 mt-2">
                                                <FontAwesomeIcon icon={faCalendarDay} />
                                                {deliveredDate
                                                    ? new Date(deliveredDate).toLocaleDateString("en-IN", {
                                                          day: "numeric",
                                                          month: "short",
                                                          year: "numeric",
                                                      })
                                                    : "—"}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HostOrderHistory;
