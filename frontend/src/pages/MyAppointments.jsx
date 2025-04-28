import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';

function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    appointmentId: null,
    cardNumber: '',
    expiry: '',
    cvv: '',
  });
  const [paymentError, setPaymentError] = useState(null);
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

  const handlePaymentFormChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentSubmit = async (e, appointmentId) => {
    e.preventDefault();
    setPaymentError(null);
    try {
      console.log('Processing payment for appointment:', appointmentId, 'with data:', paymentForm);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Mock delay
      alert('Payment processed successfully!');
      setPaymentForm({ appointmentId: null, cardNumber: '', expiry: '', cvv: '' });
    } catch (err) {
      setPaymentError('Failed to process payment. Please try again.');
      console.error('Error processing payment:', err);
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
                  <p className="text-gray-600">Fees: ${appt.fees}</p>
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
                        onClick={() => setPaymentForm({ ...paymentForm, appointmentId: appt._id })}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Pay Now
                      </button>
                    </>
                  )}
                </div>
              </div>
              {paymentForm.appointmentId === appt._id && (
                <form onSubmit={(e) => handlePaymentSubmit(e, appt._id)} className="mt-4 space-y-4">
                  <h3 className="text-lg font-semibold">Payment Details</h3>
                  {paymentError && <p className="text-red-600">{paymentError}</p>}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Card Number</label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={paymentForm.cardNumber}
                      onChange={handlePaymentFormChange}
                      className="mt-1 block w-full border rounded-md px-3 py-2"
                      placeholder="1234 5678 9012 3456"
                      required
                    />
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Expiry</label>
                      <input
                        type="text"
                        name="expiry"
                        value={paymentForm.expiry}
                        onChange={handlePaymentFormChange}
                        className="mt-1 block w-full border rounded-md px-3 py-2"
                        placeholder="MM/YY"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">CVV</label>
                      <input
                        type="text"
                        name="cvv"
                        value={paymentForm.cvv}
                        onChange={handlePaymentFormChange}
                        className="mt-1 block w-full border rounded-md px-3 py-2"
                        placeholder="123"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Submit Payment
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyAppointments;