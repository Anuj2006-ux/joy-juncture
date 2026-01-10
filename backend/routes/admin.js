const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Game = require('../models/Game');
const { isAdmin } = require('../middleware/authMiddleware');

// Get Dashboard Stats
router.get('/stats', isAdmin, async (req, res) => {
  try {
    const userCount = await User.countDocuments({ role: 'user' });
    const gameCount = await Game.countDocuments();
    
    res.json({
      success: true,
      stats: {
        users: userCount,
        games: gameCount
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all games (for admin list)
router.get('/games', isAdmin, async (req, res) => {
  try {
    const games = await Game.find({});
    res.json({ success: true, games });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all users (for admin list)
router.get('/users', isAdmin, async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password');
    res.json({ success: true, users });
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add new game
router.post('/games', isAdmin, async (req, res) => {
  try {
    const { id, title, price, oldPrice, image, tag, description, category } = req.body;

    // Check if game ID exists
    const existingGame = await Game.findOne({ id });
    if (existingGame) {
      return res.status(400).json({ success: false, message: 'Game ID already exists' });
    }

    const newGame = new Game({
      id, // Admin should provide a unique ID like 'game-1' or slug
      title,
      price,
      oldPrice,
      image,
      tag,
      description, 
      category
    });

    await newGame.save();
    res.json({ success: true, game: newGame });
  } catch (error) {
    console.error('Add game error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update game
router.put('/games/:id', isAdmin, async (req, res) => {
  try {
    const { title, price, oldPrice, image, tag, description, category } = req.body;
    const gameId = req.params.id;

    // Find by custom 'id' field, not _id
    let game = await Game.findOne({ id: gameId });

    if (!game) {
      return res.status(404).json({ success: false, message: 'Game not found' });
    }

    game.title = title || game.title;
    game.price = price || game.price;
    game.oldPrice = oldPrice !== undefined ? oldPrice : game.oldPrice;
    game.image = image || game.image;
    game.tag = tag !== undefined ? tag : game.tag;
    game.description = description !== undefined ? description : game.description;
    game.category = category !== undefined ? category : game.category;

    await game.save();
    res.json({ success: true, game });
  } catch (error) {
    console.error('Update game error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete game
router.delete('/games/:id', isAdmin, async (req, res) => {
  try {
    const gameId = req.params.id;
    // Find by custom 'id' field
    const result = await Game.findOneAndDelete({ id: gameId });

    if (!result) {
      return res.status(404).json({ success: false, message: 'Game not found' });
    }

    res.json({ success: true, message: 'Game deleted successfully' });
  } catch (error) {
    console.error('Delete game error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Block/Unblock user
router.put('/users/:id/block', isAdmin, async (req, res) => {
  try {
    const { block, days } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isBlocked = block;
    
    if (block && days !== -1) {
      // Set block expiry date
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + days);
      user.blockExpiry = expiryDate;
    } else if (block && days === -1) {
      // Blocked forever
      user.blockExpiry = null;
    } else {
      // Unblocked
      user.blockExpiry = null;
    }

    await user.save();
    res.json({ success: true, message: block ? 'User blocked' : 'User unblocked' });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
