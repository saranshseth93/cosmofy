import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X, Home, Camera, Satellite, Zap, Circle, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logoPath from '@assets/Cosmo - 1_1750298158776.png';

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [location] = useLocation();

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/gallery', label: 'Gallery', icon: Camera },
    { href: '/iss-tracker', label: 'ISS Tracker', icon: Satellite },
    { href: '/aurora', label: 'Aurora', icon: Zap },
    { href: '/asteroids', label: 'Asteroids', icon: Circle },
    { href: '/missions', label: 'Missions', icon: Rocket },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      isScrolled 
        ? 'bg-[hsl(222,47%,8%)]/90 backdrop-blur-xl border-b border-white/10' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img 
              src={logoPath} 
              alt="Cosmofy" 
              className="h-10 w-auto transition-transform duration-300 hover:scale-105"
              onError={(e) => {
                console.error('Logo failed to load:', e);
                e.currentTarget.style.display = 'none';
              }}
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
                    className={`group relative px-4 py-2 rounded-full transition-all duration-300 ${
                      isActive 
                        ? 'bg-gradient-to-r from-[hsl(158,76%,36%)]/20 to-[hsl(330,81%,60%)]/20 text-[hsl(158,76%,36%)]' 
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.label}
                    {isActive && (
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[hsl(158,76%,36%)] to-[hsl(330,81%,60%)] opacity-20" />
                    )}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Mobile Navigation */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-[hsl(222,47%,8%)]/95 backdrop-blur-xl border-b border-white/10">
            <div className="container mx-auto px-6 py-4">
              <div className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.href;
                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant="ghost"
                        className={`w-full justify-start px-4 py-3 rounded-xl transition-all duration-300 ${
                          isActive 
                            ? 'bg-gradient-to-r from-[hsl(158,76%,36%)]/20 to-[hsl(330,81%,60%)]/20 text-[hsl(158,76%,36%)]' 
                            : 'text-white/80 hover:text-white hover:bg-white/10'
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon className="mr-3 h-5 w-5" />
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