import { useEffect, useRef } from 'react';
import { Rocket, Satellite, Zap, Orbit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGSAP, useFloatingAnimation } from '@/hooks/use-gsap';

export function HeroSection() {
  const heroRef = useGSAP();
  const particlesRef = useRef<HTMLDivElement>(null);
  const satellite1Ref = useFloatingAnimation(0);
  const satellite2Ref = useFloatingAnimation(2);
  const satellite3Ref = useFloatingAnimation(4);

  useEffect(() => {
    const particlesContainer = particlesRef.current;
    if (!particlesContainer) return;

    const numParticles = 50;
    
    for (let i = 0; i < numParticles; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      particle.style.width = Math.random() * 4 + 1 + 'px';
      particle.style.height = particle.style.width;
      particle.style.animationDelay = Math.random() * 6 + 's';
      particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
      particlesContainer.appendChild(particle);
    }
  }, []);

  const scrollToGallery = () => {
    const gallery = document.querySelector('#gallery');
    if (gallery) {
      gallery.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section 
      ref={heroRef}
      className="min-h-screen flex items-center justify-center relative overflow-hidden cosmic-gradient section-reveal"
    >
      <div ref={particlesRef} className="particles" />
      
      <div className="container mx-auto px-6 text-center relative z-10">
        <h1 className="text-6xl md:text-8xl font-orbitron font-black mb-6 text-gradient">
          EXPLORE THE COSMOS
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-80">
          Journey through space with real-time NASA data, track the ISS, discover celestial wonders, and witness the universe unfold before your eyes.
        </p>
        <Button 
          onClick={scrollToGallery}
          className="bg-gradient-to-r from-[hsl(158,76%,36%)] to-[hsl(330,81%,60%)] hover:scale-105 transform transition-all duration-300 animate-glow px-8 py-4 text-lg font-semibold"
        >
          <Rocket className="mr-2 h-5 w-5" />
          Launch Exploration
        </Button>
      </div>
      
      {/* Floating Cosmic Elements */}
      <div 
        ref={satellite1Ref}
        className="absolute top-20 left-10 opacity-30"
      >
        <Satellite className="h-12 w-12 text-[hsl(158,76%,36%)]" />
      </div>
      <div 
        ref={satellite2Ref}
        className="absolute bottom-20 right-10 opacity-30"
      >
        <Zap className="h-10 w-10 text-[hsl(43,96%,56%)]" />
      </div>
      <div 
        ref={satellite3Ref}
        className="absolute top-1/3 right-20 opacity-30"
      >
        <Orbit className="h-8 w-8 text-[hsl(330,81%,60%)]" />
      </div>
    </section>
  );
}
