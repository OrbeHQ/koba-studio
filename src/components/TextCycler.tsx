import React, { useState, useEffect } from 'react';

export default function TextCycler({ texts, interval = 2000, className = '' }: { texts: string[], interval?: number, className?: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % texts.length);
    }, interval);
    return () => clearInterval(timer);
  }, [texts, interval]);

  return (
    <span className={`inline-block transition-opacity duration-300 ${className}`}>
      {texts[index]}
    </span>
  );
}
