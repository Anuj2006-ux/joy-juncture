const express = require('express');
const router = express.Router();
const Game = require('../models/Game');

// @route   GET /api/games
// @desc    Get all games (Public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const games = await Game.find({});
    res.json({ success: true, games });
  } catch (error) {
    console.error('Fetch games error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
