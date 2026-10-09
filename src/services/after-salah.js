export async function fetchAfterSalahData() {
  const res = await fetch('/api/duas.json');
  if (!res.ok) throw new Error(`Failed to fetch after-salah duas: ${res.status}`);
  const data = await res.json();
  const afterSalahDuas = (data.duas || []).filter(dua => dua.category === 'prayer');
  if (afterSalahDuas.length === 0) throw new Error('No after-salah duas are available.');

  return afterSalahDuas.map(dua => ({
    id: dua.id,
    title: dua.title,
    count: dua.repeat ?? 1,
    arabic: dua.arabic,
    transliteration: dua.transliteration,
    tamil: dua.meaning_tamil,
    meaning_english: dua.meaning_english,
    note: dua.notes || dua.note,
    reference: dua.source || dua.reference,
  }));
}
