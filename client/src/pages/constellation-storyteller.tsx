import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Clock, Eye, Star, Moon, Sun, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Navigation } from '@/components/navigation';
import { CosmicCursor } from '@/components/cosmic-cursor';

interface Constellation {
  id: string;
  name: string;
  latinName: string;
  abbreviation: string;
  mythology: {
    culture: string;
    story: string;
    meaning: string;
    characters: string[];
  };
  astronomy: {
    brightestStar: string;
    starCount: number;
    area: number;
    visibility: {
      hemisphere: 'northern' | 'southern' | 'both';
      bestMonth: string;
      declination: number;
    };
  };
  coordinates: {
    ra: number;
    dec: number;
  };
  stars: {
    name: string;
    magnitude: number;
    type: string;
    distance: number;
  }[];
  deepSkyObjects: {
    name: string;
    type: string;
    magnitude: number;
    description: string;
  }[];
  imageUrl: string;
  starMapUrl: string;
}

interface LocationData {
  latitude: number;
  longitude: number;
  timezone: string;
  city: string;
}

interface SkyConditions {
  visibleConstellations: string[];
  moonPhase: string;
  moonIllumination: number;
  bestViewingTime: string;
  conditions: string;
}

export default function ConstellationStorytellerPage() {
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [selectedConstellation, setSelectedConstellation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  const { data: constellations, isLoading: constellationsLoading } = useQuery<Constellation[]>({
    queryKey: ['/api/constellations'],
  });

  const { data: skyConditions, isLoading: skyLoading } = useQuery<SkyConditions>({
    queryKey: ['/api/sky-conditions', userLocation?.latitude, userLocation?.longitude],
    enabled: !!userLocation,
    refetchInterval: 3600000, // 1 hour
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Get timezone and city information
          try {
            const response = await fetch(`/api/location?lat=${latitude}&lon=${longitude}`);
            const locationData = await response.json();
            setUserLocation({
              latitude,
              longitude,
              timezone: locationData.timezone || 'UTC',
              city: locationData.city || 'Unknown'
            });
          } catch (error) {
            setUserLocation({
              latitude,
              longitude,
              timezone: 'UTC',
              city: 'Unknown'
            });
          }
        },
        () => {
          // Default to moderate northern latitude
          setUserLocation({
            latitude: 40.7128,
            longitude: -74.0060,
            timezone: 'America/New_York',
            city: 'New York'
          });
        }
      );
    }

    // Update time every minute
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const isConstellationVisible = (constellation: Constellation) => {
    if (!userLocation || !skyConditions) return true;
    return skyConditions.visibleConstellations.includes(constellation.id);
  };

  const getVisibilityText = (constellation: Constellation) => {
    if (!userLocation) return 'Location needed for visibility';
    
    const { hemisphere } = constellation.astronomy.visibility;
    const userLat = userLocation.latitude;
    
    if (hemisphere === 'northern' && userLat < 0) return 'Not visible from southern hemisphere';
    if (hemisphere === 'southern' && userLat > 0) return 'Not visible from northern hemisphere';
    
    return isConstellationVisible(constellation) ? 'Currently visible' : 'Not currently visible';
  };

  const filteredConstellations = constellations?.filter(constellation =>
    constellation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    constellation.latinName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    constellation.mythology.culture.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConstellationData = constellations?.find(c => c.id === selectedConstellation);

  if (constellationsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading constellation data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
          Constellation Storyteller
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Click on star patterns to hear mythology and navigate the night sky based on your location and time
        </p>
      </div>

      {/* Location and Sky Status */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Your Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userLocation ? (
              <div className="space-y-2 text-sm">
                <div><strong>City:</strong> {userLocation.city}</div>
                <div><strong>Coordinates:</strong> {userLocation.latitude.toFixed(2)}°, {userLocation.longitude.toFixed(2)}°</div>
                <div><strong>Timezone:</strong> {userLocation.timezone}</div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Requesting location access...
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Current Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><strong>Local Time:</strong> {currentTime.toLocaleTimeString()}</div>
              <div><strong>Date:</strong> {currentTime.toLocaleDateString()}</div>
              {skyConditions && (
                <div><strong>Best Viewing:</strong> {skyConditions.bestViewingTime}</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5" />
              Sky Conditions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {skyConditions ? (
              <div className="space-y-2 text-sm">
                <div><strong>Moon Phase:</strong> {skyConditions.moonPhase}</div>
                <div><strong>Illumination:</strong> {skyConditions.moonIllumination}%</div>
                <div><strong>Conditions:</strong> {skyConditions.conditions}</div>
                <div><strong>Visible:</strong> {skyConditions.visibleConstellations.length} constellations</div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                {skyLoading ? 'Loading sky data...' : 'Location needed for sky conditions'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search constellations, mythology, or culture..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={() => setSearchQuery('')}>
          Clear
        </Button>
      </div>

      {/* Constellation Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredConstellations?.map((constellation) => (
          <Card 
            key={constellation.id} 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedConstellation === constellation.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedConstellation(constellation.id)}
          >
            <div className="relative">
              <img 
                src={constellation.imageUrl} 
                alt={constellation.name}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <Badge className={isConstellationVisible(constellation) ? 'bg-green-500' : 'bg-gray-500'}>
                  <Eye className="h-3 w-3 mr-1" />
                  {isConstellationVisible(constellation) ? 'Visible' : 'Hidden'}
                </Badge>
              </div>
            </div>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span>{constellation.name}</span>
                <Badge variant="outline">{constellation.abbreviation}</Badge>
              </CardTitle>
              <CardDescription>{constellation.latinName}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div><strong>Culture:</strong> {constellation.mythology.culture}</div>
                <div><strong>Brightest Star:</strong> {constellation.astronomy.brightestStar}</div>
                <div><strong>Stars:</strong> {constellation.astronomy.starCount}</div>
                <div><strong>Best Month:</strong> {constellation.astronomy.visibility.bestMonth}</div>
                <div className="flex items-center gap-2">
                  <Star className="h-3 w-3" />
                  <span>{getVisibilityText(constellation)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Constellation Details */}
      {selectedConstellationData && (
        <Card className="border-blue-500 border-2">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Star className="h-6 w-6 text-blue-500" />
              {selectedConstellationData.name} ({selectedConstellationData.latinName})
            </CardTitle>
            <CardDescription className="text-lg">
              {selectedConstellationData.mythology.culture} Mythology
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Star Map */}
              <div>
                <img 
                  src={selectedConstellationData.starMapUrl} 
                  alt={`${selectedConstellationData.name} star map`}
                  className="w-full rounded-lg border"
                />
              </div>

              {/* Mythology Story */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-lg mb-2">The Story</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedConstellationData.mythology.story}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Meaning</h4>
                  <p className="text-muted-foreground">
                    {selectedConstellationData.mythology.meaning}
                  </p>
                </div>

                {selectedConstellationData.mythology.characters.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Key Characters</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedConstellationData.mythology.characters.map((character) => (
                        <Badge key={character} variant="outline">
                          {character}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Astronomical Data */}
            <div className="grid md:grid-cols-2 gap-6 border-t pt-6">
              <div>
                <h4 className="font-semibold mb-3">Notable Stars</h4>
                <div className="space-y-2">
                  {selectedConstellationData.stars.slice(0, 5).map((star) => (
                    <div key={star.name} className="flex justify-between items-center text-sm">
                      <span className="font-medium">{star.name}</span>
                      <div className="text-right text-muted-foreground">
                        <div>Mag: {star.magnitude}</div>
                        <div>{star.distance} ly</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Deep Sky Objects</h4>
                <div className="space-y-2">
                  {selectedConstellationData.deepSkyObjects.slice(0, 3).map((object) => (
                    <div key={object.name} className="text-sm">
                      <div className="flex justify-between items-start">
                        <span className="font-medium">{object.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {object.type}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-xs mt-1">
                        {object.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Viewing Information */}
            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Viewing Information
              </h4>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <strong>Best Month:</strong> {selectedConstellationData.astronomy.visibility.bestMonth}
                </div>
                <div>
                  <strong>Hemisphere:</strong> {selectedConstellationData.astronomy.visibility.hemisphere}
                </div>
                <div>
                  <strong>Area:</strong> {selectedConstellationData.astronomy.area} sq. degrees
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Information */}
      <Card>
        <CardHeader>
          <CardTitle>About Constellations</CardTitle>
          <CardDescription>
            Ancient patterns connecting mythology with astronomy
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium mb-2">Cultural Significance</h4>
              <p className="text-muted-foreground mb-4">
                Constellations have been used by cultures worldwide for navigation, 
                timekeeping, and storytelling for thousands of years. Each culture 
                developed unique interpretations of the same star patterns.
              </p>
              
              <h4 className="font-medium mb-2">Modern Astronomy</h4>
              <p className="text-muted-foreground">
                Today, the International Astronomical Union recognizes 88 official 
                constellations that divide the entire celestial sphere, serving as 
                a coordinate system for locating celestial objects.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Observation Tips</h4>
              <ul className="text-muted-foreground space-y-1">
                <li>• Find a dark location away from city lights</li>
                <li>• Allow 20-30 minutes for your eyes to adjust</li>
                <li>• Use red light to preserve night vision</li>
                <li>• Start with bright constellations like Orion or Big Dipper</li>
                <li>• Check moon phase - new moon provides darkest skies</li>
              </ul>
              
              <h4 className="font-medium mb-2 mt-4">Star Magnitudes</h4>
              <p className="text-muted-foreground">
                Lower magnitude numbers indicate brighter stars. The brightest 
                stars have negative magnitudes, while the faintest visible to 
                the naked eye are around magnitude 6.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}