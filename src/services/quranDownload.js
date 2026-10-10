// Quran Download Service
// Handles fetching all pages of a surah, audio files, and caching them for offline use.

import { getAyahs, getSurahAyahAudio } from './quran';

const AUDIO_CACHE_NAME = 'quran-audio-cache';
const METADATA_KEY = 'quran_downloads_meta';

// Helper to get/set metadata
export function getDownloadMetadata() {
  try {
    const data = localStorage.getItem(METADATA_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
}

function saveDownloadMetadata(meta) {
  localStorage.setItem(METADATA_KEY, JSON.stringify(meta));
}

export function getSurahDownloadStatus(surahId, reciterId) {
  const meta = getDownloadMetadata();
  const key = `${surahId}_${reciterId}`;
  return meta[key] || { status: 'none' };
}

// cacheUrl removed — audio caching is handled inline in downloadSurah

// Event listeners for progress
const progressListeners = new Set();
export function subscribeToDownloadProgress(callback) {
  progressListeners.add(callback);
  return () => progressListeners.delete(callback);
}

function emitProgress(surahId, reciterId, progress, status = 'downloading', error = null) {
  progressListeners.forEach(cb => cb(surahId, reciterId, progress, status, error));
}

// The main download function
export async function downloadSurah(surahId, reciterId) {
  const meta = getDownloadMetadata();
  const key = `${surahId}_${reciterId}`;
  
  if (meta[key]?.status === 'downloaded') {
    return; // Already downloaded
  }

  meta[key] = { status: 'downloading', progress: 0 };
  saveDownloadMetadata(meta);
  emitProgress(surahId, reciterId, 0, 'downloading');

  try {
    // 1. Fetch text pages
    // Workbox handles caching of api.quran.com automatically via VitePWA config (CacheFirst).
    // We just need to fetch all pages to populate that cache.
    let page = 1;
    let totalPages = 1;
    do {
      const data = await getAyahs(surahId, { page });
      totalPages = data.pagination?.total_pages || 1;
      page++;
    } while (page <= totalPages);

    emitProgress(surahId, reciterId, 10, 'downloading');

    // 2. Fetch Audio URLs
    const audioFiles = await getSurahAyahAudio(surahId, reciterId);
    
    emitProgress(surahId, reciterId, 20, 'downloading');

    // 3. Download and cache audio files
    const audioCache = await caches.open(AUDIO_CACHE_NAME);
    let completed = 0;
    const totalFiles = audioFiles.length;

    // Download in chunks of 3 to avoid overwhelming the network
    const chunkSize = 3;
    for (let i = 0; i < totalFiles; i += chunkSize) {
      const chunk = audioFiles.slice(i, i + chunkSize);
      await Promise.all(chunk.map(async (file) => {
        const req = new Request(file.url);
        const cachedRes = await audioCache.match(req);
        if (!cachedRes) {
          // Add to cache
          const res = await fetch(req);
          if (!res.ok) throw new Error(`Failed to fetch audio: ${file.url}`);
          await audioCache.put(req, res);
        }
        completed++;
        const progress = 20 + Math.floor((completed / totalFiles) * 80);
        emitProgress(surahId, reciterId, progress, 'downloading');
      }));
    }

    // Done
    meta[key] = { status: 'downloaded', timestamp: Date.now() };
    saveDownloadMetadata(meta);
    emitProgress(surahId, reciterId, 100, 'downloaded');

  } catch (error) {
    console.error('Download failed:', error);
    meta[key] = { status: 'error' };
    saveDownloadMetadata(meta);
    emitProgress(surahId, reciterId, 0, 'error', error.message);
    throw error;
  }
}

export async function deleteSurahDownload(surahId, reciterId) {
  const meta = getDownloadMetadata();
  const key = `${surahId}_${reciterId}`;
  
  if (!meta[key]) return;
  
  try {
    const audioFiles = await getSurahAyahAudio(surahId, reciterId);
    const audioCache = await caches.open(AUDIO_CACHE_NAME);
    
    await Promise.all(audioFiles.map(async (file) => {
      await audioCache.delete(new Request(file.url));
    }));
    
    delete meta[key];
    saveDownloadMetadata(meta);
    emitProgress(surahId, reciterId, 0, 'none');
  } catch (err) {
    console.error('Failed to delete download:', err);
  }
}

// Function to intercept audio playback and return object URL if cached (Cache API range request workaround)
// Browsers Safari/Chrome can have trouble with byte-range requests directly from Cache API for media.
// We can intercept the URL and provide the cached response.
export async function getCachedAudioUrl(url) {
  try {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    const cachedResponse = await cache.match(url);
    if (cachedResponse) {
      const blob = await cachedResponse.blob();
      return URL.createObjectURL(blob);
    }
  } catch (e) {
    console.warn('Could not get cached audio:', e);
  }
  return url; // fallback to online
}
