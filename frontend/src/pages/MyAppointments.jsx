import { AppContext } from '@/context/AppContext'
import React, { useContext } from 'react'

function MyAppointments() {
  const {doctors} = useContext(AppContext);
  return (
    <div className='w-screen min-h-screen flex flex-col justify-center items-center gap-2'>
      <p className='pb-3 mt-12 font-medium text-zinc-800 border-b'>My appointments</p>
      <div>
      <hr />
        {doctors.slice(0,2).map((item,index)=>{
          return (
            <div className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b' key={index}>
              <div className=''>
                <img className='w-32 bg-indigo-50' src={item.image} alt="" />
              </div>
              <div className='flex-1 text-sm text-zinc-600'>
                <p className='text-neutral-800 font-semibold'>{item.name}</p>
                <p>{item.speciality}</p>
                <p className=' text-zinc-600 font-medium mt-1'>{item.address.line1}</p>
                <p className='text-xs'>{item.address.line2}</p>
                <p className='text-xs mt-1'><span className='text-sm text-neutral-700 font-medium'>Date & Time:</span>{}</p>
              </div>
              <div></div>
              <div className='flex flex-col gap-2 justify-end'>
                <button className='rounded-lg text-black text-sm text-stone-600 text-center sm:min-w-48 py-2 border hover:bg-green-500 hover:text-white transition duration-300'>Pay Online</button>
                <button className='rounded-lg text-black text-sm text-stone-600 text-center sm:min-w-48 py-2 border hover:bg-red-500 hover:text-white transition duration-300'>Cancel appointment</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default MyAppointments