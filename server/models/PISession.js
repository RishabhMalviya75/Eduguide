const mongoose = require('mongoose');
const schoolScope = require('../plugins/schoolScope');

const piSessionSchema = new mongoose.Schema({
  school_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: [true, 'School ID is required'],
  },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student ID is required'],
  },
  counselor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Counselor ID is required'],
  },
  date: {
    type: Date,
    default: Date.now,
  },
  rubric_ratings: {
    communication: { type: Number, min: 1, max: 5, required: true },
    problem_solving: { type: Number, min: 1, max: 5, required: true },
    creativity: { type: Number, min: 1, max: 5, required: true },
    leadership: { type: Number, min: 1, max: 5, required: true },
  },
  summary_tags: {
    type: [String],
    default: [],
  },
  counselor_notes: {
    type: String,
    trim: true,
  }
}, {
  timestamps: true,
});

piSessionSchema.plugin(schoolScope);

module.exports = mongoose.model('PISession', piSessionSchema);
