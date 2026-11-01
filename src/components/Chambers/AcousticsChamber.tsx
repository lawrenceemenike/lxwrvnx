import React, { useState, useEffect, useRef } from 'react';
import { AlbumItem, TrackItem } from '../../types';
import { audioEngine } from '../../utils/audioEngine';
import { WaveformCanvas } from '../Audio/WaveformCanvas';
import { FloorTargetRing } from '../Navigation/FloorTargetRing';
import { Play, Pause, Disc3, ArrowLeft, Volume2, VolumeX, Sparkles, Sliders, Upload, Trash2 } from 'lucide-react';

interface AcousticsChamberProps {
  albums: AlbumItem[];
  mouseOffset: { x: number; y: number };
  onBackToConcourse: () => void;
  onOpenStudio?: () => void;
  onDeleteTrack?: (albumId: string, trackId: string) => void;
  onClearSampleTracks?: (albumId?: string) => void;
}

export const AcousticsChamber: React.FC<AcousticsChamberProps> = ({
  albums,
  mouseOffset,
  onBackToConcourse,
  onOpenStudio,
  onDeleteTrack,
  onClearSampleTracks
}) => {
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(albums[0]?.id || 'album-01');
  const selectedAlbum = React.useMemo(() => {
    if (!selectedAlbumId) return null;
    return albums.find(a => a.id === selectedAlbumId) || null;
  }, [albums, selectedAlbumId]);
  const [isPlaying, setIsPlaying] = useState(audioEngine.isPlaying);
  const [currentTrack, setCurrentTrack] = useState<TrackItem | null>(audioEngine.currentTrack);
  const [currentTime, setCurrentTime] = useState(audioEngine.currentTime);
  const [duration, setDuration] = useState(audioEngine.duration);
  const [volume, setVolume] = useState(audioEngine.volume);
  const [isMuted, setIsMuted] = useState(false);

  // Audio-reactive equalizer values for the tunnel arch ribs!
  const [eqLevels, setEqLevels] = useState<number[]>([30, 50, 80, 60, 90, 70, 45, 85, 60, 40]);
  const animRef = useRef<number | null>(null);

  // 3D perspective tilt
  const tiltX = -mouseOffset.y * 5;
  const panY = mouseOffset.x * 9;
  const roll = mouseOffset.x * 1.8;

  useEffect(() => {
    const unsubscribe = audioEngine.subscribe(() => {
      setIsPlaying(audioEngine.isPlaying);
      setCurrentTrack(audioEngine.currentTrack);
      setCurrentTime(audioEngine.currentTime);
      setDuration(audioEngine.duration);
      setVolume(audioEngine.volume);
    });
    return unsubscribe;
  }, []);

  // Update audio-reactive equalizer rib bars at 60 FPS
  useEffect(() => {
    const loop = () => {
      const freqData = audioEngine.getFrequencyData();
      if (audioEngine.isPlaying && freqData.length > 0) {
        // Sample 10 frequency bands
        const newLevels: number[] = [];
        const step = Math.floor(freqData.length / 10);
        for (let i = 0; i < 10; i++) {
          const val = freqData[i * step] || 0;
          newLevels.push(Math.max(15, (val / 255) * 100));
        }
        setEqLevels(newLevels);
      } else {
        // Idle gentle breathing animation
        const now = Date.now() * 0.003;
        setEqLevels([
          25 + Math.sin(now) * 10,
          40 + Math.sin(now + 1) * 12,
          55 + Math.sin(now + 2) * 15,
          45 + Math.sin(now + 3) * 12,
          65 + Math.sin(now + 4) * 18,
          50 + Math.sin(now + 5) * 14,
          35 + Math.sin(now + 6) * 10,
          60 + Math.sin(now + 7) * 15,
          40 + Math.sin(now + 8) * 10,
          25 + Math.sin(now + 9) * 8
        ]);
      }
      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const handleTrackPlay = (track: TrackItem) => {
    if (currentTrack?.id === track.id && isPlaying) {
      audioEngine.pause();
    } else {
      audioEngine.playTrack(track, selectedAlbum || undefined);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    audioEngine.seek(val);
  };

  return (
    <div className="relative w-full h-full overflow-hidden flex items-center justify-center select-none bg-[#070A0E]">
      
      {/* 3D SCENE PERSPECTIVE CONTAINER */}
      <div 
        className="absolute inset-0 preserve-3d transition-transform duration-200 ease-out flex items-center justify-center"
        style={{
          transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${panY}deg) rotateZ(${roll}deg)`
        }}
      >
        {/* Photorealistic Acoustics Wind Tunnel Backdrop from User's Mockup */}
        <div 
          className="absolute inset-[-4%] bg-cover bg-center transition-transform duration-300"
          style={{
            backgroundImage: "url('/media/vault-rooms/acoustics.jpg')",
            transform: 'scale(1.06)'
          }}
        />

        {/* Ambient Dark Overlay */}
        <div className="absolute inset-0 bg-[#070A0E]/30 backdrop-blur-[1px] pointer-events-none" />

        {/* AUDIO-REACTIVE EQUALIZER BARS ALONG THE ARCH RIBS (Left & Right) */}
        {/* Left Arch Ribs Equalizer */}
        <div className="absolute left-[2%] md:left-[5%] top-[25%] bottom-[25%] w-12 hidden md:flex flex-col justify-around pointer-events-none z-10 opacity-80">
          {eqLevels.slice(0, 8).map((lvl, idx) => (
            <div key={`left-eq-${idx}`} className="flex items-center gap-1">
              <div 
                className="h-1 rounded-r bg-gradient-to-r from-[#FF6B1A] to-[#FFA14A] glow-ember transition-all duration-75"
                style={{ width: `${lvl * 0.7}px` }}
              />
              <span className="font-mono-hud text-[7px] text-[#FFA14A]/70">
                {Math.round(lvl)}
              </span>
            </div>
          ))}
        </div>

        {/* Right Arch Ribs Equalizer */}
        <div className="absolute right-[2%] md:right-[5%] top-[25%] bottom-[25%] w-12 hidden md:flex flex-col items-end justify-around pointer-events-none z-10 opacity-80">
          {eqLevels.slice(2, 10).map((lvl, idx) => (
            <div key={`right-eq-${idx}`} className="flex items-center gap-1">
              <span className="font-mono-hud text-[7px] text-[#FFA14A]/70">
                {Math.round(lvl)}
              </span>
              <div 
                className="h-1 rounded-l bg-gradient-to-l from-[#FF6B1A] to-[#FFA14A] glow-ember transition-all duration-75"
                style={{ width: `${lvl * 0.7}px` }}
              />
            </div>
          ))}
        </div>

        {/* ======================================================== */}
        {/* STEP 1: DUAL ALBUM GATEWAY (When no album is inspected) */}
        {/* ======================================================== */}
        {!selectedAlbum && (
          <div className="relative z-20 w-full max-w-5xl px-4 flex flex-col items-center">
            <div className="text-center mb-8">
              <span className="font-mono-hud text-[11px] text-[#38BDF8] tracking-widest uppercase">
                CHAMBER // 03: ACOUSTICS
              </span>
              <h2 className="font-syne text-2xl md:text-4xl font-extrabold text-white tracking-widest mt-1">
                AI MUSIC & SONIC LAB // DUAL ALBUM GATEWAY
              </h2>
              <div className="w-24 h-0.5 bg-[#FF6B1A] mx-auto mt-2 glow-ember" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14 w-full">
              {albums.map((album, idx) => (
                <div
                  key={album.id}
                  onClick={() => setSelectedAlbumId(album.id)}
                  className="group rounded-2xl glass-hologram p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:border-[#FFA14A] hover:shadow-[0_0_40px_rgba(255,107,26,0.4)] flex flex-col items-center text-center"
                  style={{
                    transform: `perspective(800px) rotateY(${idx === 0 ? '8deg' : '-8deg'})`
                  }}
                >
                  <div className="relative w-56 h-56 md:w-64 md:h-64 rounded-xl overflow-hidden border-2 border-slate-700/80 group-hover:border-[#FF6B1A] shadow-2xl mb-4">
                    <img
                      src={album.cover}
                      alt={album.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#070A0E] via-transparent to-transparent opacity-80" />
                    <div className="absolute bottom-3 left-3 right-3 text-left">
                      <span className="font-mono-hud text-[9px] text-[#38BDF8] tracking-widest">
                        CODE // {album.code}
                      </span>
                      <h3 className="font-syne text-lg md:text-xl font-bold text-white group-hover:text-[#FFA14A]">
                        {album.title}
                      </h3>
                    </div>
                  </div>

                  <span className="font-mono-hud text-[10px] text-[#FFA14A] uppercase tracking-wider">
                    {album.subtitle}
                  </span>
                  <div className="flex items-center gap-3 mt-2 text-xs font-mono-hud text-slate-400">
                    <span>{album.genre}</span>
                    <span>•</span>
                    <span className="text-[#38BDF8]">{album.tracks.length} TRACKS</span>
                    <span>•</span>
                    <span>{album.runtime}</span>
                  </div>

                  <div className="mt-4">
                    <FloorTargetRing
                      label="ACCESS ALBUM CONSOLE"
                      sublabel="CLICK TO ENTER"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-4 flex-wrap justify-center">
              <button
                onClick={onBackToConcourse}
                className="flex items-center gap-2 font-mono-hud text-xs text-slate-400 hover:text-[#FFA14A] bg-[#0D1B24]/70 px-4 py-2 rounded-full border border-slate-700 hover:border-[#FF6B1A] transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                BACK TO MAIN CONCOURSE
              </button>

              {onOpenStudio && (
                <button
                  onClick={onOpenStudio}
                  className="flex items-center gap-2 font-mono-hud text-xs text-[#FFA14A] bg-[#FF6B1A]/20 hover:bg-[#FF6B1A] hover:text-slate-950 px-4 py-2 rounded-full border border-[#FF6B1A]/60 transition-all cursor-pointer shadow-[0_0_15px_rgba(255,107,26,0.3)]"
                >
                  <Upload className="w-4 h-4" />
                  UPLOAD NEW TRACK
                </button>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 2: HOLOGRAPHIC MASTERING CONSOLE (ALBUM VIEW) */}
        {/* Exactly matching Mockup 1: Monolith on left, Console on right */}
        {/* ======================================================== */}
        {selectedAlbum && (
          <div className="relative z-20 w-full max-w-6xl px-4 md:px-8 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 animate-fade-in">
            
            {/* LEFT: DOCKED FORWARD-FACING ALBUM MONOLITH */}
            <div 
              className="relative w-full md:w-[320px] rounded-2xl glass-hologram p-5 flex flex-col justify-between border-2 border-[#FF6B1A]/60 shadow-[0_0_40px_rgba(255,107,26,0.35)] flex-shrink-0"
              style={{
                transform: 'perspective(700px) rotateY(10deg)',
                transformOrigin: 'left center'
              }}
            >
              {/* Album Cover */}
              <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-[#FF6B1A]/40 mb-4 shadow-xl">
                <img
                  src={selectedAlbum.cover}
                  alt={selectedAlbum.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070A0E] via-transparent to-transparent opacity-75" />
                
                {isPlaying && currentTrack && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-[#070A0E]/80 backdrop-blur-md px-2 py-0.5 rounded border border-[#FF6B1A]/50 font-mono-hud text-[9px] text-[#FFA14A]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B1A] animate-ping" />
                    LIVE
                  </div>
                )}
              </div>

              {/* Title & Metadata */}
              <div>
                <span className="font-mono-hud text-[10px] text-[#38BDF8] tracking-widest font-bold">
                  {selectedAlbum.code} // {selectedAlbum.title}
                </span>
                <h3 className="font-syne text-lg md:text-xl font-bold text-white tracking-wider glow-ember-text mt-0.5">
                  {selectedAlbum.subtitle}
                </h3>

                <div className="grid grid-cols-2 gap-2 mt-3 p-3 rounded-lg bg-[#070A0E]/60 border border-slate-800 font-mono-hud text-[10px] text-slate-300">
                  <div>
                    <span className="text-slate-500">GENRE: </span>
                    <span className="text-[#FFA14A]">{selectedAlbum.genre}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">RUNTIME: </span>
                    <span>{selectedAlbum.runtime}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">TRACKS: </span>
                    <span className="text-[#38BDF8]">{selectedAlbum.tracks.length}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">STATUS: </span>
                    <span className="text-emerald-400">MASTERED</span>
                  </div>
                </div>
              </div>

              {/* Album Switcher Button */}
              <div className="mt-4 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    const otherAlbum = albums.find(a => a.id !== selectedAlbum.id);
                    if (otherAlbum) setSelectedAlbumId(otherAlbum.id);
                  }}
                  className="flex-1 py-1.5 px-2 rounded font-mono-hud text-[10px] text-[#38BDF8] border border-[#38BDF8]/40 hover:bg-[#38BDF8]/20 transition-all text-center cursor-pointer"
                >
                  SWITCH ALBUM
                </button>

                <button
                  onClick={() => setSelectedAlbumId(null)}
                  className="py-1.5 px-3 rounded font-mono-hud text-[10px] text-slate-400 border border-slate-700 hover:text-white transition-colors cursor-pointer"
                >
                  [ESC]
                </button>
              </div>
            </div>

            {/* RIGHT: EXPANSIVE FLOATING TRACKS // RECON HOLOGRAPHIC CONSOLE */}
            <div 
              className="relative w-full md:w-[620px] rounded-2xl glass-hologram p-6 md:p-8 flex flex-col justify-between border-2 border-[#FF6B1A]/60 shadow-[0_0_50px_rgba(255,107,26,0.3)]"
              style={{
                transform: 'perspective(700px) rotateY(-4deg)'
              }}
            >
              {/* Console Header */}
              <div className="flex items-center justify-between border-b border-[#FF6B1A]/30 pb-3 mb-4">
                <div>
                  <h3 className="font-mono-hud text-sm md:text-base font-bold text-white tracking-widest">
                    TRACKS // RECON
                  </h3>
                  <span className="font-mono-hud text-[9px] text-[#FFA14A] tracking-wider uppercase">
                    AUDIO MASTERING CONSOLE // REAL-TIME FFT
                  </span>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  {onClearSampleTracks && selectedAlbum.tracks.some(t => /^track-\d{2}-\d{2}$/.test(t.id)) && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete all default sample tracks from "${selectedAlbum.title}" and keep only your uploaded tracks?`)) {
                          onClearSampleTracks(selectedAlbum.id);
                        }
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-white border border-red-800/60 font-mono-hud text-[10px] font-bold tracking-wider transition-all cursor-pointer shadow-[0_0_12px_rgba(239,68,68,0.2)]"
                      title="Remove initial sample tracks from this album"
                    >
                      <Trash2 className="w-3 h-3 text-red-400" />
                      <span>CLEAR SAMPLE TRACKS</span>
                    </button>
                  )}

                  {onOpenStudio && (
                    <button
                      onClick={onOpenStudio}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FF6B1A]/20 hover:bg-[#FF6B1A] text-[#FFA14A] hover:text-slate-950 border border-[#FF6B1A]/50 font-mono-hud text-[10px] font-bold tracking-wider transition-all cursor-pointer shadow-[0_0_12px_rgba(255,107,26,0.2)]"
                      title="Upload or attach audio tracks to this album"
                    >
                      <Upload className="w-3 h-3" />
                      <span>UPLOAD MUSIC</span>
                    </button>
                  )}
                  <div className="text-right font-mono-hud text-[9px] hidden lg:block">
                    <span className="text-slate-400">PLAYBACK: </span>
                    <span className="text-[#38BDF8] font-bold">EXCLUSIVE</span>
                  </div>
                </div>
              </div>

              {/* Numbered Tracklist */}
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                {selectedAlbum.tracks.map((track) => {
                  const isTrackActive = currentTrack?.id === track.id;
                  const isTrackPlaying = isTrackActive && isPlaying;
                  const isCustomTrack = (track.id.startsWith('track-') && track.id.length > 10) || Boolean((track as any).isCustom);

                  return (
                    <div
                      key={track.id}
                      onClick={() => handleTrackPlay(track)}
                      className={`group flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all ${
                        isTrackActive 
                          ? 'bg-[#FF6B1A]/20 border border-[#FF6B1A] shadow-[0_0_15px_rgba(255,107,26,0.25)]' 
                          : 'bg-[#070A0E]/50 border border-slate-800/80 hover:border-slate-700 hover:bg-[#070A0E]/80'
                      }`}
                    >
                      {/* Track Title & Live Badge */}
                      <div className="flex items-center gap-2">
                        <span className="font-mono-hud text-xs font-bold text-[#FFA14A]">
                          {track.trackNumber}
                        </span>
                        <span className="font-syne text-xs md:text-sm font-bold text-white group-hover:text-[#FFA14A] transition-colors">
                          // {track.title}
                        </span>
                        {isCustomTrack && (
                          <span className="bg-[#FF6B1A] text-slate-950 font-mono-hud text-[8px] font-black px-1.5 py-0.5 rounded shadow-[0_0_8px_#FF6B1A]">
                            LIVE
                          </span>
                        )}
                      </div>

                      {/* Mini-Waveform & Telemetry */}
                      <div className="flex items-center gap-3">
                        {/* Mini Waveform graphic */}
                        <div className="w-16 h-4 hidden sm:flex items-center justify-center opacity-60">
                          {isTrackPlaying ? (
                            <div className="flex items-end gap-0.5 h-full">
                              <span className="w-1 bg-[#FFA14A] h-2 animate-bounce" />
                              <span className="w-1 bg-[#FFA14A] h-4 animate-bounce delay-75" />
                              <span className="w-1 bg-[#FFA14A] h-1 animate-bounce delay-150" />
                              <span className="w-1 bg-[#FFA14A] h-3 animate-bounce delay-100" />
                            </div>
                          ) : (
                            <div className="w-full h-[1px] bg-slate-600" />
                          )}
                        </div>

                        {/* BPM & Key */}
                        <div className="font-mono-hud text-[10px] text-slate-400">
                          <span className="text-[#38BDF8]">BPM: {track.bpm}</span>
                          <span className="mx-1">•</span>
                          <span>{track.key}</span>
                        </div>

                        {/* Delete Button */}
                        {onDeleteTrack && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Delete track "${track.title}" from album?`)) {
                                onDeleteTrack(selectedAlbum.id, track.id);
                              }
                            }}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                            title={`Delete track ${track.title}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Play Button */}
                        <button
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                            isTrackPlaying 
                              ? 'bg-[#FFA14A] text-slate-950 shadow-[0_0_12px_rgba(255,107,26,0.8)]' 
                              : 'bg-slate-800 text-slate-300 group-hover:bg-[#FF6B1A] group-hover:text-slate-950'
                          }`}
                        >
                          {isTrackPlaying ? (
                            <Pause className="w-3.5 h-3.5 fill-current" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Central Real-Time Web Audio API Waveform Visualizer */}
              <div className="mt-5 p-3 rounded-xl bg-[#070A0E]/70 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono-hud text-[10px] text-[#FFA14A] tracking-wider font-bold">
                    AUDIO WAVEFORM // STREAMING
                  </span>
                  <span className="font-mono-hud text-[10px] text-slate-400">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="h-20 w-full flex items-center justify-center">
                  <WaveformCanvas height={75} />
                </div>

                {/* Timeline Slider */}
                <div className="mt-2">
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    step={0.5}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1 appearance-none bg-slate-800 rounded cursor-pointer accent-[#FF6B1A]"
                  />
                </div>
              </div>

              {/* Master Playback Controls */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => audioEngine.togglePlay()}
                    className="px-4 py-1.5 rounded-full bg-[#FF6B1A] text-slate-950 font-mono-hud text-xs font-bold hover:bg-[#FFA14A] transition-colors shadow-[0_0_20px_rgba(255,107,26,0.5)] flex items-center gap-2"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (currentTrack) {
                        const idx = selectedAlbum.tracks.findIndex(t => t.id === currentTrack.id);
                        const nextTrack = selectedAlbum.tracks[(idx + 1) % selectedAlbum.tracks.length];
                        audioEngine.playTrack(nextTrack, selectedAlbum);
                      }
                    }}
                    className="font-mono-hud text-[10px] text-slate-300 hover:text-white px-2 py-1 rounded bg-slate-900 border border-slate-700"
                  >
                    NEXT TRACK
                  </button>
                </div>

                {/* Volume slider */}
                <div className="flex items-center gap-2 font-mono-hud text-[10px]">
                  <button onClick={() => {
                    setIsMuted(!isMuted);
                    audioEngine.setVolume(isMuted ? volume : 0);
                  }}>
                    {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-[#FFA14A]" />}
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
                    className="w-20 h-1 appearance-none bg-slate-800 rounded cursor-pointer accent-[#FF6B1A]"
                  />
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
};
