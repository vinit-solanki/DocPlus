import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';

function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getToken } = useAuth();

  const fetchAppointments = async () => {
    try {
      const token = await getToken();
      console.log('JWT Token:', token);
      if (!token) {
        setError('Authentication token is missing. Please sign in again.');
        return;
      }
      const response = await axios.get('http://localhost:3000/api/appointments/my-appointments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch appointments.';
      setError(errorMessage);
      console.error('Error fetching appointments:', err.response?.data, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (appointmentId) => {
    try {
      const token = await getToken();
      console.log('JWT Token for cancel:', token);
      if (!token) {
        setError('Authentication token is missing. Please sign in again.');
        return;
      }
      await axios.put(`http://localhost:3000/api/appointments/cancel/${appointmentId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments((prev) =>
        prev.map((appt) =>
          appt._id === appointmentId ? { ...appt, status: 'cancelled' } : appt
        )
      );
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to cancel appointment.';
      setError(errorMessage);
      console.error('Error cancelling appointment:', err.response?.data, err);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayNow = async (appointmentId, fees, doctorName, date, time) => {
    try {
      const token = await getToken();
      if (!token) {
        setError('Authentication token is missing. Please sign in again.');
        return;
      }

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError('Failed to load Razorpay SDK.');
        return;
      }

      // Create Razorpay order
      const response = await axios.post(
        'http://localhost:3000/api/appointments/create-order',
        { appointmentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { orderId, amount, currency, key } = response.data;

      // Initialize Razorpay checkout
      const options = {
        key,
        amount,
        currency,
        name: `Appointment with ${doctorName}`,
        description: `Date: ${new Date(date).toLocaleDateString()}, Time: ${time}`,
        order_id: orderId,
        handler: async function (response) {
          try {
            // Update appointment status on frontend
            setAppointments((prev) =>
              prev.map((appt) =>
                appt._id === appointmentId ? { ...appt, status: 'paid', paymentId: response.razorpay_payment_id } : appt
              )
            );
            alert('Payment successful!');
          } catch (err) {
            setError('Failed to update appointment after payment.');
            console.error('Error after payment:', err);
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        notes: {
          appointmentId,
        },
        theme: {
          color: '#16a34a',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setError(`Payment failed: ${response.error.description}`);
      });
      rzp.open();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to initiate payment.';
      setError(errorMessage);
      console.error('Error initiating payment:', err.response?.data, err);
    }
  };

  return (
    <div className="w-full flex flex-col items-center py-10 px-4 text-gray-800 bg-gray-50">
      <h1 className="text-3xl font-bold mb-8">My Appointments</h1>
      {loading ? (
        <p className="text-lg text-gray-600">Loading...</p>
      ) : error ? (
        <p className="text-lg text-red-600">{error}</p>
      ) : appointments.length === 0 ? (
        <p className="text-lg text-gray-600">No appointments found.</p>
      ) : (
        <div className="w-full max-w-4xl space-y-6">
          {appointments.map((appt) => (
            <div key={appt._id} className="bg-white shadow-md rounded-lg p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-semibold">{appt.doctorId.name}</h2>
                  <p className="text-gray-600">{appt.doctorId.speciality}</p>
                  <p className="text-gray-600">
                    Date: {new Date(appt.date).toLocaleDateString()}
                  </p>
                  <p className="text-gray-600">Time: {appt.time}</p>
                  <p className="text-gray-600">Reason: {appt.reason || 'Not specified'}</p>
                  <p className="text-gray-600">Fees: ₹{appt.fees}</p>
                  <p className="text-gray-600 capitalize">Status: {appt.status}</p>
                </div>
                <div className="flex flex-col gap-2">
                  {appt.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleCancel(appt._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Cancel Appointment
                      </button>
                      <button
                        onClick={() =>
                          handlePayNow(
                            appt._id,
                            appt.fees,
                            appt.doctorId.name,
                            appt.date,
                            appt.time
                          )
                        }
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