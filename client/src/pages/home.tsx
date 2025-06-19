import { useEffect } from 'react';
import { Navigation } from '@/components/navigation';
import { HeroSection } from '@/components/hero-section';
import { APODGallery } from '@/components/apod-gallery';
import { ISSTracker } from '@/components/iss-tracker';
import { AuroraTracker } from '@/components/aurora-tracker';
import { AsteroidTracker } from '@/components/asteroid-tracker';
import { SpaceMissions } from '@/components/space-missions';
import { Footer } from '@/components/footer';

export default function Home() {
  useEffect(() => {
    // Set page title
    document.title = "Cosmofy - Explore the Cosmos | Real-time Space Data & NASA APIs";
    
    // Add meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Journey through space with real-time NASA data, track the ISS, discover celestial wonders, and witness aurora displays. Experience the cosmos like never before.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Journey through space with real-time NASA data, track the ISS, discover celestial wonders, and witness aurora displays. Experience the cosmos like never before.';
      document.head.appendChild(meta);
    }

    // Add Open Graph tags
    const ogTags = [
      { property: 'og:title', content: 'Cosmofy - Explore the Cosmos' },
      { property: 'og:description', content: 'Real-time space tracking, NASA imagery, and cosmic discoveries await' },
      { property: 'og:type', content: 'website' },
      { property: 'og:image', content: '/api/apod/today' }
    ];

    ogTags.forEach(tag => {
      const existing = document.querySelector(`meta[property="${tag.property}"]`);
      if (existing) {
        existing.setAttribute('content', tag.content);
      } else {
        const meta = document.createElement('meta');
        meta.setAttribute('property', tag.property);
        meta.setAttribute('content', tag.content);
        document.head.appendChild(meta);
      }
    });
  }, []);

  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <HeroSection />
        <APODGallery id="gallery" />
        <ISSTracker id="iss-tracker" />
        <AuroraTracker id="aurora" />
        <AsteroidTracker id="asteroids" />
        <SpaceMissions id="missions" />
      </main>
      <Footer />
    </div>
  );
}
