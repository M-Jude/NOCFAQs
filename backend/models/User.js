/**
 * User Model
 * 
 * Defines the schema for user accounts in the NOC FAQs system.
 * Supports three roles: admin, hr, and noc_engineer.
 * 
 * @schema User
 * @property {string} username - Unique username for login
 * @property {string} email - Unique email address
 * @property {string} password - Hashed password
 * @property {string} role - User role (admin, hr, noc_engineer)
 * @property {string} fullName - Full name of the user
 * @property {string} department - Department the user belongs to
 * @property {Date} createdAt - Account creation timestamp
 */

// Import required modules
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the user schema structure
const userSchema = new mongoose.Schema({
  // Username - required and must be unique
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  
  // Email address - required and must be unique
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  
  // Password - required, will be hashed before saving
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Exclude password from query results by default
  },
  
  // User role - determines permissions and access level
  role: {
    type: String,
    enum: ['admin', 'hr', 'noc_engineer'],
    default: 'noc_engineer'
  },
  
  // Full name of the user
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  
  // Department (optional)
  department: {
    type: String,
    default: '',
    trim: true
  },
  
  // Timestamp for account creation
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// ============================================================================
// PRE-SAVE MIDDLEWARE
// ============================================================================

// Hash password before saving to database
// This runs automatically when a new user is created or password is modified
userSchema.pre('save', async function(next) {
  // Skip hashing if password hasn't been modified
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    // Generate salt and hash password with bcrypt
    // Using cost factor of 10 for good security/performance balance
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// INSTANCE METHODS
// ============================================================================

/**
 * Compare provided password against stored hash
 * 
 * @param {string} candidatePassword - The plain text password to compare
 * @returns {Promise<boolean>} - True if passwords match, false otherwise
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Get public profile (without sensitive data)
 * 
 * @returns {Object} - User object without password
 */
userSchema.methods.getPublicProfile = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

// ============================================================================
// STATIC METHODS
// ============================================================================

/**
 * Find user by email (case-insensitive)
 * 
 * @param {string} email - Email to search for
 * @returns {Promise<User|null>}
 */
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: new RegExp(`^${email}$`, 'i') });
};

// ============================================================================
// INDEXES
// ============================================================================

// Create indexes for frequently queried fields
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

// Create and export the User model
const User = mongoose.model('User', userSchema);

module.exports = User;
