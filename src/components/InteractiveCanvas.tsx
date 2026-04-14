import { motion } from 'framer-motion';
import React, { useState, useRef } from 'react';

// Wrapper to enable Framer Motion dragging + Absolute 360° Rotation using an inner uncoupled transform
function RotatableItem({ children, initialX, initialY, initialRotate, zIndex, onDragStart }: any) {
  const [rotation, setRotation] = useState(initialRotate);
  const outerRef = useRef<HTMLDivElement>(null);

  const startRotation = (e: React.PointerEvent) => {
    e.stopPropagation(); // Preempt Framer Motion's drag
    e.preventDefault();

    // Find the absolute center of the outer non-rotated container to serve as the perfect geometric pivot point
    const rect = outerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const initialAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    const startRotationValue = rotation;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const currentAngle = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX) * (180 / Math.PI);
      const deltaAngle = currentAngle - initialAngle;
      setRotation(startRotationValue + deltaAngle);
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      document.body.style.userSelect = 'auto';
    };

    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  return (
    <motion.div
      ref={outerRef}
      drag
      dragMomentum={false}
      onDragStart={onDragStart}
      whileDrag={{ scale: 1.05, cursor: "grabbing" }}
      style={{ zIndex, position: 'absolute' }}
      initial={{ x: initialX, y: initialY }}
      className="absolute flex items-center justify-center cursor-grab group scale-75 sm:scale-100 origin-center"
    >
      <div className="relative pointer-events-auto" style={{ transform: `rotate(${rotation}deg)` }}>
        {children}

        {/* 4 Corner Rotation Invisible Handles (Touch-ready invisible regions) */}
        <div onPointerDownCapture={startRotation} className="absolute -top-3 -left-3 w-8 h-8 rounded-full cursor-nwse-resize opacity-0 flex items-center justify-center z-50"></div>
        <div onPointerDownCapture={startRotation} className="absolute -top-3 -right-3 w-8 h-8 rounded-full cursor-nesw-resize opacity-0 flex items-center justify-center z-50"></div>
        <div onPointerDownCapture={startRotation} className="absolute -bottom-3 -left-3 w-8 h-8 rounded-full cursor-nesw-resize opacity-0 flex items-center justify-center z-50"></div>
        <div onPointerDownCapture={startRotation} className="absolute -bottom-3 -right-3 w-8 h-8 rounded-full cursor-nwse-resize opacity-0 flex items-center justify-center z-50"></div>
      </div>
    </motion.div>
  );
}

// Custom Stamps (Now beautifully opaque creamy white, avoiding pure transparent ghosts)
function Stamp({ text, subtext, isRed, isOrange }: any) {
  const border = isRed ? "text-red-500" : isOrange ? "text-[#00B359]" : "text-[#D6D0C4] dark:text-[#2A2A2A]";
  const fill = "fill-[#FDFBF7]";
  const textColor = isRed ? 'text-red-600' : isOrange ? 'text-[#00B359]' : 'text-gray-900';

  return (
    <div style={{ width: '158px', height: '200px' }} className="relative flex items-center justify-center flex-col drop-shadow-md pointer-events-none">
      <svg className={`absolute inset-0 w-full h-full ${border} ${fill} transition-colors duration-300`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 158 200">
        <mask id="path-1-inside-1_2002_582" fill="white">
          <path d="M157.891 11.1534V0H150.007C150.007 4.04392 146.719 7.32688 142.646 7.32688C138.574 7.32688 135.285 4.04392 135.285 0H128.752C128.752 4.04392 125.464 7.32688 121.391 7.32688C117.319 7.32688 114.03 4.04392 114.03 0H107.497C107.497 4.04392 104.208 7.32688 100.136 7.32688C96.0631 7.32688 92.7746 4.04392 92.7746 0H86.2412C86.2412 4.04392 82.9527 7.32688 78.8802 7.32688C74.8077 7.32688 71.5192 4.04392 71.5192 0H64.9858C64.9858 4.04392 61.6973 7.32688 57.6248 7.32688C53.5523 7.32688 50.2638 4.04392 50.2638 0H43.7304C43.7304 4.04392 40.4419 7.32688 36.3694 7.32688C32.2969 7.32688 29.0084 4.04392 29.0084 0H22.475C22.475 4.04392 19.1865 7.32688 15.1358 7.32688C11.085 7.32688 7.88367 4.04392 7.88367 0H0V11.1534C4.05072 11.1534 7.36099 14.4364 7.36099 18.4803C7.36099 22.5242 4.0725 25.8072 0 25.8072V31.5034C4.05072 31.5034 7.36099 34.7864 7.36099 38.8303C7.36099 42.8742 4.0725 46.1572 0 46.1572V51.8535C4.05072 51.8535 7.36099 55.1364 7.36099 59.1803C7.36099 63.2243 4.0725 66.5072 0 66.5072V72.2035C4.05072 72.2035 7.36099 75.4865 7.36099 79.5304C7.36099 83.5743 4.0725 86.879 0 86.879V92.5753C4.05072 92.5753 7.36099 95.8582 7.36099 99.9239C7.36099 103.99 4.0725 107.273 0 107.273V112.969C4.05072 112.969 7.36099 116.252 7.36099 120.317C7.36099 124.383 4.0725 127.666 0 127.666V133.362C4.05072 133.362 7.36099 136.645 7.36099 140.711C7.36099 144.777 4.0725 148.06 0 148.06V153.756C4.05072 153.756 7.36099 157.039 7.36099 161.104C7.36099 165.17 4.0725 168.453 0 168.453V174.149C4.05072 174.149 7.36099 177.432 7.36099 181.498C7.36099 185.564 4.0725 188.847 0 188.847V200H7.88367C7.88367 195.956 11.1722 192.651 15.2447 192.651C19.3172 192.651 22.5839 195.934 22.5839 200H29.1173C29.1173 195.956 32.4058 192.651 36.4783 192.651C40.5508 192.651 43.8393 195.934 43.8393 200H50.3727C50.3727 195.956 53.6612 192.651 57.7337 192.651C61.8062 192.651 65.0947 195.934 65.0947 200H71.6281C71.6281 195.956 74.9166 192.651 78.9891 192.651C83.0616 192.651 86.3501 195.934 86.3501 200H92.8835C92.8835 195.956 96.172 192.651 100.245 192.651C104.317 192.651 107.606 195.934 107.606 200H114.139C114.139 195.956 117.427 192.651 121.5 192.651C125.572 192.651 128.861 195.934 128.861 200H135.394C135.394 195.956 138.683 192.651 142.755 192.651C146.828 192.651 150.116 195.934 150.116 200H158V188.847C153.949 188.847 150.639 185.564 150.639 181.498C150.639 177.432 153.927 174.149 158 174.149V168.453C153.949 168.453 150.639 165.17 150.639 161.104C150.639 157.039 153.927 153.756 158 153.756V148.06C153.949 148.06 150.639 144.777 150.639 140.711C150.639 136.645 153.927 133.362 158 133.362V127.666C153.949 127.666 150.639 124.383 150.639 120.317C150.639 116.252 153.927 112.969 158 112.969V107.273C153.949 107.273 150.639 103.99 150.639 99.9239C150.639 95.8582 153.927 92.5753 158 92.5753V86.879C153.949 86.879 150.639 83.5961 150.639 79.5304C150.639 75.4647 153.927 72.2035 158 72.2035V66.5072C153.949 66.5072 150.639 63.2243 150.639 59.1803C150.639 55.1364 153.927 51.8535 158 51.8535V46.1572C153.949 46.1572 150.639 42.8742 150.639 38.8303C150.639 34.7864 153.927 31.5034 158 31.5034V25.8072C153.949 25.8072 150.639 22.5242 150.639 18.4803C150.639 14.4364 153.927 11.1534 158 11.1534H157.891Z" />
        </mask>
        <path d="M157.891 11.1534V0H150.007C150.007 4.04392 146.719 7.32688 142.646 7.32688C138.574 7.32688 135.285 4.04392 135.285 0H128.752C128.752 4.04392 125.464 7.32688 121.391 7.32688C117.319 7.32688 114.03 4.04392 114.03 0H107.497C107.497 4.04392 104.208 7.32688 100.136 7.32688C96.0631 7.32688 92.7746 4.04392 92.7746 0H86.2412C86.2412 4.04392 82.9527 7.32688 78.8802 7.32688C74.8077 7.32688 71.5192 4.04392 71.5192 0H64.9858C64.9858 4.04392 61.6973 7.32688 57.6248 7.32688C53.5523 7.32688 50.2638 4.04392 50.2638 0H43.7304C43.7304 4.04392 40.4419 7.32688 36.3694 7.32688C32.2969 7.32688 29.0084 4.04392 29.0084 0H22.475C22.475 4.04392 19.1865 7.32688 15.1358 7.32688C11.085 7.32688 7.88367 4.04392 7.88367 0H0V11.1534C4.05072 11.1534 7.36099 14.4364 7.36099 18.4803C7.36099 22.5242 4.0725 25.8072 0 25.8072V31.5034C4.05072 31.5034 7.36099 34.7864 7.36099 38.8303C7.36099 42.8742 4.0725 46.1572 0 46.1572V51.8535C4.05072 51.8535 7.36099 55.1364 7.36099 59.1803C7.36099 63.2243 4.0725 66.5072 0 66.5072V72.2035C4.05072 72.2035 7.36099 75.4865 7.36099 79.5304C7.36099 83.5743 4.0725 86.879 0 86.879V92.5753C4.05072 92.5753 7.36099 95.8582 7.36099 99.9239C7.36099 103.99 4.0725 107.273 0 107.273V112.969C4.05072 112.969 7.36099 116.252 7.36099 120.317C7.36099 124.383 4.0725 127.666 0 127.666V133.362C4.05072 133.362 7.36099 136.645 7.36099 140.711C7.36099 144.777 4.0725 148.06 0 148.06V153.756C4.05072 153.756 7.36099 157.039 7.36099 161.104C7.36099 165.17 4.0725 168.453 0 168.453V174.149C4.05072 174.149 7.36099 177.432 7.36099 181.498C7.36099 185.564 4.0725 188.847 0 188.847V200H7.88367C7.88367 195.956 11.1722 192.651 15.2447 192.651C19.3172 192.651 22.5839 195.934 22.5839 200H29.1173C29.1173 195.956 32.4058 192.651 36.4783 192.651C40.5508 192.651 43.8393 195.934 43.8393 200H50.3727C50.3727 195.956 53.6612 192.651 57.7337 192.651C61.8062 192.651 65.0947 195.934 65.0947 200H71.6281C71.6281 195.956 74.9166 192.651 78.9891 192.651C83.0616 192.651 86.3501 195.934 86.3501 200H92.8835C92.8835 195.956 96.172 192.651 100.245 192.651C104.317 192.651 107.606 195.934 107.606 200H114.139C114.139 195.956 117.427 192.651 121.5 192.651C125.572 192.651 128.861 195.934 128.861 200H135.394C135.394 195.956 138.683 192.651 142.755 192.651C146.828 192.651 150.116 195.934 150.116 200H158V188.847C153.949 188.847 150.639 185.564 150.639 181.498C150.639 177.432 153.927 174.149 158 174.149V168.453C153.949 168.453 150.639 165.17 150.639 161.104C150.639 157.039 153.927 153.756 158 153.756V148.06C153.949 148.06 150.639 144.777 150.639 140.711C150.639 136.645 153.927 133.362 158 133.362V127.666C153.949 127.666 150.639 124.383 150.639 120.317C150.639 116.252 153.927 112.969 158 112.969V107.273C153.949 107.273 150.639 103.99 150.639 99.9239C150.639 95.8582 153.927 92.5753 158 92.5753V86.879C153.949 86.879 150.639 83.5961 150.639 79.5304C150.639 75.4647 153.927 72.2035 158 72.2035V66.5072C153.949 66.5072 150.639 63.2243 150.639 59.1803C150.639 55.1364 153.927 51.8535 158 51.8535V46.1572C153.949 46.1572 150.639 42.8742 150.639 38.8303C150.639 34.7864 153.927 31.5034 158 31.5034V25.8072C153.949 25.8072 150.639 22.5242 150.639 18.4803C150.639 14.4364 153.927 11.1534 158 11.1534H157.891Z" stroke="currentColor" strokeWidth="2" mask="url(#path-1-inside-1_2002_582)" />
      </svg>
      {/* Decorative patterns strictly bound to the opaque fill, no outer rectangular border */}
      <div className="absolute inset-0 z-0 overflow-hidden mix-blend-multiply dark:mix-blend-normal">
        {/* Decorative inner pattern based on theme */}
        {isRed && <div className="absolute inset-0 opacity-[0.1]" style={{ backgroundImage: 'radial-gradient(circle, #EF4444 1.5px, transparent 1.5px)', backgroundSize: '8px 8px' }}></div>}
        {isOrange && <div className="absolute inset-0 opacity-50" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, #00B359 4px, #00B359 5px), repeating-linear-gradient(-45deg, transparent, transparent 4px, #00B359 4px, #00B359 5px)',
          maskImage: 'radial-gradient(ellipse at center, black, transparent 80%)'
        }}></div>}
        {!isRed && !isOrange && <div className="absolute inset-0 opacity-[0.1]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)', backgroundSize: '12px 12px' }}></div>}
      </div>
      <span className={`font-editorial ${isOrange ? 'text-[28px] px-4 text-center tracking-normal font-normal' : 'text-5xl font-bold tracking-tighter'} z-10 leading-none mix-blend-multiply dark:mix-blend-normal ${textColor}`}>{text}</span>
      <span className={`font-mono text-[9px] z-10 mt-2 uppercase tracking-widest text-center ${isRed ? 'text-red-500 font-bold' : isOrange ? 'text-orange-600 font-bold' : 'text-gray-600'}`}>{subtext}</span>
    </div>
  );
}

// Gridded Paper with Wireframe Sketches
function GriddedPaper() {
  return (
    <div className="w-[260px] h-[340px] bg-[#FDFBF7] shadow-xl border border-gray-200 relative overflow-hidden flex flex-col pointer-events-none">
      {/* Engineering Grid (Deeper Green for visibility) */}
      <div className="absolute inset-0 opacity-[0.12]" style={{
        backgroundImage: 'linear-gradient(to right, #00B359 1px, transparent 1px), linear-gradient(to bottom, #00B359 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }}></div>

      {/* Simplified Wireframe Sketches (Now in high-contrast Black) */}
      <svg className="absolute inset-0 w-full h-full p-8 opacity-40" viewBox="0 0 100 120">
        {/* Simple Product Form Layout */}
        <rect x="15" y="20" width="70" height="50" rx="4" fill="none" stroke="#1A1A1A" strokeWidth="0.5" />
        <circle cx="50" cy="45" r="15" fill="none" stroke="#1A1A1A" strokeWidth="0.5" />
        <line x1="15" y1="20" x2="85" y2="70" stroke="#1A1A1A" strokeWidth="0.2" strokeDasharray="1 1" />
        <line x1="85" y1="20" x2="15" y2="70" stroke="#1A1A1A" strokeWidth="0.2" strokeDasharray="1 1" />
      </svg>

      {/* HTML text avoids html-to-image SVG <text> clipping issues for the first (P) and last (4) letters */}
      <div className="absolute top-[215px] inset-x-0 text-center opacity-40">
        <span className="font-mono text-[10px] text-[#1A1A1A] uppercase tracking-wider font-medium">Product ID / v04</span>
      </div>

      {/* Corner Label */}
      <div className="absolute bottom-4 left-4 font-mono text-[8px] text-[#1A1A1A] opacity-60 uppercase tracking-widest">
        Koba Studio
      </div>
    </div>
  );
}

function Note({ text }: any) {
  const plainText = text.replace(/<br\/>/g, '\n').replace(/<i>/g, '').replace(/<\/i>/g, '');

  return (
    <div className="p-3 bg-[#FCF8E3] dark:bg-[#DED7B8] w-[140px] h-[110px] shadow-lg flex flex-col gap-1 border border-[#E1DBB5] dark:border-[#C4BF9C] overflow-hidden relative font-['Departure_Mono'] group">
      {/* Tape styling */}
      <div className="w-8 h-2.5 bg-[#E1DBB5]/80 dark:bg-[#C4BF9C]/80 absolute -top-1 -left-2 -rotate-2 pointer-events-none"></div>

      <textarea
        defaultValue={plainText}
        className="w-full h-full bg-transparent border-none outline-none resize-none text-[#0F172A] font-medium text-[11px] leading-tight tracking-tight relative z-10"
        onPointerDown={(e) => e.stopPropagation()}
        placeholder="Type..."
      />
    </div>
  );
}

// --- Custom Draggable Desk SVG Tools ---
function RulerTool() {
  return (
    <div className="w-64 h-10 bg-[#FDFBF7] border border-black/20 rounded-sm flex flex-col relative shadow-lg pointer-events-none overflow-hidden">
      <div className="w-full flex justify-between px-2 pt-0.5">
        {Array.from({ length: 31 }).map((_, i) => (
          <div key={i} className={`w-px ${i % 5 === 0 ? 'bg-black h-3' : 'bg-black/40 h-1.5'}`} />
        ))}
      </div>
      <div className="w-full h-px bg-black/20 mt-1"></div>
      <div className="absolute bottom-1 right-2 text-[8px] font-mono text-black/60 uppercase tracking-widest">Koba Studio</div>
    </div>
  );
}



function PencilTool() {
  return (
    <svg viewBox="0 0 12 180" width="12" height="180" className="drop-shadow-md pointer-events-none">
      {/* Sleek Minimal Mechanical Pencil Body */}
      <rect x="0" y="0" width="12" height="150" fill="#00B359" rx="1" />
      <polygon points="0,150 12,150 6,170" fill="#D1D5DB" />
      <rect x="5" y="170" width="2" height="8" fill="#374151" />
      <rect x="0" y="20" width="12" height="2" fill="rgba(0,0,0,0.1)" />
      <rect x="0" y="100" width="12" height="1.5" fill="rgba(255,255,255,0.2)" />
    </svg>
  );
}

// --- Main Canvas Board ---

export default function InteractiveCanvas() {
  const [maxZ, setMaxZ] = useState(1);
  const [items, setItems] = useState([
    { id: 'grid-paper', type: 'paper', rotate: 0, x: 60, y: 120, z: 1 },
    { id: 'ruler', type: 'ruler', rotate: 18, x: 40, y: 380, z: 5 },
    { id: 'pencil', type: 'pencil', rotate: 135, x: 280, y: 80, z: 4 },
    { id: 'note', type: 'note', text: 'Hardware meets Software.', rotate: -10, x: 15, y: 35, z: 10 },
  ]);

  const bringToFront = (id: string) => {
    setMaxZ(prev => prev + 1);
    setItems(current => current.map(item =>
      item.id === id ? { ...item, z: maxZ + 1 } : item
    ));
  };

  return (
    <div
      data-hide-cursor="true"
      className="relative w-full h-full min-h-[650px] sm:min-h-[500px] rounded-xl overflow-hidden shadow-none border border-dashed border-gray-200 dark:border-[#262626] transition-colors duration-300 group cursor-crosshair"
    >

      {/* Decorative Interactive Canvas Dotted Grid - Fixed specifically for Dark Mode visibility using currentColor */}
      <div
        className="absolute inset-0 z-0 opacity-40 dark:opacity-[0.15] text-[#1A1A1A] dark:text-[#EBEBEB]"
        style={{
          backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Bottom overlay fade */}
      <div className="absolute inset-0 bg-linear-to-t from-[#EBEBEB] dark:from-[#0A0A0A] via-transparent to-transparent z-0 pointer-events-none"></div>

      {/* Draggable Sandbox items */}
      <div className="absolute inset-0 z-10 w-full h-full">
        {items.map(item => {
          let innerComponent = null;

          if (item.type === 'note') {
            innerComponent = <Note text={item.text} />;
          } else if (item.type === 'ruler') {
            innerComponent = <RulerTool />;
          } else if (item.type === 'paper') {
            innerComponent = <GriddedPaper />;
          } else if (item.type === 'pencil') {
            innerComponent = <PencilTool />;
          }

          return (
            <RotatableItem
              key={item.id}
              initialRotate={item.rotate}
              initialX={item.x}
              initialY={item.y}
              zIndex={item.z}
              onDragStart={() => bringToFront(item.id)}
            >
              {innerComponent}
            </RotatableItem>
          );
        })}
      </div>

      {/* Top centered hint to match user image */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-black/80 px-4 py-2 rounded-full backdrop-blur-sm border border-gray-200 dark:border-gray-800 pointer-events-none z-50 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity font-mono text-[11px] uppercase text-black dark:text-white tracking-widest">
        ROTATE (GRAB CORNERS)
      </div>
    </div>
  );
}
