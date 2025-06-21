import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Zap, Sun, Shield, Globe } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Navigation } from '@/components/navigation';
import { CosmicCursor } from '@/components/cosmic-cursor';

interface SpaceWeatherData {
  solarWind: {
    speed: number;
    density: number;
    temperature: number;
  };
  geomagneticActivity: {
    kpIndex: number;
    activity: string;
    forecast: string;
  };
  solarFlares: {
    class: string;
    region: string;
    time: string;
    intensity: number;
  }[];
  auroraForecast: {
    visibility: number;
    activity: string;
    viewingTime: string;
  };
  alerts: {
    type: string;
    severity: string;
    message: string;
    issued: string;
  }[];
}

export default function SpaceWeatherPage() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

  const { data: spaceWeather, isLoading } = useQuery<SpaceWeatherData>({
    queryKey: ['/api/space-weather'],
    refetchInterval: 300000, // 5 minutes
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
          // Default to moderate latitude for aurora visibility
          setUserLocation({ lat: 45, lon: 0 });
        }
      );
    }
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'extreme': return 'text-red-500';
      case 'severe': return 'text-orange-500';
      case 'moderate': return 'text-yellow-500';
      case 'minor': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getKpColor = (kp: number) => {
    if (kp >= 7) return 'bg-red-500';
    if (kp >= 5) return 'bg-orange-500';
    if (kp >= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading space weather data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
          Space Weather Dashboard
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Real-time monitoring of solar activity, geomagnetic storms, and aurora forecasts
        </p>
      </div>

      {/* Active Alerts */}
      {spaceWeather?.alerts && spaceWeather.alerts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-orange-500" />
            Active Space Weather Alerts
          </h2>
          <div className="grid gap-4">
            {spaceWeather.alerts.map((alert, index) => (
              <Card key={index} className="border-l-4 border-l-orange-500">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{alert.type}</CardTitle>
                    <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-2">{alert.message}</p>
                  <p className="text-xs text-muted-foreground">Issued: {new Date(alert.issued).toLocaleString()}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Current Conditions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Solar Wind */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-yellow-500" />
              Solar Wind
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm">
                <span>Speed</span>
                <span className="font-mono">{spaceWeather?.solarWind.speed || 450} km/s</span>
              </div>
              <Progress value={(spaceWeather?.solarWind.speed || 450) / 10} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>Density</span>
                <span className="font-mono">{spaceWeather?.solarWind.density || 8.5} /cm³</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>Temperature</span>
                <span className="font-mono">{spaceWeather?.solarWind.temperature || 150000} K</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Geomagnetic Activity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              Geomagnetic
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Kp Index</span>
                <Badge className={`${getKpColor(spaceWeather?.geomagneticActivity.kpIndex || 2)} text-white`}>
                  {spaceWeather?.geomagneticActivity.kpIndex || 2}
                </Badge>
              </div>
              <Progress value={(spaceWeather?.geomagneticActivity.kpIndex || 2) * 11.11} className="h-2 mt-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>Activity</span>
                <span>{spaceWeather?.geomagneticActivity.activity || 'Quiet'}</span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              {spaceWeather?.geomagneticActivity.forecast || '24h forecast: Quiet to unsettled'}
            </div>
          </CardContent>
        </Card>

        {/* Solar Flares */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-red-500" />
              Solar Flares
            </CardTitle>
          </CardHeader>
          <CardContent>
            {spaceWeather?.solarFlares && spaceWeather.solarFlares.length > 0 ? (
              <div className="space-y-3">
                {spaceWeather.solarFlares.slice(0, 3).map((flare, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className="text-red-500">
                        {flare.class}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{flare.region}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{flare.time}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-4">
                <div className="text-sm">No recent flares</div>
                <div className="text-xs">Past 24 hours</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Aurora Forecast */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-green-500" />
              Aurora Forecast
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm">
                <span>Visibility</span>
                <span>{spaceWeather?.auroraForecast.visibility || 35}%</span>
              </div>
              <Progress value={spaceWeather?.auroraForecast.visibility || 35} className="h-2 mt-1" />
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>Activity</span>
                <span>{spaceWeather?.auroraForecast.activity || 'Low'}</span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Best viewing: {spaceWeather?.auroraForecast.viewingTime || '10 PM - 2 AM local time'}
            </div>
            {userLocation && (
              <div className="text-xs text-muted-foreground">
                Your location: {userLocation.lat.toFixed(1)}°N, {Math.abs(userLocation.lon).toFixed(1)}°{userLocation.lon >= 0 ? 'E' : 'W'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Educational Info */}
      <Card>
        <CardHeader>
          <CardTitle>Understanding Space Weather</CardTitle>
          <CardDescription>
            How solar activity affects Earth and technology
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium mb-2">Kp Index Scale</h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>0-2: Quiet</span>
                  <span className="text-green-500">● Normal conditions</span>
                </div>
                <div className="flex justify-between">
                  <span>3-4: Unsettled</span>
                  <span className="text-yellow-500">● Minor fluctuations</span>
                </div>
                <div className="flex justify-between">
                  <span>5-6: Storm</span>
                  <span className="text-orange-500">● Aurora visible at lower latitudes</span>
                </div>
                <div className="flex justify-between">
                  <span>7-9: Severe</span>
                  <span className="text-red-500">● Satellite disruptions possible</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Solar Flare Classes</h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>A, B: Background</span>
                  <span className="text-gray-500">● Minimal impact</span>
                </div>
                <div className="flex justify-between">
                  <span>C: Small</span>
                  <span className="text-blue-500">● Few noticeable effects</span>
                </div>
                <div className="flex justify-between">
                  <span>M: Medium</span>
                  <span className="text-orange-500">● Radio blackouts possible</span>
                </div>
                <div className="flex justify-between">
                  <span>X: Large</span>
                  <span className="text-red-500">● Significant disruptions</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}