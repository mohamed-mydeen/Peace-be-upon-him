// Vercel Serverless Function — YouTube API Proxy
// Keeps YOUTUBE_API_KEY server-side (never exposed to browser)

const BASE = 'https://www.googleapis.com/youtube/v3';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { endpoint, ...params } = req.query;
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    // Return mock data for local development if no API key is provided
    if (endpoint === 'search') {
      return res.status(200).json({
        items: [
          { id: { videoId: 'mock1' }, snippet: { title: 'Islamic Reminder 1', description: 'Mock video 1', channelTitle: 'Mock Channel', publishedAt: '2023-01-01T00:00:00Z', thumbnails: { medium: { url: 'https://via.placeholder.com/320x180?text=Mock+Video+1' } } } },
          { id: { videoId: 'mock2' }, snippet: { title: 'Islamic Reminder 2', description: 'Mock video 2', channelTitle: 'Mock Channel', publishedAt: '2023-01-02T00:00:00Z', thumbnails: { medium: { url: 'https://via.placeholder.com/320x180?text=Mock+Video+2' } } } }
        ]
      });
    } else if (endpoint === 'channels') {
      return res.status(200).json({
        items: [
          { snippet: { title: 'Mock Channel', thumbnails: { default: { url: 'https://via.placeholder.com/88?text=MC' } } }, statistics: { subscriberCount: '100000', videoCount: '500' } }
        ]
      });
    }
    return res.status(200).json({ items: [] });
  }

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
