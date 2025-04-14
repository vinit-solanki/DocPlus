import { assets } from '@/assets/assets_frontend/assets';
import RelatedDoctors from '@/components/RelatedDoctors';
import { AppContext } from '@/context/AppContext';
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function Appointment() {
  const { docId } = useParams(); // Extract docId from the URL
  const { doctors, currencySymbol } = useContext(AppContext);
  const [docInfo, setDocInfo] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState('');
  const [selectedSlot, setSelectedSlot] = useState({
    dayIndex: null,
    time: null
  });
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const fetchDocInfo = async () => {
    const docInfo = doctors.find((doc) => doc._id === docId);
    setDocInfo(docInfo);
    setLoading(false);
  };

  useEffect(() => {
    fetchDocInfo();
  }, [docId, doctors]);

  const getAvailableSlots = () => {
    setDocSlots([]); // Clear existing slots
    const today = new Date();
    const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    const slots = [];
    
    for (let i = 0; i < 7; i++) {
      // Create new date object for each day
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);
      
      // Create end time for the day
      const endTime = new Date(currentDate);
      endTime.setHours(21, 0, 0, 0); // Set end time to 9 PM
      
      // Set start time
      if (i === 0) { // Today
        const currentHour = currentDate.getHours();
        const currentMinutes = currentDate.getMinutes();
        
        // If current time is before 10 AM, start at 10 AM
        if (currentHour < 10) {
          currentDate.setHours(10, 0, 0, 0);
        } else {
          // Round up to next 30-minute slot
          currentDate.setMinutes(currentMinutes + (30 - (currentMinutes % 30)));
          // If we're past 9 PM, no slots available today
          if (currentDate >= endTime) {
            continue;
          }
        }
      } else { // Future days
        currentDate.setHours(10, 0, 0, 0); // Start at 10 AM
      }
      
      const daySlots = {
        date: currentDate.toLocaleDateString(),
        day: weekDays[currentDate.getDay()],
        slots: []
      };
      
      // Generate time slots for the day
      while (currentDate < endTime) {
        daySlots.slots.push({
          dateTime: new Date(currentDate),
          time: currentDate.toLocaleTimeString([], { 
            hour: '2-digit',
            minute: '2-digit',
            hour12: true 
          }),
          isAvailable: true
        });
        
        // Add 30 minutes
        currentDate.setMinutes(currentDate.getMinutes() + 30);
      }
      
      slots.push(daySlots);
    }
    
    setDocSlots(slots);
  };

  useEffect(() => {
    getAvailableSlots();
  }, [docInfo]);

  // Add this useEffect to log the slots for debugging
  useEffect(() => {
    console.log('Available Slots:', docSlots);
  }, [docSlots]);

  return (
    <div className="w-full flex flex-col items-center py-10 px-4 text-gray-800 bg-gray-50">
      {loading ? (
        <p className="text-lg text-gray-600">Loading...</p>
      ) : docInfo ? (
        <div className="w-full max-w-8xl bg-white shadow-xl rounded-lg p-8 sm:p-12">
          {/* Doctor Details Container */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
            {/* Doctor Image */}
            <div className="flex-shrink-0">
              <img
                className="w-40 h-40 sm:w-48 sm:h-48 rounded-xl object-cover bg-gray-200 shadow-md"
                src={docInfo.image}
                alt={docInfo.name}
              />
            </div>

            {/* Doctor Info */}
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

              {/* About Section */}
              <div className="mt-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  About <img src={assets.info_icon} alt="Info" className="w-5 h-5" />
                </h2>
                <p className="text-gray-600 mt-2 leading-relaxed">{docInfo.about}</p>
              </div>
              <p className=''>
                Appointment Fees: <span>{currencySymbol}{docInfo.fees}</span>
              </p>
            </div>
          </div>

          {/* Action Section */}
          <div className="mt-4 flex flex-col items-center gap-2">
            <button 
              onClick={() => {
                if (selectedSlot.time && selectedSlot.dayIndex !== null) {
                  // Handle booking logic here
                  console.log('Booking appointment for:', {
                    day: docSlots[selectedSlot.dayIndex].date,
                    time: selectedSlot.time
                  });
                }
              }}
              className={`px-8 py-3 rounded-lg shadow-md transition-all ${
                selectedSlot.time && selectedSlot.dayIndex !== null
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {selectedSlot.time 
                ? `Book for ${selectedSlot.time}` 
                : 'Select a Time Slot'}
            </button>
            {selectedSlot.time && (
              <p className="text-sm text-gray-600">
                Selected: {docSlots[selectedSlot.dayIndex].day} at {selectedSlot.time}
              </p>
            )}
          </div>

          {/* Booking Slots */}
          <div className='mt-8 w-full'>
            <h2 className="text-xl font-semibold mb-4">Available Slots</h2>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {docSlots.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`flex-shrink-0 w-64 bg-white rounded-lg shadow-md p-4 border-2 ${
                    selectedSlot.dayIndex === dayIndex 
                      ? 'border-green-600' 
                      : 'border-gray-200'
                  }`}
                >
                  <div className="text-sm font-semibold text-gray-600 mb-3">
                    <p>{day.day}</p>
                    <p>{day.date}</p>
                    <hr className='mt-2'/>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {day.slots.map((slot, slotIndex) => (
                      <button
                        key={slotIndex}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSlot(prev => {
                            // If clicking the same slot, deselect it
                            if (prev.dayIndex === dayIndex && prev.time === slot.time) {
                              return { dayIndex: null, time: null };
                            }
                            // Otherwise, select the new slot
                            return { dayIndex: dayIndex, time: slot.time };
                          });
                        }}
                        className={`text-xs p-2 rounded-md transition-colors ${
                          selectedSlot.dayIndex === dayIndex && selectedSlot.time === slot.time
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
              <RelatedDoctors  docId={docId} speciality={docInfo.speciality}/>
          </div>
        </div>
      ) : (
        <p className="text-lg text-gray-600">Doctor not found</p>
      )}
    </div>
  );
}

export default Appointment;