/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import DotGridShader from './components/DotGridShader';
import LoupeEffect from './components/LoupeEffect';
import TextCycler from './components/TextCycler';
import DraggableCanvas from './components/DraggableCanvas';
import StampCollection from './components/StampCollection';
import Notes from './components/Notes';

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      
      tl.from('.animate-fade-in', { y: 10, opacity: 0, duration: 0.8, stagger: 0.1 });
    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <div className={`${theme}`}>
      <div ref={containerRef} className="min-h-screen bg-[#EBEBEB] dark:bg-[#0A0A0A] text-[#1A1A1A] dark:text-[#EBEBEB] font-sans grid grid-cols-[1fr_minmax(0,800px)_1fr] grid-rows-[auto_auto_auto_auto_auto_1fr] transition-colors duration-300">
        
        {/* Row 1: Header */}
        <div className="border-b border-r border-dashed border-gray-300 dark:border-[#262626] transition-colors duration-300"></div>
        <div className="border-b border-dashed border-gray-300 dark:border-[#262626] py-16 px-8 flex flex-col gap-1 animate-fade-in transition-colors duration-300 relative">
          <button 
            onClick={toggleTheme}
            className="absolute top-8 right-8 text-xs font-mono text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            {theme === 'dark' ? 'LIGHT MODE' : 'DARK MODE'}
          </button>
          <div className="font-sans text-sm text-gray-600 dark:text-gray-400">ブカ</div>
          <div className="font-sans text-sm text-[#FF4500] font-medium">
            <TextCycler texts={['Buka Studio', 'Creative Systems', 'Aether Dynamics']} interval={3000} />
          </div>
          <div className="font-sans text-sm text-gray-600 dark:text-gray-400">Design and development</div>
        </div>
        <div className="border-b border-l border-dashed border-gray-300 dark:border-[#262626] transition-colors duration-300"></div>

        {/* Row 2: Shader with Crosshairs */}
        <div className="border-b border-r border-dashed border-gray-300 dark:border-[#262626] transition-colors duration-300"></div>
        <div className="border-b border-dashed border-gray-300 dark:border-[#262626] relative aspect-square animate-fade-in overflow-hidden transition-colors duration-300">
          {/* Crosshairs */}
          <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-600 font-mono text-lg leading-none select-none z-20">+</div>
          <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-600 font-mono text-lg leading-none select-none z-20">+</div>
          <div className="absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 text-gray-400 dark:text-gray-600 font-mono text-lg leading-none select-none z-20">+</div>
          <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 text-gray-400 dark:text-gray-600 font-mono text-lg leading-none select-none z-20">+</div>
          
          <DotGridShader theme={theme} />
        </div>
        <div className="border-b border-l border-dashed border-gray-300 dark:border-[#262626] transition-colors duration-300"></div>

        {/* Row 3: Text Paragraphs */}
        <div className="border-b border-r border-dashed border-gray-300 dark:border-[#262626] transition-colors duration-300"></div>
        <div className="border-b border-dashed border-gray-300 dark:border-[#262626] py-16 px-8 flex flex-col gap-8 max-w-2xl animate-fade-in transition-colors duration-300">
          <p className="font-sans text-xl md:text-2xl font-medium text-gray-900 dark:text-white tracking-tight">
            We help founders turn ideas into products and brands.
          </p>
          <p className="font-sans text-lg md:text-xl text-gray-800 dark:text-gray-300 leading-relaxed">
            We're <span className="font-medium underline decoration-1 underline-offset-4">Marijana</span> and <span className="font-medium underline decoration-1 underline-offset-4">Robert</span>, a designer-developer duo behind Buka Studio. We work closely with teams we believe in.
          </p>
          <p className="font-sans text-lg md:text-xl text-gray-600 dark:text-gray-500 italic leading-relaxed">
            We like projects where design and code move together, so nothing gets lost in translation.
          </p>
          <p className="font-sans text-lg md:text-xl text-gray-800 dark:text-gray-300 leading-relaxed">
            We're drawn to new ideas. We dive in fast, and explore broadly. Whether we're shaping early ideas, refining products in production, or crafting bold visuals for one-off moments, we make sure everything feels cohesive and on-brand.
          </p>
          <div className="pt-8 flex flex-col gap-4">
            <p className="font-sans text-sm text-gray-600 dark:text-gray-500">
              If you share this vision, and are looking for a partner to push your product forward, say <a href="#" className="font-medium text-gray-900 dark:text-white underline decoration-1 underline-offset-4">hello@buka.studio</a>
            </p>
            <p className="font-sans text-sm text-gray-600 dark:text-gray-500">
              Based in Croatia, available remotely.
            </p>
            <p className="font-sans text-lg text-[#FF4500] italic mt-4">
              Marijana & Robert ☺
            </p>
          </div>
        </div>
        <div className="border-b border-l border-dashed border-gray-300 dark:border-[#262626] transition-colors duration-300"></div>

        {/* Row 4: Bento Grid */}
        <div className="border-b border-r border-dashed border-gray-300 dark:border-[#262626] transition-colors duration-300"></div>
        <div className="border-b border-dashed border-gray-300 dark:border-[#262626] py-16 px-8 animate-fade-in transition-colors duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="h-[500px]">
              <DraggableCanvas />
            </div>
            <div className="flex flex-col gap-6 h-[500px]">
              <div className="flex-1">
                <StampCollection />
              </div>
              <div className="shrink-0">
                <Notes />
              </div>
            </div>
          </div>
        </div>
        <div className="border-b border-l border-dashed border-gray-300 dark:border-[#262626] transition-colors duration-300"></div>

        {/* Row 5: Footer */}
        <div className="border-r border-dashed border-gray-300 dark:border-[#262626] transition-colors duration-300"></div>
        <div className="py-32 px-8 flex flex-col items-center justify-center gap-6 text-center animate-fade-in">
          <div className="font-mono text-xs text-gray-500 dark:text-gray-600">***</div>
          <div className="font-mono text-xs text-gray-500 dark:text-gray-600 tracking-widest">| MAKING SOFTWARE |</div>
          <div className="font-mono text-xs text-gray-500 dark:text-gray-600 tracking-widest leading-relaxed max-w-md">
            A REFERENCE MANUAL FOR PEOPLE WHO DESIGN AND BUILD SOFTWARE.<br/>
            WRITTEN AND ILLUSTRATED BY DAN HOLLICK
          </div>
          <div className="font-mono text-xs text-gray-500 dark:text-gray-600 tracking-widest">| © 1990 |</div>
        </div>
        <div className="border-l border-dashed border-gray-300 dark:border-[#262626] transition-colors duration-300"></div>

        {/* Dithered Gradient Bottom */}
        <div className="col-span-3 h-16 w-full opacity-20 dark:opacity-20" style={{
          backgroundImage: theme === 'dark' 
            ? 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 4 4%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M0 0h1v1H0zm2 0h1v1H2zm-1 1h1v1H1zm2 0h1v1H3zm-2 1h1v1H0zm2 0h1v1H2zm-1 1h1v1H1zm2 0h1v1H3z%22 fill=%22%23ffffff%22 fill-rule=%22evenodd%22/%3E%3C/svg%3E")'
            : 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 4 4%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M0 0h1v1H0zm2 0h1v1H2zm-1 1h1v1H1zm2 0h1v1H3zm-2 1h1v1H0zm2 0h1v1H2zm-1 1h1v1H1zm2 0h1v1H3z%22 fill=%22%23000000%22 fill-rule=%22evenodd%22/%3E%3C/svg%3E")',
          backgroundSize: '4px 4px',
          maskImage: 'linear-gradient(to bottom, transparent, black)'
        }}></div>

        <LoupeEffect targetRef={containerRef} theme={theme} />
      </div>
    </div>
  );
}
