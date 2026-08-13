const mongoose = require('mongoose');
const schoolScope = require('../plugins/schoolScope');

const promptVersionSchema = new mongoose.Schema({
  school_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: [true, 'School ID is required'],
  },
  version_id: {
    type: String,
    required: [true, 'Version ID is required'],
    trim: true,
    // Semantic version string, e.g. '1.0.0', '1.1.0'
  },
  prompt_text: {
    type: String,
    required: [true, 'Prompt text is required'],
  },
  model_reference: {
    type: String,
    required: [true, 'Model reference is required'],
    trim: true,
    // e.g. 'gpt-4o-mini', 'gpt-4o', 'claude-3-haiku'
  },
  purpose: {
    type: String,
    enum: ['scoring', 'generation'],
    required: [true, 'Purpose is required'],
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  is_active: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

// Apply tenant isolation
promptVersionSchema.plugin(schoolScope);

// Only one active prompt version per purpose per school
promptVersionSchema.index({ school_id: 1, purpose: 1, is_active: 1 });

module.exports = mongoose.model('PromptVersion', promptVersionSchema);
