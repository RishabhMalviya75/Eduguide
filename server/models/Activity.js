const mongoose = require('mongoose');
const schoolScope = require('../plugins/schoolScope');

const activityCategories = [
  'Cultural & Performing Arts',
  'Sports & Physical Activity',
  'Academic & Intellectual',
  'Leadership, Service & Life Skills',
  'Seasonal / Skill-Building',
];

const activitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Activity title is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: activityCategories,
        message: 'Invalid activity category',
      },
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Activity date is required'],
    },
    time: {
      type: String,
      required: [true, 'Activity time is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    eligibility: {
      grades: [
        {
          type: Number,
          min: 1,
          max: 12,
        },
      ],
      text: {
        type: String,
        default: 'All Students',
      },
    },
    maxParticipants: {
      type: Number,
      default: null,
      min: [1, 'Maximum participants must be at least 1'],
    },
    registrationDeadline: {
      type: Date,
      required: [true, 'Registration deadline is required'],
    },
    registrationDetails: {
      type: String,
      trim: true,
      default: '',
    },
    organizer: {
      user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      name: {
        type: String,
        required: true,
        trim: true,
      },
      role: {
        type: String,
        enum: ['Teacher', 'Admin'],
        default: 'Teacher',
      },
      email: {
        type: String,
        trim: true,
      },
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled', 'pending'],
      default: 'active',
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
activitySchema.plugin(schoolScope);

// Index for activity listing and filtering
activitySchema.index({ school_id: 1, category: 1, status: 1, date: 1 });

const Activity = mongoose.model('Activity', activitySchema);

module.exports = { Activity, activityCategories };
