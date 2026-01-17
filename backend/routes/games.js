const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const FreeGame = require('../models/FreeGame');

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

// @route   GET /api/games/free
// @desc    Get all active free games (Public)
// @access  Public
router.get('/free', async (req, res) => {
  try {
    const freeGames = await FreeGame.find({ isActive: true }).sort({ order: 1 });
    res.json({ success: true, freeGames });
  } catch (error) {
    console.error('Fetch free games error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
