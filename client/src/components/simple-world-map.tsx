import { useEffect, useRef } from 'react';
import { IssPosition } from '@/types/space';

interface SimpleWorldMapProps {
  position: IssPosition | undefined;
  userLocation?: { latitude: number; longitude: number };
  className?: string;
}

export function SimpleWorldMap({ position, userLocation, className = "" }: SimpleWorldMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const width = canvas.width = canvas.offsetWidth * 2;
    const height = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);

    const drawWidth = width / 2;
    const drawHeight = height / 2;

    // Clear canvas with dark space background
    ctx.fillStyle = '#0f1419';
    ctx.fillRect(0, 0, drawWidth, drawHeight);

    // Draw world map outline (simplified continents)
    ctx.strokeStyle = '#2a3441';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#1a2332';

    // Draw simplified world map shapes
    drawContinents(ctx, drawWidth, drawHeight);

    // Draw grid lines
    ctx.strokeStyle = '#1a2332';
    ctx.lineWidth = 0.5;
    drawGrid(ctx, drawWidth, drawHeight);

    // Convert coordinates to canvas position
    const latToY = (lat: number) => ((90 - lat) / 180) * drawHeight;
    const lonToX = (lon: number) => ((lon + 180) / 360) * drawWidth;

    // Draw ISS position
    if (position) {
      const x = lonToX(position.longitude);
      const y = latToY(position.latitude);

      // Draw ISS orbit trail (simplified circle)
      ctx.strokeStyle = '#00d4ff40';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(drawWidth / 2, y, drawWidth * 0.45, 0, Math.PI * 2);
      ctx.stroke();

      // Draw ISS marker
      ctx.fillStyle = '#00d4ff';
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();

      // Draw ISS glow
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 20);
      gradient.addColorStop(0, '#00d4ff80');
      gradient.addColorStop(1, '#00d4ff00');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fill();

      // Draw ISS icon (satellite shape)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x - 6, y - 2, 12, 4);
      ctx.fillRect(x - 2, y - 6, 4, 12);
    }

    // Draw user location
    if (userLocation) {
      const x = lonToX(userLocation.longitude);
      const y = latToY(userLocation.latitude);

      ctx.fillStyle = '#ff6b6b';
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();

      // Draw user location glow
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 15);
      gradient.addColorStop(0, '#ff6b6b80');
      gradient.addColorStop(1, '#ff6b6b00');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, Math.PI * 2);
      ctx.fill();
    }

  }, [position, userLocation]);

  return (
    <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ width: '100%', height: '300px' }}
      />
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-black/50 rounded-lg p-3 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
          <span className="text-cyan-400">ISS Position</span>
        </div>
        {userLocation && (
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <span className="text-red-400">Your Location</span>
          </div>
        )}
      </div>
    </div>
  );
}

function drawContinents(ctx: CanvasRenderingContext2D, width: number, height: number) {
  // Simplified continent shapes
  ctx.beginPath();
  
  // North America
  ctx.moveTo(width * 0.15, height * 0.2);
  ctx.lineTo(width * 0.25, height * 0.15);
  ctx.lineTo(width * 0.35, height * 0.25);
  ctx.lineTo(width * 0.3, height * 0.45);
  ctx.lineTo(width * 0.2, height * 0.5);
  ctx.closePath();
  
  // South America
  ctx.moveTo(width * 0.25, height * 0.5);
  ctx.lineTo(width * 0.3, height * 0.52);
  ctx.lineTo(width * 0.28, height * 0.75);
  ctx.lineTo(width * 0.22, height * 0.78);
  ctx.lineTo(width * 0.2, height * 0.6);
  ctx.closePath();
  
  // Europe
  ctx.moveTo(width * 0.45, height * 0.2);
  ctx.lineTo(width * 0.55, height * 0.18);
  ctx.lineTo(width * 0.52, height * 0.3);
  ctx.lineTo(width * 0.48, height * 0.32);
  ctx.closePath();
  
  // Africa
  ctx.moveTo(width * 0.48, height * 0.32);
  ctx.lineTo(width * 0.55, height * 0.35);
  ctx.lineTo(width * 0.52, height * 0.65);
  ctx.lineTo(width * 0.45, height * 0.7);
  ctx.lineTo(width * 0.42, height * 0.45);
  ctx.closePath();
  
  // Asia
  ctx.moveTo(width * 0.55, height * 0.15);
  ctx.lineTo(width * 0.85, height * 0.2);
  ctx.lineTo(width * 0.8, height * 0.45);
  ctx.lineTo(width * 0.6, height * 0.4);
  ctx.closePath();
  
  // Australia
  ctx.moveTo(width * 0.75, height * 0.6);
  ctx.lineTo(width * 0.85, height * 0.58);
  ctx.lineTo(width * 0.82, height * 0.68);
  ctx.lineTo(width * 0.72, height * 0.65);
  ctx.closePath();
  
  ctx.fill();
  ctx.stroke();
}

function drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.beginPath();
  
  // Latitude lines
  for (let i = 1; i < 6; i++) {
    const y = (height / 6) * i;
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }
  
  // Longitude lines
  for (let i = 1; i < 8; i++) {
    const x = (width / 8) * i;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }
  
  ctx.stroke();
}