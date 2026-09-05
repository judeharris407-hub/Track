import React from 'react';

interface SkyPrimeLogoProps {
  className?: string;
  showText?: boolean;
  textColor?: string;
  subTextColor?: string;
}

export const SkyPrimeLogo: React.FC<SkyPrimeLogoProps> = ({
  className = 'h-10 w-auto',
  showText = true,
  textColor = 'text-slate-900',
  subTextColor = 'text-blue-600',
}) => {
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Emblem SVG: Globe, Orbiting Jet Airplane, and Line-haul Freight Truck */}
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full aspect-square shrink-0 drop-shadow-md"
      >
        <defs>
          {/* Primary Gradient for Globe Background */}
          <linearGradient id="skyPrimePrimaryGrad" x1="20" y1="20" x2="180" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="50%" stopColor="#1D4ED8" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>

          {/* Cyan Glow Gradient for Orbit & Airplane */}
          <linearGradient id="skyPrimeOrbitGrad" x1="10" y1="50" x2="190" y2="150" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="50%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#93C5FD" />
          </linearGradient>

          {/* Truck Accent Gradient */}
          <linearGradient id="skyPrimeTruckGrad" x1="50" y1="120" x2="150" y2="170" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E0F2FE" />
          </linearGradient>
        </defs>

        {/* 1. Globe Base Shield Circle */}
        <circle cx="100" cy="100" r="88" fill="url(#skyPrimePrimaryGrad)" />
        <circle cx="100" cy="100" r="86" stroke="#60A5FA" strokeWidth="2.5" strokeOpacity="0.4" />

        {/* 2. Globe Latitude & Longitude Coordinate Lines */}
        <ellipse cx="100" cy="100" rx="42" ry="86" stroke="#93C5FD" strokeWidth="1.75" strokeOpacity="0.3" fill="none" />
        <ellipse cx="100" cy="100" rx="86" ry="38" stroke="#93C5FD" strokeWidth="1.75" strokeOpacity="0.3" fill="none" />
        <line x1="14" y1="100" x2="186" y2="100" stroke="#93C5FD" strokeWidth="1.5" strokeOpacity="0.35" />
        <line x1="100" y1="14" x2="100" y2="186" stroke="#93C5FD" strokeWidth="1.5" strokeOpacity="0.35" />

        {/* 3. Orbiting Global Flight Path (Arc) */}
        <path
          d="M 24 135 C 32 60, 115 20, 172 46"
          stroke="url(#skyPrimeOrbitGrad)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray="140 0"
          fill="none"
        />

        {/* 4. Orbiting Supersonic Cargo Airplane Silhouette */}
        <g transform="translate(162, 38) rotate(32)">
          <path
            d="M 0 -12 L 4 -2 L 18 4 L 4 6 L 3 14 L 7 17 L 3 18 L 0 16 L -3 18 L -7 17 L -3 14 L -4 6 L -18 4 L -4 -2 Z"
            fill="#38BDF8"
            stroke="#FFFFFF"
            strokeWidth="1.2"
          />
        </g>

        {/* 5. Line-Haul Express Truck Silhouette in Lower Center */}
        <g transform="translate(42, 112) scale(0.95)">
          {/* Main Cargo Container Body */}
          <rect x="10" y="8" width="62" height="34" rx="4" fill="url(#skyPrimeTruckGrad)" />
          {/* Subtle Container Ridge Lines */}
          <line x1="26" y1="12" x2="26" y2="38" stroke="#0284C7" strokeWidth="1.5" strokeOpacity="0.6" />
          <line x1="42" y1="12" x2="42" y2="38" stroke="#0284C7" strokeWidth="1.5" strokeOpacity="0.6" />
          <line x1="58" y1="12" x2="58" y2="38" stroke="#0284C7" strokeWidth="1.5" strokeOpacity="0.6" />

          {/* Aerodynamic Cab / Driver Cockpit */}
          <path
            d="M 72 20 L 88 20 L 98 32 L 98 42 L 72 42 Z"
            fill="url(#skyPrimeTruckGrad)"
          />
          {/* Cab Windshield */}
          <path d="M 76 23 L 86 23 L 93 31 L 76 31 Z" fill="#0369A1" />

          {/* Under-Chassis Base Bar */}
          <rect x="12" y="42" width="86" height="5" rx="2" fill="#0F172A" />

          {/* Truck Wheels (Rim + Tire) */}
          <circle cx="28" cy="47" r="8" fill="#0F172A" />
          <circle cx="28" cy="47" r="4" fill="#E2E8F0" />
          <circle cx="58" cy="47" r="8" fill="#0F172A" />
          <circle cx="58" cy="47" r="4" fill="#E2E8F0" />
          <circle cx="86" cy="47" r="8" fill="#0F172A" />
          <circle cx="86" cy="47" r="4" fill="#E2E8F0" />

          {/* Speed / Motion Streaks behind truck */}
          <line x1="-8" y1="20" x2="4" y2="20" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="-16" y1="30" x2="2" y2="30" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="-10" y1="40" x2="4" y2="40" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      </svg>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col text-left leading-none justify-center">
          <span className={`text-xl sm:text-2xl font-black tracking-tight ${textColor} uppercase font-sans`}>
            SKYPRIME
          </span>
          <span className={`text-[9px] sm:text-[10px] font-extrabold tracking-[0.25em] ${subTextColor} uppercase mt-0.5`}>
            LOGISTICS
          </span>
        </div>
      )}
    </div>
  );
};

export default SkyPrimeLogo;
