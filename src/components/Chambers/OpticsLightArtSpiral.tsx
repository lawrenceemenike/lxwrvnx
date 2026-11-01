import React, { useState, useRef, useCallback, useEffect } from 'react';
import { PhotoItem } from '../../types';
import { audioEngine } from '../../utils/audioEngine';
import { 
  ArrowLeft, Share2, X, ChevronLeft, ChevronRight, 
  RotateCcw, Maximize2, Minimize2, ZoomIn, ZoomOut, Layers, Upload
} from 'lucide-react';

interface OpticsLightArtSpiralProps {
  photos: PhotoItem[];
  onBackToGateway: () => void;
  mouseOffset: { x: number; y: number };
  onOpenStudioForFrame?: (target: { category: 'light-art'; frameId: string; frameIndex: number; title: string }) => void;
}

export interface HorizonArtwork {
  id: string;
  index: number;
  format: '4:5' | '16:9' | '1:1';
  title: string;
  lightSource: string;
  exposureDuration: string;
  apertureIso: string;
  chromaSpectrum: string;
  philosophy: string;
  dimensions: string;
  ownership: string;
  image: string;
  spatial: {
    left: string;
    top: string;
    width: string;
    height: string;
    lockYaw: number;
    lockPanX: number;
  };
  isCustom?: boolean;
}

// 15 Symmetrical Panoramic Ribbon Frames (Strictly Grounded, Flat to Horizon)
const DEFAULT_HORIZON_WORKS: HorizonArtwork[] = [
  {
    id: 'hz-01',
    index: 1,
    format: '4:5',
    title: 'HORIZON // POLARIS 01',
    lightSource: 'ROTATING FIBER-OPTIC WAND // 840 LUMEN',
    exposureDuration: '15.0s BULB EXPOSURE',
    apertureIso: 'F/8.0 @ ISO 100',
    chromaSpectrum: 'WARM AMBER 590nm // SODIUM 580nm',
    philosophy: 'Kinetic sweep along the horizontal perimeter, grounded flat against matte slate concrete.',
    dimensions: '4:5 MASTER (3840 x 4800)',
    ownership: 'EXCLUSIVE / 01 OF 01',
    image: '/media/photography/light-art/light-art-hyper.jpg',
    spatial: { left: '5.2%', top: '36.0%', width: '5.2%', height: '19.4%', lockYaw: 33, lockPanX: 270 }
  },
  {
    id: 'hz-02',
    index: 2,
    format: '4:5',
    title: 'CHIAROSCURO // VEIL',
    lightSource: 'INCANDESCENT APEX CORE // 2800K',
    exposureDuration: '12.0s CONTINUOUS TRACE',
    apertureIso: 'F/7.1 @ ISO 100',
    chromaSpectrum: 'WARM TUNGSTEN 585nm',
    philosophy: 'Shadow play slicing across vertical aperture blinds into reflective concrete.',
    dimensions: '4:5 MASTER (3840 x 4800)',
    ownership: 'EXCLUSIVE / 01 OF 01',
    image: '/media/photography/light-art/light-art-vortex.jpg',
    spatial: { left: '11.5%', top: '36.3%', width: '5.1%', height: '19.2%', lockYaw: 26, lockPanX: 210 }
  },
  {
    id: 'hz-03',
    index: 3,
    format: '4:5',
    title: 'ZENITH // SILHOUETTE',
    lightSource: 'LINEAR LASER GUIDE // 532nm ATTENUATED',
    exposureDuration: '20.0s BULB MODE',
    apertureIso: 'F/9.0 @ ISO 64',
    chromaSpectrum: 'DEEP AMBER 595nm',
    philosophy: 'Minimalist human scale framed symmetrically within the horizon curve.',
    dimensions: '4:5 MASTER (3840 x 4800)',
    ownership: 'EXCLUSIVE / 01 OF 01',
    image: '/media/photography/light-art/light-art-velocity.jpg',
    spatial: { left: '17.7%', top: '36.6%', width: '5.0%', height: '19.0%', lockYaw: 19, lockPanX: 150 }
  },
  {
    id: 'hz-04',
    index: 4,
    format: '16:9',
    title: 'PHOTON // HELIX',
    lightSource: 'DUAL LED KINETIC ROTOR',
    exposureDuration: '18.0s SWEEP',
    apertureIso: 'F/8.0 @ ISO 100',
    chromaSpectrum: 'AMBER 600nm // CYAN TRACE',
    philosophy: 'Continuous orbital photon traces revolving around a singular horizontal axis.',
    dimensions: '16:9 CINEMATIC (4800 x 2700)',
    ownership: 'EXCLUSIVE / 01 OF 01',
    image: '/media/photography/light-art/light-art-velocity.jpg',
    spatial: { left: '23.8%', top: '36.9%', width: '4.9%', height: '18.8%', lockYaw: 13, lockPanX: 100 }
  },
  {
    id: 'hz-05',
    index: 5,
    format: '1:1',
    title: 'NOIR // PERSPECTIVE',
    lightSource: 'CATHODE STROBE EMISSION RIG',
    exposureDuration: '8.0s STROBE ARRAY',
    apertureIso: 'F/5.6 @ ISO 200',
    chromaSpectrum: 'MONOCHROMATIC HIGHLIGHT',
    philosophy: 'Brutalist concrete alleyway receded in pure linear perspective.',
    dimensions: '1:1 SQUARE (4000 x 4000)',
    ownership: 'EXCLUSIVE / 01 OF 01',
    image: '/media/photography/street/street-noir.jpg',
    spatial: { left: '29.8%', top: '37.1%', width: '4.9%', height: '18.6%', lockYaw: 8, lockPanX: 60 }
  },
  {
    id: 'hz-06',
    index: 6,
    format: '4:5',
    title: 'MONOLITH // REVERIE',
    lightSource: 'DIFFUSE SOFTBOX ARRAY // 3200K',
    exposureDuration: '10.0s EXTENDED',
    apertureIso: 'F/6.3 @ ISO 100',
    chromaSpectrum: 'WARM TUNGSTEN 580nm',
    philosophy: 'Geometric face profile contrasted against matte charcoal negative space.',
    dimensions: '4:5 MASTER (3840 x 4800)',
    ownership: 'EXCLUSIVE / 01 OF 01',
    image: '/media/photography/light-art/light-art-hyper.jpg',
    spatial: { left: '35.8%', top: '37.3%', width: '4.8%', height: '18.5%', lockYaw: 4, lockPanX: 30 }
  },
  {
    id: 'hz-07',
    index: 7,
    format: '16:9',
    title: 'VELOCITY // CONVERGENCE',
    lightSource: 'HIGH-RPM ORBITAL HARNESS',
    exposureDuration: '25.0s LONG EXPOSURE',
    apertureIso: 'F/11.0 @ ISO 50',
    chromaSpectrum: 'AMBER GLOW 590nm',
    philosophy: 'Linear speed vectors converging cleanly toward the central emitter.',
    dimensions: '16:9 CINEMATIC (4800 x 2700)',
    ownership: 'EXCLUSIVE / 01 OF 01',
    image: '/media/photography/light-art/light-art-vortex.jpg',
    spatial: { left: '41.7%', top: '37.4%', width: '4.8%', height: '18.4%', lockYaw: 1.5, lockPanX: 10 }
  },
  {
    id: 'hz-08',
    index: 8,
    format: '4:5',
    title: 'SOLITARY // CADENCE',
    lightSource: 'SODIUM VAPOR STREET ILLUMINATION',
    exposureDuration: '14.0s APERTURE BULB',
    apertureIso: 'F/8.0 @ ISO 100',
    chromaSpectrum: 'NATURAL AMBER 589nm',
    philosophy: 'Single figure standing at the infinite threshold of dark polished concrete.',
    dimensions: '4:5 MASTER (3840 x 4800)',
    ownership: 'EXCLUSIVE / 01 OF 01',
    image: '/media/photography/street/asphalt-monsoon.jpg',
    spatial: { left: '47.6%', top: '37.5%', width: '4.8%', height: '18.4%', lockYaw: 0, lockPanX: 0 }
  },
  {
    id: 'hz-09',
    index: 9,
    format: '16:9',
    title: 'NEO // PASSAGE',
    lightSource: 'SUBTERRANEAN AMBER LIGHT STRIP',
    exposureDuration: '16.0s CONTINUOUS',
    apertureIso: 'F/7.1 @ ISO 160',
    chromaSpectrum: 'AMBER 590nm // CHARCOAL',
    philosophy: 'Linear corridor lines tracking the camera across the horizon ribbon.',
    dimensions: '16:9 CINEMATIC (4800 x 2700)',
    ownership: 'EXCLUSIVE / 01 OF 01',
    image: '/media/photography/street/project-specter.jpg',
    spatial: { left: '53.5%', top: '37.4%', width: '4.8%', height: '18.4%', lockYaw: -1.5, lockPanX: -10 }
  },
  {
    id: 'hz-10',
    index: 10,
    format: '4:5',
    title: 'STRATA // EQUINOX',
    lightSource: 'LOW-PROFILE ARCHITECTURAL ACCENT',
    exposureDuration: '12.0s MANUAL SWEEP',
    apertureIso: 'F/8.0 @ ISO 100',
    chromaSpectrum: 'WARM SODIUM 585nm',
    philosophy: 'Vertical architectural columns illuminated by subtle ground-level radiance.',
    dimensions: '4:5 MASTER (3840 x 4800)',
    ownership: 'EXCLUSIVE / 01 OF 01',
    image: '/media/photography/light-art/light-art-velocity.jpg',
    spatial: { left: '59.4%', top: '37.3%', width: '4.8%', height: '18.5%', lockYaw: -4, lockPanX: -30 }
  },
  {
    id: 'hz-11',
    index: 11,
    format: '4:5',
    title: 'AURA // REFLECTION',
    lightSource: 'KINETIC FIBER OPTIC BEAM',
    exposureDuration: '15.0s BULB',
    apertureIso: 'F/9.0 @ ISO 100',
    chromaSpectrum: 'AMBER 600nm',
    philosophy: 'Natural warmth projected downward onto the dark reflective floor.',
    dimensions: '4:5 MASTER (3840 x 4800)',
    ownership: 'EXCLUSIVE / 01 OF 01',
    image: '/media/photography/light-art/light-art-vortex.jpg',
    spatial: { left: '65.3%', top: '37.1%', width: '4.9%', height: '18.6%', lockYaw: -8, lockPanX: -60 }
  },
  {
    id: 'hz-12',
    index: 12,
    format: '16:9',
    title: 'CHROMATIC // SPECTRUM',
    lightSource: 'MULTISPECTRAL DIODE MATRIX',
    exposureDuration: '20.0s EXTENDED',
    apertureIso: 'F/8.0 @ ISO 50',
    chromaSpectrum: 'AMBER 590nm // VIOLET ACCENT',
    philosophy: 'Controlled vertical light bars suspended in strict horizontal alignment.',
    dimensions: '16:9 CINEMATIC (4800 x 2700)',
    ownership: 'EXCLUSIVE / 01 OF 01',
    image: '/media/photography/light-art/light-art-hyper.jpg',
    spatial: { left: '71.3%', top: '36.9%', width: '4.9%', height: '18.8%', lockYaw: -13, lockPanX: -100 }
  },
  {
    id: 'hz-13',
    index: 13,
    format: '16:9',
    title: 'SPEED // GRID',
    lightSource: 'VEHICULAR TELEMETRY HEADLIGHTS',
    exposureDuration: '10.0s SPEED SWEEP',
    apertureIso: 'F/6.3 @ ISO 200',
    chromaSpectrum: 'WARM HALOGEN 3000K',
    philosophy: 'Panning trajectory cutting horizontally across the wide viewing angle.',
    dimensions: '16:9 CINEMATIC (4800 x 2700)',
    ownership: 'EXCLUSIVE / 01 OF 01',
    image: '/media/photography/street/race-panning.jpg',
    spatial: { left: '77.3%', top: '36.6%', width: '5.0%', height: '19.0%', lockYaw: -19, lockPanX: -150 }
  },
  {
    id: 'hz-14',
    index: 14,
    format: '1:1',
    title: 'ORBITAL // KINETIC',
    lightSource: 'DUAL AXIS ROTATING WAND',
    exposureDuration: '22.0s CONTINUOUS',
    apertureIso: 'F/10.0 @ ISO 100',
    chromaSpectrum: 'AMBER 605nm // CYAN HIGHLIGHT',
    philosophy: 'Circular light loop mirroring the curvature of the vault wall.',
    dimensions: '1:1 SQUARE (4000 x 4000)',
    ownership: 'EXCLUSIVE / 01 OF 01',
    image: '/media/photography/light-art/light-art-velocity.jpg',
    spatial: { left: '83.4%', top: '36.3%', width: '5.1%', height: '19.2%', lockYaw: -26, lockPanX: -210 }
  },
  {
    id: 'hz-15',
    index: 15,
    format: '4:5',
    title: 'STEEL // SYMPHONY',
    lightSource: 'PYROTECHNIC WIRE WOOL SPRAY',
    exposureDuration: '15.0s CENTRIFUGAL ARC',
    apertureIso: 'F/9.0 @ ISO 100',
    chromaSpectrum: 'FIERY AMBER 600nm',
    philosophy: 'Dynamic spark shower illuminating industrial steel arches with golden light trails.',
    dimensions: '4:5 MASTER (3840 x 4800)',
    ownership: 'EXCLUSIVE / 01 OF 01',
    image: '/media/photography/light-art/light-art-vortex.jpg',
    spatial: { left: '89.6%', top: '36.0%', width: '5.2%', height: '19.4%', lockYaw: -33, lockPanX: -270 }
  }
];

export const OpticsLightArtSpiral: React.FC<OpticsLightArtSpiralProps> = ({
  photos,
  onBackToGateway,
  mouseOffset,
  onOpenStudioForFrame
}) => {
  const [selectedArtwork, setSelectedArtwork] = useState<HorizonArtwork | null>(null);
  const [hoveredWork, setHoveredWork] = useState<HorizonArtwork | null>(null);
  const [isFullScreenModal, setIsFullScreenModal] = useState(false);
  const [showRosterDrawer, setShowRosterDrawer] = useState(false);

  // Strictly Grounded Horizontal Camera Panning (Zero Awkward Vertical Tilting)
  const [yaw, setYaw] = useState<number>(0);
  const [panX, setPanX] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1);

  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });

  // 1. Filter for Light Art category photos (including any custom uploads)
  const lightArtPhotos = React.useMemo(() => {
    return (photos || []).filter(p => p.category === 'light-art');
  }, [photos]);

  // 2. Dynamically bind Light Art photos to the 15 panoramic horizon frames
  const displayedWorks: HorizonArtwork[] = React.useMemo(() => {
    return DEFAULT_HORIZON_WORKS.map((defaultWork, index) => {
      // 1. Try finding explicitly bound photo for this frame
      const boundPhoto = lightArtPhotos.find(p =>
        p.frameId === defaultWork.id ||
        p.targetFrameIndex === index ||
        p.id === `photo-light-art-${defaultWork.id}` ||
        p.id === defaultWork.id
      );

      // A photo is custom if it has a custom ID or is explicitly bound as custom
      const isCustom = Boolean(
        boundPhoto && (
          boundPhoto.isCustom ||
          boundPhoto.id.startsWith('custom-') ||
          boundPhoto.id.startsWith('photo-custom-')
        )
      );

      const photo = boundPhoto || defaultWork;
      const format: '4:5' | '16:9' | '1:1' = 
        ('aspectRatio' in photo && (photo.aspectRatio === '9:16' || photo.aspectRatio === '4:5')) ? '4:5' :
        ('aspectRatio' in photo && photo.aspectRatio === '1:1') ? '1:1' : defaultWork.format;

      return {
        id: photo.id,
        index: index + 1,
        format,
        title: photo.title || defaultWork.title,
        lightSource: ('optics' in photo && photo.optics?.body) ? `${photo.optics.body} // ${photo.optics.lens || 'LIGHT RIG'}` : defaultWork.lightSource,
        exposureDuration: ('optics' in photo && photo.optics?.shutter) ? `${photo.optics.shutter} EXPOSURE` : defaultWork.exposureDuration,
        apertureIso: ('optics' in photo && photo.optics?.aperture) ? `${photo.optics.aperture} @ ISO ${photo.optics?.iso || 100}` : defaultWork.apertureIso,
        chromaSpectrum: 'WARM AMBER 590nm // SODIUM FLUX',
        philosophy: ('story' in photo && photo.story) ? photo.story : defaultWork.philosophy,
        dimensions: ('aspectRatio' in photo && photo.aspectRatio) ? `${photo.aspectRatio} MASTER` : defaultWork.dimensions,
        ownership: ('ownership' in photo && photo.ownership) ? photo.ownership : defaultWork.ownership,
        image: photo.image,
        spatial: defaultWork.spatial,
        isCustom
      };
    });
  }, [lightArtPhotos]);

  // Prev / Next artwork navigation while inspecting or in theater mode
  const handlePrevArtwork = useCallback(() => {
    if (!selectedArtwork) return;
    const currentIndex = displayedWorks.findIndex(w => w.id === selectedArtwork.id || w.index === selectedArtwork.index);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : displayedWorks.length - 1;
    const prevWork = displayedWorks[prevIndex];
    if (prevWork) {
      audioEngine.playClickSFX();
      setSelectedArtwork(prevWork);
      setYaw(prevWork.spatial.lockYaw);
      setPanX(prevWork.spatial.lockPanX);
      setZoom(1.45);
    }
  }, [selectedArtwork, displayedWorks]);

  const handleNextArtwork = useCallback(() => {
    if (!selectedArtwork) return;
    const currentIndex = displayedWorks.findIndex(w => w.id === selectedArtwork.id || w.index === selectedArtwork.index);
    const nextIndex = currentIndex < displayedWorks.length - 1 ? currentIndex + 1 : 0;
    const nextWork = displayedWorks[nextIndex];
    if (nextWork) {
      audioEngine.playClickSFX();
      setSelectedArtwork(nextWork);
      setYaw(nextWork.spatial.lockYaw);
      setPanX(nextWork.spatial.lockPanX);
      setZoom(1.45);
    }
  }, [selectedArtwork, displayedWorks]);

  // Keyboard navigation & ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showRosterDrawer) {
          setShowRosterDrawer(false);
        } else if (isFullScreenModal) {
          setIsFullScreenModal(false);
        } else if (selectedArtwork) {
          handleCloseInspector();
        } else {
          onBackToGateway();
        }
      } else if (e.key === 'ArrowLeft') {
        if (selectedArtwork) {
          e.preventDefault();
          handlePrevArtwork();
        } else {
          setYaw(prev => prev + 10);
        }
      } else if (e.key === 'ArrowRight') {
        if (selectedArtwork) {
          e.preventDefault();
          handleNextArtwork();
        } else {
          setYaw(prev => prev - 10);
        }
      } else if (e.key === 'ArrowUp') {
        setZoom(prev => Math.min(1.7, prev + 0.2));
      } else if (e.key === 'ArrowDown') {
        setZoom(prev => Math.max(1, prev - 0.2));
      } else if (e.key.toLowerCase() === 'r' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        setShowRosterDrawer(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedArtwork, isFullScreenModal, showRosterDrawer, handlePrevArtwork, handleNextArtwork]);

  // Drag to pan smoothly left/right along the Horizon Ribbon
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, .pointer-events-auto')) return;
    isDraggingRef.current = true;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - lastMouseRef.current.x;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };

    // Smooth horizontal tracking (keeping horizon flat and grounded)
    setYaw(prev => Math.max(-50, Math.min(50, prev + deltaX * 0.18)));
  }, []);

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleResetOverview = () => {
    audioEngine.playGlideSFX();
    setYaw(0);
    setPanX(0);
    setZoom(1);
  };

  // Selecting any artwork locks smoothly onto that frame in the horizon ribbon
  const handleArtworkClick = (work: HorizonArtwork) => {
    audioEngine.playLockOnSFX();
    setSelectedArtwork(work);
    setYaw(work.spatial.lockYaw);
    setPanX(work.spatial.lockPanX);
    setZoom(1.45);
  };

  // Cleanly returns to the flat, unbent gallery overview
  const handleCloseInspector = () => {
    audioEngine.playGlideSFX();
    setSelectedArtwork(null);
    setZoom(1);
    setPanX(0);
    setYaw(0);
  };

  const handleShare = (work: HorizonArtwork) => {
    audioEngine.playClickSFX();
    if (navigator.share) {
      navigator.share({
        title: work.title,
        text: `${work.title} — Light Art Exposure Recon by Olawale / The Vault`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Light Art Telemetry Link copied to clipboard!');
    }
  };


  // Strictly Grounded Horizontal Camera Panning - keeping horizon flat and 100% aligned
  const currentYaw = yaw;

  return (
    <div 
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="relative w-full h-full overflow-hidden select-none bg-[#07090C] cursor-grab active:cursor-grabbing flex items-center justify-center font-sans"
    >
      {/* ======================================================== */}
      {/* 3D SPATIAL HORIZON GRID VIEWPORT (LOCKED 1376x768 STAGE) */}
      {/* ======================================================== */}
      <div 
        className="relative flex-shrink-0 transition-transform duration-500 ease-out pointer-events-none"
        style={{
          width: 'max(100vw, calc(100vh * (1376 / 768)))',
          height: 'max(100vh, calc(100vw * (768 / 1376)))',
          aspectRatio: '1376 / 768',
          transform: `perspective(1000px) rotateY(${currentYaw}deg) scale(${zoom}) translateX(${panX}px)`,
          transformOrigin: '50% 50%'
        }}
      >
        {/* Symmetrical Minimalist Horizon Grid Backdrop */}
        <img 
          src="/media/vault-rooms/optics_light_art_clean.jpg"
          alt="Optics Light Art Horizon"
          draggable={false}
          className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
          style={{ filter: 'contrast(1.06) brightness(1.02)' }}
        />

        {/* Soft Amber Floor Guidelines & Subtle Reflection Aura */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#07090C]/20 to-[#07090C]/60 pointer-events-none" />

        {/* ======================================================== */}
        {/* SINGLE FAINT CIRCULAR NAVIGATIONAL RING (CENTER FLOOR) */}
        {/* ======================================================== */}
        <div
          onClick={handleResetOverview}
          title="Reset to Horizon Overview"
          className="absolute z-20 cursor-pointer pointer-events-auto rounded-full group transition-transform hover:scale-105"
          style={{
            left: '46.5%',
            top: '80.0%',
            width: '7.0%',
            height: '4.5%'
          }}
        >
          <div className="w-full h-full rounded-full border border-[#FF6B1A]/40 group-hover:border-[#FF6B1A] group-hover:bg-[#FF6B1A]/10 group-hover:shadow-[0_0_25px_rgba(255,107,26,0.5)] transition-all flex items-center justify-center">
            <div className="w-2.5 h-1.5 rounded-full bg-[#FF6B1A]/60 group-hover:bg-[#FF6B1A] transition-all" />
          </div>
        </div>

        {/* ======================================================== */}
        {/* HORIZON RIBBON: SINGLE HORIZONTAL CURVED BAND OF FRAMES */}
        {/* ======================================================== */}
        <div className="absolute inset-0 pointer-events-auto">
          {displayedWorks.map((work) => {
            const isHovered = hoveredWork?.id === work.id;
            const isSelected = selectedArtwork?.id === work.id;

            return (
              <div
                key={work.id}
                onClick={() => handleArtworkClick(work)}
                onMouseEnter={() => {
                  setHoveredWork(work);
                  audioEngine.playClickSFX();
                }}
                onMouseLeave={() => setHoveredWork(null)}
                title={`Inspect Horizon Frame // ${work.title}`}
                className="absolute cursor-pointer transition-all duration-300 group rounded-[3px]"
                style={{
                  left: work.spatial.left,
                  top: work.spatial.top,
                  width: work.spatial.width,
                  height: work.spatial.height
                }}
              >
                {/* Visual Artwork Frame Box: Fully embedded into physical gallery niche on clean wall */}
                <div 
                  className={`relative w-full h-full rounded-md overflow-hidden bg-slate-950/90 transition-all duration-300 ${
                    isSelected
                      ? 'border-2 border-[#FFA14A] shadow-[0_0_28px_rgba(255,161,74,0.95),inset_0_0_12px_rgba(255,161,74,0.35)] scale-105 z-30'
                      : isHovered
                        ? 'border-2 border-[#FF6B1A] shadow-[0_0_20px_rgba(255,107,26,0.85),inset_0_0_8px_rgba(255,107,26,0.2)] scale-105 z-20'
                        : 'border border-[#FF6B1A]/40 shadow-[0_4px_16px_rgba(0,0,0,0.9),0_0_10px_rgba(255,107,26,0.2)] hover:border-[#FF6B1A]/80'
                  }`}
                >
                  <img
                    src={work.image}
                    alt={work.title}
                    draggable={false}
                    className="w-full h-full object-cover select-none transition-transform duration-300 group-hover:scale-103"
                  />
                  {/* Subtle Inner Bevel Depth */}
                  <div className="absolute inset-0 shadow-[inset_0_1px_4px_rgba(0,0,0,0.8)] pointer-events-none" />

                  {/* Frame ID Tag */}
                  <div className="absolute top-1 left-1 z-10 px-1 py-0.5 rounded bg-black/75 backdrop-blur-xs border border-white/10 text-white/90 font-mono-hud text-[6px] font-bold tracking-wider pointer-events-none">
                    #{String(work.index).padStart(2, '0')}
                  </div>

                  {/* LIVE Badge for Custom Uploads */}
                  {work.isCustom && (
                    <div className="absolute top-1 right-1 z-10 px-1 py-0.5 rounded bg-[#FF6B1A] text-slate-950 font-mono-hud text-[6px] font-black tracking-wider uppercase shadow-[0_0_8px_rgba(255,107,26,0.8)] pointer-events-none">
                      LIVE
                    </div>
                  )}
                </div>

                {/* Corner Reticle Brackets on Hover or Selection */}
                {(isHovered || isSelected) && (
                  <>
                    <div className="absolute -top-0.5 -left-0.5 w-1.5 h-1.5 border-t-2 border-l-2 border-[#FFA14A] pointer-events-none" />
                    <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 border-t-2 border-r-2 border-[#FFA14A] pointer-events-none" />
                    <div className="absolute -bottom-0.5 -left-0.5 w-1.5 h-1.5 border-b-2 border-l-2 border-[#FFA14A] pointer-events-none" />
                    <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 border-b-2 border-r-2 border-[#FFA14A] pointer-events-none" />
                  </>
                )}

                {/* Hover Tooltip (Clean, Minimalist) */}
                {isHovered && !selectedArtwork && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-40 whitespace-nowrap bg-[#07090C]/95 px-2.5 py-0.5 rounded border border-[#FF6B1A] font-mono-hud text-[8px] text-[#FFA14A] font-bold shadow-[0_0_15px_rgba(255,107,26,0.5)] pointer-events-none animate-fade-in flex items-center gap-1.5">
                    <span>#{work.index < 10 ? `0${work.index}` : work.index} // {work.title}</span>
                    {work.isCustom && (
                      <span className="bg-[#FF6B1A] text-slate-950 px-1 rounded text-[7px] font-black">LIVE</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* ======================================================== */}
      {/* MINIMALIST HUD OVERLAYS (CONFINED TO SCREEN BORDERS) */}
      {/* ======================================================== */}
      

      {/* Bottom Center: INTERACT WITH TRAILS // CLICK TO ENTER */}
      <div className="absolute bottom-[7.5%] left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center z-10">
        <span className="font-mono-hud text-xs md:text-sm tracking-[0.25em] text-[#FF6B1A] uppercase drop-shadow-[0_0_12px_rgba(255,107,26,0.6)] animate-pulse">
          INTERACT WITH TRAILS // CLICK TO ENTER
        </span>
      </div>

      {/* Bottom Horizontal Camera Navigation (Turn Left/Right & Zoom) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 p-1.5 rounded-full bg-[#07090C]/90 backdrop-blur-md border border-slate-800 shadow-2xl pointer-events-auto">
        <button
          onClick={() => setYaw(prev => prev + 15)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full font-mono-hud text-[10px] text-slate-300 hover:text-white hover:bg-white/10 transition-all"
          title="Pan Left Along Horizon Ribbon"
        >
          <ChevronLeft className="w-3.5 h-3.5 text-[#FF6B1A]" />
          <span>PAN LEFT</span>
        </button>

        <button
          onClick={handleResetOverview}
          className="p-1.5 rounded-full font-mono-hud text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          title="Reset Horizon View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setZoom(prev => Math.min(1.6, prev + 0.2))}
          className="p-1.5 rounded-full font-mono-hud text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <button
          disabled={zoom <= 1}
          onClick={() => setZoom(prev => Math.max(1, prev - 0.2))}
          className={`p-1.5 rounded-full font-mono-hud transition-all ${
            zoom > 1 ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-700 cursor-not-allowed'
          }`}
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setYaw(prev => prev - 15)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full font-mono-hud text-[10px] text-slate-300 hover:text-white hover:bg-white/10 transition-all"
          title="Pan Right Along Horizon Ribbon"
        >
          <span>PAN RIGHT</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#FF6B1A]" />
        </button>

        <div className="w-[1px] h-4 bg-slate-800 my-auto" />

        <button
          onClick={() => {
            audioEngine.playClickSFX();
            setShowRosterDrawer(prev => !prev);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono-hud text-[10px] font-bold transition-all ${
            showRosterDrawer 
              ? 'bg-[#FF6B1A] text-slate-950 shadow-[0_0_15px_rgba(255,107,26,0.7)]' 
              : 'text-[#FFA14A] bg-[#FF6B1A]/10 border border-[#FF6B1A]/40 hover:bg-[#FF6B1A]/20'
          }`}
          title="Toggle Light Art Exhibits Drawer [R]"
        >
          <Layers className="w-3.5 h-3.5 text-current" />
          <span>EXHIBITS ({lightArtPhotos.length || DEFAULT_HORIZON_WORKS.length})</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* SIMPLIFIED POP-CARD SELECTION (`CAMERA 01 // LIGHT ART INSPECTION`) */}
      {/* ======================================================== */}
      {selectedArtwork && !isFullScreenModal && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseInspector();
            }
          }}
          className="fixed inset-0 z-50 bg-[#07090C]/80 backdrop-blur-sm flex items-center justify-end p-4 md:p-8 animate-fade-in pointer-events-auto"
        >
          {/* Prominent Left Floating Navigation Arrow */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrevArtwork();
            }}
            className="fixed left-6 top-1/2 -translate-y-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-[#07090C]/90 hover:bg-[#FF6B1A] text-[#FFA14A] hover:text-slate-950 border-2 border-[#FF6B1A]/80 shadow-[0_0_25px_rgba(255,107,26,0.6)] transition-all cursor-pointer group pointer-events-auto"
            title="Previous Exhibit [← / Arrow Left]"
          >
            <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            <span className="font-mono-hud text-xs font-bold tracking-wider hidden sm:inline">PREV EXHIBIT</span>
          </button>
          
          <div className="relative w-full max-w-4xl flex flex-col md:flex-row items-center justify-end gap-6 md:gap-8">
            
            {/* LEFT / CENTER: FOCUSED CINEMATIC ARTWORK WITH DIRECT PREV/NEXT CONTROLS */}
            <div className={`relative w-full md:w-1/2 max-w-sm ${
              selectedArtwork.format === '4:5' ? 'aspect-[4/5]' : selectedArtwork.format === '1:1' ? 'aspect-square' : 'aspect-[16/10]'
            } rounded-2xl overflow-hidden border-2 border-[#FF6B1A] shadow-[0_0_40px_rgba(255,107,26,0.5)] bg-slate-950 transition-all group/art`}>
              <img
                src={selectedArtwork.image}
                alt={selectedArtwork.title}
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                className="w-full h-full object-cover select-none"
              />

              {/* Prev Artwork Floating Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevArtwork();
                }}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-[#07090C]/85 hover:bg-[#FF6B1A] text-[#FFA14A] hover:text-slate-950 border border-[#FF6B1A]/60 shadow-[0_0_15px_rgba(0,0,0,0.9)] transition-all cursor-pointer"
                title="Previous Exhibit [←]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Next Artwork Floating Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextArtwork();
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-[#07090C]/85 hover:bg-[#FF6B1A] text-[#FFA14A] hover:text-slate-950 border border-[#FF6B1A]/60 shadow-[0_0_15px_rgba(0,0,0,0.9)] transition-all cursor-pointer"
                title="Next Exhibit [→]"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Prominently Highlighted X (Cancel) Sign directly on the Frame */}
              <button
                onClick={handleCloseInspector}
                className="absolute top-3 right-3 z-30 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#07090C]/90 border-2 border-[#FF6B1A] text-[#FFA14A] hover:bg-[#FF6B1A] hover:text-slate-950 font-mono-hud text-xs font-bold shadow-[0_0_20px_rgba(255,107,26,0.8)] transition-all cursor-pointer group"
                title="Cancel / Close Frame (ESC)"
              >
                <X className="w-4 h-4 transition-transform group-hover:rotate-90 text-[#FF6B1A] group-hover:text-slate-950" />
                <span>CLOSE</span>
              </button>

              {/* Minimal Reticle Brackets */}
              <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-[#FF6B1A] pointer-events-none" />
              <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-[#FF6B1A] pointer-events-none" />
              <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-[#FF6B1A] pointer-events-none" />
              <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-[#FF6B1A] pointer-events-none" />

              <div className="absolute left-3 top-1/2 -translate-y-1/2 -rotate-90 origin-left font-mono-hud text-[8px] text-[#FFA14A] tracking-widest uppercase pointer-events-none">
                HORIZON GRID // 01 OF 01
              </div>
            </div>

            {/* RIGHT: CLEAN TRANSLUCENT GLASS METADATA POPUP */}
            <div className="relative w-full md:w-1/2 max-w-md rounded-2xl glass-hologram p-6 md:p-7 flex flex-col justify-between border-2 border-[#FF6B1A]/50 shadow-[0_0_45px_rgba(255,107,26,0.3)]">
              
              {/* Header Telemetry */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-hud text-[11px] text-[#FFA14A] tracking-widest uppercase font-bold">
                      CAMERA 01 // LIGHT ART INSPECTION
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {/* Quick Prev / Next in Header */}
                    <button
                      onClick={handlePrevArtwork}
                      className="p-1 rounded bg-slate-800/80 hover:bg-[#FF6B1A] text-slate-300 hover:text-slate-950 border border-slate-700 hover:border-[#FF6B1A] transition-all cursor-pointer"
                      title="Previous Exhibit [←]"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>

                    <span className="font-mono-hud text-[10px] text-[#FFA14A] bg-[#FF6B1A]/10 border border-[#FF6B1A]/30 px-1.5 py-0.5 rounded font-bold">
                      {String(selectedArtwork.index).padStart(2, '0')} / {String(displayedWorks.length).padStart(2, '0')}
                    </span>

                    <button
                      onClick={handleNextArtwork}
                      className="p-1 rounded bg-slate-800/80 hover:bg-[#FF6B1A] text-slate-300 hover:text-slate-950 border border-slate-700 hover:border-[#FF6B1A] transition-all cursor-pointer"
                      title="Next Exhibit [→]"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-1.5 font-mono-hud text-[10px] bg-emerald-950/70 border border-emerald-500/50 text-emerald-400 px-2 py-0.5 rounded font-bold ml-1">
                      <span>{selectedArtwork.ownership}</span>
                    </div>

                    {/* Highlighted Close X button in header */}
                    <button
                      onClick={handleCloseInspector}
                      className="p-1 rounded-full bg-red-950/60 border border-red-500/70 text-red-300 hover:bg-red-600 hover:text-white transition-all shadow-[0_0_12px_rgba(239,68,68,0.5)] cursor-pointer ml-1"
                      title="Close [ESC]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-syne text-xl md:text-2xl font-bold text-white tracking-wider glow-ember-text">
                  {selectedArtwork.title}
                </h3>
                <span className="font-mono-hud text-[10px] text-slate-400 tracking-wider">
                  COORD: 06.45° N, 03.39° E // {selectedArtwork.format} FORMAT
                </span>
              </div>

              {/* Clean Telemetry Parameters */}
              <div className="my-4 p-4 rounded-xl bg-[#07090C]/85 border border-slate-700/60 flex flex-col gap-2">
                <div className="flex items-center justify-between font-mono-hud text-xs border-b border-slate-800 pb-1.5">
                  <span className="text-[#FFA14A] font-bold">LIGHT SOURCE / RIG:</span>
                  <span className="text-white font-semibold text-right text-[11px]">{selectedArtwork.lightSource}</span>
                </div>

                <div className="flex items-center justify-between font-mono-hud text-xs border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400 font-bold">EXPOSURE DURATION:</span>
                  <span className="text-[#FFA14A] font-bold">{selectedArtwork.exposureDuration}</span>
                </div>

                <div className="flex items-center justify-between font-mono-hud text-xs border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400 font-bold">APERTURE &amp; ISO:</span>
                  <span className="text-slate-200">{selectedArtwork.apertureIso}</span>
                </div>

                <div className="flex items-center justify-between font-mono-hud text-xs border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400 font-bold">DIMENSIONS:</span>
                  <span className="text-slate-300">{selectedArtwork.dimensions}</span>
                </div>

                <div className="flex flex-col gap-1 font-mono-hud text-[11px] pt-1">
                  <span className="text-[#FFA14A] font-bold">LIGHT TRAIL PHILOSOPHY:</span>
                  <span className="text-slate-300 leading-relaxed text-[10px]">
                    "{selectedArtwork.philosophy}"
                  </span>
                </div>
              </div>

              {/* Actions Control Deck: Symmetrical & Overflow-Free */}
              <div className="flex flex-col gap-2.5 pt-4 border-t border-slate-800/80">
                {/* Row 1: Primary Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      audioEngine.playClickSFX();
                      setIsFullScreenModal(true);
                    }}
                    className="flex-1 h-10 flex items-center justify-center gap-2 px-3 rounded-lg bg-[#FF6B1A] hover:bg-[#FFA14A] text-slate-950 font-mono-hud text-xs font-bold tracking-wider transition-all shadow-[0_0_15px_rgba(255,107,26,0.5)] cursor-pointer whitespace-nowrap"
                    title="View Full Screen Theater View"
                  >
                    <Maximize2 className="w-4 h-4 shrink-0" />
                    <span>VIEW FULL SCREEN</span>
                  </button>

                  {onOpenStudioForFrame && (
                    <button
                      onClick={() => {
                        audioEngine.playLockOnSFX();
                        onOpenStudioForFrame({
                          category: 'light-art',
                          frameId: selectedArtwork.id,
                          frameIndex: selectedArtwork.index - 1,
                          title: selectedArtwork.title
                        });
                      }}
                      className="flex-1 h-10 flex items-center justify-center gap-1.5 px-3 rounded-lg bg-[#38BDF8]/20 hover:bg-[#38BDF8]/30 border border-[#38BDF8]/60 text-[#38BDF8] hover:text-white font-mono-hud text-xs font-bold transition-all shadow-[0_0_12px_rgba(56,189,248,0.25)] cursor-pointer whitespace-nowrap"
                      title={`Upload or replace photo specifically for Frame ${String(selectedArtwork.index).padStart(2, '0')}`}
                    >
                      <Upload className="w-4 h-4 shrink-0" />
                      <span>UPLOAD TO FRAME {String(selectedArtwork.index).padStart(2, '0')}</span>
                    </button>
                  )}
                </div>

                {/* Row 2: Secondary Controls (Share & Cancel) */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleShare(selectedArtwork)}
                    className="flex-1 h-8 flex items-center justify-center gap-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono-hud text-[11px] font-semibold transition-colors cursor-pointer"
                    title="Share Telemetry"
                  >
                    <Share2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>SHARE</span>
                  </button>

                  <button
                    onClick={handleCloseInspector}
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
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-1.5 rounded-full bg-[#07090C]/95 backdrop-blur-md border border-[#FF6B1A]/60 shadow-[0_0_30px_rgba(0,0,0,0.9)] pointer-events-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrevArtwork();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full font-mono-hud text-xs font-bold bg-white/5 hover:bg-[#FF6B1A] text-slate-200 hover:text-slate-950 transition-all border border-transparent hover:border-[#FF6B1A] cursor-pointer"
              title="Previous Exhibit [← / Arrow Left]"
            >
              <ChevronLeft className="w-4 h-4 text-[#FF6B1A]" />
              <span>PREV EXHIBIT</span>
            </button>

            <div className="px-3.5 py-1.5 font-mono-hud text-xs font-bold text-[#FFA14A] bg-[#FF6B1A]/10 border border-[#FF6B1A]/30 rounded-full">
              FRAME {String(selectedArtwork.index).padStart(2, '0')} / {String(displayedWorks.length).padStart(2, '0')}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNextArtwork();
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
                handleCloseInspector();
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
      {selectedArtwork && isFullScreenModal && (
        <div className="fixed inset-0 z-50 bg-[#07090C]/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 animate-fade-in pointer-events-auto select-none">
          <div className="absolute top-6 left-8 right-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-mono-hud text-xs text-[#FFA14A] font-bold">
                {selectedArtwork.title}
              </span>
              <span className="font-mono-hud text-[10px] text-slate-400">
                {selectedArtwork.dimensions} // {selectedArtwork.exposureDuration}
              </span>
            </div>

            {/* Prominently Highlighted X (Cancel) Button */}
            <button
              onClick={() => setIsFullScreenModal(false)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-950/60 hover:bg-red-600 border-2 border-red-500 text-white font-mono-hud text-xs font-bold shadow-[0_0_20px_rgba(239,68,68,0.7)] transition-all cursor-pointer group"
              title="Close Full Screen [ESC]"
            >
              <X className="w-4 h-4 transition-transform group-hover:rotate-90" />
              <span>[ESC] CLOSE FULL SCREEN</span>
            </button>
          </div>

          <div className="relative max-w-4xl max-h-[82vh] flex items-center justify-center">
            {/* Prev Artwork Full Screen Button */}
            <button
              onClick={handlePrevArtwork}
              className="absolute -left-16 z-30 p-3 rounded-full bg-[#07090C]/90 hover:bg-[#FF6B1A] text-[#FFA14A] hover:text-slate-950 border border-[#FF6B1A]/60 shadow-[0_0_20px_rgba(0,0,0,0.9)] transition-all cursor-pointer hidden md:flex items-center justify-center group"
              title="Previous Exhibit [←]"
            >
              <ChevronLeft className="w-6 h-6 transition-transform group-hover:-translate-x-1" />
            </button>

            <div className="rounded-2xl overflow-hidden border-2 border-[#FF6B1A] shadow-[0_0_60px_rgba(255,107,26,0.6)]">
              <img
                src={selectedArtwork.image}
                alt={selectedArtwork.title}
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                className="w-full h-full object-contain max-h-[82vh] select-none"
              />
            </div>

            {/* Next Artwork Full Screen Button */}
            <button
              onClick={handleNextArtwork}
              className="absolute -right-16 z-30 p-3 rounded-full bg-[#07090C]/90 hover:bg-[#FF6B1A] text-[#FFA14A] hover:text-slate-950 border border-[#FF6B1A]/60 shadow-[0_0_20px_rgba(0,0,0,0.9)] transition-all cursor-pointer hidden md:flex items-center justify-center group"
              title="Next Exhibit [→]"
            >
              <ChevronRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          <div className="absolute bottom-6 font-mono-hud text-xs text-slate-400">
            OWNERSHIP: EXCLUSIVE / 01 OF 01 // PRESS ESC TO RETURN TO HORIZON GRID
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SLIDE-OUT EXHIBITS ROSTER DRAWER */}
      {/* ======================================================== */}
      {showRosterDrawer && (
        <div className="fixed inset-0 z-50 bg-[#07090C]/80 backdrop-blur-md flex justify-end animate-fade-in pointer-events-auto">
          <div 
            onClick={() => setShowRosterDrawer(false)}
            className="flex-1 cursor-pointer"
          />
          <div className="relative w-full max-w-md h-full bg-[#07090C]/95 border-l border-[#FF6B1A]/40 shadow-[-20px_0_50px_rgba(0,0,0,0.8)] flex flex-col p-6 animate-slide-left z-10">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="font-mono-hud text-[10px] text-[#FFA14A] font-bold tracking-widest uppercase block">
                  CHAMBER 01 // EXHIBITS TELEMETRY
                </span>
                <h3 className="font-syne text-lg font-bold text-white tracking-wider glow-ember-text">
                  LIGHT ART ROSTER
                </h3>
              </div>
              <button
                onClick={() => setShowRosterDrawer(false)}
                className="p-1.5 rounded-full bg-slate-900 border border-slate-700 hover:border-[#FF6B1A] text-slate-300 hover:text-white transition-all cursor-pointer"
                title="Close Drawer [ESC]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sub-header / Status */}
            <div className="py-2.5 flex items-center justify-between font-mono-hud text-[10px] text-slate-400">
              <span>{displayedWorks.length} FRAMES BOUND ON WALL</span>
              <span className="text-[#FFA14A]">PRESS ESC TO CLOSE</span>
            </div>

            {/* Scrollable list of artworks */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 my-2">
              {displayedWorks.map((work) => {
                const isSelected = selectedArtwork?.id === work.id;
                return (
                  <div
                    key={work.id}
                    onClick={() => {
                      handleArtworkClick(work);
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
                        src={work.image}
                        alt={work.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {work.isCustom && (
                        <div className="absolute top-0.5 left-0.5 px-1 rounded bg-[#FF6B1A] text-slate-950 font-mono-hud text-[6px] font-black uppercase">
                          LIVE
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono-hud text-[9px] text-[#FFA14A] font-bold">
                          #{work.index < 10 ? `0${work.index}` : work.index}
                        </span>
                        <h4 className="font-mono-hud text-xs font-bold text-white truncate group-hover:text-[#FFA14A] transition-colors">
                          {work.title}
                        </h4>
                      </div>
                      <p className="font-mono-hud text-[9px] text-slate-400 truncate mt-0.5">
                        {work.lightSource}
                      </p>
                      <div className="flex items-center gap-2 mt-1 font-mono-hud text-[8px] text-slate-500">
                        <span>{work.exposureDuration}</span>
                        <span>•</span>
                        <span>{work.dimensions}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Drawer Footer */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between font-mono-hud text-[10px] text-slate-500">
              <span>VAULT RECON // 60FPS</span>
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
        </div>
      )}

    </div>
  );
};
