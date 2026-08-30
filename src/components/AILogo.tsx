import React from 'react';

interface AILogoProps {
  className?: string;
  size?: number;
}

export const AILogo: React.FC<AILogoProps> = ({ className = 'w-6 h-6', size }) => {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      <defs>
        <linearGradient id="aiLogoGrad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F59E0B" />
          <stop offset="0.5" stopColor="#D97706" />
          <stop offset="1" stopColor="#FBBF24" />
        </linearGradient>
      </defs>

      {/* Orbit geometric stroke */}
      <circle
        cx="24"
        cy="24"
        r="20"
        stroke="url(#aiLogoGrad)"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeDasharray="4 6"
        opacity="0.5"
      />

      {/* Abstract Infinity / Node Structure */}
      <path
        d="M16 17C12.134 17 9 20.134 9 24C9 27.866 12.134 31 16 31C20.5 31 27.5 17 32 17C35.866 17 39 20.134 39 24C39 27.866 35.866 31 32 31C27.5 31 20.5 17 16 17Z"
        stroke="url(#aiLogoGrad)"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle cx="24" cy="24" r="3.5" fill="url(#aiLogoGrad)" />
      <circle cx="24" cy="24" r="1.5" fill="#FFFBEB" />
    </svg>
  );
};
