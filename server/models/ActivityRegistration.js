const mongoose = require('mongoose');
const schoolScope = require('../plugins/schoolScope');

const activityRegistrationSchema = new mongoose.Schema(
  {
    activity_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Activity',
      required: [true, 'Activity ID is required'],
    },
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
    },
    registered_at: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['registered', 'cancelled'],
      default: 'registered',
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

// Apply tenant scoping plugin
activityRegistrationSchema.plugin(schoolScope);

// Unique compound index: prevent duplicate active registrations per student per activity per school
activityRegistrationSchema.index(
  { school_id: 1, activity_id: 1, student_id: 1 },
  { unique: true }
);

const ActivityRegistration = mongoose.model(
  'ActivityRegistration',
  activityRegistrationSchema
);

module.exports = ActivityRegistration;
