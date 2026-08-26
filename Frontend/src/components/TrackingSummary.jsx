import React from 'react';

const TrackingSummary = ({ data }) => {
  if (!data) return null;

  const steps = ['Label Created', 'In Transit', 'Out for Delivery', 'Delivered'];
  const currentStepIndex = steps.indexOf(data.status);
  const progressPercentage = Math.max(0, Math.min(100, (currentStepIndex / (steps.length - 1)) * 100));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-borderLight p-6 sm:p-8 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
            Estimated Delivery
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-primary">
            {data.estimatedDeliveryDate}
          </p>
          <p className="text-gray-500 mt-2 font-medium">by {data.estimatedDeliveryTime}</p>
        </div>
        <div className="mt-6 md:mt-0 text-left md:text-right">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
            Current Status
          </h2>
          <p className="text-2xl font-bold text-darkSlate">
            {data.status}
          </p>
          <p className="text-gray-500 mt-1 font-medium">{data.location}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative pt-4">
        <div className="flex justify-between mb-2">
          {steps.map((step, index) => (
            <span
              key={step}
              className={`text-xs sm:text-sm font-bold ${
                index <= currentStepIndex ? 'text-primary' : 'text-gray-400'
              }`}
            >
              {step}
            </span>
          ))}
        </div>
        <div className="h-3 w-full bg-slateLight rounded-full overflow-hidden border border-borderLight">
          <div
            className="h-full bg-accent transition-all duration-1000 ease-out relative"
            style={{ width: `${progressPercentage}%` }}
          >
            {/* Shimmer effect */}
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-white opacity-20" style={{
              backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
              animation: 'shimmer 2s infinite'
            }}></div>
          </div>
        </div>
        <style>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default TrackingSummary;
