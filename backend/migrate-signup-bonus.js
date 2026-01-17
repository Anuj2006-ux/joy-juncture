const mongoose = require('mongoose');
const User = require('./models/User');
const PointsHistory = require('./models/PointsHistory');
require('dotenv').config();

async function awardSignupBonus() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/joyjuncture');
        console.log('Connected to MongoDB');
        
        // Find all users
        const users = await User.find({});
        console.log('Total users found:', users.length);
        
        let awarded = 0;
        let skipped = 0;
        
        for (const user of users) {
            // Check if user already has signup bonus in history
            const existingBonus = await PointsHistory.findOne({
                userId: user._id,
                source: 'bonus',
                description: { $regex: /signup|sign up|welcome/i }
            });
            
            if (!existingBonus) {
                // Initialize wallet if not exists
                if (!user.wallet) {
                    user.wallet = { points: 0, totalPointsEarned: 0, totalPointsRedeemed: 0 };
                }
                
                // Award 20 points
                user.wallet.points = (user.wallet.points || 0) + 20;
                user.wallet.totalPointsEarned = (user.wallet.totalPointsEarned || 0) + 20;
                await user.save();
                
                // Create history entry
                await PointsHistory.create({
                    userId: user._id,
                    points: 20,
                    type: 'earned',
                    source: 'bonus',
                    description: 'Sign up bonus (retroactive)'
                });
                
                awarded++;
                console.log('✅ Awarded 20 points to:', user.email);
            } else {
                skipped++;
                console.log('⏭️  Already has signup bonus:', user.email);
            }
        }
        
        console.log('\n========================================');
        console.log('Migration Complete!');
        console.log('Users awarded:', awarded);
        console.log('Users skipped (already had bonus):', skipped);
        console.log('========================================');
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

awardSignupBonus();
