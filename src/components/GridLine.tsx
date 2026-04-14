import React from 'react';

interface GridLineProps {
  vertical?: boolean;
  className?: string;
  dashArray?: string;
  color?: string;
}

export default function GridLine({
  vertical = false,
  className = "",
  dashArray = "4 8",
  color = "currentColor"
}: GridLineProps) {
  return (
    <div className={`absolute pointer-events-none ${className}`}>
      <svg
        width="100%"
        height="100%"
        className="block overflow-visible"
      >
        <line
          x1={vertical ? "0.5" : "0"}
          y1={vertical ? "0" : "0.5"}
          x2={vertical ? "0.5" : "100%"}
          y2={vertical ? "100%" : "0.5"}
          stroke={color}
          strokeWidth="1"
          strokeDasharray={dashArray}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
