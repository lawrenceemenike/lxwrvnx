export interface RoomFrameSlot {
  id: string; // Identifier used for binding: e.g. 'hz-01', 'frame-L1', 'f-01', 'ai-01'
  index: number; // 0-based index
  slotNumber: string; // "01", "02", etc.
  label: string; // "FRAME 01", "SLOT 01"
  title: string; // Default Title
  room: 'light-art' | 'street' | 'portraits' | 'synthesis';
  location: string; // Wall location or placement info
  aspectRatio: string;
  defaultImage: string;
}

// 15 Horizon Frames in Light Art
export const LIGHT_ART_FRAMES: RoomFrameSlot[] = [
  { id: 'hz-01', index: 0, slotNumber: '01', label: 'FRAME 01', title: 'HORIZON // POLARIS 01', room: 'light-art', location: 'Left Horizon Ribbon', aspectRatio: '4:5', defaultImage: '/media/photography/light-art/light-art-hyper.jpg' },
  { id: 'hz-02', index: 1, slotNumber: '02', label: 'FRAME 02', title: 'CHIAROSCURO // VEIL', room: 'light-art', location: 'Left Horizon Ribbon', aspectRatio: '4:5', defaultImage: '/media/photography/portraits/portrait-shadow-gaze.jpg' },
  { id: 'hz-03', index: 2, slotNumber: '03', label: 'FRAME 03', title: 'ZENITH // SILHOUETTE', room: 'light-art', location: 'Left Horizon Ribbon', aspectRatio: '4:5', defaultImage: '/media/photography/portraits/portrait-zenith.jpg' },
  { id: 'hz-04', index: 3, slotNumber: '04', label: 'FRAME 04', title: 'PHOTON // HELIX', room: 'light-art', location: 'Left Center Curve', aspectRatio: '16:9', defaultImage: '/media/photography/light-art/light-art-velocity.jpg' },
  { id: 'hz-05', index: 4, slotNumber: '05', label: 'FRAME 05', title: 'NOIR // PERSPECTIVE', room: 'light-art', location: 'Left Center Curve', aspectRatio: '1:1', defaultImage: '/media/photography/street/street-noir.jpg' },
  { id: 'hz-06', index: 5, slotNumber: '06', label: 'FRAME 06', title: 'MONOLITH // REVERIE', room: 'light-art', location: 'Center Left Aperture', aspectRatio: '4:5', defaultImage: '/media/photography/portraits/portrait-rembrandt.jpg' },
  { id: 'hz-07', index: 6, slotNumber: '07', label: 'FRAME 07', title: 'VELOCITY // CONVERGENCE', room: 'light-art', location: 'Center Left Aperture', aspectRatio: '16:9', defaultImage: '/media/photography/light-art/light-art-vortex.jpg' },
  { id: 'hz-08', index: 7, slotNumber: '08', label: 'FRAME 08', title: 'SOLITARY // CADENCE', room: 'light-art', location: 'Direct Center Apex', aspectRatio: '4:5', defaultImage: '/media/photography/street/asphalt-monsoon.jpg' },
  { id: 'hz-09', index: 8, slotNumber: '09', label: 'FRAME 09', title: 'NEO // PASSAGE', room: 'light-art', location: 'Center Right Aperture', aspectRatio: '16:9', defaultImage: '/media/photography/street/project-specter.jpg' },
  { id: 'hz-10', index: 9, slotNumber: '10', label: 'FRAME 10', title: 'STRATA // EQUINOX', room: 'light-art', location: 'Center Right Aperture', aspectRatio: '4:5', defaultImage: '/media/photography/portraits/portrait-cyber-monolith.jpg' },
  { id: 'hz-11', index: 10, slotNumber: '11', label: 'FRAME 11', title: 'AURA // REFLECTION', room: 'light-art', location: 'Right Center Curve', aspectRatio: '4:5', defaultImage: '/media/photography/portraits/portrait-zenith.jpg' },
  { id: 'hz-12', index: 11, slotNumber: '12', label: 'FRAME 12', title: 'CHROMATIC // SPECTRUM', room: 'light-art', location: 'Right Center Curve', aspectRatio: '16:9', defaultImage: '/media/photography/light-art/light-art-hyper.jpg' },
  { id: 'hz-13', index: 12, slotNumber: '13', label: 'FRAME 13', title: 'SPEED // GRID', room: 'light-art', location: 'Right Horizon Ribbon', aspectRatio: '16:9', defaultImage: '/media/photography/street/race-panning.jpg' },
  { id: 'hz-14', index: 13, slotNumber: '14', label: 'FRAME 14', title: 'ORBITAL // KINETIC', room: 'light-art', location: 'Right Horizon Ribbon', aspectRatio: '1:1', defaultImage: '/media/photography/light-art/light-art-velocity.jpg' },
  { id: 'hz-15', index: 14, slotNumber: '15', label: 'FRAME 15', title: 'STEEL // SYMPHONY', room: 'light-art', location: 'Right Horizon Ribbon', aspectRatio: '4:5', defaultImage: '/media/photography/street/apex-predator.jpg' },
];

// 24 Frames in Street Monoliths
export const STREET_FRAMES: RoomFrameSlot[] = [
  // Left Wall Upper (01-04)
  { id: 'frame-L1', index: 0, slotNumber: '01', label: 'FRAME 01', title: 'METROPOLIS // ALLEY NOIR', room: 'street', location: 'Left Wall Upper (Col 1)', aspectRatio: '4:5', defaultImage: '/media/photography/street/street-noir.jpg' },
  { id: 'frame-L2', index: 1, slotNumber: '02', label: 'FRAME 02', title: 'SILHOUETTE // THRESHOLD', room: 'street', location: 'Left Wall Upper (Col 2)', aspectRatio: '4:5', defaultImage: '/media/photography/portraits/portrait-shadow-gaze.jpg' },
  { id: 'frame-L3', index: 2, slotNumber: '03', label: 'FRAME 03', title: 'KINETIC // APEX', room: 'street', location: 'Left Wall Upper (Col 3)', aspectRatio: '4:5', defaultImage: '/media/photography/street/race-panning.jpg' },
  { id: 'frame-L4', index: 3, slotNumber: '04', label: 'FRAME 04', title: 'ASPHALT // MONSOON', room: 'street', location: 'Left Wall Upper (Col 4)', aspectRatio: '4:5', defaultImage: '/media/photography/street/asphalt-monsoon.jpg' },
  // Left Wall Lower (05-08)
  { id: 'frame-L5', index: 4, slotNumber: '05', label: 'FRAME 05', title: 'SHADOW // FACADE', room: 'street', location: 'Left Wall Lower (Col 1)', aspectRatio: '4:5', defaultImage: '/media/photography/street/street-noir.jpg' },
  { id: 'frame-L6', index: 5, slotNumber: '06', label: 'FRAME 06', title: 'NEON // DRIFT', room: 'street', location: 'Left Wall Lower (Col 2)', aspectRatio: '4:5', defaultImage: '/media/photography/portraits/portrait-cyber-monolith.jpg' },
  { id: 'frame-L7', index: 6, slotNumber: '07', label: 'FRAME 07', title: 'URBAN // SOLITUDE', room: 'street', location: 'Left Wall Lower (Col 3)', aspectRatio: '4:5', defaultImage: '/media/photography/street/project-specter.jpg' },
  { id: 'frame-L8', index: 7, slotNumber: '08', label: 'FRAME 08', title: 'TEMPLE // DRIFT', room: 'street', location: 'Left Wall Lower (Col 4)', aspectRatio: '4:5', defaultImage: '/media/photography/street/race-panning.jpg' },
  // Back Wall Upper (09-12)
  { id: 'frame-B1', index: 8, slotNumber: '09', label: 'FRAME 09', title: 'CHRONICLE // APEX', room: 'street', location: 'Back Wall Upper (Col 1)', aspectRatio: '4:5', defaultImage: '/media/photography/portraits/portrait-zenith.jpg' },
  { id: 'frame-B2', index: 9, slotNumber: '10', label: 'FRAME 10', title: 'RADIAL // SPEED', room: 'street', location: 'Back Wall Upper (Col 2)', aspectRatio: '4:5', defaultImage: '/media/photography/street/race-panning.jpg' },
  { id: 'frame-B3', index: 10, slotNumber: '11', label: 'FRAME 11', title: 'OBSIDIAN // CANYON', room: 'street', location: 'Back Wall Upper (Col 3)', aspectRatio: '4:5', defaultImage: '/media/photography/street/street-noir.jpg' },
  { id: 'frame-B4', index: 11, slotNumber: '12', label: 'FRAME 12', title: 'LATENT // ANOMALY', room: 'street', location: 'Back Wall Upper (Col 4)', aspectRatio: '4:5', defaultImage: '/media/photography/portraits/portrait-rembrandt.jpg' },
  // Back Wall Lower (13-16)
  { id: 'frame-B5', index: 12, slotNumber: '13', label: 'FRAME 13', title: 'AERODYNAMIC // MONOLITH', room: 'street', location: 'Back Wall Lower (Col 1)', aspectRatio: '4:5', defaultImage: '/media/photography/street/project-specter.jpg' },
  { id: 'frame-B6', index: 13, slotNumber: '14', label: 'FRAME 14', title: 'HYPERION // FOCUS', room: 'street', location: 'Back Wall Lower (Col 2)', aspectRatio: '4:5', defaultImage: '/media/photography/portraits/portrait-shadow-gaze.jpg' },
  { id: 'frame-B7', index: 14, slotNumber: '15', label: 'FRAME 15', title: 'TRACK // CONVERGENCE', room: 'street', location: 'Back Wall Lower (Col 3)', aspectRatio: '4:5', defaultImage: '/media/photography/street/asphalt-monsoon.jpg' },
  { id: 'frame-B8', index: 15, slotNumber: '16', label: 'FRAME 16', title: 'OPTIC // FOCUS', room: 'street', location: 'Back Wall Lower (Col 4)', aspectRatio: '4:5', defaultImage: '/media/photography/street/project-specter.jpg' },
  // Right Wall Upper (17-20)
  { id: 'frame-R1', index: 16, slotNumber: '17', label: 'FRAME 17', title: 'NOCTURNE // DRIFT', room: 'street', location: 'Right Wall Upper (Col 1)', aspectRatio: '4:5', defaultImage: '/media/photography/street/street-noir.jpg' },
  { id: 'frame-R2', index: 17, slotNumber: '18', label: 'FRAME 18', title: 'STEEL // SYMPHONY', room: 'street', location: 'Right Wall Upper (Col 2)', aspectRatio: '4:5', defaultImage: '/media/photography/street/apex-predator.jpg' },
  { id: 'frame-R3', index: 18, slotNumber: '19', label: 'FRAME 19', title: 'VAPOR // LABYRINTH', room: 'street', location: 'Right Wall Upper (Col 3)', aspectRatio: '4:5', defaultImage: '/media/photography/street/asphalt-monsoon.jpg' },
  { id: 'frame-R4', index: 19, slotNumber: '20', label: 'FRAME 20', title: 'FREQUENCY // BEACON', room: 'street', location: 'Right Wall Upper (Col 4)', aspectRatio: '4:5', defaultImage: '/media/photography/street/race-panning.jpg' },
  // Right Wall Lower (21-24)
  { id: 'frame-R5', index: 20, slotNumber: '21', label: 'FRAME 21', title: 'MONSOON // PULSE', room: 'street', location: 'Right Wall Lower (Col 1)', aspectRatio: '4:5', defaultImage: '/media/photography/street/asphalt-monsoon.jpg' },
  { id: 'frame-R6', index: 21, slotNumber: '22', label: 'FRAME 22', title: 'EQUINOX // APEX', room: 'street', location: 'Right Wall Lower (Col 2)', aspectRatio: '4:5', defaultImage: '/media/photography/street/asphalt-monsoon.jpg' },
  { id: 'frame-R7', index: 22, slotNumber: '23', label: 'FRAME 23', title: 'GRID // KINETIC', room: 'street', location: 'Right Wall Lower (Col 3)', aspectRatio: '4:5', defaultImage: '/media/photography/street/apex-predator.jpg' },
  { id: 'frame-R8', index: 23, slotNumber: '24', label: 'FRAME 24', title: 'CYBER // HORIZON', room: 'street', location: 'Right Wall Lower (Col 4)', aspectRatio: '4:5', defaultImage: '/media/photography/street/race-panning.jpg' },
];

// 50 Frames in Portraits Pavilion
export const PORTRAIT_FRAMES: RoomFrameSlot[] = Array.from({ length: 50 }, (_, i) => {
  const num = (i + 1).toString().padStart(2, '0');
  let location = 'Back Wall';
  if (i >= 15 && i < 30) location = 'Left Wall';
  else if (i >= 30 && i < 45) location = 'Right Wall';
  else if (i >= 45) location = 'Pentagon Crown';

  const defaultTitles = [
    'APEX // TRAJECTORY', 'NOIR // CANYON', 'CHROMA // MATRIX', 'SHADOW // ARCHITECT', 'MONOLITH // PULSE',
    'VELOCITY // HORIZON', 'KINETIC // EMBER', 'CYBER // SOLITUDE', 'REMBRANDT // CHILL', 'ASPHALT // ECHO',
    'PHOTON // VORTEX', 'STEEL // SYMPHONY', 'TEMPLE // DRIFT', 'ZENITH // AURORA', 'SPECTRAL // GAZE',
    'OBSIDIAN // CONTOURS', 'AERODYNAMIC // FLUX', 'TITANIUM // CREVASSE', 'QUARTZ // ILLUMINATION', 'NEON // DRIFT',
    'OPTIC // EQUINOX', 'MONSOON // APEX', 'HYPERION // FOCUS', 'SOLAR // INTERFACE', 'CHRONOS // MIRAGE',
    'VAPOR // LABYRINTH', 'LATENT // ANOMALY', 'COBALT // SHADOWS', 'FREQUENCY // BEACON', 'RADIAL // DISPERSION',
    'METROPOLIS // ZENITH', 'CHRONICLE // SILENCE', 'KINETIC // STRIKE', 'LUMEN // CASCADE', 'TURBINE // ECHO',
    'ORBITAL // REFLECTION', 'SHUTTER // CHRONO', 'TERRA // GEOMETRICS', 'PHOTON // ACCELERATION', 'SYNAPSE // GLOW',
    'ECLIPSE // CHROME', 'VELOCE // DRIFT', 'PRISM // TRANSMISSION', 'AMBER // STRATA', 'INFINITY // FOCAL',
    'CROWN // APEX PENTAGON', 'CELESTIAL // VECTOR', 'NEXUS // PHOTONIC', 'AERO // MONOLITH', 'ETERNAL // RESONANCE'
  ];

  return {
    id: `f-${num}`,
    index: i,
    slotNumber: num,
    label: `FRAME ${num}`,
    title: defaultTitles[i] || `PORTRAIT // ${num}`,
    room: 'portraits',
    location: `${location} (Frame ${num})`,
    aspectRatio: '16:9',
    defaultImage: '/media/photography/portraits/portrait-rembrandt.jpg'
  };
});

// 30 AI Art Slots in Synthesis
export const SYNTHESIS_FRAMES: RoomFrameSlot[] = Array.from({ length: 30 }, (_, i) => {
  const num = (i + 1).toString().padStart(2, '0');
  const titles = [
    'PROJECT // NEURAL SYNAPSE',
    'PROJECT // CYBERNETIC CORE',
    'PROJECT // QUANTUM MIRAGE',
    'PROJECT // BIOMECHANICAL APEX',
    'PROJECT // SPECTRAL DIVERGENCE',
    'PROJECT // LATENT HORIZON',
    'PROJECT // OBSIDIAN CITADEL',
    'PROJECT // CHRONOS APERTURE',
    'PROJECT // VORTEX GENESIS',
    'PROJECT // AMBER TRANSDUCER'
  ];

  return {
    id: `ai-${num}`,
    index: i,
    slotNumber: num,
    label: `SLOT ${num}`,
    title: titles[i % titles.length] + ` (#${num})`,
    room: 'synthesis',
    location: `Synthesis Pedestal ${num}`,
    aspectRatio: (i % 3 === 2) ? '16:9' : '4:5',
    defaultImage: '/media/ai-art/neural-synapse.jpg'
  };
});

export function getFramesForRoom(room: 'light-art' | 'street' | 'portraits' | 'synthesis'): RoomFrameSlot[] {
  switch (room) {
    case 'light-art':
      return LIGHT_ART_FRAMES;
    case 'street':
      return STREET_FRAMES;
    case 'portraits':
      return PORTRAIT_FRAMES;
    case 'synthesis':
      return SYNTHESIS_FRAMES;
  }
}
