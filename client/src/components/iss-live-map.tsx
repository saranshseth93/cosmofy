import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Satellite, MapPin } from 'lucide-react';
import { IssPosition } from '@/types/space';

interface ISSLiveMapProps {
  position: IssPosition | undefined;
  userLocation?: { latitude: number; longitude: number };
  className?: string;
}

export function ISSLiveMap({ position, userLocation, className = "" }: ISSLiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const issMarkerRef = useRef<L.Marker | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const orbitPathRef = useRef<L.Polyline | null>(null);
  const [orbitHistory, setOrbitHistory] = useState<{ lat: number; lng: number }[]>([]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current, {
      center: [0, 0],
      zoom: 2,
      zoomControl: false,
      attributionControl: false,
    });

    // Add dark tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    // Add zoom control in bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Create custom ISS icon
    const issIcon = L.divIcon({
      html: `
        <div style="
          width: 32px; 
          height: 32px; 
          background: linear-gradient(135deg, #00ff88, #00ccff);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 20px rgba(0, 255, 136, 0.6);
          border: 2px solid rgba(255, 255, 255, 0.3);
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M4.5 16.5c-1.5 1.5-1.5 3.5 0 5s3.5 1.5 5 0l7-7c1.5-1.5 1.5-3.5 0-5s-3.5-1.5-5 0l-7 7z"/>
            <path d="M13.5 10.5L10.5 7.5"/>
            <path d="M16 3l5 5"/>
            <path d="M3 16l5 5"/>
          </svg>
        </div>
      `,
      className: 'iss-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    // Create user location icon
    const userIcon = L.divIcon({
      html: `
        <div style="
          width: 20px; 
          height: 20px; 
          background: linear-gradient(135deg, #ff6b6b, #ee5a24);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 15px rgba(255, 107, 107, 0.6);
          border: 2px solid white;
        ">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
      `,
      className: 'user-marker',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    mapInstanceRef.current = map;

    // Add ISS marker
    if (position) {
      const issMarker = L.marker([position.latitude, position.longitude], { icon: issIcon })
        .addTo(map)
        .bindPopup(`
          <div style="color: #333; font-weight: bold;">
            <div style="color: #00ff88; font-size: 14px; margin-bottom: 8px;">🛰️ International Space Station</div>
            <div><strong>Position:</strong> ${position.latitude.toFixed(4)}°, ${position.longitude.toFixed(4)}°</div>
            <div><strong>Altitude:</strong> ${position.altitude || 408} km</div>
            <div><strong>Velocity:</strong> ${position.velocity || 27600} km/h</div>
          </div>
        `, { closeButton: false });
      
      issMarkerRef.current = issMarker;
      map.setView([position.latitude, position.longitude], 3);
    }

    // Add user location marker
    if (userLocation) {
      const userMarker = L.marker([userLocation.latitude, userLocation.longitude], { icon: userIcon })
        .addTo(map)
        .bindPopup(`
          <div style="color: #333; font-weight: bold;">
            <div style="color: #ff6b6b; font-size: 14px; margin-bottom: 8px;">📍 Your Location</div>
            <div>${userLocation.latitude.toFixed(4)}°, ${userLocation.longitude.toFixed(4)}°</div>
          </div>
        `, { closeButton: false });
      
      userMarkerRef.current = userMarker;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update ISS position
  useEffect(() => {
    if (!mapInstanceRef.current || !position) return;

    const map = mapInstanceRef.current;

    // Update ISS marker position
    if (issMarkerRef.current) {
      issMarkerRef.current.setLatLng([position.latitude, position.longitude]);
      
      // Update popup content
      issMarkerRef.current.setPopupContent(`
        <div style="color: #333; font-weight: bold;">
          <div style="color: #00ff88; font-size: 14px; margin-bottom: 8px;">🛰️ International Space Station</div>
          <div><strong>Position:</strong> ${position.latitude.toFixed(4)}°, ${position.longitude.toFixed(4)}°</div>
          <div><strong>Altitude:</strong> ${position.altitude || 408} km</div>
          <div><strong>Velocity:</strong> ${position.velocity || 27600} km/h</div>
          <div style="color: #666; font-size: 12px; margin-top: 4px;">Last updated: ${new Date().toLocaleTimeString()}</div>
        </div>
      `);
    }

    // Add to orbit history
    const newPoint = { lat: position.latitude, lng: position.longitude };
    setOrbitHistory(prev => {
      const updated = [...prev, newPoint];
      // Keep only last 50 points for performance
      return updated.slice(-50);
    });

    // Center map on ISS if no user location
    if (!userLocation) {
      map.setView([position.latitude, position.longitude], map.getZoom());
    }
  }, [position, userLocation]);

  // Update orbit path separately to avoid infinite loop
  useEffect(() => {
    if (!mapInstanceRef.current || orbitHistory.length <= 1) return;

    const map = mapInstanceRef.current;
    
    if (orbitPathRef.current) {
      map.removeLayer(orbitPathRef.current);
    }
    
    const orbitPath = L.polyline(orbitHistory, {
      color: '#00ff88',
      weight: 2,
      opacity: 0.6,
      dashArray: '5, 5'
    }).addTo(map);
    
    orbitPathRef.current = orbitPath;
  }, [orbitHistory]);

  // Update user location
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation) return;

    const map = mapInstanceRef.current;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLocation.latitude, userLocation.longitude]);
    } else {
      const userIcon = L.divIcon({
        html: `
          <div style="
            width: 20px; 
            height: 20px; 
            background: linear-gradient(135deg, #ff6b6b, #ee5a24);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 15px rgba(255, 107, 107, 0.6);
            border: 2px solid white;
          ">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        `,
        className: 'user-marker',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const userMarker = L.marker([userLocation.latitude, userLocation.longitude], { icon: userIcon })
        .addTo(map)
        .bindPopup(`
          <div style="color: #333; font-weight: bold;">
            <div style="color: #ff6b6b; font-size: 14px; margin-bottom: 8px;">📍 Your Location</div>
            <div>${userLocation.latitude.toFixed(4)}°, ${userLocation.longitude.toFixed(4)}°</div>
          </div>
        `, { closeButton: false });
      
      userMarkerRef.current = userMarker;
    }

    // If both ISS and user location exist, fit bounds to show both
    if (position && issMarkerRef.current) {
      const group = L.featureGroup([issMarkerRef.current, userMarkerRef.current]);
      map.fitBounds(group.getBounds(), { padding: [50, 50] });
    }
  }, [userLocation, position]);

  return (
    <div className={`relative ${className}`}>
      <div ref={mapRef} className="w-full h-full rounded-lg overflow-hidden" />
      
      {/* Map Legend */}
      <div className="absolute top-4 left-4 bg-gray-900/90 backdrop-blur-sm border border-gray-700/50 rounded-lg p-3 text-sm">
        <div className="flex items-center mb-2">
          <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-cyan-400 rounded-full mr-2"></div>
          <span className="text-white">ISS Current Position</span>
        </div>
        {userLocation && (
          <div className="flex items-center mb-2">
            <div className="w-3 h-3 bg-gradient-to-r from-red-400 to-orange-400 rounded-full mr-2"></div>
            <span className="text-white">Your Location</span>
          </div>
        )}
        <div className="flex items-center">
          <div className="w-4 h-0.5 bg-green-400 mr-2 opacity-60" style={{ borderTop: '2px dashed' }}></div>
          <span className="text-gray-300">Orbit Path</span>
        </div>
      </div>

      {/* Real-time Status */}
      <div className="absolute top-4 right-4 bg-gray-900/90 backdrop-blur-sm border border-gray-700/50 rounded-lg p-3">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
          <span className="text-green-400 text-sm font-semibold">LIVE TRACKING</span>
        </div>
      </div>
    </div>
  );
}