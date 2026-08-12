import React from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { faBuilding } from "@fortawesome/free-solid-svg-icons";
import { faTruck } from "@fortawesome/free-solid-svg-icons";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from 'react-router-dom';
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import Navbar from '../components/navbar';

const Login = () => {
    const navigate = useNavigate();

    const roles = [
        {
            label: "Buyer",
            desc: "Browse and order products from verified exporters",
            icon: faUser,
            color: "text-blue-600",
            bg: "bg-blue-50",
            ring: "hover:border-blue-400 hover:shadow-blue-100",
            path: "/usersignup",
        },
        {
            label: "Exporter",
            desc: "List your products and manage incoming orders",
            icon: faBuilding,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            ring: "hover:border-emerald-400 hover:shadow-emerald-100",
            path: "/hostsignup",
        },
        {
            label: "Shipper",
            desc: "Accept assignments and deliver orders on time",
            icon: faTruck,
            color: "text-amber-600",
            bg: "bg-amber-50",
            ring: "hover:border-amber-400 hover:shadow-amber-100",
            path: "/shippersignup",
        },
    ];

    return (
        <div className='min-h-screen w-full flex flex-col bg-gradient-to-b from-slate-50 to-slate-100'>
            <Navbar></Navbar>

            <div className='flex-1 flex justify-center items-center px-4 py-16'>
                <div className='w-full max-w-2xl bg-white rounded-3xl shadow-xl shadow-slate-200/70 border border-slate-100 overflow-hidden'>

                    {/* Header */}
                    <div className='flex flex-col items-center gap-3 pt-10 pb-8 px-6 border-b border-slate-100 bg-gradient-to-br from-blue-50 via-white to-white'>
                        <div className='w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30'>
                            <FontAwesomeIcon icon={faGlobe} className="text-white text-2xl" />
                        </div>
                        <p className='text-sm font-semibold text-blue-600 tracking-wide uppercase'>Connect Globally</p>
                        <h1 className='text-3xl font-bold text-slate-800'>Welcome back</h1>
                        <p className='text-slate-500 text-sm text-center max-w-sm'>
                            Choose how you'd like to continue and we'll take you to the right place
                        </p>
                    </div>

                    {/* Role cards */}
                    <div className='flex flex-col gap-4 px-6 sm:px-10 py-8'>
                        {roles.map((role) => (
                            <button
                                key={role.label}
                                onClick={() => navigate(role.path)}
                                className={`flex items-center gap-4 w-full text-left border-2 border-slate-100 rounded-2xl px-5 py-4 transition-all duration-200 ${role.ring} hover:shadow-lg`}
                            >
                                <div className={`w-12 h-12 rounded-xl ${role.bg} flex items-center justify-center flex-shrink-0`}>
                                    <FontAwesomeIcon icon={role.icon} className={`${role.color} text-xl`} />
                                </div>
                                <div className='flex-1'>
                                    <h3 className='text-slate-800 font-semibold text-lg'>{role.label}</h3>
                                    <p className='text-slate-500 text-sm'>{role.desc}</p>
                                </div>
                                <FontAwesomeIcon icon={faArrowRight} className='text-slate-300 group-hover:text-slate-500' />
                            </button>
                        ))}
                    </div>

                    {/* Footer note inside card */}
                    <div className='px-6 sm:px-10 pb-8 flex items-center justify-center gap-2 text-sm text-slate-500'>
                        <FontAwesomeIcon icon={faUserPlus} className='text-slate-400' />
                        Already have an account?
                        <Link to={"/userlogin"} className='text-blue-600 font-semibold hover:underline'>
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>

            {/* Page footer */}
            <footer className='bg-slate-900 text-slate-300'>
                <div className='max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-8'>
                    <div className='flex flex-col items-center md:items-start gap-2'>
                        <div className='flex items-center gap-2'>
                            <div className='w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center'>
                                <FontAwesomeIcon icon={faGlobe} className="text-white text-sm" />
                            </div>
                            <span className='text-white font-semibold text-lg'>Connect Globally</span>
                        </div>
                        <p className='text-sm text-slate-400 max-w-xs text-center md:text-left'>
                            Linking buyers, exporters, and shippers on one trusted trade platform.
                        </p>
                    </div>

                    <div className='flex flex-col sm:flex-row gap-8 text-sm'>
                        <div className='flex flex-col gap-2 items-center sm:items-start'>
                            <p className='text-white font-semibold mb-1'>Get started</p>
                            <Link to="/usersignup" className='hover:text-white transition-colors'>Become a Buyer</Link>
                            <Link to="/hostsignup" className='hover:text-white transition-colors'>Become an Exporter</Link>
                            <Link to="/shippersignup" className='hover:text-white transition-colors'>Become a Shipper</Link>
                        </div>
                        <div className='flex flex-col gap-2 items-center sm:items-start'>
                            <p className='text-white font-semibold mb-1'>Support</p>
                            <a href="#" className='hover:text-white transition-colors'>Help Center</a>
                            <a href="#" className='hover:text-white transition-colors'>Contact Us</a>
                            <a href="#" className='hover:text-white transition-colors'>Terms &amp; Privacy</a>
                        </div>
                    </div>
                </div>
                <div className='border-t border-slate-800 py-4 text-center text-xs text-slate-500'>
                    © {new Date().getFullYear()} Connect Globally. All rights reserved.
                </div>
            </footer>
        </div>
    )
}

export default Login
