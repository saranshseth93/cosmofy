import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigation } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LottieLoader } from '@/components/lottie-loader';
import { AlertTriangle, Calendar, Zap, Ruler, Target, Globe, Filter } from 'lucide-react';
import { Asteroid } from '@/types/space';

export default function Asteroids() {
  const [filter, setFilter] = useState<'all' | 'hazardous'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'distance' | 'size'>('date');

  useEffect(() => {
    document.title = "Near-Earth Asteroids - Cosmofy | NASA NEO Tracking & Close Approaches";
  }, []);

  const { data: asteroids, isLoading, error } = useQuery<Asteroid[]>({
    queryKey: ['/api/asteroids', filter, sortBy],
    queryFn: async () => {
      const response = await fetch(`/api/asteroids?filter=${filter}&sort=${sortBy}`);
      if (!response.ok) throw new Error('Failed to fetch asteroids');
      return response.json();
    },
  });

  const formatDistance = (distance: number) => {
    if (distance < 1000000) {
      return `${(distance / 1000).toFixed(0)} thousand km`;
    }
    return `${(distance / 1000000).toFixed(2)} million km`;
  };

  const formatDiameter = (diameter: any) => {
    if (!diameter || !diameter.kilometers) return 'Unknown';
    const min = diameter.kilometers.estimated_diameter_min;
    const max = diameter.kilometers.estimated_diameter_max;
    const avg = (min + max) / 2;
    
    if (avg < 1) {
      return `~${(avg * 1000).toFixed(0)}m`;
    }
    return `~${avg.toFixed(1)}km`;
  };

  const getRiskLevel = (asteroid: Asteroid) => {
    if (!asteroid.isPotentiallyHazardous) {
      return { level: 'Safe', color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/50' };
    }
    
    const distance = asteroid.missDistance || 0;
    if (distance < 2000000) {
      return { level: 'High Risk', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/50' };
    } else if (distance < 5000000) {
      return { level: 'Moderate Risk', color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/50' };
    }
    return { level: 'Low Risk', color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/50' };
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[hsl(222,47%,8%)] via-[hsl(217,91%,29%)] to-[hsl(222,47%,8%)]">
        <Navigation />
        <div className="container mx-auto px-6 pt-32">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Near-Earth Asteroids
            </h1>
            <p className="text-red-400">Failed to load asteroid data. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(222,47%,8%)] via-[hsl(43,96%,56%)] to-[hsl(222,47%,8%)]">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="stars" />
          <div className="twinkling" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-gradient-to-r from-orange-600/20 to-red-600/20 border border-orange-500/30 text-orange-300">
              NASA NEO Tracking
            </Badge>
            
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-orange-200 to-red-300 bg-clip-text text-transparent leading-tight">
              Near-Earth Asteroids
            </h1>
            
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              Monitor potentially hazardous asteroids and near-Earth objects with real-time tracking data from NASA's Center for Near Earth Object Studies.
            </p>

            {/* Filter Controls */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="flex gap-2">
                <Button
                  variant={filter === 'all' ? "default" : "outline"}
                  onClick={() => setFilter('all')}
                  className={filter === 'all' 
                    ? "bg-gradient-to-r from-orange-600 to-red-600 text-white" 
                    : "glass-morphism border-white/20 text-white hover:bg-white/10"
                  }
                >
                  <Globe className="mr-2 h-4 w-4" />
                  All Objects
                </Button>
                <Button
                  variant={filter === 'hazardous' ? "default" : "outline"}
                  onClick={() => setFilter('hazardous')}
                  className={filter === 'hazardous' 
                    ? "bg-gradient-to-r from-red-600 to-pink-600 text-white" 
                    : "glass-morphism border-white/20 text-white hover:bg-white/10"
                  }
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Potentially Hazardous
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSortBy(sortBy === 'date' ? 'distance' : sortBy === 'distance' ? 'size' : 'date')}
                  className="glass-morphism border-white/20 text-white hover:bg-white/10"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Sort by: {sortBy === 'date' ? 'Date' : sortBy === 'distance' ? 'Distance' : 'Size'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Asteroids Grid */}
      <section className="pb-20">
        <div className="container mx-auto px-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <LottieLoader size={120} className="mb-6" />
              <p className="text-lg opacity-70 mb-8">Scanning for near-Earth objects...</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, index) => (
                  <Card key={index} className="glass-morphism">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="h-4 bg-gray-700/50 rounded w-1/2 animate-pulse" />
                        <div className="h-6 bg-gray-700/50 rounded-full w-16 animate-pulse" />
                      </div>
                      <div className="h-6 bg-gray-700/50 rounded mb-3 animate-pulse" />
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-700/50 rounded animate-pulse" />
                        <div className="h-3 bg-gray-700/50 rounded w-2/3 animate-pulse" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : asteroids && asteroids.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {asteroids.map((asteroid) => {
                const risk = getRiskLevel(asteroid);
                return (
                  <Card key={asteroid.id} className="glass-morphism hover:scale-105 transition-transform duration-300 cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="outline" className="text-xs border-gray-600/50 text-gray-400">
                          {asteroid.neoReferenceId}
                        </Badge>
                        <Badge className={`${risk.bg} ${risk.color} ${risk.border} border`}>
                          {risk.level}
                        </Badge>
                      </div>

                      <h3 className="font-bold text-lg mb-3 text-white group-hover:text-orange-300 transition-colors line-clamp-2">
                        {asteroid.name.replace(/[()]/g, '')}
                      </h3>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-400">
                            <Calendar className="h-4 w-4 mr-2" />
                            Close Approach
                          </div>
                          <div className="text-sm text-white">
                            {new Date(asteroid.closeApproachDate).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-400">
                            <Target className="h-4 w-4 mr-2" />
                            Miss Distance
                          </div>
                          <div className="text-sm text-cyan-400 font-medium">
                            {asteroid.missDistance ? formatDistance(asteroid.missDistance) : 'Unknown'}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-400">
                            <Ruler className="h-4 w-4 mr-2" />
                            Est. Diameter
                          </div>
                          <div className="text-sm text-purple-400">
                            {formatDiameter(asteroid.estimatedDiameter)}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-400">
                            <Zap className="h-4 w-4 mr-2" />
                            Velocity
                          </div>
                          <div className="text-sm text-green-400">
                            {asteroid.relativeVelocity ? `${(asteroid.relativeVelocity).toFixed(0)} km/h` : 'Unknown'}
                          </div>
                        </div>
                      </div>

                      {asteroid.isPotentiallyHazardous && (
                        <div className="p-3 bg-gradient-to-r from-red-900/30 to-orange-900/30 rounded-lg border border-red-500/30">
                          <div className="flex items-center">
                            <AlertTriangle className="h-4 w-4 text-red-400 mr-2" />
                            <span className="text-red-300 text-sm font-medium">Potentially Hazardous</span>
                          </div>
                        </div>
                      )}

                      {asteroid.absoluteMagnitude && (
                        <div className="mt-3 text-xs text-gray-500">
                          Absolute Magnitude: {asteroid.absoluteMagnitude.toFixed(1)}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-gray-400 mb-4">No asteroids found matching current filters</div>
              <Button
                onClick={() => setFilter('all')}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
              >
                Show All Objects
              </Button>
            </div>
          )}

          {/* Statistics Summary */}
          {asteroids && asteroids.length > 0 && (
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="glass-morphism text-center">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-orange-400 mb-2">
                    {asteroids.length}
                  </div>
                  <div className="text-sm text-gray-400">Objects Tracked</div>
                </CardContent>
              </Card>
              
              <Card className="glass-morphism text-center">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-red-400 mb-2">
                    {asteroids.filter(a => a.isPotentiallyHazardous).length}
                  </div>
                  <div className="text-sm text-gray-400">Potentially Hazardous</div>
                </CardContent>
              </Card>
              
              <Card className="glass-morphism text-center">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-cyan-400 mb-2">
                    {asteroids.filter(a => {
                      const approachDate = new Date(a.closeApproachDate);
                      const nextWeek = new Date();
                      nextWeek.setDate(nextWeek.getDate() + 7);
                      return approachDate <= nextWeek;
                    }).length}
                  </div>
                  <div className="text-sm text-gray-400">This Week</div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}