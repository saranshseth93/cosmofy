import { useEffect } from 'react';
import { Navigation } from '@/components/navigation';
import { SolarSystemExplorer } from '@/components/solar-system-explorer';
import { Badge } from '@/components/ui/badge';
import { Footer } from '@/components/footer';

export default function SolarSystem() {
  useEffect(() => {
    document.title = "Solar System Explorer - Cosmofy | Interactive Planet Visualization";
  }, []);

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-16 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 sm:mb-6 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs sm:text-sm">
              Interactive Solar System
            </Badge>
            
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white via-blue-200 to-purple-300 bg-clip-text text-transparent leading-tight">
              Solar System Explorer
            </h1>
            
            <p className="text-base sm:text-lg lg:text-xl text-neutral-400 max-w-2xl mx-auto mb-6 sm:mb-8 px-4 sm:px-0">
              Explore our solar system with an interactive visualization. Discover planetary data, orbital mechanics, and fascinating facts about each celestial body.
            </p>
          </div>
        </div>
      </section>

      {/* Solar System Explorer Component */}
      <section className="pb-16 sm:pb-20">
        <div className="container mx-auto px-4 sm:px-6">
          <SolarSystemExplorer />
        </div>
      </section>

      <Footer />
    </div>
  );
}