import React, { useState, useRef, useMemo, useEffect } from 'react';
import { PhotoItem, AiArtItem, TrackItem, PhotoCategory, VaultManifest } from '../../types';
import { getFramesForRoom, RoomFrameSlot } from '../../data/roomFrames';
import { Camera, Sparkles, Music, Download, Upload, Plus, X, Check, Image as ImageIcon, Sliders, Lock, ArrowRight, Layers, Trash2 } from 'lucide-react';

export interface StudioTarget {
  tab?: 'photo' | 'ai' | 'music' | 'json';
  category?: PhotoCategory;
  frameId?: string;
  frameIndex?: number;
  title?: string;
}

interface VaultStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  manifest: VaultManifest | null;
  onAddPhoto: (photo: PhotoItem) => void;
  onAddAiArt: (art: AiArtItem) => void;
  onAddTrack: (albumId: string, track: TrackItem) => void;
  onDeleteTrack?: (albumId: string, trackId: string) => void;
  onClearSampleTracks?: (albumId?: string) => void;
  onExportManifest: () => void;
  onSetManifest: (manifest: VaultManifest) => void;
  isBuilderMode?: boolean;
  onToggleBuilderMode?: (forcedState?: boolean) => void;
  initialTarget?: StudioTarget | null;
  onClearInitialTarget?: () => void;
}

export const VaultStudioModal: React.FC<VaultStudioModalProps> = ({
  isOpen,
  onClose,
  manifest,
  onAddPhoto,
  onAddAiArt,
  onAddTrack,
  onDeleteTrack,
  onClearSampleTracks,
  onExportManifest,
  onSetManifest,
  isBuilderMode = false,
  onToggleBuilderMode,
  initialTarget,
  onClearInitialTarget
}) => {
  const [activeTab, setActiveTab] = useState<'photo' | 'ai' | 'music' | 'json'>('photo');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isProcessingFile, setIsProcessingFile] = useState(false);

  // File input refs for clean resets
  const photoFileInputRef = useRef<HTMLInputElement>(null);
  const aiFileInputRef = useRef<HTMLInputElement>(null);
  const audioFileInputRef = useRef<HTMLInputElement>(null);

  // Photography Form State
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoCategory, setPhotoCategory] = useState<PhotoCategory>('light-art');
  const [selectedFrameId, setSelectedFrameId] = useState<string>('hz-01');
  const [photoLens, setPhotoLens] = useState('35MM F/1.4');
  const [photoShutter, setPhotoShutter] = useState('1/250s');
  const [photoIso, setPhotoIso] = useState('100');
  const [photoBody, setPhotoBody] = useState('ALPHA R');
  const [photoStory, setPhotoStory] = useState('');
  const [photoFilename, setPhotoFilename] = useState('');

  // AI Art Form State
  const [aiTitle, setAiTitle] = useState('');
  const [selectedAiSlotId, setSelectedAiSlotId] = useState<string>('ai-01');
  const [aiFormat, setAiFormat] = useState<'portrait' | 'landscape'>('portrait');
  const [aiEngine, setAiEngine] = useState('Custom Pipeline / Flux.1 Dev + SDXL');
  const [aiSteps, setAiSteps] = useState('45');
  const [aiCfg, setAiCfg] = useState('7.5');
  const [aiSampler, setAiSampler] = useState('DPM++ 2M Karras');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiColor, setAiColor] = useState('Deep Teal and Ember');
  const [aiSeed, setAiSeed] = useState('88421094');
  const [aiLore, setAiLore] = useState('');
  const [aiFilename, setAiFilename] = useState('');

  // Music Form State
  const [albumId, setAlbumId] = useState('album-01');
  const [trackNumber, setTrackNumber] = useState('09');
  const [trackTitle, setTrackTitle] = useState('');
  const [trackBpm, setTrackBpm] = useState('125');
  const [trackKey, setTrackKey] = useState('D Minor');
  const [trackDuration, setTrackDuration] = useState('03:45');
  const [audioFilename, setAudioFilename] = useState('');

  // Available frame slots for current category/tab
  const currentRoomFrames = useMemo(() => {
    return getFramesForRoom(photoCategory);
  }, [photoCategory]);

  const activeFrameObj = useMemo(() => {
    return currentRoomFrames.find(f => f.id === selectedFrameId) || currentRoomFrames[0];
  }, [currentRoomFrames, selectedFrameId]);

  const currentAiFrames = useMemo(() => {
    return getFramesForRoom('synthesis');
  }, []);

  const activeAiSlotObj = useMemo(() => {
    return currentAiFrames.find(f => f.id === selectedAiSlotId) || currentAiFrames[0];
  }, [currentAiFrames, selectedAiSlotId]);

  // Sync category and frame when opening Vault Studio or receiving an initial target
  useEffect(() => {
    if (isOpen) {
      if (initialTarget) {
        if (initialTarget.tab) setActiveTab(initialTarget.tab);
        if (initialTarget.category) {
          setPhotoCategory(initialTarget.category);
          const frames = getFramesForRoom(initialTarget.category);
          if (initialTarget.frameId && frames.some(f => f.id === initialTarget.frameId)) {
            setSelectedFrameId(initialTarget.frameId);
          } else if (initialTarget.frameIndex !== undefined && frames[initialTarget.frameIndex]) {
            setSelectedFrameId(frames[initialTarget.frameIndex].id);
          }
        }
        if (initialTarget.title && !photoTitle) {
          setPhotoTitle(initialTarget.title);
        }
        return;
      }

      const hash = window.location.hash;
      if (hash.includes('light-art')) {
        setActiveTab('photo');
        setPhotoCategory('light-art');
        const frames = getFramesForRoom('light-art');
        setSelectedFrameId(prev => (frames.some(f => f.id === prev) ? prev : frames[0]?.id || 'hz-01'));
      } else if (hash.includes('portraits')) {
        setActiveTab('photo');
        setPhotoCategory('portraits');
        const frames = getFramesForRoom('portraits');
        setSelectedFrameId(prev => (frames.some(f => f.id === prev) ? prev : frames[0]?.id || 'f-01'));
      } else if (hash.includes('street')) {
        setActiveTab('photo');
        setPhotoCategory('street');
        const frames = getFramesForRoom('street');
        setSelectedFrameId(prev => (frames.some(f => f.id === prev) ? prev : frames[0]?.id || 'frame-L1'));
      } else if (hash.includes('synthesis')) {
        setActiveTab('ai');
      } else if (hash.includes('acoustics')) {
        setActiveTab('music');
      }
    }
  }, [isOpen, initialTarget]);

  if (!isOpen) return null;

  // Process file upload with Data URL / Canvas compression for persistent storage
  const processUploadedFile = (file: File) => {
    const safeName = file.name.toLowerCase().replace(/\s+/g, '-');
    if (activeTab === 'photo') {
      setPhotoFilename(safeName);
      if (!photoTitle) setPhotoTitle(file.name.replace(/\.[^/.]+$/, '').toUpperCase());
    } else if (activeTab === 'ai') {
      setAiFilename(safeName);
      if (!aiTitle) setAiTitle(file.name.replace(/\.[^/.]+$/, '').toUpperCase());
    } else if (activeTab === 'music') {
      setAudioFilename(safeName);
      if (!trackTitle) setTrackTitle(file.name.replace(/\.[^/.]+$/, '').toUpperCase());
    }

    // Set immediate preview
    const tempUrl = URL.createObjectURL(file);
    setPreviewUrl(tempUrl);

    // Read as Data URL with canvas optimization so it persists across reloads
    if (file.type.startsWith('image/')) {
      setIsProcessingFile(true);
      const reader = new FileReader();
      reader.onload = (ev) => {
        const rawDataUrl = ev.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const maxDim = 1400;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            const compressed = canvas.toDataURL('image/jpeg', 0.84);
            setPreviewUrl(compressed);
          }
          setIsProcessingFile(false);
        };
        img.onerror = () => setIsProcessingFile(false);
        img.src = rawDataUrl;
      };
      reader.onerror = () => setIsProcessingFile(false);
      reader.readAsDataURL(file);
    } else if (file.type.startsWith('audio/')) {
      setIsProcessingFile(true);
      const reader = new FileReader();
      reader.onload = (ev) => {
        const rawDataUrl = ev.target?.result as string;
        setPreviewUrl(rawDataUrl);
        setIsProcessingFile(false);
      };
      reader.onerror = () => setIsProcessingFile(false);
      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processUploadedFile(file);
  };

  const notifySuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleAddPhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessingFile) {
      notifySuccess('Optimizing image telemetry, please wait a moment...');
      return;
    }
    const targetFrameObj = activeFrameObj || currentRoomFrames[0];
    const frameIdx = currentRoomFrames.findIndex(f => f.id === targetFrameObj.id);

    // Use specific filename or fallback to structured frame filename
    const cleanFilename = photoFilename || `${photoCategory}-${targetFrameObj.id}.jpg`;
    const finalImage = previewUrl || `/media/photography/${photoCategory}/${cleanFilename}`;

    const newPhoto: PhotoItem = {
      id: `photo-${photoCategory}-${targetFrameObj.id}`,
      title: photoTitle.toUpperCase() || targetFrameObj.title || 'PROJECT // UNTITLED',
      category: photoCategory,
      status: 'COMPLETED',
      coordinates: '06.45° N, 03.39° E',
      optics: {
        lens: photoLens,
        shutter: photoShutter,
        iso: photoIso,
        body: photoBody
      },
      story: photoStory || `Master photography canvas bound to ${targetFrameObj.label} in ${photoCategory.toUpperCase()} gallery.`,
      ownership: 'EXCLUSIVE / 01 OF 01',
      image: finalImage,
      aspectRatio: targetFrameObj.aspectRatio || '16:9',
      frameId: targetFrameObj.id,
      targetFrameIndex: frameIdx,
      isCustom: true
    };

    onAddPhoto(newPhoto);

    // Auto-advance to the next frame in the room so the user can easily upload the next frame!
    const nextIdx = (frameIdx + 1) % currentRoomFrames.length;
    const nextFrame = currentRoomFrames[nextIdx];

    notifySuccess(`Saved to ${targetFrameObj.label} (${targetFrameObj.title})! Ready for ${nextFrame.label}.`);

    // Clean reset so subsequent uploads start completely fresh and never conflict
    setPhotoTitle('');
    setPhotoStory('');
    setPreviewUrl('');
    setPhotoFilename('');
    if (photoFileInputRef.current) {
      photoFileInputRef.current.value = '';
    }

    // Advance dropdown to the next frame
    setSelectedFrameId(nextFrame.id);
    if (onClearInitialTarget) onClearInitialTarget();
  };

  const handleAddAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessingFile) {
      notifySuccess('Optimizing artwork telemetry, please wait a moment...');
      return;
    }
    const targetSlotObj = activeAiSlotObj || currentAiFrames[0];
    const slotIdx = currentAiFrames.findIndex(f => f.id === targetSlotObj.id);

    const cleanFilename = aiFilename || `${targetSlotObj.id}.jpg`;
    const finalImage = previewUrl || `/media/ai-art/${cleanFilename}`;

    const newAi: AiArtItem = {
      id: `ai-${targetSlotObj.id}`,
      title: aiTitle.toUpperCase() || targetSlotObj.title || 'PROJECT // SYNTHETIC CORE',
      format: aiFormat,
      status: 'RENDERED // 8K',
      coordinates: '06.45° N, 03.39° E',
      generativeData: {
        engine: aiEngine,
        steps: parseInt(aiSteps, 10) || 45,
        cfg: parseFloat(aiCfg) || 7.5,
        sampler: aiSampler,
        promptExcerpt: aiPrompt || 'aerodynamic obsidian monoliths, glowing amber nodes',
        colorGrading: aiColor,
        seed: aiSeed
      },
      lore: aiLore || 'A speculative convergence of neural telemetry and physical optics.',
      ownership: 'ARCHIVAL EDITION / 01 OF 01',
      image: finalImage,
      frameId: targetSlotObj.id,
      targetSlotIndex: slotIdx
    };

    onAddAiArt(newAi);

    const nextIdx = (slotIdx + 1) % currentAiFrames.length;
    const nextSlot = currentAiFrames[nextIdx];

    notifySuccess(`Saved to ${targetSlotObj.label} (${targetSlotObj.title})! Ready for ${nextSlot.label}.`);

    setAiTitle('');
    setAiPrompt('');
    setAiLore('');
    setPreviewUrl('');
    setAiFilename('');
    if (aiFileInputRef.current) {
      aiFileInputRef.current.value = '';
    }

    setSelectedAiSlotId(nextSlot.id);
    if (onClearInitialTarget) onClearInitialTarget();
  };

  const handleAddTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTrack: TrackItem = {
      id: `track-${Date.now()}`,
      trackNumber: trackNumber.padStart(2, '0'),
      title: trackTitle.toUpperCase() || 'UNTITLED OVERDRIVE',
      bpm: parseInt(trackBpm, 10) || 120,
      key: trackKey || 'D Minor',
      duration: trackDuration || '03:45',
      audioUrl: previewUrl || (audioFilename ? `/media/music/${audioFilename}` : undefined)
    };

    onAddTrack(albumId, newTrack);
    notifySuccess(`Added "${newTrack.title}" to album!`);
    setTrackTitle('');
    setPreviewUrl('');
    setAudioFilename('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#070A0E]/90 backdrop-blur-xl flex items-center justify-center p-3 md:p-6 select-none overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl glass-hologram border-2 border-[#FF6B1A]/60 shadow-[0_0_60px_rgba(255,107,26,0.4)] overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-800 bg-[#070A0E]/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FF6B1A]/20 border border-[#FF6B1A] flex items-center justify-center text-[#FFA14A]">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-syne text-lg md:text-xl font-bold text-white tracking-wider flex items-center gap-2">
                <span>VAULT STUDIO</span>
                <span className="font-mono-hud text-[10px] text-[#38BDF8] border border-[#38BDF8]/40 px-2 py-0.5 rounded">
                  CONTENT GENERATOR // V2.4
                </span>
              </h2>
              <p className="font-mono-hud text-[10px] text-slate-400">
                Drag-and-drop media, configure telemetry specs, and export updated manifest.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {onToggleBuilderMode && (
              <button
                onClick={() => {
                  onToggleBuilderMode(false);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/70 hover:bg-red-900 text-red-300 border border-red-500/50 hover:border-red-400 font-mono-hud text-xs font-bold transition-all shadow-[0_0_12px_rgba(239,68,68,0.25)]"
                title="Lock & Hide Studio from visitors (Shortcut to reopen: Ctrl+Shift+U)"
              >
                <Lock className="w-3.5 h-3.5 text-red-400" />
                <span className="hidden sm:inline">LOCK & HIDE STUDIO</span>
                <span className="sm:hidden">LOCK</span>
              </button>
            )}

            <button
              onClick={onExportManifest}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#FF6B1A] hover:bg-[#FFA14A] text-slate-950 font-mono-hud text-xs font-bold transition-all shadow-[0_0_15px_rgba(255,107,26,0.4)]"
              title="Download vault-manifest.json to put in /public/data/"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">EXPORT MANIFEST</span>
              <span className="sm:hidden">EXPORT</span>
            </button>

            <button
              onClick={onClose}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-red-400 hover:text-white bg-red-950/40 hover:bg-red-600 border border-red-500/60 hover:border-red-400 font-mono-hud text-xs font-bold transition-all shadow-[0_0_12px_rgba(239,68,68,0.3)]"
              title="Close Vault Studio (Esc)"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">CLOSE</span>
            </button>
          </div>
        </div>

        {/* SUCCESS NOTIFICATION */}
        {successMessage && (
          <div className="bg-emerald-950/80 border-b border-emerald-500/50 px-6 py-2 flex items-center gap-2 font-mono-hud text-xs text-emerald-300">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* CHAMBER SELECTOR TABS */}
        <div className="flex items-center border-b border-slate-800 bg-[#070A0E]/50 px-4 md:px-6">
          <button
            onClick={() => { setActiveTab('photo'); setPreviewUrl(''); }}
            className={`py-3 px-4 font-mono-hud text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'photo'
                ? 'border-[#FF6B1A] text-[#FFA14A] bg-[#FF6B1A]/10'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            01 // PHOTOGRAPHY
          </button>

          <button
            onClick={() => { setActiveTab('ai'); setPreviewUrl(''); }}
            className={`py-3 px-4 font-mono-hud text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'ai'
                ? 'border-[#38BDF8] text-[#38BDF8] bg-[#38BDF8]/10'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            02 // AI ART & CINEMA
          </button>

          <button
            onClick={() => { setActiveTab('music'); setPreviewUrl(''); }}
            className={`py-3 px-4 font-mono-hud text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'music'
                ? 'border-[#FF6B1A] text-[#FFA14A] bg-[#FF6B1A]/10'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Music className="w-4 h-4" />
            03 // AI MUSIC TRACK
          </button>

          <button
            onClick={() => setActiveTab('json')}
            className={`py-3 px-4 font-mono-hud text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'json'
                ? 'border-white text-white bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            RAW JSON MANIFEST
          </button>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1">
          
          {/* TAB 1: PHOTOGRAPHY */}
          {activeTab === 'photo' && (
            <form onSubmit={handleAddPhotoSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Left Column: Drag & Drop Preview + Target Path */}
              <div className="md:col-span-5 flex flex-col gap-3">
                <div className="flex items-center justify-between font-mono-hud text-xs">
                  <span className="text-[#38BDF8] font-bold">
                    MEDIA FILE // DROP OR SELECT
                  </span>
                  <span className="text-slate-500 text-[10px]">
                    {activeFrameObj?.aspectRatio} RATIO
                  </span>
                </div>
                
                <label 
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingOver(true);
                  }}
                  onDragLeave={() => setIsDraggingOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingOver(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) processUploadedFile(file);
                  }}
                  className={`relative flex-1 min-h-[220px] rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-4 cursor-pointer overflow-hidden group ${
                    isDraggingOver 
                      ? 'border-[#FFA14A] bg-[#FF6B1A]/20 scale-[1.02]' 
                      : 'border-[#FF6B1A]/50 hover:border-[#FFA14A] bg-[#070A0E]/60'
                  }`}
                >
                  <input
                    ref={photoFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  {previewUrl ? (
                    <div className="relative w-full h-full flex flex-col items-center justify-center">
                      <img
                        src={previewUrl}
                        alt="Upload Preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute top-2 right-2 bg-emerald-500 text-slate-950 font-mono-hud text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                        READY TO BIND
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center gap-2 text-slate-400 group-hover:text-[#FFA14A]">
                      <ImageIcon className="w-10 h-10" />
                      <span className="font-mono-hud text-xs">CLICK OR DRAG IMAGE HERE</span>
                      <span className="text-[10px] text-slate-500">JPG, PNG, WEBP — FOR {activeFrameObj?.label || 'THIS FRAME'}</span>
                    </div>
                  )}
                </label>

                {/* TARGET PATH IN /PUBLIC (DYNAMIC PER FRAME) */}
                <div className="flex flex-col gap-1.5 font-mono-hud text-[10px] bg-[#070A0E]/60 p-2.5 rounded-lg border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="font-bold">TARGET PATH IN /PUBLIC:</span>
                    <span className="text-[#38BDF8] text-[9px]">{activeFrameObj?.label}</span>
                  </div>
                  <div className="text-[#FFA14A] bg-slate-950 p-2 rounded border border-slate-800 truncate font-mono text-[11px] selection:bg-[#FF6B1A]">
                    /media/photography/{photoCategory}/{photoFilename || (activeFrameObj ? `${photoCategory}-${activeFrameObj.id}.jpg` : 'frame.jpg')}
                  </div>
                  <div className="flex items-center justify-between text-slate-500 text-[9px]">
                    <span>Each frame receives its own independent asset link</span>
                    {photoFilename && <span className="text-emerald-400">Detected: {photoFilename}</span>}
                  </div>
                </div>
              </div>

              {/* Right Column: Target Frame Selector & Telemetry Form Fields */}
              <div className="md:col-span-7 flex flex-col gap-3 font-mono-hud text-xs">
                
                {/* 1. ROOM & FRAME SELECTOR (CRITICAL FOR UPLOADING PER FRAME) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div>
                    <label className="text-slate-400 block mb-1 font-bold flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#FF6B1A]" />
                      <span>ROOM / CHAMBER</span>
                    </label>
                    <select
                      value={photoCategory}
                      onChange={e => {
                        const newCat = e.target.value as PhotoCategory;
                        setPhotoCategory(newCat);
                        const frames = getFramesForRoom(newCat);
                        setSelectedFrameId(frames[0]?.id || '');
                        setPhotoFilename('');
                      }}
                      className="w-full bg-[#070A0E] border border-slate-700 focus:border-[#FF6B1A] p-2 rounded text-white text-[11px] font-bold"
                    >
                      <option value="light-art">03 // LIGHT ART (15 Horizon Frames)</option>
                      <option value="street">02 // STREET (24 Monolith Frames)</option>
                      <option value="portraits">01 // PORTRAITS (50 Pavilion Frames)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 font-bold flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-[#38BDF8]" />
                        <span>TARGET FRAME</span>
                      </span>
                      <span className="text-[#FFA14A] text-[10px]">
                        {activeFrameObj?.slotNumber}/{currentRoomFrames.length}
                      </span>
                    </label>
                    <select
                      value={selectedFrameId}
                      onChange={e => {
                        setSelectedFrameId(e.target.value);
                        setPhotoFilename('');
                      }}
                      className="w-full bg-[#070A0E] border border-slate-700 focus:border-[#FFA14A] p-2 rounded text-white text-[11px]"
                    >
                      {currentRoomFrames.map(f => {
                        const isBoundCustom = manifest?.photography.items.some(
                          p => p.category === photoCategory && (p.frameId === f.id || p.id === `photo-${photoCategory}-${f.id}`)
                        );
                        return (
                          <option key={f.id} value={f.id}>
                            [{f.slotNumber}] {f.title} {isBoundCustom ? '★ (CUSTOM UPLOAD)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {/* ACTIVE FRAME STATUS STRIP */}
                <div className="px-3 py-1.5 rounded-lg bg-[#FF6B1A]/10 border border-[#FF6B1A]/30 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="text-[#FFA14A] font-bold">BINDING TO:</span>
                    <span className="text-white font-bold">{activeFrameObj?.label} — {activeFrameObj?.title}</span>
                  </div>
                  <span className="text-slate-400 text-[10px]">
                    {activeFrameObj?.location}
                  </span>
                </div>

                {/* Title & Custom File Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">PROJECT TITLE</label>
                    <input
                      type="text"
                      required
                      placeholder={activeFrameObj?.title || 'e.g. PROJECT // SPECTER'}
                      value={photoTitle}
                      onChange={e => setPhotoTitle(e.target.value)}
                      className="w-full bg-[#070A0E] border border-slate-700 focus:border-[#FF6B1A] p-2 rounded text-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 flex items-center justify-between">
                      <span>CUSTOM FILENAME</span>
                      <span className="text-slate-500 text-[10px]">(OPTIONAL)</span>
                    </label>
                    <input
                      type="text"
                      placeholder={activeFrameObj ? `${photoCategory}-${activeFrameObj.id}.jpg` : 'photo.jpg'}
                      value={photoFilename}
                      onChange={e => setPhotoFilename(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                      className="w-full bg-[#070A0E] border border-slate-700 focus:border-[#FF6B1A] p-2 rounded text-[#FFA14A] text-[11px]"
                    />
                  </div>
                </div>

                {/* Optics Detected Specs */}
                <div className="p-2.5 rounded-lg bg-[#070A0E]/50 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block">LENS</label>
                    <input
                      type="text"
                      value={photoLens}
                      onChange={e => setPhotoLens(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 p-1 rounded text-white text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">SHUTTER</label>
                    <input
                      type="text"
                      value={photoShutter}
                      onChange={e => setPhotoShutter(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 p-1 rounded text-white text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">ISO</label>
                    <input
                      type="text"
                      value={photoIso}
                      onChange={e => setPhotoIso(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 p-1 rounded text-white text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">CAMERA BODY</label>
                    <input
                      type="text"
                      value={photoBody}
                      onChange={e => setPhotoBody(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 p-1 rounded text-white text-[11px]"
                    />
                  </div>
                </div>

                {/* Narrative */}
                <div>
                  <label className="text-slate-400 block mb-1">STORY / DESCRIPTION</label>
                  <textarea
                    rows={2}
                    placeholder="Concise story or lighting note for this frame..."
                    value={photoStory}
                    onChange={e => setPhotoStory(e.target.value)}
                    className="w-full bg-[#070A0E] border border-slate-700 focus:border-[#FF6B1A] p-2 rounded text-white font-inter text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isProcessingFile}
                  className="mt-1 py-3 px-4 rounded-lg bg-[#FF6B1A] hover:bg-[#FFA14A] disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,107,26,0.5)] transition-all cursor-pointer text-xs uppercase tracking-wider"
                >
                  {isProcessingFile ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>OPTIMIZING TELEMETRY...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>SAVE &amp; BIND TO {activeFrameObj?.label || 'FRAME'} (ADVANCES TO NEXT FRAME)</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

          {/* TAB 2: AI ART */}
          {activeTab === 'ai' && (
            <form onSubmit={handleAddAiSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              <div className="md:col-span-5 flex flex-col gap-3">
                <div className="flex items-center justify-between font-mono-hud text-xs">
                  <span className="text-[#38BDF8] font-bold">
                    MEDIA FILE // DROP OR SELECT
                  </span>
                  <span className="text-slate-500 text-[10px]">
                    {activeAiSlotObj?.aspectRatio} RATIO
                  </span>
                </div>
                
                <label 
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingOver(true);
                  }}
                  onDragLeave={() => setIsDraggingOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingOver(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) processUploadedFile(file);
                  }}
                  className={`relative flex-1 min-h-[220px] rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-4 cursor-pointer overflow-hidden group ${
                    isDraggingOver 
                      ? 'border-[#38BDF8] bg-[#38BDF8]/20 scale-[1.02]' 
                      : 'border-[#38BDF8]/50 hover:border-[#38BDF8] bg-[#070A0E]/60'
                  }`}
                >
                  <input
                    ref={aiFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  {previewUrl ? (
                    <div className="relative w-full h-full flex flex-col items-center justify-center">
                      <img
                        src={previewUrl}
                        alt="Upload Preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute top-2 right-2 bg-sky-400 text-slate-950 font-mono-hud text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                        READY TO BIND
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center gap-2 text-slate-400 group-hover:text-[#38BDF8]">
                      <Sparkles className="w-10 h-10" />
                      <span className="font-mono-hud text-xs">CLICK OR DRAG ART RENDER</span>
                      <span className="text-[10px] text-slate-500">FOR {activeAiSlotObj?.label || 'THIS SLOT'}</span>
                    </div>
                  )}
                </label>

                {/* TARGET PATH IN /PUBLIC (DYNAMIC PER SLOT) */}
                <div className="flex flex-col gap-1.5 font-mono-hud text-[10px] bg-[#070A0E]/60 p-2.5 rounded-lg border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="font-bold">TARGET PATH IN /PUBLIC:</span>
                    <span className="text-[#38BDF8] text-[9px]">{activeAiSlotObj?.label}</span>
                  </div>
                  <div className="text-[#38BDF8] bg-slate-950 p-2 rounded border border-slate-800 truncate font-mono text-[11px]">
                    /media/ai-art/{aiFilename || (activeAiSlotObj ? `${activeAiSlotObj.id}.jpg` : 'render.jpg')}
                  </div>
                  <div className="flex items-center justify-between text-slate-500 text-[9px]">
                    <span>Individual asset path for Synthesis Chamber</span>
                    {aiFilename && <span className="text-emerald-400">Detected: {aiFilename}</span>}
                  </div>
                </div>
              </div>

              <div className="md:col-span-7 flex flex-col gap-3 font-mono-hud text-xs">
                
                {/* TARGET SLOT SELECTOR */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div>
                    <label className="text-slate-400 block mb-1 font-bold flex items-center justify-between">
                      <span>SYNTHESIS TARGET SLOT</span>
                      <span className="text-[#38BDF8] text-[10px]">
                        {activeAiSlotObj?.slotNumber}/30
                      </span>
                    </label>
                    <select
                      value={selectedAiSlotId}
                      onChange={e => {
                        setSelectedAiSlotId(e.target.value);
                        setAiFilename('');
                      }}
                      className="w-full bg-[#070A0E] border border-slate-700 focus:border-[#38BDF8] p-2 rounded text-white text-[11px]"
                    >
                      {currentAiFrames.map(f => {
                        const isCustom = manifest?.aiArt.items.some(
                          a => a.frameId === f.id || a.id === `ai-${f.id}`
                        );
                        return (
                          <option key={f.id} value={f.id}>
                            [{f.slotNumber}] {f.title} {isCustom ? '★ (CUSTOM)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 font-bold">ASPECT RATIO</label>
                    <select
                      value={aiFormat}
                      onChange={e => setAiFormat(e.target.value as 'portrait' | 'landscape')}
                      className="w-full bg-[#070A0E] border border-slate-700 focus:border-[#38BDF8] p-2 rounded text-white text-[11px]"
                    >
                      <option value="portrait">9:16 VERTICAL MONOLITH</option>
                      <option value="landscape">16:9 WIDESCREEN CINEMA</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">PROJECT TITLE</label>
                    <input
                      type="text"
                      required
                      placeholder={activeAiSlotObj?.title || 'e.g. PROJECT // NEURAL SYNAPSE'}
                      value={aiTitle}
                      onChange={e => setAiTitle(e.target.value)}
                      className="w-full bg-[#070A0E] border border-slate-700 focus:border-[#38BDF8] p-2 rounded text-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">CUSTOM FILENAME (OPTIONAL)</label>
                    <input
                      type="text"
                      placeholder={activeAiSlotObj ? `${activeAiSlotObj.id}.jpg` : 'ai-render.jpg'}
                      value={aiFilename}
                      onChange={e => setAiFilename(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                      className="w-full bg-[#070A0E] border border-slate-700 focus:border-[#38BDF8] p-2 rounded text-[#38BDF8] text-[11px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block">PIPELINE / ENGINE</label>
                    <input
                      type="text"
                      value={aiEngine}
                      onChange={e => setAiEngine(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 p-1.5 rounded text-white text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">STEPS &amp; CFG</label>
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={aiSteps}
                        onChange={e => setAiSteps(e.target.value)}
                        className="w-1/2 bg-slate-900 border border-slate-700 p-1.5 rounded text-white text-[11px]"
                      />
                      <input
                        type="text"
                        value={aiCfg}
                        onChange={e => setAiCfg(e.target.value)}
                        className="w-1/2 bg-slate-900 border border-slate-700 p-1.5 rounded text-white text-[11px]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">SEED</label>
                    <input
                      type="text"
                      value={aiSeed}
                      onChange={e => setAiSeed(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 p-1.5 rounded text-white text-[11px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">PROMPT EXCERPT</label>
                  <input
                    type="text"
                    placeholder="e.g. aerodynamic carbon fiber monocoque, glowing amber neon veins..."
                    value={aiPrompt}
                    onChange={e => setAiPrompt(e.target.value)}
                    className="w-full bg-[#070A0E] border border-slate-700 focus:border-[#38BDF8] p-2 rounded text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">CONCEPTUAL LORE</label>
                  <textarea
                    rows={2}
                    placeholder="Philosophical lore..."
                    value={aiLore}
                    onChange={e => setAiLore(e.target.value)}
                    className="w-full bg-[#070A0E] border border-slate-700 focus:border-[#38BDF8] p-2 rounded text-white font-inter text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isProcessingFile}
                  className="mt-1 py-3 px-4 rounded-lg bg-[#38BDF8] hover:bg-[#7DD3FC] disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(56,189,248,0.5)] transition-all cursor-pointer text-xs uppercase tracking-wider"
                >
                  {isProcessingFile ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>OPTIMIZING TELEMETRY...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>SAVE &amp; BIND TO {activeAiSlotObj?.label || 'SLOT'} (ADVANCES TO NEXT)</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

          {/* TAB 3: AI MUSIC */}
          {activeTab === 'music' && (
            <form onSubmit={handleAddTrackSubmit} className="max-w-xl mx-auto flex flex-col gap-4 font-mono-hud text-xs">
              <div>
                <label className="text-slate-400 block mb-1">TARGET ALBUM</label>
                <select
                  value={albumId}
                  onChange={e => setAlbumId(e.target.value)}
                  className="w-full bg-[#070A0E] border border-slate-700 focus:border-[#FF6B1A] p-2 rounded text-white"
                >
                  <option value="album-01">01 // KXNG OF THE NVGHT</option>
                  <option value="album-02">02 // OVERDRIVE METRIC</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">TRACK #</label>
                  <input
                    type="text"
                    value={trackNumber}
                    onChange={e => setTrackNumber(e.target.value)}
                    className="w-full bg-[#070A0E] border border-slate-700 p-2 rounded text-white"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-slate-400 block mb-1">TRACK TITLE</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CYBER HORIZON"
                    value={trackTitle}
                    onChange={e => setTrackTitle(e.target.value)}
                    className="w-full bg-[#070A0E] border border-slate-700 p-2 rounded text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">BPM</label>
                  <input
                    type="number"
                    value={trackBpm}
                    onChange={e => setTrackBpm(e.target.value)}
                    className="w-full bg-[#070A0E] border border-slate-700 p-2 rounded text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">KEY</label>
                  <input
                    type="text"
                    value={trackKey}
                    onChange={e => setTrackKey(e.target.value)}
                    className="w-full bg-[#070A0E] border border-slate-700 p-2 rounded text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">DURATION</label>
                  <input
                    type="text"
                    value={trackDuration}
                    onChange={e => setTrackDuration(e.target.value)}
                    className="w-full bg-[#070A0E] border border-slate-700 p-2 rounded text-white"
                  />
                </div>
              </div>

              {/* AUDIO DROPZONE / BROWSER */}
              <div>
                <label className="text-slate-400 block mb-1">AUDIO TRACK FILE (MP3 / WAV)</label>
                <input
                  ref={audioFileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setIsDraggingOver(false); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingOver(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      processUploadedFile(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => audioFileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${
                    isDraggingOver
                      ? 'border-[#FF6B1A] bg-[#FF6B1A]/20 scale-[1.01]'
                      : previewUrl || audioFilename
                        ? 'border-emerald-500/80 bg-emerald-950/20'
                        : 'border-slate-700 hover:border-[#FF6B1A]/80 hover:bg-slate-900/60'
                  }`}
                >
                  <Music className="w-6 h-6 text-[#FFA14A]" />
                  {audioFilename ? (
                    <div className="font-mono-hud text-xs text-emerald-400 font-bold">
                      AUDIO FILE ATTACHED: {audioFilename}
                    </div>
                  ) : (
                    <>
                      <div className="font-mono-hud text-xs text-white font-bold">
                        DRAG & DROP AUDIO FILE OR CLICK TO BROWSE
                      </div>
                      <div className="font-mono-hud text-[10px] text-slate-400">
                        Supports MP3 / WAV. Leave empty to use real-time procedural synthesizer.
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">OR FILENAME IN /PUBLIC/MEDIA/MUSIC/</label>
                <input
                  type="text"
                  placeholder="e.g. midnight-pace.mp3 (leave blank for procedural synth)"
                  value={audioFilename}
                  onChange={e => setAudioFilename(e.target.value)}
                  className="w-full bg-[#070A0E] border border-slate-700 p-2 rounded text-white text-[11px]"
                />
              </div>

              <button
                type="submit"
                className="mt-2 py-2.5 px-4 rounded-lg bg-[#FF6B1A] hover:bg-[#FFA14A] text-slate-950 font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,107,26,0.5)] transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>ADD TRACK TO ALBUM</span>
              </button>

              {/* CURRENT TRACKLIST & SAMPLE TRACK MANAGEMENT */}
              {(() => {
                const currentAlbum = manifest?.acoustics.albums.find(a => a.id === albumId);
                const tracks = currentAlbum?.tracks || [];
                const sampleTracks = tracks.filter(t => /^track-\d{2}-\d{2}$/.test(t.id));
                const customTracks = tracks.filter(t => !/^track-\d{2}-\d{2}$/.test(t.id));

                return (
                  <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col gap-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <span className="font-mono-hud text-xs text-white font-bold tracking-wider">
                          CURRENT TRACKLIST // {currentAlbum?.title || albumId} ({tracks.length} TRACKS)
                        </span>
                        <p className="font-mono-hud text-[10px] text-slate-400">
                          {customTracks.length} custom uploaded • {sampleTracks.length} sample tracks
                        </p>
                      </div>

                      {onClearSampleTracks && sampleTracks.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Remove all ${sampleTracks.length} default sample tracks from this album and keep only your uploaded tracks?`)) {
                              onClearSampleTracks(albumId);
                              notifySuccess(`Removed all ${sampleTracks.length} sample tracks!`);
                            }
                          }}
                          className="flex items-center gap-1.5 px-3 py-1 rounded bg-red-950/50 hover:bg-red-900/80 text-red-300 hover:text-white border border-red-700/60 font-mono-hud text-[10px] font-bold tracking-wider transition-all cursor-pointer shadow-[0_0_12px_rgba(239,68,68,0.25)]"
                        >
                          <Trash2 className="w-3 h-3 text-red-400" />
                          <span>REMOVE ALL SAMPLE TRACKS</span>
                        </button>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto pr-1">
                      {tracks.map(t => {
                        const isSample = /^track-\d{2}-\d{2}$/.test(t.id);
                        return (
                          <div
                            key={t.id}
                            className={`flex items-center justify-between p-2 rounded border font-mono-hud text-xs transition-colors ${
                              isSample
                                ? 'bg-slate-900/40 border-slate-800 text-slate-400'
                                : 'bg-[#FF6B1A]/10 border-[#FF6B1A]/40 text-white'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#FFA14A]">#{t.trackNumber}</span>
                              <span className="font-bold">{t.title}</span>
                              {isSample ? (
                                <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                  SAMPLE
                                </span>
                              ) : (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#FF6B1A] text-slate-950 font-black shadow-[0_0_8px_#FF6B1A]">
                                  MY UPLOAD
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 text-[11px] text-slate-400">
                              <span>{t.duration}</span>
                              <span className="text-[#38BDF8]">{t.bpm} BPM</span>
                              <span>{t.key}</span>
                              {onDeleteTrack && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`Delete "${t.title}" from album?`)) {
                                      onDeleteTrack(albumId, t.id);
                                      notifySuccess(`Deleted "${t.title}".`);
                                    }
                                  }}
                                  className="w-6 h-6 rounded flex items-center justify-center hover:bg-red-900/50 text-slate-400 hover:text-red-300 transition-colors cursor-pointer"
                                  title="Delete track"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </form>
          )}

          {/* TAB 4: RAW JSON VIEW */}
          {activeTab === 'json' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-mono-hud text-xs text-slate-400">
                  CURRENT MANIFEST JSON (SYNCS WITH LOCAL STATE)
                </span>
                <button
                  onClick={onExportManifest}
                  className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#FF6B1A] text-slate-950 font-mono-hud text-xs font-bold"
                >
                  <Download className="w-3.5 h-3.5" />
                  EXPORT VAULT-MANIFEST.JSON
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-[#070A0E] border border-slate-800 text-[#FFA14A] font-mono-hud text-xs max-h-[50vh] overflow-auto">
                {JSON.stringify(manifest, null, 2)}
              </pre>
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 border-t border-slate-800 bg-[#070A0E]/80 flex items-center justify-between font-mono-hud text-[10px] text-slate-400">
          <div>
            HINT: Drop your exported <code className="text-[#FFA14A]">vault-manifest.json</code> into <code className="text-[#38BDF8]">/public/data/</code>
          </div>
          <div>
            SHORTCUT: <code className="text-white">Ctrl + Shift + U</code>
          </div>
        </div>

      </div>
    </div>
  );
};
