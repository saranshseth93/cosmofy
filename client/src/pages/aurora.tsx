import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigation } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CosmicPulse } from '@/components/lottie-loader';
import { useGeolocation } from '@/hooks/use-geolocation';
import { Zap, MapPin, Clock, Camera, Globe, AlertTriangle, TrendingUp } from 'lucide-react';
import { AuroraForecast } from '@/types/space';

export default function Aurora() {
  const { coordinates, error: geoError, loading: geoLoading } = useGeolocation();

  useEffect(() => {
    document.title = "Aurora Forecasts - Cosmofy | Northern & Southern Lights Predictions";
  }, []);

  const { data: forecast, isLoading, refetch } = useQuery<AuroraForecast[]>({
    queryKey: ['/api/aurora/forecast', coordinates?.latitude, coordinates?.longitude],
    queryFn: async () => {
      let url = '/api/aurora/forecast';
      if (coordinates) {
        url += `?lat=${coordinates.latitude}&lon=${coordinates.longitude}`;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch aurora forecast');
      return response.json();
    },
  });

  const getActivityLevel = (kpIndex: number) => {
    if (kpIndex <= 2) return { level: 'Quiet', color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/50' };
    if (kpIndex <= 4) return { level: 'Active', color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/50' };
    if (kpIndex <= 6) return { level: 'Storm', color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/50' };
    return { level: 'Severe Storm', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/50' };
  };

  const getVisibilityChance = (kpIndex: number, latitude?: number) => {
    if (!latitude) return 'Unknown';
    const absLat = Math.abs(latitude);
    
    if (kpIndex >= 7 && absLat >= 45) return 'Very High';
    if (kpIndex >= 5 && absLat >= 50) return 'High';
    if (kpIndex >= 4 && absLat >= 55) return 'Moderate';
    if (kpIndex >= 3 && absLat >= 60) return 'Low';
    return 'Very Low';
  };

  const currentForecast = forecast?.[0];
  const activity = currentForecast ? getActivityLevel(currentForecast.kpIndex) : null;

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section - Mobile Optimized */}
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-16 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="stars" />
          <div className="twinkling" />
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 sm:mb-6 bg-gradient-to-r from-pink-600/20 to-purple-600/20 border border-pink-500/30 text-pink-300 text-xs sm:text-sm">
              Geomagnetic Activity Monitor
            </Badge>
            
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white via-pink-200 to-purple-300 bg-clip-text text-transparent leading-tight">
              Aurora Forecasts
            </h1>
            
            <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto mb-6 sm:mb-8 px-4 sm:px-0">
              Monitor geomagnetic activity and discover the best times and locations to witness spectacular aurora displays.
            </p>

            {/* Current Activity Status */}
            {currentForecast && activity && (
              <div className="inline-flex items-center gap-4 p-4 glass-morphism rounded-2xl">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${activity.bg} ${activity.border} border animate-pulse`} />
                  <span className="text-sm text-gray-300">Current Activity</span>
                </div>
                <Badge className={`${activity.bg} ${activity.color} ${activity.border} border font-semibold`}>
                  {activity.level} (Kp {currentForecast.kpIndex})
                </Badge>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content - Mobile Optimized */}
      <section className="pb-16 sm:pb-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16">
            {/* Current Activity Card */}
            <Card className="glass-morphism">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center">
                  <Zap className="text-pink-400 mr-2 sm:mr-3 h-6 w-6 sm:h-8 sm:w-8" />
                  Current Activity
                </h2>

                <div className="relative bg-gradient-to-br from-green-900/50 via-blue-900/50 to-purple-900/50 rounded-xl overflow-hidden mb-4 sm:mb-6 h-48 sm:h-64">
                  <div className="absolute inset-0 bg-gradient-to-t from-[hsl(222,47%,8%)] via-transparent to-transparent" />
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <CosmicPulse size={80} />
                  </div>
                  
                  {currentForecast && activity && (
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="glass-morphism p-4 rounded-lg">
                        <div className="text-sm text-gray-300 mb-1">Kp Index</div>
                        <div className={`text-2xl font-bold ${activity.color} mb-1`}>
                          {currentForecast.kpIndex}
                        </div>
                        <div className="text-sm text-gray-400">
                          {activity.level} Activity
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {isLoading ? (
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-700/50 rounded animate-pulse" />
                    <div className="h-4 bg-gray-700/50 rounded w-2/3 animate-pulse" />
                  </div>
                ) : currentForecast ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-800/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Activity Level</span>
                        <Badge className={`${activity?.bg} ${activity?.color} ${activity?.border} border`}>
                          {activity?.level}
                        </Badge>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full bg-gradient-to-r ${
                            currentForecast.kpIndex <= 2 ? 'from-green-500 to-green-400' :
                            currentForecast.kpIndex <= 4 ? 'from-yellow-500 to-yellow-400' :
                            currentForecast.kpIndex <= 6 ? 'from-orange-500 to-orange-400' :
                            'from-red-500 to-red-400'
                          }`}
                          style={{ width: `${Math.min(100, (currentForecast.kpIndex / 9) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                        <div className={`text-xl font-bold ${activity?.color}`}>
                          {getVisibilityChance(currentForecast.kpIndex, coordinates?.latitude)}
                        </div>
                        <div className="text-sm text-gray-400">Visibility Chance</div>
                      </div>
                      <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                        <div className="text-xl font-bold text-purple-400">
                          {new Date(currentForecast.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-sm text-gray-400">Last Updated</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-400">
                    Unable to load forecast data
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Location-Based Forecast */}
            <Card className="glass-morphism">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <MapPin className="text-purple-400 mr-3 h-8 w-8" />
                  Your Location Forecast
                </h2>

                {geoError ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">Location access required for aurora forecasts</div>
                    <Button
                      onClick={() => window.location.reload()}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      Enable Location
                    </Button>
                  </div>
                ) : geoLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="p-4 bg-gray-800/30 rounded-lg">
                        <div className="h-4 bg-gray-700/50 rounded mb-2 animate-pulse" />
                        <div className="h-3 bg-gray-700/50 rounded w-1/2 animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : coordinates ? (
                  <div className="space-y-6">
                    <div className="p-4 bg-gray-800/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Your Coordinates</span>
                        <Globe className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="text-lg text-white">
                        {coordinates.latitude.toFixed(2)}°, {coordinates.longitude.toFixed(2)}°
                      </div>
                    </div>

                    {currentForecast && (
                      <div className="space-y-4">
                        <div className="p-4 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg border border-purple-500/30">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-purple-300">Aurora Visibility</span>
                            <Camera className="h-4 w-4 text-purple-400" />
                          </div>
                          <div className="text-2xl font-bold text-purple-300 mb-1">
                            {getVisibilityChance(currentForecast.kpIndex, coordinates.latitude)}
                          </div>
                          <div className="text-sm text-gray-400">
                            Based on Kp {currentForecast.kpIndex} and your latitude
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          <div className="p-4 bg-gray-800/30 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-400">Best Viewing Time</span>
                              <Clock className="h-4 w-4 text-gray-400" />
                            </div>
                            <div className="text-white">10 PM - 2 AM local time</div>
                          </div>

                          <div className="p-4 bg-gray-800/30 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-400">Recommended Direction</span>
                              <TrendingUp className="h-4 w-4 text-gray-400" />
                            </div>
                            <div className="text-white">
                              {coordinates.latitude > 0 ? 'North' : 'South'}
                            </div>
                          </div>
                        </div>

                        {currentForecast.kpIndex >= 5 && (
                          <div className="p-4 bg-gradient-to-r from-orange-900/30 to-red-900/30 rounded-lg border border-orange-500/30">
                            <div className="flex items-center mb-2">
                              <AlertTriangle className="h-5 w-5 text-orange-400 mr-2" />
                              <span className="text-orange-300 font-semibold">High Activity Alert</span>
                            </div>
                            <div className="text-sm text-gray-300">
                              Strong geomagnetic activity detected! Excellent aurora viewing conditions expected.
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    Unable to determine your location
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Extended Forecast */}
          {forecast && forecast.length > 1 && (
            <Card className="glass-morphism">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <TrendingUp className="text-cyan-400 mr-3 h-8 w-8" />
                  Extended Forecast
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {forecast.slice(0, 6).map((item, index) => {
                    const activity = getActivityLevel(item.kpIndex);
                    return (
                      <div key={item.id} className="p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="outline" className="text-xs border-cyan-500/50 text-cyan-300">
                            {index === 0 ? 'Now' : `+${index * 3}h`}
                          </Badge>
                          <Badge className={`${activity.bg} ${activity.color} ${activity.border} border text-xs`}>
                            Kp {item.kpIndex}
                          </Badge>
                        </div>
                        
                        <div className={`text-lg font-semibold ${activity.color} mb-1`}>
                          {activity.level}
                        </div>
                        
                        <div className="text-sm text-gray-400">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        
                        {coordinates && (
                          <div className="text-xs text-gray-500 mt-2">
                            Visibility: {getVisibilityChance(item.kpIndex, coordinates.latitude)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}