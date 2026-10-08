// Vercel Serverless Function — YouTube API Proxy
// Keeps YOUTUBE_API_KEY server-side (never exposed to browser)

const BASE = 'https://www.googleapis.com/youtube/v3';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return res.status(500).json({ error: 'API key not configured' });

  const { endpoint, ...params } = req.query;
  if (!endpoint) return res.status(400).json({ error: 'Missing endpoint' });

  // Only allow safe endpoints
  const allowed = ['channels', 'search', 'videos', 'playlistItems'];
  if (!allowed.includes(endpoint)) return res.status(403).json({ error: 'Forbidden' });

  const url = new URL(`${BASE}/${endpoint}`);
  url.searchParams.set('key', key);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  try {
    const r = await fetch(url.toString());
    const data = await r.json();
    // Cache 10 minutes on Vercel edge
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=300');
    res.status(r.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
