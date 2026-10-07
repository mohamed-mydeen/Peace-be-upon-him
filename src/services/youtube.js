// ============================================
// YOUTUBE SERVICE
// All API calls handled server-side via proxy
// to avoid exposing API key in browser
// ============================================

const YT_API_BASE = 'https://www.googleapis.com/youtube/v3';
const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const CHANNEL_ID = import.meta.env.VITE_YOUTUBE_CHANNEL_ID;

export const isConfigured = !!(API_KEY && CHANNEL_ID);

const ytCache = new Map();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

async function fetchYT(endpoint, params = {}) {
  if (!isConfigured) throw new Error('YouTube API is not configured');

  const url = new URL(`${YT_API_BASE}/${endpoint}`);
  url.searchParams.set('key', API_KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const cacheKey = url.toString();
  const cached = ytCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;

  const res = await fetch(url.toString());
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `YouTube API error ${res.status}`);
  }
  const data = await res.json();
  ytCache.set(cacheKey, { data, ts: Date.now() });
  return data;
}

// Get channel info + statistics
export async function getChannelInfo() {
  const data = await fetchYT('channels', {
    part: 'snippet,statistics,brandingSettings',
    id: CHANNEL_ID,
  });
  const channel = data.items?.[0];
  if (!channel) throw new Error('Channel not found');

  return {
    id: channel.id,
    title: channel.snippet?.title,
    description: channel.snippet?.description,
    customUrl: channel.snippet?.customUrl,
    thumbnail: channel.snippet?.thumbnails?.high?.url || channel.snippet?.thumbnails?.default?.url,
    banner: channel.brandingSettings?.image?.bannerExternalUrl,
    subscriberCount: channel.statistics?.subscriberCount,
    viewCount: channel.statistics?.viewCount,
    videoCount: channel.statistics?.videoCount,
    hiddenSubscribers: channel.statistics?.hiddenSubscriberCount,
    uploadsPlaylistId: channel.contentDetails?.relatedPlaylists?.uploads,
    country: channel.snippet?.country,
    publishedAt: channel.snippet?.publishedAt,
  };
}

// Get uploads playlist ID
export async function getUploadsPlaylistId() {
  const data = await fetchYT('channels', {
    part: 'contentDetails',
    id: CHANNEL_ID,
  });
  return data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads || null;
}

// Get latest videos
export async function getLatestVideos({ maxResults = 12, pageToken = '' } = {}) {
  const playlistId = await getUploadsPlaylistId();
  if (!playlistId) throw new Error('Could not find uploads playlist');

  const params = {
    part: 'snippet',
    playlistId,
    maxResults,
  };
  if (pageToken) params.pageToken = pageToken;

  const data = await fetchYT('playlistItems', params);

  const videoIds = (data.items || [])
    .map(item => item.snippet?.resourceId?.videoId)
    .filter(Boolean);

  // Get video stats in a single batch call
  let statsMap = {};
  if (videoIds.length) {
    try {
      const statsData = await fetchYT('videos', {
        part: 'statistics,contentDetails',
        id: videoIds.join(','),
      });
      (statsData.items || []).forEach(v => {
        statsMap[v.id] = {
          viewCount: v.statistics?.viewCount,
          likeCount: v.statistics?.likeCount,
          commentCount: v.statistics?.commentCount,
          duration: v.contentDetails?.duration,
        };
      });
    } catch { /* stats are optional */ }
  }

  const videos = (data.items || []).map(item => {
    const videoId = item.snippet?.resourceId?.videoId;
    return {
      id: videoId,
      title: item.snippet?.title,
      description: item.snippet?.description,
      thumbnail:
        item.snippet?.thumbnails?.maxres?.url ||
        item.snippet?.thumbnails?.high?.url ||
        item.snippet?.thumbnails?.medium?.url,
      publishedAt: item.snippet?.publishedAt,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      ...(statsMap[videoId] || {}),
    };
  });

  return {
    videos,
    nextPageToken: data.nextPageToken,
    totalResults: data.pageInfo?.totalResults,
  };
}

// Format numbers for display
export function formatCount(count) {
  if (!count) return null;
  const n = parseInt(count, 10);
  if (isNaN(n)) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

// Format duration from ISO 8601
export function formatDuration(iso) {
  if (!iso) return '';
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '';
  const h = match[1] ? `${match[1]}:` : '';
  const m = match[2] ? (match[1] ? match[2].padStart(2, '0') : match[2]) : '0';
  const s = (match[3] || '0').padStart(2, '0');
  return `${h}${m}:${s}`;
}

// Format relative date
export function formatRelativeDate(isoDate) {
  if (!isoDate) return '';
  const diff = Date.now() - new Date(isoDate).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}
