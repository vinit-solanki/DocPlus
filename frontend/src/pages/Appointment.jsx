import { assets } from '@/assets/assets_frontend/assets';
import RelatedDoctors from '@/components/RelatedDoctors';
import { AppContext } from '@/context/AppContext';
import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Appointment = () => {
  const { docId } = useParams();
  const { currencySymbol } = useContext(AppContext);
  const [docInfo, setDocInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState({ dayIndex: null, time: null });
  const [patientForm, setPatientForm] = useState({
    name: '',
    email: '',
    phone: '',
    reason: '',
  });
  const navigate = useNavigate();

  const fetchDocInfo = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/doctors/${docId}`);
      const doctor = response.data;
      setDocInfo(doctor);
      const slots = doctor.availableSlots.reduce((acc, slot) => {
        const date = new Date(slot.date).toISOString().split('T')[0];
        const day = new Date(slot.date).toLocaleString('en-US', { weekday: 'long' });
        let daySlot = acc.find(s => s.date === date);
        if (!daySlot) {
          daySlot = { date, day, slots: [] };
          acc.push(daySlot);
        }
        daySlot.slots.push({ time: slot.time, isAvailable: slot.isAvailable });
        return acc;
      }, []);
      setDocSlots(slots);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load doctor information. Please check if the backend server is running.';
      setError(errorMessage);
      console.error('Error fetching doctor:', err.response?.data, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocInfo();
  }, [docId]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Fetch user data from your backend instead of Clerk
      const fetchUserData = async () => {
        try {
          const response = await axios.get('http://localhost:3000/api/patients', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const userData = response.data;
          setPatientForm(prev => ({
            ...prev,
            name: userData.name || '',
            email: userData.email || '',
          }));
        } catch (err) {
          console.error('Error fetching user data:', err);
        }
      };
      fetchUserData();
    }
  }, []);

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please sign in to book an appointment.');
      return;
    }

    if (!selectedSlot.time || selectedSlot.dayIndex === null) {
      setError('Please select a time slot.');
      return;
    }

    try {
      const patientResponse = await axios.put('http://localhost:3000/api/patients', {
        name: patientForm.name,
        email: patientForm.email,
        phone: patientForm.phone,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Patient saved:', patientResponse.data);

      const appointmentResponse = await axios.post('http://localhost:3000/api/appointments', {
        doctorId: docId,
        date: docSlots[selectedSlot.dayIndex].date,
        time: selectedSlot.time,
        reason: patientForm.reason,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Appointment booked:', appointmentResponse.data);
      navigate('/my-appointments');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to book appointment.';
      setError(errorMessage);
      console.error('Error booking appointment:', err.response?.data, err);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setPatientForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="w-full flex flex-col items-center py-10 px-4 text-gray-800 bg-gray-50">
      {loading ? (
        <p className="text-lg text-gray-600">Loading...</p>
      ) : error ? (
        <p className="text-lg text-red-600">{error}</p>
      ) : docInfo ? (
        <div className="w-full max-w-8xl bg-white shadow-xl rounded-lg p-8 sm:p-12">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
            <div className="flex-shrink-0">
              <img
                className="w-40 h-40 sm:w-48 sm:h-48 rounded-xl object-cover bg-gray-200 shadow-md"
                src={docInfo.image}
                alt={docInfo.name}
              />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{docInfo.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <img src={assets.verified_icon} alt="Verified" className="w-5 h-5" />
                <p className="text-sm text-gray-500">Verified Doctor</p>
              </div>
              <p className="text-gray-700 mt-4 text-lg">
                <span className="font-medium">{docInfo.degree}</span> - {docInfo.speciality}
              </p>
              <p className="text-gray-500 mt-2 text-sm">Experience: {docInfo.experience}</p>
              <div className="mt-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  About <img src={assets.info_icon} alt="Info" className="w-5 h-5" />
                </h2>
                <p className="text-gray-600 mt-2 leading-relaxed">{docInfo.about}</p>
              </div>
              <p>Appointment Fees: <span>{currencySymbol}{docInfo.fees}</span></p>
            </div>
          </div>
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Book Appointment</h2>
            {error && <p className="text-red-600 mb-4">{error}</p>}
            <form onSubmit={handleBookAppointment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={patientForm.name}
                  onChange={handleFormChange}
                  className="mt-1 block w-full border rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={patientForm.email}
                  onChange={handleFormChange}
                  className="mt-1 block w-full border rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={patientForm.phone}
                  onChange={handleFormChange}
                  className="mt-1 block w-full border rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Reason for Visit</label>
                <textarea
                  name="reason"
                  value={patientForm.reason}
                  onChange={handleFormChange}
                  className="mt-1 block w-full border rounded-md px-3 py-2"
                  rows="4"
                />
              </div>
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Available Slots</h2>
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {docSlots.map((day, dayIndex) => (
                    <div
                      key={dayIndex}
                      className={`flex-shrink-0 w-64 bg-white rounded-lg shadow-md p-4 border-2 ${
                        selectedSlot.dayIndex === dayIndex ? 'border-green-600' : 'border-gray-200'
                      }`}
                    >
                      <div className="text-sm font-semibold text-gray-600 mb-3">
                        <p>{day.day}</p>
                        <p>{new Date(day.date).toLocaleDateString()}</p>
                        <hr className="mt-2" />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {day.slots.map((slot, slotIndex) => (
                          <button
                            key={slotIndex}
                            type="button"
                            onClick={() => {
                              if (slot.isAvailable) {
                                setSelectedSlot({ dayIndex, time: slot.time });
                              }
                            }}
                            className={`text-xs p-2 rounded-md transition-colors ${
                              slot.isAvailable
                                ? selectedSlot.dayIndex === dayIndex && selectedSlot.time === slot.time
                                  ? 'bg-green-600 text-white'
                                  : 'bg-gray-100 hover:bg-gray-200'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                            disabled={!slot.isAvailable}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                className={`px-8 py-3 rounded-lg shadow-md transition-all ${
                  selectedSlot.time && selectedSlot.dayIndex !== null
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!selectedSlot.time || selectedSlot.dayIndex === null}
              >
                {selectedSlot.time ? `Book for ${selectedSlot.time}` : 'Select a Time Slot'}
              </button>
            </form>
          </div>
          <RelatedDoctors docId={docId} speciality={docInfo?.speciality} />
        </div>
      ) : (
        <p className="text-lg text-gray-600">Doctor not found</p>
      )}
    </div>
  );
}

export default Appointment;