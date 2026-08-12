import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import socket from "../src/socket.js";
import Hostsidebar from "../components/hostsidebar.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AIChatbot from '../components/chatbot.jsx';//changed here 
import {
  faClock,
  faCircleCheck,
  faCartShopping,
  faArrowRight,
  faEye,
  faBell,
  faTruck,
  faBoxesStacked,
  faUser,
  faTag,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";

const statusStyles = {
  Pending: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
  Delayed: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  Delivered: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
};

function StatCard({ icon, label, value, accent }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-5 hover:shadow-md transition-shadow">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${accent.bg}`}>
        <FontAwesomeIcon icon={icon} className={`text-xl ${accent.text}`} />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-3xl font-bold text-slate-800 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

const Hostdashboard = () => {
  const [newNotification, setNewNotification] = useState(false);
  const [host, sethost] = useState({});
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  // ── Fetch host profile ──────────────────────────────────────────────
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

  // ── Fetch all orders belonging to this host (drives the stat cards) ──
  async function fetchOrders() {
    let token = localStorage.getItem("hosttoken");
    if (!token) return;
    try {
      let response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/orders/gethostorders`, {
        headers: { Authorization: `Bearer ${token}` },
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

  // ── Real-time updates: new order placed, or status changed anywhere ──
  useEffect(() => {
    // A brand-new order was placed by a customer
    socket.on("newOrder", (order) => {
      setNewNotification(true);
      // Only add it to this host's stats if it actually belongs to them
      setOrders((prev) => {
        const hostId = host?._id || host?.id;
        if (hostId && order.host && order.host.toString() !== hostId.toString()) {
          return prev;
        }
        return [order, ...prev];
      });
    });

    // Status changed (host assigned shipper, or shipper delivered)
    socket.on("orderStatusUpdated", (updatedOrder) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === updatedOrder._id ? { ...o, ...updatedOrder } : o))
      );
    });

    return () => {
      socket.off("newOrder");
      socket.off("orderStatusUpdated");
    };
  }, [host]);

  // ── Derived stats — recomputed automatically whenever `orders` changes ──
  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === "Pending").length;
    const delayed = orders.filter((o) => o.status === "Delayed").length;
    const completed = orders.filter((o) => o.status === "Delivered").length;
    return { total, pending, delayed, completed };
  }, [orders]);

  // Most recent 5 orders, newest first — a quick-glance activity feed
  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }, [orders]);

  function handleViewOrders() {
    setNewNotification(false);
    navigate("/vieworders");
  }

  const firstName = (host?.name || "").split(" ")[0];
    const dashboardCode = `
    const Dashboard = () => {
      return <div>My Dashboard</div>;
    };
  `;

  return (
    <div className="h-screen w-screen flex bg-slate-50">
      <Hostsidebar email={host.email} name={host.name} />
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              {firstName ? `Welcome back, ${firstName}` : "Dashboard"}
            </h1>
            <p className="text-gray-500 mt-1">Here's what's happening with your orders today.</p>
          </div>

          <button
            onClick={handleViewOrders}
            className="relative flex items-center gap-2 self-start sm:self-auto bg-white border border-slate-200 text-slate-700 font-semibold px-4 py-2.5 rounded-xl hover:bg-slate-50 transition shadow-sm"
          >
            <FontAwesomeIcon icon={faBell} className={newNotification ? "text-red-500" : "text-slate-400"} />
            Notifications
            {newNotification && (
              <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            icon={faCartShopping}
            label="Total Orders"
            value={stats.total}
            accent={{ bg: "bg-blue-50", text: "text-blue-600" }}
          />
          <StatCard
            icon={faClock}
            label="Pending"
            value={stats.pending}
            accent={{ bg: "bg-yellow-50", text: "text-yellow-600" }}
          />
          <StatCard
            icon={faTruck}
            label="Out for Delivery"
            value={stats.delayed}
            accent={{ bg: "bg-orange-50", text: "text-orange-600" }}
          />
          <StatCard
            icon={faCircleCheck}
            label="Delivered"
            value={stats.completed}
            accent={{ bg: "bg-green-50", text: "text-green-600" }}
          />
        </div>

        {/* Main content: recent orders + quick actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-slate-800">Recent Orders</h2>
              <button
                onClick={handleViewOrders}
                className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                View all
                <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
              </button>
            </div>

            {recentOrders.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center gap-2 text-gray-400">
                <FontAwesomeIcon icon={faCartShopping} className="text-3xl" />
                <p>No orders yet.</p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-slate-100">
                {recentOrders.map((order) => {
                  const s = statusStyles[order.status] || statusStyles.Pending;
                  return (
                    <div key={order._id} className="flex items-center gap-4 py-3">
                      <img
                        src={order.productImage}
                        alt={order.productTitle}
                        className="w-12 h-12 rounded-lg object-cover shrink-0 bg-slate-100"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="flex items-center gap-1.5 font-semibold text-slate-800 truncate">
                          <FontAwesomeIcon icon={faTag} className="text-slate-300 text-xs" />
                          {order.productTitle}
                        </p>
                        <p className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                          <FontAwesomeIcon icon={faUser} />
                          {order.user?.name || "Customer"}
                          <FontAwesomeIcon icon={faBoxesStacked} className="ml-2" />
                          {order.quantity} ton
                        </p>
                      </div>
                      <span
                        className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full border ${s.bg} ${s.text} ${s.border}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4">
            <h2 className="text-xl font-bold text-slate-800 mb-1">Quick Actions</h2>

            <div className="relative">
              <button
                onClick={handleViewOrders}
                className="w-full flex items-center justify-between gap-2 bg-blue-600 text-white font-semibold px-5 py-4 rounded-xl hover:bg-blue-700 transition shadow-sm shadow-blue-600/20"
              >
                <span className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faCartShopping} />
                  View all orders
                </span>
                <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
              </button>

              {newNotification && (
                <span className="absolute -top-2 -right-2 flex items-center gap-1 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-bounce">
                  <FontAwesomeIcon icon={faBell} />
                  New!
                </span>
              )}
            </div>

            <Link
              to="/viewproducts"
              className="w-full flex items-center justify-between gap-2 bg-slate-50 border border-slate-200 text-slate-700 font-semibold px-5 py-4 rounded-xl hover:bg-slate-100 transition"
            >
              <span className="flex items-center gap-2">
                <FontAwesomeIcon icon={faEye} />
                View all products
              </span>
              <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
            </Link>

            <Link
              to="/newproduct"
              className="w-full flex items-center justify-between gap-2 bg-slate-50 border border-slate-200 text-slate-700 font-semibold px-5 py-4 rounded-xl hover:bg-slate-100 transition"
            >
              <span className="flex items-center gap-2">
                <FontAwesomeIcon icon={faTag} />
                Add new product
              </span>
              <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
            </Link>

            <Link
              to="/hostorderhistory"
              className="w-full flex items-center justify-between gap-2 bg-slate-50 border border-slate-200 text-slate-700 font-semibold px-5 py-4 rounded-xl hover:bg-slate-100 transition"
            >
              <span className="flex items-center gap-2">
                <FontAwesomeIcon icon={faCircleCheck} />
                Order history
              </span>
              <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
            </Link>
          </div>
        </div>
      </div>
         <AIChatbot interfaceCode={dashboardCode} />

    </div>
  );
};

export default Hostdashboard;
