import { assets } from '@/assets/assets_frontend/assets'
import React from 'react'
import { ArrowUpNarrowWide, UserCheck2, UserSquare2Icon } from 'lucide-react'
function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          ABOUT <span className="text-blue-600">US</span>
        </h1>
        
        {/* Main Content */}
        <div className="my-12 flex flex-col md:flex-row gap-12 items-center justify-center">
          <img 
            className="w-full md:w-[450px] rounded-lg shadow-lg object-cover" 
            src={assets.about_image} 
            alt="Healthcare professionals" 
          />
          <div className="flex flex-col gap-6 md:w-1/2">
            <h2 className="text-2xl font-semibold text-gray-800">
              Welcome To DocPlus,
              <span className="block mt-2 text-blue-600">Your Trusted Healthcare Partner</span>
            </h2>
            <p className="text-gray-600 leading-relaxed">
              At DocPlus, we are dedicated to transforming the way you access healthcare. Our mission is to provide you with a seamless and convenient platform that connects you with top-notch medical professionals, ensuring that you receive the care you deserve, when you need it most.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Our platform offers a wide range of services, including telemedicine consultations, appointment scheduling, and access to a wealth of medical resources. Whether you need a routine check-up, specialist advice, or urgent care, DocPlus is here to simplify your healthcare journey.
            </p>
          </div>
        </div>

        {/* Why Choose Us Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-12">
            WHY <span className="text-blue-600">CHOOSE US</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Efficiency Card */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <ArrowUpNarrowWide className='w-6 h-6'/>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Efficiency</h3>
              </div>
              <p className="text-gray-600">
                Our streamlined booking process and intuitive interface ensure you can find and schedule appointments with healthcare providers quickly and easily, saving you valuable time.
              </p>
            </div>

            {/* Convenience Card */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <UserCheck2 className='w-6 h-6'/>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Convenience</h3>
              </div>
              <p className="text-gray-600">
                Access healthcare services from anywhere, at any time. Our platform enables you to book appointments, consult with doctors, and manage your health records all in one place.
              </p>
            </div>

            {/* Personalization Card */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full p-3 flex items-center justify-center">
                 <UserSquare2Icon className='w-6 h-6'/>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Personalization</h3>
              </div>
              <p className="text-gray-600">
                We understand that healthcare is personal. Our platform provides tailored recommendations and personalized care options based on your specific needs and preferences.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Features Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-8">
            Our <span className="text-blue-600">Features</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { title: "24/7 Support", value: "Always Available" },
              { title: "Verified Doctors", value: "100+" },
              { title: "Satisfied Patients", value: "1000+" },
              { title: "Specialties", value: "50+" }
            ].map((stat, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-blue-600 text-2xl font-bold">{stat.value}</h3>
                <p className="text-gray-600 mt-2">{stat.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default About