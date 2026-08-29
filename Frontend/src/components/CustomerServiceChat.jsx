import React, { useState, useRef, useEffect } from 'react';
import socket from '../lib/socket';

const CustomerServiceChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [hasOpened, setHasOpened] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isConnected, setIsConnected] = useState(socket.connected);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Socket connection listeners for status and debugging
  useEffect(() => {
    const handleConnect = () => {
      console.log('[Socket] Connected to backend successfully. Socket ID:', socket.id);
      setIsConnected(true);
    };

    const handleConnectError = (error) => {
      console.error('[Socket] Connection error:', error.message || error);
      setIsConnected(false);
    };

    const handleDisconnect = (reason) => {
      console.warn('[Socket] Disconnected from server. Reason:', reason);
      setIsConnected(false);
    };

    socket.on('connect', handleConnect);
    socket.on('connect_error', handleConnectError);
    socket.on('disconnect', handleDisconnect);

    if (socket.connected) {
      setIsConnected(true);
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('connect_error', handleConnectError);
      socket.off('disconnect', handleDisconnect);
    };
  }, []);

  useEffect(() => {
    if (isOpen && !hasOpened) {
      setMessages([
        { 
          id: 1, 
          sender: 'bot', 
          text: 'Hello! Thank you for contacting SkyPrime Support. How can we help you with your shipment today?', 
          time: 'Just now' 
        }
      ]);
      setHasOpened(true);
    }
  }, [isOpen, hasOpened]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newUserMsg = { id: Date.now(), sender: 'user', text: inputValue, time: 'Just now' };
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');

    // Simulated 1-second delay for agent response
    setTimeout(() => {
      const botReply = {
        id: Date.now() + 1,
        sender: 'bot',
        text: 'Thank you for your request. An agent has been notified and we are reviewing your tracking file right now.',
        time: 'Just now'
      };
      setMessages(prev => [...prev, botReply]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white w-[360px] rounded-lg shadow-2xl border border-borderLight mb-4 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300" style={{ height: '450px' }}>
          {/* Header */}
          <div className="bg-primary text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
                S
              </div>
              <div>
                <h3 className="font-bold text-sm">SkyPrime Virtual Assistant</h3>
                <p className="text-xs text-blue-200 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  {isConnected ? 'Connected' : 'Connecting...'}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-slateLight space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'bot' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                  msg.sender === 'bot'
                    ? 'bg-white text-darkSlate rounded-tl-none border border-borderLight shadow-sm' 
                    : 'bg-primary text-white rounded-tr-none shadow-md'
                }`}>
                  {msg.text}
                  <div className={`text-[10px] mt-1 ${msg.sender === 'bot' ? 'text-gray-400' : 'text-blue-200'}`}>
                    {msg.time}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-borderLight">
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 bg-slateLight border border-borderLight rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
              <button 
                type="submit"
                disabled={!inputValue.trim()}
                className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-sm"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 px-5 py-3.5 rounded-full shadow-xl transition-all duration-300 transform hover:scale-105 ${
          isOpen ? 'bg-darkSlate text-white' : 'bg-primary text-white hover:bg-blue-800'
        }`}
      >
        {!isOpen && <span className="font-semibold text-sm hidden sm:block">Need help?</span>}
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default CustomerServiceChat;
