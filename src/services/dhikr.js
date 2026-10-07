import { requireSupabase } from '../lib/supabase';

export const DHIKR_SESSIONS = [
  { id: 'after-prayer', name: 'After Prayer', tamil: 'தொழுகைக்குப் பின்' },
  { id: 'morning', name: 'Morning Adhkar', tamil: 'காலை அத்கார்' },
  { id: 'evening', name: 'Evening Adhkar', tamil: 'மாலை அத்கார்' },
  { id: 'general', name: 'General Dhikr', tamil: 'பொது திக்ர்' },
];

export async function getDhikrBySession(sessionId) {
  let query = requireSupabase()
    .from('dhikr')
    .select('id, name, session, arabic, transliteration, meaning, meaning_tamil, recommended_count, source_reference, source_url')
    .eq('is_published', true)
    .order('created_at');
  if (sessionId && sessionId !== 'all') query = query.eq('session', sessionId);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(item => ({
    ...item,
    title: item.name,
    target: item.recommended_count || 1,
    reference: item.source_reference,
  }));
}
