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

  const getAvatarUrl = (fullName: string) => {
    // Generate a consistent avatar based on the name
    const seed = fullName.toLowerCase().replace(/\s+/g, '');
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=1e293b,374151,475569&clothesColor=262e42,3e4c59,52525b&eyeType=happy,default,wink&mouthType=smile,twinkle&skinColor=ae5d29,f8d25c,fd9841,ffdbac,d08b5b`;
  };

  const getCountryFlag = (countryCode?: string) => {
    const flags: { [key: string]: string } = {
      'USA': '🇺🇸',
      'Russia': '🇷🇺',
      'Japan': '🇯🇵',
      'Germany': '🇩🇪',
      'Italy': '🇮🇹',
      'France': '🇫🇷',
      'Canada': '🇨🇦',
      'UK': '🇬🇧',
      'International': '🌍'
    };
    return flags[countryCode || 'International'] || '🌍';
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {!imageError ? (
        <img
          src={getAvatarUrl(name)}
          alt={`${name} avatar`}
          className="w-full h-full rounded-full border-4 border-gray-800 shadow-xl"
          onError={() => setImageError(true)}
          onLoad={() => setImageError(false)}
        />
      ) : (
        <div className={`${sizeClasses[size]} bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold shadow-xl border-4 border-gray-800`}>
          {getInitials(name)}
        </div>
      )}
      
      {/* Country flag indicator */}
      {country && (
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-900 rounded-full border-2 border-gray-800 flex items-center justify-center text-xs">
          {getCountryFlag(country)}
        </div>
      )}
    </div>
  );
}