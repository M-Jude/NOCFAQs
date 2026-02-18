const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  question: {
    type: String,
    required: true
  },
  solution: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'network',
      'server',
      'security',
      'database',
      'application',
      'hardware',
      'software',
      'other'
    ]
  },
  tags: [{
    type: String,
    trim: true
  }],
  views: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

questionSchema.index({ title: 'text', question: 'text', solution: 'text', tags: 'text' });

module.exports = mongoose.model('Question', questionSchema);
