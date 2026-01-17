const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
    trim: true,
  },
  username: {
    type: String,
    required: false,
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  profilePicture: {
    type: String,
    required: false,
    default: null,
  },
  googleId: {
    type: String,
    required: false,
  },
  role: {
    type: String,
    default: 'user',
  },
  points: {
    type: Number,
    default: 0,
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  referralCount: {
    type: Number,
    default: 0
  },
  wallet: {
    balance: {
      type: Number,
      default: 0
    },
    lastLoginPoints: {
      type: Date,
      default: null
    },
    lastDailyGamePoints: {
      type: Date,
      default: null
    },
    totalPointsEarned: {
      type: Number,
      default: 0
    },
    totalPointsRedeemed: {
      type: Number,
      default: 0
    }
  },
  gameActivity: {
    totalTimeSpent: {
      type: Number,
      default: 0 // in minutes
    },
    lastActivityUpdate: {
      type: Date,
      default: null
    },
    gamesPlayed: [{
      gameId: String,
      timePlayed: Number, // in minutes
      lastPlayed: Date
    }]
  },
  otp: {
    type: String,
    required: false,
  },
  otpExpiry: {
    type: Date,
    required: false,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  blockExpiry: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { strict: false });

// Hash password before saving (only for new registrations)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords (handles both plain text and hashed)
userSchema.methods.comparePassword = async function (candidatePassword) {
  // Check if password is already hashed (starts with $2a$ or $2b$)
  if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
    return await bcrypt.compare(candidatePassword, this.password);
  } else {
    // Plain text comparison for existing users
    return candidatePassword === this.password;
  }
};

// Add indexes for faster queries
userSchema.index({ email: 1 });
userSchema.index({ referralCode: 1 });

module.exports = mongoose.model('User', userSchema);
