const { supabaseAdmin } = require('../supabaseClient');
const { verifySession } = require('../auth/session');

// Verify a signed app session; public profile UUIDs are never credentials.
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not logged in' });
    }

    const token = authHeader.slice('Bearer '.length);
    const session = verifySession(token);
    if (!session) return res.status(401).json({ error: 'Invalid or expired session. Please sign in again.' });

    const { data: profile, error } = await supabaseAdmin
      .from('users')
      .select('id, name, age')
      .eq('id', session.sub)
      .single();

    if (error || !profile) {
      return res.status(401).json({ error: 'Profile not found. Please contact support.' });
    }

    req.user = profile;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { requireAuth };
