import { requireSupabase } from '../lib/supabase';

function mapCategory(row) {
  return { ...row, tamil: row.tamil_name };
}

function mapDua(row) {
  return {
    ...row,
    category: row.category?.slug || '',
    tamil: row.tamil_title || '',
    meaning_tamil: row.meaning_tamil || '',
    meaning_english: row.meaning_english || '',
    reference: row.source_reference,
    count: row.recommended_count || 1,
    note: row.editorial_note,
  };
}

export async function getDuaCategories() {
  const { data, error } = await requireSupabase()
    .from('dua_categories')
    .select('id, slug, name, tamil_name, icon')
    .eq('is_published', true)
    .order('sort_order');
  if (error) throw error;
  return (data || []).map(mapCategory);
}

export async function getDuas({ category, query = '', page = 1, limit = 20 } = {}) {
  let request = requireSupabase()
    .from('duas')
    .select('id, category_id, title, tamil_title, arabic, transliteration, meaning_tamil, meaning_english, source_reference, source_url, grade, recommended_count, editorial_note, category:dua_categories!left(slug, name)', { count: 'exact' })
    .eq('is_published', true)
    .order('title');
  if (category && category !== 'all') request = request.eq('category.slug', category);
  if (query.trim()) {
    const { data, error } = await requireSupabase().rpc('search_content', {
      search_query: query.trim(),
      result_limit: Math.min(limit, 50),
      result_offset: (page - 1) * limit,
    });
    if (error) throw error;
    const duaIds = (data || []).filter(result => result.content_type === 'dua').map(result => result.content_id);
    if (!duaIds.length) return { duas: [], total: 0, page, totalPages: 0 };
    request = request.in('id', duaIds);
  }
  const { data, count, error } = await request.range((page - 1) * limit, page * limit - 1);
  if (error) throw error;
  const duas = (data || []).map(mapDua);
  return { duas, total: count ?? duas.length, page, totalPages: Math.ceil((count ?? duas.length) / limit) };
}

export async function searchDuas(query, options = {}) {
  return getDuas({ ...options, query });
}
