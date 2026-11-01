import React from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Compass, Plus, Minus, Maximize2 } from 'lucide-react';

interface StreetViewControlsProps {
  onMoveForward: () => void;
  onMoveBackward: () => void;
  onTurnLeft: () => void;
  onTurnRight: () => void;
  onResetView: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  panAngle: number; // yaw rotation in degrees
  canMoveForward: boolean;
  canMoveBackward: boolean;
  currentNode: number; // 0, 1, 2
}

export const StreetViewControls: React.FC<StreetViewControlsProps> = ({
  onMoveForward,
  onMoveBackward,
  onTurnLeft,
  onTurnRight,
  onResetView,
  onZoomIn,
  onZoomOut,
  panAngle,
  canMoveForward,
  canMoveBackward,
  currentNode
}) => {
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <>
      {/* 1. BOTTOM-LEFT: GOOGLE STREET VIEW LOCATION CARD */}
      <div className="absolute bottom-5 left-5 z-20 pointer-events-auto hidden sm:flex items-center gap-3 p-2.5 rounded-xl bg-[#070A0E]/85 backdrop-blur-md border border-white/15 shadow-2xl">
        <div className="w-8 h-8 rounded-lg bg-[#FF6B1A]/20 border border-[#FF6B1A] flex items-center justify-center text-[#FFA14A]">
          <Compass className="w-4 h-4" />
        </div>
        <div className="flex flex-col font-mono-hud text-[11px]">
          <span className="font-bold text-white tracking-wider">
            THE VAULT // CONCOURSE SPEEDWAY
          </span>
          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <span className="text-[#38BDF8]">06.45° N, 03.39° E</span>
            <span>•</span>
            <span className="text-[#FFA14A]">NODE 0{currentNode + 1} OF 03</span>
          </div>
        </div>
      </div>

      {/* 2. BOTTOM-CENTER: STREET VIEW DIRECTIONAL CHEVRONS */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex items-center gap-2 p-1.5 rounded-full bg-[#070A0E]/85 backdrop-blur-md border border-white/15 shadow-2xl">
        <button
          onClick={onTurnLeft}
          title="Turn Left towards Left Doors"
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          disabled={!canMoveForward}
          onClick={onMoveForward}
          title="Move Forward along Tunnel"
          className={`px-3 py-1.5 rounded-full font-mono-hud text-[11px] font-bold flex items-center gap-1.5 transition-all ${
            canMoveForward
              ? 'bg-[#FF6B1A] text-slate-950 hover:bg-[#FFA14A] shadow-[0_0_15px_rgba(255,107,26,0.5)]'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          <ChevronUp className="w-4 h-4" />
          <span>FORWARD</span>
        </button>

        <button
          disabled={!canMoveBackward}
          onClick={onMoveBackward}
          title="Move Backward"
          className={`px-3 py-1.5 rounded-full font-mono-hud text-[11px] font-bold flex items-center gap-1.5 transition-all ${
            canMoveBackward
              ? 'bg-slate-800 text-white hover:bg-slate-700'
              : 'bg-slate-800/40 text-slate-600 cursor-not-allowed'
          }`}
        >
          <ChevronDown className="w-4 h-4" />
          <span>BACK</span>
        </button>

        <button
          onClick={onTurnRight}
          title="Turn Right towards Right Doors"
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* 3. BOTTOM-RIGHT: STREET VIEW COMPASS & ZOOM CONTROLS (matching Google Maps in Image 2) */}
      <div className="absolute bottom-5 right-5 z-20 pointer-events-auto flex flex-col items-center gap-2">
        {/* Google Maps Style Compass Rose */}
        <button
          onClick={onResetView}
          title="Reset Camera Orientation to Center"
          className="relative w-11 h-11 rounded-full bg-[#070A0E]/85 backdrop-blur-md border border-white/20 shadow-2xl flex items-center justify-center hover:border-[#FF6B1A] transition-colors group"
        >
          {/* Rotating Compass Needle */}
          <div
            className="w-full h-full flex items-center justify-center transition-transform duration-100"
            style={{ transform: `rotate(${-panAngle}deg)` }}
          >
            {/* North Red Needle */}
            <div className="absolute top-1.5 w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-b-[9px] border-b-red-500" />
            {/* South White Needle */}
            <div className="absolute bottom-1.5 w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-t-[9px] border-t-white" />
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          </div>
          <span className="absolute -top-1 font-mono-hud text-[8px] font-bold text-red-500">N</span>
        </button>

        {/* Zoom & Fullscreen Pills */}
        <div className="flex flex-col rounded-xl bg-[#070A0E]/85 backdrop-blur-md border border-white/20 overflow-hidden shadow-2xl">
          <button
            onClick={onZoomIn}
            title="Zoom In"
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 transition-colors border-b border-white/10"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onZoomOut}
            title="Zoom Out"
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 transition-colors border-b border-white/10"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleFullscreen}
            title="Toggle Fullscreen"
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </>
  );
};
