import { AppContext } from '@/context/AppContext';
import React from 'react'
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { useEffect } from 'react';
const RelatedDoctors = ({docId, speciality}) => {
    const navigate = useNavigate();
    const {doctors} = useContext(AppContext);
    const [relatedDoctors, setRelatedDoctors] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    useEffect(()=>{
        if(doctors.length>0 && speciality){
            const doctorData = doctors.find((doc) => doc._id === docId);
            const relatedDocs = doctors.filter((doc) => doc.speciality === doctorData.speciality && doc._id !== docId);
            setRelatedDoctors(relatedDocs);
            setLoading(false);
        }
    }, [doctors, speciality, docId])
  return (
    <div>
        {loading ? <p className='text-gray-600 text-lg font-medium'>Loading...</p>
        :
        <div className='w-full flex flex-col items-center gap-4 py-16 px-4 text-gray-800'>
        <h1 className='text-3xl font-md'>Related Doctors</h1>
        <div className='flex justify-center items-center gap-4 w-full'>
        {relatedDoctors.slice(0,5).map((doctor, index)=>{
            return (
            <div onClick={()=>navigate(`/appointment/${doctor._id}`)} key={index} className="p-3 border border-green-600 rounded-xl overflow-hidden flex flex-col items-center gap-4 cursor-pointer hover:translate-y-[-10px] transition smooth duration-500">
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
    </div> 
        }
    </div>
  )
}

export default RelatedDoctors