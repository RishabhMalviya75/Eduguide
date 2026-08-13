const mongoose = require('mongoose');
const schoolScope = require('../plugins/schoolScope');

const careerInterestResultSchema = new mongoose.Schema({
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
  mapped_from: {
    type: String,
    enum: ['pi_session', 'manual_override'],
    default: 'pi_session',
  },
  source_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PISession', // Can reference the PI session that generated this
    required: false,
  },
  suggestions: {
    type: [String],
    default: [],
  },
  generated_at: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true,
});

careerInterestResultSchema.plugin(schoolScope);

module.exports = mongoose.model('CareerInterestResult', careerInterestResultSchema);
