import React, { useState } from 'react';
import { PhotoItem, PhotoCategory } from '../../types';
import { audioEngine } from '../../utils/audioEngine';
import { getPavilion50Photos } from '../../utils/photoData50';
import { OpticsPavilion50 } from './OpticsPavilion50';
import { OpticsStreetMonoliths } from './OpticsStreetMonoliths';
import { OpticsLightArtSpiral } from './OpticsLightArtSpiral';
import { ArrowLeft } from 'lucide-react';

interface OpticsChamberProps {
  categories: {
    id: PhotoCategory;
    title: string;
    subtitle: string;
    heroImage: string;
  }[];
  photos: PhotoItem[];
  mouseOffset: { x: number; y: number };
  onBackToConcourse: () => void;
  onOpenStudioForFrame?: (target: { category: PhotoCategory; frameId: string; frameIndex: number; title: string }) => void;
}

export const OpticsChamber: React.FC<OpticsChamberProps> = ({
  categories,
  photos,
  mouseOffset,
  onBackToConcourse,
  onOpenStudioForFrame
}) => {
  // Check URL hash for direct subcategory: #/optics/street, #/optics/light-art, #/optics/portraits
  const getSubcategoryFromHash = (): PhotoCategory | null => {
    const parts = window.location.hash.replace('#/', '').split('/');
    if (parts[0] === 'optics' && parts[1]) {
      if (['portraits', 'street', 'light-art'].includes(parts[1])) {
        return parts[1] as PhotoCategory;
      }
    }
    return null;
  };

  // Navigation state: null = front category gateway (3-monolith mockup); string = category room
  const [activeCategory, setActiveCategory] = useState<PhotoCategory | null>(() => getSubcategoryFromHash());
  const [hoveredCategory, setHoveredCategory] = useState<PhotoCategory | null>('street');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Sync with browser back/forward and hash changes
  React.useEffect(() => {
    const handleHashSync = () => {
      const subCat = getSubcategoryFromHash();
      setActiveCategory(subCat);
    };
    window.addEventListener('hashchange', handleHashSync);
    return () => window.removeEventListener('hashchange', handleHashSync);
  }, []);

  // Preload the 3 room architectural backdrops while on the Gateway so room entry is instant
  React.useEffect(() => {
    const backdrops = [
      '/media/vault-rooms/optics_pavilion_clean.jpg',
      '/media/vault-rooms/optics_street_clean.jpg',
      '/media/vault-rooms/optics_light_art_clean.jpg'
    ];
    backdrops.forEach(src => {
      const img = new Image();
      img.decoding = 'async';
      img.src = src;
    });
  }, []);

  // Filter strictly for Portraits category photos (including custom portrait uploads)
  const portraitPhotos = React.useMemo(() => {
    if (activeCategory !== 'portraits') return [];
    return (photos || []).filter(p => p.category === 'portraits');
  }, [photos, activeCategory]);

  const all50Photos = React.useMemo(() => {
    if (activeCategory !== 'portraits') return [];
    return getPavilion50Photos(portraitPhotos);
  }, [portraitPhotos, activeCategory]);

  // Subtle 3D perspective tilt
  const tiltX = -mouseOffset.y * 3.5;
  const panY = mouseOffset.x * 6;

  const handleSelectCategory = (catId: PhotoCategory) => {
    audioEngine.playLockOnSFX();
    setIsTransitioning(true);
    setTimeout(() => {
      window.location.hash = `#/optics/${catId}`;
      setActiveCategory(catId);
      setIsTransitioning(false);
    }, 300);
  };

  const handleBackToGateway = () => {
    audioEngine.playGlideSFX();
    setIsTransitioning(true);
    setTimeout(() => {
      window.location.hash = '#/optics';
      setActiveCategory(null);
      setIsTransitioning(false);
    }, 250);
  };

  // STEP 2: CATEGORY-SPECIFIC SPATIAL ARCHITECTURE
  // 01 // PORTRAITS: 50-Frame Squared Pavilion (Wall grids + central pentagon)
  if (activeCategory === 'portraits') {
    return (
      <OpticsPavilion50
        photos={all50Photos}
        initialCategory="portraits"
        onBackToGateway={handleBackToGateway}
        mouseOffset={mouseOffset}
        onOpenStudioForFrame={onOpenStudioForFrame}
      />
    );
  }

  // 02 // STREET: Staggered "Stonehenge" Monolith Forest Cavern (4:5 vertical frames)
  if (activeCategory === 'street') {
    return (
      <OpticsStreetMonoliths
        photos={photos}
        onBackToGateway={handleBackToGateway}
        mouseOffset={mouseOffset}
        onOpenStudioForFrame={onOpenStudioForFrame}
      />
    );
  }

  // 03 // LIGHT ART: The Luminance Spiral (Curved borderless edge-lit glass panels + central particle vortex)
  if (activeCategory === 'light-art') {
    return (
      <OpticsLightArtSpiral
        photos={photos}
        onBackToGateway={handleBackToGateway}
        mouseOffset={mouseOffset}
        onOpenStudioForFrame={onOpenStudioForFrame}
      />
    );
  }

  // STEP 1: FRONT CATEGORY GATEWAY (100% FAITHFUL TO USER MOCKUP)
  return (
    <div className="relative w-full h-full overflow-hidden flex items-center justify-center select-none bg-[#070A0E]">
      
      {/* 3D PERSPECTIVE SCENE CONTAINER */}
      <div 
        className="absolute inset-0 transition-transform duration-500 ease-out flex items-center justify-center"
        style={{
          transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${panY}deg) scale(${isTransitioning ? 1.25 : 1})`,
          transformOrigin: '50% 50%'
        }}
      >
        {/* Photorealistic Optics Wind Tunnel Backdrop matching Mockup */}
        <img
          src="/media/vault-rooms/optics_gateway.jpg"
          alt="Optics Gateway"
          draggable={false}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-[-2%] w-[104%] h-[104%] object-cover object-center transition-all duration-700 pointer-events-none select-none"
          style={{
            filter: 'contrast(1.06) brightness(1.02)'
          }}
        />

        {/* Subtle Vignette */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#070A0E]/15 to-[#070A0E]/55 pointer-events-none" />

        {/* ======================================================== */}
        {/* INTERACTIVE MONOLITHS & WALL HOTSPOTS (MOCKUP GEOMETRY) */}
        {/* ======================================================== */}
        <div className="absolute inset-0 z-10 pointer-events-auto">
          
          {/* 1. MONOLITH 01: PORTRAITS (Left Monolith) */}
          <div
            onClick={() => handleSelectCategory('portraits')}
            onMouseEnter={() => {
              setHoveredCategory('portraits');
              audioEngine.playClickSFX();
            }}
            title="Enter 50-Frame Pavilion // 01 PORTRAITS"
            className="absolute cursor-pointer transition-all duration-300 group rounded-[26px]"
            style={{
              left: '22.8%',
              top: '25.0%',
              width: '15.0%',
              height: '47.5%'
            }}
          >
            {/* Neon Bezel Highlight on Hover */}
            <div 
              className={`w-full h-full rounded-[26px] border-2 transition-all duration-300 ${
                hoveredCategory === 'portraits'
                  ? 'border-[#FF6B1A] shadow-[0_0_25px_rgba(255,107,26,0.6)] bg-[#FF6B1A]/5'
                  : 'border-transparent hover:border-[#FF6B1A]/70'
              }`}
            />

            {/* Hover Badge Tooltip */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap bg-[#070A0E]/90 px-3 py-1 rounded-full border border-[#FF6B1A] font-mono-hud text-[10px] text-[#FFA14A] font-bold shadow-[0_0_15px_rgba(255,107,26,0.5)]">
              ENTER // 01 PORTRAITS
            </div>
          </div>

          {/* 2. MONOLITH 02: STREET (Middle Monolith - Default Highlight in Mockup) */}
          <div
            onClick={() => handleSelectCategory('street')}
            onMouseEnter={() => {
              setHoveredCategory('street');
              audioEngine.playClickSFX();
            }}
            title="Enter 50-Frame Pavilion // 02 STREET"
            className="absolute cursor-pointer transition-all duration-300 group rounded-[26px]"
            style={{
              left: '42.5%',
              top: '25.0%',
              width: '15.0%',
              height: '47.5%'
            }}
          >
            {/* Neon Bezel Highlight (Active in Mockup) */}
            <div 
              className={`w-full h-full rounded-[26px] border-2 transition-all duration-300 ${
                hoveredCategory === 'street'
                  ? 'border-[#FF6B1A] shadow-[0_0_28px_rgba(255,107,26,0.7)] bg-[#FF6B1A]/5'
                  : 'border-[#FF6B1A]/60 hover:border-[#FF6B1A]'
              }`}
            />

            {/* Hover Badge Tooltip */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap bg-[#070A0E]/90 px-3 py-1 rounded-full border border-[#FF6B1A] font-mono-hud text-[10px] text-[#FFA14A] font-bold shadow-[0_0_15px_rgba(255,107,26,0.5)]">
              ENTER // 02 STREET
            </div>
          </div>

          {/* 3. MONOLITH 03: LIGHT ART (Right Monolith) */}
          <div
            onClick={() => handleSelectCategory('light-art')}
            onMouseEnter={() => {
              setHoveredCategory('light-art');
              audioEngine.playClickSFX();
            }}
            title="Enter 50-Frame Pavilion // 03 LIGHT ART"
            className="absolute cursor-pointer transition-all duration-300 group rounded-[26px]"
            style={{
              left: '62.2%',
              top: '25.0%',
              width: '15.0%',
              height: '47.5%'
            }}
          >
            {/* Neon Bezel Highlight on Hover */}
            <div 
              className={`w-full h-full rounded-[26px] border-2 transition-all duration-300 ${
                hoveredCategory === 'light-art'
                  ? 'border-[#FF6B1A] shadow-[0_0_25px_rgba(255,107,26,0.6)] bg-[#FF6B1A]/5'
                  : 'border-transparent hover:border-[#FF6B1A]/70'
              }`}
            />

            {/* Hover Badge Tooltip */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap bg-[#070A0E]/90 px-3 py-1 rounded-full border border-[#FF6B1A] font-mono-hud text-[10px] text-[#FFA14A] font-bold shadow-[0_0_15px_rgba(255,107,26,0.5)]">
              ENTER // 03 LIGHT ART
            </div>
          </div>

          {/* 4. FAR LEFT SIDE MONITOR (01 // PORTRAITS Hotspot) */}
          <div
            onClick={() => handleSelectCategory('portraits')}
            onMouseEnter={() => {
              setHoveredCategory('portraits');
              audioEngine.playClickSFX();
            }}
            title="Left Wall: 01 // PORTRAITS"
            className="absolute cursor-pointer rounded-2xl group transition-all"
            style={{
              left: '8.5%',
              top: '22.0%',
              width: '13.5%',
              height: '52.0%'
            }}
          />

          {/* 5. FAR RIGHT SIDE MONITOR (03 // LIGHT ART Hotspot) */}
          <div
            onClick={() => handleSelectCategory('light-art')}
            onMouseEnter={() => {
              setHoveredCategory('light-art');
              audioEngine.playClickSFX();
            }}
            title="Right Wall: 03 // LIGHT ART"
            className="absolute cursor-pointer rounded-2xl group transition-all"
            style={{
              left: '78.0%',
              top: '22.0%',
              width: '13.5%',
              height: '52.0%'
            }}
          />

          {/* CENTER FLOOR PROMPT (MATCHING MOCKUP TEXT) */}
          <div className="absolute bottom-[9.0%] left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center">
            <span className="font-syne text-xs md:text-sm font-bold tracking-[0.25em] text-[#FFA14A] uppercase drop-shadow-[0_0_12px_rgba(255,107,26,0.8)] animate-pulse">
              SELECT CATEGORY TO PROCEED
            </span>
          </div>

          {/* CENTER FLOOR DIRECT CATEGORY SELECTORS */}
          <div className="absolute bottom-[3.5%] left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 p-1.5 rounded-full bg-[#070A0E]/90 backdrop-blur-md border border-slate-800 shadow-2xl pointer-events-auto">
            <button
              onClick={() => handleSelectCategory('portraits')}
              className="px-3.5 py-1.5 rounded-full font-mono-hud text-[10px] md:text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-[#FF6B1A]"
            >
              01 // PORTRAITS
            </button>
            <button
              onClick={() => handleSelectCategory('street')}
              className="px-3.5 py-1.5 rounded-full font-mono-hud text-[10px] md:text-xs font-bold bg-[#FF6B1A] text-slate-950 shadow-[0_0_15px_rgba(255,107,26,0.6)] hover:bg-[#FFA14A] transition-all"
            >
              02 // STREET CONCOURSE
            </button>
            <button
              onClick={() => handleSelectCategory('light-art')}
              className="px-3.5 py-1.5 rounded-full font-mono-hud text-[10px] md:text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-[#FF6B1A]"
            >
              03 // LIGHT ART
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
