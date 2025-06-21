import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, MapPin, Calendar, Battery, Thermometer, Gauge } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Navigation } from '@/components/navigation';
import { CosmicCursor } from '@/components/cosmic-cursor';
import { Footer } from '@/components/footer';

interface RoverPhoto {
  id: number;
  sol: number;
  camera: {
    id: number;
    name: string;
    rover_id: number;
    full_name: string;
  };
  img_src: string;
  earth_date: string;
  rover: {
    id: number;
    name: string;
    landing_date: string;
    launch_date: string;
    status: string;
  };
}

interface RoverStatus {
  name: string;
  status: 'active' | 'complete' | 'offline';
  sol: number;
  earthDate: string;
  landingDate: string;
  launchDate: string;
  totalPhotos: number;
  maxSol: number;
  maxDate: string;
  location: {
    latitude: number;
    longitude: number;
    site: string;
  };
  cameras: {
    name: string;
    full_name: string;
    photos: number;
  }[];
  weather?: {
    temperature: {
      high: number;
      low: number;
    };
    pressure: number;
    season: string;
  };
}

export default function MarsRoverPage() {
  const [selectedRover, setSelectedRover] = useState<string>('perseverance');
  const [selectedCamera, setSelectedCamera] = useState<string>('all');
  const [selectedSol, setSelectedSol] = useState<string>('latest');

  const { data: photos, isLoading: photosLoading } = useQuery<RoverPhoto[]>({
    queryKey: ['/api/mars/photos', selectedRover, selectedCamera, selectedSol],
    refetchInterval: 1800000, // 30 minutes
  });

  const { data: roverStatus, isLoading: statusLoading } = useQuery<RoverStatus[]>({
    queryKey: ['/api/mars/rovers'],
    refetchInterval: 3600000, // 1 hour
  });

  const rovers = [
    { 
      id: 'perseverance', 
      name: 'Perseverance', 
      nickname: 'Percy',
      description: 'Search for signs of ancient microbial life and collect rock samples'
    },
    { 
      id: 'curiosity', 
      name: 'Curiosity', 
      nickname: 'Curly',
      description: 'Assess Mars past and present habitability'
    },
    { 
      id: 'opportunity', 
      name: 'Opportunity', 
      nickname: 'Oppy',
      description: 'Completed 15-year mission studying Martian geology'
    },
    { 
      id: 'spirit', 
      name: 'Spirit', 
      nickname: 'Sprit',
      description: 'Studied Martian rocks and soil composition'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'complete': return 'bg-blue-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const formatSol = (sol: number) => {
    return `Sol ${sol.toLocaleString()}`;
  };

  const currentRover = roverStatus?.find(rover => rover.name.toLowerCase() === selectedRover);

  if (photosLoading || statusLoading) {
    return (
      <>
        <Navigation />
        <CosmicCursor />
        <div className="min-h-screen bg-gradient-to-b from-black via-blue-950/20 to-black pt-24">
            <div className="container mx-auto px-4 py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading Mars rover data...</p>
              </div>
            </div>
          </div>
        </>
    );
  }

  return (
    <>
      <Navigation />
      <CosmicCursor />
      <div className="min-h-screen bg-gradient-to-b from-black via-blue-950/20 to-black pt-24">
          <div className="container mx-auto px-4 py-8 space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
          Mars Rover Mission Control
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Real photos and updates from Perseverance, Curiosity, and historic rovers with interactive landing site maps
        </p>
      </div>

      <Tabs value={selectedRover} onValueChange={setSelectedRover} className="w-full">
        {/* Rover Selection */}
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          {rovers.map(rover => (
            <TabsTrigger key={rover.id} value={rover.id}>
              {rover.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Rover Status Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          {roverStatus?.map((rover) => (
            <Card key={rover.name} className="relative">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{rover.name}</CardTitle>
                  <Badge className={`${getStatusColor(rover.status)} text-white`}>
                    {rover.status}
                  </Badge>
                </div>
                <CardDescription>{rover.location.site}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Current Sol</div>
                    <div className="text-muted-foreground">{formatSol(rover.sol)}</div>
                  </div>
                  <div>
                    <div className="font-medium">Total Photos</div>
                    <div className="text-muted-foreground">{rover.totalPhotos.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="font-medium">Landing Date</div>
                    <div className="text-muted-foreground">{new Date(rover.landingDate).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="font-medium">Mission Days</div>
                    <div className="text-muted-foreground">{rover.maxSol.toLocaleString()}</div>
                  </div>
                </div>
                
                {rover.weather && (
                  <div className="border-t pt-3">
                    <div className="text-sm font-medium mb-2">Latest Weather</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <Thermometer className="h-3 w-3" />
                        <span>{rover.weather.temperature.high}°C / {rover.weather.temperature.low}°C</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Gauge className="h-3 w-3" />
                        <span>{rover.weather.pressure} Pa</span>
                      </div>
                      <div className="col-span-2 text-muted-foreground">
                        Season: {rover.weather.season}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Individual Rover Content */}
        {rovers.map(rover => (
          <TabsContent key={rover.id} value={rover.id} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-red-500" />
                  {rover.name} ({rover.nickname}) Mission Overview
                </CardTitle>
                <CardDescription>{rover.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {currentRover && (
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Mission Timeline</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Launched: {new Date(currentRover.launchDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>Landed: {new Date(currentRover.landingDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Current Earth Date: {new Date(currentRover.earthDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Landing Site</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Location:</strong> {currentRover.location.site}</div>
                        <div><strong>Coordinates:</strong> {currentRover.location.latitude.toFixed(3)}°N, {currentRover.location.longitude.toFixed(3)}°E</div>
                        <div><strong>Current Sol:</strong> {formatSol(currentRover.sol)}</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Available Cameras</h4>
                      <div className="space-y-1">
                        {currentRover.cameras.map((camera) => (
                          <div key={camera.name} className="flex justify-between text-sm">
                            <span>{camera.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {camera.photos.toLocaleString()} photos
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Photo Filters */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex gap-2">
                <Button
                  variant={selectedCamera === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCamera('all')}
                >
                  All Cameras
                </Button>
                {currentRover?.cameras.slice(0, 4).map((camera) => (
                  <Button
                    key={camera.name}
                    variant={selectedCamera === camera.name ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCamera(camera.name)}
                  >
                    {camera.name}
                  </Button>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={selectedSol === 'latest' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedSol('latest')}
                >
                  Latest Sol
                </Button>
                <Button
                  variant={selectedSol === 'random' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedSol('random')}
                >
                  Random Sol
                </Button>
              </div>
            </div>

            {/* Photo Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {photos?.slice(0, 12).map((photo) => (
                <Card key={photo.id} className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all">
                  <div className="relative">
                    <img 
                      src={photo.img_src} 
                      alt={`${photo.rover.name} - ${photo.camera.full_name}`}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-black/70 text-white">
                        {photo.camera.name}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{photo.camera.full_name}</h4>
                        <Badge variant="outline">{formatSol(photo.sol)}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(photo.earth_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Camera className="h-3 w-3" />
                          <span>Photo ID: {photo.id}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {photos && photos.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Photos Available</h3>
                  <p className="text-muted-foreground">
                    No photos found for the selected filters. Try selecting a different camera or sol.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Mission Information */}
      <Card>
        <CardHeader>
          <CardTitle>About Mars Rover Missions</CardTitle>
          <CardDescription>
            Exploring the Red Planet through robotic explorers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium mb-2">What is a Sol?</h4>
              <p className="text-muted-foreground mb-4">
                A sol is a Martian day, approximately 24 hours and 37 minutes long. 
                Rovers use sols to track their mission timeline since landing.
              </p>
              
              <h4 className="font-medium mb-2">Camera Types</h4>
              <div className="space-y-1 text-muted-foreground">
                <div><strong>FHAZ/RHAZ:</strong> Front/Rear Hazard Avoidance Cameras</div>
                <div><strong>MAST:</strong> Mast Camera for panoramic views</div>
                <div><strong>NAVCAM:</strong> Navigation Camera for path planning</div>
                <div><strong>CHEMCAM:</strong> Chemical analysis laser imaging</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Current Active Missions</h4>
              <div className="space-y-2 text-muted-foreground">
                <div>
                  <strong>Perseverance (2021-present):</strong> Searching for signs of ancient life 
                  and collecting samples for future return to Earth.
                </div>
                <div>
                  <strong>Curiosity (2012-present):</strong> Studying Martian climate and geology 
                  to understand the planet's past habitability.
                </div>
              </div>
              
              <h4 className="font-medium mb-2 mt-4">Image Processing</h4>
              <p className="text-muted-foreground">
                All images are transmitted to Earth via NASA's Deep Space Network and processed 
                at JPL before being made available to the public.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
        </div>
      </div>
      <Footer />
    </>
  );
}