export async function fetchDhikrData() {
  try {
    const res = await fetch('/api/dhikr.json');
    if (!res.ok) throw new Error('Failed to fetch dhikr data');
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching dhikr:', error);
    return { sessions: [], dhikrList: [] };
  }
}

export function getDhikrBySession(dhikrList, sessionId) {
  if (!sessionId || sessionId === 'all') return dhikrList;
  return dhikrList.filter(d => d.session === sessionId);
}
