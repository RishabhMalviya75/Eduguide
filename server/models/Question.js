const mongoose = require('mongoose');
const schoolScope = require('../plugins/schoolScope');

const questionSchema = new mongoose.Schema({
  school_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: [true, 'School ID is required'],
  },
  text: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
  },
  format: {
    type: String,
    enum: ['MCQ', 'short_answer', 'essay'],
    default: 'MCQ',
  },
  options: {
    type: [String],
    default: [],
    // Required only for MCQ format — validated in pre-save hook below
  },
  correct_option_index: {
    type: Number,
    default: null,
    min: [0, 'Index cannot be negative'],
    // Required only for MCQ format — validated in pre-save hook below
  },
  // For short_answer format: the expected answer(s) for rule-based scoring
  expected_answers: {
    type: [String],
    default: [],
  },
  // For essay format: rubric or scoring guidance for AI scorer
  scoring_rubric: {
    type: String,
    default: null,
    trim: true,
  },
  category: {
    type: String,
    enum: ['Math', 'Logic', 'Verbal', 'General'],
    default: 'General',
  },
  difficulty: {
    type: Number,
    enum: [1, 2, 3], // 1: Easy, 2: Medium, 3: Hard
    default: 2,
  },
  is_active: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
});

// Validate format-specific required fields
questionSchema.pre('save', function(next) {
  if (this.format === 'MCQ') {
    if (!this.options || this.options.length < 2) {
      return next(new Error('MCQ questions must have at least 2 options.'));
    }
    if (this.correct_option_index == null) {
      return next(new Error('MCQ questions must have a correct_option_index.'));
    }
    if (this.correct_option_index >= this.options.length) {
      return next(new Error(`Correct option index (${this.correct_option_index}) is out of bounds for options array (length ${this.options.length})`));
    }
  }
  next();
});

// Apply tenant isolation plugin
questionSchema.plugin(schoolScope);

// Indexes for faster random sampling by category
questionSchema.index({ school_id: 1, is_active: 1, category: 1 });

module.exports = mongoose.model('Question', questionSchema);
