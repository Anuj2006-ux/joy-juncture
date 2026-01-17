const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const User = require('../models/User');

// Middleware to verify token (optional - allows both logged in and guest users)
const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      req.userId = decoded.userId;
    } catch (error) {
      // Token invalid, treat as guest
      req.userId = null;
    }
  }
  next();
};

// GET user's cart
router.get('/', optionalAuth, async (req, res) => {
  try {
    if (!req.userId) {
      return res.json({ success: true, cart: null, message: 'Guest user' });
    }

    let cart = await Cart.findOne({ userId: req.userId }).lean();
    
    if (!cart) {
      cart = await Cart.create({ userId: req.userId, items: [] });
      cart = cart.toObject(); // Convert to plain object after create
    }

    res.json({ success: true, cart });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ADD item to cart
router.post('/add', optionalAuth, async (req, res) => {
  try {
    const { gameId, title, price, oldPrice, image, tag } = req.body;

    if (!req.userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Please login to save cart items',
        requiresLogin: true 
      });
    }

    let cart = await Cart.findOne({ userId: req.userId });

    if (!cart) {
      cart = await Cart.create({
        userId: req.userId,
        items: [{ gameId, title, price, oldPrice, image, tag, quantity: 1 }]
      });
    } else {
      const existingItem = cart.items.find(item => item.gameId === gameId);
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.items.push({ gameId, title, price, oldPrice, image, tag, quantity: 1 });
      }
      
      await cart.save();
    }

    res.json({ success: true, cart, message: 'Item added to cart' });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// UPDATE item quantity
router.put('/update/:gameId', optionalAuth, async (req, res) => {
  try {
    const { gameId } = req.params;
    const { quantity } = req.body;

    if (!req.userId) {
      return res.status(401).json({ success: false, message: 'Login required' });
    }

    const cart = await Cart.findOne({ userId: req.userId });
    
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const item = cart.items.find(item => item.gameId === gameId);
    
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter(item => item.gameId !== gameId);
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    res.json({ success: true, cart, message: 'Cart updated' });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// REMOVE item from cart
router.delete('/remove/:gameId', optionalAuth, async (req, res) => {
  try {
    const { gameId } = req.params;

    if (!req.userId) {
      return res.status(401).json({ success: false, message: 'Login required' });
    }

    const cart = await Cart.findOne({ userId: req.userId });
    
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item.gameId !== gameId);
    await cart.save();

    res.json({ success: true, cart, message: 'Item removed from cart' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// CLEAR cart
router.delete('/clear', optionalAuth, async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: 'Login required' });
    }

    const cart = await Cart.findOne({ userId: req.userId });
    
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = [];
    await cart.save();

    res.json({ success: true, cart, message: 'Cart cleared' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
