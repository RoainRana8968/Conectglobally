import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Shipperrprotectedwrapper = ({ children }) => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        const verifyUser = async () => {
            const token = localStorage.getItem("shipperToken") //|| //localStorage.getItem("userToken");

            if (!token) {
                localStorage.removeItem("shipperToken");
                // localStorage.removeItem("userToken");
                navigate("/shipperlogin");
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/shipper/profile`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.data.success) {
                    setAuthenticated(true);
                } else {
                    throw new Error(response.data.message || "Authentication failed");
                }
            } catch (err) {
                localStorage.removeItem("shipperToken");
                // localStorage.removeItem("userToken");
                navigate("/shipperlogin");
            } finally {
                setLoading(false);
            }
        };

        verifyUser();
    }, [navigate]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <h2>Loading...</h2>
            </div>
        );
    }

    if (!authenticated) {
        return null;
    }

    return children;
};

export default Shipperrprotectedwrapper