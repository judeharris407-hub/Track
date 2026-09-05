import React from 'react';

interface SkyPrimeLogoProps {
  className?: string;
  showText?: boolean;
  textColor?: string;
  subTextColor?: string;
  emblemColor?: string;
}

export const SkyPrimeLogo: React.FC<SkyPrimeLogoProps> = ({
  className = 'h-10 w-auto',
  showText = true,
  textColor = 'text-slate-900',
  subTextColor = 'text-blue-700',
  emblemColor = '#1D4ED8',
}) => {
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Emblem SVG: Precision Line-Art Globe, Orbital Airplane & Freight Truck */}
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full aspect-square shrink-0"
      >
        {/* 1. Sweeping Orbital Flight Path */}
        <path
          d="M 36 142 C 20 94 40 44 84 26"
          stroke={emblemColor}
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 134 50 C 162 72 172 114 154 148"
          stroke={emblemColor}
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* 2. Ascending Commercial/Cargo Jet Airplane */}
        <g transform="translate(120, 34) rotate(-28)">
          <path
            d="M 0 -24 
               C 1.8 -18 3.5 -10 4 0 
               L 24 10 
               L 24 14.5 
               L 4.5 8 
               L 4 18 
               L 11 25 
               L 11 28 
               L 0 25 
               L -11 28 
               L -11 25 
               L -4 18 
               L -4.5 8 
               L -24 14.5 
               L -24 10 
               L -4 0 
               C -3.5 -10 -1.8 -18 0 -24 Z"
            fill={emblemColor}
          />
          {/* Twin Jet Engines Under Wings */}
          <rect x="8" y="4" width="2.5" height="7" rx="1.2" fill={emblemColor} />
          <rect x="-10.5" y="4" width="2.5" height="7" rx="1.2" fill={emblemColor} />
        </g>

        {/* 3. Line-Art Globe with Continents Silhouette (Center Background) */}
        <g>
          {/* Globe Circular Frame */}
          <circle
            cx="100"
            cy="94"
            r="46"
            stroke={emblemColor}
            strokeWidth="3.5"
            fill="none"
          />
          {/* Landmass / Continents Silhouettes */}
          <path
            d="M 70 66 
               C 72 62, 80 60, 85 64 
               C 88 68, 84 74, 87 78 
               C 91 82, 97 80, 101 84 
               C 105 88, 99 94, 95 96 
               C 91 98, 85 92, 81 94 
               C 77 96, 75 104, 71 100 
               C 67 96, 69 86, 67 80 
               C 65 74, 68 70, 70 66 Z"
            fill={emblemColor}
          />
          <path
            d="M 112 60 
               C 120 58, 128 63, 132 70 
               C 136 76, 130 82, 134 88 
               C 136 92, 128 96, 122 93 
               C 118 90, 120 84, 117 80 
               C 114 76, 110 70, 112 60 Z"
            fill={emblemColor}
          />
          <path
            d="M 94 108 
               C 98 104, 106 106, 110 112 
               C 114 118, 110 124, 104 126 
               C 98 128, 92 122, 92 116 
               C 92 112, 92 110, 94 108 Z"
            fill={emblemColor}
          />
        </g>

        {/* 4. Heavy Freight Line-Haul Truck (3/4 Perspective with Speed Streaks) */}
        <g transform="translate(0, 6)">
          {/* Trailer Main Dark Body Wall */}
          <path
            d="M 104 104 
               L 104 172 
               L 95 172 
               L 95 106 
               Z"
            fill={emblemColor}
          />
          <path
            d="M 105 104 
               L 144 126 
               L 144 131 
               L 105 109 
               Z"
            fill={emblemColor}
          />

          {/* Dynamic Speed Streaks along Trailer Side */}
          <path d="M 106 111 L 150 133 L 144 135 L 106 114 Z" fill={emblemColor} />
          <path d="M 106 116 L 158 140 L 151 142 L 106 119 Z" fill={emblemColor} />
          <path d="M 106 121 L 166 146 L 157 148 L 106 124 Z" fill={emblemColor} />
          <path d="M 106 126 L 170 151 L 160 153 L 106 129 Z" fill={emblemColor} />
          <path d="M 106 131 L 168 156 L 156 158 L 106 134 Z" fill={emblemColor} />
          <path d="M 106 136 L 162 160 L 150 162 L 106 139 Z" fill={emblemColor} />
          <path d="M 106 141 L 154 163 L 142 165 L 106 144 Z" fill={emblemColor} />
          <path d="M 106 146 L 144 165 L 134 166 L 106 149 Z" fill={emblemColor} />
          <path d="M 106 152 L 134 166 L 124 167 L 106 155 Z" fill={emblemColor} />

          {/* Cab Top Wind Deflector / Aerodynamic Roof */}
          <path
            d="M 66 120 
               L 92 116 
               L 102 112 
               L 102 123 
               L 94 126 
               L 60 132 
               L 66 120 Z"
            fill={emblemColor}
          />
          {/* Cab Roof Speed Relief Lines */}
          <line x1="70" y1="122" x2="88" y2="119" stroke={emblemColor} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="68" y1="126" x2="86" y2="123" stroke={emblemColor} strokeWidth="2.5" strokeLinecap="round" />

          {/* Cab Front Windshield Frame & Glass */}
          <path
            d="M 56 136 
               L 86 132 
               L 86 149 
               L 52 151 
               Z"
            stroke={emblemColor}
            strokeWidth="3.5"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Windshield Reflection Lines */}
          <line x1="58" y1="140" x2="72" y2="138" stroke={emblemColor} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="56" y1="145" x2="68" y2="143" stroke={emblemColor} strokeWidth="2.5" strokeLinecap="round" />

          {/* Cab Side Window (3/4 Perspective) */}
          <path
            d="M 88 132 
               L 99 129 
               L 99 146 
               L 88 148 
               Z"
            stroke={emblemColor}
            strokeWidth="3"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Cab Front Grille & Headlight Bumper Area */}
          <path
            d="M 50 155 
               L 86 153 
               L 86 172 
               L 50 172 
               Z"
            fill="none"
            stroke={emblemColor}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Grille Horizontal Louvers */}
          <line x1="54" y1="159" x2="82" y2="158" stroke={emblemColor} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="54" y1="164" x2="82" y2="163" stroke={emblemColor} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="54" y1="169" x2="82" y2="168" stroke={emblemColor} strokeWidth="2.5" strokeLinecap="round" />

          {/* Headlights & Indicator */}
          <path d="M 50 157 L 54 157 L 54 165 L 50 164 Z" fill={emblemColor} />
          <path d="M 82 156 L 86 156 L 86 164 L 82 163 Z" fill={emblemColor} />
          <circle cx="95" cy="161" r="3" fill={emblemColor} />

          {/* Front Left Wheel */}
          <circle cx="60" cy="177" r="8" fill={emblemColor} />
          <circle cx="60" cy="177" r="4" fill="none" stroke="white" strokeWidth="1.5" />

          {/* Front Right Wheel */}
          <ellipse cx="88" cy="177" rx="7.5" ry="8" fill={emblemColor} />
          <ellipse cx="88" cy="177" rx="3.5" ry="4" fill="none" stroke="white" strokeWidth="1.5" />

          {/* Trailer Tandem Wheels (Center & Rear) */}
          <ellipse cx="110" cy="176" rx="7" ry="7.5" fill={emblemColor} />
          <ellipse cx="110" cy="176" rx="3" ry="3.5" fill="none" stroke="white" strokeWidth="1.5" />

          <ellipse cx="127" cy="175" rx="7" ry="7.5" fill={emblemColor} />
          <ellipse cx="127" cy="175" rx="3" ry="3.5" fill="none" stroke="white" strokeWidth="1.5" />

          <ellipse cx="142" cy="174" rx="6.5" ry="7" fill={emblemColor} />
          <ellipse cx="142" cy="174" rx="2.5" ry="3" fill="none" stroke="white" strokeWidth="1.5" />

          {/* Ground Platform Baseline */}
          <path
            d="M 38 184 L 178 184"
            stroke={emblemColor}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </g>
      </svg>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col text-left leading-none justify-center">
          <span className={`text-xl sm:text-2xl font-black tracking-tight ${textColor} uppercase font-sans`}>
            SKYPRIME
          </span>
          <span
            className={`text-[9px] sm:text-[10px] font-extrabold tracking-[0.25em] ${subTextColor} uppercase mt-0.5`}
          >
            LOGISTICS
          </span>
        </div>
      )}
    </div>
  );
};

export default SkyPrimeLogo;
