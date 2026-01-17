const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const Cart = require('../models/Cart');
const PointsHistory = require('../models/PointsHistory');
const { isAuthenticated } = require('../middleware/authMiddleware');

// GET /api/orders - Get all orders for logged-in user
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean(); // Use lean() for faster read-only queries
    
    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
});

// GET /api/orders/:orderId - Get specific order details
router.get('/:orderId', isAuthenticated, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      userId: req.user._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order details'
    });
  }
});

// POST /api/orders - Create new order
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, pointsUsed = 0 } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No items in order'
      });
    }

    // Calculate totals
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Calculate discount from points (1 point = ₹1 discount)
    const user = await User.findById(req.user._id);
    const maxPointsToUse = Math.min(pointsUsed, user.points, Math.floor(totalAmount * 0.5)); // Max 50% discount
    const discount = maxPointsToUse;
    const finalAmount = totalAmount - discount;

    // Calculate points earned (1% of final amount)
    const pointsEarned = Math.floor(finalAmount * 0.01);

    // Create order
    const order = new Order({
      userId: req.user._id,
      items,
      totalAmount,
      discount,
      pointsUsed: maxPointsToUse,
      finalAmount,
      paymentMethod,
      shippingAddress,
      pointsEarned,
      paymentStatus: 'completed', // In real app, this would be 'pending' until payment
      orderStatus: 'processing'
    });

    await order.save();

    // Update user points
    if (maxPointsToUse > 0) {
      user.points -= maxPointsToUse;
      user.wallet.totalPointsRedeemed += maxPointsToUse;
      
      // Record points redemption
      await PointsHistory.create({
        userId: user._id,
        points: -maxPointsToUse,
        type: 'redeemed',
        source: 'discount_redemption',
        description: `Redeemed ${maxPointsToUse} points for ₹${discount} discount`,
        metadata: {
          orderId: order._id,
          discountAmount: discount
        }
      });
    }

    // Award points for purchase
    user.points += pointsEarned;
    user.wallet.totalPointsEarned += pointsEarned;
    await user.save();

    // Record points earned
    await PointsHistory.create({
      userId: user._id,
      points: pointsEarned,
      type: 'earned',
      source: 'purchase',
      description: `Earned ${pointsEarned} points from order ${order.orderNumber}`,
      metadata: {
        orderId: order._id
      }
    });

    // Clear user's cart
    await Cart.findOneAndUpdate(
      { userId: req.user._id },
      { $set: { items: [] } }
    );

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order,
      pointsEarned
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order: ' + error.message
    });
  }
});

module.exports = router;
