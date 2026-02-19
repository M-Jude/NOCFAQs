/**
 * User Management Routes
 * 
 * Handles CRUD operations for user accounts.
 * Most routes require admin privileges.
 * 
 * @module routes/users
 * @prefix /api/users
 */

const express = require('express');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// ============================================================================
// PROTECTED ROUTES
// ============================================================================

// All routes require authentication
router.use(auth);

/**
 * GET /api/users
 * 
 * Get all users in the system.
 * Accessible by admin and HR roles only.
 * 
 * @query {number} [page=1] - Page number for pagination
 * @query {number} [limit=50] - Items per page
 * @returns {Array} List of users
 * @access Protected (admin, hr)
 */
router.get('/', authorize('admin', 'hr'), async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await User.countDocuments();
    
    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
});

/**
 * GET /api/users/:id
 * 
 * Get a specific user by ID.
 * Users can view their own profile, admins can view any.
 * 
 * @param {string} :id - User ID
 * @returns {Object} User data
 * @access Protected
 */
router.get('/:id', async (req, res) => {
  try {
    // Users can only view their own profile unless they're admin
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error fetching user'
    });
  }
});

/**
 * PUT /api/users/:id
 * 
 * Update a user's information.
 * Only accessible by admin users.
 * 
 * @param {string} :id - User ID to update
 * @body {string} [username] - New username
 * @body {string} [email] - New email
 * @body {string} [role] - New role
 * @body {string} [fullName] - New full name
 * @body {string} [department] - New department
 * @returns {Object} Updated user data
 * @access Protected (admin only)
 */
router.put('/:id', authorize('admin'), async (req, res) => {
  try {
    const { username, email, role, fullName, department } = req.body;
    
    // Find the user
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check for duplicate email/username if changing
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
      user.email = email;
    }
    
    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({
          success: false,
          message: 'Username already taken'
        });
      }
      user.username = username;
    }
    
    // Update other fields if provided
    if (role) user.role = role;
    if (fullName) user.fullName = fullName;
    if (department !== undefined) user.department = department;
    
    await user.save();
    
    res.json({
      success: true,
      message: 'User updated successfully',
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
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user'
    });
  }
});

/**
 * DELETE /api/users/:id
 * 
 * Delete a user account.
 * Only accessible by admin users.
 * 
 * @param {string} :id - User ID to delete
 * @returns {Object} Success message
 * @access Protected (admin only)
 */
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }
    
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error deleting user'
    });
  }
});

// Export the router
module.exports = router;
