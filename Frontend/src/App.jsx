import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HeroSearch from './components/HeroSearch';
import TrackingSummary from './components/TrackingSummary';
import TrackingTimeline from './components/TrackingTimeline';
import CustomerServiceChat from './components/CustomerServiceChat';

function App() {
  const [trackingData, setTrackingData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (trackingNumber) => {
    setIsLoading(true);
    setTrackingData(null);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/track/${trackingNumber}`);
      
      if (response.ok) {
        const data = await response.json();
        
        // Map backend shape to the frontend layout keys
        const mappedData = {
          trackingNumber: data.tracking_number,
          summary: {
            status: data.current_status || 'Unknown',
            statusCode: data.current_status ? data.current_status.toUpperCase().replace(' ', '_') : 'UNKNOWN',
            estimatedDeliveryDate: data.estimated_delivery || 'TBD',
            carrier: data.carrier || 'Unknown Carrier',
            origin: 'Origin Hub', // Placeholder since DB might not provide this
            destination: 'Destination Facility' // Placeholder
          },
          logs: (data.history || []).map((event, index) => {
            let dateStr = 'Unknown Date';
            let timeStr = 'Unknown Time';
            if (event.timestamp) {
              const dateObj = new Date(event.timestamp);
              dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            }
            return {
              id: index,
              date: dateStr,
              time: timeStr,
              activity: event.description || 'Update',
              location: event.location || 'In Transit'
            };
          })
        };

        setTrackingData(mappedData);
        setError(null);
      } else {
        setTrackingData(null);
        setError("Tracking number not found. Please verify the code and try again.");
      }
    } catch (err) {
      setTrackingData(null);
      setError("Network error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slateLight">
      <Navbar />
      
      <main className="flex-grow">
        <HeroSearch onSearch={handleSearch} />
        
        {error && !isLoading && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-white border-l-4 border-red-500 p-6 rounded-xl shadow-md text-left">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 className="text-lg font-bold text-darkSlate">Error</h3>
              </div>
              <p className="mt-2 text-gray-600 ml-9 font-medium">{error}</p>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Dashboard Header Skeleton */}
            <div className="md:col-span-3 flex justify-between items-center mb-[-1rem]">
              <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>

            {/* Tracking Summary Skeleton */}
            <div className="md:col-span-3 bg-white rounded-2xl shadow-sm border border-borderLight p-6 sm:p-8">
              <div className="flex justify-between mb-8">
                <div>
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse mb-3"></div>
                  <div className="h-10 bg-gray-200 rounded w-48 animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse mb-3"></div>
                  <div className="h-8 bg-gray-200 rounded w-36 animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                </div>
              </div>
              <div className="h-3 w-full bg-gray-100 rounded-full animate-pulse"></div>
            </div>

            {/* Timeline Skeleton */}
            <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-borderLight p-6 sm:p-8">
              <div className="h-6 bg-gray-200 rounded w-48 animate-pulse mb-8"></div>
              <div className="space-y-8 pl-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse mt-1"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Details Skeleton */}
            <div className="md:col-span-1 bg-white rounded-2xl shadow-sm border border-borderLight p-6 sm:p-8 h-full">
              <div className="h-6 bg-gray-200 rounded w-32 animate-pulse mb-8"></div>
              <div className="space-y-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i}>
                    <div className="h-3 bg-gray-200 rounded w-24 animate-pulse mb-2"></div>
                    <div className="h-5 bg-gray-200 rounded w-full animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {trackingData && !isLoading && (
          <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
            {/* Dashboard Header spanning full width */}
            <div className="md:col-span-3 flex justify-between items-center mb-[-1rem]">
              <h2 className="text-2xl font-extrabold text-darkSlate">
                Tracking Dashboard
              </h2>
              <span className="bg-white px-4 py-2 rounded-lg font-mono font-bold text-gray-600 border border-borderLight shadow-sm">
                {trackingData.trackingNumber}
              </span>
            </div>

            {/* Tracking Summary spanning full width */}
            <div className="md:col-span-3">
              <TrackingSummary data={trackingData.summary} />
            </div>

            {/* Timeline spanning 2 columns */}
            <div className="md:col-span-2">
              <TrackingTimeline logs={trackingData.logs} />
            </div>

            {/* Delivery Details side panel */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-borderLight p-6 sm:p-8 h-full">
                <h3 className="text-xl font-bold text-darkSlate mb-6 border-b border-borderLight pb-4">
                  Shipment Details
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Origin</h4>
                    <p className="text-darkSlate font-semibold">{trackingData.summary.origin}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Destination</h4>
                    <p className="text-darkSlate font-semibold">{trackingData.summary.destination}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Carrier</h4>
                    <p className="text-darkSlate font-semibold">{trackingData.summary.carrier}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Status Code</h4>
                    <p className="text-primary font-bold bg-blue-50 inline-block px-3 py-1 rounded-md mt-1 border border-blue-100">
                      {trackingData.summary.statusCode}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-darkSlate text-white py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} SkyPrime Logistics. All rights reserved.</p>
        </div>
      </footer>

      <CustomerServiceChat />
    </div>
  );
}

export default App;
