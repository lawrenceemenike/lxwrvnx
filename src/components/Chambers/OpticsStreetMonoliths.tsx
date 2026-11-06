import React, { useState, useRef, useCallback, useEffect } from 'react';
import { PhotoItem } from '../../types';
import { getPhotoThumbUrl } from '../../utils/photoData50';
import { audioEngine } from '../../utils/audioEngine';
import { 
  ArrowLeft, Share2, X, ChevronLeft, ChevronRight, 
  RotateCcw, Maximize2, Minimize2, ZoomIn, ZoomOut, Layers, Upload
} from 'lucide-react';

interface OpticsStreetMonolithsProps {
  photos: PhotoItem[];
  onBackToGateway: () => void;
  mouseOffset: { x: number; y: number };
  onOpenStudioForFrame?: (target: { category: 'street'; frameId: string; frameIndex: number; title: string }) => void;
}

export interface ConcourseFrame {
  id: string;
  index: number;
  wall: 'left' | 'back' | 'right';
  row: 'upper' | 'lower';
  title: string;
  engine: string;
  stepsCfg: string;
  promptPhilosophy: string;
  seed: string;
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

// 24 Symmetrical Frames Across 3 Walls (Left, Back, Right) in 2 Aligned Tiers
const DEFAULT_CONCOURSE_24_WORKS: ConcourseFrame[] = [
  // ==========================================
  // LEFT WALL (8 Frames: 4 Columns x 2 Tiers)
  // ==========================================
  // Upper Tier
  {
    id: 'frame-L1',
    index: 1,
    wall: 'left',
    row: 'upper',
    title: 'METROPOLIS // ALLEY NOIR',
    engine: 'SONY A7R V // 35MM F/1.4',
    stepsCfg: '50 STEPS // 1/500s @ ISO 100',
    promptPhilosophy: 'High contrast black and white canyon between brutalist brick facades, wet asphalt reflections.',
    seed: '#89412091',
    dimensions: '4:5 MASTER (3840 x 4800)',
    ownership: 'EXCLUSIVE / 01 OF 01',
    image: '/media/photography/street/DSC01516%20(1).jpg',
    spatial: { left: '3.5%', top: '21.5%', width: '7.6%', height: '22.5%', lockYaw: 36, lockPanX: 300 }
  },
  {
    id: 'frame-L2',
    index: 2,
    wall: 'left',
    row: 'upper',
    title: 'SILHOUETTE // THRESHOLD',
    engine: 'HASSELBLAD X2D // 55MM',
    stepsCfg: '45 STEPS // 1/250s @ ISO 200',
    promptPhilosophy: 'Solitary figure bathed in morning sunlight beam slicing through concrete canyons.',
    seed: '#89412092',
    dimensions: '4:5 MASTER (3840 x 4800)',
    ownership: 'EXCLUSIVE / 01 OF 01',
    image: '/media/photography/street/DSC01787.jpg',
    spatial: { left: '11.8%', top: '26.8%', width: '5.3%', height: '18.5%', lockYaw: 28, lockPanX: 230 }
  },
  {
    id: 'frame-L3',
    index: 3,
    wall: 'left',
    row: 'upper',
    title: 'KINETIC // APEX',
    engine: 'SONY ALPHA 1 // 24-70MM GM',
    stepsCfg: '60 STEPS // 1/1000s @ ISO 100',
    promptPhilosophy: 'Endurance racing machine attacking the wet curb with spray under brooding overcast sky.',
    seed: '#89412093',
    dimensions: '4:5 MASTER (3840 x 4800)',
    ownership: 'EXCLUSIVE / 01 OF 01',
    image: '/media/photography/street/DSC02080.jpg',
    spatial: { left: '17.5%', top: '30.8%', width: '4.2%', height: '15.5%', lockYaw: 22, lockPanX: 180 }
  },
  {
    id: 'frame-L4',
    index: 4,
    wall: 'left',
    row: 'upper',
    title: 'ASPHALT // MONSOON',
    engine: 'LEICA Q3 // 28MM SUMMILUX',
    stepsCfg: '55 STEPS // 1/400s @ ISO 400',
    promptPhilosophy: 'Reflective standing rainwater mirroring subterranean transit infrastructure.',
    seed: '#89412094',
    dimensions: '4:5 MASTER (3840 x 4800)',
    ownership: 'EXCLUSIVE / 01 OF 01',
    image: '/media/photography/street/DSC02404.jpg',
    spatial: { left: '22.0%', top: '33.8%', width: '3.3%', height: '13.5%', lockYaw: 16, lockPanX: 130 }
  },
  // Lower Tier
  {
    id: 'frame-L5',
    index: 5,
    wall: 'left',
    row: 'lower',
    title: 'PROJECT // SPECTER',
    engine: 'LEICA M11 // 50MM NOCTILUX',
    stepsCfg: '50 STEPS // 1/320s @ ISO 160',
    promptPhilosophy: 'Dense industrial haze, intersecting architectural geometrics, low-angle perspective.',
    seed: '#89412095',
    dimensions: '4:5 MASTER (3840 x 4800)',
    ownership: 'EXCLUSIVE / 01 OF 01',
    image: '/media/photography/street/DSC03002.jpg',
    spatial: { left: '3.5%', top: '46.5%', width: '7.6%', height: '22.5%', lockYaw: 36, lockPanX: 300 }
  },
  {
    id: 'frame-L6',
    index: 6,
    wall: 'left',
    row: 'lower',
    title: 'SOLITARY // CADENCE',
    engine: 'SONY ALPHA 1 // 35MM GM',
    stepsCfg: '45 STEPS // 1/500s @ ISO 100',
    promptPhilosophy: 'A single lone wanderer at the edge of the reflective wet starting grid.',
    seed: '#89412096',
    dimensions: '4:5 MASTER (3840 x 4800)',
    ownership: 'EXCLUSIVE / 01 OF 01',
    image: '/media/photography/street/DSC03045.jpg',
    spatial: { left: '11.8%', top: '47.8%', width: '5.3%', height: '18.5%', lockYaw: 28, lockPanX: 230 }
  },
  {
    id: 'frame-L7',
    index: 7,
    wall: 'left',
    row: 'lower',
    title: 'VELOCE // DRIFT',
    engine: 'CANON R5 // 70-200MM',
    stepsCfg: '50 STEPS // 1/60s @ ISO 50',
    promptPhilosophy: 'Panning exposure capturing continuous motion blur across high-speed tarmac.',
    seed: '#89412097',
    dimensions: '4:5 MASTER (3840 x 4800)',
    ownership: 'EXCLUSIVE / 01 OF 01',
    image: '/media/photography/street/DSC03493%20(1).jpg',
    spatial: { left: '17.5%', top: '48.8%', width: '4.2%', height: '15.5%', lockYaw: 22, lockPanX: 180 }
  },
  {
    id: 'frame-L8',
    index: 8,
    wall: 'left',
    row: 'lower',
    title: 'PORTAL // PASSAGE',
    engine: 'LEICA M11 // 28MM WIDE',
    stepsCfg: '40 STEPS // 1/250s @ ISO 200',
    promptPhilosophy: 'Vertical architectural symmetry meeting polished concrete reflections.',
    seed: '#89412098',
    dimensions: '4:5 MASTER (3840 x 4800)',
    ownership: 'EXCLUSIVE / 01 OF 01',
    image: '/media/photography/street/DSC03493.jpg',
    spatial: { left: '22.0%', top: '49.5%', width: '3.3%', height: '13.5%', lockYaw: 16, lockPanX: 130 }
  },

  // ==========================================
  // BACK WALL (8 Frames Flanking Central Arch)
  // ==========================================
  // Left Flank of Central Gateway
  {
    id: 'frame-B1',
    index: 9,
    wall: 'back',
    row: 'upper',
    title: 'SHADOW // ARCHITECT',
    engine: 'LEICA Q3 // 28MM',
    stepsCfg: '48 STEPS // 1/640s @ ISO 100',
    promptPhilosophy: 'Solitary black coat silhouette walking through deep stone canyon shadows.',
    seed: '#89412099',
    dimensions: '4:5 MASTER (3840 x 4800)',
    ownership: 'EXCLUSIVE / 01 OF 01',
    image: '/media/photography/street/DSC03597.jpg',
    spatial: { left: '28.0%', top: '32.0%', width: '6.0%', height: '16.5%', lockYaw: 8, lockPanX: 70 }
  },
  {
    id: 'frame-B2',
    index: 10,
    wall: 'back',
    row: 'upper',
    title: 'TITANIUM // RUNWAY',
    engine: 'SONY A1 // 50MM F/1.2',
    stepsCfg: '55 STEPS // 1/800s @ ISO 100',
    promptPhilosophy: 'Rain-soaked asphalt runway reflecting overcast sky tension.',
    seed: '#89412100',
    dimensions: '4:5 MASTER (3840 x 4800)',
    ownership: 'EXCLUSIVE / 01 OF 01',
    image: '/media/photography/street/DSC03657.jpg',
    spatial: { left: '36.5%', top: '32.0%', width: '6.0%', height: '16.5%', lockYaw: 4, lockPanX: 30 }
  },
  {
    id: 'frame-B3',
    index: 11,
    wall: 'back',
    row: 'lower',
    title: 'APEX // PREDATOR',
    engine: 'LEICA M11 // 50MM NOCTILUX',
    stepsCfg: '50 STEPS // 1/1000s @ ISO 100',
    promptPhilosophy: 'Aerodynamic carbon contour lines under intense paddock floodlights.',
    seed: '#89412101',
    dimensions: '4:5 MASTER (3840 x 4800)',
    ownership: 'EXCLUSIVE / 01 OF 01',
    image: '/media/photography/street/DSC04039.jpg',
    spatial: { left: '28.0%', top: '50.5%', width: '6.0%', height: '16.5%', lockYaw: 8, lockPanX: 70 }
  },
  {
    id: 'frame-B4',
    index: 12,
    wall: 'back',
    row: 'lower',
    title: 'ZENITH // CONTOUR',
    engine: 'HASSELBLAD X2D // 100MM',
    stepsCfg: '45 STEPS // 1/320s @ ISO 64',
    promptPhilosophy: 'Subtle warm tungsten rim lighting cutting across portrait geometry.',
    seed: '#89412102',
    dimensions: '4:5 MASTER (3840 x 4800)',
    ownership: 'EXCLUSIVE / 01 OF 01',
    image: '/media/photography/street/DSC04338.jpg',
    spatial: { left: '36.5%', top: '50.5%', width: '6.0%', height: '16.5%', lockYaw: 4, lockPanX: 30 }
  },

  // Right Flank of Central Gateway
  {
    id: 'frame-B5',
    index: 13,
    wall: 'back',
    row: 'upper',
    title: 'CONCRETE // CAVERN',
    engine: 'LEICA M11 // 35MM SUMMILUX',
    stepsCfg: '50 STEPS // 1/400s @ ISO 200',
    promptPhilosophy: 'Subterranean transit avenues drenched in ambient sodium reflections.',
    seed: '#89412103',
    dimensions: '4:5 MASTER (3840 x 4800)',
    ownership: 'EXCLUSIVE / 01 OF 01',
    image: '/media/photography/street/DSC04395.jpg',
    spatial: { left: '57.5%', top: '32.0%', width: '6.0%', height: '16.5%', lockYaw: -4, lockPanX: -30 }
  },
  {
    id: 'frame-B6',
    index: 14,
    wall: 'back',
    row: 'upper',
    title: 'AURA // REFLECTION',
    engine: 'SONY ALPHA 1 // 85MM GM',
    stepsCfg: '52 STEPS // 1/500s @ ISO 100',
    promptPhilosophy: 'Warm portrait lighting projected cleanly against a matte slate void.',
    seed: '#89412104',
    dimensions: '4:5 MASTER (3840 x 4800)',
    ownership: 'EXCLUSIVE / 01 OF 01',
    image: '/media/photography/street/DSC04422.jpg',
    spatial: { left: '66.0%', top: '32.0%', width: '6.0%', height: '16.5%', lockYaw: -8, lockPanX: -70 }
  },
  {
    id: 'frame-B7',
    index: 15,
    wall: 'back',
    row: 'lower',
    title: 'TRACK // CONVERGENCE',
    engine: 'NIKON Z9 // 70-200MM',
    stepsCfg: '60 STEPS // 1/640s @ ISO 100',
    promptPhilosophy: 'Paddock pit lane surface with standing water and tire track geometry.',
    seed: '#89412105',
    dimensions: '4:5 MASTER (3840 x 4800)',
    ownership: 'EXCLUSIVE / 01 OF 01',
    image: '/media/photography/street/DSC04609.jpg',
    spatial: { left: '57.5%', top: '50.5%', width: '6.0%', height: '16.5%', lockYaw: -4, lockPanX: -30 }
  },
  {
    id: 'frame-B8',
    index: 16,
    wall: 'back',
    row: 'lower',
    title: 'OPTIC // FOCUS',
    engine: 'LEICA M11 // 50MM APO',
    stepsCfg: '45 STEPS // 1/250s @ ISO 100',
    promptPhilosophy: 'Linear speed corridor disappearing into infinite vanishing point.',
    seed: '#89412106',
    dimensions: '4:5 MASTER (3840 x 4800)',
    ownership: 'EXCLUSIVE / 01 OF 01',
    image: '/media/photography/street/DSC04652.jpg',
    spatial: { left: '66.0%', top: '50.5%', width: '6.0%', height: '16.5%', lockYaw: -8, lockPanX: -70 }
  },

  // ==========================================
  // RIGHT WALL (8 Frames: 4 Columns x 2 Tiers)
  // ==========================================
  // Upper Tier
  {
    id: 'frame-R1',
    index: 17,
    wall: 'right',
    row: 'upper',
    title: 'NOCTURNE // DRIFT',
    engine: 'LEICA Q3 // 28MM',
    stepsCfg: '48 STEPS // 1/200s @ ISO 400',
    promptPhilosophy: 'Late night expressway brutalism with warm sodium vapor glow.',
    seed: '#89412107',
    dimensions: '4:5 MASTER (3840 x 4800)',
    ownership: 'EXCLUSIVE / 01 OF 01',
    image: '/media/photography/street/DSC04694.jpg',
    spatial: { left: '74.7%', top: '33.8%', width: '3.3%', height: '13.5%', lockYaw: -16, lockPanX: -130 }
  },
  {
    id: 'frame-R2',
    index: 18,
    wall: 'right',
    row: 'upper',
    title: 'STEEL // SYMPHONY',
    engine: 'HASSELBLAD X2D // 38MM',
    stepsCfg: '50 STEPS // 1/400s @ ISO 100',
    promptPhilosophy: 'Sharp architectural vertical lines contrasting human scale.',
    seed: '#89412108',
    dimensions: '4:5 MASTER (3840 x 4800)',
    ownership: 'EXCLUSIVE / 01 OF 01',
    image: '/media/photography/street/DSC04701.jpg',
    spatial: { left: '78.3%', top: '30.8%', width: '4.2%', height: '15.5%', lockYaw: -22, lockPanX: -180 }
  },
  {
    id: 'frame-R3',
    index: 19,
    wall: 'right',
    row: 'upper',
    title: 'TEMPLE // DRIFT',
    engine: 'SONY ALPHA 1 // 50MM GM',
    stepsCfg: '55 STEPS // 1/800s @ ISO 160',
    promptPhilosophy: 'Solitary silhouette in cobblestone corridor during twilight.',
    seed: '#89412109',
    dimensions: '4:5 MASTER (3840 x 4800)',
    ownership: 'EXCLUSIVE / 01 OF 01',
    image: '/media/photography/street/DSC04711.jpg',
    spatial: { left: '82.9%', top: '26.8%', width: '5.3%', height: '18.5%', lockYaw: -28, lockPanX: -230 }
  },
  {
    id: 'frame-R4',
    index: 20,
    wall: 'right',
    row: 'upper',
    title: 'RADIAL // DISPERSION',
    engine: 'LEICA M11 // 35MM SUMMICRON',
    stepsCfg: '60 STEPS // 1/1000s @ ISO 100',
    promptPhilosophy: 'Endurance racing contour lines slicing through rain-swept circuit.',
    seed: '#89412110',
    dimensions: '4:5 MASTER (3840 x 4800)',
    ownership: 'EXCLUSIVE / 01 OF 01',
    image: '/media/photography/street/DSC04766.jpg',
    spatial: { left: '88.9%', top: '21.5%', width: '7.6%', height: '22.5%', lockYaw: -36, lockPanX: -300 }
  },
  // Lower Tier
  {
    id: 'frame-R5',
    index: 21,
    wall: 'right',
    row: 'lower',
    title: 'OBSIDIAN // PULSE',
    engine: 'SONY A1 // 24MM GM',
    stepsCfg: '45 STEPS // 1/160s @ ISO 320',
    promptPhilosophy: 'High contrast wet asphalt capturing the mirror essence of surrounding architecture.',
    seed: '#89412111',
    dimensions: '4:5 MASTER (3840 x 4800)',
    ownership: 'EXCLUSIVE / 01 OF 01',
    image: '/media/photography/street/DSC04870.jpg',
    spatial: { left: '74.7%', top: '49.5%', width: '3.3%', height: '13.5%', lockYaw: -16, lockPanX: -130 }
  },
  {
    id: 'frame-R6',
    index: 22,
    wall: 'right',
    row: 'lower',
    title: 'EQUINOX // APEX',
    engine: 'LEICA Q3 // 28MM',
    stepsCfg: '50 STEPS // 1/320s @ ISO 100',
    promptPhilosophy: 'Reflective rainwater sheeting across starting grid and telemetry beacons.',
    seed: '#89412112',
    dimensions: '4:5 MASTER (3840 x 4800)',
    ownership: 'EXCLUSIVE / 01 OF 01',
    image: '/media/photography/street/DSC04925.jpg',
    spatial: { left: '78.3%', top: '48.8%', width: '4.2%', height: '15.5%', lockYaw: -22, lockPanX: -180 }
  },
  {
    id: 'frame-R7',
    index: 23,
    wall: 'right',
    row: 'lower',
    title: 'GRID // KINETIC',
    engine: 'SONY ALPHA 1 // 70-200MM',
    stepsCfg: '55 STEPS // 1/800s @ ISO 100',
    promptPhilosophy: 'Precision aerodynamic carbon contours under intense floodlights.',
    seed: '#89412113',
    dimensions: '4:5 MASTER (3840 x 4800)',
    ownership: 'EXCLUSIVE / 01 OF 01',
    image: '/media/photography/street/DSC04938.jpg',
    spatial: { left: '82.9%', top: '47.8%', width: '5.3%', height: '18.5%', lockYaw: -28, lockPanX: -230 }
  },
  {
    id: 'frame-R8',
    index: 24,
    wall: 'right',
    row: 'lower',
    title: 'CYBER // HORIZON',
    engine: 'LEICA M11 // 50MM NOCTILUX',
    stepsCfg: '60 STEPS // 1/500s @ ISO 100',
    promptPhilosophy: 'GT endurance machinery attacking wet apex under brooding overcast skies.',
    seed: '#89412114',
    dimensions: '4:5 MASTER (3840 x 4800)',
    ownership: 'EXCLUSIVE / 01 OF 01',
    image: '/media/photography/street/DSC05390.jpg',
    spatial: { left: '88.9%', top: '46.5%', width: '7.6%', height: '22.5%', lockYaw: -36, lockPanX: -300 }
  }
];

export const OpticsStreetMonoliths: React.FC<OpticsStreetMonolithsProps> = ({
  photos,
  onBackToGateway,
  mouseOffset,
  onOpenStudioForFrame
}) => {
  const [selectedArtwork, setSelectedArtwork] = useState<ConcourseFrame | null>(null);
  const [hoveredWork, setHoveredWork] = useState<ConcourseFrame | null>(null);
  const [isFullScreenModal, setIsFullScreenModal] = useState(false);
  const [showRosterDrawer, setShowRosterDrawer] = useState(false);

  // Balanced Horizontal Panning (No Awkward Vertical Tilting)
  const [yaw, setYaw] = useState<number>(0);
  const [panX, setPanX] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1);

  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });

  // Filter for Street category photos (including any user uploads)
  const streetPhotos = React.useMemo(() => {
    return (photos || []).filter(p => p.category === 'street');
  }, [photos]);

  // Bind photos to the 24 concourse frames dynamically
  const displayedWorks: ConcourseFrame[] = React.useMemo(() => {
    return DEFAULT_CONCOURSE_24_WORKS.map((defaultWork, index) => {
      // 1. Try finding explicitly bound photo for this frame
      const boundPhoto = streetPhotos.find(p =>
        p.frameId === defaultWork.id ||
        p.targetFrameIndex === index ||
        p.id === `photo-street-${defaultWork.id}` ||
        p.id === defaultWork.id ||
        p.id === `photo-street-${index + 1}`
      ) || (streetPhotos.length > 0 ? streetPhotos[index % streetPhotos.length] : undefined);

      // A photo is custom if it has a custom ID or is marked as custom
      const isCustom = Boolean(
        boundPhoto && (
          boundPhoto.isCustom ||
          boundPhoto.id.startsWith('custom-') ||
          boundPhoto.id.startsWith('photo-custom-')
        )
      );

      const photo = boundPhoto || defaultWork;

      return {
        ...defaultWork,
        id: photo.id || defaultWork.id,
        index: index + 1,
        title: isCustom ? (photo.title || defaultWork.title) : defaultWork.title,
        engine: ('optics' in photo && photo.optics?.body) ? `${photo.optics.body} // ${photo.optics.lens || '35MM SUMMICRON'}` : defaultWork.engine,
        stepsCfg: ('optics' in photo && photo.optics?.shutter) ? `${photo.optics.shutter} @ ISO ${photo.optics?.iso || 100}` : defaultWork.stepsCfg,
        promptPhilosophy: ('story' in photo && photo.story && isCustom) ? photo.story : defaultWork.promptPhilosophy,
        dimensions: ('aspectRatio' in photo && photo.aspectRatio) ? `${photo.aspectRatio} MASTER` : defaultWork.dimensions,
        ownership: ('ownership' in photo && photo.ownership) ? photo.ownership : defaultWork.ownership,
        image: photo.image || defaultWork.image,
        isCustom
      };
    });
  }, [streetPhotos]);

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
        setZoom(prev => Math.min(1.6, prev + 0.15));
      } else if (e.key === 'ArrowDown') {
        setZoom(prev => Math.max(1, prev - 0.15));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedArtwork, isFullScreenModal, showRosterDrawer, handlePrevArtwork, handleNextArtwork]);

  // Drag to pan smoothly left/right across the 3 walls
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, .pointer-events-auto')) return;
    isDraggingRef.current = true;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - lastMouseRef.current.x;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };

    // Balanced horizontal panning along the flat horizon
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

  // Quick wall snaps
  const handleSnapLeftWall = () => {
    audioEngine.playGlideSFX();
    setYaw(30);
    setPanX(240);
    setZoom(1.35);
  };

  const handleSnapBackWall = () => {
    audioEngine.playGlideSFX();
    setYaw(0);
    setPanX(0);
    setZoom(1.35);
  };

  const handleSnapRightWall = () => {
    audioEngine.playGlideSFX();
    setYaw(-30);
    setPanX(-240);
    setZoom(1.35);
  };

  // Selecting any artwork locks smoothly onto that frame
  const handleArtworkClick = (work: ConcourseFrame) => {
    audioEngine.playLockOnSFX();
    setSelectedArtwork(work);
    setYaw(work.spatial.lockYaw);
    setPanX(work.spatial.lockPanX);
    setZoom(1.45);
  };

  const handleCloseInspector = () => {
    audioEngine.playGlideSFX();
    setSelectedArtwork(null);
    setZoom(1);
    setPanX(0);
    setYaw(0);
  };

  const handleShare = (work: ConcourseFrame) => {
    audioEngine.playClickSFX();
    if (navigator.share) {
      navigator.share({
        title: work.title,
        text: `${work.title} — Street Photography Concourse by Olawale / The Vault`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Concourse Telemetry Link copied to clipboard!');
    }
  };


  // Subtle horizontal parallax only (no pitch tilt)
  const currentYaw = yaw + (mouseOffset.x * 3.5);

  return (
    <div 
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="relative w-full h-full overflow-hidden select-none bg-[#07090C] cursor-grab active:cursor-grabbing flex items-center justify-center font-sans"
    >
      {/* ======================================================== */}
      {/* 3D SPATIAL DOUBLE-TIERED CONCOURSE (LOCKED 1376x768 STAGE) */}
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
        {/* Symmetrical 8K Double-Tiered Concourse Backdrop */}
        <img 
          src="/media/vault-rooms/optics_street_clean.jpg"
          alt="Optics Street Double Tier"
          draggable={false}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
          style={{ filter: 'contrast(1.06) brightness(1.02)' }}
        />

        {/* Soft Ambient Warm Amber Floor Guideline Glow */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#07090C]/20 to-[#07090C]/60 pointer-events-none" />

        {/* ======================================================== */}
        {/* SINGLE FAINT CIRCULAR TARGET NODE (CENTER FLOOR) */}
        {/* ======================================================== */}
        <div
          onClick={handleResetOverview}
          title="Reset to Central Overview"
          className="absolute z-20 cursor-pointer pointer-events-auto rounded-full group transition-transform hover:scale-105"
          style={{
            left: '46.5%',
            top: '78.5%',
            width: '7.0%',
            height: '4.5%'
          }}
        >
          <div className="w-full h-full rounded-full border border-[#FF6B1A]/40 group-hover:border-[#FF6B1A] group-hover:bg-[#FF6B1A]/10 group-hover:shadow-[0_0_25px_rgba(255,107,26,0.6)] transition-all flex items-center justify-center">
            <div className="w-2.5 h-1.5 rounded-full bg-[#FF6B1A]/60 group-hover:bg-[#FF6B1A] transition-all" />
          </div>
        </div>

        {/* ======================================================== */}
        {/* 24 SYMMETRICAL FRAMES: TWO PARALLEL TIERS ACROSS 3 WALLS */}
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
                title={`Inspect Frame #${work.index} // ${work.title}`}
                className="absolute cursor-pointer transition-all duration-300 group rounded-[3px]"
                style={{
                  left: work.spatial.left,
                  top: work.spatial.top,
                  width: work.spatial.width,
                  height: work.spatial.height
                }}
              >
                {/* Visual Artwork Monolith Frame Box: Embedded flush into concrete gallery recesses */}
                <div 
                  className={`relative w-full h-full rounded-md overflow-hidden bg-slate-950/90 transition-all duration-300 ${
                    isSelected
                      ? 'border-2 border-[#FFA14A] shadow-[0_0_28px_rgba(255,161,74,0.95),inset_0_0_12px_rgba(255,161,74,0.35)] scale-105 z-30'
                      : isHovered
                        ? 'border-2 border-[#FF6B1A] shadow-[0_0_20px_rgba(255,107,26,0.85),inset_0_0_8px_rgba(255,107,26,0.2)] scale-105 z-20'
                        : 'border border-[#FFA14A]/40 shadow-[0_4px_16px_rgba(0,0,0,0.9),0_0_10px_rgba(255,161,74,0.2)] hover:border-[#FF6B1A]/80'
                  }`}
                >
                  <img
                    src={getPhotoThumbUrl(work.image)}
                    alt={work.title}
                    draggable={false}
                    decoding="async"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes('DSC02080.jpg')) {
                        target.src = work.image || '/media/photography/street/DSC02080.jpg';
                      }
                    }}
                    className="w-full h-full object-cover select-none transition-transform duration-300 group-hover:scale-103"
                  />
                  {/* Subtle Inner Bevel Depth */}
                  <div className="absolute inset-0 shadow-[inset_0_1px_4px_rgba(0,0,0,0.8)] pointer-events-none" />

                  {/* Top Left Frame ID Tag */}
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

                {/* Minimalist Hover Tooltip */}
                {isHovered && !selectedArtwork && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-40 whitespace-nowrap bg-[#07090C]/95 px-2 py-0.5 rounded border border-[#FF6B1A] font-mono-hud text-[8px] text-[#FFA14A] font-bold shadow-[0_0_15px_rgba(255,107,26,0.5)] pointer-events-none animate-fade-in flex items-center gap-1.5">
                    <span>#{work.index < 10 ? `0${work.index}` : work.index} // {work.title}</span>
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
      

      {/* Quick Wall Snaps */}
      <div className="absolute top-16 md:top-14 right-6 md:right-8 z-20 flex items-center gap-1.5 p-1 rounded-full bg-[#07090C]/90 backdrop-blur-md border border-slate-800 shadow-2xl pointer-events-auto">
        <button
          onClick={handleSnapLeftWall}
          className="px-2.5 py-1 rounded-full font-mono-hud text-[9px] font-bold text-slate-400 hover:text-white transition-all"
        >
          LEFT WALL
        </button>
        <button
          onClick={handleSnapBackWall}
          className="px-2.5 py-1 rounded-full font-mono-hud text-[9px] font-bold text-slate-400 hover:text-white transition-all"
        >
          BACK WALL
        </button>
        <button
          onClick={handleSnapRightWall}
          className="px-2.5 py-1 rounded-full font-mono-hud text-[9px] font-bold text-slate-400 hover:text-white transition-all"
        >
          RIGHT WALL
        </button>
        <button
          onClick={handleResetOverview}
          className="px-2.5 py-1 rounded-full font-mono-hud text-[9px] font-bold text-[#FFA14A] hover:text-white transition-all"
        >
          OVERVIEW
        </button>
      </div>

      {/* Bottom Center: CLICK TO INSPECT */}
      <div className="absolute bottom-[7.5%] left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center z-10">
        <span className="font-mono-hud text-xs md:text-sm tracking-[0.25em] text-[#FF6B1A] uppercase drop-shadow-[0_0_12px_rgba(255,107,26,0.6)] animate-pulse">
          CLICK TO INSPECT
        </span>
      </div>

      {/* Bottom Left: Exhibits Roster Trigger */}
      <div className="absolute bottom-6 left-6 z-20 flex items-center gap-3">
        <button
          onClick={() => {
            try { audioEngine.playClickSFX(); } catch {}
            setShowRosterDrawer(prev => !prev);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono-hud text-[10px] md:text-xs font-bold bg-[#0B131F]/90 border border-[#FF6B1A]/60 hover:border-[#FF6B1A] text-[#FFA14A] hover:bg-[#FF6B1A]/15 shadow-[0_0_15px_rgba(255,107,26,0.3)] transition-all cursor-pointer pointer-events-auto"
          title="Browse All 24 Street Exhibits Roster"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>EXHIBITS ({displayedWorks.length})</span>
        </button>
      </div>

      {/* Bottom Horizontal Camera Navigation */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 p-1.5 rounded-full bg-[#07090C]/90 backdrop-blur-md border border-slate-800 shadow-2xl pointer-events-auto">
        <button
          onClick={() => setYaw(prev => prev + 15)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full font-mono-hud text-[10px] text-slate-300 hover:text-white hover:bg-white/10 transition-all"
          title="Pan Left Along Horizon"
        >
          <ChevronLeft className="w-3.5 h-3.5 text-[#FF6B1A]" />
          <span>PAN LEFT</span>
        </button>

        <button
          onClick={handleResetOverview}
          className="p-1.5 rounded-full font-mono-hud text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          title="Reset Concourse View"
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
          title="Pan Right Along Horizon"
        >
          <span>PAN RIGHT</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#FF6B1A]" />
        </button>
      </div>

      {/* ======================================================== */}
      {/* FRICTIONLESS POP-CARD SELECTION (`CAMERA 02 // INTERSPECT`) */}
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
            
            {/* LEFT / CENTER: FOCUSED CINEMATIC 4:5 ARTWORK */}
            <div className="relative w-full md:w-1/2 max-w-sm aspect-[4/5] rounded-2xl overflow-hidden border-2 border-[#FF6B1A] shadow-[0_0_40px_rgba(255,107,26,0.5)] bg-slate-950 transition-all group/art">
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
                {selectedArtwork.wall.toUpperCase()} WALL // {selectedArtwork.row.toUpperCase()} TIER
              </div>
            </div>

            {/* RIGHT: CLEAN TRANSLUCENT GLASS METADATA POPUP */}
            <div className="relative w-full md:w-1/2 max-w-md rounded-2xl glass-hologram p-6 md:p-7 flex flex-col justify-between border-2 border-[#FF6B1A]/50 shadow-[0_0_45px_rgba(255,107,26,0.3)]">
              
              {/* Header Telemetry */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-hud text-[11px] text-[#FFA14A] tracking-widest uppercase font-bold">
                      CAMERA 02 // INTERSPECT
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
                  COORD: 86.45° N, 03.39° E // {selectedArtwork.dimensions}
                </span>
              </div>

              {/* Clean Telemetry Parameters */}
              <div className="my-4 p-4 rounded-xl bg-[#07090C]/85 border border-slate-700/60 flex flex-col gap-2">
                <div className="flex items-center justify-between font-mono-hud text-xs border-b border-slate-800 pb-1.5">
                  <span className="text-[#FFA14A] font-bold">RIG &amp; LENS:</span>
                  <span className="text-white font-semibold text-right text-[11px]">{selectedArtwork.engine}</span>
                </div>

                <div className="flex items-center justify-between font-mono-hud text-xs border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400 font-bold">EXPOSURE EXIF:</span>
                  <span className="text-[#FFA14A] font-bold">{selectedArtwork.stepsCfg}</span>
                </div>

                <div className="flex items-center justify-between font-mono-hud text-xs border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400 font-bold">LOCATION:</span>
                  <span className="text-slate-200">{selectedArtwork.wall.toUpperCase()} WALL // {selectedArtwork.row.toUpperCase()} ROW</span>
                </div>

                <div className="flex items-center justify-between font-mono-hud text-xs border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400 font-bold">SEED / ARCHIVE:</span>
                  <span className="text-slate-300">{selectedArtwork.seed}</span>
                </div>

                <div className="flex flex-col gap-1 font-mono-hud text-[11px] pt-1">
                  <span className="text-[#FFA14A] font-bold">STREET NARRATIVE:</span>
                  <span className="text-slate-300 leading-relaxed text-[10px]">
                    "{selectedArtwork.promptPhilosophy}"
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
                          category: 'street',
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
                {selectedArtwork.dimensions} // {selectedArtwork.wall.toUpperCase()} WALL
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
            <button
              onClick={handlePrevArtwork}
              className="fixed left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 flex items-center gap-1.5 px-3.5 py-4 rounded-2xl bg-[#07090C]/90 hover:bg-[#FF6B1A] text-[#FFA14A] hover:text-slate-950 border-2 border-[#FF6B1A]/60 shadow-[0_0_25px_rgba(0,0,0,0.9)] transition-all cursor-pointer group"
              title="Previous Exhibit [←]"
            >
              <ChevronLeft className="w-6 h-6 transition-transform group-hover:-translate-x-1" />
              <span className="hidden lg:inline font-mono-hud text-xs font-bold">PREV</span>
            </button>

            <div className="rounded-2xl overflow-hidden border-2 border-[#FF6B1A] shadow-[0_0_60px_rgba(255,107,26,0.6)]">
              <img
                src={selectedArtwork.image}
                alt={selectedArtwork.title}
                decoding="async"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                className="w-full h-full object-contain max-h-[82vh] select-none"
              />
            </div>

            <button
              onClick={handleNextArtwork}
              className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 flex items-center gap-1.5 px-3.5 py-4 rounded-2xl bg-[#07090C]/90 hover:bg-[#FF6B1A] text-[#FFA14A] hover:text-slate-950 border-2 border-[#FF6B1A]/60 shadow-[0_0_25px_rgba(0,0,0,0.9)] transition-all cursor-pointer group"
              title="Next Exhibit [→]"
            >
              <span className="hidden lg:inline font-mono-hud text-xs font-bold">NEXT</span>
              <ChevronRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          <div className="absolute bottom-6 font-mono-hud text-xs text-slate-400">
            OWNERSHIP: EXCLUSIVE / 01 OF 01 // PRESS ESC TO RETURN TO CONCOURSE
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SLIDE-OUT EXHIBITS ROSTER DRAWER (ALL 24 CONCOURSE WORKS) */}
      {/* ======================================================== */}
      {showRosterDrawer && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-[#07090C]/95 backdrop-blur-2xl border-l border-[#FF6B1A]/40 shadow-[-10px_0_40px_rgba(0,0,0,0.9)] p-6 flex flex-col justify-between animate-slide-left pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <div className="font-mono-hud text-[10px] text-[#38BDF8] tracking-widest uppercase font-bold">
                STREET // CONCOURSE ROSTER
              </div>
              <h3 className="font-syne text-lg font-bold text-white tracking-wider flex items-center gap-2">
                <span>STREET EXHIBITS</span>
                <span className="font-mono-hud text-xs text-[#FFA14A] bg-amber-950/70 border border-amber-500/40 px-2 py-0.5 rounded">
                  {displayedWorks.length} FRAMES
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
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-950 border border-slate-700/80 shrink-0">
                    <img
                      src={getPhotoThumbUrl(work.image)}
                      alt={work.title}
                      decoding="async"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.src !== work.image) {
                          target.src = work.image;
                        }
                      }}
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
                      {work.engine}
                    </p>
                    <div className="flex items-center gap-2 mt-1 font-mono-hud text-[8px] text-slate-500">
                      <span>{work.wall.toUpperCase()} WALL</span>
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
            <span>CONCOURSE 24 // 60FPS</span>
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
