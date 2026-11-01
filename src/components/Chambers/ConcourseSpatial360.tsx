import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { ChamberId } from '../../types';
import { StreetViewControls } from '../Navigation/StreetViewControls';
import { Camera, Sparkles, Music, Shield, ArrowRight, Eye, ChevronUp, ChevronDown, RotateCcw } from 'lucide-react';

interface ConcourseSpatial360Props {
  onNavigate: (chamber: ChamberId) => void;
  mouseOffset: { x: number; y: number };
}

// 4 Doors Metadata
interface DoorDef {
  id: ChamberId;
  doorNumber: string;
  name: string;
  subtitle: string;
  discipline: string;
  specs: string;
  wall: 'left' | 'right';
  targetZ: number; // Camera Z position when facing this door
  targetYaw: number; // Camera yaw rotation in degrees to face directly in user's eyes (90 deg = left, -90 deg = right)
  image: string;
}

const DOORS: DoorDef[] = [
  {
    id: 'optics',
    doorNumber: '01',
    name: 'OPTICS',
    subtitle: 'PHOTOGRAPHY // TOP 50 EXHIBITION',
    discipline: 'PHYSICAL OPTICS & MOTORSPORT',
    specs: '3 CATEGORIES // 50 CANVASES // LEICA & HASSELBLAD',
    wall: 'left',
    targetZ: -12,
    targetYaw: 90, // Face left directly
    image: '/media/photography/street/project-specter.jpg'
  },
  {
    id: 'synthesis',
    doorNumber: '02',
    name: 'SYNTHESIS',
    subtitle: 'GENERATIVE AI ART & CINEMA',
    discipline: 'NEURAL NETWORKS & LATENT LATTICES',
    specs: '9:16 VERTICAL MONOLITHS // 16:9 8K RENDERS',
    wall: 'left',
    targetZ: -28,
    targetYaw: 90, // Face left directly
    image: '/media/ai-art/neural-synapse.jpg'
  },
  {
    id: 'acoustics',
    doorNumber: '03',
    name: 'ACOUSTICS',
    subtitle: 'AI MUSIC & SONIC LAB',
    discipline: 'PROCEDURAL SYNTHESIS & FREQUENCY TELEMETRY',
    specs: '2 ALBUMS // REAL-TIME 60FPS WAVEFORM FFT',
    wall: 'right',
    targetZ: -12,
    targetYaw: -90, // Face right directly
    image: '/media/music/kxng-of-the-nvght-cover.jpg'
  },
  {
    id: 'architect',
    doorNumber: '04',
    name: 'THE ARCHITECT',
    subtitle: 'ME & MY PROJECTS // COMMAND LOUNGE',
    discipline: 'MULTIDISCIPLINARY SPATIAL STRATEGY',
    specs: 'SYSTEMS PROFILE // F1 AERODYNAMICS // DIRECT COMMS',
    wall: 'right',
    targetZ: -28,
    targetYaw: -90, // Face right directly
    image: '/media/vault-rooms/inspect.jpg'
  }
];

// Tunnel Navigation Stops
const STOPS = [
  { z: 0, label: 'ENTRYWAY // START' },
  { z: -12, label: 'HUB 01 // DOORS 01 & 03' },
  { z: -28, label: 'HUB 02 // DOORS 02 & 04' },
  { z: -44, label: 'TERMINAL APEX // VAULT CORE' }
];

export const ConcourseSpatial360: React.FC<ConcourseSpatial360Props> = ({
  onNavigate,
  mouseOffset
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Camera & Navigation State
  const [currentStopIndex, setCurrentStopIndex] = useState<number>(0);
  const [facingDoor, setFacingDoor] = useState<DoorDef | null>(null);
  const [currentYawDeg, setCurrentYawDeg] = useState<number>(0);

  // Three.js internal refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Rotation angles (radians) & inertia
  const targetYawRef = useRef<number>(0);
  const targetPitchRef = useRef<number>(0);
  const currentYawRef = useRef<number>(0);
  const currentPitchRef = useRef<number>(0);

  // Camera position along tunnel (Z axis)
  const targetZRef = useRef<number>(0);
  const currentZRef = useRef<number>(0);

  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  // Face a specific door directly in user's eyes
  const faceDoorDirectly = useCallback((door: DoorDef) => {
    setFacingDoor(door);
    // Convert target yaw to radians
    targetYawRef.current = (door.targetYaw * Math.PI) / 180;
    targetPitchRef.current = 0; // eye-level
    targetZRef.current = door.targetZ;

    // Update stop index to match door's Z
    const stopIdx = STOPS.findIndex(s => s.z === door.targetZ);
    if (stopIdx !== -1) setCurrentStopIndex(stopIdx);
  }, []);

  // Return to looking straight down the concourse tunnel
  const returnToTunnelView = useCallback(() => {
    setFacingDoor(null);
    targetYawRef.current = 0; // 0 deg = looking straight forward down tunnel
    targetPitchRef.current = 0;
  }, []);

  // Move forward / backward along tunnel stops
  const moveToStop = useCallback((newIndex: number) => {
    const idx = Math.max(0, Math.min(STOPS.length - 1, newIndex));
    setCurrentStopIndex(idx);
    targetZRef.current = STOPS[idx].z;
    setFacingDoor(null);
  }, []);

  // Initialize Three.js 360° Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      65,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 0);
    cameraRef.current = camera;

    // 2. High-Performance WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Texture Loader for the Photorealistic Concourse
    const textureLoader = new THREE.TextureLoader();

    // Front View Texture (The iconic mockup concourse looking forward)
    const frontTexture = textureLoader.load('/media/vault-rooms/concourse.jpg');
    frontTexture.colorSpace = THREE.SRGBColorSpace;
    frontTexture.minFilter = THREE.LinearFilter;
    frontTexture.magFilter = THREE.LinearFilter;

    // Rear View Texture (The airlock entrance looking backward)
    const rearTexture = textureLoader.load('/media/vault-rooms/concourse_rear.jpg');
    rearTexture.colorSpace = THREE.SRGBColorSpace;

    // Left & Right Doors textures
    const specterTex = textureLoader.load('/media/photography/street/project-specter.jpg');
    specterTex.colorSpace = THREE.SRGBColorSpace;
    const aiTex = textureLoader.load('/media/ai-art/neural-synapse.jpg');
    aiTex.colorSpace = THREE.SRGBColorSpace;
    const musicTex = textureLoader.load('/media/music/kxng-of-the-nvght-cover.jpg');
    musicTex.colorSpace = THREE.SRGBColorSpace;
    const archTex = textureLoader.load('/media/vault-rooms/inspect.jpg');
    archTex.colorSpace = THREE.SRGBColorSpace;

    // 4. Create the 3D Aerodynamic Wind Tunnel Concourse
    const tunnelGroup = new THREE.Group();
    scene.add(tunnelGroup);

    // A. Forward Terminal Wall (At the far end of the tunnel Z = -60)
    const frontPlaneGeo = new THREE.PlaneGeometry(64, 36);
    const frontPlaneMat = new THREE.MeshBasicMaterial({ map: frontTexture });
    const frontMesh = new THREE.Mesh(frontPlaneGeo, frontPlaneMat);
    frontMesh.position.set(0, 0, -60);
    tunnelGroup.add(frontMesh);

    // B. Rear Entrance Wall (At the back behind the user Z = +25)
    const rearPlaneGeo = new THREE.PlaneGeometry(64, 36);
    const rearPlaneMat = new THREE.MeshBasicMaterial({ map: rearTexture });
    const rearMesh = new THREE.Mesh(rearPlaneGeo, rearPlaneMat);
    rearMesh.position.set(0, 0, 25);
    rearMesh.rotation.y = Math.PI; // Face 180 deg
    tunnelGroup.add(rearMesh);

    // C. Deep Polished Obsidian Reflective Floor
    const floorGeo = new THREE.PlaneGeometry(36, 120);
    const floorMat = new THREE.MeshBasicMaterial({
      color: 0x05080C,
      transparent: true,
      opacity: 0.98
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(0, -9.5, -20);
    tunnelGroup.add(floorMesh);

    // Glowing Razor-thin Ember LED Guidance Lines along the Floor
    const createFloorStrips = (xOffset: number) => {
      const lineGeo = new THREE.PlaneGeometry(0.35, 120);
      const lineMat = new THREE.MeshBasicMaterial({
        color: 0xFF6B1A,
        transparent: true,
        opacity: 0.95
      });
      const lineMesh = new THREE.Mesh(lineGeo, lineMat);
      lineMesh.rotation.x = -Math.PI / 2;
      lineMesh.position.set(xOffset, -9.4, -20);
      tunnelGroup.add(lineMesh);
    };
    createFloorStrips(-7.5);
    createFloorStrips(7.5);

    // D. Aerodynamic Ribbed Ceiling with Amber LED strips
    const ceilingGeo = new THREE.PlaneGeometry(36, 120);
    const ceilingMat = new THREE.MeshBasicMaterial({ color: 0x070A0E });
    const ceilingMesh = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceilingMesh.rotation.x = Math.PI / 2;
    ceilingMesh.position.set(0, 15, -20);
    tunnelGroup.add(ceilingMesh);

    const createCeilingStrips = (xOffset: number) => {
      const stripGeo = new THREE.PlaneGeometry(0.25, 120);
      const stripMat = new THREE.MeshBasicMaterial({ color: 0xFFA14A });
      const stripMesh = new THREE.Mesh(stripGeo, stripMat);
      stripMesh.rotation.x = Math.PI / 2;
      stripMesh.position.set(xOffset, 14.9, -20);
      tunnelGroup.add(stripMesh);
    };
    createCeilingStrips(-5);
    createCeilingStrips(5);

    // E. Left & Right Walls
    const wallGeo = new THREE.PlaneGeometry(120, 26);
    const wallMat = new THREE.MeshBasicMaterial({ color: 0x0A0F14 });

    const leftWall = new THREE.Mesh(wallGeo, wallMat);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-18, 2, -20);
    tunnelGroup.add(leftWall);

    const rightWall = new THREE.Mesh(wallGeo, wallMat);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(18, 2, -20);
    tunnelGroup.add(rightWall);

    // F. The 4 Interactive Doors Mounted as 3D Canvases Along the Ribs
    // Door 1: Photography (Left, Z = -12)
    const d1Geo = new THREE.PlaneGeometry(12, 16);
    const d1Mat = new THREE.MeshBasicMaterial({ map: specterTex });
    const d1Mesh = new THREE.Mesh(d1Geo, d1Mat);
    d1Mesh.rotation.y = Math.PI / 2;
    d1Mesh.position.set(-17.8, 1, -12);
    tunnelGroup.add(d1Mesh);

    // Door 2: AI Art (Left, Z = -28)
    const d2Geo = new THREE.PlaneGeometry(9, 16);
    const d2Mat = new THREE.MeshBasicMaterial({ map: aiTex });
    const d2Mesh = new THREE.Mesh(d2Geo, d2Mat);
    d2Mesh.rotation.y = Math.PI / 2;
    d2Mesh.position.set(-17.8, 1, -28);
    tunnelGroup.add(d2Mesh);

    // Door 3: AI Music (Right, Z = -12)
    const d3Geo = new THREE.PlaneGeometry(13, 13);
    const d3Mat = new THREE.MeshBasicMaterial({ map: musicTex });
    const d3Mesh = new THREE.Mesh(d3Geo, d3Mat);
    d3Mesh.rotation.y = -Math.PI / 2;
    d3Mesh.position.set(17.8, 1, -12);
    tunnelGroup.add(d3Mesh);

    // Door 4: The Architect (Right, Z = -28)
    const d4Geo = new THREE.PlaneGeometry(12, 15);
    const d4Mat = new THREE.MeshBasicMaterial({ map: archTex });
    const d4Mesh = new THREE.Mesh(d4Geo, d4Mat);
    d4Mesh.rotation.y = -Math.PI / 2;
    d4Mesh.position.set(17.8, 1, -28);
    tunnelGroup.add(d4Mesh);

    // 5. Smooth 60 FPS Animation & Inertia Loop
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      // Smooth interpolation for 360 rotation (no limits!)
      currentYawRef.current += (targetYawRef.current - currentYawRef.current) * 0.09;
      currentPitchRef.current += (targetPitchRef.current - currentPitchRef.current) * 0.09;

      // Smooth camera gliding along tunnel Z axis
      currentZRef.current += (targetZRef.current - currentZRef.current) * 0.08;

      camera.position.z = currentZRef.current;

      // Apply Euler rotation: Order YXZ for natural FPS/Street View look-around
      camera.rotation.order = 'YXZ';
      camera.rotation.y = currentYawRef.current;
      camera.rotation.x = currentPitchRef.current;

      // Keep compass degrees updated
      const deg = Math.round((currentYawRef.current * 180) / Math.PI) % 360;
      setCurrentYawDeg(deg < 0 ? deg + 360 : deg);

      renderer.render(scene, camera);
    };

    animate();

    // 6. Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // 360° Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;

    const deltaX = e.clientX - lastMousePosRef.current.x;
    const deltaY = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    // Continuous 360° horizontal yaw (unclamped!)
    targetYawRef.current += deltaX * 0.0045;

    // Pitch clamped between -65 deg and +65 deg
    const maxPitch = (65 * Math.PI) / 180;
    targetPitchRef.current = Math.max(-maxPitch, Math.min(maxPitch, targetPitchRef.current + deltaY * 0.0035));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div
      ref={mountRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="relative w-full h-full overflow-hidden select-none bg-[#070A0E] cursor-grab active:cursor-grabbing"
    >
      {/* ======================================================== */}
      {/* EYE-LEVEL DOOR INSPECTION POPUP (WHEN CAMERA FACES A DOOR) */}
      {/* ======================================================== */}
      {facingDoor && (
        <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center p-4">
          <div className="pointer-events-auto max-w-lg w-full rounded-2xl glass-hologram p-6 md:p-8 border-2 border-[#FF6B1A] shadow-[0_0_60px_rgba(255,107,26,0.5)] flex flex-col justify-between animate-fade-in">
            
            {/* Header Telemetry */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <span className="font-mono-hud text-xs text-[#38BDF8] tracking-widest font-bold">
                DOOR {facingDoor.doorNumber} // {facingDoor.wall.toUpperCase()} RIB
              </span>
              <span className="font-mono-hud text-[10px] text-[#FFA14A] bg-[#FF6B1A]/20 px-2.5 py-0.5 rounded border border-[#FF6B1A]/50">
                EYE-LEVEL ALIGNED
              </span>
            </div>

            {/* Door Visual Preview & Specs */}
            <div className="flex gap-4 items-center mb-4">
              <div className="w-24 h-24 rounded-xl overflow-hidden border border-[#FF6B1A]/50 shadow-xl flex-shrink-0">
                <img
                  src={facingDoor.image}
                  alt={facingDoor.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex flex-col">
                <h3 className="font-syne text-2xl font-extrabold text-white tracking-wider glow-ember-text">
                  {facingDoor.doorNumber} // {facingDoor.name}
                </h3>
                <span className="font-mono-hud text-xs text-[#FFA14A] font-bold mt-0.5">
                  {facingDoor.subtitle}
                </span>
                <span className="font-inter text-xs text-slate-300 mt-1">
                  {facingDoor.discipline}
                </span>
                <span className="font-mono-hud text-[10px] text-slate-400 mt-1">
                  {facingDoor.specs}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate(facingDoor.id)}
                className="flex-1 py-3 px-4 rounded-xl bg-[#FF6B1A] hover:bg-[#FFA14A] text-slate-950 font-mono-hud text-xs font-bold tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(255,107,26,0.5)] transition-all"
              >
                <span>ENTER {facingDoor.name} CHAMBER</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={returnToTunnelView}
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
      {/* QUICK DOOR JUMP & STREET VIEW CONCOURSE TOOLBAR */}
      {/* ======================================================== */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex items-center gap-2 p-1.5 rounded-full bg-[#070A0E]/90 backdrop-blur-md border border-slate-800 shadow-2xl">
        {DOORS.map((door) => (
          <button
            key={door.id}
            onClick={() => faceDoorDirectly(door)}
            className={`px-3 py-1.5 rounded-full font-mono-hud text-[10px] font-bold flex items-center gap-1.5 transition-all ${
              facingDoor?.id === door.id
                ? 'bg-[#FF6B1A] text-slate-950 shadow-[0_0_15px_rgba(255,107,26,0.6)]'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>{door.doorNumber} // {door.name}</span>
          </button>
        ))}

        {facingDoor && (
          <button
            onClick={returnToTunnelView}
            className="px-2.5 py-1.5 rounded-full font-mono-hud text-[10px] text-[#38BDF8] border border-[#38BDF8]/40 hover:bg-[#38BDF8]/10"
          >
            FORWARD
          </button>
        )}
      </div>

      {/* ======================================================== */}
      {/* STREET VIEW FORWARD/BACK NAVIGATION CONTROLS */}
      {/* ======================================================== */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex items-center gap-3 p-2 rounded-full bg-[#070A0E]/90 backdrop-blur-md border border-slate-800 shadow-2xl">
        <button
          disabled={currentStopIndex >= STOPS.length - 1}
          onClick={() => moveToStop(currentStopIndex + 1)}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full font-mono-hud text-xs font-bold transition-all ${
            currentStopIndex < STOPS.length - 1
              ? 'bg-[#FF6B1A] text-slate-950 hover:bg-[#FFA14A] shadow-[0_0_15px_rgba(255,107,26,0.5)]'
              : 'bg-slate-800/40 text-slate-600 cursor-not-allowed'
          }`}
        >
          <ChevronUp className="w-4 h-4" />
          <span>GLIDE FORWARD</span>
        </button>

        <span className="font-mono-hud text-[10px] text-slate-400">
          STOP 0{currentStopIndex + 1} / 0{STOPS.length}
        </span>

        <button
          disabled={currentStopIndex === 0}
          onClick={() => moveToStop(currentStopIndex - 1)}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full font-mono-hud text-xs font-bold transition-all ${
            currentStopIndex > 0
              ? 'bg-slate-800 text-white hover:bg-slate-700'
              : 'bg-slate-800/40 text-slate-600 cursor-not-allowed'
          }`}
        >
          <ChevronDown className="w-4 h-4" />
          <span>STEP BACK</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* COMPASS ROSE & 360 YAW TELEMETRY */}
      {/* ======================================================== */}
      <div className="absolute bottom-6 right-6 z-20 pointer-events-auto flex items-center gap-3">
        <button
          onClick={returnToTunnelView}
          title="Reset to Center View"
          className="relative w-12 h-12 rounded-full bg-[#070A0E]/90 backdrop-blur-md border border-slate-700 hover:border-[#FF6B1A] shadow-2xl flex items-center justify-center transition-colors group"
        >
          <div
            className="w-full h-full flex items-center justify-center transition-transform duration-75"
            style={{ transform: `rotate(${-currentYawDeg}deg)` }}
          >
            {/* North Red Pointer */}
            <div className="absolute top-2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[10px] border-b-red-500" />
            {/* South White Pointer */}
            <div className="absolute bottom-2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[10px] border-t-white" />
            <div className="w-2 h-2 rounded-full bg-slate-300" />
          </div>
          <span className="absolute -top-1 font-mono-hud text-[8px] font-bold text-red-500">N</span>
        </button>

        <div className="hidden sm:flex flex-col font-mono-hud text-[10px] text-slate-400">
          <span className="text-[#38BDF8] font-bold">360° SPATIAL PAN</span>
          <span>HEADING: {currentYawDeg}°</span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* BOTTOM LEFT LOCATION CARD */}
      {/* ======================================================== */}
      <div className="absolute bottom-6 left-6 z-20 pointer-events-auto hidden sm:flex items-center gap-3 p-3 rounded-xl bg-[#070A0E]/90 backdrop-blur-md border border-slate-800 shadow-2xl">
        <div className="w-8 h-8 rounded-lg bg-[#FF6B1A]/20 border border-[#FF6B1A] flex items-center justify-center text-[#FFA14A]">
          <Camera className="w-4 h-4" />
        </div>
        <div className="flex flex-col font-mono-hud text-xs">
          <span className="font-bold text-white tracking-wider">
            {STOPS[currentStopIndex].label}
          </span>
          <span className="text-[10px] text-slate-400">
            DRAG TO PAN 360° // CLICK DOOR TO FACE EYE-LEVEL
          </span>
        </div>
      </div>

    </div>
  );
};
