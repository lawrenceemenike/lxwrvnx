import { PhotoItem } from '../types';

// Curated pool of high-resolution master photography canvases
const BASE_IMAGES = {
  street: [
    '/media/photography/street/DSC02080.jpg',
    '/media/photography/street/DSC03002.jpg',
    '/media/photography/street/DSC03657.jpg',
    '/media/photography/street/DSC04609.jpg',
    '/media/photography/street/DSC04694.jpg'
  ],
  portraits: [
    '/media/photography/portraits/DSC00486.jpg',
    '/media/photography/portraits/DSC00541.jpg',
    '/media/photography/portraits/DSC00749.jpg',
    '/media/photography/portraits/DSC01026.jpg',
    '/media/photography/portraits/DSC01337.jpg'
  ],
  'light-art': [
    '/media/photography/light-art/DSC00150.jpg',
    '/media/photography/light-art/DSC00263.jpg',
    '/media/photography/light-art/DSC00704.jpg',
    '/media/photography/light-art/DSC01790.jpg',
    '/media/photography/light-art/DSC05078.jpg'
  ]
};

const LENSES = [
  '35MM F/1.4 SUMMILUX',
  '50MM F/1.2 NOCTILUX',
  '85MM F/1.4 GM II',
  '70-200MM F/2.8 OSS',
  '28MM F/2.0 SUMMICRON',
  '105MM F/1.4 ART',
  '24-70MM F/2.8 MASTER',
  '16-35MM F/2.8 WIDE',
  '135MM F/1.8 BOKEH'
];

const BODIES = ['LEICA M11', 'HASSELBLAD X2D 100C', 'SONY ALPHA 1', 'LEICA Q3', 'SONY A7R V'];

const SHUTTERS = ['1/8000s', '1/4000s', '1/2000s', '1/1000s', '1/500s', '1/250s', '1/125s', '8.0s', '15.0s', '30.0s'];

const TITLES = [
  // Back Wall [01 - 15]
  'APEX // TRAJECTORY', 'NOIR // CANYON', 'CHROMA // MATRIX', 'SHADOW // ARCHITECT', 'MONOLITH // PULSE',
  'VELOCITY // HORIZON', 'KINETIC // EMBER', 'CYBER // SOLITUDE', 'REMBRANDT // CHILL', 'ASPHALT // ECHO',
  'PHOTON // VORTEX', 'STEEL // SYMPHONY', 'TEMPLE // DRIFT', 'ZENITH // AURORA', 'SPECTRAL // GAZE',

  // Left Wall [16 - 30]
  'OBSIDIAN // CONTOURS', 'AERODYNAMIC // FLUX', 'TITANIUM // CREVASSE', 'QUARTZ // ILLUMINATION', 'NEON // DRIFT',
  'OPTIC // EQUINOX', 'MONSOON // APEX', 'HYPERION // FOCUS', 'SOLAR // INTERFACE', 'CHRONOS // MIRAGE',
  'VAPOR // LABYRINTH', 'LATENT // ANOMALY', 'COBALT // SHADOWS', 'FREQUENCY // BEACON', 'RADIAL // DISPERSION',

  // Right Wall [31 - 45]
  'METROPOLIS // ZENITH', 'CHRONICLE // SILENCE', 'KINETIC // STRIKE', 'LUMEN // CASCADE', 'TURBINE // ECHO',
  'ORBITAL // REFLECTION', 'SHUTTER // CHRONO', 'TERRA // GEOMETRICS', 'PHOTON // ACCELERATION', 'SYNAPSE // GLOW',
  'ECLIPSE // CHROME', 'VELOCE // DRIFT', 'PRISM // TRANSMISSION', 'AMBER // STRATA', 'INFINITY // FOCAL',

  // Central Pentagon Projector [46 - 50]
  'CROWN // APEX PENTAGON', 'CELESTIAL // VECTOR', 'NEXUS // PHOTONIC', 'AERO // MONOLITH', 'ETERNAL // RESONANCE'
];

export function getPavilion50Photos(existingItems?: PhotoItem[]): PhotoItem[] {
  const result: PhotoItem[] = [];

  // Strictly filter for portraits to prevent cross-chamber contamination
  const portraitItems = (existingItems || []).filter(p => p.category === 'portraits');

  for (let i = 0; i < 50; i++) {
    const itemNumber = (i + 1).toString().padStart(2, '0');
    const frameId = `f-${itemNumber}`;

    // 1. Check for explicitly bound portrait for this frame
    const bound = portraitItems.find(p =>
      p.frameId === frameId ||
      p.id === `photo-portraits-${frameId}` ||
      p.id === frameId ||
      (p.targetFrameIndex === i && (!p.frameId || p.frameId === frameId))
    );

    if (bound) {
      result.push(bound);
      continue;
    }

    // 2. Sequential fallback for unassigned custom portraits
    const unassigned = portraitItems.filter(
      p => !p.frameId && p.targetFrameIndex === undefined && !p.id.startsWith('photo-0') && !p.id.startsWith('pavilion-photo-')
    );
    const existing = unassigned[i];
    if (existing) {
      result.push(existing);
      continue;
    }

    const imageList = BASE_IMAGES['portraits'];
    const image = imageList[i % imageList.length];

    const title = TITLES[i] || `CANVAS // ${itemNumber}`;

    result.push({
      id: `pavilion-photo-${itemNumber}`,
      title,
      category: 'portraits',
      status: 'CURATED // 01 OF 01',
      coordinates: '06.45° N, 03.39° E',
      optics: {
        lens: LENSES[i % LENSES.length],
        shutter: SHUTTERS[i % SHUTTERS.length],
        iso: [50, 100, 200, 400, 800][i % 5],
        body: BODIES[i % BODIES.length],
        focalLength: `${[24, 35, 50, 85, 135][i % 5]}mm`,
        aperture: `f/${[1.2, 1.4, 2.0, 2.8, 4.0][i % 5]}`
      },
      story: `Master portrait #${itemNumber} in the Grand 50-Frame Squared Pavilion. A study in aerodynamic composure, rim illumination, and human presence.`,
      ownership: `EXCLUSIVE VAULT ASSET // #${itemNumber}`,
      image,
      aspectRatio: '16:9'
    });
  }

  return result;
}
