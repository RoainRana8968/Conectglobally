import React, { useState } from 'react'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from 'react-router-dom';
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    return (
        <div className="w-full fixed top-0  border-2 border-blue-600 bg-white py-3 flex items-center justify-between px-4">
  {/* md:flex meaning on medium and larger screens, the navbar will be displayed as a flex
   container, while on smaller screens,it will be hidden. The "meani"
    part seems to be a typo or incomplete word and should be removed or corrected for clarity. */}
            <div className=' hidden md:flex  items-center'>
                <div className='flex justify-center items-center pb-3  px-2 hover:shadow-2xl mr-4 rounded-lg'>
                    <div className='text-4xl py-2 px-1 border-black border-2 mr-2 rounded-full bg-blue-400'><FontAwesomeIcon icon={faGlobe} className="text-black" /></div>   <h1 className='text-3xl font-bold text-'>connectGlobally</h1>
                </div>
                <div className='mr-10'>
                    <Link to={"/login"} className='font-semibold text-gray-600'>Home</Link>
                </div>
                <div className='mr-10'>
                    <Link to={"/products"} className='font-semibold text-gray-600'>Products</Link>
                </div>
                <div className='mr-10'>
                    <Link to={"/about"} className='font-semibold text-gray-600'>About</Link>
                </div>
            </div>


            <button
                className="md:hidden text-2xl"
                onClick={() => setIsOpen(!isOpen)}
            >
                ☰
            </button>
            {isOpen && (
                <div className="md:hidden flex flex-col gap-4 mt-4 ">
                    <Link to={"/login"} className='font-semibold text-gray-600'>Home</Link>
                    <Link to={"/products"} className='font-semibold text-gray-600'>Products</Link>
                    <Link to={"/about"} className='font-semibold text-gray-600'>About</Link>
                </div>
            )}



        </div>
    )
}

export default Navbar