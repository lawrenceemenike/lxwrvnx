export type ChamberId = 'concourse' | 'optics' | 'synthesis' | 'acoustics' | 'architect' | 'ai-projects';
export type PhotoCategory = 'portraits' | 'street' | 'light-art';

export interface OpticsSpecs {
  lens: string;
  shutter: string;
  iso: number | string;
  body: string;
  focalLength?: string;
  aperture?: string;
}

export interface PhotoItem {
  id: string;
  title: string;
  category: PhotoCategory;
  status: string;
  coordinates: string;
  optics: OpticsSpecs;
  story: string;
  ownership: string;
  image: string;
  aspectRatio: string;
  frameId?: string;
  targetFrameIndex?: number;
  isCustom?: boolean;
}

export interface GenerativeData {
  engine: string;
  steps: number;
  cfg: number;
  sampler: string;
  promptExcerpt: string;
  colorGrading: string;
  seed: string;
}

export interface AiArtItem {
  id: string;
  title: string;
  format: 'portrait' | 'landscape';
  status: string;
  coordinates: string;
  generativeData: GenerativeData;
  lore: string;
  ownership: string;
  image: string;
  frameId?: string;
  targetSlotIndex?: number;
}

export interface TrackItem {
  id: string;
  trackNumber: string;
  title: string;
  bpm: number;
  key: string;
  duration: string;
  audioUrl?: string;
}

export interface AlbumItem {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  cover: string;
  genre: string;
  runtime: string;
  tracks: TrackItem[];
}

export interface ArchitectProfile {
  name: string;
  callsign: string;
  role: string;
  tagline?: string;
  organization?: string;
  coordinates: string;
  bio: string;
  philosophy: string;
  systems: string;
  visualMatrix?: string;
  comms: {
    email: string;
    twitter: string;
    github: string;
    audioStream: string;
    organizationUrl?: string;
  };
}

export interface AiProjectCaseStudy {
  executive_summary: string;
  business_problem: string;
  why_it_matters: string;
  my_role?: { role: string; action: string }[];
  discovery_process?: string;
  solution_architecture: string;
  governance_security: string;
  commercial_intel_layer?: string;
  results: string;
  lessons_learned?: string;
}

export interface AiProjectItem {
  id: number | string;
  title: string;
  short_desc: string;
  tech_stack: string[];
  github_link?: string;
  youtube_link?: string;
  category?: 'multi-agent' | 'governance' | 'finops' | 'mlops';
  systemCode?: string;
  statusBadge?: string;
  case_study?: AiProjectCaseStudy;
  isPlaceholder?: boolean;
}

export interface VaultManifest {
  meta: {
    version: string;
    updated: string;
    author: string;
  };
  photography: {
    categories: {
      id: PhotoCategory;
      title: string;
      subtitle: string;
      heroImage: string;
    }[];
    items: PhotoItem[];
  };
  aiArt: {
    items: AiArtItem[];
  };
  acoustics: {
    albums: AlbumItem[];
  };
  architect: ArchitectProfile;
  aiProjects?: AiProjectItem[];
}
