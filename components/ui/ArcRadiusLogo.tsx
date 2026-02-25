import React from 'react';
import { MapPin } from 'lucide-react'; // Assuming this is your icon source

const ArcRadiusLogo = ({ size = 36, className = '' }: { size?: number; className?: string }) => (
  <div className={`relative ${className}`} style={{ width: size, height: size }}>
    {/* Rainbow ring background */}
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0">
      <defs>
        <filter id="topological-warp-large" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" result="noise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="7"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
      <g filter="url(#topological-warp-large)" strokeWidth="6" strokeLinecap="round" fill="none">
        <circle
          cx="50"
          cy="50"
          r="46"
          stroke="#E40303"
          strokeDasharray="48 240"
          strokeDashoffset="0"
        />
        <circle
          cx="50"
          cy="50"
          r="46"
          stroke="#FF8C00"
          strokeDasharray="48 240"
          strokeDashoffset="-48"
        />
        <circle
          cx="50"
          cy="50"
          r="46"
          stroke="#FFED00"
          strokeDasharray="48 240"
          strokeDashoffset="-96"
        />
        <circle
          cx="50"
          cy="50"
          r="46"
          stroke="#008026"
          strokeDasharray="48 240"
          strokeDashoffset="-144"
        />
        <circle
          cx="50"
          cy="50"
          r="46"
          stroke="#24408E"
          strokeDasharray="48 240"
          strokeDashoffset="-192"
        />
        <circle
          cx="50"
          cy="50"
          r="46"
          stroke="#732982"
          strokeDasharray="48 240"
          strokeDashoffset="-240"
        />
      </g>
    </svg>
    {/* Lucide MapPin (pindrop) icon with circle */}
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative">
        <MapPin
          size={size * 0.5}
          className="text-slate-800"
          strokeWidth={2.5}
          fill="currentColor"
        />
        {/* Circle in the middle of the pin */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-slate-800 bg-white"
          style={{
            width: `${size * 0.25}px`,
            height: `${size * 0.25}px`,
            marginTop: `-${size * 0.05}px`,
          }}
        />
      </div>
    </div>
  </div>
);

export default ArcRadiusLogo;
