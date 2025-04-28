import { AppContext } from '@/context/AppContext';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function Doctors() {
  const { speciality: routeSpeciality } = useParams();
  const { doctors, loading, error } = useContext(AppContext);
  const [filterDoctors, setFilterDoctors] = useState([]);
  const [speciality, setSpeciality] = useState(routeSpeciality || 'All');
  const navigate = useNavigate();

  const applyFilter = () => {
    if (speciality && speciality !== 'All') {
      setFilterDoctors(
        doctors.filter((doctor) =>
          doctor.speciality.trim().toLowerCase() === speciality.trim().toLowerCase()
        )
      );
    } else {
      setFilterDoctors(doctors);
    }
  };

  useEffect(() => {
    applyFilter();
  }, [doctors, speciality]);

  const handleSpecialityClick = (selectedSpeciality) => {
    const newSpeciality = speciality === selectedSpeciality ? 'All' : selectedSpeciality;
    setSpeciality(newSpeciality);
    navigate(newSpeciality === 'All' ? '/doctors' : `/doctors/${encodeURIComponent(newSpeciality)}`);
  };

  if (loading) {
    return <p className="text-lg text-gray-600 text-center py-10">Loading doctors...</p>;
  }

  if (error) {
    return <p className="text-lg text-red-600 text-center py-10">{error}</p>;
  }

  return (
    <div className="w-full flex flex-col justify-center items-center gap-3 py-7 px-4 text-gray-800">
      <p className="text-gray-600 text-lg font-medium">Browse through the doctors' specialties.</p>
      <div className="flex flex-col gap-6 mt-5 w-full max-w-5xl">
        {/* Filter List */}
        <div className="flex flex-wrap gap-2 justify-center text-sm text-gray-600">
          {['All', 'General Physician', 'Gynecologist', 'Dermatologist', 'Pediatricians', 'Neurologist', 'Gastroenterologist', 'Cardiologist'].map((specialty, index) => (
            <p
              key={index}
              onClick={() => handleSpecialityClick(specialty)}
              className={`px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-all ${
                speciality === specialty ? 'bg-gray-200 font-semibold' : ''
              }`}
            >
              {specialty}
            </p>
          ))}
        </div>

        {/* Doctors List */}
        {filterDoctors.length === 0 ? (
          <p className="text-gray-600 text-center py-10">No doctors found for this speciality.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filterDoctors.map((doctor) => (
              <div
                onClick={() => navigate(`/appointment/${doctor._id}`)}
                key={doctor._id}
                className="p-4 border border-gray-300 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex flex-col items-center gap-3"
              >
                <img
                  className="w-24 h-24 rounded-full object-cover bg-blue-50"
                  src={doctor.image}
                  alt={doctor.name}
                />
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-sm text-green-500 mb-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <p>Available</p>
                  </div>
                  <p className="text-gray-900 text-lg font-semibold">{doctor.name}</p>
                  <p className="text-gray-600 text-sm">{doctor.speciality}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Doctors;