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
  },
  // Proctoring integrity signals — populated by client-side capture + server-side rules
  integrity_flags: {
    ip_log: {
      type: [String],
      default: [],
    },
    focus_loss_count: {
      type: Number,
      default: 0,
    },
    typing_pattern_signal: {
      type: Number,
      default: null,
      // 0.0–1.0 anomaly score; null means not yet analyzed
    },
    auto_flagged: {
      type: Boolean,
      default: false,
    },
    flag_reasons: {
      type: [String],
      default: [],
      // e.g. ['excessive_focus_loss', 'ip_mismatch']
    },
  },
}, {
  timestamps: true,
});

// Apply tenant isolation plugin
testSessionSchema.plugin(schoolScope);

testSessionSchema.index({ student_id: 1, status: 1 });

module.exports = mongoose.model('TestSession', testSessionSchema);
