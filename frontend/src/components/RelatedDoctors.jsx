import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';

function RelatedDoctors({ docId, speciality }) {
  const { doctors } = useContext(AppContext);
  const [relatedDoctors, setRelatedDoctors] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (doctors.length > 0 && speciality) {
      const filteredDoctors = doctors.filter(
        (doctor) =>
          doctor._id !== docId &&
          doctor.speciality.trim().toLowerCase() === speciality.trim().toLowerCase()
      );
      setRelatedDoctors(filteredDoctors);
    }
  }, [doctors, docId, speciality]);

  return (
    <div className="w-full mt-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Related Doctors</h2>
      {relatedDoctors.length === 0 ? (
        <p className="text-gray-600">No related doctors found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {relatedDoctors.map((doctor) => (
            <div
              key={doctor._id}
              onClick={() => navigate(`/appointment/${doctor._id}`)}
              className="p-4 border border-gray-300 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex flex-col items-center gap-3"
            >
              <img
                className="w-24 h-24 rounded-full object-cover bg-blue-50"
                src={doctor.image}
                alt={doctor.name}
              />
              <div className="text-center">
                <p className="text-gray-900 text-lg font-semibold">{doctor.name}</p>
                <p className="text-gray-600 text-sm">{doctor.speciality}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RelatedDoctors;