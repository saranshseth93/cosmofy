import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigation } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LottieLoader } from '@/components/lottie-loader';
import { Rocket, Calendar, Globe, ExternalLink, Clock, Users, Filter } from 'lucide-react';
import { SpaceMission } from '@/types/space';

export default function Missions() {
  const [filter, setFilter] = useState<'all' | 'active' | 'planned' | 'completed'>('active');
  const [sortBy, setSortBy] = useState<'date' | 'agency' | 'type'>('date');

  useEffect(() => {
    document.title = "Space Missions - Cosmofy | Current & Upcoming Space Exploration Missions";
  }, []);

  const { data: missions, isLoading, error } = useQuery<SpaceMission[]>({
    queryKey: ['/api/missions', filter, sortBy],
    queryFn: async () => {
      const response = await fetch(`/api/missions?filter=${filter}&sort=${sortBy}`);
      if (!response.ok) throw new Error('Failed to fetch missions');
      return response.json();
    },
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return { color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/50' };
      case 'planned':
        return { color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/50' };
      case 'completed':
        return { color: 'text-gray-400', bg: 'bg-gray-500/20', border: 'border-gray-500/50' };
      case 'cancelled':
        return { color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/50' };
      default:
        return { color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/50' };
    }
  };

  const getMissionTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'robotic':
        return '🤖';
      case 'crewed':
        return '👨‍🚀';
      case 'orbiter':
        return '🛰️';
      case 'lander':
        return '🚀';
      case 'rover':
        return '🚙';
      default:
        return '🌌';
    }
  };

  const formatDuration = (launchDate: Date, endDate: Date | null) => {
    const launch = new Date(launchDate);
    const end = endDate ? new Date(endDate) : new Date();
    const diffTime = Math.abs(end.getTime() - launch.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
    return `${Math.floor(diffDays / 365)} years`;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[hsl(222,47%,8%)] via-[hsl(217,91%,29%)] to-[hsl(222,47%,8%)]">
        <Navigation />
        <div className="container mx-auto px-6 pt-32">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Space Missions
            </h1>
            <p className="text-red-400">Failed to load mission data. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(222,47%,8%)] via-[hsl(244,62%,26%)] to-[hsl(222,47%,8%)]">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="stars" />
          <div className="twinkling" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 text-blue-300">
              Space Exploration Missions
            </Badge>
            
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-200 to-purple-300 bg-clip-text text-transparent leading-tight">
              Space Missions
            </h1>
            
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              Explore humanity's greatest space adventures. Track active missions, discover upcoming launches, and learn about groundbreaking discoveries.
            </p>

            {/* Filter Controls */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="flex gap-2">
                {[
                  { id: 'all', label: 'All Missions', icon: Globe },
                  { id: 'active', label: 'Active', icon: Rocket },
                  { id: 'planned', label: 'Planned', icon: Calendar },
                  { id: 'completed', label: 'Completed', icon: Clock },
                ].map((filterOption) => {
                  const Icon = filterOption.icon;
                  return (
                    <Button
                      key={filterOption.id}
                      variant={filter === filterOption.id ? "default" : "outline"}
                      onClick={() => setFilter(filterOption.id as any)}
                      className={filter === filterOption.id 
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white" 
                        : "glass-morphism border-white/20 text-white hover:bg-white/10"
                      }
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {filterOption.label}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                onClick={() => setSortBy(sortBy === 'date' ? 'agency' : sortBy === 'agency' ? 'type' : 'date')}
                className="glass-morphism border-white/20 text-white hover:bg-white/10"
              >
                <Filter className="mr-2 h-4 w-4" />
                Sort by: {sortBy === 'date' ? 'Date' : sortBy === 'agency' ? 'Agency' : 'Type'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Missions Grid */}
      <section className="pb-20">
        <div className="container mx-auto px-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <LottieLoader size={120} className="mb-6" />
              <p className="text-lg opacity-70 mb-8">Loading space missions...</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, index) => (
                  <Card key={index} className="glass-morphism">
                    <div className="w-full h-48 bg-gray-800/50 rounded-t-lg animate-pulse" />
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
          ) : missions && missions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {missions.map((mission) => {
                const statusColor = getStatusColor(mission.status);
                return (
                  <Card key={mission.id} className="glass-morphism hover:scale-105 transition-all duration-300 cursor-pointer group overflow-hidden">
                    {/* Mission Image */}
                    <div className="relative h-48 overflow-hidden">
                      {mission.imageUrl ? (
                        <img
                          src={mission.imageUrl}
                          alt={mission.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-900/50 to-purple-900/50 flex items-center justify-center">
                          <div className="text-6xl">{getMissionTypeIcon(mission.missionType || '')}</div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Status Badge */}
                      <div className="absolute top-3 right-3">
                        <Badge className={`${statusColor.bg} ${statusColor.color} ${statusColor.border} border`}>
                          {mission.status}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline" className="text-xs border-gray-600/50 text-gray-400">
                          {mission.agency || 'Space Agency'}
                        </Badge>
                        {mission.missionType && (
                          <Badge variant="outline" className="text-xs border-blue-500/50 text-blue-300">
                            {mission.missionType}
                          </Badge>
                        )}
                      </div>

                      <h3 className="font-bold text-lg mb-3 text-white group-hover:text-blue-300 transition-colors line-clamp-2">
                        {mission.name}
                      </h3>

                      <p className="text-sm text-gray-300 mb-4 line-clamp-3">
                        {mission.description}
                      </p>

                      <div className="space-y-2 mb-4">
                        {mission.launchDate && (
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center text-gray-400">
                              <Calendar className="h-4 w-4 mr-2" />
                              Launch Date
                            </div>
                            <div className="text-white">
                              {new Date(mission.launchDate).toLocaleDateString()}
                            </div>
                          </div>
                        )}

                        {mission.destination && (
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center text-gray-400">
                              <Globe className="h-4 w-4 mr-2" />
                              Destination
                            </div>
                            <div className="text-purple-400">
                              {mission.destination}
                            </div>
                          </div>
                        )}

                        {mission.launchDate && (
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center text-gray-400">
                              <Clock className="h-4 w-4 mr-2" />
                              Duration
                            </div>
                            <div className="text-cyan-400">
                              {formatDuration(mission.launchDate, mission.endDate)}
                            </div>
                          </div>
                        )}
                      </div>

                      {mission.websiteUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full glass-morphism border-white/20 text-white hover:bg-white/10"
                          onClick={() => window.open(mission.websiteUrl!, '_blank')}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Learn More
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-gray-400 mb-4">No missions found matching current filters</div>
              <Button
                onClick={() => setFilter('all')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Show All Missions
              </Button>
            </div>
          )}

          {/* Statistics Summary */}
          {missions && missions.length > 0 && (
            <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="glass-morphism text-center">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-blue-400 mb-2">
                    {missions.length}
                  </div>
                  <div className="text-sm text-gray-400">Total Missions</div>
                </CardContent>
              </Card>
              
              <Card className="glass-morphism text-center">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {missions.filter(m => m.status.toLowerCase() === 'active').length}
                  </div>
                  <div className="text-sm text-gray-400">Active</div>
                </CardContent>
              </Card>
              
              <Card className="glass-morphism text-center">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-blue-400 mb-2">
                    {missions.filter(m => m.status.toLowerCase() === 'planned').length}
                  </div>
                  <div className="text-sm text-gray-400">Planned</div>
                </CardContent>
              </Card>
              
              <Card className="glass-morphism text-center">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-purple-400 mb-2">
                    {new Set(missions.map(m => m.agency)).size}
                  </div>
                  <div className="text-sm text-gray-400">Space Agencies</div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}