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
  return duas.filter(d => 
    d.title?.toLowerCase().includes(q) || 
    d.meaning_english?.toLowerCase().includes(q) ||
    d.meaning_tamil?.includes(q) ||
    d.transliteration?.toLowerCase().includes(q)
  );
}
