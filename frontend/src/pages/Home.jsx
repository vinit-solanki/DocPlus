import React from "react";
import SpecialityMenu from '../components/SpecialityMenu';
import { assets } from "../assets/assets_frontend/assets";
import TopDoctors from "@/components/TopDoctors";
import Banner from "@/components/Banner";

export default function Home() {
  return (
    <div>
    <div className="w-full min-h-screen bg-green-700 rounded-lg overflow-hidden">
      <div className="container mx-auto max-w-screen-xl flex flex-col-reverse md:flex-row items-center justify-between px-6 md:px-12 lg:px-20 py-12 md:py-24">
        {/* Left Side */}
        <div className="md:w-1/2 flex flex-col items-start justify-center gap-6 text-white">
          <h1 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold leading-snug">
            Book Appointment <br /> With Trusted Doctors
          </h1>
          <div className="flex flex-col items-start md:flex-row items-center gap-4">
            <img src={assets.group_profiles} alt="Doctors" className="w-32 h-16 rounded-full" />
            <p className="text-lg md:text-xl">
              Browse our extensive list of trusted doctors, <br /> schedule and diagnose with ease.
            </p>
          </div>
          <a
            href="#speciality"
            className="mt-4 flex items-center gap-3 bg-white text-green-950 px-6 py-3 rounded-full font-semibold shadow-lg hover:bg-gray-100 transition"
          >
            Book Appointment <img src={assets.arrow_icon} alt="Arrow" className="w-6" />
          </a>
        </div>

        {/* Right Side */}
        <div className="md:w-1/2 flex justify-center items-center">
          <img
            src={assets.header_img}
            alt="Medical Illustration"
            className="max-w-[90%] md:max-w-full h-auto rounded-xl shadow-xl shadow-2xl animate-initial-bounce"
          />
        </div>
      </div>
    </div>
      <SpecialityMenu/>
      <TopDoctors/>
      <Banner/>
    </div>
  );
}
