const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { sendOTPEmail } = require('../config/email');

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @route   POST /api/auth/register
// @desc    Send OTP for registration (Step 1)
// @access  Public
router.post(
  '/register',
  [
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { username, email, password } = req.body;

      // Check if user already exists
      let existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser && existingUser.isVerified) {
        return res.status(400).json({
          success: false,
          message: 'User with this email or username already exists',
        });
      }

      // Generate OTP
      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      if (existingUser && !existingUser.isVerified) {
        // Update existing unverified user
        existingUser.username = username;
        existingUser.password = password;
        existingUser.otp = otp;
        existingUser.otpExpiry = otpExpiry;
        await existingUser.save();
      } else {
        // Create new unverified user
        const user = new User({
          username,
          email,
          password,
          otp,
          otpExpiry,
          isVerified: false,
        });
        await user.save();
      }

      // Send OTP email
      await sendOTPEmail(email, otp);

      // Create temp token for verification
      const tempToken = jwt.sign(
        { email, isTemp: true },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      res.status(200).json({
        success: true,
        message: 'OTP sent to your email. Please verify to complete registration.',
        tempToken,
        requiresOTP: true,
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ success: false, message: 'Server error during registration' });
    }
  }
);

// @route   POST /api/auth/verify-register-otp
// @desc    Verify OTP and complete registration (Step 2)
// @access  Public
router.post(
  '/verify-register-otp',
  [
    body('otp').trim().isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
    body('tempToken').notEmpty().withMessage('Token is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { otp, tempToken } = req.body;

      // Verify temp token
      let decoded;
      try {
        decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
        if (!decoded.isTemp) {
          return res.status(401).json({ success: false, message: 'Invalid token' });
        }
      } catch (err) {
        return res.status(401).json({ success: false, message: 'Token expired. Please register again.' });
      }

      // Find user by email
      const user = await User.findOne({ email: decoded.email });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found. Please register again.' });
      }

      // Check if already verified
      if (user.isVerified) {
        return res.status(400).json({ success: false, message: 'Email already verified. Please login.' });
      }

      // Check OTP expiry
      if (!user.otpExpiry || new Date() > user.otpExpiry) {
        return res.status(401).json({ success: false, message: 'OTP expired. Please register again.' });
      }

      // Verify OTP
      if (user.otp !== otp) {
        return res.status(401).json({ success: false, message: 'Invalid OTP. Please try again.' });
      }

      // Mark user as verified and clear OTP
      user.isVerified = true;
      user.otp = undefined;
      user.otpExpiry = undefined;
      await user.save();

      // Create JWT token
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
      });

      res.status(201).json({
        success: true,
        message: 'Registration successful! Welcome to Joy Juncture.',
        token,
        user: {
          id: user._id,
          username: user.username,
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture || null,
        },
      });
    } catch (error) {
      console.error('Verify registration OTP error:', error);
      res.status(500).json({ success: false, message: 'Server error during verification' });
    }
  }
);

// @route   POST /api/auth/resend-register-otp
// @desc    Resend OTP for registration
// @access  Public
router.post('/resend-register-otp', async (req, res) => {
  try {
    const { tempToken } = req.body;

    // Verify temp token
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Session expired. Please register again.' });
    }

    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found. Please register again.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Email already verified. Please login.' });
    }

    // Generate new OTP
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // Send OTP email
    await sendOTPEmail(user.email, otp);

    // Generate new temp token
    const newTempToken = jwt.sign(
      { email: user.email, isTemp: true },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({
      success: true,
      message: 'OTP resent to your email',
      tempToken: newTempToken,
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ success: false, message: 'Failed to resend OTP' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user with username and password (direct login without OTP)
// @access  Public
router.post(
  '/login',
  [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { username, password } = req.body;

      console.log('Login attempt for:', username);

      // Find user by username, name, or email (case-sensitive)
      const user = await User.findOne({
        $or: [
          { username }, 
          { name: username },
          { email: username }
        ],
      });

      console.log('User found:', user ? 'Yes' : 'No');
      if (user) {
        console.log('User details:', { name: user.name, email: user.email });
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found. Please check your username or register.',
        });
      }

      // Check if user has a password field
      if (!user.password) {
        return res.status(401).json({
          success: false,
          message: 'Password not set for this user. Please contact admin.',
        });
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      console.log('Password valid:', isPasswordValid);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Incorrect password. Please try again.',
        });
      }

      // Direct login - create JWT token
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
      });

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          username: user.username,
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture || null,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, message: 'Server error during login' });
    }
  }
);

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and complete login
// @access  Public
router.post(
  '/verify-otp',
  [
    body('otp').trim().isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
    body('tempToken').notEmpty().withMessage('Temporary token is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { otp, tempToken } = req.body;

      // Verify temp token
      let decoded;
      try {
        decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
        if (!decoded.isTemp) {
          return res.status(401).json({ success: false, message: 'Invalid token' });
        }
      } catch (err) {
        return res.status(401).json({ success: false, message: 'Token expired or invalid' });
      }

      // Find user
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // Check if OTP expired
      if (!user.otpExpiry || new Date() > user.otpExpiry) {
        return res.status(401).json({ success: false, message: 'OTP expired. Please login again.' });
      }

      // Verify OTP
      if (user.otp !== otp) {
        return res.status(401).json({ success: false, message: 'Invalid OTP. Please try again.' });
      }

      // Clear OTP and mark as verified
      user.otp = undefined;
      user.otpExpiry = undefined;
      user.isVerified = true;
      await user.save();

      // Create full authentication token
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
      });

      res.json({
        success: true,
        message: 'Login successful! Welcome to Joy Juncture.',
        token,
        user: {
          id: user._id,
          name: user.name || user.username,
          username: user.username || user.name,
          email: user.email,
          role: user.role,
          points: user.points,
          profilePicture: user.profilePicture || null,
        },
      });
    } catch (error) {
      console.error('OTP verification error:', error);
      res.status(500).json({ success: false, message: 'Server error during OTP verification' });
    }
  }
);

// @route   POST /api/auth/resend-otp
// @desc    Resend OTP
// @access  Public
router.post(
  '/resend-otp',
  [body('tempToken').notEmpty().withMessage('Temporary token is required')],
  async (req, res) => {
    try {
      const { tempToken } = req.body;

      // Verify temp token
      let decoded;
      try {
        decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
      } catch (err) {
        return res.status(401).json({ success: false, message: 'Token expired. Please login again.' });
      }

      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // Generate new OTP
      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

      user.otp = otp;
      user.otpExpiry = otpExpiry;
      await user.save();

      // Send OTP via email
      const emailSent = await sendOTPEmail(user.email, otp, user.name || user.username);

      if (!emailSent) {
        return res.status(500).json({ success: false, message: 'Failed to send OTP' });
      }

      res.json({
        success: true,
        message: 'OTP resent successfully',
      });
    } catch (error) {
      console.error('Resend OTP error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// @route   POST /api/auth/login-with-otp
// @desc    Send OTP without password verification
// @access  Public
router.post(
  '/login-with-otp',
  [body('username').trim().notEmpty().withMessage('Username is required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { username } = req.body;

      console.log('OTP login attempt for:', username);

      // Find user by username, name, or email (case-sensitive)
      const user = await User.findOne({
        $or: [
          { username }, 
          { name: username },
          { email: username }
        ],
      });

      console.log('User found:', user ? 'Yes' : 'No');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found. Please check your username.',
        });
      }

      // Generate and send OTP
      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Update user with OTP
      user.otp = otp;
      user.otpExpiry = otpExpiry;
      user.isVerified = false;
      await user.save();

      // Send OTP via email
      const emailSent = await sendOTPEmail(user.email, otp, user.name || user.username);

      if (!emailSent) {
        return res.status(500).json({
          success: false,
          message: 'Failed to send OTP. Please try again.',
        });
      }

      // Create temporary token
      const tempToken = jwt.sign({ userId: user._id, isTemp: true }, process.env.JWT_SECRET, {
        expiresIn: '15m',
      });

      res.json({
        success: true,
        message: 'OTP sent to your email',
        requiresOTP: true,
        tempToken,
        email: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // Masked email
      });
    } catch (error) {
      console.error('OTP login error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// @route   POST /api/auth/forgot-password
// @desc    Send OTP for password reset
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address',
      });
    }

    // Generate OTP
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();

    // Send OTP email
    const emailSent = await sendOTPEmail(user.email, otp);
    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again.',
      });
    }

    // Create temporary token
    const tempToken = jwt.sign({ userId: user._id, isTemp: true }, process.env.JWT_SECRET, {
      expiresIn: '15m',
    });

    res.json({
      success: true,
      message: 'OTP sent to your email',
      tempToken,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with OTP
// @access  Public
router.post('/reset-password', async (req, res) => {
  try {
    const { otp, tempToken, newPassword } = req.body;

    // Verify temp token
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
      if (!decoded.isTemp) {
        return res.status(400).json({ success: false, message: 'Invalid token' });
      }
    } catch (err) {
      return res.status(400).json({ success: false, message: 'Token expired or invalid' });
    }

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify OTP
    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    if (!user.otpExpiry || Date.now() > user.otpExpiry) {
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    // Update password
    user.password = newPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Auth middleware for protected routes
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name || user.username,
        username: user.username,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture || null,
        points: user.points || 0,
        createdAt: user.createdAt,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/auth/profile/update-picture
// @desc    Update profile picture (base64)
// @access  Private
router.put('/profile/update-picture', authMiddleware, async (req, res) => {
  try {
    const { profilePicture } = req.body;
    
    const user = req.user;
    user.profilePicture = profilePicture || null;
    await user.save();
    
    res.json({
      success: true,
      message: 'Profile picture updated successfully',
      profilePicture: user.profilePicture
    });
  } catch (error) {
    console.error('Update profile picture error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/auth/profile/update-name
// @desc    Update user name
// @access  Private
router.put('/profile/update-name', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Name must be at least 2 characters' });
    }
    
    const user = req.user;
    user.name = name.trim();
    user.username = name.trim();
    await user.save();
    
    res.json({
      success: true,
      message: 'Name updated successfully',
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Update name error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/auth/profile/send-password-otp
// @desc    Send OTP for password reset (logged in user)
// @access  Private
router.post('/profile/send-password-otp', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const otp = generateOTP();
    
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();
    
    // Send OTP email
    await sendOTPEmail(user.email, otp);
    
    res.json({
      success: true,
      message: 'OTP sent to your registered email'
    });
  } catch (error) {
    console.error('Send password OTP error:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
});

// @route   POST /api/auth/profile/verify-password-otp
// @desc    Verify OTP and change password (logged in user)
// @access  Private
router.post('/profile/verify-password-otp', authMiddleware, async (req, res) => {
  try {
    const { otp, newPassword } = req.body;
    const user = req.user;
    
    if (!otp || otp.length !== 6) {
      return res.status(400).json({ success: false, message: 'Invalid OTP format' });
    }
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }
    
    // Check OTP
    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
    
    // Check if OTP expired
    if (!user.otpExpiry || new Date() > user.otpExpiry) {
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }
    
    // Update password
    user.password = newPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Verify password OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/auth/profile/send-delete-otp
// @desc    Send OTP for account deletion
// @access  Private
router.post('/profile/send-delete-otp', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const otp = generateOTP();
    
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();
    
    // Send OTP email
    await sendOTPEmail(user.email, otp);
    
    res.json({
      success: true,
      message: 'OTP sent to your registered email for account deletion verification'
    });
  } catch (error) {
    console.error('Send delete OTP error:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
});

// @route   POST /api/auth/profile/delete-account
// @desc    Verify OTP and delete user account
// @access  Private
router.post('/profile/delete-account', authMiddleware, async (req, res) => {
  try {
    const { otp } = req.body;
    const user = req.user;
    
    if (!otp || otp.length !== 6) {
      return res.status(400).json({ success: false, message: 'Invalid OTP format' });
    }
    
    // Check OTP
    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
    
    // Check if OTP expired
    if (!user.otpExpiry || new Date() > user.otpExpiry) {
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }
    
    // Delete the user from database
    await User.findByIdAndDelete(user._id);
    
    res.json({
      success: true,
      message: 'Your account has been deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ success: false, message: 'Server error during account deletion' });
  }
});

// @route   GET /api/auth/google
// @desc    Initiate Google OAuth
// @access  Public
router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: 'http://localhost:3000/login?error=auth_failed' }),
  (req, res) => {
    try {
      // Generate JWT token for the authenticated user
      const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
      });

      // Redirect to frontend with token
      res.redirect(`http://localhost:3000/login?token=${token}&user=${encodeURIComponent(JSON.stringify({
        id: req.user._id,
        username: req.user.username,
        email: req.user.email
      }))}`);
    } catch (error) {
      console.error('Google callback error:', error);
      res.redirect('http://localhost:3000/login?error=auth_failed');
    }
  }
);

module.exports = router;
