import React, { useState, useEffect, useRef } from 'react';
import { ChamberId } from '../../types';
import { useFPS } from '../../hooks/useFPS';
import { audioEngine } from '../../utils/audioEngine';
import { Camera, Sparkles, Music, User, Home, Sliders, ChevronLeft, Volume2, VolumeX, Cpu } from 'lucide-react';
import { StationTransmission } from './StationTransmission';

interface DroneHUDProps {
  currentChamber: ChamberId;
  onNavigate: (chamber: ChamberId) => void;
  onOpenStudio: () => void;
  isBuilderMode: boolean;
  onToggleBuilderMode: () => void;
  subHeader?: string;
  hasMoved: boolean;
}

export const DroneHUD: React.FC<DroneHUDProps> = ({
  currentChamber,
  onNavigate,
  onOpenStudio,
  isBuilderMode,
  onToggleBuilderMode,
  subHeader,
  hasMoved
}) => {
  const fps = useFPS();
  const [showNavHub, setShowNavHub] = useState(false);
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(audioEngine.isAmbientPlaying);
  const clickCountRef = useRef(0);
  const lastClickTimeRef = useRef(0);
  const [builderToast, setBuilderToast] = useState<string | null>(null);

  // Secret triple-click on SYS.ACT // 01 to toggle Builder Mode
  const handleSecretSysActClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = Date.now();
    if (now - lastClickTimeRef.current < 1200) {
      clickCountRef.current += 1;
    } else {
      clickCountRef.current = 1;
    }
    lastClickTimeRef.current = now;

    if (clickCountRef.current >= 3) {
      clickCountRef.current = 0;
      audioEngine.playLockOnSFX();
      const nextMode = !isBuilderMode;
      onToggleBuilderMode();
      setBuilderToast(nextMode ? 'SYS.AUTH // BUILDER MODE [UNLOCKED]' : 'SYS.AUTH // BUILDER MODE [LOCKED]');
      setTimeout(() => setBuilderToast(null), 3200);
      if (nextMode) {
        onOpenStudio();
      }
    } else {
      audioEngine.playClickSFX();
    }
  };

  // Track subcategory in optics (portraits, street, light-art)
  const [opticsSubcategory, setOpticsSubcategory] = useState<string | null>(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#/optics/')) {
      const sub = hash.replace('#/optics/', '').split('/')[0];
      return ['portraits', 'street', 'light-art'].includes(sub) ? sub : null;
    }
    return null;
  });

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/optics/')) {
        const sub = hash.replace('#/optics/', '').split('/')[0];
        setOpticsSubcategory(['portraits', 'street', 'light-art'].includes(sub) ? sub : null);
      } else {
        setOpticsSubcategory(null);
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  useEffect(() => {
    const unsubscribe = audioEngine.subscribe(() => {
      setIsAmbientPlaying(audioEngine.isAmbientPlaying);
    });
    return unsubscribe;
  }, []);

  const handleToggleAmbient = (e: React.MouseEvent) => {
    e.stopPropagation();
    audioEngine.playClickSFX();
    audioEngine.toggleAmbientScore();
  };

  const getChamberName = (chamber: ChamberId) => {
    switch (chamber) {
      case 'optics':
        return 'CHAMBER // 01: OPTICS';
      case 'synthesis':
        return 'CHAMBER // 02: SYNTHESIS [AI ART]';
      case 'acoustics':
        return 'CHAMBER // 03: ACOUSTICS [AI MUSIC]';
      case 'architect':
        return 'CHAMBER // 04: THE ARCHITECT [COMMAND]';
      case 'ai-projects':
        return 'CHAMBER // 05: AI PROJECTS [DEPLOYMENTS]';
      default:
        return 'THE VAULT // MAIN CONCOURSE';
    }
  };

  const isConcourse = currentChamber === 'concourse';

  return (
    <div className="fixed inset-0 pointer-events-none z-30 flex flex-col justify-between p-3 md:p-6 overflow-hidden select-none">
      
      {/* SCANLINES & VIGNETTE OVERLAYS */}
      <div className="absolute inset-0 scanlines opacity-20 pointer-events-none" />
      <div className="absolute inset-0 vignette-radial pointer-events-none" />

      {/* TOP HUD BAR */}
      <div className="relative z-10 flex items-start justify-between w-full">
        
        {/* Top-Left: Military HUD Telemetry & Breadcrumbs */}
        <div className="flex flex-col gap-1 pointer-events-auto">
          <div 
            onClick={handleSecretSysActClick}
            className="flex items-center gap-2 cursor-pointer select-none group"
            title="System Telemetry Node (Builder Secret: Triple-click to toggle Studio)"
          >
            <span className={`w-1.5 h-1.5 rounded-full transition-all ${
              isBuilderMode ? 'bg-[#38BDF8] shadow-[0_0_8px_#38BDF8]' : 'bg-[#FF6B1A] glow-ember animate-pulse'
            }`} />
            <span className="font-mono-hud text-[11px] font-bold text-slate-300 tracking-widest group-hover:text-white transition-colors">
              SYS.ACT // 01
            </span>
            {isBuilderMode && (
              <span className="font-mono-hud text-[8px] bg-[#FF6B1A]/20 text-[#FFA14A] border border-[#FF6B1A]/50 px-1.5 py-0.2 rounded font-bold tracking-wider">
                BUILDER
              </span>
            )}
            <span className="text-slate-600 text-xs">|</span>
            <span className="font-mono-hud text-[10px] text-[#38BDF8] tracking-widest">
              {currentChamber === 'optics' ? 'FPV_AUTOPILOT / ACTIVE' : 'FPV_GIMBAL // ACTIVE'}
            </span>
          </div>

          {/* Quick HUD Stealth Toast */}
          {builderToast && (
            <div className="font-mono-hud text-[10px] font-bold text-[#FFA14A] bg-[#0D1B24]/95 border border-[#FF6B1A] px-2.5 py-1 rounded shadow-[0_0_15px_rgba(255,107,26,0.6)] animate-fade-in w-fit">
              {builderToast}
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            {!isConcourse && (
              <button
                onClick={() => onNavigate('concourse')}
                className="flex items-center gap-1 font-mono-hud text-[10px] text-slate-300 hover:text-[#FFA14A] bg-[#0D1B24]/80 px-2.5 py-0.5 rounded border border-slate-700/60 transition-all hover:border-[#FF6B1A]"
                title="Return to Main Concourse"
              >
                <ChevronLeft className="w-3 h-3" />
                CONCOURSE
              </button>
            )}

            {currentChamber === 'optics' && opticsSubcategory && (
              <button
                onClick={() => {
                  audioEngine.playGlideSFX();
                  window.location.hash = '#/optics';
                }}
                className="flex items-center gap-1 font-mono-hud text-[10px] text-[#FF6B1A] hover:text-white bg-[#0D1B24]/90 px-2.5 py-0.5 rounded border border-[#FF6B1A]/50 hover:border-[#FF6B1A] transition-all font-bold shadow-[0_0_12px_rgba(255,107,26,0.3)] cursor-pointer"
                title="Return to Optics Gateway (Portraits, Street, Light Art)"
              >
                <ChevronLeft className="w-3 h-3" />
                OPTICS GATEWAY
              </button>
            )}

            <span className="font-mono-hud text-[11px] text-white/90 font-semibold tracking-wider">
              {currentChamber === 'optics' && opticsSubcategory
                ? `CHAMBER // 01: OPTICS [${opticsSubcategory.toUpperCase()}]`
                : getChamberName(currentChamber)}
            </span>
          </div>

          {currentChamber === 'optics' ? (
            <span className="font-mono-hud text-[10px] text-[#FFA14A] tracking-wider uppercase font-bold">
              {opticsSubcategory === 'portraits' 
                ? 'ROOM 01 // PORTRAITS PAVILION'
                : opticsSubcategory === 'street'
                  ? 'ROOM 02 // STREET CONCOURSE'
                  : opticsSubcategory === 'light-art'
                    ? 'ROOM 03 // LIGHT ART HORIZON'
                    : 'TOP 50 EXHIBITION // 3 CATEGORIES'}
            </span>
          ) : subHeader ? (
            <span className="font-mono-hud text-[9px] text-[#FFA14A] tracking-wider uppercase">
              {subHeader}
            </span>
          ) : null}

          {/* Futuristic Welcome Typewriter Transmission (Concourse Only) */}
          {isConcourse && <StationTransmission />}
        </div>

        {/* Top-Center: Chamber Navigation Hub (Only displayed in chambers or when toggled) */}
        {!isConcourse && (
          <div className="hidden md:flex items-center gap-1.5 p-1 rounded-full bg-[#0D1B24]/85 backdrop-blur-md border border-slate-800 pointer-events-auto shadow-2xl">
            <button
              onClick={() => onNavigate('concourse')}
              className="px-3 py-1 rounded-full font-mono-hud text-[10px] flex items-center gap-1.5 text-slate-400 hover:text-white cursor-pointer"
            >
              <Home className="w-3 h-3" />
              CONCOURSE
            </button>

            <button
              onClick={() => {
                if (currentChamber === 'optics' && opticsSubcategory) {
                  audioEngine.playGlideSFX();
                  window.location.hash = '#/optics';
                } else {
                  onNavigate('optics');
                }
              }}
              className={`px-3 py-1 rounded-full font-mono-hud text-[10px] flex items-center gap-1.5 transition-all cursor-pointer ${
                currentChamber === 'optics'
                  ? 'bg-[#FF6B1A] text-slate-950 font-bold shadow-[0_0_12px_rgba(255,107,26,0.5)]'
                  : 'text-slate-400 hover:text-white'
              }`}
              title={opticsSubcategory ? "Click to return to Optics Gateway (Portraits, Street, Light Art)" : "Chamber 01: Optics"}
            >
              <Camera className="w-3 h-3" />
              01 // OPTICS
            </button>

            <button
              onClick={() => onNavigate('synthesis')}
              className={`px-3 py-1 rounded-full font-mono-hud text-[10px] flex items-center gap-1.5 transition-all ${
                currentChamber === 'synthesis'
                  ? 'bg-[#FF6B1A] text-slate-950 font-bold shadow-[0_0_12px_rgba(255,107,26,0.5)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              02 // SYNTHESIS
            </button>

            <button
              onClick={() => onNavigate('acoustics')}
              className={`px-3 py-1 rounded-full font-mono-hud text-[10px] flex items-center gap-1.5 transition-all ${
                currentChamber === 'acoustics'
                  ? 'bg-[#FF6B1A] text-slate-950 font-bold shadow-[0_0_12px_rgba(255,107,26,0.5)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Music className="w-3 h-3" />
              03 // ACOUSTICS
            </button>

            <button
              onClick={() => onNavigate('architect')}
              className={`px-3 py-1 rounded-full font-mono-hud text-[10px] flex items-center gap-1.5 transition-all ${
                currentChamber === 'architect'
                  ? 'bg-[#FF6B1A] text-slate-950 font-bold shadow-[0_0_12px_rgba(255,107,26,0.5)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3 h-3" />
              04 // ARCHITECT
            </button>

            <button
              onClick={() => onNavigate('ai-projects')}
              className={`px-3 py-1 rounded-full font-mono-hud text-[10px] flex items-center gap-1.5 transition-all ${
                currentChamber === 'ai-projects'
                  ? 'bg-[#38BDF8] text-slate-950 font-bold shadow-[0_0_12px_rgba(56,189,248,0.5)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Cpu className="w-3 h-3" />
              05 // AI PROJECTS
            </button>
          </div>
        )}

        {/* Top-Right: Cinematic Score Toggle & Studio & Coordinates */}
        <div className="flex items-center gap-2.5 pointer-events-auto">
          {/* Ambient Cinematic Score Toggle Button */}
          <button
            onClick={handleToggleAmbient}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-mono-hud text-[10px] font-bold tracking-wider transition-all duration-200 border ${
              isAmbientPlaying
                ? 'bg-[#0D1B24]/90 text-[#38BDF8] border-[#38BDF8]/50 shadow-[0_0_12px_rgba(56,189,248,0.25)] hover:border-[#38BDF8]'
                : 'bg-[#0D1B24]/70 text-slate-400 border-slate-700/60 hover:text-slate-200 hover:border-slate-500'
            }`}
            title={isAmbientPlaying ? 'Mute Background Cinematic Score' : 'Play Background Cinematic Score'}
          >
            {isAmbientPlaying ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#38BDF8] animate-pulse" />
                <span className="hidden sm:inline">SCORE // LIVE</span>
                <span className="sm:hidden">SCORE</span>
                <div className="flex items-end gap-[2px] h-2.5 ml-0.5">
                  <span className="w-[2px] bg-[#38BDF8] rounded-full animate-bounce h-2" style={{ animationDuration: '0.6s' }} />
                  <span className="w-[2px] bg-[#38BDF8] rounded-full animate-bounce h-2.5" style={{ animationDuration: '0.4s' }} />
                  <span className="w-[2px] bg-[#38BDF8] rounded-full animate-bounce h-1.5" style={{ animationDuration: '0.7s' }} />
                </div>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">SCORE // MUTED</span>
                <span className="sm:hidden">MUTED</span>
              </>
            )}
          </button>

          {isBuilderMode && (
            <button
              onClick={onOpenStudio}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0D1B24]/90 hover:bg-[#FF6B1A] text-[#FFA14A] hover:text-slate-950 border border-[#FF6B1A]/50 rounded font-mono-hud text-[10px] font-bold tracking-wider transition-all duration-200 shadow-[0_0_15px_rgba(255,107,26,0.2)] animate-pulse"
              title="Open Content Uploader & Manifest Manager (Ctrl+Shift+U)"
            >
              <Sliders className="w-3 h-3" />
              <span>VAULT STUDIO</span>
            </button>
          )}

          <div className="flex flex-col items-end font-mono-hud">
            <span className="text-[11px] font-semibold text-[#FFA14A] tracking-wider">
              06.45° N, 03.39° E
            </span>
            <div className="flex items-center gap-2 text-[9px] text-slate-400">
              <span className="text-[#38BDF8]">{fps} FPS</span>
              <span>// 60Hz SYNC</span>
            </div>
          </div>
        </div>

      </div>

      {/* CENTER / FLOOR RETICLE MATCHING MOCKUP 1 */}
      {isConcourse && (
        <div className="absolute top-[58%] left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center">
          {/* Subtle Reticle Crosshair */}
          <div className="relative w-12 h-12 flex items-center justify-center opacity-40">
            <div className="absolute w-full h-[1px] bg-slate-400" />
            <div className="absolute h-full w-[1px] bg-slate-400" />
            <div className="w-2.5 h-2.5 border border-[#FF6B1A] rounded-full" />
          </div>

          {/* Telemetry Block matching Mockup 1 */}
          <div className="mt-1 font-mono-hud text-[8px] text-slate-400/80 text-center leading-tight">
            <div>TELEMETRY: 0.81 // 45C</div>
            <div>STABILITY: 0.99 // SYNC</div>
            <div>DATA SYNC: 100% // LIVE</div>
          </div>
        </div>
      )}

      {/* BOTTOM HUD WATERMARKS */}
      <div className="relative z-10 flex items-end justify-between w-full pointer-events-none">
        {/* Bottom-Left Watermark */}
        <div className="flex flex-col font-mono-hud text-[10px] text-slate-400/80">
          <span className="tracking-wider text-slate-300">06.45° N, 03.39° E</span>
          <span className="text-[8px] text-slate-500">SYS_ID: VAULT_01_SPATIAL</span>
        </div>

        {/* Bottom-Right Watermark */}
        <div className="flex flex-col items-end font-mono-hud text-[10px] text-slate-400/80">
          <span className="tracking-wider text-slate-300">06.45° N, 03.39° E</span>
          <span className="text-[8px] text-[#38BDF8]">GBL // LOCK 60FPS</span>
        </div>
      </div>

    </div>
  );
};
