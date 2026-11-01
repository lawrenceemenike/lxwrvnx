import { useState, useEffect, useCallback, useRef } from 'react';
import { VaultManifest, PhotoItem, AiArtItem, TrackItem } from '../types';
import {
  loadCustomPhotos,
  saveCustomPhotos,
  loadCustomAiArt,
  saveCustomAiArt,
  loadCustomTracks,
  saveCustomTracks,
  loadDeletedTrackIds,
  saveDeletedTrackIds
} from '../utils/vaultStorage';

export function useVaultData() {
  const [manifest, setManifest] = useState<VaultManifest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Keep references to custom items in memory for fast, reliable updates
  const customPhotosRef = useRef<PhotoItem[]>([]);
  const customAiRef = useRef<AiArtItem[]>([]);
  const customTracksRef = useRef<{ albumId: string; track: TrackItem }[]>([]);
  const deletedTrackIdsRef = useRef<Set<string>>(new Set(loadDeletedTrackIds()));

  useEffect(() => {
    Promise.all([
      fetch('/data/vault-manifest.json').then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      }),
      loadCustomPhotos(),
      loadCustomAiArt(),
      loadCustomTracks()
    ])
      .then(([data, savedPhotos, savedAi, savedTracks]: [
        VaultManifest,
        PhotoItem[],
        AiArtItem[],
        { albumId: string; track: TrackItem }[]
      ]) => {
        customPhotosRef.current = savedPhotos || [];
        customAiRef.current = savedAi || [];
        customTracksRef.current = savedTracks || [];

        // 1. Merge custom photos from IndexedDB
        if (savedPhotos && savedPhotos.length > 0) {
          const savedMap = new Map<string, PhotoItem>();
          savedPhotos.forEach(p => {
            savedMap.set(p.id, p);
            if (p.frameId) savedMap.set(`${p.category}-${p.frameId}`, p);
          });

          // Replace matching items in base manifest
          const replaced = data.photography.items.map(p => {
            if (savedMap.has(p.id)) return savedMap.get(p.id)!;
            if (p.frameId && savedMap.has(`${p.category}-${p.frameId}`)) return savedMap.get(`${p.category}-${p.frameId}`)!;
            return p;
          });

          // Add any custom items that were not replacements
          const handledIds = new Set(replaced.map(p => p.id));
          const newSaved = savedPhotos.filter(p => !handledIds.has(p.id));
          data.photography.items = [...newSaved, ...replaced];
        }

        // 2. Merge custom AI art from IndexedDB
        if (savedAi && savedAi.length > 0) {
          const savedMap = new Map<string, AiArtItem>();
          savedAi.forEach(a => {
            savedMap.set(a.id, a);
            if (a.frameId) savedMap.set(a.frameId, a);
          });

          const replaced = data.aiArt.items.map(a => {
            if (savedMap.has(a.id)) return savedMap.get(a.id)!;
            if (a.frameId && savedMap.has(a.frameId)) return savedMap.get(a.frameId)!;
            return a;
          });

          const handledIds = new Set(replaced.map(a => a.id));
          const newSaved = savedAi.filter(a => !handledIds.has(a.id));
          data.aiArt.items = [...newSaved, ...replaced];
        }

        // 3. Merge custom tracks from IndexedDB & filter out deleted tracks
        const deletedSet = new Set(loadDeletedTrackIds());
        deletedTrackIdsRef.current = deletedSet;

        data.acoustics.albums = data.acoustics.albums.map(album => {
          const albumCustomTracks = (savedTracks || []).filter(st => st.albumId === album.id).map(st => st.track);
          const existingTrackIds = new Set(album.tracks.map(t => t.id));
          const uniqueNewTracks = albumCustomTracks.filter(t => !existingTrackIds.has(t.id));
          const combinedTracks = [...album.tracks, ...uniqueNewTracks];
          return {
            ...album,
            tracks: combinedTracks.filter(t => !deletedSet.has(t.id))
          };
        });

        setManifest(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load vault manifest:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const addPhoto = useCallback((photo: PhotoItem) => {
    // 1. Update persistent storage (IndexedDB)
    const existing = customPhotosRef.current;
    const nextCustom = [
      photo,
      ...existing.filter(p => {
        if (p.id === photo.id) return false;
        if (photo.frameId && p.frameId && p.category === photo.category && p.frameId === photo.frameId) return false;
        return true;
      })
    ];
    customPhotosRef.current = nextCustom;
    saveCustomPhotos(nextCustom);

    // 2. Update React state
    setManifest(prev => {
      if (!prev) return prev;

      // Deduplicate: replace item if same ID or same category + frameId
      const filtered = prev.photography.items.filter(p => {
        if (p.id === photo.id) return false;
        if (photo.frameId && p.frameId && p.category === photo.category && p.frameId === photo.frameId) return false;
        return true;
      });

      return {
        ...prev,
        photography: {
          ...prev.photography,
          items: [photo, ...filtered]
        }
      };
    });
  }, []);

  const addAiArt = useCallback((art: AiArtItem) => {
    // 1. Update persistent storage (IndexedDB)
    const existing = customAiRef.current;
    const nextCustom = [
      art,
      ...existing.filter(a => {
        if (a.id === art.id) return false;
        if (art.frameId && a.frameId && a.frameId === art.frameId) return false;
        return true;
      })
    ];
    customAiRef.current = nextCustom;
    saveCustomAiArt(nextCustom);

    // 2. Update React state
    setManifest(prev => {
      if (!prev) return prev;

      const filtered = prev.aiArt.items.filter(a => {
        if (a.id === art.id) return false;
        if (art.frameId && a.frameId && a.frameId === art.frameId) return false;
        return true;
      });

      return {
        ...prev,
        aiArt: {
          ...prev.aiArt,
          items: [art, ...filtered]
        }
      };
    });
  }, []);

  const addTrackToAlbum = useCallback((albumId: string, track: TrackItem) => {
    // 1. Update persistent storage (IndexedDB)
    const existing = customTracksRef.current;
    const nextCustom = [...existing.filter(st => st.track.id !== track.id), { albumId, track }];
    customTracksRef.current = nextCustom;
    saveCustomTracks(nextCustom);

    // 2. Update React state
    setManifest(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        acoustics: {
          albums: prev.acoustics.albums.map(album => {
            if (album.id === albumId) {
              return {
                ...album,
                tracks: [...album.tracks, track]
              };
            }
            return album;
          })
        }
      };
    });
  }, []);

  const deleteTrack = useCallback((albumId: string, trackId: string) => {
    // 1. Record as deleted so it doesn't reappear on reload from base manifest
    deletedTrackIdsRef.current.add(trackId);
    saveDeletedTrackIds(Array.from(deletedTrackIdsRef.current));

    // 2. Remove from custom tracks in IndexedDB if it was custom
    const existing = customTracksRef.current;
    const nextCustom = existing.filter(st => st.track.id !== trackId);
    customTracksRef.current = nextCustom;
    saveCustomTracks(nextCustom);

    // 3. Update React state
    setManifest(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        acoustics: {
          albums: prev.acoustics.albums.map(album => {
            if (album.id === albumId) {
              return {
                ...album,
                tracks: album.tracks.filter(t => t.id !== trackId)
              };
            }
            return album;
          })
        }
      };
    });
  }, []);

  const clearSampleTracks = useCallback((albumId?: string) => {
    setManifest(prev => {
      if (!prev) return prev;
      const sampleIds: string[] = [];

      const updatedAlbums = prev.acoustics.albums.map(album => {
        if (!albumId || album.id === albumId) {
          const filteredTracks = album.tracks.filter(t => {
            // Sample tracks are the initial hardcoded IDs e.g. track-01-01 to track-01-08 or track-02-01 to track-02-06
            const isSample = /^track-\d{2}-\d{2}$/.test(t.id);
            if (isSample) {
              sampleIds.push(t.id);
              return false;
            }
            return true;
          });
          return {
            ...album,
            tracks: filteredTracks
          };
        }
        return album;
      });

      sampleIds.forEach(id => deletedTrackIdsRef.current.add(id));
      saveDeletedTrackIds(Array.from(deletedTrackIdsRef.current));

      return {
        ...prev,
        acoustics: {
          albums: updatedAlbums
        }
      };
    });
  }, []);

  const exportManifestJson = useCallback(() => {
    if (!manifest) return;
    const jsonStr = JSON.stringify(manifest, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'vault-manifest.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [manifest]);

  return {
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
  };
}
