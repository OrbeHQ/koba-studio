import React, { useRef } from 'react';
import { motion } from 'motion/react';

export default function DraggableCanvas() {
  const constraintsRef = useRef<HTMLDivElement>(null);

  // Generate some random cards
  const cards = Array.from({ length: 6 }).map((_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 150,
    y: (Math.random() - 0.5) * 150,
    rotate: (Math.random() - 0.5) * 60,
  }));

  return (
    <div className="relative w-full h-full min-h-[400px] bg-white dark:bg-[#0A0A0A] rounded-xl border border-gray-200 dark:border-[#262626] overflow-hidden flex flex-col transition-colors duration-300">
      <div className="flex-1 relative overflow-hidden" ref={constraintsRef}>
        {/* Grid Background */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-20 transition-opacity duration-300"
          style={{
            backgroundImage: 'radial-gradient(circle, #888 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />
        
        {/* Draggable Cards */}
        {cards.map((card) => (
          <motion.div
            key={card.id}
            drag
            dragConstraints={constraintsRef}
            dragElastic={0.1}
            dragMomentum={false}
            initial={{ x: card.x, y: card.y, rotate: card.rotate }}
            whileHover={{ scale: 1.05, zIndex: 10 }}
            whileDrag={{ scale: 1.1, zIndex: 20, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}
            className="absolute top-1/2 left-1/2 -ml-12 -mt-16 w-24 h-32 bg-white dark:bg-[#1A1A1A] rounded-md border border-gray-200 dark:border-[#333] shadow-sm cursor-grab active:cursor-grabbing transition-colors duration-300"
            style={{
              backgroundImage: 'linear-gradient(to right, transparent 10px, rgba(0,0,0,0.05) 10px, rgba(0,0,0,0.05) 11px, transparent 11px)'
            }}
          />
        ))}
      </div>
      
      {/* Footer Bar */}
      <div className="p-4 border-t border-gray-200 dark:border-[#262626] flex justify-between items-center bg-white dark:bg-[#0A0A0A] z-10 transition-colors duration-300">
        <span className="font-mono text-xs font-bold tracking-widest text-gray-900 dark:text-white uppercase">Sketchbook</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
          <path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
        </svg>
      </div>
    </div>
  );
}
