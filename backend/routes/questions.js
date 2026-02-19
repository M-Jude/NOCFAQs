/**
 * Question/FAQ Routes
 * 
 * Handles CRUD operations for FAQ questions and solutions.
 * Includes full-text search and category filtering.
 * 
 * @module routes/questions
 * @prefix /api/questions
 */

const express = require('express');
const Question = require('../models/Question');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Valid categories
const VALID_CATEGORIES = [
  'network',
  'server',
  'security',
  'database',
  'application',
  'hardware',
  'software',
  'other'
];

// ============================================================================
// PROTECTED ROUTES
// ============================================================================

// All routes require authentication
router.use(auth);

/**
 * GET /api/questions
 * 
 * Get all questions with optional search and filtering.
 * Supports full-text search, category filter, tag filter, and pagination.
 * 
 * @query {string} [search] - Full-text search query
 * @query {string} [category] - Filter by category
 * @query {string} [tag] - Filter by tag
 * @query {number} [page=1] - Page number
 * @query {number} [limit=10] - Items per page
 * @query {string} [sort='createdAt'] - Sort field
 * @query {string} [order='desc'] - Sort order (asc/desc)
 * @returns {Object} Questions array with pagination info
 * @access Protected
 */
router.get('/', async (req, res) => {
  try {
    const {
      search,
      category,
      tag,
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;
    
    // Build query object
    let query = {};
    
    // Full-text search
    if (search) {
      query.$text = { $search: search };
    }
    
    // Category filter
    if (category) {
      if (!VALID_CATEGORIES.includes(category)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category'
        });
      }
      query.category = category;
    }
    
    // Tag filter
    if (tag) {
      query.tags = tag;
    }
    
    // Build sort object
    const sortOptions = {};
    sortOptions[sort] = order === 'asc' ? 1 : -1;
    
    // Execute query with pagination
    const questions = await Question.find(query)
      .populate('createdBy', 'fullName username')
      .populate('updatedBy', 'fullName username')
      .sort(sortOptions)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));
    
    const total = await Question.countDocuments(query);
    
    res.json({
      success: true,
      questions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching questions'
    });
  }
});

/**
 * GET /api/questions/:id
 * 
 * Get a single question by ID.
 * Increments view count on access.
 * 
 * @param {string} :id - Question ID
 * @returns {Object} Question data
 * @access Protected
 */
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('createdBy', 'fullName username')
      .populate('updatedBy', 'fullName username');
    
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }
    
    // Increment view count
    question.views += 1;
    await question.save();
    
    res.json({
      success: true,
      question
    });
  } catch (error) {
    console.error('Get question error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error fetching question'
    });
  }
});

/**
 * POST /api/questions
 * 
 * Create a new question/FAQ.
 * Accessible by admin only.
 * 
 * @body {string} title - Question title
 * @body {string} question - Problem description
 * @body {string} solution - Solution steps
 * @body {string} category - Category
 * @body {string[]} [tags=[]] - Tags array
 * @returns {Object} Created question
 * @access Protected (admin only)
 */
router.post('/', authorize('admin'), async (req, res) => {
  try {
    const { title, question, solution, category, tags } = req.body;
    
    // Validate required fields
    if (!title || !question || !solution || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, question, solution, and category are required'
      });
    }
    
    // Validate category
    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
    }
    
    // Create new question
    const newQuestion = new Question({
      title,
      question,
      solution,
      category,
      tags: Array.isArray(tags) ? tags : [],
      createdBy: req.user._id,
      updatedBy: req.user._id
    });
    
    await newQuestion.save();
    
    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      question: newQuestion
    });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating question'
    });
  }
});

/**
 * PUT /api/questions/:id
 * 
 * Update an existing question.
 * Accessible by admin only.
 * 
 * @param {string} :id - Question ID
 * @body {string} [title] - New title
 * @body {string} [question] - New problem description
 * @body {string} [solution] - New solution
 * @body {string} [category] - New category
 * @body {string[]} [tags] - New tags
 * @returns {Object} Updated question
 * @access Protected (admin only)
 */
router.put('/:id', authorize('admin'), async (req, res) => {
  try {
    const { title, question, solution, category, tags } = req.body;
    
    const existingQuestion = await Question.findById(req.params.id);
    
    if (!existingQuestion) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }
    
    // Validate category if provided
    if (category && !VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
    }
    
    // Update fields if provided
    if (title) existingQuestion.title = title;
    if (question) existingQuestion.question = question;
    if (solution) existingQuestion.solution = solution;
    if (category) existingQuestion.category = category;
    if (tags) existingQuestion.tags = tags;
    
    // Update the updater reference
    existingQuestion.updatedBy = req.user._id;
    existingQuestion.updatedAt = new Date();
    
    await existingQuestion.save();
    
    res.json({
      success: true,
      message: 'Question updated successfully',
      question: existingQuestion
    });
  } catch (error) {
    console.error('Update question error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating question'
    });
  }
});

/**
 * DELETE /api/questions/:id
 * 
 * Delete a question.
 * Accessible by admin only.
 * 
 * @param {string} :id - Question ID
 * @returns {Object} Success message
 * @access Protected (admin only)
 */
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    console.error('Delete question error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error deleting question'
    });
  }
});

/**
 * GET /api/questions/meta/categories
 * 
 * Get all available categories.
 * 
 * @returns {Array} List of categories
 * @access Protected
 */
router.get('/meta/categories', (req, res) => {
  const categories = VALID_CATEGORIES.map(cat => ({
    value: cat,
    label: cat.charAt(0).toUpperCase() + cat.slice(1)
  }));
  
  res.json({
    success: true,
    categories
  });
});

// Export the router
module.exports = router;
