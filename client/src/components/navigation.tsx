import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X, Home, Camera, Satellite, Zap, Circle, Rocket, Globe, Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logoImage from '@assets/Cosmo - 1_1750298158776.png';

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [location] = useLocation();

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/gallery', label: 'Gallery', icon: Camera },
    { href: '/iss-tracker', label: 'ISS Tracker', icon: Satellite },
    { href: '/solar-system', label: 'Solar System', icon: Globe },
    { href: '/aurora', label: 'Aurora', icon: Zap },
    { href: '/asteroids', label: 'Asteroids', icon: Circle },
    { href: '/missions', label: 'Missions', icon: Rocket },
    { href: '/news', label: 'Space News', icon: Newspaper },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-700/50' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img 
              src={logoImage}
              alt="Space Explorer Logo" 
              className="h-8 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className={`relative px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                      isActive 
                        ? 'text-blue-400 bg-blue-500/10' 
                        : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                    }`}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Mobile Navigation */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden text-neutral-300 hover:text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-neutral-900/95 backdrop-blur-xl border-b border-neutral-700/50">
            <div className="container mx-auto px-4 sm:px-6 py-4">
              <div className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.href;
                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant="ghost"
                        className={`w-full justify-start px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                          isActive 
                            ? 'text-blue-400 bg-blue-500/10' 
                            : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon className="mr-3 h-4 w-4" />
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}