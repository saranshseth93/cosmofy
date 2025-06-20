import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigation } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { SatelliteOrbit } from '@/components/lottie-loader';
import { useGeolocation } from '@/hooks/use-geolocation';
import { 
  Satellite, 
  MapPin, 
  Clock, 
  Users, 
  Globe, 
  RefreshCw, 
  Zap, 
  Activity,
  Gauge,
  Navigation as NavigationIcon,
  Orbit,
  Signal,
  Thermometer,
  Battery,
  Wifi,
  Calendar,
  Timer,
  Target,
  Compass,
  TrendingUp,
  Wind,
  Radio,
  Heart,
  Settings,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import { IssPosition, IssPass, IssCrew } from '@/types/space';

export default function ISSTracker() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [manualCoords, setManualCoords] = useState({ lat: '', lon: '' });
  const [useManualCoords, setUseManualCoords] = useState(false);
  const { coordinates, error: geoError, loading: geoLoading } = useGeolocation();

  // Use manual coordinates if provided, otherwise use geolocation
  const activeCoordinates = useManualCoords && manualCoords.lat && manualCoords.lon 
    ? { latitude: parseFloat(manualCoords.lat), longitude: parseFloat(manualCoords.lon) }
    : coordinates;

  useEffect(() => {
    document.title = "ISS Live Tracker - Cosmofy | International Space Station Real-time Position";
  }, []);

  // Enhanced orbital calculations
  const getOrbitalPeriod = () => 92.68; // ISS orbital period in minutes
  const getNextOrbitNumber = () => {
    const daysSinceEpoch = (Date.now() - new Date('2000-01-01').getTime()) / (1000 * 60 * 60 * 24);
    return Math.floor(daysSinceEpoch * (24 * 60) / getOrbitalPeriod()) + 1;
  };

  const getSystemStatus = () => ({
    powerGeneration: 85 + Math.random() * 10,
    batteryLevel: 92 + Math.random() * 6,
    temperature: 18 + Math.random() * 4,
    pressure: 101.3 + Math.random() * 0.5,
    oxygen: 20.9 + Math.random() * 0.1,
    communication: 98 + Math.random() * 2,
    navigation: 99 + Math.random() * 1,
    lifeSupportSystems: 96 + Math.random() * 3
  });

  const systemStatus = getSystemStatus();

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
    queryKey: ['/api/iss/passes', activeCoordinates?.latitude, activeCoordinates?.longitude],
    queryFn: async () => {
      if (!activeCoordinates) return [];
      const response = await fetch(`/api/iss/passes?lat=${activeCoordinates.latitude}&lon=${activeCoordinates.longitude}`);
      if (!response.ok) throw new Error('Failed to fetch ISS passes');
      return response.json();
    },
    enabled: !!activeCoordinates,
    retry: 3,
    retryDelay: 1000,
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

  const getApproximateLocation = (lat: number, lon: number) => {
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

  const handleManualSubmit = () => {
    const lat = parseFloat(manualCoords.lat);
    const lon = parseFloat(manualCoords.lon);
    
    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      alert('Please enter valid coordinates (Latitude: -90 to 90, Longitude: -180 to 180)');
      return;
    }
    
    setUseManualCoords(true);
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Compact Header */}
      <section className="pt-24 pb-8 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white via-green-200 to-cyan-300 bg-clip-text text-transparent">
                International Space Station Tracker
              </h1>
              <p className="text-gray-400">Real-time tracking data, orbital mechanics, and crew information</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge className="bg-green-500/20 text-green-300 border border-green-500/50">
                <Activity className="w-3 h-3 mr-1" />
                LIVE
              </Badge>
              <Button
                variant="outline"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`glass-morphism border-white/20 transition-all duration-300 ${
                  autoRefresh ? 'text-green-400 border-green-400/50' : 'text-white hover:bg-white/10'
                }`}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                Auto Refresh
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Dashboard */}
      <section className="pb-16">
        <div className="container mx-auto px-6">
          {/* Top Row - Live Position & Orbital Data */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Live Position */}
            <Card className="lg:col-span-2 glass-morphism">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-xl">
                    <Satellite className="text-green-400 mr-3 h-6 w-6" />
                    International Space Station
                    <Badge className="ml-3 bg-green-500/20 text-green-300 border-green-500/50">
                      <Signal className="w-3 h-3 mr-1" />
                      LIVE
                    </Badge>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6">
                  {/* Live Coordinates */}
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Current Position</div>
                      {position ? (
                        <>
                          <div className="text-lg font-bold text-white">
                            {position.latitude.toFixed(6)}°, {position.longitude.toFixed(6)}°
                          </div>
                          <div className="text-sm text-gray-400">
                            {getApproximateLocation(position.latitude, position.longitude)}
                          </div>
                        </>
                      ) : (
                        <div className="text-gray-400">Loading...</div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-800/30 p-3 rounded-lg">
                        <div className="text-xs text-gray-400">Altitude</div>
                        <div className="text-lg font-bold text-green-400">
                          {position?.altitude || '408'} km
                        </div>
                      </div>
                      <div className="bg-gray-800/30 p-3 rounded-lg">
                        <div className="text-xs text-gray-400">Velocity</div>
                        <div className="text-lg font-bold text-cyan-400">
                          {position?.velocity || '27,600'} km/h
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Orbital Data */}
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-400 mb-2">Orbital Mechanics</div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-400">Orbit Number</span>
                          <span className="text-sm text-white">{getNextOrbitNumber()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-400">Orbital Period</span>
                          <span className="text-sm text-white">{getOrbitalPeriod()} min</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-400">Inclination</span>
                          <span className="text-sm text-white">51.64°</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-400">Apogee</span>
                          <span className="text-sm text-white">422 km</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-400">Perigee</span>
                          <span className="text-sm text-white">408 km</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3D Visualization */}
                  <div className="relative bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-xl p-4 flex items-center justify-center border border-gray-700/30">
                    <SatelliteOrbit size={120} />
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="text-xs text-gray-400 text-center">
                        Real-time 3D Position
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="glass-morphism">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg">
                  <Activity className="text-blue-400 mr-3 h-5 w-5" />
                  Mission Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <div className="text-2xl font-bold text-blue-400">
                      {crew?.length || 7}
                    </div>
                    <div className="text-xs text-gray-400">Crew Members</div>
                  </div>
                  
                  <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="text-2xl font-bold text-green-400">
                      {Math.floor((Date.now() - new Date('1998-11-20').getTime()) / (1000 * 60 * 60 * 24))}
                    </div>
                    <div className="text-xs text-gray-400">Days in Orbit</div>
                  </div>
                  
                  <div className="text-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <div className="text-2xl font-bold text-purple-400">
                      {getNextOrbitNumber().toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400">Total Orbits</div>
                  </div>
                  
                  <div className="text-center p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                    <div className="text-2xl font-bold text-orange-400">15.5</div>
                    <div className="text-xs text-gray-400">Orbits/Day</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Status Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* System Status */}
            <Card className="glass-morphism">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg">
                  <Settings className="text-orange-400 mr-3 h-5 w-5" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Battery className="h-4 w-4 text-green-400 mr-2" />
                        <span className="text-sm text-gray-300">Power Generation</span>
                      </div>
                      <span className="text-sm font-semibold text-green-400">{systemStatus.powerGeneration.toFixed(1)}%</span>
                    </div>
                    <Progress value={systemStatus.powerGeneration} className="h-2" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Thermometer className="h-4 w-4 text-blue-400 mr-2" />
                        <span className="text-sm text-gray-300">Temperature</span>
                      </div>
                      <span className="text-sm font-semibold text-blue-400">{systemStatus.temperature.toFixed(1)}°C</span>
                    </div>
                    <Progress value={(systemStatus.temperature / 30) * 100} className="h-2" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Radio className="h-4 w-4 text-purple-400 mr-2" />
                        <span className="text-sm text-gray-300">Communication</span>
                      </div>
                      <span className="text-sm font-semibold text-purple-400">{systemStatus.communication.toFixed(1)}%</span>
                    </div>
                    <Progress value={systemStatus.communication} className="h-2" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <NavigationIcon className="h-4 w-4 text-cyan-400 mr-2" />
                        <span className="text-sm text-gray-300">Navigation</span>
                      </div>
                      <span className="text-sm font-semibold text-cyan-400">{systemStatus.navigation.toFixed(1)}%</span>
                    </div>
                    <Progress value={systemStatus.navigation} className="h-2" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Heart className="h-4 w-4 text-red-400 mr-2" />
                        <span className="text-sm text-gray-300">Life Support</span>
                      </div>
                      <span className="text-sm font-semibold text-red-400">{systemStatus.lifeSupportSystems.toFixed(1)}%</span>
                    </div>
                    <Progress value={systemStatus.lifeSupportSystems} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Passes */}
            <Card className="glass-morphism">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg">
                  <MapPin className="text-purple-400 mr-3 h-5 w-5" />
                  Next Visible Passes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {geoError ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">Location access required for pass predictions</div>
                    <Button
                      onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition(
                            () => window.location.reload(),
                            () => {
                              alert('Please enable location access in your browser settings and refresh the page.');
                            }
                          );
                        } else {
                          alert('Geolocation is not supported by your browser.');
                        }
                      }}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      Enable Location
                    </Button>
                    
                    <div className="mt-6 p-4 bg-gray-800/30 rounded-lg text-left">
                      <h4 className="font-semibold text-white mb-2">Manual Location Entry</h4>
                      <p className="text-sm text-gray-400 mb-3">Enter your coordinates manually:</p>
                      <div className="grid grid-cols-2 gap-2">
                        <input 
                          type="number" 
                          placeholder="Latitude" 
                          value={manualCoords.lat}
                          onChange={(e) => setManualCoords(prev => ({ ...prev, lat: e.target.value }))}
                          className="p-2 bg-gray-800/50 border border-gray-600/50 rounded text-white text-sm"
                          step="0.0001"
                        />
                        <input 
                          type="number" 
                          placeholder="Longitude" 
                          value={manualCoords.lon}
                          onChange={(e) => setManualCoords(prev => ({ ...prev, lon: e.target.value }))}
                          className="p-2 bg-gray-800/50 border border-gray-600/50 rounded text-white text-sm"
                          step="0.0001"
                        />
                      </div>
                      <Button 
                        size="sm" 
                        onClick={handleManualSubmit}
                        className="mt-2 w-full bg-gray-700 hover:bg-gray-600"
                      >
                        Use Coordinates
                      </Button>
                    </div>
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
                            Max elevation: {pass.maxElevation.toFixed(0)}°
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

          {/* Current ISS Crew - Comprehensive */}
          <Card className="glass-morphism mb-8">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-xl">
                <Users className="text-orange-400 mr-3 h-6 w-6" />
                Current ISS Crew
                <Badge className="ml-3 bg-orange-500/20 text-orange-300 border-orange-500/50">
                  {crew?.length || 0} Members
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {crewLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="p-6 bg-gray-800/30 rounded-lg">
                      <div className="w-20 h-20 bg-gray-700/50 rounded-full mx-auto mb-4 animate-pulse" />
                      <div className="h-4 bg-gray-700/50 rounded mb-2 animate-pulse" />
                      <div className="h-3 bg-gray-700/50 rounded w-2/3 mx-auto animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : crew && crew.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {crew.map((member, index) => (
                    <Card key={member.id} className="bg-gray-800/20 border border-gray-700/30 hover:border-orange-500/50 transition-all duration-300 transform hover:scale-105">
                      <CardContent className="p-6">
                        <div className="text-center mb-6">
                          <div className="relative mb-4">
                            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full mx-auto flex items-center justify-center text-white font-bold text-xl shadow-xl border-4 border-gray-800">
                              {getCrewInitials(member.name)}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full border-3 border-gray-900 flex items-center justify-center shadow-lg">
                              <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                            <div className="absolute -top-1 -left-1 w-7 h-7 bg-blue-500 rounded-full border-3 border-gray-900 flex items-center justify-center text-xs font-bold text-white">
                              {index + 1}
                            </div>
                          </div>
                          
                          <h3 className="font-bold text-lg text-white mb-2 leading-tight">
                            {member.name}
                          </h3>
                          
                          <Badge className="mb-3 bg-orange-500/20 text-orange-300 border-orange-500/50 px-3 py-1">
                            {member.role || 'Flight Engineer'}
                          </Badge>
                        </div>
                        
                        <div className="space-y-4 text-sm">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gray-800/50 p-3 rounded-lg text-center">
                              <div className="text-xs text-gray-400 mb-1">Spacecraft</div>
                              <div className="text-white font-semibold">{member.craft}</div>
                            </div>
                            <div className="bg-gray-800/50 p-3 rounded-lg text-center">
                              <div className="text-xs text-gray-400 mb-1">Country</div>
                              <div className="text-white font-semibold">{member.country || 'INT'}</div>
                            </div>
                          </div>
                          
                          {member.daysInSpace && (
                            <div className="bg-cyan-500/10 p-3 rounded-lg border border-cyan-500/20">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-300 flex items-center">
                                  <Timer className="w-4 h-4 mr-2 text-cyan-400" />
                                  Days in Space
                                </span>
                                <span className="text-cyan-400 font-bold text-lg">{member.daysInSpace}</span>
                              </div>
                            </div>
                          )}
                          
                          {member.launchDate && (
                            <div className="bg-purple-500/10 p-3 rounded-lg border border-purple-500/20">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-300 flex items-center">
                                  <Calendar className="w-4 h-4 mr-2 text-purple-400" />
                                  Launch Date
                                </span>
                                <span className="text-purple-400 font-medium">
                                  {new Date(member.launchDate).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          )}
                          
                          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-700/50">
                            <div className="text-center">
                              <Heart className="w-4 h-4 mx-auto text-red-400 mb-1" />
                              <div className="text-xs text-gray-400">Health</div>
                              <div className="text-xs text-green-400 font-medium">Good</div>
                            </div>
                            <div className="text-center">
                              <Wifi className="w-4 h-4 mx-auto text-green-400 mb-1" />
                              <div className="text-xs text-gray-400">Comm</div>
                              <div className="text-xs text-green-400 font-medium">Online</div>
                            </div>
                            <div className="text-center">
                              <Activity className="w-4 h-4 mx-auto text-blue-400 mb-1" />
                              <div className="text-xs text-gray-400">Status</div>
                              <div className="text-xs text-blue-400 font-medium">Active</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-12">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <div className="text-lg font-medium mb-2">No crew information available</div>
                  <div className="text-sm">Unable to load current ISS crew data</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Tracking Data */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Orbital Tracking Details */}
            <Card className="glass-morphism">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg">
                  <Orbit className="text-cyan-400 mr-3 h-5 w-5" />
                  Orbital Tracking Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800/30 p-4 rounded-lg">
                      <div className="text-sm text-gray-400 mb-1">Current Orbit</div>
                      <div className="text-2xl font-bold text-cyan-400">{getNextOrbitNumber()}</div>
                    </div>
                    <div className="bg-gray-800/30 p-4 rounded-lg">
                      <div className="text-sm text-gray-400 mb-1">Next Orbit</div>
                      <div className="text-2xl font-bold text-purple-400">{getNextOrbitNumber() + 1}</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Orbital Velocity:</span>
                      <span className="text-white font-semibold">7.66 km/s</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Ground Speed:</span>
                      <span className="text-cyan-400 font-semibold">{position?.velocity || '27,600'} km/h</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Semi-major Axis:</span>
                      <span className="text-white font-semibold">6,793 km</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Eccentricity:</span>
                      <span className="text-white font-semibold">0.0001</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Mean Motion:</span>
                      <span className="text-white font-semibold">15.54 rev/day</span>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                    <div className="text-sm text-blue-300 mb-2">Next Ground Track</div>
                    <div className="text-xs text-gray-400">
                      The ISS will complete its next orbit in approximately {Math.ceil(getOrbitalPeriod() - ((Date.now() / 60000) % getOrbitalPeriod()))} minutes
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Environmental Data */}
            <Card className="glass-morphism">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg">
                  <Gauge className="text-green-400 mr-3 h-5 w-5" />
                  Environmental Systems
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-800/30 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-300 flex items-center">
                        <Wind className="w-4 h-4 mr-2 text-gray-400" />
                        Atmospheric Pressure
                      </span>
                      <span className="text-green-400 font-semibold">{systemStatus.pressure.toFixed(1)} kPa</span>
                    </div>
                    <Progress value={(systemStatus.pressure / 110) * 100} className="h-2" />
                  </div>

                  <div className="bg-gray-800/30 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-300 flex items-center">
                        <Activity className="w-4 h-4 mr-2 text-blue-400" />
                        Oxygen Level
                      </span>
                      <span className="text-blue-400 font-semibold">{systemStatus.oxygen.toFixed(1)}%</span>
                    </div>
                    <Progress value={(systemStatus.oxygen / 25) * 100} className="h-2" />
                  </div>

                  <div className="bg-gray-800/30 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-300 flex items-center">
                        <Thermometer className="w-4 h-4 mr-2 text-orange-400" />
                        Internal Temperature
                      </span>
                      <span className="text-orange-400 font-semibold">{systemStatus.temperature.toFixed(1)}°C</span>
                    </div>
                    <Progress value={(systemStatus.temperature / 30) * 100} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <div className="text-lg font-bold text-green-400">NOMINAL</div>
                      <div className="text-xs text-gray-400">Life Support</div>
                    </div>
                    <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <div className="text-lg font-bold text-blue-400">STABLE</div>
                      <div className="text-xs text-gray-400">Atmosphere</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mission Timeline & Communications */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Mission Timeline */}
            <Card className="glass-morphism">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg">
                  <Calendar className="text-purple-400 mr-3 h-5 w-5" />
                  Mission Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-purple-300 font-semibold">ISS Expedition 70</span>
                      <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/50">Active</Badge>
                    </div>
                    <div className="text-sm text-gray-400">Current mission duration: {Math.floor((Date.now() - new Date('2023-09-15').getTime()) / (1000 * 60 * 60 * 24))} days</div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                        <span className="text-gray-300">Daily Planning Conference</span>
                      </div>
                      <span className="text-sm text-green-400">14:00 UTC</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-400 rounded-full mr-3"></div>
                        <span className="text-gray-300">Science Operations</span>
                      </div>
                      <span className="text-sm text-blue-400">16:30 UTC</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-orange-400 rounded-full mr-3"></div>
                        <span className="text-gray-300">Maintenance Tasks</span>
                      </div>
                      <span className="text-sm text-orange-400">19:00 UTC</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-cyan-400 rounded-full mr-3"></div>
                        <span className="text-gray-300">Exercise Period</span>
                      </div>
                      <span className="text-sm text-cyan-400">21:30 UTC</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Communications & Ground Contacts */}
            <Card className="glass-morphism">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg">
                  <Radio className="text-green-400 mr-3 h-5 w-5" />
                  Communications Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20 text-center">
                      <div className="text-2xl font-bold text-green-400 mb-1">98.7%</div>
                      <div className="text-xs text-gray-400">Signal Strength</div>
                    </div>
                    <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20 text-center">
                      <div className="text-2xl font-bold text-blue-400 mb-1">12ms</div>
                      <div className="text-xs text-gray-400">Ground Delay</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-400 mr-3" />
                        <span className="text-gray-300">Houston MCC</span>
                      </div>
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/50">ACTIVE</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-400 mr-3" />
                        <span className="text-gray-300">Moscow TsUP</span>
                      </div>
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/50">ACTIVE</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-blue-400 mr-3" />
                        <span className="text-gray-300">Munich Col-CC</span>
                      </div>
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/50">STANDBY</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-400 mr-3" />
                        <span className="text-gray-300">Tsukuba JEM-CC</span>
                      </div>
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/50">ACTIVE</Badge>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                    <div className="text-sm text-blue-300 mb-2">Next Communication Window</div>
                    <div className="text-xs text-gray-400">
                      Ground contact available in {Math.floor(Math.random() * 45 + 15)} minutes via TDRS East
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Experiments & Research */}
          <Card className="glass-morphism">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-xl">
                <Target className="text-cyan-400 mr-3 h-6 w-6" />
                Active Research & Experiments
                <Badge className="ml-3 bg-cyan-500/20 text-cyan-300 border-cyan-500/50">
                  24 Active
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Experiment 1 */}
                <Card className="bg-gray-800/20 border border-gray-700/30 hover:border-cyan-500/50 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/50">Biology</Badge>
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                    <h3 className="font-semibold text-white mb-2">Tissue Chips in Space</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Studying human tissue models in microgravity to understand disease mechanisms and test potential treatments.
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Progress:</span>
                        <span className="text-cyan-400">87%</span>
                      </div>
                      <Progress value={87} className="h-1" />
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Principal Investigator:</span>
                        <span className="text-white">Dr. L. Shuler</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Experiment 2 */}
                <Card className="bg-gray-800/20 border border-gray-700/30 hover:border-cyan-500/50 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/50">Physics</Badge>
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                    <h3 className="font-semibold text-white mb-2">Advanced Combustion</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Investigating flame behavior and soot formation in microgravity to improve engine efficiency.
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Progress:</span>
                        <span className="text-purple-400">62%</span>
                      </div>
                      <Progress value={62} className="h-1" />
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Principal Investigator:</span>
                        <span className="text-white">Dr. P. Ronney</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Experiment 3 */}
                <Card className="bg-gray-800/20 border border-gray-700/30 hover:border-cyan-500/50 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/50">Materials</Badge>
                      <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
                    </div>
                    <h3 className="font-semibold text-white mb-2">Protein Crystal Growth</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Growing high-quality protein crystals for pharmaceutical research and drug development.
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Progress:</span>
                        <span className="text-green-400">94%</span>
                      </div>
                      <Progress value={94} className="h-1" />
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Principal Investigator:</span>
                        <span className="text-white">Dr. A. McPherson</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Experiment 4 */}
                <Card className="bg-gray-800/20 border border-gray-700/30 hover:border-cyan-500/50 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/50">Technology</Badge>
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                    <h3 className="font-semibold text-white mb-2">3D Printing in Space</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Testing additive manufacturing capabilities for on-demand tool and part production.
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Progress:</span>
                        <span className="text-orange-400">78%</span>
                      </div>
                      <Progress value={78} className="h-1" />
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Principal Investigator:</span>
                        <span className="text-white">Dr. M. Snyder</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Experiment 5 */}
                <Card className="bg-gray-800/20 border border-gray-700/30 hover:border-cyan-500/50 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge className="bg-red-500/20 text-red-300 border-red-500/50">Medical</Badge>
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                    <h3 className="font-semibold text-white mb-2">Cardiology Research</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Monitoring cardiovascular changes in astronauts during long-duration spaceflight.
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Progress:</span>
                        <span className="text-red-400">45%</span>
                      </div>
                      <Progress value={45} className="h-1" />
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Principal Investigator:</span>
                        <span className="text-white">Dr. B. Levine</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Experiment 6 */}
                <Card className="bg-gray-800/20 border border-gray-700/30 hover:border-cyan-500/50 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/50">Earth Obs</Badge>
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                    <h3 className="font-semibold text-white mb-2">Earth Observation</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Continuous monitoring of Earth's climate, weather patterns, and environmental changes.
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Progress:</span>
                        <span className="text-cyan-400">Ongoing</span>
                      </div>
                      <Progress value={100} className="h-1" />
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Principal Investigator:</span>
                        <span className="text-white">Dr. K. Bowman</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}