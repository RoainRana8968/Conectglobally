import { React, useState } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { faBuilding } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from 'react-router-dom';
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import Navbar from '../components/navbar';
import axios from "axios";

const Hostsignup = () => {
  const navigate = useNavigate();
  let [name, setname] = useState("");
  let [email, setemail] = useState("");
  let [password, setpassword] = useState("");
  let [phone, setphone] = useState("");
  let [alternatenumber, setalternatenumber] = useState("");
  let [state, setstate] = useState("");
  let [street, setstreet] = useState("");
  let [city, setcity] = useState("");
  let [pincode, setpincode] = useState("");
  let [companyname, setcompanyname] = useState("");
  let [businessType, setbusinessType] = useState("");

  
  async function handleSubmit(event) {
    event.preventDefault();
    let hostinfo = {
      name: name,
      email: email,
      password: password,
      phoneno: phone,
      alternatenumber: alternatenumber,
      address: {
        pincode: pincode,
        street: street,
        city: city,
        state: state,
      },
      business: businessType,
      companyname: companyname,
    }
    
    try {
      let response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/hosts/signup`, hostinfo);
      console.log(response.data)
      if (response.data.success) {
        localStorage.setItem("hosttoken", response.data.token);
        navigate("/hostdashboard");
      } else {
        alert(response.data.message || "Signup failed");
      }
    }
    catch (err) {
      console.log(err.response);
      console.log(err.response?.data);
      console.log(err.response?.data?.message || "Signup failed");
    }

  }
  return (
    <>
      <Navbar />

      <div className="min-h-screen w-full flex justify-center items-center bg-gray-100 pt-30">

        <form onSubmit={handleSubmit} className="w-[90%] max-w-7xl">
          <div className="bg-white rounded-xl shadow-xl border border-gray-300 p-6">

            {/* Header */}
            <div className="flex justify-center items-center border-b pb-4">
              <div className="text-3xl p-3 rounded-full border-2 border-black bg-blue-400 mr-3">
                <FontAwesomeIcon icon={faGlobe} />
              </div>

              <h1 className="text-3xl font-bold">
                Connect Globally
              </h1>
            </div>

            {/* Exporter */}
            <div className="flex flex-col items-center py-4">
              <FontAwesomeIcon icon={faBuilding} className="text-black text-4xl" />

              <h2 className="text-xl font-semibold mt-2">
                Exporter Registration
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
                  type="number"
                  placeholder="Enter Number"
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={phone}
                  onChange={(e) => setphone(e.target.value)}
                  required
                />
              </div>

              <div>
                <h3>Email</h3>
                <input
                  type="email"
                  placeholder="example@gmail.com"
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={email}
                  onChange={(e) => setemail(e.target.value)}
                  required
                />
              </div>

              <div>
                <h3>Password</h3>
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={password}
                  onChange={(e) => setpassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <h3>Name</h3>
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={name}
                  onChange={(e) => setname(e.target.value)}
                  required
                />
              </div>

              <div>
                <h3>Alternate Number</h3>
                <input
                  type="text"
                  placeholder="Alternate Number"
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={alternatenumber}
                  onChange={(e) => setalternatenumber(e.target.value)}
                />
              </div>

              <div>
                <h3>State</h3>

                <select
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={state}
                  onChange={(e) => setstate(e.target.value)}
                  required
                >
                  <option value="">Select State</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
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
                  value={street}
                  onChange={(e) => setstreet(e.target.value)}
                  required
                />
              </div>

              <div>
                <h3>City</h3>
                <input
                  type="text"
                  placeholder="City"
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={city}
                  onChange={(e) => setcity(e.target.value)}
                  required
                />
              </div>

              <div>
                <h3>Pincode</h3>
                <input
                  type="text"
                  placeholder="Pincode"
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={pincode}
                  onChange={(e) => setpincode(e.target.value)}
                  required
                />
              </div>

            </div>

            {/* Company Details */}

            <h2 className="text-lg font-semibold mt-6 mb-3">
              Company Details
            </h2>

            <div className="grid grid-cols-3 gap-4">

              <div>
                <h3>Company Name</h3>
                <input
                  type="text"
                  placeholder="Company Name"
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={companyname}
                  onChange={(e) => setcompanyname(e.target.value)}
                  required
                />
              </div>

              <div>
                <h3>Business Type</h3>
                <select
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={businessType}
                  onChange={(e) => setbusinessType(e.target.value)}
                  required
                >
                  <option value="">Select Business Type</option>
                  <option value="Manufacturer">Manufacturer</option>
                  <option value="Exporter">Exporter</option>
                  <option value="Wholesaler">Wholesaler</option>
                  <option value="Trader">Trader</option>
                  <option value="Distributor">Distributor</option>
                </select>
              </div>

            </div>

            {/* Register Button */}

            <div className="flex justify-center mt-8">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-3 rounded-lg font-semibold transition"
              >
                Register
              </button>
            </div>

            <div className="w-full font-semibold flex justify-center mt-4">
              <div>
                <span className="mr-3">Already have an account?</span>
                <Link to="/hostlogin" className="text-blue-600">
                  Login here
                </Link>
              </div>
            </div>

          </div>
        </form>

      </div>
    </>
  )
}

export default Hostsignup