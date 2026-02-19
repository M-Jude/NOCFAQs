/**
 * Session Routes
 * 
 * Handles session tracking and reporting.
 * Provides login history and usage statistics for HR and Admin users.
 * 
 * @module routes/sessions
 * @prefix /api/sessions
 */

const express = require('express');
const Session = require('../models/Session');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// ============================================================================
// PROTECTED ROUTES
// ============================================================================

// All routes require authentication
router.use(auth);

/**
 * GET /api/sessions
 * 
 * Get all sessions with optional filtering.
 * Accessible by admin and HR roles only.
 * 
 * @query {string} [userId] - Filter by user ID
 * @query {string} [startDate] - Filter sessions after this date
 * @query {string} [endDate] - Filter sessions before this date
 * @query {number} [page=1] - Page number
 * @query {number} [limit=20] - Items per page
 * @returns {Object} Sessions array with pagination
 * @access Protected (admin, hr)
 */
router.get('/', authorize('admin', 'hr'), async (req, res) => {
  try {
    const { userId, startDate, endDate, page = 1, limit = 20 } = req.query;
    
    // Build query object
    let query = {};
    
    // Filter by user
    if (userId) {
      query.user = userId;
    }
    
    // Filter by date range
    if (startDate || endDate) {
      query.loginTime = {};
      if (startDate) {
        query.loginTime.$gte = new Date(startDate);
      }
      if (endDate) {
        query.loginTime.$lte = new Date(endDate);
      }
    }
    
    // Execute query with pagination
    const sessions = await Session.find(query)
      .populate('user', 'fullName username email role department')
      .sort({ loginTime: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));
    
    const total = await Session.countDocuments(query);
    
    res.json({
      success: true,
      sessions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sessions'
    });
  }
});

/**
 * GET /api/sessions/stats
 * 
 * Get session statistics and analytics.
 * Accessible by admin and HR roles only.
 * 
 * @query {string} [startDate] - Filter stats after this date
 * @query {string} [endDate] - Filter stats before this date
 * @returns {Object} Statistics including total sessions, users, average duration
 * @access Protected (admin, hr)
 */
router.get('/stats', authorize('admin', 'hr'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build date filter
    let dateFilter = {};
    if (startDate || endDate) {
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);
    }
    
    // Base match stage for aggregation
    const matchStage = Object.keys(dateFilter).length > 0 
      ? { loginTime: dateFilter } 
      : {};
    
    // Get total sessions count
    const totalSessions = await Session.countDocuments(
      Object.keys(dateFilter).length > 0 ? { loginTime: dateFilter } : {}
    );
    
    // Get unique users who logged in
    const uniqueUsers = await Session.distinct('user',
      Object.keys(dateFilter).length > 0 ? { loginTime: dateFilter } : {}
    );
    
    // Calculate average session duration
    const sessionsWithDuration = await Session.find({
      ...(Object.keys(dateFilter).length > 0 ? { loginTime: dateFilter } : {}),
      duration: { $gt: 0 }
    });
    
    const avgDuration = sessionsWithDuration.length > 0
      ? sessionsWithDuration.reduce((sum, s) => sum + s.duration, 0) / sessionsWithDuration.length
      : 0;
    
    // Get sessions per day (last 30 days)
    const sessionsPerDay = await Session.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$loginTime' }
          },
          count: { $sum: 1 },
          totalDuration: { $sum: '$duration' }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 30 }
    ]);
    
    // Get most active users
    const mostActiveUsers = await Session.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$user',
          sessionCount: { $sum: 1 },
          totalDuration: { $sum: '$duration' }
        }
      },
      { $sort: { sessionCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          fullName: '$user.fullName',
          username: '$user.username',
          department: '$user.department',
          sessionCount: 1,
          totalDuration: 1
        }
      }
    ]);
    
    res.json({
      success: true,
      stats: {
        totalSessions,
        totalUsers: uniqueUsers.length,
        averageDuration: Math.round(avgDuration),
        sessionsPerDay,
        mostActiveUsers
      }
    });
  } catch (error) {
    console.error('Get session stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching session statistics'
    });
  }
});

/**
 * GET /api/sessions/active
 * 
 * Get the current user's active session (if any).
 * 
 * @returns {Object|null} Active session or null
 * @access Protected
 */
router.get('/active', async (req, res) => {
  try {
    const session = await Session.findOne({
      user: req.user._id,
      logoutTime: null
    }).sort({ loginTime: -1 });
    
    res.json({
      success: true,
      session
    });
  } catch (error) {
    console.error('Get active session error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching active session'
    });
  }
});

// Export the router
module.exports = router;
