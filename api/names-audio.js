import { getNameAudio } from '../server/namesAudio.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const rawNumber = req.query.number;
  const number = typeof rawNumber === 'string' ? Number(rawNumber) : NaN;

  try {
    const { audio, contentType } = await getNameAudio(number);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');
    return res.status(200).send(Buffer.from(audio));
  } catch (error) {
    const status = error instanceof RangeError ? 400 : 502;
    if (status === 502) console.error('Names audio proxy failed:', error);
    return res.status(status).json({ error: error.message });
  }
}
