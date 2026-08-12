import { React, useState } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { faBuilding } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from 'react-router-dom';
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import Navbar from '../components/navbar';
import axios from "axios"

const Hostlogin = () => {
        const [name, setname] = useState("");
        const [email, setemail] = useState("");
        const [password, setpassword] = useState("");
        const [phone, setphone] = useState("");
        const navigate = useNavigate();
           async function handlelogin() {
        let logininfo = {
            email: email,
            password: password,
        }
        try {
            let response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/hosts/login`, logininfo);
            if (response.data.success || response.data.token) {
                localStorage.setItem("hosttoken", response.data.token);
                navigate("/hostdashboard");
            } else {
                alert("Login failed");
            }
        }
        catch (err) {
            console.log(err);
        alert(err.response?.data?.message || "Login failed");
        }


    }
   return (
        <>  <Navbar></Navbar>

            <div className="min-h-screen bg-gray-100 pt-20 flex justify-center items-center">

                <div className="w-[90%] max-w-6xl bg-white rounded-xl shadow-lg p-6">

                    {/* Header */}

                    <div className="flex justify-center items-center border-b pb-3">

                        <div className="text-3xl p-2 rounded-full border-2 border-black bg-blue-400 mr-3">
                            <FontAwesomeIcon icon={faGlobe} />
                        </div>

                        <h1 className="text-3xl font-bold">
                            Connect Globally
                        </h1>

                    </div>

                    {/* Buyer */}

                    <div className="flex flex-col items-center py-3">

                         <FontAwesomeIcon icon={faBuilding} className="text-black text-3xl" />

                        <h2 className="text-xl font-semibold mt-2">
                            Exporter Login
                        </h2>

                    </div>

                    {/* Personal */}

                    <h2 className="font-bold text-lg mb-3">
                        Personal Details
                    </h2>

                    <div className="grid grid-cols-2 gap-4 mb-3">

                        <input placeholder="Name" className="border rounded-lg p-2" value={name} onChange={(e) => setname(e.target.value)} required/>

                        <input placeholder="Email" className="border rounded-lg p-2" value={email} onChange={(e) => setemail(e.target.value)} required />

                        <input placeholder="Phone" className="border rounded-lg p-2" value={phone} onChange={(e) => setphone(e.target.value)} required/>
                        <input placeholder="Password" className="border rounded-lg p-2" value={password} onChange={(e) => {
                            setpassword(e.target.value);
                        }} required />

                    </div>



                    <div className='w-full justify-center flex'>
                        <button className='py-2 px-3 bg-blue-600 rounded-xl text-white font-semibold' onClick={handlelogin}>Login</button>
                    </div>
                    <div className="flex w-full justify-center mt-3">Donot have an account?<Link className='text-blue-500 ml-2' to={"/hostsignup"}>Signup</Link></div>


                </div>
                

            </div>


        </>)
}

export default Hostlogin