import React, { useEffect, useRef, useState } from 'react';
import DrRoss from '../assets/assets_frontend/doctor-ross.png';

const ChatbotPage = () => {
  const chatContainerRef = useRef(null);
  const [error, setError] = useState(null);
  const [useIframe, setUseIframe] = useState(true); // Default to iframe for stability

  useEffect(() => {
    if (!chatContainerRef.current) {
      console.warn('chatContainerRef is not attached to a DOM element');
      setError('Chat initialization failed. Please try again.');
      return;
    }

    // Only attempt script-based loading if useIframe is false
    if (!useIframe) {
      const chatContainer = document.createElement('div');
      chatContainer.id = 'bp-web-widget';
      chatContainerRef.current.appendChild(chatContainer);

      const loadBotpress = (retryCount = 0, maxRetries = 2) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.botpress.cloud/webchat/v2.4/inject.js';
        script.async = true;
        document.body.appendChild(script);

        script.onload = () => {
          if (window.botpressWebChat) {
            window.botpressWebChat.init({
              configUrl: 'https://files.bpcontent.cloud/2025/05/22/13/20250522134658-7JW1YNXG.json',
              hostUrl: 'https://cdn.botpress.cloud/webchat/v2.4',
              botName: 'Dr. Ross',
              avatarUrl: DrRoss,
              composerPlaceholder: 'Chat with Dr. Ross',
              showConversationsButton: false,
              enableReset: true,
              styles: {
                button: { backgroundColor: '#16a34a' },
                header: { backgroundColor: '#16a34a', color: '#ffffff' },
              },
            });
          } else {
            console.error(`Botpress WebChat failed to load (attempt ${retryCount + 1})`);
            if (retryCount < maxRetries) {
              console.log('Retrying Botpress script load...');
              loadBotpress(retryCount + 1, maxRetries);
            } else {
              setError('Failed to load Dr. Ross chatbot. Using fallback mode.');
              setUseIframe(true);
            }
          }
        };

        script.onerror = () => {
          console.error(`Failed to load Botpress WebChat script (attempt ${retryCount + 1})`);
          if (retryCount < maxRetries) {
            console.log('Retrying Botpress script load...');
            loadBotpress(retryCount + 1, maxRetries);
          } else {
            setError('Failed to load Dr. Ross chatbot. Using fallback mode.');
            setUseIframe(true);
          }
        };
      };

      loadBotpress();
    }

    // Cleanup
    return () => {
      if (!useIframe) {
        const chatContainer = document.getElementById('bp-web-widget');
        if (chatContainer && chatContainerRef.current && chatContainer.parentNode === chatContainerRef.current) {
          chatContainerRef.current.removeChild(chatContainer);
        }
        const scripts = document.querySelectorAll('script[src*="botpress.cloud/webchat"]');
        scripts.forEach((script) => {
          if (script.parentNode) {
            script.parentNode.removeChild(script);
          }
        });
        if (window.botpressWebChat && window.botpressWebChat.destroy) {
          window.botpressWebChat.destroy();
        }
      }
    };
  }, [useIframe]);

  return (
    <div className="h-screen w-screen bg-gray-100 flex justify-center items-center p-4">
      <div className="w-full h-full bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-green-600 p-4 rounded-t-lg flex items-center gap-3">
          <img src={DrRoss} alt="Dr. Ross" className="w-10 h-10 rounded-full" />
          <div className="text-white">
            <h3 className="font-semibold">Dr. Ross</h3>
            <p className="text-sm opacity-75">AI Health Assistant</p>
          </div>
        </div>

        {/* Chat Container */}
        <div className="flex-1 bg-gray-50" ref={chatContainerRef}>
          {error ? (
            <div className="h-full flex items-center justify-center text-gray-600">
              <p>{error}</p>
            </div>
          ) : useIframe ? (
            <iframe
              title="Dr. Ross Chat"
              src="https://cdn.botpress.cloud/webchat/v2.4/shareable.html?configUrl=https://files.bpcontent.cloud/2025/05/22/13/20250522134658-7JW1YNXG.json"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                overflow: 'hidden',
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '500px',
                border: 'none',
                overflow: 'hidden',
              }}
            />
          )}
        </div>

        {/* Disclaimer */}
        <div className="p-4 border-t bg-white text-center text-xs text-gray-500">
          Dr. Ross provides general information and is not a substitute for professional medical advice.
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;