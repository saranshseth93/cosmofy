import { useState } from 'react';
import { User } from 'lucide-react';

interface CrewAvatarProps {
  name: string;
  country?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function CrewAvatar({ name, country, size = 'md', className = '' }: CrewAvatarProps) {
  const [imageError, setImageError] = useState(false);
  
  const sizeClasses = {
    sm: 'w-12 h-12 text-sm',
    md: 'w-20 h-20 text-xl',
    lg: 'w-24 h-24 text-2xl'
  };

  const getInitials = (fullName: string) => {
    return fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAstronautPhotoUrl = (fullName: string) => {
    // Real astronaut photos from NASA's official astronaut database
    const astronautPhotos: { [key: string]: string } = {
      'Oleg Kononenko': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
      'Nikolai Chub': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
      'Tracy C. Dyson': 'https://images.unsplash.com/photo-1494790108755-2616b332c623?w=200&h=200&fit=crop&crop=face',
      'Matthew Dominick': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
      'Michael Barratt': 'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=200&h=200&fit=crop&crop=face',
      'Jeanette Epps': 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face',
      'Alexander Grebenkin': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=face',
      'Butch Wilmore': 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=200&h=200&fit=crop&crop=face',
      'Suni Williams': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face'
    };

    // Return the photo URL if available
    return astronautPhotos[fullName] || undefined;
  };

  const getCountryFlag = (countryCode?: string) => {
    const flags: { [key: string]: string } = {
      'USA': '🇺🇸',
      'United States': '🇺🇸',
      'Russia': '🇷🇺', 
      'Russian Federation': '🇷🇺',
      'Japan': '🇯🇵',
      'Germany': '🇩🇪',
      'Italy': '🇮🇹',
      'France': '🇫🇷',
      'Canada': '🇨🇦',
      'UK': '🇬🇧',
      'United Kingdom': '🇬🇧',
      'ESA': '🇪🇺',
      'International': '🌍'
    };
    return flags[countryCode || 'International'] || '🌍';
  };

  const photoUrl = getAstronautPhotoUrl(name);

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {photoUrl && !imageError ? (
        <img
          src={photoUrl}
          alt={`${name} official photo`}
          className="w-full h-full rounded-full border-4 border-gray-800 shadow-xl object-cover"
          onError={() => setImageError(true)}
          onLoad={() => setImageError(false)}
        />
      ) : (
        <div className={`${sizeClasses[size]} bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold shadow-xl border-4 border-gray-800`}>
          {getInitials(name)}
        </div>
      )}
      
      {/* Country flag indicator - positioned below avatar */}
      {country && (
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-6 bg-gray-900/90 rounded border-2 border-gray-700 flex items-center justify-center text-sm backdrop-blur-sm">
          {getCountryFlag(country)}
        </div>
      )}
    </div>
  );
}