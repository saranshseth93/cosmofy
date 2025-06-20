import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Telescope, Eye, Calendar, MapPin, Clock, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface TelescopeObservation {
  id: string;
  telescope: string;
  target: string;
  type: string;
  startTime: string;
  duration: number;
  instruments: string[];
  description: string;
  imageUrl?: string;
  status: 'scheduled' | 'observing' | 'completed';
  coordinates: {
    ra: string;
    dec: string;
  };
}

interface TelescopeStatus {
  name: string;
  status: 'operational' | 'maintenance' | 'offline';
  currentTarget: string | null;
  nextObservation: string;
  location: string;
  instruments: string[];
  description: string;
}

export default function VirtualTelescopePage() {
  const [selectedTelescope, setSelectedTelescope] = useState<string>('hubble');
  const [timeFilter, setTimeFilter] = useState<string>('today');

  const { data: observations, isLoading: observationsLoading } = useQuery<TelescopeObservation[]>({
    queryKey: ['/api/telescope/observations', selectedTelescope, timeFilter],
    refetchInterval: 600000, // 10 minutes
  });

  const { data: telescopes, isLoading: telescopesLoading } = useQuery<TelescopeStatus[]>({
    queryKey: ['/api/telescope/status'],
    refetchInterval: 300000, // 5 minutes
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-500';
      case 'observing': return 'text-blue-500';
      case 'maintenance': return 'text-yellow-500';
      case 'offline': return 'text-red-500';
      case 'scheduled': return 'text-gray-500';
      case 'completed': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      operational: 'bg-green-500',
      observing: 'bg-blue-500',
      maintenance: 'bg-yellow-500',
      offline: 'bg-red-500',
      scheduled: 'bg-gray-500',
      completed: 'bg-green-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (observationsLoading || telescopesLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading telescope data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
          Virtual Telescope Network
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Real-time feeds and schedules from Hubble, James Webb, and ground-based observatories
        </p>
      </div>

      <Tabs value={selectedTelescope} onValueChange={setSelectedTelescope} className="w-full">
        {/* Telescope Selection */}
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="hubble">Hubble Space Telescope</TabsTrigger>
          <TabsTrigger value="jwst">James Webb Space Telescope</TabsTrigger>
          <TabsTrigger value="ground">Ground Observatories</TabsTrigger>
        </TabsList>

        {/* Telescope Status Overview */}
        <div className="grid md:grid-cols-3 gap-6 mt-6">
          {telescopes?.map((telescope) => (
            <Card key={telescope.name} className="relative">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Telescope className="h-5 w-5" />
                    {telescope.name}
                  </CardTitle>
                  <Badge className={`${getStatusBadge(telescope.status)} text-white`}>
                    {telescope.status}
                  </Badge>
                </div>
                <CardDescription>{telescope.location}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {telescope.currentTarget && (
                  <div>
                    <div className="text-sm font-medium">Currently Observing:</div>
                    <div className="text-sm text-muted-foreground">{telescope.currentTarget}</div>
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium">Next Observation:</div>
                  <div className="text-sm text-muted-foreground">{telescope.nextObservation}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Instruments:</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {telescope.instruments.map((instrument) => (
                      <Badge key={instrument} variant="outline" className="text-xs">
                        {instrument}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Time Filter */}
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant={timeFilter === 'today' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeFilter('today')}
          >
            Today
          </Button>
          <Button
            variant={timeFilter === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeFilter('week')}
          >
            This Week
          </Button>
          <Button
            variant={timeFilter === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeFilter('month')}
          >
            This Month
          </Button>
        </div>

        {/* Observations by Telescope */}
        <TabsContent value="hubble" className="space-y-6">
          <div className="grid gap-6">
            <h2 className="text-2xl font-semibold">Hubble Space Telescope Observations</h2>
            {observations?.filter(obs => obs.telescope === 'Hubble').map((observation) => (
              <Card key={observation.id} className="overflow-hidden">
                <div className="md:flex">
                  {observation.imageUrl && (
                    <div className="md:w-1/3">
                      <img 
                        src={observation.imageUrl} 
                        alt={observation.target}
                        className="w-full h-48 md:h-full object-cover"
                      />
                    </div>
                  )}
                  <div className={`${observation.imageUrl ? 'md:w-2/3' : 'w-full'} p-6`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold">{observation.target}</h3>
                        <Badge variant="outline" className="mt-1">
                          {observation.type}
                        </Badge>
                      </div>
                      <Badge className={`${getStatusBadge(observation.status)} text-white`}>
                        {observation.status}
                      </Badge>
                    </div>
                    
                    <p className="text-muted-foreground mb-4">{observation.description}</p>
                    
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>Start: {formatTime(observation.startTime)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Duration: {formatDuration(observation.duration)}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>RA: {observation.coordinates.ra}, Dec: {observation.coordinates.dec}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-muted-foreground" />
                          <span>Instruments: {observation.instruments.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="jwst" className="space-y-6">
          <div className="grid gap-6">
            <h2 className="text-2xl font-semibold">James Webb Space Telescope Observations</h2>
            {observations?.filter(obs => obs.telescope === 'James Webb').map((observation) => (
              <Card key={observation.id} className="overflow-hidden">
                <div className="md:flex">
                  {observation.imageUrl && (
                    <div className="md:w-1/3">
                      <img 
                        src={observation.imageUrl} 
                        alt={observation.target}
                        className="w-full h-48 md:h-full object-cover"
                      />
                    </div>
                  )}
                  <div className={`${observation.imageUrl ? 'md:w-2/3' : 'w-full'} p-6`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold">{observation.target}</h3>
                        <Badge variant="outline" className="mt-1">
                          {observation.type}
                        </Badge>
                      </div>
                      <Badge className={`${getStatusBadge(observation.status)} text-white`}>
                        {observation.status}
                      </Badge>
                    </div>
                    
                    <p className="text-muted-foreground mb-4">{observation.description}</p>
                    
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>Start: {formatTime(observation.startTime)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Duration: {formatDuration(observation.duration)}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>RA: {observation.coordinates.ra}, Dec: {observation.coordinates.dec}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-muted-foreground" />
                          <span>Instruments: {observation.instruments.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ground" className="space-y-6">
          <div className="grid gap-6">
            <h2 className="text-2xl font-semibold">Ground-Based Observatory Network</h2>
            {observations?.filter(obs => obs.telescope.includes('Observatory')).map((observation) => (
              <Card key={observation.id} className="overflow-hidden">
                <div className="md:flex">
                  {observation.imageUrl && (
                    <div className="md:w-1/3">
                      <img 
                        src={observation.imageUrl} 
                        alt={observation.target}
                        className="w-full h-48 md:h-full object-cover"
                      />
                    </div>
                  )}
                  <div className={`${observation.imageUrl ? 'md:w-2/3' : 'w-full'} p-6`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold">{observation.target}</h3>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline">{observation.type}</Badge>
                          <Badge variant="outline">{observation.telescope}</Badge>
                        </div>
                      </div>
                      <Badge className={`${getStatusBadge(observation.status)} text-white`}>
                        {observation.status}
                      </Badge>
                    </div>
                    
                    <p className="text-muted-foreground mb-4">{observation.description}</p>
                    
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>Start: {formatTime(observation.startTime)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Duration: {formatDuration(observation.duration)}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>RA: {observation.coordinates.ra}, Dec: {observation.coordinates.dec}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-muted-foreground" />
                          <span>Instruments: {observation.instruments.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Information */}
      <Card>
        <CardHeader>
          <CardTitle>About the Virtual Telescope Network</CardTitle>
          <CardDescription>
            Real-time access to observations from the world's premier space and ground-based telescopes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-medium mb-2">Hubble Space Telescope</h4>
              <p className="text-muted-foreground">
                Operating since 1990, Hubble provides stunning visible light images of distant galaxies, 
                nebulae, and stellar phenomena from its orbit 340 miles above Earth.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">James Webb Space Telescope</h4>
              <p className="text-muted-foreground">
                The most powerful space telescope ever built, observing in infrared to see through cosmic dust 
                and study the earliest galaxies formed after the Big Bang.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Ground Observatories</h4>
              <p className="text-muted-foreground">
                A network of the world's largest ground-based telescopes, including Keck, VLT, and Gemini, 
                providing complementary observations and real-time sky monitoring.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}