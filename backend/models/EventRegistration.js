const mongoose = require('mongoose');

const eventRegistrationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventId: {
    type: String,
    required: true
  },
  eventTitle: {
    type: String,
    required: true
  },
  eventDate: {
    type: String,
    required: true
  },
  eventTime: {
    type: String,
    required: true
  },
  eventLocation: {
    type: String,
    required: true
  },
  eventImage: {
    type: String,
    required: false
  },
  eventPrice: {
    type: Number,
    required: true
  },
  pointsEarned: {
    type: Number,
    default: 0
  },
  attendeeName: {
    type: String,
    required: true
  },
  attendeePhone: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['registered', 'attended', 'cancelled'],
    default: 'registered'
  },
  registeredAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
eventRegistrationSchema.index({ userId: 1, eventId: 1 });
eventRegistrationSchema.index({ userId: 1 });

module.exports = mongoose.model('EventRegistration', eventRegistrationSchema);
