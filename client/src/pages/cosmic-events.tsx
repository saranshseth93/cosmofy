import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Eye, Rocket, Moon, Sun, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Navigation } from '@/components/navigation';
import { CosmicCursor } from '@/components/cosmic-cursor';

interface CosmicEvent {
  id: string;
  title: string;
  type: 'eclipse' | 'meteor_shower' | 'planetary_alignment' | 'rocket_launch' | 'transit' | 'conjunction';
  date: string;
  time: string;
  duration: string;
  visibility: {
    global: boolean;
    regions: string[];
    bestTime: string;
  };
  description: string;
  significance: string;
  viewingTips: string[];
  countdown: number; // seconds until event
  status: 'upcoming' | 'happening' | 'past';
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  images?: string[];
}

interface LaunchEvent {
  id: string;
  mission: string;
  agency: string;
  vehicle: string;
  launchSite: string;
  date: string;
  time: string;
  description: string;
  objectives: string[];
  livestreamUrl?: string;
  countdown: number;
  status: 'scheduled' | 'delayed' | 'launched' | 'scrubbed';
}

export default function CosmicEventsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [timeframe, setTimeframe] = useState<string>('upcoming');
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

  const { data: events, isLoading: eventsLoading } = useQuery<CosmicEvent[]>({
    queryKey: ['/api/cosmic-events', selectedCategory, timeframe],
    refetchInterval: 300000, // 5 minutes
  });

  const { data: launches, isLoading: launchesLoading } = useQuery<LaunchEvent[]>({
    queryKey: ['/api/rocket-launches'],
    refetchInterval: 60000, // 1 minute for countdown accuracy
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        () => {
          // Default to New York coordinates
          setUserLocation({ lat: 40.7128, lon: -74.0060 });
        }
      );
    }
  }, []);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'eclipse': return <Sun className="h-5 w-5 text-yellow-500" />;
      case 'meteor_shower': return <Star className="h-5 w-5 text-blue-500" />;
      case 'planetary_alignment': return <Moon className="h-5 w-5 text-purple-500" />;
      case 'rocket_launch': return <Rocket className="h-5 w-5 text-red-500" />;
      case 'transit': return <Eye className="h-5 w-5 text-green-500" />;
      case 'conjunction': return <MapPin className="h-5 w-5 text-orange-500" />;
      default: return <Calendar className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-500';
      case 'happening': return 'bg-green-500';
      case 'scheduled': return 'bg-blue-500';
      case 'delayed': return 'bg-yellow-500';
      case 'launched': return 'bg-green-500';
      case 'scrubbed': return 'bg-red-500';
      case 'past': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const formatCountdown = (seconds: number) => {
    if (seconds <= 0) return 'Now!';
    
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  const isEventVisibleFromLocation = (event: CosmicEvent) => {
    if (!userLocation || event.visibility.global) return true;
    
    // Simple visibility check based on regions
    return event.visibility.regions.some(region => 
      region.toLowerCase().includes('global') || 
      region.toLowerCase().includes('worldwide')
    );
  };

  const categories = [
    { id: 'all', label: 'All Events', icon: Calendar },
    { id: 'eclipse', label: 'Eclipses', icon: Sun },
    { id: 'meteor_shower', label: 'Meteor Showers', icon: Star },
    { id: 'planetary_alignment', label: 'Alignments', icon: Moon },
    { id: 'rocket_launch', label: 'Launches', icon: Rocket },
    { id: 'transit', label: 'Transits', icon: Eye },
  ];

  if (eventsLoading || launchesLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading cosmic events...</p>
        </div>
      </div>
    );
  }

  const filteredEvents = events?.filter(event => {
    if (selectedCategory === 'all') return true;
    return event.type === selectedCategory;
  });

  const upcomingLaunches = launches?.filter(launch => 
    launch.status === 'scheduled' && launch.countdown > 0
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Cosmic Event Calendar
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Upcoming eclipses, meteor showers, planetary alignments, and rocket launches with countdown timers
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map(category => {
          const Icon = category.icon;
          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {category.label}
            </Button>
          );
        })}
      </div>

      {/* Immediate Launches */}
      {upcomingLaunches && upcomingLaunches.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Rocket className="h-6 w-6 text-red-500" />
            Upcoming Rocket Launches
          </h2>
          <div className="grid gap-4">
            {upcomingLaunches.slice(0, 3).map((launch) => (
              <Card key={launch.id} className="border-l-4 border-l-red-500">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{launch.mission}</CardTitle>
                      <CardDescription className="mt-1">
                        {launch.agency} • {launch.vehicle} • {launch.launchSite}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <Badge className={`${getStatusColor(launch.status)} text-white mb-2`}>
                        {launch.status}
                      </Badge>
                      <div className="text-2xl font-bold text-red-500">
                        T-{formatCountdown(launch.countdown)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{launch.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(launch.date).toLocaleDateString()} at {launch.time} UTC</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-1">Mission Objectives:</div>
                      <ul className="text-sm text-muted-foreground list-disc list-inside">
                        {launch.objectives.map((objective, index) => (
                          <li key={index}>{objective}</li>
                        ))}
                      </ul>
                    </div>
                    {launch.livestreamUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={launch.livestreamUrl} target="_blank" rel="noopener noreferrer">
                          Watch Live Stream
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Cosmic Events */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">
          {selectedCategory === 'all' ? 'All Cosmic Events' : `${categories.find(c => c.id === selectedCategory)?.label || 'Events'}`}
        </h2>
        
        <div className="grid gap-6">
          {filteredEvents?.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              <div className="md:flex">
                {event.images && event.images.length > 0 && (
                  <div className="md:w-1/3">
                    <img 
                      src={event.images[0]} 
                      alt={event.title}
                      className="w-full h-48 md:h-full object-cover"
                    />
                  </div>
                )}
                <div className={`${event.images?.length ? 'md:w-2/3' : 'w-full'} p-6`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold flex items-center gap-2">
                        {getEventIcon(event.type)}
                        {event.title}
                      </h3>
                      <Badge variant="outline" className="mt-2 capitalize">
                        {event.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <Badge className={`${getStatusColor(event.status)} text-white mb-2`}>
                        {event.status}
                      </Badge>
                      {event.countdown > 0 && (
                        <div className="text-lg font-bold text-blue-500">
                          {formatCountdown(event.countdown)}
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-4">{event.description}</p>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{event.time} • Duration: {event.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <span>Best viewing: {event.visibility.bestTime}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="text-sm font-medium">Visibility:</div>
                        <div className="text-sm text-muted-foreground">
                          {event.visibility.global ? 'Worldwide' : event.visibility.regions.join(', ')}
                        </div>
                        {userLocation && !isEventVisibleFromLocation(event) && (
                          <div className="text-xs text-orange-500">
                            May not be visible from your location
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium mb-1">Significance:</div>
                      <p className="text-sm text-muted-foreground">{event.significance}</p>
                    </div>
                    
                    {event.viewingTips.length > 0 && (
                      <div>
                        <div className="text-sm font-medium mb-1">Viewing Tips:</div>
                        <ul className="text-sm text-muted-foreground list-disc list-inside">
                          {event.viewingTips.map((tip, index) => (
                            <li key={index}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Event Information */}
      <Card>
        <CardHeader>
          <CardTitle>About Cosmic Events</CardTitle>
          <CardDescription>
            Understanding celestial phenomena and optimal viewing conditions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium mb-2">Event Types</h4>
              <div className="space-y-2">
                <div><strong>Solar/Lunar Eclipses:</strong> Rare alignments creating spectacular shadow displays</div>
                <div><strong>Meteor Showers:</strong> Debris from comets creating shooting star displays</div>
                <div><strong>Planetary Alignments:</strong> Multiple planets appearing close in the sky</div>
                <div><strong>Transits:</strong> Planets crossing in front of the Sun as seen from Earth</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Viewing Tips</h4>
              <div className="space-y-2">
                <div><strong>Dark Sky:</strong> Get away from city lights for best visibility</div>
                <div><strong>Weather:</strong> Clear skies are essential for astronomical observations</div>
                <div><strong>Timing:</strong> Many events are best viewed during specific hours</div>
                <div><strong>Equipment:</strong> Some events benefit from binoculars or telescopes</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}