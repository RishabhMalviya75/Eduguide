const mongoose = require('mongoose');
const schoolScope = require('../plugins/schoolScope');

const markSchema = new mongoose.Schema({
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
  teacher_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher ID is required'],
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
  },
  marks_obtained: {
    type: Number,
    required: [true, 'Marks obtained is required'],
    min: [0, 'Marks cannot be negative'],
  },
  max_marks: {
    type: Number,
    required: [true, 'Maximum marks is required'],
    min: [1, 'Maximum marks must be at least 1'],
  },
  exam_name: {
    type: String,
    required: [true, 'Exam name is required'],
    trim: true,
  },
}, {
  timestamps: true,
});

// Ensure marks_obtained does not exceed max_marks at the DB level
markSchema.pre('save', function(next) {
  if (this.marks_obtained > this.max_marks) {
    next(new Error(`Marks obtained (${this.marks_obtained}) cannot exceed maximum marks (${this.max_marks})`));
  } else {
    next();
  }
});

// Apply tenant isolation plugin
markSchema.plugin(schoolScope);

// Compound index to prevent duplicate marks for the same student/subject/exam combination
markSchema.index({ student_id: 1, subject: 1, exam_name: 1 }, { unique: true });

module.exports = mongoose.model('Mark', markSchema);
