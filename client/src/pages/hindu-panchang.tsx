import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, MapPin, Sun, Moon, Star, Sunrise, Sunset } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navigation } from '@/components/navigation';
import { CosmicCursor } from '@/components/cosmic-cursor';

interface LocationData {
  latitude: number;
  longitude: number;
  timezone: string;
  city: string;
}

interface PanchangData {
  date: string;
  tithi: {
    name: string;
    deity: string;
    type?: string;
    number?: number;
    start?: string;
    end?: string;
    nextTithi?: string;
    meaning?: string;
    special?: string;
    significance: string;
    endTime: string;
  };
  nakshatra: {
    name: string;
    lord?: string;
    deity: string;
    number?: number;
    start?: string;
    end?: string;
    nextNakshatra?: string;
    meaning?: string;
    special?: string;
    summary?: string;
    words?: string;
    qualities: string;
    endTime: string;
  };
  yoga: {
    name: string;
    number?: number;
    start?: string;
    end?: string;
    meaning: string;
    special?: string;
    nextYoga?: string;
    endTime: string;
  };
  karana: {
    name: string;
    lord?: string;
    deity?: string;
    type?: string;
    number?: number;
    start?: string;
    end?: string;
    special?: string;
    nextKarana?: string;
    meaning: string;
    endTime: string;
  };
  rashi: {
    name: string;
    element: string;
    lord: string;
  };
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  shubhMuhurat: {
    abhijitMuhurat: string;
    brahmaRahukaal: string;
    gulikaKaal: string;
    yamaGandaKaal: string;
  };
  advancedDetails?: {
    solarNoon: string;
    nextFullMoon: string;
    nextNewMoon: string;
    masa: {
      amantaName: string;
      purnimaName: string;
      adhikMaasa: boolean;
      ayana: string;
      moonPhase: string;
      paksha: string;
      ritu: string;
    };
    vaara: string;
    dishaShool: string;
  };
  auspiciousTimes?: Array<{
    name: string;
    time: string;
    description: string;
  }>;
  inauspiciousTimes?: Array<{
    name: string;
    time: string;
    description: string;
  }>;
  festivals: string[];
  vratsAndOccasions: string[];
}

export default function HinduPanchangPage() {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Get user location with browser geolocation
  const [userCoords, setUserCoords] = useState<{lat: number, lon: number} | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.log("Geolocation error:", error.message);
          setLocationError(error.message);
          // Use default coordinates as fallback
          setUserCoords({ lat: 19.0760, lon: 72.8777 });
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      setLocationError("Geolocation not supported");
      setUserCoords({ lat: 19.0760, lon: 72.8777 });
    }
  }, []);

  // Get location details using coordinates
  const { data: locationData } = useQuery<LocationData>({
    queryKey: ['/api/location', userCoords?.lat, userCoords?.lon],
    enabled: !!userCoords,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get Panchang data using coordinates
  const { data: panchangData, isLoading: panchangLoading } = useQuery<PanchangData>({
    queryKey: ['/api/panchang', userCoords?.lat, userCoords?.lon],
    enabled: !!userCoords,
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (panchangLoading) {
    return (
      <>
        <Navigation />
        <CosmicCursor />
        <div className="min-h-screen bg-gradient-to-b from-black via-orange-950/20 to-black pt-24">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading Panchang data...</p>
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
      <div className="min-h-screen bg-gradient-to-b from-black via-orange-950/20 to-black pt-24">
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Location Chip */}
          {locationData?.city && (
            <div className="flex justify-center">
              <Badge variant="outline" className="px-4 py-2 text-sm bg-orange-500/10 border-orange-500/30 text-orange-400">
                📍 {locationData.city}
              </Badge>
            </div>
          )}

          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 via-red-500 to-yellow-500 bg-clip-text text-transparent">
              Hindu Panchang
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Daily Hindu calendar with Tithi, Nakshatra, Yoga, Karana and auspicious timings
            </p>
          </div>

          {/* Current Date and Time */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-l-4 border-l-orange-500">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5 text-orange-500" />
                  Today's Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-orange-500">
                  {formatDate(currentTime)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {locationData?.timezone || 'Local Time'}
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5 text-red-500" />
                  Current Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-red-500">
                  {formatTime(currentTime)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Hindu Standard Time
                </div>
              </CardContent>
            </Card>
          </div>

          {panchangData && (
            <>
              {/* Main Panchang Elements */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border-orange-500/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-400">
                      <Moon className="h-5 w-5" />
                      Tithi
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{panchangData.tithi.name}</h3>
                        {panchangData.tithi.number && (
                          <Badge variant="secondary" className="text-xs">
                            #{panchangData.tithi.number}
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          <strong>Deity:</strong> {panchangData.tithi.deity}
                        </p>
                        {panchangData.tithi.type && (
                          <p className="text-sm text-muted-foreground">
                            <strong>Type:</strong> {panchangData.tithi.type}
                          </p>
                        )}
                        {panchangData.tithi.meaning && (
                          <p className="text-xs text-muted-foreground">
                            <strong>Meaning:</strong> {panchangData.tithi.meaning}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          <strong>Significance:</strong> {panchangData.tithi.significance}
                        </p>
                        {panchangData.tithi.special && (
                          <p className="text-xs text-orange-400">
                            <strong>Special:</strong> {panchangData.tithi.special}
                          </p>
                        )}
                        {panchangData.tithi.start && panchangData.tithi.end && (
                          <div className="text-xs text-muted-foreground">
                            <p><strong>Start:</strong> {panchangData.tithi.start}</p>
                            <p><strong>End:</strong> {panchangData.tithi.end}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-xs">
                          Ends: {panchangData.tithi.endTime}
                        </Badge>
                        {panchangData.tithi.nextTithi && (
                          <Badge variant="outline" className="text-xs bg-orange-500/10">
                            Next: {panchangData.tithi.nextTithi}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-400">
                      <Star className="h-5 w-5" />
                      Nakshatra
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{panchangData.nakshatra.name}</h3>
                        {panchangData.nakshatra.number && (
                          <Badge variant="secondary" className="text-xs">
                            #{panchangData.nakshatra.number}
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          <strong>Deity:</strong> {panchangData.nakshatra.deity}
                        </p>
                        {panchangData.nakshatra.lord && (
                          <p className="text-sm text-muted-foreground">
                            <strong>Lord:</strong> {panchangData.nakshatra.lord}
                          </p>
                        )}
                        {panchangData.nakshatra.meaning && (
                          <p className="text-xs text-muted-foreground">
                            <strong>Meaning:</strong> {panchangData.nakshatra.meaning}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          <strong>Qualities:</strong> {panchangData.nakshatra.qualities}
                        </p>
                        {panchangData.nakshatra.summary && (
                          <p className="text-xs text-blue-400">
                            <strong>Summary:</strong> {panchangData.nakshatra.summary}
                          </p>
                        )}
                        {panchangData.nakshatra.words && (
                          <p className="text-xs text-muted-foreground">
                            <strong>Words:</strong> {panchangData.nakshatra.words}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-xs">
                          Ends: {panchangData.nakshatra.endTime}
                        </Badge>
                        {panchangData.nakshatra.nextNakshatra && (
                          <Badge variant="outline" className="text-xs bg-blue-500/10">
                            Next: {panchangData.nakshatra.nextNakshatra}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-900/20 to-teal-900/20 border-green-500/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-400">
                      <Sun className="h-5 w-5" />
                      Yoga
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{panchangData.yoga.name}</h3>
                        {panchangData.yoga.number && (
                          <Badge variant="secondary" className="text-xs">
                            #{panchangData.yoga.number}
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          <strong>Meaning:</strong> {panchangData.yoga.meaning}
                        </p>
                        {panchangData.yoga.special && (
                          <p className="text-xs text-green-400">
                            <strong>Special:</strong> {panchangData.yoga.special}
                          </p>
                        )}
                        {panchangData.yoga.start && panchangData.yoga.end && (
                          <div className="text-xs text-muted-foreground">
                            <p><strong>Start:</strong> {panchangData.yoga.start}</p>
                            <p><strong>End:</strong> {panchangData.yoga.end}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-xs">
                          Ends: {panchangData.yoga.endTime}
                        </Badge>
                        {panchangData.yoga.nextYoga && (
                          <Badge variant="outline" className="text-xs bg-green-500/10">
                            Next: {panchangData.yoga.nextYoga}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-500/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-yellow-400">
                      <Calendar className="h-5 w-5" />
                      Karana
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{panchangData.karana.name}</h3>
                        {panchangData.karana.number && (
                          <Badge variant="secondary" className="text-xs">
                            #{panchangData.karana.number}
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-1">
                        {panchangData.karana.lord && (
                          <p className="text-sm text-muted-foreground">
                            <strong>Lord:</strong> {panchangData.karana.lord}
                          </p>
                        )}
                        {panchangData.karana.deity && (
                          <p className="text-sm text-muted-foreground">
                            <strong>Deity:</strong> {panchangData.karana.deity}
                          </p>
                        )}
                        {panchangData.karana.type && (
                          <p className="text-sm text-muted-foreground">
                            <strong>Type:</strong> {panchangData.karana.type}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          <strong>Meaning:</strong> {panchangData.karana.meaning}
                        </p>
                        {panchangData.karana.special && (
                          <p className="text-xs text-yellow-400">
                            <strong>Special:</strong> {panchangData.karana.special}
                          </p>
                        )}
                        {panchangData.karana.start && panchangData.karana.end && (
                          <div className="text-xs text-muted-foreground">
                            <p><strong>Start:</strong> {panchangData.karana.start}</p>
                            <p><strong>End:</strong> {panchangData.karana.end}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-xs">
                          Ends: {panchangData.karana.endTime}
                        </Badge>
                        {panchangData.karana.nextKarana && (
                          <Badge variant="outline" className="text-xs bg-yellow-500/10">
                            Next: {panchangData.karana.nextKarana}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sun and Moon Timings */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-l-4 border-l-yellow-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Sunrise className="h-5 w-5 text-yellow-500" />
                      Sunrise
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-500">
                      {panchangData.sunrise}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Sunset className="h-5 w-5 text-orange-500" />
                      Sunset
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-500">
                      {panchangData.sunset}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-400">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Moon className="h-5 w-5 text-blue-400" />
                      Moonrise
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-400">
                      {panchangData.moonrise}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-400">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Moon className="h-5 w-5 text-purple-400" />
                      Moonset
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-400">
                      {panchangData.moonset}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Auspicious Timings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-green-500" />
                    Shubh Muhurat & Timings
                  </CardTitle>
                  <CardDescription>
                    Auspicious and inauspicious timings for the day
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-green-400">Abhijit Muhurat</h4>
                      <Badge variant="outline" className="bg-green-500/10 text-green-400">
                        {panchangData.shubhMuhurat.abhijitMuhurat}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-red-400">Rahu Kaal</h4>
                      <Badge variant="outline" className="bg-red-500/10 text-red-400">
                        {panchangData.shubhMuhurat.brahmaRahukaal}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-orange-400">Gulika Kaal</h4>
                      <Badge variant="outline" className="bg-orange-500/10 text-orange-400">
                        {panchangData.shubhMuhurat.gulikaKaal}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-purple-400">Yama Ganda</h4>
                      <Badge variant="outline" className="bg-purple-500/10 text-purple-400">
                        {panchangData.shubhMuhurat.yamaGandaKaal}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rashi Information */}
              <Card className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-indigo-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-indigo-400">
                    <Star className="h-5 w-5" />
                    Moon Rashi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold">{panchangData.rashi.name}</h3>
                    <div className="flex gap-4">
                      <Badge variant="outline" className="bg-indigo-500/10">
                        Element: {panchangData.rashi.element}
                      </Badge>
                      <Badge variant="outline" className="bg-purple-500/10">
                        Lord: {panchangData.rashi.lord}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Auspicious and Inauspicious Times */}
              {(panchangData.auspiciousTimes || panchangData.inauspiciousTimes) && (
                <div className="grid md:grid-cols-2 gap-6">
                  {panchangData.auspiciousTimes && panchangData.auspiciousTimes.length > 0 && (
                    <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/30">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-400">
                          <Clock className="h-5 w-5" />
                          Auspicious Times
                        </CardTitle>
                        <CardDescription>
                          Favorable periods for important activities
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {panchangData.auspiciousTimes.map((time, index) => (
                            <div key={index} className="border-l-2 border-green-500 pl-3">
                              <h4 className="font-semibold text-green-400">{time.name}</h4>
                              <Badge variant="outline" className="bg-green-500/10 text-green-400 mb-1">
                                {time.time}
                              </Badge>
                              <p className="text-xs text-muted-foreground">{time.description}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {panchangData.inauspiciousTimes && panchangData.inauspiciousTimes.length > 0 && (
                    <Card className="bg-gradient-to-br from-red-900/20 to-rose-900/20 border-red-500/30">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-400">
                          <Clock className="h-5 w-5" />
                          Inauspicious Times
                        </CardTitle>
                        <CardDescription>
                          Periods to avoid for important activities
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {panchangData.inauspiciousTimes.map((time, index) => (
                            <div key={index} className="border-l-2 border-red-500 pl-3">
                              <h4 className="font-semibold text-red-400">{time.name}</h4>
                              <Badge variant="outline" className="bg-red-500/10 text-red-400 mb-1">
                                {time.time}
                              </Badge>
                              <p className="text-xs text-muted-foreground">{time.description}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Advanced Panchang Details */}
              {panchangData.advancedDetails && (
                <Card className="bg-gradient-to-br from-violet-900/20 to-purple-900/20 border-violet-500/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-violet-400">
                      <Star className="h-5 w-5" />
                      Advanced Panchang Details
                    </CardTitle>
                    <CardDescription>
                      Detailed astronomical and calendar information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-violet-400">Calendar Info</h4>
                        <div className="space-y-1 text-sm">
                          <p><strong>Vaara:</strong> {panchangData.advancedDetails.vaara}</p>
                          <p><strong>Masa (Amanta):</strong> {panchangData.advancedDetails.masa.amantaName}</p>
                          <p><strong>Masa (Purnima):</strong> {panchangData.advancedDetails.masa.purnimaName}</p>
                          <p><strong>Paksha:</strong> {panchangData.advancedDetails.masa.paksha}</p>
                          <p><strong>Ritu:</strong> {panchangData.advancedDetails.masa.ritu}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-violet-400">Astronomical</h4>
                        <div className="space-y-1 text-sm">
                          <p><strong>Solar Noon:</strong> {panchangData.advancedDetails.solarNoon}</p>
                          <p><strong>Ayana:</strong> {panchangData.advancedDetails.masa.ayana}</p>
                          <p><strong>Moon Phase:</strong> {panchangData.advancedDetails.masa.moonPhase}</p>
                          <p><strong>Next Full Moon:</strong> {panchangData.advancedDetails.nextFullMoon}</p>
                          <p><strong>Next New Moon:</strong> {panchangData.advancedDetails.nextNewMoon}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-violet-400">Direction</h4>
                        <div className="space-y-1 text-sm">
                          <p><strong>Disha Shool:</strong> {panchangData.advancedDetails.dishaShool}</p>
                          <Badge variant="outline" className="bg-violet-500/10 text-violet-400">
                            Avoid travel in this direction
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Festivals and Occasions */}
              {(panchangData.festivals.length > 0 || panchangData.vratsAndOccasions.length > 0) && (
                <div className="grid md:grid-cols-2 gap-6">
                  {panchangData.festivals.length > 0 && (
                    <Card className="bg-gradient-to-br from-pink-900/20 to-red-900/20 border-pink-500/30">
                      <CardHeader>
                        <CardTitle className="text-pink-400">Festivals Today</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {panchangData.festivals.map((festival, index) => (
                            <Badge key={index} variant="outline" className="mr-2 mb-2 bg-pink-500/10">
                              {festival}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {panchangData.vratsAndOccasions.length > 0 && (
                    <Card className="bg-gradient-to-br from-teal-900/20 to-green-900/20 border-teal-500/30">
                      <CardHeader>
                        <CardTitle className="text-teal-400">Vrats & Occasions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {panchangData.vratsAndOccasions.map((vrat, index) => (
                            <Badge key={index} variant="outline" className="mr-2 mb-2 bg-teal-500/10">
                              {vrat}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}