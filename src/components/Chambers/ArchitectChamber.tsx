import React, { useState, useEffect, useMemo } from 'react';
import { ArchitectProfile } from '../../types';
import { audioEngine } from '../../utils/audioEngine';
import {
  Shield,
  Terminal,
  ExternalLink,
  Mail,
  Check,
  Copy,
  X,
  Cpu,
  Compass,
  Sparkles,
  Activity,
  Globe,
  CheckCircle2,
  Target,
  Lock
} from 'lucide-react';

const LinkedInIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const GitHubIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

interface ArchitectChamberProps {
  profile: ArchitectProfile;
  mouseOffset: { x: number; y: number };
  onBackToConcourse: () => void;
}

type TelemetryTab = 'perspective' | 'architecture' | 'creative' | 'kinetic';

interface BriefingData {
  id: TelemetryTab;
  tabLabel: string;
  headline: string;
  briefing: string;
  metrics: { label: string; value: string }[];
  accentColor: string;
  radarScores: [number, number, number, number, number, number];
  activeConnections: [number, number][];
}

const TELEMETRY_BRIEFINGS: Record<TelemetryTab, BriefingData> = {
  perspective: {
    id: 'perspective',
    tabLabel: '01 // STRATEGIC PERSPECTIVE',
    headline: 'MAKING SENSE OF COMPLEXITY',
    briefing:
      '"The scarcest resource inside modern organizations is not information—it is clarity. Commercial Intelligence transforms fragmented signals across market dynamics, operations, and emerging tech into decisive, actionable execution."',
    metrics: [
      { label: 'SIGNAL SYNTHESIS', value: '99.4%' },
      { label: 'FOCUS', value: 'COMMERCIAL INTELLIGENCE' },
      { label: 'MODE', value: 'CROSS-SECTOR' }
    ],
    accentColor: '#FF6B1A',
    radarScores: [90, 99, 94, 96, 82, 78],
    activeConnections: [
      [1, 3],
      [1, 2],
      [0, 1],
      [2, 3]
    ]
  },
  architecture: {
    id: 'architecture',
    tabLabel: '02 // ENTERPRISE ARCHITECTURE',
    headline: 'GOVERNANCE & MULTI-AGENT PLATFORMS',
    briefing:
      '"Moving beyond basic automation to engineer systems that fundamentally upgrade how organizations perceive, reason, and act. Deploying zero-trust, governed multi-agent workflows with measurable commercial impact."',
    metrics: [
      { label: 'ARCHITECTURE', value: 'MULTI-AGENT RAG' },
      { label: 'SECURITY', value: 'ZERO-TRUST / GOVERNED' },
      { label: 'ENTITY', value: 'NELC DIGITAL' }
    ],
    accentColor: '#38BDF8',
    radarScores: [99, 94, 99, 92, 80, 75],
    activeConnections: [
      [0, 2],
      [0, 1],
      [2, 3],
      [0, 3]
    ]
  },
  creative: {
    id: 'creative',
    tabLabel: '03 // VISUAL & SONIC MATRIX',
    headline: 'LXWRVNX // CREATIVE SYNTHESIS',
    briefing:
      '"Where algorithmic precision meets human aesthetics. Directing long-exposure optical photography, custom generative AI cinema pipelines, and dark atmospheric wave/phonk sonic engineering."',
    metrics: [
      { label: 'OPTICS', value: 'MANUAL LONG-EXPOSURE' },
      { label: 'SYNTHESIS', value: 'CUSTOM PIPELINES' },
      { label: 'ACOUSTICS', value: 'WAVE / PHONK' }
    ],
    accentColor: '#FFA14A',
    radarScores: [92, 82, 80, 78, 99, 99],
    activeConnections: [
      [4, 5],
      [0, 4],
      [0, 5],
      [1, 4]
    ]
  },
  kinetic: {
    id: 'kinetic',
    tabLabel: '04 // KINETIC DISCIPLINE',
    headline: 'ENDURANCE & SYSTEMS MINDSET',
    briefing:
      '"High-output technical execution requires physical and mental rigor. Built on the intersection of quantitative problem-solving, long-distance marathon endurance, and kinetic discipline."',
    metrics: [
      { label: 'MINDSET', value: 'STOIC SYSTEMS' },
      { label: 'PACING', value: 'LONG-RANGE ENDURANCE' },
      { label: 'PRECISION', value: 'HIGH' }
    ],
    accentColor: '#34D399',
    radarScores: [95, 96, 94, 98, 88, 86],
    activeConnections: [
      [0, 3],
      [1, 3],
      [2, 4],
      [3, 5]
    ]
  }
};

export const ArchitectChamber: React.FC<ArchitectChamberProps> = ({
  profile,
  mouseOffset,
  onBackToConcourse: _onBackToConcourse
}) => {
  const [activeTab, setActiveTab] = useState<TelemetryTab>('perspective');
  const [isCommsModalOpen, setIsCommsModalOpen] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [radarAngle, setRadarAngle] = useState(0);

  // Subtle 3D spatial perspective tilt driven by mouse movement
  const tiltX = -mouseOffset.y * 3.2;
  const panY = mouseOffset.x * 5.2;
  const roll = mouseOffset.x * 0.8;

  // Continuous 60fps sweeping radar beam animation
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    const loop = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      setRadarAngle(prev => (prev + delta * 48) % 360);
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
      // Clipboard fallback
    }
  };

  const handleTabChange = (tab: TelemetryTab) => {
    if (tab === activeTab) return;
    try {
      audioEngine.playClickSFX();
    } catch {}
    setActiveTab(tab);
  };

  // 6 Radar Axes matching specification
  const radarAxes = useMemo(
    () => [
      { label: 'AI Engineering', shortLabel: 'AI ENGINEERING', angle: -90 },
      { label: 'Commercial Strategy', shortLabel: 'COMMERCIAL STRATEGY', angle: -30 },
      { label: 'Enterprise Governance', shortLabel: 'ENTERPRISE GOVERNANCE', angle: 30 },
      { label: 'Quantitative Finance', shortLabel: 'QUANTITATIVE FINANCE', angle: 90 },
      { label: 'Spatial/Visual Synthesis', shortLabel: 'SPATIAL/VISUAL SYNTHESIS', angle: 150 },
      { label: 'Sonic Architecture', shortLabel: 'SONIC ARCHITECTURE', angle: 210 }
    ],
    []
  );

  const currentBriefing = TELEMETRY_BRIEFINGS[activeTab];
  const radarValues = currentBriefing.radarScores;

  // Compute SVG coordinates for the 6-axis radar chart & multi-agent node graph (center = 200, 115, maxRadius = 76)
  const radarGeometry = useMemo(() => {
    const cx = 200;
    const cy = 115;
    const maxRadius = 76;

    const nodes = radarValues.map((val, idx) => {
      const rad = (radarAxes[idx].angle * Math.PI) / 180;
      const r = (val / 100) * maxRadius;
      const x = cx + r * Math.cos(rad);
      const y = cy + r * Math.sin(rad);
      const axisEndX = cx + maxRadius * Math.cos(rad);
      const axisEndY = cy + maxRadius * Math.sin(rad);
      const labelRadius = maxRadius + 22;
      const lx = cx + labelRadius * Math.cos(rad);
      const ly = cy + labelRadius * Math.sin(rad);
      return {
        x,
        y,
        val,
        axisEndX,
        axisEndY,
        lx,
        ly,
        angle: radarAxes[idx].angle,
        label: radarAxes[idx].shortLabel
      };
    });

    const polygonPoints = nodes.map(n => `${n.x.toFixed(1)},${n.y.toFixed(1)}`).join(' ');

    return { cx, cy, maxRadius, nodes, polygonPoints };
  }, [radarValues, radarAxes]);

  const linkedinUrl = profile.comms.linkedin || 'https://www.linkedin.com/in/lawrenceemenike';
  const githubUrl = profile.comms.github || 'https://github.com/lawrenceemenike';
  const nelcUrl = profile.comms.organizationUrl || 'https://nelcdigital.com';

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-[#070A0E] flex items-center justify-center font-sans">
      {/* ======================================================== */}
      {/* 3D ARCHITECTURAL WIND-TUNNEL APEX BACKDROP               */}
      {/* ======================================================== */}
      <div
        className="absolute inset-0 transition-transform duration-300 ease-out pointer-events-none flex items-center justify-center overflow-hidden"
        style={{
          transform: `perspective(1200px) rotateX(${tiltX}deg) rotateY(${panY}deg) rotateZ(${roll}deg) scale(1.08)`,
          transformOrigin: '50% 50%'
        }}
      >
        {/* Receding Wind-Tunnel Apex Base Image */}
        <img
          src="/media/vault-rooms/concourse.jpg"
          alt="Architect Wind-Tunnel Apex"
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none opacity-35 brightness-75 contrast-125 scale-125"
        />

        {/* Procedural 3D Receding Wind-Tunnel Ribs & Glowing Ember Floor/Ceiling Strips */}
        <svg
          viewBox="0 0 1600 900"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 w-full h-full opacity-65 pointer-events-none"
        >
          <defs>
            <linearGradient id="emberStripGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FF6B1A" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#FFA14A" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#FF6B1A" stopOpacity="0.95" />
            </linearGradient>
            <radialGradient id="apexPortalGlow" cx="50%" cy="50%" r="45%">
              <stop offset="0%" stopColor="#FF6B1A" stopOpacity="0.22" />
              <stop offset="45%" stopColor="#38BDF8" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#070A0E" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Central Wind-Tunnel Apex Ambient Glow */}
          <circle cx="800" cy="450" r="420" fill="url(#apexPortalGlow)" />

          {/* Receding Wind-Tunnel Structural Ribs */}
          {[0.92, 0.76, 0.62, 0.49, 0.38, 0.29].map((scale, i) => {
            const w = 1520 * scale;
            const h = 840 * scale;
            const x = 800 - w / 2;
            const y = 450 - h / 2;
            const rx = 140 * scale;
            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={w}
                height={h}
                rx={rx}
                fill="none"
                stroke={i % 2 === 0 ? '#1E293B' : '#0F172A'}
                strokeWidth={3.5 * scale}
                opacity={0.75 - i * 0.08}
              />
            );
          })}

          {/* Terminal Circular Vault Apex Ring */}
          <circle cx="800" cy="450" r="115" fill="none" stroke="#FF6B1A" strokeWidth="2" opacity="0.55" />
          <circle
            cx="800"
            cy="450"
            r="98"
            fill="none"
            stroke="#38BDF8"
            strokeWidth="1"
            strokeDasharray="6 4"
            opacity="0.4"
          />

          {/* Glowing Ember Ceiling Strips (Receding to Apex) */}
          <line x1="520" y1="0" x2="735" y2="345" stroke="url(#emberStripGrad)" strokeWidth="3.5" opacity="0.85" />
          <line x1="1080" y1="0" x2="865" y2="345" stroke="url(#emberStripGrad)" strokeWidth="3.5" opacity="0.85" />

          {/* Glowing Ember Floor Strips (Receding to Apex) */}
          <line x1="340" y1="900" x2="720" y2="555" stroke="url(#emberStripGrad)" strokeWidth="4" opacity="0.85" />
          <line x1="1260" y1="900" x2="880" y2="555" stroke="url(#emberStripGrad)" strokeWidth="4" opacity="0.85" />

          {/* Subtle Cyan Telemetry Horizon Lines */}
          <line x1="120" y1="450" x2="685" y2="450" stroke="#38BDF8" strokeWidth="0.75" strokeDasharray="4 6" opacity="0.3" />
          <line x1="915" y1="450" x2="1480" y2="450" stroke="#38BDF8" strokeWidth="0.75" strokeDasharray="4 6" opacity="0.3" />
        </svg>

        {/* Darkened Smoked Vignette Layer so 3-Column Console Pops */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(7, 10, 14, 0.55) 0%, rgba(7, 10, 14, 0.88) 75%, rgba(7, 10, 14, 0.96) 100%)'
          }}
        />

        {/* Subtle Spatial Telemetry Grid Overlay */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(255, 107, 26, 0.12) 1px, transparent 1px),
                              linear-gradient(to bottom, rgba(56, 189, 248, 0.12) 1px, transparent 1px)`,
            backgroundSize: '44px 44px'
          }}
        />
      </div>

      {/* ======================================================== */}
      {/* SINGLE-SCREEN 3-COLUMN COCKPIT GRID (calc(100vh - 140px)) */}
      {/* ======================================================== */}
      <div className="relative z-20 w-full max-w-[1440px] h-[calc(100vh-140px)] max-h-[calc(100vh-140px)] mx-auto px-3 sm:px-6 lg:px-8 mt-6 mb-2 flex items-stretch justify-center overflow-hidden pointer-events-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 lg:gap-4 w-full h-full min-h-0 items-stretch">
          {/* ======================================================== */}
          {/* A. LEFT COLUMN (col-span-3): THE IDENTITY MONOLITH       */}
          {/* ======================================================== */}
          <div
            className="lg:col-span-3 h-full min-h-0 flex flex-col justify-between p-3.5 sm:p-4 rounded-xl bg-[#070A0E]/80 border border-[#FF6B1A]/35 shadow-[0_0_30px_rgba(255,107,26,0.14),inset_0_0_20px_rgba(56,189,248,0.05)] relative overflow-hidden"
            style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
          >
            {/* Thin Ember/Cyan Corner Brackets */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#FF6B1A] pointer-events-none" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#38BDF8] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#38BDF8] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#FF6B1A] pointer-events-none" />

            {/* 1. Header Tag & Founder Badge */}
            <div className="flex items-center justify-between gap-1 pb-2 border-b border-slate-800/90 shrink-0">
              <div className="flex items-center gap-1.5 font-mono-hud text-[9px] text-[#38BDF8] tracking-widest font-bold truncate">
                <Shield className="w-3 h-3 text-[#38BDF8] shrink-0" />
                <span className="truncate">AI ARCHITECT // PROFILE</span>
              </div>
              <span className="font-mono-hud text-[8px] text-[#FFA14A] bg-[#FF6B1A]/15 border border-[#FF6B1A]/45 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0">
                FOUNDER // NELC DIGITAL
              </span>
            </div>

            {/* 2. Visual Avatar / Hologram Frame (16:10 / Square Viewport) */}
            <div className="relative my-2 w-full aspect-[16/10] flex-1 min-h-[115px] max-h-[185px] rounded-lg overflow-hidden border border-[#38BDF8]/45 bg-[#05080C]/95 shadow-[inset_0_0_24px_rgba(56,189,248,0.22)] flex items-center justify-center">
              {/* Bound to architect.avatarUrl in vault-manifest.json */}
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name || 'LAWRENCE EMENIKE'}
                  className="absolute inset-0 w-full h-full object-cover filter contrast-125 brightness-90 saturate-75"
                  onError={e => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : null}

              {/* Built-in Animated SVG Cybernetic / Geometric Fallback Silhouette */}
              <div className="relative z-10 inset-0 w-full h-full flex items-center justify-center pointer-events-none">
                <svg
                  viewBox="0 0 240 160"
                  className="w-full h-full p-1.5 opacity-95 drop-shadow-[0_0_12px_rgba(56,189,248,0.55)]"
                >
                  <defs>
                    <linearGradient id="holoWireframeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.95" />
                      <stop offset="55%" stopColor="#38BDF8" stopOpacity="0.75" />
                      <stop offset="100%" stopColor="#FF6B1A" stopOpacity="0.95" />
                    </linearGradient>
                    <radialGradient id="holoCoreGlow" cx="50%" cy="48%" r="48%">
                      <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.32" />
                      <stop offset="60%" stopColor="#FF6B1A" stopOpacity="0.12" />
                      <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* Holographic Aura */}
                  <circle cx="120" cy="76" r="58" fill="url(#holoCoreGlow)" />

                  {/* Rotating Outer Target Ring */}
                  <circle
                    cx="120"
                    cy="76"
                    r="52"
                    fill="none"
                    stroke="#38BDF8"
                    strokeWidth="0.7"
                    strokeDasharray="6 4"
                    opacity="0.45"
                  />
                  <circle
                    cx="120"
                    cy="76"
                    r="44"
                    fill="none"
                    stroke="#FF6B1A"
                    strokeWidth="0.6"
                    strokeDasharray="3 5"
                    opacity="0.4"
                  />

                  {/* Geometric Cybernetic Head & Shoulders Wireframe Silhouette */}
                  <g stroke="url(#holoWireframeGrad)" strokeWidth="0.9" fill="none">
                    {/* Cranial & Jaw Facets */}
                    <polygon
                      points="120,22 142,32 148,56 142,82 120,98 98,82 92,56 98,32"
                      fill="rgba(56, 189, 248, 0.07)"
                    />
                    {/* Internal Geometric Mesh */}
                    <line x1="120" y1="22" x2="120" y2="150" strokeDasharray="2 2" opacity="0.75" />
                    <line x1="98" y1="32" x2="142" y2="32" opacity="0.6" />
                    <line x1="92" y1="56" x2="148" y2="56" />
                    <line x1="98" y1="82" x2="142" y2="82" opacity="0.75" />

                    {/* Optical Visor Band */}
                    <polygon
                      points="96,52 120,58 144,52 140,63 120,67 100,63"
                      fill="rgba(255, 107, 26, 0.25)"
                      stroke="#FFA14A"
                      strokeWidth="1"
                    />

                    {/* Facet Triangulation Lines */}
                    <line x1="120" y1="22" x2="92" y2="56" opacity="0.55" />
                    <line x1="120" y1="22" x2="148" y2="56" opacity="0.55" />
                    <line x1="92" y1="56" x2="120" y2="82" opacity="0.65" />
                    <line x1="148" y1="56" x2="120" y2="82" opacity="0.65" />
                    <line x1="98" y1="82" x2="120" y2="67" opacity="0.55" />
                    <line x1="142" y1="82" x2="120" y2="67" opacity="0.55" />

                    {/* Neck & Cybernetic Shoulder Lattice */}
                    <polygon
                      points="106,90 134,90 142,112 120,124 98,112"
                      fill="rgba(56, 189, 248, 0.05)"
                    />
                    <path
                      d="M 98 104 L 54 124 L 38 154 L 202 154 L 186 124 L 142 104"
                      fill="rgba(255, 107, 26, 0.05)"
                    />
                    <line x1="54" y1="124" x2="120" y2="142" opacity="0.6" />
                    <line x1="186" y1="124" x2="120" y2="142" opacity="0.6" />
                    <line x1="98" y1="112" x2="72" y2="154" opacity="0.5" />
                    <line x1="142" y1="112" x2="168" y2="154" opacity="0.5" />
                  </g>

                  {/* Glowing Neural Vertex Nodes */}
                  <g>
                    <circle cx="120" cy="22" r="2.2" fill="#38BDF8" />
                    <circle cx="92" cy="56" r="1.8" fill="#38BDF8" />
                    <circle cx="148" cy="56" r="1.8" fill="#38BDF8" />
                    <circle cx="120" cy="58" r="2.3" fill="#FFA14A" />
                    <circle cx="120" cy="98" r="2" fill="#38BDF8" />
                    <circle cx="120" cy="124" r="2.2" fill="#FF6B1A" />
                    <circle cx="54" cy="124" r="1.8" fill="#38BDF8" />
                    <circle cx="186" cy="124" r="1.8" fill="#38BDF8" />
                  </g>
                </svg>
              </div>

              {/* Stylized Cyan/Ember Wireframe Scan-Line Overlay */}
              <div
                className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#38BDF8] to-[#FF6B1A] shadow-[0_0_12px_#38BDF8] pointer-events-none animate-scan z-20"
              />
              <div
                className="absolute inset-0 pointer-events-none opacity-30 z-10"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(0deg, rgba(56, 189, 248, 0.16) 0px, transparent 2px, transparent 4px)'
                }}
              />

              {/* Viewport HUD Corner Telemetry */}
              <div className="absolute top-1.5 left-2 right-2 flex items-center justify-between pointer-events-none z-20">
                <span className="font-mono-hud text-[7px] text-[#38BDF8]/90 tracking-widest">
                  HOLO.MESH // V4.2
                </span>
                <span className="font-mono-hud text-[7px] text-emerald-400 tracking-widest font-bold">
                  BIOMETRIC // SYNC
                </span>
              </div>
              <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between pointer-events-none z-20">
                <span className="font-mono-hud text-[7px] text-slate-400 tracking-wider">
                  {profile.coordinates || '06.45° N, 03.39° E'}
                </span>
                <span className="font-mono-hud text-[7px] text-[#FFA14A] tracking-wider font-bold">
                  ID // VERIFIED
                </span>
              </div>
            </div>

            {/* 3. Name & Callsign */}
            <div className="shrink-0 my-1">
              <h1 className="font-syne text-lg sm:text-xl xl:text-2xl font-extrabold text-white tracking-wider glow-ember-text leading-tight uppercase">
                LAWRENCE EMENIKE
              </h1>
              <div className="mt-1 px-2 py-1 rounded bg-[#FF6B1A]/15 border border-[#FF6B1A]/40 font-mono-hud text-[9px] sm:text-[10px] text-[#FFA14A] font-bold tracking-wider truncate">
                CALLSIGN: <span className="text-white">LXWRVNX // THE ARCHITECT</span>
              </div>
            </div>

            {/* 4. Role Pills */}
            <div className="grid grid-cols-2 gap-1.5 my-1.5 shrink-0">
              {[
                'AI Transformation Consultant',
                'AI Architect & Engineer',
                'Creative Technologist',
                'AI Artist'
              ].map((role, idx) => (
                <div
                  key={idx}
                  className="font-mono-hud text-[8px] font-bold text-slate-200 bg-[#38BDF8]/10 hover:bg-[#38BDF8]/20 border border-[#38BDF8]/35 shadow-[0_0_10px_rgba(56,189,248,0.12)] px-1.5 py-1 rounded text-center truncate tracking-tight transition-all"
                  title={role}
                >
                  {role}
                </div>
              ))}
            </div>

            {/* 5. Core Thesis Quote Box (Ember-Left-Bordered Glass Callout) */}
            <blockquote className="p-2.5 rounded-lg bg-[#0D1B24]/75 border-l-2 border-[#FF6B1A] border-t border-r border-b border-t-slate-800/70 border-r-slate-800/70 border-b-slate-800/70 font-inter text-[10px] sm:text-[11px] text-slate-200 leading-snug italic shadow-[inset_0_0_15px_rgba(255,107,26,0.12)] shrink-0">
              "Architecting secure, governed commercial intelligence systems that translate cross-sector complexity into structured intelligence for strategic decision-making."
            </blockquote>
          </div>

          {/* ======================================================== */}
          {/* B. CENTER COLUMN (col-span-6): TELEMETRY & BRIEFING      */}
          {/* ======================================================== */}
          <div
            className="lg:col-span-6 h-full min-h-0 flex flex-col justify-between p-3.5 sm:p-4 rounded-xl bg-[#070A0E]/80 border border-slate-800/90 shadow-[0_0_35px_rgba(0,0,0,0.85)] relative overflow-hidden"
            style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
          >
            {/* Subtle Top Console Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 shrink-0">
              <div className="flex items-center gap-2 font-mono-hud text-[10px] text-[#38BDF8] tracking-widest font-bold">
                <Activity className="w-3.5 h-3.5 text-[#FF6B1A]" />
                <span>CENTRAL TELEMETRY CONSOLE // NEURAL MATRIX</span>
              </div>
              <div className="flex items-center gap-2 font-mono-hud text-[9px] text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 font-bold">6-AXIS LOCK</span>
              </div>
            </div>

            {/* 1. Interactive SVG 6-Axis Radar Chart & Multi-Agent Node Visualizer (Top Half) */}
            <div className="relative w-full flex-1 min-h-[165px] my-2 rounded-xl bg-[#05080C]/90 border border-slate-800/90 p-2 overflow-hidden flex items-center justify-center">
              <svg viewBox="0 0 400 230" className="w-full h-full max-h-[225px] select-none">
                <defs>
                  <linearGradient id="radarSweepBeam" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={currentBriefing.accentColor} stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="radarPolyFill" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FF6B1A" stopOpacity="0.38" />
                    <stop offset="50%" stopColor="#FFA14A" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.38" />
                  </linearGradient>
                </defs>

                {/* Subtle Background Grid Lines */}
                <line x1="0" y1="115" x2="400" y2="115" stroke="#0F172A" strokeWidth="1" />
                <line x1="200" y1="0" x2="200" y2="230" stroke="#0F172A" strokeWidth="1" />

                {/* Concentric Radar Range Rings */}
                {[19, 38, 57, 76].map(r => (
                  <circle
                    key={r}
                    cx={radarGeometry.cx}
                    cy={radarGeometry.cy}
                    r={r}
                    fill="none"
                    stroke={r === 76 ? '#334155' : '#1E293B'}
                    strokeWidth={r === 76 ? '1' : '0.75'}
                    strokeDasharray={r === 76 ? 'none' : '3 3'}
                  />
                ))}

                {/* Outer Telemetry Degree Ring */}
                <circle
                  cx={radarGeometry.cx}
                  cy={radarGeometry.cy}
                  r="83"
                  fill="none"
                  stroke={currentBriefing.accentColor}
                  strokeWidth="0.9"
                  strokeDasharray="8 4"
                  opacity="0.55"
                />

                {/* 6 Radar Axis Spokes */}
                {radarGeometry.nodes.map((node, i) => (
                  <line
                    key={`axis-${i}`}
                    x1={radarGeometry.cx}
                    y1={radarGeometry.cy}
                    x2={node.axisEndX}
                    y2={node.axisEndY}
                    stroke="#334155"
                    strokeWidth="0.85"
                  />
                ))}

                {/* Multi-Agent Node Graph Active Connections (Glowing Neural Pathways) */}
                {currentBriefing.activeConnections.map(([fromIdx, toIdx], idx) => {
                  const n1 = radarGeometry.nodes[fromIdx];
                  const n2 = radarGeometry.nodes[toIdx];
                  if (!n1 || !n2) return null;
                  return (
                    <g key={`conn-${idx}`}>
                      <line
                        x1={n1.x}
                        y1={n1.y}
                        x2={n2.x}
                        y2={n2.y}
                        stroke="#38BDF8"
                        strokeWidth="1.4"
                        strokeDasharray="3 2"
                        opacity="0.8"
                        className="transition-all duration-700 ease-out"
                      />
                      {/* Midpoint Neural Synapse Node */}
                      <circle
                        cx={(n1.x + n2.x) / 2}
                        cy={(n1.y + n2.y) / 2}
                        r="1.8"
                        fill="#FFA14A"
                        className="transition-all duration-700 ease-out"
                      />
                    </g>
                  );
                })}

                {/* Rotating Radar Sweep Sector */}
                <g transform={`rotate(${radarAngle} ${radarGeometry.cx} ${radarGeometry.cy})`}>
                  <path
                    d={`M ${radarGeometry.cx} ${radarGeometry.cy} L ${radarGeometry.cx + 76} ${radarGeometry.cy} A 76 76 0 0 1 ${
                      radarGeometry.cx + 54
                    } ${radarGeometry.cy + 54} Z`}
                    fill="url(#radarSweepBeam)"
                  />
                  <line
                    x1={radarGeometry.cx}
                    y1={radarGeometry.cy}
                    x2={radarGeometry.cx + 76}
                    y2={radarGeometry.cy}
                    stroke={currentBriefing.accentColor}
                    strokeWidth="1.4"
                  />
                </g>

                {/* Animated 6-Axis Radar Strength Polygon */}
                <polygon
                  points={radarGeometry.polygonPoints}
                  fill="url(#radarPolyFill)"
                  stroke={currentBriefing.accentColor}
                  strokeWidth="1.8"
                  className="transition-all duration-700 ease-out"
                />

                {/* Central Multi-Agent Orchestrator Core Node */}
                <circle
                  cx={radarGeometry.cx}
                  cy={radarGeometry.cy}
                  r="4"
                  fill="#070A0E"
                  stroke="#FF6B1A"
                  strokeWidth="1.5"
                />
                <circle cx={radarGeometry.cx} cy={radarGeometry.cy} r="1.5" fill="#FFA14A" />

                {/* 6 Vertex Nodes + Score Callouts */}
                {radarGeometry.nodes.map((node, idx) => (
                  <g key={`node-${idx}`} className="transition-all duration-700 ease-out">
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="5.5"
                      fill="none"
                      stroke={currentBriefing.accentColor}
                      strokeWidth="0.8"
                      opacity="0.6"
                    />
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="3"
                      fill="#38BDF8"
                      stroke="#070A0E"
                      strokeWidth="1"
                    />
                  </g>
                ))}

                {/* 6 Axis Labels & Percentage Telemetry */}
                {radarGeometry.nodes.map((node, idx) => {
                  const isTop = idx === 0;
                  const isBottom = idx === 3;
                  const isRight = idx === 1 || idx === 2;
                  const textAnchor = isTop || isBottom ? 'middle' : isRight ? 'start' : 'end';
                  const dx = isTop || isBottom ? 0 : isRight ? 4 : -4;
                  const dy = isTop ? -4 : isBottom ? 8 : 2;

                  return (
                    <g key={`label-${idx}`}>
                      <text
                        x={node.lx + dx}
                        y={node.ly + dy}
                        fill="#E2E8F0"
                        fontSize="7.2"
                        fontFamily="JetBrains Mono, monospace"
                        fontWeight="bold"
                        textAnchor={textAnchor}
                      >
                        {node.label}
                      </text>
                      <text
                        x={node.lx + dx}
                        y={node.ly + dy + 9}
                        fill={currentBriefing.accentColor}
                        fontSize="6.8"
                        fontFamily="JetBrains Mono, monospace"
                        fontWeight="bold"
                        textAnchor={textAnchor}
                      >
                        [{node.val}%]
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Corner Telemetry Overlays inside Visualizer */}
              <div className="absolute top-2 left-2.5 flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/75 border border-slate-800 font-mono-hud text-[8px] text-slate-300 pointer-events-none">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B1A] animate-pulse" />
                <span>NODE.GRAPH // MULTI-AGENT</span>
              </div>
              <div className="absolute bottom-2 right-2.5 flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/75 border border-slate-800 font-mono-hud text-[8px] text-[#38BDF8] pointer-events-none">
                <span>VECTOR SYNC // {activeTab.toUpperCase()}</span>
              </div>
            </div>

            {/* 2. 4 Sleek Horizontal HUD Selector Tabs (Middle of Center Panel) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 my-1 shrink-0">
              {(Object.keys(TELEMETRY_BRIEFINGS) as TelemetryTab[]).map(tabKey => {
                const tab = TELEMETRY_BRIEFINGS[tabKey];
                const isActive = activeTab === tabKey;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tabKey)}
                    className={`px-2 py-2 rounded-lg font-mono-hud text-[8.5px] xl:text-[9.5px] font-bold tracking-wider transition-all cursor-pointer text-center truncate ${
                      isActive
                        ? 'bg-[#FF6B1A] text-slate-950 border border-[#FFA14A] shadow-[0_0_16px_rgba(255,107,26,0.55)] scale-[1.01]'
                        : 'bg-slate-900/85 text-slate-400 hover:text-white border border-slate-800 hover:border-[#38BDF8]/50'
                    }`}
                    title={tab.tabLabel}
                  >
                    {tab.tabLabel}
                  </button>
                );
              })}
            </div>

            {/* 3. Active Tabbed Briefing Card (Only ONE visible at a time, cross-fading) */}
            <div
              key={activeTab}
              className="mt-1.5 p-3.5 rounded-xl bg-[#05080C]/90 border border-slate-800/90 flex flex-col justify-between shrink-0 min-h-[132px] animate-fade-in relative overflow-hidden"
            >
              {/* Subtle Left Accent Bar */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1"
                style={{ backgroundColor: currentBriefing.accentColor }}
              />

              <div className="pl-2">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    {activeTab === 'perspective' && <Compass className="w-3.5 h-3.5 text-[#FF6B1A]" />}
                    {activeTab === 'architecture' && <Cpu className="w-3.5 h-3.5 text-[#38BDF8]" />}
                    {activeTab === 'creative' && <Sparkles className="w-3.5 h-3.5 text-[#FFA14A]" />}
                    {activeTab === 'kinetic' && <Target className="w-3.5 h-3.5 text-emerald-400" />}
                    <h3 className="font-mono-hud text-xs sm:text-[13px] font-bold text-white tracking-widest uppercase">
                      {currentBriefing.headline}
                    </h3>
                  </div>
                  <span className="font-mono-hud text-[8px] text-slate-400 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800">
                    {currentBriefing.tabLabel.split(' // ')[0]} // ACTIVE
                  </span>
                </div>

                <p className="font-inter text-[11px] sm:text-xs text-slate-300 leading-relaxed">
                  {currentBriefing.briefing}
                </p>
              </div>

              {/* Key Metrics Row */}
              <div className="pl-2 pt-2.5 mt-2 border-t border-slate-800/90 flex flex-wrap items-center justify-between gap-2 font-mono-hud text-[8.5px] sm:text-[9.5px]">
                {currentBriefing.metrics.map((m, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <span className="text-slate-400">{m.label}:</span>
                    <strong className="text-[#FFA14A] font-bold">{m.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* C. RIGHT COLUMN (col-span-3): TELEMETRY, STACK & COMMS   */}
          {/* ======================================================== */}
          <div
            className="lg:col-span-3 h-full min-h-0 flex flex-col justify-between p-3.5 sm:p-4 rounded-xl bg-[#070A0E]/80 border border-slate-800/90 shadow-[0_0_30px_rgba(0,0,0,0.85)] relative overflow-hidden"
            style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
          >
            {/* Corner Tech Brackets */}
            <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-[#38BDF8] pointer-events-none" />
            <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-[#FF6B1A] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-[#FF6B1A] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-[#38BDF8] pointer-events-none" />

            {/* MODULE 1: SYSTEM CAPABILITIES // TELEMETRY */}
            <div className="shrink-0">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/90 mb-2">
                <span className="font-mono-hud text-[9px] text-[#38BDF8] tracking-widest font-bold">
                  SYSTEM CAPABILITIES // TELEMETRY
                </span>
                <span className="font-mono-hud text-[7.5px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 rounded font-bold">
                  LIVE
                </span>
              </div>

              <div className="space-y-2 font-mono-hud">
                {[
                  {
                    name: 'MULTI-AGENT ORCHESTRATION',
                    ascii: '[||||||||||]',
                    status: 'OPTIMAL',
                    pct: '98%',
                    barColor: 'from-[#38BDF8] to-[#FF6B1A]',
                    textColor: 'text-[#38BDF8]'
                  },
                  {
                    name: 'FINAI & COMMERCIAL STRATEGY',
                    ascii: '[||||||||||]',
                    status: 'ACTIVE',
                    pct: '96%',
                    barColor: 'from-[#FF6B1A] to-[#FFA14A]',
                    textColor: 'text-[#FFA14A]'
                  },
                  {
                    name: 'DATA GOVERNANCE & SECURITY',
                    ascii: '[|||||||||.]',
                    status: 'ENFORCED',
                    pct: '94%',
                    barColor: 'from-emerald-400 to-[#38BDF8]',
                    textColor: 'text-emerald-400'
                  },
                  {
                    name: 'CREATIVE SYNTHESIS (OPTICS/AI)',
                    ascii: '[||||||||||]',
                    status: 'ONLINE',
                    pct: '99%',
                    barColor: 'from-[#FFA14A] to-[#38BDF8]',
                    textColor: 'text-[#38BDF8]'
                  }
                ].map((cap, idx) => (
                  <div key={idx} className="bg-[#05080C]/80 p-1.5 rounded-lg border border-slate-800/80">
                    <div className="flex items-center justify-between text-[7.5px] xl:text-[8px] mb-1 gap-1">
                      <span className="text-slate-200 font-bold truncate">{cap.name}</span>
                      <span className={`${cap.textColor} font-bold shrink-0`}>
                        {cap.ascii} {cap.status}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full bg-gradient-to-r ${cap.barColor} rounded-full transition-all duration-1000`}
                        style={{ width: cap.pct }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* MODULE 2: OPERATIONAL CREDENTIALS // MATRIX */}
            <div className="my-2 py-2 border-y border-slate-800/90 shrink-0">
              <div className="flex items-center justify-between mb-2">
                <div className="font-mono-hud text-[9px] text-[#FFA14A] tracking-widest font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>OPERATIONAL CREDENTIALS // MATRIX</span>
                </div>
              </div>

              {/* Clean 2x2 Grid of Minimal Monospace HUD Badges */}
              <div className="grid grid-cols-2 gap-1.5 font-mono-hud">
                <div className="p-2 rounded-lg bg-[#05080C]/90 border border-slate-800 hover:border-[#FF6B1A]/50 transition-all flex flex-col justify-center">
                  <span className="text-[7px] text-slate-500 uppercase tracking-wider">DEGREE // QUANT</span>
                  <span className="text-[9px] font-bold text-white tracking-wider mt-0.5">
                    MSc // FINANCE
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-[#05080C]/90 border border-slate-800 hover:border-[#FF6B1A]/50 transition-all flex flex-col justify-center">
                  <span className="text-[7px] text-slate-500 uppercase tracking-wider">CHARTER // AUDIT</span>
                  <span className="text-[9px] font-bold text-[#FFA14A] tracking-wider mt-0.5">
                    ACCA // CERTIFIED
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-[#05080C]/90 border border-slate-800 hover:border-[#38BDF8]/50 transition-all flex flex-col justify-center">
                  <span className="text-[7px] text-[#38BDF8] uppercase tracking-wider font-bold">
                    AI ENGINEER | Data Scientist
                  </span>
                  <span className="text-[8.5px] font-bold text-white tracking-wider mt-0.5">
                    // AZURE &amp; IBM
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-[#05080C]/90 border border-slate-800 hover:border-[#FF6B1A]/50 transition-all flex flex-col justify-center">
                  <span className="text-[7px] text-slate-500 uppercase tracking-wider">LEADERSHIP // ADVISORY</span>
                  <span className="text-[9px] font-bold text-emerald-400 tracking-wider mt-0.5">
                    FOUNDER // NELC DIGITAL
                  </span>
                </div>
              </div>
            </div>

            {/* MODULE 3: DIRECT COMMS // UPLINK TERMINAL */}
            <div className="shrink-0 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-mono-hud text-[9px] text-[#38BDF8] tracking-widest font-bold">
                  DIRECT COMMS // UPLINK TERMINAL
                </span>
                <span className="font-mono-hud text-[7.5px] text-slate-400 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5 text-[#FFA14A]" />
                  TLS 1.3
                </span>
              </div>

              {/* Prominent Glowing Ember CTA Button */}
              <button
                onClick={() => {
                  try {
                    audioEngine.playLockOnSFX();
                  } catch {}
                  setIsCommsModalOpen(true);
                }}
                className="w-full py-2.5 px-3 rounded-lg font-mono-hud text-[10px] sm:text-[11px] font-black tracking-widest bg-[#FF6B1A] hover:bg-[#FFA14A] text-slate-950 transition-all border border-[#FFA14A] shadow-[0_0_20px_rgba(255,107,26,0.55)] cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98]"
              >
                <Terminal className="w-3.5 h-3.5 shrink-0" />
                <span>[ INITIATE COMMS // CONNECT ]</span>
              </button>

              {/* Quick-Link Icon Buttons (LinkedIn, GitHub, Nelc Digital, Direct Email) */}
              <div className="grid grid-cols-4 gap-1.5">
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  title="LinkedIn // Lawrence Emenike"
                  className="py-1.5 px-1 rounded-lg bg-[#05080C]/90 hover:bg-[#38BDF8]/15 border border-slate-800 hover:border-[#38BDF8] text-slate-300 hover:text-[#38BDF8] flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer"
                >
                  <LinkedInIcon className="w-3.5 h-3.5" />
                  <span className="font-mono-hud text-[7px] font-bold tracking-tight">LinkedIn</span>
                </a>

                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  title="GitHub // AI Architecture Repositories"
                  className="py-1.5 px-1 rounded-lg bg-[#05080C]/90 hover:bg-white/15 border border-slate-800 hover:border-white text-slate-300 hover:text-white flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer"
                >
                  <GitHubIcon className="w-3.5 h-3.5" />
                  <span className="font-mono-hud text-[7px] font-bold tracking-tight">GitHub</span>
                </a>

                <a
                  href={nelcUrl}
                  target="_blank"
                  rel="noreferrer"
                  title="Nelc Digital // Commercial Intelligence"
                  className="py-1.5 px-1 rounded-lg bg-[#05080C]/90 hover:bg-[#FFA14A]/15 border border-slate-800 hover:border-[#FFA14A] text-slate-300 hover:text-[#FFA14A] flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span className="font-mono-hud text-[7px] font-bold tracking-tight truncate max-w-full">
                    Nelc Digital
                  </span>
                </a>

                <button
                  onClick={handleCopyEmail}
                  title={`Direct Email // ${profile.comms.email}`}
                  className="py-1.5 px-1 rounded-lg bg-[#05080C]/90 hover:bg-[#FF6B1A]/15 border border-slate-800 hover:border-[#FF6B1A] text-slate-300 hover:text-[#FF6B1A] flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer"
                >
                  {copiedEmail ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Mail className="w-3.5 h-3.5" />
                  )}
                  <span className="font-mono-hud text-[7px] font-bold tracking-tight">
                    {copiedEmail ? 'Copied!' : 'Direct Email'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ENCRYPTED-STYLE SLIDE-OVER / CONTACT MODAL               */}
      {/* ======================================================== */}
      {isCommsModalOpen && (
        <div
          onClick={e => {
            if (e.target === e.currentTarget) setIsCommsModalOpen(false);
          }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-end p-4 animate-fade-in pointer-events-auto"
        >
          <div className="relative w-full max-w-md h-full max-h-[calc(100vh-32px)] p-6 rounded-2xl bg-[#070A0E]/95 border-2 border-[#FF6B1A] shadow-[0_0_60px_rgba(255,107,26,0.45)] flex flex-col justify-between overflow-y-auto">
            <div>
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#FF6B1A]" />
                  <span className="font-mono-hud text-xs font-bold text-white tracking-widest">
                    DIRECT COMMS // UPLINK TERMINAL
                  </span>
                </div>
                <button
                  onClick={() => setIsCommsModalOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-red-500/20 text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status Banner */}
              <div className="mt-4 p-3 rounded-xl bg-[#FF6B1A]/10 border border-[#FF6B1A]/40 flex items-center justify-between font-mono-hud text-[10px]">
                <span className="text-[#FFA14A] font-bold">CHANNEL: ENCRYPTED DIRECT UPLINK</span>
                <span className="text-emerald-400 font-bold">READY</span>
              </div>

              <p className="font-inter text-xs text-slate-300 leading-relaxed mt-4">
                Initiate direct communication with <strong className="text-white">Lawrence Emenike (lxwrvnx)</strong> for enterprise AI transformation, governed multi-agent systems architecture, commercial intelligence advisory, or creative synthesis collaborations.
              </p>

              {/* Channel Endpoints */}
              <div className="space-y-2.5 mt-5">
                {/* Direct Email */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-[#FF6B1A] transition-all">
                  <div className="flex items-center gap-3 min-w-0">
                    <Mail className="w-4 h-4 text-[#FFA14A] shrink-0" />
                    <div className="min-w-0">
                      <div className="font-mono-hud text-[9px] text-slate-500">DIRECT EMAIL // UPLINK</div>
                      <div className="font-mono-hud text-xs font-bold text-white truncate">
                        {profile.comms.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={handleCopyEmail}
                      className="px-2.5 py-1.5 rounded-lg font-mono-hud text-[10px] font-bold bg-[#FF6B1A]/20 hover:bg-[#FF6B1A] text-[#FFA14A] hover:text-slate-950 transition-all border border-[#FF6B1A]/50 cursor-pointer flex items-center gap-1"
                    >
                      {copiedEmail ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedEmail ? 'COPIED' : 'COPY'}</span>
                    </button>
                    <a
                      href={`mailto:${profile.comms.email}`}
                      className="px-2.5 py-1.5 rounded-lg font-mono-hud text-[10px] font-bold bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 transition-all"
                    >
                      SEND
                    </a>
                  </div>
                </div>

                {/* LinkedIn */}
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-[#38BDF8] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <LinkedInIcon className="w-4 h-4 text-[#38BDF8]" />
                    <div>
                      <div className="font-mono-hud text-[9px] text-slate-500">EXECUTIVE NETWORK // LINKEDIN</div>
                      <div className="font-mono-hud text-xs font-bold text-white group-hover:text-[#38BDF8] transition-colors">
                        linkedin.com/in/lawrenceemenike
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-white" />
                </a>

                {/* GitHub */}
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-white transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <GitHubIcon className="w-4 h-4 text-slate-300" />
                    <div>
                      <div className="font-mono-hud text-[9px] text-slate-500">SYSTEM REPOSITORIES // GITHUB</div>
                      <div className="font-mono-hud text-xs font-bold text-white">
                        github.com/lawrenceemenike
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-white" />
                </a>

                {/* Nelc Digital */}
                <a
                  href={nelcUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-[#FFA14A] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-[#FFA14A]" />
                    <div>
                      <div className="font-mono-hud text-[9px] text-slate-500">ENTERPRISE PRACTICE // NELC DIGITAL</div>
                      <div className="font-mono-hud text-xs font-bold text-white group-hover:text-[#FFA14A] transition-colors">
                        nelcdigital.com
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-white" />
                </a>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 mt-4 flex items-center justify-between font-mono-hud text-[9px] text-slate-500 border-t border-slate-800/80">
              <span>CALLSIGN: LXWRVNX</span>
              <span>SHA-256 VERIFIED // 60FPS</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
