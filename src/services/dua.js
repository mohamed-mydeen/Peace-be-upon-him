export async function fetchDuasData() {
  try {
    const res = await fetch('/api/duas.json');
    if (!res.ok) throw new Error('Failed to fetch dua data');
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching duas:', error);
    return { categories: [], duas: [] };
  }
}

export function searchDuas(duas, query) {
  if (!query) return duas;
  const q = query.toLowerCase();
  return duas.filter(dua => [
    dua.title,
    dua.tamil,
    dua.meaning_english,
    dua.meaning_tamil,
    dua.transliteration,
    dua.notes,
    dua.note,
    dua.category,
    ...(Array.isArray(dua.keywords) ? dua.keywords : []),
  ].some(value => typeof value === 'string' && value.toLowerCase().includes(q)));
}
