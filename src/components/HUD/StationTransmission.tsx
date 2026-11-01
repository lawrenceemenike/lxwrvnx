import React, { useState, useEffect } from 'react';
import { Radio, X, RotateCcw, Terminal } from 'lucide-react';
import { audioEngine } from '../../utils/audioEngine';

interface StationTransmissionProps {
  onDismiss?: () => void;
}

export const StationTransmission: React.FC<StationTransmissionProps> = ({ onDismiss }) => {
  const fullText = "Welcome to the LXWRVNX Verse...";
  const subText = "Sector 01: Concourse. All transit channels active.";

  const [displayedText, setDisplayedText] = useState("");
  const [displayedSubText, setDisplayedSubText] = useState("");
  const [isDone, setIsDone] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Typewriter effect
  useEffect(() => {
    let charIdx = 0;
    let subIdx = 0;
    setDisplayedText("");
    setDisplayedSubText("");
    setIsDone(false);

    // Initial slight pause before transmission starts (mimicking space transit teletype)
    const startTimeout = setTimeout(() => {
      const typeInterval = setInterval(() => {
        if (charIdx < fullText.length) {
          setDisplayedText(fullText.slice(0, charIdx + 1));
          charIdx++;
        } else if (subIdx < subText.length) {
          setDisplayedSubText(subText.slice(0, subIdx + 1));
          subIdx++;
        } else {
          clearInterval(typeInterval);
          setIsDone(true);
        }
      }, 38);

      return () => clearInterval(typeInterval);
    }, 600);

    return () => clearTimeout(startTimeout);
  }, [isMinimized]);

  const handleReplay = (e: React.MouseEvent) => {
    e.stopPropagation();
    audioEngine.playClickSFX();
    setIsMinimized(false);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    audioEngine.playClickSFX();
    setIsMinimized(true);
    if (onDismiss) onDismiss();
  };

  if (!isVisible) return null;

  if (isMinimized) {
    return (
      <div className="pointer-events-auto mt-2">
        <button
          onClick={handleReplay}
          className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#0D1B24]/85 hover:bg-[#0D1B24] border border-[#38BDF8]/40 hover:border-[#38BDF8] text-[#38BDF8] font-mono-hud text-[10px] tracking-wider transition-all duration-200 shadow-[0_0_12px_rgba(56,189,248,0.2)] group"
          title="Replay Station Welcome Transmission"
        >
          <RotateCcw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-300" />
          <span>REPLAY TRANSMISSION</span>
        </button>
      </div>
    );
  }

  return (
    <div className="pointer-events-auto mt-2 max-w-sm w-full animate-fade-in">
      <div className="p-3 rounded-lg bg-[#070A0E]/95 backdrop-blur-xl border border-[#38BDF8]/50 shadow-[0_0_25px_rgba(56,189,248,0.2)] text-left relative overflow-hidden group">
        
        {/* Subtle Top Glowing Line */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#38BDF8] to-transparent opacity-80" />

        {/* Transmission Header */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-1.5 mb-2">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-[#38BDF8] animate-pulse" />
            <span className="font-mono-hud text-[9px] font-bold text-[#38BDF8] tracking-widest uppercase">
              ORBITAL STATION // VOX TRANSMISSION
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Indicator Dot */}
            <span className="flex items-center gap-1 font-mono-hud text-[8px] text-[#FFA14A]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B1A] animate-ping" />
              LIVE
            </span>

            {/* Minimize / Close */}
            <button
              onClick={handleClose}
              className="text-slate-500 hover:text-white transition-colors p-0.5 rounded hover:bg-white/10"
              title="Minimize"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Typewriter Terminal Content */}
        <div className="flex items-start gap-2">
          <Terminal className="w-3.5 h-3.5 text-[#FFA14A] mt-0.5 shrink-0" />
          <div className="flex flex-col font-mono-hud leading-relaxed">
            {/* Main Welcome Line */}
            <span className="text-[12px] font-bold text-white tracking-wide drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
              {displayedText}
              {!isDone && (
                <span className="inline-block w-2 h-3.5 ml-0.5 bg-[#38BDF8] animate-pulse align-middle" />
              )}
            </span>

            {/* Telemetry Sub-line */}
            {displayedSubText && (
              <span className="text-[10px] text-slate-400 mt-1 tracking-wider">
                &gt; {displayedSubText}
              </span>
            )}
          </div>
        </div>

        {/* Bottom Audio/Telemetry Bar */}
        <div className="mt-2.5 pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[8px] font-mono-hud text-slate-500">
          <span className="tracking-widest">FREQ: 104.2 MHz // SECURE</span>
          <div className="flex items-center gap-1">
            <span className="w-1 h-2 bg-[#38BDF8]/60 rounded-full animate-bounce" style={{ animationDuration: '0.5s' }} />
            <span className="w-1 h-3 bg-[#38BDF8]/80 rounded-full animate-bounce" style={{ animationDuration: '0.4s' }} />
            <span className="w-1 h-1.5 bg-[#38BDF8]/50 rounded-full animate-bounce" style={{ animationDuration: '0.6s' }} />
          </div>
        </div>

      </div>
    </div>
  );
};
