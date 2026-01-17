const mongoose = require('mongoose');

const pointsHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  points: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['earned', 'redeemed'],
    required: true
  },
  source: {
    type: String,
    enum: ['login', 'game_time', 'game_play', 'purchase', 'bonus', 'discount_redemption'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  metadata: {
    gameId: String,
    gameDuration: Number, // in minutes
    orderId: mongoose.Schema.Types.ObjectId,
    discountAmount: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
pointsHistorySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('PointsHistory', pointsHistorySchema);
