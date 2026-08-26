import React, { useState } from 'react';

const HeroSearch = ({ onSearch }) => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      setError('Please enter a tracking number.');
      return;
    }
    setError('');
    onSearch(trackingNumber.trim());
  };

  return (
    <div className="bg-primary text-white py-16 sm:py-24 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-white opacity-5 blur-3xl"></div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
          Track Your Shipment
        </h1>
        <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
          Enter your SkyPrime Logistics tracking number to get real-time updates on your delivery.
        </p>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div className="relative flex items-center">
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="e.g., SKP-2026-99A"
              className="w-full pl-6 pr-32 py-4 rounded-xl text-darkSlate text-lg focus:outline-none focus:ring-4 focus:ring-accent shadow-xl font-medium placeholder-gray-400"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 bottom-2 bg-accent hover:bg-blue-600 text-white font-bold px-6 rounded-lg transition-colors shadow-md"
            >
              Track
            </button>
          </div>
          {error && (
            <p className="text-red-200 mt-3 text-sm text-left pl-4 font-medium">{error}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default HeroSearch;
