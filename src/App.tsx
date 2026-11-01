import React, { useState, useEffect, useCallback } from 'react';
import { ChamberId } from './types';
import { useVaultData } from './hooks/useVaultData';
import { audioEngine } from './utils/audioEngine';
import { DroneHUD } from './components/HUD/DroneHUD';
import { GlobalPlayer } from './components/Audio/GlobalPlayer';
import { MainConcourse } from './components/Chambers/MainConcourse';
import { OpticsChamber } from './components/Chambers/OpticsChamber';
import { SynthesisChamber } from './components/Chambers/SynthesisChamber';
import { AcousticsChamber } from './components/Chambers/AcousticsChamber';
import { ArchitectChamber } from './components/Chambers/ArchitectChamber';
import { AiProjectsChamber } from './components/Chambers/AiProjectsChamber';
import { VaultStudioModal, StudioTarget } from './components/Studio/VaultStudioModal';

export const App: React.FC = () => {
  const {
    manifest,
    loading,
    error,
    addPhoto,
    addAiArt,
    addTrackToAlbum,
    deleteTrack,
    clearSampleTracks,
    exportManifestJson,
    setManifest
  } = useVaultData();

  const [currentChamber, setCurrentChamber] = useState<ChamberId>('concourse');
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [studioTarget, setStudioTarget] = useState<StudioTarget | null>(null);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleOpenStudioForFrame = useCallback((target: StudioTarget) => {
    setStudioTarget(target);
    setIsStudioOpen(true);
  }, []);

  // Stealth Builder Mode (hidden from normal visitors by default, saved in localStorage for the builder)
  const [isBuilderMode, setIsBuilderMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('vault_builder_mode') === 'true';
    } catch {
      return false;
    }
  });

  const toggleBuilderMode = useCallback((forcedState?: boolean) => {
    setIsBuilderMode(prev => {
      const next = forcedState !== undefined ? forcedState : !prev;
      try {
        localStorage.setItem('vault_builder_mode', next ? 'true' : 'false');
      } catch {}
      return next;
    });
  }, []);

  // Check URL hash for direct routing e.g. #/studio, #/optics, #/optics/street, #/acoustics
  useEffect(() => {
    const handleHash = () => {
      const fullHash = window.location.hash.replace('#/', '');
      const primaryChamber = fullHash.split('/')[0];
      if (primaryChamber === 'studio') {
        toggleBuilderMode(true);
        setIsStudioOpen(true);
      } else if (['concourse', 'optics', 'synthesis', 'acoustics', 'architect', 'ai-projects'].includes(primaryChamber)) {
        setCurrentChamber(primaryChamber as ChamberId);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [toggleBuilderMode]);

  // Smooth Navigation Glide
  const handleNavigate = useCallback((targetChamber: ChamberId) => {
    if (targetChamber === currentChamber) {
      // If clicking optics while inside a subcategory room (portraits/street/light-art), return to gateway!
      if (targetChamber === 'optics' && window.location.hash.includes('/optics/')) {
        audioEngine.playGlideSFX();
        window.location.hash = '#/optics';
      }
      return;
    }
    audioEngine.playGlideSFX();
    setIsTransitioning(true);
    setHasMoved(true);

    setTimeout(() => {
      setCurrentChamber(targetChamber);
      window.location.hash = `#/${targetChamber}`;
      setTimeout(() => {
        setIsTransitioning(false);
      }, 150);
    }, 250);
  }, [currentChamber]);

  // Global Click SFX & Ambient Score Trigger
  const hasStartedAmbientRef = React.useRef(false);

  useEffect(() => {
    const handleGlobalClick = () => {
      // 1. Play crisp futuristic click SFX on every interaction
      audioEngine.playClickSFX();

      // 2. Start ambient score on very first user gesture if not playing any music
      if (!hasStartedAmbientRef.current) {
        hasStartedAmbientRef.current = true;
        if (!audioEngine.isAmbientPlaying && !audioEngine.isPlaying) {
          audioEngine.startAmbientScore();
        }
      }
    };

    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle Studio / Builder Mode: Ctrl+Shift+U
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        toggleBuilderMode(true);
        setIsStudioOpen(prev => !prev);
        audioEngine.playLockOnSFX();
        return;
      }

      // Play/Pause: Space (unless typing in input/textarea)
      if (e.code === 'Space' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        audioEngine.togglePlay();
        return;
      }

      // Back / Exit: Escape
      if (e.key === 'Escape') {
        if (isStudioOpen) {
          setIsStudioOpen(false);
          return;
        }
        // If inside an individual optics room (portraits, street, light-art), let the chamber's escape handler return to Optics Gateway
        if (currentChamber === 'optics' && window.location.hash.includes('/optics/')) {
          return;
        }
        if (currentChamber !== 'concourse') {
          handleNavigate('concourse');
        }
        return;
      }

      // Quick numbers 1 - 4
      if (!(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        if (e.key === '1') handleNavigate('optics');
        if (e.key === '2') handleNavigate('synthesis');
        if (e.key === '3') handleNavigate('acoustics');
        if (e.key === '4') handleNavigate('architect');
        if (e.key === '0' || e.key === '`') handleNavigate('concourse');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStudioOpen, currentChamber, handleNavigate]);

  // 360° Mouse Look / Pan Movement
  const handleMouseMove = (e: React.MouseEvent) => {
    const normX = (e.clientX / window.innerWidth) * 2 - 1;
    const normY = (e.clientY / window.innerHeight) * 2 - 1;
    setMouseOffset({ x: normX, y: normY });
    if (!hasMoved && (Math.abs(normX) > 0.05 || Math.abs(normY) > 0.05)) {
      setHasMoved(true);
    }
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  // Loading State
  if (loading) {
    return (
      <div className="w-screen h-screen bg-[#070A0E] flex flex-col items-center justify-center select-none text-white">
        <div className="relative w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#FF6B1A] animate-spin" />
          <div className="absolute inset-3 rounded-full border border-[#38BDF8] animate-ping opacity-40" />
          <div className="w-4 h-4 rounded-full bg-[#FFA14A] glow-ember" />
        </div>
        <h2 className="font-syne text-xl tracking-[0.3em] font-extrabold uppercase mt-6 glow-ember-text">
          INITIALIZING THE VAULT
        </h2>
        <span className="font-mono-hud text-xs text-slate-400 tracking-widest mt-1">
          AERODYNAMIC TELEMETRY // 60FPS SYNC
        </span>
      </div>
    );
  }

  if (error || !manifest) {
    return (
      <div className="w-screen h-screen bg-[#070A0E] flex flex-col items-center justify-center text-center p-6 text-white font-mono-hud">
        <span className="text-red-400 text-sm font-bold">TELEMETRY_ERROR // MANIFEST_LOAD_FAILED</span>
        <p className="text-xs text-slate-400 mt-2 max-w-md">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 rounded bg-[#FF6B1A] text-slate-950 font-bold text-xs"
        >
          RETRY LINK
        </button>
      </div>
    );
  }

  return (
    <div 
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className={`relative w-screen h-screen overflow-hidden bg-[#070A0E] perspective-viewport ${
        isDragging ? 'cursor-grabbing' : 'cursor-default'
      }`}
    >
      {/* PERSISTENT DRONE TELEMETRY HUD OVERLAY */}
      <DroneHUD
        currentChamber={currentChamber}
        onNavigate={handleNavigate}
        onOpenStudio={() => setIsStudioOpen(true)}
        isBuilderMode={isBuilderMode}
        onToggleBuilderMode={toggleBuilderMode}
        hasMoved={hasMoved}
      />

      {/* CHAMBER VIEWPORT CONTAINER (GLIDE TRANSITION) */}
      <div 
        className={`w-full h-full transition-all duration-300 ${
          isTransitioning ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'
        }`}
      >
        {currentChamber === 'concourse' && (
          <MainConcourse
            onNavigate={handleNavigate}
            mouseOffset={mouseOffset}
          />
        )}

        {currentChamber === 'optics' && (
          <OpticsChamber
            categories={manifest.photography.categories}
            photos={manifest.photography.items}
            mouseOffset={mouseOffset}
            onBackToConcourse={() => handleNavigate('concourse')}
            onOpenStudioForFrame={isBuilderMode ? handleOpenStudioForFrame : undefined}
          />
        )}

        {currentChamber === 'synthesis' && (
          <SynthesisChamber
            items={manifest.aiArt.items}
            mouseOffset={mouseOffset}
            onBackToConcourse={() => handleNavigate('concourse')}
            onOpenStudioForFrame={isBuilderMode ? handleOpenStudioForFrame : undefined}
          />
        )}

        {currentChamber === 'acoustics' && (
          <AcousticsChamber
            albums={manifest.acoustics.albums}
            mouseOffset={mouseOffset}
            onBackToConcourse={() => handleNavigate('concourse')}
            onOpenStudio={() => handleOpenStudioForFrame({ tab: 'music' })}
            onDeleteTrack={deleteTrack}
            onClearSampleTracks={clearSampleTracks}
          />
        )}

        {currentChamber === 'architect' && (
          <ArchitectChamber
            profile={manifest.architect}
            mouseOffset={mouseOffset}
            onBackToConcourse={() => handleNavigate('concourse')}
          />
        )}

        {currentChamber === 'ai-projects' && (
          <AiProjectsChamber
            projects={manifest.aiProjects || []}
            mouseOffset={mouseOffset}
            onBackToConcourse={() => handleNavigate('concourse')}
          />
        )}
      </div>

      {/* PERSISTENT GLOBAL DOCKED MINI-AUDIO PLAYER (WHEN NOT IN ACOUSTICS) */}
      {currentChamber !== 'acoustics' && (
        <GlobalPlayer
          onOpenAcoustics={() => handleNavigate('acoustics')}
        />
      )}

      {/* VAULT STUDIO CONTENT GENERATOR MODAL */}
      <VaultStudioModal
        isOpen={isStudioOpen}
        onClose={() => {
          setIsStudioOpen(false);
          setStudioTarget(null);
        }}
        isBuilderMode={isBuilderMode}
        onToggleBuilderMode={toggleBuilderMode}
        manifest={manifest}
        onAddPhoto={addPhoto}
        onAddAiArt={addAiArt}
        onAddTrack={addTrackToAlbum}
        onDeleteTrack={deleteTrack}
        onClearSampleTracks={clearSampleTracks}
        onExportManifest={exportManifestJson}
        onSetManifest={setManifest}
        initialTarget={studioTarget}
        onClearInitialTarget={() => setStudioTarget(null)}
      />

    </div>
  );
};

export default App;
