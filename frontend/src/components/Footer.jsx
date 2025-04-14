import { assets } from '@/assets/assets_frontend/assets'
import React from 'react'

const Footer = () => {
  return (
    <div className='w-full '>
        <div className='px-10 flex flex-col justify-center items-center md:grid grid-cols-3 gap-4 py-10 text-gray-800 bg-green-950 text-white text-sm'>
            {/* Left Section */}
            <div>
            <h2 className='text-3xl font-bold'>Doc<span className='text-green-300 text-4xl'>+</span></h2>
                <p className='w-full md:w-2/3 text-gray-300 leading-6'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Harum sunt tempore sapiente exercitationem voluptatibus. Dicta incidunt fugit consectetur veritatis ratione.</p>
            </div>
            {/* Center Section */}
            <div className='flex gap-4 flex-row justify-between items-center'> 
            <div>
                <p className='text-xl font-md mb-5'>GET IN TOUCH</p>
                <ul className='flex flex-col gap-2 text-gray-100'>
                <li>+91-0123-456-789</li>
                <li>docplus@gmail.com</li>
                </ul>
            </div>
            {/* Right Section */}
            <div className='flex flex-col gap-4'>
                <p className='text-xl font-md mb-5'>Company</p>
                <ul className='flex flex-col gap-2 text-gray-100'>
                <li>Home</li>
                <li>About Us</li>
                <li>Contact Us</li>
                <li>Privacy Plicy</li></ul>
            </div>
            </div>
        </div>
    </div>
  )
}

export default Footer