/**
 * Session Model
 * 
 * Defines the schema for tracking user login sessions in the NOC FAQs system.
 * Records login/logout times, duration, IP address, and user agent for auditing.
 * 
 * @schema Session
 * @property {ObjectId} user - Reference to the User
 * @property {Date} loginTime - When the user logged in
 * @property {Date} logoutTime - When the user logged out (null if still active)
 * @property {number} duration - Session duration in minutes
 * @property {string} ipAddress - IP address of the user
 * @property {string} userAgent - Browser/client information
 */

// Import required modules
const mongoose = require('mongoose');

// Define the session schema structure
const sessionSchema = new mongoose.Schema({
  // Reference to the user who started this session
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
    index: true
  },
  
  // Login timestamp
  loginTime: {
    type: Date,
    required: [true, 'Login time is required'],
    default: Date.now
  },
  
  // Logout timestamp (will be null for active sessions)
  logoutTime: {
    type: Date,
    default: null
  },
  
  // Session duration in minutes
  // Calculated as: (logoutTime - loginTime) / 60000
  duration: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // IP address from which the user connected
  // Captured for security auditing
  ipAddress: {
    type: String,
    default: ''
  },
  
  // User agent string identifying the browser/client
  // Useful for debugging and security monitoring
  userAgent: {
    type: String,
    default: ''
  }
});

// ============================================================================
// INDEXES
// ============================================================================

// Index for efficient session lookups
sessionSchema.index({ user: 1, loginTime: -1 });
sessionSchema.index({ loginTime: -1 });
sessionSchema.index({ logoutTime: 1 }); // For finding active sessions

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Calculate duration before saving if logoutTime exists
sessionSchema.pre('save', function(next) {
  if (this.logoutTime && this.loginTime) {
    // Calculate duration in minutes
    this.duration = Math.round((this.logoutTime - this.loginTime) / 60000);
  }
  next();
});

// ============================================================================
// INSTANCE METHODS
// ============================================================================

/**
 * End the session (set logout time)
 * @returns {Promise<Session>}
 */
sessionSchema.methods.endSession = async function() {
  this.logoutTime = new Date();
  this.duration = Math.round((this.logoutTime - this.loginTime) / 60000);
  return this.save();
};

/**
 * Get session duration in human-readable format
 * @returns {string}
 */
sessionSchema.methods.getFormattedDuration = function() {
  if (this.duration === 0 && !this.logoutTime) {
    return 'Active';
  }
  
  const hours = Math.floor(this.duration / 60);
  const minutes = this.duration % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

// ============================================================================
// STATIC METHODS
// ============================================================================

/**
 * Find active session for a user
 * @param {ObjectId} userId - The user's ID
 * @returns {Promise<Session|null>}
 */
sessionSchema.statics.findActiveSession = function(userId) {
  return this.findOne({
    user: userId,
    logoutTime: null
  }).sort({ loginTime: -1 });
};

/**
 * Get sessions for a user within a date range
 * @param {ObjectId} userId - The user's ID
 * @param {Date} startDate - Start of date range
 * @param {Date} endDate - End of date range
 * @returns {Promise<Session[]>}
 */
sessionSchema.statics.getUserSessionsInRange = function(userId, startDate, endDate) {
  return this.find({
    user: userId,
    loginTime: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ loginTime: -1 });
};

/**
 * Get statistics for sessions in a date range
 * @param {Date} startDate - Start of date range
 * @param {Date} endDate - End of date range
 * @returns {Promise<Object>}
 */
sessionSchema.statics.getSessionStats = async function(startDate, endDate) {
  const matchStage = {};
  
  if (startDate || endDate) {
    matchStage.loginTime = {};
    if (startDate) matchStage.loginTime.$gte = startDate;
    if (endDate) matchStage.loginTime.$lte = endDate;
  }
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        totalDuration: { $sum: '$duration' },
        uniqueUsers: { $addToSet: '$user' }
      }
    }
  ]);
  
  if (stats.length === 0) {
    return {
      totalSessions: 0,
      totalDuration: 0,
      uniqueUsers: 0,
      averageDuration: 0
    };
  }
  
  const result = stats[0];
  return {
    totalSessions: result.totalSessions,
    totalDuration: result.totalDuration,
    uniqueUsers: result.uniqueUsers.length,
    averageDuration: Math.round(result.totalDuration / result.totalSessions)
  };
};

// ============================================================================
// VIRTUAL PROPERTIES
// ============================================================================

// Virtual for checking if session is active
sessionSchema.virtual('isActive').get(function() {
  return this.logoutTime === null;
});

// Virtual for calculating current duration for active sessions (in minutes)
sessionSchema.virtual('currentDuration').get(function() {
  if (this.logoutTime === null) {
    // For active sessions, calculate duration from loginTime to now
    const now = new Date();
    return Math.round((now - this.loginTime) / 60000);
  }
  // For completed sessions, return the stored duration
  return this.duration;
});

// Virtual for calculating current duration in human-readable format
sessionSchema.virtual('formattedCurrentDuration').get(function() {
  const minutes = this.currentDuration;
  if (minutes < 1) {
    return '< 1m';
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
});

// Ensure virtuals are included in JSON
sessionSchema.set('toJSON', { virtuals: true });
sessionSchema.set('toObject', { virtuals: true });

// Create and export the Session model
const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;
