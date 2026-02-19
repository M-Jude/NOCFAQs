/**
 * Authentication Middleware
 * 
 * Provides JWT-based authentication and role-based authorization for the NOC FAQs system.
 * 
 * @module middleware/auth
 * @requires jsonwebtoken
 * @requires ../models/User
 */

// Import required modules
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Get JWT secret from environment variables
// Falls back to a default only for development - should be set in production
const JWT_SECRET = process.env.JWT_SECRET || 'nocfaqs_secret_key_2024';

// JWT expiration time
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Authentication Middleware
 * 
 * Verifies the JWT token from the Authorization header and attaches
 * the user object to the request. This protects routes requiring login.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 * 
 * @example
 * // Apply to all protected routes
 * router.get('/protected', auth, handler);
 */
const auth = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    // Expected format: "Bearer <token>"
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided'
      });
    }
    
    // Remove 'Bearer ' prefix if present
    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token is invalid'
      });
    }
    
    // Verify the JWT token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Find the user by ID (excluding password from result)
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Account may have been deleted.'
      });
    }
    
    // Attach user and token to request for use in subsequent middleware/routes
    req.user = user;
    req.token = token;
    req.userId = decoded.userId;
    
    // Continue to the next middleware
    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Authentication token has expired. Please login again.'
      });
    }
    
    // Generic error response
    res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

/**
 * Role-Based Authorization Middleware
 * 
 * Creates middleware that restricts access to users with specific roles.
 * Should be used after the auth middleware.
 * 
 * @param {...string} roles - Allowed role names
 * @returns {Function} Express middleware function
 * 
 * @example
 * // Allow only admins
 * router.delete('/:id', auth, authorize('admin'), handler);
 * 
 * @example
 * // Allow admins and HR
 * router.get('/reports', auth, authorize('admin', 'hr'), handler);
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Check if user's role is in the allowed roles list
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
        requiredRoles: roles,
        currentRole: req.user.role
      });
    }
    
    // User has required role, continue to next middleware
    next();
  };
};

/**
 * Generate JWT Token
 * 
 * Utility function to create a new JWT token for a user.
 * 
 * @param {ObjectId} userId - The user's ID
 * @param {string} role - The user's role
 * @returns {string} JWT token
 * 
 * @example
 * const token = generateToken(user._id, user.role);
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * Optional Authentication Middleware
 * 
 * Similar to auth but doesn't require authentication.
 * Attaches user if valid token provided, otherwise continues without user.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return next();
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return next();
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (user) {
      req.user = user;
      req.token = token;
    }
    
    next();
  } catch (error) {
    // Silently continue without authentication
    next();
  }
};

// Export middleware functions
module.exports = {
  auth,
  authorize,
  generateToken,
  optionalAuth,
  JWT_SECRET,
  JWT_EXPIRES_IN
};
