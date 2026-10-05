import React from 'react';

interface NationalEmblemProps {
  className?: string;
  size?: number;
}

export const NationalEmblem: React.FC<NationalEmblemProps> = ({
  className = '',
  size = 52,
}) => {
  return (
    <div
      className={`inline-flex flex-col items-center justify-center select-none ${className}`}
      style={{ width: size, height: size * 1.25 }}
      title="State Emblem of India"
    >
      <svg
        viewBox="0 0 100 125"
        fill="currentColor"
        className="w-full h-full text-foundation-800"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Ashoka Lion Capital Vector Outline */}
        <g stroke="none" fill="currentColor">
          {/* Top Lion Heads silhouette */}
          {/* Center Lion */}
          <path d="M 45 10 C 47 5, 53 5, 55 10 C 58 14, 58 22, 54 26 C 53 28, 47 28, 46 26 C 42 22, 42 14, 45 10 Z" />
          <path d="M 47 14 C 47 12, 53 12, 53 14 C 53 18, 47 18, 47 14 Z" opacity="0.3" />
          
          {/* Left Lion */}
          <path d="M 32 15 C 34 10, 40 12, 42 16 C 43 20, 41 27, 36 28 C 32 29, 29 24, 30 20 C 30 18, 31 16, 32 15 Z" />
          
          {/* Right Lion */}
          <path d="M 68 15 C 66 10, 60 12, 58 16 C 57 20, 59 27, 64 28 C 68 29, 71 24, 70 20 C 70 18, 69 16, 68 15 Z" />
          
          {/* Lion Manes & Bodies */}
          <path d="M 33 27 C 38 25, 42 27, 43 32 C 44 38, 42 46, 40 54 L 60 54 C 58 46, 56 38, 57 32 C 58 27, 62 25, 67 27 C 72 32, 69 44, 66 54 L 34 54 C 31 44, 28 32, 33 27 Z" />
          
          {/* Central Lion Chest Details */}
          <path d="M 46 30 C 48 28, 52 28, 54 30 C 56 34, 55 42, 54 48 L 46 48 C 45 42, 44 34, 46 30 Z" opacity="0.4" />

          {/* Abacus Base / Pedestal */}
          <rect x="26" y="55" width="48" height="5" rx="1.5" />
          <rect x="28" y="61" width="44" height="15" rx="1" fillOpacity="0.15" />
          <rect x="28" y="61" width="44" height="15" rx="1" fill="none" stroke="currentColor" strokeWidth="1.2" />

          {/* Central Ashoka Chakra in Abacus */}
          <circle cx="50" cy="68.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="50" cy="68.5" r="1.5" fill="currentColor" />
          {/* Spokes */}
          <line x1="50" y1="63" x2="50" y2="74" stroke="currentColor" strokeWidth="0.8" />
          <line x1="44.5" y1="68.5" x2="55.5" y2="68.5" stroke="currentColor" strokeWidth="0.8" />
          <line x1="46" y1="64.5" x2="54" y2="72.5" stroke="currentColor" strokeWidth="0.8" />
          <line x1="54" y1="64.5" x2="46" y2="72.5" stroke="currentColor" strokeWidth="0.8" />

          {/* Galloping Horse (Left) & Bull (Right) outlines */}
          {/* Horse */}
          <path d="M 33 66 C 35 65, 38 67, 39 71 L 34 71 C 33 69, 32 67, 33 66 Z" />
          {/* Bull */}
          <path d="M 67 66 C 65 65, 62 67, 61 71 L 66 71 C 67 69, 68 67, 67 66 Z" />

          {/* Lower Lotus Plinth */}
          <rect x="24" y="77" width="52" height="4" rx="1.5" />
          
          {/* Stylized Lotus Petals */}
          <path d="M 28 81 C 32 87, 38 87, 42 81 C 46 87, 54 87, 58 81 C 62 87, 68 87, 72 81 L 70 85 C 65 89, 55 90, 50 90 C 45 90, 35 89, 30 85 Z" />
          <rect x="22" y="90" width="56" height="3" rx="1" />
        </g>

        {/* Devanagari Script: सत्यमेव जयते */}
        <text
          x="50"
          y="108"
          textAnchor="middle"
          fontSize="9"
          fontWeight="bold"
          fontFamily="'Inter', 'Noto Sans Devanagari', 'Mukta', serif"
          letterSpacing="0.05em"
          fill="currentColor"
        >
          सत्यमेव जयते
        </text>

        <text
          x="50"
          y="119"
          textAnchor="middle"
          fontSize="6.5"
          fontWeight="600"
          fontFamily="'Inter', sans-serif"
          letterSpacing="0.12em"
          fill="currentColor"
          opacity="0.85"
        >
          BHARAT · INDIA
        </text>
      </svg>
    </div>
  );
};
