import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DrRoss from '../assets/assets_frontend/doctor-ross.png';

const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const chatRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatRef.current && !chatRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleQuickChat = () => {
    setIsOpen(!isOpen);
  };

  const handleFullChat = () => {
    navigate('/chatbot');
  };

  return (
    <div className="fixed bottom-4 right-4 z-50" ref={chatRef}>
      {/* Toggle Quick Chat Button */}
      <button
        onClick={handleQuickChat}
        className="w-14 h-14 bg-green-600 rounded-full shadow-lg flex items-center justify-center hover:bg-green-700 transition-all duration-300 mb-2"
      >
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
        </svg>
      </button>
      {/* Quick Chat Window */}
      {isOpen && (
        <div className="absolute bottom-32 right-0 w-80 bg-white rounded-lg shadow-2xl transition-all duration-300">
          <div className="flex flex-col">
            <div className="bg-green-600 p-4 rounded-t-lg">
              <div className="flex items-center gap-3">
                <img src={DrRoss} alt="Dr. Ross" className="w-10 h-10 rounded-full" />
                <div className="text-white">
                  <h3 className="font-semibold">Dr. Ross</h3>
                  <p className="text-sm opacity-75">AI Health Assistant</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50">
              <p className="text-gray-600 mb-4">Need quick health advice? Chat with Dr. Ross!</p>
              <button
                onClick={handleFullChat}
                className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300"
              >
                Start Full Conversation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingChat;