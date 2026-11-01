import { TrackItem, AlbumItem } from '../types';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private audioElement: HTMLAudioElement | null = null;

  // Track playback state
  public currentTrack: TrackItem | null = null;
  public currentAlbum: AlbumItem | null = null;
  public isPlaying: boolean = false;
  public currentTime: number = 0;
  public duration: number = 240;
  public volume: number = 0.8;

  // Cinematic Ambient Score state
  public isAmbientPlaying: boolean = false;
  public ambientVolume: number = 0.4;
  private ambientNodes: { osc: OscillatorNode; gain: GainNode }[] = [];
  private ambientInterval: number | null = null;
  private isSynthesizingTrack: boolean = false;
  private trackSynthInterval: number | null = null;
  private trackSynthNodes: { osc: OscillatorNode; gain: GainNode }[] = [];

  private listeners: Set<() => void> = new Set();
  private timeUpdateInterval: number | null = null;

  constructor() {
    // Lazy init audio context on first interaction
  }

  public initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master Analyser Node
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.85;

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.volume;

      // Ambient Score Gain Node
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.value = this.ambientVolume;

      // SFX Gain Node (crisp, prominent)
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.55;

      // Routing
      this.ambientGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }

  // =========================================================================
  // 1. PROCEDURAL CINEMATIC AMBIENT SCORE (BLADE RUNNER / HANS ZIMMER STYLE)
  // =========================================================================
  public startAmbientScore() {
    this.initContext();
    if (this.isAmbientPlaying || !this.ctx || !this.ambientGain) return;
    this.isAmbientPlaying = true;

    // Smooth fade in
    const now = this.ctx.currentTime;
    this.ambientGain.gain.cancelScheduledValues(now);
    this.ambientGain.gain.setValueAtTime(0.001, now);
    this.ambientGain.gain.linearRampToValueAtTime(this.ambientVolume, now + 2.5);

    // Master Warm Lowpass Filter with dynamic resonance
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, now);
    filter.Q.value = 4.0;
    filter.connect(this.ambientGain);

    // LFO to slowly modulate filter frequency (breathing cinematic atmospheric swell)
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.08, now); // 1 cycle every 12 seconds
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(140, now);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    // 1. Deep Sub-Bass Drone (D1: 36.7Hz)
    const subOsc = this.ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(36.71, now);
    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.5, now);
    subOsc.connect(subGain);
    subGain.connect(filter);
    subOsc.start();

    // 2. Warm Detuned Analog Pad (D2 + A2: 73.4Hz, 110Hz)
    const padOsc1 = this.ctx.createOscillator();
    padOsc1.type = 'sawtooth';
    padOsc1.frequency.setValueAtTime(73.42, now);
    const padGain1 = this.ctx.createGain();
    padGain1.gain.setValueAtTime(0.18, now);
    padOsc1.connect(padGain1);
    padGain1.connect(filter);
    padOsc1.start();

    const padOsc2 = this.ctx.createOscillator();
    padOsc2.type = 'sawtooth';
    padOsc2.frequency.setValueAtTime(73.85, now); // Detuned for rich stereo beating
    const padGain2 = this.ctx.createGain();
    padGain2.gain.setValueAtTime(0.16, now);
    padOsc2.connect(padGain2);
    padGain2.connect(filter);
    padOsc2.start();

    // 3. Perfect Fifth Drone (A2: 110Hz)
    const fifthOsc = this.ctx.createOscillator();
    fifthOsc.type = 'triangle';
    fifthOsc.frequency.setValueAtTime(110.0, now);
    const fifthGain = this.ctx.createGain();
    fifthGain.gain.setValueAtTime(0.12, now);
    fifthOsc.connect(fifthGain);
    fifthGain.connect(filter);
    fifthOsc.start();

    this.ambientNodes.push(
      { osc: subOsc, gain: subGain },
      { osc: padOsc1, gain: padGain1 },
      { osc: padOsc2, gain: padGain2 },
      { osc: fifthOsc, gain: fifthGain },
      { osc: lfo, gain: lfoGain }
    );

    // 4. Shimmering Ethereal High Synaptic Chimes (Procedural periodic notes)
    const notes = [293.66, 329.63, 369.99, 440.00, 587.33, 659.25, 880.00]; // D Dorian scale
    this.ambientInterval = window.setInterval(() => {
      if (!this.ctx || !this.isAmbientPlaying || !this.ambientGain) return;
      const t = this.ctx.currentTime;
      const freq = notes[Math.floor(Math.random() * notes.length)];

      const chimeOsc = this.ctx.createOscillator();
      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(freq, t);

      const chimeGain = this.ctx.createGain();
      chimeGain.gain.setValueAtTime(0.045, t);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, t + 3.2);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(this.ambientGain);
      chimeOsc.start(t);
      chimeOsc.stop(t + 3.5);
    }, 2800);

    this.notify();
  }

  public stopAmbientScore() {
    this.isAmbientPlaying = false;
    if (this.ambientInterval !== null) {
      clearInterval(this.ambientInterval);
      this.ambientInterval = null;
    }
    if (this.ctx && this.ambientGain) {
      const now = this.ctx.currentTime;
      this.ambientGain.gain.cancelScheduledValues(now);
      this.ambientGain.gain.linearRampToValueAtTime(0.001, now + 0.8);
      setTimeout(() => {
        this.ambientNodes.forEach(({ osc }) => {
          try {
            osc.stop();
            osc.disconnect();
          } catch {}
        });
        this.ambientNodes = [];
      }, 900);
    }
    this.notify();
  }

  public toggleAmbientScore() {
    if (this.isAmbientPlaying) {
      this.stopAmbientScore();
    } else {
      this.startAmbientScore();
    }
  }

  // =========================================================================
  // 2. FUTURISTIC CLICK & TELEMETRY SOUND EFFECTS (SFX)
  // =========================================================================

  // Subtle High-Tech Hover SFX
  public playHoverSFX() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(750, now + 0.025);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.035);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  // Futuristic Holographic Engage Click (Tactile dual-frequency micro-chirp)
  public playClickSFX() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // High frequency micro-sweep
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1900, now);
    osc.frequency.exponentialRampToValueAtTime(650, now + 0.04);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    // Tight subtle sub-click punch (90Hz)
    const subOsc = this.ctx.createOscillator();
    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(95, now);
    subOsc.frequency.exponentialRampToValueAtTime(30, now + 0.03);

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.4, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    subOsc.connect(subGain);
    subGain.connect(this.sfxGain);

    osc.start(now);
    subOsc.start(now);
    osc.stop(now + 0.05);
    subOsc.stop(now + 0.05);
  }

  // Pneumatic Lock-On Telemetry Chime (When facing a door eye-level)
  public playLockOnSFX() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Rising two-tone holographic chord (587Hz -> 880Hz)
    [587.33, 880.0].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      osc.type = 'sine';
      const startTime = now + idx * 0.06;
      osc.frequency.setValueAtTime(freq, startTime);

      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(startTime);
      osc.stop(startTime + 0.38);
    });
  }

  // Aerodynamic Whoosh / Glide (When stepping forward or backward along tunnel)
  public playGlideSFX() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Procedural filtered noise sweep
    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.frequency.exponentialRampToValueAtTime(280, now + 0.24);
    filter.Q.value = 3.0;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    whiteNoise.start(now);
  }

  // =========================================================================
  // 3. MASTER MUSIC ALBUM TRACK PLAYBACK
  // =========================================================================
  public playTrack(track: TrackItem, album?: AlbumItem) {
    this.initContext();
    if (album) this.currentAlbum = album;
    this.currentTrack = track;

    // Duck ambient score if playing so track takes focus
    if (this.isAmbientPlaying && this.ambientGain && this.ctx) {
      this.ambientGain.gain.setTargetAtTime(0.05, this.ctx.currentTime, 0.5);
    }

    const parts = track.duration.split(':');
    if (parts.length === 2) {
      this.duration = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    } else {
      this.duration = 225;
    }
    this.currentTime = 0;

    if (track.audioUrl) {
      this.stopTrackSynthesis();
      if (!this.audioElement) {
        this.audioElement = new Audio();
        const source = this.ctx!.createMediaElementSource(this.audioElement);
        source.connect(this.masterGain!);
      }
      this.audioElement.src = track.audioUrl;
      this.audioElement.play().catch(() => {
        this.startTrackSynthesis(track.bpm, track.key);
      });
      this.isPlaying = true;
    } else {
      this.startTrackSynthesis(track.bpm, track.key);
      this.isPlaying = true;
    }

    this.startTimeTracker();
    this.notify();
  }

  public togglePlay() {
    if (!this.currentTrack) return;
    if (this.isPlaying) {
      this.pause();
    } else {
      this.resume();
    }
  }

  public pause() {
    this.isPlaying = false;
    if (this.audioElement) {
      this.audioElement.pause();
    }
    this.stopTrackSynthesis();
    this.stopTimeTracker();

    // Restore ambient score volume
    if (this.isAmbientPlaying && this.ambientGain && this.ctx) {
      this.ambientGain.gain.setTargetAtTime(this.ambientVolume, this.ctx.currentTime, 1.0);
    }

    this.notify();
  }

  public resume() {
    if (!this.currentTrack) return;
    this.initContext();
    this.isPlaying = true;

    // Duck ambient score
    if (this.isAmbientPlaying && this.ambientGain && this.ctx) {
      this.ambientGain.gain.setTargetAtTime(0.05, this.ctx.currentTime, 0.5);
    }

    if (this.audioElement && this.currentTrack.audioUrl) {
      this.audioElement.play();
    } else {
      this.startTrackSynthesis(this.currentTrack.bpm, this.currentTrack.key);
    }
    this.startTimeTracker();
    this.notify();
  }

  public seek(seconds: number) {
    this.currentTime = Math.max(0, Math.min(seconds, this.duration));
    if (this.audioElement && this.currentTrack?.audioUrl) {
      this.audioElement.currentTime = this.currentTime;
    }
    this.notify();
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
    if (this.audioElement) {
      this.audioElement.volume = this.volume;
    }
    this.notify();
  }

  private startTimeTracker() {
    this.stopTimeTracker();
    this.timeUpdateInterval = window.setInterval(() => {
      if (this.isPlaying) {
        this.currentTime += 0.5;
        if (this.currentTime >= this.duration) {
          this.currentTime = 0;
        }
        this.notify();
      }
    }, 500);
  }

  private stopTimeTracker() {
    if (this.timeUpdateInterval !== null) {
      clearInterval(this.timeUpdateInterval);
      this.timeUpdateInterval = null;
    }
  }

  // Synthesized Cyberpunk track generator
  private startTrackSynthesis(bpm: number = 120, key: string = 'D') {
    this.stopTrackSynthesis();
    if (!this.ctx || !this.masterGain) return;
    this.isSynthesizingTrack = true;

    const keyMap: Record<string, number> = {
      'C': 65.41, 'C#': 69.30, 'Db': 69.30, 'D': 73.42, 'Eb': 77.78, 'E': 82.41,
      'F': 87.31, 'F#': 92.50, 'G': 98.00, 'Ab': 103.83, 'A': 110.00, 'Bb': 116.54, 'B': 123.47
    };
    const rootKey = key.split(' ')[0] || 'D';
    const rootFreq = keyMap[rootKey] || 73.42;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 850;
    filter.Q.value = 3.5;
    filter.connect(this.masterGain);

    const subOsc = this.ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.value = rootFreq / 2;
    const subGain = this.ctx.createGain();
    subGain.gain.value = 0.45;
    subOsc.connect(subGain);
    subGain.connect(filter);
    subOsc.start();

    const padOsc = this.ctx.createOscillator();
    padOsc.type = 'sawtooth';
    padOsc.frequency.value = rootFreq;
    const padGain = this.ctx.createGain();
    padGain.gain.value = 0.12;
    padOsc.connect(padGain);
    padGain.connect(filter);
    padOsc.start();

    this.trackSynthNodes.push({ osc: subOsc, gain: subGain }, { osc: padOsc, gain: padGain });

    const stepDurationMs = (60 / bpm / 4) * 1000;
    const notes = [rootFreq, rootFreq * 1.2, rootFreq * 1.5, rootFreq * 1.33, rootFreq * 2, rootFreq * 1.5];
    let step = 0;

    this.trackSynthInterval = window.setInterval(() => {
      if (!this.ctx || !this.isPlaying || !this.isSynthesizingTrack) return;
      const now = this.ctx.currentTime;

      const arpFreq = notes[step % notes.length];
      const arpOsc = this.ctx.createOscillator();
      arpOsc.type = 'sawtooth';
      arpOsc.frequency.setValueAtTime(arpFreq, now);

      const arpGain = this.ctx.createGain();
      arpGain.gain.setValueAtTime(0.08, now);
      arpGain.gain.exponentialRampToValueAtTime(0.001, now + (stepDurationMs / 1000) * 0.85);

      arpOsc.connect(arpGain);
      arpGain.connect(filter);
      arpOsc.start(now);
      arpOsc.stop(now + 0.25);

      if (step % 4 === 0) {
        const kickOsc = this.ctx.createOscillator();
        kickOsc.type = 'sine';
        kickOsc.frequency.setValueAtTime(120, now);
        kickOsc.frequency.exponentialRampToValueAtTime(32, now + 0.15);

        const kickGain = this.ctx.createGain();
        kickGain.gain.setValueAtTime(0.6, now);
        kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        kickOsc.connect(kickGain);
        kickGain.connect(this.masterGain!);
        kickOsc.start(now);
        kickOsc.stop(now + 0.3);

        filter.frequency.setValueAtTime(1400, now);
        filter.frequency.exponentialRampToValueAtTime(700, now + 0.2);
      }

      step++;
    }, stepDurationMs);
  }

  private stopTrackSynthesis() {
    this.isSynthesizingTrack = false;
    if (this.trackSynthInterval !== null) {
      clearInterval(this.trackSynthInterval);
      this.trackSynthInterval = null;
    }
    this.trackSynthNodes.forEach(({ osc }) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    this.trackSynthNodes = [];
  }

  public getWaveformData(): Uint8Array {
    if (!this.analyser) {
      return new Uint8Array(128).fill(128);
    }
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(data);
    return data;
  }

  public getFrequencyData(): Uint8Array {
    if (!this.analyser) {
      return new Uint8Array(64).fill(0);
    }
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }
}

export const audioEngine = new AudioEngine();
