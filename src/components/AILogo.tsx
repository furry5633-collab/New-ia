import React from 'react';
import mathAiLogo from '../assets/images/math_ai_logo_1788166806106.jpg';

interface AILogoProps {
  className?: string;
  size?: number;
  rounded?: string;
}

export const AILogo: React.FC<AILogoProps> = ({
  className = 'w-6 h-6',
  size,
  rounded = 'rounded-lg',
}) => {
  return (
    <div
      className={`relative overflow-hidden inline-flex items-center justify-center bg-stone-900 border border-stone-800 shadow-xs shrink-0 ${rounded} ${className}`}
      style={size ? { width: size, height: size } : undefined}
    >
      <img
        src={mathAiLogo}
        alt="Math AI Logo"
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

