const express = require('express');
const router = express.Router();
const User = require('../models/User');
const PointsHistory = require('../models/PointsHistory');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Points configuration
const POINTS_CONFIG = {
  SIGNUP_BONUS: 20,
  DAILY_GAME_BONUS: 10,
  REFERRAL_BONUS: 200,
  POINTS_TO_RUPEES: 1, // 1 point = ₹1 discount
  MAX_DISCOUNT_PERCENT: 50 // Max 50% discount
};

// GET /api/wallet - Get wallet details
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('points wallet gameActivity referralCode referralCount')
      .lean(); // Use lean() for faster read-only queries
    
    res.json({
      success: true,
      wallet: {
        currentPoints: user.points,
        totalEarned: user.wallet?.totalPointsEarned || 0,
        totalRedeemed: user.wallet?.totalPointsRedeemed || 0,
        totalTimeSpent: user.gameActivity?.totalTimeSpent || 0,
        referralCode: user.referralCode,
        referralCount: user.referralCount || 0
      },
      pointsConfig: POINTS_CONFIG
    });
  } catch (error) {
    console.error('Error fetching wallet:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wallet details'
    });
  }
});

// GET /api/wallet/history - Get points history
router.get('/history', isAuthenticated, async (req, res) => {
  try {
    const history = await PointsHistory.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean(); // Use lean() for faster read-only queries

    res.json({
      success: true,
      history
    });
  } catch (error) {
    console.error('Error fetching points history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch points history'
    });
  }
});

// POST /api/wallet/daily-game-bonus - Award daily game play points (10 points)
router.post('/daily-game-bonus', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastBonus = user.wallet?.lastDailyGamePoints;
    
    // Check if already claimed today
    if (lastBonus) {
      const lastBonusDate = new Date(lastBonus);
      lastBonusDate.setHours(0, 0, 0, 0);
      
      if (lastBonusDate.getTime() === today.getTime()) {
        return res.json({
          success: false,
          message: 'Daily game bonus already claimed today! Play again tomorrow.',
          alreadyClaimed: true
        });
      }
    }

    // Award daily game bonus (10 points)
    const dailyBonus = POINTS_CONFIG.DAILY_GAME_BONUS;
    user.points += dailyBonus;
    
    if (!user.wallet) {
      user.wallet = {
        balance: 0,
        lastLoginPoints: null,
        lastDailyGamePoints: new Date(),
        totalPointsEarned: 0,
        totalPointsRedeemed: 0
      };
    }
    
    user.wallet.lastDailyGamePoints = new Date();
    user.wallet.totalPointsEarned += dailyBonus;
    await user.save();

    // Record in history
    await PointsHistory.create({
      userId: user._id,
      points: dailyBonus,
      type: 'earned',
      source: 'game_play',
      description: 'Daily game play bonus - Thank you for playing!'
    });

    res.json({
      success: true,
      message: `🎮 You earned ${dailyBonus} points for playing today!`,
      pointsEarned: dailyBonus,
      currentPoints: user.points
    });
  } catch (error) {
    console.error('Error awarding daily game bonus:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to award daily game bonus'
    });
  }
});

// POST /api/wallet/game-activity - Track game activity
router.post('/game-activity', isAuthenticated, async (req, res) => {
  try {
    const { gameId, duration } = req.body; // duration in minutes
    
    if (!duration || duration <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid duration'
      });
    }

    const user = await User.findById(req.user._id);
    
    // Initialize gameActivity if not exists
    if (!user.gameActivity) {
      user.gameActivity = {
        totalTimeSpent: 0,
        lastActivityUpdate: new Date(),
        gamesPlayed: []
      };
    }
    
    user.gameActivity.totalTimeSpent += duration;
    user.gameActivity.lastActivityUpdate = new Date();
    
    // Update game-specific stats
    if (gameId) {
      const gameIndex = user.gameActivity.gamesPlayed.findIndex(g => g.gameId === gameId);
      if (gameIndex >= 0) {
        user.gameActivity.gamesPlayed[gameIndex].timePlayed += duration;
        user.gameActivity.gamesPlayed[gameIndex].lastPlayed = new Date();
      } else {
        user.gameActivity.gamesPlayed.push({
          gameId,
          timePlayed: duration,
          lastPlayed: new Date()
        });
      }
    }
    
    await user.save();

    res.json({
      success: true,
      message: 'Game activity recorded',
      totalTimeSpent: user.gameActivity.totalTimeSpent
    });
  } catch (error) {
    console.error('Error tracking game activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track game activity'
    });
  }
});

// GET /api/wallet/discount - Calculate available discount based on points
router.get('/discount', isAuthenticated, async (req, res) => {
  try {
    const { amount } = req.query;
    const user = await User.findById(req.user._id);
    
    const cartTotal = parseFloat(amount) || 0;
    const maxDiscountByPercent = Math.floor(cartTotal * (POINTS_CONFIG.MAX_DISCOUNT_PERCENT / 100));
    const maxDiscount = Math.min(user.points * POINTS_CONFIG.POINTS_TO_RUPEES, maxDiscountByPercent);
    const pointsNeeded = Math.min(user.points, maxDiscount);
    
    res.json({
      success: true,
      currentPoints: user.points,
      maxPointsUsable: pointsNeeded,
      discountAmount: pointsNeeded * POINTS_CONFIG.POINTS_TO_RUPEES,
      finalAmount: cartTotal - (pointsNeeded * POINTS_CONFIG.POINTS_TO_RUPEES),
      pointsConfig: POINTS_CONFIG
    });
  } catch (error) {
    console.error('Error calculating discount:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate discount'
    });
  }
});

// GET /api/wallet/referral-code - Get user's referral code
router.get('/referral-code', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Generate referral code if not exists
    if (!user.referralCode) {
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      user.referralCode = `JJ${user.username?.substring(0, 3).toUpperCase() || 'USR'}${random}`;
      await user.save();
    }
    
    res.json({
      success: true,
      referralCode: user.referralCode,
      referralCount: user.referralCount || 0,
      referralBonus: POINTS_CONFIG.REFERRAL_BONUS
    });
  } catch (error) {
    console.error('Error fetching referral code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch referral code'
    });
  }
});

module.exports = router;
