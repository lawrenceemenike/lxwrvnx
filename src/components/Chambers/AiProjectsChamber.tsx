import React, { useState, useMemo } from 'react';
import { AiProjectItem } from '../../types';
import { 
  ArrowLeft, 
  Cpu, 
  Shield, 
  ExternalLink, 
  Activity, 
  Database, 
  Layers, 
  CheckCircle2, 
  Lock, 
  Compass, 
  Sparkles, 
  GitBranch, 
  Terminal, 
  X, 
  BarChart3, 
  Zap, 
  Check, 
  Search,
  ChevronRight
} from 'lucide-react';

interface AiProjectsChamberProps {
  projects: AiProjectItem[];
  mouseOffset: { x: number; y: number };
  onBackToConcourse: () => void;
}

type FilterCategory = 'all' | 'multi-agent' | 'governance' | 'finops' | 'mlops';

export const AiProjectsChamber: React.FC<AiProjectsChamberProps> = ({
  projects,
  mouseOffset,
  onBackToConcourse
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<AiProjectItem | null>(null);

  // 3D perspective tilt
  const tiltX = -mouseOffset.y * 3.0;
  const panY = mouseOffset.x * 5.0;
  const roll = mouseOffset.x * 1.0;

  // Real projects (excluding placeholders for the main metrics)
  const realProjects = useMemo(() => {
    return projects.filter(p => !p.isPlaceholder);
  }, [projects]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return realProjects.filter(p => {
      const matchesCategory = activeFilter === 'all' || p.category === activeFilter;
      const matchesSearch = searchQuery === '' || 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.short_desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tech_stack.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [realProjects, activeFilter, searchQuery]);

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
            transform: 'scale(1.05)'
          }}
        />

        {/* Ambient Darkened Carbon Texture Layer */}
        <div className="absolute inset-0 bg-[#070A0E]/85 backdrop-blur-[3px]" />
      </div>

      {/* OPERATIONS LOUNGE CONTENT CONTAINER */}
      <div className="relative z-20 w-full max-w-7xl px-4 md:px-8 py-4 flex flex-col items-center">
        
        {/* Top Bar Navigation & Status */}
        <div className="w-full flex flex-wrap items-center justify-between gap-3 mb-6">
          <button
            onClick={onBackToConcourse}
            className="flex items-center gap-2 font-mono-hud text-xs text-[#FFA14A] bg-[#070A0E]/90 px-4 py-2 rounded-full border border-[#FF6B1A]/50 hover:border-[#FF6B1A] hover:bg-[#FF6B1A]/20 transition-all cursor-pointer shadow-[0_0_15px_rgba(255,107,26,0.3)]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO MAIN CONCOURSE</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 font-mono-hud text-[10px] text-slate-300 bg-[#070A0E]/80 px-3 py-1.5 rounded-full border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-pulse" />
              <span className="tracking-wider text-[#38BDF8] font-bold">CHAMBER 05 // AI PROJECTS</span>
              <span className="text-slate-500">// 9 PRODUCTION BLUEPRINTS</span>
            </div>

            <a
              href="https://github.com/lawrenceemenike"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 font-mono-hud text-[10px] text-slate-400 hover:text-white bg-[#070A0E]/80 px-3 py-1.5 rounded-full border border-slate-800 hover:border-slate-600 transition-colors"
            >
              <Terminal className="w-3 h-3 text-[#FFA14A]" />
              <span>GITHUB ARCHIVE</span>
              <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
            </a>
          </div>
        </div>

        {/* Mission Briefing Hero Header */}
        <div className="w-full rounded-2xl glass-hologram p-6 md:p-8 border-2 border-[#38BDF8]/40 shadow-[0_0_35px_rgba(56,189,248,0.15)] mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 font-mono-hud text-[10px] text-[#38BDF8] tracking-widest uppercase mb-2">
                <Cpu className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>COMMERCIAL INTELLIGENCE SYSTEMS // ARCHITECTURAL REPOSITORY</span>
              </div>
              <h1 className="font-syne text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-wider glow-ember-text leading-tight">
                AI PROJECTS & PRODUCTION BLUEPRINTS
              </h1>
              <p className="font-inter text-xs sm:text-sm text-slate-300 mt-2.5 leading-relaxed">
                Architecting secure, governed commercial intelligence systems that translate cross-sector complexity into structured intelligence for strategic decision-making. Spanning sub-5ms zero-trust control planes, autonomous multi-agent consensus loops, and high-throughput economic model routers.
              </p>
            </div>

            {/* Quick Live Telemetry Pill */}
            <div className="flex-shrink-0 flex flex-col items-end font-mono-hud text-[10px] text-slate-400 bg-[#070A0E]/70 p-3 rounded-xl border border-slate-800">
              <span className="text-[#38BDF8] font-bold">PRACTICE: NELC DIGITAL</span>
              <span className="text-[#FFA14A]">ENGINEER: LAWRENCE EMENIKE</span>
              <span className="text-emerald-400">STATUS: AUDITED & AUDIT-READY</span>
            </div>
          </div>

          {/* Real-Time Metrics Telemetry Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
            <div className="p-3 rounded-xl bg-[#070A0E]/60 border border-slate-800/80 flex flex-col">
              <span className="font-mono-hud text-[9px] text-slate-400 uppercase tracking-wider">DEPLOYED ENGINES</span>
              <span className="font-syne text-xl sm:text-2xl font-black text-white mt-1">9 BLUEPRINTS</span>
              <span className="font-mono-hud text-[8px] text-[#38BDF8] mt-0.5">Multi-Agent & Runtime Systems</span>
            </div>

            <div className="p-3 rounded-xl bg-[#070A0E]/60 border border-slate-800/80 flex flex-col">
              <span className="font-mono-hud text-[9px] text-slate-400 uppercase tracking-wider">RUNTIME ENFORCEMENT</span>
              <span className="font-syne text-xl sm:text-2xl font-black text-[#FFA14A] mt-1">&lt; 5ms</span>
              <span className="font-mono-hud text-[8px] text-slate-400 mt-0.5">Zero-Trust Hot-Path Latency</span>
            </div>

            <div className="p-3 rounded-xl bg-[#070A0E]/60 border border-slate-800/80 flex flex-col">
              <span className="font-mono-hud text-[9px] text-slate-400 uppercase tracking-wider">FINOPS COST DROP</span>
              <span className="font-syne text-xl sm:text-2xl font-black text-emerald-400 mt-1">85% SAVINGS</span>
              <span className="font-mono-hud text-[8px] text-slate-400 mt-0.5">Local SLM / Frontier Routing</span>
            </div>

            <div className="p-3 rounded-xl bg-[#070A0E]/60 border border-slate-800/80 flex flex-col">
              <span className="font-mono-hud text-[9px] text-slate-400 uppercase tracking-wider">GOVERNANCE LEVEL</span>
              <span className="font-syne text-xl sm:text-2xl font-black text-white mt-1">EU AI ACT</span>
              <span className="font-mono-hud text-[8px] text-slate-400 mt-0.5">Merkle-DAG Causal Ledgers</span>
            </div>
          </div>
        </div>

        {/* Filter Controls & Search Bar */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#070A0E]/90 border border-slate-800">
            {[
              { id: 'all', label: `ALL SYSTEMS (${realProjects.length})` },
              { id: 'multi-agent', label: 'MULTI-AGENT WORKFLOWS' },
              { id: 'governance', label: 'GOVERNANCE & ZERO-TRUST' },
              { id: 'finops', label: 'ECONOMIC ROUTING & FINOPS' },
              { id: 'mlops', label: 'MLOPS & EVALUATION' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as FilterCategory)}
                className={`px-3 py-1.5 rounded-lg font-mono-hud text-[10px] font-bold transition-all ${
                  activeFilter === tab.id
                    ? 'bg-[#38BDF8] text-slate-950 shadow-[0_0_15px_rgba(56,189,248,0.5)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter blueprints or tech..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#070A0E]/80 border border-slate-800 font-mono-hud text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#38BDF8] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
              >
                ×
              </button>
            )}
          </div>

        </div>

        {/* Blueprint Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group rounded-2xl glass-hologram p-5 md:p-6 border border-slate-800 hover:border-[#38BDF8]/70 hover:shadow-[0_0_30px_rgba(56,189,248,0.2)] transition-all flex flex-col justify-between"
            >
              <div>
                {/* Top Badge Row */}
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono-hud text-[10px] text-[#38BDF8] font-bold tracking-wider">
                    {project.systemCode || `SYS-0${project.id}`}
                  </span>
                  {project.statusBadge && (
                    <span className="font-mono-hud text-[9px] text-[#FFA14A] bg-[#FF6B1A]/10 border border-[#FF6B1A]/30 px-2 py-0.5 rounded font-semibold">
                      {project.statusBadge}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="font-syne text-lg font-bold text-white group-hover:text-[#38BDF8] transition-colors leading-snug">
                  {project.title}
                </h3>

                {/* Subtitle / Description */}
                <p className="font-inter text-xs text-slate-300 mt-2.5 leading-relaxed line-clamp-3">
                  {project.short_desc}
                </p>

                {/* Tech Stack Badges */}
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {project.tech_stack.slice(0, 4).map((tech, i) => (
                    <span
                      key={i}
                      className="font-mono-hud text-[9px] bg-slate-900/80 text-slate-300 border border-slate-800 px-2 py-0.5 rounded"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.tech_stack.length > 4 && (
                    <span className="font-mono-hud text-[9px] text-slate-500 py-0.5">
                      +{project.tech_stack.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedProject(project)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#38BDF8]/10 hover:bg-[#38BDF8] text-[#38BDF8] hover:text-slate-950 border border-[#38BDF8]/40 font-mono-hud text-[10px] font-bold tracking-wider transition-all cursor-pointer shadow-[0_0_10px_rgba(56,189,248,0.15)]"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>INSPECT BLUEPRINT</span>
                </button>

                {project.github_link && (
                  <a
                    href={project.github_link}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
                    title="View Source on GitHub"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}

          {/* Upcoming System Slot */}
          <div className="rounded-2xl glass-hologram p-6 border border-dashed border-slate-800/90 flex flex-col items-center justify-center text-center opacity-70 hover:opacity-100 transition-opacity min-h-[260px]">
            <div className="w-12 h-12 rounded-full border border-slate-700 bg-slate-900/60 flex items-center justify-center mb-3">
              <Cpu className="w-5 h-5 text-slate-500 animate-pulse" />
            </div>
            <span className="font-mono-hud text-xs text-[#FFA14A] font-bold tracking-wider">
              SYS-10 // UPCOMING BLUEPRINT
            </span>
            <span className="font-syne text-sm font-bold text-white mt-1">
              Next Terminal Compiling...
            </span>
            <p className="font-inter text-xs text-slate-400 mt-1.5 max-w-xs">
              Architectural blueprint in progress. High-frequency agentic deployment scheduled.
            </p>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* DETAILED HOLOGRAPHIC CASE STUDY DEEP-DIVE MODAL */}
      {/* ======================================================== */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in select-text">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl glass-hologram border-2 border-[#38BDF8] p-6 md:p-8 shadow-[0_0_60px_rgba(56,189,248,0.3)] bg-[#070A0E]/95">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-6">
              <div>
                <div className="flex items-center gap-2 font-mono-hud text-[10px] text-[#38BDF8] tracking-widest uppercase mb-1">
                  <span>{selectedProject.systemCode || `SYS-0${selectedProject.id}`}</span>
                  <span>//</span>
                  <span className="text-[#FFA14A]">{selectedProject.statusBadge || 'DEPLOYMENT READY'}</span>
                </div>
                <h2 className="font-syne text-2xl sm:text-3xl font-black text-white glow-ember-text">
                  {selectedProject.title}
                </h2>
              </div>

              <button
                onClick={() => setSelectedProject(null)}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tech Stack Chips */}
            <div className="flex flex-wrap gap-1.5 mb-6">
              {selectedProject.tech_stack.map((tech, i) => (
                <span
                  key={i}
                  className="font-mono-hud text-[10px] bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30 px-2.5 py-0.5 rounded-md font-semibold"
                >
                  {tech}
                </span>
              ))}
            </div>

            {/* Case Study Structured Sections */}
            {selectedProject.case_study ? (
              <div className="flex flex-col gap-6 text-xs text-slate-300">
                
                {/* 1. Executive Summary */}
                <div className="p-4 rounded-xl bg-[#38BDF8]/5 border border-[#38BDF8]/20">
                  <div className="flex items-center gap-2 font-mono-hud text-[11px] text-[#38BDF8] font-bold uppercase tracking-wider mb-1.5">
                    <Activity className="w-3.5 h-3.5" />
                    <span>EXECUTIVE SUMMARY</span>
                  </div>
                  <p className="font-inter leading-relaxed text-slate-200">
                    {selectedProject.case_study.executive_summary}
                  </p>
                </div>

                {/* 2. Business Problem & Why It Matters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#070A0E] border border-slate-800">
                    <div className="flex items-center gap-2 font-mono-hud text-[10px] text-[#FFA14A] font-bold uppercase tracking-wider mb-1.5">
                      <Compass className="w-3.5 h-3.5" />
                      <span>THE BUSINESS PROBLEM</span>
                    </div>
                    <p className="font-inter leading-relaxed text-slate-300">
                      {selectedProject.case_study.business_problem}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#070A0E] border border-slate-800">
                    <div className="flex items-center gap-2 font-mono-hud text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-1.5">
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>WHY IT MATTERS (P&L IMPACT)</span>
                    </div>
                    <p className="font-inter leading-relaxed text-slate-300">
                      {selectedProject.case_study.why_it_matters}
                    </p>
                  </div>
                </div>

                {/* 3. My Role */}
                {selectedProject.case_study.my_role && selectedProject.case_study.my_role.length > 0 && (
                  <div className="p-4 rounded-xl bg-[#070A0E] border border-slate-800">
                    <div className="font-mono-hud text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
                      LEADERSHIP & ENGINEERING EXECUTION
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {selectedProject.case_study.my_role.map((r, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
                          <span className="font-mono-hud text-[9px] text-[#FFA14A] font-bold uppercase block">
                            {r.role}
                          </span>
                          <span className="font-inter text-xs text-slate-300 mt-0.5 block">
                            {r.action}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Solution Architecture */}
                <div className="p-4 rounded-xl bg-[#070A0E] border border-slate-800">
                  <div className="flex items-center gap-2 font-mono-hud text-[10px] text-[#38BDF8] font-bold uppercase tracking-wider mb-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>SOLUTION ARCHITECTURE & SYSTEM TOPOLOGY</span>
                  </div>
                  <p className="font-inter leading-relaxed text-slate-200 whitespace-pre-line">
                    {selectedProject.case_study.solution_architecture}
                  </p>
                </div>

                {/* 5. Governance & Security Boundary */}
                <div className="p-4 rounded-xl bg-[#070A0E] border border-slate-800">
                  <div className="flex items-center gap-2 font-mono-hud text-[10px] text-[#FFA14A] font-bold uppercase tracking-wider mb-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>GOVERNANCE & ZERO-TRUST SECURITY CONTROLS</span>
                  </div>
                  <p className="font-inter leading-relaxed text-slate-300">
                    {selectedProject.case_study.governance_security}
                  </p>
                </div>

                {/* 6. Commercial Intelligence Layer */}
                {selectedProject.case_study.commercial_intel_layer && (
                  <div className="p-4 rounded-xl bg-[#070A0E] border border-slate-800">
                    <div className="flex items-center gap-2 font-mono-hud text-[10px] text-[#38BDF8] font-bold uppercase tracking-wider mb-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      <span>COMMERCIAL INTELLIGENCE & OBSERVABILITY LAYER</span>
                    </div>
                    <p className="font-inter leading-relaxed text-slate-300">
                      {selectedProject.case_study.commercial_intel_layer}
                    </p>
                  </div>
                )}

                {/* 7. Results & Key Learnings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                    <div className="flex items-center gap-2 font-mono-hud text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>QUANTIFIED RESULTS</span>
                    </div>
                    <p className="font-inter leading-relaxed text-slate-200">
                      {selectedProject.case_study.results}
                    </p>
                  </div>

                  {selectedProject.case_study.lessons_learned && (
                    <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30">
                      <div className="flex items-center gap-2 font-mono-hud text-[10px] text-amber-400 font-bold uppercase tracking-wider mb-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>ARCHITECTURAL LESSONS</span>
                      </div>
                      <p className="font-inter leading-relaxed text-slate-200">
                        {selectedProject.case_study.lessons_learned}
                      </p>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <p className="font-inter text-sm text-slate-300 leading-relaxed">
                {selectedProject.short_desc}
              </p>
            )}

            {/* Modal Footer Actions */}
            <div className="mt-8 pt-5 border-t border-slate-800 flex items-center justify-between">
              {selectedProject.github_link ? (
                <a
                  href={selectedProject.github_link}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#38BDF8] hover:bg-[#7dd3fc] text-slate-950 font-mono-hud text-xs font-bold tracking-wider shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>VIEW REPOSITORY ON GITHUB</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <div />
              )}

              <button
                onClick={() => setSelectedProject(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono-hud text-xs border border-slate-700 transition-colors"
              >
                CLOSE BLUEPRINT
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
