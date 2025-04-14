import React, { useContext } from 'react'
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom'

const TopDoctors = () => {
  const navigate = useNavigate();
  const {doctors} = useContext(AppContext);
  return (
    <div className='w-full flex flex-col items-center gap-4 py-16 px-4 text-gray-800'>
        <h1 className='text-3xl font-md'>Top Doctors to Book</h1>
        <p className='sm:w-1/3 text-center text-sm'>Simply browse through our extensive list of doctors.</p>
        <div className='w-5/6 grid grid-cols-2 gap-4 pt-5 gap-y-6 px-3 sm:px-0 md:grid-cols-3 lg:grid-cols-4'>
            {
                doctors.slice(0,10).map((doctor, index)=>{
                    return (
                    <div onClick={()=>{navigate(`/appointment/${doctor._id}`); scrollTo(0,0)}} key={index} className="p-3 border border-green-600 rounded-xl overflow-hidden flex flex-col items-center gap-4 cursor-pointer hover:translate-y-[-10px] transition smooth duration-500">
                        <img className='bg-blue-50' src={doctor.image} alt="" />
                        <div className='p-4'> 
                        <div className='flex items-center gap-2 text-sm text-center text-green-500'>
                            <p className='w-2 h-2 bg-green-500 rounded-full'></p> <p>Available</p> 
                        </div>
                        </div>
                        <p className='text-gray-900 text-lg font-md'>{doctor.name}</p>
                        <p className='text-gray-600 text-sm'>{doctor.speciality}</p>
                    </div>)
            }
            )}
        </div>
        <button className='bg-blue-50 px-12 py-3 text-gray-600 rounded-full mt-10' onClick={()=> {navigate(`/doctors`); scrollTo(0, 0);}}>More</button>
    </div>
  )
}

export default TopDoctors