import React from 'react';

interface OrbeLogoProps {
  className?: string;
  size?: number | string;
}

/**
 * The Orbe Labs mark — four orbital quadrants in brand blue, pink, yellow and green.
 */
export default function OrbeLogo({ className = "", size = 48 }: OrbeLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} transition-opacity duration-300`}
      aria-hidden="true"
    >
      <path d="M100 0H87.4915V16.9396C77.9935 6.16979 64.3259 0 49.9661 0V12.5085C70.6908 12.5085 87.4915 29.3093 87.4915 50.0341H100V0Z" fill="#2864DC" />
      <path d="M100 49.95H87.4915V66.8896C77.9935 56.1198 64.3259 49.95 49.9661 49.95V62.4585C70.6908 62.4585 87.4915 79.2593 87.4915 99.9841H100V49.95Z" fill="#E6317A" />
      <path d="M0 0H12.5085V16.9396C22.0065 6.16979 35.6741 0 50.0339 0V12.5085C29.3092 12.5085 12.5085 29.3093 12.5085 50.0341H0V0Z" fill="#F6C945" />
      <path d="M0 49.95H12.5085V66.8896C22.0065 56.1198 35.6741 49.95 50.0339 49.95V62.4585C29.3092 62.4585 12.5085 79.2593 12.5085 99.9841H0V49.95Z" fill="#3BB34A" />
    </svg>
  );
}
