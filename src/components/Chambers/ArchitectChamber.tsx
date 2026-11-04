import React, { useState, useEffect, useMemo } from 'react';
import { ArchitectProfile } from '../../types';
import { audioEngine } from '../../utils/audioEngine';
import { 
  Shield, Terminal, ExternalLink, Mail, Check, Copy, X, 
  Cpu, Compass, Sparkles, Activity, Zap, Radio, Globe, 
  CheckCircle2, ArrowRight, CornerRightDown, Layers, Target, Orbit
} from 'lucide-react';

interface ArchitectChamberProps {
  profile: ArchitectProfile;
  mouseOffset: { x: number; y: number };
  onBackToConcourse: () => void;
}

type TelemetryTab = 'perspective' | 'architecture' | 'creative' | 'kinetic';

export const ArchitectChamber: React.FC<ArchitectChamberProps> = ({
  profile,
  mouseOffset,
  onBackToConcourse
}) => {
  const [activeTab, setActiveTab] = useState<TelemetryTab>('perspective');
  const [isCommsModalOpen, setIsCommsModalOpen] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [radarAngle, setRadarAngle] = useState(0);

  // Subtle 3D spatial perspective tilt driven by mouse
  const tiltX = -mouseOffset.y * 3.0;
  const panY = mouseOffset.x * 5.0;
  const roll = mouseOffset.x * 0.8;

  // Continuous sweeping radar beam animation
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    const loop = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      setRadarAngle(prev => (prev + delta * 45) % 360);
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleCopyEmail = () => {
    try {
      audioEngine.playClickSFX();
      navigator.clipboard.writeText(profile.comms.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleTabChange = (tab: TelemetryTab) => {
    if (tab === activeTab) return;
    try { audioEngine.playClickSFX(); } catch {}
    setActiveTab(tab);
  };

  // 6 Radar Axes: AI Engineering, Commercial Strategy, Enterprise Governance, Quantitative Finance, Spatial/Visual Synthesis, Sonic Architecture
  const radarAxes = useMemo(() => [
    { label: 'AI ENGINEERING', angle: -90 },
    { label: 'COMMERCIAL STRATEGY', angle: -30 },
    { label: 'ENTERPRISE GOVERNANCE', angle: 30 },
    { label: 'QUANT FINANCE', angle: 90 },
    { label: 'SPATIAL/VISUAL', angle: 150 },
    { label: 'SONIC ARCHITECTURE', angle: 210 },
  ], []);

  // Dynamic radar profile polygon values depending on active telemetry tab
  const radarValues = useMemo(() => {
    switch (activeTab) {
      case 'perspective':
        // Strategic clarity & commercial intelligence
        return [88, 98, 92, 94, 82, 78];
      case 'architecture':
        // Enterprise AI & Zero-trust multi-agent governance
        return [99, 94, 98, 90, 80, 72];
      case 'creative':
        // Visual optics & sonic synthesis
        return [88, 82, 78, 75, 99, 98];
      case 'kinetic':
        // Endurance & stoic systems execution
        return [92, 95, 90, 93, 85, 84];
    }
  }, [activeTab]);

  // Compute SVG polygon coordinates for the radar chart (radius = 90, center = 120,120)
  const radarPolygonPoints = useMemo(() => {
    const cx = 120;
    const cy = 120;
    const maxRadius = 85;
    return radarValues.map((val, idx) => {
      const rad = (radarAxes[idx].angle * Math.PI) / 180;
      const r = (val / 100) * maxRadius;
      const x = cx + r * Math.cos(rad);
      const y = cy + r * Math.sin(rad);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }, [radarValues, radarAxes]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-[#070A0E] flex flex-col justify-between font-sans">
      
      {/* ======================================================== */}
      {/* 3D ARCHITECTURAL WIND-TUNNEL APEX BACKDROP */}
      {/* ======================================================== */}
      <div 
        className="absolute inset-0 transition-transform duration-300 ease-out pointer-events-none flex items-center justify-center overflow-hidden"
        style={{
          transform: `perspective(1200px) rotateX(${tiltX}deg) rotateY(${panY}deg) rotateZ(${roll}deg) scale(1.05)`,
          transformOrigin: '50% 50%'
        }}
      >
        {/* Receding Wind Tunnel Ribs with Glowing Floor Lights */}
        <img 
          src="/media/vault-rooms/optics_street_clean.jpg"
          alt="Architect Command Apex"
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none opacity-45 brightness-75 contrast-125"
        />

        {/* Ambient Darkened Carbon Texture & Radial Vignette Layer */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#070A0E]/60 to-[#070A0E]/95 pointer-events-none" />

        {/* Floating Perspective Grid Overlay */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(255, 107, 26, 0.1) 1px, transparent 1px),
                              linear-gradient(to bottom, rgba(56, 189, 248, 0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* ======================================================== */}
      {/* TOP HUD BAR: CHAMBER TELEMETRY HEADER */}
      {/* ======================================================== */}
      <div className="relative z-30 w-full px-4 sm:px-6 lg:px-8 pt-2.5 pb-1 flex items-center justify-between shrink-0 pointer-events-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToConcourse}
            className="flex items-center gap-2 font-mono-hud text-[10px] tracking-wider text-[#FFA14A] bg-[#070A0E]/90 hover:bg-[#FF6B1A]/20 px-3 py-1.5 rounded-full border border-[#FF6B1A]/40 hover:border-[#FF6B1A] transition-all cursor-pointer shadow-[0_0_15px_rgba(255,107,26,0.25)]"
          >
            <span>&lt; CONCOURSE</span>
          </button>
          <div className="flex items-center gap-2 font-mono-hud text-[11px] font-bold tracking-widest text-slate-300">
            <span className="text-[#FF6B1A]">CHAMBER // 04:</span>
            <span className="text-white">THE ARCHITECT [COMMAND]</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 font-mono-hud text-[10px] text-slate-400 bg-black/60 px-3 py-1 rounded-full border border-slate-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 font-bold">ARCHITECT COMMAND // ACTIVE</span>
          </div>
          <div className="font-mono-hud text-[10px] text-[#FFA14A]/80 tracking-widest hidden md:inline">
            06.45° N, 03.39° E
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SINGLE-SCREEN 3-COLUMN COCKPIT GRID (ZERO VERTICAL SCROLL) */}
      {/* ======================================================== */}
      <div className="relative z-20 flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 min-h-0 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 h-full max-h-[calc(100vh-145px)] items-stretch">
          
          {/* ======================================================== */}
          {/* COLUMN 1 (LEFT, 3 COLS): THE IDENTITY MONOLITH */}
          {/* ======================================================== */}
          <div className="lg:col-span-3 flex flex-col justify-between p-3.5 sm:p-4 rounded-xl bg-[#070A0E]/85 backdrop-blur-xl border border-[#FF6B1A]/35 shadow-[0_0_30px_rgba(255,107,26,0.15)] relative overflow-hidden group">
            {/* Corner Tech Reticle Accents */}
            <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-[#FF6B1A] pointer-events-none" />
            <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-[#38BDF8] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-[#38BDF8] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-[#FF6B1A] pointer-events-none" />

            {/* Header Badge Row */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 shrink-0">
              <div className="flex items-center gap-1.5 font-mono-hud text-[9px] text-[#38BDF8] tracking-widest font-bold">
                <Shield className="w-3 h-3 text-[#38BDF8]" />
                <span>AI ARCHITECT // PROFILE</span>
              </div>
              <span className="font-mono-hud text-[8px] text-[#FFA14A] bg-[#FF6B1A]/10 border border-[#FF6B1A]/40 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                FOUNDER // NELC DIGITAL
              </span>
            </div>

            {/* Holographic Wireframe Avatar Frame */}
            <div className="relative my-2 w-full aspect-[16/10] sm:aspect-square max-h-44 sm:max-h-52 rounded-lg overflow-hidden border border-[#38BDF8]/40 bg-slate-950/90 shadow-[inset_0_0_20px_rgba(56,189,248,0.2)] flex items-center justify-center shrink-0">
              
              {/* Profile Image Background (if provided) */}
              {profile.avatarUrl ? (
                <img 
                  src={profile.avatarUrl} 
                  alt={profile.name}
                  className="w-full h-full object-cover filter contrast-125 brightness-90 saturate-50"
                  onError={(e) => {
                    // Fallback to cyber wireframe only
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : null}

              {/* 3D Cybernetic Mesh / Wireframe Silhouette Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <svg viewBox="0 0 200 200" className="w-full h-full p-2 opacity-90 drop-shadow-[0_0_12px_rgba(56,189,248,0.6)]">
                  <defs>
                    <linearGradient id="cyberMeshGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9" />
                      <stop offset="50%" stopColor="#818CF8" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#FF6B1A" stopOpacity="0.95" />
                    </linearGradient>
                    <radialGradient id="meshCenterGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* Ambient Glow Aura */}
                  <circle cx="100" cy="95" r="60" fill="url(#meshCenterGlow)" />

                  {/* Wireframe Head & Shoulders Mesh Facets */}
                  <g stroke="url(#cyberMeshGrad)" strokeWidth="0.85" fill="none" opacity="0.85">
                    {/* Head contour */}
                    <path d="M 75 50 Q 100 35 125 50 Q 140 70 135 105 Q 128 135 100 145 Q 72 135 65 105 Q 60 70 75 50 Z" />
                    
                    {/* Internal wireframe facial lattice */}
                    <line x1="100" y1="35" x2="100" y2="145" strokeDasharray="2,2" strokeWidth="1" />
                    <line x1="75" y1="70" x2="125" y2="70" />
                    <line x1="70" y1="95" x2="130" y2="95" />
                    <line x1="80" y1="120" x2="120" y2="120" />
                    
                    {/* Triangulation vectors */}
                    <polygon points="100,35 75,50 100,70" fill="rgba(56,189,248,0.06)" />
                    <polygon points="100,35 125,50 100,70" fill="rgba(255,107,26,0.06)" />
                    <polygon points="75,50 65,105 100,95" />
                    <polygon points="125,50 135,105 100,95" />
                    <polygon points="100,95 70,95 80,120" />
                    <polygon points="100,95 130,95 120,120" />
                    <polygon points="80,120 100,145 120,120" fill="rgba(56,189,248,0.08)" />

                    {/* Torso / collarbone cyber lines */}
                    <path d="M 65 135 Q 40 160 20 190 L 180 190 Q 160 160 135 135" />
                    <line x1="100" y1="145" x2="100" y2="190" strokeDasharray="3,3" />
                    <line x1="65" y1="135" x2="100" y2="165" />
                    <line x1="135" y1="135" x2="100" y2="165" />
                    <line x1="45" y1="165" x2="100" y2="165" />
                    <line x1="155" y1="165" x2="100" y2="165" />
                  </g>

                  {/* Pulsing Vertex Nodes */}
                  <g fill="#38BDF8">
                    <circle cx="100" cy="35" r="2.2" className="animate-pulse" />
                    <circle cx="75" cy="50" r="1.8" />
                    <circle cx="125" cy="50" r="1.8" />
                    <circle cx="100" cy="70" r="2.2" fill="#FFA14A" />
                    <circle cx="85" cy="90" r="1.5" />
                    <circle cx="115" cy="90" r="1.5" />
                    <circle cx="100" cy="110" r="2" fill="#FFA14A" />
                    <circle cx="100" cy="145" r="2.2" />
                  </g>
                </svg>
              </div>

              {/* Sweeping Cyan Scanning Laser Bar */}
              <div 
                className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#38BDF8] to-transparent shadow-[0_0_12px_#38BDF8] pointer-events-none animate-scan"
                style={{
                  animationDuration: '3.5s',
                  animationIterationCount: 'infinite'
                }}
              />

              {/* Holographic Scanline Texture */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-25"
                style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, rgba(56, 189, 248, 0.15) 0px, transparent 2px, transparent 4px)'
                }}
              />

              {/* Bottom Viewport HUD Overlay Tags */}
              <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between pointer-events-none">
                <span className="font-mono-hud text-[7px] text-[#38BDF8]/90 tracking-wider">
                  SCAN // 894.2 Hz
                </span>
                <span className="font-mono-hud text-[7px] text-[#FFA14A] tracking-wider font-bold">
                  HOLO-ID // ACTIVE
                </span>
              </div>
            </div>

            {/* Name & Callsign Block */}
            <div className="shrink-0">
              <h2 className="font-syne text-xl sm:text-2xl font-extrabold text-white tracking-wider glow-ember-text leading-tight uppercase">
                {profile.name}
              </h2>

              <div className="font-mono-hud text-[10px] text-[#FFA14A] tracking-wider mt-1 font-bold flex items-center gap-1.5 bg-[#FF6B1A]/10 px-2 py-0.5 rounded border border-[#FF6B1A]/30">
                <span>CALLSIGN:</span>
                <span className="text-white">LXWRVNX // THE ARCHITECT</span>
              </div>
            </div>

            {/* 4 Role Pills */}
            <div className="grid grid-cols-2 gap-1.5 my-2 shrink-0">
              {[
                'AI Transformation Consultant',
                'AI Architect & Engineer',
                'Creative Technologist',
                'AI Artist'
              ].map((role, idx) => (
                <div 
                  key={idx}
                  className="font-mono-hud text-[8px] font-bold text-slate-300 bg-[#38BDF8]/10 hover:bg-[#38BDF8]/20 border border-[#38BDF8]/30 px-1.5 py-1 rounded text-center truncate tracking-tight transition-all"
                  title={role}
                >
                  {role}
                </div>
              ))}
            </div>

            {/* Core Thesis Quote Box */}
            <div className="p-2.5 rounded-lg bg-[#FF6B1A]/10 border-l-2 border-[#FF6B1A] font-inter text-[10px] sm:text-[11px] text-slate-200 leading-snug italic shadow-[inset_0_0_12px_rgba(255,107,26,0.1)] shrink-0">
              "Architecting secure, governed commercial intelligence systems that translate cross-sector complexity into structured intelligence for strategic decision-making."
            </div>
          </div>

          {/* ======================================================== */}
          {/* COLUMN 2 (CENTER, 6 COLS): RADAR & TABBED BRIEFINGS */}
          {/* ======================================================== */}
          <div className="lg:col-span-6 flex flex-col justify-between p-3.5 sm:p-4 rounded-xl bg-[#070A0E]/80 backdrop-blur-xl border border-slate-800 shadow-[0_0_35px_rgba(0,0,0,0.8)] relative overflow-hidden">
            
            {/* Top Half: 6-Axis Interactive Radar & Multi-Agent Node Visualizer */}
            <div className="relative w-full h-[180px] sm:h-[220px] rounded-xl bg-[#07090C]/90 border border-slate-800/80 p-2 overflow-hidden flex items-center justify-center shrink-0">
              
              {/* Background Radar Range Rings & Crosshairs */}
              <svg viewBox="0 0 240 240" className="w-full h-full max-h-[210px] overflow-visible">
                <defs>
                  {/* Rotating Radar Sweep Cone Gradient */}
                  <linearGradient id="radarSweep" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FF6B1A" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
                  </linearGradient>
                  
                  {/* Radar Polygon Area Gradient */}
                  <linearGradient id="radarPolyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FF6B1A" stopOpacity="0.45" />
                    <stop offset="50%" stopColor="#FFA14A" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.4" />
                  </linearGradient>
                </defs>

                {/* Concentric Range Rings */}
                {[20, 40, 60, 80].map((r) => (
                  <circle
                    key={r}
                    cx="120"
                    cy="120"
                    r={r}
                    fill="none"
                    stroke="#1E293B"
                    strokeWidth="0.75"
                    strokeDasharray={r === 80 ? 'none' : '3 3'}
                  />
                ))}
                
                {/* Outer Perimeter Ring */}
                <circle cx="120" cy="120" r="85" fill="none" stroke="#FF6B1A" strokeWidth="1" opacity="0.6" />

                {/* 6 Radar Axis Lines */}
                {radarAxes.map((axis, i) => {
                  const rad = (axis.angle * Math.PI) / 180;
                  const x2 = 120 + 85 * Math.cos(rad);
                  const y2 = 120 + 85 * Math.sin(rad);
                  return (
                    <line
                      key={i}
                      x1="120"
                      y1="120"
                      x2={x2}
                      y2={y2}
                      stroke="#334155"
                      strokeWidth="0.8"
                    />
                  );
                })}

                {/* Rotating Amber/Cyan Radar Sweeper Cone */}
                <g transform={`rotate(${radarAngle} 120 120)`}>
                  <path
                    d="M 120 120 L 205 120 A 85 85 0 0 1 180 180 Z"
                    fill="url(#radarSweep)"
                  />
                  <line x1="120" y1="120" x2="205" y2="120" stroke="#FF6B1A" strokeWidth="1.5" />
                </g>

                {/* Dynamic Polygon Strength Area */}
                <polygon
                  points={radarPolygonPoints}
                  fill="url(#radarPolyGrad)"
                  stroke="#FF6B1A"
                  strokeWidth="1.75"
                  className="transition-all duration-700 ease-out"
                />

                {/* Animated Vertices & Neural Graph Nodes */}
                {radarValues.map((val, idx) => {
                  const rad = (radarAxes[idx].angle * Math.PI) / 180;
                  const r = (val / 100) * 85;
                  const x = 120 + r * Math.cos(rad);
                  const y = 120 + r * Math.sin(rad);
                  return (
                    <g key={idx} className="transition-all duration-700 ease-out">
                      <circle cx={x} cy={y} r="3" fill="#38BDF8" stroke="#070A0E" strokeWidth="1" />
                      <circle cx={x} cy={y} r="5" fill="none" stroke="#FFA14A" strokeWidth="0.75" className="animate-ping" />
                    </g>
                  );
                })}

                {/* Axis Labels */}
                {radarAxes.map((axis, idx) => {
                  const rad = (axis.angle * Math.PI) / 180;
                  const lx = 120 + 104 * Math.cos(rad);
                  const ly = 120 + 104 * Math.sin(rad);
                  return (
                    <text
                      key={idx}
                      x={lx}
                      y={ly + 3}
                      fill="#94A3B8"
                      fontSize="6.5"
                      fontFamily="monospace"
                      fontWeight="bold"
                      textAnchor="middle"
                      className="select-none tracking-tight"
                    >
                      {axis.label}
                    </text>
                  );
                })}
              </svg>

              {/* Side Floating Badge: SYS.ACT // 04 */}
              <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/75 border border-slate-800 font-mono-hud text-[8px] text-slate-300">
                <Activity className="w-2.5 h-2.5 text-[#FF6B1A]" />
                <span>SYS.ACT // 04</span>
              </div>

              {/* Real-Time Waveform Indicator (Bottom Right) */}
              <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1 px-2 py-1 rounded bg-black/75 border border-slate-800 font-mono-hud text-[8px] text-[#38BDF8]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] animate-pulse" />
                <span>NEURAL FLOW: ACTIVE</span>
              </div>
            </div>

            {/* Middle: 4 Sleek Horizontal HUD Selector Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 my-2.5 shrink-0">
              {[
                { id: 'perspective', label: '01 // STRATEGIC PERSPECTIVE' },
                { id: 'architecture', label: '02 // ENTERPRISE ARCHITECTURE' },
                { id: 'creative', label: '03 // VISUAL & SONIC MATRIX' },
                { id: 'kinetic', label: '04 // KINETIC DISCIPLINE' },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id as TelemetryTab)}
                    className={`px-2 py-1.5 rounded-lg font-mono-hud text-[9px] sm:text-[10px] font-bold tracking-wider transition-all cursor-pointer text-center truncate ${
                      isActive
                        ? 'bg-[#FF6B1A] text-slate-950 border border-[#FFA14A] shadow-[0_0_15px_rgba(255,107,26,0.5)] scale-[1.02]'
                        : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Bottom Half: Single Punchy Active Telemetry Briefing Card */}
            <div className="flex-1 min-h-[140px] p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between transition-all duration-300">
              {activeTab === 'perspective' && (
                <div className="flex flex-col justify-between h-full animate-fade-in">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Compass className="w-3.5 h-3.5 text-[#FF6B1A]" />
                      <span className="font-mono-hud text-xs font-bold text-white tracking-widest uppercase">
                        MAKING SENSE OF COMPLEXITY
                      </span>
                    </div>
                    <p className="font-inter text-xs text-slate-300 leading-relaxed">
                      "The scarcest resource inside modern organizations is not information—it is clarity. Commercial Intelligence transforms fragmented signals across market dynamics, operations, and emerging tech into decisive, actionable execution."
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 font-mono-hud text-[9px] text-[#FFA14A]">
                    <span>SIGNAL SYNTHESIS: <strong className="text-white">99.4%</strong></span>
                    <span>FOCUS: <strong className="text-white">COMMERCIAL INTELLIGENCE</strong></span>
                    <span>MODE: <strong className="text-white">CROSS-SECTOR</strong></span>
                  </div>
                </div>
              )}

              {activeTab === 'architecture' && (
                <div className="flex flex-col justify-between h-full animate-fade-in">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Cpu className="w-3.5 h-3.5 text-[#38BDF8]" />
                      <span className="font-mono-hud text-xs font-bold text-white tracking-widest uppercase">
                        GOVERNANCE & MULTI-AGENT PLATFORMS
                      </span>
                    </div>
                    <p className="font-inter text-xs text-slate-300 leading-relaxed">
                      "Moving beyond basic automation to engineer systems that fundamentally upgrade how organizations perceive, reason, and act. Deploying zero-trust, governed multi-agent workflows with measurable commercial impact."
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 font-mono-hud text-[9px] text-[#38BDF8]">
                    <span>ARCHITECTURE: <strong className="text-white">MULTI-AGENT RAG</strong></span>
                    <span>SECURITY: <strong className="text-white">ZERO-TRUST / GOVERNED</strong></span>
                    <span>PRACTICE: <strong className="text-white">NELC DIGITAL</strong></span>
                  </div>
                </div>
              )}

              {activeTab === 'creative' && (
                <div className="flex flex-col justify-between h-full animate-fade-in">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#FFA14A]" />
                      <span className="font-mono-hud text-xs font-bold text-white tracking-widest uppercase">
                        LXWRVNX // CREATIVE SYNTHESIS
                      </span>
                    </div>
                    <p className="font-inter text-xs text-slate-300 leading-relaxed">
                      "Where algorithmic precision meets human aesthetics. Directing long-exposure optical photography, custom generative AI cinema pipelines, and dark atmospheric wave/phonk sonic engineering."
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 font-mono-hud text-[9px] text-[#FFA14A]">
                    <span>OPTICS: <strong className="text-white">LONG-EXPOSURE</strong></span>
                    <span>SYNTHESIS: <strong className="text-white">CUSTOM PIPELINES</strong></span>
                    <span>ACOUSTICS: <strong className="text-white">WAVE / PHONK</strong></span>
                  </div>
                </div>
              )}

              {activeTab === 'kinetic' && (
                <div className="flex flex-col justify-between h-full animate-fade-in">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-mono-hud text-xs font-bold text-white tracking-widest uppercase">
                        ENDURANCE & SYSTEMS MINDSET
                      </span>
                    </div>
                    <p className="font-inter text-xs text-slate-300 leading-relaxed">
                      "High-output technical execution requires physical and mental rigor. Built on the intersection of quantitative problem-solving, long-distance marathon endurance, and kinetic discipline."
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 font-mono-hud text-[9px] text-emerald-400">
                    <span>MINDSET: <strong className="text-white">STOIC SYSTEMS</strong></span>
                    <span>PACING: <strong className="text-white">MARATHON ENDURANCE</strong></span>
                    <span>PRECISION: <strong className="text-white">DETERMINISTIC</strong></span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ======================================================== */}
          {/* COLUMN 3 (RIGHT, 3 COLS): TELEMETRY, CREDENTIALS & COMMS */}
          {/* ======================================================== */}
          <div className="lg:col-span-3 flex flex-col justify-between p-3.5 sm:p-4 rounded-xl bg-[#070A0E]/85 backdrop-blur-xl border border-slate-800 shadow-[0_0_30px_rgba(0,0,0,0.8)] relative overflow-hidden">
            
            {/* Module 1: SYSTEM CAPABILITIES & GAUGES */}
            <div className="shrink-0">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-2">
                <span className="font-mono-hud text-[9px] text-[#38BDF8] tracking-widest font-bold">
                  OPERATIONAL METRICS // HUD
                </span>
                <span className="font-mono-hud text-[8px] text-slate-500">
                  REAL-TIME
                </span>
              </div>

              {/* Progress Telemetry Readouts */}
              <div className="space-y-1.5 font-mono-hud text-[8px]">
                <div>
                  <div className="flex justify-between text-slate-400 mb-0.5">
                    <span>MULTI-AGENT ORCHESTRATION</span>
                    <span className="text-[#38BDF8] font-bold">OPTIMAL</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div className="h-full bg-gradient-to-r from-[#38BDF8] to-[#FF6B1A] w-[97%] rounded-full shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-0.5">
                    <span>FINAI & COMMERCIAL STRATEGY</span>
                    <span className="text-[#FFA14A] font-bold">ACTIVE</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div className="h-full bg-gradient-to-r from-[#FF6B1A] to-[#FFA14A] w-[94%] rounded-full shadow-[0_0_8px_rgba(255,107,26,0.5)]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-0.5">
                    <span>DATA GOVERNANCE & SECURITY</span>
                    <span className="text-emerald-400 font-bold">ENFORCED</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div className="h-full bg-emerald-400 w-[99%] rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-0.5">
                    <span>CREATIVE SYNTHESIS (OPTICS/AI)</span>
                    <span className="text-purple-400 font-bold">ONLINE</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-[#38BDF8] w-[96%] rounded-full shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                  </div>
                </div>
              </div>

              {/* 3 Circular Dial Gauges (Matching Mockup) */}
              <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-slate-800/80 text-center font-mono-hud">
                {/* Dial 1: Throughput */}
                <div className="flex flex-col items-center">
                  <div className="relative w-11 h-11 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90">
                      <circle cx="22" cy="22" r="18" fill="none" stroke="#1E293B" strokeWidth="2.5" />
                      <circle cx="22" cy="22" r="18" fill="none" stroke="#FFA14A" strokeWidth="2.5" strokeDasharray="113" strokeDashoffset="28" strokeLinecap="round" />
                    </svg>
                    <span className="absolute text-[9px] font-bold text-white">3.20</span>
                  </div>
                  <span className="text-[7px] text-slate-400 uppercase mt-0.5 tracking-tight">THROUGHPUT</span>
                </div>

                {/* Dial 2: AI Orchestrations */}
                <div className="flex flex-col items-center">
                  <div className="relative w-11 h-11 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90">
                      <circle cx="22" cy="22" r="18" fill="none" stroke="#1E293B" strokeWidth="2.5" />
                      <circle cx="22" cy="22" r="18" fill="none" stroke="#38BDF8" strokeWidth="2.5" strokeDasharray="113" strokeDashoffset="18" strokeLinecap="round" />
                    </svg>
                    <Target className="absolute w-3.5 h-3.5 text-[#38BDF8]" />
                  </div>
                  <span className="text-[7px] text-slate-400 uppercase mt-0.5 tracking-tight">ORCHESTRATION</span>
                </div>

                {/* Dial 3: Network Load */}
                <div className="flex flex-col items-center">
                  <div className="relative w-11 h-11 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90">
                      <circle cx="22" cy="22" r="18" fill="none" stroke="#1E293B" strokeWidth="2.5" />
                      <circle cx="22" cy="22" r="18" fill="none" stroke="#FF6B1A" strokeWidth="2.5" strokeDasharray="113" strokeDashoffset="8" strokeLinecap="round" />
                    </svg>
                    <span className="absolute text-[8px] font-bold text-emerald-400">100%</span>
                  </div>
                  <span className="text-[7px] text-slate-400 uppercase mt-0.5 tracking-tight">UPTIME LOAD</span>
                </div>
              </div>
            </div>

            {/* Module 2: OPERATIONAL CREDENTIALS MATRIX */}
            <div className="my-2 py-2 border-y border-slate-800/80 shrink-0">
              <div className="font-mono-hud text-[8px] text-slate-400 tracking-wider uppercase mb-1.5 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>CREDENTIALS // CERTIFIED</span>
              </div>

              {/* 4 Hexagonal / Shield Badges matching Mockup */}
              <div className="grid grid-cols-4 gap-1 mb-2">
                {/* ACCA */}
                <div className="flex flex-col items-center justify-center py-1 rounded bg-red-950/40 border border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                  <span className="font-mono-hud text-[8px] font-black text-red-400">ACCA</span>
                  <span className="font-mono-hud text-[6px] text-red-300">CERT</span>
                </div>
                {/* IBM AI */}
                <div className="flex flex-col items-center justify-center py-1 rounded bg-blue-950/40 border border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                  <span className="font-mono-hud text-[8px] font-black text-blue-400">IBM</span>
                  <span className="font-mono-hud text-[6px] text-blue-300">DATA SCI</span>
                </div>
                {/* AZURE AI */}
                <div className="flex flex-col items-center justify-center py-1 rounded bg-sky-950/40 border border-sky-400/50 shadow-[0_0_10px_rgba(56,189,248,0.2)]">
                  <span className="font-mono-hud text-[8px] font-black text-sky-300">AZURE</span>
                  <span className="font-mono-hud text-[6px] text-sky-200">AI ENG</span>
                </div>
                {/* MSc / SCRUM */}
                <div className="flex flex-col items-center justify-center py-1 rounded bg-emerald-950/40 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                  <span className="font-mono-hud text-[8px] font-black text-emerald-400">MSc</span>
                  <span className="font-mono-hud text-[6px] text-emerald-300">FINANCE</span>
                </div>
              </div>

              {/* Minimal 2x2 HUD Matrix List */}
              <div className="grid grid-cols-2 gap-1 font-mono-hud text-[8px] text-slate-300">
                <div className="p-1 rounded bg-slate-900/80 border border-slate-800 truncate">
                  • MSc // FINANCE
                </div>
                <div className="p-1 rounded bg-slate-900/80 border border-slate-800 truncate">
                  • ACCA // CERTIFIED
                </div>
                <div className="p-1 rounded bg-slate-900/80 border border-slate-800 truncate">
                  • AZURE & IBM // AI ENG
                </div>
                <div className="p-1 rounded bg-slate-900/80 border border-slate-800 truncate">
                  • FOUNDER // NELC DIGITAL
                </div>
              </div>
            </div>

            {/* Module 3: DIRECT COMMS // UPLINK TERMINAL */}
            <div className="shrink-0 flex flex-col gap-2">
              <button
                onClick={() => {
                  try { audioEngine.playLockOnSFX(); } catch {}
                  setIsCommsModalOpen(true);
                }}
                className="w-full py-2.5 rounded-lg font-mono-hud text-xs font-black tracking-widest bg-[#FF6B1A] hover:bg-[#FFA14A] text-slate-950 transition-all border border-[#FFA14A] shadow-[0_0_20px_rgba(255,107,26,0.6)] cursor-pointer flex items-center justify-center gap-2 group active:scale-[0.98]"
              >
                <Terminal className="w-4 h-4 transition-transform group-hover:rotate-12" />
                <span>DIRECT COMMS // TERMINAL</span>
              </button>

              {/* Quick Link Icon Tray */}
              <div className="grid grid-cols-4 gap-1.5">
                <a
                  href={profile.comms.organizationUrl || 'https://nelcdigital.com'}
                  target="_blank"
                  rel="noreferrer"
                  title="Nelc Digital Enterprise Architecture"
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-[#38BDF8]/20 border border-slate-800 hover:border-[#38BDF8] text-slate-400 hover:text-[#38BDF8] flex items-center justify-center transition-all cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5" />
                </a>

                <a
                  href={profile.comms.github || 'https://github.com/lxwrvnx'}
                  target="_blank"
                  rel="noreferrer"
                  title="GitHub Architecture Repositories"
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-white/20 border border-slate-800 hover:border-white text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                >
                  <Terminal className="w-3.5 h-3.5" />
                </a>

                <a
                  href={profile.comms.twitter || 'https://twitter.com/lxwrvnx'}
                  target="_blank"
                  rel="noreferrer"
                  title="X / Creative Matrix"
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-[#FFA14A]/20 border border-slate-800 hover:border-[#FFA14A] text-slate-400 hover:text-[#FFA14A] flex items-center justify-center transition-all cursor-pointer"
                >
                  <Radio className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={handleCopyEmail}
                  title="Copy Direct Email"
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-[#FF6B1A]/20 border border-slate-800 hover:border-[#FF6B1A] text-slate-400 hover:text-[#FF6B1A] flex items-center justify-center transition-all cursor-pointer"
                >
                  {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Mail className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* ======================================================== */}
      {/* DIRECT COMMS ENCRYPTED SLIDE-OVER / MODAL */}
      {/* ======================================================== */}
      {isCommsModalOpen && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsCommsModalOpen(false);
          }}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in pointer-events-auto"
        >
          <div className="relative w-full max-w-lg p-6 rounded-2xl bg-[#070A0E] border-2 border-[#FF6B1A] shadow-[0_0_50px_rgba(255,107,26,0.5)] flex flex-col gap-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#FF6B1A]" />
                <span className="font-mono-hud text-xs font-bold text-white tracking-widest">
                  ENCRYPTED TRANSMISSION // COMMS TERMINAL
                </span>
              </div>
              <button
                onClick={() => setIsCommsModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-red-500/20 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="font-inter text-xs text-slate-300 leading-relaxed">
              Initiate direct contact with Lawrence Emenike (lxwrvnx) for AI architecture consultation, commercial intelligence advisory, enterprise governance engagements, or creative synthesis commissions.
            </p>

            {/* Direct Dispatch Options */}
            <div className="space-y-2.5">
              {/* Copy Email Button */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-[#FF6B1A] transition-all">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[#FFA14A]" />
                  <div>
                    <div className="font-mono-hud text-[9px] text-slate-500">OFFICIAL ARCHITECT EMAIL</div>
                    <div className="font-mono-hud text-xs font-bold text-white">{profile.comms.email}</div>
                  </div>
                </div>
                <button
                  onClick={handleCopyEmail}
                  className="px-3 py-1.5 rounded-lg font-mono-hud text-[10px] font-bold bg-[#FF6B1A]/20 hover:bg-[#FF6B1A] text-[#FFA14A] hover:text-slate-950 transition-all border border-[#FF6B1A]/50 cursor-pointer flex items-center gap-1"
                >
                  {copiedEmail ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedEmail ? 'COPIED' : 'COPY'}</span>
                </button>
              </div>

              {/* Organization Link */}
              <a
                href={profile.comms.organizationUrl || 'https://nelcdigital.com'}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-[#38BDF8] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-[#38BDF8]" />
                  <div>
                    <div className="font-mono-hud text-[9px] text-slate-500">ENTERPRISE PRACTICE</div>
                    <div className="font-mono-hud text-xs font-bold text-white group-hover:text-[#38BDF8] transition-colors">
                      Nelc Digital // nelcdigital.com
                    </div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-white" />
              </a>

              {/* GitHub */}
              <a
                href={profile.comms.github || 'https://github.com/lxwrvnx'}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-white transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Terminal className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="font-mono-hud text-[9px] text-slate-500">RESEARCH & CODE LAB</div>
                    <div className="font-mono-hud text-xs font-bold text-white">github.com/lxwrvnx</div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-white" />
              </a>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 flex items-center justify-between font-mono-hud text-[9px] text-slate-500 border-t border-slate-800/80">
              <span>STATUS: DISPATCH READY</span>
              <span>SHA-256 AUDIT VERIFIED</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
