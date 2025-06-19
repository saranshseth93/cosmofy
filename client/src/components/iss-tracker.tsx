import { useQuery } from '@tanstack/react-query';
import { Satellite, Eye, Users, Bell, MapPin, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useGSAP } from '@/hooks/use-gsap';
import { useGeolocation } from '@/hooks/use-geolocation';
import { IssPosition, IssPass, IssCrew } from '@/types/space';

interface ISSTrackerProps {
  id?: string;
}

export function ISSTracker({ id = "iss-tracker" }: ISSTrackerProps) {
  const sectionRef = useGSAP();
  const { coordinates, error: locationError, requestLocation } = useGeolocation();

  const { data: position, isLoading: positionLoading } = useQuery<IssPosition>({
    queryKey: ['/api/iss/position'],
    queryFn: async () => {
      const response = await fetch('/api/iss/position');
      if (!response.ok) throw new Error('Failed to fetch ISS position');
      return response.json();
    },
    refetchInterval: 10000, // Update every 10 seconds
  });

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

  const { data: crew, isLoading: crewLoading } = useQuery<IssCrew[]>({
    queryKey: ['/api/iss/crew'],
    queryFn: async () => {
      const response = await fetch('/api/iss/crew');
      if (!response.ok) throw new Error('Failed to fetch ISS crew');
      return response.json();
    },
  });

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getElevationColor = (elevation?: number) => {
    if (!elevation) return 'hsl(158, 76%, 36%)';
    if (elevation > 60) return 'hsl(330, 81%, 60%)';
    if (elevation > 30) return 'hsl(43, 96%, 56%)';
    return 'hsl(158, 76%, 36%)';
  };

  return (
    <section 
      id={id}
      ref={sectionRef}
      className="py-20 bg-gradient-to-b from-[hsl(217,91%,29%)] to-[hsl(261,57%,29%)] section-reveal"
    >
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-orbitron font-bold mb-6 text-gradient">
            International Space Station
          </h2>
          <p className="text-xl opacity-80 max-w-2xl mx-auto">
            Track the ISS in real-time, meet the current crew, and discover when it will pass over your location.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* ISS Live Position */}
          <Card className="glass-effect rounded-2xl">
            <CardContent className="p-8">
              <h3 className="text-2xl font-orbitron font-bold mb-6 flex items-center">
                <Satellite className="text-[hsl(158,76%,36%)] mr-3 h-8 w-8" />
                Live Position
              </h3>

              <div className="relative bg-[hsl(222,47%,8%)] rounded-xl overflow-hidden mb-6 h-64 bg-gradient-to-br from-blue-900 to-purple-900">
                <div className="absolute inset-0 bg-gradient-to-t from-[hsl(222,47%,8%)] via-transparent to-transparent" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="animate-pulse">
                    <Satellite className="h-12 w-12 text-[hsl(158,76%,36%)]" />
                  </div>
                </div>
                {position && (
                  <div className="absolute bottom-4 left-4 text-sm">
                    <div className="glass-effect px-3 py-1 rounded-full">
                      Live: {position.latitude.toFixed(1)}°N, {position.longitude.toFixed(1)}°W
                    </div>
                  </div>
                )}
              </div>

              {positionLoading ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <Skeleton className="h-8 w-16 mx-auto mb-2" />
                    <Skeleton className="h-4 w-12 mx-auto" />
                  </div>
                  <div className="text-center">
                    <Skeleton className="h-8 w-20 mx-auto mb-2" />
                    <Skeleton className="h-4 w-16 mx-auto" />
                  </div>
                </div>
              ) : position ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[hsl(158,76%,36%)]">
                      {position.altitude} km
                    </div>
                    <div className="text-sm opacity-70">Altitude</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[hsl(43,96%,56%)]">
                      {position.velocity.toLocaleString()} km/h
                    </div>
                    <div className="text-sm opacity-70">Velocity</div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-red-400">
                  Failed to load ISS position
                </div>
              )}
            </CardContent>
          </Card>

          {/* ISS Pass Predictions */}
          <Card className="glass-effect rounded-2xl">
            <CardContent className="p-8">
              <h3 className="text-2xl font-orbitron font-bold mb-6 flex items-center">
                <Eye className="text-[hsl(330,81%,60%)] mr-3 h-8 w-8" />
                Next Visible Passes
              </h3>

              {!coordinates && !locationError && (
                <div className="text-center mb-6">
                  <Button onClick={requestLocation} className="bg-[hsl(158,76%,36%)]">
                    <MapPin className="mr-2 h-4 w-4" />
                    Enable Location
                  </Button>
                  <p className="text-sm opacity-70 mt-2">
                    Location access required for pass predictions
                  </p>
                </div>
              )}

              {locationError && (
                <div className="text-center text-red-400 mb-6">
                  <p>{locationError}</p>
                  <Button onClick={requestLocation} variant="outline" className="mt-2">
                    Try Again
                  </Button>
                </div>
              )}

              <div className="space-y-4 mb-6">
                {passesLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex justify-between items-center p-4 bg-[hsl(222,47%,8%)] bg-opacity-50 rounded-xl">
                      <div>
                        <Skeleton className="h-5 w-32 mb-2" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <div className="text-right">
                        <Skeleton className="h-6 w-12 mb-1" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                  ))
                ) : passes && passes.length > 0 ? (
                  passes.slice(0, 3).map((pass) => (
                    <div key={pass.id} className="flex justify-between items-center p-4 bg-[hsl(222,47%,8%)] bg-opacity-50 rounded-xl">
                      <div>
                        <div className="font-semibold">{formatDate(pass.risetime)}</div>
                        <div className="text-sm opacity-70 flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          Duration: {formatDuration(pass.duration)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div 
                          className="font-bold text-lg"
                          style={{ color: getElevationColor(pass.maxElevation) }}
                        >
                          {pass.maxElevation?.toFixed(0) || 'N/A'}°
                        </div>
                        <div className="text-sm opacity-70">Max Elevation</div>
                      </div>
                    </div>
                  ))
                ) : coordinates ? (
                  <div className="text-center text-gray-400">
                    No upcoming passes found for your location
                  </div>
                ) : null}
              </div>

              {coordinates && (
                <Button className="w-full bg-gradient-to-r from-[hsl(158,76%,36%)] to-[hsl(330,81%,60%)] hover:scale-105 transform transition-all duration-300">
                  <Bell className="mr-2 h-4 w-4" />
                  Set Pass Notifications
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ISS Crew Information */}
        <Card className="glass-effect rounded-2xl">
          <CardContent className="p-8">
            <h3 className="text-2xl font-orbitron font-bold mb-8 text-center flex items-center justify-center">
              <Users className="text-[hsl(158,76%,36%)] mr-3 h-8 w-8" />
              Current ISS Crew
            </h3>

            {crewLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="text-center">
                    <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4" />
                    <Skeleton className="h-5 w-32 mx-auto mb-2" />
                    <Skeleton className="h-4 w-24 mx-auto mb-2" />
                    <Skeleton className="h-3 w-20 mx-auto" />
                  </div>
                ))}
              </div>
            ) : crew && crew.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {crew.map((member, index) => {
                  const colors = [
                    'hsl(158, 76%, 36%)',
                    'hsl(43, 96%, 56%)',
                    'hsl(330, 81%, 60%)'
                  ];
                  return (
                    <div key={member.id} className="text-center">
                      <div 
                        className="w-24 h-24 rounded-full mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold"
                        style={{ borderColor: colors[index % colors.length] }}
                      >
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <h4 className="font-semibold text-lg">{member.name}</h4>
                      <Badge 
                        className="mb-2"
                        style={{ backgroundColor: colors[index % colors.length] }}
                      >
                        {member.role || 'Crew Member'}
                      </Badge>
                      {member.daysInSpace && (
                        <p className="text-xs opacity-70">
                          Day {member.daysInSpace} in space
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-gray-400">
                Unable to load crew information
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
