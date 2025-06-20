import { useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { Navigation } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Satellite, Zap, Circle, Rocket, ArrowRight, Play, Globe, Clock, MapPin } from 'lucide-react';
import { Footer } from '@/components/footer';

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = "Cosmofy - Explore the Cosmos | Real-time Space Data & NASA APIs";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Journey through space with real-time NASA data, track the ISS, discover celestial wonders, and witness aurora displays. Experience the cosmos like never before.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Journey through space with real-time NASA data, track the ISS, discover celestial wonders, and witness aurora displays. Experience the cosmos like never before.';
      document.head.appendChild(meta);
    }

    // Parallax and animation effects
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const parallax = heroRef.current;
      
      if (parallax) {
        const speed = scrolled * 0.5;
        parallax.style.transform = `translateY(${speed}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      id: 'gallery',
      title: 'Astronomy Gallery',
      description: 'Discover the cosmos through NASA\'s daily featured astronomical images, carefully curated and explained by professional astronomers.',
      icon: Camera,
      href: '/gallery',
      gradient: 'from-purple-600 to-blue-600',
      stats: '10,000+ Images',
      badge: 'Daily Updates'
    },
    {
      id: 'iss-tracker',
      title: 'ISS Live Tracker',
      description: 'Track the International Space Station in real-time, view crew information, and predict when it will pass over your location.',
      icon: Satellite,
      href: '/iss-tracker',
      gradient: 'from-green-500 to-cyan-500',
      stats: 'Live Position',
      badge: 'Real-time'
    },
    {
      id: 'aurora',
      title: 'Aurora Forecasts',
      description: 'Monitor geomagnetic activity and discover the best times and locations to witness spectacular aurora displays.',
      icon: Zap,
      href: '/aurora',
      gradient: 'from-pink-500 to-purple-600',
      stats: 'Global Coverage',
      badge: 'Predictions'
    },
    {
      id: 'asteroids',
      title: 'Asteroid Watch',
      description: 'Stay informed about near-Earth objects, their trajectories, and upcoming close approaches to our planet.',
      icon: Circle,
      href: '/asteroids',
      gradient: 'from-orange-500 to-red-600',
      stats: '500+ Tracked',
      badge: 'Alerts'
    },
    {
      id: 'missions',
      title: 'Space Missions',
      description: 'Follow active space missions, their objectives, and the latest discoveries from humanity\'s greatest adventures.',
      icon: Rocket,
      href: '/missions',
      gradient: 'from-blue-500 to-indigo-600',
      stats: '20+ Active',
      badge: 'Updates'
    }
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section - Mobile Optimized */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 sm:pt-0">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-cyan-900/20" />
          <div className="stars" />
          <div className="twinkling" />
        </div>

        {/* Floating Elements - Responsive positioning */}
        <div ref={heroRef} className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-4 sm:left-10 w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
          <div className="absolute top-40 right-4 sm:right-20 w-1 h-1 bg-purple-400 rounded-full animate-pulse delay-1000" />
          <div className="absolute bottom-40 left-4 sm:left-20 w-3 h-3 bg-pink-400 rounded-full animate-pulse delay-2000" />
          <div className="absolute bottom-20 right-4 sm:right-10 w-2 h-2 bg-green-400 rounded-full animate-pulse delay-500" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-4 sm:mb-6 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 text-purple-300 text-xs sm:text-sm">
              Real-time Space Data Platform
            </Badge>
            
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-8xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-transparent leading-tight">
              <span className="block sm:hidden">COSMOFY</span>
              <span className="hidden sm:block">THE COSMOS</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 text-gray-300 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
              Journey through space with real-time NASA data, track the ISS, discover celestial wonders, and witness the universe unfold before your eyes.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4 sm:px-0">
              <Link href="/gallery">
                <Button className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl">
                  <Rocket className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Launch Exploration
                </Button>
              </Link>
              
              <Button variant="outline" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-full transition-all duration-300">
                <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Watch Demo
              </Button>
            </div>

            {/* Live Stats */}
            <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-2xl mx-auto px-4 sm:px-0">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">Live</div>
                <div className="text-sm text-gray-400">ISS Tracking</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400 mb-1">10k+</div>
                <div className="text-sm text-gray-400">Cosmic Images</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400 mb-1">500+</div>
                <div className="text-sm text-gray-400">Asteroids Tracked</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Section - Mobile Optimized */}
      <section ref={featuresRef} className="py-16 sm:py-24 lg:py-32 relative">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <Badge className="mb-4 sm:mb-6 bg-gradient-to-r from-cyan-600/20 to-purple-600/20 border border-cyan-500/30 text-cyan-300 text-xs sm:text-sm">
              Explore Space Data
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Discover the Universe
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto px-4 sm:px-0">
              Access real-time space data, astronomical imagery, and cosmic phenomena from NASA and leading space agencies worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link key={feature.id} href={feature.href}>
                  <Card className="group relative bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-gray-700/50 hover:border-gray-600/50 backdrop-blur-sm transition-all duration-500 hover:transform hover:scale-105 cursor-pointer overflow-hidden">
                    {/* Gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                    
                    <div className="p-6 sm:p-8">
                      <div className="flex items-start justify-between mb-4 sm:mb-6">
                        <div className={`p-2 sm:p-3 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg`}>
                          <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                        </div>
                        <Badge variant="secondary" className="bg-gray-800/50 text-gray-300 border-gray-600/50 text-xs sm:text-sm">
                          {feature.badge}
                        </Badge>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 group-hover:bg-clip-text transition-all duration-300">
                        {feature.title}
                      </h3>
                      
                      <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6 leading-relaxed">
                        {feature.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs sm:text-sm text-gray-500">
                          <Globe className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          {feature.stats}
                        </div>
                        
                        <div className="flex items-center text-cyan-400 font-medium group-hover:text-white transition-colors duration-300 text-sm sm:text-base">
                          Explore
                          <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-blue-900/20" />
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Ready to Explore Space?
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of space enthusiasts discovering the cosmos through real-time data and stunning imagery.
          </p>
          <Link href="/gallery">
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-12 py-4 text-lg font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl">
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}