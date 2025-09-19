"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://docplus-backend-ruby.vercel.app";

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please sign in to view your appointments.");
        setAppointments([]);
        navigate("/login");
        return;
      }
      const response = await axios.get(`${API_BASE_URL}/api/appointments/my-appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Appointments API Response:", response.data);
      const data = Array.isArray(response.data) ? response.data : [];
      setAppointments(data);
    } catch (err) {
      console.error("Error fetching appointments:", err.response?.data || err);
      const errorMessage =
        err.response?.data?.message ||
        "Please Refresh the page or Please try again.";
      setError(errorMessage);
      if (err.response?.status === 404) {
        setError("Please complete your profile to view appointments.");
        navigate("/profile");
      } else if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [navigate]);

  const handleCancel = async (appointmentId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please sign in to cancel appointments.");
        navigate("/login");
        return;
      }
      await axios.put(
        `${API_BASE_URL}/api/appointments/cancel/${appointmentId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAppointments((prev) =>
        prev.map((appt) =>
          appt._id === appointmentId ? { ...appt, status: "cancelled" } : appt
        )
      );
      setSuccessMessage("Appointment cancelled successfully!");
    } catch (err) {
      console.error("Error cancelling appointment:", err.response?.data || err);
      const errorMessage =
        err.response?.data?.message || "Failed to cancel appointment.";
      setError(errorMessage);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayNow = async (appointmentId, fees, doctorName, date, time) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please sign in to make a payment.");
        navigate("/login");
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError("Failed to load payment gateway.");
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/appointments/create-order`,
        { appointmentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { orderId, amount, currency, key } = response.data;

      const options = {
        key,
        amount,
        currency,
        name: `Appointment with ${doctorName}`,
        description: `Date: ${new Date(date).toLocaleDateString()}, Time: ${time}`,
        order_id: orderId,
        handler: async (response) => {
          try {
            await axios.post(
              `${API_BASE_URL}/api/appointments/verify-payment`,
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                appointmentId: appointmentId,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            setAppointments((prev) =>
              prev.map((appt) =>
                appt._id === appointmentId
                  ? { ...appt, status: "paid", paymentId: response.razorpay_payment_id }
                  : appt
              )
            );
            setSuccessMessage("Payment successful!");
          } catch (err) {
            setError("Try refreshing the page or Please contact support.");
            console.error("Error verifying payment:", err.response?.data || err);
          }
        },
        prefill: {
          name: "",
          email: "",
          contact: "",
        },
        notes: {
          appointmentId,
        },
        theme: {
          color: "#16a34a",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        setError(`Payment failed: ${response.error.description}`);
      });
      rzp.open();
    } catch (err) {
      console.error("Error initiating payment:", err.response?.data || err);
      const errorMessage =
        err.response?.data?.message || "Failed to initiate payment.";
      setError(errorMessage);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }
    }
  };

  return (
    <div className="w-full flex flex-col items-center py-10 px-4 text-gray-800 bg-gray-50">
      <h1 className="text-3xl font-bold mb-8">My Appointments</h1>
      {loading ? (
        <p className="text-lg text-gray-600">Loading...</p>
      ) : error ? (
        <p className="text-lg text-red-600">{error}</p>
      ) : !Array.isArray(appointments) || appointments.length === 0 ? (
        <p className="text-lg text-gray-600">No appointments found.</p>
      ) : (
        <div className="w-full max-w-4xl space-y-6">
          {appointments.map((appt) => (
            <div key={appt._id} className="bg-white shadow-md rounded-lg p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-semibold">{appt.doctorId.name}</h2>
                  <p className="text-gray-600">{appt.doctorId.speciality}</p>
                  <p className="text-gray-600">Date: {new Date(appt.date).toLocaleDateString()}</p>
                  <p className="text-gray-600">Time: {appt.time}</p>
                  <p className="text-gray-600">Reason: {appt.reason || "Not specified"}</p>
                  <p className="text-gray-600">Fees: ₹{appt.fees}</p>
                  <p className="text-gray-600 capitalize">Status: {appt.status}</p>
                </div>
                <div className="flex flex-col gap-2">
                  {appt.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleCancel(appt._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Cancel Appointment
                      </button>
                      <button
                        onClick={() => handlePayNow(appt._id, appt.fees, appt.doctorId.name, appt.date, appt.time)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Pay Now
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyAppointments;