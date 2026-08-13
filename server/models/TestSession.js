const mongoose = require('mongoose');
const schoolScope = require('../plugins/schoolScope');

const testSessionSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student ID is required'],
  },
  school_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: [true, 'School ID is required'],
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'abandoned'],
    default: 'in_progress',
  },
  started_at: {
    type: Date,
    default: Date.now,
  },
  completed_at: {
    type: Date,
  },
  // Array of questions in this specific test pool
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  // Map of question_id (string) to the selected option index (number)
  responses: {
    type: Map,
    of: Number,
    default: {}
  },
  score: {
    type: Number,
    default: null,
  },
  max_score: {
    type: Number,
    default: null,
  }
}, {
  timestamps: true,
});

// Apply tenant isolation plugin
testSessionSchema.plugin(schoolScope);

testSessionSchema.index({ student_id: 1, status: 1 });

module.exports = mongoose.model('TestSession', testSessionSchema);
