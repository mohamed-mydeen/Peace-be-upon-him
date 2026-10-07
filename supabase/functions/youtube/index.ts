import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const headers = {
  'Access-Control-Allow-Origin': Deno.env.get('APP_ORIGIN') || '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};
const cacheTtlSeconds = 900;
const youtubeBase = 'https://www.googleapis.com/youtube/v3';

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers });
}

async function digest(value: string) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers });
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);

  const apiKey = Deno.env.get('YOUTUBE_API_KEY');
  const channelId = Deno.env.get('YOUTUBE_CHANNEL_ID');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!apiKey || !channelId || !supabaseUrl || !serviceRoleKey) {
    return json({ error: 'YouTube integration is not configured on the server.' }, 503);
  }

  let input: Record<string, unknown>;
  try {
    input = await request.json();
  } catch {
    return json({ error: 'Request body must be valid JSON.' }, 400);
  }
  const action = input.action;
  if (!['channel', 'latest', 'videos'].includes(String(action))) {
    return json({ error: 'Unsupported YouTube action.' }, 400);
  }

  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rateKey = await digest(forwardedFor);
  const { data: allowed, error: rateError } = await client.rpc('take_youtube_request', { rate_key: rateKey });
  if (rateError) {
    console.error('YouTube rate limit check failed:', rateError.message);
    return json({ error: 'YouTube service is temporarily unavailable.' }, 503);
  }
  if (!allowed) return json({ error: 'Too many YouTube requests. Please try again shortly.' }, 429);

  let cacheKey: string;
  let params: Record<string, string>;
  if (action === 'channel') {
    cacheKey = 'channel';
    params = { part: 'snippet,statistics,brandingSettings,contentDetails', id: channelId };
  } else if (action === 'latest') {
    const maxResults = Number(input.maxResults ?? 12);
    const pageToken = typeof input.pageToken === 'string' ? input.pageToken : '';
    if (!Number.isInteger(maxResults) || maxResults < 1 || maxResults > 12 || pageToken.length > 512) {
      return json({ error: 'Invalid video page parameters.' }, 400);
    }
    const { data: channelCache, error: cacheError } = await client
      .from('youtube_cache').select('response').eq('cache_key', 'channel').gt('expires_at', new Date().toISOString()).maybeSingle();
    if (cacheError) return json({ error: 'Unable to load YouTube channel data.' }, 503);
    let channel = channelCache?.response;
    if (!channel) {
      channel = await loadCached(client, 'channel', { part: 'snippet,statistics,brandingSettings,contentDetails', id: channelId }, apiKey);
    }
    const uploadsPlaylistId = channel?.uploadsPlaylistId;
    if (!uploadsPlaylistId) return json({ error: 'The configured YouTube channel has no uploads playlist.' }, 404);
    cacheKey = `latest:${maxResults}:${pageToken}`;
    params = { part: 'snippet', playlistId: uploadsPlaylistId, maxResults: String(maxResults) };
    if (pageToken) params.pageToken = pageToken;
  } else {
    const videoIds = input.videoIds;
    if (!Array.isArray(videoIds) || videoIds.length < 1 || videoIds.length > 50 ||
        videoIds.some(id => typeof id !== 'string' || !/^[\w-]{11}$/.test(id))) {
      return json({ error: 'Provide 1 to 50 valid YouTube video IDs.' }, 400);
    }
    cacheKey = `videos:${[...new Set(videoIds)].sort().join(',')}`;
    params = { part: 'snippet,statistics,contentDetails', id: [...new Set(videoIds)].join(',') };
  }

  try {
    const result = await loadCached(client, cacheKey, params, apiKey);
    if (action === 'channel') return json(result);
    if (action === 'videos') return json(result);

    const videoIds = (result.items || [])
      .map((item: { snippet?: { resourceId?: { videoId?: string } } }) => item.snippet?.resourceId?.videoId)
      .filter((id: unknown): id is string => typeof id === 'string');
    let statsById: Record<string, Record<string, string>> = {};
    if (videoIds.length) {
      const videoDetails = await loadCached(
        client,
        `video-details:${[...videoIds].sort().join(',')}`,
        { part: 'statistics,contentDetails', id: videoIds.join(',') },
        apiKey,
      );
      statsById = Object.fromEntries((videoDetails.items || []).map((video: Record<string, any>) => [
        video.id,
        {
          viewCount: video.statistics?.viewCount,
          likeCount: video.statistics?.likeCount,
          commentCount: video.statistics?.commentCount,
          duration: video.contentDetails?.duration,
        },
      ]));
    }
    const videos = (result.items || []).map((item: Record<string, any>) => {
      const snippet = item.snippet || {};
      const id = snippet.resourceId?.videoId;
      return {
        id,
        title: snippet.title,
        description: snippet.description,
        thumbnail: snippet.thumbnails?.maxres?.url || snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url,
        publishedAt: snippet.publishedAt,
        url: `https://www.youtube.com/watch?v=${id}`,
        ...(statsById[id] || {}),
      };
    });
    return json({ videos, nextPageToken: result.nextPageToken, totalResults: result.pageInfo?.totalResults });
  } catch (error) {
    console.error('YouTube API request failed:', error instanceof Error ? error.message : error);
    return json({ error: 'YouTube data could not be loaded. Please try again later.' }, 502);
  }
});

async function loadCached(
  client: ReturnType<typeof createClient>,
  cacheKey: string,
  params: Record<string, string>,
  apiKey: string,
) {
  const { data, error } = await client
    .from('youtube_cache')
    .select('response')
    .eq('cache_key', cacheKey)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();
  if (error) throw error;
  if (data) return data.response;

  const url = new URL(cacheKey === 'channel' ? `${youtubeBase}/channels` :
    cacheKey.startsWith('latest:') ? `${youtubeBase}/playlistItems` : `${youtubeBase}/videos`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  url.searchParams.set('key', apiKey);
  const response = await fetch(url);
  const body = await response.json();
  if (!response.ok) throw new Error(`Google API status ${response.status}: ${body?.error?.status || 'request failed'}`);

  let normalized = body;
  if (cacheKey === 'channel') {
    const channel = body.items?.[0];
    if (!channel) throw new Error('Configured channel was not found.');
    normalized = {
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
  const { error: writeError } = await client.from('youtube_cache').upsert({
    cache_key: cacheKey,
    response: normalized,
    expires_at: new Date(Date.now() + cacheTtlSeconds * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  });
  if (writeError) throw writeError;
  return normalized;
}
