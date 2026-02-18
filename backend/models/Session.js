const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  loginTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  logoutTime: {
    type: Date
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
});

module.exports = mongoose.model('Session', sessionSchema);
