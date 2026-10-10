const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const DB_NAME = 'pbuh-offline-history';
const STORE_NAME = 'pending-history';

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function queueOffline(userId, activity) {
  if (!('indexedDB' in window)) return;
  const db = await openDatabase();
  await new Promise((resolve, reject) => {
    const request = db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME)
      .add({ userId, activity, queuedAt: new Date().toISOString() });
    request.onsuccess = resolve;
    request.onerror = () => reject(request.error);
  });
  db.close();
}

async function request(path, token, options = {}) {
  const response = await fetch(`${API}/api/history${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...options.headers },
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || 'History request failed.');
  return body;
}

export async function loadHistory(token) {
  return (await request('/', token)).history;
}

export async function recordHistory(token, userId, activity) {
  const payload = { activity_type: activity.activityType, details: activity.details || {} };
  try {
    if (!navigator.onLine) throw new Error('offline');
    return (await request('/', token, { method: 'POST', body: JSON.stringify(payload) })).activity;
  } catch {
    await queueOffline(userId, payload);
    return null;
  }
}

export async function syncOfflineHistory(token, userId) {
  if (!navigator.onLine || !('indexedDB' in window)) return;
  const db = await openDatabase();
  const entries = await new Promise((resolve, reject) => {
    const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  for (const entry of entries.filter(item => item.userId === userId)) {
    try {
      await request('/', token, { method: 'POST', body: JSON.stringify(entry.activity) });
      await new Promise((resolve, reject) => {
        const deletion = db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).delete(entry.id);
        deletion.onsuccess = resolve;
        deletion.onerror = () => reject(deletion.error);
      });
    } catch { break; }
  }
  db.close();
}

export async function clearHistory(token) {
  await request('/', token, { method: 'DELETE' });
}
