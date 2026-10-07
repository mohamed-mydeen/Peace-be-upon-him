// ============================================
// QURAN SERVICE
// Uses api.quran.com (free, no key needed)
// ============================================

const BASE = 'https://api.quran.com/api/v4';

const cache = new Map();

async function fetchWithCache(url) {
  if (cache.has(url)) return cache.get(url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Quran API error: ${res.status}`);
  const data = await res.json();
  cache.set(url, data);
  return data;
}

// Get all surahs with Tamil + English info
export async function getSurahs() {
  const data = await fetchWithCache(`${BASE}/chapters?language=en`);
  return data.chapters || [];
}

// Get single surah info
export async function getSurah(id) {
  const data = await fetchWithCache(`${BASE}/chapters/${id}?language=en`);
  return data.chapter || null;
}

// Get ayahs for a surah with Arabic + Tamil translation
// Tamil translation ID: 133 (Tamil - Abdul Hameed Baqavi)
// English: 20 (Saheeh International)
export async function getAyahs(surahId, { page = 1 } = {}) {
  const url = `${BASE}/verses/by_chapter/${surahId}?language=en&translations=20,133&fields=text_uthmani&page=${page}&per_page=10`;
  const data = await fetchWithCache(url);
  return {
    verses: data.verses || [],
    pagination: data.pagination || {},
  };
}

// Get single ayah
export async function getAyah(surahId, ayahNum) {
  const url = `${BASE}/verses/by_key/${surahId}:${ayahNum}?language=en&translations=20,133&fields=text_uthmani`;
  const data = await fetchWithCache(url);
  return data.verse || null;
}

// Search Quran
export async function searchQuran(query, page = 1) {
  if (!query || query.trim().length < 2) return { results: [], pagination: {} };
  const url = `${BASE}/search?q=${encodeURIComponent(query)}&language=en&page=${page}&size=20`;
  try {
    const data = await fetchWithCache(url);
    return {
      results: data.search?.results || [],
      pagination: data.search?.pagination || {},
      query,
    };
  } catch {
    return { results: [], pagination: {}, query };
  }
}

// Get Juz info
export async function getJuzList() {
  const data = await fetchWithCache(`${BASE}/juzs`);
  return data.juzs || [];
}

// Translation IDs reference
export const TRANSLATIONS = {
  tamil: { id: 133, name: 'Tamil — Abdul Hameed Baqavi', language: 'ta' },
  english: { id: 20, name: 'Saheeh International', language: 'en' },
};
