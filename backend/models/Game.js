const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  oldPrice: {
    type: Number,
    required: false,
  },
  image: {
    type: String,
    required: true,
  },
  tag: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: false,
  }
}, { timestamps: true });

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;
