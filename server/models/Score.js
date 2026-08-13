const mongoose = require('mongoose');
const schoolScope = require('../plugins/schoolScope');

/**
 * Score — Decoupled scoring record.
 *
 * This collection is the source of truth for AI-scored and human-reviewed scores.
 * The existing TestSession.score/max_score fields remain for backward compatibility
 * with the original rule-based scorer. In shadow mode, both stores are written to;
 * once AI scoring goes live, this becomes the primary source.
 */
const questionScoreSchema = new mongoose.Schema({
  question_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
  },
  awarded: {
    type: Number,
    required: true,
    min: 0,
  },
  max: {
    type: Number,
    required: true,
    min: 0,
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: null,
    // null for rule-based scoring, 0.0–1.0 for AI scoring
  },
}, { _id: false });

const scoreSchema = new mongoose.Schema({
  school_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: [true, 'School ID is required'],
  },
  session_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TestSession',
    required: [true, 'Session ID is required'],
  },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student ID is required'],
  },
  question_scores: {
    type: [questionScoreSchema],
    default: [],
  },
  total_score: {
    type: Number,
    required: true,
    min: 0,
  },
  max_score: {
    type: Number,
    required: true,
    min: 0,
  },
  overall_confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: null,
    // Average confidence across all question_scores. null for rule-based.
  },
  scorer_type: {
    type: String,
    enum: ['rule_based', 'ai', 'human_override'],
    required: [true, 'Scorer type is required'],
  },
  prompt_version_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PromptVersion',
    default: null,
    // null for rule_based scoring
  },
  model_metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
    // e.g. { model: 'gpt-4o-mini', latency_ms: 1200, prompt_tokens: 450, completion_tokens: 120 }
  },
  flagged_for_review: {
    type: Boolean,
    default: false,
  },
  reviewed_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  reviewed_at: {
    type: Date,
    default: null,
  },
  review_notes: {
    type: String,
    default: null,
    trim: true,
  },
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

// Apply tenant isolation
scoreSchema.plugin(schoolScope);

// Indexes
scoreSchema.index({ school_id: 1, session_id: 1 });
scoreSchema.index({ school_id: 1, student_id: 1, created_at: -1 });
scoreSchema.index({ school_id: 1, flagged_for_review: 1, reviewed_at: 1 });

module.exports = mongoose.model('Score', scoreSchema);
