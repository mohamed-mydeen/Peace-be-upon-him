import { requireSupabase } from '../lib/supabase';

const HADITH_FIELDS = 'id, collection_id, book_id, chapter_id, hadith_number, narrator, arabic, tamil, english, grade, source_reference, source_url';

export const GRADES = {
  sahih: { label: 'Sahih', badge: 'badge-sahih', description: 'Authentic' },
  hasan: { label: 'Hasan', badge: 'badge-hasan', description: 'Good' },
  daif: { label: "Da'if", badge: 'badge-daif', description: 'Weak' },
  mixed: { label: 'Mixed', badge: 'badge-unknown', description: 'Varies by hadith' },
  unknown: { label: 'Not graded', badge: 'badge-unknown', description: '' },
};

function toHadith(row) {
  return {
    ...row,
    number: row.hadith_number,
    arab: row.arabic,
    translation: row.tamil || row.english || '',
    reference: row.source_reference,
  };
}

export async function getCollections() {
  const { data, error } = await requireSupabase()
    .from('hadith_collections')
    .select('id, slug, name, arabic_name, author, description, source_url')
    .eq('is_published', true)
    .order('name');
  if (error) throw error;
  return (data || []).map(collection => ({ ...collection, arabicName: collection.arabic_name }));
}

export async function getTopics() {
  const { data, error } = await requireSupabase()
    .from('topics')
    .select('id, slug, name, tamil_name, icon, color')
    .eq('is_published', true)
    .order('name');
  if (error) throw error;
  return (data || []).map(topic => ({ ...topic, tamil: topic.tamil_name }));
}

export async function getCollection(slug) {
  const { data, error } = await requireSupabase()
    .from('hadith_collections')
    .select('id, slug, name, arabic_name, author, description, source_url')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();
  if (error) throw error;
  return data ? { ...data, arabicName: data.arabic_name } : null;
}

export async function getBooks(collectionId) {
  const { data, error } = await requireSupabase()
    .from('hadith_books')
    .select('id, book_number, name, arabic_name, source_reference')
    .eq('collection_id', collectionId)
    .order('book_number');
  if (error) throw error;
  return (data || []).map(book => ({
    ...book,
    number: book.book_number,
    arabicName: book.arabic_name,
  }));
}

export async function getHadiths(collectionId, { page = 1, limit = 20, bookId } = {}) {
  const client = requireSupabase();
  let query = client.from('hadiths')
    .select(`${HADITH_FIELDS}, book:hadith_books(name, book_number), chapter:hadith_chapters(title, chapter_number)`, { count: 'exact' })
    .eq('collection_id', collectionId)
    .eq('is_published', true)
    .order('hadith_number');
  if (bookId) query = query.eq('book_id', bookId);
  const { data, count, error } = await query.range((page - 1) * limit, page * limit - 1);
  if (error) throw error;
  return {
    hadiths: (data || []).map(toHadith),
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

export async function getHadith(collectionSlug, number) {
  const collection = await getCollection(collectionSlug);
  if (!collection) return null;
  const { data, error } = await requireSupabase()
    .from('hadiths')
    .select(`${HADITH_FIELDS}, book:hadith_books(name, book_number), chapter:hadith_chapters(title, chapter_number)`)
    .eq('collection_id', collection.id)
    .eq('hadith_number', String(number))
    .eq('is_published', true)
    .maybeSingle();
  if (error) throw error;
  return data ? toHadith(data) : null;
}

export async function searchHadiths(query, { collectionId, page = 1, limit = 20 } = {}) {
  const clean = query.trim();
  if (clean.length < 2 || clean.length > 200) return { hadiths: [], total: 0, page, totalPages: 0 };
  let request = requireSupabase().from('hadiths')
    .select(HADITH_FIELDS, { count: 'exact' })
    .eq('is_published', true)
    .textSearch('search_document', clean, { config: 'simple', type: 'websearch' })
    .order('hadith_number');
  if (collectionId) request = request.eq('collection_id', collectionId);
  const { data, count, error } = await request.range((page - 1) * limit, page * limit - 1);
  if (error) throw error;
  return {
    hadiths: (data || []).map(toHadith),
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

export async function getHadithsForTopic(topicId, { page = 1, limit = 20 } = {}) {
  const { data, error } = await requireSupabase()
    .from('hadith_topics')
    .select(`hadith:${'hadiths'}!inner(${HADITH_FIELDS}, collection:hadith_collections(name, slug))`)
    .eq('topic_id', topicId)
    .range((page - 1) * limit, page * limit - 1);
  if (error) throw error;
  return (data || []).map(({ hadith }) => toHadith(hadith));
}
