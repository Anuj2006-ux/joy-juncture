const express = require('express');
const router = express.Router();
const EventRegistration = require('../models/EventRegistration');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Register for an event
router.post('/register', isAuthenticated, async (req, res) => {
  try {
    const { eventId, eventTitle, eventDate, eventTime, eventLocation, eventImage, eventPrice, pointsEarned, attendeeName, attendeePhone } = req.body;
    
    // Check if user is already registered for this event
    const existingRegistration = await EventRegistration.findOne({
      userId: req.user._id,
      eventId: eventId
    });

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event'
      });
    }

    // Create new registration
    const registration = new EventRegistration({
      userId: req.user._id,
      eventId,
      eventTitle,
      eventDate,
      eventTime,
      eventLocation,
      eventImage,
      eventPrice,
      pointsEarned,
      attendeeName,
      attendeePhone
    });

    await registration.save();

    res.status(201).json({
      success: true,
      message: 'Successfully registered for the event',
      data: registration
    });
  } catch (error) {
    console.error('Event registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register for event',
      error: error.message
    });
  }
});

// Get all registrations for logged-in user
router.get('/my-registrations', isAuthenticated, async (req, res) => {
  try {
    const registrations = await EventRegistration.find({ userId: req.user._id })
      .sort({ registeredAt: -1 });

    res.json({
      success: true,
      count: registrations.length,
      data: registrations
    });
  } catch (error) {
    console.error('Get registrations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch registrations',
      error: error.message
    });
  }
});

// Check if user is registered for a specific event
router.get('/check/:eventId', isAuthenticated, async (req, res) => {
  try {
    const registration = await EventRegistration.findOne({
      userId: req.user._id,
      eventId: req.params.eventId
    });

    res.json({
      success: true,
      isRegistered: !!registration,
      data: registration
    });
  } catch (error) {
    console.error('Check registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check registration status',
      error: error.message
    });
  }
});

// Cancel registration
router.put('/cancel/:registrationId', isAuthenticated, async (req, res) => {
  try {
    const registration = await EventRegistration.findOne({
      _id: req.params.registrationId,
      userId: req.user._id
    });

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    registration.status = 'cancelled';
    await registration.save();

    res.json({
      success: true,
      message: 'Registration cancelled successfully',
      data: registration
    });
  } catch (error) {
    console.error('Cancel registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel registration',
      error: error.message
    });
  }
});

module.exports = router;
