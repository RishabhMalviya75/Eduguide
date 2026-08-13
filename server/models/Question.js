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
  options: {
    type: [String],
    required: [true, 'Options are required'],
    validate: {
      validator: function(v) {
        return v.length >= 2;
      },
      message: 'A question must have at least 2 options.'
    }
  },
  correct_option_index: {
    type: Number,
    required: [true, 'Correct option index is required'],
    min: [0, 'Index cannot be negative'],
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

// Ensure correct_option_index is within bounds of options array
questionSchema.pre('save', function(next) {
  if (this.correct_option_index >= this.options.length) {
    next(new Error(`Correct option index (${this.correct_option_index}) is out of bounds for options array (length ${this.options.length})`));
  } else {
    next();
  }
});

// Apply tenant isolation plugin
questionSchema.plugin(schoolScope);

// Indexes for faster random sampling by category
questionSchema.index({ school_id: 1, is_active: 1, category: 1 });

module.exports = mongoose.model('Question', questionSchema);
