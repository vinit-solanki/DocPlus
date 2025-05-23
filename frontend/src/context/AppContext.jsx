import { createContext, useState, useEffect } from "react";
import axios from 'axios';

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currencySymbol = '₹';

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get(`https://docplus-backend-ruby.vercel.app/api/doctors`);
        setDoctors(response.data);
      } catch (err) {
        setError('Failed to load doctors. Please try again later.');
        console.error('Error fetching doctors:', err);
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
    currencySymbol
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;