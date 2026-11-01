import React, { useState } from 'react';
import { ArchitectProfile } from '../../types';
import { Mail, Check, ExternalLink, Terminal, Shield, ArrowLeft, Cpu, Radio, Compass, Sparkles, Globe, Briefcase } from 'lucide-react';

interface ArchitectChamberProps {
  profile: ArchitectProfile;
  mouseOffset: { x: number; y: number };
  onBackToConcourse: () => void;
}

export const ArchitectChamber: React.FC<ArchitectChamberProps> = ({
  profile,
  mouseOffset,
  onBackToConcourse
}) => {
  const [copied, setCopied] = useState(false);

  // 3D perspective tilt
  const tiltX = -mouseOffset.y * 3.5;
  const panY = mouseOffset.x * 6;
  const roll = mouseOffset.x * 1.2;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(profile.comms.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const roleTags = profile.role.split(' | ');

  return (
    <div className="relative w-full h-full overflow-y-auto flex items-start justify-center select-none bg-[#070A0E] py-6 md:py-10">
      
      {/* 3D SCENE PERSPECTIVE CONTAINER */}
      <div 
        className="absolute inset-0 preserve-3d transition-transform duration-200 ease-out flex items-center justify-center pointer-events-none"
        style={{
          transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${panY}deg) rotateZ(${roll}deg)`
        }}
      >
        {/* Deep Command Center Backdrop */}
        <div 
          className="absolute inset-[-4%] bg-cover bg-center transition-transform duration-300"
          style={{
            backgroundImage: "url('/media/vault-rooms/inspect.jpg')",
            transform: 'scale(1.06)'
          }}
        />

        {/* Ambient Darkened Carbon Texture Layer */}
        <div className="absolute inset-0 bg-[#070A0E]/80 backdrop-blur-[3px]" />
      </div>

      {/* F1 PADDOCK COMMAND LOUNGE CONTENT */}
      <div className="relative z-20 w-full max-w-6xl px-4 md:px-8 py-4 flex flex-col items-center">
        
        {/* Top Bar Navigation */}
        <div className="w-full flex items-center justify-between mb-6">
          <button
            onClick={onBackToConcourse}
            className="flex items-center gap-2 font-mono-hud text-xs text-[#FFA14A] bg-[#070A0E]/90 px-4 py-2 rounded-full border border-[#FF6B1A]/50 hover:border-[#FF6B1A] hover:bg-[#FF6B1A]/20 transition-all cursor-pointer shadow-[0_0_15px_rgba(255,107,26,0.3)]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO MAIN CONCOURSE</span>
          </button>

          <div className="flex items-center gap-2 font-mono-hud text-[10px] text-slate-300 bg-[#070A0E]/80 px-3 py-1.5 rounded-full border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="tracking-wider">ARCHITECT COMMAND // ACTIVE</span>
          </div>
        </div>

        {/* Main Command Lounge Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full">
          
          {/* Left Column (5 Cols): Identity & Executive Monolith */}
          <div className="md:col-span-5 rounded-2xl glass-hologram p-6 md:p-7 flex flex-col justify-between border-2 border-[#FF6B1A]/60 shadow-[0_0_40px_rgba(255,107,26,0.3)]">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 font-mono-hud text-[10px] text-[#38BDF8] tracking-widest uppercase">
                  <Shield className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>AI ARCHITECT // PROFILE</span>
                </div>
                <span className="font-mono-hud text-[9px] text-[#FFA14A] border border-[#FFA14A]/40 px-2 py-0.5 rounded">
                  FOUNDER // NELC DIGITAL
                </span>
              </div>

              <h2 className="font-syne text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-widest glow-ember-text leading-tight">
                {profile.name}
              </h2>

              <div className="font-mono-hud text-xs text-[#FFA14A] tracking-wider mt-1.5 font-bold flex items-center gap-1.5">
                <span>CALLSIGN:</span>
                <span className="text-white bg-[#FF6B1A]/20 px-2 py-0.5 rounded border border-[#FF6B1A]/40">
                  {profile.callsign}
                </span>
              </div>

              {/* Roles Badge Array */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {roleTags.map((tag, idx) => (
                  <span 
                    key={idx} 
                    className="font-mono-hud text-[9px] font-semibold bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30 px-2 py-0.5 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Executive Tagline Highlight */}
              {profile.tagline && (
                <div className="my-4 p-3 rounded-xl bg-gradient-to-r from-[#FF6B1A]/15 to-transparent border-l-2 border-[#FF6B1A] font-inter text-xs text-slate-200 leading-relaxed italic">
                  "{profile.tagline}"
                </div>
              )}

              <div className="w-full h-[1px] bg-gradient-to-r from-[#FF6B1A]/60 via-slate-700 to-transparent my-4" />

              <div className="font-mono-hud text-[10px] text-[#FFA14A] uppercase tracking-wider font-bold mb-1.5">
                ABOUT // SEEING WHAT OTHERS MISS
              </div>
              <p className="font-inter text-xs text-slate-300 leading-relaxed">
                {profile.bio}
              </p>
            </div>

            {/* Status Diagnostics Card */}
            <div className="mt-6 p-3.5 rounded-xl bg-[#070A0E]/80 border border-slate-800 font-mono-hud text-[10px] flex flex-col gap-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-slate-500">ORGANIZATION:</span>
                <span className="text-[#38BDF8] font-bold">NELC DIGITAL</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-slate-500">CORE FOCUS:</span>
                <span className="text-[#FFA14A]">COMMERCIAL INTELLIGENCE</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-slate-500">CREATIVE MATRIX:</span>
                <span className="text-emerald-400">LXWRVNX // SPATIAL & AI ART</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-slate-500">SYSTEMS INTEGRITY:</span>
                <span className="text-white font-bold">AUDITABLE & GOVERNED</span>
              </div>
            </div>
          </div>

          {/* Right Column (7 Cols): Strategic Philosophy, Systems & Comms */}
          <div className="md:col-span-7 flex flex-col gap-5">
            
            {/* Panel 1: Strategic Perspective // Making Sense of Complexity */}
            <div className="rounded-2xl glass-hologram p-6 border border-[#38BDF8]/40 shadow-[0_0_30px_rgba(56,189,248,0.15)]">
              <div className="flex items-center gap-2 font-mono-hud text-[10px] text-[#38BDF8] tracking-widest uppercase mb-2.5 font-bold">
                <Compass className="w-4 h-4 text-[#38BDF8]" />
                <span>STRATEGIC PERSPECTIVE // MAKING SENSE OF COMPLEXITY</span>
              </div>
              <div className="font-inter text-xs text-slate-200 leading-relaxed whitespace-pre-line space-y-2.5">
                {profile.philosophy}
              </div>
            </div>

            {/* Panel 2: Enterprise Architecture // Governed Systems & Multi-Agent Workflows */}
            <div className="rounded-2xl glass-hologram p-6 border border-slate-700/80 hover:border-slate-600 transition-colors">
              <div className="flex items-center gap-2 font-mono-hud text-[10px] text-[#FFA14A] tracking-widest uppercase mb-2.5 font-bold">
                <Cpu className="w-4 h-4 text-[#FFA14A]" />
                <span>ENTERPRISE ARCHITECTURE // GOVERNANCE & MULTI-AGENT PLATFORMS</span>
              </div>
              <div className="font-inter text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                {profile.systems}
              </div>
            </div>

            {/* Panel 3: Visual Matrix // lxwrvnx Creative Art */}
            {profile.visualMatrix && (
              <div className="rounded-2xl glass-hologram p-5 border border-[#FF6B1A]/40 bg-[#FF6B1A]/5">
                <div className="flex items-center gap-2 font-mono-hud text-[10px] text-[#FFA14A] tracking-widest uppercase mb-1.5 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-[#FFA14A]" />
                  <span>VISUAL MATRIX // LXWRVNX [CREATIVE ART & SPATIAL SYSTEMS]</span>
                </div>
                <p className="font-inter text-xs text-slate-300 leading-relaxed">
                  {profile.visualMatrix}
                </p>
              </div>
            )}

            {/* Panel 4: Comms & Transmission Terminal */}
            <div className="rounded-2xl glass-hologram p-6 border border-slate-700/90 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 font-mono-hud text-[10px] text-white tracking-widest uppercase font-bold">
                  <Terminal className="w-4 h-4 text-[#FF6B1A]" />
                  <span>COMMS & TRANSMISSION TERMINAL</span>
                </div>
                <span className="font-mono-hud text-[9px] text-[#38BDF8] bg-[#38BDF8]/10 px-2 py-0.5 rounded border border-[#38BDF8]/30">
                  DISPATCH: READY
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Email Direct Dispatch */}
                <button
                  onClick={handleCopyEmail}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#070A0E]/70 border border-slate-700 hover:border-[#FFA14A] transition-all group cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-[#FFA14A]" />
                    <div className="font-mono-hud text-[10px]">
                      <div className="text-slate-400">DIRECT DISPATCH</div>
                      <div className="text-white font-bold group-hover:text-[#FFA14A] transition-colors">
                        {profile.comms.email}
                      </div>
                    </div>
                  </div>
                  {copied ? (
                    <span className="font-mono-hud text-[9px] text-emerald-400 flex items-center gap-1 font-bold">
                      <Check className="w-3.5 h-3.5" /> COPIED
                    </span>
                  ) : (
                    <span className="font-mono-hud text-[9px] text-slate-500 group-hover:text-white">
                      COPY
                    </span>
                  )}
                </button>

                {/* Organization Nelc Digital */}
                <a
                  href={profile.comms.organizationUrl || 'https://nelcdigital.com'}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-[#070A0E]/70 border border-slate-700 hover:border-[#38BDF8] transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-4 h-4 text-[#38BDF8]" />
                    <div className="font-mono-hud text-[10px]">
                      <div className="text-slate-400">ENTERPRISE PRACTICE</div>
                      <div className="text-white font-bold group-hover:text-[#38BDF8] transition-colors">
                        NELC DIGITAL
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
                </a>

                {/* Twitter / X */}
                <a
                  href={profile.comms.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-[#070A0E]/70 border border-slate-700 hover:border-[#FFA14A] transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <Radio className="w-4 h-4 text-[#FFA14A]" />
                    <div className="font-mono-hud text-[10px]">
                      <div className="text-slate-400">CREATIVE MATRIX</div>
                      <div className="text-white font-bold group-hover:text-[#FFA14A] transition-colors">
                        @lxwrvnx
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
                </a>

                {/* GitHub */}
                <a
                  href={profile.comms.github}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-[#070A0E]/70 border border-slate-700 hover:border-white transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <Terminal className="w-4 h-4 text-slate-300" />
                    <div className="font-mono-hud text-[10px]">
                      <div className="text-slate-400">CODE & RESEARCH</div>
                      <div className="text-white font-bold">
                        lxwrvnx
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
                </a>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};


