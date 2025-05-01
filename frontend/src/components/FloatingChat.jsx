import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DrRoss from '../assets/assets_frontend/doctor-ross.png';

const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-initial-bounce">

      {/* Navigate to Chatbot Page Button */}
      <button
        onClick={() => navigate('/chatbot')}
        className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 mb-2"
      >
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
        </svg>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-80 bg-white rounded-lg shadow-2xl transition-all duration-300">
          <div className="flex flex-col">
            {/* Chat Header */}
            <div className="bg-green-600 p-4 rounded-t-lg">
              <div className="flex items-center gap-3">
                <img 
                  src={DrRoss} 
                  alt="Dr. Ross" 
                  className="w-10 h-10 rounded-full"
                />
                <div className="text-white">
                  <h3 className="font-semibold">Dr. Ross</h3>
                  <p className="text-sm opacity-75">AI Health Assistant</p>
                </div>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex flex-col h-50 p-4 bg-gray-50">
              <div className="flex flex-col items-start justify-center gap-1 border p-4 bg-gray-900/10 rounded-lg">
                <h1 className="text-xl text-green-800">Ask Dr. Ross</h1>
                <p className="text-sm text-gray-600">Our very own AI Support for your 24x7 needs</p>
                <input 
                  type="text" 
                  placeholder="Ask your health questions..."
                  className="w-full mt-2 px-4 py-2 rounded-lg border-2 border-green-600/30 
                  bg-white backdrop-blur-sm text-gray-800 placeholder-gray-500
                  focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/50
                  transition-all duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingChat;