import { Navigation } from '@/components/navigation';
import { SpaceSoundLibrary } from '@/components/space-sound-library';

export default function SpaceSounds() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 via-neutral-800 to-black text-white">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        <SpaceSoundLibrary />
      </div>
    </div>
  );
}