/**
 * Authentication Routes
 * 
 * Handles user authentication operations including login, logout, registration,
 * and retrieving current user information.
 * 
 * @module routes/auth
 * @prefix /api/auth
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Session = require('../models/Session');
const { auth, generateToken } = require('../middleware/auth');

const router = express.Router();

// ============================================================================
// PUBLIC ROUTES
// ============================================================================

/**
 * POST /api/auth/login
 * 
 * Authenticate user with email and password.
 * Creates a new session record on successful login.
 * 
 * @body {string} email - User's email address
 * @body {string} password - User's password
 * @returns {Object} Token, user info, and session ID
 * @access Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Verify password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Get client information for session tracking
    const ipAddress = req.ip || req.connection?.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    
    // Create new session record
    const session = new Session({
      user: user._id,
      loginTime: new Date(),
      ipAddress,
      userAgent
    });
    await session.save();
    
    // Generate JWT token
    const token = generateToken(user._id, user.role);
    
    // Return success response with user data (excluding password)
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        department: user.department
      },
      sessionId: session._id
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// ============================================================================
// PROTECTED ROUTES
// ============================================================================

/**
 * POST /api/auth/logout
 * 
 * End the current user session.
 * Updates the session record with logout time and duration.
 * 
 * @body {string} sessionId - The session ID to end
 * @returns {Object} Success message
 * @access Protected (requires authentication)
 */
router.post('/logout', auth, async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (sessionId) {
      const session = await Session.findById(sessionId);
      
      if (session && !session.logoutTime) {
        session.logoutTime = new Date();
        session.duration = Math.round((session.logoutTime - session.loginTime) / 60000);
        await session.save();
      }
    }
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
});

/**
 * POST /api/auth/register
 * 
 * Register a new user. Only accessible to authenticated admin users.
 * 
 * @body {string} username - Desired username
 * @body {string} email - Email address
 * @body {string} password - Password
 * @body {string} fullName - Full name
 * @body {string} [role='noc_engineer'] - User role
 * @body {string} [department] - Department
 * @returns {Object} Created user info
 * @access Protected (admin only)
 */
router.post('/register', auth, async (req, res) => {
  try {
    const { username, email, password, role, fullName, department } = req.body;
    
    // Validate required fields
    if (!username || !email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, password, and full name are required'
      });
    }
    
    // Check for existing user (email or username)
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() }
      ]
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email.toLowerCase()
          ? 'Email already registered'
          : 'Username already taken'
      });
    }
    
    // Validate role if provided
    const validRoles = ['admin', 'hr', 'noc_engineer'];
    const userRole = role && validRoles.includes(role) ? role : 'noc_engineer';
    
    // Create new user
    const user = new User({
      username,
      email,
      password,
      role: userRole,
      fullName,
      department: department || ''
    });
    
    await user.save();
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        department: user.department
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

/**
 * GET /api/auth/me
 * 
 * Get current authenticated user's information.
 * 
 * @returns {Object} Current user data
 * @access Protected (requires authentication)
 */
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Export the router
module.exports = router;
