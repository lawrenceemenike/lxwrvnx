import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChamberId } from '../../types';
import { audioEngine } from '../../utils/audioEngine';
import { Camera, Sparkles, Music, Shield, ArrowRight, RotateCcw, ChevronUp, ChevronDown, Compass, Cpu } from 'lucide-react';

interface MainConcourseProps {
  onNavigate: (chamber: ChamberId) => void;
  mouseOffset: { x: number; y: number };
}

interface DoorData {
  id: ChamberId;
  doorNumber: string;
  name: string;
  subtitle: string;
  discipline: string;
  specs: string;
  wall: 'left' | 'right';
  image: string;
  cameraZ: number; // translation forward along tunnel
  cameraX: number; // translation sideways
  cameraYaw: number; // yaw angle to face door directly in eyes
}

const DOORS: DoorData[] = [
  {
    id: 'optics',
    doorNumber: '01',
    name: 'OPTICS',
    subtitle: 'PHOTOGRAPHY // TOP 50 EXHIBITION',
    discipline: 'PHYSICAL OPTICS, MOTORSPORT & REMBRANDT LIGHTING',
    specs: '3 CATEGORIES // 50 CURATED CANVASES',
    wall: 'left',
    image: '/media/photography/street/DSC03657.jpg',
    cameraZ: 250,
    cameraX: 200,
    cameraYaw: 35
  },
  {
    id: 'synthesis',
    doorNumber: '02',
    name: 'SYNTHESIS',
    subtitle: 'GENERATIVE AI ART & CINEMA',
    discipline: 'NEURAL NETWORKS & LATENT SYNTHESIS',
    specs: '9:16 VERTICAL MONOLITHS // 16:9 8K RENDERS',
    wall: 'left',
    image: '/media/ai-art/Lucid_Origin_A_vast_open_interior_resembling_a_futuristic_obse_0.jpg',
    cameraZ: 450,
    cameraX: 180,
    cameraYaw: 28
  },
  {
    id: 'acoustics',
    doorNumber: '03',
    name: 'ACOUSTICS',
    subtitle: 'AI MUSIC & SONIC LAB',
    discipline: 'PROCEDURAL SYNTHESIS & FREQUENCY TELEMETRY',
    specs: '2 ALBUMS // REAL-TIME 60FPS WAVEFORM FFT',
    wall: 'right',
    image: '/media/music/kxng-of-the-nvght-cover.jpg',
    cameraZ: 250,
    cameraX: -200,
    cameraYaw: -35
  },
  {
    id: 'ai-projects',
    doorNumber: '05',
    name: 'AI PROJECTS',
    subtitle: 'COMMERCIAL INTELLIGENCE & ENTERPRISE SYSTEMS',
    discipline: 'MULTI-AGENT WORKFLOWS & DECISION PLATFORMS',
    specs: 'NELC DIGITAL // STRATEGIC DEPLOYMENTS',
    wall: 'right',
    image: '/media/vault-rooms/inspect.jpg',
    cameraZ: 450,
    cameraX: -180,
    cameraYaw: -28
  }
];

export const MainConcourse: React.FC<MainConcourseProps> = ({
  onNavigate,
  mouseOffset
}) => {
  // 360° Horizontal Yaw Angle in degrees (continuous, unconstrained!)
  const [yaw, setYaw] = useState<number>(0);
  const [pitch, setPitch] = useState<number>(0);

  // Tunnel position (0: Entryway, 1: Mid Concourse, 2: Terminal Vault)
  const [tunnelStep, setTunnelStep] = useState<number>(0);

  // Active Focused Door: when non-null, camera glides and faces that door directly in eyes!
  const [focusedDoor, setFocusedDoor] = useState<DoorData | null>(null);

  // Hovering door state for subtle outline
  const [hoveredDoor, setHoveredDoor] = useState<ChamberId | null>(null);

  // Ground disc cursor
  const [groundDisc, setGroundDisc] = useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false
  });

  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Drag to pan 360° continuously
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isDraggingRef.current) {
      const deltaX = e.clientX - lastMouseRef.current.x;
      const deltaY = e.clientY - lastMouseRef.current.y;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };

      // Continuous 360° yaw (unclamped!)
      setYaw(prev => prev + deltaX * 0.22);
      // Pitch clamped
      setPitch(prev => Math.max(-20, Math.min(20, prev - deltaY * 0.15)));

      // If user was focusing a door and drags, return to free camera
      if (focusedDoor && (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2)) {
        setFocusedDoor(null);
      }
      return;
    }

    // Ground cursor tracking when hovering floor
    const isFloor = mouseY > rect.height * 0.55 && mouseY < rect.height * 0.92;
    const isCenter = mouseX > rect.width * 0.25 && mouseX < rect.width * 0.75;

    if (isFloor && isCenter && !focusedDoor) {
      setGroundDisc({ x: mouseX, y: mouseY, visible: true });
    } else {
      setGroundDisc(prev => ({ ...prev, visible: false }));
    }
  }, [focusedDoor]);

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Face a door directly in user's eyes
  const handleDoorClick = (door: DoorData) => {
    audioEngine.playLockOnSFX();
    setFocusedDoor(door);
    // Smoothly turn to face door directly
    setYaw(door.cameraYaw);
    setPitch(0);
  };

  // Turn back to looking forward down the concourse
  const handleReturnToTunnel = () => {
    audioEngine.playClickSFX();
    setFocusedDoor(null);
    setYaw(0);
    setPitch(0);
  };

  // Step forward or backward
  const handleStepForward = () => {
    audioEngine.playGlideSFX();
    setTunnelStep(prev => Math.min(2, prev + 1));
    setFocusedDoor(null);
  };

  const handleStepBack = () => {
    audioEngine.playGlideSFX();
    setTunnelStep(prev => Math.max(0, prev - 1));
    setFocusedDoor(null);
  };

  // Calculate normalized heading in degrees (0 to 360)
  const normalizedHeading = ((yaw % 360) + 360) % 360;

  // Determine which background to show (front tunnel vs rear entrance)
  // When heading is between 90 deg and 270 deg (facing backward), blend in the rear entrance view!
  const isFacingRear = normalizedHeading > 80 && normalizedHeading < 280;
  const rearOpacity = isFacingRear 
    ? Math.min(1, Math.max(0, (1 - Math.abs(normalizedHeading - 180) / 75))) 
    : 0;

  // Compute camera Z & X based on focused door or tunnel step
  let targetZ = tunnelStep === 0 ? 0 : tunnelStep === 1 ? 260 : 480;
  let targetX = 0;
  let targetScale = tunnelStep === 0 ? 1 : tunnelStep === 1 ? 1.35 : 1.85;

  if (focusedDoor) {
    targetZ = focusedDoor.cameraZ;
    targetX = focusedDoor.cameraX;
    targetScale = 1.45;
  }

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="relative w-full h-full overflow-hidden select-none bg-[#070A0E] cursor-grab active:cursor-grabbing"
    >
      {/* ======================================================== */}
      {/* 360° SPATIAL PANORAMA VIEWPORT */}
      {/* ======================================================== */}
      <div 
        className="absolute inset-0 transition-transform duration-500 ease-out flex items-center justify-center"
        style={{
          transform: `perspective(1000px) translateZ(${targetZ}px) translateX(${targetX}px) rotateY(${yaw}deg) rotateX(${pitch}deg) scale(${targetScale})`,
          transformOrigin: '50% 55%'
        }}
      >
        {/* 1. FRONT VIEW: 100% FAITHFUL MOCKUP CONCOURSE */}
        <div 
          className="absolute inset-[-4%] bg-cover bg-center transition-opacity duration-300 pointer-events-none"
          style={{
            backgroundImage: "url('/media/vault-rooms/concourse.jpg')",
            filter: 'contrast(1.06) brightness(1.02)',
            opacity: 1 - rearOpacity
          }}
        />

        {/* 2. REAR VIEW: AIRLOCK ENTRANCE (WHEN TURNED 180° AROUND) */}
        <div 
          className="absolute inset-[-4%] bg-cover bg-center transition-opacity duration-300 pointer-events-none"
          style={{
            backgroundImage: "url('/media/vault-rooms/concourse_rear.jpg')",
            filter: 'contrast(1.06) brightness(1.02)',
            opacity: rearOpacity,
            transform: 'scaleX(-1)' // Mirrored for panoramic continuity
          }}
        />

        {/* ======================================================== */}
        {/* THE 4 DOORS ON THE SIDES (PRECISE ARCHITECTURAL HOTSPOTS) */}
        {/* ======================================================== */}
        {/* Only rendered when facing forward */}
        {!isFacingRear && (
          <>
            {/* DOOR 1: PHOTOGRAPHY (Left Foreground) */}
            <div
              onClick={() => handleDoorClick(DOORS[0])}
              onMouseEnter={() => setHoveredDoor('optics')}
              onMouseLeave={() => setHoveredDoor(null)}
              title="Click to face Door 1 // Photography directly in your eyes"
              className="absolute left-[11%] top-[24%] w-[16%] h-[52%] cursor-pointer pointer-events-auto z-20 group"
              style={{
                transform: 'perspective(600px) rotateY(18deg) skewY(-2deg)',
                transformOrigin: 'left center'
              }}
            >
              {/* Luminous outline on hover */}
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[#FF6B1A] group-hover:shadow-[0_0_35px_rgba(255,107,26,0.6)] group-hover:bg-[#FF6B1A]/10 transition-all duration-300" />
              
              {/* Hotspot Hover Tag */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#070A0E]/90 border border-[#FF6B1A] shadow-[0_0_20px_rgba(255,107,26,0.5)]">
                  <Camera className="w-3.5 h-3.5 text-[#FFA14A]" />
                  <span className="font-mono-hud text-[10px] font-bold text-white tracking-widest">
                    DOOR 01 // OPTICS
                  </span>
                  <span className="text-[9px] font-mono-hud text-[#38BDF8]">
                    [FACE DOOR]
                  </span>
                </div>
              </div>
            </div>

            {/* DOOR 2: AI ART (Left Midground) */}
            <div
              onClick={() => handleDoorClick(DOORS[1])}
              onMouseEnter={() => setHoveredDoor('synthesis')}
              onMouseLeave={() => setHoveredDoor(null)}
              title="Click to face Door 2 // AI Art directly in your eyes"
              className="absolute left-[33%] top-[38%] w-[6.5%] h-[24%] cursor-pointer pointer-events-auto z-20 group"
              style={{
                transform: 'perspective(600px) rotateY(14deg)',
                transformOrigin: 'left center'
              }}
            >
              <div className="absolute inset-0 rounded-lg border border-transparent group-hover:border-[#38BDF8] group-hover:shadow-[0_0_25px_rgba(56,189,248,0.6)] group-hover:bg-[#38BDF8]/15 transition-all duration-300" />
              
              <div className="absolute -top-9 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap">
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#070A0E]/90 border border-[#38BDF8] shadow-[0_0_15px_rgba(56,189,248,0.5)]">
                  <Sparkles className="w-3 h-3 text-[#38BDF8]" />
                  <span className="font-mono-hud text-[9px] font-bold text-white tracking-widest">
                    DOOR 02 // SYNTHESIS
                  </span>
                  <span className="text-[8px] font-mono-hud text-[#FFA14A]">
                    [FACE DOOR]
                  </span>
                </div>
              </div>
            </div>

            {/* DOOR 3: AI MUSIC (Right Foreground) */}
            <div
              onClick={() => handleDoorClick(DOORS[2])}
              onMouseEnter={() => setHoveredDoor('acoustics')}
              onMouseLeave={() => setHoveredDoor(null)}
              title="Click to face Door 3 // AI Music directly in your eyes"
              className="absolute right-[11%] top-[24%] w-[16%] h-[52%] cursor-pointer pointer-events-auto z-20 group"
              style={{
                transform: 'perspective(600px) rotateY(-18deg) skewY(2deg)',
                transformOrigin: 'right center'
              }}
            >
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[#FF6B1A] group-hover:shadow-[0_0_35px_rgba(255,107,26,0.6)] group-hover:bg-[#FF6B1A]/10 transition-all duration-300" />
              
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#070A0E]/90 border border-[#FF6B1A] shadow-[0_0_20px_rgba(255,107,26,0.5)]">
                  <Music className="w-3.5 h-3.5 text-[#FFA14A]" />
                  <span className="font-mono-hud text-[10px] font-bold text-white tracking-widest">
                    DOOR 03 // ACOUSTICS
                  </span>
                  <span className="text-[9px] font-mono-hud text-[#38BDF8]">
                    [FACE DOOR]
                  </span>
                </div>
              </div>
            </div>

            {/* DOOR 05: AI PROJECTS (Right Midground - Second Door on Right Side) */}
            <div
              onClick={() => handleDoorClick(DOORS[3])}
              onMouseEnter={() => setHoveredDoor('ai-projects')}
              onMouseLeave={() => setHoveredDoor(null)}
              title="Click to face AI Projects Door directly in your eyes"
              className="absolute right-[33%] top-[38%] w-[6.5%] h-[24%] cursor-pointer pointer-events-auto z-20 group"
              style={{
                transform: 'perspective(600px) rotateY(-14deg)',
                transformOrigin: 'right center'
              }}
            >
              <div className="absolute inset-0 rounded-lg border border-transparent group-hover:border-[#38BDF8] group-hover:shadow-[0_0_25px_rgba(56,189,248,0.6)] group-hover:bg-[#38BDF8]/15 transition-all duration-300" />
              
              <div className="absolute -top-9 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap">
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#070A0E]/90 border border-[#38BDF8] shadow-[0_0_15px_rgba(56,189,248,0.5)]">
                  <Cpu className="w-3 h-3 text-[#38BDF8]" />
                  <span className="font-mono-hud text-[9px] font-bold text-white tracking-widest">
                    DOOR 05 // AI PROJECTS
                  </span>
                  <span className="text-[8px] font-mono-hud text-[#FFA14A]">
                    [FACE DOOR]
                  </span>
                </div>
              </div>
            </div>

            {/* TERMINAL APEX: THE CIRCULAR VAULT DOOR (04 // THE ARCHITECT // ABOUT) */}
            <div
              onClick={() => onNavigate('architect')}
              onMouseEnter={() => setHoveredDoor('architect')}
              onMouseLeave={() => setHoveredDoor(null)}
              title="Click to enter Chamber 04 // The Architect (About Lawrence Emenike // lxwrvnx)"
              className="absolute top-[41%] left-[45.5%] w-[9%] h-[15%] rounded-full cursor-pointer pointer-events-auto z-20 group flex items-center justify-center"
            >
              <div className="absolute inset-0 rounded-full border border-transparent group-hover:border-[#FFA14A] group-hover:shadow-[0_0_30px_rgba(255,107,26,0.85)] transition-all" />
              
              {/* Hotspot Hover Tag for Terminal Middle Door */}
              <div className="absolute -top-11 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-30">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#070A0E]/95 border border-[#FF6B1A] shadow-[0_0_20px_rgba(255,107,26,0.6)]">
                  <Shield className="w-3.5 h-3.5 text-[#FFA14A]" />
                  <span className="font-mono-hud text-[10px] font-bold text-white tracking-widest">
                    04 // THE ARCHITECT
                  </span>
                  <span className="font-mono-hud text-[9px] text-[#38BDF8]">
                    [ABOUT // LAWRENCE EMENIKE]
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

      </div>

      {/* ======================================================== */}
      {/* EYE-LEVEL DOOR FRAMING CARD (WHEN FACING A DOOR DIRECTLY) */}
      {/* ======================================================== */}
      {focusedDoor && (
        <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center p-4">
          <div className="pointer-events-auto max-w-md w-full rounded-2xl glass-hologram p-6 md:p-8 border-2 border-[#FF6B1A] shadow-[0_0_60px_rgba(255,107,26,0.5)] flex flex-col justify-between animate-fade-in">
            
            {/* Header Telemetry */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <span className="font-mono-hud text-xs text-[#38BDF8] tracking-widest font-bold">
                DOOR {focusedDoor.doorNumber} // {focusedDoor.wall.toUpperCase()} RIB
              </span>
              <span className="font-mono-hud text-[10px] text-[#FFA14A] bg-[#FF6B1A]/20 px-2 py-0.5 rounded border border-[#FF6B1A]/50 font-bold">
                EYE-LEVEL ALIGNED
              </span>
            </div>

            {/* Door Visual Preview & Specs */}
            <div className="flex gap-4 items-center mb-5">
              <div className="w-20 h-20 rounded-xl overflow-hidden border border-[#FF6B1A]/50 shadow-xl flex-shrink-0">
                <img
                  src={focusedDoor.image}
                  alt={focusedDoor.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex flex-col">
                <h3 className="font-syne text-2xl font-black text-white tracking-wider glow-ember-text">
                  {focusedDoor.doorNumber} // {focusedDoor.name}
                </h3>
                <span className="font-mono-hud text-xs text-[#FFA14A] font-bold mt-0.5">
                  {focusedDoor.subtitle}
                </span>
                <span className="font-inter text-xs text-slate-300 mt-1">
                  {focusedDoor.discipline}
                </span>
                <span className="font-mono-hud text-[10px] text-slate-400 mt-1">
                  {focusedDoor.specs}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate(focusedDoor.id)}
                className="flex-1 py-3 px-4 rounded-xl bg-[#FF6B1A] hover:bg-[#FFA14A] text-slate-950 font-mono-hud text-xs font-bold tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(255,107,26,0.5)] transition-all"
              >
                <span>ENTER {focusedDoor.name}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleReturnToTunnel}
                className="py-3 px-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white font-mono-hud text-xs border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>TURN BACK</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STREET VIEW GROUND DISC CURSOR (PROJECTED ON FLOOR) */}
      {/* ======================================================== */}
      {groundDisc.visible && !focusedDoor && (
        <div 
          onClick={handleStepForward}
          className="absolute z-20 pointer-events-auto cursor-pointer -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
          style={{ left: groundDisc.x, top: groundDisc.y }}
        >
          <div 
            className="w-24 h-24 rounded-full border border-white/40 bg-white/10 backdrop-blur-[2px] shadow-[0_0_20px_rgba(255,255,255,0.25)] flex items-center justify-center hover:border-[#FF6B1A] hover:bg-[#FF6B1A]/20 transition-transform hover:scale-110"
            style={{ transform: 'perspective(500px) rotateX(68deg)' }}
          >
            <ChevronUp className="w-8 h-8 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
          </div>
          <span className="mt-1 font-mono-hud text-[9px] text-white font-bold bg-[#070A0E]/90 px-2 py-0.5 rounded-full border border-white/20 whitespace-nowrap">
            CLICK TO GLIDE FORWARD
          </span>
        </div>
      )}

      {/* ======================================================== */}
      {/* ON-SCREEN STREET VIEW CONTROLS & DOOR QUICK JUMP BAR */}
      {/* ======================================================== */}
      {/* Top Door Selector */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex items-center gap-2 p-1.5 rounded-full bg-[#070A0E]/90 backdrop-blur-md border border-slate-800 shadow-2xl">
        {DOORS.slice(0, 3).map((door) => (
          <button
            key={door.id}
            onClick={() => handleDoorClick(door)}
            className={`px-3 py-1.5 rounded-full font-mono-hud text-[10px] font-bold flex items-center gap-1.5 transition-all ${
              focusedDoor?.id === door.id
                ? 'bg-[#FF6B1A] text-slate-950 shadow-[0_0_15px_rgba(255,107,26,0.6)]'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>{door.doorNumber} // {door.name}</span>
          </button>
        ))}

        {/* 04 // THE ARCHITECT (Circular Middle Vault Door) */}
        <button
          onClick={() => onNavigate('architect')}
          className="px-3 py-1.5 rounded-full font-mono-hud text-[10px] font-bold flex items-center gap-1.5 transition-all text-[#FFA14A] hover:text-white hover:bg-[#FF6B1A]/20 border border-[#FF6B1A]/30"
          title="Enter 04 // The Architect (About Lawrence Emenike // lxwrvnx)"
        >
          <Shield className="w-3 h-3 text-[#FFA14A]" />
          <span>04 // THE ARCHITECT</span>
        </button>

        {/* 05 // AI PROJECTS (Right Midground Door) */}
        {DOORS.slice(3).map((door) => (
          <button
            key={door.id}
            onClick={() => handleDoorClick(door)}
            className={`px-3 py-1.5 rounded-full font-mono-hud text-[10px] font-bold flex items-center gap-1.5 transition-all ${
              focusedDoor?.id === door.id
                ? 'bg-[#38BDF8] text-slate-950 shadow-[0_0_15px_rgba(56,189,248,0.6)]'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Cpu className="w-3 h-3 text-[#38BDF8]" />
            <span>{door.doorNumber} // {door.name}</span>
          </button>
        ))}

        {focusedDoor && (
          <button
            onClick={handleReturnToTunnel}
            className="px-2.5 py-1.5 rounded-full font-mono-hud text-[10px] text-[#38BDF8] border border-[#38BDF8]/40 hover:bg-[#38BDF8]/10"
          >
            CENTER
          </button>
        )}
      </div>

      {/* Bottom Street View Forward / Back Buttons */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex items-center gap-3 p-2 rounded-full bg-[#070A0E]/90 backdrop-blur-md border border-slate-800 shadow-2xl">
        <button
          disabled={tunnelStep >= 2}
          onClick={handleStepForward}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full font-mono-hud text-xs font-bold transition-all ${
            tunnelStep < 2
              ? 'bg-[#FF6B1A] text-slate-950 hover:bg-[#FFA14A] shadow-[0_0_15px_rgba(255,107,26,0.5)]'
              : 'bg-slate-800/40 text-slate-600 cursor-not-allowed'
          }`}
        >
          <ChevronUp className="w-4 h-4" />
          <span>GLIDE FORWARD</span>
        </button>

        <span className="font-mono-hud text-[10px] text-slate-400">
          NODE 0{tunnelStep + 1} / 03
        </span>

        <button
          disabled={tunnelStep === 0}
          onClick={handleStepBack}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full font-mono-hud text-xs font-bold transition-all ${
            tunnelStep > 0
              ? 'bg-slate-800 text-white hover:bg-slate-700'
              : 'bg-slate-800/40 text-slate-600 cursor-not-allowed'
          }`}
        >
          <ChevronDown className="w-4 h-4" />
          <span>STEP BACK</span>
        </button>
      </div>

      {/* Bottom-Right Compass Widget */}
      <div className="absolute bottom-6 right-6 z-20 pointer-events-auto flex items-center gap-3">
        <button
          onClick={handleReturnToTunnel}
          title="Reset Heading to 0°"
          className="relative w-12 h-12 rounded-full bg-[#070A0E]/90 backdrop-blur-md border border-slate-700 hover:border-[#FF6B1A] shadow-2xl flex items-center justify-center transition-colors group"
        >
          <div
            className="w-full h-full flex items-center justify-center transition-transform duration-75"
            style={{ transform: `rotate(${-normalizedHeading}deg)` }}
          >
            <div className="absolute top-2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[10px] border-b-red-500" />
            <div className="absolute bottom-2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[10px] border-t-white" />
            <div className="w-2 h-2 rounded-full bg-slate-300" />
          </div>
          <span className="absolute -top-1 font-mono-hud text-[8px] font-bold text-red-500">N</span>
        </button>

        <div className="hidden sm:flex flex-col font-mono-hud text-[10px] text-slate-400">
          <span className="text-[#38BDF8] font-bold">360° HEADING</span>
          <span>{Math.round(normalizedHeading)}°</span>
        </div>
      </div>

      {/* Bottom-Left Location Card */}
      <div className="absolute bottom-6 left-6 z-20 pointer-events-auto hidden sm:flex items-center gap-3 p-3 rounded-xl bg-[#070A0E]/90 backdrop-blur-md border border-slate-800 shadow-2xl">
        <div className="w-8 h-8 rounded-lg bg-[#FF6B1A]/20 border border-[#FF6B1A] flex items-center justify-center text-[#FFA14A]">
          <Compass className="w-4 h-4" />
        </div>
        <div className="flex flex-col font-mono-hud text-xs">
          <span className="font-bold text-white tracking-wider">
            {tunnelStep === 0 ? 'ENTRYWAY // START' : tunnelStep === 1 ? 'HUB 01 // DOORS 01 & 03' : 'HUB 02 // DOORS 02 & 04'}
          </span>
          <span className="text-[10px] text-slate-400">
            DRAG TO PAN 360° // CLICK DOOR TO FACE IN EYES
          </span>
        </div>
      </div>

    </div>
  );
};
