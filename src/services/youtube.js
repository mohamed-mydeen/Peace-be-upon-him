import { supabase } from '../lib/supabase';

export const isConfigured = Boolean(supabase);

async function invoke(action, params = {}) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase.functions.invoke('youtube', {
    body: { action, ...params },
  });
  if (error) throw new Error(error.message || 'Unable to load YouTube data.');
  if (data?.error) throw new Error(data.error);
  return data;
}

export async function getChannelInfo() {
  return invoke('channel');
}

export async function getLatestVideos({ maxResults = 12, pageToken = '' } = {}) {
  return invoke('latest', { maxResults, pageToken });
}

export async function getVideoDetails(videoIds) {
  if (!Array.isArray(videoIds) || videoIds.length === 0 || videoIds.length > 50) {
    throw new Error('Provide between 1 and 50 video IDs.');
  }
  return invoke('videos', { videoIds });
}

export function formatCount(count) {
  if (!count) return null;
  const n = Number.parseInt(count, 10);
  if (Number.isNaN(n)) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export function formatDuration(iso) {
  if (!iso) return '';
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '';
  const hours = match[1] ? `${match[1]}:` : '';
  const minutes = match[2] ? (match[1] ? match[2].padStart(2, '0') : match[2]) : '0';
  return `${hours}${minutes}:${(match[3] || '0').padStart(2, '0')}`;
}

export function formatRelativeDate(isoDate) {
  if (!isoDate) return '';
  const days = Math.floor((Date.now() - new Date(isoDate).getTime()) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}
