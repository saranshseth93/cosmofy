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
      'Oleg Kononenko': 'https://www.nasa.gov/wp-content/uploads/2023/03/jsc2019e059971_kononenko.jpg',
      'Nikolai Chub': 'https://www.nasa.gov/wp-content/uploads/2023/08/jsc2023e024456_chub.jpg',
      'Tracy C. Dyson': 'https://www.nasa.gov/wp-content/uploads/2023/12/jsc2024e002832_dyson.jpg',
      'Matthew Dominick': 'https://www.nasa.gov/wp-content/uploads/2023/12/jsc2024e003042_dominick.jpg',
      'Michael Barratt': 'https://www.nasa.gov/wp-content/uploads/2023/03/jsc2019e059936_barratt.jpg',
      'Jeanette Epps': 'https://www.nasa.gov/wp-content/uploads/2023/12/jsc2024e003035_epps.jpg',
      'Alexander Grebenkin': 'https://www.nasa.gov/wp-content/uploads/2023/08/jsc2023e024459_grebenkin.jpg',
      'Butch Wilmore': 'https://www.nasa.gov/wp-content/uploads/2023/03/jsc2019e059969_wilmore.jpg',
      'Suni Williams': 'https://www.nasa.gov/wp-content/uploads/2023/03/jsc2019e059974_williams.jpg'
    };

    // Check if we have a real photo for this astronaut
    if (astronautPhotos[fullName]) {
      return astronautPhotos[fullName];
    }

    // Generate a realistic avatar based on the name as fallback
    const seed = fullName.toLowerCase().replace(/\s+/g, '');
    return `https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=1e293b,374151,475569&clothesColor=262e42,3e4c59,52525b`;
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

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {!imageError ? (
        <img
          src={getAstronautPhotoUrl(name)}
          alt={`${name} official NASA photo`}
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