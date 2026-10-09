const express = require('express');
const { supabaseAdmin } = require('../supabaseClient');
const { requireAuth } = require('../middleware/authMiddleware');
const router = express.Router();

// Register — just name and age, no password
router.post('/register', async (req, res) => {
  const { name, age } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }
  const parsedAge = parseInt(age);
  if (!age || isNaN(parsedAge) || parsedAge < 5 || parsedAge > 120) {
    return res.status(400).json({ error: 'Please enter a valid age (5–120)' });
  }

  try {
    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('name', name.trim())
      .eq('age', parsedAge)
      .maybeSingle();
      
    if (checkError) {
      console.error(checkError);
    }

    if (existingUser) {
      // User exists, just log them back in!
      return res.status(200).json({
        message: 'Welcome back!',
        user: existingUser,
        token: existingUser.id
      });
    }

    // New user, create them
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert([{ name: name.trim(), age: parsedAge }])
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    // The user's ID becomes their "token" — stored in localStorage on the client
    res.status(201).json({
      message: 'Welcome!',
      user: data,
      token: data.id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user profile (verifies token)
router.get('/me', requireAuth, (req, res) => {
  res.status(200).json({ user: req.user });
});

// Logout is handled client-side (just remove token from localStorage)
router.post('/logout', (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;
