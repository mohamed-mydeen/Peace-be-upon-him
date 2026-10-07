import { requireSupabase } from '../lib/supabase';

const PAGE_SIZE = 10;

function plainText(value) {
  return value?.replace(/<[^>]*>/g, '') || '';
}

function mapSurah(row) {
  return {
    ...row,
    name_simple: row.name_transliteration,
    name_arabic: row.name_arabic,
    translated_name: { name: row.name_english || row.name_transliteration },
  };
}

function mapAyah(row, surah) {
  const verseKey = `${row.surah_id}:${row.ayah_number}`;
  return {
    ...row,
    verse_key: verseKey,
    verse_number: row.ayah_number,
    text_uthmani: row.arabic,
    translations: [
      row.tamil && { resource_id: 133, text: plainText(row.tamil) },
      row.english && { resource_id: 20, text: plainText(row.english) },
    ].filter(Boolean),
    surah: surah || null,
  };
}

export async function getSurahs() {
  const { data, error } = await requireSupabase()
    .from('quran_surahs')
    .select('id, name_arabic, name_transliteration, name_english, revelation_place, verses_count')
    .order('id')
    .range(0, 113);
  if (error) throw error;
  return (data || []).map(mapSurah);
}

export async function getSurah(id) {
  const { data, error } = await requireSupabase()
    .from('quran_surahs')
    .select('id, name_arabic, name_transliteration, name_english, revelation_place, verses_count')
    .eq('id', Number(id))
    .maybeSingle();
  if (error) throw error;
  return data ? mapSurah(data) : null;
}

export async function getAyahs(surahId, { page = 1 } = {}) {
  const start = (page - 1) * PAGE_SIZE;
  const { data, count, error } = await requireSupabase()
    .from('quran_ayahs')
    .select('id, surah_id, ayah_number, arabic, tamil, english, source_reference, translation_source', { count: 'exact' })
    .eq('surah_id', Number(surahId))
    .order('ayah_number')
    .range(start, start + PAGE_SIZE - 1);
  if (error) throw error;
  const total = count || 0;
  return {
    verses: (data || []).map(row => mapAyah(row)),
    pagination: { current_page: page, total_pages: Math.ceil(total / PAGE_SIZE), total_records: total },
  };
}

export async function getAyah(surahId, ayahNumber) {
  const { data, error } = await requireSupabase()
    .from('quran_ayahs')
    .select('id, surah_id, ayah_number, arabic, tamil, english, source_reference, translation_source')
    .eq('surah_id', Number(surahId))
    .eq('ayah_number', Number(ayahNumber))
    .maybeSingle();
  if (error) throw error;
  return data ? mapAyah(data) : null;
}

export async function searchQuran(query, page = 1) {
  const clean = query?.trim() || '';
  if (clean.length < 2) return { results: [], pagination: {} };
  const { data, error } = await requireSupabase().rpc('search_content', {
    search_query: clean,
    result_limit: 20,
    result_offset: (page - 1) * 20,
  });
  if (error) throw error;
  const matches = (data || []).filter(result => result.content_type === 'quran');
  return {
    results: matches.map(result => ({
      id: result.content_id,
      verse_key: result.title,
      text: result.excerpt,
      source_reference: result.source_reference,
    })),
    pagination: { current_page: page },
    query: clean,
  };
}

export async function recordReading(contentType, contentId) {
  const client = requireSupabase();
  const { data: { user }, error: userError } = await client.auth.getUser();
  if (userError) throw userError;
  if (!user) return;
  const args = {
    read_type: contentType,
    read_hadith_id: contentType === 'hadith' ? contentId : null,
    read_ayah_id: contentType === 'ayah' ? contentId : null,
    read_dua_id: contentType === 'dua' ? contentId : null,
  };
  const { error } = await client.rpc('record_read', args);
  if (error) throw error;
}

export const TRANSLATIONS = {
  tamil: { id: 133, name: 'Tamil translation', language: 'ta' },
  english: { id: 20, name: 'English translation', language: 'en' },
};
