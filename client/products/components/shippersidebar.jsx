import React from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";
import { faHome } from "@fortawesome/free-solid-svg-icons";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { faTruck } from "@fortawesome/free-solid-svg-icons";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom"

const ShipperSidebar = ({email,name}) => {
    let navigate = useNavigate();
    function handleLogout() {
        let token = localStorage.getItem("shipperToken");
        if (token) {
            localStorage.removeItem("shipperToken");
            navigate("/shipperlogin")
        }
    }
    return (
        <div className="w-1/4 h-full bg-white shadow-lg p-6 flex flex-col">
            <div className='flex justify-center items-center pb-3 border-b-2 border-gray px-2'>
                <div className='text-4xl py-2 px-1 border-black border-2 mr-2 rounded-full bg-blue-400'><FontAwesomeIcon icon={faGlobe} className="text-black text-6xl" /></div>
                <h1 className="text-xl font-bold font-semibold">connect globally</h1>
            </div>

            <div className='h-[100px] w-full flex bg-blue-100 border-box p-3 px-5 items-center rounded-xl my-5'>
                <div className="h-[60px] w-[60px] rounded-full text-white bg-blue-600 flex justify-center items-center border-black border-3">
                    <span>S</span>
                </div>
                <div className="flex flex-col ml-3">
                    <span>{email}</span>
                    <span>{name}</span>
                </div>
            </div>

            <div className="flex-1 mt-5 font-semibold">
                <ul>
                    <li className="px-4 hover:bg-blue-400 hover:text-white rounded-xl py-4 w-full"><FontAwesomeIcon icon={faHome} className="text-black mr-3" /><Link to="/shipperdashboard">Dashboard</Link></li>
                    <li className="px-4 hover:bg-blue-400 hover:text-white rounded-xl py-4 w-full"><FontAwesomeIcon icon={faClock} className="text-black mr-3" /><Link to="/shipperorders">Assigned Deliveries</Link></li>
                    <li className="px-4 hover:bg-blue-400 hover:text-white rounded-xl py-4 w-full"><FontAwesomeIcon icon={faCircleCheck} className="text-black mr-3" /><Link to="/shipperhistory">Delivery History</Link></li>
                    <li className="px-4 hover:bg-blue-400 hover:text-white rounded-xl py-4 w-full"><FontAwesomeIcon icon={faCog} className="text-black mr-3" /><Link to="/shippersettings">Settings</Link></li>

                    <li className="px-4 hover:bg-red-100 rounded-xl py-4 w-full text-red-600" onClick={handleLogout}>
                        <FontAwesomeIcon icon={faSignOutAlt} className="text-red-600 mr-3" />Logout
                    </li>
                </ul>
            </div>
        </div>
    )
}

export default ShipperSidebar