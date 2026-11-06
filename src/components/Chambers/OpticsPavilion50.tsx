import React, { useState, useRef, useCallback, useEffect } from 'react';
import { PhotoItem, PhotoCategory } from '../../types';
import { getPhotoThumbUrl } from '../../utils/photoData50';
import { audioEngine } from '../../utils/audioEngine';
import { 
  ArrowLeft, Maximize2, Minimize2, Share2, X, ChevronUp, ChevronDown, 
  ChevronLeft, ChevronRight, RotateCcw, Layers, Upload
} from 'lucide-react';

interface OpticsPavilion50Props {
  photos: PhotoItem[];
  initialCategory?: PhotoCategory | null;
  onBackToGateway: () => void;
  mouseOffset: { x: number; y: number };
  onOpenStudioForFrame?: (target: { category: 'portraits'; frameId: string; frameIndex: number; title: string }) => void;
}

// Precise percentage hotspots matching the 50 frames in the photorealistic square room mockup
interface FrameHotspot {
  id: string;
  photoIndex: number;
  wall: 'left' | 'back' | 'right' | 'pentagon';
  left: string;
  top: string;
  width: string;
  height: string;
}

const FRAME_HOTSPOTS: FrameHotspot[] = [
  // ==========================================
  // 1. BACK WALL (15 Frames: 3 Rows x 5 Cols) [01 - 15]
  // ==========================================
  // Row 1
  { id: 'f-01', photoIndex: 0, wall: 'back', left: '36.5%', top: '41.5%', width: '4.8%', height: '6.2%' },
  { id: 'f-02', photoIndex: 1, wall: 'back', left: '42.2%', top: '41.5%', width: '4.8%', height: '6.2%' },
  { id: 'f-03', photoIndex: 2, wall: 'back', left: '47.6%', top: '41.5%', width: '4.8%', height: '6.2%' },
  { id: 'f-04', photoIndex: 3, wall: 'back', left: '53.0%', top: '41.5%', width: '4.8%', height: '6.2%' },
  { id: 'f-05', photoIndex: 4, wall: 'back', left: '58.7%', top: '41.5%', width: '4.8%', height: '6.2%' },
  // Row 2
  { id: 'f-06', photoIndex: 5, wall: 'back', left: '36.5%', top: '48.8%', width: '4.8%', height: '6.2%' },
  { id: 'f-07', photoIndex: 6, wall: 'back', left: '42.2%', top: '48.8%', width: '4.8%', height: '6.2%' },
  { id: 'f-08', photoIndex: 7, wall: 'back', left: '47.6%', top: '48.8%', width: '4.8%', height: '6.2%' },
  { id: 'f-09', photoIndex: 8, wall: 'back', left: '53.0%', top: '48.8%', width: '4.8%', height: '6.2%' },
  { id: 'f-10', photoIndex: 9, wall: 'back', left: '58.7%', top: '48.8%', width: '4.8%', height: '6.2%' },
  // Row 3
  { id: 'f-11', photoIndex: 10, wall: 'back', left: '36.5%', top: '56.1%', width: '4.8%', height: '6.2%' },
  { id: 'f-12', photoIndex: 11, wall: 'back', left: '42.2%', top: '56.1%', width: '4.8%', height: '6.2%' },
  { id: 'f-13', photoIndex: 12, wall: 'back', left: '47.6%', top: '56.1%', width: '4.8%', height: '6.2%' },
  { id: 'f-14', photoIndex: 13, wall: 'back', left: '53.0%', top: '56.1%', width: '4.8%', height: '6.2%' },
  { id: 'f-15', photoIndex: 14, wall: 'back', left: '58.7%', top: '56.1%', width: '4.8%', height: '6.2%' },

  // ==========================================
  // 2. LEFT WALL (15 Frames: 3 Rows x 5 Cols in Perspective) [16 - 30]
  // ==========================================
  // Row 1
  { id: 'f-16', photoIndex: 15, wall: 'left', left: '2.5%', top: '27.5%', width: '6.4%', height: '11.8%' },
  { id: 'f-17', photoIndex: 16, wall: 'left', left: '9.0%', top: '31.5%', width: '5.2%', height: '10.0%' },
  { id: 'f-18', photoIndex: 17, wall: 'left', left: '14.8%', top: '34.5%', width: '4.4%', height: '8.6%' },
  { id: 'f-19', photoIndex: 18, wall: 'left', left: '19.8%', top: '37.0%', width: '3.6%', height: '7.4%' },
  { id: 'f-20', photoIndex: 19, wall: 'left', left: '23.8%', top: '39.0%', width: '2.8%', height: '6.4%' },
  // Row 2
  { id: 'f-21', photoIndex: 20, wall: 'left', left: '2.5%', top: '43.5%', width: '6.4%', height: '11.8%' },
  { id: 'f-22', photoIndex: 21, wall: 'left', left: '9.0%', top: '45.5%', width: '5.2%', height: '10.0%' },
  { id: 'f-23', photoIndex: 22, wall: 'left', left: '14.8%', top: '47.0%', width: '4.4%', height: '8.6%' },
  { id: 'f-24', photoIndex: 23, wall: 'left', left: '19.8%', top: '48.2%', width: '3.6%', height: '7.4%' },
  { id: 'f-25', photoIndex: 24, wall: 'left', left: '23.8%', top: '49.2%', width: '2.8%', height: '6.4%' },
  // Row 3
  { id: 'f-26', photoIndex: 25, wall: 'left', left: '2.5%', top: '59.5%', width: '6.4%', height: '11.8%' },
  { id: 'f-27', photoIndex: 26, wall: 'left', left: '9.0%', top: '59.0%', width: '5.2%', height: '10.0%' },
  { id: 'f-28', photoIndex: 27, wall: 'left', left: '14.8%', top: '58.5%', width: '4.4%', height: '8.6%' },
  { id: 'f-29', photoIndex: 28, wall: 'left', left: '19.8%', top: '58.0%', width: '3.6%', height: '7.4%' },
  { id: 'f-30', photoIndex: 29, wall: 'left', left: '23.8%', top: '57.5%', width: '2.8%', height: '6.4%' },

  // ==========================================
  // 3. RIGHT WALL (15 Frames: 3 Rows x 5 Cols in Perspective) [31 - 45]
  // ==========================================
  // Row 1
  { id: 'f-31', photoIndex: 30, wall: 'right', left: '73.4%', top: '39.0%', width: '2.8%', height: '6.4%' },
  { id: 'f-32', photoIndex: 31, wall: 'right', left: '76.6%', top: '37.0%', width: '3.6%', height: '7.4%' },
  { id: 'f-33', photoIndex: 32, wall: 'right', left: '80.8%', top: '34.5%', width: '4.4%', height: '8.6%' },
  { id: 'f-34', photoIndex: 33, wall: 'right', left: '85.8%', top: '31.5%', width: '5.2%', height: '10.0%' },
  { id: 'f-35', photoIndex: 34, wall: 'right', left: '91.3%', top: '27.5%', width: '6.4%', height: '11.8%' },
  // Row 2
  { id: 'f-36', photoIndex: 35, wall: 'right', left: '73.4%', top: '49.2%', width: '2.8%', height: '6.4%' },
  { id: 'f-37', photoIndex: 36, wall: 'right', left: '76.6%', top: '48.2%', width: '3.6%', height: '7.4%' },
  { id: 'f-38', photoIndex: 37, wall: 'right', left: '80.8%', top: '47.0%', width: '4.4%', height: '8.6%' },
  { id: 'f-39', photoIndex: 38, wall: 'right', left: '85.8%', top: '45.5%', width: '5.2%', height: '10.0%' },
  { id: 'f-40', photoIndex: 39, wall: 'right', left: '91.3%', top: '43.5%', width: '6.4%', height: '11.8%' },
  // Row 3
  { id: 'f-41', photoIndex: 40, wall: 'right', left: '73.4%', top: '57.5%', width: '2.8%', height: '6.4%' },
  { id: 'f-42', photoIndex: 41, wall: 'right', left: '76.6%', top: '58.0%', width: '3.6%', height: '7.4%' },
  { id: 'f-43', photoIndex: 42, wall: 'right', left: '80.8%', top: '58.5%', width: '4.4%', height: '8.6%' },
  { id: 'f-44', photoIndex: 43, wall: 'right', left: '85.8%', top: '59.0%', width: '5.2%', height: '10.0%' },
  { id: 'f-45', photoIndex: 44, wall: 'right', left: '91.3%', top: '59.5%', width: '6.4%', height: '11.8%' },

  // ==========================================
  // 4. CENTRAL PENTAGON CROWN (5 Frames in Arch Above Back Wall) [46 - 50]
  // ==========================================
  { id: 'f-46', photoIndex: 45, wall: 'pentagon', left: '47.6%', top: '28.5%', width: '4.8%', height: '6.2%' },
  { id: 'f-47', photoIndex: 46, wall: 'pentagon', left: '42.2%', top: '32.5%', width: '4.8%', height: '6.2%' },
  { id: 'f-48', photoIndex: 47, wall: 'pentagon', left: '53.0%', top: '32.5%', width: '4.8%', height: '6.2%' },
  { id: 'f-49', photoIndex: 48, wall: 'pentagon', left: '36.5%', top: '36.5%', width: '4.8%', height: '6.2%' },
  { id: 'f-50', photoIndex: 49, wall: 'pentagon', left: '58.7%', top: '36.5%', width: '4.8%', height: '6.2%' }
];

export const OpticsPavilion50: React.FC<OpticsPavilion50Props> = ({
  photos,
  initialCategory = null,
  onBackToGateway,
  mouseOffset,
  onOpenStudioForFrame
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<FrameHotspot | null>(null);
  const [hoveredHotspot, setHoveredHotspot] = useState<FrameHotspot | null>(null);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [showRosterDrawer, setShowRosterDrawer] = useState<boolean>(false);

  // Prev / Next photo navigation while inspecting
  const handlePrevPhoto = useCallback(() => {
    if (!selectedPhoto) return;
    const currentIndex = photos.findIndex(p => p.id === selectedPhoto.id);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : photos.length - 1;
    const prevPhoto = photos[prevIndex];
    if (prevPhoto) {
      audioEngine.playClickSFX();
      setSelectedPhoto(prevPhoto);
      const hotspot = FRAME_HOTSPOTS.find(h => h.photoIndex === prevIndex);
      if (hotspot) setSelectedHotspot(hotspot);
    }
  }, [selectedPhoto, photos]);

  const handleNextPhoto = useCallback(() => {
    if (!selectedPhoto) return;
    const currentIndex = photos.findIndex(p => p.id === selectedPhoto.id);
    const nextIndex = currentIndex < photos.length - 1 ? currentIndex + 1 : 0;
    const nextPhoto = photos[nextIndex];
    if (nextPhoto) {
      audioEngine.playClickSFX();
      setSelectedPhoto(nextPhoto);
      const hotspot = FRAME_HOTSPOTS.find(h => h.photoIndex === nextIndex);
      if (hotspot) setSelectedHotspot(hotspot);
    }
  }, [selectedPhoto, photos]);

  // Keyboard navigation: Escape returns to gateway or closes photo modal, Arrow keys navigate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showRosterDrawer) {
          setShowRosterDrawer(false);
        } else if (isFullScreen) {
          setIsFullScreen(false);
        } else if (selectedPhoto) {
          setSelectedPhoto(null);
        } else {
          onBackToGateway();
        }
      } else if (e.key === 'ArrowLeft') {
        if (selectedPhoto) {
          e.preventDefault();
          handlePrevPhoto();
        } else {
          setYaw(prev => prev + 10);
        }
      } else if (e.key === 'ArrowRight') {
        if (selectedPhoto) {
          e.preventDefault();
          handleNextPhoto();
        } else {
          setYaw(prev => prev - 10);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showRosterDrawer, isFullScreen, selectedPhoto, onBackToGateway, handlePrevPhoto, handleNextPhoto]);

  // 3D Camera Controls: Yaw (turn left/right), Pitch (tilt up/down), Zoom / Forward Step
  const [yaw, setYaw] = useState<number>(0);
  const [pitch, setPitch] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1);
  const [panX, setPanX] = useState<number>(0);

  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });

  // Drag to pan horizontally and vertically (just like the home page!)
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - lastMouseRef.current.x;
    const deltaY = e.clientY - lastMouseRef.current.y;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };

    // Continuous smooth yaw turn & pitch
    setYaw(prev => Math.max(-50, Math.min(50, prev + deltaX * 0.22)));
    setPitch(prev => Math.max(-18, Math.min(18, prev - deltaY * 0.15)));
  }, []);

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Wheel to zoom in / out smoothly
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(prev => Math.max(1, Math.min(1.9, prev - e.deltaY * 0.0015)));
  };

  // Camera Quick Jump Snaps
  const snapTo = (targetYaw: number, targetZoom: number, targetPanX: number) => {
    audioEngine.playGlideSFX();
    setYaw(targetYaw);
    setPitch(0);
    setZoom(targetZoom);
    setPanX(targetPanX);
  };

  const handleResetOverview = () => {
    audioEngine.playGlideSFX();
    setYaw(0);
    setPitch(0);
    setZoom(1);
    setPanX(0);
  };

  // Step Forward / Zoom In
  const handleGlideForward = () => {
    audioEngine.playGlideSFX();
    setZoom(prev => Math.min(1.85, prev + 0.35));
  };

  // Step Back / Zoom Out
  const handleStepBack = () => {
    audioEngine.playGlideSFX();
    setZoom(prev => Math.max(1, prev - 0.35));
    if (zoom <= 1.35) {
      setPanX(0);
      setYaw(0);
      setPitch(0);
    }
  };

  // Hotspot Click -> Open Step 3 Pop-Card Inspection
  const handleFrameClick = (hotspot: FrameHotspot) => {
    const photo = photos[hotspot.photoIndex];
    if (photo) {
      audioEngine.playLockOnSFX();
      setSelectedHotspot(hotspot);
      setSelectedPhoto(photo);
    }
  };

  const handleShare = (photo: PhotoItem) => {
    audioEngine.playClickSFX();
    if (navigator.share) {
      navigator.share({
        title: photo.title,
        text: `${photo.title} — Photography by Olawale / The Vault`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Vault Telemetry Link copied to clipboard!');
    }
  };


  // Effective camera angles including subtle mouse parallax
  const currentYaw = yaw + (mouseOffset.x * 4);
  const currentPitch = pitch - (mouseOffset.y * 2.5);

  return (
    <div 
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      className="relative w-full h-full overflow-hidden select-none bg-[#070A0E] cursor-grab active:cursor-grabbing flex items-center justify-center"
    >
      {/* ======================================================== */}
      {/* 3D SQUARED GALLERY VIEWPORT (LOCKED 1376x768 STAGE) */}
      {/* ======================================================== */}
      <div 
        className="relative flex-shrink-0 transition-transform duration-500 ease-out pointer-events-none"
        style={{
          width: 'max(100vw, calc(100vh * (1376 / 768)))',
          height: 'max(100vh, calc(100vw * (768 / 1376)))',
          aspectRatio: '1376 / 768',
          transform: `perspective(1000px) rotateY(${currentYaw}deg) rotateX(${currentPitch}deg) scale(${zoom}) translateX(${panX}px)`,
          transformOrigin: '50% 50%'
        }}
      >
        {/* The 100% Photorealistic Squared Room Mockup Backdrop */}
        <img 
          src="/media/vault-rooms/optics_pavilion_clean.jpg"
          alt="Optics Pavilion SQ"
          draggable={false}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
          style={{ filter: 'contrast(1.06) brightness(1.01)' }}
        />

        {/* ======================================================== */}
        {/* INTERACTIVE CLICKABLE FRAME HOTSPOTS (ALL 50 FRAMES) */}
        {/* ======================================================== */}
        <div className="absolute inset-0 pointer-events-auto">
          {FRAME_HOTSPOTS.map((hotspot) => {
            const photo = photos[hotspot.photoIndex];
            if (!photo) return null;

            const isHovered = hoveredHotspot?.id === hotspot.id;
            const isSelected = selectedHotspot?.id === hotspot.id || (selectedPhoto && selectedPhoto.id === photo.id);
            const frameNumber = (hotspot.photoIndex + 1).toString().padStart(2, '0');
            const isCustom = Boolean(
              photo.isCustom ||
              photo.id.startsWith('photo-custom-') ||
              photo.id.startsWith('custom-')
            );

            return (
              <div
                key={hotspot.id}
                onClick={() => handleFrameClick(hotspot)}
                onMouseEnter={() => {
                  setHoveredHotspot(hotspot);
                  audioEngine.playClickSFX();
                }}
                onMouseLeave={() => setHoveredHotspot(null)}
                title={`Frame [${frameNumber}] // ${photo.title}`}
                className="absolute cursor-pointer transition-all duration-200 group rounded-[3px]"
                style={{
                  left: hotspot.left,
                  top: hotspot.top,
                  width: hotspot.width,
                  height: hotspot.height
                }}
              >
                {/* Visual Artwork Lightbox Frame: Embedded into architectural pavilion walls */}
                <div 
                  className={`relative w-full h-full rounded-md overflow-hidden bg-slate-950/90 transition-all duration-300 ${
                    isSelected
                      ? 'border-2 border-cyan-300 shadow-[0_0_28px_rgba(6,182,212,0.95),inset_0_0_12px_rgba(6,182,212,0.35)] scale-105 z-30'
                      : isHovered
                        ? 'border-2 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.85),inset_0_0_8px_rgba(6,182,212,0.2)] scale-105 z-20'
                        : hotspot.wall === 'back'
                          ? 'border border-cyan-500/50 shadow-[0_4px_16px_rgba(0,0,0,0.9),0_0_10px_rgba(6,182,212,0.25)] hover:border-cyan-400'
                          : hotspot.wall === 'pentagon'
                            ? 'border border-[#FFA14A]/50 shadow-[0_4px_16px_rgba(0,0,0,0.9),0_0_10px_rgba(255,161,74,0.25)] hover:border-[#FFA14A]'
                            : 'border border-cyan-500/40 shadow-[0_4px_16px_rgba(0,0,0,0.9),0_0_8px_rgba(6,182,212,0.2)] hover:border-cyan-400'
                  }`}
                  style={{
                    transform: hotspot.wall === 'left' ? 'perspective(500px) rotateY(28deg)' :
                               hotspot.wall === 'right' ? 'perspective(500px) rotateY(-28deg)' : undefined,
                    transformOrigin: hotspot.wall === 'left' ? '100% 50%' : hotspot.wall === 'right' ? '0% 50%' : '50% 50%'
                  }}
                >
                  <img
                    src={getPhotoThumbUrl(photo.image)}
                    alt={photo.title}
                    draggable={false}
                    decoding="async"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (target.src !== photo.image) {
                        target.src = photo.image;
                      }
                    }}
                    className="w-full h-full object-cover select-none transition-transform duration-300 group-hover:scale-103"
                  />
                  {/* Subtle Inner Bevel Depth */}
                  <div className="absolute inset-0 shadow-[inset_0_1px_4px_rgba(0,0,0,0.8)] pointer-events-none" />

                  {/* Top Left Frame ID Tag */}
                  <div className="absolute top-1 left-1 z-10 px-1 py-0.5 rounded bg-black/75 backdrop-blur-xs border border-white/10 text-white/90 font-mono-hud text-[6px] font-bold tracking-wider pointer-events-none">
                    #{frameNumber}
                  </div>

                  {/* LIVE Badge for Custom Uploads */}
                  {isCustom && (
                    <div className="absolute top-1 right-1 z-10 px-1 py-0.5 rounded bg-[#FF6B1A] text-slate-950 font-mono-hud text-[6px] font-black tracking-wider uppercase shadow-[0_0_8px_rgba(255,107,26,0.8)] pointer-events-none">
                      LIVE
                    </div>
                  )}
                </div>

                {/* Corner Reticle Brackets on Hover or Selection */}
                {(isHovered || isSelected) && (
                  <>
                    <div className="absolute -top-0.5 -left-0.5 w-1.5 h-1.5 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
                    <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
                    <div className="absolute -bottom-0.5 -left-0.5 w-1.5 h-1.5 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
                    <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />
                  </>
                )}

                {/* Hover Frame Badge Tooltip */}
                {isHovered && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-40 whitespace-nowrap bg-[#070A0E]/95 px-2 py-0.5 rounded border border-[#FF6B1A] font-mono-hud text-[8px] text-[#FFA14A] font-bold shadow-[0_0_12px_rgba(255,107,26,0.6)] pointer-events-none animate-fade-in flex items-center gap-1.5">
                    <span>[{frameNumber}] {photo.title}</span>
                    {isCustom && (
                      <span className="bg-[#FF6B1A] text-slate-950 px-1 rounded text-[7px]">LIVE</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* ======================================================== */}
      {/* TOP CONTROLS: CAMERA WALL SNAPS (TOP RIGHT) */}
      {/* ======================================================== */}
      <div className="absolute top-16 md:top-14 right-6 md:right-10 z-20 flex items-center gap-1.5 p-1 rounded-full bg-[#070A0E]/90 backdrop-blur-md border border-slate-800 shadow-2xl pointer-events-auto">
        <button
          onClick={handleResetOverview}
          className={`px-2.5 py-1 rounded-full font-mono-hud text-[9px] font-bold transition-all cursor-pointer ${
            zoom === 1 && yaw === 0
              ? 'bg-[#38BDF8] text-slate-950 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          OVERVIEW
        </button>

        <button
          onClick={() => snapTo(28, 1.35, 180)}
          className="px-2.5 py-1 rounded-full font-mono-hud text-[9px] font-bold text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          LEFT WALL
        </button>

        <button
          onClick={() => snapTo(0, 1.45, 0)}
          className="px-2.5 py-1 rounded-full font-mono-hud text-[9px] font-bold text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          BACK WALL
        </button>

        <button
          onClick={() => snapTo(-28, 1.35, -180)}
          className="px-2.5 py-1 rounded-full font-mono-hud text-[9px] font-bold text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          RIGHT WALL
        </button>

        <button
          onClick={() => snapTo(0, 1.55, 0)}
          className="px-2.5 py-1 rounded-full font-mono-hud text-[9px] font-bold text-[#38BDF8] hover:text-white transition-all cursor-pointer"
        >
          PENTAGON
        </button>
      </div>

      {/* ======================================================== */}
      {/* BOTTOM CONTROLS: TURN LEFT/RIGHT & MOVE UP/DOWN (HOME PAGE STYLE) */}
      {/* ======================================================== */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 p-1.5 rounded-full bg-[#070A0E]/90 backdrop-blur-md border border-slate-800 shadow-2xl pointer-events-auto">
        {/* Turn Left */}
        <button
          onClick={() => {
            audioEngine.playGlideSFX();
            setYaw(prev => prev + 18);
          }}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full font-mono-hud text-[10px] text-slate-300 hover:text-white hover:bg-white/10 transition-all"
          title="Turn Left"
        >
          <ChevronLeft className="w-3.5 h-3.5 text-[#FF6B1A]" />
          <span>TURN LEFT</span>
        </button>

        {/* Glide Forward / Zoom In */}
        <button
          onClick={handleGlideForward}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full font-mono-hud text-xs font-bold bg-[#FF6B1A] text-slate-950 hover:bg-[#FFA14A] shadow-[0_0_15px_rgba(255,107,26,0.5)] transition-all"
          title="Move Forward / Zoom Closer to Frames"
        >
          <ChevronUp className="w-4 h-4" />
          <span>GLIDE FORWARD</span>
        </button>

        {/* Reset Overview */}
        <button
          onClick={handleResetOverview}
          className="p-1.5 rounded-full font-mono-hud text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          title="Reset to Center Overview"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Step Back / Zoom Out */}
        <button
          disabled={zoom <= 1}
          onClick={handleStepBack}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-mono-hud text-xs font-bold transition-all ${
            zoom > 1
              ? 'bg-slate-800 text-white hover:bg-slate-700'
              : 'bg-slate-800/40 text-slate-600 cursor-not-allowed'
          }`}
          title="Step Back to Wide View"
        >
          <ChevronDown className="w-4 h-4" />
          <span>STEP BACK</span>
        </button>

        {/* Turn Right */}
        <button
          onClick={() => {
            audioEngine.playGlideSFX();
            setYaw(prev => prev - 18);
          }}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full font-mono-hud text-[10px] text-slate-300 hover:text-white hover:bg-white/10 transition-all"
          title="Turn Right"
        >
          <span>TURN RIGHT</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#FF6B1A]" />
        </button>
      </div>

      {/* Bottom Telemetry Status Tag & Exhibits Trigger */}
      <div className="absolute bottom-6 left-6 z-20 flex items-center gap-3">
        <button
          onClick={() => {
            try { audioEngine.playClickSFX(); } catch {}
            setShowRosterDrawer(prev => !prev);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono-hud text-[10px] md:text-xs font-bold bg-[#0B131F]/90 border border-[#FF6B1A]/60 hover:border-[#FF6B1A] text-[#FFA14A] hover:bg-[#FF6B1A]/15 shadow-[0_0_15px_rgba(255,107,26,0.3)] transition-all cursor-pointer pointer-events-auto"
          title="Browse All 50 Portraits & Exhibits Roster"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>EXHIBITS (50)</span>
        </button>

        <div className="pointer-events-none hidden sm:flex items-center gap-2 font-mono-hud text-[9px] text-slate-400">
          <span className="text-[#FFA14A] font-bold">50-FRAME SQUARED PAVILION</span>
          <span>// 45 WALLS + 5 CROWN</span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* STEP 3: PHOTO INSPECTOR POP-CARD (`CAMERA 01 // INTERSPECT`) */}
      {/* ======================================================== */}
      {selectedPhoto && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedPhoto(null);
              setSelectedHotspot(null);
            }
          }}
          className="fixed inset-0 z-50 bg-[#070A0E]/85 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-fade-in pointer-events-auto"
        >
          {/* Prominent Left Floating Navigation Arrow */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrevPhoto();
            }}
            className="fixed left-6 top-1/2 -translate-y-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-[#070A0E]/90 hover:bg-[#FF6B1A] text-[#FFA14A] hover:text-slate-950 border-2 border-[#FF6B1A]/80 shadow-[0_0_25px_rgba(255,107,26,0.6)] transition-all cursor-pointer group pointer-events-auto"
            title="Previous Exhibit [← / Arrow Left]"
          >
            <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            <span className="font-mono-hud text-xs font-bold tracking-wider hidden sm:inline">PREV EXHIBIT</span>
          </button>

          <div className="relative w-full max-w-5xl flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10">
            
            {/* LEFT: FRAMED ARTWORK WITH RETICLE CORNER BRACKETS */}
            <div className="relative w-full md:w-1/2 max-w-lg aspect-[16/10] rounded-xl overflow-hidden border border-[#38BDF8]/60 shadow-[0_0_40px_rgba(56,189,248,0.3)] bg-slate-950">
              <img
                src={selectedPhoto.image}
                alt={selectedPhoto.title}
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                className="w-full h-full object-cover select-none"
              />

              {/* Prev Photo Floating Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevPhoto();
                }}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-[#070A0E]/85 hover:bg-[#FF6B1A] text-[#FFA14A] hover:text-slate-950 border border-[#FF6B1A]/60 shadow-[0_0_15px_rgba(0,0,0,0.9)] transition-all cursor-pointer"
                title="Previous Exhibit [←]"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Next Photo Floating Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextPhoto();
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-[#070A0E]/85 hover:bg-[#FF6B1A] text-[#FFA14A] hover:text-slate-950 border border-[#FF6B1A]/60 shadow-[0_0_15px_rgba(0,0,0,0.9)] transition-all cursor-pointer"
                title="Next Exhibit [→]"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Prominently Highlighted X (Cancel) Sign directly on the Frame */}
              <button
                onClick={() => {
                  setSelectedPhoto(null);
                  setSelectedHotspot(null);
                }}
                className="absolute top-3 right-3 z-30 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#070A0E]/90 border-2 border-[#FF6B1A] text-[#FFA14A] hover:bg-[#FF6B1A] hover:text-slate-950 font-mono-hud text-xs font-bold shadow-[0_0_20px_rgba(255,107,26,0.8)] transition-all cursor-pointer group"
                title="Cancel / Close Frame (ESC)"
              >
                <X className="w-4 h-4 transition-transform group-hover:rotate-90 text-[#FF6B1A] group-hover:text-slate-950" />
                <span>CLOSE</span>
              </button>

              {/* HUD Reticle Brackets */}
              <div className="absolute top-2.5 left-2.5 w-4 h-4 border-t-2 border-l-2 border-[#FFA14A] pointer-events-none" />
              <div className="absolute top-2.5 right-2.5 w-4 h-4 border-t-2 border-r-2 border-[#FFA14A] pointer-events-none" />
              <div className="absolute bottom-2.5 left-2.5 w-4 h-4 border-b-2 border-l-2 border-[#FFA14A] pointer-events-none" />
              <div className="absolute bottom-2.5 right-2.5 w-4 h-4 border-b-2 border-r-2 border-[#FFA14A] pointer-events-none" />

              <div className="absolute left-2.5 top-1/2 -translate-y-1/2 -rotate-90 origin-left font-mono-hud text-[8px] text-slate-400 tracking-widest uppercase pointer-events-none">
                SPECS EXPANDED
              </div>
            </div>

            {/* RIGHT: TRANSLUCENT EMBER-BORDERED HOLOGRAPHIC TELEMETRY CARD */}
            <div className="relative w-full md:w-1/2 max-w-md rounded-2xl glass-hologram p-6 md:p-8 flex flex-col justify-between border-2 border-[#FF6B1A]/60 shadow-[0_0_45px_rgba(255,107,26,0.35)]">
              
              {/* Header Telemetry */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono-hud text-[10px] text-[#38BDF8] tracking-widest uppercase">
                    CAMERA 01 // INTERSPECT
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 font-mono-hud text-[10px] bg-emerald-950/70 border border-emerald-500/50 text-emerald-400 px-2 py-0.5 rounded">
                      <span>{selectedPhoto.status}</span>
                    </div>
                    {/* Highlighted Close X button in header */}
                    <button
                      onClick={() => setSelectedPhoto(null)}
                      className="p-1 rounded-full bg-red-950/60 border border-red-500/70 text-red-300 hover:bg-red-600 hover:text-white transition-all shadow-[0_0_12px_rgba(239,68,68,0.5)] cursor-pointer"
                      title="Close [ESC]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-syne text-xl md:text-2xl font-bold text-white tracking-wider glow-ember-text">
                  {selectedPhoto.title}
                </h3>
                <span className="font-mono-hud text-[10px] text-slate-400 tracking-wider">
                  COORD: {selectedPhoto.coordinates}
                </span>
              </div>

              {/* OPTICS DETECTED Telemetry Grid */}
              <div className="my-5 p-4 rounded-xl bg-[#070A0E]/60 border border-slate-700/60 flex items-center justify-between">
                <div className="flex flex-col gap-1 font-mono-hud text-xs">
                  <span className="text-[#38BDF8] font-bold tracking-wider text-[11px]">
                    OPTICS DETECTED
                  </span>
                  <div className="text-slate-300">
                    <span className="text-slate-500">LENS: </span>
                    <span className="text-[#FFA14A]">{selectedPhoto.optics.lens}</span>
                  </div>
                  <div className="text-slate-300">
                    <span className="text-slate-500">SHUTTER: </span>
                    <span>{selectedPhoto.optics.shutter}</span>
                  </div>
                  <div className="text-slate-300">
                    <span className="text-slate-500">ISO: </span>
                    <span>{selectedPhoto.optics.iso}</span>
                  </div>
                  <div className="text-slate-300">
                    <span className="text-slate-500">BODY: </span>
                    <span className="text-[#38BDF8]">{selectedPhoto.optics.body}</span>
                  </div>
                </div>

                {/* Circular Telemetry Gauge Graphic */}
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#38BDF8]/60 animate-spin" />
                  <div className="w-10 h-10 rounded-full border border-[#FF6B1A] flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-[#FFA14A] glow-ember" />
                  </div>
                </div>
              </div>

              {/* Story */}
              <p className="font-mono-hud text-[10px] text-slate-300 leading-relaxed mb-4">
                {selectedPhoto.story}
              </p>

              {/* Actions Control Deck: Symmetrical & Overflow-Free */}
              <div className="flex flex-col gap-2.5 pt-4 border-t border-slate-800/80">
                {/* Row 1: Primary Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      audioEngine.playClickSFX();
                      setIsFullScreen(true);
                    }}
                    className="flex-1 h-10 flex items-center justify-center gap-2 px-3 rounded-lg bg-[#FF6B1A] hover:bg-[#FFA14A] text-slate-950 font-mono-hud text-xs font-bold tracking-wider transition-all shadow-[0_0_15px_rgba(255,107,26,0.5)] cursor-pointer whitespace-nowrap"
                    title="View Full Screen High Resolution"
                  >
                    <Maximize2 className="w-4 h-4 shrink-0" />
                    <span>VIEW FULL SCREEN</span>
                  </button>

                  {onOpenStudioForFrame && selectedHotspot && (
                    <button
                      onClick={() => {
                        audioEngine.playLockOnSFX();
                        onOpenStudioForFrame({
                          category: 'portraits',
                          frameId: selectedHotspot.id,
                          frameIndex: selectedHotspot.photoIndex,
                          title: selectedPhoto.title
                        });
                      }}
                      className="flex-1 h-10 flex items-center justify-center gap-1.5 px-3 rounded-lg bg-[#38BDF8]/20 hover:bg-[#38BDF8]/30 border border-[#38BDF8]/60 text-[#38BDF8] hover:text-white font-mono-hud text-xs font-bold transition-all shadow-[0_0_12px_rgba(56,189,248,0.25)] cursor-pointer whitespace-nowrap"
                      title={`Upload or replace photo specifically for Frame ${String(selectedHotspot.photoIndex + 1).padStart(2, '0')}`}
                    >
                      <Upload className="w-4 h-4 shrink-0" />
                      <span>UPLOAD TO FRAME {String(selectedHotspot.photoIndex + 1).padStart(2, '0')}</span>
                    </button>
                  )}
                </div>

                {/* Row 2: Secondary Controls (Share & Cancel) */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleShare(selectedPhoto)}
                    className="flex-1 h-8 flex items-center justify-center gap-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono-hud text-[11px] font-semibold transition-colors cursor-pointer"
                    title="Share Canvas Telemetry"
                  >
                    <Share2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>SHARE</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedPhoto(null);
                      setSelectedHotspot(null);
                    }}
                    className="flex-1 h-8 flex items-center justify-center gap-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-white border border-red-500/50 hover:border-red-500 font-mono-hud text-[11px] font-semibold shadow-[0_0_12px_rgba(239,68,68,0.3)] transition-all cursor-pointer group"
                    title="Cancel / Close Frame [ESC]"
                  >
                    <X className="w-3.5 h-3.5 text-red-400 transition-transform group-hover:rotate-90" />
                    <span>CANCEL</span>
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* Bottom Floating Navigation Dock: Prev / Index / Next / Cancel */}
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-1.5 rounded-full bg-[#070A0E]/95 backdrop-blur-md border border-[#FF6B1A]/60 shadow-[0_0_30px_rgba(0,0,0,0.9)] pointer-events-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrevPhoto();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full font-mono-hud text-xs font-bold bg-white/5 hover:bg-[#FF6B1A] text-slate-200 hover:text-slate-950 transition-all border border-transparent hover:border-[#FF6B1A] cursor-pointer"
              title="Previous Exhibit [← / Arrow Left]"
            >
              <ChevronLeft className="w-4 h-4 text-[#FF6B1A]" />
              <span>PREV EXHIBIT</span>
            </button>

            <div className="px-3.5 py-1.5 font-mono-hud text-xs font-bold text-[#FFA14A] bg-[#FF6B1A]/10 border border-[#FF6B1A]/30 rounded-full">
              FRAME {String((selectedHotspot ? selectedHotspot.photoIndex : photos.findIndex(p => p.id === selectedPhoto.id)) + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNextPhoto();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full font-mono-hud text-xs font-bold bg-white/5 hover:bg-[#FF6B1A] text-slate-200 hover:text-slate-950 transition-all border border-transparent hover:border-[#FF6B1A] cursor-pointer"
              title="Next Exhibit [→ / Arrow Right]"
            >
              <span>NEXT EXHIBIT</span>
              <ChevronRight className="w-4 h-4 text-[#FF6B1A]" />
            </button>

            <div className="w-[1px] h-4 bg-slate-700 my-auto" />

            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPhoto(null);
                setSelectedHotspot(null);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full font-mono-hud text-xs font-bold bg-red-950/50 hover:bg-red-600 text-red-300 hover:text-white transition-all border border-red-500/50 cursor-pointer"
              title="Cancel / Close Frame [ESC]"
            >
              <X className="w-3.5 h-3.5" />
              <span>CANCEL</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* FULL-SCREEN THEATER VIEW MODAL (`VIEW FULL SCREEN`) */}
      {/* ======================================================== */}
      {selectedPhoto && isFullScreen && (
        <div className="fixed inset-0 z-[60] bg-[#070A0E]/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4 animate-fade-in pointer-events-auto select-none">
          <div className="absolute top-6 left-8 right-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-mono-hud text-sm text-[#FFA14A] font-bold">
                {selectedPhoto.title}
              </span>
              <span className="font-mono-hud text-[11px] text-slate-400">
                {selectedPhoto.optics.lens} // {selectedPhoto.optics.body}
              </span>
            </div>

            {/* Prominently Highlighted X (Cancel) Button */}
            <button
              onClick={() => setIsFullScreen(false)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-950/60 hover:bg-red-600 border-2 border-red-500 text-white font-mono-hud text-xs font-bold shadow-[0_0_20px_rgba(239,68,68,0.7)] transition-all cursor-pointer group"
              title="Close Full Screen [ESC]"
            >
              <X className="w-4 h-4 transition-transform group-hover:rotate-90" />
              <span>[ESC] CLOSE FULL SCREEN</span>
            </button>
          </div>

          <div className="relative max-w-5xl max-h-[82vh] flex items-center justify-center">
            <button
              onClick={handlePrevPhoto}
              className="fixed left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 flex items-center gap-1.5 px-3.5 py-4 rounded-2xl bg-[#070A0E]/90 hover:bg-[#FF6B1A] text-[#FFA14A] hover:text-slate-950 border-2 border-[#FF6B1A]/60 shadow-[0_0_25px_rgba(0,0,0,0.9)] transition-all cursor-pointer group"
              title="Previous Exhibit [←]"
            >
              <ChevronLeft className="w-6 h-6 transition-transform group-hover:-translate-x-1" />
              <span className="hidden lg:inline font-mono-hud text-xs font-bold">PREV</span>
            </button>

            <div className="rounded-2xl overflow-hidden border-2 border-[#38BDF8] shadow-[0_0_60px_rgba(56,189,248,0.5)]">
              <img
                src={selectedPhoto.image}
                alt={selectedPhoto.title}
                decoding="async"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                className="w-full h-full object-contain max-h-[82vh] select-none"
              />
            </div>

            <button
              onClick={handleNextPhoto}
              className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 flex items-center gap-1.5 px-3.5 py-4 rounded-2xl bg-[#070A0E]/90 hover:bg-[#FF6B1A] text-[#FFA14A] hover:text-slate-950 border-2 border-[#FF6B1A]/60 shadow-[0_0_25px_rgba(0,0,0,0.9)] transition-all cursor-pointer group"
              title="Next Exhibit [→]"
            >
              <span className="hidden lg:inline font-mono-hud text-xs font-bold">NEXT</span>
              <ChevronRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          <div className="absolute bottom-6 font-mono-hud text-xs text-slate-400">
            PHOTOGRAPHY EXHIBITION // {selectedPhoto.title} // PRESS ESC TO RETURN
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SLIDE-OUT EXHIBITS ROSTER DRAWER (ALL 50 PORTRAITS)     */}
      {/* ======================================================== */}
      {showRosterDrawer && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-[#070A0E]/95 backdrop-blur-2xl border-l border-[#FF6B1A]/40 shadow-[-10px_0_40px_rgba(0,0,0,0.9)] p-6 flex flex-col justify-between animate-slide-left pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <div className="font-mono-hud text-[10px] text-[#38BDF8] tracking-widest uppercase font-bold">
                PORTRAITS // PAVILION ROSTER
              </div>
              <h3 className="font-syne text-lg font-bold text-white tracking-wider flex items-center gap-2">
                <span>PORTRAIT EXHIBITS</span>
                <span className="font-mono-hud text-xs text-[#FFA14A] bg-amber-950/70 border border-amber-500/40 px-2 py-0.5 rounded">
                  50 FRAMES
                </span>
              </h3>
            </div>
            <button
              onClick={() => setShowRosterDrawer(false)}
              className="p-1.5 rounded-full bg-slate-800/60 hover:bg-[#FF6B1A] hover:text-slate-950 text-slate-300 transition-all cursor-pointer"
              title="Close Drawer [ESC]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Subheader */}
          <div className="py-2.5 flex items-center justify-between font-mono-hud text-[10px] text-slate-400">
            <span>SELECT FRAME TO INSPECT</span>
            <span className="text-[#FFA14A]">PRESS ESC TO CLOSE</span>
          </div>

          {/* Scrollable list of artworks */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 my-2">
            {FRAME_HOTSPOTS.map((hotspot) => {
              const photo = photos[hotspot.photoIndex];
              if (!photo) return null;
              const isSelected = selectedPhoto?.id === photo.id;
              const isCustom = photo.id.startsWith('photo-custom-') || (!photo.id.startsWith('photo-0') && !photo.id.startsWith('pavilion-photo-'));

              return (
                <div
                  key={hotspot.id}
                  onClick={() => {
                    handleFrameClick(hotspot);
                    setShowRosterDrawer(false);
                  }}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3.5 group ${
                    isSelected
                      ? 'border-[#FF6B1A] bg-[#FF6B1A]/10 shadow-[0_0_20px_rgba(255,107,26,0.3)]'
                      : 'border-slate-800 bg-slate-900/60 hover:border-[#FF6B1A]/60 hover:bg-slate-900'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative w-16 h-14 rounded-lg overflow-hidden bg-slate-950 border border-slate-700/80 shrink-0">
                    <img
                      src={getPhotoThumbUrl(photo.image)}
                      alt={photo.title}
                      decoding="async"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.src !== photo.image) {
                          target.src = photo.image;
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
                        #{String(hotspot.photoIndex + 1).padStart(2, '0')}
                      </span>
                      <h4 className="font-mono-hud text-xs font-bold text-white truncate group-hover:text-[#FFA14A] transition-colors">
                        {photo.title}
                      </h4>
                    </div>
                    <p className="font-mono-hud text-[9px] text-slate-400 truncate mt-0.5">
                      {photo.optics?.body || 'LEICA M11'} // {photo.optics?.lens || '50MM'}
                    </p>
                    <div className="flex items-center gap-2 mt-1 font-mono-hud text-[8px] text-slate-500">
                      <span>{hotspot.wall.toUpperCase()} WALL</span>
                      <span>•</span>
                      <span>{photo.ownership}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Drawer Footer */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between font-mono-hud text-[10px] text-slate-500">
            <span>PAVILION 50 // 60FPS</span>
            <button
              onClick={() => {
                setShowRosterDrawer(false);
                handleResetOverview();
              }}
              className="text-[#FFA14A] hover:underline cursor-pointer"
            >
              RESET OVERVIEW
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
