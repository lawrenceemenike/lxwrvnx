import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { AiArtItem } from '../../types';
import { SYNTHESIS_30_ARTWORKS } from '../../data/synthesisArtworks';
import { getPhotoThumbUrl } from '../../utils/photoData50';
import { audioEngine } from '../../utils/audioEngine';
import { Maximize2, Share2, X, ChevronRight, ChevronLeft, Eye, Layers, Upload } from 'lucide-react';

interface SynthesisChamberProps {
  items: AiArtItem[];
  mouseOffset: { x: number; y: number };
  onBackToConcourse: () => void;
  onOpenStudioForFrame?: (target: { tab: 'ai'; frameId: string; frameIndex: number; title: string }) => void;
}

export const SynthesisChamber: React.FC<SynthesisChamberProps> = ({
  items,
  mouseOffset,
  onBackToConcourse: _onBackToConcourse,
  onOpenStudioForFrame
}) => {
  const [selectedArt, setSelectedArt] = useState<AiArtItem | null>(null);
  const [isTheaterOpen, setIsTheaterOpen] = useState(false);
  const [showRosterDrawer, setShowRosterDrawer] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(4); // Default to 05 / 30 matching image_19.png
  const [copiedToast, setCopiedToast] = useState(false);
  const particleCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Guarantee all unique artworks are available, matching custom uploads to explicit slots
  const artworks = useMemo<AiArtItem[]>(() => {
    const normalizeArt = (item: AiArtItem): AiArtItem => ({
      ...item,
      image: item.image ? item.image.replace(/^(\/media\/ai-art\/.+)\.png$/i, '$1.jpg') : item.image
    });

    return SYNTHESIS_30_ARTWORKS.map((defaultArt, index) => {
      // 1. Try finding explicitly bound artwork for this slot
      const bound = items?.find(a =>
        a.frameId === defaultArt.id ||
        a.targetSlotIndex === index ||
        a.id === `ai-${defaultArt.id}` ||
        a.id === defaultArt.id
      );
      if (bound) return normalizeArt(bound);

      // 2. Otherwise fallback to unassigned custom artwork
      const unassigned = items?.filter(
        a => !a.frameId && a.targetSlotIndex === undefined && !SYNTHESIS_30_ARTWORKS.some(d => d.id === a.id)
      );
      if (unassigned && unassigned[index]) return normalizeArt(unassigned[index]);

      return normalizeArt(defaultArt);
    });
  }, [items]);

  // Preload active and adjacent master images so Fullscreen and Pop-Card transitions are instant
  useEffect(() => {
    if (artworks.length === 0) return;
    const indicesToPreload = [
      currentIndex,
      (currentIndex - 1 + artworks.length) % artworks.length,
      (currentIndex + 1) % artworks.length
    ];
    indicesToPreload.forEach(i => {
      const src = artworks[i]?.image;
      if (src) {
        const img = new Image();
        img.decoding = 'async';
        img.src = src;
      }
    });
  }, [currentIndex, artworks]);

  // If custom uploads exist at index 0, jump to them automatically so the user sees their art immediately
  useEffect(() => {
    if (artworks.length > 0 && (artworks[0].id.startsWith('ai-custom-') || (artworks[0] as any).isCustom)) {
      setCurrentIndex(0);
    }
  }, [artworks]);

  // 3D perspective tilt
  const tiltX = -mouseOffset.y * 3.5;
  const panY = mouseOffset.x * 6.5;
  const roll = mouseOffset.x * 1.2;

  // Safe navigation handlers
  const handlePrev = useCallback(() => {
    try {
      audioEngine.playHoverSFX?.();
    } catch {
      // Audio fallback
    }
    setCurrentIndex(prev => (prev === 0 ? artworks.length - 1 : prev - 1));
  }, [artworks.length]);

  const handleNext = useCallback(() => {
    try {
      audioEngine.playHoverSFX?.();
    } catch {
      // Audio fallback
    }
    setCurrentIndex(prev => (prev === artworks.length - 1 ? 0 : prev + 1));
  }, [artworks.length]);

  // Step to Prev / Next artwork while inside Pop-Card or Fullscreen Theater view
  const handlePrevSelected = useCallback(() => {
    if (artworks.length === 0) return;
    try {
      audioEngine.playClickSFX?.();
    } catch {}
    const prevIdx = (currentIndex - 1 + artworks.length) % artworks.length;
    setCurrentIndex(prevIdx);
    setSelectedArt(artworks[prevIdx]);
  }, [currentIndex, artworks]);

  const handleNextSelected = useCallback(() => {
    if (artworks.length === 0) return;
    try {
      audioEngine.playClickSFX?.();
    } catch {}
    const nextIdx = (currentIndex + 1) % artworks.length;
    setCurrentIndex(nextIdx);
    setSelectedArt(artworks[nextIdx]);
  }, [currentIndex, artworks]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showRosterDrawer) {
        if (e.key === 'Escape') setShowRosterDrawer(false);
        return;
      }

      if (isTheaterOpen) {
        if (e.key === 'Escape') {
          setIsTheaterOpen(false);
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          handlePrevSelected();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          handleNextSelected();
        }
        return;
      }

      if (selectedArt) {
        if (e.key === 'Escape') {
          setSelectedArt(null);
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          handlePrevSelected();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          handleNextSelected();
        }
        return;
      }

      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'Enter' || e.key === ' ') {
        setSelectedArt(artworks[currentIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, selectedArt, isTheaterOpen, showRosterDrawer, artworks, handlePrev, handleNext, handlePrevSelected, handleNextSelected]);

  // Floating Cyan & Ember Particle Dust
  useEffect(() => {
    const canvas = particleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const particles = Array.from({ length: 36 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: Math.random() * 2 + 0.8,
      speedX: (Math.random() - 0.5) * 0.35,
      speedY: (Math.random() - 0.5) * 0.35,
      color: Math.random() > 0.5 ? '#FF8A00' : '#38BDF8',
      alpha: Math.random() * 0.45 + 0.2
    }));

    const render = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleShare = (art: AiArtItem) => {
    if (navigator.share) {
      navigator.share({
        title: art.title,
        text: `${art.title} — AI Art & Cinema by Olawale / The Vault`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2400);
    }
  };


  return (
    <div className="relative w-full h-full overflow-hidden flex items-center justify-center select-none bg-[#070A0E]">
      
      {/* 3D SCENE PERSPECTIVE CONTAINER */}
      <div 
        className="absolute inset-0 preserve-3d transition-transform duration-200 ease-out flex items-center justify-center pointer-events-auto"
        style={{
          transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${panY}deg) rotateZ(${roll}deg)`
        }}
      >
        {/* Photorealistic Synthesis Tunnel Backdrop matching image_18.png / image_19.png */}
        <img
          src="/media/vault-rooms/synthesis.jpg"
          alt="Synthesis Cavern Backdrop"
          fetchPriority="high"
          decoding="async"
          draggable={false}
          className="absolute inset-[-4%] w-[108%] h-[108%] object-cover object-center transition-transform duration-500 pointer-events-none select-none"
          style={{
            transform: 'scale(1.05)'
          }}
        />

        {/* Ambient Dark Cavern Fog & Mist Overlay */}
        <div className="absolute inset-0 bg-[#070A0E]/45 backdrop-blur-[1px] pointer-events-none" />
        <canvas ref={particleCanvasRef} className="absolute inset-0 pointer-events-none z-10" />

        {/* ======================================================== */}
        {/* MAIN CHAMBER 02: STAGGERED MONOLITH FOREST CAROUSEL     */}
        {/* ======================================================== */}
        {!selectedArt && (
          <div className="relative z-20 w-full h-full flex flex-col justify-center items-center px-4 md:px-8">
            <div className="relative w-full max-w-7xl h-[480px] md:h-[540px] flex items-center justify-center preserve-3d">
              {artworks.map((art, idx) => {
                const diff = idx - currentIndex;
                // Render visible items within distance 4 for smooth 60fps performance
                if (Math.abs(diff) > 4) return null;

                const isCurrent = diff === 0;
                const isPortrait = art.format === 'portrait';

                // Natural staggered "Stonehenge" arc calculations matching image_19.png
                const translateX = diff * (window.innerWidth < 768 ? 240 : 340);
                const translateZ = -Math.abs(diff) * 125;
                const rotateY = -diff * 14;
                const scale = isCurrent ? 1 : Math.max(0.72, 0.9 - Math.abs(diff) * 0.08);
                const opacity = isCurrent ? 1 : Math.max(0.25, 0.8 - Math.abs(diff) * 0.2);
                const zIndex = 30 - Math.abs(diff);

                return (
                  <div
                    key={art.id}
                    onClick={() => {
                      if (isCurrent) {
                        try { audioEngine.playClickSFX(); } catch {}
                        setSelectedArt(art);
                      } else {
                        try { audioEngine.playHoverSFX?.(); } catch {}
                        setCurrentIndex(idx);
                      }
                    }}
                    className={`absolute cursor-pointer rounded-2xl overflow-hidden transition-all duration-500 ease-out select-none group ${
                      isPortrait 
                        ? 'w-[230px] md:w-[290px] h-[370px] md:h-[470px]' 
                        : 'w-[300px] md:w-[440px] h-[190px] md:h-[280px]'
                    } ${
                      isCurrent
                        ? 'border-2 border-[#38BDF8] shadow-[0_0_45px_rgba(56,189,248,0.45)] ring-1 ring-[#38BDF8]/40'
                        : 'border border-slate-700/80 hover:border-[#FFA14A]/80 shadow-[0_0_25px_rgba(0,0,0,0.8)]'
                    }`}
                    style={{
                      transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                      opacity,
                      zIndex
                    }}
                  >
                    <img
                      src={getPhotoThumbUrl(art.image)}
                      alt={art.title}
                      decoding="async"
                      loading="lazy"
                      onError={(e) => {
                        if (e.currentTarget.src !== art.image) {
                          e.currentTarget.src = art.image;
                        }
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Edge-lit Ambient Shading & Gradient Vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#070A0E] via-[#070A0E]/20 to-transparent opacity-85 group-hover:opacity-70 transition-opacity" />
                    
                    {/* Monolith Format Badge & Custom Live Status */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                      <div className="bg-[#070A0E]/85 backdrop-blur-md px-2.5 py-0.5 rounded border border-[#38BDF8]/40 font-mono-hud text-[9px] text-[#38BDF8] font-bold tracking-wider">
                        {isPortrait ? '9:16 MONOLITH' : '16:9 CINEMA'}
                      </div>
                      {(art.id.startsWith('ai-custom-') || (art as any).isCustom) && (
                        <div className="bg-[#FF6B1A] text-slate-950 font-mono-hud text-[9px] font-black px-2 py-0.5 rounded shadow-[0_0_12px_#FF6B1A] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
                          LIVE
                        </div>
                      )}
                    </div>

                    {/* Monolith Telemetry Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                      <div className="max-w-[80%]">
                        <span className="font-mono-hud text-[9px] text-[#FFA14A] tracking-widest font-semibold uppercase block truncate">
                          {art.generativeData.engine.split('/')[0]}
                        </span>
                        <h4 className="font-syne text-sm md:text-base font-bold text-white group-hover:text-[#38BDF8] transition-colors truncate">
                          {art.title}
                        </h4>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-[#38BDF8] text-slate-950 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-[0_0_12px_#38BDF8]">
                        <Eye className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* FRICTIONLESS POP-CARD SELECTION ("INTER-SPECT" PANEL) */}
        {/* ======================================================== */}
        {selectedArt && (
          <div className="relative z-30 w-full max-w-6xl px-4 md:px-8 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 animate-fade-in pointer-events-auto">
            
            {/* LEFT: FRAMED MONOLITH ARTWORK */}
            <div className={`relative max-w-lg rounded-xl overflow-hidden border-2 border-[#38BDF8]/70 shadow-[0_0_45px_rgba(56,189,248,0.4)] ${
              selectedArt.format === 'portrait' ? 'w-72 md:w-80 aspect-[9/16]' : 'w-full md:w-1/2 aspect-[16/9]'
            }`}>
              <img
                src={selectedArt.image}
                alt={selectedArt.title}
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                className="w-full h-full object-cover select-none"
              />

              {/* Prominently Highlighted X (Cancel) Sign directly on the Frame */}
              <button
                onClick={() => setSelectedArt(null)}
                className="absolute top-3 right-3 z-30 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#070A0E]/90 border-2 border-[#38BDF8] text-[#38BDF8] hover:bg-[#38BDF8] hover:text-slate-950 font-mono-hud text-xs font-bold shadow-[0_0_20px_rgba(56,189,248,0.8)] transition-all cursor-pointer group"
                title="Cancel / Close Frame (ESC)"
              >
                <X className="w-4 h-4 transition-transform group-hover:rotate-90 text-[#38BDF8] group-hover:text-slate-950" />
                <span>CLOSE</span>
              </button>

              {/* HUD Reticles */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#38BDF8] pointer-events-none" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#38BDF8] pointer-events-none" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#38BDF8] pointer-events-none" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#38BDF8] pointer-events-none" />

              <div className="absolute top-3 left-3 flex items-center gap-1.5 pointer-events-none">
                <div className="bg-[#070A0E]/80 px-2 py-0.5 rounded border border-[#38BDF8]/40 font-mono-hud text-[9px] text-[#38BDF8] font-bold">
                  {selectedArt.format === 'portrait' ? '9:16 MONOLITH' : '16:9 CINEMA'}
                </div>
                {(selectedArt.id.startsWith('ai-custom-') || (selectedArt as any).isCustom) && (
                  <div className="bg-[#FF6B1A] text-slate-950 font-mono-hud text-[9px] font-black px-2 py-0.5 rounded shadow-[0_0_12px_#FF6B1A]">
                    LIVE UPLOAD
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: TRANSLUCENT "INTER-SPECT" METADATA PANEL */}
            <div className="relative w-full md:w-1/2 max-w-md rounded-2xl glass-hologram p-6 md:p-8 flex flex-col justify-between border-2 border-[#38BDF8]/60 shadow-[0_0_45px_rgba(56,189,248,0.35)]">
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono-hud text-[10px] text-[#FFA14A] tracking-widest uppercase font-bold">
                    CHAMBER 02 // INTER-SPECT TELEMETRY
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handlePrevSelected}
                      className="p-1 rounded bg-slate-800/80 hover:bg-[#38BDF8] text-slate-300 hover:text-slate-950 border border-slate-700 hover:border-[#38BDF8] transition-all cursor-pointer"
                      title="Previous Artwork [←]"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono-hud text-[10px] text-[#38BDF8] bg-cyan-950/70 border border-cyan-500/40 px-1.5 py-0.5 rounded font-bold">
                      {String(currentIndex + 1).padStart(2, '0')} / {String(artworks.length).padStart(2, '0')}
                    </span>
                    <button
                      onClick={handleNextSelected}
                      className="p-1 rounded bg-slate-800/80 hover:bg-[#38BDF8] text-slate-300 hover:text-slate-950 border border-slate-700 hover:border-[#38BDF8] transition-all cursor-pointer"
                      title="Next Artwork [→]"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <div className="hidden sm:flex items-center gap-1.5 font-mono-hud text-[10px] bg-cyan-950/70 border border-cyan-500/50 text-[#38BDF8] px-2 py-0.5 rounded font-bold">
                      <span>{selectedArt.status}</span>
                    </div>
                    {/* Highlighted Close X button in header */}
                    <button
                      onClick={() => setSelectedArt(null)}
                      className="p-1 rounded-full bg-red-950/60 border border-red-500/70 text-red-300 hover:bg-red-600 hover:text-white transition-all shadow-[0_0_12px_rgba(239,68,68,0.5)] cursor-pointer"
                      title="Close [ESC]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-syne text-xl md:text-2xl font-bold text-white tracking-wider glow-cyan-text">
                  {selectedArt.title}
                </h3>
                <span className="font-mono-hud text-[10px] text-slate-400 tracking-wider">
                  COORD: {selectedArt.coordinates}
                </span>
              </div>

              {/* GENERATIVE DATA Telemetry Grid */}
              <div className="my-4 p-4 rounded-xl bg-[#070A0E]/60 border border-slate-700/60 flex flex-col gap-2 font-mono-hud text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-[#38BDF8] font-bold">GENERATIVE DATA</span>
                  <span className="text-[#FFA14A]">SEED: {selectedArt.generativeData.seed}</span>
                </div>
                <div>
                  <span className="text-slate-500">ENGINE: </span>
                  <span className="text-slate-200">{selectedArt.generativeData.engine}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-slate-500">STEPS: </span>
                    <span className="text-[#38BDF8]">{selectedArt.generativeData.steps}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">CFG: </span>
                    <span className="text-[#FFA14A]">{selectedArt.generativeData.cfg}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">SAMPLER: </span>
                    <span className="text-slate-300">{selectedArt.generativeData.sampler}</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">COLOR PROFILE: </span>
                  <span className="text-[#FFA14A]">{selectedArt.generativeData.colorGrading}</span>
                </div>
              </div>

              {/* Prompt Excerpt & Lore */}
              <div className="mb-4">
                <span className="font-mono-hud text-[9px] text-[#38BDF8] uppercase tracking-wider font-bold">
                  PROMPT EXCERPT:
                </span>
                <p className="font-mono-hud text-[11px] text-slate-300 italic bg-[#070A0E]/40 p-2.5 rounded border border-slate-800 mt-1">
                  "{selectedArt.generativeData.promptExcerpt}"
                </p>
                <p className="font-inter text-xs text-slate-400 mt-2">
                  {selectedArt.lore}
                </p>
              </div>

              {/* Ownership */}
              <div className="font-mono-hud text-[10px] text-[#FFA14A] tracking-wider mb-4 font-semibold">
                OWNERSHIP: {selectedArt.ownership}
              </div>

              {/* Actions: VIEW FULL SCREEN / SHARE / HIGHLIGHTED CANCEL */}
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => {
                    audioEngine.playClickSFX();
                    setIsTheaterOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-mono-hud text-xs font-bold text-slate-950 bg-[#38BDF8] hover:bg-[#7dd3fc] transition-all shadow-[0_0_20px_rgba(56,189,248,0.6)] cursor-pointer"
                  title="View Full Screen High Resolution"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span>VIEW FULL SCREEN</span>
                </button>

                {onOpenStudioForFrame && (
                  <button
                    onClick={() => {
                      try { audioEngine.playLockOnSFX(); } catch {}
                      onOpenStudioForFrame({
                        tab: 'ai',
                        frameId: selectedArt.id,
                        frameIndex: currentIndex,
                        title: selectedArt.title
                      });
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-mono-hud text-xs font-bold text-[#FFA14A] bg-[#FF6B1A]/20 hover:bg-[#FF6B1A]/30 border border-[#FF6B1A]/60 transition-all shadow-[0_0_15px_rgba(255,107,26,0.3)] cursor-pointer"
                    title={`Upload or replace AI art render for Slot ${String(currentIndex + 1).padStart(2, '0')}`}
                  >
                    <Upload className="w-4 h-4" />
                    <span>UPLOAD TO SLOT {String(currentIndex + 1).padStart(2, '0')}</span>
                  </button>
                )}

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleShare(selectedArt)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-mono-hud text-xs font-bold text-[#FFA14A] border border-[#FF6B1A]/50 hover:bg-[#FF6B1A] hover:text-slate-950 transition-all cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{copiedToast ? 'COPIED!' : 'SHARE'}</span>
                  </button>

                  {/* Prominently Highlighted X (Cancel) Action Button */}
                  <button
                    onClick={() => setSelectedArt(null)}
                    className="flex items-center gap-1.5 py-2 px-4 rounded-lg font-mono-hud text-xs font-bold text-red-300 bg-red-950/60 hover:bg-red-600 hover:text-white border-2 border-red-500 transition-all shadow-[0_0_15px_rgba(239,68,68,0.6)] cursor-pointer group"
                    title="Close Panel (ESC)"
                  >
                    <X className="w-4 h-4 transition-transform group-hover:rotate-90" />
                    <span>CANCEL</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* 2D HUD OVERLAY LAYER (100% UNBLOCKABLE HIT TARGETS)       */}
      {/* Side-Scrolling Gates, Progress Tracker, Micro-Controls    */}
      {/* ======================================================== */}
      {!selectedArt && (
        <div className="absolute inset-0 pointer-events-none z-30 select-none">
          
          {/* LEFT GATE [< PREV MONOLITHS] */}
          <button
            onClick={handlePrev}
            className="pointer-events-auto absolute left-4 md:left-7 top-1/2 -translate-y-1/2 group flex items-center gap-2.5 px-3 md:px-4 py-6 md:py-8 rounded-2xl md:rounded-3xl bg-[#0C121B]/75 hover:bg-[#0C121B]/95 border border-white/10 hover:border-[#FFA14A]/80 backdrop-blur-md transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.7)] hover:shadow-[0_0_35px_rgba(255,138,0,0.45)] focus:outline-none cursor-pointer"
            title="Previous Monoliths (Left Arrow)"
          >
            {/* Heavy glowing orange-amber arrow SVG */}
            <svg 
              viewBox="0 0 28 44" 
              className="w-8 h-12 md:w-10 md:h-14 flex-shrink-0 drop-shadow-[0_0_15px_rgba(255,138,0,0.95)] group-hover:scale-110 group-hover:drop-shadow-[0_0_24px_rgba(255,138,0,1)] transition-transform duration-300"
            >
              <path 
                d="M21 6L7 22L21 38" 
                stroke="url(#gateAmberGradLeft2)" 
                strokeWidth="6.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
              <defs>
                <linearGradient id="gateAmberGradLeft2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFA726" />
                  <stop offset="50%" stopColor="#FF7043" />
                  <stop offset="100%" stopColor="#E65100" />
                </linearGradient>
              </defs>
            </svg>

            <div className="flex flex-col text-left font-mono-hud text-[8px] md:text-[9px] text-[#FFA14A]/85 group-hover:text-[#FFA14A] tracking-widest font-bold uppercase leading-tight">
              <span>PREV</span>
              <span>MONOLITHS</span>
            </div>
          </button>

          {/* RIGHT GATE [NEXT MONOLITHS >] */}
          <button
            onClick={handleNext}
            className="pointer-events-auto absolute right-4 md:right-7 top-1/2 -translate-y-1/2 group flex items-center justify-center p-4 md:p-5 md:py-8 rounded-2xl md:rounded-3xl bg-[#0C121B]/75 hover:bg-[#0C121B]/95 border border-white/10 hover:border-[#FFA14A]/80 backdrop-blur-md transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.7)] hover:shadow-[0_0_35px_rgba(255,138,0,0.45)] focus:outline-none cursor-pointer"
            title="Next Monoliths (Right Arrow)"
          >
            {/* Heavy glowing orange-amber arrow SVG */}
            <svg 
              viewBox="0 0 28 44" 
              className="w-8 h-12 md:w-10 md:h-14 flex-shrink-0 drop-shadow-[0_0_15px_rgba(255,138,0,0.95)] group-hover:scale-110 group-hover:drop-shadow-[0_0_24px_rgba(255,138,0,1)] transition-transform duration-300"
            >
              <path 
                d="M7 6L21 22L7 38" 
                stroke="url(#gateAmberGradRight2)" 
                strokeWidth="6.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
              <defs>
                <linearGradient id="gateAmberGradRight2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFA726" />
                  <stop offset="50%" stopColor="#FF7043" />
                  <stop offset="100%" stopColor="#E65100" />
                </linearGradient>
              </defs>
            </svg>
          </button>

          {/* Center: Dynamic Counter + Tiny Indicator Track + Exhibits Trigger */}
          <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-auto">
            <div className="flex items-center gap-3">
              <div className="font-mono-hud text-xs md:text-sm font-bold text-[#FFA14A] tracking-[0.25em] drop-shadow-[0_0_10px_rgba(255,161,74,0.7)] flex items-center gap-1.5">
                <span>{String(currentIndex + 1).padStart(2, '0')}</span>
                <span className="text-[#FFA14A]/50">/</span>
                <span>{String(artworks.length).padStart(2, '0')}</span>
              </div>

              {/* EXHIBITS ROSTER DRAWER TRIGGER BUTTON */}
              <button
                onClick={() => {
                  try { audioEngine.playClickSFX(); } catch {}
                  setShowRosterDrawer(prev => !prev);
                }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full font-mono-hud text-[10px] md:text-xs font-bold bg-[#0B131F]/90 border border-[#38BDF8]/60 hover:border-[#38BDF8] text-[#38BDF8] hover:bg-[#38BDF8]/15 shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-all cursor-pointer"
                title="Browse All AI Exhibits Roster"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>EXHIBITS ({artworks.length})</span>
              </button>
            </div>

            <div className="flex items-center gap-1 md:gap-1.5 px-3 py-1.5 rounded-full bg-[#080D14]/85 border border-white/10 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
              {artworks.map((_, idx) => {
                const isActive = idx === currentIndex;
                const isNear = Math.abs(idx - currentIndex) <= 2;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      try { audioEngine.playHoverSFX?.(); } catch {}
                      setCurrentIndex(idx);
                    }}
                    className={`transition-all duration-300 rounded-full focus:outline-none cursor-pointer ${
                      isActive
                        ? 'w-5 md:w-6 h-1.5 bg-[#FFA14A] shadow-[0_0_12px_#FFA14A]'
                        : isNear
                          ? 'w-1.5 h-1.5 bg-[#38BDF8] shadow-[0_0_6px_#38BDF8] hover:bg-white'
                          : 'w-1 h-1 md:w-1.5 md:h-1.5 bg-[#38BDF8]/40 hover:bg-[#38BDF8]'
                    }`}
                    title={`Monolith ${idx + 1}: ${artworks[idx].title}`}
                  />
                );
              })}
            </div>
          </div>

          {/* Bottom-Left: < PREV MONOLITH with Angled Orange Floor Guideline */}
          <div className="absolute bottom-8 left-28 md:left-44 flex items-center gap-4">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="pointer-events-auto flex items-center gap-1.5 px-4 py-1.5 rounded-full font-mono-hud text-[10px] md:text-xs bg-[#090E17]/90 border border-slate-700/80 hover:border-[#FFA14A] text-slate-300 hover:text-[#FFA14A] disabled:opacity-30 disabled:pointer-events-none transition-all duration-200 backdrop-blur-sm shadow-[0_0_15px_rgba(0,0,0,0.5)] cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>PREV MONOLITH</span>
            </button>
            <div className="hidden xl:block w-32 h-[1.5px] bg-gradient-to-r from-[#FF8A00]/80 via-[#FFA14A]/40 to-transparent rotate-[-22deg] origin-left pointer-events-none shadow-[0_0_8px_#FF8A00]" />
          </div>

          {/* Bottom-Right: NEXT MONOLITH > with Angled Orange Floor Guideline */}
          <div className="absolute bottom-8 right-28 md:right-44 flex items-center gap-4">
            <div className="hidden xl:block w-32 h-[1.5px] bg-gradient-to-l from-[#FF8A00]/80 via-[#FFA14A]/40 to-transparent rotate-[22deg] origin-right pointer-events-none shadow-[0_0_8px_#FF8A00]" />
            <button
              onClick={handleNext}
              disabled={currentIndex >= artworks.length - 1}
              className="pointer-events-auto flex items-center gap-1.5 px-4 py-1.5 rounded-full font-mono-hud text-[10px] md:text-xs bg-[#090E17]/90 border border-slate-700/80 hover:border-[#FFA14A] text-slate-300 hover:text-[#FFA14A] disabled:opacity-30 disabled:pointer-events-none transition-all duration-200 backdrop-blur-sm shadow-[0_0_15px_rgba(0,0,0,0.5)] cursor-pointer"
            >
              <span>NEXT MONOLITH</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      )}

      {/* THEATER ZOOM MODAL (WITH LEFT / RIGHT NAVIGATION) */}
      {isTheaterOpen && selectedArt && (
        <div className="fixed inset-0 z-50 bg-[#070A0E]/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4 select-none">
          {/* Left Floating Prev Button */}
          <button
            onClick={handlePrevSelected}
            className="fixed left-4 md:left-8 top-1/2 -translate-y-1/2 z-50 flex items-center gap-2 px-3.5 py-4 md:px-4 md:py-5 rounded-2xl bg-[#0B131F]/90 hover:bg-[#38BDF8] text-[#38BDF8] hover:text-slate-950 border-2 border-[#38BDF8]/60 hover:border-[#38BDF8] shadow-[0_0_30px_rgba(56,189,248,0.35)] hover:shadow-[0_0_35px_rgba(56,189,248,0.85)] transition-all cursor-pointer group"
            title="Previous Artwork (Left Arrow)"
          >
            <ChevronLeft className="w-6 h-6 md:w-7 md:h-7 transition-transform group-hover:-translate-x-1" />
            <span className="hidden lg:inline font-mono-hud text-xs font-bold tracking-wider uppercase">PREV</span>
          </button>

          {/* Right Floating Next Button */}
          <button
            onClick={handleNextSelected}
            className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-50 flex items-center gap-2 px-3.5 py-4 md:px-4 md:py-5 rounded-2xl bg-[#0B131F]/90 hover:bg-[#38BDF8] text-[#38BDF8] hover:text-slate-950 border-2 border-[#38BDF8]/60 hover:border-[#38BDF8] shadow-[0_0_30px_rgba(56,189,248,0.35)] hover:shadow-[0_0_35px_rgba(56,189,248,0.85)] transition-all cursor-pointer group"
            title="Next Artwork (Right Arrow)"
          >
            <span className="hidden lg:inline font-mono-hud text-xs font-bold tracking-wider uppercase">NEXT</span>
            <ChevronRight className="w-6 h-6 md:w-7 md:h-7 transition-transform group-hover:translate-x-1" />
          </button>

          <div className="relative max-w-6xl max-h-[90vh] flex flex-col items-center">
            <div className="relative rounded-lg overflow-hidden border border-[#38BDF8]/60 shadow-[0_0_60px_rgba(56,189,248,0.5)]">
              <img
                src={selectedArt.image}
                alt={selectedArt.title}
                decoding="async"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                className="max-h-[78vh] w-auto object-contain select-none"
              />
            </div>

            {/* Bottom Control Bar: Prev / Counter / Title / Next / Close */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 w-full font-mono-hud text-xs text-slate-300 px-3 py-2 rounded-xl bg-[#0B131F]/90 border border-[#38BDF8]/30 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevSelected}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-[#38BDF8] text-[#38BDF8] hover:text-slate-950 border border-[#38BDF8]/40 font-bold transition-all cursor-pointer"
                  title="Previous Artwork [←]"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>PREV</span>
                </button>
                <span className="px-2.5 py-1 rounded bg-[#38BDF8]/15 border border-[#38BDF8]/40 text-[#FFA14A] font-bold">
                  {String(currentIndex + 1).padStart(2, '0')} / {String(artworks.length).padStart(2, '0')}
                </span>
                <button
                  onClick={handleNextSelected}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-[#38BDF8] text-[#38BDF8] hover:text-slate-950 border border-[#38BDF8]/40 font-bold transition-all cursor-pointer"
                  title="Next Artwork [→]"
                >
                  <span>NEXT</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="hidden md:flex flex-col items-center">
                <span className="text-[#38BDF8] font-bold">{selectedArt.title}</span>
                <span className="text-[10px] text-slate-400">{selectedArt.generativeData.engine} // SEED: {selectedArt.generativeData.seed}</span>
              </div>

              <button
                onClick={() => setIsTheaterOpen(false)}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-950/60 hover:bg-red-600 border-2 border-red-500 text-white font-mono-hud text-xs font-bold shadow-[0_0_20px_rgba(239,68,68,0.7)] transition-all cursor-pointer group"
                title="Close Full Screen [ESC]"
              >
                <X className="w-4 h-4 transition-transform group-hover:rotate-90" />
                <span>[ESC] CLOSE</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SLIDE-OUT EXHIBITS ROSTER DRAWER (ALL AI ARTWORKS)      */}
      {/* ======================================================== */}
      {showRosterDrawer && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-[#070A0E]/95 backdrop-blur-2xl border-l border-[#38BDF8]/40 shadow-[-10px_0_40px_rgba(0,0,0,0.9)] p-6 flex flex-col justify-between animate-slide-left pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <div className="font-mono-hud text-[10px] text-[#FFA14A] tracking-widest uppercase font-bold">
                CHAMBER 02 // ROSTER
              </div>
              <h3 className="font-syne text-lg font-bold text-white tracking-wider flex items-center gap-2">
                <span>AI ART & CINEMA</span>
                <span className="font-mono-hud text-xs text-[#38BDF8] bg-cyan-950/70 border border-cyan-500/40 px-2 py-0.5 rounded">
                  {artworks.length} WORKS
                </span>
              </h3>
            </div>
            <button
              onClick={() => setShowRosterDrawer(false)}
              className="p-1.5 rounded-full bg-slate-800/60 hover:bg-[#38BDF8] hover:text-slate-950 text-slate-300 transition-all cursor-pointer"
              title="Close Drawer [ESC]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Subheader */}
          <div className="py-2.5 flex items-center justify-between font-mono-hud text-[10px] text-slate-400">
            <span>SELECT MONOLITH TO JUMP</span>
            <span className="text-[#38BDF8]">PRESS ESC TO CLOSE</span>
          </div>

          {/* Scrollable list of artworks */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 my-2">
            {artworks.map((art, idx) => {
              const isCurrent = idx === currentIndex;
              const isCustom = art.id.startsWith('ai-custom-') || Boolean((art as any).isCustom);

              return (
                <div
                  key={art.id}
                  onClick={() => {
                    try { audioEngine.playClickSFX(); } catch {}
                    setCurrentIndex(idx);
                    setShowRosterDrawer(false);
                  }}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3.5 group ${
                    isCurrent
                      ? 'border-[#38BDF8] bg-[#38BDF8]/10 shadow-[0_0_20px_rgba(56,189,248,0.3)]'
                      : 'border-slate-800 bg-slate-900/60 hover:border-[#38BDF8]/60 hover:bg-slate-900'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-950 border border-slate-700/80 shrink-0">
                    <img
                      src={getPhotoThumbUrl(art.image)}
                      alt={art.title}
                      decoding="async"
                      loading="lazy"
                      onError={(e) => {
                        if (e.currentTarget.src !== art.image) {
                          e.currentTarget.src = art.image;
                        }
                      }}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {isCustom && (
                      <div className="absolute top-0.5 left-0.5 px-1 rounded bg-[#FF6B1A] text-slate-950 font-mono-hud text-[6px] font-black uppercase">
                        LIVE
                      </div>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-hud text-[9px] text-[#FFA14A] font-bold">
                        #{String(idx + 1).padStart(2, '0')}
                      </span>
                      <h4 className="font-mono-hud text-xs font-bold text-white truncate group-hover:text-[#38BDF8] transition-colors">
                        {art.title}
                      </h4>
                    </div>
                    <p className="font-mono-hud text-[9px] text-slate-400 truncate mt-0.5">
                      {art.generativeData?.engine || 'Flux.1 / SDXL'}
                    </p>
                    <div className="flex items-center gap-2 mt-1 font-mono-hud text-[8px] text-slate-500">
                      <span>{art.format === 'portrait' ? '9:16 MONOLITH' : '16:9 CINEMA'}</span>
                      <span>•</span>
                      <span>{art.status}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Drawer Footer */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between font-mono-hud text-[10px] text-slate-500">
            <span>SYNTHESIS RECON // 60FPS</span>
            <button
              onClick={() => {
                setShowRosterDrawer(false);
                setCurrentIndex(0);
              }}
              className="text-[#38BDF8] hover:underline cursor-pointer"
            >
              JUMP TO FIRST
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
