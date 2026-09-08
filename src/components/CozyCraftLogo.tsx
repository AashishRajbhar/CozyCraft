import React from 'react';

interface CozyCraftLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const CozyCraftLogo: React.FC<CozyCraftLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  }[size];

  const textDimensions = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Botanical Lavender Icon */}
      <div className={`relative flex items-center justify-center rounded-full bg-[#E5DEFF] ${iconDimensions} shadow-sm shrink-0 overflow-hidden`}>
        <svg
          viewBox="0 0 40 40"
          className="w-[72%] h-[72%]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Center Leaf */}
          <path
            d="M20 7C20 7 24.5 13 24.5 19C24.5 22.5 22.5 25 20 25C17.5 25 15.5 22.5 15.5 19C15.5 13 20 7 20 7Z"
            fill="#363152"
          />
          {/* Left Leaf */}
          <path
            d="M19 23.5C19 23.5 13.5 20.5 9 24C5.5 26.8 5 30.5 8 32.5C11 34.5 15.5 32 17.5 29C18.8 27 19 24.5 19 23.5Z"
            fill="#363152"
          />
          {/* Right Leaf */}
          <path
            d="M21 23.5C21 23.5 26.5 20.5 31 24C34.5 26.8 35 30.5 32 32.5C29 34.5 24.5 32 22.5 29C21.2 27 21 24.5 21 23.5Z"
            fill="#363152"
          />
        </svg>
      </div>

      {showText && (
        <span
          className={`font-bold tracking-tight text-[#363152] font-['Plus_Jakarta_Sans'] ${textDimensions}`}
        >
          CozyCraft
        </span>
      )}
    </div>
  );
};
