import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showSubtitle?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', className = '' }) => {
  const getSizeClass = () => {
    switch (size) {
      case '2xl': return 'max-h-48 md:max-h-56 w-auto';
      case 'xl': return 'max-h-36 md:max-h-44 w-auto';
      case 'lg': return 'max-h-28 md:max-h-36 w-auto';
      case 'sm': return 'max-h-10 w-auto';
      case 'md':
      default: return 'max-h-16 w-auto';
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      <img
        src="/logos/logo.png"
        alt="Ohana Club Logo"
        className={`object-contain transition-transform duration-300 drop-shadow-md ${getSizeClass()}`}
      />
    </div>
  );
};
