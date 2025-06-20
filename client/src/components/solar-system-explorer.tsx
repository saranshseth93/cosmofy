import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, Info, Zap } from 'lucide-react';

interface Planet {
  id: string;
  name: string;
  radius: number; // Relative to Earth
  distance: number; // AU from Sun
  orbitalPeriod: number; // Earth days
  rotationPeriod: number; // Earth hours
  mass: number; // Relative to Earth
  temperature: number; // Celsius
  moons: number;
  color: string;
  description: string;
  facts: string[];
}

const planets: Planet[] = [
  {
    id: 'mercury',
    name: 'Mercury',
    radius: 0.38,
    distance: 0.39,
    orbitalPeriod: 88,
    rotationPeriod: 1407.6,
    mass: 0.055,
    temperature: 167,
    moons: 0,
    color: '#8C7853',
    description: 'The smallest planet and closest to the Sun',
    facts: [
      'A year on Mercury lasts only 88 Earth days',
      'Temperature swings from 427°C to -173°C',
      'Has no atmosphere to retain heat'
    ]
  },
  {
    id: 'venus',
    name: 'Venus',
    radius: 0.95,
    distance: 0.72,
    orbitalPeriod: 225,
    rotationPeriod: -5832.5,
    mass: 0.815,
    temperature: 464,
    moons: 0,
    color: '#FFC649',
    description: 'The hottest planet with thick toxic atmosphere',
    facts: [
      'Rotates backwards compared to most planets',
      'Surface pressure is 90 times that of Earth',
      'Clouds contain sulfuric acid'
    ]
  },
  {
    id: 'earth',
    name: 'Earth',
    radius: 1.0,
    distance: 1.0,
    orbitalPeriod: 365.25,
    rotationPeriod: 24,
    mass: 1.0,
    temperature: 15,
    moons: 1,
    color: '#6B93D6',
    description: 'Our home planet, the only known world with life',
    facts: [
      '71% of surface is covered by water',
      'Has a protective magnetic field',
      'Only planet known to support life'
    ]
  },
  {
    id: 'mars',
    name: 'Mars',
    radius: 0.53,
    distance: 1.52,
    orbitalPeriod: 687,
    rotationPeriod: 24.6,
    mass: 0.107,
    temperature: -65,
    moons: 2,
    color: '#CD5C5C',
    description: 'The Red Planet with polar ice caps',
    facts: [
      'Has the largest volcano in the solar system',
      'Day length is similar to Earth',
      'Atmosphere is 95% carbon dioxide'
    ]
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    radius: 11.21,
    distance: 5.20,
    orbitalPeriod: 4333,
    rotationPeriod: 9.9,
    mass: 317.8,
    temperature: -110,
    moons: 79,
    color: '#D8CA9D',
    description: 'The largest planet with a Great Red Spot storm',
    facts: [
      'More massive than all other planets combined',
      'Has at least 79 known moons',
      'Great Red Spot is a storm larger than Earth'
    ]
  },
  {
    id: 'saturn',
    name: 'Saturn',
    radius: 9.45,
    distance: 9.58,
    orbitalPeriod: 10759,
    rotationPeriod: 10.7,
    mass: 95.2,
    temperature: -140,
    moons: 82,
    color: '#FAD5A5',
    description: 'The ringed planet with spectacular ice rings',
    facts: [
      'Has the most prominent ring system',
      'Less dense than water',
      'Has 82 confirmed moons'
    ]
  },
  {
    id: 'uranus',
    name: 'Uranus',
    radius: 4.01,
    distance: 19.20,
    orbitalPeriod: 30687,
    rotationPeriod: -17.2,
    mass: 14.5,
    temperature: -195,
    moons: 27,
    color: '#4FD0E4',
    description: 'An ice giant tilted on its side',
    facts: [
      'Rotates on its side at 98° tilt',
      'Made mostly of water, methane, and ammonia',
      'Has faint rings discovered in 1977'
    ]
  },
  {
    id: 'neptune',
    name: 'Neptune',
    radius: 3.88,
    distance: 30.05,
    orbitalPeriod: 60190,
    rotationPeriod: 16.1,
    mass: 17.1,
    temperature: -200,
    moons: 14,
    color: '#4B70DD',
    description: 'The windiest planet in the solar system',
    facts: [
      'Windiest planet with speeds up to 2,100 km/h',
      'Takes 165 Earth years to orbit the Sun',
      'Has a dark storm called the Great Dark Spot'
    ]
  }
];

export function SolarSystemExplorer() {
  const [isAnimating, setIsAnimating] = useState(true);
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const animate = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const maxRadius = Math.min(centerX, centerY) - 50;

      // Draw Sun
      ctx.beginPath();
      ctx.arc(centerX, centerY, 15, 0, 2 * Math.PI);
      ctx.fillStyle = '#FDB813';
      ctx.fill();
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#FDB813';
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw planets
      planets.forEach((planet, index) => {
        const orbitRadius = (planet.distance / 30) * maxRadius;
        const angle = (timeRef.current * animationSpeed * 0.01) / planet.orbitalPeriod;
        
        // Draw orbit path
        ctx.beginPath();
        ctx.arc(centerX, centerY, orbitRadius, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Calculate planet position
        const planetX = centerX + Math.cos(angle) * orbitRadius;
        const planetY = centerY + Math.sin(angle) * orbitRadius;
        
        // Planet size (scaled for visibility)
        const planetRadius = Math.max(3, Math.min(planet.radius * 3, 12));
        
        // Draw planet
        ctx.beginPath();
        ctx.arc(planetX, planetY, planetRadius, 0, 2 * Math.PI);
        ctx.fillStyle = planet.color;
        ctx.fill();
        
        // Highlight selected planet
        if (selectedPlanet?.id === planet.id) {
          ctx.strokeStyle = '#60A5FA';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Draw planet name
        ctx.fillStyle = 'white';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(planet.name, planetX, planetY - planetRadius - 8);
      });

      if (isAnimating) {
        timeRef.current += 1;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnimating, animationSpeed, selectedPlanet]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(centerX, centerY) - 50;

    // Check if click is on a planet
    planets.forEach((planet) => {
      const orbitRadius = (planet.distance / 30) * maxRadius;
      const angle = (timeRef.current * animationSpeed * 0.01) / planet.orbitalPeriod;
      const planetX = centerX + Math.cos(angle) * orbitRadius;
      const planetY = centerY + Math.sin(angle) * orbitRadius;
      const planetRadius = Math.max(3, Math.min(planet.radius * 3, 12));
      
      const distance = Math.sqrt((clickX - planetX) ** 2 + (clickY - planetY) ** 2);
      if (distance <= planetRadius + 5) {
        setSelectedPlanet(planet);
      }
    });
  };

  const resetAnimation = () => {
    timeRef.current = 0;
    setSelectedPlanet(null);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => setIsAnimating(!isAnimating)}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            {isAnimating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span>{isAnimating ? 'Pause' : 'Play'}</span>
          </Button>
          
          <Button
            onClick={resetAnimation}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset</span>
          </Button>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-sm text-neutral-400">Speed:</span>
          <input
            type="range"
            min="0.1"
            max="5"
            step="0.1"
            value={animationSpeed}
            onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
            className="w-20 accent-blue-500"
          />
          <span className="text-sm text-neutral-300">{animationSpeed}x</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Solar System Visualization */}
        <div className="lg:col-span-2">
          <Card className="glass-morphism">
            <CardContent className="p-0">
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  onClick={handleCanvasClick}
                  className="w-full h-96 cursor-pointer rounded-lg"
                  style={{ background: 'radial-gradient(circle, #1a1a2e 0%, #16213e 50%, #0f0f0f 100%)' }}
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    <Info className="h-3 w-3 mr-1" />
                    Click planets to explore
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Planet Information Panel */}
        <div>
          {selectedPlanet ? (
            <Card className="glass-morphism">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: selectedPlanet.color }}
                  />
                  <h3 className="text-2xl font-bold text-white">{selectedPlanet.name}</h3>
                </div>
                
                <p className="text-neutral-400 mb-6">{selectedPlanet.description}</p>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-neutral-500">Distance from Sun</span>
                      <div className="text-white font-medium">{selectedPlanet.distance} AU</div>
                    </div>
                    <div>
                      <span className="text-neutral-500">Orbital Period</span>
                      <div className="text-white font-medium">{selectedPlanet.orbitalPeriod.toLocaleString()} days</div>
                    </div>
                    <div>
                      <span className="text-neutral-500">Temperature</span>
                      <div className="text-white font-medium">{selectedPlanet.temperature}°C</div>
                    </div>
                    <div>
                      <span className="text-neutral-500">Moons</span>
                      <div className="text-white font-medium">{selectedPlanet.moons}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-medium mb-2 flex items-center">
                      <Zap className="h-4 w-4 mr-2 text-blue-400" />
                      Interesting Facts
                    </h4>
                    <ul className="space-y-2">
                      {selectedPlanet.facts.map((fact, index) => (
                        <li key={index} className="text-sm text-neutral-400 flex items-start">
                          <div className="w-1 h-1 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                          {fact}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="glass-morphism">
              <CardContent className="p-6 text-center">
                <div className="text-neutral-400 mb-4">
                  <Info className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <h3 className="text-lg font-medium text-white mb-2">Explore the Solar System</h3>
                  <p className="text-sm">Click on any planet in the visualization to learn more about it.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Planet Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {planets.map((planet) => (
          <Button
            key={planet.id}
            variant="outline"
            onClick={() => setSelectedPlanet(planet)}
            className={`p-3 h-auto flex flex-col items-center space-y-2 transition-all duration-200 ${
              selectedPlanet?.id === planet.id 
                ? 'bg-blue-500/10 border-blue-500/50 text-blue-400' 
                : 'border-neutral-700 text-neutral-300 hover:bg-neutral-800'
            }`}
          >
            <div
              className="w-6 h-6 rounded-full"
              style={{ backgroundColor: planet.color }}
            />
            <span className="text-xs font-medium">{planet.name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}