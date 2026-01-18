const mongoose = require('mongoose');
const FreeGame = require('./models/FreeGame');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

const seedFreeGames = async () => {
  await connectDB();

  const freeGames = [
    {
      title: 'Memory Match',
      description: 'Match pairs of cards to test your memory! Find all matching pairs to win.',
      image: '/images/game_memory.svg',
      gameUrl: '/games/memory-match/index.html',
      rating: 4.8,
      isActive: true,
      order: 1
    },
    {
      title: 'Gem Sweeper',
      description: 'Find all the gems without hitting the bombs! A classic puzzle challenge.',
      image: '/images/game_sweeper.svg',
      gameUrl: '/games/gem-sweeper/index.html',
      rating: 4.7,
      isActive: true,
      order: 2
    },
    {
      title: 'Puzzle Slider',
      description: 'Slide the tiles to arrange numbers in order. How fast can you solve it?',
      image: '/images/game_puzzle.svg',
      gameUrl: '/games/puzzle-slider/index.html',
      rating: 4.6,
      isActive: true,
      order: 3
    },
    {
      title: 'Tic Tac Toe',
      description: 'The classic X and O game! Play against AI or challenge a friend.',
      image: '/images/game_tictactoe.svg',
      gameUrl: '/games/tic-tac-toe/index.html',
      rating: 4.5,
      isActive: true,
      order: 4
    },
    {
      title: 'Snake Game',
      description: 'Control the snake and eat food to grow! Avoid hitting walls and yourself.',
      image: '/images/game_snake.svg',
      gameUrl: '/games/snake-game/index.html',
      rating: 4.9,
      isActive: true,
      order: 5
    },
    {
      title: 'Color Rush',
      description: 'Test your brain! Match the COLOR of the word, not what it says.',
      image: '/images/game_colorush.svg',
      gameUrl: '/games/color-rush/index.html',
      rating: 4.7,
      isActive: true,
      order: 6
    }
  ];

  try {
    // Delete existing games and insert new ones
    await FreeGame.deleteMany({});
    console.log('Cleared existing free games.');
    
    // Insert the free games
    await FreeGame.insertMany(freeGames);
    console.log('✅ Successfully added 6 free games to the database!');

    // Show current games
    const allGames = await FreeGame.find({});
    console.log('\nCurrent Free Games in Database:');
    allGames.forEach((game, index) => {
      console.log(`${index + 1}. ${game.title} - ${game.isActive ? 'Active' : 'Inactive'}`);
    });

  } catch (error) {
    console.error('Error seeding free games:', error);
  } finally {
    mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
};

seedFreeGames();
