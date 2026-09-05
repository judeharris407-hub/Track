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
      {/* Emblem SVG: Globe background, orbital flight trail with ascending airplane, 3/4 speed truck */}
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full aspect-square shrink-0"
      >
        {/* 1. Orbiting Contrail Arc around Globe */}
        <path
          d="M 36 138 C 22 92 40 46 80 28"
          stroke={emblemColor}
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 132 52 C 158 72 166 112 152 144"
          stroke={emblemColor}
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* 2. Ascending Jet Airplane Silhouette (Top-Right of Globe) */}
        <g transform="translate(118, 36) rotate(-28)">
          <path
            d="M 0 -22 
               C 1.5 -18 3 -10 3.5 0 
               L 22 10 
               L 22 14 
               L 4 8 
               L 3.5 18 
               L 10 24 
               L 10 27 
               L 0 24 
               L -10 27 
               L -10 24 
               L -3.5 18 
               L -4 8 
               L -22 14 
               L -22 10 
               L -3.5 0 
               C -3 -10 -1.5 -18 0 -22 Z"
            fill={emblemColor}
          />
          {/* Engine Pods */}
          <rect x="7" y="4" width="2" height="6" rx="1" fill={emblemColor} />
          <rect x="-9" y="4" width="2" height="6" rx="1" fill={emblemColor} />
        </g>

        {/* 3. Globe with Continents Silhouette (Center Background) */}
        <g>
          {/* Globe Outline */}
          <circle
            cx="100"
            cy="92"
            r="44"
            stroke={emblemColor}
            strokeWidth="3.5"
            fill="none"
          />
          {/* Globe Landmass / Continents Silhouettes */}
          <path
            d="M 72 68 
               C 74 64, 82 62, 86 66 
               C 89 70, 85 75, 88 80 
               C 92 84, 98 82, 102 86 
               C 106 90, 100 96, 96 98 
               C 92 100, 86 94, 82 96 
               C 78 98, 76 106, 72 102 
               C 68 98, 70 88, 68 82 
               C 66 76, 70 72, 72 68 Z"
            fill={emblemColor}
          />
          <path
            d="M 110 62 
               C 118 60, 126 65, 130 72 
               C 134 78, 128 84, 132 90 
               C 134 94, 126 98, 120 95 
               C 116 92, 118 86, 115 82 
               C 112 78, 108 72, 110 62 Z"
            fill={emblemColor}
          />
          <path
            d="M 92 110 
               C 96 106, 104 108, 108 114 
               C 112 120, 108 126, 102 128 
               C 96 130, 90 124, 90 118 
               C 90 114, 90 112, 92 110 Z"
            fill={emblemColor}
          />
        </g>

        {/* 4. Line-Haul Freight Truck with 3/4 Perspective & Dynamic Speed Streaks */}
        <g transform="translate(0, 5)">
          {/* Trailer Main Body & Roof Fairing */}
          <path
            d="M 104 106 
               L 104 172 
               L 95 172 
               L 95 108 
               Z"
            fill={emblemColor}
          />
          <path
            d="M 105 106 
               L 142 128 
               L 142 133 
               L 105 111 
               Z"
            fill={emblemColor}
          />

          {/* Dynamic Speed Streaks along Trailer Side */}
          <path d="M 106 113 L 148 135 L 142 137 L 106 116 Z" fill={emblemColor} />
          <path d="M 106 118 L 156 142 L 149 144 L 106 121 Z" fill={emblemColor} />
          <path d="M 106 123 L 164 148 L 155 150 L 106 126 Z" fill={emblemColor} />
          <path d="M 106 128 L 168 153 L 158 155 L 106 131 Z" fill={emblemColor} />
          <path d="M 106 133 L 166 158 L 154 160 L 106 136 Z" fill={emblemColor} />
          <path d="M 106 138 L 160 162 L 148 164 L 106 141 Z" fill={emblemColor} />
          <path d="M 106 143 L 152 165 L 140 167 L 106 146 Z" fill={emblemColor} />
          <path d="M 106 148 L 142 167 L 132 168 L 106 151 Z" fill={emblemColor} />
          <path d="M 106 154 L 132 168 L 122 169 L 106 157 Z" fill={emblemColor} />

          {/* Cab Top Wind Deflector / Aerodynamic Roof */}
          <path
            d="M 68 122 
               L 92 118 
               L 102 114 
               L 102 125 
               L 94 128 
               L 62 134 
               L 68 122 Z"
            fill={emblemColor}
          />
          {/* Cab Roof Slats */}
          <line x1="72" y1="124" x2="90" y2="121" stroke={emblemColor} strokeWidth="2" strokeLinecap="round" />
          <line x1="70" y1="128" x2="88" y2="125" stroke={emblemColor} strokeWidth="2" strokeLinecap="round" />

          {/* Cab Front Windshield Frame & Glass */}
          <path
            d="M 58 138 
               L 86 134 
               L 86 150 
               L 54 152 
               Z"
            stroke={emblemColor}
            strokeWidth="3"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Windshield Speed Glare Lines */}
          <line x1="60" y1="142" x2="72" y2="140" stroke={emblemColor} strokeWidth="2" strokeLinecap="round" />
          <line x1="58" y1="146" x2="68" y2="145" stroke={emblemColor} strokeWidth="2" strokeLinecap="round" />

          {/* Cab Side Window (3/4 Perspective) */}
          <path
            d="M 88 134 
               L 98 131 
               L 98 147 
               L 88 149 
               Z"
            stroke={emblemColor}
            strokeWidth="2.5"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Cab Front Grille & Headlight Bumper Area */}
          <path
            d="M 52 156 
               L 86 154 
               L 86 172 
               L 52 172 
               Z"
            fill="none"
            stroke={emblemColor}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Grille Horizontal Louvers */}
          <line x1="56" y1="160" x2="82" y2="159" stroke={emblemColor} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="56" y1="165" x2="82" y2="164" stroke={emblemColor} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="56" y1="170" x2="82" y2="169" stroke={emblemColor} strokeWidth="2.5" strokeLinecap="round" />

          {/* Headlights & Indicator */}
          <path d="M 52 158 L 56 158 L 56 166 L 52 165 Z" fill={emblemColor} />
          <path d="M 82 157 L 86 157 L 86 165 L 82 164 Z" fill={emblemColor} />
          <circle cx="94" cy="162" r="2.5" fill={emblemColor} />

          {/* Front Left Wheel */}
          <circle cx="62" cy="177" r="7.5" fill={emblemColor} />
          <circle cx="62" cy="177" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.5" />

          {/* Front Right Wheel */}
          <ellipse cx="88" cy="177" rx="7" ry="7.5" fill={emblemColor} />
          <ellipse cx="88" cy="177" rx="3" ry="3.5" fill="none" stroke="currentColor" strokeWidth="1.5" />

          {/* Trailer Dual Wheels (Center & Rear) */}
          <ellipse cx="110" cy="176" rx="6.5" ry="7" fill={emblemColor} />
          <ellipse cx="110" cy="176" rx="2.5" ry="3" fill="none" stroke="currentColor" strokeWidth="1.5" />

          <ellipse cx="126" cy="175" rx="6.5" ry="7" fill={emblemColor} />
          <ellipse cx="126" cy="175" rx="2.5" ry="3" fill="none" stroke="currentColor" strokeWidth="1.5" />

          <ellipse cx="140" cy="174" rx="6" ry="6.5" fill={emblemColor} />
          <ellipse cx="140" cy="174" rx="2" ry="2.5" fill="none" stroke="currentColor" strokeWidth="1.5" />

          {/* Ground Platform Baseline */}
          <path
            d="M 40 184 L 175 184"
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
