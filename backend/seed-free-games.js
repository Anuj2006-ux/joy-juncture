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
      title: 'Chess',
      description: 'Play the classic game of chess! Challenge your mind with strategic moves.',
      image: '/images/free_chess.png',
      gameUrl: '/games/game1/game1.html',
      rating: 4.8,
      isActive: true,
      order: 1
    },
    {
      title: 'Sudoku',
      description: 'Test your logic skills with this addictive number puzzle game!',
      image: '/images/free_sudoku.png',
      gameUrl: '/games/game2/game2.html',
      rating: 4.5,
      isActive: true,
      order: 2
    }
  ];

  try {
    // Check if games already exist
    const existingCount = await FreeGame.countDocuments();
    
    if (existingCount > 0) {
      console.log(`Found ${existingCount} existing free games. Skipping seed.`);
      console.log('To re-seed, delete existing games first.');
    } else {
      // Insert the free games
      await FreeGame.insertMany(freeGames);
      console.log('✅ Successfully added 2 free games (Chess & Sudoku) to the database!');
    }

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
