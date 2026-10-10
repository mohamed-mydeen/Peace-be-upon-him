const express = require('express');
const { supabaseAdmin } = require('../supabaseClient');
const { hashPassword, issueSession, verifyPassword } = require('../auth/session');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

function validateProfile({ name, age, password }) {
  const parsedAge = Number.parseInt(age, 10);
  if (!name || !name.trim()) return { error: 'Name is required.' };
  if (!Number.isInteger(parsedAge) || parsedAge < 5 || parsedAge > 120) return { error: 'Please enter a valid age (5–120).' };
  if (!password || password.length < 4) return { error: 'Password must be at least 4 characters.' };
  return { name: name.trim(), age: parsedAge, password };
}

async function findMatchingUser(name, age, password) {
  const { data: users, error } = await supabaseAdmin
    .from('users')
    .select('id, name, age, password_hash, created_at')
    .eq('name', name)
    .eq('age', age);
  if (error) throw error;
  for (const user of users || []) {
    if (await verifyPassword(password, user.password_hash)) return user;
  }
  return null;
}

router.post('/register', async (req, res) => {
  const profile = validateProfile(req.body);
  if (profile.error) return res.status(400).json({ error: profile.error });
  try {
    // Validate session configuration before writing a profile row.
    issueSession('configuration-check');
    const { data: existing, error: lookupError } = await supabaseAdmin
      .from('users')
      .select('id, password_hash')
      .eq('name', profile.name)
      .eq('age', profile.age)
      .limit(1);
    if (lookupError) return res.status(400).json({ error: lookupError.message });
    if (existing?.[0]?.password_hash) return res.status(409).json({ error: 'An account with this name and age already exists. Please sign in.' });

    const passwordHash = await hashPassword(profile.password);
    let user;
    if (existing?.[0]) {
      const { data, error } = await supabaseAdmin.from('users')
        .update({ password_hash: passwordHash })
        .eq('id', existing[0].id)
        .select('id, name, age, created_at').single();
      if (error) return res.status(400).json({ error: error.message });
      user = data;
    } else {
      const { data, error } = await supabaseAdmin.from('users')
        .insert({ name: profile.name, age: profile.age, password_hash: passwordHash })
        .select('id, name, age, created_at').single();
      if (error) return res.status(400).json({ error: error.message });
      user = data;
    }
    return res.status(201).json({ user, token: issueSession(user.id) });
  } catch (error) {
    console.error('Registration error:', error);
    const isSessionConfigError = error.message?.includes('APP_SESSION_SECRET');
    return res.status(500).json({ error: isSessionConfigError ? 'Server session setup is incomplete. Add APP_SESSION_SECRET and restart the backend.' : 'Unable to create account.' });
  }
});

router.post('/login', async (req, res) => {
  const profile = validateProfile(req.body);
  if (profile.error) return res.status(400).json({ error: profile.error });
  try {
    const user = await findMatchingUser(profile.name, profile.age, profile.password);
    if (!user) return res.status(401).json({ error: 'Incorrect name, age, or password.' });
    const { password_hash: _passwordHash, ...safeUser } = user;
    return res.json({ user: safeUser, token: issueSession(user.id) });
  } catch (error) {
    console.error('Login error:', error);
    const isSessionConfigError = error.message?.includes('APP_SESSION_SECRET');
    return res.status(500).json({ error: isSessionConfigError ? 'Server session setup is incomplete. Add APP_SESSION_SECRET and restart the backend.' : 'Unable to sign in.' });
  }
});

router.get('/me', requireAuth, (req, res) => res.json({ user: req.user }));

router.patch('/me', requireAuth, async (req, res) => {
  const { name, age } = req.body;
  const parsedAge = Number.parseInt(age, 10);
  if (!name || !name.trim() || !Number.isInteger(parsedAge) || parsedAge < 5 || parsedAge > 120) {
    return res.status(400).json({ error: 'Enter a valid name and age.' });
  }
  try {
    const { data: user, error } = await supabaseAdmin.from('users')
      .update({ name: name.trim(), age: parsedAge })
      .eq('id', req.user.id)
      .select('id, name, age, created_at').single();
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ user });
  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({ error: 'Unable to update profile.' });
  }
});

router.post('/logout', (_req, res) => res.json({ message: 'Signed out.' }));

module.exports = router;
