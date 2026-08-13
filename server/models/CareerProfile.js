const mongoose = require('mongoose');
const schoolScope = require('../plugins/schoolScope');

const careerProfileSchema = new mongoose.Schema({
  school_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: [true, 'School ID is required'],
  },
  title: {
    type: String,
    required: [true, 'Career title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  // The weight requirements for this career.
  // Keys will be 'Math', 'Science', 'Logic', 'Verbal', etc.
  // Values are weight multipliers (0.0 to 1.0)
  requirements: {
    type: Map,
    of: Number,
    required: true,
  },
  is_active: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
});

// Apply tenant isolation plugin
careerProfileSchema.plugin(schoolScope);

careerProfileSchema.index({ school_id: 1, is_active: 1 });

module.exports = mongoose.model('CareerProfile', careerProfileSchema);
