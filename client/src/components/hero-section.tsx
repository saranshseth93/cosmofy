import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Play } from 'lucide-react';
import { Link } from 'wouter';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20">
      <div className="max-w-4xl mx-auto text-center">
        {/* Badge */}
        <Badge className="mb-8 bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all duration-300 px-4 py-2 mt-8">
          Real-time Space Data Platform
        </Badge>
        
        {/* Main Heading */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight tracking-tight">
          THE
          <br />
          <span className="gradient-text">
            COSMOS
          </span>
        </h1>
        
        {/* Description */}
        <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          Journey through space with real-time NASA data, track the ISS, discover 
          celestial wonders, and witness the universe unfold before your eyes.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Link href="/gallery">
            <Button 
              size="lg" 
              className="accent-gradient hover:opacity-90 text-white px-8 py-3 text-base font-medium transition-all duration-300 shadow-lg"
            >
              Launch Exploration
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          
          <Button 
            variant="outline" 
            size="lg"
            className="border-neutral-600 text-neutral-300 hover:bg-neutral-800 hover:text-white px-8 py-3 text-base font-medium transition-all duration-300"
          >
            <Play className="mr-2 h-5 w-5" />
            Watch Demo
          </Button>
        </div>

        {/* Live Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div className="glass-morphism rounded-lg p-6 hover:bg-white/[0.04] transition-all duration-300">
            <div className="flex items-center justify-center mb-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
              <span className="text-green-400 text-sm font-medium">Live</span>
            </div>
            <div className="text-neutral-400 text-sm mb-1">ISS Tracking</div>
            <div className="text-xl font-semibold text-white">Real-time</div>
          </div>
          
          <div className="glass-morphism rounded-lg p-6 hover:bg-white/[0.04] transition-all duration-300">
            <div className="text-neutral-400 text-sm mb-1">Cosmic Images</div>
            <div className="text-xl font-semibold text-white">10k+</div>
            <div className="text-xs text-neutral-500 mt-1">NASA APOD Gallery</div>
          </div>
          
          <div className="glass-morphism rounded-lg p-6 hover:bg-white/[0.04] transition-all duration-300">
            <div className="text-neutral-400 text-sm mb-1">Asteroids Tracked</div>
            <div className="text-xl font-semibold text-white">500+</div>
            <div className="text-xs text-neutral-500 mt-1">Near-Earth Objects</div>
          </div>
        </div>
      </div>
    </section>
  );
}
