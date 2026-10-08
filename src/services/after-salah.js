export async function fetchAfterSalahData() {
  try {
    const res = await fetch('/api/after-salah.json');
    if (!res.ok) throw new Error('Failed to fetch after-salah data');
    const data = await res.json();
    return data.dhikrList || [];
  } catch (error) {
    console.error('Error fetching after-salah:', error);
    return [];
  }
}
