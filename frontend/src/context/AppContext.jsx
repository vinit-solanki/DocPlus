import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currencySymbol = "₹";

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get(`https://docplus-backend-ruby.vercel.app/api/doctors`);
        console.log("Doctors API Response:", response.data);
        // Ensure response.data is an array
        const data = Array.isArray(response.data) ? response.data : [];
        setDoctors(data);
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || "Failed to fetch doctors. Please check your network or server configuration.";
        setError(errorMessage);
        console.error("Error fetching doctors:", err);
        setDoctors([]); // Ensure doctors is an array on error
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const value = {
    doctors,
    loading,
    error,
    currencySymbol,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider;