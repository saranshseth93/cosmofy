import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CosmicCTAProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
}

export function CosmicCTA({ 
  children, 
  onClick, 
  className = '', 
  variant = 'primary',
  size = 'md' 
}: CosmicCTAProps) {
  const variants = {
    primary: 'from-purple-600 via-blue-600 to-cyan-400',
    secondary: 'from-indigo-600 via-purple-600 to-pink-600',
    danger: 'from-red-600 via-orange-600 to-yellow-500',
    success: 'from-green-600 via-emerald-600 to-teal-500'
  };

  const sizes = {
    sm: 'px-6 py-2 text-sm',
    md: 'px-8 py-3 text-base',
    lg: 'px-12 py-4 text-lg'
  };

  return (
    <button 
      onClick={onClick}
      className={cn(
        "group relative inline-flex items-center justify-center overflow-hidden font-bold text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-105",
        `bg-gradient-to-r ${variants[variant]}`,
        sizes[size],
        className
      )}
    >
      {/* Animated background */}
      <span className={cn(
        "absolute inset-0 w-full h-full rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-300",
        `bg-gradient-to-r ${variants[variant]}`
      )}></span>
      
      {/* Shimmer effect */}
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
      
      {/* Content */}
      <span className="relative z-10 flex items-center">
        {children}
      </span>
    </button>
  );
}

interface OrbitingCTAProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function OrbitingCTA({ children, onClick, className = '' }: OrbitingCTAProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative inline-flex items-center justify-center px-8 py-3 font-bold text-white rounded-full transition-all duration-300 hover:scale-105",
        "bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900",
        "border border-purple-400/30 hover:border-purple-400/60",
        "shadow-lg hover:shadow-purple-500/25",
        className
      )}
    >
      {/* Orbiting particles */}
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <div className="absolute w-2 h-2 bg-purple-400 rounded-full top-2 left-1/2 transform -translate-x-1/2 group-hover:animate-ping"></div>
        <div className="absolute w-1 h-1 bg-cyan-400 rounded-full bottom-3 right-6 group-hover:animate-pulse"></div>
        <div className="absolute w-1 h-1 bg-pink-400 rounded-full top-4 left-6 group-hover:animate-bounce"></div>
      </div>
      
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-cyan-400/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"></div>
      
      {/* Content */}
      <span className="relative z-10">{children}</span>
    </button>
  );
}

interface PulseCTAProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  isActive?: boolean;
}

export function PulseCTA({ children, onClick, className = '', isActive = false }: PulseCTAProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative inline-flex items-center justify-center px-6 py-2 text-sm font-medium rounded-full transition-all duration-300",
        isActive 
          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" 
          : "glass-morphism hover:bg-white/10 text-gray-300 hover:text-white",
        className
      )}
    >
      {/* Pulse rings */}
      {isActive && (
        <>
          <span className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 animate-ping opacity-20"></span>
          <span className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse opacity-30"></span>
        </>
      )}
      
      {/* Content */}
      <span className="relative z-10">{children}</span>
    </button>
  );
}