const express = require('express');
const Session = require('../models/Session');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all sessions (HR and Admin only)
router.get('/', auth, authorize('admin', 'hr'), async (req, res) => {
  try {
    const { userId, startDate, endDate, page = 1, limit = 20 } = req.query;
    
    let query = {};
    
    if (userId) {
      query.user = userId;
    }
    
    if (startDate || endDate) {
      query.loginTime = {};
      if (startDate) query.loginTime.$gte = new Date(startDate);
      if (endDate) query.loginTime.$lte = new Date(endDate);
    }

    const sessions = await Session.find(query)
      .populate('user', 'fullName username email role department')
      .sort({ loginTime: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Session.countDocuments(query);

    res.json({
      sessions,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get session statistics (HR and Admin only)
router.get('/stats', auth, authorize('admin', 'hr'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate || endDate) {
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);
    }

    // Total sessions
    const totalSessions = await Session.countDocuments(
      Object.keys(dateFilter).length ? { loginTime: dateFilter } : {}
    );

    // Total users who logged in
    const uniqueUsers = await Session.distinct('user',
      Object.keys(dateFilter).length ? { loginTime: dateFilter } : {}
    );

    // Average session duration
    const sessionsWithDuration = await Session.find({
      ...(Object.keys(dateFilter).length ? { loginTime: dateFilter } : {}),
      duration: { $gt: 0 }
    });
    
    const avgDuration = sessionsWithDuration.length > 0
      ? sessionsWithDuration.reduce((sum, s) => sum + s.duration, 0) / sessionsWithDuration.length
      : 0;

    // Sessions per day
    const sessionsPerDay = await Session.aggregate([
      { $match: Object.keys(dateFilter).length ? { loginTime: dateFilter } : {} },
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

    // Most active users
    const mostActiveUsers = await Session.aggregate([
      { $match: Object.keys(dateFilter).length ? { loginTime: dateFilter } : {} },
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
      { $unwind: '$user' },
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
      totalSessions,
      totalUsers: uniqueUsers.length,
      averageDuration: Math.round(avgDuration),
      sessionsPerDay,
      mostActiveUsers
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get current active session
router.get('/active', auth, async (req, res) => {
  try {
    const session = await Session.findOne({
      user: req.user._id,
      logoutTime: null
    }).sort({ loginTime: -1 });

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
