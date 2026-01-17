const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Game = require('../models/Game');
const Order = require('../models/Order');
const PointsHistory = require('../models/PointsHistory');
const FreeGame = require('../models/FreeGame');
const { isAdmin } = require('../middleware/authMiddleware');

// Get Dashboard Stats
router.get('/stats', isAdmin, async (req, res) => {
  try {
    const userCount = await User.countDocuments({ role: 'user' });
    const gameCount = await Game.countDocuments();
    const orderCount = await Order.countDocuments();
    
    // Calculate total revenue
    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$finalAmount' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Calculate total points in circulation (using correct field name: wallet.balance)
    const pointsResult = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$wallet.balance' } } }
    ]);
    const totalPoints = pointsResult[0]?.total || 0;

    // Recent orders count (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentOrders = await Order.countDocuments({ createdAt: { $gte: weekAgo } });

    res.json({
      success: true,
      stats: {
        users: userCount,
        games: gameCount,
        orders: orderCount,
        totalRevenue,
        totalPoints,
        recentOrders
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

// Get all users (for admin list) - with wallet info
router.get('/users', isAdmin, async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password').lean();
    res.json({ success: true, users });
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get single user details with full info
router.get('/users/:id', isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password').lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get user's orders
    const orders = await Order.find({ userId: req.params.id }).sort({ createdAt: -1 }).lean();

    // Get user's points history
    const pointsHistory = await PointsHistory.find({ userId: req.params.id }).sort({ createdAt: -1 }).lean();

    res.json({ 
      success: true, 
      user,
      orders,
      pointsHistory
    });
  } catch (error) {
    console.error('Fetch user details error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update user points (add or deduct)
router.put('/users/:id/points', isAdmin, async (req, res) => {
  try {
    const { points, type, description } = req.body; // type: 'add' or 'deduct'
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Initialize wallet if not exists
    if (!user.wallet) {
      user.wallet = { currentPoints: 0, totalEarned: 0, totalRedeemed: 0 };
    }

    if (type === 'add') {
      user.wallet.currentPoints += points;
      user.wallet.totalEarned += points;

      // Create points history entry
      await PointsHistory.create({
        userId: user._id,
        points: points,
        type: 'earned',
        source: 'bonus',
        description: description || `Admin added ${points} points`
      });
    } else if (type === 'deduct') {
      if (user.wallet.currentPoints < points) {
        return res.status(400).json({ success: false, message: 'User has insufficient points' });
      }
      user.wallet.currentPoints -= points;
      user.wallet.totalRedeemed += points;

      // Create points history entry
      await PointsHistory.create({
        userId: user._id,
        points: -points,
        type: 'redeemed',
        source: 'bonus',
        description: description || `Admin deducted ${points} points`
      });
    }

    await user.save();
    res.json({ success: true, message: `Points ${type === 'add' ? 'added' : 'deducted'} successfully`, wallet: user.wallet });
  } catch (error) {
    console.error('Update points error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all orders
router.get('/orders', isAdmin, async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('userId', 'name email username')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Fetch orders error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update order status
router.put('/orders/:id/status', isAdmin, async (req, res) => {
  try {
    const { orderStatus, paymentStatus, trackingNumber } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (trackingNumber) order.trackingNumber = trackingNumber;

    await order.save();
    res.json({ success: true, message: 'Order updated successfully', order });
  } catch (error) {
    console.error('Update order error:', error);
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

// ==================== FREE GAMES ROUTES ====================

// Get all free games
router.get('/free-games', isAdmin, async (req, res) => {
  try {
    const freeGames = await FreeGame.find({}).sort({ order: 1 });
    res.json({ success: true, freeGames });
  } catch (error) {
    console.error('Fetch free games error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add new free game
router.post('/free-games', isAdmin, async (req, res) => {
  try {
    const { title, description, image, gameUrl, rating, isActive, order } = req.body;
    
    const newGame = new FreeGame({
      title,
      description,
      image,
      gameUrl,
      rating: rating || 4.5,
      isActive: isActive !== false,
      order: order || 0
    });

    await newGame.save();
    res.json({ success: true, message: 'Free game added successfully', freeGame: newGame });
  } catch (error) {
    console.error('Add free game error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update free game
router.put('/free-games/:id', isAdmin, async (req, res) => {
  try {
    const { title, description, image, gameUrl, rating, isActive, order } = req.body;
    
    const game = await FreeGame.findByIdAndUpdate(
      req.params.id,
      { title, description, image, gameUrl, rating, isActive, order },
      { new: true }
    );

    if (!game) {
      return res.status(404).json({ success: false, message: 'Free game not found' });
    }

    res.json({ success: true, message: 'Free game updated successfully', freeGame: game });
  } catch (error) {
    console.error('Update free game error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete free game
router.delete('/free-games/:id', isAdmin, async (req, res) => {
  try {
    const game = await FreeGame.findByIdAndDelete(req.params.id);
    
    if (!game) {
      return res.status(404).json({ success: false, message: 'Free game not found' });
    }

    res.json({ success: true, message: 'Free game deleted successfully' });
  } catch (error) {
    console.error('Delete free game error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
