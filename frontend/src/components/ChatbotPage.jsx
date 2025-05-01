import React, { useState, useEffect, useRef } from 'react';
import DrRoss from '../assets/assets_frontend/doctor-ross.png';

const ChatbotPage = () => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I’m Dr. Ross, your AI Health Assistant. Ask me any healthcare-related question.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: input })
      });

      const data = await response.json();
      const botResponse = data.response || 'Sorry, I could not respond at this time.';
      setMessages((prev) => [...prev, { sender: 'bot', text: botResponse }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [...prev, { sender: 'bot', text: 'An error occurred. Please try again later.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-2xl flex flex-col">
        {/* Chat Header */}
        <div className="bg-green-600 p-4 rounded-t-lg flex items-center gap-3">
          <img src={DrRoss} alt="Dr. Ross" className="w-10 h-10 rounded-full" />
          <div className="text-white">
            <h3 className="font-semibold">Dr. Ross</h3>
            <p className="text-sm opacity-75">AI Health Assistant</p>
          </div>
        </div>

        {/* Chat Body */}
        <div className="flex-1 p-4 bg-gray-50 overflow-y-auto max-h-[500px]">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-4 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  msg.sender === 'user' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="bg-gray-200 text-gray-800 p-3 rounded-lg">
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t bg-white">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask your health questions..."
              className="flex-1 px-4 py-2 rounded-lg border-2 border-green-600/30 
                bg-white text-gray-800 placeholder-gray-500
                focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/50
                transition-all duration-300"
            />
            <button
              onClick={handleSendMessage}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300"
            >
              Send
            </button>
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">
            Dr. Ross provides general information, not medical diagnoses. Consult a healthcare professional for advice.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;
