import { IssPosition } from '@/types/space';

interface SVGWorldMapProps {
  position: IssPosition | undefined;
  userLocation?: { latitude: number; longitude: number };
  className?: string;
}

export function SVGWorldMap({ position, userLocation, className = "" }: SVGWorldMapProps) {
  // Convert lat/lng to SVG coordinates (simplified projection)
  const latToY = (lat: number) => (90 - lat) * 2;
  const lonToX = (lon: number) => (lon + 180) * 2;

  const issX = position ? lonToX(position.longitude) : 0;
  const issY = position ? latToY(position.latitude) : 0;

  const userX = userLocation ? lonToX(userLocation.longitude) : 0;
  const userY = userLocation ? latToY(userLocation.latitude) : 0;

  return (
    <div className={`relative w-full h-full bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      <svg
        viewBox="0 0 720 360"
        className="w-full h-full"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
      >
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="60" height="30" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 30" fill="none" stroke="#374151" strokeWidth="0.5" opacity="0.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* World continents (simplified shapes) */}
        <g fill="#1f2937" stroke="#4b5563" strokeWidth="1">
          {/* North America */}
          <path d="M 50 60 L 120 50 L 160 70 L 180 120 L 140 140 L 100 130 L 80 100 Z" />
          
          {/* South America */}
          <path d="M 140 140 L 160 140 L 170 200 L 155 240 L 130 230 L 125 180 Z" />
          
          {/* Europe */}
          <path d="M 350 50 L 400 45 L 420 70 L 390 85 L 360 80 Z" />
          
          {/* Africa */}
          <path d="M 380 85 L 420 90 L 440 130 L 430 200 L 400 210 L 370 180 L 365 120 Z" />
          
          {/* Asia */}
          <path d="M 420 45 L 550 50 L 580 80 L 560 120 L 480 110 L 450 70 Z" />
          
          {/* Australia */}
          <path d="M 520 200 L 580 195 L 590 220 L 570 235 L 530 230 Z" />
          
          {/* Greenland */}
          <path d="M 250 20 L 290 15 L 310 40 L 280 50 L 260 45 Z" />
        </g>

        {/* ISS orbital path */}
        {position && (
          <circle
            cx="360"
            cy="180"
            r="250"
            fill="none"
            stroke="#22d3ee"
            strokeWidth="2"
            strokeDasharray="8,4"
            opacity="0.6"
          />
        )}

        {/* ISS position */}
        {position && (
          <g>
            {/* ISS glow */}
            <circle
              cx={issX}
              cy={issY}
              r="20"
              fill="url(#issGlow)"
              opacity="0.8"
            />
            
            {/* ISS marker */}
            <circle
              cx={issX}
              cy={issY}
              r="8"
              fill="#22d3ee"
              stroke="#ffffff"
              strokeWidth="2"
            />
            
            {/* ISS satellite arms */}
            <g stroke="#ffffff" strokeWidth="2" strokeLinecap="round">
              <line x1={issX - 12} y1={issY} x2={issX + 12} y2={issY} />
              <line x1={issX} y1={issY - 12} x2={issX} y2={issY + 12} />
            </g>
          </g>
        )}

        {/* User location */}
        {userLocation && (
          <g>
            {/* User location glow */}
            <circle
              cx={userX}
              cy={userY}
              r="15"
              fill="url(#userGlow)"
              opacity="0.8"
            />
            
            {/* User marker */}
            <circle
              cx={userX}
              cy={userY}
              r="6"
              fill="#ef4444"
              stroke="#ffffff"
              strokeWidth="2"
            />
          </g>
        )}

        {/* Gradient definitions */}
        <defs>
          <radialGradient id="issGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#0891b2" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0891b2" stopOpacity="0" />
          </radialGradient>
          
          <radialGradient id="userGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#dc2626" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>

      {/* Legend overlay */}
      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg p-3 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50"></div>
          <span className="text-cyan-400 font-medium">ISS Position</span>
        </div>
        {userLocation && (
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 bg-red-400 rounded-full shadow-lg shadow-red-400/50"></div>
            <span className="text-red-400 font-medium">Your Location</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm">
          <div className="w-8 h-1 border border-cyan-400 border-dashed"></div>
          <span className="text-gray-300 text-xs">Orbital Path</span>
        </div>
      </div>

      {/* Position info overlay */}
      {position && (
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg p-3">
          <div className="text-xs text-gray-400 mb-1">Live Position</div>
          <div className="text-sm font-mono text-white">
            {position.latitude.toFixed(3)}°, {position.longitude.toFixed(3)}°
          </div>
          <div className="text-xs text-cyan-400 mt-1">
            Alt: {position.altitude || '408'} km
          </div>
        </div>
      )}
    </div>
  );
}