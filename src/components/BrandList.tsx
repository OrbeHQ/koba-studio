import React, { useState } from 'react';
import { playTapSound } from '../lib/audio';

const brands = [
  { name: 'ABRIDGE', logo: 'ABRIDGE', color: '#FF6B2B' },
  { name: 'clay', logo: 'clay', color: '#4ECDC4' },
  { name: 'CURSOR', logo: 'CURSOR', color: '#7C5CFC' },
  { name: 'Decagon', logo: 'Decagon', color: '#FF3366' },
  { name: 'descript', logo: 'descript', color: '#00C2FF' },
  { name: 'EliseAI', logo: 'EliseAI', color: '#FFB800' },
];

interface BrandListProps {
  onBrandHover?: (color: string | null) => void;
}

export default function BrandList({ onBrandHover }: BrandListProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="w-full flex flex-col">
      {/* Label beautifully aligned with the overarching grid structural boundaries */}
      <div className="px-5 sm:px-8 font-mono text-[10px] uppercase tracking-[0.3em] mb-6 text-gray-500 dark:text-gray-400 antialiased font-medium">
        Creative brands we've helped_
      </div>

      {/* Full-width grid that touches the side pillars */}
      <div className="grid grid-cols-2 border-t border-dotted border-gray-300 dark:border-[#262626]">
        {brands.map((brand, index) => {
          const isHovered = hoveredIndex === index;
          return (
            <a
              key={index}
              href="#"
              onClick={(e) => { e.preventDefault(); playTapSound(); }}
              onMouseEnter={() => {
                setHoveredIndex(index);
                onBrandHover?.(brand.color);
              }}
              onMouseLeave={() => {
                setHoveredIndex(null);
                onBrandHover?.(null);
              }}
              className={`
                relative flex items-center justify-center h-24 sm:h-28
                border-b border-dotted border-gray-300 dark:border-[#262626]
                ${index % 2 === 0 ? 'border-r border-dotted' : ''}
                transition-colors duration-200 overflow-hidden
              `}
              style={isHovered ? { backgroundColor: brand.color } : undefined}
            >
              <span className={`
                font-['Departure_Mono'] text-[14px] sm:text-[16px] tracking-tight
                transition-colors duration-200
                ${brand.name === 'ABRIDGE' ? 'font-bold tracking-tighter' : ''}
                ${brand.name === 'clay' ? 'italic' : ''}
                ${brand.name === 'CURSOR' ? 'uppercase font-bold' : ''}
                ${isHovered ? 'text-black' : 'text-black dark:text-white'}
              `}>
                {brand.logo}
              </span>

              {/* Subtle arrow that appears on hover */}
              <svg
                className={`absolute top-2 right-2 w-3 h-3 text-black transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M7 7h10v10" />
              </svg>
            </a>
          );
        })}
      </div>
    </div>
  );
}
