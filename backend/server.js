const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const connectDB = require('./config/db');

// Load environment variables FIRST
dotenv.config();

// Now load passport (which needs env vars)
const passport = require('./config/passport');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
// Allow multiple origins for CORS (localhost + production Vercel domains)
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:58606',
  'https://joy-juncture-seven.vercel.app',
  'https://joy-juncture.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, true); // Allow all for now to debug, change to callback(new Error('Not allowed by CORS')) in production
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/games', require('./routes/games'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/address', require('./routes/address'));
app.use('/api/events', require('./routes/events'));

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'Joy Juncture API is running!' });
});

// Keep-alive health check endpoint (for cron jobs to prevent cold starts)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
