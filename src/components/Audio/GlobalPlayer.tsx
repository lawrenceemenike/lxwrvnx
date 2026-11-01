import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Disc3 } from 'lucide-react';
import { audioEngine } from '../../utils/audioEngine';
import { WaveformCanvas } from './WaveformCanvas';

interface GlobalPlayerProps {
  onOpenAcoustics?: () => void;
}

export const GlobalPlayer: React.FC<GlobalPlayerProps> = ({ onOpenAcoustics }) => {
  const [isPlaying, setIsPlaying] = useState(audioEngine.isPlaying);
  const [currentTime, setCurrentTime] = useState(audioEngine.currentTime);
  const [duration, setDuration] = useState(audioEngine.duration);
  const [currentTrack, setCurrentTrack] = useState(audioEngine.currentTrack);
  const [currentAlbum, setCurrentAlbum] = useState(audioEngine.currentAlbum);
  const [volume, setVolume] = useState(audioEngine.volume);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const unsubscribe = audioEngine.subscribe(() => {
      setIsPlaying(audioEngine.isPlaying);
      setCurrentTime(audioEngine.currentTime);
      setDuration(audioEngine.duration);
      setCurrentTrack(audioEngine.currentTrack);
      setCurrentAlbum(audioEngine.currentAlbum);
      setVolume(audioEngine.volume);
    });
    return unsubscribe;
  }, []);

  if (!currentTrack) return null;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    audioEngine.seek(val);
  };

  const toggleMute = () => {
    if (isMuted) {
      audioEngine.setVolume(volume || 0.8);
      setIsMuted(false);
    } else {
      audioEngine.setVolume(0);
      setIsMuted(true);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-3 py-2 md:px-6 md:py-3 bg-[#070A0E]/90 backdrop-blur-xl border-t border-[#FF6B1A]/40 shadow-[0_-10px_30px_rgba(7,10,14,0.9)] transition-all duration-300">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 md:gap-6">
        
        {/* Track Telemetry & Album Info */}
        <div 
          onClick={onOpenAcoustics}
          className="flex items-center gap-3 cursor-pointer group min-w-[200px]"
        >
          <div className="relative w-10 h-10 md:w-12 md:h-12 rounded bg-slate-900 border border-[#FF6B1A]/40 overflow-hidden flex-shrink-0">
            {currentAlbum?.cover ? (
              <img 
                src={currentAlbum.cover} 
                alt={currentAlbum.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#FF6B1A]">
                <Disc3 className="w-6 h-6 animate-spin" />
              </div>
            )}
            {isPlaying && (
              <div className="absolute inset-0 bg-[#FF6B1A]/10 pointer-events-none" />
            )}
          </div>

          <div className="flex flex-col truncate">
            <span className="font-mono-hud text-[11px] md:text-xs font-bold text-white tracking-wider truncate group-hover:text-[#FFA14A] transition-colors">
              {currentTrack.trackNumber} // {currentTrack.title}
            </span>
            <div className="flex items-center gap-2 text-[10px] font-mono-hud text-slate-400">
              <span className="text-[#38BDF8]">{currentAlbum?.title || 'THE VAULT'}</span>
              <span>•</span>
              <span className="text-[#FFA14A]">BPM: {currentTrack.bpm}</span>
              <span>•</span>
              <span>{currentTrack.key}</span>
            </div>
          </div>
        </div>

        {/* Central Mini-Visualizer & Scrubbing Controls */}
        <div className="flex-1 max-w-xl w-full flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (currentAlbum) {
                  const idx = currentAlbum.tracks.findIndex(t => t.id === currentTrack.id);
                  if (idx > 0) audioEngine.playTrack(currentAlbum.tracks[idx - 1], currentAlbum);
                }
              }}
              className="text-slate-400 hover:text-white transition-colors"
              title="Previous Track"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={() => audioEngine.togglePlay()}
              className="w-8 h-8 rounded-full bg-[#FF6B1A] text-slate-950 flex items-center justify-center hover:bg-[#FFA14A] transition-colors shadow-[0_0_15px_rgba(255,107,26,0.5)]"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>

            <button
              onClick={() => {
                if (currentAlbum) {
                  const idx = currentAlbum.tracks.findIndex(t => t.id === currentTrack.id);
                  if (idx < currentAlbum.tracks.length - 1) {
                    audioEngine.playTrack(currentAlbum.tracks[idx + 1], currentAlbum);
                  }
                }
              }}
              className="text-slate-400 hover:text-white transition-colors"
              title="Next Track"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Mini Waveform & Timeline */}
          <div className="w-full flex items-center gap-3">
            <span className="font-mono-hud text-[10px] text-slate-400 w-10 text-right">
              {formatTime(currentTime)}
            </span>

            <div className="relative flex-1 h-5 flex items-center">
              <div className="absolute inset-0 opacity-40 pointer-events-none">
                <WaveformCanvas height={20} barColor="#FF6B1A" />
              </div>
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.5}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 appearance-none bg-slate-700/50 rounded cursor-pointer accent-[#FF6B1A] z-10"
              />
            </div>

            <span className="font-mono-hud text-[10px] text-slate-400 w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume & Telemetry Mode */}
        <div className="hidden lg:flex items-center gap-3 min-w-[180px] justify-end">
          <button 
            onClick={toggleMute} 
            className="text-slate-400 hover:text-white transition-colors"
          >
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-[#FFA14A]" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setIsMuted(false);
              audioEngine.setVolume(v);
            }}
            className="w-20 h-1 appearance-none bg-slate-700 rounded cursor-pointer accent-[#FF6B1A]"
          />
          <span className="font-mono-hud text-[9px] text-[#38BDF8] border border-[#38BDF8]/40 px-1.5 py-0.5 rounded uppercase">
            LIVE FFT
          </span>
        </div>

      </div>
    </div>
  );
};
