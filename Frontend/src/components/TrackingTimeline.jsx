import React from 'react';

const TrackingTimeline = ({ logs }) => {
  if (!logs || logs.length === 0) return null;

  // Group logs by date
  const groupedLogs = logs.reduce((acc, log) => {
    if (!acc[log.date]) {
      acc[log.date] = [];
    }
    acc[log.date].push(log);
    return acc;
  }, {});

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-borderLight p-6 sm:p-8">
      <h3 className="text-xl font-bold text-darkSlate mb-6 border-b border-borderLight pb-4">
        Shipment Travel History
      </h3>
      
      <div className="space-y-8">
        {Object.entries(groupedLogs).map(([date, dayLogs], groupIndex) => (
          <div key={date} className="relative">
            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 sticky top-16 bg-white py-2 z-10">
              {date}
            </h4>
            
            <div className="space-y-6">
              {dayLogs.map((log, index) => {
                const isLatest = groupIndex === 0 && index === 0;
                return (
                  <div key={log.id} className="relative pl-8 sm:pl-10">
                    {/* Timeline Line */}
                    {!(groupIndex === Object.keys(groupedLogs).length - 1 && index === dayLogs.length - 1) && (
                      <div className="absolute left-3.5 sm:left-[17px] top-6 bottom-[-24px] w-0.5 bg-borderLight"></div>
                    )}
                    
                    {/* Timeline Dot */}
                    <div className={`absolute left-2 sm:left-3 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                      isLatest ? 'bg-primary' : 'bg-gray-300'
                    }`}>
                      {isLatest && (
                        <div className="absolute -inset-1 rounded-full border-2 border-primary animate-ping opacity-75"></div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-4">
                      <div>
                        <p className={`font-bold ${isLatest ? 'text-primary' : 'text-darkSlate'}`}>
                          {log.activity}
                        </p>
                        <p className="text-gray-500 text-sm mt-0.5">{log.location}</p>
                      </div>
                      <div className="text-sm font-semibold text-gray-400 whitespace-nowrap">
                        {log.time}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrackingTimeline;
