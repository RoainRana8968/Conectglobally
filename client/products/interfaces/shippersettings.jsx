import React, { useEffect, useState } from 'react'
import Sidebar from '../components/sidebar'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUser,
    faLock,
    faBell,
    faCamera,
    faCircleCheck,
    faCircleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Hostsidebar from '../components/hostsidebar';
import ShipperSidebar from '../components/shippersidebar';

const Shippersettings = () => {
    const navigate = useNavigate();
    const [password, setpassword] = useState("");
    const [confirmpass, setconfirmpass] = useState("");
    const [shipper, setshipper] = useState({});
    const [name, setname] = useState("");
    const [email, setemail] = useState("");
    const [phoneno, setphoneno] = useState(0);
    const [activeTab, setActiveTab] = useState('profile')
    const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: string }
    const[shipperpro,setshipperpro]=useState({});


    // useEffect(()=>{
    //  async function fetchProfile() {
    //   let token = localStorage.getItem("hosttoken");
    //   if (!token) {
    //     navigate("/hostlogin");
    //     return;
    //   }
    //   try {
    //     let response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/shipper/profile`, {
    //       headers: { Authorization: `Bearer ${token}` },
    //     });
    //     if (response.data.success) {
    //       setshipperpro(response.data.shipper);
    //     }
    //   } catch (err) {
    //     console.log(err);
    //   }
    // }
    // fetchProfile();
    // })

    useEffect(() => {
        let token = localStorage.getItem("shipperToken");
        if (!token) {
            navigate("/shipperlogin");
            return;
        }
        async function fetchprofile() {
            try {
                let response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/shipper/profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })

                if (response.data.success) {
                    setshipper(response.data.shipper);
                }
            }
            catch (err) {
                console.log(err);
            }

        }
        fetchprofile();
    }, [])



    function showToast(type, message) {
        setToast({ type, message });
        setTimeout(() => {
            setToast(null);
        }, 3000);
    }

    const tabs = [
        { id: 'profile', label: 'Profile', icon: faUser },
        { id: 'security', label: 'Security', icon: faLock },
        { id: 'notifications', label: 'Notifications', icon: faBell },
    ]
    function changepassword() {
        if (password != confirmpass) {
            showToast("error", "Password not matched");
            return;
        }
        let obj = {
            password: password,
        }
        let token = localStorage.getItem("shipperToken");
        if (!token) {
            navigate("/shipperlogin");
            return;
        }
        try {
            let response = axios.post(`${import.meta.env.VITE_BACKEND_URL}/shipper/changepassword`, obj, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            showToast("success", "Password updated successfully");
            setpassword("");
            setconfirmpass("");
        }
        catch (err) {
            console.log(err.response);
            showToast("error", err?.response?.data?.message || "Failed to update password");
        }

    }
    function changecred() {
        let obj = {
            name: name,
            email: email,
            phoneno: phoneno,
        }
        let token = localStorage.getItem("shipperToken");
        if (!token) {
            navigate("/shipperlogin");
            return;
        }
        try {
            let response = axios.post(`${import.meta.env.VITE_BACKEND_URL}/shipper/changecred`, obj, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            showToast("success", "Profile updated successfully");
        }
        catch (err) {
            console.log(err);
            showToast("error", err?.response?.data?.message || "Failed to update profile");
        }

    }

    return (
        <div className='h-screen w-screen'>
            <div className='h-screen w-screen flex'>

                <ShipperSidebar> name={shipper.name} email={shipper.email}</ShipperSidebar>

                {/* Flash / Toast message */}
                {toast && (
                    <div className='fixed top-6 right-6 z-50 animate-[fadeIn_0.2s_ease-out]'>
                        <div
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium min-w-[260px] ${toast.type === "success"
                                ? "bg-green-50 border-green-200 text-green-700"
                                : "bg-red-50 border-red-200 text-red-700"
                                }`}
                        >
                            <FontAwesomeIcon
                                icon={toast.type === "success" ? faCircleCheck : faCircleExclamation}
                                className={toast.type === "success" ? "text-green-500" : "text-red-500"}
                            />
                            <span>{toast.message}</span>
                            <button
                                onClick={() => setToast(null)}
                                className='ml-auto text-gray-400 hover:text-gray-600'
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )}

                <div className='flex-1 bg-white overflow-y-auto'>
                    <div className='max-w-4xl mx-auto px-6 py-8'>
                        {/* Header */}
                        <div className='mb-8'>
                            <h1 className='text-2xl md:text-3xl font-bold text-gray-900'>Settings</h1>
                            <p className='text-gray-500 mt-1'>Manage your account settings and preferences</p>
                        </div>

                        <div className='flex flex-col md:flex-row gap-6'>
                            {/* Tabs */}
                            <div className='w-full md:w-56 shrink-0'>
                                <div className='bg-white border border-gray-200 rounded-xl p-2 flex md:flex-col gap-1 overflow-x-auto md:overflow-visible shadow-sm'>
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.id
                                                ? 'bg-blue-500 text-white'
                                                : 'text-gray-600 hover:bg-gray-100'
                                                }`}
                                        >
                                            <FontAwesomeIcon icon={tab.icon} className='text-base' />
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Content */}
                            <div className='flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm'>
                                {activeTab === 'profile' && (
                                    <div>
                                        <h2 className='text-lg font-semibold text-gray-900 mb-6'>Profile Information</h2>

                                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                            <div>
                                                <label className='block text-gray-500 text-sm mb-1'>name</label>
                                                <input
                                                    type='text'
                                                    placeholder='johndoe'
                                                    className='w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 outline-none focus:border-blue-700 border-2'
                                                    value={name} onChange={(e) => {
                                                        setname(e.target.value);
                                                    }} />
                                            </div>
                                            <div>
                                                <label className='block text-gray-500 text-sm mb-1'>Email</label>
                                                <input
                                                    type='email'
                                                    placeholder='john@example.com'
                                                    className='w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 outline-none focus:border-blue-700 border-2'
                                                    value={email} onChange={(e) => {
                                                        setemail(e.target.value);
                                                    }} />
                                            </div>
                                            <div>
                                                <label className='block text-gray-500 text-sm mb-1'>Phone Number</label>
                                                <input
                                                    type='text'
                                                    placeholder='+1 234 567 890'
                                                    className='w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 outline-none focus:border-blue-700 border-2'
                                                    value={phoneno} onChange={(e) => {
                                                        setphoneno(e.target.value);
                                                    }} />
                                            </div>

                                        </div>

                                        <div className='mt-6 flex justify-end'>
                                            <button className='bg-blue-500 text-white font-medium px-5 py-2 rounded-lg hover:bg-blue-600 transition-colors' onClick={changecred}>
                                                Save Changes
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'security' && (
                                    <div>
                                        <h2 className='text-lg font-semibold text-gray-900 mb-6'>Security</h2>
                                        <div className='space-y-4 max-w-md'>
                                            <div>
                                                <label className='block text-gray-500 text-sm mb-1'>New Password</label>
                                                <input
                                                    type='password'
                                                    placeholder='••••••••'
                                                    className='w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 outline-none focus:border-blue-700 border-2'
                                                    value={password} onChange={(e) => {
                                                        setpassword(e.target.value);
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <label className='block text-gray-500 text-sm mb-1'>Confirm New Password</label>
                                                <input
                                                    type='password'
                                                    placeholder='••••••••'
                                                    className='w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 outline-none focus:border-blue-700 border-2'
                                                    value={confirmpass} onChange={(e) => {
                                                        setconfirmpass(e.target.value)
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div className='mt-6 flex justify-end'>
                                            <button className='bg-blue-500 text-white font-medium px-5 py-2 rounded-lg hover:bg-blue-600 transition-colors' onClick={
                                                changepassword
                                            }>
                                                Update Password
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'notifications' && (
                                    <div>
                                        <h2 className='text-lg font-semibold text-gray-900 mb-6'>Notification Preferences</h2>
                                        <div className='space-y-4'>
                                            {[
                                                { label: 'Order Updates', desc: 'Get notified about order status changes' },
                                                { label: 'Delivery Alerts', desc: 'Get notified when an order is out for delivery' },
                                                { label: 'Promotions & Offers', desc: 'Receive updates about deals and discounts' },
                                                { label: 'Email Notifications', desc: 'Receive notifications via email' },
                                            ].map((item, i) => (
                                                <div
                                                    key={i}
                                                    className='flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3'
                                                >
                                                    <div>
                                                        <p className='text-gray-900 font-medium'>{item.label}</p>
                                                        <p className='text-gray-500 text-sm'>{item.desc}</p>
                                                    </div>
                                                    <label className='relative inline-flex items-center cursor-pointer'>
                                                        <input type='checkbox' defaultChecked className='sr-only peer' />
                                                        <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Shippersettings
