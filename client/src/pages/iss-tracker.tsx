import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigation } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SatelliteOrbit } from '@/components/lottie-loader';
import { useGeolocation } from '@/hooks/use-geolocation';
import { Satellite, MapPin, Clock, Users, Globe, RefreshCw, Zap } from 'lucide-react';
import { IssPosition, IssPass, IssCrew } from '@/types/space';

export default function ISSTracker() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { coordinates, error: geoError, loading: geoLoading } = useGeolocation();

  useEffect(() => {
    document.title = "ISS Live Tracker - Cosmofy | International Space Station Real-time Position";
  }, []);

  // ISS Position Query
  const { data: position, isLoading: positionLoading, refetch: refetchPosition } = useQuery<IssPosition>({
    queryKey: ['/api/iss/position'],
    queryFn: async () => {
      const response = await fetch('/api/iss/position');
      if (!response.ok) throw new Error('Failed to fetch ISS position');
      return response.json();
    },
    refetchInterval: autoRefresh ? 10000 : false,
  });

  // ISS Passes Query
  const { data: passes, isLoading: passesLoading } = useQuery<IssPass[]>({
    queryKey: ['/api/iss/passes', coordinates?.latitude, coordinates?.longitude],
    queryFn: async () => {
      if (!coordinates) return [];
      const response = await fetch(`/api/iss/passes?lat=${coordinates.latitude}&lon=${coordinates.longitude}`);
      if (!response.ok) throw new Error('Failed to fetch ISS passes');
      return response.json();
    },
    enabled: !!coordinates,
  });

  // ISS Crew Query
  const { data: crew, isLoading: crewLoading } = useQuery<IssCrew[]>({
    queryKey: ['/api/iss/crew'],
    queryFn: async () => {
      const response = await fetch('/api/iss/crew');
      if (!response.ok) throw new Error('Failed to fetch ISS crew');
      return response.json();
    },
  });

  // Get approximate location from coordinates
  const getApproximateLocation = (lat: number, lon: number) => {
    // This is a simplified approximation - in production you'd use a reverse geocoding API
    const cities = [
      { name: "London, UK", lat: 51.5074, lon: -0.1278 },
      { name: "New York, USA", lat: 40.7128, lon: -74.0060 },
      { name: "Tokyo, Japan", lat: 35.6762, lon: 139.6503 },
      { name: "Sydney, Australia", lat: -33.8688, lon: 151.2093 },
      { name: "Moscow, Russia", lat: 55.7558, lon: 37.6173 },
      { name: "Beijing, China", lat: 39.9042, lon: 116.4074 },
      { name: "Mumbai, India", lat: 19.0760, lon: 72.8777 },
      { name: "São Paulo, Brazil", lat: -23.5505, lon: -46.6333 },
      { name: "Cairo, Egypt", lat: 30.0444, lon: 31.2357 },
      { name: "Los Angeles, USA", lat: 34.0522, lon: -118.2437 },
    ];

    let closest = cities[0];
    let minDistance = Math.sqrt(Math.pow(lat - cities[0].lat, 2) + Math.pow(lon - cities[0].lon, 2));

    cities.forEach(city => {
      const distance = Math.sqrt(Math.pow(lat - city.lat, 2) + Math.pow(lon - city.lon, 2));
      if (distance < minDistance) {
        minDistance = distance;
        closest = city;
      }
    });

    return `Near ${closest.name}`;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getCrewInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(222,47%,8%)] via-[hsl(217,91%,29%)] to-[hsl(222,47%,8%)]">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="stars" />
          <div className="twinkling" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-gradient-to-r from-green-600/20 to-cyan-600/20 border border-green-500/30 text-green-300">
              Live Tracking
            </Badge>
            
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-green-200 to-cyan-300 bg-clip-text text-transparent leading-tight">
              ISS Live Tracker
            </h1>
            
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              Track the International Space Station in real-time, view crew information, and predict when it will pass over your location.
            </p>

            {/* Auto Refresh Toggle */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`glass-morphism border-white/20 transition-all duration-300 ${
                  autoRefresh ? 'text-green-400 border-green-400/50' : 'text-white hover:bg-white/10'
                }`}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                Auto Refresh: {autoRefresh ? 'ON' : 'OFF'}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => refetchPosition()}
                className="glass-morphism border-white/20 text-white hover:bg-white/10"
              >
                <Zap className="mr-2 h-4 w-4" />
                Refresh Now
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Live Position Section */}
      <section className="pb-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* Live Position Card */}
            <Card className="glass-morphism">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <Satellite className="text-green-400 mr-3 h-8 w-8" />
                    Live Position
                  </h2>
                  <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/50">
                    LIVE
                  </Badge>
                </div>

                <div className="relative bg-gradient-to-br from-blue-900/50 to-purple-900/50 rounded-xl overflow-hidden mb-6 h-64">
                  <div className="absolute inset-0 bg-gradient-to-t from-[hsl(222,47%,8%)] via-transparent to-transparent" />
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <SatelliteOrbit size={100} />
                  </div>
                  
                  {position && (
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="glass-morphism p-4 rounded-lg">
                        <div className="text-sm text-gray-300 mb-1">Current Location</div>
                        <div className="text-lg font-semibold text-green-400">
                          {position.latitude.toFixed(4)}°, {position.longitude.toFixed(4)}°
                        </div>
                        <div className="text-sm text-gray-400 mt-1">
                          {getApproximateLocation(position.latitude, position.longitude)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {positionLoading ? (
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-700/50 rounded animate-pulse" />
                    <div className="h-4 bg-gray-700/50 rounded w-2/3 animate-pulse" />
                  </div>
                ) : position ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                      <div className="text-2xl font-bold text-green-400">{position.altitude?.toFixed(0) || '408'} km</div>
                      <div className="text-sm text-gray-400">Altitude</div>
                    </div>
                    <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                      <div className="text-2xl font-bold text-cyan-400">{position.velocity?.toFixed(0) || '27,600'} km/h</div>
                      <div className="text-sm text-gray-400">Velocity</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-400">
                    Unable to load position data
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Next Passes Card */}
            <Card className="glass-morphism">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <MapPin className="text-purple-400 mr-3 h-8 w-8" />
                  Next Visible Passes
                </h2>

                {geoError ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">Location access required for pass predictions</div>
                    <Button
                      onClick={() => window.location.reload()}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      Enable Location
                    </Button>
                  </div>
                ) : geoLoading || passesLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="p-4 bg-gray-800/30 rounded-lg">
                        <div className="h-4 bg-gray-700/50 rounded mb-2 animate-pulse" />
                        <div className="h-3 bg-gray-700/50 rounded w-1/2 animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : passes && passes.length > 0 ? (
                  <div className="space-y-4">
                    {passes.slice(0, 5).map((pass, index) => (
                      <div key={pass.id} className="p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs border-purple-500/50 text-purple-300">
                            Pass #{index + 1}
                          </Badge>
                          <div className="text-sm text-cyan-400 font-medium">
                            {formatDuration(pass.duration)}
                          </div>
                        </div>
                        <div className="text-sm text-gray-300">
                          {new Date(pass.risetime).toLocaleDateString()} at{' '}
                          {new Date(pass.risetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        {pass.maxElevation && (
                          <div className="text-xs text-gray-400 mt-1">
                            Max elevation: {pass.maxElevation}°
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    No upcoming passes found
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Current ISS Crew */}
          <Card className="glass-morphism">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Users className="text-orange-400 mr-3 h-8 w-8" />
                Current ISS Crew
              </h2>

              {crewLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="p-6 bg-gray-800/30 rounded-lg">
                      <div className="w-16 h-16 bg-gray-700/50 rounded-full mx-auto mb-4 animate-pulse" />
                      <div className="h-4 bg-gray-700/50 rounded mb-2 animate-pulse" />
                      <div className="h-3 bg-gray-700/50 rounded w-2/3 mx-auto animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : crew && crew.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {crew.map((member) => (
                    <div key={member.id} className="text-center group">
                      <div className="relative mb-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full mx-auto flex items-center justify-center text-white font-bold text-xl shadow-lg">
                          {getCrewInitials(member.name)}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        </div>
                      </div>
                      
                      <h3 className="font-semibold text-lg text-white mb-1 group-hover:text-orange-300 transition-colors">
                        {member.name}
                      </h3>
                      
                      <Badge className="mb-2 bg-orange-500/20 text-orange-300 border-orange-500/50">
                        {member.role || 'Crew Member'}
                      </Badge>
                      
                      <div className="text-sm text-gray-400 space-y-1">
                        <div className="flex items-center justify-center">
                          <Globe className="h-3 w-3 mr-1" />
                          {member.country || 'International'}
                        </div>
                        {member.daysInSpace && (
                          <div className="flex items-center justify-center">
                            <Clock className="h-3 w-3 mr-1" />
                            Day {member.daysInSpace} in space
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  Unable to load crew information
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}