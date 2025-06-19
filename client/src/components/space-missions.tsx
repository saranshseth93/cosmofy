import { useQuery } from '@tanstack/react-query';
import { ExternalLink, Calendar, MapPin, Building } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useGSAP } from '@/hooks/use-gsap';
import { SpaceMission } from '@/types/space';

interface SpaceMissionsProps {
  id?: string;
}

export function SpaceMissions({ id = "missions" }: SpaceMissionsProps) {
  const sectionRef = useGSAP();

  const { data: missions, isLoading, error } = useQuery<SpaceMission[]>({
    queryKey: ['/api/missions/active'],
    queryFn: async () => {
      const response = await fetch('/api/missions/active');
      if (!response.ok) throw new Error('Failed to fetch space missions');
      return response.json();
    },
  });

  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'operational':
        return 'bg-[hsl(158,76%,36%)]';
      case 'en route':
      case 'in transit':
        return 'bg-[hsl(43,96%,56%)]';
      case 'planned':
      case 'scheduled':
        return 'bg-[hsl(330,81%,60%)]';
      default:
        return 'bg-gray-500';
    }
  };

  const calculateMissionDuration = (launchDate?: Date | string, endDate?: Date | string) => {
    if (!launchDate) return null;
    
    const start = new Date(launchDate);
    const end = endDate ? new Date(endDate) : new Date();
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 365) {
      const years = Math.floor(diffDays / 365);
      const remainingDays = diffDays % 365;
      return `${years}y ${Math.floor(remainingDays / 30)}m`;
    } else if (diffDays > 30) {
      const months = Math.floor(diffDays / 30);
      return `${months} months`;
    } else {
      return `${diffDays} days`;
    }
  };

  if (error) {
    return (
      <section id={id} className="py-20 bg-gradient-to-b from-[hsl(222,47%,8%)] to-[hsl(217,91%,29%)]">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <h2 className="text-5xl font-orbitron font-bold mb-6 text-gradient">
              Active Space Missions
            </h2>
            <p className="text-red-400">Failed to load mission data. Please try again later.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      id={id}
      ref={sectionRef}
      className="py-20 bg-gradient-to-b from-[hsl(222,47%,8%)] to-[hsl(217,91%,29%)] section-reveal"
    >
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-orbitron font-bold mb-6 text-gradient">
            Active Space Missions
          </h2>
          <p className="text-xl opacity-80 max-w-2xl mx-auto">
            Follow the latest space missions, from Mars rovers to deep space telescopes, and discover humanity's ongoing exploration of the cosmos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="glass-effect rounded-2xl overflow-hidden">
                <Skeleton className="w-full h-64" />
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-4">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-4 w-3/4 mb-6" />
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <Skeleton className="h-4 w-20 mb-1" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                    <div>
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-12 w-full" />
                </CardContent>
              </Card>
            ))
          ) : missions && missions.length > 0 ? (
            missions.map((mission) => (
              <Card 
                key={mission.id}
                className="glass-effect rounded-2xl overflow-hidden group hover:scale-105 transform transition-all duration-500"
              >
                <div className="relative">
                  {mission.imageUrl ? (
                    <img 
                      src={mission.imageUrl}
                      alt={mission.name}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
                      <MapPin className="h-16 w-16 text-white opacity-50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
                
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-orbitron font-bold">{mission.name}</h3>
                    <Badge className={getStatusColor(mission.status)}>
                      {mission.status}
                    </Badge>
                  </div>
                  
                  <p className="text-sm opacity-80 mb-4 leading-relaxed">
                    {mission.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <div className="text-sm opacity-70 flex items-center mb-1">
                        <Calendar className="mr-1 h-3 w-3" />
                        Launch Date
                      </div>
                      <div className="font-semibold">{formatDate(mission.launchDate)}</div>
                    </div>
                    <div>
                      <div className="text-sm opacity-70 flex items-center mb-1">
                        {mission.destination ? (
                          <>
                            <MapPin className="mr-1 h-3 w-3" />
                            Destination
                          </>
                        ) : (
                          <>
                            <Building className="mr-1 h-3 w-3" />
                            Agency
                          </>
                        )}
                      </div>
                      <div className="font-semibold">
                        {mission.destination || mission.agency || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {mission.launchDate && (
                    <div className="mb-6">
                      <div className="text-sm opacity-70 mb-1">Mission Duration</div>
                      <div className="font-semibold text-[hsl(158,76%,36%)]">
                        {calculateMissionDuration(mission.launchDate, mission.endDate)}
                      </div>
                    </div>
                  )}

                  <Button 
                    className="w-full bg-gradient-to-r from-[hsl(158,76%,36%)] to-[hsl(330,81%,60%)] hover:scale-105 transform transition-all duration-300"
                    onClick={() => {
                      if (mission.websiteUrl) {
                        window.open(mission.websiteUrl, '_blank');
                      }
                    }}
                    disabled={!mission.websiteUrl}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Mission Details
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-400 py-12">
              <MapPin className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>No active missions found</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
