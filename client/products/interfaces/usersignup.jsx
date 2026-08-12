import { React, useState } from 'react'
import axios from 'axios';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { faBuilding } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from 'react-router-dom';
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import Navbar from '../components/navbar';


const Usersignup = () => {
  let [name, setname] = useState("");
  let [email, setemail] = useState("");
  let [password, setpassword] = useState("");
  let [phone, setphone] = useState("");
  let [alternateNumber, setalternateNumber] = useState("");
  let [state, setstate] = useState("");
  let [street, setstreet] = useState("");
  let [city, setcity] = useState("");
  let [pincode, setpincode] = useState("");

  const navigate = useNavigate();
  async function userSign(e) {
    e.preventDefault();
    let userinfo = {
      name: name,
      email: email,
      password: password,
      phoneno: phone,
      alternatenumber: alternateNumber,
      address: {
        pincode: pincode,
        street: street,
        city: city,
        state: state,
      }

    }
    try {
      let response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/users/signup`, userinfo);
      if (response.data.success) {
        localStorage.setItem("userToken", response.data.token);
        // localStorage.setItem("userToken", response.data.token);
        alert(response.data.message || "Signup successful");
        navigate("/userdashboard", { replace: true });
      }
      
    }
    catch (err) {
      console.log(err);
    console.log(err.response);
    console.log(err.response?.data);

    if (err.response?.data?.errors) {
        alert(err.response.data.errors[0].msg);
    } else {
        alert(err.response?.data?.message || "Signup failed");
    }

}



  }
  return (
    <>
      <Navbar></Navbar>
      <div className="min-h-screen w-full flex justify-center items-center bg-gray-100 pt-30">
        <div className="w-[90%] max-w-7xl bg-white rounded-xl shadow-xl border border-gray-300 p-6">

          {/* Header */}
          <div className="flex justify-center items-center border-b pb-4">
            <div className="text-3xl p-3 rounded-full border-2 border-black bg-blue-400 mr-3">
              <FontAwesomeIcon icon={faGlobe} />
            </div>

            <h1 className="text-3xl font-bold">
              Connect Globally
            </h1>
          </div>

          {/* Buyer */}
          <div className="flex flex-col items-center py-4">
            <FontAwesomeIcon
              icon={faUser}
              className="text-5xl"
            />

            <h2 className="text-xl font-semibold mt-2">
              Buyer Registration
            </h2>
          </div>

          {/* Personal Details */}
          <h2 className="text-lg font-semibold mb-3">
            Personal Details
          </h2>

          <div className="grid grid-cols-3 gap-4">

            <div>
              <h3>Your Number</h3>
              <input
                type="text"
                placeholder="Enter Number"
                className="w-full border border-gray-300 rounded-md p-2"
                value={phone} onChange={(e) => {
                  setphone(e.target.value);
                }
                }
              />
            </div>

            <div>
              <h3>Email</h3>
              <input
                type="email"
                placeholder="example@gmail.com"
                className="w-full border border-gray-300 rounded-md p-2"
                value={email} onChange={(e) => {
                  setemail(e.target.value);
                }}
              />
            </div>

            <div>
              <h3>Password</h3>
              <input
                type="password"
                placeholder="Password"
                className="w-full border border-gray-300 rounded-md p-2"
                value={password} onChange={(e) => {
                  setpassword(e.target.value);
                }}
              />
            </div>

            <div>
              <h3>Name</h3>
              <input
                type="text"
                placeholder="Your Name"
                className="w-full border border-gray-300 rounded-md p-2" value={name} onChange={
                  (e) => {
                    setname(e.target.value);
                  }
                }
              />
            </div>

            <div>
              <h3>Alternate Number</h3>
              <input
                type="text"
                placeholder="Alternate Number"
                className="w-full border border-gray-300 rounded-md p-2"
                value={alternateNumber} onChange={(e) => {
                  setalternateNumber(e.target.value);
                }}
              />
            </div>

            <div>
              <h3>State</h3>

              <select className="w-full border border-gray-300 rounded-md p-2" value={state} onChange={(e) => {
                setstate(e.target.value);
              }}>

                <option>Select State</option>
                <option>Punjab</option>
                <option>Haryana</option>
                <option>Delhi</option>
                <option>Rajasthan</option>
                <option>Uttar Pradesh</option>

              </select>

            </div>

          </div>

          {/* Address */}

          <h2 className="text-lg font-semibold mt-6 mb-3">
            Address
          </h2>

          <div className="grid grid-cols-3 gap-4">

            <div>
              <h3>Street</h3>
              <input
                type="text"
                placeholder="Street"
                className="w-full border border-gray-300 rounded-md p-2"
                value={street} onChange={(e) => {
                  setstreet(e.target.value);
                }}
              />
            </div>

            <div>
              <h3>City</h3>
              <input
                type="text"
                placeholder="City"
                className="w-full border border-gray-300 rounded-md p-2"
                value={city} onChange={(e) => {
                  setcity(e.target.value);
                }}
              />
            </div>

            <div>
              <h3>Pincode</h3>
              <input
                type="text"
                placeholder="Pincode"
                className="w-full border border-gray-300 rounded-md p-2"
                value={pincode} onChange={(e) => {
                  setpincode(e.target.value);
                }}
              />
            </div>

          </div>

          {/* Register Button */}

          <div className="flex justify-center mt-8">

            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-3 rounded-lg font-semibold transition"
              onClick={userSign}
            >
              Register
            </button>

          </div>
          <div className='w-full font-semibold flex justify-center'>
            <div className='gap-3'>
              <span className='mr-3'>Already have an account?</span><Link to={"/userlogin"} className='text-blue-600'>Login here</Link>
            </div>
          </div>

        </div>

      </div></>
  )

}
export default Usersignup;