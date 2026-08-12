import React, { useEffect, useState } from 'react'
import Hostsidebar from '../components/hostsidebar'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  faImage,
  faTag,
  faIndianRupeeSign,
  faPenToSquare,
  faTrash,
  faBoxesStacked,
  faAward
} from "@fortawesome/free-solid-svg-icons";

import axios from "axios";
const Viewproducts = () => {

  let [products, setproducts] = useState([]);
  const [search, setSearch] = useState('');
  const location = useLocation();
  const[host,sethost]=useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchproducts();
  }, []);// whenever we mount from different page to viewprodyct.jsx file. and useEffect is defined there with empty array. it will
  //always run.


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


  async function fetchproducts() {
    let token = localStorage.getItem("hosttoken");

    if (!token) {
      console.error("No token found in localStorage");
      return;
    }

    try {
      let response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/products/fetchproducts`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setproducts(response.data.products);
      }
    }
    catch (err) {
      console.error("Fetch error:", err.message);
      if (err.response) {
        console.error("Response error:", err.response.status, err.response.data);
      }
    }
  }
  async function deleteproduct(id) {// all of these functions are making requests to do some task in backend 
    let token = localStorage.getItem("hosttoken");
    try {
      let response = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/products/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data.success) {
        fetchproducts();
      }
    }
    catch (err) {
      console.error("Fetch error:", err.message);
      if (err.response) {
        console.error("Response error:", err.response.status, err.response.data);
      }
    }
  }

  // Case-insensitive match against title, category, and certification,
  // so typing any of those finds the right product.
  const visibleProducts = products.filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const haystack = [p.title, p.category, p.certified]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });

  return (
    <div className="h-screen w-screen flex">
    <Hostsidebar email={host.email} name={host.name} />

      <div className="flex-1 bg-gray-100">
        {/* Top Navbar */}
        <div className="sticky top-0 bg-white shadow-md px-6 py-3 z-10">
          <div className="flex items-center justify-between gap-4">
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full py-3 pl-12 pr-4 rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />

              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              />
            </div>

            {/* Button */}
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl whitespace-nowrap transition" onClick={() => {
              navigate("/newproduct")
            }}>
              Add New Product
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleProducts.length > 0 ? (
            visibleProducts.map((currpro) => (
              <div
                className="bg-white rounded-xl shadow-md p-4"
                key={currpro._id || currpro.id}
              >
                <img
                  src={currpro.image}
                  alt={currpro.title}
                  className="h-40 w-full object-cover rounded-lg mb-4"
                />

                <p className="flex items-center gap-2 text-lg font-semibold mb-2">
                  <FontAwesomeIcon icon={faTag} className="text-gray-600" />
                  {currpro.title}

                </p>

                <p className="flex items-center gap-2 text-gray-700 mb-4">
                  <FontAwesomeIcon icon={faIndianRupeeSign} className="text-gray-600" />
                  Price: &nbsp;{currpro.price}

                </p>
                <p className="flex items-center gap-2 text-gray-700 mb-4">
                  <FontAwesomeIcon icon={faBoxesStacked} className="text-gray-600" />
                  Available:&nbsp; {currpro.stock}ton

                </p>
                <p className="flex items-center gap-2 text-gray-700 mb-4">
                  <FontAwesomeIcon icon={faAward} className="text-gray-600" />
                  Certifications: &nbsp; {currpro.certified}

                </p>

                <div className="flex justify-between">
                  <button className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 transition" onClick={() => {
                    navigate(`/editproduct/${currpro._id}`)
                  }}>
                    <FontAwesomeIcon icon={faPenToSquare} />
                    Edit
                  </button>

                  <button className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                    onClick={() => {
                      deleteproduct(currpro._id)
                    }}>
                    <FontAwesomeIcon icon={faTrash} />
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 col-span-full">
              {search.trim() ? "No products match your search." : "No products found."}
            </p>
          )}



        </div>
      </div>

    </div>
  );
}

export default Viewproducts
