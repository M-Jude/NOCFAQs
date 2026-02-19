/**
 * Question Model
 * 
 * Defines the schema for FAQ/Question entries in the NOC FAQs system.
 * Each question has a problem description and solution, categorized by type.
 * 
 * @schema Question
 * @property {string} title - Brief title of the question
 * @property {string} question - Detailed problem description
 * @property {string} solution - Step-by-step solution
 * @property {string} category - Category (network, server, security, etc.)
 * @property {string[]} tags - Array of searchable tags
 * @property {number} views - View count for popularity tracking
 * @property {ObjectId} createdBy - Reference to User who created it
 * @property {ObjectId} updatedBy - Reference to User who last updated it
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */

// Import required modules
const mongoose = require('mongoose');

// Define the valid categories for questions
const CATEGORIES = [
  'network',
  'server',
  'security',
  'database',
  'application',
  'hardware',
  'software',
  'other'
];

// Define the question schema structure
const questionSchema = new mongoose.Schema({
  // Title - brief summary of the question/problem
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  
  // Question/Problem - detailed description of the issue
  question: {
    type: String,
    required: [true, 'Question description is required']
  },
  
  // Solution - step-by-step solution to the problem
  solution: {
    type: String,
    required: [true, 'Solution is required']
  },
  
  // Category - helps with filtering and organization
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: CATEGORIES,
      message: 'Invalid category selected'
    }
  },
  
  // Tags - for additional searchability
  tags: [{
    type: String,
    trim: true
  }],
  
  // View count - tracks how many times this question has been viewed
  views: {
    type: Number,
    default: 0
  },
  
  // Reference to the user who created this question
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Reference to the user who last updated this question
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Update the updatedAt timestamp before saving
questionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// ============================================================================
// INDEXES
// ============================================================================

// Text index for full-text search across title, question, solution, and tags
questionSchema.index(
  { title: 'text', question: 'text', solution: 'text', tags: 'text' },
  { weights: { title: 10, tags: 5, question: 3, solution: 1 } }
);

// Additional indexes for filtering
questionSchema.index({ category: 1 });
questionSchema.index({ tags: 1 });
questionSchema.index({ createdBy: 1 });
questionSchema.index({ createdAt: -1 });
questionSchema.index({ views: -1 });

// ============================================================================
// VIRTUAL PROPERTIES
// ============================================================================

/**
 * Get a summary of the question for list views
 */
questionSchema.virtual('summary').get(function() {
  return {
    id: this._id,
    title: this.title,
    category: this.category,
    tags: this.tags,
    views: this.views,
    createdAt: this.createdAt
  };
});

// ============================================================================
// INSTANCE METHODS
// ============================================================================

/**
 * Increment view count
 * Should be called when question is viewed
 */
questionSchema.methods.incrementViews = async function() {
  this.views += 1;
  return this.save();
};

/**
 * Check if user can update this question
 * @param {ObjectId} userId - ID of the user to check
 * @returns {boolean}
 */
questionSchema.methods.canEdit = function(userId) {
  // Only admins can edit questions, or the original creator
  return this.createdBy.toString() === userId.toString() || userId.role === 'admin';
};

// ============================================================================
// STATIC METHODS
// ============================================================================

/**
 * Get questions by category
 * @param {string} category - Category to filter by
 * @returns {Promise<Question[]>}
 */
questionSchema.statics.findByCategory = function(category) {
  return this.find({ category }).sort({ createdAt: -1 });
};

/**
 * Get popular questions
 * @param {number} limit - Number of questions to return
 * @returns {Promise<Question[]>}
 */
questionSchema.statics.getPopular = function(limit = 10) {
  return this.find().sort({ views: -1 }).limit(limit);
};

/**
 * Get all available categories
 * @returns {string[]}
 */
questionSchema.statics.getCategories = function() {
  return CATEGORIES;
};

// Ensure virtuals are included in JSON
questionSchema.set('toJSON', { virtuals: true });
questionSchema.set('toObject', { virtuals: true });

// Create and export the Question model
const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
