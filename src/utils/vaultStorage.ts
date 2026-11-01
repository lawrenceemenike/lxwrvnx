import { PhotoItem, AiArtItem, TrackItem } from '../types';

export interface SavedTrackEntry {
  id: string; // unique key e.g. `${albumId}-${track.id}`
  albumId: string;
  track: TrackItem;
}

const DB_NAME = 'the_vault_spatial_db';
const DB_VERSION = 1;
const STORE_PHOTOS = 'custom_photos';
const STORE_AI = 'custom_ai_art';
const STORE_TRACKS = 'custom_tracks';

// Legacy LocalStorage Keys for migration & fallback
const STORAGE_KEY_CUSTOM_PHOTOS = 'vault_custom_photos';
const STORAGE_KEY_CUSTOM_AI = 'vault_custom_ai_art';
const STORAGE_KEY_CUSTOM_TRACKS = 'vault_custom_tracks';

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_PHOTOS)) {
        db.createObjectStore(STORE_PHOTOS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_AI)) {
        db.createObjectStore(STORE_AI, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_TRACKS)) {
        db.createObjectStore(STORE_TRACKS, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      console.warn('IndexedDB open error:', request.error);
      reject(request.error);
    };
  });

  return dbPromise;
}

// ==========================================
// 1. PHOTOS PERSISTENCE (INDEXEDDB + FALLBACK)
// ==========================================

export async function loadCustomPhotos(): Promise<PhotoItem[]> {
  try {
    const db = await getDB();
    const items = await new Promise<PhotoItem[]>((resolve, reject) => {
      const tx = db.transaction(STORE_PHOTOS, 'readonly');
      const store = tx.objectStore(STORE_PHOTOS);
      const req = store.getAll();
      req.onsuccess = () => resolve((req.result as PhotoItem[]) || []);
      req.onerror = () => reject(req.error);
    });

    if (items.length > 0) {
      return items;
    }

    // Migrate from localStorage if IndexedDB is currently empty
    try {
      const legacy = localStorage.getItem(STORAGE_KEY_CUSTOM_PHOTOS);
      if (legacy) {
        const parsed: PhotoItem[] = JSON.parse(legacy);
        if (Array.isArray(parsed) && parsed.length > 0) {
          await saveCustomPhotos(parsed);
          return parsed;
        }
      }
    } catch {}

    return [];
  } catch (err) {
    console.warn('IndexedDB photo load failed, checking localStorage fallback:', err);
    try {
      const legacy = localStorage.getItem(STORAGE_KEY_CUSTOM_PHOTOS);
      return legacy ? JSON.parse(legacy) : [];
    } catch {
      return [];
    }
  }
}

export async function saveCustomPhotos(photos: PhotoItem[]): Promise<void> {
  try {
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_PHOTOS, 'readwrite');
      const store = tx.objectStore(STORE_PHOTOS);
      store.clear();
      photos.forEach(photo => store.put(photo));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('IndexedDB photo save failed, trying localStorage fallback:', err);
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_PHOTOS, JSON.stringify(photos));
    } catch (lsErr) {
      console.warn('LocalStorage save failed as well:', lsErr);
    }
  }
}

// ==========================================
// 2. AI ART PERSISTENCE (INDEXEDDB + FALLBACK)
// ==========================================

export async function loadCustomAiArt(): Promise<AiArtItem[]> {
  try {
    const db = await getDB();
    const items = await new Promise<AiArtItem[]>((resolve, reject) => {
      const tx = db.transaction(STORE_AI, 'readonly');
      const store = tx.objectStore(STORE_AI);
      const req = store.getAll();
      req.onsuccess = () => resolve((req.result as AiArtItem[]) || []);
      req.onerror = () => reject(req.error);
    });

    if (items.length > 0) {
      return items;
    }

    // Migrate from localStorage if IndexedDB is empty
    try {
      const legacy = localStorage.getItem(STORAGE_KEY_CUSTOM_AI);
      if (legacy) {
        const parsed: AiArtItem[] = JSON.parse(legacy);
        if (Array.isArray(parsed) && parsed.length > 0) {
          await saveCustomAiArt(parsed);
          return parsed;
        }
      }
    } catch {}

    return [];
  } catch (err) {
    console.warn('IndexedDB AI Art load failed, checking localStorage fallback:', err);
    try {
      const legacy = localStorage.getItem(STORAGE_KEY_CUSTOM_AI);
      return legacy ? JSON.parse(legacy) : [];
    } catch {
      return [];
    }
  }
}

export async function saveCustomAiArt(items: AiArtItem[]): Promise<void> {
  try {
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_AI, 'readwrite');
      const store = tx.objectStore(STORE_AI);
      store.clear();
      items.forEach(item => store.put(item));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('IndexedDB AI Art save failed, trying localStorage fallback:', err);
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_AI, JSON.stringify(items));
    } catch (lsErr) {
      console.warn('LocalStorage save failed as well:', lsErr);
    }
  }
}

// ==========================================
// 3. TRACKS PERSISTENCE (INDEXEDDB + FALLBACK)
// ==========================================

export async function loadCustomTracks(): Promise<{ albumId: string; track: TrackItem }[]> {
  try {
    const db = await getDB();
    const items = await new Promise<SavedTrackEntry[]>((resolve, reject) => {
      const tx = db.transaction(STORE_TRACKS, 'readonly');
      const store = tx.objectStore(STORE_TRACKS);
      const req = store.getAll();
      req.onsuccess = () => resolve((req.result as SavedTrackEntry[]) || []);
      req.onerror = () => reject(req.error);
    });

    if (items.length > 0) {
      return items.map(({ albumId, track }) => ({ albumId, track }));
    }

    // Migrate from localStorage if IndexedDB is empty
    try {
      const legacy = localStorage.getItem(STORAGE_KEY_CUSTOM_TRACKS);
      if (legacy) {
        const parsed: { albumId: string; track: TrackItem }[] = JSON.parse(legacy);
        if (Array.isArray(parsed) && parsed.length > 0) {
          await saveCustomTracks(parsed);
          return parsed;
        }
      }
    } catch {}

    return [];
  } catch (err) {
    console.warn('IndexedDB tracks load failed, checking localStorage fallback:', err);
    try {
      const legacy = localStorage.getItem(STORAGE_KEY_CUSTOM_TRACKS);
      return legacy ? JSON.parse(legacy) : [];
    } catch {
      return [];
    }
  }
}

export async function saveCustomTracks(entries: { albumId: string; track: TrackItem }[]): Promise<void> {
  try {
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_TRACKS, 'readwrite');
      const store = tx.objectStore(STORE_TRACKS);
      store.clear();
      entries.forEach(entry => {
        store.put({
          id: `${entry.albumId}-${entry.track.id}`,
          albumId: entry.albumId,
          track: entry.track
        });
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('IndexedDB tracks save failed, trying localStorage fallback:', err);
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_TRACKS, JSON.stringify(entries));
    } catch (lsErr) {
      console.warn('LocalStorage save failed as well:', lsErr);
    }
  }
}

const STORAGE_KEY_DELETED_TRACKS = 'vault_deleted_track_ids';

export function loadDeletedTrackIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DELETED_TRACKS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveDeletedTrackIds(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_DELETED_TRACKS, JSON.stringify(ids));
  } catch (err) {
    console.warn('Failed to save deleted track IDs to localStorage:', err);
  }
}

