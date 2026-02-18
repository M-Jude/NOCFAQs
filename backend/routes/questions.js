const express = require('express');
const Question = require('../models/Question');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all questions (with search and filter)
router.get('/', auth, async (req, res) => {
  try {
    const { search, category, tag, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (category) {
      query.category = category;
    }
    
    if (tag) {
      query.tags = tag;
    }

    const questions = await Question.find(query)
      .populate('createdBy', 'fullName username')
      .populate('updatedBy', 'fullName username')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Question.countDocuments(query);

    res.json({
      questions,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single question by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('createdBy', 'fullName username')
      .populate('updatedBy', 'fullName username');
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Increment views
    question.views += 1;
    await question.save();

    res.json(question);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create question (Admin only)
router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { title, question, solution, category, tags } = req.body;

    const newQuestion = new Question({
      title,
      question,
      solution,
      category,
      tags: tags || [],
      createdBy: req.user._id,
      updatedBy: req.user._id
    });

    await newQuestion.save();

    res.status(201).json({
      message: 'Question created successfully',
      question: newQuestion
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update question (Admin only)
router.put('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { title, question, solution, category, tags } = req.body;

    const existingQuestion = await Question.findById(req.params.id);
    if (!existingQuestion) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (title) existingQuestion.title = title;
    if (question) existingQuestion.question = question;
    if (solution) existingQuestion.solution = solution;
    if (category) existingQuestion.category = category;
    if (tags) existingQuestion.tags = tags;
    existingQuestion.updatedBy = req.user._id;
    existingQuestion.updatedAt = new Date();

    await existingQuestion.save();

    res.json({
      message: 'Question updated successfully',
      question: existingQuestion
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete question (Admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all categories
router.get('/meta/categories', auth, async (req, res) => {
  try {
    const categories = [
      { value: 'network', label: 'Network' },
      { value: 'server', label: 'Server' },
      { value: 'security', label: 'Security' },
      { value: 'database', label: 'Database' },
      { value: 'application', label: 'Application' },
      { value: 'hardware', label: 'Hardware' },
      { value: 'software', label: 'Software' },
      { value: 'other', label: 'Other' }
    ];
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
