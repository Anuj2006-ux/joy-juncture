const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// Generate unique referral code
function generateReferralCode(name) {
    const prefix = name ? name.substring(0, 3).toUpperCase() : 'JOY';
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}${random}`;
}

async function generateReferralCodes() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/joyjuncture');
        console.log('Connected to MongoDB');
        
        // Find users without referral codes
        const users = await User.find({ 
            $or: [
                { referralCode: { $exists: false } },
                { referralCode: null },
                { referralCode: '' }
            ]
        });
        
        console.log('Users without referral codes:', users.length);
        
        let updated = 0;
        
        for (const user of users) {
            // Generate unique referral code
            let referralCode;
            let isUnique = false;
            
            while (!isUnique) {
                referralCode = generateReferralCode(user.name || user.email);
                const existing = await User.findOne({ referralCode });
                if (!existing) {
                    isUnique = true;
                }
            }
            
            user.referralCode = referralCode;
            user.referralCount = user.referralCount || 0;
            await user.save();
            
            updated++;
            console.log(`✅ Generated code for ${user.email}: ${referralCode}`);
        }
        
        console.log('\n========================================');
        console.log('Migration Complete!');
        console.log('Referral codes generated:', updated);
        console.log('========================================');
        
        // Show all users with their codes
        const allUsers = await User.find({}).select('email referralCode');
        console.log('\nAll User Referral Codes:');
        allUsers.forEach(u => {
            console.log(`  ${u.email}: ${u.referralCode}`);
        });
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

generateReferralCodes();
