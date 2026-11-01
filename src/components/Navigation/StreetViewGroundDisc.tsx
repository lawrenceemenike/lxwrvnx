import React from 'react';

interface StreetViewGroundDiscProps {
  x: number; // percentage or px
  y: number;
  visible: boolean;
  direction: 'forward' | 'backward' | 'left' | 'right';
  label: string;
  onClick: () => void;
}

export const StreetViewGroundDisc: React.FC<StreetViewGroundDiscProps> = ({
  x,
  y,
  visible,
  direction,
  label,
  onClick
}) => {
  if (!visible) return null;

  // Direction angle for chevron
  let rotation = 0;
  if (direction === 'forward') rotation = 0;
  if (direction === 'right') rotation = 45;
  if (direction === 'left') rotation = -45;
  if (direction === 'backward') rotation = 180;

  return (
    <div
      onClick={onClick}
      className="absolute pointer-events-auto cursor-pointer z-20 transition-all duration-75 select-none"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -50%)'
      }}
    >
      {/* 3D Perspective Projected Disc on Floor */}
      <div 
        className="relative flex items-center justify-center"
        style={{
          transform: 'perspective(600px) rotateX(68deg)',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Outer Elliptical Halo */}
        <div className="w-28 h-28 rounded-full border border-white/40 bg-white/10 backdrop-blur-[2px] shadow-[0_0_20px_rgba(255,255,255,0.25)] flex items-center justify-center transition-transform hover:scale-110 hover:border-[#FF6B1A] hover:bg-[#FF6B1A]/20">
          
          {/* Inner Ring */}
          <div className="w-16 h-16 rounded-full border border-white/60 flex items-center justify-center">
            
            {/* Street View Directional Chevron (matching Google Maps) */}
            <svg
              viewBox="0 0 24 24"
              className="w-9 h-9 fill-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] transition-transform duration-200"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              <path d="M12 4L3 15h6v5h6v-5h6L12 4z" />
            </svg>

          </div>

        </div>
      </div>

      {/* Street View Tooltip Pill */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap bg-[#070A0E]/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 shadow-xl pointer-events-none">
        <span className="font-mono-hud text-[9px] font-bold text-white tracking-widest uppercase flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B1A] animate-ping" />
          {label}
        </span>
      </div>
    </div>
  );
};
