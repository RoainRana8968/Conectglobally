import React, { useState, useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AIChatbot from '../components/chatbot.jsx';//changed here 
import {
  faClock,
  faCircleCheck,
  faCartShopping,
  faArrowRight,
  faEye,
  faBell,
  faBoxOpen,
} from "@fortawesome/free-solid-svg-icons";
import Sidebar from "../components/sidebar";
import socket from "../src/socket.js";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Userdashboard = () => {
  const navigate = useNavigate();
  const [newNotification, setNewNotification] = useState(false);
  const [latestProduct, setLatestProduct] = useState(null);
  const [user, setuser] = useState({});
  const [orders, setOrders] = useState([]);

  // ── Fetch user profile ──────────────────────────────────────────────
  useEffect(() => {
    async function fetchData() {
      let token = localStorage.getItem("userToken");
      if (!token) {
        navigate("/userlogin");
        return;
      }
      try {
        let response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          setuser(response.data.user);
        }
      } catch (err) {
        console.log(err);
      }
    }
    fetchData();
  }, []);

  // ── Fetch this user's orders — drives the stat cards ─────────────────
  async function fetchOrders() {
    let token = localStorage.getItem("userToken");
    if (!token) return;
    try {
      let response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/orders/getmyorders`, {
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

  // ── Real-time: order placed by this user, or status changes ──────────
  useEffect(() => {
    const userId = user?._id || user?.id;

    socket.on("newOrder", (order) => {
      // Only count it if it belongs to this user
      const orderUserId = order.user?._id || order.user;
      if (userId && orderUserId && orderUserId.toString() === userId.toString()) {
        setOrders((prev) => [order, ...prev]);
      }
    });

    socket.on("orderStatusUpdated", (updatedOrder) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === updatedOrder._id ? { ...o, ...updatedOrder } : o))
      );
    });
    return () => {
      socket.off("newOrder");
      socket.off("orderStatusUpdated");
    };
  }, [user]);

  // ── Product notifications (unchanged logic) ───────────────────────────
  useEffect(() => {
    const storedProduct = localStorage.getItem("latestUserProduct");
    if (storedProduct) {
      setLatestProduct(JSON.parse(storedProduct));
      setNewNotification(true);
    }

    socket.on("productAdded", (product) => {
      setLatestProduct(product);
      setNewNotification(true);
      localStorage.setItem("latestUserProduct", JSON.stringify(product));
    });

    socket.on("productDeleted", ({ productId }) => {
      const stored = localStorage.getItem("latestUserProduct");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed._id === productId) {
            localStorage.removeItem("latestUserProduct");
            setLatestProduct(null);
            setNewNotification(false);
          }
        } catch {}
      }
    });

    return () => {
      socket.off("productAdded");
      socket.off("productDeleted");
    };
  }, []);

  const handleOpenNewProducts = () => {
    setNewNotification(false);
    navigate("/newproductsforuser", { state: { product: latestProduct } });
  };

  // ── Derived stats — recomputed automatically whenever `orders` changes ──
  // it is working like
  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === "Pending").length;
    const completed = orders.filter((o) => o.status === "Delivered").length;
    return { total, pending, completed };
  }, [orders]);

  const initials = (user?.name || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();




      const dashboardCode = `
    const Dashboard = () => {
      return <div>My Dashboard</div>;
    };
  `;



  return (
    <div className="h-screen w-screen bg-slate-50 flex overflow-y-auto">
      <div className="h-full w-full flex">
        <Sidebar />

        <div className="flex-1 p-6 md:p-8">
          {/* ── Header banner ──────────────────────────────────────── */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 md:p-8 mb-8 shadow-lg shadow-blue-600/20">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
            <div className="absolute -bottom-16 -right-24 w-56 h-56 bg-white/10 rounded-full" />
            <div className="relative flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white text-lg font-bold backdrop-blur-sm">
                {initials}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                  Welcome back{user?.name ? `, ${user.name}` : ""}
                </h1>
                <p className="text-blue-100 text-sm mt-1">
                  Here's a quick look at your orders and activity
                </p>
              </div>
            </div>
          </div>

          {/* ── Stat cards ─────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-4 hover:shadow-md transition-shadow duration-300">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={faClock} className="text-amber-500 text-lg" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Pending Orders</p>
                <p className="text-3xl font-bold text-slate-800 mt-0.5">{stats.pending}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-4 hover:shadow-md transition-shadow duration-300">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={faCartShopping} className="text-blue-500 text-lg" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Total Orders</p>
                <p className="text-3xl font-bold text-slate-800 mt-0.5">{stats.total}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-4 hover:shadow-md transition-shadow duration-300">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={faCircleCheck} className="text-emerald-500 text-lg" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Completed Orders</p>
                <p className="text-3xl font-bold text-slate-800 mt-0.5">{stats.completed}</p>
              </div>
            </div>
          </div>

          {/* ── Quick actions panel ────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Your Orders</h2>
                <p className="text-sm text-slate-400 mt-0.5">Manage and track everything in one place</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                <FontAwesomeIcon icon={faBoxOpen} className="text-blue-500 text-lg" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                to="/myorders"
                className="group flex items-center justify-between px-6 py-4 bg-slate-50 hover:bg-blue-600 border border-slate-100 rounded-xl transition-colors duration-200"
              >
                <span className="font-semibold text-slate-700 group-hover:text-white transition-colors">
                  View all orders
                </span>
                <FontAwesomeIcon
                  icon={faArrowRight}
                  className="text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all"
                />
              </Link>

              <div className="relative">
                <button
                  onClick={handleOpenNewProducts}
                  className="w-full flex items-center justify-between px-6 py-4 bg-slate-50 hover:bg-blue-600 group border border-slate-100 rounded-xl transition-colors duration-200"
                >
                  <span className="font-semibold text-slate-700 group-hover:text-white transition-colors">
                    Check new products
                  </span>
                  <FontAwesomeIcon
                    icon={faEye}
                    className="text-slate-400 group-hover:text-white transition-colors"
                  />
                </button>

                {newNotification && (
                  <span className="absolute -top-2 -right-2 flex items-center gap-1 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-bounce">
                    <FontAwesomeIcon icon={faBell} />
                    New!
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
         <AIChatbot interfaceCode={dashboardCode} />
    </div>
  );
};

export default Userdashboard;
