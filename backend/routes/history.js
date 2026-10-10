const express = require('express');
const { supabaseAdmin } = require('../supabaseClient');
const { requireAuth } = require('../middleware/authMiddleware');
const router = express.Router();

// Apply auth middleware to all history routes
router.use(requireAuth);

// Get all history for the logged-in user
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_activity')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    res.status(200).json({ history: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a new activity history item
router.post('/', async (req, res) => {
  const { activity_type, details } = req.body;

  if (!activity_type) {
    return res.status(400).json({ error: 'activity_type is required' });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('user_activity')
      .insert([{
        user_id: req.user.id,
        activity_type,
        details: details || {}
      }])
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ message: 'Activity recorded', activity: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a specific history item
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Delete where id matches AND user_id matches the logged-in user (extra security)
    const { data, error } = await supabaseAdmin
      .from('user_activity')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select();

    if (error) return res.status(400).json({ error: error.message });
    
    if (data.length === 0) {
      return res.status(404).json({ error: 'Activity not found or unauthorized' });
    }

    res.status(200).json({ message: 'Activity deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Clear all history for the logged-in user
router.delete('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_activity')
      .delete()
      .eq('user_id', req.user.id);

    if (error) return res.status(400).json({ error: error.message });
    res.status(200).json({ message: 'All history cleared successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
