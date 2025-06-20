import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Rocket, Calendar, Globe, Users, Clock, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const spaceMissions = [
  {
    id: '1',
    name: 'Artemis II',
    agency: 'NASA',
    status: 'Planned',
    launchDate: new Date('2025-11-01'),
    mission: 'Crewed lunar flyby mission',
    crew: ['Reid Wiseman', 'Victor Glover', 'Christina Hammock Koch', 'Jeremy Hansen'],
    description: 'First crewed mission to travel around the Moon since Apollo 17'
  },
  {
    id: '2',
    name: 'Europa Clipper',
    agency: 'NASA',
    status: 'Active',
    launchDate: new Date('2024-10-14'),
    mission: 'Jupiter system exploration',
    crew: [],
    description: 'Detailed reconnaissance of Jupiter\'s moon Europa and its subsurface ocean'
  },
  {
    id: '3',
    name: 'Chang\'e 6',
    agency: 'CNSA',
    status: 'Completed',
    launchDate: new Date('2024-05-03'),
    endDate: new Date('2024-06-25'),
    mission: 'Lunar sample return',
    crew: [],
    description: 'Successfully collected samples from the far side of the Moon'
  },
  {
    id: '4',
    name: 'Perseverance Rover',
    agency: 'NASA',
    status: 'Active',
    launchDate: new Date('2020-07-30'),
    mission: 'Mars exploration',
    crew: [],
    description: 'Searching for signs of ancient life and collecting rock samples on Mars'
  },
  {
    id: '5',
    name: 'James Webb Space Telescope',
    agency: 'NASA/ESA/CSA',
    status: 'Active',
    launchDate: new Date('2021-12-25'),
    mission: 'Space observatory',
    crew: [],
    description: 'Observing the most distant objects in the universe'
  },
  {
    id: '6',
    name: 'Starship IFT-4',
    agency: 'SpaceX',
    status: 'Completed',
    launchDate: new Date('2024-06-06'),
    endDate: new Date('2024-06-06'),
    mission: 'Test flight',
    crew: [],
    description: 'Fourth integrated flight test of Starship'
  }
];

export default function Missions() {
  const [filter, setFilter] = useState<'all' | 'active' | 'planned' | 'completed'>('all');

  useEffect(() => {
    document.title = "Space Missions - Cosmofy | Current & Upcoming Space Exploration Missions";
  }, []);

  const filteredMissions = spaceMissions.filter(mission => {
    if (filter === 'all') return true;
    return mission.status.toLowerCase() === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500/10 border-green-500/20 text-green-400';
      case 'planned':
        return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
      case 'completed':
        return 'bg-gray-500/10 border-gray-500/20 text-gray-400';
      default:
        return 'bg-neutral-500/10 border-neutral-500/20 text-neutral-400';
    }
  };

  const formatDuration = (launchDate: Date, endDate?: Date) => {
    if (endDate) {
      const duration = Math.round((endDate.getTime() - launchDate.getTime()) / (1000 * 60 * 60 * 24));
      return `${duration} days`;
    }
    const now = new Date();
    const duration = Math.round((now.getTime() - launchDate.getTime()) / (1000 * 60 * 60 * 24));
    return duration > 0 ? `${Math.abs(duration)} days ago` : `In ${Math.abs(duration)} days`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 via-neutral-800 to-black text-white">
      {/* Navigation */}
      <nav className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2 hover:text-blue-400 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
            <h1 className="text-xl font-bold">Space Missions</h1>
            <div className="w-32"></div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Space Missions</h1>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
            Explore current and upcoming space exploration missions from agencies worldwide
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-4 mb-8">
          {['all', 'active', 'planned', 'completed'].map((status) => (
            <Button
              key={status}
              variant={filter === status ? "default" : "outline"}
              onClick={() => setFilter(status as any)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>

        {/* Missions Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredMissions.map((mission) => (
            <Card key={mission.id} className="bg-neutral-800/50 border-neutral-700 p-6 hover:border-neutral-600 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Rocket className="w-5 h-5 text-blue-400" />
                  <h3 className="font-semibold text-lg">{mission.name}</h3>
                </div>
                <Badge className={getStatusColor(mission.status)}>
                  {mission.status}
                </Badge>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-neutral-400">
                  <Globe className="w-4 h-4 mr-2" />
                  <span>{mission.agency}</span>
                </div>
                
                <div className="flex items-center text-sm text-neutral-400">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{mission.launchDate.toLocaleDateString()}</span>
                </div>

                <div className="flex items-center text-sm text-neutral-400">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{formatDuration(mission.launchDate, mission.endDate)}</span>
                </div>

                {mission.crew.length > 0 && (
                  <div className="flex items-center text-sm text-neutral-400">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{mission.crew.length} crew members</span>
                  </div>
                )}
              </div>

              <p className="text-neutral-300 text-sm mb-4">{mission.description}</p>

              <div className="space-y-2">
                <div className="text-xs text-neutral-500">Mission Type</div>
                <div className="text-sm font-medium">{mission.mission}</div>
              </div>

              {mission.crew.length > 0 && (
                <div className="mt-4 pt-4 border-t border-neutral-700">
                  <div className="text-xs text-neutral-500 mb-2">Crew</div>
                  <div className="flex flex-wrap gap-1">
                    {mission.crew.slice(0, 3).map((member, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {member}
                      </Badge>
                    ))}
                    {mission.crew.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{mission.crew.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {filteredMissions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-neutral-400 text-lg">No missions found for the selected filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}