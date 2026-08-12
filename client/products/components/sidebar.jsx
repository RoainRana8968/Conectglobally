import React from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";
import { faHome } from "@fortawesome/free-solid-svg-icons";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { faBoxesStacked } from "@fortawesome/free-solid-svg-icons";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { faCartShopping } from "@fortawesome/free-solid-svg-icons";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { Link,useNavigate } from "react-router-dom"
const Sidebar = () => {
    let navigate=useNavigate();
    function handleLogout(){
        let token=localStorage.getItem("userToken");
        if(token){
            localStorage.removeItem("userToken");
            navigate("/userlogin")
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
              <span>R</span>
            </div>
            <div className="flex flex-col ml-3">
              <span>rr5375286@gmail.com</span>
              <span>Rohitrana</span>

            </div>
          </div>


          <div className="flex-1  mt-5 font-semibold">
            <ul>
              <li className="px-4 py-2 hover:bg-blue-400 hover:text-white rounded-xl py-4 w-full"><FontAwesomeIcon icon={faHome} className="text-black mr-3" /><Link to="/userdashboard">Dashboard</Link></li>
              <li className="px-4 py-2 hover:bg-blue-400 hover:text-white rounded-xl py-4 w-full"><FontAwesomeIcon icon={faShoppingCart} className="text-black mr-3" /><Link to="/myorders">My orders</Link></li>
              <li className="px-4 py-2 hover:bg-blue-400  hover:text-white  rounded-xl py-4 w-full"><FontAwesomeIcon icon={faBoxesStacked} className="text-black mr-3" /><Link to="/newproductsforuser">products</Link></li>
              <li className="px-4 py-2 hover:bg-blue-400 hover:text-white rounded-xl py-4 w-full"><FontAwesomeIcon icon={faShoppingCart} className="text-black mr-3" /><Link to="/userorderhistory">Orders History</Link></li>

              <li className="px-4 py-2 hover:bg-blue-400 hover:text-white rounded-xl py-4 w-full"><FontAwesomeIcon icon={faCog} className="text-black mr-3" /><Link to="/usersettings">Settings</Link></li>



              <li className="px-4 py-2 hover:bg-red-100   rounded-xl py-4 w-full text-red-600" onClick={ handleLogout

              }><FontAwesomeIcon icon={faSignOutAlt} className="text-red-600" />Logout</li>

            </ul>
          </div>
        </div>
  )
}

export default Sidebar