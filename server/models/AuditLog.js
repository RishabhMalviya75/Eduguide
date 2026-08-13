const mongoose = require('mongoose');
const schoolScope = require('../plugins/schoolScope');

/**
 * AuditLog — Immutable, append-only log for compliance-critical events.
 *
 * No update or delete operations should ever be exposed on this collection.
 * Every write is an insert. This is the single source of truth for
 * "who did what, when, and with what context."
 */
const auditLogSchema = new mongoose.Schema({
  school_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: [true, 'School ID is required'],
  },
  entity: {
    type: String,
    required: [true, 'Entity name is required'],
    trim: true,
    // e.g. 'Score', 'TestSession', 'ConsentRecord', 'PISession'
  },
  entity_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Entity ID is required'],
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    trim: true,
    // e.g. 'ai_scored', 'human_override', 'consent_granted',
    //      'report_generated', 'flag_raised', 'flag_resolved'
  },
  actor_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Actor ID is required'],
    // Can be a User _id or a Student _id
  },
  actor_role: {
    type: String,
    required: [true, 'Actor role is required'],
    enum: ['Admin', 'Teacher', 'Counselor', 'Student', 'System'],
  },
  meta: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
    // Flexible payload for action-specific data.
    // e.g. { old_score: 7, new_score: 8, reason: 'Partial credit for step 3' }
  },
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: false, // No updates — this is append-only
  },
});

// Apply tenant isolation
auditLogSchema.plugin(schoolScope);

// Indexes for common query patterns
auditLogSchema.index({ school_id: 1, entity: 1, entity_id: 1 });
auditLogSchema.index({ school_id: 1, actor_id: 1, created_at: -1 });
auditLogSchema.index({ school_id: 1, action: 1, created_at: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
