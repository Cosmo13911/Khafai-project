"use client";

import React from "react";

export interface BobbingDotsProps {
  count?: number;
  duration?: number;
  className?: string;
  dotClassName?: string;
}

export const BobbingDots: React.FC<BobbingDotsProps> = ({
  count = 4,
  duration = 0.75,
  className = "",
  dotClassName = "w-3.5 h-3.5 rounded-full bg-purple-600 shadow-sm",
}) => {
  const dots = Array.from({ length: count });

  return (
    <div className={`inline-flex items-center justify-center space-x-2.5 py-4 ${className}`}>
      {dots.map((_, index) => (
        <div
          key={index}
          className={`${dotClassName} animate-bobbing`}
          style={{
            animationDuration: `${duration}s`,
            animationDelay: `${index * 0.15}s`,
          }}
        />
      ))}
    </div>
  );
};
