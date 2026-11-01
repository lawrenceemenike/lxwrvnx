# THE VAULT // CONTENT MANAGEMENT GUIDE

Welcome to **The Vault**. This guide outlines the two frictionless workflows for updating your Top 50 photographs, AI artworks, and music tracks without modifying source code.

---

## WORKFLOW A: THE BUILT-IN "VAULT STUDIO" (RECOMMENDED)

The Vault comes with an integrated content manager modal that generates entries and live-previews your work in real time.

### Step 1: Open Vault Studio
* Click the **`[VAULT STUDIO]`** button in the top-right corner of the HUD, **OR**
* Press **`Ctrl + Shift + U`** on your keyboard, **OR**
* Navigate to `#/studio` in your browser URL.

### Step 2: Upload & Configure Telemetry
1. Select your target chamber:
   * **01 // PHOTOGRAPHY**: Select category (`Portraits`, `Street`, `Light Art`), drag-and-drop your image, fill in camera metadata (`Lens`, `Shutter`, `ISO`, `Camera Body`), Title, and Story.
   * **02 // AI ART & CINEMA**: Select aspect ratio (`9:16 Monolith` or `16:9 Cinema`), drag-and-drop your render, specify `Pipeline/Engine`, `Steps`, `CFG`, `Prompt Excerpt`, and `Seed`.
   * **03 // AI MUSIC TRACK**: Select the album (`01 // KXNG OF THE NVGHT` or `02 // OVERDRIVE METRIC`), enter Track Number, Title, `BPM`, `Key`, and Duration.
2. Click **`ADD TO LIVE MANIFEST & GALLERY`** — this immediately updates the in-memory gallery so you can explore and test it right away without reloading.

### Step 3: Export & Save
1. In the Studio header, click **`EXPORT MANIFEST`**.
2. A new `vault-manifest.json` file will automatically download.
3. Replace the existing file at `/public/data/vault-manifest.json`.
4. Copy your local image or audio files to their corresponding folder under `/public/media/`:
   * Photography: `/public/media/photography/{portraits|street|light-art}/`
   * AI Art: `/public/media/ai-art/`
   * Audio: `/public/media/music/`

---

## WORKFLOW B: DIRECT FILE & JSON MANAGEMENT

If you prefer editing files directly:

### 1. Folder Structure
```
public/
├── data/
│   └── vault-manifest.json             <-- Central manifest driving all chambers
└── media/
    ├── photography/
    │   ├── portraits/                  <-- High-res portrait files
    │   ├── street/                     <-- Street / motorsport / urban files
    │   └── light-art/                  <-- Kinetic light painting files
    ├── ai-art/                         <-- 9:16 vertical monoliths & 16:9 widescreen
    ├── music/                          <-- Album covers & MP3 audio files
    └── vault-rooms/                    <-- Spatial room backdrops
```

### 2. Adding a Photograph to `vault-manifest.json`
Add an object to the `photography.items` array:
```json
{
  "id": "photo-unique-id",
  "title": "PROJECT // VELOCITY",
  "category": "street",
  "status": "COMPLETED",
  "coordinates": "06.45° N, 03.39° E",
  "optics": {
    "lens": "35MM F/1.4",
    "shutter": "1/500s",
    "iso": 100,
    "body": "ALPHA R",
    "focalLength": "35mm",
    "aperture": "f/1.4"
  },
  "story": "High speed tracking shot through dusk industrial rain.",
  "ownership": "EXCLUSIVE / 01 OF 01",
  "image": "/media/photography/street/velocity.jpg",
  "aspectRatio": "16:9"
}
```

### 3. Adding an AI Artwork to `vault-manifest.json`
Add an object to the `aiArt.items` array:
```json
{
  "id": "ai-unique-id",
  "title": "PROJECT // HYPER-LATTICE",
  "format": "portrait",
  "status": "RENDERED // 8K",
  "coordinates": "06.45° N, 03.39° E",
  "generativeData": {
    "engine": "Flux.1 Dev + SDXL",
    "steps": 45,
    "cfg": 7.5,
    "sampler": "DPM++ 2M Karras",
    "promptExcerpt": "aerodynamic carbon fiber monocoque, glowing amber neon veins...",
    "colorGrading": "Deep Teal and Ember",
    "seed": "98421074"
  },
  "lore": "Non-Euclidean aerodynamic study pushing boundary-layer flow.",
  "ownership": "ARCHIVAL EDITION / 01 OF 01",
  "image": "/media/ai-art/hyper-lattice.jpg"
}
```

### 4. Adding a Track to an Album
Add an object to the album's `tracks` array under `acoustics.albums`:
```json
{
  "id": "track-01-09",
  "trackNumber": "09",
  "title": "TURBO SYNAPSE",
  "bpm": 126,
  "key": "F Minor",
  "duration": "04:12",
  "audioUrl": "/media/music/turbo-synapse.mp3"
}
```
*(Note: If `audioUrl` is omitted or file is not present, The Vault automatically falls back to its procedural Web Audio cyberpunk synthesizer, creating an instant rhythmic bassline, synth arp, and live FFT waveform matching the track's BPM and Key).*

---

## SHORTCUT REFERENCE

* **`CLICK NODE / RING`**: Move into chamber / select item
* **`DRAG MOUSE`**: 360° mouse-look pan with aerodynamic roll & tilt
* **`SPACE`**: Play / Pause master audio
* **`ESC`**: Return to Concourse / Close inspector
* **`1, 2, 3, 4`**: Quick jump to Chamber 1, 2, 3, 4
* **`0` or \`**: Return to Main Concourse
* **`Ctrl + Shift + U`**: Open Vault Studio
