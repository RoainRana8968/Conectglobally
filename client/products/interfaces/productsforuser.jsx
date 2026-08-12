import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faBuilding, faDollarSign, faEnvelope, faPhone, faTag, faBoxesStacked, faUser, faCartShopping } from "@fortawesome/free-solid-svg-icons";
import socket from "../src/socket.js";

const Productsforuser = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/products/all`);
        if (response.data.success) {
          setProducts(response.data.products);
        }
      } catch (err) {
        console.error("Failed to load products", err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);


  //recieving here hosts details by server
  useEffect(() => {
    socket.on("productAdded", (product) => {
      setProducts((prev) => [product, ...prev]);
    });
    

    socket.on("productDeleted", ({ productId }) => {
      setProducts((prev) => prev.filter((p) => p._id !== productId));
    });

    return () => {
      socket.off("productAdded");
      socket.off("productDeleted");
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl font-semibold">Loading products...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
        <h2 className="text-2xl font-semibold mb-4">No products available yet</h2>
        <button
          onClick={() => navigate("/userdashboard")}
          className="bg-blue-600 text-white px-5 py-3 rounded-lg"
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/userdashboard")}
            className="flex items-center gap-2 text-blue-600 font-semibold"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Back
          </button>
          <h1 className="text-2xl font-bold">Available Products</h1>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const host = product.host || {};
            return (
              <div key={product._id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <img
                  src={product.image || "https://www.thespruce.com/thmb/IU44qHcgeBvfNPKcSxmSzJhhZP8=/5700x3794/filters:no_upscale():max_bytes(150000):strip_icc()/dwarf-fruit-trees-4588521-07-ebfded6071cb4a0aba4291d241962133.jpg"}
                  alt={product.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4 space-y-3">
                  <p className="text-xs font-semibold uppercase text-blue-600">{product.category}</p>
                  <h2 className="text-xl font-bold">{product.title}</h2>

                  <div className="bg-gray-50 p-3 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <FontAwesomeIcon icon={faTag} />
                      <span className="font-semibold text-sm">Description</span>
                    </div>
                    <p className="text-gray-700 text-sm line-clamp-2">{product.description}</p>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1 font-semibold">
                      <FontAwesomeIcon icon={faDollarSign} /> {product.price}
                    </span>
                    <span className="flex items-center gap-1 text-gray-600">
                      <FontAwesomeIcon icon={faBoxesStacked} /> Stock: {product.stock}
                    </span>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-xl text-xs space-y-1 text-gray-700">
                    <p className="flex items-center gap-2"><FontAwesomeIcon icon={faUser} /> {host.name || "Host"}</p>
                    <p className="flex items-center gap-2"><FontAwesomeIcon icon={faBuilding} /> {host.companyname || "Company"}</p>
                    <p className="flex items-center gap-2"><FontAwesomeIcon icon={faEnvelope} /> {host.email || "N/A"}</p>
                    <p className="flex items-center gap-2"><FontAwesomeIcon icon={faPhone} /> {host.phoneno || "N/A"}</p>
                  </div>

                  <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl font-semibold flex items-center justify-center gap-2" onClick={()=>{
                    navigate(`/placeorder/${product._id}`)
                  }}>
                    <FontAwesomeIcon icon={faCartShopping} />
                    Place Order
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Productsforuser;