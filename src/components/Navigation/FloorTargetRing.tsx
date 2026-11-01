import React from 'react';

interface FloorTargetRingProps {
  label?: string;
  sublabel?: string;
  onClick?: () => void;
  accent?: 'ember' | 'cyan';
  className?: string;
}

export const FloorTargetRing: React.FC<FloorTargetRingProps> = ({
  label,
  sublabel,
  onClick,
  accent = 'ember',
  className = ''
}) => {
  const isEmber = accent === 'ember';
  const strokeColor = isEmber ? '#FF6B1A' : '#38BDF8';
  const glowShadow = isEmber 
    ? '0 0 25px rgba(255, 107, 26, 0.7)' 
    : '0 0 25px rgba(56, 189, 248, 0.7)';

  return (
    <div
      onClick={onClick}
      className={`group relative flex flex-col items-center justify-center cursor-pointer select-none transition-transform duration-300 hover:scale-105 ${className}`}
      style={{ perspective: '800px' }}
    >
      {/* 3D Perspective Floor Ring */}
      <div 
        className="relative w-36 h-20 md:w-44 md:h-24 flex items-center justify-center"
        style={{ transform: 'rotateX(62deg)', transformStyle: 'preserve-3d' }}
      >
        {/* Outer Ring */}
        <div 
          className="absolute inset-0 rounded-full border border-dashed transition-all duration-300 group-hover:border-solid group-hover:scale-110"
          style={{ 
            borderColor: strokeColor,
            boxShadow: glowShadow,
            animation: 'spin 18s linear infinite'
          }}
        />

        {/* Middle Ring */}
        <div 
          className="absolute inset-2.5 rounded-full border transition-all duration-300"
          style={{ 
            borderColor: strokeColor,
            opacity: 0.65,
            animation: 'spin 10s linear infinite reverse'
          }}
        />

        {/* Inner Solid Ring */}
        <div 
          className="absolute inset-6 rounded-full border-2 transition-all duration-300 group-hover:scale-95"
          style={{ 
            borderColor: isEmber ? '#FFA14A' : '#7DD3FC',
            boxShadow: `0 0 15px ${strokeColor}`
          }}
        />

        {/* Center Target Dot */}
        <div 
          className="w-2.5 h-2.5 rounded-full transition-transform duration-300 group-hover:scale-150"
          style={{ 
            backgroundColor: isEmber ? '#FF6B1A' : '#38BDF8',
            boxShadow: `0 0 12px ${isEmber ? '#FF6B1A' : '#38BDF8'}`
          }}
        />

        {/* Reticle Tick Lines */}
        <div className="absolute w-full h-[1px] bg-white/20" />
        <div className="absolute h-full w-[1px] bg-white/20" />
      </div>

      {/* HUD Label Beneath Ring */}
      {label && (
        <div className="mt-1 flex flex-col items-center text-center pointer-events-none">
          <span className={`font-mono-hud text-[10px] md:text-xs font-semibold tracking-widest uppercase transition-colors duration-200 ${
            isEmber ? 'text-[#FFA14A] group-hover:text-white' : 'text-[#38BDF8] group-hover:text-white'
          }`}>
            {label}
          </span>
          {sublabel && (
            <span className="font-mono-hud text-[9px] text-slate-400 tracking-wider uppercase">
              {sublabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
